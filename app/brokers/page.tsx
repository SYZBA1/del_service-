"use client";

import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Plus,
  Search,
  MapPin,
  Phone,
  Mail,
  Percent,
  CheckCircle2,
  X,
  Pencil,
  Trash2,
  Building2,
  ShieldCheck,
  Award,
  Layers,
  FileText,
  UserCheck,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { Broker } from "@/lib/types";
import { formatETB, cn } from "@/lib/utils";

const ETHIOPIAN_REGIONS = [
  "Addis Ababa",
  "Oromia",
  "Amhara",
  "Sidama",
  "Tigray",
  "Dire Dawa",
  "Somali",
  "South Ethiopia",
  "Central Ethiopia",
  "South West Ethiopia",
  "Benishangul-Gumuz",
  "Afar",
  "Harari",
  "Gambela",
];

const SPECIALIZATIONS = [
  "Heavy Machinery",
  "Commercial & Transport",
  "Passenger Cars",
  "Quarry & Earthmoving",
  "All Assets",
] as const;

export default function BrokersDirectoryPage() {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedSpec, setSelectedSpec] = useState<string>("all");
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [brokerToEdit, setBrokerToEdit] = useState<Broker | null>(null);
  const [brokerToDelete, setBrokerToDelete] = useState<Broker | null>(null);

  // Notifications
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Broker Form State
  const initialFormState = {
    fullName: "",
    phoneNumber: "+251 9",
    email: "",
    address: "",
    region: "Addis Ababa",
    citySubcity: "Bole Subcity",
    commissionPct: 7.5,
    specialization: "Heavy Machinery" as Broker["specialization"],
    tinNumber: "",
    nationalIdNumber: "",
    faydaFinNumber: "",
    bankName: "Commercial Bank of Ethiopia (CBE)",
    accountNumber: "",
    accountHolderName: "",
    notes: "",
  };
  const [formData, setFormData] = useState(initialFormState);

  // Fetch Brokers
  const fetchBrokers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/brokers");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBrokers(data.data);
      }
    } catch (err) {
      console.error("Failed to load brokers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrokers();
  }, []);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Filter Logic: Filters instantly by Name, Phone, Address, Region, or City
  const trimmedSearch = search.trim().toLowerCase();
  const filteredBrokers = brokers.filter((b) => {
    const matchesSearch =
      !trimmedSearch ||
      b.fullName.toLowerCase().includes(trimmedSearch) ||
      b.phoneNumber.toLowerCase().includes(trimmedSearch) ||
      b.address.toLowerCase().includes(trimmedSearch) ||
      b.regionLocation.region.toLowerCase().includes(trimmedSearch) ||
      (b.regionLocation.citySubcity && b.regionLocation.citySubcity.toLowerCase().includes(trimmedSearch)) ||
      (b.specialization && b.specialization.toLowerCase().includes(trimmedSearch));

    const matchesRegion =
      selectedRegion === "all" ||
      b.regionLocation.region.toLowerCase() === selectedRegion.toLowerCase();

    const matchesSpec =
      selectedSpec === "all" ||
      (b.specialization && b.specialization.toLowerCase() === selectedSpec.toLowerCase());

    return matchesSearch && matchesRegion && matchesSpec;
  });

  // KPI Calculations
  const totalBrokers = brokers.length;
  const totalDeals = brokers.reduce((acc, b) => acc + (b.dealsClosedCount || 0), 0);
  const totalCommissionETB = brokers.reduce((acc, b) => acc + (b.totalCommissionPaidETB || 0), 0);
  const avgCommission =
    totalBrokers > 0
      ? (brokers.reduce((acc, b) => acc + b.commissionPct, 0) / totalBrokers).toFixed(1)
      : "7.0";

  // Handle Add New Broker
  const handleCreateBroker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phoneNumber.trim() || !formData.address.trim()) {
      showNotification("error", "Full Name, Phone Number, and Address are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/v1/brokers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          email: formData.email.trim() || undefined,
          address: formData.address.trim(),
          regionLocation: {
            region: formData.region,
            citySubcity: formData.citySubcity.trim() || undefined,
          },
          commissionPct: Number(formData.commissionPct) || 5.0,
          specialization: formData.specialization,
          tinNumber: formData.tinNumber.trim() || undefined,
          nationalIdNumber: formData.nationalIdNumber.trim() || undefined,
          faydaFinNumber: formData.faydaFinNumber.trim() || undefined,
          payoutBank: {
            bankName: formData.bankName,
            accountNumber: formData.accountNumber.trim() || "1000000000000",
            accountHolderName: formData.accountHolderName.trim() || formData.fullName.trim(),
          },
          notes: formData.notes.trim() || undefined,
          status: "active",
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        showNotification("success", `Broker "${resData.data.fullName}" successfully registered!`);
        setIsAddModalOpen(false);
        setFormData(initialFormState);
        await fetchBrokers();
      } else {
        showNotification("error", resData.error || "Failed to register broker.");
      }
    } catch (err: any) {
      showNotification("error", err.message || "Network error while saving broker.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (broker: Broker) => {
    setBrokerToEdit(broker);
    setFormData({
      fullName: broker.fullName,
      phoneNumber: broker.phoneNumber,
      email: broker.email || "",
      address: broker.address,
      region: broker.regionLocation.region,
      citySubcity: broker.regionLocation.citySubcity || "",
      commissionPct: broker.commissionPct,
      specialization: broker.specialization || "Heavy Machinery",
      tinNumber: broker.tinNumber || "",
      nationalIdNumber: broker.nationalIdNumber || "",
      faydaFinNumber: broker.faydaFinNumber || "",
      bankName: broker.payoutBank?.bankName || "Commercial Bank of Ethiopia (CBE)",
      accountNumber: broker.payoutBank?.accountNumber || "",
      accountHolderName: broker.payoutBank?.accountHolderName || broker.fullName,
      notes: broker.notes || "",
    });
    setIsEditModalOpen(true);
  };

  // Handle Update Broker
  const handleUpdateBroker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brokerToEdit) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/v1/brokers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: brokerToEdit.id,
          fullName: formData.fullName.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          email: formData.email.trim() || undefined,
          address: formData.address.trim(),
          regionLocation: {
            region: formData.region,
            citySubcity: formData.citySubcity.trim() || undefined,
          },
          commissionPct: Number(formData.commissionPct) || 5.0,
          specialization: formData.specialization,
          tinNumber: formData.tinNumber.trim() || undefined,
          nationalIdNumber: formData.nationalIdNumber.trim() || undefined,
          faydaFinNumber: formData.faydaFinNumber.trim() || undefined,
          payoutBank: {
            bankName: formData.bankName,
            accountNumber: formData.accountNumber.trim() || "1000000000000",
            accountHolderName: formData.accountHolderName.trim() || formData.fullName.trim(),
          },
          notes: formData.notes.trim() || undefined,
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        showNotification("success", `Broker "${formData.fullName}" updated successfully!`);
        setIsEditModalOpen(false);
        setBrokerToEdit(null);
        await fetchBrokers();
      } else {
        showNotification("error", resData.error || "Failed to update broker.");
      }
    } catch (err: any) {
      showNotification("error", err.message || "Network error while updating broker.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Broker
  const handleDeleteBroker = async () => {
    if (!brokerToDelete) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/v1/brokers?id=${brokerToDelete.id}`, {
        method: "DELETE",
      });
      const resData = await res.json();
      if (resData.success) {
        showNotification("success", `Broker "${brokerToDelete.fullName}" has been removed.`);
        setIsDeleteModalOpen(false);
        setBrokerToDelete(null);
        await fetchBrokers();
      } else {
        showNotification("error", resData.error || "Failed to delete broker.");
      }
    } catch (err: any) {
      showNotification("error", err.message || "Network error while deleting broker.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto min-h-screen text-neutral-100">
      {/* Toast Notification */}
      {notification && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-medium transition-all animate-bounce",
            notification.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
              : "bg-rose-950/90 border-rose-500/50 text-rose-200"
          )}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 hover:opacity-80 text-neutral-400"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header & Primary CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#df2531]/20 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#df2531]/15 border border-[#df2531]/30 text-[#df2531]">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2 font-display">
                Brokers & Sourcing Network
                <span className="text-xs font-mono font-medium bg-[#df2531]/20 text-[#df2531] px-2.5 py-0.5 rounded-full border border-[#df2531]/40 font-display">
                  Asset Management
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-0.5 font-sans">
                Centralized Ethiopian broker registry, verified contact directory, regional coverage & commission payouts.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setFormData(initialFormState);
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold text-sm shadow-lg shadow-[#df2531]/25 transition-all active:scale-95 font-display"
        >
          <Plus size={18} className="stroke-[3]" />
          <span>Add New Broker</span>
        </button>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-[#df2531]/30 hover:border-[#df2531]/60 transition-colors backdrop-blur-md">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Brokers</span>
            <Briefcase size={16} className="text-[#df2531]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-display">{totalBrokers}</div>
          <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1 font-mono">
            <CheckCircle2 size={12} className="text-emerald-400" /> Verified Partners
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-[#df2531]/30 hover:border-[#df2531]/60 transition-colors backdrop-blur-md">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Commission</span>
            <Percent size={16} className="text-[#df2531]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#df2531] font-display">{avgCommission}%</div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">
            Standard Ethiopian rate: 5%–10%
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-[#df2531]/30 hover:border-[#df2531]/60 transition-colors backdrop-blur-md">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Deals Closed</span>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-display">{totalDeals}</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono">
            Heavy Machinery & Fleet leases
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-[#df2531]/30 hover:border-[#df2531]/60 transition-colors backdrop-blur-md">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Commission</span>
            <DollarSign size={16} className="text-[#df2531]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#df2531] font-display">
            {formatETB(totalCommissionETB)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">
            Disbursed to date
          </div>
        </div>
      </div>

      {/* Search, Filter Bar & Specialization Pills */}
      <div className="space-y-3 bg-[#0a0a0a] border border-[#df2531]/20 p-4 rounded-2xl">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Live Search Input with Instant Matching Badge */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search Broker Name (e.g. Ato Kassahun, Alemayehu...), Phone, Region, or Subcity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-900/90 border border-neutral-700/80 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#df2531]/50 focus:border-[#df2531] transition-all font-medium font-sans"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Region Dropdown Filter */}
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-[#df2531] shrink-0 hidden sm:block" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-[#df2531] font-medium"
            >
              <option value="all">All Regions & Corridors</option>
              {ETHIOPIAN_REGIONS.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Specialization Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
          <span className="text-neutral-400 text-xs font-semibold shrink-0 pr-1">Specialization:</span>
          {["all", ...SPECIALIZATIONS].map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpec(spec)}
              className={cn(
                "px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors border",
                selectedSpec === spec
                  ? "bg-[#df2531] text-white border-[#df2531] font-display font-bold shadow-sm"
                  : "bg-neutral-900/80 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              )}
            >
              {spec === "all" ? "All Assets" : spec}
            </button>
          ))}
        </div>

        {/* Active Filter Search Notice */}
        {trimmedSearch && (
          <div className="text-xs text-[#df2531] bg-[#df2531]/10 border border-[#df2531]/20 px-3 py-1.5 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="shrink-0" />
              <span>
                Filtering by broker name or keyword: <strong>"{search}"</strong> — found{" "}
                <strong>{filteredBrokers.length}</strong> matching broker{filteredBrokers.length === 1 ? "" : "s"}.
              </span>
            </div>
            <button
              onClick={() => setSearch("")}
              className="underline hover:text-white font-medium ml-2 text-[11px]"
            >
              Clear Filter
            </button>
          </div>
        )}
      </div>

      {/* Brokers Directory Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="inline-block w-8 h-8 border-2 border-[#df2531] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-neutral-400">Loading Ethiopian broker network...</p>
        </div>
      ) : filteredBrokers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-[#df2531]/20 bg-[#0a0a0a] space-y-3">
          <Briefcase className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-base font-bold text-white font-display">No Brokers Found</h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            {trimmedSearch
              ? `No broker records matched "${search}". Try searching another name, phone number, or region.`
              : "No brokers currently registered in this category."}
          </p>
          {trimmedSearch && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedRegion("all");
                setSelectedSpec("all");
              }}
              className="text-xs text-[#df2531] underline hover:text-red-400 font-medium"
            >
              Reset all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredBrokers.map((broker) => {
            const isNameMatched =
              trimmedSearch && broker.fullName.toLowerCase().includes(trimmedSearch);

            return (
              <div
                key={broker.id}
                className={cn(
                  "group relative rounded-2xl bg-[#0a0a0a] border p-5 transition-all duration-200 hover:border-[#df2531]/50 hover:shadow-xl hover:shadow-[#df2531]/10 flex flex-col justify-between",
                  isNameMatched
                    ? "border-[#df2531] ring-1 ring-[#df2531]/40 bg-neutral-950"
                    : "border-neutral-800"
                )}
              >
                {/* Header: Name, Initials, Commission Badge & Action Icons */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {/* Initials Avatar */}
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#df2531]/25 to-[#df2531]/10 border border-[#df2531]/30 flex items-center justify-center text-[#df2531] font-black text-sm shrink-0 shadow-inner font-display">
                        {broker.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3
                            className={cn(
                              "text-base font-bold text-white group-hover:text-[#df2531] transition-colors font-display",
                              isNameMatched && "text-[#df2531] underline underline-offset-4 decoration-[#df2531]"
                            )}
                          >
                            {broker.fullName}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-400">
                          <span className="font-mono text-[11px] text-neutral-400 flex items-center gap-1">
                            <ShieldCheck size={12} className="text-emerald-400" />
                            {broker.faydaFinNumber ? "Fayda FIN Verified" : "ID Verified"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Commission Rate Badge */}
                    <div className="flex flex-col items-end">
                      <span className="px-2.5 py-1 rounded-xl bg-[#df2531]/15 border border-[#df2531]/30 text-[#df2531] font-black text-xs font-mono shadow-sm">
                        {broker.commissionPct}% Comm
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono mt-0.5 uppercase">
                        {broker.status}
                      </span>
                    </div>
                  </div>

                  {/* Specialization & Region Badges */}
                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    {broker.specialization && (
                      <span className="px-2 py-0.5 rounded-lg bg-neutral-800 text-neutral-300 text-[11px] font-medium border border-neutral-700/60">
                        {broker.specialization}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-lg bg-neutral-800/80 text-neutral-300 text-[11px] font-medium border border-neutral-700/60 flex items-center gap-1">
                      <MapPin size={11} className="text-[#df2531]" />
                      {broker.regionLocation.citySubcity
                        ? `${broker.regionLocation.citySubcity}, ${broker.regionLocation.region}`
                        : broker.regionLocation.region}
                    </span>
                  </div>

                  {/* Full Contact Information Block */}
                  <div className="space-y-2 rounded-xl bg-black/60 border border-neutral-800/80 p-3 text-xs mb-4">
                    {/* Phone */}
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400 flex items-center gap-1.5">
                        <Phone size={13} className="text-emerald-400" /> Phone:
                      </span>
                      <a
                        href={`tel:${broker.phoneNumber}`}
                        className="font-mono font-bold text-white hover:text-[#df2531] transition-colors"
                      >
                        {broker.phoneNumber}
                      </a>
                    </div>

                    {/* Email */}
                    {broker.email && (
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400 flex items-center gap-1.5">
                          <Mail size={13} className="text-neutral-300" /> Email:
                        </span>
                        <a
                          href={`mailto:${broker.email}`}
                          className="text-neutral-300 hover:text-white truncate max-w-[170px]"
                        >
                          {broker.email}
                        </a>
                      </div>
                    )}

                    {/* Physical Address */}
                    <div className="flex items-start justify-between gap-2 pt-1 border-t border-neutral-800/60">
                      <span className="text-neutral-400 shrink-0 flex items-center gap-1.5">
                        <MapPin size={13} className="text-[#df2531]" /> Address:
                      </span>
                      <span className="text-neutral-300 text-right font-medium truncate max-w-[200px]">
                        {broker.address}
                      </span>
                    </div>

                    {/* Payout Bank */}
                    {broker.payoutBank && (
                      <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60 text-[11px]">
                        <span className="text-neutral-400 flex items-center gap-1.5">
                          <Building2 size={12} className="text-[#df2531]" /> Payout:
                        </span>
                        <span className="font-mono text-neutral-300 truncate max-w-[170px]">
                          {broker.payoutBank.bankName.split("(")[0]} ({broker.payoutBank.accountNumber.slice(-4)})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs mb-4 bg-neutral-950/80 p-2.5 rounded-xl border border-neutral-800/60">
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                        Deals Sourced
                      </span>
                      <span className="text-sm font-bold text-white font-mono">
                        {broker.dealsClosedCount || 0}
                      </span>
                    </div>
                    <div className="border-l border-neutral-800">
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                        Total Commission
                      </span>
                      <span className="text-sm font-bold text-[#df2531] font-display">
                        {formatETB(broker.totalCommissionPaidETB || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Icons: Edit, Delete, Direct Call */}
                <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {/* Edit Icon Button */}
                    <button
                      onClick={() => openEditModal(broker)}
                      title="Edit Broker Details"
                      className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                    >
                      <Pencil size={15} />
                    </button>

                    {/* Delete Icon Button */}
                    <button
                      onClick={() => {
                        setBrokerToDelete(broker);
                        setIsDeleteModalOpen(true);
                      }}
                      title="Delete Broker"
                      className="p-2 rounded-xl bg-neutral-800 hover:bg-rose-950/60 text-neutral-400 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <a
                    href={`tel:${broker.phoneNumber}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#df2531]/15 hover:bg-[#df2531]/25 text-[#df2531] border border-[#df2531]/30 text-xs font-bold font-display transition-colors"
                  >
                    <Phone size={13} />
                    <span>Call Broker</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================================================== */}
      {/* ADD NEW BROKER MODAL */}
      {/* ==================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0a0a0a] border border-[#df2531]/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-neutral-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#df2531]/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#df2531]/15 text-[#df2531]">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-display">Register New Broker / Sourcing Agent</h2>
                  <p className="text-xs text-neutral-400 font-sans">
                    Add verified Ethiopian broker contact, location, and commission rate.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBroker} className="space-y-4 pt-4 font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Broker Full Name <span className="text-[#df2531]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ato Kassahun Belay"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#df2531]"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Phone Number <span className="text-[#df2531]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+251 911 234 567"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#df2531] font-mono"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="broker@example.et"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#df2531]"
                  />
                </div>

                {/* Commission % */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Commission Rate (%) <span className="text-[#df2531]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="30"
                      required
                      value={formData.commissionPct}
                      onChange={(e) => setFormData({ ...formData, commissionPct: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#df2531] font-mono"
                    />
                    <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  </div>
                </div>

                {/* Region */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Region (Location) <span className="text-[#df2531]">*</span>
                  </label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#df2531]"
                  >
                    {ETHIOPIAN_REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City / Subcity */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    City / Subcity
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bole Subcity / Adama Corridor"
                    value={formData.citySubcity}
                    onChange={(e) => setFormData({ ...formData, citySubcity: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#df2531]"
                  />
                </div>
              </div>

              {/* Physical Address */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Physical Office / Depot Address <span className="text-[#df2531]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jarkros Sets Building, 2nd Floor, Addis Ababa"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#df2531]"
                />
              </div>

              {/* Specialization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Asset Specialization
                  </label>
                  <select
                    value={formData.specialization}
                    onChange={(e) =>
                      setFormData({ ...formData, specialization: e.target.value as Broker["specialization"] })
                    }
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#df2531]"
                  >
                    {SPECIALIZATIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fayda FIN / TIN */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Fayda FIN or TIN Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FIN-ET-8492-1049-3829"
                    value={formData.faydaFinNumber}
                    onChange={(e) => setFormData({ ...formData, faydaFinNumber: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#df2531] font-mono"
                  />
                </div>
              </div>

              {/* Payout Bank Details */}
              <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <span className="text-xs font-bold text-[#df2531] uppercase tracking-wider block font-display">
                  Commission Payout Account
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-neutral-400 mb-1">Bank Name</label>
                    <select
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white"
                    >
                      <option value="Commercial Bank of Ethiopia (CBE)">Commercial Bank of Ethiopia (CBE)</option>
                      <option value="Awash Bank">Awash Bank</option>
                      <option value="Dashen Bank">Dashen Bank</option>
                      <option value="Bank of Abyssinia">Bank of Abyssinia</option>
                      <option value="Telebirr SuperApp Wallet">Telebirr SuperApp Wallet</option>
                      <option value="Wegagen Bank">Wegagen Bank</option>
                      <option value="Cooperative Bank of Oromia">Cooperative Bank of Oromia</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1">Account Number</label>
                    <input
                      type="text"
                      placeholder="1000..."
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1">Account Holder</label>
                    <input
                      type="text"
                      placeholder="Name on Account"
                      value={formData.accountHolderName}
                      onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Referral / Background Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes on client connections, verified equipment types, or corridor history..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#df2531]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold text-xs shadow-md shadow-[#df2531]/25 transition-all disabled:opacity-50 font-display"
                >
                  {isSubmitting ? "Saving..." : "Save Broker"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* EDIT BROKER MODAL */}
      {/* ==================================================== */}
      {isEditModalOpen && brokerToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0a0a0a] border border-[#df2531]/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-neutral-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#df2531]/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#df2531]/15 text-[#df2531]">
                  <Pencil size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-display">Edit Broker: {brokerToEdit.fullName}</h2>
                  <p className="text-xs text-neutral-400 font-sans">Update contact, address, or commission parameters.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setBrokerToEdit(null);
                }}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateBroker} className="space-y-4 pt-4 font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Broker Full Name <span className="text-[#df2531]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#df2531]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Phone Number <span className="text-[#df2531]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#df2531] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#df2531]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Commission Rate (%) <span className="text-[#df2531]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="30"
                      required
                      value={formData.commissionPct}
                      onChange={(e) => setFormData({ ...formData, commissionPct: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#df2531] font-mono"
                    />
                    <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Region (Location)</label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#df2531]"
                  >
                    {ETHIOPIAN_REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">City / Subcity</label>
                  <input
                    type="text"
                    value={formData.citySubcity}
                    onChange={(e) => setFormData({ ...formData, citySubcity: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#df2531]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Physical Office / Depot Address <span className="text-[#df2531]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#df2531]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Specialization</label>
                  <select
                    value={formData.specialization}
                    onChange={(e) =>
                      setFormData({ ...formData, specialization: e.target.value as Broker["specialization"] })
                    }
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#df2531]"
                  >
                    {SPECIALIZATIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Fayda FIN or TIN</label>
                  <input
                    type="text"
                    value={formData.faydaFinNumber}
                    onChange={(e) => setFormData({ ...formData, faydaFinNumber: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#df2531] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#df2531]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setBrokerToEdit(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold text-xs shadow-md shadow-[#df2531]/25 transition-all disabled:opacity-50 font-display"
                >
                  {isSubmitting ? "Updating..." : "Update Broker"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ==================================================== */}
      {isDeleteModalOpen && brokerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl p-6 text-neutral-200">
            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Broker Record</h3>
                <p className="text-xs text-neutral-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed mb-6">
              Are you sure you want to remove{" "}
              <strong className="text-white">{brokerToDelete.fullName}</strong> ({brokerToDelete.commissionPct}% commission, {brokerToDelete.regionLocation.region}) from the active broker registry?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setBrokerToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteBroker}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
