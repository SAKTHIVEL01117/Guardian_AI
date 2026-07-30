import base64
import io
import math
import numpy as np
import cv2
from PIL import Image
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import insightface
from insightface.app import FaceAnalysis

app = FastAPI(title="Operator Guardian AI - Biometric Service", version="1.0.0")

# Enable CORS for Next.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global InsightFace Model Instance
face_analyzer = None

def get_face_analyzer():
    global face_analyzer
    if face_analyzer is None:
        print("Loading InsightFace buffalo_l model...")
        face_analyzer = FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
        face_analyzer.prepare(ctx_id=0, det_size=(640, 640))
        print("InsightFace buffalo_l model loaded successfully!")
    return face_analyzer


class ProcessEmbeddingRequest(BaseModel):
    image_base64: str
    additional_frames: Optional[List[str]] = None

class QualityCheckRequest(BaseModel):
    image_base64: str
    expected_pose: Optional[str] = "straight"

class WorkerBiometric(BaseModel):
    id: str
    employee_id: str
    full_name: str
    department: str
    designation: Optional[str] = None
    shift: str
    profile_image_url: Optional[str] = None
    face_embedding: Optional[List[float]] = None

class RecognizeFaceRequest(BaseModel):
    image_base64: str
    workers: List[WorkerBiometric]

def decode_base64_image(b64_str: str) -> np.ndarray:
    try:
        if "," in b64_str:
            b64_str = b64_str.split(",")[1]
        img_bytes = base64.b64decode(b64_str)
        img_pil = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        img_np = np.array(img_pil)
        # Convert RGB to BGR for OpenCV / InsightFace
        img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
        return img_bgr
    except Exception as e:
        raise ValueError(f"Failed to decode base64 image: {str(e)}")

def calculate_image_quality(img_bgr: np.ndarray):
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    brightness = float(np.mean(gray))
    blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    return {
        "brightness": round(brightness, 2),
        "blur_score": round(blur_score, 2),
        "is_lighting_good": 40 <= brightness <= 235,
        "is_sharp": blur_score >= 25.0
    }

@app.on_event("startup")
async def startup_event():
    try:
        get_face_analyzer()
    except Exception as e:
        print(f"Warning on startup model load: {e}")

@app.get("/health")
def health_check():
    return {"status": "ok", "model": "buffalo_l", "ready": face_analyzer is not None}

@app.post("/api/ai/quality-check")
def quality_check(req: QualityCheckRequest):
    try:
        img_bgr = decode_base64_image(req.image_base64)
        quality = calculate_image_quality(img_bgr)
        analyzer = get_face_analyzer()
        faces = analyzer.get(img_bgr)

        face_count = len(faces)
        if face_count == 0:
            return {
                "valid": False,
                "reason": "No face detected in camera frame",
                "face_count": 0,
                "quality": quality
            }
        elif face_count > 1:
            return {
                "valid": False,
                "reason": "Multiple faces detected. Please ensure only 1 worker is visible.",
                "face_count": face_count,
                "quality": quality
            }

        face = faces[0]
        det_score = float(face.det_score)
        bbox = [float(x) for x in face.bbox]

        # Pose angle estimation (pitch, yaw, roll)
        pose_angles = None
        if hasattr(face, 'pose') and face.pose is not None:
            pose_angles = [float(a) for a in face.pose]
        elif hasattr(face, 'kps') and face.kps is not None:
            kps = face.kps
            left_eye, right_eye, nose = kps[0], kps[1], kps[2]
            eye_center = (left_eye + right_eye) / 2.0
            dx = nose[0] - eye_center[0]
            eye_dist = np.linalg.norm(left_eye - right_eye)
            yaw_est = (dx / (eye_dist + 1e-6)) * 45.0
            dy = nose[1] - eye_center[1]
            pitch_est = (dy / (eye_dist + 1e-6)) * 45.0 - 20.0
            pose_angles = [pitch_est, yaw_est, 0.0]

        return {
            "valid": quality["is_lighting_good"] and quality["is_sharp"] and det_score > 0.4,
            "face_count": 1,
            "det_score": round(det_score, 3),
            "bbox": bbox,
            "pose_angles": pose_angles,
            "quality": quality
        }
    except Exception as e:
        return {"valid": False, "reason": str(e), "face_count": 0}

@app.post("/api/ai/face-embedding")
def generate_face_embedding(req: ProcessEmbeddingRequest):
    try:
        img_bgr = decode_base64_image(req.image_base64)
        analyzer = get_face_analyzer()
        faces = analyzer.get(img_bgr)

        if len(faces) == 0:
            raise HTTPException(status_code=400, detail="No face detected in the primary registration image.")
        if len(faces) > 1:
            raise HTTPException(status_code=400, detail="Multiple faces detected in image. Single worker required.")

        face = faces[0]
        embedding = face.embedding

        # Normalize embedding to unit length (L2 norm)
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm

        embedding_list = [float(v) for v in embedding]
        quality = calculate_image_quality(img_bgr)

        additional_embeddings = [embedding]
        if req.additional_frames:
            for extra_b64 in req.additional_frames:
                try:
                    extra_img = decode_base64_image(extra_b64)
                    extra_faces = analyzer.get(extra_img)
                    if len(extra_faces) == 1:
                        e_norm = extra_faces[0].embedding / (np.linalg.norm(extra_faces[0].embedding) + 1e-6)
                        additional_embeddings.append(e_norm)
                except Exception:
                    continue

        if len(additional_embeddings) > 1:
            avg_emb = np.mean(additional_embeddings, axis=0)
            avg_norm = np.linalg.norm(avg_emb)
            if avg_norm > 0:
                avg_emb = avg_emb / avg_norm
            embedding_list = [float(v) for v in avg_emb]

        return {
            "success": True,
            "embedding_dim": len(embedding_list),
            "embedding": embedding_list,
            "det_score": float(face.det_score),
            "quality": quality,
            "processed_frames_count": len(additional_embeddings)
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"InsightFace processing error: {str(e)}")

@app.post("/api/ai/recognize-face")
def recognize_face(req: RecognizeFaceRequest):
    try:
        img_bgr = decode_base64_image(req.image_base64)
        analyzer = get_face_analyzer()
        faces = analyzer.get(img_bgr)

        if len(faces) == 0:
            return {
                "face_detected": False,
                "recognized": False,
                "status": "Waiting for worker...",
                "worker": None,
                "confidence_score": 0.0,
                "confidence_text": "0.0%"
            }

        # Select face with highest detection score
        faces = sorted(faces, key=lambda f: f.det_score, reverse=True)
        face = faces[0]
        det_score = float(face.det_score)
        bbox = [float(x) for x in face.bbox]

        frame_emb = face.embedding
        norm = np.linalg.norm(frame_emb)
        if norm > 0:
            frame_emb = frame_emb / norm

        best_worker = None
        max_similarity = -1.0

        for w in req.workers:
            if not w.face_embedding or len(w.face_embedding) == 0:
                continue

            target_emb = np.array(w.face_embedding, dtype=np.float32)
            t_norm = np.linalg.norm(target_emb)
            if t_norm > 0:
                target_emb = target_emb / t_norm

            sim = float(np.dot(frame_emb, target_emb))
            if sim > max_similarity:
                max_similarity = sim
                best_worker = w

        # Threshold for positive recognition (50% cosine similarity)
        RECOGNITION_THRESHOLD = 0.50

        from lib.ai.fatigue_engine import get_worker_tracker
        from lib.ai.behaviour_engine import get_worker_behaviour_tracker
        tracker_id = best_worker.id if (best_worker and max_similarity >= RECOGNITION_THRESHOLD) else "temp_session"
        tracker = get_worker_tracker(tracker_id)
        fatigue_metrics = tracker.process_frame_landmarks(img_bgr, face)

        beh_tracker = get_worker_behaviour_tracker(tracker_id)
        behaviour_metrics = beh_tracker.update(face_detected=True, fatigue_data=fatigue_metrics)

        if best_worker and max_similarity >= RECOGNITION_THRESHOLD:
            conf_pct = round(max_similarity * 100, 1)
            return {
                "face_detected": True,
                "recognized": True,
                "status": "Active",
                "worker": {
                    "id": best_worker.id,
                    "full_name": best_worker.full_name,
                    "employee_id": best_worker.employee_id,
                    "department": best_worker.department,
                    "designation": best_worker.designation or f"{best_worker.department} Operator",
                    "shift": best_worker.shift,
                    "profile_image_url": best_worker.profile_image_url
                },
                "confidence_score": conf_pct,
                "confidence_text": f"{conf_pct}%",
                "det_score": round(det_score, 3),
                "bbox": bbox,
                "fatigue": fatigue_metrics,
                "behaviour": behaviour_metrics
            }
        else:
            conf_pct = round(max(0.0, max_similarity) * 100, 1)
            return {
                "face_detected": True,
                "recognized": False,
                "status": "Unknown Worker",
                "worker": None,
                "confidence_score": conf_pct,
                "confidence_text": f"{conf_pct}%",
                "det_score": round(det_score, 3),
                "bbox": bbox,
                "fatigue": fatigue_metrics,
                "behaviour": behaviour_metrics
            }

    except Exception as e:
        print(f"Recognize face exception: {e}")
        return {
            "face_detected": False,
            "recognized": False,
            "status": "Waiting for worker...",
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
