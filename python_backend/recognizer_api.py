import cv2
from cvzone.HandTrackingModule import HandDetector
import numpy as np
import pickle
import math
import sys
import time

# === Load Model and Label Map ===
try:
    with open("gesture_model.pkl", "rb") as f:
        model = pickle.load(f)
    with open("label_map.pkl", "rb") as f:
        label_map = pickle.load(f)
except Exception as e:
    print(f"Error loading model: {e}")
    sys.exit(1)

# === Init Camera and Hand Detector ===
cap = cv2.VideoCapture(0)
detector = HandDetector(maxHands=1)

offset = 20
imgSize = 300

print("Starting Gesture Recognition API Mode...")

# For displaying to the user (optional)
cv2.namedWindow("Gesture Recognition", cv2.WINDOW_NORMAL)

last_prediction = None
prediction_cooldown = 0

try:
    while True:
        success, img = cap.read()
        if not success:
            print("❌ Webcam frame failed.")
            time.sleep(0.1)
            continue

        hands, img = detector.findHands(img, draw=True)  # Show hand tracking

        if hands:
            hand = hands[0]
            x, y, w, h = hand['bbox']

            # White background
            imgWhite = np.ones((imgSize, imgSize, 3), np.uint8) * 255

            # Safe crop
            y1 = max(0, y - offset)
            y2 = min(img.shape[0], y + h + offset)
            x1 = max(0, x - offset)
            x2 = min(img.shape[1], x + w + offset)
            imgCrop = img[y1:y2, x1:x2]

            if imgCrop.size != 0:
                aspectRatio = h / w
                try:
                    if aspectRatio > 1:
                        k = imgSize / h
                        wCal = math.ceil(k * w)
                        imgResize = cv2.resize(imgCrop, (wCal, imgSize))
                        wGap = math.ceil((imgSize - wCal) / 2)
                        imgWhite[:, wGap: wCal + wGap] = imgResize
                    else:
                        k = imgSize / w
                        hCal = math.ceil(k * h)
                        imgResize = cv2.resize(imgCrop, (imgSize, hCal))
                        hGap = math.ceil((imgSize - hCal) / 2)
                        imgWhite[hGap: hCal + hGap, :] = imgResize
                except Exception as e:
                    print(f"Resize error: {e}")
                    continue

                # Preprocess for prediction
                img_input = imgWhite.flatten().reshape(1, -1)
                prediction = model.predict(img_input)[0]
                gesture_name = label_map.get(prediction, "Unknown")

                # Add cooldown to avoid rapid changes
                if prediction_cooldown <= 0:
                    if last_prediction != gesture_name:
                        # Print in a format that can be parsed by the API server
                        print(f"GESTURE:{gesture_name}")
                        sys.stdout.flush()  # Ensure output is sent immediately
                        last_prediction = gesture_name
                        prediction_cooldown = 10  # frames of cooldown
                else:
                    prediction_cooldown -= 1

                # Show gesture label on the image
                cv2.putText(img, f'Gesture: {gesture_name}', (30, 60), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 3)

        # Show original image
        cv2.imshow("Gesture Recognition", img)

        # Check for exit key
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

except KeyboardInterrupt:
    print("Interrupted by user")
except Exception as e:
    print(f"Error: {e}")
finally:
    cap.release()
    cv2.destroyAllWindows()
    print("Recognizer stopped")
