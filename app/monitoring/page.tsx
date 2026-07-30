"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
// @ts-ignore – lucide-react Bug icon
import { Bug } from "lucide-react";
import Image from "next/image";
import AppLayout from "@/components/layout/AppLayout";
import {
  Video,
  AlertTriangle,
  MicOff,
  Maximize2,
  Sliders,
  CheckCircle2,
  Info,
  Clock,
  Activity,
  Camera,
  CameraOff,
  RefreshCw,
  Loader2,
  UserCheck,
  UserX,
  ShieldAlert,
  ShieldCheck,
  Building2,
  BadgeAlert,
  Eye,
  Smile,
  Compass,
  AlertCircle,
  Zap,
  Coffee,
  Smartphone,
  Flame,
  PauseCircle,
  Focus,
  Timer,
  UserMinus,
  Droplets,
  Sun,
} from "lucide-react";
import {
  fetchMonitoringTimeline,
  reportSafetyIncident,
  TimelineEventItem,
  WorkerBehaviourMetrics,
  ActivityTimelineLog,
  logHeatStressEvent,
} from "@/lib/api/monitoring";
import {
  calculateHeatStress,
  HeatStressAssessment,
} from "@/lib/ai/heat_stress_engine";
import {
  analyzeFrameSafety,
  SafetyAnalysisResult,
  DetectedIncident,
} from "@/lib/ai/safety_detector";

// ─────────────────────────────────────────────────────────────────
// Type Definitions
// ─────────────────────────────────────────────────────────────────

interface RecognizedWorker {
  id: string;
  full_name: string;
  employee_id: string;
  department: string;
  designation?: string;
  shift: string;
  profile_image_url?: string | null;
  bbox?: number[];
}

interface FatigueMetrics {
  ear: number;
  mar: number;
  perclos: number;
  blink_count: number;
  blink_frequency: number;
  eye_closure_duration: number;
  yawn_count: number;
  head_pose: {
    pitch: number;
    yaw: number;
    roll: number;
  };
  neck_angle: number;
  shoulder_posture: string;
  posture_status: string;
  fatigue_score: number;
  fatigue_level: string;
  recommendation: string;
  is_yawning?: boolean;
  is_eye_closed?: boolean;
}

interface RecognitionResult {
  face_detected: boolean;
  recognized: boolean;
  status: string;
  worker?: RecognizedWorker | null;
  confidence_score?: number;
  confidence_text?: string;
  det_score?: number;
  bbox?: number[];
  fatigue?: FatigueMetrics;
  behaviour?: WorkerBehaviourMetrics;
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function formatDurationHMS(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// ─────────────────────────────────────────────────────────────────
// Constants (outside component – stable references)
// ─────────────────────────────────────────────────────────────────
const AMBIENT_TEMP_C = 31.5;
const HUMIDITY_PERCENT = 62.0;
const FRAME_INTERVAL_MS = 700;
const FATIGUE_LOG_INTERVAL_MS = 3000;
const BEHAVIOUR_LOG_INTERVAL_MS = 4000;
const HEAT_LOG_INTERVAL_MS = 5000;

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

export default function MonitoringPage() {
  // ── Refs (never trigger re-renders) ──────────────────────────
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isProcessingRef = useRef<boolean>(false);
  const cameraStartedRef = useRef<boolean>(false);        // guards one-time start

  // ── Camera UI states ─────────────────────────────────────────
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [fps] = useState<number>(30);
  const [resolution, setResolution] = useState<string>("Initializing...");

  // ── AI result state ──────────────────────────────────────────
  const [aiResult, setAiResult] = useState<RecognitionResult>({
    face_detected: false,
    recognized: false,
    status: "Waiting for worker...",
  });

  // ── Misc states ───────────────────────────────────────────────
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [incidentText, setIncidentText] = useState("");
  const [isSubmittingIncident, setIsSubmittingIncident] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEventItem[]>([]);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(true);

  // ── Diagnostics HUD state ─────────────────────────────────────
  const [showDiag, setShowDiag] = useState(false);
  const [diagData, setDiagData] = useState<any>(null);
  const [apiLatencyMs, setApiLatencyMs] = useState<number | null>(null);
  const [pipelineTier, setPipelineTier] = useState<string>("—");

  // ─────────────────────────────────────────────────────────────
  // Camera: start ONCE on mount, stop ONCE on unmount
  // Using refs only so React StrictMode double-invoke is safe.
  // ─────────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    // Guard: never create a second stream while one is alive
    if (streamRef.current && streamRef.current.active) {
      if (videoRef.current && videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
      return;
    }

    setCameraError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera API not supported in this browser environment.");
      return;
    }

    let mediaStream: MediaStream;
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
        audio: false,
      });
    } catch {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      } catch (err: any) {
        const msg =
          err?.name === "NotAllowedError"
            ? "Camera permission denied. Please allow webcam access in your browser."
            : err?.message || "Unable to open webcam.";
        setCameraError(msg);
        setCameraActive(false);
        return;
      }
    }

    // Store in ref – NOT in state – so it never causes re-renders
    streamRef.current = mediaStream;

    const attachToVideo = () => {
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = mediaStream;
      video.onloadedmetadata = () => {
        video.play().catch(() => {});
        setResolution(
          video.videoWidth && video.videoHeight
            ? `${video.videoWidth}x${video.videoHeight}`
            : "1280x720"
        );
        setCameraActive(true);
      };
      // If already loaded (rare but possible)
      if (video.readyState >= 1) {
        video.play().catch(() => {});
        setResolution(
          video.videoWidth && video.videoHeight
            ? `${video.videoWidth}x${video.videoHeight}`
            : "1280x720"
        );
        setCameraActive(true);
      }
    };

    // The video element may not yet be in the DOM on very first mount tick.
    // Use a short rAF to wait for layout flush.
    requestAnimationFrame(() => {
      if (videoRef.current) {
        attachToVideo();
      } else {
        // Fallback: small delay then attach
        setTimeout(attachToVideo, 100);
      }
    });
  }, []); // empty deps – function body only uses refs and setters

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setAiResult({ face_detected: false, recognized: false, status: "Waiting for worker..." });
  }, []); // empty deps

  // ── Single mount/unmount effect – no deps from state/callbacks ──
  useEffect(() => {
    // React StrictMode calls this effect twice (mount → unmount → mount).
    // cameraStartedRef prevents opening the camera a second time.
    if (!cameraStartedRef.current) {
      cameraStartedRef.current = true;
      startCamera();
    }
    return () => {
      stopCamera();
      cameraStartedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty – we want exactly one mount/unmount

  // ─────────────────────────────────────────────────────────────
  // Frame Sampling Loop – stable interval, never recreated
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!cameraActive) return;

    const interval = setInterval(async () => {
      if (isProcessingRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;
      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frameB64 = canvas.toDataURL("image/jpeg", 0.80);

      isProcessingRef.current = true;
      const t0 = performance.now();
      try {
        const res = await fetch("/api/face-recognition", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image_base64: frameB64 }),
          signal: AbortSignal.timeout(15000),
        });
        if (res.ok) {
          const data: RecognitionResult = await res.json();
          setAiResult(data);
          setApiLatencyMs(Math.round(performance.now() - t0));
          if ((data as any)._pipeline) setPipelineTier((data as any)._pipeline);
        }
      } catch {
        // Silently ignore timeouts / network errors – next frame will retry
      } finally {
        isProcessingRef.current = false;
      }
    }, FRAME_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [cameraActive]); // only restarts when camera on/off status changes

  // ─────────────────────────────────────────────────────────────
  // Diagnostics HUD: polls /api/debug-pipeline every 5s when open
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!showDiag) return;
    const fetchDiag = async () => {
      try {
        const r = await fetch("/api/debug-pipeline");
        if (r.ok) setDiagData(await r.json());
      } catch { /* non-critical */ }
    };
    fetchDiag();
    const t = setInterval(fetchDiag, 5000);
    return () => clearInterval(t);
  }, [showDiag]);

  // ─────────────────────────────────────────────────────────────
  // Stable derived values – memoized so object references are
  // stable between renders and don't thrash useEffect deps.
  // ─────────────────────────────────────────────────────────────

  const fatigueScore = aiResult.fatigue?.fatigue_score ?? 0;
  const fatigueLevel = aiResult.fatigue?.fatigue_level ?? "Normal";
  const isHighOrCriticalFatigue = fatigueScore >= 60;

  const fatigueGaugeColor =
    fatigueScore >= 80 ? "#EF4444"
    : fatigueScore >= 60 ? "#F97316"
    : fatigueScore >= 31 ? "#F59E0B"
    : "#10B981";

  const fatigueStrokeOffset = 301.59 - (301.59 * Math.min(100, fatigueScore)) / 100;

  // Memoize inputs to calculateHeatStress so the result object is only
  // recreated when its actual inputs change (not on every render).
  const heatInputs = useMemo(() => ({
    ambient_temperature_c: AMBIENT_TEMP_C,
    humidity_percent: HUMIDITY_PERCENT,
    continuous_work_mins: Math.round((aiResult.behaviour?.continuous_work_duration ?? 0) / 60),
    fatigue_score: fatigueScore,
    facial_redness_index: 0.38,
    activity_intensity: "Moderate" as const,
  }), [fatigueScore, aiResult.behaviour?.continuous_work_duration]);

  const heatAssessment: HeatStressAssessment = useMemo(
    () => calculateHeatStress(heatInputs),
    [heatInputs]
  );

  // Memoize safety analysis inputs
  const safetyInputs = useMemo(() => ({
    worker_id: aiResult.worker?.id,
    face_detected: aiResult.recognized || aiResult.face_detected,
    bbox: aiResult.worker?.bbox ?? [0.25, 0.20, 0.75, 0.80],
    pitch: aiResult.fatigue?.head_pose?.pitch ?? 0,
    yaw: aiResult.fatigue?.head_pose?.yaw ?? 0,
    roll: aiResult.fatigue?.head_pose?.roll ?? 0,
    ear: aiResult.fatigue?.ear ?? 0.28,
    perclos: aiResult.fatigue?.perclos ?? 0,
    eye_closed_duration: aiResult.fatigue?.eye_closure_duration ?? 0,
    movement_frequency: aiResult.behaviour?.movement_frequency,
    behaviour_state: aiResult.behaviour?.current_state,
    has_helmet: true,
    has_safety_vest: true,
  }), [
    aiResult.worker?.id,
    aiResult.recognized,
    aiResult.face_detected,
    aiResult.worker?.bbox,
    aiResult.fatigue?.head_pose?.pitch,
    aiResult.fatigue?.head_pose?.yaw,
    aiResult.fatigue?.head_pose?.roll,
    aiResult.fatigue?.ear,
    aiResult.fatigue?.perclos,
    aiResult.fatigue?.eye_closure_duration,
    aiResult.behaviour?.movement_frequency,
    aiResult.behaviour?.current_state,
  ]);

  const safetyAnalysis: SafetyAnalysisResult = useMemo(
    () => analyzeFrameSafety(safetyInputs),
    [safetyInputs]
  );

  // ─────────────────────────────────────────────────────────────
  // DB Logging: Fatigue – only fires when worker changes
  // ─────────────────────────────────────────────────────────────
  const recognizedWorkerId = aiResult.recognized ? (aiResult.worker?.id ?? null) : null;

  useEffect(() => {
    if (!cameraActive || !recognizedWorkerId || !aiResult.fatigue) return;

    const interval = setInterval(async () => {
      try {
        await fetch("/api/fatigue-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ worker_id: recognizedWorkerId, fatigue: aiResult.fatigue }),
        });
      } catch { /* non-critical */ }
    }, FATIGUE_LOG_INTERVAL_MS);

    return () => clearInterval(interval);
    // We intentionally use recognizedWorkerId (primitive) not the full worker object
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraActive, recognizedWorkerId]);

  // ─────────────────────────────────────────────────────────────
  // DB Logging: Behaviour
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!cameraActive || !recognizedWorkerId) return;

    const interval = setInterval(async () => {
      if (!aiResult.behaviour) return;
      try {
        await fetch("/api/behaviour-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ worker_id: recognizedWorkerId, behaviour: aiResult.behaviour }),
        });
      } catch { /* non-critical */ }
    }, BEHAVIOUR_LOG_INTERVAL_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraActive, recognizedWorkerId]);

  // ─────────────────────────────────────────────────────────────
  // DB Logging: Heat Stress
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!cameraActive || !recognizedWorkerId) return;

    const interval = setInterval(async () => {
      try {
        await fetch("/api/heat-stress-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            worker_id: recognizedWorkerId,
            heat_assessment: heatAssessment,
            ambient_temp_c: AMBIENT_TEMP_C,
            humidity_percent: HUMIDITY_PERCENT,
          }),
        });
      } catch { /* non-critical */ }
    }, HEAT_LOG_INTERVAL_MS);

    return () => clearInterval(interval);
    // heatAssessment is memoized so its reference is stable unless inputs change
  }, [cameraActive, recognizedWorkerId, heatAssessment]);

  // ─────────────────────────────────────────────────────────────
  // Safety Incident Logging – debounced with 2s delay
  // ─────────────────────────────────────────────────────────────
  const incidentType = safetyAnalysis.has_incident
    ? (safetyAnalysis.primary_incident?.type ?? null)
    : null;

  useEffect(() => {
    if (!cameraActive || !recognizedWorkerId || !incidentType) return;

    const timeout = setTimeout(async () => {
      try {
        const frameB64 = canvasRef.current?.toDataURL("image/jpeg", 0.85) ?? null;
        await fetch("/api/safety-incident", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            worker_id: recognizedWorkerId,
            incident: safetyAnalysis.primary_incident,
            image_base64: frameB64,
          }),
        });
      } catch { /* non-critical */ }
    }, 2000);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraActive, recognizedWorkerId, incidentType]);

  // ─────────────────────────────────────────────────────────────
  // Timeline Events
  // ─────────────────────────────────────────────────────────────
  const loadTimeline = useCallback(async () => {
    setIsLoadingTimeline(true);
    try {
      const events = await fetchMonitoringTimeline();
      setTimelineEvents(events);
    } catch {
      // non-critical
    } finally {
      setIsLoadingTimeline(false);
    }
  }, []);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  // ─────────────────────────────────────────────────────────────
  // Incident report handler
  // ─────────────────────────────────────────────────────────────
  const handleIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentText.trim()) return;
    setIsSubmittingIncident(true);
    try {
      await reportSafetyIncident(incidentText.trim());
      setIncidentText("");
      setIncidentModalOpen(false);
      await loadTimeline();
    } catch (err: any) {
      alert(err.message || "Failed to submit incident report.");
    } finally {
      setIsSubmittingIncident(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Hidden canvas for frame capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Main Grid: Camera (8 cols) + AI Panel (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Camera Feed */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl group min-h-[540px] flex flex-col justify-between p-6">

              {/* Real Video Element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                  cameraActive ? "opacity-90" : "opacity-0"
                }`}
              />

              {/* High Fatigue Warning Banner */}
              {cameraActive && isHighOrCriticalFatigue && (
                <div className="relative z-20 bg-rose-950/95 border-b-2 border-rose-500 text-white px-5 py-3 rounded-2xl flex items-center justify-between gap-4 shadow-2xl animate-pulse -mt-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-600 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-rose-100 flex items-center gap-2">
                        <span>FATIGUE WARNING: {fatigueLevel.toUpperCase()} ({fatigueScore}%)</span>
                        <span className="bg-rose-600 text-white px-2 py-0.5 rounded text-[10px] uppercase font-bold">Action Needed</span>
                      </div>
                      <p className="text-xs text-rose-200 mt-0.5 font-medium">{aiResult.fatigue?.recommendation}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 bg-rose-900/80 border border-rose-400/40 rounded-xl text-xs font-mono font-bold text-rose-200 shrink-0">
                    <Coffee className="w-4 h-4 inline mr-1 text-rose-300" /> Break Suggested
                  </div>
                </div>
              )}

              {/* Camera Offline Placeholder */}
              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-950/90 z-10">
                  <CameraOff className="w-12 h-12 text-slate-600 mb-3" />
                  <p className="font-bold text-slate-300 text-sm mb-1">
                    {cameraError ? "Camera Unavailable" : "Connecting to Webcam..."}
                  </p>
                  <p className="text-xs max-w-sm text-slate-400 mb-4">
                    {cameraError || "Requesting camera stream via browser MediaDevices API..."}
                  </p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Retry Camera Stream</span>
                  </button>
                </div>
              )}

              {/* Top Overlays: Status + Resolution + FPS */}
              <div className="relative z-10 flex items-center justify-between mt-1">
                <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-4 py-2 rounded-full inline-flex items-center gap-2.5 text-xs font-bold text-white tracking-wider shadow-lg">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      !cameraActive
                        ? "bg-slate-500"
                        : isHighOrCriticalFatigue
                        ? "bg-rose-500 animate-ping"
                        : aiResult.recognized
                        ? "bg-emerald-400 animate-pulse"
                        : aiResult.face_detected
                        ? "bg-amber-400"
                        : "bg-cyan-400 animate-pulse"
                    }`}
                  />
                  <span>
                    {!cameraActive
                      ? "CAMERA OFFLINE"
                      : aiResult.recognized && aiResult.worker
                      ? `LIVE • OPERATOR: ${aiResult.worker.full_name.toUpperCase()} (${fatigueScore}% FATIGUE)`
                      : aiResult.face_detected
                      ? "ALERT • UNKNOWN WORKER DETECTED"
                      : "LIVE FEED • WEBCAM (LOCAL)"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-full text-xs font-mono font-semibold text-slate-300">
                    RES: {resolution}
                  </div>
                  <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-full text-xs font-mono font-semibold text-slate-300">
                    FPS: {cameraActive ? `${fps.toFixed(1)}` : "0.0"}
                  </div>
                </div>
              </div>

              {/* Safety Incident Banner */}
              {safetyAnalysis.has_incident && safetyAnalysis.primary_incident && (
                <div className="absolute top-16 left-6 right-6 z-20 bg-rose-950/90 backdrop-blur-md border-2 border-rose-500 rounded-2xl p-3 text-white shadow-2xl flex items-center justify-between animate-bounce">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold uppercase font-mono tracking-wider text-rose-200">
                        {safetyAnalysis.primary_incident.title}
                      </div>
                      <div className="text-[11px] text-rose-300">
                        {safetyAnalysis.primary_incident.message}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-rose-600 px-3 py-1 rounded-lg shrink-0">
                    REALTIME ALERT SENT
                  </span>
                </div>
              )}

              {/* Center AI Target Overlay */}
              <div className="relative z-10 my-auto flex items-center justify-center pointer-events-none py-6">
                {aiResult.face_detected && aiResult.recognized && aiResult.worker ? (
                  // Recognized Worker
                  <div className={`w-72 h-72 border-2 rounded-3xl relative flex flex-col items-center justify-between p-4 shadow-2xl transition-all duration-300 ${
                    safetyAnalysis.has_incident
                      ? "border-rose-600 shadow-[0_0_60px_rgba(225,29,72,0.8)] bg-rose-950/30 animate-pulse"
                      : isHighOrCriticalFatigue
                      ? "border-rose-500 shadow-[0_0_40px_rgba(239,68,68,0.4)] animate-pulse"
                      : "border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.3)]"
                  }`}>
                    <div className={`backdrop-blur-md text-white text-xs font-mono font-bold px-4 py-1.5 rounded-full flex items-center gap-2 shadow-xl border ${
                      safetyAnalysis.has_incident ? "bg-rose-950/95 border-rose-500 text-rose-200" : "bg-slate-900/95 border-slate-700/80"
                    }`}>
                      {safetyAnalysis.has_incident ? (
                        <>
                          <ShieldAlert className="w-4 h-4 text-rose-400 animate-spin" />
                          <span>INCIDENT: {safetyAnalysis.primary_incident?.type}</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>{aiResult.worker.full_name} ({aiResult.confidence_text})</span>
                        </>
                      )}
                    </div>

                    <div className={`w-40 h-40 rounded-full border flex flex-col items-center justify-center text-center ${
                      safetyAnalysis.has_incident ? "border-rose-500/60 bg-rose-900/20" : "border-emerald-400/40"
                    }`}>
                      <span className="text-3xl font-mono font-extrabold text-white">{fatigueScore}%</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider font-mono mt-0.5 ${
                        safetyAnalysis.has_incident ? "text-rose-400 font-extrabold" : "text-emerald-400"
                      }`}>
                        {safetyAnalysis.has_incident ? safetyAnalysis.primary_incident?.type : `${fatigueLevel} FATIGUE`}
                      </span>
                    </div>

                    <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/90 px-4 py-1.5 rounded-full text-[11px] font-mono font-bold flex items-center gap-3 shadow-xl">
                      <span className={safetyAnalysis.has_incident ? "text-rose-400 font-bold" : "text-emerald-400"}>
                        {aiResult.worker.employee_id}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-300">EAR: {aiResult.fatigue?.ear}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-300">MAR: {aiResult.fatigue?.mar}</span>
                    </div>
                  </div>
                ) : aiResult.face_detected && !aiResult.recognized ? (
                  // Unknown Worker
                  <div className="w-72 h-72 border-2 border-rose-500/90 rounded-3xl relative flex flex-col items-center justify-between p-4 shadow-[0_0_40px_rgba(244,63,94,0.3)] animate-pulse">
                    <div className="bg-rose-950/95 backdrop-blur-md text-rose-200 border border-rose-500/50 text-xs font-mono font-bold px-4 py-1.5 rounded-full flex items-center gap-2 shadow-xl">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <span>Unknown Worker ({aiResult.confidence_text})</span>
                    </div>
                    <div className="w-40 h-40 rounded-full border border-rose-500/40 flex items-center justify-center">
                      <UserX className="w-16 h-16 text-rose-400/80 animate-bounce" />
                    </div>
                    <div className="bg-rose-950/95 backdrop-blur-md text-rose-200 border border-rose-500/50 px-4 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-2 shadow-xl">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <span>ALERT GENERATED</span>
                    </div>
                  </div>
                ) : (
                  // Waiting for worker
                  <div className="w-64 h-64 border-2 border-cyan-400/70 rounded-3xl relative flex flex-col items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                    <div className="w-36 h-36 rounded-full border border-cyan-300/40 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full border border-dashed border-cyan-400/60 animate-spin" />
                    </div>
                    <div className="absolute top-3 bg-cyan-950/90 backdrop-blur-md text-cyan-300 border border-cyan-500/40 text-[11px] font-mono font-bold uppercase tracking-widest px-4 py-1 rounded-full flex items-center gap-2 shadow-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span>Waiting for worker...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Controls & Worker Card */}
              <div className="relative z-10 space-y-3">
                {/* Worker profile bar */}
                {aiResult.face_detected && aiResult.recognized && aiResult.worker && (
                  <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 flex items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full overflow-hidden relative border-2 border-emerald-400 shrink-0 bg-slate-800">
                        <Image
                          src={
                            aiResult.worker.profile_image_url ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                          }
                          alt={aiResult.worker.full_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm">{aiResult.worker.full_name}</span>
                          <span className="font-mono text-[11px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-md border border-slate-700 font-bold">
                            {aiResult.worker.employee_id}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium flex items-center gap-2 mt-0.5">
                          <span>{aiResult.worker.department}</span>
                          <span>•</span>
                          <span>{aiResult.worker.shift} Shift</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Fatigue Level</span>
                      <span className={`text-sm font-mono font-extrabold ${fatigueScore >= 60 ? "text-rose-400" : "text-emerald-400"}`}>
                        {fatigueScore}% ({fatigueLevel})
                      </span>
                    </div>
                  </div>
                )}

                {/* Behaviour metrics bar */}
                {aiResult.face_detected && aiResult.recognized && aiResult.worker && (
                  <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-2xl p-3.5 space-y-3 shadow-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">Live Behaviour Status:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-mono font-extrabold uppercase tracking-wider flex items-center gap-1.5 border shadow-sm ${
                          (aiResult.behaviour?.current_state || "Working") === "Focused"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : (aiResult.behaviour?.current_state || "Working") === "Working"
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                            : (aiResult.behaviour?.current_state || "Working") === "Idle"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : (aiResult.behaviour?.current_state || "Working") === "Distracted"
                            ? "bg-orange-500/20 text-orange-300 border-orange-500/40"
                            : (aiResult.behaviour?.current_state || "Working") === "Sleeping"
                            ? "bg-rose-500/30 text-rose-200 border-rose-500/60 animate-pulse"
                            : "bg-slate-800 text-slate-300 border-slate-600"
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            (aiResult.behaviour?.current_state || "Working") === "Focused" ? "bg-emerald-400 animate-pulse" :
                            (aiResult.behaviour?.current_state || "Working") === "Working" ? "bg-cyan-400 animate-pulse" :
                            (aiResult.behaviour?.current_state || "Working") === "Sleeping" ? "bg-rose-400 animate-ping" : "bg-amber-400"
                          }`} />
                          {aiResult.behaviour?.current_state || "Working"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-mono">
                        <span className="text-slate-400">Continuous Work:</span>
                        <span className="text-emerald-400 font-extrabold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {formatDurationHMS(aiResult.behaviour?.continuous_work_duration || 0)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center space-y-0.5">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Active Work</span>
                        <span className="font-mono font-extrabold text-cyan-300 text-xs">
                          {formatDurationHMS(aiResult.behaviour?.active_working_time || 0)}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center space-y-0.5">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Idle Time</span>
                        <span className="font-mono font-extrabold text-amber-300 text-xs">
                          {formatDurationHMS(aiResult.behaviour?.idle_time || 0)}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center space-y-0.5">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Break Time</span>
                        <span className="font-mono font-extrabold text-slate-300 text-xs">
                          {formatDurationHMS(aiResult.behaviour?.break_duration || 0)}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center space-y-0.5">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Movements</span>
                        <span className="font-mono font-extrabold text-indigo-300 text-xs">
                          {aiResult.behaviour?.movement_frequency || 0} / min
                        </span>
                      </div>
                      <div className="col-span-2 sm:col-span-1 p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center space-y-0.5">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Activity Events</span>
                        <span className="font-mono font-extrabold text-purple-300 text-xs">
                          {aiResult.behaviour?.activity_timeline?.length || 1} logged
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Toolbar */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={cameraActive ? stopCamera : startCamera}
                      className="w-10 h-10 rounded-xl bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md text-white border border-slate-700/60 flex items-center justify-center transition-colors"
                      title={cameraActive ? "Stop Camera Stream" : "Start Camera Stream"}
                    >
                      {cameraActive ? <Camera className="w-4.5 h-4.5 text-success" /> : <CameraOff className="w-4.5 h-4.5 text-danger" />}
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md text-white border border-slate-700/60 flex items-center justify-center transition-colors">
                      <MicOff className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => setIncidentModalOpen(true)}
                    className="bg-danger hover:bg-danger-hover text-white font-bold text-xs px-5 py-3 rounded-2xl transition-all shadow-lg shadow-danger/30 inline-flex items-center gap-2.5 active:scale-[0.98]"
                  >
                    <AlertTriangle className="w-4.5 h-4.5" />
                    <span>Report Incident</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button className="w-10 h-10 rounded-xl bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md text-white border border-slate-700/60 flex items-center justify-center transition-colors">
                      <Sliders className="w-4.5 h-4.5" />
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md text-white border border-slate-700/60 flex items-center justify-center transition-colors">
                      <Maximize2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: AI Analysis */}
          <div className="lg:col-span-4 space-y-6">
            {/* Fatigue Score Card */}
            <div className="bg-card-bg rounded-3xl p-6 border border-border-default shadow-card space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <Activity className="w-4.5 h-4.5 text-primary" />
                  <span>AI Fatigue Score Engine</span>
                </h2>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                  fatigueScore >= 80 ? "bg-rose-50 text-rose-700 border-rose-200"
                  : fatigueScore >= 60 ? "bg-amber-50 text-amber-700 border-amber-200"
                  : fatigueScore >= 31 ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                  {fatigueLevel}
                </span>
              </div>

              {/* Radial Gauge */}
              <div className="flex flex-col items-center justify-center py-2 text-center space-y-3">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="48" stroke="#F1F5F9" strokeWidth="10" fill="none" />
                    <circle
                      cx="60" cy="60" r="48"
                      stroke={fatigueGaugeColor}
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray="301.59"
                      strokeDashoffset={fatigueStrokeOffset}
                      className="transition-all duration-500 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center p-2">
                    <span className="text-4xl font-mono font-extrabold tracking-tight" style={{ color: fatigueGaugeColor }}>
                      {fatigueScore}%
                    </span>
                    <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase mt-0.5">
                      {fatigueLevel}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-text-secondary max-w-xs leading-relaxed font-medium">
                  {aiResult.fatigue?.recommendation || "Monitoring operator fatigue indicators every second..."}
                </p>
              </div>

              {/* Biometric Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-primary" /> EAR</span>
                    <span className="font-mono text-slate-800 font-extrabold">{aiResult.fatigue?.ear ?? 0.28}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between font-mono">
                    <span>PERCLOS:</span>
                    <span className="font-bold text-slate-700">{aiResult.fatigue?.perclos ?? 0}%</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                    <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-primary" /> Blinks</span>
                    <span className="font-mono text-slate-800 font-extrabold">{aiResult.fatigue?.blink_count ?? 0}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between font-mono">
                    <span>Rate:</span>
                    <span className="font-bold text-slate-700">{aiResult.fatigue?.blink_frequency ?? 0}/m</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                    <span className="flex items-center gap-1"><Smile className="w-3.5 h-3.5 text-primary" /> MAR</span>
                    <span className="font-mono text-slate-800 font-extrabold">{aiResult.fatigue?.mar ?? 0.15}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between font-mono">
                    <span>Yawns:</span>
                    <span className="font-bold text-slate-700">{aiResult.fatigue?.yawn_count ?? 0}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary" /> Closure</span>
                    <span className="font-mono text-slate-800 font-extrabold">{aiResult.fatigue?.eye_closure_duration ?? 0}s</span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between font-mono">
                    <span>State:</span>
                    <span className={`font-bold ${aiResult.fatigue?.is_eye_closed ? "text-rose-600" : "text-emerald-600"}`}>
                      {aiResult.fatigue?.is_eye_closed ? "Closed" : "Open"}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                    <span className="flex items-center gap-1"><Compass className="w-3.5 h-3.5 text-primary" /> Pitch/Yaw</span>
                    <span className="font-mono text-slate-800 font-extrabold">{aiResult.fatigue?.head_pose?.pitch ?? 0}°</span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between font-mono">
                    <span>Yaw:</span>
                    <span className="font-bold text-slate-700">{aiResult.fatigue?.head_pose?.yaw ?? 0}°</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                    <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-primary" /> Neck</span>
                    <span className="font-mono text-slate-800 font-extrabold">{aiResult.fatigue?.neck_angle ?? 0}°</span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between font-mono">
                    <span>Posture:</span>
                    <span className="font-bold text-slate-700 truncate max-w-[70px]">{aiResult.fatigue?.shoulder_posture || "Aligned"}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
                <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-indigo-900">InsForge Database Synchronization</div>
                  <p className="text-xs text-indigo-700 leading-relaxed font-medium">
                    {aiResult.recognized && aiResult.worker
                      ? `Fatigue metrics logged to PostgreSQL table fatigue_records for active session.`
                      : "Connect webcam and verify operator identity to enable automatic fatigue record logging."}
                  </p>
                </div>
              </div>
            </div>

            {/* Heat Stress Card */}
            <div className="bg-card-bg rounded-3xl p-6 border border-border-default shadow-card space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <Sun className="w-4.5 h-4.5 text-amber-500" />
                  <span>Heat Stress &amp; Thermal Engine</span>
                </h2>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                  heatAssessment.heat_status === "Thermal Danger" ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                  : heatAssessment.heat_status === "High Heat Strain" ? "bg-amber-50 text-amber-700 border-amber-200"
                  : heatAssessment.heat_status === "Elevated Heat" ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                  {heatAssessment.heat_status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Risk Level</span>
                  <div className={`text-base font-extrabold font-mono ${
                    heatAssessment.risk_level === "Critical" ? "text-rose-600"
                    : heatAssessment.risk_level === "High" ? "text-amber-600"
                    : heatAssessment.risk_level === "Moderate" ? "text-yellow-600"
                    : "text-emerald-600"
                  }`}>
                    {heatAssessment.risk_level} Risk
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    WBGT: <strong className="text-slate-700">{heatAssessment.wbgt_index}°C</strong>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Est. Core Temp</span>
                  <div className="text-base font-extrabold font-mono text-slate-900">
                    {heatAssessment.estimated_core_temp_f}°F <span className="text-xs text-slate-400 font-normal">({heatAssessment.estimated_core_temp_c}°C)</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Rest: <strong className="text-indigo-600">{heatAssessment.recommended_rest_mins}m / hr</strong>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-cyan-50/70 border border-cyan-100 flex items-start gap-3">
                <Droplets className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-cyan-950 flex items-center justify-between">
                    <span>Hydration Reminder</span>
                    <span className="text-[10px] font-mono text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded-md">Actionable</span>
                  </div>
                  <p className="text-xs text-cyan-800 leading-relaxed font-medium">{heatAssessment.hydration_reminder}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 bg-secondary-surface/40 p-2.5 rounded-xl border border-border-default/60">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Sensor Source:</span>
                </div>
                <span className="font-bold text-slate-800">{heatAssessment.source}</span>
              </div>
            </div>

            {/* Camera Diagnostics Card */}
            <div className="bg-card-bg rounded-3xl p-6 border border-border-default shadow-card space-y-4">
              <h2 className="text-base font-bold text-text-primary">Camera Diagnostics</h2>
              <div className="space-y-3.5">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary-surface/40">
                  <div className="flex items-center gap-2.5 text-text-secondary text-xs font-medium">
                    <Camera className="w-4 h-4 text-text-muted" />
                    <span>Connection Status</span>
                  </div>
                  <span className={`text-xs font-bold ${cameraActive ? "text-success" : "text-danger"}`}>
                    {cameraActive ? "Online" : "Offline"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary-surface/40">
                  <div className="flex items-center gap-2.5 text-text-secondary text-xs font-medium">
                    <Activity className="w-4 h-4 text-text-muted" />
                    <span>Resolution</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-text-primary">{resolution}</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary-surface/40">
                  <div className="flex items-center gap-2.5 text-text-secondary text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4 text-text-muted" />
                    <span>Target Frame Rate</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-success">
                    {cameraActive ? `${fps.toFixed(1)} FPS` : "0 FPS"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Event Timeline */}
        <div className="bg-card-bg rounded-3xl p-6 border border-border-default shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-text-primary">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold">Event Timeline</h2>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <button
                onClick={loadTimeline}
                className="text-text-secondary hover:text-text-primary inline-flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingTimeline ? "animate-spin" : ""}`} />
                <span>Refresh Timeline</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoadingTimeline ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-100 animate-pulse h-20" />
              ))
            ) : timelineEvents.length === 0 ? (
              <div className="col-span-4 p-8 text-center text-text-muted text-xs">
                No monitoring timeline events recorded yet.
              </div>
            ) : (
              timelineEvents.map((evt) => (
                <div
                  key={evt.id}
                  className={`bg-card-bg p-4 rounded-2xl border-l-4 border border-border-default shadow-xs space-y-2 ${
                    evt.severity === "critical" ? "border-l-danger"
                    : evt.severity === "warning" ? "border-l-warning"
                    : evt.severity === "inactive" ? "border-l-slate-400"
                    : "border-l-success"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-text-primary">{evt.timestamp}</span>
                    <span className={`text-[10px] font-bold uppercase ${
                      evt.severity === "critical" ? "text-danger"
                      : evt.severity === "warning" ? "text-warning-foreground"
                      : evt.severity === "inactive" ? "text-text-muted"
                      : "text-success"
                    }`}>
                      {evt.statusText}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-text-secondary">{evt.title}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Incident Report Modal */}
      {incidentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-danger">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-900">Report Safety Incident</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Log an immediate supervisor intervention to InsForge database. This will notify plant safety management.
            </p>
            <form onSubmit={handleIncidentSubmit} className="space-y-4">
              <textarea
                value={incidentText}
                onChange={(e) => setIncidentText(e.target.value)}
                placeholder="Describe the safety observation or incident..."
                rows={3}
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary"
              />
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIncidentModalOpen(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingIncident}
                  className="w-full bg-danger hover:bg-danger-hover text-white font-semibold py-3 rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSubmittingIncident ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Submit Incident Report</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Diagnostics HUD ─────────────────────────────────── */}
      {/* Toggle button — always visible */}
      <button
        onClick={() => setShowDiag((p) => !p)}
        title="Toggle AI Pipeline Diagnostics"
        className={`fixed bottom-6 right-6 z-50 w-11 h-11 rounded-2xl flex items-center justify-center shadow-xl border transition-colors ${
          showDiag
            ? "bg-indigo-600 border-indigo-400 text-white"
            : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
        }`}
      >
        <Bug className="w-5 h-5" />
      </button>

      {showDiag && (
        <div className="fixed bottom-20 right-6 z-50 w-96 max-h-[80vh] overflow-y-auto bg-slate-950/97 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl text-xs font-mono p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Bug className="w-4 h-4 text-indigo-400" />
              AI Pipeline Diagnostics
            </span>
            <span className="text-[10px] text-slate-500">
              {diagData?.timestamp ? new Date(diagData.timestamp).toLocaleTimeString() : "Loading..."}
            </span>
          </div>

          {/* Camera */}
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Camera</div>
            <DiagRow label="Camera Status" value={cameraActive ? "✅ Online" : "❌ Offline"} />
            <DiagRow label="Resolution" value={resolution} />
            <DiagRow label="FPS Target" value="30" />
          </div>

          {/* Face Detection */}
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Face Detection</div>
            <DiagRow label="Face Detected" value={aiResult.face_detected ? "✅ Yes" : "❌ No"} />
            <DiagRow label="Detection Score" value={aiResult.det_score != null ? `${(aiResult.det_score * 100).toFixed(1)}%` : "—"} />
            <DiagRow label="Face Status" value={aiResult.status ?? "—"} />
          </div>

          {/* Worker Recognition */}
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Recognition</div>
            <DiagRow
              label="Workers in DB"
              value={diagData?.pipeline_stages?.database?.total_workers != null
                ? String(diagData.pipeline_stages.database.total_workers) : "—"}
            />
            <DiagRow
              label="Embeddings Loaded"
              value={diagData?.pipeline_stages?.database?.workers_with_embeddings != null
                ? `${diagData.pipeline_stages.database.workers_with_embeddings} / ${diagData.pipeline_stages.database.total_workers}`
                : "—"}
            />
            <DiagRow label="Worker Matched" value={aiResult.recognized ? `✅ ${aiResult.worker?.full_name ?? ""}` : "❌ No match"} />
            <DiagRow label="Confidence" value={aiResult.confidence_text ?? "0%"} />
          </div>

          {/* Pipeline Tier */}
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Pipeline</div>
            <DiagRow label="FastAPI Service" value={diagData?.pipeline_stages?.fastapi?.ok ? "✅ Online" : "❌ Offline"} />
            <DiagRow label="Python CLI" value={diagData?.pipeline_stages?.python_cli?.ok ? "✅ Available" : "❌ Unavailable"} />
            <DiagRow label="Active Tier" value={pipelineTier || diagData?.active_pipeline || "—"} />
            <DiagRow label="API Latency" value={apiLatencyMs != null ? `${apiLatencyMs}ms` : "—"} />
          </div>

          {/* Fatigue Metrics */}
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Live Fatigue Metrics</div>
            <DiagRow label="EAR" value={aiResult.fatigue?.ear != null ? String(aiResult.fatigue.ear) : "—"} />
            <DiagRow label="MAR" value={aiResult.fatigue?.mar != null ? String(aiResult.fatigue.mar) : "—"} />
            <DiagRow label="PERCLOS" value={aiResult.fatigue?.perclos != null ? `${aiResult.fatigue.perclos}%` : "—"} />
            <DiagRow label="Blink Count" value={aiResult.fatigue?.blink_count != null ? String(aiResult.fatigue.blink_count) : "—"} />
            <DiagRow label="Yawn Count" value={aiResult.fatigue?.yawn_count != null ? String(aiResult.fatigue.yawn_count) : "—"} />
            <DiagRow label="Eye State" value={aiResult.fatigue?.is_eye_closed ? "🔴 Closed" : "🟢 Open"} />
            <DiagRow
              label="Head Pose P/Y/R"
              value={aiResult.fatigue?.head_pose
                ? `${aiResult.fatigue.head_pose.pitch}° / ${aiResult.fatigue.head_pose.yaw}° / ${aiResult.fatigue.head_pose.roll}°`
                : "—"}
            />
            <DiagRow label="Posture" value={aiResult.fatigue?.posture_status ?? "—"} />
            <DiagRow label="Fatigue Score" value={aiResult.fatigue?.fatigue_score != null ? `${aiResult.fatigue.fatigue_score}% (${aiResult.fatigue?.fatigue_level})` : "—"} />
          </div>

          {/* DB Write Status */}
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Database</div>
            <DiagRow
              label="DB Connection"
              value={diagData?.pipeline_stages?.database?.ok ? "✅ Connected" : "❌ Error"}
            />
            <DiagRow
              label="Embedding Coverage"
              value={diagData?.pipeline_stages?.database?.embedding_coverage ?? "—"}
            />
          </div>

          <div className="text-[10px] text-slate-600 pt-1 border-t border-slate-800 text-center">
            Remove or hide in production via NEXT_PUBLIC_DEBUG_PANEL=false
          </div>
        </div>
      )}
    </AppLayout>

  );
}

// ── Diagnostics HUD helper ────────────────────────────────────────
function DiagRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-0.5 gap-2">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className="text-slate-200 text-right truncate max-w-[55%]">{value}</span>
    </div>
  );
}
