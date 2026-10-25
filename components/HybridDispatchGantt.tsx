"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Layers,
  Sparkles,
  Truck,
  UserCheck,
  Wrench,
  AlertOctagon,
  Check,
  Plus,
  ShieldAlert,
} from "lucide-react";
import { cn, formatETB } from "@/lib/utils";
import { Asset, User, BookingItem, BookingStatus } from "@/lib/types";

interface GanttData {
  cars: Asset[];
  heavyMachinery: Asset[];
  attachments: Asset[];
  operators: User[];
  bookingItems: any[];
}

export function HybridDispatchGantt() {
  const [data, setData] = useState<GanttData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "machinery" | "cars" | "operators">("all");
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Time Window: 10 days starting from 2026-10-20
  const baseStartDate = new Date("2026-10-20T00:00:00Z");
  const days = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(baseStartDate);
    d.setDate(baseStartDate.getDate() + i);
    return d;
  });

  useEffect(() => {
    async function fetchGantt() {
      try {
        setLoading(true);
        const res = await fetch("/api/v1/dispatch");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Gantt error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchGantt();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#df2531] border-t-transparent" />
          <p className="text-xs text-slate-400 font-mono">Loading Resource Dispatch Gantt Grid...</p>
        </div>
      </div>
    );
  }

  const { cars, heavyMachinery, attachments, operators, bookingItems } = data;

  // Filter compatible hydraulic breakers and certified operators when an excavator is selected
  const compatibleBreakers = selectedAsset
    ? attachments.filter((att) => att.parentAssetId === selectedAsset.id)
    : [];

  const certifiedOperators = selectedAsset?.category === "heavy_machinery"
    ? operators.filter((op) => op.driverLicenseGrade === "Special Mobile Machinery" || (op.driverLicenseGrade && op.driverLicenseGrade.toLowerCase().includes("machinery")))
    : operators;

  // Helper to check if item is scheduled on a day
  const getAssetStatusOnDay = (assetId: string, date: Date) => {
    const asset = [...cars, ...heavyMachinery, ...attachments].find((a) => a.id === assetId);
    if (asset?.status === "maintenance") {
      return { status: "maintenance_lock", item: null, text: "MAINTENANCE LOCK" };
    }

    const dayTime = date.getTime();
    for (const item of bookingItems) {
      if (item.assetId === assetId) {
        const start = new Date(item.rentalPeriodStart).getTime();
        const end = new Date(item.rentalPeriodEnd).getTime();
        if (dayTime >= start && dayTime <= end) {
          return { status: item.itemStatus, item, text: item.booking?.bookingReference || "ACTIVE" };
        }
      }
    }
    return null;
  };

  const getOperatorStatusOnDay = (operatorId: string, date: Date) => {
    const dayTime = date.getTime();
    for (const item of bookingItems) {
      if (item.assignedOperatorId === operatorId) {
        const start = new Date(item.rentalPeriodStart).getTime();
        const end = new Date(item.rentalPeriodEnd).getTime();
        if (dayTime >= start && dayTime <= end) {
          return {
            status: item.itemStatus,
            item,
            text: `${item.booking?.bookingReference} (${item.asset?.make} ${item.asset?.model})`,
          };
        }
      }
    }
    return null;
  };

  const testDoubleBookingConflict = (asset: Asset) => {
    // Demonstrates GiST anti-double-booking rule
    setConflictWarning(
      `PostgreSQL GiST Exclusion Violation (23P01): Asset '${asset.make} ${asset.model}' (${asset.plateNumber || asset.chassisOrSerialNumber}) has active booking overlap [2026-10-20 to 2026-10-28]. Mathematical GiST exclusion prevented double-allocation.`
    );
  };

  return (
    <div className="space-y-4">
      {/* Gantt Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#0a0a0a] p-4 rounded-xl border border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2 font-display">
              <Calendar size={18} className="text-[#df2531]" />
              Interactive Dispatch Gantt Scheduler
            </h2>
            <span className="text-[10px] bg-[#df2531]/20 text-[#df2531] font-mono px-2 py-0.5 rounded border border-[#df2531]/30">
              PostgreSQL TSTZRANGE GiST Active
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Dual-axis timeline (Assets + Operators). Automatic bundle matching for excavators, breakers, and special machinery operators.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-neutral-800 bg-[#121212] p-0.5 text-xs font-display">
            {(["all", "machinery", "cars", "operators"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-3 py-1.5 rounded-md font-medium capitalize transition-all",
                  activeTab === tab
                    ? "bg-[#df2531] text-white font-bold shadow-md shadow-[#df2531]/30"
                    : "text-neutral-400 hover:text-white"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conflict Alert Banner if Triggered */}
      {conflictWarning && (
        <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertOctagon size={16} className="text-rose-400 shrink-0" />
            <span>{conflictWarning}</span>
          </div>
          <button
            onClick={() => setConflictWarning(null)}
            className="text-[11px] underline font-semibold text-rose-300 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Selected Machine Context Helper */}
      {selectedAsset && (
        <div className="rounded-xl border border-[#df2531]/40 bg-[#df2531]/10 p-3.5 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#df2531] flex items-center justify-center text-white font-bold">
              <Truck size={16} />
            </div>
            <div>
              <div className="font-bold text-white text-sm font-display">
                Focus Machine: {selectedAsset.make} {selectedAsset.model} ({selectedAsset.plateNumber || selectedAsset.chassisOrSerialNumber})
              </div>
              <div className="text-[11px] text-[#df2531]">
                Category: {selectedAsset.category.replace("_", " ")} • Daily Cap: {selectedAsset.specs.dailyEngineHourCap || 8} hrs/day • Low-bed Mobilization Required
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => testDoubleBookingConflict(selectedAsset)}
              className="px-2.5 py-1.5 rounded-md bg-rose-600/80 hover:bg-rose-600 text-white font-semibold text-[11px] flex items-center gap-1 shadow"
            >
              <AlertOctagon size={13} />
              Simulate GiST Conflict
            </button>
            <button
              onClick={() => setSelectedAsset(null)}
              className="px-2.5 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-[11px]"
            >
              Clear Focus
            </button>
          </div>
        </div>
      )}

      {/* Gantt Timeline Grid */}
      <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] overflow-hidden">
        {/* Date Headers */}
        <div className="grid grid-cols-12 border-b border-[#222222] bg-[#111111] text-xs font-semibold text-neutral-300 sticky top-0 z-10">
          <div className="col-span-3 px-4 py-3 border-r border-[#222222] flex items-center justify-between">
            <span>Resource (Asset / Operator)</span>
            <span className="text-[10px] text-slate-400 font-mono">Oct 2026</span>
          </div>
          <div className="col-span-9 grid grid-cols-12 text-center text-[11px] divide-x divide-slate-800">
            {days.map((d, i) => (
              <div key={i} className="py-2.5 bg-slate-900/60">
                <div className="text-[10px] text-slate-400 uppercase font-mono">
                  {d.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div className="font-bold text-white text-xs">{d.getDate()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Rows: Heavy Machinery */}
        {(activeTab === "all" || activeTab === "machinery") && (
          <div>
            <div className="px-4 py-2 bg-black text-[11px] font-bold uppercase tracking-wider text-[#df2531] border-b border-neutral-800 flex items-center gap-2 font-display">
              <Truck size={13} /> Heavy Construction Machinery (Excavators, Loaders, Dozers)
            </div>

            {heavyMachinery.map((asset) => {
              const isSelected = selectedAsset?.id === asset.id;

              return (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={cn(
                    "grid grid-cols-12 border-b border-neutral-800 hover:bg-neutral-900/60 transition-colors cursor-pointer text-xs items-center",
                    isSelected ? "bg-[#df2531]/10 border-l-4 border-l-[#df2531]" : ""
                  )}
                >
                  <div className="col-span-3 px-4 py-3 border-r border-neutral-800">
                    <div className="font-bold text-white flex items-center justify-between">
                      <span>{asset.make} {asset.model}</span>
                      <span className="text-[10px] font-mono text-neutral-400">{asset.plateNumber}</span>
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-2">
                      <span>{asset.currentMeterReading} Engine Hrs</span>
                      <span className="text-[#df2531]">Cap: {asset.specs.dailyEngineHourCap || 8}h</span>
                    </div>
                  </div>

                  <div className="col-span-9 grid grid-cols-12 h-full items-center divide-x divide-neutral-800">
                    {days.map((d, i) => {
                      const res = getAssetStatusOnDay(asset.id, d);
                      if (!res) {
                        return (
                          <div key={i} className="h-full flex items-center justify-center p-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-neutral-800 group-hover:bg-neutral-700" />
                          </div>
                        );
                      }

                      const isMaint = res.status === "maintenance_lock";

                      return (
                        <div key={i} className="h-full p-1 flex items-center">
                          <div
                            className={cn(
                              "w-full h-8 rounded px-1 flex flex-col items-center justify-center text-[9px] font-bold leading-tight shadow-sm",
                              isMaint
                                ? "bg-rose-500/30 text-rose-300 border border-rose-500/50 animate-pulse"
                                : res.status === "active"
                                ? "bg-[#df2531]/30 text-white border border-[#df2531]/60"
                                : "bg-[#df2531]/20 text-neutral-200 border border-[#df2531]/40"
                            )}
                            title={res.text}
                          >
                            <span className="truncate w-full text-center">{isMaint ? "LOCKED" : "ON RENT"}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Rows: Attachments (Linked via parent_asset_id) */}
        {(activeTab === "all" || activeTab === "machinery") && (
          <div>
            <div className="px-4 py-2 bg-black text-[11px] font-bold uppercase tracking-wider text-neutral-200 border-b border-neutral-800 flex items-center gap-2 font-display">
              <Layers size={13} className="text-[#df2531]" /> Hydraulic Attachments (Parent Asset Linkage)
            </div>

            {attachments.map((att) => {
              const isCompatible = selectedAsset && att.parentAssetId === selectedAsset.id;

              return (
                <div
                  key={att.id}
                  className={cn(
                    "grid grid-cols-12 border-b border-neutral-800 hover:bg-neutral-900/60 transition-colors text-xs items-center",
                    isCompatible ? "bg-[#df2531]/10 border-l-4 border-l-[#df2531]" : ""
                  )}
                >
                  <div className="col-span-3 px-4 py-2.5 border-r border-neutral-800">
                    <div className="font-bold text-white flex items-center justify-between">
                      <span>{att.make} {att.model}</span>
                      {isCompatible && (
                        <span className="text-[9px] bg-[#df2531]/20 text-[#df2531] px-1.5 py-0.5 rounded font-mono font-bold border border-[#df2531]/40">
                          Compatible Breaker
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      Parent Machine: {att.parentAssetId ? "CAT 320D" : "Standalone"}
                    </div>
                  </div>

                  <div className="col-span-9 grid grid-cols-12 h-full items-center divide-x divide-neutral-800">
                    {days.map((d, i) => {
                      const res = getAssetStatusOnDay(att.id, d);
                      if (!res) return <div key={i} className="h-full" />;

                      return (
                        <div key={i} className="h-full p-1 flex items-center">
                          <div className="w-full h-7 rounded bg-[#df2531]/25 text-white border border-[#df2531]/45 flex items-center justify-center text-[9px] font-bold">
                            ATTACHED
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Rows: Passenger Vehicles & 4x4 Field SUVs */}
        {(activeTab === "all" || activeTab === "cars") && (
          <div>
            <div className="px-4 py-2 bg-black text-[11px] font-bold uppercase tracking-wider text-neutral-200 border-b border-neutral-800 flex items-center gap-2 font-display">
              <Truck size={13} className="text-[#df2531]" /> Passenger Cars & 4x4 Field SUVs (Odometer KM Tracking)
            </div>

            {cars.map((car) => (
              <div
                key={car.id}
                className="grid grid-cols-12 border-b border-neutral-800 hover:bg-neutral-900/60 transition-colors text-xs items-center"
              >
                <div className="col-span-3 px-4 py-3 border-r border-neutral-800">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>{car.make} {car.model}</span>
                    <span className="text-[10px] font-mono text-neutral-400">{car.plateNumber}</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    {car.currentMeterReading} KM • 200 KM/day limit
                  </div>
                </div>

                <div className="col-span-9 grid grid-cols-12 h-full items-center divide-x divide-neutral-800">
                  {days.map((d, i) => {
                    const res = getAssetStatusOnDay(car.id, d);
                    if (!res) return <div key={i} className="h-full" />;

                    return (
                      <div key={i} className="h-full p-1 flex items-center">
                        <div className="w-full h-8 rounded bg-[#df2531]/25 text-white border border-[#df2531]/50 flex flex-col items-center justify-center text-[9px] font-bold">
                          <span>{res.status.toUpperCase()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rows: Certified Operators */}
        {(activeTab === "all" || activeTab === "operators") && (
          <div>
            <div className="px-4 py-2 bg-black text-[11px] font-bold uppercase tracking-wider text-emerald-400 border-b border-neutral-800 flex items-center gap-2 font-display">
              <UserCheck size={13} /> Certified Operators & Drivers (Special Mobile Machinery / Public 1)
            </div>

            {certifiedOperators.map((op) => {
              const isHeavySpecialist = op.driverLicenseGrade === "Special Mobile Machinery" || (op.driverLicenseGrade && op.driverLicenseGrade.toLowerCase().includes("machinery"));

              return (
                <div
                  key={op.id}
                  className="grid grid-cols-12 border-b border-neutral-800 hover:bg-neutral-900/60 transition-colors text-xs items-center"
                >
                  <div className="col-span-3 px-4 py-2.5 border-r border-neutral-800">
                    <div className="font-bold text-white flex items-center justify-between">
                      <span>{op.fullName}</span>
                      <span
                        className={cn(
                          "text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold",
                          isHeavySpecialist
                            ? "bg-[#df2531]/20 text-[#df2531] border border-[#df2531]/40"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        )}
                      >
                        {op.driverLicenseGrade || "Driver"}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono">{op.phoneNumber}</div>
                  </div>

                  <div className="col-span-9 grid grid-cols-12 h-full items-center divide-x divide-neutral-800">
                    {days.map((d, i) => {
                      const res = getOperatorStatusOnDay(op.id, d);
                      if (!res) {
                        return (
                          <div key={i} className="h-full flex items-center justify-center p-1">
                            <span className="text-[9px] text-neutral-500 font-mono">avail</span>
                          </div>
                        );
                      }

                      return (
                        <div key={i} className="h-full p-1 flex items-center">
                          <div className="w-full h-7 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center text-[9px] font-bold truncate px-1">
                            DISPATCHED
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
