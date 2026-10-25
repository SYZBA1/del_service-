"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Car,
  HardHat,
  Sparkles,
  ReceiptText,
  Handshake,
  DollarSign,
  TrendingUp,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FinanceTabsProps {
  activeTab?: "elshaday" | "liora" | "dalol" | "settlements" | "partners";
}

export function FinanceNavigationTabs({ activeTab }: FinanceTabsProps) {
  const pathname = usePathname();

  const tabs = [
    {
      id: "elshaday",
      label: "Elshaday Payment Module",
      sublabel: "Car Rentals Cashflow & Bookings",
      href: "/finance/elshaday",
      icon: Car,
      accentColor: "from-[#df2531]/20 to-[#df2531]/10 border-[#df2531]/30 text-[#df2531]",
      activeBg: "bg-[#df2531]/15 border-[#df2531] text-[#df2531] shadow-[#df2531]/10",
      badge: "Car Fleet",
    },
    {
      id: "liora",
      label: "Liora Payment Module",
      sublabel: "Machinery Cashflow & Advance Ledger",
      href: "/finance/liora",
      icon: HardHat,
      accentColor: "from-[#df2531]/20 to-[#df2531]/10 border-[#df2531]/30 text-[#df2531]",
      activeBg: "bg-[#df2531]/15 border-[#df2531] text-[#df2531] shadow-[#df2531]/10",
      badge: "Heavy Plant",
    },
    {
      id: "dalol",
      label: "Dalol Payment Module",
      sublabel: "Cross-Border Escrow & Fuel Cards",
      href: "/finance/dalol",
      icon: Sparkles,
      accentColor: "from-[#df2531]/20 to-[#df2531]/10 border-[#df2531]/30 text-[#df2531]",
      activeBg: "bg-[#df2531]/15 border-[#df2531] text-[#df2531] shadow-[#df2531]/10",
      badge: "Coming Soon",
      isComingSoon: true,
    },
    {
      id: "settlements",
      label: "Tax & Host Settlements",
      sublabel: "Ledger, VAT 15% & WHT 2%",
      href: "/finance/settlements",
      icon: ReceiptText,
      accentColor: "from-[#df2531]/20 to-[#df2531]/10 border-[#df2531]/30 text-[#df2531]",
      activeBg: "bg-[#df2531]/15 border-[#df2531] text-[#df2531] shadow-[#df2531]/10",
      badge: "Ledger",
    },
    {
      id: "partners",
      label: "Partner Onboarding",
      sublabel: "Host Revenue Share Agreements",
      href: "/partners",
      icon: Handshake,
      accentColor: "from-neutral-500/20 to-neutral-500/10 border-neutral-500/30 text-neutral-300",
      activeBg: "bg-neutral-800 border-neutral-600 text-white shadow-neutral-500/10",
      badge: "Hosts",
    },
  ];

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase flex items-center gap-2 font-display">
            <DollarSign className="w-4 h-4 text-[#df2531]" />
            Finance & Partners Financial Hub
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
              FY 2026/27
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Dedicated treasury modules for Car Rentals (Elshaday), Heavy Plant (Liora), and Future Escrow (Dalol)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 mt-3">
        {tabs.map((tab) => {
          const isActive =
            activeTab === tab.id ||
            pathname === tab.href ||
            (tab.id === "elshaday" && pathname.startsWith("/finance/elshaday")) ||
            (tab.id === "liora" && pathname.startsWith("/finance/liora")) ||
            (tab.id === "dalol" && pathname.startsWith("/finance/dalol")) ||
            (tab.id === "settlements" && pathname.startsWith("/finance/settlements")) ||
            (tab.id === "partners" && pathname.startsWith("/partners"));

          const Icon = tab.icon;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "relative group flex flex-col p-3 rounded-xl border transition-all duration-200 text-left",
                isActive
                  ? cn(tab.activeBg, "shadow-sm")
                  : "bg-neutral-900/60 border-neutral-800/80 hover:bg-neutral-900 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200"
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                    isActive
                      ? "bg-neutral-950/80 text-inherit"
                      : "bg-neutral-800/80 text-neutral-400 group-hover:text-neutral-200"
                  )}
                >
                  <Icon size={16} />
                </div>
                {tab.badge && (
                  <span
                    className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider",
                      tab.isComingSoon
                        ? "bg-purple-950/80 text-purple-300 border border-purple-700/60 animate-pulse"
                        : isActive
                        ? "bg-neutral-950/80 text-inherit border border-current/20"
                        : "bg-neutral-800 text-neutral-400"
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              <div className="font-semibold text-xs text-white truncate group-hover:text-white">
                {tab.label}
              </div>
              <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                {tab.sublabel}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
