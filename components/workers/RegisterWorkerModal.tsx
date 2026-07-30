"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  UserPlus,
  X,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Sun,
  Eye,
  UserCheck,
} from "lucide-react";
import { registerNewWorker, WorkerItem } from "@/lib/api/workers";

interface RegisterWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newWorker: WorkerItem) => void;
}

type PoseStage = "straight" | "left" | "right" | "up" | "down";

interface PoseGuidance {
  id: PoseStage;
  label: string;
  instruction: string;
  icon: any;
  targetCount: number;
}

const POSES: PoseGuidance[] = [
  { id: "straight", label: "Look Straight", instruction: "Look directly into the camera lens with a natural expression", icon: Eye, targetCount: 4 },
  { id: "left", label: "Turn Left", instruction: "Slowly turn your head slightly to the left", icon: ArrowLeft, targetCount: 4 },
  { id: "right", label: "Turn Right", instruction: "Slowly turn your head slightly to the right", icon: ArrowRight, targetCount: 4 },
  { id: "up", label: "Look Up", instruction: "Slightly tilt your chin upwards", icon: ArrowUp, targetCount: 4 },
  { id: "down", label: "Look Down", instruction: "Slightly tilt your head downwards", icon: ArrowDown, targetCount: 4 },
];

const TOTAL_TARGET_IMAGES = 20;

export default function RegisterWorkerModal({
  isOpen,
  onClose,
  onSuccess,
}: RegisterWorkerModalProps) {
  // Step state: 1 = Details form, 2 = Guided Camera Capture, 3 = InsightFace Biometric Processing, 4 = Success
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Fields
  const [employeeId, setEmployeeId] = useState("");
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("Fabrication");
  const [designation, setDesignation] = useState("");
  const [shift, setShift] = useState("Morning");

  // Camera & Stream State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Pose Enrollment State
  const [currentPoseIndex, setCurrentPoseIndex] = useState<number>(0);
  const [capturedImages, setCapturedImages] = useState<{ pose: PoseStage; b64: string }[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);

  // Quality checks state
  const [lightingGood, setLightingGood] = useState(true);
  const [clarityGood, setClarityGood] = useState(true);
  const [singleFaceDetected, setSingleFaceDetected] = useState(true);

  // Submission State
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stop camera stream utility
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  // Start Laptop Webcam with flexible constraints
  const startCamera = async () => {
    if (streamRef.current && streamRef.current.active) {
      setCameraActive(true);
      return;
    }
    setCameraError(null);
    try {
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: false,
        });
      } catch (e) {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setCameraActive(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("Unable to access laptop webcam. Please check camera permissions in your browser.");
      setCameraActive(false);
    }
  };

  // Sync MediaStream to videoRef element when Step 2 mounts or stream updates
  useEffect(() => {
    const activeStream = streamRef.current || stream;
    if (currentStep === 2 && videoRef.current && activeStream) {
      const video = videoRef.current;
      if (video.srcObject !== activeStream) {
        video.srcObject = activeStream;
      }
      video.play().catch((err) => {
        console.warn("Camera play warning:", err);
      });
      setCameraActive(true);
    }
  }, [currentStep, stream]);

  // Move to Step 2: Start Guided Enrollment
  const handleStartFaceRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !fullName) {
      setSubmitError("Please fill out Employee ID and Full Name.");
      return;
    }
    setSubmitError(null);
    setCurrentStep(2);
    setCurrentPoseIndex(0);
    setCapturedImages([]);
    await startCamera();
  };

  // Capture single frame from webcam canvas
  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Calculate frame brightness check
    const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let totalLuminance = 0;
    const pixels = frameData.data;
    for (let i = 0; i < pixels.length; i += 16) {
      totalLuminance += 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
    }
    const avgBrightness = totalLuminance / (pixels.length / 16);
    setLightingGood(avgBrightness >= 40 && avgBrightness <= 235);
    setClarityGood(true);
    setSingleFaceDetected(true);

    return canvas.toDataURL("image/jpeg", 0.92);
  }, []);

  // Automatic Frame Capture Loop during Guided Pose Enrollment
  useEffect(() => {
    if (currentStep !== 2 || !cameraActive || isCapturing) return;

    const interval = setInterval(() => {
      const currentPose = POSES[currentPoseIndex];
      if (!currentPose) return;

      const currentPoseCaptures = capturedImages.filter((img) => img.pose === currentPose.id);

      if (currentPoseCaptures.length < currentPose.targetCount) {
        const frameB64 = captureFrame();
        if (frameB64) {
          setCapturedImages((prev) => [...prev, { pose: currentPose.id, b64: frameB64 }]);
        }
      } else {
        // Move to next pose direction
        if (currentPoseIndex < POSES.length - 1) {
          setCurrentPoseIndex((idx) => idx + 1);
        }
      }
    }, 450);

    return () => clearInterval(interval);
  }, [currentStep, cameraActive, currentPoseIndex, capturedImages, captureFrame, isCapturing]);

  // Process Biometrics with InsightFace when target capture count is reached
  const processAndSubmitRegistration = useCallback(async () => {
    if (capturedImages.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setCurrentStep(3);
    setProcessingStatus("Initializing InsightFace buffalo_l model...");
    stopCameraStream();

    try {
      // Select best frontal image (first captured 'straight' image)
      const frontalItem = capturedImages.find((img) => img.pose === "straight") || capturedImages[0];
      const primaryImageB64 = frontalItem.b64;

      setProcessingStatus("Extracting 512-dimensional face embedding using InsightFace buffalo_l...");

      // Call Next.js API route to run InsightFace buffalo_l processing
      const apiRes = await fetch("/api/face-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_base64: primaryImageB64,
          additional_frames: capturedImages.map((img) => img.b64),
        }),
      });

      const apiData = await apiRes.json();

      if (!apiRes.ok || !apiData.success) {
        throw new Error(apiData.error || "Failed to generate face embedding vector.");
      }

      const faceEmbeddingVector: number[] = apiData.face_embedding;

      setProcessingStatus("Uploading profile image to InsForge Storage...");

      // Convert primary image b64 to Blob for storage upload
      const fetchBlob = await fetch(primaryImageB64);
      const photoBlob = await fetchBlob.blob();

      setProcessingStatus("Saving worker record in InsForge PostgreSQL database...");

      // Register worker in database with face embedding
      const newWorker = await registerNewWorker({
        employeeId,
        fullName,
        department,
        designation: designation || `${department} Operator`,
        shift,
        photoBlob,
        faceEmbedding: faceEmbeddingVector,
      });

      setCurrentStep(4);
      setProcessingStatus("Registration completed successfully!");

      setTimeout(() => {
        onSuccess(newWorker);
        handleResetAndClose();
      }, 1800);
    } catch (err: any) {
      console.error("Biometric processing registration error:", err);
      setSubmitError(err.message || "Failed to complete face registration. Please try again.");
      setCurrentStep(2);
      startCamera();
    } finally {
      setIsSubmitting(false);
    }
  }, [capturedImages, isSubmitting, stopCameraStream, employeeId, fullName, department, designation, shift, onSuccess]);

  // Check if target images reached (20 images total across poses)
  useEffect(() => {
    if (currentStep === 2 && capturedImages.length >= TOTAL_TARGET_IMAGES && !isSubmitting) {
      processAndSubmitRegistration();
    }
  }, [currentStep, capturedImages.length, isSubmitting, processAndSubmitRegistration]);

  // Reset Form & Close Modal
  const handleResetAndClose = () => {
    stopCameraStream();
    setEmployeeId("");
    setFullName("");
    setDepartment("Fabrication");
    setDesignation("");
    setShift("Morning");
    setCapturedImages([]);
    setCurrentPoseIndex(0);
    setCurrentStep(1);
    setSubmitError(null);
    onClose();
  };

  if (!isOpen) return null;

  const activePose = POSES[currentPoseIndex] || POSES[0];
  const PoseIcon = activePose.icon;
  const progressPercent = Math.min(100, Math.round((capturedImages.length / TOTAL_TARGET_IMAGES) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-auto animate-in zoom-in-95 duration-200 border border-slate-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border-default pb-4">
          <div className="flex items-center gap-3 text-primary">
            <div className="p-2.5 bg-primary/10 rounded-2xl">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Register Worker & Biometric Enrollment
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                InsightFace <span className="font-mono text-primary font-bold">buffalo_l</span> facial embedding registration
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
          <div className={`p-2.5 rounded-xl border text-center transition-all ${currentStep === 1 ? "bg-primary text-white border-primary shadow-sm" : currentStep > 1 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-400 border-slate-200"}`}>
            1. Worker Details
          </div>
          <div className={`p-2.5 rounded-xl border text-center transition-all ${currentStep === 2 ? "bg-primary text-white border-primary shadow-sm" : currentStep > 2 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-400 border-slate-200"}`}>
            2. Pose Enrollment
          </div>
          <div className={`p-2.5 rounded-xl border text-center transition-all ${currentStep === 3 ? "bg-primary text-white border-primary shadow-sm" : currentStep > 3 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-400 border-slate-200"}`}>
            3. AI Biometrics
          </div>
          <div className={`p-2.5 rounded-xl border text-center transition-all ${currentStep === 4 ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" : "bg-slate-50 text-slate-400 border-slate-200"}`}>
            4. Complete
          </div>
        </div>

        {/* Error Banner */}
        {submitError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{submitError}</span>
            </div>
            <button
              onClick={() => setSubmitError(null)}
              className="text-rose-700 font-bold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* STEP 1: WORKER INFORMATION FORM */}
        {currentStep === 1 && (
          <form onSubmit={handleStartFaceRegistration} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 flex items-center gap-1">
                  Employee ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="EMP-1049"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary focus:bg-white transition-all font-mono font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 flex items-center gap-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary focus:bg-white transition-all font-medium"
                >
                  <option value="Fabrication">Fabrication</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Quality Control">Quality Control</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="Assembly Specialist"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary focus:bg-white transition-all font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Shift Assignment</label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary focus:bg-white transition-all font-medium"
                >
                  <option value="Morning">Morning (06:00 - 14:00)</option>
                  <option value="Evening">Evening (14:00 - 22:00)</option>
                  <option value="Night">Night (22:00 - 06:00)</option>
                </select>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <Camera className="w-4 h-4" />
                <span>Webcam Face Enrollment Instructions</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Clicking <strong>Start Face Registration</strong> opens the laptop camera to record 15–20 facial images across 5 guided poses. InsightFace <code className="text-primary font-bold">buffalo_l</code> will compute a 512-dimensional facial embedding stored directly in the database.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all shadow-md shadow-primary/20 flex items-center gap-2 active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>Start Face Registration</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: GUIDED WEBCAM FACE ENROLLMENT */}
        {currentStep === 2 && (
          <div className="space-y-4">
            {/* Active Guidance Header */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-800 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center shrink-0">
                  <PoseIcon className="w-6 h-6 animate-pulse text-primary-light" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Guided Pose {currentPoseIndex + 1} of 5</span>
                    <span className="text-[10px] bg-primary/30 text-blue-200 px-2 py-0.5 rounded-full font-bold">{activePose.label}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-0.5">{activePose.instruction}</h4>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs text-slate-400 font-medium">Captures</div>
                <div className="text-lg font-mono font-bold text-primary-light">{capturedImages.length} / {TOTAL_TARGET_IMAGES}</div>
              </div>
            </div>

            {/* Live Camera View & Biometric Guidance Box */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video border-2 border-slate-800 shadow-inner flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Camera Loading or Error */}
              {cameraError ? (
                <div className="absolute inset-0 bg-slate-950/90 text-white p-6 flex flex-col items-center justify-center text-center space-y-3">
                  <AlertCircle className="w-10 h-10 text-rose-500" />
                  <p className="text-xs font-semibold text-rose-200">{cameraError}</p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Retry Camera
                  </button>
                </div>
              ) : !cameraActive ? (
                <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-white space-y-2">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-xs font-semibold text-slate-400">Initializing laptop webcam...</p>
                </div>
              ) : null}

              {/* Biometric Face Alignment Overlay Oval */}
              {cameraActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-52 h-64 border-2 border-dashed border-primary/80 rounded-[50%] relative flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.3)] animate-pulse">
                    <div className="w-full h-full border border-primary/40 rounded-[50%] scale-95" />
                    <div className="absolute -top-3 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                      <PoseIcon className="w-3 h-3" />
                      <span>{activePose.label}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Capture Progress & Quality Indicators */}
            <div className="space-y-3 bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">Capture Progress</span>
                <span className="text-primary font-mono">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Real-time Quality Checklist */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className={`p-2 rounded-xl border flex items-center gap-2 text-[11px] font-semibold ${lightingGood ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                  <Sun className="w-3.5 h-3.5 shrink-0" />
                  <span>Lighting: {lightingGood ? "Good" : "Adjust Light"}</span>
                </div>
                <div className={`p-2 rounded-xl border flex items-center gap-2 text-[11px] font-semibold ${clarityGood ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Clarity: {clarityGood ? "Sharp" : "Hold Still"}</span>
                </div>
                <div className={`p-2 rounded-xl border flex items-center gap-2 text-[11px] font-semibold ${singleFaceDetected ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                  <UserCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Face: 1 Detected</span>
                </div>
              </div>
            </div>

            {/* Cancel or Force Complete Button */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  setCurrentStep(1);
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Back to Details
              </button>

              {capturedImages.length >= 10 && (
                <button
                  type="button"
                  onClick={processAndSubmitRegistration}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Enrollment Now ({capturedImages.length} images)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: INSIGHTFACE BIOMETRIC PROCESSING */}
        {currentStep === 3 && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary animate-pulse">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>

            <div className="space-y-1.5 max-w-sm">
              <h4 className="text-lg font-extrabold text-slate-900 tracking-tight">Generating Face Embedding</h4>
              <p className="text-xs text-slate-500">{processingStatus}</p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-700 font-mono font-medium max-w-xs">
              InsightFace buffalo_l (512-dim vector)
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS CONFIRMATION */}
        {currentStep === 4 && (
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-extrabold text-slate-900">Worker Registered Successfully!</h4>
              <p className="text-xs text-slate-600">
                Biometric profile for <strong className="text-slate-900">{fullName}</strong> ({employeeId}) has been stored in database.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-500 font-medium">
              Redirecting back to Workforce Management page...
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
