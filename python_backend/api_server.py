from flask import Flask, jsonify, request
from flask_cors import CORS
import threading
import time
import queue
import subprocess
import sys
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global variables to manage the recognizer process
recognizer_process = None
is_recognizing = False
result_queue = queue.Queue()
stop_event = threading.Event()

def run_recognizer():
    """Function to run the recognizer script and capture its output"""
    global is_recognizing, result_queue, stop_event

    try:
        print("Starting recognizer process...")
        # Start the recognizer process
        process = subprocess.Popen(
            [sys.executable, 'recognizer_api.py'],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        print(f"Recognizer process started with PID: {process.pid}")

        # Read output line by line
        for line in iter(process.stdout.readline, ''):
            print(f"Recognizer output: {line.strip()}")
            if stop_event.is_set():
                print("Stop event set, terminating recognizer process...")
                process.terminate()
                break

            # Check if the line contains a gesture result
            if line.startswith("GESTURE:"):
                # Extract the gesture name and put it in the queue
                gesture = line.strip().replace("GESTURE:", "").strip()
                print(f"Detected gesture: {gesture}")
                result_queue.put(gesture)

        process.stdout.close()
        return_code = process.wait()

        print(f"Recognizer process exited with code {return_code}")
    except Exception as e:
        print(f"Error in recognizer thread: {e}")
    finally:
        print("Recognizer thread finished, setting is_recognizing to False")
        is_recognizing = False

@app.route('/api/start_recognition', methods=['POST'])
def start_recognition():
    """Start the sign language recognition process"""
    global is_recognizing, recognizer_process, stop_event

    if is_recognizing:
        return jsonify({"status": "already_running"})

    # Clear the stop event and result queue
    stop_event.clear()
    while not result_queue.empty():
        result_queue.get()

    # Start the recognizer in a separate thread
    is_recognizing = True
    recognizer_thread = threading.Thread(target=run_recognizer)
    recognizer_thread.daemon = True
    recognizer_thread.start()

    return jsonify({"status": "started"})

@app.route('/api/stop_recognition', methods=['POST'])
def stop_recognition():
    """Stop the sign language recognition process"""
    global is_recognizing, stop_event

    if not is_recognizing:
        return jsonify({"status": "not_running"})

    # Signal the thread to stop
    stop_event.set()
    is_recognizing = False

    return jsonify({"status": "stopped"})

@app.route('/api/get_results', methods=['GET'])
def get_results():
    """Get the latest recognition results"""
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
    app.run(host='0.0.0.0', port=5001, debug=True)
