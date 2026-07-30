"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, Settings, HelpCircle, Menu } from "lucide-react";
import UserProfile from "@/components/auth/UserProfile";

interface HeaderProps {
  onOpenMobileSidebar?: () => void;
}

export default function Header({ onOpenMobileSidebar }: HeaderProps) {
  const pathname = usePathname();

  // Page title mapping
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "SafeGuard AI";
    if (pathname === "/monitoring") return "SafeGuard AI";
    if (pathname === "/workers") return "SafeGuard AI";
    if (pathname.startsWith("/workers/")) return "Worker Profile";
    if (pathname === "/analytics") return "Analytics Hub";
    if (pathname === "/alerts") return "Alert Center";
    if (pathname === "/reports") return "Executive Reports";
    if (pathname === "/settings") return "System Settings";
    return "SafeGuard AI";
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-border-default h-16 px-4 md:px-8 flex items-center justify-between gap-4 shadow-xs">
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-text-secondary hover:text-text-primary rounded-xl hover:bg-secondary-surface transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand / Page Title */}
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-lg font-bold text-text-primary tracking-tight"
          >
            {getPageTitle()}
          </Link>

          {/* Monitoring Sub-Tabs if on Live Monitoring Page */}
          {pathname === "/monitoring" && (
            <div className="hidden sm:flex items-center gap-6 text-xs font-semibold">
              <Link
                href="/monitoring"
                className="text-primary font-bold border-b-2 border-primary py-4"
              >
                Camera Feed 01
              </Link>
              <Link
                href="/analytics"
                className="text-text-muted hover:text-text-primary py-4 transition-colors"
              >
                Analytics Hub
              </Link>
              <Link
                href="/alerts"
                className="text-text-muted hover:text-text-primary py-4 transition-colors"
              >
                Incident Logs
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Center Search Bar (Hidden on Monitoring page where tabs exist, or visible on Dashboard/Workers) */}
      {pathname !== "/monitoring" && (
        <div className="hidden md:flex items-center gap-2 bg-secondary-surface rounded-xl px-3.5 py-2 border border-border-default/60 w-80 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
          <Search className="w-4 h-4 text-text-muted shrink-0" />
          <input
            type="text"
            suppressHydrationWarning
            placeholder="Search facilities, workers, or alerts..."
            className="bg-transparent border-none text-xs text-text-primary placeholder:text-text-muted focus:outline-none w-full"
          />
        </div>
      )}

      {/* Right Action Icons & User Profile */}
      <div className="flex items-center gap-3">
        <button
          suppressHydrationWarning
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-surface rounded-xl transition-colors relative"
        >
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full ring-2 ring-white" />
        </button>

        <Link
          href="/settings"
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-surface rounded-xl transition-colors"
        >
          <Settings className="w-4.5 h-4.5" />
        </Link>

        <button
          suppressHydrationWarning
          onClick={() => alert("SafeGuard AI Operator Support")}
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-surface rounded-xl transition-colors hidden sm:block"
        >
          <HelpCircle className="w-4.5 h-4.5" />
        </button>


        <div className="h-5 w-px bg-border-default mx-1 hidden sm:block" />

        {/* User Profile Component */}
        <UserProfile />
      </div>
    </header>
  );
}
