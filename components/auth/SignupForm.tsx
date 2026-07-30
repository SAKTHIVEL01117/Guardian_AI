"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { insforge } from "@/lib/insforge";
import { UserRole } from "@/types/auth";

export default function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("supervisor");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      // 1. Sign up user via InsForge Auth
      const { data, error } = await insforge.auth.signUp({
        email,
        password,
        name: fullName,
      });

      if (error) {
        throw new Error(error.message || "Account creation failed. Please check your details.");
      }

      const user = data?.user;
      if (user) {
        // 2. Create matching profile entry in InsForge PostgreSQL profiles table
        const { error: profileError } = await insforge
          .database
          .from("profiles")
          .insert([
            {
              id: user.id,
              user_id: user.id,
              full_name: fullName,
              email: email,
              role: role,
            },
          ]);

        if (profileError) {
          console.warn("Profile table insert warning:", profileError);
        }
      }

      if (data?.requireEmailVerification) {
        setSuccessMsg("Account created successfully! Verification code has been sent to your email. You can now sign in.");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setErrorMsg(
        err?.message || "Account creation failed. Invalid email or password format."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-success-light border border-success/20 text-success-foreground text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-success" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-danger-light border border-danger/20 text-danger-foreground text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-danger" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-1.5">
        <label
          htmlFor="fullName"
          className="block text-xs font-semibold uppercase tracking-wider text-text-secondary"
        >
          Full Name
        </label>
        <div className="relative flex items-center">
          <User className="w-5 h-5 text-text-muted absolute left-3.5 pointer-events-none" />
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            className="w-full pl-11 pr-4 py-3 bg-white border border-border-default rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-xs font-semibold uppercase tracking-wider text-text-secondary"
        >
          Work Email
        </label>
        <div className="relative flex items-center">
          <Mail className="w-5 h-5 text-text-muted absolute left-3.5 pointer-events-none" />
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="w-full pl-11 pr-4 py-3 bg-white border border-border-default rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-xs font-semibold uppercase tracking-wider text-text-secondary"
        >
          Password
        </label>
        <div className="relative flex items-center">
          <Lock className="w-5 h-5 text-text-muted absolute left-3.5 pointer-events-none" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-11 pr-11 py-3 bg-white border border-border-default rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-text-muted hover:text-text-secondary transition-colors p-1"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Role Selection */}
      <div className="space-y-1.5">
        <label
          htmlFor="role"
          className="block text-xs font-semibold uppercase tracking-wider text-text-secondary"
        >
          Application Role
        </label>
        <div className="relative flex items-center">
          <ShieldCheck className="w-5 h-5 text-text-muted absolute left-3.5 pointer-events-none" />
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-border-default rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
          >
            <option value="supervisor">Supervisor (Default)</option>
            <option value="admin">Administrator</option>
            <option value="worker">Worker Operator</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 text-sm flex items-center justify-center gap-2 mt-6 disabled:opacity-70"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <div className="text-center pt-3">
        <p className="text-xs text-text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </form>
  );
}
