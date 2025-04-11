from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import threading
import time
import queue
import cv2
import numpy as np
import base64
import sys
import os
import subprocess
from recognizer_stream import recognizer

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global variables to manage the recognizer process
is_recognizing = False
result_queue = queue.Queue()

# Variable to track the standalone recognizer process
standalone_process = None

# Global variable for camera capture to avoid repeatedly opening/closing it
camera = None

def get_camera():
    """Get or initialize the camera"""
    global camera
    if camera is None:
        print("Initializing camera...")
        camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)  # Use DirectShow on Windows for better performance

        # Set lower resolution for better performance
        camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

        # Set other properties for better performance
        camera.set(cv2.CAP_PROP_FPS, 30)  # Higher FPS for smoother video
        camera.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # Minimize buffering
        camera.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*'MJPG'))  # Use MJPG format for better performance

        # Check if camera opened successfully
        if not camera.isOpened():
            print("Error: Could not open camera.")
            camera = None
        else:
            print("Camera initialized successfully.")

            # Warm up the camera by reading a few frames
            for _ in range(5):
                camera.read()

    return camera

def release_camera():
    """Release the camera when not needed"""
    global camera
    if camera is not None:
        print("Releasing camera resources...")
        camera.release()
        camera = None
        print("Camera released.")

def generate_frames():
    """Generate frames from the recognizer"""
    global camera
    last_frame_time = time.time()
    frame_interval = 1.0 / 60  # Target 60 FPS for smoother performance
    frame_count = 0
    last_frame = None  # Cache the last frame to reduce CPU usage
    hand_detected = False  # Track hand detection status

    try:
        while True:
            try:
                # Limit frame rate
                current_time = time.time()
                elapsed = current_time - last_frame_time
                if elapsed < frame_interval:
                    time.sleep(max(0, frame_interval - elapsed - 0.001))  # Subtract a small buffer for processing time
                last_frame_time = time.time()
                frame_count += 1

                # Get frame
                frame = None

                # If recognizer is running, get frame from it
                if is_recognizing and recognizer:
                    frame = recognizer.get_latest_frame()
                    # Also check if hand is detected
                    hand_detected = recognizer.is_hand_detected()

                # If we don't have a frame yet, try to get one directly from the camera
                if frame is None:
                    cam = get_camera()
                    if cam and cam.isOpened():
                        ret, frame = cam.read()
                        if ret:
                            # DO NOT flip the frame - we want correct hand orientation
                            # Cache this frame
                            last_frame = frame.copy()

                            # Add a message that recognition is not active
                            if not is_recognizing:
                                cv2.putText(frame, "Camera Active", (20, 40),
                                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

                if frame is not None:
                    # Process the frame for better performance
                    # Resize if needed to reduce processing load
                    if frame.shape[0] > 480 or frame.shape[1] > 640:
                        frame = cv2.resize(frame, (640, 480))

                    # Add a thin border to make the frame more visible
                    cv2.rectangle(frame, (0, 0), (frame.shape[1]-1, frame.shape[0]-1), (0, 255, 0), 1)

                    # Add status text if recognizing
                    if is_recognizing:
                        status_text = "Recognition Active"
                        status_color = (0, 255, 0)  # Green

                        # Add hand detection status
                        hand_status = "Hand Detected" if hand_detected else "No Hand"
                        hand_color = (0, 255, 0) if hand_detected else (0, 0, 255)  # Green if detected, red if not

                        cv2.putText(frame, status_text, (frame.shape[1] - 200, 30),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, status_color, 2)
                        cv2.putText(frame, hand_status, (20, 30),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, hand_color, 2)

                    # Get quality parameter from request if available
                    quality = 90  # Higher quality for better visibility

                    # Apply subtle sharpening for better hand detail
                    kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
                    frame = cv2.filter2D(frame, -1, kernel)

                    # Encode the frame with high quality for better visibility
                    _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, quality])
                    frame_bytes = buffer.tobytes()

                    # Yield the frame in multipart format
                    yield (b'--frame\r\n'
                           b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                else:
                    # If no frame is available, send a blank frame
                    blank_frame = np.ones((360, 640, 3), np.uint8) * 50  # Dark gray
                    cv2.putText(blank_frame, "Camera Initializing...", (150, 180),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

                    # Encode the frame with moderate quality for blank frames
                    _, buffer = cv2.imencode('.jpg', blank_frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
                    frame_bytes = buffer.tobytes()

                    # Yield the frame in multipart format
                    yield (b'--frame\r\n'
                           b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            except Exception as e:
                print(f"Error in generate_frames: {e}")
                # Send an error frame
                error_frame = np.ones((360, 640, 3), np.uint8) * 50  # Dark gray
                cv2.putText(error_frame, f"Camera Error: {str(e)}", (50, 180),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 0), 2)

                # Encode the frame
                _, buffer = cv2.imencode('.jpg', error_frame)
                frame_bytes = buffer.tobytes()

                # Yield the error frame
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

                # Sleep before trying again
                time.sleep(0.1)  # Shorter delay for faster recovery
    except GeneratorExit:
        # Clean up when the generator is closed
        print("Generator exited, releasing camera resources")
        release_camera()

def collect_results():
    """Collect results from the recognizer and put them in the result queue"""
    global is_recognizing

    while is_recognizing:
        result = recognizer.get_latest_result()
        if result is not None:
            result_queue.put(result)
        time.sleep(0.1)

@app.route('/api/start_recognition', methods=['POST'])
def start_recognition():
    """Start the sign language recognition process"""
    global is_recognizing

    if is_recognizing:
        return jsonify({"status": "already_running"})

    # Clear the result queue
    while not result_queue.empty():
        result_queue.get()

    # Start the recognizer
    print("Starting recognizer...")
    recognizer.start()
    is_recognizing = True

    # Start a thread to collect results
    result_thread = threading.Thread(target=collect_results)
    result_thread.daemon = True
    result_thread.start()
    print("Result collection thread started")

    return jsonify({"status": "started"})

@app.route('/api/stop_recognition', methods=['POST'])
def stop_recognition():
    """Stop the sign language recognition process"""
    global is_recognizing

    if not is_recognizing:
        return jsonify({"status": "not_running"})

    # Stop the recognizer
    print("Stopping recognizer...")
    is_recognizing = False

    try:
        # Stop the recognizer
        recognizer.stop()
        print("Recognizer stopped successfully")
    except Exception as e:
        print(f"Error stopping recognizer: {e}")

    return jsonify({"status": "stopped"})

@app.route('/api/disable_camera', methods=['POST'])
def disable_camera():
    """Explicitly release the camera resource"""
    global camera
    try:
        # First stop recognition if it's running
        if is_recognizing:
            stop_recognition()

        # Release the camera
        release_camera()

        # Force camera to be None to ensure it's recreated next time
        camera = None

        print("Camera disabled and resources released")
        return jsonify({"status": "camera_disabled"})
    except Exception as e:
        print(f"Error disabling camera: {e}")
        return jsonify({"status": "error", "message": str(e)})

@app.route('/api/launch_standalone_recognizer', methods=['POST'])
def launch_standalone_recognizer():
    """Launch the standalone sign language recognizer application"""
    global standalone_process

    try:
        # Check if the process is already running
        if standalone_process is not None:
            # Check if the process is still running
            if standalone_process.poll() is None:
                print("Standalone recognizer is already running")
                return jsonify({"status": "launched", "message": "Recognizer is already running"})
            else:
                # Process has terminated, reset the variable
                standalone_process = None

        # Launch the standalone recognizer
        print("Launching standalone recognizer...")
        standalone_process = subprocess.Popen([sys.executable, "standalone_recognizer.py"],
                                            creationflags=subprocess.CREATE_NEW_CONSOLE)

        print(f"Standalone recognizer launched with PID: {standalone_process.pid}")
        return jsonify({"status": "launched"})
    except Exception as e:
        print(f"Error launching standalone recognizer: {e}")
        return jsonify({"status": "error", "message": str(e)})

@app.route('/api/stop_standalone_recognizer', methods=['POST'])
def stop_standalone_recognizer():
    """Stop the standalone sign language recognizer application"""
    global standalone_process

    try:
        # Check if the process is running
        if standalone_process is not None:
            # Check if the process is still running
            if standalone_process.poll() is None:
                print(f"Terminating standalone recognizer with PID: {standalone_process.pid}")
                standalone_process.terminate()

                # Wait for the process to terminate
                try:
                    standalone_process.wait(timeout=5)
                    print("Standalone recognizer terminated successfully")
                except subprocess.TimeoutExpired:
                    print("Timeout waiting for process to terminate, killing it")
                    standalone_process.kill()
            else:
                print("Standalone recognizer has already terminated")

            # Reset the variable
            standalone_process = None

            return jsonify({"status": "stopped"})
        else:
            print("No standalone recognizer process to stop")
            return jsonify({"status": "not_running"})
    except Exception as e:
        print(f"Error stopping standalone recognizer: {e}")
        return jsonify({"status": "error", "message": str(e)})

@app.route('/api/get_results', methods=['GET'])
def get_results():
    """Get the latest recognition results"""
    results = []
    hand_detected = False
    confidence = 0.0

    # Get all available results from the queue without blocking
    while not result_queue.empty():
        try:
            result = result_queue.get_nowait()
            if result:
                results.append(result)
                print(f"Sending result to client: {result}")
        except queue.Empty:
            break

    # If we're recognizing, get additional information from the recognizer
    if is_recognizing and recognizer:
        # Get hand detection status
        hand_detected = recognizer.is_hand_detected()

        # Get confidence level
        confidence = recognizer.get_confidence()

        # If we have no results yet, try to get a direct result
        if not results:
            direct_result = recognizer.get_latest_result()
            if direct_result:
                results.append(direct_result)
                print(f"Got direct result from recognizer: {direct_result}")

    return jsonify({
        "is_recognizing": is_recognizing,
        "results": results,
        "hand_detected": hand_detected,
        "confidence": confidence
    })

@app.route('/api/video_feed')
def video_feed():
    """Video streaming route"""
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True, threaded=True)
