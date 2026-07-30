"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import AppLayout from "@/components/layout/AppLayout";
import { AlertTriangle, ShieldCheck, CheckCircle2, Clock, Filter, RefreshCw, AlertCircle, Loader2, Camera, Eye, X } from "lucide-react";
import { fetchAllAlerts, updateAlertStatus, subscribeToRealtimeAlerts, SafetyAlertItem } from "@/lib/api/alerts";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<SafetyAlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState("All");
  const [activeScreenshot, setActiveScreenshot] = useState<string | null>(null);

  const loadAlerts = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchAllAlerts(severityFilter);
      setAlerts(data);
    } catch (err: any) {
      console.error("AlertsPage fetch error:", err);
      setErrorMsg(err.message || "Failed to load safety alerts from InsForge database.");
    } finally {
      setIsLoading(false);
    }
  }, [severityFilter]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // Subscribe to InsForge Realtime inserts on public.alerts table
  useEffect(() => {
    const unsubscribe = subscribeToRealtimeAlerts((newAlert) => {
      setAlerts((prev) => [newAlert, ...prev]);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleUpdateStatus = async (alertId: string, newStatus: "Acknowledged" | "Resolved") => {
    try {
      await updateAlertStatus(alertId, newStatus);
      await loadAlerts();
    } catch (err: any) {
      alert(err.message || "Failed to update alert status.");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
                Safety Alert Center
              </h1>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                InsForge Realtime
              </span>
            </div>
            <p className="text-xs md:text-sm text-text-secondary mt-1">
              Real-time safety events, captured frame screenshots, and live supervisor resolution logs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-white border border-border-default hover:bg-slate-50 text-text-primary text-xs font-semibold px-3 py-2.5 rounded-xl transition-all outline-none"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical Only</option>
              <option value="Advisory">Advisory / Medium</option>
            </select>

            <button
              onClick={loadAlerts}
              disabled={isLoading}
              className="p-2.5 bg-white border border-border-default hover:bg-slate-50 text-text-secondary rounded-xl transition-colors disabled:opacity-50"
              title="Refresh Safety Alerts"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-danger-light border border-danger/20 text-danger-foreground text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-danger" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={loadAlerts}
              className="px-3 py-1 bg-danger text-white font-semibold rounded-lg text-[11px] hover:opacity-90 transition-opacity"
            >
              Retry
            </button>
          </div>
        )}

        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-100 animate-pulse h-24" />
            ))
          ) : alerts.length === 0 ? (
            <div className="p-12 text-center text-text-muted text-xs bg-card-bg rounded-2xl border border-border-default">
              No safety alerts found in database matching criteria.
            </div>
          ) : (
            alerts.map((alertItem) => (
              <div
                key={alertItem.id}
                className="bg-card-bg rounded-2xl p-6 border border-border-default shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      alertItem.severity === "critical"
                        ? "bg-danger-light text-danger"
                        : alertItem.severity === "medium"
                        ? "bg-warning-light text-warning-foreground"
                        : "bg-secondary-surface text-text-secondary"
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-text-primary">
                        {alertItem.type}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          alertItem.severity === "critical"
                            ? "bg-danger-light text-danger"
                            : alertItem.severity === "medium"
                            ? "bg-warning-light text-warning-foreground"
                            : "bg-secondary-surface text-text-secondary"
                        }`}
                      >
                        {alertItem.severity}
                      </span>
                      {alertItem.status === "resolved" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-light text-success uppercase">
                          Resolved
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary">{alertItem.message}</p>
                    <div className="text-[11px] text-text-muted flex items-center gap-3 pt-0.5">
                      <span>Target: {alertItem.worker}</span>
                      <span>•</span>
                      <span>Timestamp: {alertItem.time}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Screenshot Thumbnail button if available */}
                  {alertItem.screenshot_url && (
                    <button
                      onClick={() => setActiveScreenshot(alertItem.screenshot_url || null)}
                      className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-slate-800 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Screenshot</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleUpdateStatus(alertItem.id, "Acknowledged")}
                    disabled={alertItem.status === "acknowledged" || alertItem.status === "resolved"}
                    className="bg-white border border-border-default hover:bg-slate-50 text-text-primary font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs disabled:opacity-50"
                  >
                    {alertItem.status === "acknowledged" ? "Acknowledged" : "Acknowledge"}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(alertItem.id, "Resolved")}
                    disabled={alertItem.status === "resolved"}
                    className="bg-primary hover:bg-primary-hover text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs disabled:opacity-50"
                  >
                    {alertItem.status === "resolved" ? "Marked Resolved" : "Mark Resolved"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Screenshot Modal Lightbox */}
        {activeScreenshot && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-4 max-w-2xl w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between text-white px-2">
                <span className="font-bold text-sm flex items-center gap-2">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  Captured Incident Screenshot
                </span>
                <button
                  onClick={() => setActiveScreenshot(null)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-slate-800 bg-black">
                {activeScreenshot.startsWith("data:") ? (
                  <img src={activeScreenshot} alt="Incident Frame" className="w-full h-full object-contain" />
                ) : (
                  <Image src={activeScreenshot} alt="Incident Frame" fill className="object-contain" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
