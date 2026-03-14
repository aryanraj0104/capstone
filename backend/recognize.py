import cv2
import numpy as np
from deepface import DeepFace
from scipy.spatial.distance import cosine
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = _ROOT / "models" / "face_embeddings.npz"

data = np.load(MODEL_PATH)

known_embeddings = data["embeddings"]
labels = data["labels"]


def recognize_face(image, threshold=0.6):

    try:
        embedding = DeepFace.represent(
            image,
            model_name="Facenet",
            detector_backend="mtcnn",
            enforce_detection=True
        )[0]["embedding"]

        embedding = np.array(embedding)

    except:
        return None, None

    scores = [cosine(embedding, mean) for mean in known_embeddings]

    best_idx = np.argmin(scores)
    best_score = scores[best_idx]

    if best_score < threshold:
        return labels[best_idx], float(best_score)

    return None, float(best_score)