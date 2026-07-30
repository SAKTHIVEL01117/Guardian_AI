"""
recognize_frame.py — Standalone CLI for face recognition + fatigue analysis.
Called by Next.js via spawnSync as a fallback when FastAPI is not available.

Usage: echo '{"image_base64": "...", "workers": [...]}' | python recognize_frame.py
"""
import sys
import os

# Ensure the project root is on sys.path so `lib.ai.*` imports work
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

import json
import base64
import io
import time
import numpy as np
import cv2
from PIL import Image


def decode_base64_image(b64_str: str) -> np.ndarray:
    if "," in b64_str:
        b64_str = b64_str.split(",")[1]
    img_bytes = base64.b64decode(b64_str)
    img_pil = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    return cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)


def main():
    try:
        input_data = sys.stdin.read().strip()
        if not input_data:
            print(json.dumps({
                "face_detected": False, "recognized": False,
                "status": "Waiting for worker...", "error": "No input payload"
            }))
            return

        payload = json.loads(input_data)
        b64_str = payload.get("image_base64", "")
        workers_data = payload.get("workers", [])

        if not b64_str:
            print(json.dumps({
                "face_detected": False, "recognized": False,
                "status": "Waiting for worker...", "error": "Empty image_base64"
            }))
            return

        img_bgr = decode_base64_image(b64_str)

        # Load InsightFace (buffalo_l – same model used for registration)
        from insightface.app import FaceAnalysis
        analyzer = FaceAnalysis(name="buffalo_l", providers=["CPUExecutionProvider"])
        analyzer.prepare(ctx_id=0, det_size=(640, 640))

        faces = analyzer.get(img_bgr)

        if len(faces) == 0:
            print(json.dumps({
                "face_detected": False, "recognized": False,
                "status": "Waiting for worker...",
                "worker": None, "confidence_score": 0.0, "confidence_text": "0.0%"
            }))
            return

        # Pick highest-confidence face
        faces = sorted(faces, key=lambda f: f.det_score, reverse=True)
        face = faces[0]
        det_score = float(face.det_score)
        bbox = [float(x) for x in face.bbox]

        # L2-normalise frame embedding
        frame_emb = face.embedding.astype(np.float32)
        norm = np.linalg.norm(frame_emb)
        if norm > 0:
            frame_emb = frame_emb / norm

        # Match against registered workers
        best_worker = None
        max_similarity = -1.0

        for w_item in workers_data:
            emb_raw = w_item.get("face_embedding")
            if not emb_raw:
                continue
            if isinstance(emb_raw, str):
                try:
                    emb_raw = json.loads(emb_raw)
                except Exception:
                    continue
            if not isinstance(emb_raw, list) or len(emb_raw) == 0:
                continue

            target_emb = np.array(emb_raw, dtype=np.float32)
            t_norm = np.linalg.norm(target_emb)
            if t_norm > 0:
                target_emb = target_emb / t_norm

            sim = float(np.dot(frame_emb, target_emb))
            if sim > max_similarity:
                max_similarity = sim
                best_worker = w_item

        RECOGNITION_THRESHOLD = 0.45

        # Fatigue + behaviour analysis using persistent trackers
        from lib.ai.fatigue_engine import get_worker_tracker
        from lib.ai.behaviour_engine import get_worker_behaviour_tracker

        tracker_id = (
            best_worker.get("id", "temp_session")
            if best_worker and max_similarity >= RECOGNITION_THRESHOLD
            else "temp_session"
        )

        tracker = get_worker_tracker(tracker_id)
        fatigue_metrics = tracker.process_frame_landmarks(img_bgr, face)

        beh_tracker = get_worker_behaviour_tracker(tracker_id)
        behaviour_metrics = beh_tracker.update(
            face_detected=True,
            fatigue_data=fatigue_metrics
        )

        if best_worker and max_similarity >= RECOGNITION_THRESHOLD:
            conf_pct = round(max_similarity * 100, 1)
            result = {
                "face_detected": True,
                "recognized": True,
                "status": "Active",
                "worker": {
                    "id": best_worker.get("id"),
                    "full_name": best_worker.get("full_name"),
                    "employee_id": best_worker.get("employee_id"),
                    "department": best_worker.get("department"),
                    "designation": best_worker.get("designation") or f"{best_worker.get('department')} Operator",
                    "shift": best_worker.get("shift"),
                    "profile_image_url": best_worker.get("profile_image_url"),
                },
                "confidence_score": conf_pct,
                "confidence_text": f"{conf_pct}%",
                "det_score": round(det_score, 3),
                "bbox": bbox,
                "fatigue": fatigue_metrics,
                "behaviour": behaviour_metrics,
            }
        else:
            conf_pct = round(max(0.0, max_similarity) * 100, 1) if max_similarity > -1.0 else 0.0
            result = {
                "face_detected": True,
                "recognized": False,
                "status": "Unknown Worker",
                "worker": None,
                "confidence_score": conf_pct,
                "confidence_text": f"{conf_pct}%",
                "det_score": round(det_score, 3),
                "bbox": bbox,
                "fatigue": fatigue_metrics,
                "behaviour": behaviour_metrics,
            }

        print(json.dumps(result))

    except Exception as e:
        import traceback
        print(json.dumps({
            "face_detected": False,
            "recognized": False,
            "status": "Waiting for worker...",
            "error": str(e),
            "traceback": traceback.format_exc()
        }))


if __name__ == "__main__":
    main()
