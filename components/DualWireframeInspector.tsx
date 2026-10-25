"use client";

import React, { useState } from "react";
import {
  ClipboardCheck,
  Camera,
  Fuel,
  Gauge,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Sparkles,
  MapPin,
  Check,
  Upload,
  Layers,
  ArrowRight,
  Eye,
  X,
} from "lucide-react";
import { DamageMarker, AssetInspection } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DualWireframeInspectorProps {
  assetType?: "car" | "excavator";
  assetName?: string;
  plateOrSerial?: string;
  currentMeter?: number;
  meterUnit?: "odometer_km" | "engine_hours";
  bookingItemId?: string;
  onInspectionSaved?: (inspection: any) => void;
}

export function DualWireframeInspector({
  assetType = "excavator",
  assetName = "Caterpillar 320D Excavator",
  plateOrSerial = "SPL-04891 AA",
  currentMeter = 3420,
  meterUnit = "engine_hours",
  bookingItemId = "bki-101a",
  onInspectionSaved,
}: DualWireframeInspectorProps) {
  const [wireframeType, setWireframeType] = useState<"car" | "excavator">(assetType);
  const [activeMode, setActiveMode] = useState<"check_out" | "check_in" | "compare">("check_in");

  // Check-Out State
  const [chkOutMeter, setChkOutMeter] = useState(3380);
  const [chkOutFuel, setChkOutFuel] = useState(100);
  const [chkOutMarkers, setChkOutMarkers] = useState<DamageMarker[]>([
    {
      id: "dm-chkout-1",
      x: 35,
      y: 42,
      partName: "Hydraulic Boom Cylinder",
      severity: "minor_scratch",
      notes: "Pre-existing scratch on hydraulic ram casing at check-out.",
    },
  ]);
  const [chkOutPhotos, setChkOutPhotos] = useState<{ [key: string]: string }>({});

  // Check-In State
  const [chkInMeter, setChkInMeter] = useState(currentMeter + 15);
  const [chkInFuel, setChkInFuel] = useState(85);
  const [chkInMarkers, setChkInMarkers] = useState<DamageMarker[]>([
    {
      id: "dm-chkin-1",
      x: 35,
      y: 42,
      partName: "Hydraulic Boom Cylinder",
      severity: "hydraulic_leak",
      notes: "Hydraulic seal leaking oil post-operation.",
    },
    {
      id: "dm-chkin-2",
      x: 68,
      y: 65,
      partName: "Right Track Shoes",
      severity: "deep_dent",
      notes: "New impact dent from basalt quarry rocks.",
    },
  ]);
  const [chkInPhotos, setChkInPhotos] = useState<{ [key: string]: string }>({});

  // Front Angle Image as primary car preview image
  const [frontCarImage, setFrontCarImage] = useState<string | null>(null);

  // Active Marker Selection
  const [selectedMarker, setSelectedMarker] = useState<DamageMarker | null>(null);
  const [saving, setSaving] = useState(false);
  const [triggerFiredBanner, setTriggerFiredBanner] = useState<string | null>(null);

  // 8-Angle Walkaround Definitions
  const angles = [
    { id: "front", label: "Front" },
    { id: "front_right", label: "Front-Right" },
    { id: "right_side", label: "Right Profile" },
    { id: "rear_right", label: "Rear-Right" },
    { id: "rear", label: "Rear" },
    { id: "rear_left", label: "Rear-Left" },
    { id: "left_side", label: "Left Profile" },
    { id: "cabin_interior", label: "Cabin / Cockpit" },
  ];

  // Active state pointers based on activeMode
  const isCheckOut = activeMode === "check_out";
  const currentMarkers = isCheckOut ? chkOutMarkers : chkInMarkers;
  const setMarkers = isCheckOut ? setChkOutMarkers : setChkInMarkers;
  const currentMeterVal = isCheckOut ? chkOutMeter : chkInMeter;
  const setCurrentMeterVal = isCheckOut ? setChkOutMeter : setChkInMeter;
  const currentFuelVal = isCheckOut ? chkOutFuel : chkInFuel;
  const setCurrentFuelVal = isCheckOut ? setChkOutFuel : setChkInFuel;
  const currentPhotos = isCheckOut ? chkOutPhotos : chkInPhotos;
  const setCurrentPhotos = isCheckOut ? setChkOutPhotos : setChkInPhotos;

  const handleDiagramClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeMode === "compare") return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const newMarker: DamageMarker = {
      id: `dm-${Date.now()}`,
      x,
      y,
      partName: wireframeType === "excavator" ? "Excavator Structure" : "Vehicle Panel",
      severity: "minor_scratch",
      notes: `Recorded during ${activeMode === "check_out" ? "Check-Out" : "Check-In"} walkaround.`,
    };

    setMarkers([...currentMarkers, newMarker]);
    setSelectedMarker(newMarker);
  };

  const removeMarker = (id: string) => {
    setMarkers(currentMarkers.filter((m) => m.id !== id));
    if (selectedMarker?.id === id) setSelectedMarker(null);
  };

  const handleAngleImageUpload = (angleId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setCurrentPhotos((prev) => ({ ...prev, [angleId]: dataUrl }));
        // If front image is uploaded, use it as primary car preview image!
        if (angleId === "front") {
          setFrontCarImage(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveInspection = async () => {
    setSaving(true);
    setTriggerFiredBanner(null);

    try {
      const res = await fetch("/api/v1/operations/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingItemId,
          inspectionType: isCheckOut ? "check_out" : "check_in",
          inspectorUserId: "opr-001",
          meterReading: currentMeterVal,
          fuelPercentage: currentFuelVal,
          damageMarkers: currentMarkers,
          walkaroundPhotos: Object.entries(currentPhotos).map(([angle, url]) => ({
            angle,
            url,
            timestamp: new Date().toISOString(),
          })),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Inspection save failed");

      setTriggerFiredBanner(
        `[${isCheckOut ? "CHECK-OUT" : "CHECK-IN"} COMMITTED] PostgreSQL trigger 'trg_after_inspection_meter_sync' fired! Meter set to ${currentMeterVal} ${meterUnit === "odometer_km" ? "KM" : "Hours"}. ${
          json.assetState?.isUnderMaintenance
            ? "CRITICAL: Service limit exceeded! Asset status flipped to 'maintenance' and safety lock engaged."
            : "Asset condition verified."
        }`
      );

      if (onInspectionSaved) {
        onInspectionSaved(json);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 text-xs text-slate-200">
      {/* Trigger Fired Notification Banner */}
      {triggerFiredBanner && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-200 flex items-start gap-2.5 animate-fadeIn">
          <Sparkles className="text-emerald-400 shrink-0 mt-0.5" size={18} />
          <div>
            <div className="font-bold text-sm text-white">Inspection Saved & PostgreSQL Meter Sync Trigger Executed</div>
            <p className="mt-0.5 text-xs">{triggerFiredBanner}</p>
          </div>
        </div>
      )}

      {/* Control Header: Check-In vs Check-Out vs Comparison */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#0A0A0A] p-4 rounded-xl border border-[#222222]">
        <div>
          <div className="font-bold text-white text-sm flex items-center gap-2">
            <ClipboardCheck size={18} className="text-amber-400" />
            Dual-Wireframe 8-Angle Walkaround Inspector
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Asset: <span className="text-white font-semibold">{assetName}</span> ({plateOrSerial})
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Wireframe Diagram Toggle */}
          <div className="flex rounded-lg border border-slate-700 bg-slate-900 p-0.5">
            <button
              onClick={() => setWireframeType("excavator")}
              className={cn(
                "px-3 py-1 rounded font-medium",
                wireframeType === "excavator" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400"
              )}
            >
              Excavator Wireframe
            </button>
            <button
              onClick={() => setWireframeType("car")}
              className={cn(
                "px-3 py-1 rounded font-medium",
                wireframeType === "car" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400"
              )}
            >
              4-Door SUV / Car
            </button>
          </div>

          {/* Mode Switcher: Check-Out vs Check-In vs Side-by-Side Comparison */}
          <div className="flex rounded-lg border border-slate-700 bg-slate-900 p-0.5">
            <button
              onClick={() => {
                setActiveMode("check_out");
                setSelectedMarker(null);
              }}
              className={cn(
                "px-3 py-1 rounded font-bold transition-all",
                activeMode === "check_out" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
              )}
            >
              1. Check-Out
            </button>
            <button
              onClick={() => {
                setActiveMode("check_in");
                setSelectedMarker(null);
              }}
              className={cn(
                "px-3 py-1 rounded font-bold transition-all",
                activeMode === "check_in" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
              )}
            >
              2. Check-In
            </button>
            <button
              onClick={() => {
                setActiveMode("compare");
                setSelectedMarker(null);
              }}
              className={cn(
                "px-3 py-1 rounded font-bold transition-all",
                activeMode === "compare" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
              )}
            >
              Compare
            </button>
          </div>
        </div>
      </div>

      {/* COMPARISON MODE BANNER */}
      {activeMode === "compare" && (
        <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/80 text-purple-200 space-y-2">
          <div className="font-bold flex items-center gap-2 text-sm text-purple-300">
            <Eye size={16} /> Side-by-Side Check-Out vs. Check-In Variance Analysis
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">Total Meter Usage:</span>
              <div className="font-mono text-base font-bold text-white">
                {chkInMeter - chkOutMeter} {meterUnit === "odometer_km" ? "KM" : "Engine Hours"}
              </div>
              <div className="text-[10px] text-slate-400">Start: {chkOutMeter} → Return: {chkInMeter}</div>
            </div>
            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">Fuel Consumed:</span>
              <div className="font-mono text-base font-bold text-[#df2531]">
                {chkOutFuel - chkInFuel}% Tank ({chkOutFuel}% → {chkInFuel}%)
              </div>
              <div className="text-[10px] text-slate-400">Refueling billable if under 100%</div>
            </div>
            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">Newly Identified Damage Pins:</span>
              <div className="font-mono text-base font-bold text-rose-400">
                +{Math.max(0, chkInMarkers.length - chkOutMarkers.length)} New Defects
              </div>
              <div className="text-[10px] text-slate-400">Pre-existing: {chkOutMarkers.length} | Check-in: {chkInMarkers.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Vector Wireframe & Damage Pin Logger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Wireframe Diagram */}
        <div className="lg:col-span-2 bg-[#0A0A0A] p-4 rounded-xl border border-[#222222] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-1.5 font-display">
              <MapPin size={15} className="text-[#df2531]" />
              {activeMode === "compare"
                ? "Inspection Comparison Map (Check-Out: Blue / Check-In: Amber)"
                : `Active Mode: ${isCheckOut ? "CHECK-OUT" : "CHECK-IN"} (Click to drop damage marker)`}
            </span>
            <span className="text-[11px] font-mono text-[#df2531] font-bold">
              {currentMarkers.length} Markers Logged
            </span>
          </div>

          {/* Interactive Wireframe SVG Container */}
          <div
            onClick={handleDiagramClick}
            className={cn(
              "relative h-80 w-full rounded-xl bg-[#000000] border border-[#222222] overflow-hidden flex items-center justify-center p-4 select-none",
              activeMode === "compare" ? "cursor-default" : "cursor-crosshair group"
            )}
          >
            {/* Grid Pattern */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: "linear-gradient(to right, #333333 1px, transparent 1px), linear-gradient(to bottom, #333333 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />

            {/* Wireframe 1: Tracked Hydraulic Excavator */}
            {wireframeType === "excavator" && (
              <svg className="h-64 w-auto text-amber-500 pointer-events-none" viewBox="0 0 500 320" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="50" y="240" width="300" height="50" rx="25" stroke="#EAB308" strokeWidth="3" fill="#141414" />
                <circle cx="90" cy="265" r="15" stroke="#EAB308" />
                <circle cx="160" cy="265" r="15" stroke="#EAB308" />
                <circle cx="230" cy="265" r="15" stroke="#EAB308" />
                <circle cx="300" cy="265" r="15" stroke="#EAB308" />
                <path d="M 80 240 L 80 180 L 140 130 L 260 130 L 280 240 Z" stroke="#38BDF8" fill="#0A0A0A" />
                <polygon points="150,140 210,140 200,190 140,190" stroke="#38BDF8" fill="#0284C7" opacity="0.3" />
                <rect x="80" y="160" width="50" height="80" stroke="#EAB308" fill="#252525" />
                <line x1="250" y1="200" x2="350" y2="70" stroke="#EAB308" strokeWidth="6" />
                <circle cx="350" cy="70" r="6" fill="#F59E0B" />
                <line x1="350" y1="70" x2="420" y2="180" stroke="#EAB308" strokeWidth="5" />
                <circle cx="420" cy="180" r="5" fill="#F59E0B" />
                <polygon points="420,180 470,220 440,240 400,210" stroke="#F43F5E" strokeWidth="3" fill="#881337" />
                <line x1="260" y1="160" x2="330" y2="100" stroke="#94A3B8" strokeWidth="3" strokeDasharray="3 3" />
              </svg>
            )}

            {/* Wireframe 2: 4-Door Vehicle */}
            {wireframeType === "car" && (
              <svg className="h-60 w-auto text-blue-400 pointer-events-none" viewBox="0 0 500 240" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M 40 160 L 70 160 L 100 110 L 200 90 L 350 90 L 410 130 L 460 145 L 460 180 L 40 180 Z" stroke="#38BDF8" fill="#0A0A0A" />
                <circle cx="120" cy="180" r="30" stroke="#EAB308" strokeWidth="4" fill="#141414" />
                <circle cx="380" cy="180" r="30" stroke="#EAB308" strokeWidth="4" fill="#141414" />
                <rect x="200" y="100" width="60" height="40" rx="3" stroke="#94A3B8" />
                <rect x="270" y="100" width="70" height="40" rx="3" stroke="#94A3B8" />
                <polygon points="450,150 460,150 460,165 445,160" stroke="#FCDD09" fill="#FCDD09" />
                <rect x="40" y="150" width="8" height="15" stroke="#EF4444" fill="#EF4444" />
              </svg>
            )}

            {/* Markers: Check-Out Markers (Blue) in compare mode */}
            {activeMode === "compare" && chkOutMarkers.map((marker, idx) => (
              <div
                key={`chkout-${marker.id}`}
                style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] bg-blue-600 text-white shadow ring-2 ring-blue-300"
                title={`Check-Out #${idx + 1}: ${marker.partName}`}
              >
                O{idx + 1}
              </div>
            ))}

            {/* Current Markers (or Check-In in compare mode) */}
            {(activeMode === "compare" ? chkInMarkers : currentMarkers).map((marker, idx) => {
              const isSelected = selectedMarker?.id === marker.id;
              const isLeak = marker.severity === "hydraulic_leak";

              return (
                <div
                  key={marker.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMarker(marker);
                  }}
                  style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                  className={cn(
                    "absolute -translate-x-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] cursor-pointer shadow-lg transition-transform",
                    isSelected ? "scale-125 ring-2 ring-white" : "",
                    isLeak
                      ? "bg-rose-600 text-white animate-pulse"
                      : isCheckOut
                      ? "bg-blue-600 text-white"
                      : "bg-amber-500 text-black"
                  )}
                  title={`${marker.partName}: ${marker.notes}`}
                >
                  {activeMode === "compare" ? `I${idx + 1}` : idx + 1}
                </div>
              );
            })}
          </div>

          {/* Front Angle Preview indicator */}
          {frontCarImage && (
            <div className="p-2 rounded-lg bg-[#111111] border border-[#222222] flex items-center gap-3">
              <img src={frontCarImage} alt="Front Thumbnail" className="h-10 w-16 object-cover rounded border border-[#2E2E2E]" />
              <div className="text-[11px] text-neutral-300">
                Front angle photo synchronized as primary vehicle side image.
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Meter Inputs & Selected Damage Pin Editor */}
        <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#222222] space-y-4">
          <div className="font-bold text-white text-sm border-b border-[#222222] pb-2 flex items-center justify-between">
            <span>{isCheckOut ? "Check-Out Log" : "Check-In Log"}</span>
            <span className={cn(
              "text-[10px] font-bold uppercase px-2 py-0.5 rounded",
              isCheckOut ? "bg-blue-500/20 text-blue-300" : "bg-emerald-500/20 text-emerald-300"
            )}>
              {activeMode.replace("_", " ")}
            </span>
          </div>

          {/* Meter & Fuel Reading */}
          <div className="space-y-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div>
              <div className="flex items-center justify-between">
                <label className="font-medium text-slate-300 flex items-center gap-1.5">
                  <Gauge size={14} className="text-amber-400" />
                  {isCheckOut ? "Release" : "Return"} {meterUnit === "odometer_km" ? "Odometer (KM)" : "Engine Hours"}
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Current: {currentMeter}</span>
              </div>
              <input
                type="number"
                value={currentMeterVal}
                onChange={(e) => setCurrentMeterVal(parseFloat(e.target.value))}
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-amber-400 font-bold font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="font-medium text-slate-300 flex items-center gap-1.5">
                  <Fuel size={14} className="text-blue-400" />
                  Fuel Tank Level
                </label>
                <span className="font-mono font-bold text-white">{currentFuelVal}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentFuelVal}
                onChange={(e) => setCurrentFuelVal(parseInt(e.target.value, 10))}
                className="mt-2 w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Damage Pin Editor */}
          {selectedMarker ? (
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 space-y-2.5">
              <div className="flex items-center justify-between font-bold text-white">
                <span>Pin Details</span>
                <button
                  type="button"
                  onClick={() => removeMarker(selectedMarker.id)}
                  className="text-rose-400 hover:text-rose-300"
                  title="Remove Pin"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div>
                <label className="font-medium text-slate-400">Component</label>
                <input
                  type="text"
                  value={selectedMarker.partName}
                  onChange={(e) => {
                    const updated = { ...selectedMarker, partName: e.target.value };
                    setSelectedMarker(updated);
                    setMarkers(currentMarkers.map((m) => (m.id === updated.id ? updated : m)));
                  }}
                  className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-1 text-xs text-white"
                />
              </div>

              <div>
                <label className="font-medium text-slate-400">Severity</label>
                <select
                  value={selectedMarker.severity}
                  onChange={(e) => {
                    const updated = { ...selectedMarker, severity: e.target.value as any };
                    setSelectedMarker(updated);
                    setMarkers(currentMarkers.map((m) => (m.id === updated.id ? updated : m)));
                  }}
                  aria-label="Damage defect severity"
                  className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-1 text-xs text-amber-300"
                >
                  <option value="minor_scratch">Minor Scratch / Paint Scuff</option>
                  <option value="deep_dent">Deep Dent / Metal Deformation</option>
                  <option value="hydraulic_leak">Hydraulic Leak / Fluid Weep</option>
                  <option value="glass_crack">Cabin Glass / Mirror Crack</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-400">Notes</label>
                <textarea
                  rows={2}
                  value={selectedMarker.notes}
                  onChange={(e) => {
                    const updated = { ...selectedMarker, notes: e.target.value };
                    setSelectedMarker(updated);
                    setMarkers(currentMarkers.map((m) => (m.id === updated.id ? updated : m)));
                  }}
                  className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-1 text-xs text-white"
                />
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-slate-900/50 border border-dashed border-slate-800 text-center text-slate-400">
              Tap any pin on the wireframe diagram to inspect or edit damage notes.
            </div>
          )}

          {/* Commit Inspection Button */}
          {activeMode !== "compare" && (
            <button
              type="button"
              onClick={handleSaveInspection}
              disabled={saving}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-white font-bold shadow-lg disabled:opacity-50",
                isCheckOut ? "bg-blue-600 hover:bg-blue-500" : "bg-emerald-600 hover:bg-emerald-500"
              )}
            >
              <Save size={15} />
              {saving
                ? "Saving..."
                : `Commit ${isCheckOut ? "Check-Out" : "Check-In"} & Trigger Meter Sync`}
            </button>
          )}
        </div>
      </div>

      {/* MANDATORY 8-ANGLE WALKAROUND CAMERA VERIFICATION WITH FUNCTIONAL LOCAL UPLOADS */}
      <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#222222] space-y-3">
        <div className="flex items-center justify-between border-b border-[#222222] pb-2">
          <div className="font-bold text-white flex items-center gap-2 font-display">
            <Camera size={16} className="text-[#df2531]" />
            Mandatory 8-Angle Walkaround Camera Verification ({isCheckOut ? "Check-Out" : "Check-In"})
          </div>
          <span className="text-[11px] font-mono text-emerald-400 font-bold">
            {Object.keys(currentPhotos).length}/8 Angles Uploaded from Device
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {angles.map((angle) => {
            const photoUrl = currentPhotos[angle.id];

            return (
              <div
                key={angle.id}
                className={cn(
                  "p-2 rounded-lg border text-center space-y-1.5 transition-all flex flex-col justify-between",
                  photoUrl ? "bg-emerald-950/20 border-emerald-800" : "bg-slate-900 border-dashed border-slate-700"
                )}
              >
                <div className="text-[11px] font-semibold text-white truncate">{angle.label}</div>

                {photoUrl ? (
                  <div className="relative h-16 w-full rounded overflow-hidden border border-slate-700">
                    <img src={photoUrl} alt={angle.label} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        const copy = { ...currentPhotos };
                        delete copy[angle.id];
                        setCurrentPhotos(copy);
                      }}
                      className="absolute top-0.5 right-0.5 bg-rose-600 rounded-full p-0.5 text-white"
                      title="Remove image"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <div className="h-16 w-full rounded bg-slate-950 flex flex-col items-center justify-center text-slate-500">
                    <Camera size={16} />
                    <span className="text-[9px] mt-0.5">Pending</span>
                  </div>
                )}

                {/* Functional Upload Button from Internal Device */}
                <label className="cursor-pointer py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold flex items-center justify-center gap-1">
                  <Upload size={11} />
                  {photoUrl ? "Replace" : "Upload File"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleAngleImageUpload(angle.id, e)}
                  />
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
