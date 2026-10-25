"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Handshake,
  Plus,
  Building,
  UserCheck,
  ShieldCheck,
  CheckCircle,
  FileText,
  MapPin,
  Car,
  Truck,
  CreditCard,
  Radio,
  Camera,
  X,
  AlertCircle,
  Calendar,
  Sparkles,
  Pencil,
  Trash2,
  Upload,
  Search,
} from "lucide-react";
import { PartnerOnboarding, OwnerTier, AssetCategory, Images8Sides } from "@/lib/types";
import { generateMock8Sides } from "@/lib/db";
import { formatETB, cn } from "@/lib/utils";

export default function PartnerOnboardingPage() {
  const [partners, setPartners] = useState<PartnerOnboarding[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<PartnerOnboarding | null>(null);
  const [onboardSuccess, setOnboardSuccess] = useState<string | null>(null);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTier, setFilterTier] = useState<"all" | "individual_host" | "corporate_partner" | "passenger_car" | "heavy_machinery">("all");

  // Edit Partner State
  const [editingPartner, setEditingPartner] = useState<PartnerOnboarding | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete Partner State
  const [partnerToDelete, setPartnerToDelete] = useState<PartnerOnboarding | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State for "Add New"
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+251 9");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [tinNumber, setTinNumber] = useState("");
  const [ownerTier, setOwnerTier] = useState<OwnerTier>("individual_host");
  const [faydaFinNumber, setFaydaFinNumber] = useState("");

  const [assetCategory, setAssetCategory] = useState<AssetCategory>("passenger_car");
  const [make, setMake] = useState("Toyota");
  const [model, setModel] = useState("Land Cruiser 300 V8");
  const [manufactureYear, setManufactureYear] = useState(2023);
  const [plateNumber, setPlateNumber] = useState("3-A98421 AA");
  const [chassisOrSerialNumber, setChassisOrSerialNumber] = useState("JT7HJ83J4N0019283");
  const [condition, setCondition] = useState<"excellent" | "good" | "fair">("excellent");

  const [libreCertificateNo, setLibreCertificateNo] = useState("LIB-AA-2026-90412");
  const [libreDocUrl, setLibreDocUrl] = useState("/contracts/libre-sample.pdf");

  const [dailyRate, setDailyRate] = useState(14000);
  const [securityDeposit, setSecurityDeposit] = useState(50000);

  const [region, setRegion] = useState("Addis Ababa");
  const [citySubcity, setCitySubcity] = useState("Bole Sub-city (Woreda 03)");
  const [depotAddress, setDepotAddress] = useState("Around Atlas Hotel, Central Yard");

  const [commissionPct, setCommissionPct] = useState(15);
  const [termsSigned, setTermsSigned] = useState(true);

  const [hasGps, setHasGps] = useState(true);
  const [gpsTrackerImei, setGpsTrackerImei] = useState("865492049102491");

  const [paymentMethod, setPaymentMethod] = useState("Commercial Bank of Ethiopia");
  const [bankName, setBankName] = useState("Commercial Bank of Ethiopia");
  const [accountNumber, setAccountNumber] = useState("1000293847561");
  const [durationMonths, setDurationMonths] = useState(12);
  const [handoverNotes, setHandoverNotes] = useState("Vehicle delivered in showroom condition with spare tire and jack kit.");
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(true);

  const [images8Sides, setImages8Sides] = useState<Images8Sides>(() =>
    generateMock8Sides("car", "Toyota Land Cruiser 300 V8")
  );

  const [submitting, setSubmitting] = useState(false);

  const sides = [
    { id: "front", label: "Front (0°)" },
    { id: "front_right", label: "Front-Right (45°)" },
    { id: "right_side", label: "Right Profile (90°)" },
    { id: "rear_right", label: "Rear-Right (135°)" },
    { id: "rear", label: "Rear (180°)" },
    { id: "rear_left", label: "Rear-Left (225°)" },
    { id: "left_side", label: "Left Profile (270°)" },
    { id: "cabin_interior", label: "Cabin / Cockpit" },
  ];

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/partners");
      const json = await res.json();
      if (json.success) {
        setPartners(json.data);
      }
    } catch (e) {
      console.error("Failed to load partners", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleOpenEdit = (prt: PartnerOnboarding) => {
    setEditingPartner(prt);
    setEditForm({
      id: prt.id,
      ownerContact: { ...prt.ownerContact },
      make: prt.make,
      model: prt.model,
      manufactureYear: prt.manufactureYear,
      plateNumber: prt.plateNumber || "",
      chassisOrSerialNumber: prt.chassisOrSerialNumber,
      condition: prt.condition,
      price: { ...prt.price },
      agreement: { ...prt.agreement },
      gps: { ...prt.gps },
      deliveryClearance: { ...prt.deliveryClearance },
      images8Sides: { ...prt.images8Sides },
    });
  };

  // Image Upload handler for Edit Modal
  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>, angle: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setEditForm((prev: any) => ({
        ...prev,
        images8Sides: {
          ...prev.images8Sides,
          [angle]: dataUrl,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  // Save Edit
  const handleSaveEdit = async () => {
    if (!editingPartner) return;
    setIsSavingEdit(true);

    try {
      const res = await fetch("/api/v1/partners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update partner");

      setOnboardSuccess(`Partner '${editForm.ownerContact.fullName}' updated successfully!`);
      setEditingPartner(null);
      fetchPartners();
      setTimeout(() => setOnboardSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Partner
  const handleDeletePartner = async () => {
    if (!partnerToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/v1/partners?id=${partnerToDelete.id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete partner");

      setOnboardSuccess(`Partner '${partnerToDelete.ownerContact.fullName}' and linked asset removed.`);
      setPartnerToDelete(null);
      fetchPartners();
      setTimeout(() => setOnboardSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddNewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/v1/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerContact: {
            fullName,
            phoneNumber,
            email,
            companyName: companyName || fullName,
            tinNumber,
            ownerTier,
          },
          ownerKycNidUrl: "/mock/nid-sample.jpg",
          faydaFinNumber: faydaFinNumber || `FIN-8899-${Math.floor(1000 + Math.random() * 9000)}-2233`,
          libreCertificateNo,
          libreDocUrl,
          assetCategory,
          condition,
          make,
          model,
          manufactureYear,
          plateNumber,
          chassisOrSerialNumber,
          price: {
            dailyRate,
            weeklyRate: dailyRate * 6,
            monthlyRate: dailyRate * 22,
            securityDepositAmount: securityDeposit,
            overtimeRatePerUnit: 35,
          },
          images8Sides,
          regionLocation: {
            region,
            citySubcity,
            depotAddress,
          },
          agreement: {
            termsSigned,
            commissionPct,
          },
          gps: {
            hasGps,
            gpsTrackerImei: hasGps ? gpsTrackerImei : undefined,
          },
          deliveryClearance: {
            paymentMethod,
            bankName,
            accountNumber,
            durationAvailableMonths: durationMonths,
            handoverNotes,
            confirmed: deliveryConfirmed,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Partner onboarding failed");

      setOnboardSuccess(`Partner '${json.partner.ownerContact.fullName}' and asset '${make} ${model}' onboarded & synchronized to Fleet Registry!`);
      setIsModalOpen(false);
      fetchPartners();
      setTimeout(() => setOnboardSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPartners = partners.filter((prt) => {
    if (filterTier === "individual_host" && prt.ownerContact.ownerTier !== "individual_host") return false;
    if (filterTier === "corporate_partner" && prt.ownerContact.ownerTier !== "corporate_partner") return false;
    if (filterTier === "passenger_car" && prt.assetCategory !== "passenger_car" && prt.assetCategory !== "commercial_van") return false;
    if (filterTier === "heavy_machinery" && prt.assetCategory !== "heavy_machinery") return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      prt.ownerContact.fullName.toLowerCase().includes(q) ||
      prt.ownerContact.companyName?.toLowerCase().includes(q) ||
      prt.ownerContact.phoneNumber?.toLowerCase().includes(q) ||
      prt.make.toLowerCase().includes(q) ||
      prt.model.toLowerCase().includes(q) ||
      prt.plateNumber?.toLowerCase().includes(q) ||
      prt.chassisOrSerialNumber?.toLowerCase().includes(q) ||
      prt.regionLocation?.region.toLowerCase().includes(q) ||
      prt.regionLocation?.citySubcity?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 rounded-2xl bg-[#0a0a0a] border border-[#df2531]/30 shadow-lg">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 font-display">
            <Handshake className="text-[#df2531]" size={24} />
            Partner Onboarding & Turo Host Network (Phase 2)
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            External host onboarding: KYC NID, Libre title check, 8-side photogrammetry, automated commission splits, and instant Fleet Registry synchronization.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold text-xs shadow-md shadow-[#df2531]/30 border border-[#df2531]/50 transition-all cursor-pointer font-display"
        >
          <Plus size={16} />
          Add New Owner / Partner
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0a0a0a] p-3.5 rounded-2xl border border-neutral-800">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search partners by name, company, phone, plate, or vehicle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-black border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#df2531]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "All Hosts", count: partners.length },
            { id: "individual_host", label: "Individual Hosts", count: partners.filter(p => p.ownerContact.ownerTier === "individual_host").length },
            { id: "corporate_partner", label: "Corporate Partners", count: partners.filter(p => p.ownerContact.ownerTier === "corporate_partner").length },
            { id: "passenger_car", label: "Cars", count: partners.filter(p => p.assetCategory === "passenger_car" || p.assetCategory === "commercial_van").length },
            { id: "heavy_machinery", label: "Heavy Machinery", count: partners.filter(p => p.assetCategory === "heavy_machinery").length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTier(tab.id as any)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer",
                filterTier === tab.id
                  ? "bg-[#df2531] border-[#df2531]/50 text-white font-bold font-display shadow-sm"
                  : "bg-black border-neutral-800 text-neutral-400 hover:bg-neutral-900 hover:text-white"
              )}
            >
              {tab.label} <span className="text-[10px] opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      {onboardSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-400" />
            <span>{onboardSuccess}</span>
          </div>
          <Link href="/assets" className="text-emerald-300 font-bold hover:underline flex items-center gap-1">
            View in Fleet Registry →
          </Link>
        </div>
      )}

      {/* Partners List */}
      {filteredPartners.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-neutral-800 bg-[#0a0a0a] space-y-2">
          <Handshake size={32} className="mx-auto text-neutral-600" />
          <h3 className="text-sm font-bold text-white font-display">No partners match your search criteria</h3>
          <p className="text-xs text-neutral-400">Try adjusting your search terms or filter selection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPartners.map((prt) => {
            const isCorporate = prt.ownerContact.ownerTier === "corporate_partner";

            return (
              <div
                key={prt.id}
                className="p-5 rounded-2xl border border-neutral-800 bg-[#0a0a0a] hover:border-[#df2531]/40 transition-all space-y-4 text-xs text-neutral-300 relative group shadow-md"
              >
                {/* Top Header + EDIT/DELETE */}
                <div className="flex items-start justify-between">
                  <div
                    onClick={() => setSelectedPartner(prt)}
                    className="cursor-pointer flex-1"
                  >
                  <div className="font-bold text-white text-base flex items-center gap-2 font-display">
                    {prt.ownerContact.fullName}
                    <span
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded font-mono font-semibold uppercase",
                        isCorporate ? "bg-purple-500/20 text-purple-300" : "bg-[#df2531]/20 text-[#df2531]"
                      )}
                    >
                      {prt.ownerContact.ownerTier.replace("_", " ")}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-3">
                    <span>{prt.ownerContact.companyName}</span>
                    <span className="font-mono text-[#df2531] font-bold">{prt.ownerContact.phoneNumber}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-[10px] text-neutral-400">Commission Split</div>
                    <div className="font-mono font-bold text-emerald-400 font-display">{prt.agreement.commissionPct}% DEL</div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(prt);
                    }}
                    className="p-1.5 rounded-lg bg-neutral-900 hover:bg-[#df2531]/20 text-neutral-400 hover:text-[#df2531] border border-neutral-800 transition-colors"
                    title="Edit Partner & Asset Details"
                  >
                    <Pencil size={12} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPartnerToDelete(prt);
                    }}
                    className="p-1.5 rounded-lg bg-neutral-900 hover:bg-rose-950/60 text-neutral-400 hover:text-rose-400 border border-neutral-800 transition-colors"
                    title="Delete Partner & Linked Asset"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Asset & Libre Info */}
              <div
                onClick={() => setSelectedPartner(prt)}
                className="grid grid-cols-12 gap-3 bg-black p-3 rounded-xl border border-neutral-800 cursor-pointer items-center hover:border-neutral-700 transition-colors"
              >
                <div className="col-span-3 h-14 rounded-lg bg-neutral-950 border border-neutral-800 overflow-hidden shrink-0 flex items-center justify-center">
                  {prt.images8Sides?.front ? (
                    <img src={prt.images8Sides.front} alt={prt.model} className="h-full w-full object-cover" />
                  ) : (
                    <Car size={20} className="text-neutral-600" />
                  )}
                </div>
                <div className="col-span-5">
                  <div className="text-[10px] text-neutral-400">Onboarded Asset</div>
                  <div className="font-bold text-white text-xs truncate font-display">{prt.make} {prt.model}</div>
                  <div className="text-[10px] font-mono text-[#df2531] font-bold">{prt.plateNumber || prt.chassisOrSerialNumber}</div>
                </div>
                <div className="col-span-4 text-right">
                  <div className="text-[10px] text-neutral-400">Libre Certificate</div>
                  <div className="font-mono font-bold text-neutral-200 truncate">{prt.libreCertificateNo}</div>
                  <div className="text-[10px] text-emerald-400 capitalize">★ {prt.condition}</div>
                </div>
              </div>

              {/* Delivery Clearance & GPS Status */}
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-800/80">
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <Radio size={13} className={prt.gps.hasGps ? "text-emerald-400" : "text-neutral-600"} />
                  <span>GPS: {prt.gps.hasGps ? `Active (${prt.gps.gpsTrackerImei})` : "Unmonitored"}</span>
                </div>

                <div className="flex items-center gap-1.5 text-neutral-400">
                  <span className="font-mono font-bold text-emerald-400 font-display">{formatETB(prt.price.dailyRate)}/day</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* MODAL 1: EDIT PARTNER & ASSET */}
      {editingPartner && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0a0a0a] border border-[#df2531]/40 rounded-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl text-xs text-neutral-200 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2 font-display">
                  <Pencil className="text-[#df2531]" size={18} />
                  Edit Partner & Vehicle: {editingPartner.ownerContact.fullName}
                </h2>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Update host contact, vehicle pricing, commission split, and device images.
                </p>
              </div>
              <button
                onClick={() => setEditingPartner(null)}
                className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-neutral-400">Owner Full Name</label>
                  <input
                    type="text"
                    value={editForm.ownerContact?.fullName || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        ownerContact: { ...editForm.ownerContact, fullName: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-white focus:outline-none focus:border-[#df2531]"
                  />
                </div>
                <div>
                  <label className="font-medium text-neutral-400">Phone (+251)</label>
                  <input
                    type="text"
                    value={editForm.ownerContact?.phoneNumber || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        ownerContact: { ...editForm.ownerContact, phoneNumber: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-white font-mono focus:outline-none focus:border-[#df2531]"
                  />
                </div>
                <div>
                  <label className="font-medium text-neutral-400">Asset Make</label>
                  <input
                    type="text"
                    value={editForm.make || ""}
                    onChange={(e) => setEditForm({ ...editForm, make: e.target.value })}
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-white focus:outline-none focus:border-[#df2531]"
                  />
                </div>
                <div>
                  <label className="font-medium text-neutral-400">Asset Model</label>
                  <input
                    type="text"
                    value={editForm.model || ""}
                    onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-white focus:outline-none focus:border-[#df2531]"
                  />
                </div>
                <div>
                  <label className="font-medium text-neutral-400">Plate Number</label>
                  <input
                    type="text"
                    value={editForm.plateNumber || ""}
                    onChange={(e) => setEditForm({ ...editForm, plateNumber: e.target.value })}
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-[#df2531]"
                  />
                </div>
                <div>
                  <label className="font-medium text-neutral-400">Daily Rental Rate (ETB)</label>
                  <input
                    type="number"
                    value={editForm.price?.dailyRate || 0}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        price: { ...editForm.price, dailyRate: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-emerald-400 font-mono font-bold focus:outline-none focus:border-[#df2531]"
                  />
                </div>
                <div>
                  <label className="font-medium text-neutral-400">Platform Commission Split %</label>
                  <input
                    type="number"
                    value={editForm.agreement?.commissionPct || 15}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        agreement: { ...editForm.agreement, commissionPct: parseFloat(e.target.value) || 15 },
                      })
                    }
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-white font-mono focus:outline-none focus:border-[#df2531]"
                  />
                </div>
                <div>
                  <label className="font-medium text-neutral-400">GPS Tracker IMEI</label>
                  <input
                    type="text"
                    value={editForm.gps?.gpsTrackerImei || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        gps: { ...editForm.gps, gpsTrackerImei: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-white font-mono focus:outline-none focus:border-[#df2531]"
                  />
                </div>
              </div>

              {/* 8-Sides Image Replacement */}
              <div className="p-4 rounded-xl bg-black border border-neutral-800 space-y-2">
                <span className="font-bold text-white text-xs font-display">Replace 8-Sides Photogrammetry from Device:</span>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {sides.map((s) => (
                    <label key={s.id} className="cursor-pointer block">
                      <div className="p-1 rounded-lg border border-neutral-800 bg-neutral-900 hover:border-[#df2531]/50 text-center transition-all">
                        <div className="text-[9px] truncate text-neutral-400 font-mono">{s.label.split(" ")[0]}</div>
                        <span className="text-[8px] text-[#df2531] font-bold mt-0.5 block">Upload</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleEditImageUpload(e, s.id)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
              <button
                onClick={() => setEditingPartner(null)}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-semibold border border-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="px-6 py-2.5 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold shadow-md shadow-[#df2531]/30 border border-[#df2531]/50 font-display"
              >
                {isSavingEdit ? "Saving..." : "Save Partner Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DELETE PARTNER CONFIRMATION */}
      {partnerToDelete && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-[#df2531]/50 rounded-2xl p-6 space-y-4 shadow-2xl text-xs text-neutral-200 animate-fadeIn">
            <div className="flex items-center gap-3 text-[#df2531]">
              <div className="h-10 w-10 rounded-full bg-[#df2531]/20 border border-[#df2531]/40 flex items-center justify-center">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm font-display">Delete Partner & Asset</h3>
                <p className="text-[11px] text-neutral-400">This removes the host and synchronizes removal from Fleet Registry.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black border border-neutral-800 space-y-1">
              <div className="font-bold text-white text-xs">{partnerToDelete.ownerContact.fullName}</div>
              <div className="text-[11px] text-neutral-400">Asset: <span className="font-mono text-white font-bold">{partnerToDelete.make} {partnerToDelete.model}</span> ({partnerToDelete.plateNumber || partnerToDelete.chassisOrSerialNumber})</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPartnerToDelete(null)}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-semibold border border-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePartner}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold shadow-md shadow-[#df2531]/30 font-display"
              >
                {isDeleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW PARTNER DETAILS */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0a0a0a] border border-[#df2531]/40 rounded-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl text-xs text-neutral-200 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2 font-display">
                  <Handshake className="text-[#df2531]" size={18} />
                  Host Profile: {selectedPartner.ownerContact.fullName}
                </h2>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {selectedPartner.ownerContact.companyName} • {selectedPartner.ownerContact.phoneNumber}
                </p>
              </div>
              <button
                onClick={() => setSelectedPartner(null)}
                className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 bg-black p-3.5 rounded-xl border border-neutral-800">
                <div>
                  <span className="text-[10px] text-neutral-400">Onboarded Asset:</span>
                  <div className="font-bold text-white text-xs font-display">{selectedPartner.make} {selectedPartner.model}</div>
                  <div className="text-[10px] font-mono text-white font-bold">Plate: {selectedPartner.plateNumber || selectedPartner.chassisOrSerialNumber}</div>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400">Daily Rate & Commission:</span>
                  <div className="font-mono font-bold text-emerald-400 font-display">{formatETB(selectedPartner.price.dailyRate)}/day</div>
                  <div className="text-[10px] text-neutral-300">{selectedPartner.agreement.commissionPct}% DEL Split</div>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400">Base Depot Location:</span>
                  <div className="text-neutral-200">{selectedPartner.regionLocation.depotAddress}</div>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400">Delivery Clearance Account:</span>
                  <div className="font-mono text-neutral-200">{selectedPartner.deliveryClearance.paymentMethod} ({selectedPartner.deliveryClearance.bankName})</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-neutral-800">
              <button
                onClick={() => setSelectedPartner(null)}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-semibold cursor-pointer border border-neutral-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD NEW PARTNER WIZARD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-[#0a0a0a] border border-[#df2531]/40 rounded-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl text-xs text-neutral-200 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2 font-display">
                  <Handshake className="text-[#df2531]" size={18} />
                  Onboard New Partner & Vehicle (Turo P2P Mode)
                </h2>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Registration automatically creates tenant ledger and synchronizes into the central Fleet Registry.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddNewSubmit} className="space-y-4">
              {/* Owner Info */}
              <div className="bg-black p-4 rounded-xl border border-neutral-800 space-y-3">
                <span className="font-bold text-white text-xs font-display">1. Owner Contact & VeriFayda KYC</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-medium text-neutral-400">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Dawit Haile"
                      className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-white focus:outline-none focus:border-[#df2531]"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-neutral-400">Phone (+251) *</label>
                    <input
                      type="text"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-white font-mono focus:outline-none focus:border-[#df2531]"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-neutral-400">Ministry of Revenue TIN</label>
                    <input
                      type="text"
                      value={tinNumber}
                      onChange={(e) => setTinNumber(e.target.value)}
                      placeholder="0077889900"
                      className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-white font-mono focus:outline-none focus:border-[#df2531]"
                    />
                  </div>
                </div>
              </div>

              {/* Asset Info */}
              <div className="bg-black p-4 rounded-xl border border-neutral-800 space-y-3">
                <span className="font-bold text-white text-xs font-display">2. Asset Information & Libre Certificate</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-medium text-neutral-400">Make *</label>
                    <input
                      type="text"
                      required
                      value={make}
                      onChange={(e) => setMake(e.target.value)}
                      className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-white focus:outline-none focus:border-[#df2531]"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-neutral-400">Model *</label>
                    <input
                      type="text"
                      required
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-white focus:outline-none focus:border-[#df2531]"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-neutral-400">Plate Number *</label>
                    <input
                      type="text"
                      required
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value)}
                      className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-white font-mono font-bold focus:outline-none focus:border-[#df2531]"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-neutral-400">Chassis / VIN *</label>
                    <input
                      type="text"
                      required
                      value={chassisOrSerialNumber}
                      onChange={(e) => setChassisOrSerialNumber(e.target.value)}
                      className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-white font-mono focus:outline-none focus:border-[#df2531]"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-neutral-400">Libre Certificate No *</label>
                    <input
                      type="text"
                      required
                      value={libreCertificateNo}
                      onChange={(e) => setLibreCertificateNo(e.target.value)}
                      className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-neutral-200 font-mono focus:outline-none focus:border-[#df2531]"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-neutral-400">Daily Rate (ETB) *</label>
                    <input
                      type="number"
                      required
                      value={dailyRate}
                      onChange={(e) => setDailyRate(parseFloat(e.target.value) || 0)}
                      className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-emerald-400 font-mono font-bold focus:outline-none focus:border-[#df2531]"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Clearance */}
              <div className="bg-black p-4 rounded-xl border border-neutral-800 space-y-3">
                <span className="font-bold text-white text-xs font-display">3. Delivery Clearance & Payout Terms</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-medium text-neutral-400">Payout Method</label>
                    <input
                      type="text"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-white focus:outline-none focus:border-[#df2531]"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-neutral-400">Bank Account No</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-white font-mono focus:outline-none focus:border-[#df2531]"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-neutral-400">GPS Tracker IMEI</label>
                    <input
                      type="text"
                      value={gpsTrackerImei}
                      onChange={(e) => setGpsTrackerImei(e.target.value)}
                      className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-white font-mono focus:outline-none focus:border-[#df2531]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-semibold border border-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold shadow-md shadow-[#df2531]/30 border border-[#df2531]/50 font-display"
                >
                  {submitting ? "Onboarding..." : "Confirm & Onboard Host"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
