"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Navigation,
  Compass,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  Info,
} from "lucide-react";
import { cn, formatETB } from "@/lib/utils";

// Dynamically load the Leaflet Corridor Map with SSR disabled
const EthiopianCorridorLeafletMap = dynamic(
  () => import("./EthiopianCorridorLeafletMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-72 sm:h-80 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col items-center justify-center gap-2 text-neutral-400">
        <div className="h-6 w-6 border-2 border-[#df2531] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono">Loading Real Street Corridor Map...</span>
      </div>
    ),
  }
);

export interface EthiopianDestination {
  id: string;
  name: string;
  region: string;
  oneWayKm: number;
  roundTripKm: number;
  estDriveHours: number;
  roadType: string;
  securityStatus: "cleared" | "caution";
  svgCoords: { x: number; y: number }; // Relative coordinates on the map viewbox
  coords: [number, number]; // [latitude, longitude]
}

export const POPULAR_ETHIOPIAN_CORRIDORS: EthiopianDestination[] = [
  {
    id: "adama",
    name: "Adama (Nazret) Expressway Corridor",
    region: "Oromia",
    oneWayKm: 99,
    roundTripKm: 198,
    estDriveHours: 1.2,
    roadType: "6-Lane Toll Expressway (A1)",
    securityStatus: "cleared",
    svgCoords: { x: 265, y: 195 },
    coords: [8.5410, 39.2689],
  },
  {
    id: "hawassa",
    name: "Hawassa Industrial Corridor",
    region: "Sidama",
    oneWayKm: 275,
    roundTripKm: 550,
    estDriveHours: 3.5,
    roadType: "Batu-Hawassa Asphalt Highway",
    securityStatus: "cleared",
    svgCoords: { x: 235, y: 275 },
    coords: [7.0504, 38.4955],
  },
  {
    id: "bishoftu",
    name: "Bishoftu (Debre Zeit) Agro Site",
    region: "Oromia",
    oneWayKm: 45,
    roundTripKm: 90,
    estDriveHours: 0.6,
    roadType: "Expressway Connector & Dual Carriageway",
    securityStatus: "cleared",
    svgCoords: { x: 240, y: 185 },
    coords: [8.7523, 38.9785],
  },
  {
    id: "bahirdar",
    name: "Bahir Dar & Lake Tana Project Corridor",
    region: "Amhara",
    oneWayKm: 560,
    roundTripKm: 1120,
    estDriveHours: 8.5,
    roadType: "Abay Gorge Trans-African Highway",
    securityStatus: "cleared",
    svgCoords: { x: 175, y: 95 },
    coords: [11.5742, 37.3614],
  },
  {
    id: "mojo",
    name: "Mojo Dry Port & Logistics Hub",
    region: "Oromia",
    oneWayKm: 75,
    roundTripKm: 150,
    estDriveHours: 1.0,
    roadType: "Modjo Dry Port Freight Route",
    securityStatus: "cleared",
    svgCoords: { x: 250, y: 205 },
    coords: [8.5869, 39.1211],
  },
  {
    id: "diredawa",
    name: "Dire Dawa Free Trade Zone",
    region: "Dire Dawa",
    oneWayKm: 450,
    roundTripKm: 900,
    estDriveHours: 7.0,
    roadType: "Ethio-Djibouti Trade Corridor",
    securityStatus: "cleared",
    svgCoords: { x: 345, y: 170 },
    coords: [9.5931, 41.8661],
  },
  {
    id: "wolkite",
    name: "Wolkite / Gurage Project Zone",
    region: "Central Ethiopia",
    oneWayKm: 155,
    roundTripKm: 310,
    estDriveHours: 2.5,
    roadType: "Sebeta-Wolkite Asphalt Highway",
    securityStatus: "cleared",
    svgCoords: { x: 170, y: 215 },
    coords: [8.2833, 37.7833],
  },
  {
    id: "jimma",
    name: "Jimma Agribusiness Corridor",
    region: "Oromia",
    oneWayKm: 350,
    roundTripKm: 700,
    estDriveHours: 5.5,
    roadType: "Gibe Gorge Federal Highway",
    securityStatus: "cleared",
    svgCoords: { x: 135, y: 235 },
    coords: [7.6734, 36.8344],
  },
];

const ADDIS_HUB_COORDS = { x: 215, y: 175 };

interface EthiopianRouteMapProps {
  meterUnit?: string; // "KM" or "Engine Hours"
  rentalDays: number;
  dailyRate: number;
  includedUnitsPerDay: number;
  overtimeRatePerUnit: number;
  currentAssetMeter: number;
  isMachinery: boolean;
  selectedDestinationId: string;
  customDestinationName: string;
  customDistanceKm: number;
  onDestinationChange: (dest: {
    id: string;
    name: string;
    region: string;
    oneWayKm: number;
    roundTripKm: number;
  }) => void;
  startGauge: number;
  endGauge: number;
  onGaugeChange: (start: number, end: number) => void;
}

export function EthiopianRouteMap({
  meterUnit = "KM",
  rentalDays,
  dailyRate,
  includedUnitsPerDay = 200,
  overtimeRatePerUnit = 35,
  currentAssetMeter = 18450,
  isMachinery = false,
  selectedDestinationId,
  customDestinationName,
  customDistanceKm,
  onDestinationChange,
  startGauge,
  endGauge,
  onGaugeChange,
}: EthiopianRouteMapProps) {
  const [activeDestId, setActiveDestId] = useState<string>(selectedDestinationId || "adama");
  const [customName, setCustomName] = useState(customDestinationName || "");
  const [customKm, setCustomKm] = useState(customDistanceKm || 120);

  const activeDest =
    activeDestId === "custom"
      ? {
          id: "custom",
          name: customName || "Custom Project Site",
          region: "Regional Project Site",
          oneWayKm: customKm,
          roundTripKm: customKm * 2,
          estDriveHours: Math.round((customKm / 65) * 10) / 10,
          roadType: "Regional Highway & Access Road",
          securityStatus: "cleared" as const,
          svgCoords: { x: 280, y: 240 },
          coords: [8.65, 39.00] as [number, number],
        }
      : POPULAR_ETHIOPIAN_CORRIDORS.find((d) => d.id === activeDestId) || POPULAR_ETHIOPIAN_CORRIDORS[0];

  const handleSelectDestination = (destId: string) => {
    setActiveDestId(destId);
    if (destId === "custom") {
      onDestinationChange({
        id: "custom",
        name: customName || "Custom Project Site",
        region: "Regional Project Site",
        oneWayKm: customKm,
        roundTripKm: customKm * 2,
      });
    } else {
      const found = POPULAR_ETHIOPIAN_CORRIDORS.find((d) => d.id === destId);
      if (found) {
        onDestinationChange({
          id: found.id,
          name: found.name,
          region: found.region,
          oneWayKm: found.oneWayKm,
          roundTripKm: found.roundTripKm,
        });
      }
    }
  };

  // Gauge Calculations
  const resolvedStart = startGauge > 0 ? startGauge : currentAssetMeter;
  const standardIncludedUnits = rentalDays * includedUnitsPerDay;
  const agreedDealUnits = Math.max(standardIncludedUnits, activeDest.roundTripKm);
  const actualUsedUnits = Math.max(0, endGauge - resolvedStart);
  const isOverage = actualUsedUnits > agreedDealUnits;
  const overageUnits = isOverage ? actualUsedUnits - agreedDealUnits : 0;
  const overageCost = overageUnits * overtimeRatePerUnit;

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/90 p-5 space-y-5 text-xs text-neutral-200">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#df2531]/10 text-[#df2531] border border-[#df2531]/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-display">
              Out-of-Addis Route & Odometer Gauge Module
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#df2531]/10 text-[#df2531] border border-[#df2531]/20 font-bold">
                Regional Corridor
              </span>
            </h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Live distance matrix, interactive corridor map, and dispatch/return gauge overage billing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-neutral-400">Round-Trip Distance:</span>
          <span className="font-mono font-bold text-[#df2531] bg-[#df2531]/10 border border-[#df2531]/20 px-2.5 py-1 rounded-lg">
            {activeDest.roundTripKm} KM
          </span>
        </div>
      </div>

      {/* Grid: Interactive Route Map + Corridor Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Interactive Real Street Map (7 Cols) */}
        <div className="lg:col-span-7 rounded-xl border border-neutral-800/80 bg-black/60 p-3 relative overflow-hidden flex flex-col justify-between min-h-[340px]">
          {/* Interactive Real Street Corridor Map (Addis & Shewa Corridor) */}
          <EthiopianCorridorLeafletMap
            activeDest={activeDest as any}
            corridors={POPULAR_ETHIOPIAN_CORRIDORS as any}
            onSelectDestination={handleSelectDestination}
          />

          {/* Route Stats Footer */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-neutral-800 text-[11px] bg-neutral-900/70 p-2.5 rounded-lg">
            <div>
              <span className="text-neutral-400 block text-[10px]">One-Way Distance</span>
              <span className="font-mono font-bold text-white">{activeDest.oneWayKm} KM</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px]">Round-Trip Agreed</span>
              <span className="font-mono font-bold text-[#df2531]">{activeDest.roundTripKm} KM</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px]">Est. Transit Time</span>
              <span className="font-mono font-bold text-emerald-400">{activeDest.estDriveHours} hrs</span>
            </div>
          </div>
        </div>

        {/* Right Column: Destination Selector & Route Options (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Select Regional Corridor / Project Destination <span className="text-[#df2531]">*</span>
            </label>
            <select
              value={activeDestId}
              onChange={(e) => handleSelectDestination(e.target.value)}
              className="w-full bg-[#121212] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#df2531] font-medium"
            >
              {POPULAR_ETHIOPIAN_CORRIDORS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.oneWayKm} km one-way | {d.roundTripKm} km round-trip)
                </option>
              ))}
              <option value="custom">Other / Custom Project Site...</option>
            </select>
          </div>

          {/* Custom Destination Inputs */}
          {activeDestId === "custom" && (
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2 animate-fadeIn">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-0.5">Custom Site Name / Location</label>
                <input
                  type="text"
                  placeholder="e.g. GERD Project Corridor / Weldiya Road"
                  value={customName}
                  onChange={(e) => {
                    setCustomName(e.target.value);
                    onDestinationChange({
                      id: "custom",
                      name: e.target.value || "Custom Project Site",
                      region: "Regional Project Site",
                      oneWayKm: customKm,
                      roundTripKm: customKm * 2,
                    });
                  }}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#df2531]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-0.5">One-Way Distance (KM)</label>
                <input
                  type="number"
                  min="10"
                  max="2000"
                  value={customKm}
                  onChange={(e) => {
                    const km = parseFloat(e.target.value) || 0;
                    setCustomKm(km);
                    onDestinationChange({
                      id: "custom",
                      name: customName || "Custom Project Site",
                      region: "Regional Project Site",
                      oneWayKm: km,
                      roundTripKm: km * 2,
                    });
                  }}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-[#df2531] font-mono focus:border-[#df2531]"
                />
              </div>
            </div>
          )}

          {/* Road Infrastructure Details */}
          <div className="p-3 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-neutral-400">Highway Type:</span>
              <span className="font-semibold text-neutral-200">{activeDest.roadType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Jurisdiction / Region:</span>
              <span className="font-semibold text-neutral-200">{activeDest.region}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Security & Police Clearance:</span>
              <span className="text-emerald-400 font-bold font-mono">100% Cleared (Federal)</span>
            </div>
          </div>

          {/* Odometer / Engine Hours Meter Gauge Box */}
          <div className="p-3.5 rounded-xl bg-[#121212] border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="font-bold text-white flex items-center gap-1.5 text-xs font-display">
                <Gauge size={14} className="text-[#df2531]" />
                {isMachinery ? "Engine Hours Meter Tracker" : "Odometer (KM) Dispatch & Return"}
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                Rate: ETB {overtimeRatePerUnit}/{meterUnit}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">
                  Start {meterUnit} (Dispatch)
                </label>
                <input
                  type="number"
                  value={resolvedStart}
                  onChange={(e) => onGaugeChange(parseFloat(e.target.value) || 0, endGauge)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-[#df2531]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">
                  End {meterUnit} (Return Est.)
                </label>
                <input
                  type="number"
                  placeholder={`${resolvedStart + agreedDealUnits}`}
                  value={endGauge > 0 ? endGauge : ""}
                  onChange={(e) => onGaugeChange(resolvedStart, parseFloat(e.target.value) || 0)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-[#df2531]"
                />
              </div>
            </div>

            {/* Gauge Utilization Progress & Surcharge Bar */}
            <div className="space-y-1.5 text-[11px] pt-1">
              <div className="flex items-center justify-between text-neutral-300">
                <span>Agreed Allowance:</span>
                <span className="font-mono font-bold text-white">
                  {agreedDealUnits} {meterUnit} ({rentalDays}d @ {includedUnitsPerDay}/{meterUnit})
                </span>
              </div>
              <div className="flex items-center justify-between text-neutral-300">
                <span>Units Traveled:</span>
                <span className="font-mono font-bold text-white">
                  {actualUsedUnits > 0 ? `${actualUsedUnits} ${meterUnit}` : `Projected: ${agreedDealUnits} ${meterUnit}`}
                </span>
              </div>

              {/* Excess Gauge Surcharge Notification */}
              {isOverage ? (
                <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-center justify-between text-[11px] mt-2">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle size={13} className="text-rose-400 shrink-0" />
                    <span>
                      Excess Usage: <strong>+{overageUnits} {meterUnit}</strong>
                    </span>
                  </div>
                  <span className="font-mono font-black text-rose-300">
                    +{formatETB(overageCost)}
                  </span>
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 flex items-center justify-between text-[11px] mt-2">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <span>Within Agreed {meterUnit} Allowance</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">0.00 ETB Surcharge</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
