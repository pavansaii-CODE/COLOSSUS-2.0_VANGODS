import cv2
from cvzone.HandTrackingModule import HandDetector
import numpy as np
import pickle
import math

# === Load Model and Label Map ===
with open("gesture_model.pkl", "rb") as f:
    model = pickle.load(f)
with open("label_map.pkl", "rb") as f:
    label_map = pickle.load(f)

# === Init Camera and Hand Detector ===
cap = cv2.VideoCapture(0)
detector = HandDetector(maxHands=1)

offset = 20
imgSize = 300

print("Starting Gesture Recognition... Press 'q' to quit.")

while True:
    success, img = cap.read()
    if not success:
        print("❌ Webcam frame failed.")
        continue

    hands, img = detector.findHands(img, draw=False)  # draw=False to hide boxes

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
                print("Resize error:", e)
                continue

            # Preprocess for prediction
            img_input = imgWhite.flatten().reshape(1, -1)
            prediction = model.predict(img_input)[0]
            gesture_name = label_map.get(prediction, "Unknown")

            # Show gesture label
            cv2.putText(img, f'Gesture: {gesture_name}', (30, 60), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 3)

    # Show original image
    cv2.imshow("Gesture Recognition", img)

    # Quit on 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'):
        print("Exiting...")
        break

cap.release()
cv2.destroyAllWindows()
