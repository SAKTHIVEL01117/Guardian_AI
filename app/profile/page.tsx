"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { insforge } from "@/lib/insforge";
import { UserProfile as UserProfileType } from "@/types/auth";
import { User, Shield, Mail, Key, Building, Calendar, CheckCircle2, ShieldCheck, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      setIsLoading(true);
      try {
        const { data } = await insforge.auth.getCurrentUser();
        if (data?.user) {
          const user = data.user;
          const { data: profiles } = await insforge
            .database
            .from("profiles")
            .select("*")
            .eq("id", user.id);

          const prof = profiles && profiles.length > 0 ? profiles[0] : null;

          setProfile({
            id: user.id,
            email: user.email || "",
            full_name: prof?.full_name || user.profile?.name || "Supervisor Operator",
            role: prof?.role || "supervisor",
            avatar_url: prof?.avatar_url || user.profile?.avatar_url,
          });
        }
      } catch (err) {
        console.error("ProfilePage load error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await insforge.auth.signOut();
    } catch (e) {
      console.error("Signout error:", e);
    } finally {
      router.push("/login");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
            User Profile & Operator Account
          </h1>
          <p className="text-xs md:text-sm text-text-secondary mt-1">
            Manage your supervisor credentials, security role permissions, and active Industry 5.0 session settings.
          </p>
        </div>

        {isLoading ? (
          <div className="bg-card-bg rounded-3xl p-8 border border-border-default animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-slate-200" />
              <div className="space-y-2">
                <div className="w-48 h-6 bg-slate-200 rounded-md" />
                <div className="w-32 h-4 bg-slate-200 rounded-md" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Profile Card */}
            <div className="bg-card-bg rounded-3xl p-6 md:p-8 border border-border-default shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-primary/10 text-primary font-extrabold text-2xl flex items-center justify-center border-2 border-primary/30 shadow-md">
                  {profile?.full_name?.charAt(0).toUpperCase() || "S"}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-text-primary">
                      {profile?.full_name || "Supervisor Operator"}
                    </h2>
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-mono font-bold px-3 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active Session
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-text-muted" />
                    <span>{profile?.email || "supervisor@factory.com"}</span>
                  </p>
                  <div className="pt-1 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 bg-primary-light text-primary px-3 py-1 rounded-full text-xs font-semibold capitalize">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Role: {profile?.role || "Supervisor"}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                <button
                  onClick={handleLogout}
                  className="w-full md:w-auto px-5 py-2.5 bg-danger-light text-danger hover:bg-danger/10 font-bold text-xs rounded-xl inline-flex items-center justify-center gap-2 transition-colors border border-danger/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Grid details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Details */}
              <div className="bg-card-bg rounded-3xl p-6 border border-border-default shadow-card space-y-4">
                <h3 className="text-base font-bold text-text-primary flex items-center gap-2 border-b border-border-default/60 pb-3">
                  <User className="w-4 h-4 text-primary" />
                  <span>Account Credentials</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-border-default/40">
                    <span className="text-text-muted font-medium">User ID</span>
                    <span className="font-mono font-semibold text-text-primary">{profile?.id.slice(0, 16)}...</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border-default/40">
                    <span className="text-text-muted font-medium">Assigned Role</span>
                    <span className="font-semibold text-text-primary capitalize">{profile?.role}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border-default/40">
                    <span className="text-text-muted font-medium">Facility Domain</span>
                    <span className="font-semibold text-text-primary">MSME Smart Assembly Line 01</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-text-muted font-medium">Authentication Provider</span>
                    <span className="font-mono font-semibold text-primary">InsForge Auth Platform</span>
                  </div>
                </div>
              </div>

              {/* Security & Access Rights */}
              <div className="bg-card-bg rounded-3xl p-6 border border-border-default shadow-card space-y-4">
                <h3 className="text-base font-bold text-text-primary flex items-center gap-2 border-b border-border-default/60 pb-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Security & Permissions</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-secondary-surface border border-border-default/60">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-text-primary">Worker Registration Rights</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Granted</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-secondary-surface border border-border-default/60">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-text-primary">Live Monitoring Control</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Granted</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-secondary-surface border border-border-default/60">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-text-primary">Alert Resolution & Dispatch</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Granted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
