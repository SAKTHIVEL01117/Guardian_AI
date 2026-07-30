import { insforge } from "@/lib/insforge";
import { calculatePredictiveAnalytics, PredictiveReport } from "@/lib/ai/predictive_engine";

export interface BehaviourHistoryItem {
  id: string;
  timestamp: string;
  state: string;
  activeWorkMins: number;
  idleMins: number;
  continuousStreakMins: number;
  movementFreq: number;
}

export interface ShiftMetrics {
  shiftStart: string;
  shiftEnd: string;
  totalActiveWorkMins: number;
  totalBreakMins: number;
  avgFatigueScore: number;
  avgProductivityScore: number;
  behaviourSummaryState: string;
  incidentCount: number;
  attendanceStatus: string;
}

export interface WorkerProfileData {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  department: string;
  shift: string;
  status: string;
  avatar: string;
  station: string;
  joinedDate: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  certifications: string[];
  healthScore: number;
  heartRate: number;
  stepCount: number;
  coreTemp: number;
  attendanceRate: number;
  onTimeRate: number;
  weeklyFatigueTrend: number[];
  recommendations: { title: string; text: string }[];
  behaviourStats: {
    activeWorkHours: number;
    idleHours: number;
    continuousStreakMins: number;
    breakDurationMins: number;
    avgMovementFreq: number;
    historyTimeline: BehaviourHistoryItem[];
  };
  shiftMetrics: ShiftMetrics;
  predictiveReport: PredictiveReport;
}

export async function fetchWorkerProfile(workerId: string): Promise<WorkerProfileData | null> {
  try {
    // 1. Query Worker from InsForge Database by ID or Employee ID
    const { data: worker, error } = await insforge
      .database
      .from("workers")
      .select("*")
      .or(`id.eq.${workerId},employee_id.eq.${workerId}`)
      .single();

    let targetWorker = worker;

    if (error || !targetWorker) {
      console.warn("Worker not found by ID, attempting fallback by first worker:", error);
      const { data: firstWorker } = await insforge
        .database
        .from("workers")
        .select("*")
        .limit(1);

      if (!firstWorker || firstWorker.length === 0) {
        return null;
      }
      targetWorker = firstWorker[0];
    }

    // 2. Fetch behaviour events for this worker
    let behaviourLogs: any[] = [];
    try {
      const { data: behEvents } = await insforge
        .database
        .from("behaviour_events")
        .select("*")
        .eq("worker_id", targetWorker.id)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (behEvents) {
        behaviourLogs = behEvents;
      }
    } catch (bErr) {
      console.warn("Error fetching worker behaviour logs:", bErr);
    }

    // 3. Fetch monitoring sessions for shift start / end
    let sessionData: any = null;
    try {
      const { data: sessions } = await insforge
        .database
        .from("monitoring_sessions")
        .select("*")
        .eq("worker_id", targetWorker.id)
        .order("start_time", { ascending: false })
        .limit(1);
      
      if (sessions && sessions.length > 0) {
        sessionData = sessions[0];
      }
    } catch (sErr) {
      console.warn("Error fetching monitoring sessions:", sErr);
    }

    // 4. Fetch fatigue records for average fatigue calculation
    let fatigueScores: number[] = [];
    try {
      const { data: fatigueRecs } = await insforge
        .database
        .from("fatigue_records")
        .select("fatigue_score")
        .eq("worker_id", targetWorker.id);
      
      if (fatigueRecs && fatigueRecs.length > 0) {
        fatigueScores = fatigueRecs.map(f => Number(f.fatigue_score) || 0);
      }
    } catch (fErr) {
      console.warn("Error fetching fatigue records:", fErr);
    }

    // 5. Fetch alerts count for safety incident tracking
    let incidentCount = 0;
    try {
      const { data: alertsData } = await insforge
        .database
        .from("alerts")
        .select("id")
        .eq("worker_id", targetWorker.id);
      
      if (alertsData) {
        incidentCount = alertsData.length;
      }
    } catch (aErr) {
      console.warn("Error fetching worker alerts:", aErr);
    }

    return mapWorkerToProfile(targetWorker, behaviourLogs, sessionData, fatigueScores, incidentCount);
  } catch (err) {
    console.error("fetchWorkerProfile exception:", err);
    return null;
  }
}

function mapWorkerToProfile(
  w: any,
  behLogs: any[] = [],
  sessionData: any = null,
  fatigueScores: number[] = [],
  incidentCount: number = 0
): WorkerProfileData {
  const avatarUrl =
    w.profile_image_url ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";

  let activeWorkSecs = 14800; // default 4.1 hrs
  let idleSecs = 1800;      // default 0.5 hrs
  let continuousStreakSecs = 2700; // default 45 mins
  let breakSecs = 1200;      // default 20 mins
  let avgMovementFreq = 4.2;

  const historyTimeline: BehaviourHistoryItem[] = [];

  if (behLogs && behLogs.length > 0) {
    activeWorkSecs = behLogs[0].active_work_seconds || activeWorkSecs;
    idleSecs = behLogs[0].idle_seconds || idleSecs;
    continuousStreakSecs = behLogs[0].continuous_work_seconds || continuousStreakSecs;
    breakSecs = behLogs[0].break_seconds || breakSecs;
    avgMovementFreq = behLogs[0].movement_frequency || avgMovementFreq;

    behLogs.forEach((item, idx) => {
      const timeStr = item.created_at
        ? new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : `10:${15 + idx * 5} AM`;

      historyTimeline.push({
        id: item.id || `beh-${idx}`,
        timestamp: timeStr,
        state: item.behaviour_state || "Working",
        activeWorkMins: Math.round((item.active_work_seconds || 0) / 60),
        idleMins: Math.round((item.idle_seconds || 0) / 60),
        continuousStreakMins: Math.round((item.continuous_work_seconds || 0) / 60),
        movementFreq: item.movement_frequency || 4.2,
      });
    });
  } else {
    // Default mock behavior history
    historyTimeline.push(
      { id: "bh-1", timestamp: "09:30 AM", state: "Focused", activeWorkMins: 45, idleMins: 2, continuousStreakMins: 45, movementFreq: 4.5 },
      { id: "bh-2", timestamp: "10:15 AM", state: "Working", activeWorkMins: 85, idleMins: 5, continuousStreakMins: 40, movementFreq: 4.1 },
      { id: "bh-3", timestamp: "11:00 AM", state: "Idle", activeWorkMins: 110, idleMins: 15, continuousStreakMins: 0, movementFreq: 1.2 },
      { id: "bh-4", timestamp: "11:45 AM", state: "Working", activeWorkMins: 150, idleMins: 18, continuousStreakMins: 35, movementFreq: 4.8 }
    );
  }

  // Compute shift tracking telemetry metrics
  let avgFatigue = 18.5;
  if (fatigueScores.length > 0) {
    const sum = fatigueScores.reduce((a, b) => a + b, 0);
    avgFatigue = Math.round((sum / fatigueScores.length) * 10) / 10;
  }

  let shiftStart = "08:00 AM";
  let shiftEnd = "Active / In Progress";
  if (sessionData && sessionData.start_time) {
    shiftStart = new Date(sessionData.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (sessionData.end_time) {
      shiftEnd = new Date(sessionData.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
  }

  const totalActiveMins = Math.round(activeWorkSecs / 60);
  const totalBreakMins = Math.round(breakSecs / 60);

  const avgProductivityScore = Math.min(
    100,
    Math.max(40, Math.round(94.0 - avgFatigue * 0.3 - (idleSecs / 3600) * 5 + (totalActiveMins > 120 ? 4 : 0)))
  );

  const primaryBehaviour = behLogs.length > 0 ? (behLogs[0].behaviour_state || "Working") : "Working";

  return {
    id: w.id || "SAFE-7742",
    employeeId: w.employee_id || "#ID-77421",
    name: w.full_name || "Elias Thorne",
    role: w.designation || `${w.department || "Production"} Specialist`,
    department: w.department || "Maintenance",
    shift: w.shift || "Morning (06:00 - 14:00)",
    status: w.status || "Active",
    avatar: avatarUrl,
    station: `${w.department || "Assembly"} Station A-09`,
    joinedDate: "March 2022",
    emergencyContactName: "Sarah Thorne (Spouse)",
    emergencyContactPhone: "+1 (555) 012-9934",
    certifications: ["OSHA-30", "LOTO-Certified", "Adv. Robotics"],
    healthScore: 88,
    heartRate: 72,
    stepCount: 8421,
    coreTemp: 98.4,
    attendanceRate: 98.4,
    onTimeRate: 100,
    weeklyFatigueTrend: [12, 18, 15, 22, 14, 10, 12],
    recommendations: [
      {
        title: "Lighting Adjustment",
        text: "Increase workstation B-4 lighting by 20% to reduce eye strain.",
      },
      {
        title: "Ergonomic Alert",
        text: "Suggest ergonomic standing mat for prolonged assembly task.",
      },
    ],
    behaviourStats: {
      activeWorkHours: Math.round((activeWorkSecs / 3600) * 10) / 10,
      idleHours: Math.round((idleSecs / 3600) * 10) / 10,
      continuousStreakMins: Math.round(continuousStreakSecs / 60),
      breakDurationMins: Math.round(breakSecs / 60),
      avgMovementFreq: Math.round(avgMovementFreq * 10) / 10,
      historyTimeline,
    },
    shiftMetrics: {
      shiftStart,
      shiftEnd,
      totalActiveWorkMins: totalActiveMins,
      totalBreakMins: totalBreakMins,
      avgFatigueScore: avgFatigue,
      avgProductivityScore,
      behaviourSummaryState: primaryBehaviour,
      incidentCount,
      attendanceStatus: w.status === "Active" ? "Present (Shift Alpha)" : "On Leave / Inactive",
    },
    predictiveReport: calculatePredictiveAnalytics({
      worker_id: w.id,
      current_fatigue_score: avgFatigue,
      continuous_work_mins: Math.round(continuousStreakSecs / 60),
      idle_mins: Math.round(idleSecs / 60),
      incident_count: incidentCount,
      ambient_temp_c: 31.5,
      wbgt_index: 26.5,
    }),
  };
}

