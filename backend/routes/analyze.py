from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import base64
import os
import tempfile
import numpy as np

try:
    import cv2
    _CV2_AVAILABLE = True
except ImportError:
    _CV2_AVAILABLE = False

from model import get_cnn_score
from fusion import run_heuristics, fuse
from rppg import estimate_rppg_signal

router = APIRouter()


def _opencv_face_check(image_bytes: bytes) -> tuple[bool, str]:
    """Quick face validation. Returns (is_valid, reason)."""
    if not _CV2_AVAILABLE:
        return True, "OpenCV not available — validation skipped."
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return False, "File could not be decoded as an image."

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )
        faces = face_cascade.detectMultiScale(gray, 1.1, 5, minSize=(30, 30))
        edges = cv2.Canny(gray, 100, 200)
        edge_density = float(np.sum(edges > 0)) / (gray.shape[0] * gray.shape[1])

        if len(faces) == 0:
            return False, "No human face detected in the image."
        if len(faces) > 3:
            return False, "Multiple faces detected — Castellan requires a single-person portrait."
        if edge_density > 0.18:
            return False, "Image edge density is too high — may be a drawing or heavily filtered photo."

        return True, "Valid human face detected."
    except Exception as e:
        return True, f"Validation error — proceeding: {e}"


def _extract_middle_frame(video_path: str) -> bytes:
    if not _CV2_AVAILABLE:
        raise RuntimeError("OpenCV required for video frame extraction.")
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError("Failed to open video file.")
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    cap.set(cv2.CAP_PROP_POS_FRAMES, max(0, total // 2))
    ret, frame = cap.read()
    cap.release()
    if not ret:
        raise RuntimeError("Failed to read frame from video.")
    _, buf = cv2.imencode(".jpg", frame)
    return buf.tobytes()


# ─── /validate ────────────────────────────────────────────────────────────────

@router.post("/validate")
async def validate_media(file: UploadFile = File(...)):
    try:
        content = await file.read()
        is_valid, reason = _opencv_face_check(content)
        return JSONResponse(status_code=200, content={"isValid": is_valid, "reason": reason})
    except Exception as e:
        return JSONResponse(status_code=500, content={"isValid": True, "reason": str(e)})


# ─── /analyze ─────────────────────────────────────────────────────────────────

@router.post("/analyze")
async def analyze_media(file: UploadFile = File(...)):
    try:
        content = await file.read()
        is_video = (file.content_type or "").startswith("video")

        image_bytes = content
        rppg_result = None
        temp_video_path = None

        if is_video:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
                tmp.write(content)
                temp_video_path = tmp.name
            try:
                image_bytes = _extract_middle_frame(temp_video_path)
                rppg_result = estimate_rppg_signal(temp_video_path)
            finally:
                if temp_video_path and os.path.exists(temp_video_path):
                    os.remove(temp_video_path)

        # 1. CNN Score
        cnn_score, cnn_msg = get_cnn_score(image_bytes)

        # 2. Heuristics
        heuristics = run_heuristics(image_bytes)

        # 3. Fuse
        verdict = fuse(cnn_score, heuristics, rppg_result)

        # 4. Encode representative image
        b64_image = base64.b64encode(image_bytes).decode("utf-8")

        return {
            "analyzed_image_b64": b64_image,
            "result": verdict["result"],
            "confidence": verdict["confidence"],
            "issues": verdict["issues"],
            "signals": verdict["signals"],
            "markers": verdict["markers"],
            "detailed_analysis_text": verdict["detailed_analysis_text"],
            "cnn_note": cnn_msg,
            "rppg": rppg_result,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
