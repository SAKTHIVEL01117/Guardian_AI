import { spawn, ChildProcess } from "child_process";
import path from "path";

let serviceProcess: ChildProcess | null = null;
let isStarting = false;
let startPromise: Promise<boolean> | null = null;

/**
 * Checks if the Python FastAPI AI service on port 8000 is online.
 */
export async function isFastApiHealthy(): Promise<boolean> {
  try {
    const res = await fetch("http://127.0.0.1:8000/health", {
      signal: AbortSignal.timeout(1200),
    });
    if (res.ok) {
      const data = await res.json();
      return data.status === "ok" && data.ready === true;
    }
  } catch {
    // Offline or unreachable
  }
  return false;
}

/**
 * Ensures the Python FastAPI AI service is running on port 8000.
 * If offline, spawns `python.exe lib/ai/ai_service.py` in the background
 * and waits until `/health` returns status ok (or timeout).
 */
export async function ensureFastApiRunning(): Promise<boolean> {
  // 1. Quick check if service is already healthy
  if (await isFastApiHealthy()) {
    return true;
  }

  // 2. If start is already in progress, await existing promise
  if (isStarting && startPromise) {
    return startPromise;
  }

  isStarting = true;
  startPromise = (async () => {
    try {
      console.log("[FastApiManager] Starting Python FastAPI AI service on port 8000...");
      const pythonExe = path.join(process.cwd(), ".venv", "Scripts", "python.exe");
      const scriptPath = path.join(process.cwd(), "lib", "ai", "ai_service.py");

      serviceProcess = spawn(pythonExe, [scriptPath], {
        cwd: process.cwd(),
        detached: false,
        stdio: ["ignore", "pipe", "pipe"],
      });

      serviceProcess.stdout?.on("data", (chunk) => {
        const msg = chunk.toString().trim();
        if (msg) console.log(`[ai_service stdout] ${msg.substring(0, 200)}`);
      });

      serviceProcess.stderr?.on("data", (chunk) => {
        const msg = chunk.toString().trim();
        if (msg) console.warn(`[ai_service stderr] ${msg.substring(0, 200)}`);
      });

      serviceProcess.on("exit", (code) => {
        console.warn(`[FastApiManager] AI service exited with code ${code}`);
        serviceProcess = null;
        isStarting = false;
      });

      // Poll /health for up to 15 seconds (cold start model loading)
      const startTime = Date.now();
      while (Date.now() - startTime < 15000) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        if (await isFastApiHealthy()) {
          console.log("[FastApiManager] Python FastAPI AI service is READY on port 8000!");
          isStarting = false;
          return true;
        }
      }

      console.warn("[FastApiManager] Timeout waiting for FastAPI service startup.");
      isStarting = false;
      return false;
    } catch (err) {
      console.error("[FastApiManager] Failed to start AI service:", err);
      isStarting = false;
      return false;
    }
  })();

  return startPromise;
}
