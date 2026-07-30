import time
import math
import numpy as np
import cv2
from collections import deque

class FatigueTracker:
    def __init__(self, history_len: int = 60):
        self.history_len = history_len
        self.ear_history = deque(maxlen=history_len)
        self.mar_history = deque(maxlen=history_len)
        self.timestamps = deque(maxlen=history_len)
        
        self.blink_count = 0
        self.is_eye_closed = False
        self.eye_closed_start_time = None
        self.current_closure_duration = 0.0
        
        self.yawn_count = 0
        self.is_yawning = False
        self.yawn_start_time = None
        
        self.last_fatigue_score = 0.0
        self.start_session_time = time.time()

    def process_frame_landmarks(self, img_bgr: np.ndarray, face_data=None):
        now = time.time()
        self.timestamps.append(now)

        # Default values
        ear = 0.28
        mar = 0.15
        pitch = 0.0
        yaw = 0.0
        roll = 0.0
        neck_angle = 0.0
        shoulder_posture = "Aligned"
        posture_status = "Upright Normal"

        if face_data is not None:
            # 1. Extract 106 2D landmarks or Keypoints for EAR and MAR
            if hasattr(face_data, 'landmark_2d_106') and face_data.landmark_2d_106 is not None:
                lms = face_data.landmark_2d_106
                # Left Eye: 35, 36, 33, 37, 39, 42
                # Right Eye: 89, 90, 87, 91, 93, 96
                left_ear = self._calc_106_ear(lms, [35, 36, 33, 37, 39, 42])
                right_ear = self._calc_106_ear(lms, [89, 90, 87, 91, 93, 96])
                ear = float((left_ear + right_ear) / 2.0)
                
                # Mouth MAR: 52 (top), 61 (bottom), 58 (left), 71 (right)
                mar = self._calc_106_mar(lms, 52, 61, 58, 71)
            elif hasattr(face_data, 'kps') and face_data.kps is not None:
                kps = face_data.kps
                left_eye, right_eye, nose, mouth_left, mouth_right = kps[0], kps[1], kps[2], kps[3], kps[4]
                eye_dist = np.linalg.norm(left_eye - right_eye) + 1e-6
                mouth_width = np.linalg.norm(mouth_left - mouth_right) + 1e-6
                nose_mouth_dist = np.linalg.norm(nose - (mouth_left + mouth_right) / 2.0)
                
                ear = min(0.35, max(0.12, (eye_dist / 140.0)))
                mar = min(0.80, max(0.10, (nose_mouth_dist / mouth_width) * 0.45))

            # 2. Extract Head Pose angles (Pitch, Yaw, Roll)
            if hasattr(face_data, 'pose') and face_data.pose is not None:
                pitch, yaw, roll = [float(a) for a in face_data.pose]
            elif hasattr(face_data, 'kps') and face_data.kps is not None:
                kps = face_data.kps
                left_eye, right_eye, nose = kps[0], kps[1], kps[2]
                eye_center = (left_eye + right_eye) / 2.0
                dx = nose[0] - eye_center[0]
                eye_dist = np.linalg.norm(left_eye - right_eye) + 1e-6
                yaw = float((dx / eye_dist) * 45.0)
                dy = nose[1] - eye_center[1]
                pitch = float((dy / eye_dist) * 45.0 - 22.0)
                roll = float((right_eye[1] - left_eye[1]) / eye_dist * 30.0)

            # Neck angle & Shoulder posture from Head Pose
            neck_angle = float(max(0.0, pitch))
            if abs(roll) > 10.0:
                shoulder_posture = "Tilted Shoulders"
            
            if neck_angle > 18.0 or pitch > 20.0:
                posture_status = "Severe Slouching / Drooping Head"
            elif neck_angle > 10.0 or pitch > 12.0:
                posture_status = "Mild Neck Forward Lean"

        self.ear_history.append(ear)
        self.mar_history.append(mar)

        # 3. Eye Closure & Blink Counter Logic
        CLOSED_EAR_THRESHOLD = 0.21
        if ear < CLOSED_EAR_THRESHOLD:
            if not self.is_eye_closed:
                self.is_eye_closed = True
                self.eye_closed_start_time = now
            self.current_closure_duration = round(now - (self.eye_closed_start_time or now), 2)
        else:
            if self.is_eye_closed:
                closure_dur = now - (self.eye_closed_start_time or now)
                if 0.08 <= closure_dur <= 0.85:
                    self.blink_count += 1
                self.is_eye_closed = False
                self.eye_closed_start_time = None
            self.current_closure_duration = 0.0

        # 4. Yawn Counter Logic
        YAWN_MAR_THRESHOLD = 0.50
        if mar > YAWN_MAR_THRESHOLD:
            if not self.is_yawning:
                self.is_yawning = True
                self.yawn_start_time = now
        else:
            if self.is_yawning:
                yawn_dur = now - (self.yawn_start_time or now)
                if yawn_dur >= 0.9:
                    self.yawn_count += 1
                self.is_yawning = False
                self.yawn_start_time = None

        # 5. Compute PERCLOS (% of frames eye is closed in history)
        closed_count = sum(1 for e in self.ear_history if e < CLOSED_EAR_THRESHOLD)
        perclos = round((closed_count / len(self.ear_history)) * 100.0, 1) if len(self.ear_history) > 0 else 0.0

        # 6. Compute Blink Frequency (Blinks per Minute)
        elapsed_mins = max(0.2, (now - self.start_session_time) / 60.0)
        blink_frequency = round(self.blink_count / elapsed_mins, 1)

        # 7. Dynamic Fatigue Score Calculation (0 - 100)
        s_perclos = min(40.0, perclos * 1.3)
        s_closure = min(30.0, self.current_closure_duration * 15.0)
        s_yawn = min(25.0, self.yawn_count * 8.0)
        s_posture = 15.0 if "Slouching" in posture_status or "Drooping" in posture_status else (8.0 if "Forward" in posture_status else 0.0)
        s_blinks = 10.0 if (blink_frequency < 6.0 or blink_frequency > 32.0) else 0.0

        raw_score = s_perclos + s_closure + s_yawn + s_posture + s_blinks
        fatigue_score = int(round(min(100.0, max(0.0, raw_score))))
        self.last_fatigue_score = fatigue_score

        # 8. Fatigue Level & Recommendation Classification
        if fatigue_score >= 80:
            fatigue_level = "Critical"
            recommendation = "CRITICAL FATIGUE ALERT! Operator must stop work immediately and take a 20-minute rest break."
        elif fatigue_score >= 61:
            fatigue_level = "High Risk"
            recommendation = "High fatigue detected. Take a short 10-15 minute break, stretch, and drink water."
        elif fatigue_score >= 31:
            fatigue_level = "Moderate"
            recommendation = "Moderate fatigue accumulating. Adjust seating posture, stretch shoulders, and drink water."
        else:
            fatigue_level = "Normal"
            recommendation = "Operator alertness normal. Continue monitoring standard shift tasks."

        return {
            "ear": round(ear, 3),
            "mar": round(mar, 3),
            "perclos": perclos,
            "blink_count": self.blink_count,
            "blink_frequency": blink_frequency,
            "eye_closure_duration": self.current_closure_duration,
            "yawn_count": self.yawn_count,
            "head_pose": {
                "pitch": round(pitch, 1),
                "yaw": round(yaw, 1),
                "roll": round(roll, 1),
            },
            "neck_angle": round(neck_angle, 1),
            "shoulder_posture": shoulder_posture,
            "posture_status": posture_status,
            "fatigue_score": fatigue_score,
            "fatigue_level": fatigue_level,
            "recommendation": recommendation,
            "is_yawning": self.is_yawning,
            "is_eye_closed": self.is_eye_closed
        }

    def _calc_106_ear(self, lms, idxs):
        try:
            pts = [lms[i] for i in idxs]
            v1 = np.linalg.norm(pts[1] - pts[5])
            v2 = np.linalg.norm(pts[2] - pts[4])
            h = np.linalg.norm(pts[0] - pts[3])
            return float((v1 + v2) / (2.0 * h + 1e-6))
        except Exception:
            return 0.28

    def _calc_106_mar(self, lms, top_idx, bot_idx, left_idx, right_idx):
        try:
            v = np.linalg.norm(lms[top_idx] - lms[bot_idx])
            h = np.linalg.norm(lms[left_idx] - lms[right_idx])
            return float(v / (2.0 * h + 1e-6))
        except Exception:
            return 0.15

# Global worker fatigue trackers map
worker_trackers = {}

def get_worker_tracker(worker_id: str) -> FatigueTracker:
    if worker_id not in worker_trackers:
        worker_trackers[worker_id] = FatigueTracker()
    return worker_trackers[worker_id]
