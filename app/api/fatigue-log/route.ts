import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { worker_id, fatigue } = body;

    if (!worker_id || !fatigue) {
      return NextResponse.json({ success: false, error: "worker_id and fatigue payload required" }, { status: 400 });
    }

    // 1. Retrieve or create active monitoring_session for worker
    let sessionId: string | null = null;

    try {
      const { data: activeSessions } = await insforge
        .database
        .from("monitoring_sessions")
        .select("id, avg_fatigue_score, max_fatigue_score")
        .eq("worker_id", worker_id)
        .eq("status", "active")
        .limit(1);

      if (activeSessions && activeSessions.length > 0) {
        sessionId = activeSessions[0].id;
        const currentMax = Number(activeSessions[0].max_fatigue_score || 0);
        const newMax = Math.max(currentMax, fatigue.fatigue_score || 0);

        // Update active session max score
        await insforge
          .database
          .from("monitoring_sessions")
          .update({
            avg_fatigue_score: fatigue.fatigue_score,
            max_fatigue_score: newMax
          })
          .eq("id", sessionId);
      } else {
        // Create new active session
        const { data: newSession } = await insforge
          .database
          .from("monitoring_sessions")
          .insert([
            {
              worker_id,
              camera_source: "Webcam",
              status: "active",
              avg_fatigue_score: fatigue.fatigue_score || 0,
              max_fatigue_score: fatigue.fatigue_score || 0,
            },
          ])
          .select("id");

        if (newSession && newSession.length > 0) {
          sessionId = newSession[0].id;
        }
      }
    } catch (sessionErr) {
      console.warn("Monitoring session query/create warning:", sessionErr);
    }

    // 2. Insert record into fatigue_records table
    const eyeStatusText = `EAR: ${fatigue.ear || 0.28}, PERCLOS: ${fatigue.perclos || 0}%, Blinks: ${fatigue.blink_frequency || 0}/min, Closure: ${fatigue.eye_closure_duration || 0}s`;
    const postureStatusText = `Pitch: ${fatigue.head_pose?.pitch || 0}°, Yaw: ${fatigue.head_pose?.yaw || 0}°, Neck: ${fatigue.neck_angle || 0}°, Posture: ${fatigue.posture_status || 'Upright'}`;

    try {
      await insforge
        .database
        .from("fatigue_records")
        .insert([
          {
            worker_id,
            session_id: sessionId,
            fatigue_score: fatigue.fatigue_score || 0,
            fatigue_level: fatigue.fatigue_level || "Normal",
            eye_status: eyeStatusText,
            posture_status: postureStatusText,
            yawn_detected: Boolean(fatigue.yawn_count > 0 || fatigue.is_yawning),
            recommendation: fatigue.recommendation || "Normal monitoring.",
          },
        ]);
    } catch (recordErr) {
      console.warn("Fatigue record insert warning:", recordErr);
    }

    // 3. Create Alert if fatigue level exceeds High Risk (>60%) or Critical (>80%)
    if ((fatigue.fatigue_score || 0) >= 60) {
      const isCritical = (fatigue.fatigue_score || 0) >= 80;
      try {
        await insforge
          .database
          .from("alerts")
          .insert([
            {
              worker_id,
              alert_type: isCritical ? "Critical Fatigue Alert" : "High Fatigue Risk Alert",
              severity: isCritical ? "Critical" : "Warning",
              message: `Operator fatigue level reached ${fatigue.fatigue_score}% (${fatigue.fatigue_level}). ${fatigue.recommendation}`,
              status: "New",
            },
          ]);
      } catch (alertErr) {
        console.warn("Fatigue alert log warning:", alertErr);
      }
    }

    return NextResponse.json({
      success: true,
      session_id: sessionId,
      fatigue_score: fatigue.fatigue_score,
      fatigue_level: fatigue.fatigue_level,
    });
  } catch (error: any) {
    console.error("Fatigue log route error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to log fatigue record." }, { status: 500 });
  }
}
