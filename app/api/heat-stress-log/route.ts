import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { worker_id, session_id, heat_assessment, ambient_temp_c, humidity_percent } = body;

    if (!worker_id || !heat_assessment) {
      return NextResponse.json(
        { error: "worker_id and heat_assessment metrics object are required." },
        { status: 400 }
      );
    }

    const { error } = await insforge
      .database
      .from("heat_events")
      .insert([
        {
          worker_id,
          session_id: session_id || null,
          heat_status: heat_assessment.heat_status || "Optimal",
          risk_level: heat_assessment.risk_level || "Low",
          ambient_temp_c: ambient_temp_c || 31.5,
          humidity: humidity_percent || 62.0,
          estimated_core_temp_f: heat_assessment.estimated_core_temp_f || 98.6,
          wbgt_index: heat_assessment.wbgt_index || 26.5,
          hydration_reminder: heat_assessment.hydration_reminder || "Maintain regular hydration.",
          recommended_rest_mins: heat_assessment.recommended_rest_mins || 5,
          source: heat_assessment.source || "Estimation Engine (Multi-Signal)",
        },
      ]);

    if (error) {
      console.warn("Database heat log insert warning:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in heat-stress-log route handler:", error);
    return NextResponse.json(
      { error: error.message || "Failed to record heat stress event." },
      { status: 500 }
    );
  }
}
