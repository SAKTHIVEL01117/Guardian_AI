import cv2
import numpy as np
import insightface
from insightface.app import FaceAnalysis

print("Initializing InsightFace with buffalo_l model...")
app = FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
app.prepare(ctx_id=0, det_size=(640, 640))
print("InsightFace buffalo_l initialized successfully!")

# Create a synthetic image to verify face detection / embedding pipeline
test_img = np.zeros((480, 640, 3), dtype=np.uint8)
faces = app.get(test_img)
print(f"Face detection run complete. Detected faces: {len(faces)}")
