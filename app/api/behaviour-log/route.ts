import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { worker_id, session_id, behaviour } = body;

    if (!worker_id || !behaviour) {
      return NextResponse.json(
        { error: "worker_id and behaviour metrics object are required." },
        { status: 400 }
      );
    }

    const { error } = await insforge
      .database
      .from("behaviour_events")
      .insert([
        {
          worker_id,
          session_id: session_id || null,
          behaviour_state: behaviour.current_state || "Working",
          active_work_seconds: behaviour.active_working_time || 0,
          idle_seconds: behaviour.idle_time || 0,
          continuous_work_seconds: behaviour.continuous_work_duration || 0,
          break_seconds: behaviour.break_duration || 0,
          movement_frequency: behaviour.movement_frequency || 0,
          metrics: {
            activity_timeline: behaviour.activity_timeline || [],
            timestamp: new Date().toISOString(),
          },
        },
      ]);

    if (error) {
      console.warn("Database behaviour log insert warning:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in behaviour-log route handler:", error);
    return NextResponse.json(
      { error: error.message || "Failed to record worker behaviour event." },
      { status: 500 }
    );
  }
}
