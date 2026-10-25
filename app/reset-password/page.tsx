"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Car,
  HardHat,
  Sparkles,
  KeyRound,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogoLoader } from "@/components/BrandLogoLoader";

const ROLE_META: Record<
  string,
  { name: string; division: string; badge: string; icon: any; scope: string }
> = {
  head_dispatcher: {
    name: "Head Dispatcher",
    division: "Full Super-Admin Governance",
    badge: "bg-[#df2531]/20 text-[#df2531] border-[#df2531]/40",
    icon: ShieldCheck,
    scope: "Consolidated access across all 3 divisions, all assets, finance ledgers, and RBAC governance.",
  },
  elshaday_admin: {
    name: "Elshaday Admin",
    division: "Car Rental Division",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    icon: Car,
    scope: "Passenger cars, commercial vans, drivers, walkaround inspections, and Elshaday rental cashflow.",
  },
  liora_admin: {
    name: "Liora Admin",
    division: "Machinery Division",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    icon: HardHat,
    scope: "Heavy earthmoving excavators, loaders, breakers, certified ODR operators, and Liora vault.",
  },
  dalol_admin: {
    name: "Dalol Admin",
    division: "Dalol Service",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    icon: Sparkles,
    scope: "Djibouti corridor freight lowbeds, logistics escrow, and RFID fuel smart releases.",
  },
};

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL params
  const paramEmail = searchParams?.get("email") || "";
  const paramRole = searchParams?.get("role") || "head_dispatcher";
  const paramToken = searchParams?.get("token") || "";

  const [email, setEmail] = useState<string>(paramEmail);
  const [role, setRole] = useState<string>(paramRole);
  const [token, setToken] = useState<string>(paramToken);
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(4);

  // Sync state if query params change
  useEffect(() => {
    if (paramEmail) setEmail(paramEmail);
    if (paramRole) setRole(paramRole);
    if (paramToken) setToken(paramToken);
  }, [paramEmail, paramRole, paramToken]);

  // Handle auto-redirect countdown upon success
  useEffect(() => {
    if (!isSuccess) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push(`/login?email=${encodeURIComponent(email)}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSuccess, email, router]);

  const roleMeta = ROLE_META[role] || ROLE_META["head_dispatcher"];
  const RoleIcon = roleMeta.icon;

  // Real-time validation checks
  const isMinLength = newPassword.length >= 6;
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const hasLettersAndNumbers = /[a-zA-Z]/.test(newPassword) && /\d/.test(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email) {
      setErrorMsg("Please provide an email address.");
      return;
    }

    if (!isMinLength) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (!isMatch) {
      setErrorMsg("Passwords do not match. Please verify and re-type.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          newPassword,
          role,
          token,
          step: "confirm",
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error || "Failed to update password.");
        return;
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
          <div className="h-10 w-10 rounded-2xl bg-black/80 border border-[#df2531]/40 flex items-center justify-center p-1.5 shadow-lg shadow-[#df2531]/20">
            <img src="/del-logo.png" alt="DEL Services" className="h-full w-auto object-contain" />
          </div>
          <div className="text-left">
            <div className="font-display font-black text-white text-lg tracking-wider flex items-center gap-1.5">
              DEL SERVICES
              <span className="text-[10px] font-sans font-bold uppercase px-1.5 py-0.5 rounded bg-[#df2531]/15 text-[#df2531] border border-[#df2531]/40">
                RBAC
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 font-sans">Enterprise Fleet & Equipment Operating System</div>
          </div>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display mt-2">
          Create / Reset Role Password
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-md mx-auto font-sans">
          Set your new access credentials. Once confirmed, your account will be marked active and authorized for your assigned division.
        </p>
      </div>

      {/* Main Content Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0a0a0a] border border-[#df2531]/30 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Subtle Ambient Red Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#df2531]/10 rounded-full blur-3xl pointer-events-none" />

        {isSuccess ? (
          /* SUCCESS STATE */
          <div className="text-center py-6 space-y-6 animate-fadeIn font-sans">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-white font-display">Password Successfully Set!</h2>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-sm mx-auto">
                Credentials for <strong className="text-white font-mono">{email}</strong> have been saved and your account is active with <strong className="text-[#df2531]">{roleMeta.name}</strong> permissions.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-left text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Assigned Role:</span>
                <span className="font-bold text-white flex items-center gap-1 font-display">
                  <RoleIcon size={14} className="text-[#df2531]" />
                  {roleMeta.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Account Status:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <Check size={14} /> Active & Verified
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Division Scope:</span>
                <span className="font-mono text-neutral-200">{roleMeta.division}</span>
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={() => router.push(`/login?email=${encodeURIComponent(email)}`)}
                className="w-full py-3.5 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#df2531]/30 transition-all font-display"
              >
                Sign In Now to Role Portal
                <ArrowRight size={16} />
              </button>
              <div className="text-[11px] text-neutral-400">
                Redirecting automatically in <strong className="text-white">{countdown}</strong> seconds...
              </div>
            </div>
          </div>
        ) : (
          /* FORM STATE */
          <form onSubmit={handleSubmit} className="space-y-5 font-sans">
            {/* Assigned Email & Role Badge Display */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-display">
                  Role Authorization Profile
                </div>
                <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 font-display", roleMeta.badge)}>
                  <RoleIcon size={12} />
                  {roleMeta.name}
                </span>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <div className="h-8 w-8 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-neutral-400 shrink-0">
                  <Mail size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-neutral-400 uppercase font-medium">Assigned Email Account</div>
                  {paramEmail ? (
                    <div className="text-xs font-mono font-bold text-white truncate">{email}</div>
                  ) : (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@delservices.et"
                      required
                      className="w-full mt-0.5 bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#df2531]"
                    />
                  )}
                </div>
              </div>

              <div className="text-[11px] text-neutral-400 border-t border-neutral-900 pt-2 flex items-center gap-1.5">
                <Shield size={12} className="text-[#df2531] shrink-0" />
                <span>{roleMeta.scope}</span>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-[#df2531]/50 text-rose-200 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertCircle size={15} className="shrink-0 text-[#df2531]" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* New Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 block font-display">
                New Password <span className="text-[#df2531]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Lock size={15} />
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 6 characters)"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-[#df2531] focus:ring-1 focus:ring-[#df2531] text-xs text-white placeholder-neutral-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-neutral-300"
                >
                  {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 block font-display">
                Confirm New Password <span className="text-[#df2531]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <KeyRound size={15} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  required
                  className={cn(
                    "w-full pl-10 pr-10 py-2.5 rounded-xl bg-neutral-950 border focus:ring-1 text-xs text-white placeholder-neutral-500 outline-none transition-all",
                    confirmPassword.length > 0 && !isMatch
                      ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500"
                      : confirmPassword.length > 0 && isMatch
                      ? "border-emerald-500/80 focus:border-emerald-500 focus:ring-emerald-500"
                      : "border-neutral-800 focus:border-[#df2531] focus:ring-[#df2531]"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-neutral-300"
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Security Checklist */}
            <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-900 space-y-1.5 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-3.5 w-3.5 rounded-full flex items-center justify-center text-[9px]",
                    isMinLength ? "bg-emerald-500 text-black font-bold" : "bg-neutral-800 text-neutral-500"
                  )}
                >
                  ✓
                </span>
                <span className={isMinLength ? "text-neutral-200" : "text-neutral-500"}>
                  Minimum 6 characters
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-3.5 w-3.5 rounded-full flex items-center justify-center text-[9px]",
                    hasLettersAndNumbers ? "bg-emerald-500 text-black font-bold" : "bg-neutral-800 text-neutral-500"
                  )}
                >
                  ✓
                </span>
                <span className={hasLettersAndNumbers ? "text-neutral-200" : "text-neutral-500"}>
                  Contains letters and numbers
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-3.5 w-3.5 rounded-full flex items-center justify-center text-[9px]",
                    isMatch ? "bg-emerald-500 text-black font-bold" : "bg-neutral-800 text-neutral-500"
                  )}
                >
                  ✓
                </span>
                <span className={isMatch ? "text-neutral-200" : "text-neutral-500"}>
                  Passwords match
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isMinLength || !isMatch}
              className={cn(
                "w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all font-display",
                isMinLength && isMatch
                  ? "bg-[#df2531] hover:bg-[#c41e29] text-white shadow-[#df2531]/30 active:scale-95 cursor-pointer"
                  : "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/50"
              )}
            >
              <Lock size={14} />
              {loading ? "Activating Credentials..." : "Set New Password & Activate Account"}
            </button>

            {/* Return to login link */}
            <div className="text-center pt-2">
              <Link
                href="/login"
                className="text-xs text-neutral-400 hover:text-white transition-colors flex items-center justify-center gap-1"
              >
                Already have active credentials? <span className="text-[#df2531] underline">Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative">
      {/* Background Radial Crimson Atmosphere */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(223, 37, 49, 0.12) 0%, rgba(0, 0, 0, 0.95) 75%)",
        }}
      />
      <Suspense
        fallback={
          <BrandLogoLoader size="md" message="Connecting to DEL Security Portal..." />
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
