export type UserRole = "admin" | "supervisor" | "worker";

export type WorkerStatus = "active" | "inactive" | "monitoring" | "offline";

export type FatigueLevel = "normal" | "moderate" | "high" | "critical";

export type AlertType = "fatigue" | "unknown_worker" | "camera_error" | "system_warning";

export type AlertSeverity = "low" | "medium" | "high" | "critical";

export type AlertStatus = "new" | "acknowledged" | "resolved";

export interface UserProfile {
  id: string;
  user_id?: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkerRecord {
  id: string;
  profile_id?: string;
  employee_id: string;
  full_name: string;
  department: string;
  designation?: string;
  shift: string;
  profile_image_url?: string;
  face_embedding?: any;
  status: WorkerStatus;
  created_at?: string;
  updated_at?: string;
}

export interface MonitoringSession {
  id: string;
  worker_id: string;
  start_time: string;
  end_time?: string;
  camera_source?: string;
  status: "active" | "completed" | "cancelled";
  created_at?: string;
}

export interface FatigueRecord {
  id: string;
  worker_id: string;
  session_id?: string;
  fatigue_score: number;
  fatigue_level: FatigueLevel;
  eye_status?: string;
  posture_status?: string;
  yawn_detected?: boolean;
  recommendation?: string;
  created_at?: string;
}

export interface AlertRecord {
  id: string;
  worker_id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  message: string;
  status: AlertStatus;
  created_at?: string;
}
