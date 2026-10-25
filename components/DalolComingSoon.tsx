"use client";

import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  Globe2,
  Fuel,
  Lock,
  Layers,
  ShieldCheck,
  CreditCard,
  Send,
} from "lucide-react";

interface DalolComingSoonProps {
  moduleName?: string;
  description?: string;
}

export function DalolComingSoon({
  moduleName = "Dalol Operations & Freight Terminal",
  description = "Cross-border logistics management, smart RFID fleet fuel allowance dispatch, and multi-currency escrow settlement workflows are launching in Q1 2027.",
}: DalolComingSoonProps) {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) return;
    setSubscribed(true);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Main Hero Card with "Coming Soon" */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#df2531]/20 via-[#0a0a0a] to-[#000000] border border-[#df2531]/40 p-8 sm:p-12 text-center">
        {/* Glow Effects */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#df2531]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-10 w-80 h-80 bg-[#df2531]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          {/* Coming Soon Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0a0a0a] text-white border border-[#df2531]/50 shadow-lg shadow-[#df2531]/20 font-display">
            <span className="w-2 h-2 rounded-full bg-[#df2531] animate-ping" />
            <span className="text-xs font-black uppercase tracking-widest text-[#df2531]">
              Coming Soon • Under Active Development
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#df2531] text-white font-mono font-bold">
              Q1 2027
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
              {moduleName}
            </h1>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Feature Teasers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left pt-4">
            <div className="p-4 rounded-2xl bg-[#0a0a0a]/90 border border-[#df2531]/30 space-y-2 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-[#df2531]/20 text-[#df2531] flex items-center justify-center">
                <Globe2 size={18} />
              </div>
              <div className="font-bold text-white text-xs font-display">Cross-Border Escrow</div>
              <p className="text-[11px] text-neutral-400 leading-normal">
                Djibouti to Addis Ababa freight corridor smart escrow with dual-currency protection.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0a0a0a]/90 border border-[#df2531]/30 space-y-2 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-[#df2531]/20 text-[#df2531] flex items-center justify-center">
                <Fuel size={18} />
              </div>
              <div className="font-bold text-white text-xs font-display">Fleet Fuel &amp; Toll Cards</div>
              <p className="text-[11px] text-neutral-400 leading-normal">
                Pre-authorized RFID fuel cards with automatic geofenced pump limit triggers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0a0a0a]/90 border border-[#df2531]/30 space-y-2 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Lock size={18} />
              </div>
              <div className="font-bold text-white text-xs font-display">Milestone Smart Release</div>
              <p className="text-[11px] text-neutral-400 leading-normal">
                Freight and mobilization payments unlocked automatically upon digital inspection sign-off.
              </p>
            </div>
          </div>

          {/* Notification Signup Form */}
          <div className="pt-6">
            {subscribed ? (
              <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-emerald-500/40 text-center space-y-1">
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 size={18} />
                  You are on the priority early-access list!
                </div>
                <p className="text-xs text-neutral-400">
                  Our dispatch operations team will notify you as soon as this Dalol module is provisioned.
                </p>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="Enter dispatch email or phone..."
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#df2531]"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold text-xs whitespace-nowrap flex items-center justify-center gap-1.5 shadow-lg shadow-[#df2531]/30 active:scale-95 transition-all cursor-pointer font-display"
                >
                  <Send size={13} />
                  Notify Me
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
