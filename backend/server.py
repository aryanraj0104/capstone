import json
import uuid
import io
from pathlib import Path

import qrcode
import numpy as np
import cv2
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, Response
from pydantic import BaseModel

from .recognize import recognize_face

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_BACKEND_ROOT = Path(__file__).resolve().parent
ATTENDANCE_FILE = _BACKEND_ROOT / "attendance.json"

# One session per server run so QR stays static for the demo
_current_session_id: str | None = None


def _load_attendance() -> dict:
    if not ATTENDANCE_FILE.exists():
        return {}
    with open(ATTENDANCE_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_attendance(data: dict) -> None:
    with open(ATTENDANCE_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


@app.get("/")
def home():
    return {"message": "Face Recognition Server Running"}


@app.post("/recognize")
async def recognize(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image is None:
        return {"status": "error", "person": None}
    person, _ = recognize_face(image)
    if person is None:
        return {"status": "unknown", "person": None}
    return {"status": "recognized", "person": str(person)}


class MarkAttendanceBody(BaseModel):
    roll: str
    session: str


@app.post("/mark-attendance")
def mark_attendance(body: MarkAttendanceBody):
    data = _load_attendance()
    session_id = body.session
    roll = body.roll.strip()
    if session_id not in data:
        data[session_id] = []
    if roll not in data[session_id]:
        data[session_id].append(roll)
        _save_attendance(data)
    return {"status": "success", "message": "Attendance marked"}


@app.get("/attendance/{session}")
def get_attendance(session: str):
    data = _load_attendance()
    students = data.get(session, [])
    return {"session": session, "students": students}


@app.get("/generate-session")
def generate_session():
    global _current_session_id
    if _current_session_id is None:
        _current_session_id = str(uuid.uuid4())
        data = _load_attendance()
        data[_current_session_id] = []
        _save_attendance(data)
    return {"session": _current_session_id}


def _get_current_session() -> str:
    global _current_session_id
    if _current_session_id is None:
        _current_session_id = str(uuid.uuid4())
        data = _load_attendance()
        data[_current_session_id] = []
        _save_attendance(data)
    return _current_session_id


@app.get("/qr")
def qr_image_response():
    session_id = _get_current_session()
    payload = json.dumps({"session": session_id})
    qr = qrcode.make(payload)
    buf = io.BytesIO()
    qr.save(buf, format="PNG")
    buf.seek(0)
    return Response(content=buf.read(), media_type="image/png")


@app.get("/faculty", response_class=HTMLResponse)
def faculty_dashboard():
    session_id = _get_current_session()
    # QR and table refresh; use /qr for image, /attendance/{session} for list
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Faculty – Attendance</title>
  <style>
    * {{ box-sizing: border-box; }}
    body {{ margin: 0; font-family: system-ui, sans-serif; background: #F5F5F0; color: #333; min-height: 100vh; }}
    .container {{ max-width: 640px; margin: 0 auto; padding: 24px; }}
    h1 {{ color: #006747; margin-bottom: 8px; font-size: 1.5rem; }}
    .qr-wrap {{ text-align: center; padding: 24px; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 24px; }}
    .qr-wrap img {{ width: 220px; height: 220px; display: block; margin: 0 auto 12px; }}
    .qr-wrap p {{ margin: 0; color: #666; font-size: 0.9rem; }}
    .table-wrap {{ background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; }}
    table {{ width: 100%; border-collapse: collapse; }}
    th {{ background: #006747; color: #fff; padding: 12px 16px; text-align: left; font-weight: 600; }}
    td {{ padding: 12px 16px; border-bottom: 1px solid #eee; }}
    tr:last-child td {{ border-bottom: none; }}
    tr:nth-child(even) {{ background: #fafafa; }}
    .count {{ color: #006747; font-weight: 600; margin-bottom: 12px; }}
  </style>
</head>
<body>
  <div class="container">
    <h1>Attendance – Faculty</h1>
    <div class="qr-wrap">
      <img id="qr" src="/qr" alt="Session QR" />
      <p>Scan to mark attendance</p>
    </div>
    <div class="table-wrap">
      <p class="count" id="count">Present: 0</p>
      <table>
        <thead><tr><th>#</th><th>Roll Number</th><th>Name</th><th>Status</th></tr></thead>
        <tbody id="tbody"></tbody>
      </table>
    </div>
  </div>
  <script>
    const sessionId = {json.dumps(session_id)};
    function refresh() {{
      fetch('/attendance/' + sessionId)
        .then(r => r.json())
        .then(d => {{
          const students = d.students || [];
          document.getElementById('count').textContent = 'Present: ' + students.length;
          const tbody = document.getElementById('tbody');
          tbody.innerHTML = students.map((r, i) => '<tr><td>' + (i+1) + '</td><td>' + r + '</td><td>—</td><td>Present</td></tr>').join('') || '<tr><td colspan="4">No entries yet</td></tr>';
        }})
        .catch(() => {{}});
    }}
    refresh();
    setInterval(refresh, 2000);
  </script>
</body>
</html>"""
    return HTMLResponse(content=html)
