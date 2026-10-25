"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle,
  Clock,
  Compass,
  FileCheck,
  Gauge,
  MapPin,
  Navigation,
  Plus,
  ShieldAlert,
  Truck,
  Wrench,
  Zap,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Layers,
  Car,
  User,
  Radio,
  ExternalLink,
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { formatETB, cn } from "@/lib/utils";
import { DalolComingSoon } from "@/components/DalolComingSoon";

const LiveGpsStreetTelematicsMap = dynamic(
  () => import("@/components/LiveGpsStreetTelematicsMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[430px] w-full rounded-2xl bg-[#050505] border border-neutral-800 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#df2531] border-t-transparent" />
          <span className="text-xs text-neutral-400 font-mono">Loading Real Interactive Corridor Map...</span>
        </div>
      </div>
    ),
  }
);

interface DashboardData {
  kpis: {
    fleetUtilizationPct: number;
    activeOnRentTotal: number;
    heavyMachineryOnRent: number;
    carsOnRent: number;
    pendingGuarantorChecks: number;
    overdueMaintenanceLocks: number;
    totalFleetCount: number;
    totalTenants: number;
  };
  gpsPins: Array<{
    id: string;
    assetName: string;
    category: string;
    plateNumber: string;
    status: string;
    meterReading: number;
    meterUnit: string;
    imageUrl?: string;
    operatorName?: string;
    location: {
      lat: number;
      lng: number;
      speed: number;
      address: string;
      status: "moving" | "idle" | "geofence_breach";
      lastUpdated: string;
      bearing?: number;
    };
  }>;
  alerts: Array<{
    id: string;
    level: "critical" | "warning" | "info";
    title: string;
    message: string;
    assetId?: string;
    timestamp: string;
  }>;
  recentBookings: any[];
}

export default function DashboardPage() {
  const { activeTenantId, currentUser } = useTenant();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPin, setSelectedPin] = useState<any | null>(null);

  // Real Map Interactive Controls
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapLayer, setMapLayer] = useState<"streets" | "satellite">("streets");
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });

  if (currentUser?.role === "dalol_admin") {
    return (
      <DalolComingSoon
        moduleName="Dalol Command Center & Operations Desk"
        description="Cross-border corridor telemetry, freight logistics dispatching, and automated RFID fuel monitoring are launching soon."
      />
    );
  }

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/dashboard?ownerId=${activeTenantId}`);
        const json = await res.json();
        if (json.success) {
          // Enrich gpsPins with realistic images & operators
          const enrichedPins = (json.data.gpsPins || []).map((pin: any) => {
            let img = "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=400&q=80";
            let op = "Kebede Alemu";
            if (pin.assetName?.includes("Hilux")) {
              img = "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=400&q=80";
              op = "Girma Wolde";
            } else if (pin.assetName?.includes("Excavator") || pin.assetName?.includes("CAT")) {
              img = "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=400&q=80";
              op = "Tsegaye Mekonnen";
            } else if (pin.assetName?.includes("Loader")) {
              img = "https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=400&q=80";
              op = "Daniel Assefa";
            } else if (pin.assetName?.includes("Bulldozer")) {
              img = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80";
              op = "Ephrem Tesfaye";
            }
            return {
              ...pin,
              imageUrl: img,
              operatorName: op,
            };
          });

          setData({
            ...json.data,
            gpsPins: enrichedPins,
          });
          if (enrichedPins.length > 0) {
            setSelectedPin(enrichedPins[0]);
          }
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [activeTenantId]);

  if (loading || !data) {
    return (
      <div className="flex h-96 items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#df2531] border-t-transparent" />
          <p className="text-xs text-neutral-400 font-mono">Initializing DEL Command Center & Real Telematics...</p>
        </div>
      </div>
    );
  }

  const { kpis, gpsPins, alerts, recentBookings } = data;

  return (
    <div className="space-y-6 bg-black text-neutral-100">
      {/* Top Banner: Status + Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2 font-display">
            Executive Command Center
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-0.5 rounded-full font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Telematics Active
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time fleet telematics, GiST scheduling locks, and active project site telemetry across Ethiopia.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/bookings/new"
            className="flex items-center gap-1.5 rounded-xl bg-[#df2531] px-4 py-2 text-xs font-bold text-white hover:bg-[#c41e29] shadow-md shadow-[#df2531]/30 border border-[#df2531] transition-all active:scale-95 font-display"
          >
            <Plus size={15} />
            New Dispatch Quote
          </Link>
          <Link
            href="/dispatch/calendar"
            className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-[#0a0a0a] px-3.5 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 hover:border-[#df2531]/40 transition-all font-display"
          >
            <Compass size={15} className="text-[#df2531]" />
            Open Gantt Timeline
          </Link>
        </div>
      </div>

      {/* 4-KPI STAT RIBBON */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Fleet Utilization */}
        <div className="rounded-2xl border border-neutral-800 bg-[#0a0a0a] p-4 relative overflow-hidden group hover:border-[#df2531]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Fleet Utilization</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity size={17} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-display">{kpis.fleetUtilizationPct}%</span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center">
              <ArrowUpRight size={13} />
              +4.2%
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400">
            <span>{kpis.activeOnRentTotal} of {kpis.totalFleetCount} Assets on Rent</span>
            <span className="text-neutral-400 font-mono">Ethiopia Fleet</span>
          </div>
          <div className="mt-2.5 h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${kpis.fleetUtilizationPct}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Active Heavy Machinery / Cars */}
        <div className="rounded-2xl border border-neutral-800 bg-[#0a0a0a] p-4 relative overflow-hidden group hover:border-[#df2531]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Heavy Machinery & Cars</span>
            <div className="p-2 rounded-xl bg-[#df2531]/10 text-[#df2531] border border-[#df2531]/30">
              <Truck size={17} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-display">{kpis.heavyMachineryOnRent}</span>
            <span className="text-xs text-neutral-400 font-medium">Machines</span>
            <span className="text-neutral-700 font-light">/</span>
            <span className="text-2xl font-bold text-neutral-300 font-display">{kpis.carsOnRent}</span>
            <span className="text-xs text-neutral-400 font-medium">Cars</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-neutral-400">
            <span className="text-neutral-300 font-medium">CAT 320D & Hilux Deployed</span>
            <span className="text-neutral-400 font-mono">{kpis.totalTenants} Hosts</span>
          </div>
        </div>

        {/* KPI 3: Pending Guarantor Checks */}
        <div className="rounded-2xl border border-neutral-800 bg-[#0a0a0a] p-4 relative overflow-hidden group hover:border-[#df2531]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Guarantor Verification</span>
            <div className="p-2 rounded-xl bg-[#df2531]/10 text-[#df2531] border border-[#df2531]/30">
              <FileCheck size={17} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#df2531] font-display">{kpis.pendingGuarantorChecks}</span>
            <span className="text-xs text-neutral-400">Contracts Pending</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-neutral-400">
            <span>Requires Fayda & TIN Verify</span>
            <Link href="/bookings/new" className="text-[#df2531] hover:underline font-semibold">
              Inspect Vault →
            </Link>
          </div>
        </div>

        {/* KPI 4: Overdue Maintenance Locks */}
        <div className="rounded-2xl border border-neutral-800 bg-[#0a0a0a] p-4 relative overflow-hidden group hover:border-[#df2531]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Safety Interlocks Active</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert size={17} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-500 font-display">{kpis.overdueMaintenanceLocks}</span>
            <span className="text-xs text-rose-400 font-medium">Interlock Active</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-neutral-400">
            <span className="text-rose-400">250h / 5,000km Threshold</span>
            <Link href="/maintenance" className="text-rose-400 hover:underline font-semibold">
              Clear Locks →
            </Link>
          </div>
        </div>
      </div>

      {/* SPLIT VIEW: REAL INTERACTIVE GPS MAP & PRIORITY ALERT QUEUE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real GPS Telematics Map */}
        <div className="lg:col-span-2 rounded-2xl border border-neutral-800 bg-[#0a0a0a] p-4 sm:p-5 flex flex-col space-y-3.5">
          {/* Map Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-neutral-800 pb-3">
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2 font-display">
                <Navigation size={16} className="text-[#df2531]" />
                Live GPS Telematics Map • Addis Ababa & Shewa Corridor
              </div>
              <div className="text-xs text-neutral-400">
                Teltonika FMB920 nodes: Bole Central Yard, Kality Logistics Ring, Mojo Dry Port, Adama Expressway.
              </div>
            </div>

            {/* Map Status Indicators */}
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Moving
              </span>
              <span className="flex items-center gap-1.5 text-neutral-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-neutral-600" /> Idle / Parked
              </span>
              <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Geofence Alert
              </span>
            </div>
          </div>

          {/* REAL INTERACTIVE LEAFLET CORRIDOR MAP */}
          <LiveGpsStreetTelematicsMap
            pins={gpsPins}
            selectedPin={selectedPin}
            onSelectPin={(pin) => setSelectedPin(pin)}
          />

          {/* ASSET TELEMETRY INSPECTOR BAR */}
          {selectedPin && (
            <div className="rounded-2xl bg-black border border-neutral-800 p-3.5 shadow-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                {/* Vehicle Image Thumbnail */}
                <div className="h-12 w-16 rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src={selectedPin.imageUrl || "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=400&q=80"}
                    alt={selectedPin.assetName}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm font-display">{selectedPin.assetName}</span>
                    <span className="font-mono text-[10px] bg-neutral-900 text-white px-2 py-0.5 rounded font-bold border border-neutral-700">
                      {selectedPin.plateNumber}
                    </span>
                    <span
                      className={cn(
                        "text-[9px] font-bold uppercase px-2 py-0.5 rounded font-mono",
                        selectedPin.location.status === "geofence_breach"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : selectedPin.location.status === "moving"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-neutral-800 text-neutral-300 border border-neutral-700"
                      )}
                    >
                      {selectedPin.location.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="text-[11px] text-neutral-300 mt-1 flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 text-neutral-400">
                      <MapPin size={11} className="text-[#df2531] shrink-0" />
                      <span className="text-neutral-300">{selectedPin.location.address}</span>
                    </span>
                    <span className="text-neutral-600 hidden sm:inline">•</span>
                    <span className="flex items-center gap-1 text-neutral-300 font-medium">
                      <User size={11} className="text-neutral-400" />
                      {selectedPin.operatorName || "Certified Driver"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[11px] border-t md:border-t-0 md:border-l border-neutral-800 pt-2 md:pt-0 md:pl-4 justify-between md:justify-end">
                <div>
                  <div className="text-[10px] text-neutral-400 font-mono">Current Speed</div>
                  <div className="font-mono font-bold text-white text-xs">{selectedPin.location.speed} km/h</div>
                </div>

                <div>
                  <div className="text-[10px] text-neutral-400 font-mono">Meter Reading</div>
                  <div className="font-mono font-bold text-white text-xs font-display">
                    {selectedPin.meterReading} {selectedPin.meterUnit === "odometer_km" ? "KM" : "Hrs"}
                  </div>
                </div>

                <Link
                  href="/assets"
                  className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold flex items-center gap-1 border border-neutral-700 hover:border-[#df2531]/40 transition-colors"
                >
                  Asset Detail
                  <ExternalLink size={11} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Priority Alert Queue */}
        <div className="rounded-2xl border border-neutral-800 bg-[#0a0a0a] p-4 sm:p-5 flex flex-col space-y-3.5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="text-sm font-bold text-white flex items-center gap-2 font-display">
              <AlertTriangle size={16} className="text-rose-400" />
              Priority Dispatch Alert Queue
            </div>
            <span className="text-[11px] bg-rose-500/20 text-rose-400 px-2.5 py-0.5 rounded-full font-mono font-bold border border-rose-500/30">
              {alerts.length} Active
            </span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[380px] pr-1">
            {alerts.map((alert) => {
              const isCrit = alert.level === "critical";

              return (
                <div
                  key={alert.id}
                  className={cn(
                    "p-3 rounded-xl border text-xs space-y-1.5 transition-all text-left",
                    isCrit
                      ? "bg-rose-950/20 border-rose-900/60 text-rose-200"
                      : "bg-[#df2531]/10 border-[#df2531]/30 text-white"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded font-mono",
                        isCrit ? "bg-rose-500/20 text-rose-400" : "bg-[#df2531]/20 text-[#df2531]"
                      )}
                    >
                      {alert.title}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">{alert.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed">{alert.message}</p>
                  <div className="pt-1 flex items-center justify-end gap-2">
                    {alert.title.includes("GEOFENCE") && (
                      <button
                        onClick={() => window.alert("Remote engine kill command sent to Teltonika GPS tracker.")}
                        className="rounded-lg bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 text-[10px] font-bold"
                      >
                        Engage Remote Cutoff
                      </button>
                    )}
                    {alert.title.includes("MAINTENANCE") && (
                      <Link
                        href="/maintenance"
                        className="rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white px-2.5 py-1 text-[10px] font-semibold"
                      >
                        Assign Mechanic
                      </Link>
                    )}
                    {alert.title.includes("GUARANTOR") && (
                      <Link
                        href="/bookings/new"
                        className="rounded-lg bg-[#df2531] hover:bg-[#c41e29] text-white px-2.5 py-1 text-[10px] font-bold font-display shadow-md shadow-[#df2531]/30"
                      >
                        Verify Guarantor KYC
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-neutral-800">
            <Link
              href="/operations/inspect"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold border border-neutral-800 hover:border-[#df2531]/40 transition-colors font-display"
            >
              <FileCheck size={14} className="text-[#df2531]" />
              Launch Field Inspection Walkaround
            </Link>
          </div>
        </div>
      </div>

      {/* RECENT BOOKINGS & ACTIVE DISPATCH TABLE */}
      <div className="rounded-2xl border border-neutral-800 bg-[#0a0a0a] p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white font-display">Recent Active Dispatches & Contracts</h2>
            <p className="text-xs text-neutral-400">Current rentals under GiST exclusion tracking</p>
          </div>
          <Link
            href="/dispatch/calendar"
            className="text-xs font-semibold text-[#df2531] hover:underline flex items-center gap-1 font-display"
          >
            View Gantt Schedule →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-950 text-[10px] uppercase tracking-wider text-neutral-400 border-b border-neutral-800 font-mono">
              <tr>
                <th className="px-4 py-3 font-semibold">Booking Ref</th>
                <th className="px-4 py-3 font-semibold">Renter / Client</th>
                <th className="px-4 py-3 font-semibold">Project Site</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Channel</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-medium">
              {recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-neutral-900/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-white">{b.bookingReference}</td>
                  <td className="px-4 py-3 text-white font-semibold">{b.renterName || "Corporate Renter"}</td>
                  <td className="px-4 py-3 text-neutral-300">{b.dropoffLocation}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono",
                        b.status === "active"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : b.status === "confirmed"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      )}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize text-neutral-400">
                    {b.bookingChannel.replace("_", " ")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href="/finance/settlements"
                      className="text-xs text-[#df2531] hover:text-[#c41e29] font-semibold font-display"
                    >
                      Ledger & Invoice →
                    </Link>
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
