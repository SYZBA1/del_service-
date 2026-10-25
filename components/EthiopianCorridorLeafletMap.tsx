"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Navigation,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const ADDIS_DEPOT_COORDS: [number, number] = [8.9894, 38.7865]; // Bole Central Yard / Addis Depot

export interface EthiopianDestinationWithCoords {
  id: string;
  name: string;
  region: string;
  oneWayKm: number;
  roundTripKm: number;
  estDriveHours: number;
  roadType: string;
  securityStatus: "cleared" | "caution";
  coords: [number, number];
}

interface Props {
  activeDest: EthiopianDestinationWithCoords;
  corridors: EthiopianDestinationWithCoords[];
  onSelectDestination: (id: string) => void;
  className?: string;
}

export default function EthiopianCorridorLeafletMap({
  activeDest,
  corridors,
  onSelectDestination,
  className,
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const glowPolylineRef = useRef<L.Polyline | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const depotMarkerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [activeLayer, setActiveLayer] = useState<"streets" | "satellite">("streets");
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Prevent re-initialization if map already exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: ADDIS_DEPOT_COORDS,
      zoom: 9,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
    });

    mapInstanceRef.current = map;

    // Default: Google Street Tiles (Addis Ababa & Shewa coverage)
    const streetUrl = "https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
    const tileLayer = L.tileLayer(streetUrl, {
      subdomains: ["0", "1", "2", "3"],
      maxZoom: 20,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Addis Ababa Depot Marker
    const depotIcon = L.divIcon({
      className: "custom-depot-marker",
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute -inset-2 rounded-full bg-[#df2531]/30 animate-ping"></div>
          <div class="relative h-7 w-7 rounded-full bg-[#df2531] border-2 border-white shadow-xl flex items-center justify-center text-white text-[11px] font-black">
            ★
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const depotMarker = L.marker(ADDIS_DEPOT_COORDS, { icon: depotIcon })
      .addTo(map)
      .bindTooltip("★ ADDIS ABABA CENTRAL YARD (DEPOT)", {
        permanent: true,
        direction: "top",
        offset: [0, -16],
        className: "bg-black/90 text-white font-bold text-[10px] px-2 py-0.5 rounded border border-[#df2531]/40 shadow-lg",
      });

    depotMarkerRef.current = depotMarker;

    setIsMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      setIsMapReady(false);
    };
  }, []);

  // 2. Handle Layer Switching (Street vs Satellite)
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    const newUrl =
      activeLayer === "streets"
        ? "https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        : "https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}";

    const newTileLayer = L.tileLayer(newUrl, {
      subdomains: ["0", "1", "2", "3"],
      maxZoom: 20,
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTileLayer;
  }, [activeLayer]);

  // 3. Render Corridors, Active Destination, Route Polyline & Auto-Fit Bounds
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;
    const map = mapInstanceRef.current;

    // Clear existing destination markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // Render Corridor Markers
    corridors.forEach((c) => {
      const isSelected = activeDest.id === c.id;

      const markerHtml = isSelected
        ? `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="absolute -inset-3 rounded-full bg-[#df2531]/40 animate-ping"></div>
            <div class="relative h-8 w-8 rounded-full bg-[#df2531] border-2 border-white shadow-2xl flex items-center justify-center text-white text-xs font-black">
              📍
            </div>
          </div>
        `
        : `
          <div class="relative flex items-center justify-center cursor-pointer group hover:scale-110 transition-transform">
            <div class="h-5 w-5 rounded-full bg-[#262626] border-2 border-neutral-400 hover:border-[#df2531] shadow flex items-center justify-center text-white text-[9px] font-bold">
              •
            </div>
          </div>
        `;

      const customIcon = L.divIcon({
        className: `corridor-marker-${c.id}`,
        html: markerHtml,
        iconSize: isSelected ? [32, 32] : [20, 20],
        iconAnchor: isSelected ? [16, 16] : [10, 10],
      });

      const marker = L.marker(c.coords, { icon: customIcon })
        .addTo(map)
        .bindTooltip(
          `<strong>${c.name.split(" ")[0]}</strong> (${c.oneWayKm} km)`,
          {
            permanent: isSelected,
            direction: "top",
            offset: [0, isSelected ? -18 : -12],
            className: isSelected
              ? "bg-[#df2531] text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-lg border border-white/40"
              : "bg-neutral-900 text-neutral-300 font-medium text-[9px] px-1.5 py-0.5 rounded border border-neutral-700",
          }
        );

      marker.on("click", () => {
        onSelectDestination(c.id);
      });

      markersRef.current.set(c.id, marker);
    });

    // Update Route Polylines
    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }
    if (glowPolylineRef.current) {
      glowPolylineRef.current.remove();
      glowPolylineRef.current = null;
    }

    const routeCoords: [number, number][] = [ADDIS_DEPOT_COORDS, activeDest.coords];

    // Ambient Glow under polyline
    const glowLine = L.polyline(routeCoords, {
      color: "#df2531",
      weight: 8,
      opacity: 0.3,
      lineCap: "round",
    }).addTo(map);
    glowPolylineRef.current = glowLine;

    // Glowing Crimson Dash Corridor Line
    const mainLine = L.polyline(routeCoords, {
      color: "#df2531",
      weight: 3.5,
      opacity: 0.95,
      dashArray: "6, 8",
      lineCap: "round",
    }).addTo(map);
    routePolylineRef.current = mainLine;

    // Smoothly fit bounds to encompass Addis Depot & the selected corridor
    const bounds = L.latLngBounds([ADDIS_DEPOT_COORDS, activeDest.coords]);
    map.fitBounds(bounds, {
      padding: [45, 45],
      maxZoom: 13,
      animate: true,
    });
  }, [activeDest, corridors, isMapReady, onSelectDestination]);

  // Center & Reset View Helper
  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    const bounds = L.latLngBounds([ADDIS_DEPOT_COORDS, activeDest.coords]);
    mapInstanceRef.current.fitBounds(bounds, {
      padding: [45, 45],
      maxZoom: 13,
      animate: true,
    });
  };

  return (
    <div className={cn("relative w-full rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950", className)}>
      {/* Top Floating Corridor Status Badge */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-[400] flex items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 font-bold text-white bg-black/85 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-neutral-800 shadow-lg text-[11px] pointer-events-auto">
          <Navigation size={13} className="text-[#df2531]" />
          <span>Route: Addis Ababa Central Yard → {activeDest.name.split(" ")[0]}</span>
        </div>

        <span className="text-[10px] text-emerald-400 bg-emerald-950/85 backdrop-blur-md border border-emerald-500/40 px-2.5 py-1 rounded-lg font-mono flex items-center gap-1 shadow pointer-events-auto">
          <ShieldCheck size={11} /> ERA Weight Station Cleared
        </span>
      </div>

      {/* Floating Controls (Street/Satellite + Zoom) */}
      <div className="absolute bottom-3 right-3 z-[400] flex flex-col gap-1.5 pointer-events-auto">
        <div className="flex items-center bg-black/85 backdrop-blur-md rounded-xl p-0.5 border border-neutral-800 shadow-xl">
          <button
            type="button"
            onClick={() => setActiveLayer("streets")}
            className={cn(
              "px-2 py-1 text-[10px] font-bold rounded-lg transition-all",
              activeLayer === "streets"
                ? "bg-[#df2531] text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            )}
          >
            Streets
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer("satellite")}
            className={cn(
              "px-2 py-1 text-[10px] font-bold rounded-lg transition-all",
              activeLayer === "satellite"
                ? "bg-[#df2531] text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            )}
          >
            Satellite
          </button>
        </div>

        <div className="flex flex-col bg-black/85 backdrop-blur-md rounded-xl border border-neutral-800 shadow-xl overflow-hidden">
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors border-b border-neutral-800"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors border-b border-neutral-800"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            type="button"
            onClick={handleResetView}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Center Corridor Route"
          >
            <Crosshair size={14} />
          </button>
        </div>
      </div>

      {/* Leaflet Map Div */}
      <div ref={mapContainerRef} className="w-full h-72 sm:h-80 z-0 select-none" />
    </div>
  );
}
