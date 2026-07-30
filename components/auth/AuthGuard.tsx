"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { UserProfile } from "@/types/auth";
import { ShieldCheck } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data, error } = await insforge.auth.getCurrentUser();

        if (error || !data?.user) {
          router.replace("/login");
          return;
        }

        const user = data.user;

        // Optionally fetch profile from PostgreSQL profiles table
        const { data: profiles } = await insforge
          .database
          .from("profiles")
          .select("*")
          .eq("id", user.id);

        const profile = profiles && profiles.length > 0 ? profiles[0] : null;

        setUserProfile({
          id: user.id,
          email: user.email || "",
          full_name: profile?.full_name || user.profile?.name || "Operator",
          role: profile?.role || "supervisor",
          avatar_url: profile?.avatar_url || user.profile?.avatar_url,
        });


        setLoading(false);
      } catch (err) {
        console.error("AuthGuard verification error:", err);
        router.replace("/login");
      }
    }

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center p-6 text-text-primary">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="text-center space-y-1">
            <div className="text-base font-bold text-text-primary">
              Authenticating Session...
            </div>
            <div className="text-xs text-text-muted">
              Operator Guardian AI Platform
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
