"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import AppLayout from "@/components/layout/AppLayout";
import {
  Users,
  UserCheck,
  AlertTriangle,
  Activity,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Download,
  Lightbulb,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  AlertCircle,
  Zap,
} from "lucide-react";
import {
  fetchDashboardSummary,
  DashboardSummaryData,
} from "@/lib/api/dashboard";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const summaryData = await fetchDashboardSummary();
      setData(summaryData);
    } catch (err: any) {
      console.error("Dashboard page load error:", err);
      setErrorMsg(err.message || "Failed to load live dashboard statistics.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <AppLayout>
      {/* Page Title & Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
            Operations Overview
          </h1>
          <p className="text-xs md:text-sm text-text-secondary mt-1.5 max-w-3xl leading-relaxed">
            Today&apos;s Summary: All systems are nominal across Sector A and B.{" "}
            <span className="font-bold text-success">
              Safety Index is at an all-time high of {data?.safetyIndex ?? 99.8}%
            </span>
            . Shift transition completed without incidents.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={loadDashboardData}
            disabled={isLoading}
            className="p-2.5 bg-white border border-border-default hover:bg-slate-50 text-text-secondary rounded-xl transition-colors disabled:opacity-50"
            title="Refresh Operations Center"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button className="bg-white border border-border-default hover:bg-slate-50 text-text-primary text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs inline-flex items-center gap-2">
            <Calendar className="w-4 h-4 text-text-muted" />
            <span>{currentDateFormatted}</span>
          </button>

          <Link
            href="/reports"
            className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4.5 py-2.5 rounded-xl transition-all shadow-sm shadow-primary/20 inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </Link>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-danger-light border border-danger/20 text-danger-foreground text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-danger" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={loadDashboardData}
            className="px-3 py-1 bg-danger text-white font-semibold rounded-lg text-[11px] hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      )}

      {/* Row 1: 6 KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Card 1: Total Workers */}
        <div className="bg-card-bg rounded-2xl p-5 border border-border-default shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-success bg-success-light px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>
          <div className="text-xs font-medium text-text-muted">Total Workers</div>
          <div className="text-2xl font-extrabold text-text-primary tracking-tight">
            {isLoading ? <span className="animate-pulse">...</span> : data?.totalWorkers ?? 0}
          </div>
        </div>

        {/* Card 2: Currently Active */}
        <div className="bg-card-bg rounded-2xl p-5 border border-border-default shadow-card space-y-2">
          <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="text-xs font-medium text-text-muted">Currently Active</div>
          <div className="text-2xl font-extrabold text-text-primary tracking-tight">
            {isLoading ? <span className="animate-pulse">...</span> : data?.activeWorkers ?? 0}
          </div>
        </div>

        {/* Card 3: Fatigue Alerts */}
        <div className="bg-card-bg rounded-2xl p-5 border border-border-default shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-danger-light text-danger flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-danger animate-pulse" />
          </div>
          <div className="text-xs font-medium text-text-muted">Fatigue Alerts</div>
          <div className="text-xl font-extrabold text-danger tracking-tight">
            {isLoading ? <span className="animate-pulse">...</span> : `${data?.fatigueAlertsCount ?? 0} High Risk`}
          </div>
        </div>

        {/* Card 4: Avg Fatigue Score */}
        <div className="bg-card-bg rounded-2xl p-5 border border-border-default shadow-card space-y-2">
          <div className="w-9 h-9 rounded-xl bg-secondary-surface text-text-secondary flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div className="text-xs font-medium text-text-muted">Avg Fatigue Score</div>
          <div className="text-2xl font-extrabold text-text-primary tracking-tight">
            {isLoading ? <span className="animate-pulse">...</span> : `${data?.avgFatigueScore ?? 14}%`}
          </div>
        </div>

        {/* Card 5: Productivity */}
        <div className="bg-card-bg rounded-2xl p-5 border border-border-default shadow-card space-y-2">
          <div className="w-9 h-9 rounded-xl bg-success-light text-success flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-xs font-medium text-text-muted">Productivity</div>
          <div className="text-2xl font-extrabold text-text-primary tracking-tight">
            {isLoading ? <span className="animate-pulse">...</span> : `${data?.productivityIndex ?? 94}%`}
          </div>
        </div>

        {/* Card 6: Safety Index */}
        <div className="bg-card-bg rounded-2xl p-5 border border-border-default shadow-card space-y-2">
          <div className="w-9 h-9 rounded-xl bg-success-light text-success flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-xs font-medium text-text-muted">Safety Index</div>
          <div className="text-2xl font-extrabold text-success tracking-tight">
            {isLoading ? <span className="animate-pulse">...</span> : `${data?.safetyIndex ?? 99.8}%`}
          </div>
        </div>
      </div>

      {/* Live Workforce Behaviour & Attention Summary Bar */}
      <div className="bg-card-bg rounded-2xl p-5 border border-border-default shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-default/60 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-text-primary">
              Live Workforce Behaviour Analysis Over Time
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-text-muted">
            <span>Plant-wide Attention Index: <strong className="text-success">{data?.behaviourSummary.focusIndex ?? 91.8}%</strong></span>
            <span>•</span>
            <span>Total Active: <strong className="text-primary">{data?.behaviourSummary.totalActiveWorkHours ?? 184.5} hrs</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
          <div className="p-3 bg-cyan-50/60 border border-cyan-100 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-cyan-800 uppercase tracking-wider block">Working</span>
            <span className="text-lg font-mono font-extrabold text-cyan-950">
              {isLoading ? "..." : data?.behaviourSummary.behaviourStateCounts.working ?? 62}
            </span>
            <span className="text-[10px] text-cyan-700 block">Operators</span>
          </div>

          <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Focused</span>
            <span className="text-lg font-mono font-extrabold text-emerald-950">
              {isLoading ? "..." : data?.behaviourSummary.behaviourStateCounts.focused ?? 45}
            </span>
            <span className="text-[10px] text-emerald-700 block">High Attention</span>
          </div>

          <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Idle</span>
            <span className="text-lg font-mono font-extrabold text-amber-950">
              {isLoading ? "..." : data?.behaviourSummary.behaviourStateCounts.idle ?? 12}
            </span>
            <span className="text-[10px] text-amber-700 block">Paused Task</span>
          </div>

          <div className="p-3 bg-orange-50/60 border border-orange-100 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider block">Distracted</span>
            <span className="text-lg font-mono font-extrabold text-orange-950">
              {isLoading ? "..." : data?.behaviourSummary.behaviourStateCounts.distracted ?? 5}
            </span>
            <span className="text-[10px] text-orange-700 block">Gaze Wander</span>
          </div>

          <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Sleeping</span>
            <span className="text-lg font-mono font-extrabold text-rose-950">
              {isLoading ? "..." : data?.behaviourSummary.behaviourStateCounts.sleeping ?? 1}
            </span>
            <span className="text-[10px] text-rose-700 block">Critical Risk</span>
          </div>

          <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">Away</span>
            <span className="text-lg font-mono font-extrabold text-slate-900">
              {isLoading ? "..." : data?.behaviourSummary.behaviourStateCounts.leftWorkstation ?? 3}
            </span>
            <span className="text-[10px] text-slate-600 block">Left Station</span>
          </div>

          <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">Phone Usage</span>
            <span className="text-lg font-mono font-extrabold text-purple-950">
              {isLoading ? "..." : data?.behaviourSummary.behaviourStateCounts.excessivePhoneUsage ?? 2}
            </span>
            <span className="text-[10px] text-purple-700 block">Flagged</span>
          </div>
        </div>
      </div>

      {/* AI Predictive Intelligence & Risk Forecast Panel (Decoupled Async Engine) */}
      <div className="bg-card-bg rounded-2xl p-6 border border-border-default shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-default/60 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-bold text-text-primary">
                AI Predictive Intelligence &amp; Risk Forecast
              </h2>
              <p className="text-xs text-text-secondary">
                Decoupled asynchronous risk predictions derived from historical sessions, fatigue trends &amp; telemetry.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
            Next 30-Min AI Model
          </span>
        </div>

        {/* 5 Core Predictive Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Fatigue (Next 30m)</span>
            <div className="text-xl font-extrabold font-mono text-slate-900">
              {isLoading ? "..." : `${data?.predictiveReport.fatigue_risk_30m.score}%`}
            </div>
            <div className="text-[10px] font-mono text-amber-600 font-bold">
              {data?.predictiveReport.fatigue_risk_30m.trend}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Productivity Loss</span>
            <div className="text-xl font-extrabold font-mono text-indigo-600">
              {isLoading ? "..." : `-${data?.predictiveReport.productivity_decline.rate_percent}%`}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Next 60 mins</div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Burnout Risk</span>
            <div className="text-xl font-extrabold font-mono text-amber-600">
              {isLoading ? "..." : `${data?.predictiveReport.burnout_risk.score}%`}
            </div>
            <div className="text-[10px] font-bold text-amber-700 font-mono">
              {data?.predictiveReport.burnout_risk.level}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Heat Stress Risk</span>
            <div className="text-xl font-extrabold font-mono text-cyan-600">
              {isLoading ? "..." : `${data?.predictiveReport.heat_stress_risk.score}%`}
            </div>
            <div className="text-[10px] font-bold text-cyan-700 font-mono">
              {data?.predictiveReport.heat_stress_risk.level}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3.5 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Accident Probability</span>
            <div className="text-xl font-extrabold font-mono text-rose-600">
              {isLoading ? "..." : `${data?.predictiveReport.accident_probability.percent}%`}
            </div>
            <div className="text-[10px] font-bold text-rose-700 font-mono">
              {data?.predictiveReport.accident_probability.risk_category}
            </div>
          </div>
        </div>

        {/* Actionable AI Recommendations Grid */}
        <div className="space-y-2 pt-1">
          <div className="text-xs font-bold text-text-primary uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Actionable AI Recommendations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {(data?.predictiveReport.recommendations || []).map((rec, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {rec.type}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-white ${rec.color}`}>
                      {rec.priority}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs mt-1">{rec.title}</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{rec.description}</p>
                </div>
                <button className="w-full mt-2 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold text-[11px] rounded-xl transition-colors">
                  {rec.action_text}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Trend Chart (Span 8) & Recent AI Insights (Span 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Safety & Productivity Trend */}
        <div className="lg:col-span-8 bg-card-bg rounded-2xl p-6 border border-border-default shadow-card space-y-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                Safety &amp; Productivity Trend
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Real-time correlation analysis over the last 24 hours
              </p>
            </div>

            {/* Legends */}
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-text-secondary">Safety</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-success border-2 border-dashed border-white" />
                <span className="text-text-secondary">Productivity</span>
              </div>
            </div>
          </div>

          {/* SVG Smooth Curve Graph Representation */}
          <div className="relative h-64 w-full pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 800 240" fill="none">
              {/* Y Grid Lines */}
              <line x1="0" y1="20" x2="800" y2="20" stroke="#F1F5F9" strokeDasharray="4 4" />
              <text x="0" y="15" fill="#94A3B8" fontSize="10">100%</text>

              <line x1="0" y1="80" x2="800" y2="80" stroke="#F1F5F9" strokeDasharray="4 4" />
              <text x="0" y="75" fill="#94A3B8" fontSize="10">75%</text>

              <line x1="0" y1="140" x2="800" y2="140" stroke="#F1F5F9" strokeDasharray="4 4" />
              <text x="0" y="135" fill="#94A3B8" fontSize="10">50%</text>

              <line x1="0" y1="200" x2="800" y2="200" stroke="#F1F5F9" strokeDasharray="4 4" />
              <text x="0" y="195" fill="#94A3B8" fontSize="10">25%</text>

              <text x="0" y="235" fill="#94A3B8" fontSize="10">0%</text>

              {/* Safety Smooth Blue Curve */}
              <path
                d="M 20 140 C 120 70, 220 210, 320 150 C 420 80, 520 220, 620 180 C 700 40, 750 60, 790 50"
                fill="none"
                stroke="#2563EB"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Productivity Dashed Green Curve */}
              <path
                d="M 20 160 C 140 170, 260 110, 380 90 C 500 130, 620 120, 740 160 C 770 170, 785 175, 790 170"
                fill="none"
                stroke="#16A34A"
                strokeWidth="3"
                strokeDasharray="6 6"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Recent AI Insights Panel */}
        <div className="lg:col-span-4 bg-card-bg rounded-2xl p-6 border border-border-default shadow-card flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2.5 text-primary">
            <Lightbulb className="w-5 h-5" />
            <h2 className="text-base font-bold text-text-primary">
              Recent AI Insights
            </h2>
          </div>

          <div className="space-y-3">
            {isLoading
              ? Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-100 animate-pulse h-20" />
                ))
              : data?.recentInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className={`p-4 rounded-xl border-l-4 space-y-1 ${
                      insight.type === "warning"
                        ? "bg-warning-light/40 border-warning"
                        : insight.type === "success"
                        ? "bg-success-light/40 border-success"
                        : "bg-primary-light/40 border-primary"
                    }`}
                  >
                    <div
                      className={`text-[10px] font-bold tracking-wider uppercase ${
                        insight.type === "warning"
                          ? "text-warning-foreground"
                          : insight.type === "success"
                          ? "text-success-foreground"
                          : "text-primary"
                      }`}
                    >
                      {insight.category}
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {insight.text}
                    </p>
                  </div>
                ))}
          </div>

          <Link
            href="/analytics"
            className="w-full text-center text-xs font-semibold text-primary hover:text-primary-hover transition-colors py-2 block"
          >
            View All Insights
          </Link>
        </div>
      </div>

      {/* Row 3: Recent Alerts (Span 8) & Morning Shift Alpha (Span 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Alerts List */}
        <div className="lg:col-span-8 bg-card-bg rounded-2xl p-6 border border-border-default shadow-card space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-primary">
              Recent Alerts
            </h2>

            <Link
              href="/alerts"
              className="text-xs font-semibold text-text-secondary hover:text-text-primary inline-flex items-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>View All Alerts</span>
            </Link>
          </div>

          {/* Alerts Items Table */}
          <div className="space-y-3">
            {isLoading
              ? Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-100 animate-pulse h-14" />
                ))
              : data?.recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary-surface/50 border border-border-default/60 hover:bg-secondary-surface transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          alert.severity === "Critical"
                            ? "bg-danger"
                            : alert.severity === "Resolved"
                            ? "bg-success"
                            : "bg-primary"
                        }`}
                      />
                      <div>
                        <div className="text-sm font-bold text-text-primary">
                          {alert.title}
                        </div>
                        <div className="text-xs text-text-muted mt-0.5">
                          {alert.workerId} • {alert.timestamp}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        alert.severity === "Critical"
                          ? "bg-danger-light text-danger"
                          : alert.severity === "Resolved"
                          ? "bg-success-light text-success"
                          : "bg-secondary-surface text-text-secondary"
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                ))}
          </div>
        </div>

        {/* Morning Shift Alpha Summary Card */}
        <div className="lg:col-span-4 bg-card-bg rounded-2xl overflow-hidden border border-border-default shadow-card flex flex-col justify-between">
          <div className="relative h-44 w-full bg-slate-900">
            <Image
              src="/images/hero.png"
              alt="Morning Shift Alpha Facility"
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="text-lg font-bold">{data?.morningShiftSummary.name ?? "Morning Shift Alpha"}</h3>
              <div className="text-xs text-slate-300">
                {data?.morningShiftSummary.timeRange ?? "06:00 - 14:00"} • {data?.morningShiftSummary.personnelCount ?? 64} Personnel
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Efficiency Score Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-secondary">
                  Efficiency Score
                </span>
                <span className="font-bold text-success">
                  {data?.morningShiftSummary.efficiencyScore ?? 97.2}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-secondary-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-success rounded-full transition-all"
                  style={{ width: `${data?.morningShiftSummary.efficiencyScore ?? 97.2}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 text-xs text-text-secondary">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                <span>{data?.morningShiftSummary.safetyChecksCount ?? 32} Safety Checks Complete</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span>{data?.morningShiftSummary.unitsProcessed.toLocaleString() ?? "1,240"} Units Processed</span>
              </div>
            </div>

            <Link
              href="/reports"
              className="w-full bg-white border border-border-default hover:bg-slate-50 text-primary font-semibold py-2.5 rounded-xl text-xs transition-colors shadow-xs text-center block"
            >
              View Shift Details
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
