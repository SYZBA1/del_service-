"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  Car,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Sparkles,
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { cn } from "@/lib/utils";
import { BrandLogoLoader } from "@/components/BrandLogoLoader";

// Slideshow items matching heavy machinery and luxury cars
const HERO_SLIDES = [
  {
    id: "maybach-cat",
    title: "CAT 320D Hydraulic Excavator",
    subtitle: "Heavy Earthmoving & Hydraulic Breaker Rig",
    description: "20-Ton operating weight with pre-calibrated auxiliary hydraulic breaker lines for heavy foundation works.",
    badge: "Heavy Construction Fleet",
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'><defs><radialGradient id='g1' cx='50%' cy='50%' r='70%'><stop offset='0%' stop-color='%231E293B'/><stop offset='100%' stop-color='%2305070D'/></radialGradient></defs><rect width='1200' height='800' fill='url(%23g1)'/><circle cx='600' cy='450' r='350' fill='%23F59E0B' opacity='0.08'/><path d='M300 550 L500 550 L650 420 L850 420 L950 550 Z' fill='%23F59E0B' opacity='0.85'/><rect x='450' y='360' width='220' height='120' rx='10' fill='%230F172A' stroke='%23F59E0B' stroke-width='4'/><circle cx='420' cy='560' r='55' fill='%23334155' stroke='%23000' stroke-width='8'/><circle cx='800' cy='560' r='55' fill='%23334155' stroke='%23000' stroke-width='8'/><text x='600' y='680' font-family='sans-serif' font-size='28' font-weight='bold' fill='%23F59E0B' text-anchor='middle'>CAT 320D HYDRAULIC EXCAVATOR • CATERPILLAR</text></svg>",
  },
  {
    id: "land-cruiser",
    title: "Toyota Land Cruiser 300 V8",
    subtitle: "Executive VIP & 4x4 Off-Road Expedition SUV",
    description: "Twin-Turbo 3.3L Diesel powertrain engineered for Ethiopian highways and rough regional project corridors.",
    badge: "Executive VIP Fleet",
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'><defs><radialGradient id='g2' cx='50%' cy='40%' r='70%'><stop offset='0%' stop-color='%230F172A'/><stop offset='100%' stop-color='%23020408'/></radialGradient></defs><rect width='1200' height='800' fill='url(%23g2)'/><circle cx='600' cy='400' r='300' fill='%2338BDF8' opacity='0.1'/><path d='M250 520 L400 400 L800 400 L950 520 Z' fill='%23E2E8F0' opacity='0.9'/><path d='M420 410 L780 410 L840 480 L360 480 Z' fill='%230F172A'/><circle cx='380' cy='540' r='60' fill='%231E293B' stroke='%2364748B' stroke-width='10'/><circle cx='820' cy='540' r='60' fill='%231E293B' stroke='%2364748B' stroke-width='10'/><text x='600' y='680' font-family='sans-serif' font-size='28' font-weight='bold' fill='%2338BDF8' text-anchor='middle'>TOYOTA LAND CRUISER 300 V8 • EXECUTIVE VIP</text></svg>",
  },
  {
    id: "wheel-loader",
    title: "SDLG 956L Heavy Wheel Loader",
    subtitle: "Quarry Bulk Material & Aggregate Handler",
    description: "5-Ton rated bucket load with pilot hydraulic joystick control for high-throughput quarry & concrete batching.",
    badge: "Quarry Earthmoving",
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'><defs><radialGradient id='g3' cx='50%' cy='50%' r='70%'><stop offset='0%' stop-color='%231E293B'/><stop offset='100%' stop-color='%23080C14'/></radialGradient></defs><rect width='1200' height='800' fill='url(%23g3)'/><path d='M300 500 L550 420 L750 420 L920 500 Z' fill='%23EAB308'/><circle cx='400' cy='540' r='75' fill='%230F172A' stroke='%23EAB308' stroke-width='8'/><circle cx='800' cy='540' r='75' fill='%230F172A' stroke='%23EAB308' stroke-width='8'/><text x='600' y='680' font-family='sans-serif' font-size='28' font-weight='bold' fill='%23EAB308' text-anchor='middle'>SDLG 956L HEAVY WHEEL LOADER • 3.0 m³ BUCKET</text></svg>",
  },
  {
    id: "crane-truck",
    title: "Isuzu FTR Commercial Crane Truck",
    subtitle: "Heavy Logistics & Machinery Mobilization",
    description: "10-Ton telescopic boom crane flatbed for low-bed machinery delivery and depot dispatch.",
    badge: "Logistics Carrier",
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'><defs><radialGradient id='g4' cx='50%' cy='50%' r='70%'><stop offset='0%' stop-color='%231E293B'/><stop offset='100%' stop-color='%23050811'/></radialGradient></defs><rect width='1200' height='800' fill='url(%23g4)'/><rect x='280' y='420' width='640' height='90' fill='%233B82F6'/><rect x='720' y='360' width='200' height='150' fill='%231E293B' stroke='%2360A5FA' stroke-width='3'/><circle cx='380' cy='530' r='50' fill='%230F172A' stroke='%2364748B' stroke-width='8'/><circle cx='780' cy='530' r='50' fill='%230F172A' stroke='%2364748B' stroke-width='8'/><text x='600' y='680' font-family='sans-serif' font-size='28' font-weight='bold' fill='%2360A5FA' text-anchor='middle'>ISUZU FTR COMMERCIAL CRANE TRUCK • 10-TON</text></svg>",
  },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get("redirect") || "/dashboard";
  const { loginUser } = useTenant();

  // Screen Theme Toggle (Light / White Version vs Dark Nocturnal Mist)
  const [isLightMode, setIsLightMode] = useState(false);

  // Active Hero Slide
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Form Fields - clean empty defaults (no hardcoded pre-fills)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Feedback State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Slide Auto-Rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Pre-fill email and show notice when redirected from password reset
  useEffect(() => {
    const urlEmail = searchParams?.get("email");
    if (urlEmail) {
      setEmail(urlEmail);
      setSuccessMsg(`Credentials verified for ${urlEmail}. Please sign in with your new password.`);
    }
  }, [searchParams]);

  const currentSlide = HERO_SLIDES[currentSlideIndex];

  // Execute Login
  const executeLogin = async (loginEmail: string, loginPass: string) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMsg(json.error || "Authentication failed");
        return;
      }

      loginUser(json.user);
      setSuccessMsg(`Authenticated successfully as ${json.user.fullName}! Redirecting...`);
      setTimeout(() => {
        router.push(redirectTarget);
      }, 600);
    } catch (e: any) {
      setErrorMsg(e.message || "Login request error");
    } finally {
      setLoading(false);
    }
  };

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setErrorMsg("Please agree to the DEL Access conditions to proceed.");
      return;
    }
    executeLogin(email, password);
  };

  return (
    <div
      className={cn(
        "min-h-screen w-full flex flex-col lg:flex-row transition-colors duration-500",
        isLightMode ? "bg-slate-100 text-slate-900" : "bg-[#000000] text-slate-100"
      )}
    >
      {/* ==================================================== */}
      {/* LEFT: HERO SLIDESHOW (Reference 2 Mercedes Maybach) */}
      {/* ==================================================== */}
      <div className="relative flex-1 min-h-[420px] lg:min-h-screen flex flex-col justify-between p-8 lg:p-14 overflow-hidden border-b lg:border-b-0 lg:border-r border-[#1a1a1a]">
        {/* Background Image / SVG Atmosphere */}
        <div className="absolute inset-0 z-0">
          <img
            src={currentSlide.image}
            alt={currentSlide.title}
            className="w-full h-full object-cover opacity-75 filter brightness-90 contrast-125 transition-all duration-700 transform scale-105"
          />
          {/* Nocturnal mist / smoke gradient overlay */}
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-500",
              isLightMode
                ? "bg-gradient-to-t from-white/90 via-white/50 to-transparent"
                : "bg-gradient-to-t from-[#000000] via-[#000000]/75 to-transparent"
            )}
          />
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-500",
              isLightMode
                ? "bg-gradient-to-r from-white/40 via-transparent to-white/90"
                : "bg-gradient-to-r from-black/85 via-transparent to-[#000000]"
            )}
          />
        </div>

        {/* Top Branding */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 px-2.5 py-1 rounded-xl bg-transparent flex items-center justify-center border border-white/15">
              <img src="/del-logo.png" alt="DEL." className="h-7 w-auto object-contain" />
            </div>
            <div>
              <div className="font-black text-lg tracking-wider uppercase font-display flex items-center gap-2 text-white">
                DEL Services
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#df2531]/20 text-[#df2531] font-bold border border-[#df2531]/40">
                  Ethiopia
                </span>
              </div>
              <div className="text-[11px] text-neutral-400 font-mono">
                Fleet ERP & P2P Heavy Machinery
              </div>
            </div>
          </div>

          {/* White / Dark Mode Switcher for the Login Screen */}
          <button
            onClick={() => setIsLightMode(!isLightMode)}
            className={cn(
              "px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 backdrop-blur-md transition-all shadow-md",
              isLightMode
                ? "bg-white/80 border-slate-300 text-slate-800 hover:bg-white"
                : "bg-black/60 border-neutral-750 text-slate-200 hover:bg-black/80"
            )}
          >
            {isLightMode ? (
              <>
                <Moon size={14} className="text-[#df2531]" />
                <span>Switch to Nocturnal Dark</span>
              </>
            ) : (
              <>
                <Sun size={14} className="text-[#df2531]" />
                <span>Switch to White Version</span>
              </>
            )}
          </button>
        </div>

        {/* Hero Machine & Luxury Car Information (Slide Animation) */}
        <div className="relative z-10 max-w-xl space-y-4 my-auto pt-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#df2531]/20 text-white border border-[#df2531]/40 text-xs font-bold uppercase tracking-wider backdrop-blur-md font-display">
            <Sparkles size={13} className="text-[#df2531]" />
            {currentSlide.badge}
          </div>

          <h1 className={cn(
            "text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight font-display",
            isLightMode ? "text-slate-900" : "text-white"
          )}>
            {currentSlide.title}
          </h1>

          <p className={cn(
            "text-base font-semibold font-display",
            isLightMode ? "text-[#df2531]" : "text-[#df2531] font-medium"
          )}>
            {currentSlide.subtitle}
          </p>

          <p className={cn(
            "text-xs sm:text-sm leading-relaxed max-w-md",
            isLightMode ? "text-slate-600" : "text-neutral-400"
          )}>
            {currentSlide.description}
          </p>

          {/* Slide Navigation Dots */}
          <div className="flex items-center gap-2 pt-4">
            {HERO_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlideIndex(idx)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  currentSlideIndex === idx
                    ? "w-8 bg-[#df2531] shadow-[0_0_10px_rgba(223,37,49,0.8)]"
                    : "w-2 bg-neutral-700 hover:bg-neutral-500"
                )}
                title={s.title}
              />
            ))}
            <div className="pl-4 flex items-center gap-1.5">
              <button
                onClick={() => setCurrentSlideIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
                className="p-1 rounded-lg bg-black/60 hover:bg-black/90 border border-neutral-800 text-slate-300"
                title="Previous machine"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length)}
                className="p-1 rounded-lg bg-black/60 hover:bg-black/90 border border-neutral-800 text-slate-300"
                title="Next machine"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Footnote */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-neutral-400 font-mono pt-4 border-t border-[#1a1a1a]">
          <span>Addis Ababa Central Yard • Bole & Kality Hubs</span>
          <span>Fayda FIN Verified • GiST Exclusion Safe</span>
        </div>
      </div>

      {/* ==================================================== */}
      {/* RIGHT: AUTH FORM PANEL (Mercedes Maybach Minimalist) */}
      {/* ==================================================== */}
      <div
        className={cn(
          "w-full lg:w-[480px] xl:w-[520px] flex flex-col justify-center p-8 lg:p-12 transition-colors border-l border-[#1a1a1a]",
          isLightMode ? "bg-white text-slate-900" : "bg-[#0a0a0a] text-slate-100"
        )}
      >
        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Top Right Corner DEL Logo */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <div className="text-xs font-mono text-[#df2531] font-bold uppercase tracking-wider font-display">Dispatcher Auth</div>
              <div className="text-xs text-neutral-400">Head Dispatcher Access</div>
            </div>
            <Link href="/" title="Back to DEL Home">
              <div className="h-9 px-2.5 py-1 rounded-xl bg-transparent flex items-center justify-center border border-white/15 hover:scale-105 transition-transform">
                <img src="/del-logo.png" alt="DEL." className="h-6 w-auto object-contain" />
              </div>
            </Link>
          </div>

          {/* Header Title */}
          <div className="border-b border-neutral-800 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-display">
              Sign In to Dispatch ERP
            </h2>
          </div>

          {/* Error & Success Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div className="space-y-1">
              <label className="font-semibold block text-neutral-400">
                Email / Username
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@delservices.et"
                  className={cn(
                    "w-full rounded-xl pl-9 pr-3 py-2.5 text-xs transition-all border font-mono",
                    isLightMode
                      ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-[#df2531]"
                      : "bg-[#121212] border-neutral-800 text-white focus:bg-[#161616] focus:border-[#df2531] focus:ring-1 focus:ring-[#df2531]"
                  )}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold block text-neutral-400">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  className={cn(
                    "w-full rounded-xl pl-9 pr-10 py-2.5 text-xs transition-all border font-mono",
                    isLightMode
                      ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-[#df2531]"
                      : "bg-[#121212] border-neutral-800 text-white focus:bg-[#161616] focus:border-[#df2531] focus:ring-1 focus:ring-[#df2531]"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Agreement checkbox */}
            <label className="flex items-center gap-2 cursor-pointer text-[11px] text-neutral-400">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="rounded border-neutral-700 text-[#df2531] bg-[#121212] focus:ring-[#df2531]"
              />
              <span>I have read and agree to the <span className="text-[#df2531] underline">Access conditions</span>.</span>
            </label>

            {/* Primary Crimson Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold font-display text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#df2531]/30 transition-all border border-[#df2531]"
            >
              {loading ? (
                <>
                  <BrandLogoLoader size="inline" message="" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign in to Dispatch ERP</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Footnote */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-end text-xs text-neutral-400">
            <span className="text-[10px] font-mono text-neutral-500">DEL Services v2.0 • Enterprise Edition</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-[#df2531] font-mono text-xs">Loading DEL Services Authentication...</div>}>
      <LoginContent />
    </Suspense>
  );
}
