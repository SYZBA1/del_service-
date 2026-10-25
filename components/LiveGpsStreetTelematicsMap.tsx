"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ZoomIn,
  ZoomOut,
  Crosshair,
  Layers,
  Navigation,
  Radio,
  MapPin,
  Gauge,
  Key,
  X,
  Check,
  ExternalLink,
  Shield,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface GpsPin {
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
}

interface Props {
  pins: GpsPin[];
  selectedPin: GpsPin | null;
  onSelectPin: (pin: GpsPin) => void;
}

// Preset corridor hubs per Ethiopian logistics grid
export const ETHIOPIAN_HUBS = [
  { name: "Bole Central Yard", coords: [8.9894, 38.7865] as [number, number], desc: "Addis Ababa Central Vehicle Depot" },
  { name: "Kazanchis Hub", coords: [9.0158, 38.7697] as [number, number], desc: "Executive Chauffeur & VIP Hub" },
  { name: "Gotera Interchange", coords: [8.9822, 38.7589] as [number, number], desc: "Ring Road Express Junction" },
  { name: "Kality Heavy Equipment Ring", coords: [8.9125, 38.7611] as [number, number], desc: "Plant Machinery & Logistics Depot" },
  { name: "Mojo Dry Port", coords: [8.5869, 39.1211] as [number, number], desc: "Multi-Modal Freight Rail Corridor" },
  { name: "Adama Expressway Corridor", coords: [8.5410, 39.2689] as [number, number], desc: "East Shewa Fast Highway Corridor" },
];

export default function LiveGpsStreetTelematicsMap({ pins, selectedPin, onSelectPin }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [activeLayer, setActiveLayer] = useState<"streets" | "satellite">("streets");
  const [activeFilter, setActiveFilter] = useState<"all" | "moving" | "idle" | "geofence_breach">("all");

  // API Key & Provider Configuration
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [provider, setProvider] = useState<"google" | "carto" | "esri">("google");
  const [apiKey, setApiKey] = useState("");
  const [tempProvider, setTempProvider] = useState<"google" | "carto" | "esri">("google");
  const [tempApiKey, setTempApiKey] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load saved API key & provider from localStorage or env
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey =
        localStorage.getItem("del_map_api_key") ||
        process.env.NEXT_PUBLIC_MAP_API_KEY ||
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
        process.env.NEXT_PUBLIC_CARTO_API_KEY ||
        "";
      const savedProvider =
        (localStorage.getItem("del_map_provider") as any) || (savedKey ? "carto" : "google");

      setApiKey(savedKey);
      setTempApiKey(savedKey);
      setProvider(savedProvider);
      setTempProvider(savedProvider);
    }
  }, []);

  // Helper to get tile configuration based on provider, layer, and API key
  const getTileConfig = (layer: "streets" | "satellite", prov: "google" | "carto" | "esri", key: string) => {
    if (prov === "carto") {
      const url =
        layer === "streets"
          ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png${key ? `?api_key=${encodeURIComponent(key)}` : ""}`
          : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      return { url, subdomains: "abcd", maxZoom: 19 };
    }

    if (prov === "esri") {
      const url =
        layer === "streets"
          ? "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      return { url, subdomains: [], maxZoom: 18 };
    }

    // Default: Google Maps Tiles (100% Watermark-Free, ultra-crisp Addis Ababa & Shewa coverage)
    const url =
      layer === "streets"
        ? `https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}${key ? `&key=${encodeURIComponent(key)}` : ""}`
        : `https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}${key ? `&key=${encodeURIComponent(key)}` : ""}`;
    return { url, subdomains: ["0", "1", "2", "3"], maxZoom: 20 };
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on Addis Ababa to Shewa Corridor
    const map = L.map(mapContainerRef.current, {
      center: [8.9850, 38.8200],
      zoom: 11,
      minZoom: 8,
      maxZoom: 20,
      zoomControl: false,
      attributionControl: false,
    });

    const initialConfig = getTileConfig(activeLayer, provider, apiKey);
    const tileLayer = L.tileLayer(initialConfig.url, {
      maxZoom: initialConfig.maxZoom,
      subdomains: initialConfig.subdomains as any,
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

    // Add Key Hubs / Landmarks as subtle visual circles
    ETHIOPIAN_HUBS.forEach((hub) => {
      L.circle(hub.coords, {
        radius: 650,
        color: "#df2531",
        weight: 1,
        dashArray: "4, 6",
        fillColor: "#df2531",
        fillOpacity: 0.08,
      }).addTo(map);

      // Mini text marker for Hubs
      const hubLabelIcon = L.divIcon({
        className: "hub-label-icon",
        html: `<div style="
          background: rgba(0,0,0,0.85);
          border: 1px solid rgba(223,37,49,0.35);
          color: #d4d4d4;
          font-family: 'Inter', sans-serif;
          font-size: 9px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 6px;
          white-space: nowrap;
          pointer-events: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.6);
          letter-spacing: 0.5px;
        ">📍 ${hub.name}</div>`,
        iconSize: [0, 0],
        iconAnchor: [40, -10],
      });
      L.marker(hub.coords, { icon: hubLabelIcon, interactive: false }).addTo(map);
    });

    // Addis-Adama Expressway corridor guideline
    const expresswayRoute: [number, number][] = [
      [8.9822, 38.7589], // Gotera
      [8.9125, 38.7611], // Kality
      [8.7512, 38.9814], // Bishoftu
      [8.5869, 39.1211], // Mojo
      [8.5410, 39.2689], // Adama
    ];

    L.polyline(expresswayRoute, {
      color: "#df2531",
      weight: 2,
      opacity: 0.65,
      dashArray: "6, 8",
    }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update tile layer whenever activeLayer, provider, or apiKey changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const config = getTileConfig(activeLayer, provider, apiKey);
    const newLayer = L.tileLayer(config.url, {
      maxZoom: config.maxZoom,
      subdomains: config.subdomains as any,
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newLayer;
  }, [activeLayer, provider, apiKey]);

  // Save Key & Provider settings
  const handleSaveSettings = () => {
    setProvider(tempProvider);
    setApiKey(tempApiKey.trim());
    if (typeof window !== "undefined") {
      localStorage.setItem("del_map_provider", tempProvider);
      localStorage.setItem("del_map_api_key", tempApiKey.trim());
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsKeyModalOpen(false);
    }, 800);
  };

  // Update Markers for Pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    const filteredPins = pins.filter((p) => {
      if (activeFilter === "all") return true;
      return p.location.status === activeFilter;
    });

    filteredPins.forEach((pin) => {
      const isSelected = selectedPin?.id === pin.id;
      const isBreach = pin.location.status === "geofence_breach";
      const isMoving = pin.location.status === "moving";

      // Color scheme
      const statusColor = isBreach ? "#ef4444" : isMoving ? "#10b981" : "#9ca3af";
      const pulseRing = isBreach
        ? `<span style="position: absolute; inset: -4px; border-radius: 9999px; background: rgba(239, 68, 68, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>`
        : isMoving
        ? `<span style="position: absolute; inset: -3px; border-radius: 9999px; background: rgba(16, 185, 129, 0.35); animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></span>`
        : "";

      const borderColor = isSelected ? "#df2531" : isBreach ? "#ef4444" : "rgba(255,255,255,0.2)";
      const glow = isSelected ? "box-shadow: 0 0 16px rgba(223,37,49,0.85);" : "box-shadow: 0 4px 12px rgba(0,0,0,0.7);";

      const iconHtml = `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          gap: 6px;
          background: #0a0a0a;
          border: 1.5px solid ${borderColor};
          padding: 3px 8px;
          border-radius: 12px;
          cursor: pointer;
          transform: translate(-50%, -50%);
          white-space: nowrap;
          ${glow}
          transition: all 0.2s ease-in-out;
        ">
          ${pulseRing}
          <span style="
            width: 8px;
            height: 8px;
            border-radius: 9999px;
            background: ${statusColor};
            display: inline-block;
            flex-shrink: 0;
          "></span>
          <span style="
            font-family: 'Inter', sans-serif;
            font-size: 11px;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: 0.3px;
          ">${pin.plateNumber || pin.assetName}</span>
          <span style="
            font-family: 'Inter', monospace;
            font-size: 9px;
            font-weight: 700;
            background: ${isMoving ? "rgba(16, 185, 129, 0.2)" : "rgba(255,255,255,0.08)"};
            color: ${isMoving ? "#34d399" : "#9ca3af"};
            padding: 1px 4px;
            border-radius: 4px;
          ">${pin.location.speed} km/h</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-telematics-pin",
        html: iconHtml,
        iconSize: [0, 0],
      });

      const marker = L.marker([pin.location.lat, pin.location.lng], {
        icon: customIcon,
      }).addTo(map);

      // Popup Content (crisp dark theme, no red text on body/specs)
      const popupHtml = `
        <div style="
          background: #0a0a0a;
          color: #f3f4f6;
          font-family: 'Inter', sans-serif;
          padding: 12px;
          border-radius: 14px;
          min-width: 240px;
          border: 1px solid rgba(223,37,49,0.4);
        ">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #262626; padding-bottom: 8px; margin-bottom: 8px;">
            <div style="font-family: 'Oswald', sans-serif; font-size: 14px; font-weight: 700; color: #ffffff; text-transform: uppercase;">
              ${pin.assetName}
            </div>
            <span style="
              font-size: 9px;
              font-weight: 800;
              text-transform: uppercase;
              padding: 2px 6px;
              border-radius: 6px;
              background: ${isBreach ? "rgba(239,68,68,0.2)" : isMoving ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.1)"};
              color: ${isBreach ? "#f87171" : isMoving ? "#34d399" : "#d1d5db"};
            ">${pin.location.status.replace("_", " ")}</span>
          </div>

          <div style="font-size: 11px; color: #d1d5db; line-height: 1.5; margin-bottom: 6px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: #9ca3af;">Plate / ID:</span>
              <strong style="color: #ffffff; font-family: monospace;">${pin.plateNumber}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: #9ca3af;">Operator:</span>
              <strong style="color: #ffffff;">${pin.operatorName || "Certified Driver"}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: #9ca3af;">Live Speed:</span>
              <strong style="color: ${isMoving ? "#34d399" : "#d1d5db"}; font-family: monospace;">${pin.location.speed} km/h</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: #9ca3af;">Odometer / Hours:</span>
              <strong style="color: #ffffff; font-family: monospace;">${pin.meterReading} ${pin.meterUnit === "odometer_km" ? "KM" : "Hrs"}</strong>
            </div>
          </div>

          <div style="font-size: 10px; color: #9ca3af; background: #141414; padding: 6px 8px; border-radius: 8px; border: 1px solid #262626; display: flex; align-items: center; gap: 4px;">
            <span>📍</span>
            <span style="color: #f3f4f6;">${pin.location.address}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: "custom-leaflet-popup",
        closeButton: false,
        offset: [0, -10],
      });

      marker.on("click", () => {
        onSelectPin(pin);
        map.flyTo([pin.location.lat, pin.location.lng], 14, { duration: 0.7 });
      });

      markersRef.current.set(pin.id, marker);
    });
  }, [pins, selectedPin, activeFilter, onSelectPin]);

  // When selectedPin changes from outside, pan & open popup
  useEffect(() => {
    if (!selectedPin || !mapInstanceRef.current) return;
    const marker = markersRef.current.get(selectedPin.id);
    if (marker) {
      mapInstanceRef.current.flyTo([selectedPin.location.lat, selectedPin.location.lng], 14, {
        duration: 0.6,
      });
      marker.openPopup();
    }
  }, [selectedPin]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleResetCenter = () => {
    mapInstanceRef.current?.flyTo([8.9850, 38.8200], 11, { duration: 0.8 });
  };

  return (
    <div className="relative h-[430px] w-full rounded-2xl overflow-hidden border border-neutral-800 bg-[#050505]">
      {/* Real Map Canvas */}
      <div ref={mapContainerRef} className="h-full w-full z-0" />

      {/* Top Left: Region Legend Pill */}
      <div className="absolute top-3.5 left-3.5 z-20 flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-2 bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-neutral-800 shadow-xl">
          <span className="h-2 w-2 rounded-full bg-[#df2531] shadow-[0_0_8px_#df2531]" />
          <span className="text-[11px] font-bold text-white tracking-wide uppercase font-display">
            Addis Ababa & Shewa Corridor GPS
          </span>
          <span className="text-[9px] font-mono text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
            {pins.length} Teltonika Nodes
          </span>
        </div>
      </div>

      {/* Top Right: Street/Satellite Toggle & Zoom Controls & API Key Config */}
      <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5 bg-black/90 backdrop-blur-md p-1 rounded-xl border border-neutral-800 shadow-xl">
        {/* API Key / Provider Setup Button */}
        <button
          type="button"
          onClick={() => {
            setTempApiKey(apiKey);
            setTempProvider(provider);
            setIsKeyModalOpen(true);
          }}
          className={cn(
            "px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all",
            apiKey
              ? "bg-emerald-950/80 border border-emerald-500/50 text-emerald-300"
              : "bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white"
          )}
          title="Configure Map Engine & Enter API Key"
        >
          <Key size={12} className={apiKey ? "text-emerald-400" : "text-amber-400"} />
          <span className="hidden sm:inline">
            {apiKey ? "API Key Active" : "Set API Key"}
          </span>
        </button>

        <div className="h-4 w-px bg-neutral-800 mx-0.5" />

        {/* Street vs Satellite */}
        <button
          type="button"
          onClick={() => setActiveLayer((l) => (l === "streets" ? "satellite" : "streets"))}
          className={cn(
            "px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all",
            activeLayer === "streets"
              ? "bg-[#df2531] text-white shadow-sm shadow-[#df2531]/40"
              : "bg-neutral-900 text-neutral-300 hover:text-white"
          )}
          title="Toggle Street / Satellite View"
        >
          <Layers size={12} />
          <span className="capitalize">{activeLayer}</span>
        </button>

        <div className="h-4 w-px bg-neutral-800 mx-0.5" />

        <button
          type="button"
          onClick={handleZoomIn}
          className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={14} />
        </button>

        <button
          type="button"
          onClick={handleZoomOut}
          className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={14} />
        </button>

        <button
          type="button"
          onClick={handleResetCenter}
          className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
          title="Reset Corridor Center"
        >
          <Crosshair size={14} />
        </button>
      </div>

      {/* Bottom Left Quick Filter Chips */}
      <div className="absolute bottom-3.5 left-3.5 z-20 flex items-center gap-1.5 bg-black/90 backdrop-blur-md p-1 rounded-xl border border-neutral-800 shadow-xl">
        <button
          type="button"
          onClick={() => setActiveFilter("all")}
          className={cn(
            "px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all",
            activeFilter === "all" ? "bg-[#df2531] text-white" : "text-neutral-400 hover:text-neutral-200"
          )}
        >
          All ({pins.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("moving")}
          className={cn(
            "px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1",
            activeFilter === "moving" ? "bg-emerald-600 text-white" : "text-emerald-400 hover:text-emerald-300"
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Moving ({pins.filter((p) => p.location.status === "moving").length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("idle")}
          className={cn(
            "px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1",
            activeFilter === "idle" ? "bg-neutral-700 text-white" : "text-neutral-400 hover:text-neutral-200"
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
          Idle ({pins.filter((p) => p.location.status === "idle").length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("geofence_breach")}
          className={cn(
            "px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1",
            activeFilter === "geofence_breach" ? "bg-rose-600 text-white" : "text-rose-400 hover:text-rose-300"
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          Breach ({pins.filter((p) => p.location.status === "geofence_breach").length})
        </button>
      </div>

      {/* API Key & Map Provider Modal */}
      {isKeyModalOpen && (
        <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-[#df2531]/40 rounded-2xl shadow-2xl p-5 text-xs text-white space-y-4 animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#df2531]/20 text-[#df2531]">
                  <Key size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm font-display">Map Provider & API Key Setup</h3>
                  <p className="text-[10px] text-neutral-400">Configure map tile source & authorization</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsKeyModalOpen(false)}
                className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X size={15} />
              </button>
            </div>

            {/* Provider Options */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Choose Map Tile Engine
              </label>

              <div className="space-y-1.5">
                {/* Google Maps (Default / Clean) */}
                <div
                  onClick={() => setTempProvider("google")}
                  className={cn(
                    "p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between",
                    tempProvider === "google"
                      ? "bg-[#df2531]/15 border-[#df2531] text-white"
                      : "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                  )}
                >
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <span>Google Maps (Street & Hybrid Satellite)</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800/60">
                        Zero Watermark
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      Works instantly with zero watermark, or with an optional Google Maps API key.
                    </p>
                  </div>
                  <div
                    className={cn(
                      "h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ml-2",
                      tempProvider === "google" ? "border-[#df2531] bg-[#df2531]" : "border-neutral-600"
                    )}
                  >
                    {tempProvider === "google" && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                </div>

                {/* CARTO Dark Matter */}
                <div
                  onClick={() => setTempProvider("carto")}
                  className={cn(
                    "p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between",
                    tempProvider === "carto"
                      ? "bg-[#df2531]/15 border-[#df2531] text-white"
                      : "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                  )}
                >
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <span>CARTO Dark Matter</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 font-bold border border-amber-800/60">
                        Requires Free Key
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      Requires free API key from <span className="text-amber-400 underline">carto.com/basemaps/apikey</span> to clear watermark.
                    </p>
                  </div>
                  <div
                    className={cn(
                      "h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ml-2",
                      tempProvider === "carto" ? "border-[#df2531] bg-[#df2531]" : "border-neutral-600"
                    )}
                  >
                    {tempProvider === "carto" && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                </div>

                {/* Esri Dark Canvas */}
                <div
                  onClick={() => setTempProvider("esri")}
                  className={cn(
                    "p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between",
                    tempProvider === "esri"
                      ? "bg-[#df2531]/15 border-[#df2531] text-white"
                      : "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                  )}
                >
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <span>Esri Dark Matter & Satellite</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800/60">
                        100% Free
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      High-contrast dark gray street canvas. No API key or signup needed.
                    </p>
                  </div>
                  <div
                    className={cn(
                      "h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ml-2",
                      tempProvider === "esri" ? "border-[#df2531] bg-[#df2531]" : "border-neutral-600"
                    )}
                  >
                    {tempProvider === "esri" && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              </div>
            </div>

            {/* API Key Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  {tempProvider === "carto"
                    ? "CARTO API Key"
                    : tempProvider === "google"
                    ? "Google Maps API Key (Optional)"
                    : "Custom API Key (Optional)"}
                </label>
                {tempProvider === "carto" && (
                  <a
                    href="https://carto.com/basemaps/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-[#df2531] hover:underline flex items-center gap-0.5"
                  >
                    Get Free Carto Key
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>

              <input
                type="text"
                placeholder={
                  tempProvider === "carto"
                    ? "Paste your Carto API Key (e.g. default_public...)"
                    : tempProvider === "google"
                    ? "Paste AIzaSy... or leave blank for instant free access"
                    : "Leave blank for free Esri Dark Matter"
                }
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-[#df2531]"
              />

              <p className="text-[9px] text-neutral-500 leading-relaxed">
                Tip: You can also set <code className="text-neutral-400 font-mono">NEXT_PUBLIC_MAP_API_KEY="..."</code> in your <code className="text-neutral-400 font-mono">.env.local</code> file for permanent configuration.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setTempApiKey("");
                  setTempProvider("google");
                }}
                className="text-[11px] text-neutral-400 hover:text-white underline cursor-pointer"
              >
                Reset to Google Maps
              </button>

              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-4 py-2 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#df2531]/30 active:scale-95 transition-all font-display"
              >
                {saveSuccess ? (
                  <>
                    <Check size={14} />
                    Saved & Active!
                  </>
                ) : (
                  "Save & Apply Map Engine"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
