"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Video,
  Users,
  AlertTriangle,
  FileText,
  Settings,
  HelpCircle,
  Lock,
  ShieldCheck,
  X,
} from "lucide-react";

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Operations Center",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Live Monitoring",
      href: "/monitoring",
      icon: Video,
    },
    {
      name: "Workforce",
      href: "/workers",
      icon: Users,
    },
    {
      name: "Alerts & Events",
      href: "/alerts",
      icon: AlertTriangle,
    },
    {
      name: "Executive Reports",
      href: "/reports",
      icon: FileText,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 text-white flex flex-col justify-between p-4 transition-transform duration-300 border-r border-slate-800 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          {/* Top Brand Branding */}
          <div className="flex items-center justify-between px-2 pt-2">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/30 group-hover:bg-primary-hover transition-colors">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-base font-extrabold text-white tracking-tight leading-tight">
                  Industry 5.0
                </div>
                <div className="text-[11px] font-medium text-slate-400">
                  Safety Intelligence
                </div>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: Emergency Lockout, Settings, Support */}
        <div className="space-y-3 pt-6 border-t border-slate-800">
          {/* Emergency Lockout Red Action */}
          <button
            onClick={() => alert("Emergency Lockout signal broadcasted to facility gates.")}
            className="w-full bg-danger hover:bg-danger-hover text-white font-semibold py-3 px-3.5 rounded-xl text-xs flex items-center justify-center gap-2.5 transition-all shadow-md shadow-danger/20 active:scale-[0.98]"
          >
            <Lock className="w-4 h-4" />
            <span>Emergency Lockout</span>
          </button>

          <div className="space-y-1 pt-1">
            <Link
              href="/settings"
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                pathname === "/settings"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>

            <button
              onClick={() => alert("Connecting to SafeGuard AI Industrial Support...")}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors text-left"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Support</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
