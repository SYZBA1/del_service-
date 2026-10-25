"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Truck,
  Plus,
  Filter,
  Search,
  Layers,
  Wrench,
  Fuel,
  Gauge,
  Calendar,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  Car,
  Eye,
  Camera,
  ShieldCheck,
  MapPin,
  Sparkles,
  Pencil,
  Trash2,
  Upload,
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { Asset, Images8Sides } from "@/lib/types";
import { formatETB, cn } from "@/lib/utils";
import { PolymorphicAssetForm } from "@/components/PolymorphicAssetForm";
import { DalolComingSoon } from "@/components/DalolComingSoon";

export default function FleetRegistryPage() {
  const { activeTenantId, searchQuery: globalSearch, currentUser } = useTenant();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMainCategory, setActiveMainCategory] = useState<"all" | "cars" | "machinery">("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [localSearch, setLocalSearch] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<Asset | null>(null);
  const [activeGalleryAngle, setActiveGalleryAngle] = useState<string>("front");

  // Edit State
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete State
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Success Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (currentUser?.role === "dalol_admin") {
    return (
      <div className="p-8">
        <DalolComingSoon
          moduleName="Dalol Logistics Fleet & Lowbed Registry"
          description="Dalol heavy transport dispatch, low-bed multi-axle freight trailers, and specialized regional logistical hauling are currently in deployment."
        />
      </div>
    );
  }

  const sides = [
    { id: "front", label: "Front" },
    { id: "front_right", label: "Front-Right" },
    { id: "right_side", label: "Right Profile" },
    { id: "rear_right", label: "Rear-Right" },
    { id: "rear", label: "Rear" },
    { id: "rear_left", label: "Rear-Left" },
    { id: "left_side", label: "Left Profile" },
    { id: "cabin_interior", label: "Cabin / Cockpit" },
  ];

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/assets?ownerId=${activeTenantId}`);
      const json = await res.json();
      if (json.success) {
        setAssets(json.data);
      }
    } catch (e) {
      console.error("Failed to load assets", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [activeTenantId]);

  // Open Edit Modal
  const handleOpenEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setEditForm({
      id: asset.id,
      make: asset.make,
      model: asset.model,
      manufactureYear: asset.manufactureYear,
      plateNumber: asset.plateNumber || "",
      chassisOrSerialNumber: asset.chassisOrSerialNumber,
      condition: asset.condition || "excellent",
      status: asset.status,
      currentMeterReading: asset.currentMeterReading,
      primaryImageUrl: asset.primaryImageUrl || asset.images8Sides?.front || "",
      images8Sides: asset.images8Sides ? { ...asset.images8Sides } : {},
      rateCard: {
        dailyRate: asset.rateCard?.dailyRate || 8000,
        securityDepositAmount: asset.rateCard?.securityDepositAmount || 30000,
        overtimeRatePerUnit: asset.rateCard?.overtimeRatePerUnit || 35,
        defaultMobilizationFee: asset.rateCard?.defaultMobilizationFee || 0,
      },
    });
  };

  // Image Upload handler for Edit Modal
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: "primary" | string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (target === "primary") {
        setEditForm((prev: any) => ({
          ...prev,
          primaryImageUrl: dataUrl,
          images8Sides: {
            ...prev.images8Sides,
            front: dataUrl,
          },
        }));
      } else {
        setEditForm((prev: any) => ({
          ...prev,
          images8Sides: {
            ...prev.images8Sides,
            [target]: dataUrl,
          },
          ...(target === "front" ? { primaryImageUrl: dataUrl } : {}),
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Edit
  const handleSaveEdit = async () => {
    if (!editingAsset) return;
    setIsSavingEdit(true);

    try {
      const res = await fetch("/api/v1/assets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update asset");

      setToastMessage(`Asset '${editForm.make} ${editForm.model}' updated successfully!`);
      setEditingAsset(null);
      fetchAssets();
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Asset
  const handleDeleteAsset = async () => {
    if (!assetToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/v1/assets?id=${assetToDelete.id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete asset");

      setToastMessage(`Asset '${assetToDelete.make} ${assetToDelete.model}' deleted from Fleet Registry.`);
      setAssetToDelete(null);
      fetchAssets();
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Combined Search
  const query = (localSearch || globalSearch).toLowerCase().trim();

  // Filter Assets
  const filteredAssets = assets.filter((a) => {
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (query) {
      const matchMake = a.make.toLowerCase().includes(query);
      const matchModel = a.model.toLowerCase().includes(query);
      const matchPlate = (a.plateNumber || "").toLowerCase().includes(query);
      const matchChassis = a.chassisOrSerialNumber.toLowerCase().includes(query);
      const matchOwner = (a.owner?.companyName || "").toLowerCase().includes(query);
      if (!matchMake && !matchModel && !matchPlate && !matchChassis && !matchOwner) return false;
    }
    return true;
  });

  // Separate Lists
  const carsList = filteredAssets.filter(
    (a) => a.category === "passenger_car" || a.category === "commercial_van"
  );
  const machineryList = filteredAssets.filter(
    (a) => a.category === "heavy_machinery" || a.category === "power_equipment" || a.category === "attachment"
  );

  const renderAssetTable = (title: string, icon: any, list: Asset[], badgeText: string) => {
    const IconComp = icon;

    if (list.length === 0) {
      return (
        <div className="p-8 text-center bg-[#0a0a0a] border border-neutral-800 rounded-2xl text-neutral-400 text-xs">
          No assets found matching the criteria in {title}.
        </div>
      );
    }

    return (
      <div className="bg-[#0a0a0a] rounded-2xl border border-[#df2531]/30 overflow-hidden shadow-xl space-y-2">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconComp size={18} className="text-[#df2531]" />
            <h3 className="font-bold text-white text-sm font-display">{title}</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-900 text-neutral-300 font-bold border border-neutral-800">
              {list.length} Units
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">{badgeText}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-black text-[10px] uppercase text-neutral-400 font-mono border-b border-neutral-800">
              <tr>
                <th className="px-4 py-3">Photo & Machine Model</th>
                <th className="px-4 py-3">Plate / Serial & Libre</th>
                <th className="px-4 py-3">Meter & Interval</th>
                <th className="px-4 py-3">Rate Card (ETB)</th>
                <th className="px-4 py-3">Specs / Auxiliary</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-medium">
              {list.map((asset) => {
                const isMach = asset.category === "heavy_machinery" || asset.category === "power_equipment";
                const photo = asset.primaryImageUrl || asset.images8Sides?.front;

                return (
                  <tr
                    key={asset.id}
                    className="hover:bg-neutral-900/60 transition-colors group"
                  >
                    {/* Machine Model + Photo */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-16 rounded-lg bg-black border border-neutral-800 overflow-hidden relative shrink-0 flex items-center justify-center">
                          {photo ? (
                            <img src={photo} alt={asset.model} className="h-full w-full object-cover" />
                          ) : (
                            <Camera size={18} className="text-neutral-600" />
                          )}
                          <span className="absolute bottom-0.5 right-0.5 text-[8px] bg-black/80 px-1 rounded text-neutral-300 font-mono">
                            8-Side
                          </span>
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-1.5 font-display">
                            {asset.make} {asset.model}
                            <span className="text-[10px] text-neutral-400 font-mono">({asset.manufactureYear})</span>
                          </div>
                          <div className="text-[10px] text-neutral-400 flex items-center gap-2">
                            <span>Owner: <strong className="text-neutral-200">{asset.owner?.companyName || "DEL Internal"}</strong></span>
                            {asset.partnerInfo && (
                              <span className="text-neutral-300 font-semibold">• P2P Host</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Plate / Serial */}
                    <td className="px-4 py-3 font-mono">
                      <div className="font-bold text-white text-xs">
                        {asset.plateNumber || asset.chassisOrSerialNumber}
                      </div>
                      <div className="text-[10px] text-neutral-400 flex items-center gap-1">
                        <span>VIN: {asset.chassisOrSerialNumber.slice(0, 10)}...</span>
                        {asset.condition && (
                          <span className="text-[10px] text-emerald-400 font-medium capitalize">
                            ★ {asset.condition.replace("_", " ")}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Meter Reading */}
                    <td className="px-4 py-3 font-mono">
                      <div className="font-bold text-white text-sm font-display">
                        {asset.currentMeterReading} {asset.meterUnit === "odometer_km" ? "KM" : asset.meterUnit === "engine_hours" ? "Hrs" : "Days"}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {asset.meterUnit === "odometer_km" ? "200 KM included" : "8h Daily Cap"}
                      </div>
                    </td>

                    {/* Rate */}
                    <td className="px-4 py-3 font-mono">
                      <div className="font-bold text-emerald-400 text-sm font-display">
                        {formatETB(asset.rateCard?.dailyRate || 0)}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        Deposit: {formatETB(asset.rateCard?.securityDepositAmount || 0)}
                      </div>
                    </td>

                    {/* Polymorphic Specs */}
                    <td className="px-4 py-3 text-[11px]">
                      {isMach ? (
                        <div className="space-y-0.5">
                          <div>Weight: <span className="text-white font-semibold">{asset.specs.operatingWeightTons || 20}t</span></div>
                          <div className="text-neutral-300">Aux Hydraulic: {asset.specs.hydraulicAuxLines ? "Connected" : "None"}</div>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="capitalize">{asset.specs.transmission || "Auto"} • {asset.specs.fuelType || "Diesel"}</div>
                          <div className="text-neutral-400">{asset.specs.seats || 5} Seats • {asset.specs.driveType || "4x4"}</div>
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                          asset.status === "available"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : asset.status === "on_rent"
                            ? "bg-[#df2531]/20 text-[#df2531] border border-[#df2531]/40"
                            : "bg-[#df2531]/30 text-white border border-[#df2531]/60 animate-pulse"
                        )}
                      >
                        {asset.status.replace("_", " ")}
                      </span>
                    </td>

                    {/* Actions: Full Detailed Inspector + EDIT + DELETE */}
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAssetDetail(asset);
                            setActiveGalleryAngle("front");
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#df2531]/15 hover:bg-[#df2531]/25 text-[#df2531] font-bold border border-[#df2531]/30 text-xs shadow-sm transition-all font-display"
                          title="View 8-Sides and Technical Specs"
                        >
                          <Eye size={12} />
                          Details
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(asset);
                          }}
                          className="p-1.5 rounded-lg bg-neutral-900 hover:bg-[#df2531]/20 text-neutral-300 hover:text-[#df2531] border border-neutral-800 hover:border-[#df2531]/40 transition-colors"
                          title="Edit Asset Details & Photos"
                        >
                          <Pencil size={13} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAssetToDelete(asset);
                          }}
                          className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-rose-400 border border-neutral-800 hover:border-rose-700/50 transition-colors"
                          title="Delete Asset from Fleet"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-[#0a0a0a] border border-[#df2531]/30 shadow-lg">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 font-display">
            <Truck className="text-[#df2531]" size={24} />
            Fleet Registry & Polymorphic Asset Catalog
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Separately categorized catalog for Passenger Cars and Heavy Machinery, with 8-angle photogrammetry and technical specifications.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/partners"
            className="flex items-center gap-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-[#df2531]/40 text-neutral-300 font-bold px-3.5 py-2 text-xs transition-all"
          >
            P2P Host Onboarding
          </Link>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold px-4 py-2 text-xs shadow-md shadow-[#df2531]/30 border border-[#df2531]/50 transition-all font-display"
          >
            <Plus size={16} />
            Onboard Internal Asset
          </button>
        </div>
      </div>

      {/* Main Category Tabs & Status Filters */}
      <div className="bg-[#0a0a0a] p-4 rounded-xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {[
            { id: "all", label: "All Fleet Assets", count: assets.length },
            { id: "cars", label: "Passenger Cars & 4x4 SUVs", count: carsList.length },
            { id: "machinery", label: "Heavy Construction Machinery", count: machineryList.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveMainCategory(tab.id as any)}
              className={cn(
                "px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2",
                activeMainCategory === tab.id
                  ? "bg-[#df2531] text-white shadow-md border border-[#df2531]/50 font-display"
                  : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800"
              )}
            >
              <span>{tab.label}</span>
              <span className={cn(
                "px-1.5 py-0.2 rounded text-[10px] font-mono",
                activeMainCategory === tab.id ? "bg-black text-[#df2531] font-bold" : "bg-neutral-800 text-neutral-400"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            aria-label="Filter status for assets"
            className="rounded-xl bg-black border border-neutral-800 px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-[#df2531]"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="on_rent">On Rent</option>
            <option value="maintenance">Maintenance Locked</option>
          </select>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
            <input
              type="text"
              placeholder="Search make, model, plate..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="rounded-xl bg-black border border-neutral-800 pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#df2531] w-52 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Render Category Tables */}
      {loading ? (
        <div className="p-12 text-center text-neutral-400 text-xs">Loading Ethiopian fleet registry...</div>
      ) : (
        <div className="space-y-6">
          {(activeMainCategory === "all" || activeMainCategory === "machinery") && (
            renderAssetTable(
              "Heavy Construction Machinery & Earthmoving",
              Truck,
              machineryList,
              "Civil Infrastructure & Mining Class"
            )
          )}

          {(activeMainCategory === "all" || activeMainCategory === "cars") && (
            renderAssetTable(
              "Passenger Cars, Executive Sedans & 4x4 SUVs",
              Car,
              carsList,
              "Urban & Regional Mobility Fleet"
            )
          )}
        </div>
      )}

      {/* MODAL 1: EDIT ASSET WITH IMAGE UPLOADS */}
      {editingAsset && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0a0a0a] border border-[#df2531]/40 rounded-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl text-xs text-neutral-200 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2 font-display">
                  <Pencil className="text-[#df2531]" size={18} />
                  Edit Asset: {editingAsset.make} {editingAsset.model}
                </h2>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Update asset specifications, status, daily pricing, and device image uploads.
                </p>
              </div>
              <button
                onClick={() => setEditingAsset(null)}
                className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Primary Photo Uploader */}
              <div className="p-4 rounded-xl bg-black border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white font-display">Primary Vehicle Photo</span>
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-[#df2531]/15 hover:bg-[#df2531]/25 text-[#df2531] font-bold border border-[#df2531]/40 text-[11px] flex items-center gap-1.5 transition-all font-display">
                    <Upload size={13} />
                    Upload from Device
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, "primary")}
                    />
                  </label>
                </div>

                <div className="h-32 w-full rounded-lg bg-neutral-950 border border-neutral-800 overflow-hidden flex items-center justify-center">
                  {editForm.primaryImageUrl ? (
                    <img src={editForm.primaryImageUrl} alt="Asset preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={24} className="text-neutral-600" />
                  )}
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-neutral-400">Make / Manufacturer</label>
                  <input
                    type="text"
                    value={editForm.make}
                    onChange={(e) => setEditForm({ ...editForm, make: e.target.value })}
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-white focus:outline-none focus:border-[#df2531]"
                  />
                </div>
                <div>
                  <label className="font-medium text-neutral-400">Model Name</label>
                  <input
                    type="text"
                    value={editForm.model}
                    onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-white focus:outline-none focus:border-[#df2531]"
                  />
                </div>
                <div>
                  <label className="font-medium text-neutral-400">Manufacture Year</label>
                  <input
                    type="number"
                    value={editForm.manufactureYear}
                    onChange={(e) => setEditForm({ ...editForm, manufactureYear: parseInt(e.target.value, 10) })}
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-white font-mono focus:outline-none focus:border-[#df2531]"
                  />
                </div>
                <div>
                  <label className="font-medium text-neutral-400">Plate Number</label>
                  <input
                    type="text"
                    value={editForm.plateNumber}
                    onChange={(e) => setEditForm({ ...editForm, plateNumber: e.target.value })}
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-[#df2531]"
                  />
                </div>
              </div>

              {/* Status & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-medium text-neutral-400">Fleet Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-white font-semibold focus:outline-none focus:border-[#df2531]"
                  >
                    <option value="available">Available</option>
                    <option value="on_rent">On Rent</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="in_transit">In Transit</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-neutral-400">Physical Condition</label>
                  <select
                    value={editForm.condition}
                    onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-white font-semibold capitalize focus:outline-none focus:border-[#df2531]"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-neutral-400">Daily Rate (ETB)</label>
                  <input
                    type="number"
                    value={editForm.rateCard?.dailyRate || 0}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        rateCard: {
                          ...editForm.rateCard,
                          dailyRate: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-emerald-400 font-mono font-bold focus:outline-none focus:border-[#df2531]"
                  />
                </div>
              </div>

              {/* 8-Sides Photo Update Thumbnails */}
              <div className="p-4 rounded-xl bg-black border border-neutral-800 space-y-2">
                <span className="font-bold text-white text-xs font-display">8-Angle Camera Photogrammetry:</span>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {sides.map((s) => (
                    <label key={s.id} className="cursor-pointer block">
                      <div className="p-1 rounded-lg border border-neutral-800 bg-neutral-900 hover:border-[#df2531]/50 text-center transition-all">
                        <div className="text-[9px] truncate text-neutral-400 font-mono">{s.label.split(" ")[0]}</div>
                        <span className="text-[8px] text-[#df2531] font-bold mt-0.5 block">Replace</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, s.id)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
              <button
                onClick={() => setEditingAsset(null)}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-semibold border border-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="px-6 py-2.5 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold shadow-md shadow-[#df2531]/30 border border-[#df2531]/50 font-display"
              >
                {isSavingEdit ? "Saving..." : "Save Asset Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DELETE ASSET CONFIRMATION */}
      {assetToDelete && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-[#df2531]/50 rounded-2xl p-6 space-y-4 shadow-2xl text-xs text-neutral-200 animate-fadeIn">
            <div className="flex items-center gap-3 text-[#df2531]">
              <div className="h-10 w-10 rounded-full bg-[#df2531]/20 border border-[#df2531]/40 flex items-center justify-center">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm font-display">Delete Fleet Asset</h3>
                <p className="text-[11px] text-neutral-400">This action removes the unit from the active registry.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black border border-neutral-800 space-y-1">
              <div className="font-bold text-white text-xs">{assetToDelete.make} {assetToDelete.model}</div>
              <div className="text-[11px] text-neutral-400">Plate/Serial: <span className="font-mono text-white font-bold">{assetToDelete.plateNumber || assetToDelete.chassisOrSerialNumber}</span></div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setAssetToDelete(null)}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-semibold cursor-pointer border border-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAsset}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold shadow-md shadow-[#df2531]/30 cursor-pointer font-display"
              >
                {isDeleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: FULL DETAIL & 8-SIDES INSPECTOR */}
      {selectedAssetDetail && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-[#0a0a0a] border border-[#df2531]/40 rounded-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl text-xs text-neutral-200 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2 font-display">
                  <Eye className="text-[#df2531]" size={18} />
                  {selectedAssetDetail.make} {selectedAssetDetail.model} ({selectedAssetDetail.manufactureYear})
                </h2>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Chassis VIN: {selectedAssetDetail.chassisOrSerialNumber} • Plate: {selectedAssetDetail.plateNumber || "N/A"}
                </p>
              </div>
              <button
                onClick={() => setSelectedAssetDetail(null)}
                className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800"
              >
                <X size={16} />
              </button>
            </div>

            {/* 8-Sides Interactive Viewer */}
            <div className="space-y-3">
              <div className="h-64 sm:h-72 w-full rounded-xl bg-black border border-neutral-800 overflow-hidden relative flex items-center justify-center">
                {selectedAssetDetail.images8Sides && (selectedAssetDetail.images8Sides as any)[activeGalleryAngle] ? (
                  <img
                    src={(selectedAssetDetail.images8Sides as any)[activeGalleryAngle]}
                    alt={`${selectedAssetDetail.model} ${activeGalleryAngle}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-neutral-500 flex flex-col items-center gap-2">
                    <Camera size={32} />
                    <span>No image uploaded for [{activeGalleryAngle.toUpperCase()}]</span>
                  </div>
                )}
                <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/80 font-mono text-[10px] text-white font-bold border border-neutral-800 font-display">
                  [{activeGalleryAngle.toUpperCase()}]
                </span>
              </div>

              {/* Side Angle Thumbnails */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 pt-1">
                {sides.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveGalleryAngle(s.id)}
                    className={cn(
                      "p-1.5 rounded-lg border text-[9px] truncate font-medium transition-all text-center",
                      activeGalleryAngle === s.id
                        ? "bg-[#df2531]/20 border-[#df2531] text-white font-bold shadow-sm font-display"
                        : "bg-black border-neutral-800 text-neutral-400 hover:bg-neutral-900"
                    )}
                  >
                    {s.label.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Technical Specifications & Telematics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-black p-3.5 rounded-xl border border-neutral-800 space-y-1.5">
                <span className="font-bold text-white text-[11px] font-display">Technical Specifications:</span>
                <div className="space-y-1 text-[11px] text-neutral-300">
                  <div>Meter Reading: <span className="font-mono font-bold text-white font-display">{selectedAssetDetail.currentMeterReading} {selectedAssetDetail.meterUnit}</span></div>
                  <div>Condition Grade: <span className="font-semibold text-emerald-400 capitalize">{selectedAssetDetail.condition || "Excellent"}</span></div>
                  <div>Libre Title No: <span className="font-mono text-neutral-200">{selectedAssetDetail.libreCertificateNo || "LIB-ET-VERIFIED"}</span></div>
                  {selectedAssetDetail.specs.operatingWeightTons && (
                    <div>Operating Weight: <span className="font-bold text-white">{selectedAssetDetail.specs.operatingWeightTons} Tons</span></div>
                  )}
                  {selectedAssetDetail.specs.bucketCapacityM3 && (
                    <div>Bucket Capacity: <span className="font-bold text-white">{selectedAssetDetail.specs.bucketCapacityM3} m³</span></div>
                  )}
                  {selectedAssetDetail.specs.transmission && (
                    <div className="capitalize">Transmission: <span className="font-bold text-white">{selectedAssetDetail.specs.transmission}</span></div>
                  )}
                  {selectedAssetDetail.specs.fuelType && (
                    <div className="capitalize">Fuel Type: <span className="font-bold text-white">{selectedAssetDetail.specs.fuelType}</span></div>
                  )}
                </div>
              </div>

              <div className="bg-black p-3.5 rounded-xl border border-neutral-800 space-y-1.5">
                <span className="font-bold text-white text-[11px] font-display">Ethiopian Rate Card (ETB):</span>
                <div className="space-y-1 text-[11px] text-neutral-300">
                  <div>Daily Base Rate: <span className="font-mono font-bold text-emerald-400 font-display">{formatETB(selectedAssetDetail.rateCard?.dailyRate || 0)}</span></div>
                  <div>Security Deposit: <span className="font-mono text-neutral-300">{formatETB(selectedAssetDetail.rateCard?.securityDepositAmount || 0)}</span></div>
                  <div>Overtime Rate: <span className="font-mono text-neutral-200">{formatETB(selectedAssetDetail.rateCard?.overtimeRatePerUnit || 0)}/unit</span></div>
                  <div>Operator Daily: <span className="font-mono text-neutral-200">{formatETB(selectedAssetDetail.rateCard?.operatorDailyRate || 0)}</span></div>
                  <div>Operator Per-Diem Allowance: <span className="font-mono text-neutral-200">{formatETB(selectedAssetDetail.rateCard?.operatorPerDiemRate || 0)}</span></div>
                  {selectedAssetDetail.rateCard?.defaultMobilizationFee > 0 && (
                    <div>Low-bed Transport: <span className="font-mono text-white">{formatETB(selectedAssetDetail.rateCard.defaultMobilizationFee)}</span></div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
              <Link
                href="/bookings/new"
                className="px-4 py-2 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold text-xs shadow-md shadow-[#df2531]/30 font-display"
              >
                Create Dispatch Quote with Asset
              </Link>
              <button
                onClick={() => setSelectedAssetDetail(null)}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-semibold text-xs border border-neutral-800"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboard Asset Drawer */}
      <PolymorphicAssetForm
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onAssetCreated={() => {
          fetchAssets();
          setToastMessage("Asset registered and synchronized to Fleet Registry successfully!");
          setTimeout(() => setToastMessage(null), 4000);
        }}
      />
    </div>
  );
}
