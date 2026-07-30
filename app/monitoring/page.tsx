"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  fatigue_level: string; // "Normal" | "Moderate" | "High Risk" | "Critical"
  recommendation: string;
  is_yawning?: boolean;
  is_eye_closed?: boolean;
}

interface RecognitionResult {
  face_detected: boolean;
  recognized: boolean;
  status: string; // "Active" | "Unknown Worker" | "Waiting for worker..."
  worker?: RecognizedWorker | null;
  confidence_score?: number;
  confidence_text?: string;
  det_score?: number;
  bbox?: number[];
  fatigue?: FatigueMetrics;
  behaviour?: WorkerBehaviourMetrics;
}

function formatDurationHMS(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function MonitoringPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Real Camera & Stream States
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [fps, setFps] = useState<number>(0);
  const [resolution, setResolution] = useState<string>("Initializing...");

  // AI Face Recognition Stream State
  const [aiResult, setAiResult] = useState<RecognitionResult>({
    face_detected: false,
    recognized: false,
    status: "Waiting for worker...",
  });
  const [isProcessingFrame, setIsProcessingFrame] = useState(false);

  // Incident & Timeline States
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [incidentText, setIncidentText] = useState("");
  const [isSubmittingIncident, setIsSubmittingIncident] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEventItem[]>([]);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(true);

  // Initialize Real Browser Webcam Stream via MediaDevices API
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Webcam access is not supported by your browser environment.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          if (videoRef.current) {
            setResolution(`${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
          }
          setFps(30.0);
          setCameraActive(true);
        };
      }
    } catch (err: any) {
      console.warn("Camera access error:", err);
      setCameraError(
        err.name === "NotAllowedError"
          ? "Camera permission denied. Please enable webcam permissions in your browser."
          : err.message || "Failed to connect to webcam."
      );
      setCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setAiResult({
      face_detected: false,
      recognized: false,
      status: "Waiting for worker...",
    });
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Real-Time Frame Sampling & InsightFace Face Recognition Loop
  useEffect(() => {
    if (!cameraActive) return;

    const interval = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || isProcessingFrame) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frameB64 = canvas.toDataURL("image/jpeg", 0.85);

      setIsProcessingFrame(true);
      try {
        const res = await fetch("/api/face-recognition", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image_base64: frameB64 }),
        });

        if (res.ok) {
          const data: RecognitionResult = await res.json();
          setAiResult(data);
        }
      } catch (err) {
        console.warn("Face recognition stream error:", err);
      } finally {
        setIsProcessingFrame(false);
      }
    }, 650);

    return () => clearInterval(interval);
  }, [cameraActive, isProcessingFrame]);

  // Database Logging for Fatigue Records Every ~3 seconds when worker is recognized
  useEffect(() => {
    if (!cameraActive || !aiResult.recognized || !aiResult.worker || !aiResult.fatigue) return;

    const logInterval = setInterval(async () => {
      try {
        await fetch("/api/fatigue-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            worker_id: aiResult.worker?.id,
            fatigue: aiResult.fatigue,
          }),
        });
      } catch (err) {
        console.warn("Fatigue log interval warning:", err);
      }
    }, 3000);

    return () => clearInterval(logInterval);
  }, [cameraActive, aiResult.recognized, aiResult.worker, aiResult.fatigue]);

  // Database Logging for Worker Behaviour Events Every ~4 seconds when worker is recognized
  useEffect(() => {
    if (!cameraActive || !aiResult.recognized || !aiResult.worker || !aiResult.behaviour) return;

    const logInterval = setInterval(async () => {
      try {
        await fetch("/api/behaviour-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            worker_id: aiResult.worker?.id,
            behaviour: aiResult.behaviour,
          }),
        });
      } catch (err) {
        console.warn("Behaviour log interval warning:", err);
      }
    }, 4000);

    return () => clearInterval(logInterval);
  }, [cameraActive, aiResult.recognized, aiResult.worker, aiResult.behaviour]);

  // Heat Stress Assessment Computation (Multi-Signal Engine & Thermal Adapter Ready)
  const ambientTempC = 31.5;
  const humidityPercent = 62.0;

  const heatAssessment: HeatStressAssessment = calculateHeatStress({
    ambient_temperature_c: ambientTempC,
    humidity_percent: humidityPercent,
    continuous_work_mins: Math.round((aiResult.behaviour?.continuous_work_duration || 0) / 60),
    fatigue_score: aiResult.fatigue?.fatigue_score || 0,
    facial_redness_index: 0.38,
    activity_intensity: "Moderate",
  });

  // Database Logging for Heat Events Every ~5 seconds when worker is recognized
  useEffect(() => {
    if (!cameraActive || !aiResult.recognized || !aiResult.worker) return;

    const logInterval = setInterval(async () => {
      try {
        await fetch("/api/heat-stress-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            worker_id: aiResult.worker?.id,
            heat_assessment: heatAssessment,
            ambient_temp_c: ambientTempC,
            humidity_percent: humidityPercent,
          }),
        });
      } catch (err) {
        console.warn("Heat log interval warning:", err);
      }
    }, 5000);

    return () => clearInterval(logInterval);
  }, [cameraActive, aiResult.recognized, aiResult.worker, heatAssessment]);

  // Real-Time 7-State Safety Analysis Computation
  const safetyAnalysis: SafetyAnalysisResult = analyzeFrameSafety({
    worker_id: aiResult.worker?.id,
    face_detected: aiResult.recognized || aiResult.face_detected,
    bbox: aiResult.worker?.bbox || [0.25, 0.20, 0.75, 0.80],
    pitch: aiResult.fatigue?.head_pose?.pitch || 0,
    yaw: aiResult.fatigue?.head_pose?.yaw || 0,
    roll: aiResult.fatigue?.head_pose?.roll || 0,
    ear: aiResult.fatigue?.ear || 0.28,
    perclos: aiResult.fatigue?.perclos || 0,
    eye_closed_duration: aiResult.fatigue?.eye_closure_duration || 0,
    movement_frequency: aiResult.behaviour?.movement_frequency,
    behaviour_state: aiResult.behaviour?.current_state,
    has_helmet: true,
    has_safety_vest: true,
  });

  // Automated Safety Incident Logging & InsForge Storage Screenshot Upload
  useEffect(() => {
    if (!cameraActive || !aiResult.recognized || !aiResult.worker || !safetyAnalysis.has_incident || !safetyAnalysis.primary_incident) return;

    const logTimeout = setTimeout(async () => {
      try {
        let frameB64: string | null = null;
        if (canvasRef.current) {
          frameB64 = canvasRef.current.toDataURL("image/jpeg", 0.85);
        }

        await fetch("/api/safety-incident", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            worker_id: aiResult.worker?.id,
            incident: safetyAnalysis.primary_incident,
            image_base64: frameB64,
          }),
        });
      } catch (err) {
        console.warn("Safety incident route error:", err);
      }
    }, 2000);

    return () => clearTimeout(logTimeout);
  }, [cameraActive, aiResult.recognized, aiResult.worker, safetyAnalysis.has_incident, safetyAnalysis.primary_incident]);

  // Load Live Timeline Events
  const loadTimeline = useCallback(async () => {
    setIsLoadingTimeline(true);
    try {
      const events = await fetchMonitoringTimeline();
      setTimelineEvents(events);
    } catch (err) {
      console.error("Timeline error:", err);
    } finally {
      setIsLoadingTimeline(false);
    }
  }, []);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  // Submit Incident Handler
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

  const fatigueScore = aiResult.fatigue?.fatigue_score || 0;
  const fatigueLevel = aiResult.fatigue?.fatigue_level || "Normal";
  const isHighOrCriticalFatigue = fatigueScore >= 60;

  const fatigueGaugeColor =
    fatigueScore >= 80
      ? "#EF4444"
      : fatigueScore >= 60
      ? "#F97316"
      : fatigueScore >= 31
      ? "#F59E0B"
      : "#10B981";

  const fatigueStrokeOffset = 301.59 - (301.59 * Math.min(100, fatigueScore)) / 100;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Hidden Canvas element for frame sampling */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Main Grid: Live Camera Stream (Span 8) & AI Analysis Panel (Span 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Real Live Camera Feed Container */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl group min-h-[540px] flex flex-col justify-between p-6">
              
              {/* Real Video Element */}
              <video
                ref={videoRef}
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                  cameraActive ? "opacity-90" : "opacity-0"
                }`}
              />

              {/* High Fatigue / Critical On-Screen Warning Banner Overlay */}
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

              {/* Fallback Camera Placeholder if Offline or Denied */}
              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-950/90 z-0">
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

              {/* Top Stream Overlays */}
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
                      ? `LIVE • OPERATOR: ${aiResult.worker.full_name.toUpperCase()} (${aiResult.fatigue?.fatigue_score}% FATIGUE)`
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
                    FPS: {cameraActive ? fps.toFixed(1) : "0.0"}
                  </div>
                </div>
              </div>

              {/* Safety Incident Top Hazard Notification Banner */}
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

              {/* Center AI Target Overlay Box & Real-Time Biometric HUD */}
              <div className="relative z-10 my-auto flex items-center justify-center pointer-events-none py-6">
                {/* CASE 1: Face Recognized */}
                {aiResult.face_detected && aiResult.recognized && aiResult.worker ? (
                  <div className={`w-72 h-72 border-2 rounded-3xl relative flex flex-col items-center justify-between p-4 shadow-2xl transition-all duration-300 ${
                    safetyAnalysis.has_incident
                      ? "border-rose-600 shadow-[0_0_60px_rgba(225,29,72,0.8)] bg-rose-950/30 animate-pulse"
                      : isHighOrCriticalFatigue
                      ? "border-rose-500 shadow-[0_0_40px_rgba(239,68,68,0.4)] animate-pulse"
                      : "border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.3)]"
                  }`}>
                    {/* Top Recognized Badge */}
                    <div className={`backdrop-blur-md text-white text-xs font-mono font-bold px-4 py-1.5 rounded-full flex items-center gap-2 shadow-xl border ${
                      safetyAnalysis.has_incident
                        ? "bg-rose-950/95 border-rose-500 text-rose-200"
                        : "bg-slate-900/95 border-slate-700/80"
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

                    {/* Target Bracket Inner Ring */}
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

                    {/* Bottom ID & Posture Badge */}
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
                  /* CASE 2: Unknown Worker Detected */
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
                  /* CASE 3: Waiting for worker... */
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

              {/* Bottom Camera Controls Toolbar & Real-Time Worker Card Overlay */}
              <div className="relative z-10 space-y-3">
                {/* Active Worker Profile Card Bar (If Recognized) */}
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

                {/* Live Worker Behaviour Status & Metrics Bar (Beneath Worker Info) */}
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
                            : (aiResult.behaviour?.current_state || "Working") === "Left workstation"
                            ? "bg-slate-800 text-slate-300 border-slate-600"
                            : "bg-purple-500/20 text-purple-300 border-purple-500/40"
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

                    {/* 5 Real-Time Metrics Trackers */}
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

                {/* Toolbar buttons */}
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

                  {/* Report Incident Red Action */}
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

          {/* Right Column: AI Analysis & Real-time Biometric Fatigue Output */}
          <div className="lg:col-span-4 space-y-6">
            {/* Card 1: 0-100 Fatigue Score Gauge */}
            <div className="bg-card-bg rounded-3xl p-6 border border-border-default shadow-card space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <Activity className="w-4.5 h-4.5 text-primary" />
                  <span>AI Fatigue Score Engine</span>
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                    fatigueScore >= 80
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : fatigueScore >= 60
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : fatigueScore >= 31
                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {fatigueLevel}
                </span>
              </div>

              {/* 0-100 Fatigue Score Radial Gauge */}
              <div className="flex flex-col items-center justify-center py-2 text-center space-y-3">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      stroke="#F1F5F9"
                      strokeWidth="10"
                      fill="none"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
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
                    <span
                      className="text-4xl font-mono font-extrabold tracking-tight"
                      style={{ color: fatigueGaugeColor }}
                    >
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

              {/* Real-Time Biometric Metrics Breakdown (6 Cards) */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Metric 1: EAR & PERCLOS */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-primary" /> EAR</span>
                    <span className="font-mono text-slate-800 font-extrabold">{aiResult.fatigue?.ear || 0.28}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between font-mono">
                    <span>PERCLOS:</span>
                    <span className="font-bold text-slate-700">{aiResult.fatigue?.perclos || 0}%</span>
                  </div>
                </div>

                {/* Metric 2: Blinks & Frequency */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                    <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-primary" /> Blinks</span>
                    <span className="font-mono text-slate-800 font-extrabold">{aiResult.fatigue?.blink_count || 0}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between font-mono">
                    <span>Rate:</span>
                    <span className="font-bold text-slate-700">{aiResult.fatigue?.blink_frequency || 0}/m</span>
                  </div>
                </div>

                {/* Metric 3: MAR & Yawns */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                    <span className="flex items-center gap-1"><Smile className="w-3.5 h-3.5 text-primary" /> MAR</span>
                    <span className="font-mono text-slate-800 font-extrabold">{aiResult.fatigue?.mar || 0.15}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between font-mono">
                    <span>Yawns:</span>
                    <span className="font-bold text-slate-700">{aiResult.fatigue?.yawn_count || 0}</span>
                  </div>
                </div>

                {/* Metric 4: Eye Closure Duration */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary" /> Closure</span>
                    <span className="font-mono text-slate-800 font-extrabold">{aiResult.fatigue?.eye_closure_duration || 0}s</span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between font-mono">
                    <span>State:</span>
                    <span className={`font-bold ${aiResult.fatigue?.is_eye_closed ? "text-rose-600" : "text-emerald-600"}`}>
                      {aiResult.fatigue?.is_eye_closed ? "Closed" : "Open"}
                    </span>
                  </div>
                </div>

                {/* Metric 5: Head Pose Pitch/Yaw */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                    <span className="flex items-center gap-1"><Compass className="w-3.5 h-3.5 text-primary" /> Pitch/Yaw</span>
                    <span className="font-mono text-slate-800 font-extrabold">
                      {aiResult.fatigue?.head_pose?.pitch || 0}°
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between font-mono">
                    <span>Yaw:</span>
                    <span className="font-bold text-slate-700">{aiResult.fatigue?.head_pose?.yaw || 0}°</span>
                  </div>
                </div>

                {/* Metric 6: Neck Angle & Posture */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                    <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-primary" /> Neck</span>
                    <span className="font-mono text-slate-800 font-extrabold">{aiResult.fatigue?.neck_angle || 0}°</span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between font-mono">
                    <span>Posture:</span>
                    <span className="font-bold text-slate-700 truncate max-w-[70px]">{aiResult.fatigue?.shoulder_posture || "Aligned"}</span>
                  </div>
                </div>
              </div>

              {/* Status Info Banner */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
                <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-indigo-900">
                    InsForge Database Synchronization
                  </div>
                  <p className="text-xs text-indigo-700 leading-relaxed font-medium">
                    {aiResult.recognized && aiResult.worker
                      ? `Fatigue metrics logged to PostgreSQL table fatigue_records for active session.`
                      : "Connect webcam and verify operator identity to enable automatic fatigue record logging."}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Heat Stress & Thermal Engine (Multi-Signal & Hardware Thermal Camera Ready) */}
            <div className="bg-card-bg rounded-3xl p-6 border border-border-default shadow-card space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <Sun className="w-4.5 h-4.5 text-amber-500" />
                  <span>Heat Stress &amp; Thermal Engine</span>
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                    heatAssessment.heat_status === "Thermal Danger"
                      ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                      : heatAssessment.heat_status === "High Heat Strain"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : heatAssessment.heat_status === "Elevated Heat"
                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {heatAssessment.heat_status}
                </span>
              </div>

              {/* Heat Status & Core Temp Display */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Risk Level</span>
                  <div className={`text-base font-extrabold font-mono ${
                    heatAssessment.risk_level === "Critical" ? "text-rose-600" :
                    heatAssessment.risk_level === "High" ? "text-amber-600" :
                    heatAssessment.risk_level === "Moderate" ? "text-yellow-600" : "text-emerald-600"
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

              {/* Hydration Reminder Banner */}
              <div className="p-3.5 rounded-2xl bg-cyan-50/70 border border-cyan-100 flex items-start gap-3">
                <Droplets className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-cyan-950 flex items-center justify-between">
                    <span>Hydration Reminder</span>
                    <span className="text-[10px] font-mono text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded-md">Actionable</span>
                  </div>
                  <p className="text-xs text-cyan-800 leading-relaxed font-medium">
                    {heatAssessment.hydration_reminder}
                  </p>
                </div>
              </div>

              {/* Multi-Signal & Thermal Infrared Camera Source Tag */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 bg-secondary-surface/40 p-2.5 rounded-xl border border-border-default/60">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Sensor Source:</span>
                </div>
                <span className="font-bold text-slate-800">{heatAssessment.source}</span>
              </div>
            </div>

            {/* Card 2: Real-time Camera Metrics */}
            <div className="bg-card-bg rounded-3xl p-6 border border-border-default shadow-card space-y-4">
              <h2 className="text-base font-bold text-text-primary">
                Camera Diagnostics
              </h2>

              <div className="space-y-3.5">
                {/* Metric 1: Connection Status */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary-surface/40">
                  <div className="flex items-center gap-2.5 text-text-secondary text-xs font-medium">
                    <Camera className="w-4 h-4 text-text-muted" />
                    <span>Connection Status</span>
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      cameraActive ? "text-success" : "text-danger"
                    }`}
                  >
                    {cameraActive ? "Online" : "Offline"}
                  </span>
                </div>

                {/* Metric 2: Resolution */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary-surface/40">
                  <div className="flex items-center gap-2.5 text-text-secondary text-xs font-medium">
                    <Activity className="w-4 h-4 text-text-muted" />
                    <span>Resolution</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-text-primary">
                    {resolution}
                  </span>
                </div>

                {/* Metric 3: Frame Rate */}
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

        {/* Bottom Section: Live Event Timeline Panel */}
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

          {/* Horizontal / Grid Timeline Cards */}
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
                    evt.severity === "critical"
                      ? "border-l-danger"
                      : evt.severity === "warning"
                      ? "border-l-warning"
                      : evt.severity === "inactive"
                      ? "border-l-slate-400"
                      : "border-l-success"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-text-primary">{evt.timestamp}</span>
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        evt.severity === "critical"
                          ? "text-danger"
                          : evt.severity === "warning"
                          ? "text-warning-foreground"
                          : evt.severity === "inactive"
                          ? "text-text-muted"
                          : "text-success"
                      }`}
                    >
                      {evt.statusText}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-text-secondary">
                    {evt.title}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Incident Modal */}
      {incidentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-danger">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-900">
                Report Safety Incident
              </h3>
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
    </AppLayout>
  );
}
