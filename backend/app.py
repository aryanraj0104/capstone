from flask import Flask, request, jsonify
from pathlib import Path
import numpy as np
from scipy.spatial.distance import cosine
import cv2
import os

app = Flask(__name__)

# Define directories
BASE_DIR = Path("./capstone_data")
WORKDIR = BASE_DIR / "enrollments"
WORKDIR.mkdir(parents=True, exist_ok=True)

# Helper functions
def frames_to_embeddings(frames):
    # Placeholder for embedding computation logic
    embeddings = []
    for frame in frames:
        # Compute embedding for each frame (use DeepFace or similar library)
        pass
    return np.vstack(embeddings) if embeddings else np.array([])

def extract_frames_from_video(video_path, frame_interval=5):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError("Cannot open video file")
    frames = []
    idx = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if idx % frame_interval == 0:
            frames.append(frame)
        idx += 1
    cap.release()
    return frames

# Routes
@app.route("/enroll", methods=["POST"])
def enroll():
    if "video" not in request.files:
        return jsonify({"error": "No video file provided"}), 400

    video = request.files["video"]
    roll = request.form.get("roll")
    if not roll:
        return jsonify({"error": "Roll number is required"}), 400

    video_path = WORKDIR / f"{roll}.mp4"
    video.save(video_path)

    frames = extract_frames_from_video(str(video_path))
    embeddings = frames_to_embeddings(frames)
    if embeddings.size == 0:
        return jsonify({"error": "No embeddings computed"}), 400

    mean_embedding = np.mean(embeddings, axis=0)
    np.save(WORKDIR / f"{roll}.npy", mean_embedding)

    return jsonify({"message": "Enrollment successful", "roll": roll}), 200

@app.route("/recognize", methods=["POST"])
def recognize():
    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    image = request.files["image"]
    image_path = WORKDIR / "temp.jpg"
    image.save(image_path)

    img = cv2.imread(str(image_path))
    emb_array = frames_to_embeddings([img])
    if emb_array.size == 0:
        return jsonify({"error": "No face detected in the image"}), 400

    # Read enrollment files from the directory
    enroll_files = sorted(WORKDIR.glob("*.npy"))
    X_mean_list = [np.load(f) for f in enroll_files]
    label_map = {idx: f.stem for idx, f in enumerate(enroll_files)}

    # Perform cosine matching
    scores = [cosine(emb_array[0], mean) for mean in X_mean_list]
    best_idx = np.argmin(scores)
    best_score = scores[best_idx]

    threshold = 0.6
    if best_score > threshold:
        return jsonify({"message": "No match found", "score": best_score}), 200

    return jsonify({"message": "Match found", "roll": label_map[best_idx], "score": best_score}), 200

if __name__ == "__main__":
    app.run(debug=True)