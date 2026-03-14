import numpy as np
from pathlib import Path

# Paths relative to project root (cap/), so script works from any cwd
_ROOT = Path(__file__).resolve().parent.parent
ENROLL_DIR = _ROOT / "assets" / "enrollments"
MODEL_DIR = _ROOT / "models"

MODEL_DIR.mkdir(parents=True, exist_ok=True)

def train_model():
    enroll_files = sorted(list(ENROLL_DIR.glob("*.npy")))

    if len(enroll_files) == 0:
        print("No enrollment files found.")
        return

    embeddings = []
    labels = []

    for f in enroll_files:
        arr = np.load(f)

        if arr.ndim == 1:
            mean_emb = arr
        else:
            mean_emb = arr.mean(axis=0)

        embeddings.append(mean_emb)
        labels.append(f.stem)

    embeddings = np.vstack(embeddings)
    labels = np.array(labels)

    np.savez(MODEL_DIR / "face_embeddings.npz",
             embeddings=embeddings,
             labels=labels)

    print("Model saved successfully")
    print("Embeddings shape:", embeddings.shape)

if __name__ == "__main__":
    train_model()