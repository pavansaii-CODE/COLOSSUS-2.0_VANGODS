import cv2
from cvzone.HandTrackingModule import HandDetector
import numpy as np
import math
import time
import os
gesture_name = input("Enter gesture label: ").strip()
if not gesture_name:
    print("Gesture name cannot be empty.")
    exit()
folder = f"gesture_data/{gesture_name}"
os.makedirs(folder, exist_ok=True)

img_size = 300
offset = 30
counter = 0

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("❌ Cannot open webcam")
    exit()

detector = HandDetector(maxHands=1)

print(f"Collecting images for gesture: '{gesture_name}'")
print("Press 's' to save an image | 'q' to quit")
while True:
    success, img = cap.read()
    if not success or img is None:
        print("Failed to grab frame from webcam.")
        continue

    hands, img = detector.findHands(img)

    if hands:
        hand = hands[0]
        x, y, w, h = hand['bbox']
        cv2.putText(img, f"X:{x} Y:{y} W:{w} H:{h}", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 
                    0.6, (255, 0, 255), 2)

        img_white = np.ones((img_size, img_size, 3), np.uint8) * 255

        y1 = max(0, y - offset)
        y2 = min(img.shape[0], y + h + offset)
        x1 = max(0, x - offset)
        x2 = min(img.shape[1], x + w + offset)

        img_crop = img[y1:y2, x1:x2]

        if img_crop.size == 0:
            print("⚠️ Empty crop. Skipping.")
            continue

        aspect_ratio = h / w

        try:
            if aspect_ratio > 1:
                k = img_size / h
                w_cal = math.ceil(k * w)
                img_resize = cv2.resize(img_crop, (w_cal, img_size))
                w_gap = math.ceil((img_size - w_cal) / 2)
                img_white[:, w_gap:w_cal + w_gap] = img_resize
            else:
                k = img_size / w
                h_cal = math.ceil(k * h)
                img_resize = cv2.resize(img_crop, (img_size, h_cal))
                h_gap = math.ceil((img_size - h_cal) / 2)
                img_white[h_gap:h_cal + h_gap, :] = img_resize
        except Exception as e:
            print("⚠️ Resize error:", e)
            continue

        # Show intermediate windows
        cv2.imshow("ImageCrop", img_crop)
        cv2.imshow("ImageWhite", img_white)

    # Show main webcam feed
    cv2.imshow("Webcam Feed", img)

    key = cv2.waitKey(1)
    if key == ord('s'):
        counter += 1
        filename = f'{folder}/Image_{int(time.time())}.jpg'
        cv2.imwrite(filename, img_white)
        print(f"✅ Saved: {filename} | Total saved: {counter}")

    elif key == ord('q'):
        print("👋 Quitting collection.")
        break

# Release resources
cap.release()
cv2.destroyAllWindows()
