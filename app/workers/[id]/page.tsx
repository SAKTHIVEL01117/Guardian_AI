"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import {
  ArrowLeft,
  Download,
  Award,
  Shield,
  Activity,
  Heart,
  Footprints,
  Thermometer,
  Lightbulb,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  fetchWorkerProfile,
  WorkerProfileData,
} from "@/lib/api/worker-details";

export default function WorkerProfilePage() {
  const params = useParams();
  const rawId = (params?.id as string) || "SAFE-7742";

  const [profile, setProfile] = useState<WorkerProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchWorkerProfile(rawId);
      if (!data) {
        throw new Error("Worker profile not found in database.");
      }
      setProfile(data);
    } catch (err: any) {
      console.error("WorkerProfilePage fetch error:", err);
      setErrorMsg(err.message || "Failed to load worker profile from InsForge database.");
    } finally {
      setIsLoading(false);
    }
  }, [rawId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Back Link Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/workers"
              className="p-2 rounded-xl bg-white border border-border-default hover:bg-slate-50 text-text-secondary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-text-primary">
              Worker Profile
            </h1>
          </div>

          <button
            onClick={loadProfile}
            disabled={isLoading}
            className="p-2.5 bg-white border border-border-default hover:bg-slate-50 text-text-secondary rounded-xl transition-colors disabled:opacity-50"
            title="Refresh Worker Profile"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Error State */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-danger-light border border-danger/20 text-danger-foreground text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-danger" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={loadProfile}
              className="px-3 py-1 bg-danger text-white font-semibold rounded-lg text-[11px] hover:opacity-90 transition-opacity"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State Skeleton */}
        {isLoading ? (
          <div className="bg-card-bg rounded-3xl p-8 border border-border-default shadow-card animate-pulse space-y-4">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-slate-200" />
              <div className="space-y-2">
                <div className="w-48 h-6 bg-slate-200 rounded" />
                <div className="w-64 h-4 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        ) : profile ? (
          <>
            {/* Top Hero Profile Card */}
            <div className="bg-card-bg rounded-3xl p-6 md:p-8 border border-border-default shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-border-default shrink-0 bg-slate-100">
                  <Image
                    src={profile.avatar}
                    alt={profile.name}
                    fill
                    priority
                    sizes="96px"
                    className="object-cover"
                  />
                  <span className="absolute bottom-2 right-2 bg-success text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ring-2 ring-white">
                    {profile.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">
                    {profile.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
                    <span className="font-mono bg-secondary-surface px-2.5 py-1 rounded-lg">
                      ID: {profile.employeeId}
                    </span>
                    <span>Station: {profile.station}</span>
                    <span>Joined: {profile.joinedDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                <button className="bg-white border border-border-default hover:bg-slate-50 text-text-primary text-xs font-semibold px-4.5 py-3 rounded-xl transition-all shadow-xs inline-flex items-center gap-2">
                  <Download className="w-4 h-4 text-text-muted" />
                  <span>Export Report</span>
                </button>

                <button className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-5 py-3 rounded-xl transition-all shadow-md shadow-primary/20 inline-flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>Assign Training</span>
                </button>
              </div>
            </div>

            {/* Shift Tracking Telemetry Card */}
            <div className="bg-card-bg rounded-3xl p-6 md:p-8 border border-border-default shadow-card space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-text-primary">
                      Shift Tracking &amp; Monitoring Telemetry
                    </h3>
                    <span className="bg-cyan-50 text-cyan-700 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-cyan-200">
                      InsForge DB Realtime
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Calculated telemetry from active monitoring sessions, fatigue logs, and behaviour engine records.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-slate-900 text-white shrink-0">
                  {profile.shiftMetrics.attendanceStatus}
                </span>
              </div>

              {/* 8 Shift Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Shift Start</span>
                  <span className="font-mono font-extrabold text-slate-900 text-xs block">{profile.shiftMetrics.shiftStart}</span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Shift End</span>
                  <span className="font-mono font-extrabold text-slate-900 text-xs block truncate">{profile.shiftMetrics.shiftEnd}</span>
                </div>

                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Active Work</span>
                  <span className="font-mono font-extrabold text-emerald-950 text-xs block">
                    {Math.floor(profile.shiftMetrics.totalActiveWorkMins / 60)}h {profile.shiftMetrics.totalActiveWorkMins % 60}m
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Break Time</span>
                  <span className="font-mono font-extrabold text-slate-800 text-xs block">{profile.shiftMetrics.totalBreakMins} mins</span>
                </div>

                <div className="p-3.5 bg-yellow-50/60 border border-yellow-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-yellow-800 uppercase tracking-wider block">Avg Fatigue</span>
                  <span className="font-mono font-extrabold text-yellow-950 text-xs block">{profile.shiftMetrics.avgFatigueScore}%</span>
                </div>

                <div className="p-3.5 bg-indigo-50/60 border border-indigo-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">Avg Productivity</span>
                  <span className="font-mono font-extrabold text-indigo-950 text-xs block">{profile.shiftMetrics.avgProductivityScore}%</span>
                </div>

                <div className="p-3.5 bg-cyan-50/60 border border-cyan-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-cyan-800 uppercase tracking-wider block">Primary State</span>
                  <span className="font-mono font-extrabold text-cyan-950 text-xs block truncate">{profile.shiftMetrics.behaviourSummaryState}</span>
                </div>

                <div className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Incidents</span>
                  <span className="font-mono font-extrabold text-rose-950 text-xs block">{profile.shiftMetrics.incidentCount} logged</span>
                </div>
              </div>
            </div>

            {/* Predictive Risk & Next 30-Min AI Forecast Card */}
            <div className="bg-card-bg rounded-3xl p-6 md:p-8 border border-border-default shadow-card space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-text-primary">
                      Predictive Risk &amp; Next 30-Min AI Forecast
                    </h3>
                    <span className="bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-indigo-200">
                      Asynchronous Decoupled Model
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Projections derived from historical fatigue records, posture trends, and thermal indices.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                  Accident Probability: {profile.predictiveReport.accident_probability.percent}% ({profile.predictiveReport.accident_probability.risk_category})
                </span>
              </div>

              {/* 5 Predictive Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Fatigue (30m)</span>
                  <div className="text-base font-extrabold font-mono text-slate-900">
                    {profile.predictiveReport.fatigue_risk_30m.score}%
                  </div>
                  <div className="text-[10px] font-mono text-amber-600 font-bold">
                    {profile.predictiveReport.fatigue_risk_30m.trend}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Productivity Decline</span>
                  <div className="text-base font-extrabold font-mono text-indigo-600">
                    -{profile.predictiveReport.productivity_decline.rate_percent}%
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">Next 60 mins</div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Burnout Risk</span>
                  <div className="text-base font-extrabold font-mono text-amber-600">
                    {profile.predictiveReport.burnout_risk.score}%
                  </div>
                  <div className="text-[10px] font-bold text-amber-700 font-mono">
                    {profile.predictiveReport.burnout_risk.level}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Heat Stress Risk</span>
                  <div className="text-base font-extrabold font-mono text-cyan-600">
                    {profile.predictiveReport.heat_stress_risk.score}%
                  </div>
                  <div className="text-[10px] font-bold text-cyan-700 font-mono">
                    {profile.predictiveReport.heat_stress_risk.level}
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 p-3.5 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Accident Risk</span>
                  <div className="text-base font-extrabold font-mono text-rose-600">
                    {profile.predictiveReport.accident_probability.percent}%
                  </div>
                  <div className="text-[10px] font-bold text-rose-700 font-mono">
                    {profile.predictiveReport.accident_probability.risk_category}
                  </div>
                </div>
              </div>

              {/* Actionable Recommendations List */}
              <div className="space-y-3 pt-1">
                <div className="text-xs font-bold text-text-primary uppercase tracking-wider text-[10px]">
                  Actionable AI Recommendations
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {profile.predictiveReport.recommendations.map((rec, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {rec.type}
                          </span>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white ${rec.color}`}>
                            {rec.priority}
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 text-sm">{rec.title}</div>
                        <p className="text-xs text-slate-600 leading-relaxed">{rec.description}</p>
                      </div>
                      <button
                        onClick={() => alert(`Triggered Action: ${rec.title}`)}
                        className="w-full mt-2 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold text-xs rounded-xl transition-colors"
                      >
                        {rec.action_text}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3 Columns Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Column 1 (Left - Personal Details & Biometrics, Span 4) */}
              <div className="lg:col-span-4 space-y-6">
                {/* Personal Details Card */}
                <div className="bg-card-bg rounded-3xl p-6 border border-border-default shadow-card space-y-5">
                  <h3 className="text-base font-bold text-text-primary">
                    Personal Details
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="font-bold text-text-muted uppercase tracking-wider text-[10px]">
                        Position
                      </div>
                      <div className="font-semibold text-text-primary text-sm mt-0.5">
                        {profile.role}
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-text-muted uppercase tracking-wider text-[10px]">
                        Shift Schedule
                      </div>
                      <div className="font-semibold text-text-primary mt-0.5">
                        {profile.shift}
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-text-muted uppercase tracking-wider text-[10px]">
                        Emergency Contact
                      </div>
                      <div className="font-semibold text-text-primary mt-0.5">
                        {profile.emergencyContactName}
                      </div>
                      <div className="text-primary font-medium mt-0.5">
                        {profile.emergencyContactPhone}
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-text-muted uppercase tracking-wider text-[10px] mb-2">
                        Certifications
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {profile.certifications.map((cert, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-[11px]"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Biometrics Card */}
                <div className="bg-card-bg rounded-3xl p-6 border border-border-default shadow-card space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-text-primary">
                      Biometrics
                    </h3>
                    <Activity className="w-4 h-4 text-text-muted" />
                  </div>

                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-secondary-surface/40">
                      <div className="flex items-center gap-2.5 text-xs text-text-secondary">
                        <Heart className="w-4 h-4 text-danger" />
                        <span>Avg. Heart Rate</span>
                      </div>
                      <span className="text-sm font-bold text-text-primary">
                        {profile.heartRate} BPM
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-secondary-surface/40">
                      <div className="flex items-center gap-2.5 text-xs text-text-secondary">
                        <Footprints className="w-4 h-4 text-primary" />
                        <span>Step Count (Today)</span>
                      </div>
                      <span className="text-sm font-bold text-text-primary">
                        {profile.stepCount.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-secondary-surface/40">
                      <div className="flex items-center gap-2.5 text-xs text-text-secondary">
                        <Thermometer className="w-4 h-4 text-warning" />
                        <span>Core Temp</span>
                      </div>
                      <span className="text-sm font-bold text-text-primary">
                        {profile.coreTemp} °F
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2 (Center - Trends & Performance, Span 5) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Weekly Fatigue Trend Card */}
                <div className="bg-card-bg rounded-3xl p-6 border border-border-default shadow-card space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-text-primary">
                        Weekly Fatigue Trend
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5">
                        Safety index fluctuation over last 7 days
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-success-light text-success-foreground">
                      -12% Improvement
                    </span>
                  </div>

                  {/* Smooth Curve SVG */}
                  <div className="h-44 w-full pt-4">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160" fill="none">
                      <path
                        d="M 10 100 C 80 110, 160 120, 240 80 C 320 40, 400 130, 490 60"
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Worker Behaviour & Attention History Card */}
                <div className="bg-card-bg rounded-3xl p-6 border border-border-default shadow-card space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-text-primary">
                        Behaviour &amp; Attention History
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5">
                        Continuous task activity, focus streaks, and break logs over time
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                      Live Classified
                    </span>
                  </div>

                  {/* 4 Behaviour KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-cyan-50/60 border border-cyan-100 rounded-2xl text-center space-y-0.5">
                      <span className="text-[10px] font-bold text-cyan-800 uppercase tracking-wider block">Active Work</span>
                      <span className="text-lg font-mono font-extrabold text-cyan-950">{profile.behaviourStats?.activeWorkHours ?? 4.1} hrs</span>
                    </div>

                    <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-2xl text-center space-y-0.5">
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Idle Time</span>
                      <span className="text-lg font-mono font-extrabold text-amber-950">{profile.behaviourStats?.idleHours ?? 0.5} hrs</span>
                    </div>

                    <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-2xl text-center space-y-0.5">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Work Streak</span>
                      <span className="text-lg font-mono font-extrabold text-emerald-950">{profile.behaviourStats?.continuousStreakMins ?? 45} mins</span>
                    </div>

                    <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-center space-y-0.5">
                      <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">Movements</span>
                      <span className="text-lg font-mono font-extrabold text-indigo-950">{profile.behaviourStats?.avgMovementFreq ?? 4.2} / min</span>
                    </div>
                  </div>

                  {/* Timeline History Event List */}
                  <div className="space-y-2.5 pt-2">
                    <div className="text-xs font-bold text-text-primary uppercase tracking-wider">
                      Activity Event Timeline
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {profile.behaviourStats?.historyTimeline.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-secondary-surface/40 border border-border-default/60 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-text-muted text-[11px] font-bold">{item.timestamp}</span>
                            <span className="font-semibold text-text-primary">{item.state}</span>
                          </div>
                          <div className="font-mono text-[11px] text-text-secondary flex items-center gap-2">
                            <span>Streak: <strong className="text-emerald-600">{item.continuousStreakMins}m</strong></span>
                            <span>•</span>
                            <span>Idle: <strong className="text-amber-600">{item.idleMins}m</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Monthly Impact & Attendance Card */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card-bg rounded-3xl p-5 border border-border-default shadow-card space-y-3">
                    <div className="text-xs font-bold text-text-primary">
                      Monthly Impact
                    </div>
                    <div className="h-20 flex items-end justify-between gap-1.5 pt-2">
                      <div className="w-full bg-primary-light rounded-t-md h-[40%]" />
                      <div className="w-full bg-primary-light rounded-t-md h-[70%]" />
                      <div className="w-full bg-primary-light rounded-t-md h-[55%]" />
                      <div className="w-full bg-primary rounded-t-md h-[90%]" />
                      <div className="w-full bg-primary-light rounded-t-md h-[30%]" />
                    </div>
                    <div className="text-[10px] text-text-muted text-center">
                      Relative Stress Levels by Week
                    </div>
                  </div>

                  <div className="bg-card-bg rounded-3xl p-5 border border-border-default shadow-card space-y-3 flex flex-col justify-between">
                    <div className="text-xs font-bold text-text-primary">
                      Attendance
                    </div>
                    <div>
                      <div className="text-2xl font-extrabold text-text-primary tracking-tight">
                        {profile.attendanceRate}%
                      </div>
                      <div className="text-[10px] font-bold text-success mt-0.5">
                        +2.1% from last month
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border-default/60 flex items-center justify-between text-[11px]">
                      <span className="text-text-muted font-medium">On-time Rate</span>
                      <span className="font-bold text-success">{profile.onTimeRate}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3 (Right - Health Score & AI Recommendations, Span 3) */}
              <div className="lg:col-span-3 space-y-6">
                {/* Current Health Score Card */}
                <div className="bg-card-bg rounded-3xl p-6 border border-border-default shadow-card space-y-4 flex flex-col items-center text-center">
                  <div className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Current Health Score
                  </div>

                  <div className="relative w-36 h-36 flex items-center justify-center my-2">
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
                        stroke="#2563EB"
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray="301.59"
                        strokeDashoffset={301.59 * (1 - profile.healthScore / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-4xl font-extrabold text-text-primary tracking-tight">
                      {profile.healthScore}
                    </span>
                  </div>

                  <div>
                    <div className="text-sm font-bold text-success">
                      Stable State
                    </div>
                    <div className="text-[11px] text-text-muted mt-0.5">
                      Last sync: 2 min ago
                    </div>
                  </div>
                </div>

                {/* AI Recommendations Card */}
                <div className="bg-indigo-50/40 rounded-3xl p-6 border border-indigo-100 shadow-card space-y-4">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                    <Lightbulb className="w-4 h-4 text-indigo-600" />
                    <span>AI Recommendations</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    {profile.recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3.5 rounded-2xl border border-indigo-100/80 shadow-xs space-y-1"
                      >
                        <div className="font-bold text-indigo-950">
                          {rec.title}
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          {rec.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AppLayout>
  );
}
