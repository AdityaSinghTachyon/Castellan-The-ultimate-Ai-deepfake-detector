"""
rppg.py — Simplified rPPG (remote photoplethysmography) signal estimation.
Extracts forehead region from video frames and tracks green-channel variation.
"""
import numpy as np

try:
    import cv2
    _CV2_AVAILABLE = True
except ImportError:
    _CV2_AVAILABLE = False


def estimate_rppg_signal(video_path: str, max_frames: int = 90) -> dict:
    """
    Returns a dict: { signal_strength: float, is_stable: bool, message: str }
    signal_strength: 0.0 (dead/fake) → 1.0 (strong natural signal)
    """
    if not _CV2_AVAILABLE:
        return {"signal_strength": 0.5, "is_stable": True, "message": "OpenCV unavailable — signal assumed normal."}

    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return {"signal_strength": 0.4, "is_stable": False, "message": "Failed to open video."}

        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )

        green_values = []
        frame_count = 0

        while frame_count < max_frames:
            ret, frame = cap.read()
            if not ret:
                break
            frame_count += 1

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, 1.1, 4, minSize=(60, 60))

            if len(faces) > 0:
                (fx, fy, fw, fh) = faces[0]
                # Extract forehead: top 25% of face bounding box
                forehead_y1 = fy
                forehead_y2 = fy + int(fh * 0.25)
                forehead = frame[forehead_y1:forehead_y2, fx:fx + fw]
                if forehead.size > 0:
                    green_mean = np.mean(forehead[:, :, 1])  # green channel
                    green_values.append(green_mean)

        cap.release()

        if len(green_values) < 5:
            return {"signal_strength": 0.35, "is_stable": False, "message": "Insufficient frames for rPPG analysis."}

        series = np.array(green_values)
        # Detrend & calculate variation
        detrended = series - np.mean(series)
        std = np.std(detrended)
        # Natural rPPG has moderate variation (0.5–3.0 std); too flat or too noisy = fake
        if std < 0.3:
            strength = 0.2  # too flat → likely AI
            msg = "Minimal green-channel variation — possible synthetic subject."
        elif std > 8.0:
            strength = 0.3  # too noisy → bad data
            msg = "High noise in forehead signal — inconclusive."
        else:
            # Normalize to 0.5–1.0 range (natural signal)
            strength = min(1.0, 0.5 + (std / 8.0) * 0.5)
            msg = f"rPPG signal variance: {std:.2f} — biologically plausible."

        is_stable = bool(0.4 < strength < 1.0)
        return {"signal_strength": float(round(strength, 3)), "is_stable": is_stable, "message": msg}
    except Exception as e:
        return {"signal_strength": 0.5, "is_stable": True, "message": f"rPPG estimation error: {e}"}

