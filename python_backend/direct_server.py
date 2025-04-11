from flask import Flask, Response, render_template, jsonify, request
import cv2
import numpy as np
import threading
import time
import queue
import os

# Create templates directory if it doesn't exist
os.makedirs('templates', exist_ok=True)

app = Flask(__name__)

# Global variables
camera = None
is_recognizing = False
result_queue = queue.Queue()
last_result = None

def get_camera():
    """Get or initialize the camera"""
    global camera
    if camera is None:
        camera = cv2.VideoCapture(0)
        # Set camera properties for better quality
        camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        camera.set(cv2.CAP_PROP_FPS, 30)
    return camera

def release_camera():
    """Release the camera"""
    global camera
    if camera is not None:
        camera.release()
        camera = None

def generate_frames():
    """Generate video frames"""
    global is_recognizing
    
    while True:
        # Get or initialize camera
        cam = get_camera()
        
        if not cam.isOpened():
            # If camera is not available, send a blank frame
            blank_frame = np.ones((480, 640, 3), np.uint8) * 200  # Light gray
            cv2.putText(blank_frame, "Camera not available", (150, 240), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (100, 100, 100), 2)
            
            # Encode the frame
            _, buffer = cv2.imencode('.jpg', blank_frame)
            frame_bytes = buffer.tobytes()
            
            # Yield the frame
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            
            # Try to reinitialize camera
            release_camera()
            time.sleep(1)
            continue
        
        # Read frame
        success, frame = cam.read()
        
        if not success:
            # If frame read failed, send a blank frame
            blank_frame = np.ones((480, 640, 3), np.uint8) * 200  # Light gray
            cv2.putText(blank_frame, "Cannot read from camera", (120, 240), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (100, 100, 100), 2)
            
            # Encode the frame
            _, buffer = cv2.imencode('.jpg', blank_frame)
            frame_bytes = buffer.tobytes()
            
            # Yield the frame
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            
            time.sleep(0.1)
            continue
        
        # Flip the frame horizontally for a more natural view
        frame = cv2.flip(frame, 1)
        
        # If recognizing, process the frame
        if is_recognizing:
            # Add a recording indicator
            cv2.circle(frame, (frame.shape[1] - 30, 30), 15, (0, 0, 255), -1)
            
            # Display the current recognized sign if available
            global last_result
            if last_result:
                # Add a background for better visibility
                text_size = cv2.getTextSize(last_result, cv2.FONT_HERSHEY_SIMPLEX, 1, 2)[0]
                cv2.rectangle(frame, 
                             (10, frame.shape[0] - 50), 
                             (10 + text_size[0] + 20, frame.shape[0] - 10), 
                             (0, 0, 0), -1)
                
                # Add the text
                cv2.putText(frame, last_result, (20, frame.shape[0] - 20), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            
            # Simulate sign recognition (replace with actual recognition code)
            if time.time() % 5 < 0.1:  # Every ~5 seconds
                signs = ["Hello", "Thank you", "Yes", "No", "Please", "Sorry"]
                import random
                sign = random.choice(signs)
                result_queue.put(sign)
                last_result = sign
        
        # Encode the frame
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 90])
        frame_bytes = buffer.tobytes()
        
        # Yield the frame
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
        # Small delay to reduce CPU usage
        time.sleep(0.033)  # ~30 FPS

@app.route('/')
def index():
    """Render the main page"""
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    """Video streaming route"""
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/start_recognition', methods=['POST'])
def start_recognition():
    """Start the sign language recognition process"""
    global is_recognizing
    
    if is_recognizing:
        return jsonify({"status": "already_running"})
    
    # Clear the result queue
    while not result_queue.empty():
        result_queue.get()
    
    # Start recognition
    is_recognizing = True
    
    return jsonify({"status": "started"})

@app.route('/stop_recognition', methods=['POST'])
def stop_recognition():
    """Stop the sign language recognition process"""
    global is_recognizing
    
    if not is_recognizing:
        return jsonify({"status": "not_running"})
    
    # Stop recognition
    is_recognizing = False
    
    return jsonify({"status": "stopped"})

@app.route('/get_results', methods=['GET'])
def get_results():
    """Get the latest recognition results"""
    global is_recognizing
    
    results = []
    
    # Get all available results from the queue without blocking
    while not result_queue.empty():
        try:
            results.append(result_queue.get_nowait())
        except queue.Empty:
            break
    
    return jsonify({
        "is_recognizing": is_recognizing,
        "results": results
    })

if __name__ == '__main__':
    try:
        print("Starting Sign Language Recognition Server...")
        print("Open http://localhost:5000 in your browser")
        app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
    finally:
        # Make sure to release the camera when the server stops
        release_camera()
