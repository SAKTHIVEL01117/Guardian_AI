import sys
import json
import base64
import io
import numpy as np
import cv2
from PIL import Image

def main():
    try:
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input payload received"}))
            return

        payload = json.loads(input_data)
        b64_str = payload.get("image_base64", "")
        if not b64_str:
            print(json.dumps({"error": "image_base64 is empty"}))
            return

        if "," in b64_str:
            b64_str = b64_str.split(",")[1]

        img_bytes = base64.b64decode(b64_str)
        img_pil = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        img_np = np.array(img_pil)
        img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

        import insightface
        from insightface.app import FaceAnalysis

        app = FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
        app.prepare(ctx_id=0, det_size=(640, 640))

        faces = app.get(img_bgr)
        if len(faces) == 0:
            print(json.dumps({"error": "No face detected in registration image."}))
            return

        face = faces[0]
        embedding = face.embedding
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm

        embedding_list = [float(v) for v in embedding]

        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        brightness = float(np.mean(gray))
        blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())

        result = {
            "success": True,
            "embedding": embedding_list,
            "embedding_dim": len(embedding_list),
            "det_score": float(face.det_score),
            "quality": {
                "brightness": round(brightness, 2),
                "blur_score": round(blur_score, 2),
                "is_lighting_good": 40 <= brightness <= 235,
                "is_sharp": blur_score >= 20.0
            }
        }
        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
