# Face Recognition Attendance System (Capstone Project)

This project implements a **face recognition–based attendance system with QR verification**.
Students verify their identity using **face recognition**, then scan a **QR code displayed by the faculty** to mark attendance.

The system is designed for **demo and research purposes** and runs with:

* **Frontend** hosted on **Vercel**
* **Backend** running locally on a laptop
* **ngrok** used to expose the backend to the internet
* **FaceNet embeddings with cosine similarity** for recognition

---

# System Architecture

```
Student Phone (Frontend - Vercel)
        │
        │ Scan Face
        ▼
Backend (Laptop - FastAPI)
        │
        │ Face recognition
        ▼
Student scans QR
        │
        │ POST attendance
        ▼
Backend saves attendance
        │
        ▼
Faculty Dashboard (Laptop)
Shows QR + Attendance Table
```

---

# Features

* Face recognition using **DeepFace (FaceNet embeddings)**
* **Cosine similarity matching** for identification
* **QR-based attendance verification**
* **Live faculty dashboard**
* **Local backend with ngrok tunneling**
* Works with **mobile phones**
* Minimal setup for demonstration

---

# Project Structure

```
capstone/
│
├── backend/
│   ├── server.py
│   ├── recognize.py
│   ├── train_model.py
│   └── attendance.json
│
├── assets/
│   └── enrollments/
│       ├── 21A91A0501.npy
│       ├── 21A91A0502.npy
│
├── models/
│   └── face_embeddings.npz
│
├── frontend/
│   └── student-app
│
└── README.md
```

---

# How the System Works

## 1. Face Recognition

1. Student opens the mobile web app.
2. The **front camera captures the face**.
3. The image is sent to the backend:

```
POST /recognize
```

4. Backend extracts **FaceNet embeddings**.
5. Embeddings are compared against stored embeddings using **cosine similarity**.
6. If a match is found, the student is verified.

---

## 2. QR Verification

After face verification:

1. The **rear camera opens**.
2. Student scans the **QR code displayed by the faculty**.
3. The QR contains the **session ID**.
4. The app sends:

```
POST /mark-attendance
```

Payload:

```
{
 "roll": "21A91A0501",
 "session": "SESSION_ID"
}
```

5. Backend records attendance.

---

## 3. Faculty Dashboard

Faculty opens:

```
http://localhost:8000/faculty
```

The page displays:

* QR code for the session
* Live attendance table
* Auto-refresh every few seconds

---

# Installation

## 1. Clone the Repository

```
git clone <repository-url>
cd capstone
```

---

## 2. Install Python Dependencies

```
pip install fastapi uvicorn deepface opencv-python numpy scipy qrcode python-multipart tf-keras flask-cors
```

---

# Preparing the Dataset

Each student must have a `.npy` file containing embeddings.

These files should be placed in:

```
assets/enrollments/
```

Example:

```
assets/enrollments/
   21A91A0501.npy
   21A91A0502.npy
```

---

# Train the Recognition Model

Run:

```
python backend/train_model.py
```

This generates:

```
models/face_embeddings.npz
```

This file stores the **mean embeddings for each student**.

---

# Running the Backend

Start the FastAPI server:

```
uvicorn backend.server:app --reload --host 0.0.0.0 --port 8000
```

Backend will run at:

```
http://localhost:8000
```

Swagger API documentation:

```
http://localhost:8000/docs
```

---

# Exposing the Backend (ngrok)

To allow phones and Vercel frontend to access the backend:

1. Start ngrok:

```
ngrok http 8000
```

2. Copy the **HTTPS** URL ngrok gives you (e.g. `https://xxxx.ngrok-free.dev`).

3. **Update the frontend** so it calls your backend: open **`src/utils/api.ts`** and set the `API_BASE` constant to your ngrok URL:

```ts
const API_BASE = "https://your-ngrok-url.ngrok-free.dev";
```

**If you run ngrok on a different device or get a new URL, you must change this link in `api.ts`** for the app (face recognition, attendance) to work. This is the only place in the codebase that needs the backend URL; all API calls use it.

Example (replace with your own URL):

```
https://hyperbranchial-noncommendatory-leann.ngrok-free.dev
```

---

# Frontend Configuration (Vercel)

The frontend uses the backend URL from **`src/utils/api.ts`** (the `API_BASE` constant). Before deploying to Vercel, set `API_BASE` in that file to your ngrok URL (see [Exposing the Backend (ngrok)](#exposing-the-backend-ngrok)). Redeploy the frontend after changing it so the student app can reach your backend.

---

# Demo Procedure

1. Start backend server:

```
uvicorn backend.server:app --reload --host 0.0.0.0 --port 8000
```

2. Start ngrok:

```
ngrok http 8000
```

3. Open faculty dashboard:

```
http://localhost:8000/faculty
```

4. Open the student app on phone:

```
https://your-vercel-app.vercel.app
```

5. Demo flow:

```
Student scans face
↓
Student scans QR
↓
Attendance recorded
↓
Faculty dashboard updates
```

---

# API Endpoints

### Face Recognition

```
POST /recognize
```

Input:

```
image file
```

Response:

```
{
 "status": "recognized",
 "person": "ROLL_NUMBER"
}
```

---

### Mark Attendance

```
POST /mark-attendance
```

Payload:

```
{
 "roll": "ROLL_NUMBER",
 "session": "SESSION_ID"
}
```

---

### Get Attendance

```
GET /attendance/{session}
```

Returns:

```
[
 "21A91A0501",
 "21A91A0502"
]
```

---

# Technologies Used

* Python
* FastAPI
* DeepFace
* FaceNet
* OpenCV
* NumPy
* HTML / JavaScript
* Vercel
* ngrok

---

# Notes

* The system currently uses **cosine similarity instead of SVM classification**.
* QR code remains **static for demo purposes**.
* The backend runs locally but is exposed using **ngrok**.

---

# Future Improvements

* Real-time face recognition from video stream
* Automatic QR refresh for enhanced security
* Database storage (MongoDB / Firebase)
* Face embedding vector database (FAISS)
* Multi-class attendance management
* Mobile application version

---

# Authors

Capstone Project – Face Recognition Attendance System

Developed for academic research and demonstration.
