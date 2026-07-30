import time
import math
import numpy as np
from collections import deque
from typing import Dict, List, Any, Optional

class BehaviourTracker:
    def __init__(self, worker_id: str, history_len: int = 120):
        self.worker_id = worker_id
        self.history_len = history_len
        
        self.current_state = "Working"
        self.state_start_time = time.time()
        self.last_frame_time = time.time()
        
        # Cumulative duration trackers (seconds)
        self.active_working_time = 0
        self.idle_time = 0
        self.continuous_work_duration = 0
        self.break_duration = 0
        
        # Pose and movement tracking
        self.pose_history = deque(maxlen=history_len) # (timestamp, pitch, yaw, roll)
        self.movement_events = deque(maxlen=60)      # timestamps of pose shifts
        
        # State tracking helpers
        self.no_face_start_time: Optional[float] = None
        self.phone_usage_start_time: Optional[float] = None
        self.idle_start_time: Optional[float] = None
        
        # Activity Timeline History
        self.activity_timeline: List[Dict[str, Any]] = [
            {
                "timestamp": time.strftime("%H:%M:%S"),
                "state": "Working",
                "duration_seconds": 0,
                "note": "Initialised active monitoring session"
            }
        ]

    def update(self, face_detected: bool = True, fatigue_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        now = time.time()
        dt = max(0.1, min(2.0, now - self.last_frame_time))
        self.last_frame_time = now
        
        # 1. Evaluate Pose Angles & Movement Frequency
        pitch = 0.0
        yaw = 0.0
        roll = 0.0
        ear = 0.28
        fatigue_score = 0
        
        if fatigue_data:
            head_pose = fatigue_data.get("head_pose", {})
            pitch = head_pose.get("pitch", 0.0)
            yaw = head_pose.get("yaw", 0.0)
            roll = head_pose.get("roll", 0.0)
            ear = fatigue_data.get("ear", 0.28)
            fatigue_score = fatigue_data.get("fatigue_score", 0)

        # Detect movement / posture shift
        if face_detected and len(self.pose_history) > 0:
            last_p, last_y, last_r = self.pose_history[-1][1:]
            movement_delta = abs(pitch - last_p) + abs(yaw - last_y) + abs(roll - last_r)
            if movement_delta > 6.0:
                self.movement_events.append(now)

        if face_detected:
            self.pose_history.append((now, pitch, yaw, roll))
            self.no_face_start_time = None

        # Clean old movement events (>60s)
        while self.movement_events and now - self.movement_events[0] > 60:
            self.movement_events.popleft()
            
        movement_frequency = round(float(len(self.movement_events)), 1)

        # 2. Determine Continuous Behaviour State
        new_state = "Working"

        if not face_detected:
            if self.no_face_start_time is None:
                self.no_face_start_time = now
            away_duration = now - self.no_face_start_time
            if away_duration >= 3.0:
                new_state = "Left workstation"
            else:
                new_state = self.current_state
        else:
            # Check Sleeping
            eye_closed_dur = fatigue_data.get("eye_closure_duration", 0.0) if fatigue_data else 0.0
            if (ear < 0.19 and eye_closed_dur >= 1.8) or fatigue_score >= 80 or pitch > 32.0 and ear < 0.20:
                new_state = "Sleeping"
            # Check Excessive Phone Usage (head looking down > 24° for > 3.5s)
            elif pitch > 24.0 and abs(yaw) < 18.0:
                if self.phone_usage_start_time is None:
                    self.phone_usage_start_time = now
                if now - self.phone_usage_start_time >= 3.5:
                    new_state = "Excessive phone usage"
                else:
                    new_state = "Working"
            # Check Distracted (gaze / head turned away left or right)
            elif abs(yaw) > 22.0 or pitch < -25.0:
                self.phone_usage_start_time = None
                new_state = "Distracted"
            # Check Idle (very low posture change over extended time, pitch slightly forward)
            elif len(self.pose_history) >= 15 and movement_frequency <= 1.0 and 10.0 <= pitch <= 22.0:
                if self.idle_start_time is None:
                    self.idle_start_time = now
                if now - self.idle_start_time >= 10.0:
                    new_state = "Idle"
                else:
                    new_state = "Working"
            # Check Focused (straight head alignment, good EAR, steady posture)
            elif abs(pitch) <= 12.0 and abs(yaw) <= 12.0 and ear >= 0.24 and fatigue_score <= 35:
                self.phone_usage_start_time = None
                self.idle_start_time = None
                new_state = "Focused"
            else:
                self.phone_usage_start_time = None
                self.idle_start_time = None
                new_state = "Working"

        # 3. Accumulate Time & Manage Transitions
        if new_state != self.current_state:
            # Transition occurred
            duration_in_previous = int(round(now - self.state_start_time))
            if duration_in_previous > 0:
                self.activity_timeline.insert(0, {
                    "timestamp": time.strftime("%H:%M:%S"),
                    "state": self.current_state,
                    "duration_seconds": duration_in_previous,
                    "note": f"Shifted to {new_state}"
                })
                # Keep timeline capped at 25 items
                if len(self.activity_timeline) > 25:
                    self.activity_timeline.pop()
            
            self.current_state = new_state
            self.state_start_time = now

        # Increment timers based on state
        if self.current_state in ["Working", "Focused"]:
            self.active_working_time += int(dt)
            self.continuous_work_duration += int(dt)
        elif self.current_state == "Idle":
            self.idle_time += int(dt)
            self.break_duration += int(dt)
            # Reset continuous work streak if idle for > 30s
            if now - self.state_start_time > 30:
                self.continuous_work_duration = 0
        elif self.current_state in ["Left workstation", "Sleeping"]:
            self.break_duration += int(dt)
            self.continuous_work_duration = 0
        elif self.current_state in ["Distracted", "Excessive phone usage"]:
            # Pause or reset continuous streak
            if now - self.state_start_time > 15:
                self.continuous_work_duration = max(0, self.continuous_work_duration - int(dt))

        return {
            "current_state": self.current_state,
            "active_working_time": self.active_working_time,
            "idle_time": self.idle_time,
            "continuous_work_duration": self.continuous_work_duration,
            "break_duration": self.break_duration,
            "movement_frequency": movement_frequency,
            "activity_timeline": self.activity_timeline[:8]
        }

# Global worker behaviour trackers map
worker_behaviour_trackers: Dict[str, BehaviourTracker] = {}

def get_worker_behaviour_tracker(worker_id: str) -> BehaviourTracker:
    if worker_id not in worker_behaviour_trackers:
        worker_behaviour_trackers[worker_id] = BehaviourTracker(worker_id)
    return worker_behaviour_trackers[worker_id]
