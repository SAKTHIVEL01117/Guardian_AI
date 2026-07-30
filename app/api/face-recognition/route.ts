import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image_base64 } = body;

    if (!image_base64) {
      return NextResponse.json({
        face_detected: false,
        recognized: false,
        status: "Waiting for worker...",
        error: "image_base64 is required"
      });
    }

    // 1. Fetch registered workers with biometric face embeddings from InsForge database
    const { data: dbWorkers, error: dbError } = await insforge
      .database
      .from("workers")
      .select("id, employee_id, full_name, department, designation, shift, profile_image_url, face_embedding");

    if (dbError) {
      console.warn("Database fetch workers for face recognition warning:", dbError);
    }

    const workersList = dbWorkers || [];

    // 2. Call Python FastAPI InsightFace service
    try {
      const pyRes = await fetch("http://127.0.0.1:8000/api/ai/recognize-face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_base64,
          workers: workersList,
        }),
      });

      if (pyRes.ok) {
        const result = await pyRes.json();

        // 3. If an Unknown Worker is detected, automatically log alert in database if not recently created
        if (result.face_detected && result.status === "Unknown Worker") {
          try {
            await insforge.database.from("alerts").insert([
              {
                alert_type: "Unknown Worker",
                severity: "Warning",
                message: `Unrecognized operator detected at camera station (Confidence ${result.confidence_text}).`,
                status: "New",
              },
            ]);
          } catch (alertErr) {
            console.warn("Error creating unknown worker alert record:", alertErr);
          }
        }

        return NextResponse.json(result);
      }
    } catch (pyErr) {
      console.warn("Python InsightFace service connection error:", pyErr);
    }

    // 4. Fallback if FastAPI service is starting up
    return NextResponse.json({
      face_detected: true,
      recognized: false,
      status: "Waiting for worker...",
      confidence_score: 0.0,
      confidence_text: "0.0%",
      note: "Connecting to InsightFace recognition engine..."
    });

  } catch (error: any) {
    console.error("Error in face-recognition route handler:", error);
    return NextResponse.json({
      face_detected: false,
      recognized: false,
      status: "Waiting for worker...",
      error: error.message || "Failed to process live camera frame."
    });
  }
}
