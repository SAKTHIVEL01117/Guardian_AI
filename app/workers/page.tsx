"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import AppLayout from "@/components/layout/AppLayout";
import {
  UserPlus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Upload,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  fetchWorkers,
  deleteWorker,
  WorkerItem,
} from "@/lib/api/workers";
import RegisterWorkerModal from "@/components/workers/RegisterWorkerModal";

export default function WorkersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedShift, setSelectedShift] = useState("Morning");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState<WorkerItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Live Database State
  const [workers, setWorkers] = useState<WorkerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch Workers from InsForge Database
  const loadWorkersData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchWorkers({
        searchQuery,
        department: selectedDept,
        shift: selectedShift,
        status: selectedStatus,
      });
      setWorkers(data);
    } catch (err: any) {
      console.error("WorkersPage fetch error:", err);
      setErrorMsg(err.message || "Failed to load workers from InsForge database.");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedDept, selectedShift, selectedStatus]);

  useEffect(() => {
    loadWorkersData();
  }, [loadWorkersData]);

  const handleDeleteConfirm = async () => {
    if (!workerToDelete) return;
    setIsDeleting(true);
    try {
      await deleteWorker(workerToDelete.id);
      setDeleteModalOpen(false);
      setWorkerToDelete(null);
      await loadWorkersData();
    } catch (err: any) {
      alert(err.message || "Failed to delete worker.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
              Workforce Management
            </h1>
            <p className="text-xs md:text-sm text-text-secondary mt-1">
              Monitor, manage, and verify personnel status across the facility.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadWorkersData}
              disabled={isLoading}
              className="p-3 bg-white border border-border-default hover:bg-slate-50 text-text-secondary rounded-xl transition-colors disabled:opacity-50"
              title="Refresh Worker List"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setRegisterModalOpen(true)}
              className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-5 py-3 rounded-xl transition-all shadow-md shadow-primary/20 inline-flex items-center gap-2 shrink-0 active:scale-[0.98]"
            >
              <UserPlus className="w-4.5 h-4.5" />
              <span>Register New Worker</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-card-bg rounded-2xl p-4 border border-border-default shadow-card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Bar (Span 5) */}
          <div className="lg:col-span-5 relative flex items-center">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name, ID or Role..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-border-default rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>

          {/* Department Filter (Span 2) */}
          <div className="lg:col-span-2 space-y-1">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-border-default rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
            >
              <option value="All">All Departments</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Logistics">Logistics</option>
              <option value="Fabrication">Fabrication</option>
              <option value="Quality Control">Quality Control</option>
            </select>
          </div>

          {/* Shift Filter (Span 2) */}
          <div className="lg:col-span-2 space-y-1">
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-border-default rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
            >
              <option value="Morning">Morning (06-14)</option>
              <option value="Evening">Evening (14-22)</option>
              <option value="Night">Night (22-06)</option>
              <option value="All">All Shifts</option>
            </select>
          </div>

          {/* Status Filter (Span 2) */}
          <div className="lg:col-span-2 space-y-1">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-border-default rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Break">On Break</option>
              <option value="Away">Away</option>
              <option value="Offline">Offline</option>
            </select>
          </div>

          {/* Filter Action Icon Button (Span 1) */}
          <div className="lg:col-span-1 flex justify-end">
            <button
              onClick={loadWorkersData}
              className="p-2.5 bg-secondary-surface text-text-secondary hover:text-text-primary rounded-xl border border-border-default transition-colors"
            >
              <Filter className="w-4 h-4" />
            </button>
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
              onClick={loadWorkersData}
              className="px-3 py-1 bg-danger text-white font-semibold rounded-lg text-[11px] hover:opacity-90 transition-opacity"
            >
              Retry
            </button>
          </div>
        )}

        {/* Worker Table */}
        <div className="bg-card-bg rounded-2xl border border-border-default shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-secondary-surface/70 border-b border-border-default text-text-secondary font-semibold">
                  <th className="py-4 px-6">Worker</th>
                  <th className="py-4 px-6">Employee ID</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Current Status</th>
                  <th className="py-4 px-6">Fatigue Score</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-full bg-slate-200" />
                          <div className="space-y-1.5">
                            <div className="w-28 h-3.5 bg-slate-200 rounded" />
                            <div className="w-20 h-2.5 bg-slate-200 rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6"><div className="w-20 h-3 bg-slate-200 rounded" /></td>
                      <td className="py-4 px-6"><div className="w-24 h-3 bg-slate-200 rounded" /></td>
                      <td className="py-4 px-6"><div className="w-16 h-6 bg-slate-200 rounded-full" /></td>
                      <td className="py-4 px-6"><div className="w-24 h-3 bg-slate-200 rounded" /></td>
                      <td className="py-4 px-6 text-right"><div className="w-16 h-3 bg-slate-200 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : workers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-text-muted">
                      <div className="max-w-xs mx-auto space-y-2">
                        <p className="font-semibold text-text-secondary text-sm">No Workers Found</p>
                        <p className="text-xs">No registered workers match your current search and filter criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  workers.map((worker) => {
                    const score = worker.fatigueScore ?? 15;
                    const avatarUrl =
                      worker.profile_image_url ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

                    return (
                      <tr
                        key={worker.id}
                        className="hover:bg-secondary-surface/40 transition-colors group"
                      >
                        {/* Worker Info */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-full overflow-hidden relative border border-border-default shrink-0 bg-slate-200">
                              <Image
                                src={avatarUrl}
                                alt={worker.full_name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-bold text-text-primary text-sm">
                                {worker.full_name}
                              </div>
                              <div className="text-text-muted text-[11px]">
                                {worker.designation || `${worker.department} Operator`}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Employee ID */}
                        <td className="py-4 px-6 font-mono text-text-secondary font-medium">
                          {worker.employee_id}
                        </td>

                        {/* Department */}
                        <td className="py-4 px-6 text-text-secondary font-medium">
                          {worker.department}
                        </td>

                        {/* Current Status Badge */}
                        <td className="py-4 px-6">
                          {worker.status === "Active" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-success-light text-success-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                              Active
                            </span>
                          )}
                          {worker.status === "On Break" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                              On Break
                            </span>
                          )}
                          {worker.status === "Away" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-warning-light text-warning-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                              Away
                            </span>
                          )}
                          {worker.status !== "Active" &&
                            worker.status !== "On Break" &&
                            worker.status !== "Away" && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                {worker.status}
                              </span>
                            )}
                        </td>

                        {/* Fatigue Score Progress Bar */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3 max-w-[160px]">
                            <div className="flex-1 h-2 bg-secondary-surface rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  score > 60
                                    ? "bg-danger"
                                    : score > 30
                                    ? "bg-warning"
                                    : "bg-success"
                                }`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                            <span
                              className={`font-mono text-xs font-bold ${
                                score > 60 ? "text-danger" : "text-text-primary"
                              }`}
                            >
                              {score}%
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right space-x-3">
                          <Link
                            href={`/workers/${worker.id}`}
                            className="text-xs font-semibold text-primary hover:text-primary-hover hover:underline"
                          >
                            View Profile
                          </Link>
                          <button
                            onClick={() => {
                              setWorkerToDelete(worker);
                              setDeleteModalOpen(true);
                            }}
                            className="text-xs font-semibold text-danger hover:text-danger-hover inline-flex items-center gap-1 p-1 rounded hover:bg-danger-light transition-colors"
                            title="Delete Worker"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 bg-white border-t border-border-default flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-secondary">
            <div>
              Showing {workers.length} registered {workers.length === 1 ? "worker" : "workers"}
            </div>

            <div className="flex items-center gap-1.5">
              <button disabled className="p-2 border border-border-default rounded-xl opacity-50 cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-xl bg-primary text-white font-bold flex items-center justify-center">
                1
              </button>
              <button disabled className="p-2 border border-border-default rounded-xl opacity-50 cursor-not-allowed">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Delete Worker */}
      {deleteModalOpen && workerToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card-bg rounded-3xl p-6 max-w-md w-full border border-border-default shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border-default pb-3">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-danger" />
                <span>Confirm Worker Deletion</span>
              </h3>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="p-1 rounded-lg hover:bg-secondary-surface text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Are you sure you want to permanently remove worker{" "}
              <strong className="text-text-primary">{workerToDelete.full_name}</strong> ({workerToDelete.employee_id}) from the InsForge database? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2.5 bg-white border border-border-default text-text-primary font-semibold text-xs rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2.5 bg-danger hover:bg-danger-hover text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-danger/20 inline-flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>{isDeleting ? "Deleting..." : "Delete Worker"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Worker Modal */}
      <RegisterWorkerModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSuccess={() => {
          loadWorkersData();
        }}
      />
    </AppLayout>
  );
}
