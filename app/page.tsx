import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Search,
  Bell,
  Settings,
  ArrowRight,
  Eye,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Zap,
  Activity,
  Cpu,
  Lock,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-page-bg text-text-primary flex flex-col font-sans selection:bg-primary-light selection:text-primary">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border-default">
        <div className="max-w-[1440px] mx-auto px-6 h-18 flex items-center justify-between gap-4">
          {/* Left: Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm shadow-primary/30 group-hover:bg-primary-hover transition-colors">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-text-primary">
              SafeGuard AI
            </span>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link
              href="#features"
              className="text-primary font-semibold relative py-5 border-b-2 border-primary"
            >
              Features
            </Link>
            <Link
              href="#technology"
              className="text-text-secondary hover:text-text-primary py-5 transition-colors"
            >
              Technology
            </Link>
            <Link
              href="#benefits"
              className="text-text-secondary hover:text-text-primary py-5 transition-colors"
            >
              Benefits
            </Link>
          </nav>

          {/* Right: Search, Actions, Profile */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="hidden lg:flex items-center gap-2 bg-secondary-surface rounded-xl px-3.5 py-2 border border-border-default/60 w-64 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <Search className="w-4 h-4 text-text-muted shrink-0" />
              <input
                type="text"
                suppressHydrationWarning
                placeholder="Search safety protocols..."
                className="bg-transparent border-none text-xs text-text-primary placeholder:text-text-muted focus:outline-none w-full"
              />
            </div>

            {/* Notification & Settings */}
            <button
              suppressHydrationWarning
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-surface rounded-xl transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full ring-2 ring-white" />
            </button>

            <button
              suppressHydrationWarning
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-surface rounded-xl transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>


            {/* User Profile Avatar / Login Button */}
            <div className="h-6 w-px bg-border-default mx-1 hidden sm:block" />

            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-primary/20"
            >
              Supervisor Login
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28">
          <div className="max-w-[1440px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Hero Content Left */}
              <div className="lg:col-span-7 space-y-6 max-w-2xl">
                {/* Industry 5.0 Pill */}
                <div className="inline-flex items-center gap-2 bg-primary-light/60 text-primary border border-primary/20 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Industry 5.0 Safety Standards</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary tracking-tight leading-[1.12]">
                  Intelligence that protects your{" "}
                  <span className="text-primary block sm:inline">
                    most valuable asset.
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-text-secondary leading-relaxed font-normal pt-1 max-w-xl">
                  Industry 5.0 workforce intelligence to monitor fatigue,
                  ensure worker safety, and optimize plant productivity with
                  real-time AI.
                </p>

                {/* CTA Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all shadow-md shadow-primary/25 group"
                  >
                    <span>Request Demo</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-text-primary font-semibold text-sm px-6 py-3.5 rounded-xl border border-border-default transition-all shadow-sm"
                  >
                    <span>View Live Dashboard</span>
                  </Link>
                </div>

                {/* Social Proof */}
                <div className="flex items-center gap-4 pt-6">
                  <div className="flex -space-x-2.5">
                    <div className="w-9 h-9 rounded-full ring-2 ring-white bg-slate-800 flex items-center justify-center text-xs font-bold text-white">
                      MK
                    </div>
                    <div className="w-9 h-9 rounded-full ring-2 ring-white bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                      SR
                    </div>
                    <div className="w-9 h-9 rounded-full ring-2 ring-white bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                      AJ
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary">
                    Trusted by{" "}
                    <span className="font-bold text-text-primary">500+</span>{" "}
                    industrial facilities globally
                  </p>
                </div>
              </div>

              {/* Hero Image & Live Overlay Right */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-[28px] md:rounded-[36px] overflow-hidden border border-border-default/80 shadow-2xl bg-slate-900 group">
                  <Image
                    src="/images/hero.png"
                    alt="Smart Manufacturing Industry 5.0 Assembly Line"
                    width={800}
                    height={600}
                    priority
                    className="w-full h-auto object-cover rounded-[28px] md:rounded-[36px] transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
                </div>

                {/* Floating Live Feed Badge */}
                <div className="absolute -bottom-6 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-border-default/80 flex items-center gap-4 z-20 max-w-xs">
                  <div className="w-11 h-11 rounded-xl bg-success-light text-success flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-success uppercase">
                      <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      Live Feed
                    </div>
                    <div className="text-2xl font-extrabold text-text-primary tracking-tight leading-tight">
                      98.4%
                    </div>
                    <div className="text-[11px] font-medium text-text-muted">
                      Safety Compliance
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Precision Engineering for Human Safety */}
        <section id="features" className="py-20 bg-white border-t border-border-default">
          <div className="max-w-[1440px] mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
                Precision Engineering for Human Safety
              </h2>
              <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
                Our modular AI suite integrates directly with your existing
                infrastructure to provide holistic workforce monitoring.
              </p>
            </div>

            {/* Grid of 4 Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {/* Card 1: Fatigue Detection */}
              <div className="bg-card-bg rounded-2xl p-8 border border-border-default shadow-card hover:shadow-hover transition-all flex flex-col justify-between relative overflow-hidden group">
                <div className="space-y-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                    <Eye className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary">
                    Fatigue Detection
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed max-w-md">
                    Advanced biometric analysis through vision sensors to detect
                    microsleeps, lack of focus, and physical strain in
                    real-time.
                  </p>
                </div>
                {/* Decorative biometric overlay graphic */}
                <div className="mt-8 pt-4 border-t border-border-light flex items-center justify-between text-xs text-text-muted font-mono uppercase tracking-wider">
                  <span>Worker Biometric Analysis</span>
                  <span className="text-primary font-semibold">Active</span>
                </div>
              </div>

              {/* Card 2: Real-time Alerts (Solid Blue Highlight Card) */}
              <div className="bg-primary text-white rounded-2xl p-8 shadow-xl flex flex-col justify-between relative overflow-hidden group">
                <div className="space-y-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/20 text-white backdrop-blur-md flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Real-time Alerts
                  </h3>
                  <p className="text-sm text-white/80 leading-relaxed max-w-md">
                    Instant haptic and visual notifications to supervisors and
                    operators when safety thresholds are breached.
                  </p>
                </div>

                <div className="mt-8 pt-4 flex items-center">
                  <div className="bg-blue-800/60 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 inline-flex items-center gap-3 text-xs font-bold tracking-wider uppercase text-white">
                    <span className="text-white/70">Response Time</span>
                    <span className="text-base font-extrabold text-white">
                      &lt; 200ms
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Productivity Analytics */}
              <div className="bg-secondary-surface/60 rounded-2xl p-8 border border-border-default shadow-card hover:shadow-hover transition-all flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-ai-light text-ai-purple flex items-center justify-center">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary">
                    Productivity Analytics
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Analyze workflow patterns to identify bottlenecks and
                    optimize human-machine interaction without invading
                    privacy.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-border-default/60 flex items-center justify-between text-xs text-ai-purple font-semibold">
                  <span>Privacy-First Computer Vision</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Card 4: Safety Compliance */}
              <div className="bg-card-bg rounded-2xl p-8 border border-border-default shadow-card hover:shadow-hover transition-all flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                <div className="space-y-4 max-w-sm">
                  <h3 className="text-xl font-bold text-text-primary">
                    Safety Compliance
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Automated logging and reporting for OSHA and ISO standards,
                    ensuring your plant is always audit-ready.
                  </p>
                  <Link
                    href="/reports"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
                  >
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* ISO Compliance Matrix Box */}
                <div className="w-full lg:w-48 h-32 border-2 border-dashed border-border-default rounded-xl bg-secondary-surface/40 flex items-center justify-center text-center p-4 text-xs font-mono text-text-muted uppercase tracking-wider">
                  Automated ISO 45001 Compliance Matrix
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: The Future Paradigm (Dark Industrial Showcase) */}
        <section id="technology" className="py-24 bg-dark-bg text-white relative overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-6 relative z-10">
            <div className="max-w-xl space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 bg-white/10 text-slate-300 border border-white/15 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                The Future Paradigm
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                The shift toward human-centric Industry 5.0
              </h2>
            </div>

            {/* Key Stats Counter Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-dark-card border border-dark-surface p-6 rounded-2xl space-y-2">
                <div className="text-4xl font-extrabold text-primary">0</div>
                <div className="text-sm font-semibold text-white">Target Preventable Accidents</div>
                <div className="text-xs text-slate-400">Continuous AI fatigue intervention</div>
              </div>

              <div className="bg-dark-card border border-dark-surface p-6 rounded-2xl space-y-2">
                <div className="text-4xl font-extrabold text-success">99.8%</div>
                <div className="text-sm font-semibold text-white">Recognition Accuracy</div>
                <div className="text-xs text-slate-400">InsightFace facial embeddings</div>
              </div>

              <div className="bg-dark-card border border-dark-surface p-6 rounded-2xl space-y-2">
                <div className="text-4xl font-extrabold text-ai-purple">24/7</div>
                <div className="text-sm font-semibold text-white">Automated Monitoring</div>
                <div className="text-xs text-slate-400">Real-time webcam vision stream</div>
              </div>

              <div className="bg-dark-card border border-dark-surface p-6 rounded-2xl space-y-2">
                <div className="text-4xl font-extrabold text-warning">&lt; 150ms</div>
                <div className="text-sm font-semibold text-white">Alert Latency</div>
                <div className="text-xs text-slate-400">Immediate supervisor warnings</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 py-12">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">
              SafeGuard AI
            </span>
            <span className="text-slate-600">|</span>
            <span>Operator Guardian AI System</span>
          </div>

          <p>© 2026 Operator Guardian AI. Industry 5.0 Platform.</p>
        </div>
      </footer>
    </div>
  );
}
