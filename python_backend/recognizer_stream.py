import cv2
from cvzone.HandTrackingModule import HandDetector
import numpy as np
import pickle
import math
import sys
import time
import threading
import queue

class SignRecognizer:
    def __init__(self):
        # Load model and label map
        try:
            with open("gesture_model.pkl", "rb") as f:
                self.model = pickle.load(f)
            with open("label_map.pkl", "rb") as f:
                self.label_map = pickle.load(f)
            print("Model and label map loaded successfully")
        except Exception as e:
            print(f"Error loading model: {e}")
            sys.exit(1)

        # Initialize camera and detector
        self.cap = None
        self.detector = HandDetector(maxHands=1, detectionCon=0.8)  # Higher confidence for more stable detection
        self.offset = 20
        self.imgSize = 300

        # State variables
        self.running = False
        self.last_prediction = None
        self.prediction_cooldown = 0
        self.frame_queue = queue.Queue(maxsize=1)  # Only keep the latest frame
        self.result_queue = queue.Queue()
        self.hand_detected = False
        self.confidence = 0.0

    def start(self):
        """Start the recognition process"""
        if self.running:
            return

        # Initialize camera with DirectShow backend for better performance
        print("Initializing camera for recognition...")
        self.cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)  # Use DirectShow on Windows
        if not self.cap.isOpened():
            print("Failed to open webcam")
            return

        # Set camera properties for better performance
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        self.cap.set(cv2.CAP_PROP_FPS, 30)
        self.cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*'MJPG'))  # Use MJPG format
        self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # Minimize buffering

        # Check if camera is working by reading a test frame
        ret, test_frame = self.cap.read()
        if not ret or test_frame is None:
            print("Camera test frame failed")
            self.cap.release()
            self.cap = None
            return
        else:
            print(f"Camera initialized with frame size: {test_frame.shape}")

            # Warm up the camera by reading a few frames
            print("Warming up camera...")
            for _ in range(5):
                self.cap.read()

        # Reset state variables
        self.last_prediction = None
        self.prediction_cooldown = 0

        # Clear the frame queue
        while not self.frame_queue.empty():
            self.frame_queue.get_nowait()

        # Clear the result queue
        while not self.result_queue.empty():
            self.result_queue.get_nowait()

        # Set running flag
        self.running = True

        # Start processing thread
        self.process_thread = threading.Thread(target=self._process_frames)
        self.process_thread.daemon = True
        self.process_thread.start()

        print("Sign recognizer started successfully")

    def stop(self):
        """Stop the recognition process"""
        self.running = False
        if self.process_thread:
            self.process_thread.join(timeout=1.0)
        if self.cap:
            self.cap.release()
        self.cap = None
        print("Sign recognizer stopped")

    def get_latest_frame(self):
        """Get the latest processed frame"""
        try:
            return self.frame_queue.get_nowait()
        except queue.Empty:
            return None

    def get_latest_result(self):
        """Get the latest recognition result"""
        try:
            return self.result_queue.get_nowait()
        except queue.Empty:
            return None

    def _process_frames(self):
        """Process frames from the webcam"""
        frame_count = 0
        error_count = 0
        max_errors = 5  # Maximum consecutive errors before giving up
        skip_frames = 0  # Skip frames counter for performance
        last_processed_frame = None  # Store the last processed frame

        while self.running:
            try:
                if not self.cap or not self.cap.isOpened():
                    print("Camera not available, waiting...")
                    time.sleep(0.5)
                    error_count += 1
                    if error_count > max_errors:
                        print("Too many camera errors, stopping recognizer")
                        self.running = False
                    continue

                # Read frame
                success, img = self.cap.read()
                if not success or img is None or img.size == 0:
                    print("Failed to read frame")
                    time.sleep(0.1)
                    error_count += 1
                    if error_count > max_errors:
                        print("Too many frame read errors, stopping recognizer")
                        self.running = False
                    continue

                # Reset error count on successful frame read
                error_count = 0
                frame_count += 1

                # DO NOT flip the image - we want correct hand orientation

                # Process only every 2nd frame for better performance
                # but always update the frame in the queue
                process_this_frame = (frame_count % 2 == 0)

                # Create a copy of the image for display
                display_img = img.copy()

                # Add frame counter for debugging (every 30 frames)
                if frame_count % 30 == 0:
                    print(f"Processed {frame_count} frames, current shape: {img.shape}")

                # Process for hand detection and recognition
                if process_this_frame:
                    # Find hands
                    try:
                        hands, display_img = self.detector.findHands(img, draw=True)
                        # Update hand detection status
                        self.hand_detected = len(hands) > 0
                    except Exception as e:
                        print(f"Hand detection error: {e}")
                        hands = []
                        self.hand_detected = False

                    # Process if hands detected
                    if hands:
                        hand = hands[0]
                        x, y, w, h = hand['bbox']

                        # Create white background
                        imgWhite = np.ones((self.imgSize, self.imgSize, 3), np.uint8) * 255

                        # Safe crop with boundary checks
                        y1 = max(0, y - self.offset)
                        y2 = min(img.shape[0], y + h + self.offset)
                        x1 = max(0, x - self.offset)
                        x2 = min(img.shape[1], x + w + self.offset)

                        # Check if crop region is valid
                        if y1 < y2 and x1 < x2 and y2 <= img.shape[0] and x2 <= img.shape[1]:
                            imgCrop = img[y1:y2, x1:x2]

                            if imgCrop.size != 0:
                                aspectRatio = h / w
                                try:
                                    if aspectRatio > 1:
                                        k = self.imgSize / h
                                        wCal = math.ceil(k * w)
                                        imgResize = cv2.resize(imgCrop, (wCal, self.imgSize))
                                        wGap = math.ceil((self.imgSize - wCal) / 2)
                                        imgWhite[:, wGap: wCal + wGap] = imgResize
                                    else:
                                        k = self.imgSize / w
                                        hCal = math.ceil(k * h)
                                        imgResize = cv2.resize(imgCrop, (self.imgSize, hCal))
                                        hGap = math.ceil((self.imgSize - hCal) / 2)
                                        imgWhite[hGap: hCal + hGap, :] = imgResize
                                except Exception as e:
                                    print(f"Resize error: {e}")
                                    continue

                                # Preprocess for prediction
                                img_input = imgWhite.flatten().reshape(1, -1)

                                # Get prediction and probability
                                prediction = self.model.predict(img_input)[0]

                                # Try to get probability scores if available
                                try:
                                    if hasattr(self.model, 'predict_proba'):
                                        proba = self.model.predict_proba(img_input)[0]
                                        max_proba = max(proba)
                                        self.confidence = float(max_proba)  # Convert to float for JSON serialization
                                    else:
                                        # If no probability available, use a high default value
                                        self.confidence = 0.85
                                except Exception as e:
                                    print(f"Error getting prediction probability: {e}")
                                    self.confidence = 0.7  # Default confidence

                                gesture_name = self.label_map.get(prediction, "Unknown")

                                # Add cooldown to avoid rapid changes
                                if self.prediction_cooldown <= 0:
                                    if self.last_prediction != gesture_name:
                                        # Add to result queue
                                        self.result_queue.put(gesture_name)
                                        print(f"GESTURE:{gesture_name}")
                                        self.last_prediction = gesture_name
                                        self.prediction_cooldown = 5  # Reduced cooldown for better responsiveness
                                else:
                                    self.prediction_cooldown -= 1

                                # Show gesture label on the image
                                cv2.putText(display_img, f'Gesture: {gesture_name}', (30, 60),
                                            cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 3)

                    # Save this as the last processed frame
                    last_processed_frame = display_img.copy()
                elif last_processed_frame is not None:
                    # Use the last processed frame for display
                    display_img = last_processed_frame.copy()

                # Add a border to make the frame more visible
                display_img = cv2.rectangle(display_img, (0, 0), (display_img.shape[1]-1, display_img.shape[0]-1), (0, 255, 0), 2)

                # Put the frame in the queue for streaming
                try:
                    # Clear the queue first to always have the latest frame
                    while not self.frame_queue.empty():
                        self.frame_queue.get_nowait()
                    self.frame_queue.put(display_img)
                except queue.Full:
                    pass  # Queue is full, skip this frame
                except Exception as e:
                    print(f"Queue error: {e}")

                # Adaptive delay based on frame processing time
                # This helps maintain a consistent frame rate
                if process_this_frame:
                    time.sleep(0.02)  # Longer delay after processing a frame
                else:
                    time.sleep(0.01)  # Shorter delay for skipped frames

            except Exception as e:
                print(f"Error in process_frames: {e}")
                error_count += 1
                if error_count > max_errors:
                    print("Too many processing errors, stopping recognizer")
                    self.running = False
                time.sleep(0.1)

    def get_latest_result(self):
        """Get the latest recognition result"""
        if not self.running:
            return None

        return self.last_prediction

    def is_hand_detected(self):
        """Check if a hand is currently detected"""
        return self.hand_detected

    def get_confidence(self):
        """Get the confidence level of the latest prediction"""
        return self.confidence

# Global instance
recognizer = SignRecognizer()

if __name__ == "__main__":
    try:
        recognizer.start()
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        recognizer.stop()
    except Exception as e:
        print(f"Error: {e}")
        recognizer.stop()
