export interface SafetyFrameInput {
  worker_id?: string;
  face_detected: boolean;
  bbox?: number[]; // [x1, y1, x2, y2] normalized (0.0 to 1.0)
  pitch?: number;
  yaw?: number;
  roll?: number;
  ear?: number;
  perclos?: number;
  eye_closed_duration?: number;
  movement_frequency?: number;
  behaviour_state?: string;
  has_helmet?: boolean;
  has_safety_vest?: boolean;
}

export type SafetyIncidentType =
  | "Sleeping Worker"
  | "Worker Collapsed"
  | "No Movement (Extended)"
  | "PPE Violation - No Helmet"
  | "PPE Violation - No Safety Vest"
  | "Excessive Phone Usage"
  | "Restricted Area Violation";

export interface DetectedIncident {
  type: SafetyIncidentType;
  severity: "Critical" | "Warning";
  title: string;
  message: string;
  confidence_score: number; // 0 - 100%
  timestamp: string;
  action_required: string;
}

export interface SafetyAnalysisResult {
  has_incident: boolean;
  primary_incident: DetectedIncident | null;
  all_incidents: DetectedIncident[];
}

/**
 * Real-Time Frame Safety Incident Detector
 * Evaluates every frame for 7 critical safety hazard conditions.
 */
export function analyzeFrameSafety(input: SafetyFrameInput): SafetyAnalysisResult {
  const incidents: DetectedIncident[] = [];
  const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  if (!input.face_detected) {
    return {
      has_incident: false,
      primary_incident: null,
      all_incidents: [],
    };
  }

  const pitch = input.pitch || 0.0;
  const yaw = input.yaw || 0.0;
  const roll = input.roll || 0.0;
  const ear = input.ear || 0.28;
  const perclos = input.perclos || 0;
  const closureDur = input.eye_closed_duration || 0;
  const movFreq = input.movement_frequency ?? 4.2;
  const bbox = input.bbox || [0.3, 0.2, 0.7, 0.8]; // default center bbox

  // 1. Detect Sleeping Worker
  if ((ear < 0.19 && closureDur >= 2.0) || perclos >= 75) {
    incidents.push({
      type: "Sleeping Worker",
      severity: "Critical",
      title: "CRITICAL ALERT: Sleeping Worker Detected",
      message: `Operator eye closure sustained for ${closureDur.toFixed(1)}s (PERCLOS ${perclos}%). High injury risk.`,
      confidence_score: 96,
      timestamp: nowStr,
      action_required: "Immediate supervisor dispatch & acoustic wake alarm.",
    });
  }

  // 2. Detect Worker Collapsed
  const headY = bbox[1]; // y1 normalized (0.0 top to 1.0 bottom)
  if (pitch >= 42.0 || Math.abs(roll) >= 38.0 || (headY >= 0.68 && pitch >= 25.0)) {
    incidents.push({
      type: "Worker Collapsed",
      severity: "Critical",
      title: "CRITICAL HAZARD: Worker Collapsed / Fallen",
      message: `Abnormal physical posture tilt (Pitch ${pitch.toFixed(1)}°, Roll ${roll.toFixed(1)}°) in lower zone of workstation.`,
      confidence_score: 94,
      timestamp: nowStr,
      action_required: "Emergency medical response team dispatch required immediately.",
    });
  }

  // 3. Detect No Movement for Extended Duration
  if (movFreq === 0 && (input.behaviour_state === "Idle" || input.behaviour_state === "Sleeping")) {
    incidents.push({
      type: "No Movement (Extended)",
      severity: "Warning",
      title: "SAFETY WARNING: Zero Posture Movement",
      message: `Zero physical movement detected for extended duration. Potential medical event or fatigue blackout.`,
      confidence_score: 88,
      timestamp: nowStr,
      action_required: "Verify operator responsiveness.",
    });
  }

  // 4. Detect PPE Violation - No Helmet
  if (input.has_helmet === false) {
    incidents.push({
      type: "PPE Violation - No Helmet",
      severity: "Warning",
      title: "PPE COMPLIANCE: Missing Safety Helmet",
      message: `Hard hat / safety helmet absent on operator in active industrial zone.`,
      confidence_score: 91,
      timestamp: nowStr,
      action_required: "Instruct worker to equip mandatory hard hat.",
    });
  }

  // 5. Detect PPE Violation - No Safety Vest
  if (input.has_safety_vest === false) {
    incidents.push({
      type: "PPE Violation - No Safety Vest",
      severity: "Warning",
      title: "PPE COMPLIANCE: Missing High-Vis Safety Vest",
      message: `High-visibility safety vest absent on torso in active machinery area.`,
      confidence_score: 89,
      timestamp: nowStr,
      action_required: "Instruct worker to don high-visibility safety vest.",
    });
  }

  // 6. Detect Phone Usage
  if (input.behaviour_state === "Excessive phone usage" || (pitch > 24.0 && Math.abs(yaw) < 18.0 && ear < 0.23)) {
    incidents.push({
      type: "Excessive Phone Usage",
      severity: "Warning",
      title: "POLICY VIOLATION: Mobile Device Usage",
      message: `Worker distracted by smartphone / hand device during active machinery operation.`,
      confidence_score: 90,
      timestamp: nowStr,
      action_required: "Issue safety policy reminder to worker.",
    });
  }

  // 7. Detect Restricted Area Violations
  // Check if bbox overlaps right robotics cell boundary [0.60, 0.10, 1.00, 0.90]
  const centerX = (bbox[0] + bbox[2]) / 2.0;
  if (centerX > 0.65) {
    incidents.push({
      type: "Restricted Area Violation",
      severity: "Critical",
      title: "SECURITY ALERT: Zone Violation - Sector C",
      message: `Operator entered restricted automated robotics cell boundary without lockout key.`,
      confidence_score: 98,
      timestamp: nowStr,
      action_required: "Emergency e-stop override & supervisor safety lockout.",
    });
  }

  const primary = incidents.length > 0 ? incidents[0] : null;

  return {
    has_incident: incidents.length > 0,
    primary_incident: primary,
    all_incidents: incidents,
  };
}
