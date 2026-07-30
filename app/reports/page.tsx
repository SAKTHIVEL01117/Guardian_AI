"use client";

import { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { FileText, Download, Sparkles, Calendar, CheckCircle2, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { fetchExecutiveReports, generateAIShiftReport, ReportItem } from "@/lib/api/reports";

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchExecutiveReports();
      setReports(data);
    } catch (err: any) {
      console.error("ReportsPage fetch error:", err);
      setErrorMsg(err.message || "Failed to load executive reports.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleGenerateAIReport = async () => {
    setIsGenerating(true);
    try {
      const newReport = await generateAIShiftReport();
      setReports((prev) => [newReport, ...prev]);
    } catch (err: any) {
      alert(err.message || "Failed to generate AI report.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
              Executive Reports &amp; AI Summaries
            </h1>
            <p className="text-xs md:text-sm text-text-secondary mt-1">
              OSHA/ISO compliance reports and LLM-assisted shift summaries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadReports}
              disabled={isLoading}
              className="p-2.5 bg-white border border-border-default hover:bg-slate-50 text-text-secondary rounded-xl transition-colors disabled:opacity-50"
              title="Refresh Reports"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={handleGenerateAIReport}
              disabled={isGenerating}
              className="bg-ai-purple hover:bg-ai-foreground text-white font-semibold text-xs px-5 py-3 rounded-xl transition-all shadow-md shadow-ai-purple/20 inline-flex items-center gap-2 disabled:opacity-70"
            >
              {isGenerating ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <Sparkles className="w-4.5 h-4.5" />
              )}
              <span>{isGenerating ? "Generating..." : "Generate AI Shift Report"}</span>
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
              onClick={loadReports}
              className="px-3 py-1 bg-danger text-white font-semibold rounded-lg text-[11px] hover:opacity-90 transition-opacity"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-slate-100 animate-pulse h-48" />
            ))
          ) : reports.length === 0 ? (
            <div className="col-span-2 p-12 text-center text-text-muted text-xs bg-card-bg rounded-3xl border border-border-default">
              No executive reports found in database.
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="bg-card-bg rounded-3xl p-6 border border-border-default shadow-card space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-primary-light text-primary uppercase">
                      {report.type}
                    </span>
                    <span className="text-xs text-text-muted">{report.date}</span>
                  </div>

                  <h3 className="text-lg font-bold text-text-primary">
                    {report.title}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {report.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-border-default flex items-center justify-between">
                  <span className="font-mono text-xs text-text-muted">
                    {report.id}
                  </span>

                  <button
                    onClick={() => alert(`Downloading ${report.title} PDF report...`)}
                    className="bg-white border border-border-default hover:bg-slate-50 text-text-primary font-semibold text-xs px-4 py-2 rounded-xl transition-all inline-flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-text-muted" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
