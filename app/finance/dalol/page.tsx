"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Clock,
  ShieldCheck,
  CreditCard,
  Fuel,
  ArrowRight,
  CheckCircle2,
  Bell,
  Globe2,
  Lock,
  Layers,
  Printer,
} from "lucide-react";
import { PaymentReportModal } from "@/components/PaymentReportModal";

export default function DalolPaymentModulePage() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) return;
    setSubscribed(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Main Hero Card with "Coming Soon" */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950/60 via-neutral-900 to-neutral-950 border border-purple-500/30 p-8 sm:p-12 text-center">
        {/* Glow Effects */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-10 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          {/* Coming Soon Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/90 text-purple-300 border border-purple-500/50 shadow-lg shadow-purple-950/50">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            <span className="text-xs font-black uppercase tracking-widest">
              Coming Soon • Under Active Development
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-800/80 text-white font-mono font-bold">
              Q1 2027
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Dalol Payment Module
            </h1>
            <p className="text-sm sm:text-base text-purple-200/80 leading-relaxed">
              Dalol Smart Treasury & Escrow — Next-generation cross-border escrow, automated digital fuel allowance cards, and smart contract milestone payouts for logistics fleets.
            </p>
          </div>

          {/* Feature Teasers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left pt-4">
            <div className="p-4 rounded-2xl bg-neutral-950/80 border border-purple-500/20 space-y-2 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Globe2 size={18} />
              </div>
              <div className="font-bold text-white text-xs">Cross-Border Escrow</div>
              <p className="text-[11px] text-neutral-400 leading-normal">
                Djibouti to Addis Ababa freight corridor smart escrow with dual-currency protection.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950/80 border border-purple-500/20 space-y-2 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Fuel size={18} />
              </div>
              <div className="font-bold text-white text-xs">Fleet Fuel & Toll Cards</div>
              <p className="text-[11px] text-neutral-400 leading-normal">
                Pre-authorized RFID fuel cards with automatic geofenced pump limit triggers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950/80 border border-purple-500/20 space-y-2 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Lock size={18} />
              </div>
              <div className="font-bold text-white text-xs">Telebirr Smart Release</div>
              <p className="text-[11px] text-neutral-400 leading-normal">
                Milestone payments unlocked automatically upon site engineer digital inspection sign-off.
              </p>
            </div>
          </div>

          {/* Notification Signup Form */}
          <div className="pt-6">
            {subscribed ? (
              <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-500/40 text-center space-y-1">
                <div className="flex items-center justify-center gap-2 text-purple-300 font-bold text-sm">
                  <CheckCircle2 size={18} className="text-purple-400" />
                  You're on the priority early-access list!
                </div>
                <p className="text-xs text-neutral-400">
                  Our treasury team will notify you as soon as Dalol Escrow testnet launches.
                </p>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="Enter phone (+251...) or email"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                  required
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold text-xs shrink-0 shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Bell size={14} />
                  Notify Me
                </button>
              </form>
            )}

            {/* Print / Export Report Preview for Dalol Admin */}
            <div className="pt-3 flex justify-center">
              <button
                type="button"
                onClick={() => setIsReportOpen(true)}
                className="px-4 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 border border-purple-500/40 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer font-display"
              >
                <Printer size={14} className="text-purple-300" />
                <span>Print / Export Dalol Payment Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dalol Payment Report Modal */}
      <PaymentReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        role="dalol"
        initialPeriod="monthly"
        invoices={[]}
      />
    </div>
  );
}
