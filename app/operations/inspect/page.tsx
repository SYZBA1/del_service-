"use client";

import React, { useState } from "react";
import {
  ClipboardCheck,
  Clock,
  PenTool,
  WifiOff,
  CheckCircle,
  Truck,
  Plus,
  Save,
  Check,
} from "lucide-react";
import { DualWireframeInspector } from "@/components/DualWireframeInspector";
import { cn } from "@/lib/utils";

export default function FieldInspectionPage() {
  const [activeTab, setActiveTab] = useState<"walkaround" | "timesheet">("walkaround");

  // Timesheet State
  const [timesheetDate, setTimesheetDate] = useState("2026-10-23");
  const [engineStart, setEngineStart] = useState(3420);
  const [engineEnd, setEngineEnd] = useState(3430);
  const [idleHours, setIdleHours] = useState(0);
  const [supervisorName, setSupervisorName] = useState("Eng. Samuel Kassa");
  const [supervisorPhone, setSupervisorPhone] = useState("+251 911 447 788");
  const [signatureSigned, setSignatureSigned] = useState(true);
  const [offlineSynced, setOfflineSynced] = useState(false);
  const [timesheetSuccess, setTimesheetSuccess] = useState<string | null>(null);
  const [submittingTs, setSubmittingTs] = useState(false);

  const operatingHours = Math.max(0, engineEnd - engineStart);

  const handleSaveTimesheet = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTs(true);
    setTimesheetSuccess(null);

    try {
      const res = await fetch("/api/v1/operations/timesheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingItemId: "bki-101a",
          timesheetDate,
          engineHoursStart: engineStart,
          engineHoursEnd: engineEnd,
          idleBreakdownHours: idleHours,
          siteSupervisorName: supervisorName,
          siteSupervisorPhone: supervisorPhone,
          siteSignatureUrl: "/signatures/samuel-kassa.png",
          syncedOffline: offlineSynced,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to log timesheet");

      setTimesheetSuccess(
        `Machinery daily timesheet saved! ${operatingHours} operating hours logged. Meter reading synced to CAT 320D.`
      );
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingTs(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#df2531]/20 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 font-display">
            <ClipboardCheck className="text-[#df2531]" size={24} />
            Field Operations: Walkaround & Machinery Timesheets
          </h1>
          <p className="text-xs text-neutral-400 mt-1 font-sans">
            Mobile-first inspector with interactive 2D wireframe pin-dropping, 8-angle photo check, and offline engine-hour logs.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl border border-[#df2531]/30 bg-[#0a0a0a] p-1 text-xs">
          <button
            onClick={() => setActiveTab("walkaround")}
            className={cn(
              "px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 font-display",
              activeTab === "walkaround"
                ? "bg-[#df2531] text-white shadow-md shadow-[#df2531]/30"
                : "text-neutral-400 hover:text-white"
            )}
          >
            <ClipboardCheck size={14} />
            8-Angle Walkaround
          </button>
          <button
            onClick={() => setActiveTab("timesheet")}
            className={cn(
              "px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 font-display",
              activeTab === "timesheet"
                ? "bg-[#df2531] text-white shadow-md shadow-[#df2531]/30"
                : "text-neutral-400 hover:text-white"
            )}
          >
            <Clock size={14} />
            Daily Machinery Timesheet
          </button>
        </div>
      </div>

      {/* VIEW A: DUAL WIREFRAME INSPECTOR */}
      {activeTab === "walkaround" && <DualWireframeInspector />}

      {/* VIEW B: MACHINERY DAILY TIMESHEET (OFFLINE-READY) */}
      {activeTab === "timesheet" && (
        <form onSubmit={handleSaveTimesheet} className="bg-[#0a0a0a] p-6 rounded-2xl border border-[#df2531]/30 space-y-6 text-xs text-neutral-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#df2531]/20 pb-3">
            <div>
              <div className="font-bold text-white text-sm flex items-center gap-2 font-display">
                <Clock size={16} className="text-[#df2531]" />
                Heavy Machinery Daily Engine-Hour Timesheet
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5 font-sans">
                Target Asset: Caterpillar 320D Excavator (SPL-04891 AA) • Site: Ayat Commercial Complex
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-lg font-mono">
                <WifiOff size={12} />
                Offline Storage Sync Ready
              </span>
            </div>
          </div>

          {timesheetSuccess && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-700 text-emerald-300 font-medium font-sans">
              {timesheetSuccess}
            </div>
          )}

          {/* Engine Hour Log Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-neutral-950/80 p-4 rounded-xl border border-neutral-800 font-sans">
            <div>
              <label className="font-medium text-neutral-400">Shift Date</label>
              <input
                type="date"
                value={timesheetDate}
                onChange={(e) => setTimesheetDate(e.target.value)}
                className="mt-1 w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#df2531]"
                required
              />
            </div>
            <div>
              <label className="font-medium text-neutral-400">Engine Hours Start</label>
              <input
                type="number"
                value={engineStart}
                onChange={(e) => setEngineStart(parseFloat(e.target.value))}
                className="mt-1 w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-1.5 text-xs text-[#df2531] font-mono font-bold focus:outline-none focus:border-[#df2531]"
                required
              />
            </div>
            <div>
              <label className="font-medium text-neutral-400">Engine Hours End</label>
              <input
                type="number"
                value={engineEnd}
                onChange={(e) => setEngineEnd(parseFloat(e.target.value))}
                className="mt-1 w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-1.5 text-xs text-[#df2531] font-mono font-bold focus:outline-none focus:border-[#df2531]"
                required
              />
            </div>
            <div>
              <label className="font-medium text-neutral-400">Total Net Operating Hours</label>
              <div className="mt-1 font-display font-black text-2xl text-emerald-400">
                {operatingHours} hrs
              </div>
            </div>
          </div>

          {/* Site Supervisor Signoff */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-950/80 p-4 rounded-xl border border-neutral-800 font-sans">
            <div>
              <label className="font-medium text-neutral-400">Site Supervisor Full Name</label>
              <input
                type="text"
                value={supervisorName}
                onChange={(e) => setSupervisorName(e.target.value)}
                className="mt-1 w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#df2531]"
                required
              />
            </div>
            <div>
              <label className="font-medium text-neutral-400">Site Supervisor Phone (+251)</label>
              <input
                type="text"
                value={supervisorPhone}
                onChange={(e) => setSupervisorPhone(e.target.value)}
                className="mt-1 w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#df2531]"
                required
              />
            </div>

            <div className="sm:col-span-2 pt-2">
              <label className="font-medium text-neutral-400">Digital Touchscreen Signature</label>
              <div className="mt-1 h-24 rounded-lg bg-neutral-900 border border-dashed border-[#df2531]/40 flex items-center justify-center p-3 relative">
                <span className="font-serif italic text-xl text-white">Eng. Samuel Kassa</span>
                <span className="absolute bottom-2 right-3 text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle size={12} /> Captured on site (Ayat Site 4)
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submittingTs}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold font-display shadow-lg shadow-[#df2531]/25 disabled:opacity-50 transition-all"
            >
              <Save size={15} />
              {submittingTs ? "Submitting Timesheet..." : "Submit & Sync Daily Timesheet"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
