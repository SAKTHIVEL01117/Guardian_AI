import { insforge } from "@/lib/insforge";

export interface TimelineEventItem {
  id: string;
  timestamp: string;
  title: string;
  statusText: string;
  severity: "normal" | "inactive" | "warning" | "critical";
}

/**
 * Fetch live monitoring timeline events from InsForge database
 */
export async function fetchMonitoringTimeline(): Promise<TimelineEventItem[]> {
  try {
    const { data, error } = await insforge
      .database
      .from("alerts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Monitoring timeline query warning:", error);
    }

    if (data && data.length > 0) {
      return data.slice(0, 6).map((a) => {
        const time = a.created_at
          ? new Date(a.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : "12:00:00";

        let severity: "normal" | "inactive" | "warning" | "critical" = "normal";
        if (a.severity === "Critical") severity = "critical";
        else if (a.severity === "Advisory") severity = "warning";
        else if (a.status === "Resolved") severity = "normal";

        return {
          id: a.id,
          timestamp: time,
          title: a.alert_type || "Monitoring Event",
          statusText: `SEVERITY: ${(a.severity || "INFO").toUpperCase()}`,
          severity,
        };
      });
    }

    // Default timeline events if empty
    return [
      {
        id: "t1",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        title: "Camera Feed Connected (Laptop Webcam)",
        statusText: "STATUS: ONLINE",
        severity: "normal",
      },
      {
        id: "t2",
        timestamp: "10:42:01",
        title: "Shift Commenced",
        statusText: "STATUS: NORMAL",
        severity: "normal",
      },
      {
        id: "t3",
        timestamp: "11:15:30",
        title: "Scheduled Break",
        statusText: "STATUS: INACTIVE",
        severity: "inactive",
      },
      {
        id: "t4",
        timestamp: "13:45:12",
        title: "Posture Analysis Init",
        statusText: "SEVERITY: WARNING",
        severity: "warning",
      },
    ];
  } catch (err) {
    console.error("fetchMonitoringTimeline exception:", err);
    return [];
  }
}

export interface ActivityTimelineLog {
  timestamp: string;
  state: string;
  duration_seconds: number;
  note?: string;
}

export interface WorkerBehaviourMetrics {
  current_state: "Working" | "Focused" | "Idle" | "Distracted" | "Sleeping" | "Left workstation" | "Excessive phone usage";
  active_working_time: number; // in seconds
  idle_time: number;          // in seconds
  continuous_work_duration: number; // in seconds
  break_duration: number;     // in seconds
  movement_frequency: number; // movements per min
  activity_timeline: ActivityTimelineLog[];
}

/**
 * Report safety incident alert to InsForge database
 */
export async function reportSafetyIncident(description: string): Promise<void> {
  const { error } = await insforge
    .database
    .from("alerts")
    .insert([
      {
        alert_type: "Supervisor Safety Intervention",
        severity: "Critical",
        message: description || "Supervisor safety incident reported from live monitoring center.",
        status: "New",
      },
    ]);

  if (error) {
    console.error("Failed to report incident to InsForge:", error);
    throw new Error(error.message || "Failed to log incident report in database.");
  }
}

/**
 * Log continuous worker behaviour metrics to InsForge PostgreSQL
 */
export async function logWorkerBehaviourEvent(
  workerId: string,
  metrics: WorkerBehaviourMetrics,
  sessionId?: string
): Promise<void> {
  try {
    const { error } = await insforge
      .database
      .from("behaviour_events")
      .insert([
        {
          worker_id: workerId,
          session_id: sessionId || null,
          behaviour_state: metrics.current_state,
          active_work_seconds: metrics.active_working_time,
          idle_seconds: metrics.idle_time,
          continuous_work_seconds: metrics.continuous_work_duration,
          break_seconds: metrics.break_duration,
          movement_frequency: metrics.movement_frequency,
          metrics: {
            activity_timeline: metrics.activity_timeline,
            timestamp: new Date().toISOString(),
          },
        },
      ]);

    if (error) {
      console.warn("Error inserting worker behaviour event:", error);
    }
  } catch (err) {
    console.warn("Exception in logWorkerBehaviourEvent:", err);
  }
}

/**
 * Log heat stress assessment event to InsForge PostgreSQL
 */
export async function logHeatStressEvent(
  workerId: string,
  heatAssessment: any,
  ambientTempC: number = 31.5,
  humidity: number = 62.0,
  sessionId?: string
): Promise<void> {
  try {
    const { error } = await insforge
      .database
      .from("heat_events")
      .insert([
        {
          worker_id: workerId,
          session_id: sessionId || null,
          heat_status: heatAssessment.heat_status || "Optimal",
          risk_level: heatAssessment.risk_level || "Low",
          ambient_temp_c: ambientTempC,
          humidity: humidity,
          estimated_core_temp_f: heatAssessment.estimated_core_temp_f || 98.6,
          wbgt_index: heatAssessment.wbgt_index || 26.5,
          hydration_reminder: heatAssessment.hydration_reminder || "Maintain regular hydration.",
          recommended_rest_mins: heatAssessment.recommended_rest_mins || 5,
          source: heatAssessment.source || "Estimation Engine (Multi-Signal)",
        },
      ]);

    if (error) {
      console.warn("Error inserting heat stress event:", error);
    }
  } catch (err) {
    console.warn("Exception in logHeatStressEvent:", err);
  }
}


