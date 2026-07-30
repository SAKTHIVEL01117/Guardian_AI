"use client";

import { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { BarChart3, TrendingUp, ShieldAlert, Cpu, Activity, Clock, RefreshCw, AlertCircle } from "lucide-react";
import { fetchAnalyticsData, AnalyticsData } from "@/lib/api/analytics";

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetchAnalyticsData();
      setData(res);
    } catch (err: any) {
      console.error("AnalyticsPage load error:", err);
      setErrorMsg(err.message || "Failed to load analytics from InsForge database.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
              Analytics &amp; Intelligence Hub
            </h1>
            <p className="text-xs md:text-sm text-text-secondary mt-1">
              Plant-wide workforce safety metrics, shift fatigue distribution, and AI predictive trends.
            </p>
          </div>

          <button
            onClick={loadAnalytics}
            disabled={isLoading}
            className="p-2.5 bg-white border border-border-default hover:bg-slate-50 text-text-secondary rounded-xl transition-colors disabled:opacity-50"
            title="Refresh Analytics Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-danger-light border border-danger/20 text-danger-foreground text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-danger" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={loadAnalytics}
              className="px-3 py-1 bg-danger text-white font-semibold rounded-lg text-[11px] hover:opacity-90 transition-opacity"
            >
              Retry
            </button>
          </div>
        )}

        {/* Analytics Top Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-card-bg rounded-2xl p-5 border border-border-default shadow-card space-y-2">
            <div className="text-xs font-semibold text-text-muted">Plant Safety Index</div>
            <div className="text-3xl font-extrabold text-success">
              {isLoading ? "..." : `${data?.plantSafetyIndex ?? 99.8}%`}
            </div>
            <div className="text-xs text-success font-medium">+1.4% from last week</div>
          </div>

          <div className="bg-card-bg rounded-2xl p-5 border border-border-default shadow-card space-y-2">
            <div className="text-xs font-semibold text-text-muted">Total Monitored Hours</div>
            <div className="text-3xl font-extrabold text-primary">
              {isLoading ? "..." : `${data?.totalMonitoredHours.toLocaleString() ?? "1,480"} hrs`}
            </div>
            <div className="text-xs text-text-muted">100% video coverage</div>
          </div>

          <div className="bg-card-bg rounded-2xl p-5 border border-border-default shadow-card space-y-2">
            <div className="text-xs font-semibold text-text-muted">Prevented Risks</div>
            <div className="text-3xl font-extrabold text-ai-purple">
              {isLoading ? "..." : `${data?.preventedRisksCount ?? 14} Incidents`}
            </div>
            <div className="text-xs text-ai-purple font-medium">Early AI detection</div>
          </div>

          <div className="bg-card-bg rounded-2xl p-5 border border-border-default shadow-card space-y-2">
            <div className="text-xs font-semibold text-text-muted">Shift Compliance Rate</div>
            <div className="text-3xl font-extrabold text-text-primary">
              {isLoading ? "..." : `${data?.shiftComplianceRate ?? 96.5}%`}
            </div>
            <div className="text-xs text-success font-medium">OSHA / ISO aligned</div>
          </div>
        </div>

        {/* Analytics Visual Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Department Risk Comparison */}
          <div className="bg-card-bg rounded-3xl p-8 border border-border-default shadow-card space-y-6">
            <h2 className="text-lg font-bold text-text-primary">
              Department Risk Comparison
            </h2>

            <div className="space-y-4">
              {isLoading
                ? Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="space-y-2 animate-pulse">
                      <div className="w-40 h-3 bg-slate-200 rounded" />
                      <div className="w-full h-3 bg-slate-200 rounded-full" />
                    </div>
                  ))
                : data?.departmentRisks.map((dept, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>{dept.name}</span>
                        <span
                          className={
                            dept.riskColor === "danger"
                              ? "text-danger"
                              : dept.riskColor === "warning"
                              ? "text-warning"
                              : "text-success"
                          }
                        >
                          {dept.riskLabel}
                        </span>
                      </div>
                      <div className="w-full h-3 bg-secondary-surface rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            dept.riskColor === "danger"
                              ? "bg-danger"
                              : dept.riskColor === "warning"
                              ? "bg-warning"
                              : "bg-success"
                          }`}
                          style={{ width: `${dept.riskPercent}%` }}
                        />
                      </div>
                    </div>
                  ))}
            </div>
          </div>

          {/* Card 2: 7-State Workforce Behaviour Distribution */}
          <div className="bg-card-bg rounded-3xl p-8 border border-border-default shadow-card space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-primary">
                Workforce Behaviour &amp; Focus Distribution
              </h2>
              <span className="text-xs font-bold text-primary bg-primary-light px-2.5 py-1 rounded-full">
                7-State AI Classifier
              </span>
            </div>

            <div className="space-y-3.5">
              {isLoading
                ? Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="space-y-2 animate-pulse">
                      <div className="w-32 h-3 bg-slate-200 rounded" />
                      <div className="w-full h-3 bg-slate-200 rounded-full" />
                    </div>
                  ))
                : data?.behaviourBreakdown.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-text-primary">{item.stateName}</span>
                        <span className="font-mono text-text-secondary">
                          {item.percentage}% ({item.hours} hrs)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-secondary-surface rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.color}`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </div>

        {/* Heat Stress & Thermal Risk Summary Bar */}
        <div className="bg-card-bg rounded-3xl p-8 border border-border-default shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                Heat Stress &amp; Thermal Risk Analytics
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Plant-wide ambient WBGT indices, multi-signal core temp estimations, and hardware thermal IR adapter telemetry.
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-50 text-amber-700 font-bold text-xs rounded-full border border-amber-200 shrink-0">
              Thermal IR Camera Ready
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Optimal Heat Status</span>
              <span className="text-2xl font-mono font-extrabold text-emerald-950">
                {isLoading ? "..." : data?.heatSummary.optimalCount ?? 142}
              </span>
              <span className="text-[10px] text-emerald-700 block">Normal Environment</span>
            </div>

            <div className="p-4 bg-yellow-50/60 border border-yellow-100 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-yellow-800 uppercase tracking-wider block">Elevated Heat</span>
              <span className="text-2xl font-mono font-extrabold text-yellow-950">
                {isLoading ? "..." : data?.heatSummary.elevatedHeatCount ?? 18}
              </span>
              <span className="text-[10px] text-yellow-700 block">Hydration Advised</span>
            </div>

            <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">High Heat Strain</span>
              <span className="text-2xl font-mono font-extrabold text-amber-950">
                {isLoading ? "..." : data?.heatSummary.highHeatStrainCount ?? 5}
              </span>
              <span className="text-[10px] text-amber-700 block">15m Rest Break</span>
            </div>

            <div className="p-4 bg-rose-50/60 border border-rose-100 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Thermal Danger</span>
              <span className="text-2xl font-mono font-extrabold text-rose-950">
                {isLoading ? "..." : data?.heatSummary.thermalDangerCount ?? 1}
              </span>
              <span className="text-[10px] text-rose-700 block">Critical Action</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
