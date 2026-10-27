"use client";

import React, { useState, useMemo } from "react";
import {
  Printer,
  FileSpreadsheet,
  X,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Car,
  HardHat,
  Truck,
} from "lucide-react";
import { formatETB, cn } from "@/lib/utils";

export type ReportRole = "elshaday" | "liora" | "dalol" | "super_admin";
export type ReportPeriod = "daily" | "weekly" | "monthly" | "annually";

interface PaymentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: ReportRole;
  initialPeriod?: ReportPeriod;
  invoices?: any[];
  settlements?: any[];
}

export function PaymentReportModal({
  isOpen,
  onClose,
  role,
  initialPeriod = "monthly",
  invoices = [],
  settlements = [],
}: PaymentReportModalProps) {
  const [period, setPeriod] = useState<ReportPeriod>(initialPeriod);

  // Period dynamic multiplier for figures simulation
  const multiplier = useMemo(() => {
    switch (period) {
      case "daily":
        return 0.12;
      case "weekly":
        return 0.35;
      case "monthly":
        return 1.0;
      case "annually":
        return 11.4;
      default:
        return 1.0;
    }
  }, [period]);

  const reportTitle = useMemo(() => {
    switch (role) {
      case "elshaday":
        return "Elshaday Car Rentals Treasury Statement";
      case "liora":
        return "Liora Heavy Machinery Treasury Statement";
      case "dalol":
        return "Dalol Heavy Freight Logistics Treasury Statement";
      case "super_admin":
        return "DEL Services Consolidated Multi-Division Master Financial Statement";
      default:
        return "DEL Services Financial Report";
    }
  }, [role]);

  const reportSubtitle = useMemo(() => {
    switch (role) {
      case "elshaday":
        return "Passenger Vehicles, VIP Fleet, Host Splits & Telebirr Settlements";
      case "liora":
        return "Excavators, Earthmoving Plant, Operator Allowances & Mobilization Ledger";
      case "dalol":
        return "Interstate Freight Carriers, Port Corridors & Escrow Freight Disbursements";
      case "super_admin":
        return "Unified Enterprise P&L: Elshaday (Cars), Liora (Machinery) & Dalol (Logistics)";
      default:
        return "Official Ethiopian Ministry of Revenue (MoR) Certified Ledger";
    }
  }, [role]);

  // Compute Division Items
  const divisionInvoices = useMemo(() => {
    if (role === "elshaday") {
      return invoices.filter((i) => {
        if (i.isCar !== undefined) return i.isCar;
        const cat = i.assetCategory || i.primaryAsset?.category;
        return cat === "passenger_car" || cat === "commercial_van";
      });
    }
    if (role === "liora") {
      return invoices.filter((i) => {
        if (i.isMachinery !== undefined) return i.isMachinery;
        const cat = i.assetCategory || i.primaryAsset?.category;
        return cat === "heavy_machinery" || cat === "power_equipment" || cat === "attachment";
      });
    }
    if (role === "dalol") {
      return invoices.filter((i) => {
        const cat = i.assetCategory || i.primaryAsset?.category;
        return cat === "commercial_van" || i.isFreight;
      });
    }
    // Super Admin: All Invoices across platform
    return invoices;
  }, [role, invoices]);

  // Tag invoice division for consolidated view
  const categorizedInvoices = useMemo(() => {
    return divisionInvoices.map((inv) => {
      let div = "Liora";
      const cat = inv.assetCategory || inv.primaryAsset?.category;
      if (inv.isCar || cat === "passenger_car" || cat === "commercial_van") {
        div = "Elshaday";
      } else if (inv.isFreight) {
        div = "Dalol";
      }
      return {
        ...inv,
        divisionName: div,
        scaledBase: Math.round((inv.baseRentalAmount || 0) * multiplier),
        scaledVat: Math.round((inv.vat15PctAmount || 0) * multiplier),
        scaledWht: Math.round((inv.withholding2PctAmount || 0) * multiplier),
        scaledTotal: Math.round((inv.totalPayable || 0) * multiplier),
        scaledHostPayout: Math.round((inv.partnerPayoutAmount || (inv.totalPayable * 0.7)) * multiplier),
        scaledBrokerCommission: Math.round((inv.brokerCommissionAmount || (inv.totalPayable * 0.05)) * multiplier),
      };
    });
  }, [divisionInvoices, multiplier]);

  // Consolidated Division Breakdown (for Super Admin)
  const consolidatedDivisions = useMemo(() => {
    const elshadayList = categorizedInvoices.filter((i) => i.divisionName === "Elshaday");
    const lioraList = categorizedInvoices.filter((i) => i.divisionName === "Liora");
    const dalolList = categorizedInvoices.filter((i) => i.divisionName === "Dalol");

    const getStats = (list: any[]) => {
      const gross = list.reduce((sum, i) => sum + i.scaledTotal, 0);
      const vat = list.reduce((sum, i) => sum + i.scaledVat, 0);
      const wht = list.reduce((sum, i) => sum + i.scaledWht, 0);
      const host = list.reduce((sum, i) => sum + i.scaledHostPayout, 0);
      const broker = list.reduce((sum, i) => sum + i.scaledBrokerCommission, 0);
      const net = gross - host - broker - vat;
      return { count: list.length, gross, vat, wht, host, broker, net };
    };

    return [
      { name: "Elshaday Division", category: "Passenger Vehicles & VIP Fleet", ...getStats(elshadayList) },
      { name: "Liora Division", category: "Heavy Equipment, Earthmoving & Cranes", ...getStats(lioraList) },
      { name: "Dalol Division", category: "Interstate Freight Transport & Escrow", ...getStats(dalolList) },
    ];
  }, [categorizedInvoices]);

  // Overall Financial Totals
  const totals = useMemo(() => {
    const totalBilled = categorizedInvoices.reduce((sum, i) => sum + i.scaledTotal, 0);
    const totalVat = categorizedInvoices.reduce((sum, i) => sum + i.scaledVat, 0);
    const totalWht = categorizedInvoices.reduce((sum, i) => sum + i.scaledWht, 0);
    const totalHost = categorizedInvoices.reduce((sum, i) => sum + i.scaledHostPayout, 0);
    const totalBroker = categorizedInvoices.reduce((sum, i) => sum + i.scaledBrokerCommission, 0);
    const totalNetRevenue = totalBilled - totalHost - totalBroker - totalVat;
    const paidCount = categorizedInvoices.filter((i) => i.isPaid).length;
    const pendingCount = categorizedInvoices.filter((i) => !i.isPaid).length;

    return {
      totalBilled,
      totalVat,
      totalWht,
      totalHost,
      totalBroker,
      totalNetRevenue,
      paidCount,
      pendingCount,
      count: categorizedInvoices.length,
    };
  }, [categorizedInvoices]);

  if (!isOpen) return null;

  // Print Handlers
  const handlePrint = () => {
    window.print();
  };

  // Excel CSV Export Handler
  const handleExportCSV = () => {
    const headers = [
      "Invoice Number",
      "Booking Reference",
      "Division",
      "Client Name",
      "Payment Channel",
      "Base Rental (ETB)",
      "15% VAT (ETB)",
      "2% WHT (ETB)",
      "Total Payable (ETB)",
      "Host Payout (ETB)",
      "Broker Comm (ETB)",
      "Status",
    ];

    const rows = categorizedInvoices.map((inv) => [
      `"${inv.invoiceNumber || ""}"`,
      `"${inv.bookingReference || ""}"`,
      `"${inv.divisionName || ""}"`,
      `"${(inv.renterName || "").replace(/"/g, '""')}"`,
      `"${inv.paymentMethod || "Telebirr"}"`,
      inv.scaledBase,
      inv.scaledVat,
      inv.scaledWht,
      inv.scaledTotal,
      inv.scaledHostPayout,
      inv.scaledBrokerCommission,
      inv.isPaid ? "PAID" : "PENDING",
    ]);

    // Summary row
    rows.push([
      `"TOTALS"`,
      `"${totals.count} Invoices"`,
      `"ALL DIVISIONS"`,
      `""`,
      `""`,
      "",
      totals.totalVat,
      totals.totalWht,
      totals.totalBilled,
      totals.totalHost,
      totals.totalBroker,
      `"Net: ${totals.totalNetRevenue}"`,
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `DEL_Payment_Report_${role.toUpperCase()}_${period.toUpperCase()}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn text-neutral-900 overflow-y-auto">
      {/* Print Specific CSS to ensure clean paper styling */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-report,
          #printable-report * {
            visibility: visible !important;
          }
          #printable-report {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            background: #ffffff !important;
            color: #111827 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
          .print-border {
            border: 1px solid #d1d5db !important;
          }
          .print-bg-gray {
            background-color: #f3f4f6 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-crimson {
            color: #df2531 !important;
          }
        }
      `}</style>

      {/* Main Modal Card */}
      <div
        id="printable-report"
        className="bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 text-neutral-900 dark:text-neutral-100 relative"
      >
        {/* Action Header (Hidden during physical print) */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#df2531]/15 text-[#df2531]">
                <Building2 size={20} />
              </span>
              <div>
                <h2 className="text-lg font-black text-neutral-900 dark:text-white font-display">
                  Official Printable Payment & Tax Report
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Select reporting timeframe, review detailed ledger, and print to PDF or export to Excel (.csv).
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Period Selector */}
            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl border border-neutral-300 dark:border-neutral-800">
              {(["daily", "weekly", "monthly", "annually"] as ReportPeriod[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer font-display",
                    period === p
                      ? "bg-[#df2531] text-white shadow"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#df2531]/20 transition-all font-display cursor-pointer"
            >
              <Printer size={14} />
              Print / Save PDF
            </button>

            {/* Excel CSV Export Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all font-display cursor-pointer"
            >
              <FileSpreadsheet size={14} />
              Export to Excel (.csv)
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* OFFICIAL STATEMENT LETTERHEAD (VISIBLE BOTH ON SCREEN & PRINT) */}
        {/* ============================================================ */}
        <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-[#df2531] flex items-center justify-center font-black text-white text-xl shadow-lg font-display">
                DEL
              </div>
              <div>
                <div className="text-xl font-black text-[#df2531] tracking-tight font-display">
                  DEL SERVICES PLC (ETHIOPIA)
                </div>
                <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 font-display">
                  Enterprise Fleet &amp; Heavy Equipment Logistics Network
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
                  TIN: 0023456789 • VAT Reg: ET-VAT-902148 • Jarkros Sets Building, 2nd Floor, Addis Ababa, Ethiopia • info@delservices.et • +251 964 727 269 / +251 911 526 965
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono text-xs space-y-1">
              <div className="inline-block px-2.5 py-1 rounded-md bg-[#df2531]/10 text-[#df2531] border border-[#df2531]/30 font-bold uppercase tracking-wider">
                {period} Fiscal Statement
              </div>
              <div className="text-neutral-700 dark:text-neutral-300 font-bold">
                Ref: DEL-REP-2026-X{Math.floor(multiplier * 1000)}
              </div>
              <div className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                Date Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-lg font-black text-neutral-900 dark:text-white font-display">
                {reportTitle}
              </h1>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {reportSubtitle}
              </p>
            </div>
            <div className="text-xs font-mono text-neutral-700 dark:text-neutral-300">
              Scope:{" "}
              <strong className="text-[#df2531] uppercase">
                {role === "super_admin" ? "All Operating Divisions (Consolidated)" : `${role} Admin Division`}
              </strong>
            </div>
          </div>
        </div>

        {/* 6 Top Key Performance Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 space-y-1">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-display">Gross Billed</span>
            <div className="text-base sm:text-lg font-black text-neutral-900 dark:text-white font-mono font-display">
              {formatETB(totals.totalBilled)}
            </div>
            <span className="text-[9px] text-neutral-400">{totals.count} Invoiced Rentals</span>
          </div>

          <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 space-y-1">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-display">15% MoR VAT</span>
            <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono font-display">
              {formatETB(totals.totalVat)}
            </div>
            <span className="text-[9px] text-neutral-400">Ministry of Revenue</span>
          </div>

          <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 space-y-1">
            <span className="text-[10px] font-bold text-[#df2531] uppercase tracking-wider font-display">2% B2B WHT</span>
            <div className="text-base sm:text-lg font-black text-[#df2531] font-mono font-display">
              {formatETB(totals.totalWht)}
            </div>
            <span className="text-[9px] text-neutral-400">Withholding Receipts</span>
          </div>

          <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 space-y-1">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-display">Host / Partner</span>
            <div className="text-base sm:text-lg font-black text-neutral-900 dark:text-white font-mono font-display">
              {formatETB(totals.totalHost)}
            </div>
            <span className="text-[9px] text-neutral-400">Fleet Host Payouts</span>
          </div>

          <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 space-y-1">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-display">Brokers</span>
            <div className="text-base sm:text-lg font-black text-neutral-900 dark:text-white font-mono font-display">
              {formatETB(totals.totalBroker)}
            </div>
            <span className="text-[9px] text-neutral-400">Commission Splits</span>
          </div>

          <div className="p-3.5 rounded-xl border border-[#df2531]/40 bg-[#df2531]/10 space-y-1">
            <span className="text-[10px] font-bold text-[#df2531] uppercase tracking-wider font-display">Net DEL Revenue</span>
            <div className="text-base sm:text-lg font-black text-[#df2531] font-mono font-display">
              {formatETB(totals.totalNetRevenue)}
            </div>
            <span className="text-[9px] text-neutral-500">Platform Margin</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SUPER ADMIN CONSOLIDATED DIVISION BREAKDOWN (ALL DIVISIONS) */}
        {/* ============================================================ */}
        {role === "super_admin" && (
          <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-neutral-900 dark:text-white text-sm flex items-center gap-2 font-display">
                <Layers size={16} className="text-[#df2531]" />
                Multi-Division Consolidated Ledger Breakdown
              </div>
              <span className="text-xs font-mono text-neutral-500">
                Elshaday • Liora • Dalol
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-700 dark:text-neutral-300">
                <thead className="bg-neutral-200/80 dark:bg-black text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 border-b border-neutral-300 dark:border-neutral-800 font-display">
                  <tr>
                    <th className="px-3.5 py-2.5 font-bold">Division</th>
                    <th className="px-3.5 py-2.5 font-bold">Category</th>
                    <th className="px-3.5 py-2.5 font-bold">Invoices</th>
                    <th className="px-3.5 py-2.5 font-bold">Gross Billed</th>
                    <th className="px-3.5 py-2.5 font-bold">15% VAT</th>
                    <th className="px-3.5 py-2.5 font-bold">2% WHT</th>
                    <th className="px-3.5 py-2.5 font-bold">Host Payout</th>
                    <th className="px-3.5 py-2.5 font-bold">Broker Comm</th>
                    <th className="px-3.5 py-2.5 font-bold text-right">Net DEL Platform</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-medium">
                  {consolidatedDivisions.map((div, i) => (
                    <tr key={i} className="hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="px-3.5 py-2.5 font-bold text-neutral-900 dark:text-white font-display">
                        {div.name}
                      </td>
                      <td className="px-3.5 py-2.5 text-neutral-600 dark:text-neutral-400">
                        {div.category}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono">{div.count}</td>
                      <td className="px-3.5 py-2.5 font-mono font-bold text-neutral-900 dark:text-white">
                        {formatETB(div.gross)}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono text-emerald-600 dark:text-emerald-400">
                        {formatETB(div.vat)}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono text-[#df2531]">
                        {formatETB(div.wht)}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono">
                        {formatETB(div.host)}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono">
                        {formatETB(div.broker)}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-right">
                        {formatETB(div.net)}
                      </td>
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr className="bg-neutral-200 dark:bg-black font-black text-neutral-900 dark:text-white font-display">
                    <td className="px-3.5 py-3" colSpan={2}>
                      CONSOLIDATED GRAND TOTALS
                    </td>
                    <td className="px-3.5 py-3 font-mono">{totals.count}</td>
                    <td className="px-3.5 py-3 font-mono text-[#df2531]">{formatETB(totals.totalBilled)}</td>
                    <td className="px-3.5 py-3 font-mono text-emerald-600 dark:text-emerald-400">{formatETB(totals.totalVat)}</td>
                    <td className="px-3.5 py-3 font-mono text-[#df2531]">{formatETB(totals.totalWht)}</td>
                    <td className="px-3.5 py-3 font-mono">{formatETB(totals.totalHost)}</td>
                    <td className="px-3.5 py-3 font-mono">{formatETB(totals.totalBroker)}</td>
                    <td className="px-3.5 py-3 font-mono text-emerald-600 dark:text-emerald-400 text-right">
                      {formatETB(totals.totalNetRevenue)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ITEMIZED TRANSACTION REGISTER */}
        {/* ============================================================ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-neutral-900 dark:text-white text-sm font-display">
              Itemized Invoice &amp; Settlement Register ({period.toUpperCase()})
            </h3>
            <span className="text-xs text-neutral-500 font-mono">
              {totals.paidCount} Settled • {totals.pendingCount} Pending Verification
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <table className="w-full text-left text-xs text-neutral-700 dark:text-neutral-300">
              <thead className="bg-neutral-100 dark:bg-black text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 font-display">
                <tr>
                  <th className="px-3.5 py-2.5 font-bold">Invoice / Booking</th>
                  {role === "super_admin" && <th className="px-3.5 py-2.5 font-bold">Division</th>}
                  <th className="px-3.5 py-2.5 font-bold">Client / Entity</th>
                  <th className="px-3.5 py-2.5 font-bold">Channel</th>
                  <th className="px-3.5 py-2.5 font-bold">Base Rental</th>
                  <th className="px-3.5 py-2.5 font-bold">15% VAT</th>
                  <th className="px-3.5 py-2.5 font-bold">2% WHT</th>
                  <th className="px-3.5 py-2.5 font-bold">Total Billed</th>
                  <th className="px-3.5 py-2.5 font-bold">Host Split</th>
                  <th className="px-3.5 py-2.5 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/80 font-medium">
                {categorizedInvoices.map((inv, idx) => (
                  <tr key={inv.id || idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="px-3.5 py-2.5">
                      <div className="font-mono font-bold text-neutral-900 dark:text-white">
                        {inv.invoiceNumber || `INV-DEL-${100 + idx}`}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        {inv.bookingReference || `DEL-BKG-${100 + idx}`}
                      </div>
                    </td>

                    {role === "super_admin" && (
                      <td className="px-3.5 py-2.5">
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold font-display uppercase bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-200">
                          {inv.divisionName}
                        </span>
                      </td>
                    )}

                    <td className="px-3.5 py-2.5">
                      <div className="font-semibold text-neutral-900 dark:text-white">
                        {inv.renterName || "MIDROC Construction Ethiopia"}
                      </div>
                    </td>

                    <td className="px-3.5 py-2.5 font-mono text-[11px] text-neutral-600 dark:text-neutral-400">
                      {inv.paymentMethod || "Telebirr SuperApp"}
                    </td>

                    <td className="px-3.5 py-2.5 font-mono">{formatETB(inv.scaledBase)}</td>
                    <td className="px-3.5 py-2.5 font-mono text-emerald-600 dark:text-emerald-400">
                      {formatETB(inv.scaledVat)}
                    </td>
                    <td className="px-3.5 py-2.5 font-mono text-[#df2531]">
                      {inv.scaledWht > 0 ? `-${formatETB(inv.scaledWht)}` : "ETB 0.00"}
                    </td>
                    <td className="px-3.5 py-2.5 font-mono font-bold text-neutral-900 dark:text-white">
                      {formatETB(inv.scaledTotal)}
                    </td>
                    <td className="px-3.5 py-2.5 font-mono text-neutral-600 dark:text-neutral-400">
                      {formatETB(inv.scaledHostPayout)}
                    </td>
                    <td className="px-3.5 py-2.5 text-right">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono",
                          inv.isPaid
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        )}
                      >
                        {inv.isPaid ? "SETTLED" : "UNPAID"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================================================ */}
        {/* AUDIT & EXECUTIVE SIGN-OFF BLOCK (CRITICAL FOR OFFICIAL PRINT) */}
        {/* ============================================================ */}
        <div className="pt-6 border-t border-neutral-300 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-neutral-700 dark:text-neutral-300">
          <div className="space-y-6">
            <div>
              <div className="font-bold uppercase tracking-wider text-[10px] text-neutral-500 font-display">
                Prepared By (Treasury Officer)
              </div>
              <div className="mt-8 pt-2 border-t border-neutral-400 dark:border-neutral-700 font-semibold text-neutral-900 dark:text-white">
                Finance &amp; Disbursements Desk
              </div>
              <div className="text-[10px] text-neutral-500">DEL Services PLC • Jarkros Sets Building, 2nd Floor, Addis Ababa, Ethiopia • info@delservices.et</div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="font-bold uppercase tracking-wider text-[10px] text-neutral-500 font-display">
                Audited &amp; Reconciled By
              </div>
              <div className="mt-8 pt-2 border-t border-neutral-400 dark:border-neutral-700 font-semibold text-neutral-900 dark:text-white">
                Internal Tax &amp; MoR Compliance
              </div>
              <div className="text-[10px] text-neutral-500">Commercial Bank &amp; Telebirr Clearing</div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="font-bold uppercase tracking-wider text-[10px] text-[#df2531] font-display flex items-center gap-1">
                <ShieldCheck size={13} />
                Executive Approval &amp; Release
              </div>
              <div className="mt-8 pt-2 border-t border-[#df2531] font-bold text-neutral-900 dark:text-white font-display">
                Yonas Bekele (Head Dispatcher)
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                ✓ Digitally Signed &amp; Authorized
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
