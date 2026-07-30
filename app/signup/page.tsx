"use client";

import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Zap, BarChart3 } from "lucide-react";
import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white selection:bg-primary-light selection:text-primary font-sans">
      {/* Left Panel: Hero Graphic & Security Showcase */}
      <div className="lg:col-span-6 xl:col-span-7 relative hidden lg:flex flex-col justify-between p-12 lg:p-16 text-white overflow-hidden bg-slate-950">
        <Image
          src="/images/login_bg.png"
          alt="Smart Manufacturing Plant Operations"
          fill
          priority
          className="object-cover opacity-40 mix-blend-luminosity scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30" />

        {/* Top Branding Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 group-hover:bg-primary-hover transition-colors">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-white">
              SafeGuard AI
            </span>
          </Link>
        </div>

        {/* Center Main Headline */}
        <div className="relative z-10 max-w-xl my-auto py-12 space-y-6">
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-[1.12] tracking-tight text-white">
            Join Industry 5.0 Workforce Intelligence.
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed font-normal max-w-md">
            Register your supervisor or administrator account to manage workers,
            monitor fatigue, and receive AI safety recommendations in real-time.
          </p>
        </div>

        {/* Bottom Floating Live Metrics Widgets */}
        <div className="relative z-10 grid grid-cols-2 gap-4 max-w-md">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 p-4 rounded-2xl flex items-center gap-3.5 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md shadow-primary/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-400">
                Supervisor Portal
              </div>
              <div className="text-sm font-bold text-white tracking-tight">
                Role-Based Access
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 p-4 rounded-2xl flex items-center gap-3.5 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-success text-white flex items-center justify-center shrink-0 shadow-md shadow-success/30">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-400">
                Instant Provision
              </div>
              <div className="text-sm font-bold text-white tracking-tight">
                InsForge Auth
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Registration Form */}
      <div className="lg:col-span-6 xl:col-span-5 bg-white flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        <div className="lg:hidden mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              SafeGuard AI
            </span>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto my-auto py-4">
          <div className="mb-8 space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Create Account
            </h2>
            <p className="text-sm text-slate-500 font-normal">
              Register as a Supervisor or Administrator.
            </p>
          </div>

          <SignupForm />
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 mt-8">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-500">System Online</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span>v4.12.0</span>
            <span>•</span>
            <Link href="#" className="hover:text-slate-600 transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
