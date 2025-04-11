import cv2
from cvzone.HandTrackingModule import HandDetector
import numpy as np
import pickle
import math
import sys
import time
import threading
import tkinter as tk
from tkinter import Label, Button, Frame
from PIL import Image, ImageTk

class SignRecognizerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Sign Language Recognizer")
        self.root.geometry("800x600")
        self.root.configure(bg="#1e1e1e")
        self.root.resizable(True, True)
        
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
        self.detector = HandDetector(maxHands=1)
        self.offset = 20
        self.imgSize = 300
        
        # State variables
        self.running = False
        self.last_prediction = None
        self.prediction_cooldown = 0
        
        # Create UI elements
        self.create_ui()
        
    def create_ui(self):
        # Create header
        header_frame = Frame(self.root, bg="#2d2d2d")
        header_frame.pack(fill="x", padx=10, pady=10)
        
        title_label = Label(header_frame, text="Sign Language Recognizer", 
                           font=("Arial", 24, "bold"), fg="#ffffff", bg="#2d2d2d")
        title_label.pack(pady=10)
        
        # Create video frame
        self.video_frame = Frame(self.root, bg="#1e1e1e")
        self.video_frame.pack(fill="both", expand=True, padx=20, pady=10)
        
        # Create canvas for video
        self.canvas = tk.Canvas(self.video_frame, bg="#000000", highlightthickness=0)
        self.canvas.pack(fill="both", expand=True)
        
        # Create result display
        self.result_frame = Frame(self.root, bg="#2d2d2d", height=100)
        self.result_frame.pack(fill="x", padx=20, pady=10)
        
        self.result_label = Label(self.result_frame, text="Recognized Sign: None", 
                                 font=("Arial", 20), fg="#4CAF50", bg="#2d2d2d")
        self.result_label.pack(pady=10)
        
        # Create control buttons
        button_frame = Frame(self.root, bg="#1e1e1e")
        button_frame.pack(fill="x", padx=20, pady=20)
        
        self.start_button = Button(button_frame, text="Start Recognition", 
                                  font=("Arial", 14), bg="#4CAF50", fg="white",
                                  command=self.toggle_recognition, padx=20, pady=10)
        self.start_button.pack(side="left", padx=10)
        
        self.quit_button = Button(button_frame, text="Quit", 
                                 font=("Arial", 14), bg="#f44336", fg="white",
                                 command=self.quit_app, padx=20, pady=10)
        self.quit_button.pack(side="right", padx=10)
    
    def toggle_recognition(self):
        if not self.running:
            self.start_recognition()
        else:
            self.stop_recognition()
    
    def start_recognition(self):
        if self.running:
            return
        
        # Initialize camera
        self.cap = cv2.VideoCapture(0)
        if not self.cap.isOpened():
            print("Failed to open webcam")
            return
        
        # Set camera properties for better quality
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        self.cap.set(cv2.CAP_PROP_FPS, 30)
        
        # Set running flag
        self.running = True
        self.start_button.config(text="Stop Recognition", bg="#f44336")
        
        # Start processing thread
        self.process_thread = threading.Thread(target=self.process_frames)
        self.process_thread.daemon = True
        self.process_thread.start()
        
        print("Sign recognizer started")
    
    def stop_recognition(self):
        self.running = False
        if hasattr(self, 'process_thread'):
            self.process_thread.join(timeout=1.0)
        if self.cap:
            self.cap.release()
        self.cap = None
        self.start_button.config(text="Start Recognition", bg="#4CAF50")
        print("Sign recognizer stopped")
    
    def process_frames(self):
        frame_count = 0
        error_count = 0
        max_errors = 5  # Maximum consecutive errors before giving up
        
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
                
                # Flip the image horizontally for a more natural view
                img = cv2.flip(img, 1)
                
                # Add frame counter for debugging (every 30 frames)
                if frame_count % 30 == 0:
                    print(f"Processed {frame_count} frames, current shape: {img.shape}")
                
                # Find hands
                try:
                    hands, img = self.detector.findHands(img, draw=True)
                except Exception as e:
                    print(f"Hand detection error: {e}")
                    hands = []
                
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
                            prediction = self.model.predict(img_input)[0]
                            gesture_name = self.label_map.get(prediction, "Unknown")
                            
                            # Add cooldown to avoid rapid changes
                            if self.prediction_cooldown <= 0:
                                if self.last_prediction != gesture_name:
                                    # Update the result label
                                    self.update_result(gesture_name)
                                    print(f"GESTURE: {gesture_name}")
                                    self.last_prediction = gesture_name
                                    self.prediction_cooldown = 10  # frames of cooldown
                            else:
                                self.prediction_cooldown -= 1
                            
                            # Show gesture label on the image
                            cv2.putText(img, f'Gesture: {gesture_name}', (30, 60),
                                        cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 3)
                
                # Add a border to make the frame more visible
                img = cv2.rectangle(img, (0, 0), (img.shape[1]-1, img.shape[0]-1), (0, 255, 0), 2)
                
                # Convert to RGB for tkinter
                rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                
                # Convert to PhotoImage
                pil_img = Image.fromarray(rgb_img)
                
                # Resize to fit canvas
                canvas_width = self.canvas.winfo_width()
                canvas_height = self.canvas.winfo_height()
                
                if canvas_width > 1 and canvas_height > 1:  # Ensure canvas has been drawn
                    pil_img = pil_img.resize((canvas_width, canvas_height), Image.LANCZOS)
                
                self.photo = ImageTk.PhotoImage(image=pil_img)
                
                # Update canvas
                self.canvas.create_image(0, 0, image=self.photo, anchor=tk.NW)
                
                # Small delay to reduce CPU usage
                time.sleep(0.01)
                
            except Exception as e:
                print(f"Error in process_frames: {e}")
                error_count += 1
                if error_count > max_errors:
                    print("Too many processing errors, stopping recognizer")
                    self.running = False
                time.sleep(0.1)
    
    def update_result(self, gesture_name):
        # Update in the main thread
        self.root.after(0, lambda: self.result_label.config(text=f"Recognized Sign: {gesture_name}"))
    
    def quit_app(self):
        self.stop_recognition()
        self.root.quit()
        self.root.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = SignRecognizerApp(root)
    root.mainloop()
