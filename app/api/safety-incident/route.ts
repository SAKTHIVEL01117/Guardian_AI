import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { worker_id, incident, image_base64 } = body;

    if (!incident) {
      return NextResponse.json({ error: "Incident object is required." }, { status: 400 });
    }

    let screenshot_url: string | null = null;

    // 1. Upload screenshot frame to InsForge Storage if image_base64 provided
    if (image_base64 && typeof image_base64 === "string") {
      try {
        let cleanB64 = image_base64;
        if (cleanB64.includes(",")) {
          cleanB64 = cleanB64.split(",")[1];
        }

        const buffer = Buffer.from(cleanB64, "base64");
        const filename = `incidents/incident_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        const blob = new Blob([buffer], { type: "image/jpeg" });

        const { data: uploadData, error: uploadErr } = await insforge
          .storage
          .from("worker-images")
          .upload(filename, blob);

        if (!uploadErr && uploadData?.url) {
          screenshot_url = uploadData.url;
        } else {
          // Fallback data URI screenshot if storage upload fails or local dev
          screenshot_url = image_base64.startsWith("data:")
            ? image_base64
            : `data:image/jpeg;base64,${image_base64}`;
        }
      } catch (stErr) {
        console.warn("Screenshot storage upload warning:", stErr);
        screenshot_url = image_base64.startsWith("data:") ? image_base64 : `data:image/jpeg;base64,${image_base64}`;
      }
    }

    // 2. Insert alert into InsForge PostgreSQL alerts table
    const alertRecord = {
      worker_id: worker_id || null,
      alert_type: incident.type || incident.title || "Safety Incident",
      severity: incident.severity || "Critical",
      message: incident.message || incident.title || "Safety incident detected on live camera feed.",
      screenshot_url: screenshot_url,
      details: {
        action_required: incident.action_required || "Supervisor intervention requested.",
        confidence_score: incident.confidence_score || 92,
        timestamp: incident.timestamp || new Date().toISOString(),
      },
      status: "New",
    };

    const { data: inserted, error: dbError } = await insforge
      .database
      .from("alerts")
      .insert([alertRecord])
      .select();

    if (dbError) {
      console.error("Database insert safety incident error:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      alert: inserted ? inserted[0] : alertRecord,
    });
  } catch (error: any) {
    console.error("Error in safety-incident route handler:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process safety incident alert." },
      { status: 500 }
    );
  }
}
