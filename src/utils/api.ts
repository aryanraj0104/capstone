const API_BASE = "https://hyperbranchial-noncommendatory-leann.ngrok-free.dev";

/** Headers so ngrok free tier doesn't show warning page and block API calls (e.g. from Vercel). */
const NGROK_HEADERS: HeadersInit = {
  "ngrok-skip-browser-warning": "true",
};

export interface RecognizeResponse {
  status: "recognized" | "unknown" | "error";
  person: string | null;
}

export async function recognizeFace(image: Blob): Promise<RecognizeResponse> {
  const form = new FormData();
  form.append("file", image, "capture.jpg");
  const res = await fetch(`${API_BASE}/recognize`, {
    method: "POST",
    headers: NGROK_HEADERS,
    body: form,
  });
  return res.json();
}

export interface MarkAttendanceResponse {
  status: string;
  message?: string;
}

export async function markAttendance(
  roll: string,
  session: string
): Promise<MarkAttendanceResponse> {
  const res = await fetch(`${API_BASE}/mark-attendance`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...NGROK_HEADERS,
    },
    body: JSON.stringify({ roll, session }),
  });
  return res.json();
}
