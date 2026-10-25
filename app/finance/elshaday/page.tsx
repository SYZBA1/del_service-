"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Car,
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
} from "lucide-react";
import { formatETB, cn } from "@/lib/utils";

type TimeRange = "daily" | "weekly" | "monthly" | "annually";

export default function ElshadayPaymentModulePage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending">("all");
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/finance/invoices");
      const json = await res.json();
      if (json.success) {
        // Filter for passenger cars and commercial vans (or invoices tagged as car)
        const carInvoices = json.data.filter((inv: any) => {
          if (inv.isCar !== undefined) return inv.isCar;
          const cat = inv.assetCategory || inv.primaryAsset?.category;
          return cat === "passenger_car" || cat === "commercial_van";
        });
        setInvoices(carInvoices);
      }
    } catch (err) {
      console.error("Failed to load Elshaday car finance data", err);
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

  // Time-frame dynamic multiplier for simulation of Daily / Weekly / Monthly / Annually
  const timeMultiplier = useMemo(() => {
    switch (timeRange) {
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
  }, [timeRange]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const rawCashIn = invoices.reduce((sum, inv) => sum + (inv.totalPayable || 0), 0);
    const rawPartnerPayout = invoices.reduce((sum, inv) => sum + (inv.partnerCut || inv.partnerPayoutAmount || 0), 0);
    const rawBrokerCommission = invoices.reduce((sum, inv) => sum + (inv.brokerCut || inv.brokerCommissionAmount || 0), 0);
    const rawConfirmed = invoices.filter((i) => i.isPaid).reduce((sum, inv) => sum + (inv.totalPayable || 0), 0);
    const rawPending = invoices.filter((i) => !i.isPaid).reduce((sum, inv) => sum + (inv.totalPayable || 0), 0);

    // Apply timeframe multiplier
    const totalCashIn = Math.round(rawCashIn * timeMultiplier);
    const totalPartnerPayout = Math.round(rawPartnerPayout * timeMultiplier);
    const totalBrokerCommission = Math.round(rawBrokerCommission * timeMultiplier);
    const confirmedPayment = Math.round(rawConfirmed * timeMultiplier);
    const pendingPayment = Math.round(rawPending * timeMultiplier);

    // Operational expenses & loss (fuel adjustments, workshop servicing, cleaning)
    const fleetMaintenanceLoss = Math.round(totalCashIn * 0.045);
    const totalCashOut = totalPartnerPayout + totalBrokerCommission + fleetMaintenanceLoss;
    const netProfit = Math.max(0, totalCashIn - totalCashOut);
    const profitMargin = totalCashIn > 0 ? ((netProfit / totalCashIn) * 100).toFixed(1) : "0.0";

    // Projections
    const projectedNext30Days = Math.round(rawCashIn * 1.15);
    const projectedNextQuarter = Math.round(rawCashIn * 3.45);
    const projectedAnnual = Math.round(rawCashIn * 13.8);

    return {
      totalCashIn,
      totalCashOut,
      netProfit,
      profitMargin,
      fleetMaintenanceLoss,
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

  // Partners List (Aggregated by Host)
  const partnersSummary = useMemo(() => {
    const map = new Map<string, any>();
    invoices.forEach((inv) => {
      const partnerName = inv.partnerName || "DEL Internal Car Fleet";
      const cut = inv.partnerCut || inv.partnerPayoutAmount || 0;
      if (!map.has(partnerName)) {
        map.set(partnerName, {
          name: partnerName,
          totalEarned: 0,
          bookingsCount: 0,
          pendingPayout: 0,
          confirmedPayout: 0,
          bankName: inv.paymentMethod || "Telebirr SuperApp",
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

  // Brokers List (Aggregated by Broker)
  const brokersSummary = useMemo(() => {
    const map = new Map<string, any>();
    invoices.forEach((inv) => {
      if (!inv.brokerName) return;
      const brokerName = inv.brokerName;
      const cut = inv.brokerCut || inv.brokerCommissionAmount || 0;
      const pct = inv.brokerCommissionPct || 5.0;
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

  const handleSettleCarInvoice = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/v1/finance/invoices/${invoiceId}/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: "Telebirr SuperApp" }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Car Rental invoice successfully settled via Telebirr SuperApp!");
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
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#df2531] text-white font-bold shadow-xl border border-[#df2531]/40 animate-in fade-in slide-in-from-bottom-3 duration-200 font-display">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Time Range Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5 rounded-2xl bg-[#0a0a0a] border border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#df2531]/20 text-[#df2531] border border-[#df2531]/30 flex items-center justify-center">
              <Car size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 font-display">
                Elshaday Payment Module
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#df2531]/20 text-[#df2531] border border-[#df2531]/30 font-display">
                  Car Rentals Treasury
                </span>
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                Automated Cashflow, Fleet Host Splits, Broker Commissions &amp; Linked Bookings
              </p>
            </div>
          </div>
        </div>

        {/* Time Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black border border-white/10">
          {(["daily", "weekly", "monthly", "annually"] as TimeRange[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setTimeRange(tab)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer font-display",
                timeRange === tab
                  ? "bg-[#df2531] text-white shadow-md shadow-[#df2531]/20"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              )}
            >
              {tab === "daily" && "Daily"}
              {tab === "weekly" && "Weekly"}
              {tab === "monthly" && "Monthly"}
              {tab === "annually" && "Annually"}
            </button>
          ))}
        </div>
      </div>

      {/* Top 6 Financial Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Cash In */}
        <div className="p-4 rounded-xl bg-[#0a0a0a] border border-white/10 space-y-1 relative overflow-hidden group hover:border-[#df2531]/40 transition-colors">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-display">Total Cash In</span>
            <ArrowUpRight size={16} className="text-emerald-400" />
          </div>
          <div className="text-xl font-black text-white font-mono font-display">{formatETB(metrics.totalCashIn)}</div>
          <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
            <TrendingUp size={12} />
            Gross Car Rentals Billed
          </div>
        </div>

        {/* Total Cash Out */}
        <div className="p-4 rounded-xl bg-[#0a0a0a] border border-white/10 space-y-1 relative overflow-hidden group hover:border-red-500/40 transition-colors">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-display">Total Cash Out</span>
            <ArrowDownRight size={16} className="text-red-400" />
          </div>
          <div className="text-xl font-black text-white font-mono font-display">{formatETB(metrics.totalCashOut)}</div>
          <div className="text-[10px] text-red-400 font-medium">
            Partners, Brokers &amp; Workshop
          </div>
        </div>

        {/* Net Profit */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#df2531]/15 via-[#0a0a0a] to-[#0a0a0a] border border-[#df2531]/40 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#df2531]">
            <span className="text-[11px] font-bold uppercase tracking-wider font-display">Net Profit</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#df2531]/20 text-[#df2531] font-extrabold font-display">
              {metrics.profitMargin}%
            </span>
          </div>
          <div className="text-xl font-black text-[#df2531] font-mono font-display">{formatETB(metrics.netProfit)}</div>
          <div className="text-[10px] text-neutral-300 font-medium">
            DEL Platform Retained Margin
          </div>
        </div>

        {/* Loss / Deductions */}
        <div className="p-4 rounded-xl bg-[#0a0a0a] border border-white/10 space-y-1 group hover:border-white/20 transition-colors">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-display">Loss &amp; Deductions</span>
            <AlertCircle size={15} className="text-neutral-400" />
          </div>
          <div className="text-xl font-black text-white font-mono font-display">{formatETB(metrics.fleetMaintenanceLoss)}</div>
          <div className="text-[10px] text-neutral-400">
            Fleet repairs, cleaning &amp; fuel
          </div>
        </div>

        {/* Confirmed Payment */}
        <div className="p-4 rounded-xl bg-[#0a0a0a] border border-white/10 space-y-1 group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-display">Confirmed</span>
            <CheckCircle2 size={16} />
          </div>
          <div className="text-xl font-black text-emerald-400 font-mono font-display">{formatETB(metrics.confirmedPayment)}</div>
          <div className="text-[10px] text-neutral-400">
            Telebirr &amp; RTGS Cleared
          </div>
        </div>

        {/* Pending Payment */}
        <div className="p-4 rounded-xl bg-[#0a0a0a] border border-white/10 space-y-1 group hover:border-[#df2531]/40 transition-colors">
          <div className="flex items-center justify-between text-[#df2531]">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-display">Pending</span>
            <Clock size={16} />
          </div>
          <div className="text-xl font-black text-[#df2531] font-mono font-display">{formatETB(metrics.pendingPayment)}</div>
          <div className="text-[10px] text-neutral-400">
            Awaiting Client Settlement
          </div>
        </div>
      </div>

      {/* Linked Car Bookings Section (Mandatory Note Link to the Booking Every Cars) */}
      <div className="rounded-2xl bg-[#0a0a0a] border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#df2531]" />
              <h2 className="text-base font-bold text-white tracking-wide font-display">
                Linked Car Bookings &amp; Revenue Breakdown
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono">
                {filteredInvoices.length} Active Car Contracts
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Every car rental booking linked with vehicle photo, renter details, host payout cut, broker commission, and net profit.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search car, booking ref, renter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-black border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#df2531] w-56"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-black border border-white/10 text-xs text-neutral-300 focus:outline-none focus:border-[#df2531] cursor-pointer"
            >
              <option value="all">All Payments</option>
              <option value="paid">Confirmed Paid</option>
              <option value="pending">Pending Settle</option>
            </select>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/70 border-b border-white/10 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Vehicle &amp; Specs</th>
                <th className="py-3 px-4">Renter &amp; Route</th>
                <th className="py-3 px-4 text-right">Gross Total</th>
                <th className="py-3 px-4 text-right">Host Payout</th>
                <th className="py-3 px-4 text-right">Broker Cut</th>
                <th className="py-3 px-4 text-right">Net Profit</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 font-medium">
              {filteredInvoices.map((inv) => {
                const asset = inv.primaryAsset;
                const booking = inv.booking;
                const isPaid = inv.isPaid;

                return (
                  <tr
                    key={inv.id}
                    className="hover:bg-white/5 transition-colors group cursor-pointer"
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

                    {/* Vehicle */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={asset?.primaryImageUrl || "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=400&q=80"}
                          alt={asset?.model || "Car"}
                          className="w-12 h-9 object-cover rounded-lg border border-neutral-700 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white group-hover:text-neutral-200 transition-colors font-display">
                            {asset?.make} {asset?.model}
                          </div>
                          <div className="text-[10px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-neutral-300">{asset?.plateNumber}</span>
                            <span>•</span>
                            <span className="capitalize">{asset?.specs?.transmission || "Auto"}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Renter & Site */}
                    <td className="py-3.5 px-4">
                      <div className="text-white font-semibold">{inv.renterName || booking?.renterName || "Direct Renter"}</div>
                      <div className="text-[10px] text-neutral-400 truncate max-w-[180px]">
                        {booking?.pickupLocation || "Addis Ababa Hub"}
                      </div>
                    </td>

                    {/* Gross Total */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      {formatETB(inv.totalPayable)}
                      <div className="text-[9px] text-neutral-400 font-normal">Inc 15% VAT</div>
                    </td>

                    {/* Partner Cut */}
                    <td className="py-3.5 px-4 text-right font-mono text-neutral-300">
                      <div className="font-semibold text-emerald-400">{formatETB(inv.partnerCut || inv.partnerPayoutAmount)}</div>
                      <div className="text-[9px] text-neutral-400 truncate max-w-[110px] ml-auto">
                        {inv.partnerName || "Fleet Host"}
                      </div>
                    </td>

                    {/* Broker Cut */}
                    <td className="py-3.5 px-4 text-right font-mono text-neutral-300">
                      <div className="font-semibold text-blue-400">{formatETB(inv.brokerCut || inv.brokerCommissionAmount)}</div>
                      <div className="text-[9px] text-neutral-400 truncate max-w-[100px] ml-auto">
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
                        {isPaid ? "Confirmed" : "Pending"}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      {isPaid ? (
                        <button
                          onClick={() => setSelectedBooking(inv)}
                          className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-semibold transition-colors flex items-center gap-1 mx-auto cursor-pointer"
                        >
                          <Eye size={12} />
                          Details
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSettleCarInvoice(inv.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#df2531] hover:bg-[#c41e29] text-white text-[11px] font-bold transition-colors shadow-sm flex items-center gap-1 mx-auto cursor-pointer font-display"
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

      {/* Two Column Grid: Partners Payment & Brokers Commission */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Partners Payment Module */}
        <div className="rounded-2xl bg-[#0a0a0a] border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-white text-sm font-display">Car Fleet Partners &amp; Host Settlements</h3>
                <p className="text-[11px] text-neutral-400">Turo-style 85% revenue share disbursement to vehicle hosts</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-lg">
              Total: {formatETB(metrics.totalPartnerPayout)}
            </span>
          </div>

          <div className="space-y-3">
            {partnersSummary.map((partner, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-black border border-white/10 hover:border-white/20 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    {partner.name}
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 font-normal">
                      {partner.bookingsCount} bookings
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-1 flex items-center gap-2">
                    <span>Disbursement via: <strong className="text-neutral-300">{partner.bankName}</strong></span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-400 text-xs">
                    {formatETB(partner.totalEarned)}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    {partner.pendingPayout > 0 ? (
                      <span className="text-amber-400 font-semibold">{formatETB(partner.pendingPayout)} Pending</span>
                    ) : (
                      <span className="text-emerald-400 font-semibold">Fully Settled</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Brokers Commission Module */}
        <div className="rounded-2xl bg-[#0a0a0a] border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="font-bold text-white text-sm font-display">Car Brokers Commission Ledger</h3>
                <p className="text-[11px] text-neutral-400">Commission payouts for car rentals &amp; airport VIP bookings</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/60 border border-blue-800/80 px-2.5 py-1 rounded-lg">
              Total: {formatETB(metrics.totalBrokerCommission)}
            </span>
          </div>

          <div className="space-y-3">
            {brokersSummary.map((broker, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-black border border-white/10 hover:border-white/20 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    {broker.name}
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 font-bold border border-blue-800/60">
                      {broker.commissionPct}% Rate
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-1">
                    Closed Deals: <strong className="text-neutral-300">{broker.dealsClosed}</strong> Car Bookings
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-blue-400 text-xs">
                    {formatETB(broker.totalCommission)}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    {broker.pendingCommission > 0 ? (
                      <span className="text-amber-400 font-semibold">{formatETB(broker.pendingCommission)} Due</span>
                    ) : (
                      <span className="text-emerald-400 font-semibold">Paid via Telebirr</span>
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
        <div className="rounded-2xl bg-[#0a0a0a] border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#df2531]" />
              <div>
                <h3 className="font-bold text-white text-sm font-display">Car Rental Revenue Projections</h3>
                <p className="text-[11px] text-neutral-400">Predictive forecast based on fleet utilization and forward bookings</p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
              Q4 2026 Model
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-black border border-white/10 text-center space-y-1">
              <span className="text-[10px] font-semibold uppercase text-neutral-400 font-display">Next 30 Days</span>
              <div className="text-base font-bold font-mono text-white font-display">{formatETB(metrics.projectedNext30Days)}</div>
              <span className="text-[9px] text-emerald-400 font-medium">+15% seasonal AU surge</span>
            </div>

            <div className="p-3.5 rounded-xl bg-black border border-white/10 text-center space-y-1">
              <span className="text-[10px] font-semibold uppercase text-neutral-400 font-display">Next 90 Days</span>
              <div className="text-base font-bold font-mono text-[#df2531] font-display">{formatETB(metrics.projectedNextQuarter)}</div>
              <span className="text-[9px] text-[#df2531] font-medium">Holiday peak demand</span>
            </div>

            <div className="p-3.5 rounded-xl bg-black border border-white/10 text-center space-y-1">
              <span className="text-[10px] font-semibold uppercase text-neutral-400 font-display">Annual Run-Rate</span>
              <div className="text-base font-bold font-mono text-emerald-400 font-display">{formatETB(metrics.projectedAnnual)}</div>
              <span className="text-[9px] text-neutral-400 font-medium">Est. Platform Net: 15%</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#df2531]/10 border border-[#df2531]/20 text-xs text-white leading-relaxed">
            💡 <strong>Forecast Note:</strong> Car rental demand increases by an estimated 28% during international diplomatic summits and conference seasons in Addis Ababa. Increasing Toyota Prado and Innova listings yields the fastest turnover.
          </div>
        </div>

        {/* Analytics Module */}
        <div className="rounded-2xl bg-[#0a0a0a] border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-[#df2531]" />
              <div>
                <h3 className="font-bold text-white text-sm font-display">Car Fleet Operational Analytics</h3>
                <p className="text-[11px] text-neutral-400">ADR, fleet utilization, and booking channel metrics</p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80">
              88.4% Utilization
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">Average Daily Rate (ADR)</span>
                <span className="text-white font-mono font-bold">ETB 11,250 / day</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black overflow-hidden">
                <div className="h-full bg-[#df2531] rounded-full" style={{ width: "75%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">Payment Collection Channel (Telebirr SuperApp)</span>
                <span className="text-white font-mono font-bold">68.2%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "68.2%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">Host Settlement Efficiency (Under 24 Hours)</span>
                <span className="text-white font-mono font-bold">96.0%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "96%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Booking Detail Drawer Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#df2531]/20 text-[#df2531] border border-[#df2531]/30 flex items-center justify-center font-bold text-sm font-display">
                  DEL
                </div>
                <div>
                  <h3 className="font-bold text-white text-base font-display">
                    Car Rental Contract #{selectedBooking.bookingReference || selectedBooking.invoiceNumber}
                  </h3>
                  <p className="text-xs text-neutral-400">Invoice: {selectedBooking.invoiceNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Vehicle & Renter Highlights */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-black border border-white/10">
              <div>
                <div className="text-[10px] uppercase font-bold text-neutral-500 mb-1 font-display">Assigned Vehicle</div>
                <div className="font-bold text-white text-sm font-display">
                  {selectedBooking.primaryAsset?.make} {selectedBooking.primaryAsset?.model}
                </div>
                <div className="text-xs text-neutral-400 mt-0.5">
                  Plate: <span className="font-mono text-neutral-300 font-bold">{selectedBooking.primaryAsset?.plateNumber}</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold text-neutral-500 mb-1 font-display">Client / Renter</div>
                <div className="font-bold text-white text-sm font-display">{selectedBooking.renterName}</div>
                <div className="text-xs text-neutral-400 mt-0.5">
                  Route: {selectedBooking.booking?.pickupLocation || "Addis Ababa City"}
                </div>
              </div>
            </div>

            {/* Financial Line Item Breakdown */}
            <div className="space-y-2 border-t border-b border-white/10 py-3 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Base Car Rental Charge:</span>
                <span className="font-mono font-bold text-white">{formatETB(selectedBooking.baseRentalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">15% Ethiopian VAT:</span>
                <span className="font-mono text-neutral-300">{formatETB(selectedBooking.vat15PctAmount)}</span>
              </div>
              {selectedBooking.withholding2PctAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">2% Withholding Tax (WHT):</span>
                  <span className="font-mono text-red-400">-{formatETB(selectedBooking.withholding2PctAmount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-white/10 text-sm font-bold">
                <span className="text-white font-display">Gross Invoiced Total:</span>
                <span className="font-mono text-white font-display">{formatETB(selectedBooking.totalPayable)}</span>
              </div>
            </div>

            {/* Partner Cut & Broker Cut Breakdown */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-black border border-white/10">
                <span className="text-[10px] uppercase font-semibold text-neutral-500">Fleet Host Payout</span>
                <div className="font-mono font-bold text-emerald-400 mt-1">
                  {formatETB(selectedBooking.partnerCut || selectedBooking.partnerPayoutAmount)}
                </div>
                <div className="text-[9px] text-neutral-400 truncate mt-0.5">{selectedBooking.partnerName}</div>
              </div>

              <div className="p-3 rounded-xl bg-black border border-white/10">
                <span className="text-[10px] uppercase font-semibold text-neutral-500">Broker Commission</span>
                <div className="font-mono font-bold text-blue-400 mt-1">
                  {formatETB(selectedBooking.brokerCut || selectedBooking.brokerCommissionAmount)}
                </div>
                <div className="text-[9px] text-neutral-400 truncate mt-0.5">{selectedBooking.brokerName || "None"}</div>
              </div>

              <div className="p-3 rounded-xl bg-black border border-white/10">
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
                Payment Rail: <strong className="text-neutral-200">{selectedBooking.paymentMethod || "Telebirr SuperApp"}</strong>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                {!selectedBooking.isPaid && (
                  <button
                    onClick={() => handleSettleCarInvoice(selectedBooking.id)}
                    className="px-4 py-2 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white text-xs font-bold transition-all shadow-md font-display cursor-pointer"
                  >
                    Confirm Telebirr Payment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
