"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  HardHat,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Filter,
  Download,
  Search,
  Building2,
  UserCheck,
  Briefcase,
  ShieldCheck,
  Eye,
  CreditCard,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  ExternalLink,
  Percent,
  Check,
  X,
  Phone,
  MapPin,
  Wrench,
  Gauge,
  FileCheck2,
  Printer,
  FileSpreadsheet,
} from "lucide-react";
import { formatETB, cn } from "@/lib/utils";
import { PaymentReportModal } from "@/components/PaymentReportModal";

type TimeRange = "daily" | "weekly" | "monthly" | "annually";

export default function LioraPaymentModulePage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending">("all");
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/finance/invoices");
      const json = await res.json();
      if (json.success) {
        // Filter for heavy machinery, power equipment, and attachments
        const machInvoices = json.data.filter((inv: any) => {
          if (inv.isMachinery !== undefined) return inv.isMachinery;
          const cat = inv.assetCategory || inv.primaryAsset?.category;
          return cat === "heavy_machinery" || cat === "power_equipment" || cat === "attachment";
        });
        setInvoices(machInvoices);
      }
    } catch (err) {
      console.error("Failed to load Liora machinery finance data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Time-frame dynamic multiplier
  const timeMultiplier = useMemo(() => {
    switch (timeRange) {
      case "daily":
        return 0.08;
      case "weekly":
        return 0.32;
      case "monthly":
        return 1.0;
      case "annually":
        return 11.2;
      default:
        return 1.0;
    }
  }, [timeRange]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const rawCashIn = invoices.reduce((sum, inv) => sum + (inv.totalPayable || 0), 0);
    const rawAdvances = invoices.reduce((sum, inv) => sum + (inv.advancePaymentAmount || 0), 0);
    const rawPartnerPayout = invoices.reduce((sum, inv) => sum + (inv.partnerCut || inv.partnerPayoutAmount || 0), 0);
    const rawBrokerCommission = invoices.reduce((sum, inv) => sum + (inv.brokerCut || inv.brokerCommissionAmount || 0), 0);
    const rawConfirmed = invoices.filter((i) => i.isPaid).reduce((sum, inv) => sum + (inv.totalPayable || 0), 0);
    const rawPending = invoices.filter((i) => !i.isPaid).reduce((sum, inv) => sum + (inv.totalPayable || 0), 0);

    const totalCashIn = Math.round(rawCashIn * timeMultiplier);
    const totalAdvancePayments = Math.round(rawAdvances * timeMultiplier);
    const totalPartnerPayout = Math.round(rawPartnerPayout * timeMultiplier);
    const totalBrokerCommission = Math.round(rawBrokerCommission * timeMultiplier);
    const confirmedPayment = Math.round(rawConfirmed * timeMultiplier);
    const pendingPayment = Math.round(rawPending * timeMultiplier);

    // Heavy machinery maintenance & overhaul reserve (hydraulic filters, track pads, grease)
    const machineryMaintenanceLoss = Math.round(totalCashIn * 0.055);
    const totalCashOut = totalPartnerPayout + totalBrokerCommission + machineryMaintenanceLoss;
    const netProfit = Math.max(0, totalCashIn - totalCashOut);
    const profitMargin = totalCashIn > 0 ? ((netProfit / totalCashIn) * 100).toFixed(1) : "0.0";

    // Projections
    const projectedNext30Days = Math.round(rawCashIn * 1.22);
    const projectedNextQuarter = Math.round(rawCashIn * 3.65);
    const projectedAnnual = Math.round(rawCashIn * 14.2);

    return {
      totalCashIn,
      totalAdvancePayments,
      totalCashOut,
      netProfit,
      profitMargin,
      machineryMaintenanceLoss,
      totalPartnerPayout,
      totalBrokerCommission,
      confirmedPayment,
      pendingPayment,
      projectedNext30Days,
      projectedNextQuarter,
      projectedAnnual,
    };
  }, [invoices, timeMultiplier]);

  // Filtered Bookings for the Table
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !q ||
        inv.invoiceNumber?.toLowerCase().includes(q) ||
        inv.bookingReference?.toLowerCase().includes(q) ||
        inv.renterName?.toLowerCase().includes(q) ||
        inv.primaryAsset?.make?.toLowerCase().includes(q) ||
        inv.primaryAsset?.model?.toLowerCase().includes(q) ||
        inv.partnerName?.toLowerCase().includes(q) ||
        inv.brokerName?.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "paid" && inv.isPaid) ||
        (statusFilter === "pending" && !inv.isPaid);

      return matchSearch && matchStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  // Partners List (Heavy Machinery)
  const partnersSummary = useMemo(() => {
    const map = new Map<string, any>();
    invoices.forEach((inv) => {
      const partnerName = inv.partnerName || "DEL Heavy Machinery Division";
      const cut = inv.partnerCut || inv.partnerPayoutAmount || 0;
      if (!map.has(partnerName)) {
        map.set(partnerName, {
          name: partnerName,
          totalEarned: 0,
          bookingsCount: 0,
          pendingPayout: 0,
          confirmedPayout: 0,
          bankName: inv.paymentMethod || "Commercial Bank of Ethiopia",
        });
      }
      const entry = map.get(partnerName);
      entry.totalEarned += Math.round(cut * timeMultiplier);
      entry.bookingsCount += 1;
      if (inv.isPaid) {
        entry.confirmedPayout += Math.round(cut * timeMultiplier);
      } else {
        entry.pendingPayout += Math.round(cut * timeMultiplier);
      }
    });
    return Array.from(map.values());
  }, [invoices, timeMultiplier]);

  // Brokers List (Heavy Infrastructure)
  const brokersSummary = useMemo(() => {
    const map = new Map<string, any>();
    invoices.forEach((inv) => {
      if (!inv.brokerName) return;
      const brokerName = inv.brokerName;
      const cut = inv.brokerCut || inv.brokerCommissionAmount || 0;
      const pct = inv.brokerCommissionPct || 8.0;
      if (!map.has(brokerName)) {
        map.set(brokerName, {
          name: brokerName,
          commissionPct: pct,
          totalCommission: 0,
          dealsClosed: 0,
          paidCommission: 0,
          pendingCommission: 0,
        });
      }
      const entry = map.get(brokerName);
      entry.totalCommission += Math.round(cut * timeMultiplier);
      entry.dealsClosed += 1;
      if (inv.isPaid) {
        entry.paidCommission += Math.round(cut * timeMultiplier);
      } else {
        entry.pendingCommission += Math.round(cut * timeMultiplier);
      }
    });
    return Array.from(map.values());
  }, [invoices, timeMultiplier]);

  const handleSettleMachineryInvoice = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/v1/finance/invoices/${invoiceId}/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: "Awash RTGS Transfer" }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Machinery Rental invoice successfully settled via Bank Draft!");
        fetchFinanceData();
        if (selectedBooking && selectedBooking.id === invoiceId) {
          setSelectedBooking({ ...selectedBooking, isPaid: true, paidAt: new Date().toISOString() });
        }
      }
    } catch (e) {
      alert("Error settling invoice");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#df2531] text-white font-bold shadow-xl border border-[#df2531]/50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Time Range Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5 rounded-2xl bg-[#0a0a0a] border border-[#df2531]/30 shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#df2531]/15 text-[#df2531] border border-[#df2531]/30 flex items-center justify-center">
              <HardHat size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 font-display">
                Liora Payment Module
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#df2531]/15 text-[#df2531] border border-[#df2531]/30 font-sans">
                  Heavy Machinery Treasury
                </span>
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                Earthmoving Fleet Cashflow, Advance Deposits, Partner Shares & Linked Project Bookings
              </p>
            </div>
          </div>
        </div>

        {/* Controls: Time Filter Buttons & Print/Export Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black border border-neutral-800">
            {(["daily", "weekly", "monthly", "annually"] as TimeRange[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setTimeRange(tab)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                  timeRange === tab
                    ? "bg-[#df2531] text-white shadow-md shadow-[#df2531]/30 font-display"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                )}
              >
                {tab === "daily" && "Daily"}
                {tab === "weekly" && "Weekly"}
                {tab === "monthly" && "Monthly"}
                {tab === "annually" && "Annually"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsReportOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#df2531]/30 transition-all font-display cursor-pointer"
          >
            <Printer size={14} />
            <span>Print / Export Payment Report</span>
          </button>
        </div>
      </div>

      {/* Top 7 Metric Cards (Including Dedicated Advance Payments!) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total Cash In */}
        <div className="p-3.5 rounded-xl bg-[#0a0a0a] border border-neutral-800 space-y-1 group hover:border-[#df2531]/40 transition-colors">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Total Cash In</span>
            <ArrowUpRight size={14} className="text-emerald-400" />
          </div>
          <div className="text-lg font-black text-white font-mono font-display">{formatETB(metrics.totalCashIn)}</div>
          <div className="text-[9px] text-emerald-400 font-medium">Billed Contracts</div>
        </div>

        {/* Dedicated Advance Payments Received (Highlight!) */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#df2531]/20 via-[#0a0a0a] to-[#0a0a0a] border border-[#df2531]/60 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#df2531]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Advance Paid</span>
            <FileCheck2 size={15} />
          </div>
          <div className="text-lg font-black text-white font-mono font-display">{formatETB(metrics.totalAdvancePayments)}</div>
          <div className="text-[9px] text-[#df2531] font-semibold">30% Mobilization Vault</div>
        </div>

        {/* Total Cash Out */}
        <div className="p-3.5 rounded-xl bg-[#0a0a0a] border border-neutral-800 space-y-1 group hover:border-[#df2531]/40 transition-colors">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Total Cash Out</span>
            <ArrowDownRight size={14} className="text-[#df2531]" />
          </div>
          <div className="text-lg font-black text-white font-mono font-display">{formatETB(metrics.totalCashOut)}</div>
          <div className="text-[9px] text-neutral-400 font-medium">Partners & Subcontracts</div>
        </div>

        {/* Net Profit */}
        <div className="p-3.5 rounded-xl bg-[#0a0a0a] border border-[#df2531]/40 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#df2531]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Net Profit</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-[#df2531]/20 text-white font-extrabold font-mono">
              {metrics.profitMargin}%
            </span>
          </div>
          <div className="text-lg font-black text-[#df2531] font-mono font-display">{formatETB(metrics.netProfit)}</div>
          <div className="text-[9px] text-neutral-400 font-medium">Platform Margin</div>
        </div>

        {/* Loss / Maintenance Reserve */}
        <div className="p-3.5 rounded-xl bg-[#0a0a0a] border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Loss & Overhaul</span>
            <AlertCircle size={14} className="text-[#df2531]/80" />
          </div>
          <div className="text-lg font-black text-white font-mono font-display">{formatETB(metrics.machineryMaintenanceLoss)}</div>
          <div className="text-[9px] text-neutral-400">Hydraulic lines & wear</div>
        </div>

        {/* Confirmed */}
        <div className="p-3.5 rounded-xl bg-[#0a0a0a] border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Confirmed</span>
            <CheckCircle2 size={14} />
          </div>
          <div className="text-lg font-black text-emerald-400 font-mono font-display">{formatETB(metrics.confirmedPayment)}</div>
          <div className="text-[9px] text-neutral-400">Cleared Bank Drafts</div>
        </div>

        {/* Pending Progress */}
        <div className="p-3.5 rounded-xl bg-[#0a0a0a] border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-300">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Progress Due</span>
            <Clock size={14} className="text-[#df2531]" />
          </div>
          <div className="text-lg font-black text-neutral-200 font-mono font-display">{formatETB(metrics.pendingPayment)}</div>
          <div className="text-[9px] text-neutral-400">Site Timesheet Pending</div>
        </div>
      </div>

      {/* ADVANCE PAYMENTS DEDICATED TRACKER (Crucial Requirement for Machinery) */}
      <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-[#df2531]/30 space-y-3 shadow-lg">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#df2531]/15 text-[#df2531] flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm font-display">Machinery Advance Payments & CPO Security Vault</h3>
              <p className="text-[11px] text-neutral-400">Mandatory 30% mobilization advances and bank guarantees held before site delivery</p>
            </div>
          </div>
          <div className="text-xs font-mono font-bold text-white bg-[#df2531]/20 border border-[#df2531]/50 px-3 py-1 rounded-xl font-display">
            Total Vault Held: {formatETB(metrics.totalAdvancePayments)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {invoices.map((inv) => {
            const hasAdvance = (inv.advancePaymentAmount || 0) > 0;
            const asset = inv.primaryAsset;
            return (
              <div
                key={inv.id}
                className="p-3.5 rounded-xl bg-black border border-neutral-800/80 hover:border-[#df2531]/40 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono text-white font-bold">{inv.bookingReference}</span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                      hasAdvance
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                        : "bg-neutral-800 text-neutral-400"
                    )}
                  >
                    {hasAdvance ? "Advance Deposited" : "Retainer Pending"}
                  </span>
                </div>

                <div>
                  <div className="font-bold text-white text-xs truncate">
                    {asset?.make} {asset?.model}
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                    Project: {inv.renterName}
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-850 flex items-center justify-between text-xs">
                  <span className="text-neutral-400 text-[10px]">Advance Amount:</span>
                  <span className="font-mono font-bold text-white font-display">
                    {formatETB(inv.advancePaymentAmount || 0)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LINKED MACHINERY BOOKINGS TABLE (Mandatory Note Link to the Booking Every Machinearies) */}
      <div className="rounded-2xl bg-[#0a0a0a] border border-[#df2531]/30 overflow-hidden shadow-lg">
        <div className="p-5 border-b border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#df2531]" />
              <h2 className="text-base font-bold text-white tracking-wide font-display">
                Linked Heavy Machinery Bookings & Job Site Financials
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-900 text-neutral-300 font-mono border border-neutral-800">
                {filteredInvoices.length} Active Heavy Plant Dispatches
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Every machinery contract linked with equipment photo, certified operator, project site, advance deposit, partner cut, and broker fee.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search machine, site, broker..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-black border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#df2531] w-56"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-black border border-neutral-800 text-xs text-neutral-300 focus:outline-none focus:border-[#df2531]"
            >
              <option value="all">All Contracts</option>
              <option value="paid">Confirmed Paid</option>
              <option value="pending">Progress Pending</option>
            </select>
          </div>
        </div>

        {/* Machinery Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/70 border-b border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Machinery & Operator</th>
                <th className="py-3 px-4">Project Corridor</th>
                <th className="py-3 px-4 text-right">Contract Total</th>
                <th className="py-3 px-4 text-right">Advance Paid</th>
                <th className="py-3 px-4 text-right">Partner Share</th>
                <th className="py-3 px-4 text-right">Broker Cut</th>
                <th className="py-3 px-4 text-right">Net Profit</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-medium">
              {filteredInvoices.map((inv) => {
                const asset = inv.primaryAsset;
                const booking = inv.booking;
                const isPaid = inv.isPaid;
                const operator = inv.bookingItems?.[0]?.assignedOperator;

                return (
                  <tr
                    key={inv.id}
                    className="hover:bg-neutral-900/60 transition-colors group cursor-pointer"
                    onClick={() => setSelectedBooking(inv)}
                  >
                    {/* Booking Reference */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-white flex items-center gap-1.5 font-display">
                        {inv.bookingReference || inv.invoiceNumber}
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">
                        Inv: {inv.invoiceNumber}
                      </div>
                    </td>

                    {/* Machinery & Operator */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={asset?.primaryImageUrl || "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=400&q=80"}
                          alt={asset?.model || "Machinery"}
                          className="w-12 h-9 object-cover rounded-lg border border-neutral-700 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white group-hover:text-neutral-200 transition-colors font-display">
                            {asset?.make} {asset?.model}
                          </div>
                          <div className="text-[10px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-neutral-300">{asset?.plateNumber}</span>
                            <span>•</span>
                            <span className="text-neutral-300 font-semibold">{operator?.fullName || "Certified Operator"}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Site & Contractor */}
                    <td className="py-3.5 px-4">
                      <div className="text-white font-semibold">{inv.renterName || booking?.renterName || "Infrastructure Client"}</div>
                      <div className="text-[10px] text-neutral-400 truncate max-w-[190px]">
                        {booking?.dropoffLocation || booking?.projectSiteRegion || "Regional Project Site"}
                      </div>
                    </td>

                    {/* Contract Total */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white font-display">
                      {formatETB(inv.totalPayable)}
                      <div className="text-[9px] text-neutral-400 font-normal font-sans">Inc 15% VAT - 2% WHT</div>
                    </td>

                    {/* Advance Paid */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white font-display">
                      {formatETB(inv.advancePaymentAmount || 0)}
                      <div className="text-[9px] text-neutral-400 font-normal font-sans">
                        {inv.paymentMethod?.split(" ")[0] || "Bank CPO"}
                      </div>
                    </td>

                    {/* Partner Share */}
                    <td className="py-3.5 px-4 text-right font-mono text-neutral-300">
                      <div className="font-semibold text-emerald-400 font-display">{formatETB(inv.partnerCut || inv.partnerPayoutAmount)}</div>
                      <div className="text-[9px] text-neutral-400 truncate max-w-[110px] ml-auto font-sans">
                        {inv.partnerName || "Heavy Plant Host"}
                      </div>
                    </td>

                    {/* Broker Cut */}
                    <td className="py-3.5 px-4 text-right font-mono text-neutral-300">
                      <div className="font-semibold text-neutral-300 font-display">{formatETB(inv.brokerCut || inv.brokerCommissionAmount)}</div>
                      <div className="text-[9px] text-neutral-400 truncate max-w-[100px] ml-auto font-sans">
                        {inv.brokerName || "None"}
                      </div>
                    </td>

                    {/* Net Profit */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white font-display">
                      {formatETB(inv.netProfit)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          isPaid
                            ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/80"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        )}
                      >
                        {isPaid ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                        {isPaid ? "Settled" : "Progress Due"}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      {isPaid ? (
                        <button
                          onClick={() => setSelectedBooking(inv)}
                          className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-[11px] font-semibold transition-colors flex items-center gap-1 mx-auto border border-neutral-800"
                        >
                          <Eye size={12} />
                          Details
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSettleMachineryInvoice(inv.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#df2531] hover:bg-[#c41e29] text-white text-[11px] font-bold transition-colors shadow-sm flex items-center gap-1 mx-auto font-display"
                        >
                          <CreditCard size={12} />
                          Settle
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Grid: Heavy Plant Partners & Infrastructure Brokers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Partners Payment */}
        <div className="rounded-2xl bg-[#0a0a0a] border border-[#df2531]/30 p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-white text-sm font-display">Heavy Machinery Fleet Partners</h3>
                <p className="text-[11px] text-neutral-400">Revenue disbursement to machinery asset owners (MIDROC, Sur, Abyssinia)</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-lg font-display">
              Total: {formatETB(metrics.totalPartnerPayout)}
            </span>
          </div>

          <div className="space-y-3">
            {partnersSummary.map((partner, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-black border border-neutral-800/80 hover:border-[#df2531]/40 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    {partner.name}
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-900 text-neutral-400 font-normal border border-neutral-800">
                      {partner.bookingsCount} site dispatches
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-1">
                    Wire Rail: <strong className="text-neutral-300">{partner.bankName}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-400 text-xs font-display">
                    {formatETB(partner.totalEarned)}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    {partner.pendingPayout > 0 ? (
                      <span className="text-amber-400 font-semibold">{formatETB(partner.pendingPayout)} Due on Return</span>
                    ) : (
                      <span className="text-emerald-400 font-semibold">Bank Disbursed</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Brokers Commission */}
        <div className="rounded-2xl bg-[#0a0a0a] border border-[#df2531]/30 p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#df2531]" />
              <div>
                <h3 className="font-bold text-white text-sm font-display">Infrastructure Brokers Commission</h3>
                <p className="text-[11px] text-neutral-400">Commission payouts for highway, quarry, and construction machinery</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-white bg-[#df2531]/20 border border-[#df2531]/50 px-2.5 py-1 rounded-lg font-display">
              Total: {formatETB(metrics.totalBrokerCommission)}
            </span>
          </div>

          <div className="space-y-3">
            {brokersSummary.map((broker, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-black border border-neutral-800/80 hover:border-[#df2531]/40 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    {broker.name}
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#df2531]/20 text-[#df2531] font-bold border border-[#df2531]/40">
                      {broker.commissionPct}% Comm
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-1">
                    Projects Facilitated: <strong className="text-neutral-300">{broker.dealsClosed}</strong> Heavy Contracts
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-white text-xs font-display">
                    {formatETB(broker.totalCommission)}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    {broker.pendingCommission > 0 ? (
                      <span className="text-amber-400 font-semibold">{formatETB(broker.pendingCommission)} Pending Progress</span>
                    ) : (
                      <span className="text-emerald-400 font-semibold">Cleared via RTGS</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projections & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projections Module */}
        <div className="rounded-2xl bg-[#0a0a0a] border border-[#df2531]/30 p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#df2531]" />
              <div>
                <h3 className="font-bold text-white text-sm font-display">Machinery Fleet Revenue Projections</h3>
                <p className="text-[11px] text-neutral-400">Quarterly pipeline based on ongoing infrastructure tenders & dry season expansion</p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800">
              FY 2026/27 Forecast
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-black border border-neutral-800 text-center space-y-1">
              <span className="text-[10px] font-semibold uppercase text-neutral-400">Next 30 Days</span>
              <div className="text-base font-bold font-mono text-white font-display">{formatETB(metrics.projectedNext30Days)}</div>
              <span className="text-[9px] text-emerald-400 font-medium">+22% Surge</span>
            </div>

            <div className="p-3.5 rounded-xl bg-black border border-[#df2531]/40 text-center space-y-1">
              <span className="text-[10px] font-semibold uppercase text-neutral-400">Next 90 Days</span>
              <div className="text-base font-bold font-mono text-[#df2531] font-display">{formatETB(metrics.projectedNextQuarter)}</div>
              <span className="text-[9px] text-neutral-300 font-medium">Dry Season Peak</span>
            </div>

            <div className="p-3.5 rounded-xl bg-black border border-neutral-800 text-center space-y-1">
              <span className="text-[10px] font-semibold uppercase text-neutral-400">Annual Pipeline</span>
              <div className="text-base font-bold font-mono text-emerald-400 font-display">{formatETB(metrics.projectedAnnual)}</div>
              <span className="text-[9px] text-neutral-400 font-medium">Est. Margin: 18.5%</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#df2531]/10 border border-[#df2531]/30 text-xs text-neutral-300 leading-relaxed">
            🏗️ <strong>Heavy Plant Projection Note:</strong> Adama expressway, Wolkite quarry, and Modjo logistics park expansion drives 74% of long-term CAT 320D and Shantui SD22 commitments. Pre-booking attachments (hydraulic rock breakers) yields +35% higher gross daily revenue.
          </div>
        </div>

        {/* Analytics Module */}
        <div className="rounded-2xl bg-[#0a0a0a] border border-[#df2531]/30 p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-[#df2531]" />
              <div>
                <h3 className="font-bold text-white text-sm font-display">Machinery Engine Hours & Plant Telemetry</h3>
                <p className="text-[11px] text-neutral-400">Engine run hours, overtime rate billings, and attachment utilization</p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#df2531]/20 text-white border border-[#df2531]/50 font-display">
              1,480 Engine Hrs Logged
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">Fleet Engine Run Hour Utilization</span>
                <span className="text-white font-mono font-bold font-display">92.4% Active Run Rate</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black overflow-hidden">
                <div className="h-full bg-[#df2531] rounded-full" style={{ width: "92.4%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">Overtime Gauge Billings (ETB 4,500/hr Surcharge)</span>
                <span className="text-white font-mono font-bold font-display">ETB 148,000 / month</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "81%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">Hydraulic Rock Breaker Attachment Utilization</span>
                <span className="text-white font-mono font-bold font-display">78.5% Attachment Pair</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black overflow-hidden">
                <div className="h-full bg-[#df2531]/80 rounded-full" style={{ width: "78.5%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Booking Detail Drawer Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0a0a0a] border border-[#df2531]/40 rounded-2xl p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#df2531] text-white border border-[#df2531]/50 flex items-center justify-center font-bold text-sm font-display">
                  DEL
                </div>
                <div>
                  <h3 className="font-bold text-white text-base font-display">
                    Machinery Rental Contract #{selectedBooking.bookingReference || selectedBooking.invoiceNumber}
                  </h3>
                  <p className="text-xs text-neutral-400">Invoice: {selectedBooking.invoiceNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Machinery & Contractor Highlights */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-black border border-neutral-800">
              <div>
                <div className="text-[10px] uppercase font-bold text-neutral-500 mb-1">Dispatched Plant Asset</div>
                <div className="font-bold text-white text-sm">
                  {selectedBooking.primaryAsset?.make} {selectedBooking.primaryAsset?.model}
                </div>
                <div className="text-xs text-neutral-400 mt-0.5">
                  Plate / Serial: <span className="font-mono text-neutral-300 font-bold">{selectedBooking.primaryAsset?.plateNumber}</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold text-neutral-500 mb-1">Project Contractor & Site</div>
                <div className="font-bold text-white text-sm">{selectedBooking.renterName}</div>
                <div className="text-xs text-neutral-400 mt-0.5">
                  Corridor: {selectedBooking.booking?.dropoffLocation || selectedBooking.booking?.projectSiteRegion || "Regional Project Site"}
                </div>
              </div>
            </div>

            {/* Financial Line Item Breakdown */}
            <div className="space-y-2 border-t border-b border-neutral-800 py-3 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Base Machinery Rental Charge:</span>
                <span className="font-mono font-bold text-white font-display">{formatETB(selectedBooking.baseRentalAmount)}</span>
              </div>
              {selectedBooking.operatorAndPerDiemAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">Certified Operator & Per-Diem Allowance:</span>
                  <span className="font-mono text-neutral-300">{formatETB(selectedBooking.operatorAndPerDiemAmount)}</span>
                </div>
              )}
              {selectedBooking.mobilizationAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">Low-Bed Mobilization Transport:</span>
                  <span className="font-mono text-neutral-300">{formatETB(selectedBooking.mobilizationAmount)}</span>
                </div>
              )}
              {selectedBooking.overtimeUsageAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">Overtime Engine Hours Surcharge:</span>
                  <span className="font-mono text-neutral-300">{formatETB(selectedBooking.overtimeUsageAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-400">15% Ethiopian VAT:</span>
                <span className="font-mono text-neutral-300">{formatETB(selectedBooking.vat15PctAmount)}</span>
              </div>
              {selectedBooking.withholding2PctAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">2% Withholding Tax (WHT):</span>
                  <span className="font-mono text-[#df2531]">-{formatETB(selectedBooking.withholding2PctAmount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-neutral-800 text-sm font-bold">
                <span className="text-white font-display">Total Contract Value:</span>
                <span className="font-mono text-white font-display">{formatETB(selectedBooking.totalPayable)}</span>
              </div>
            </div>

            {/* Advance Payment, Partner Cut & Broker Cut Breakdown */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-black border border-neutral-800">
                <span className="text-[10px] uppercase font-bold text-neutral-300">Advance Deposited</span>
                <div className="font-mono font-bold text-white mt-1 font-display">
                  {formatETB(selectedBooking.advancePaymentAmount || 0)}
                </div>
                <div className="text-[9px] text-neutral-400 truncate mt-0.5">{selectedBooking.paymentMethod || "Bank CPO"}</div>
              </div>

              <div className="p-3 rounded-xl bg-black border border-neutral-800">
                <span className="text-[10px] uppercase font-semibold text-neutral-500">Fleet Partner Share</span>
                <div className="font-mono font-bold text-emerald-400 mt-1 font-display">
                  {formatETB(selectedBooking.partnerCut || selectedBooking.partnerPayoutAmount)}
                </div>
                <div className="text-[9px] text-neutral-400 truncate mt-0.5">{selectedBooking.partnerName}</div>
              </div>

              <div className="p-3 rounded-xl bg-black border border-neutral-800">
                <span className="text-[10px] uppercase font-semibold text-neutral-500">Platform Net Profit</span>
                <div className="font-mono font-bold text-white mt-1 font-display">
                  {formatETB(selectedBooking.netProfit)}
                </div>
                <div className="text-[9px] text-neutral-400 mt-0.5">Retained Margin</div>
              </div>
            </div>

            {/* Settle Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-neutral-400 flex items-center gap-1.5">
                <CreditCard size={14} className="text-neutral-400" />
                Payment Rail: <strong className="text-neutral-200">{selectedBooking.paymentMethod || "Commercial Bank of Ethiopia"}</strong>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-300 hover:text-white text-xs font-semibold border border-neutral-800"
                >
                  Close
                </button>
                {!selectedBooking.isPaid && (
                  <button
                    onClick={() => handleSettleMachineryInvoice(selectedBooking.id)}
                    className="px-4 py-2 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white text-xs font-bold transition-all shadow-md font-display"
                  >
                    Confirm Bank Draft Settlement
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Printed / Exportable Payment Report Modal */}
      <PaymentReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        role="liora"
        initialPeriod={timeRange}
        invoices={invoices}
      />
    </div>
  );
}
