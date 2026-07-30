"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { UserProfile as UserProfileType } from "@/types/auth";
import { LogOut, User, Shield, ChevronDown } from "lucide-react";

export default function UserProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
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
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-secondary-surface transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20">
          {profile?.full_name?.charAt(0).toUpperCase() || "S"}
        </div>
        <div className="hidden md:block text-left text-xs">
          <div className="font-semibold text-text-primary">
            {profile?.full_name || "Supervisor"}
          </div>
          <div className="text-[10px] text-text-muted capitalize">
            {profile?.role || "Supervisor"}
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-text-muted hidden md:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-border-default p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-border-default/60 mb-1">
            <div className="text-xs font-bold text-text-primary truncate">
              {profile?.full_name || "Supervisor"}
            </div>
            <div className="text-[11px] text-text-muted truncate">
              {profile?.email || "supervisor@factory.com"}
            </div>
            <div className="mt-1.5 inline-flex items-center gap-1 bg-primary-light text-primary px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize">
              <Shield className="w-3 h-3" />
              <span>{profile?.role || "supervisor"}</span>
            </div>
          </div>

          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-text-primary hover:bg-secondary-surface rounded-xl transition-colors mb-1"
          >
            <User className="w-4 h-4 text-primary" />
            <span>View Profile</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-danger hover:bg-danger-light/50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
