import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
import { spawnSync } from "child_process";
import path from "path";

/**
 * GET /api/debug-pipeline
 * Returns a full diagnostics snapshot of the AI pipeline state.
 * Used by the monitoring page diagnostics panel.
 */
export async function GET() {
  const start = Date.now();

  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
    pipeline_stages: {},
  };

  // 1. Database: check workers + embeddings
  try {
    const { data, error } = await insforge
      .database
      .from("workers")
      .select("id, employee_id, full_name, face_embedding");

    if (error) {
      diagnostics.pipeline_stages.database = { ok: false, error: error.message };
    } else {
      const total = (data || []).length;
      const withEmbedding = (data || []).filter((w: any) => {
        const emb = w.face_embedding;
        if (Array.isArray(emb) && emb.length > 0) return true;
        if (typeof emb === "string") {
          try { const p = JSON.parse(emb); return Array.isArray(p) && p.length > 0; }
          catch { return false; }
        }
        return false;
      }).length;

      diagnostics.pipeline_stages.database = {
        ok: true,
        total_workers: total,
        workers_with_embeddings: withEmbedding,
        workers_without_embeddings: total - withEmbedding,
        embedding_coverage: total > 0 ? `${Math.round((withEmbedding / total) * 100)}%` : "N/A",
      };
    }
  } catch (err: any) {
    diagnostics.pipeline_stages.database = { ok: false, error: err.message };
  }

  // 2. FastAPI service health
  try {
    const res = await fetch("http://127.0.0.1:8000/health", {
      signal: AbortSignal.timeout(1500),
    });
    if (res.ok) {
      const data = await res.json();
      diagnostics.pipeline_stages.fastapi = { ok: true, status: data.status, model_ready: data.ready };
    } else {
      diagnostics.pipeline_stages.fastapi = { ok: false, http_status: res.status };
    }
  } catch {
    diagnostics.pipeline_stages.fastapi = { ok: false, error: "Service offline or not started" };
  }

  // 3. Python CLI availability
  try {
    const pythonExe = path.join(process.cwd(), ".venv", "Scripts", "python.exe");
    const proc = spawnSync(pythonExe, ["--version"], {
      encoding: "utf-8",
      timeout: 3000,
    });
    diagnostics.pipeline_stages.python_cli = {
      ok: proc.status === 0,
      version: proc.stdout?.trim() || proc.stderr?.trim() || "Unknown",
    };
  } catch (err: any) {
    diagnostics.pipeline_stages.python_cli = { ok: false, error: err.message };
  }

  // 4. recognize_frame.py importability test
  try {
    const pythonExe = path.join(process.cwd(), ".venv", "Scripts", "python.exe");
    const scriptPath = path.join(process.cwd(), "lib", "ai", "recognize_frame.py");
    const proc = spawnSync(pythonExe, [scriptPath], {
      input: "{}",
      encoding: "utf-8",
      timeout: 15000,
    });
    let result = null;
    try { result = JSON.parse(proc.stdout || "{}"); } catch {}
    diagnostics.pipeline_stages.recognize_frame_py = {
      ok: proc.status === 0 && !result?.error?.includes("ImportError"),
      result,
      stderr: proc.stderr?.substring(0, 300) || null,
    };
  } catch (err: any) {
    diagnostics.pipeline_stages.recognize_frame_py = { ok: false, error: err.message };
  }

  // 5. Active pipeline summary
  const fastapiOk = diagnostics.pipeline_stages.fastapi?.ok ?? false;
  const cliOk = diagnostics.pipeline_stages.recognize_frame_py?.ok ?? false;
  diagnostics.active_pipeline =
    fastapiOk ? "FastAPI (port 8000)"
    : cliOk ? "Python CLI (recognize_frame.py)"
    : "TypeScript In-Process Fallback";

  diagnostics.latency_ms = Date.now() - start;

  return NextResponse.json(diagnostics);
}
