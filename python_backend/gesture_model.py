import os
import numpy as np
import cv2
from sklearn.neighbors import KNeighborsClassifier
import pickle

# === Paths and Parameters ===
data_dir = "gesture_data"
img_size = 300

X = []
y = []
label_map = {}
label_counter = 0

# === Load and Label Data ===
print("Loading data...")
for gesture_name in os.listdir(data_dir):
    gesture_path = os.path.join(data_dir, gesture_name)
    if not os.path.isdir(gesture_path):
        continue

    print(f"Processing gesture: '{gesture_name}'")

    # Assign numeric label
    label_map[label_counter] = gesture_name

    for img_file in os.listdir(gesture_path):
        img_path = os.path.join(gesture_path, img_file)
        img = cv2.imread(img_path)
        if img is None:
            print(f"Skipping unreadable image: {img_path}")
            continue

        img_resized = cv2.resize(img, (img_size, img_size))
        img_flatten = img_resized.flatten()
        X.append(img_flatten)
        y.append(label_counter)

    label_counter += 1

# === Train KNN Model ===
print("Training model...")
X = np.array(X)
y = np.array(y)

model = KNeighborsClassifier(n_neighbors=3)
model.fit(X, y)

# === Save Model and Labels ===
with open("gesture_model.pkl", "wb") as f:
    pickle.dump(model, f)
with open("label_map.pkl", "wb") as f:
    pickle.dump(label_map, f)

print("Model and label map saved.")
print(f"Trained on {len(X)} images for {label_counter} gestures.")
