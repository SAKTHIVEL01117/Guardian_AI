"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShieldCheck, Zap, BarChart3 } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white selection:bg-primary-light selection:text-primary font-sans">
      {/* Left Panel: Hero Graphic & Security Metrics Showcase */}
      <div className="lg:col-span-6 xl:col-span-7 relative hidden lg:flex flex-col justify-between p-12 lg:p-16 text-white overflow-hidden bg-slate-950">
        {/* Background Image with Cinematic Overlay */}
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

        {/* Center Main Headline & Value Statement */}
        <div className="relative z-10 max-w-xl my-auto py-12 space-y-6">
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-[1.12] tracking-tight text-white">
            Intelligent Safety for the Modern Workforce.
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed font-normal max-w-md">
            Enhancing productivity and worker wellbeing through real-time
            machine intelligence and predictive safety analytics.
          </p>
        </div>

        {/* Bottom Floating Live Metrics Widgets */}
        <div className="relative z-10 grid grid-cols-2 gap-4 max-w-md">
          {/* Widget 1: Safety Score */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 p-4 rounded-2xl flex items-center gap-3.5 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md shadow-primary/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-400">
                Live Safety Score
              </div>
              <div className="text-sm font-bold text-white tracking-tight">
                99.8% Secured
              </div>
            </div>
          </div>

          {/* Widget 2: Response Time */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 p-4 rounded-2xl flex items-center gap-3.5 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-success text-white flex items-center justify-center shrink-0 shadow-md shadow-success/30">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-400">
                Response Time
              </div>
              <div className="text-sm font-bold text-white tracking-tight">
                &lt; 150ms
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Authentication Form */}
      <div className="lg:col-span-6 xl:col-span-5 bg-white flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        {/* Mobile Header Logo */}
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

        {/* Center Form Container */}
        <div className="max-w-md w-full mx-auto my-auto py-4">
          <div className="mb-8 space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-sm text-slate-500 font-normal">
              Access your industrial safety dashboard.
            </p>
          </div>

          {/* LoginForm Component */}
          <LoginForm />

          {/* Divider */}
          <div className="relative my-7 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Or continue with
            </span>
          </div>

          {/* SSO Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {/* Microsoft SSO */}
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex items-center justify-center gap-2.5 py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-all shadow-sm"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              <span>Microsoft</span>
            </button>

            {/* Okta SSO */}
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex items-center justify-center gap-2.5 py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-all shadow-sm"
            >
              <svg className="w-4 h-4 shrink-0 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" />
              </svg>
              <span>Okta</span>
            </button>
          </div>

          {/* Bottom Callout */}
          <div className="text-center mt-8">
            <p className="text-xs text-slate-500">
              New operator?{" "}
              <Link
                href="/signup"
                className="text-primary font-semibold hover:underline"
              >
                Request Access / Register
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Meta Details */}
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
