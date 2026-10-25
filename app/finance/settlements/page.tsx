"use client";

import React, { useState, useEffect } from "react";
import {
  ReceiptText,
  DollarSign,
  Building2,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  FileCheck,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { Invoice, OwnerSettlementLedger } from "@/lib/types";
import { formatETB, cn } from "@/lib/utils";

export default function FinanceSettlementsPage() {
  const { activeTenantId, activePhase } = useTenant();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<OwnerSettlementLedger[]>([]);
  const [loading, setLoading] = useState(true);
  const [settlingId, setSettlingId] = useState<string | null>(null);


  async function loadData() {
    try {
      setLoading(true);
      const [invRes, setRes] = await Promise.all([
        fetch("/api/v1/finance/invoices"),
        fetch(`/api/v1/finance/settlements?ownerId=${activeTenantId}`),
      ]);
      const invJson = await invRes.json();
      const setJson = await setRes.json();
      if (invJson.success) setInvoices(invJson.data);
      if (setJson.success) setSettlements(setJson.data);
    } catch (err) {
      console.error("Finance fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [activeTenantId]);

  const handleSettleViaTelebirr = async (invoiceId: string) => {
    setSettlingId(invoiceId);
    try {
      const res = await fetch(`/api/v1/finance/invoices/${invoiceId}/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: "Telebirr SuperApp",
        }),
      });
      const json = await res.json();
      if (json.success) {
        loadData();
      }
    } catch (e) {
      alert("Settlement webhook error");
    } finally {
      setSettlingId(null);
    }
  };

  // Summaries
  const totalBilled = invoices.reduce((acc, i) => acc + (i.totalPayable || 0), 0);
  const totalVatCollected = invoices.reduce((acc, i) => acc + (i.vat15PctAmount || 0), 0);
  const totalWithholdingWithheld = invoices.reduce((acc, i) => acc + (i.withholding2PctAmount || 0), 0);
  const totalHostPayouts = settlements.reduce((acc, s) => acc + (s.netPayoutAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 rounded-2xl bg-[#0a0a0a] border border-[#df2531]/30 shadow-lg">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 font-display">
            <ReceiptText className="text-[#df2531]" size={24} />
            Ethiopian Tax Ledger & Multi-Tenant Payout Table
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Automated 15% VAT, 2% B2B Withholding, and Turo-style Host Split Ledger (Telebirr & Chapa Webhook Rail).
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold hover:border-[#df2531]/40 transition-colors"
        >
          <RotateCcw size={14} />
          Refresh Ledgers
        </button>
      </div>

      {/* Tax & Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-800 bg-[#0a0a0a] p-4 space-y-1 hover:border-[#df2531]/40 transition-colors">
          <span className="text-[11px] font-medium text-neutral-400">Total Billed Invoices</span>
          <div className="text-2xl font-black text-white font-mono font-display">{formatETB(totalBilled)}</div>
          <div className="text-[10px] text-neutral-400">Net receivable across all bookings</div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-[#0a0a0a] p-4 space-y-1 hover:border-[#df2531]/40 transition-colors">
          <span className="text-[11px] font-medium text-neutral-400">Ethiopian 15% VAT Collected</span>
          <div className="text-2xl font-black text-emerald-400 font-mono font-display">{formatETB(totalVatCollected)}</div>
          <div className="text-[10px] text-neutral-400">Ministry of Revenue (MoR) Output Tax</div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-[#0a0a0a] p-4 space-y-1 hover:border-[#df2531]/40 transition-colors">
          <span className="text-[11px] font-medium text-neutral-400">2% B2B Withholding Tax</span>
          <div className="text-2xl font-black text-[#df2531] font-mono font-display">{formatETB(totalWithholdingWithheld)}</div>
          <div className="text-[10px] text-neutral-400">Corporate TIN Withholding Certificates</div>
        </div>

        <div className="rounded-xl border border-[#df2531]/40 bg-[#0a0a0a] p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-medium text-neutral-400">Host Net Disbursements</span>
          <div className="text-2xl font-black text-white font-mono font-display">{formatETB(totalHostPayouts)}</div>
          <div className="text-[10px] text-neutral-400">P2P Hosts + Corporate Partners</div>
        </div>
      </div>

      {/* SECTION 1: INVOICES & PRO-FORMA STATEMENTS */}
      <div className="rounded-2xl border border-[#df2531]/30 bg-[#0a0a0a] p-5 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="font-bold text-white text-sm flex items-center gap-2 font-display">
            <ReceiptText size={16} className="text-[#df2531]" />
            Official Ethiopian Tax Invoices (Pro-Forma & Settled)
          </div>
          <span className="text-xs text-neutral-400">Telebirr / Chapa Instant Settlement</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-black text-[11px] uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Invoice Number</th>
                <th className="px-4 py-3 font-semibold">Booking / Client</th>
                <th className="px-4 py-3 font-semibold">Base Rental</th>
                <th className="px-4 py-3 font-semibold">Operator / Low-bed</th>
                <th className="px-4 py-3 font-semibold">15% VAT</th>
                <th className="px-4 py-3 font-semibold">2% WHT</th>
                <th className="px-4 py-3 font-semibold">Total Payable</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Payment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-medium">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-neutral-900/50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-white">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-neutral-200">{inv.renterName || "MIDROC Construction"}</div>
                    <div className="text-[10px] font-mono text-neutral-400">{inv.bookingReference}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-neutral-300">{formatETB(inv.baseRentalAmount)}</td>
                  <td className="px-4 py-3 font-mono text-neutral-400">
                    {formatETB(inv.operatorAndPerDiemAmount + inv.mobilizationAmount)}
                  </td>
                  <td className="px-4 py-3 font-mono text-emerald-400">{formatETB(inv.vat15PctAmount)}</td>
                  <td className="px-4 py-3 font-mono text-neutral-300">
                    {inv.withholding2PctAmount > 0 ? `-${formatETB(inv.withholding2PctAmount)}` : "N/A"}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-white font-display text-sm">
                    {formatETB(inv.totalPayable)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        inv.isPaid
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      )}
                    >
                      {inv.isPaid ? "PAID" : "UNPAID"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!inv.isPaid ? (
                      <button
                        onClick={() => handleSettleViaTelebirr(inv.id)}
                        disabled={settlingId === inv.id}
                        className="px-3 py-1 rounded-lg bg-[#df2531] hover:bg-[#c41e29] text-white font-bold text-[11px] shadow flex items-center gap-1 ml-auto font-display"
                      >
                        <CreditCard size={12} />
                        {settlingId === inv.id ? "Processing Webhook..." : "Settle via Telebirr"}
                      </button>
                    ) : (
                      <span className="text-emerald-400 text-[11px] font-semibold flex items-center justify-end gap-1">
                        <CheckCircle size={13} /> Settled
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: MULTI-TENANT TURO P2P HOST SETTLEMENT LEDGER */}
      <div className="rounded-2xl border border-[#df2531]/30 bg-[#0a0a0a] p-5 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="font-bold text-white text-sm flex items-center gap-2 font-display">
            <Building2 size={16} className="text-[#df2531]" />
            Multi-Tenant P2P Host Commission Split Ledgers (Phase 2 Blueprint)
          </div>
          <span className="text-xs text-neutral-400">
            Automated Platform Fee Deductions & Workshop Offsets
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-black text-[11px] uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Settlement ID</th>
                <th className="px-4 py-3 font-semibold">Fleet Owner / Host</th>
                <th className="px-4 py-3 font-semibold">Gross Booking Revenue</th>
                <th className="px-4 py-3 font-semibold">DEL Commission Split</th>
                <th className="px-4 py-3 font-semibold">Workshop Repairs Offset</th>
                <th className="px-4 py-3 font-semibold">Net Host Payout</th>
                <th className="px-4 py-3 font-semibold text-right">Disbursement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-medium">
              {settlements.map((stl) => (
                <tr key={stl.id} className="hover:bg-neutral-900/50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-neutral-300">{stl.id}</td>
                  <td className="px-4 py-3 font-semibold text-white">
                    {stl.ownerName || "DEL Internal Fleet"}
                  </td>
                  <td className="px-4 py-3 font-mono text-neutral-200">{formatETB(stl.grossRevenue)}</td>
                  <td className="px-4 py-3 font-mono text-[#df2531]">
                    -{formatETB(stl.platformCommissionAmount)} ({stl.platformCommissionPct}%)
                  </td>
                  <td className="px-4 py-3 font-mono text-neutral-300">
                    {stl.workshopRepairDeduction > 0 ? `-${formatETB(stl.workshopRepairDeduction)}` : "ETB 0.00"}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-emerald-400 font-display text-sm">
                    {formatETB(stl.netPayoutAmount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        stl.settlementStatus === "approved" || stl.settlementStatus === "disbursed"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      )}
                    >
                      {stl.settlementStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
