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
  Upload,
  FileCheck,
  ExternalLink,
  Eye,
} from "lucide-react";
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { firestore, isFirebaseConfigured } from "@/lib/firebase";
import { uploadFileToStorage } from "@/lib/firebase-cloud";
import { Broker } from "@/lib/types";
import { INITIAL_BROKERS } from "@/lib/db";
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
  const [uploadStatus, setUploadStatus] = useState("");

  // New Broker Form State (All Required Fields)
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
    faydaFinStatus: "verified" as "verified" | "pending" | "unverified",
    dealsClosedCount: 0,
    totalCommissionPaidETB: 0,
    bankName: "Commercial Bank of Ethiopia (CBE)",
    accountNumber: "",
    accountHolderName: "",
    notes: "",
  };
  const [formData, setFormData] = useState(initialFormState);

  // Attached File Upload States for Firebase Cloud Storage (brokers/{brokerId}/...)
  const [attachedIdFile, setAttachedIdFile] = useState<File | null>(null);
  const [attachedIdFileName, setAttachedIdFileName] = useState("");
  const [attachedAgreementFile, setAttachedAgreementFile] = useState<File | null>(null);
  const [attachedAgreementFileName, setAttachedAgreementFileName] = useState("");

  // Edit Modal File Upload States
  const [editAttachedIdFile, setEditAttachedIdFile] = useState<File | null>(null);
  const [editAttachedAgreementFile, setEditAttachedAgreementFile] = useState<File | null>(null);

  // Fetch Brokers from API as fallback
  const fetchBrokers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/brokers");
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data.success && Array.isArray(data.data)) {
            setBrokers(data.data);
          }
        } catch {
          // not JSON
        }
      }
    } catch (err) {
      console.warn("Failed to load brokers from API:", err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Dedicated Cloud Firestore Real-time onSnapshot Listener
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (firestore && isFirebaseConfigured) {
      try {
        const brokersCol = collection(firestore, "brokers");
        unsubscribe = onSnapshot(
          brokersCol,
          async (snapshot) => {
            if (!snapshot.empty) {
              const loadedBrokers = snapshot.docs.map((docSnap) => ({
                ...docSnap.data(),
                id: docSnap.id,
              })) as Broker[];
              setBrokers(loadedBrokers);
              setLoading(false);
            } else {
              // If collection is empty, seed INITIAL_BROKERS once
              try {
                for (const b of INITIAL_BROKERS) {
                  await setDoc(doc(firestore, "brokers", b.id), b);
                }
              } catch (seedErr) {
                console.warn("Seeding initial brokers error:", seedErr);
              }
              setBrokers([...INITIAL_BROKERS]);
              setLoading(false);
            }
          },
          (err) => {
            console.warn("Firestore brokers onSnapshot error:", err);
            fetchBrokers();
          }
        );
      } catch (err) {
        console.warn("Failed to subscribe to Firestore brokers collection:", err);
        fetchBrokers();
      }
    } else {
      fetchBrokers();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
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
      b.fullName?.toLowerCase().includes(trimmedSearch) ||
      b.phoneNumber?.toLowerCase().includes(trimmedSearch) ||
      b.address?.toLowerCase().includes(trimmedSearch) ||
      b.regionLocation?.region?.toLowerCase().includes(trimmedSearch) ||
      (b.regionLocation?.citySubcity && b.regionLocation.citySubcity.toLowerCase().includes(trimmedSearch)) ||
      (b.specialization && b.specialization.toLowerCase().includes(trimmedSearch));

    const matchesRegion =
      selectedRegion === "all" ||
      b.regionLocation?.region?.toLowerCase() === selectedRegion.toLowerCase();

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
      ? (brokers.reduce((acc, b) => acc + (b.commissionPct || 0), 0) / totalBrokers).toFixed(1)
      : "7.0";

  // 1 & 2. Handle Add New Broker Form (Firestore addDoc/setDoc + Storage Upload)
  const handleCreateBroker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phoneNumber.trim() || !formData.address.trim()) {
      showNotification("error", "Full Name, Phone Number, and Address are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const brokerId = `brk-${Date.now()}`;

      // 1. Upload Broker ID Document to Firebase Storage: brokers/{brokerId}/...
      let idDocUrl = "";
      let idDocName = "";
      if (attachedIdFile) {
        setUploadStatus("Uploading Broker ID to Firebase Storage...");
        const path = `brokers/${brokerId}/id_${Date.now()}_${attachedIdFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        idDocUrl = await uploadFileToStorage(attachedIdFile, path);
        idDocName = attachedIdFile.name;
      }

      // 2. Upload Broker Agreement Document to Firebase Storage: brokers/{brokerId}/...
      let agreementDocUrl = "";
      let agreementDocName = "";
      if (attachedAgreementFile) {
        setUploadStatus("Uploading Broker Agreement to Firebase Storage...");
        const path = `brokers/${brokerId}/agreement_${Date.now()}_${attachedAgreementFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        agreementDocUrl = await uploadFileToStorage(attachedAgreementFile, path);
        agreementDocName = attachedAgreementFile.name;
      }

      setUploadStatus("Saving broker to Cloud Firestore...");

      // Prepare complete Broker document
      const newBrokerData: Broker = {
        id: brokerId,
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim() || undefined,
        address: formData.address.trim(),
        regionLocation: {
          region: formData.region,
          citySubcity: formData.citySubcity.trim() || undefined,
        },
        commissionPct: Number(formData.commissionPct) || 5.0,
        specialization: formData.specialization || "Heavy Machinery",
        tinNumber: formData.tinNumber.trim() || undefined,
        nationalIdNumber: formData.nationalIdNumber.trim() || undefined,
        faydaFinNumber: formData.faydaFinNumber.trim() || undefined,
        faydaFinStatus: formData.faydaFinStatus || "verified",
        dealsClosedCount: Number(formData.dealsClosedCount) || 0,
        totalCommissionPaidETB: Number(formData.totalCommissionPaidETB) || 0,
        idDocumentUrl: idDocUrl || undefined,
        idDocumentName: idDocName || undefined,
        agreementDocumentUrl: agreementDocUrl || undefined,
        agreementDocumentName: agreementDocName || undefined,
        payoutBank: {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber.trim() || "1000000000000",
          accountHolderName: formData.accountHolderName.trim() || formData.fullName.trim(),
        },
        notes: formData.notes.trim() || undefined,
        status: "active",
        createdAt: new Date().toISOString(),
      };

      // 3. Directly save to Cloud Firestore collection "brokers" via setDoc
      if (firestore && isFirebaseConfigured) {
        try {
          const brokerDocRef = doc(firestore, "brokers", brokerId);
          await setDoc(brokerDocRef, newBrokerData);
        } catch (fsErr) {
          console.warn("Direct Firestore setDoc error:", fsErr);
        }
      }

      // 4. Also call API route to ensure server-side DB synchronization safely
      try {
        const res = await fetch("/api/v1/brokers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newBrokerData),
        });
        if (res.ok) {
          await res.json().catch(() => ({}));
        }
      } catch (apiErr) {
        console.warn("API broker sync warning:", apiErr);
      }

      showNotification("success", `Broker "${newBrokerData.fullName}" successfully registered & saved to Cloud Firestore!`);
      setIsAddModalOpen(false);
      setFormData(initialFormState);
      setAttachedIdFile(null);
      setAttachedIdFileName("");
      setAttachedAgreementFile(null);
      setAttachedAgreementFileName("");
    } catch (err: any) {
      showNotification("error", err.message || "Network error while saving broker.");
    } finally {
      setIsSubmitting(false);
      setUploadStatus("");
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
      region: broker.regionLocation?.region || "Addis Ababa",
      citySubcity: broker.regionLocation?.citySubcity || "",
      commissionPct: broker.commissionPct,
      specialization: broker.specialization || "Heavy Machinery",
      tinNumber: broker.tinNumber || "",
      nationalIdNumber: broker.nationalIdNumber || "",
      faydaFinNumber: broker.faydaFinNumber || "",
      faydaFinStatus: broker.faydaFinStatus || "verified",
      dealsClosedCount: broker.dealsClosedCount || 0,
      totalCommissionPaidETB: broker.totalCommissionPaidETB || 0,
      bankName: broker.payoutBank?.bankName || "Commercial Bank of Ethiopia (CBE)",
      accountNumber: broker.payoutBank?.accountNumber || "",
      accountHolderName: broker.payoutBank?.accountHolderName || broker.fullName,
      notes: broker.notes || "",
    });
    setEditAttachedIdFile(null);
    setEditAttachedAgreementFile(null);
    setIsEditModalOpen(true);
  };

  // 3. Handle Update Broker (Firestore updateDoc + API)
  const handleUpdateBroker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brokerToEdit) return;

    try {
      setIsSubmitting(true);
      setUploadStatus("Updating broker parameters...");

      let updatedIdUrl = brokerToEdit.idDocumentUrl;
      let updatedIdName = brokerToEdit.idDocumentName;
      if (editAttachedIdFile) {
        setUploadStatus("Uploading new Broker ID to Firebase Storage...");
        const path = `brokers/${brokerToEdit.id}/id_${Date.now()}_${editAttachedIdFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        updatedIdUrl = await uploadFileToStorage(editAttachedIdFile, path);
        updatedIdName = editAttachedIdFile.name;
      }

      let updatedAgreementUrl = brokerToEdit.agreementDocumentUrl;
      let updatedAgreementName = brokerToEdit.agreementDocumentName;
      if (editAttachedAgreementFile) {
        setUploadStatus("Uploading new Broker Agreement to Firebase Storage...");
        const path = `brokers/${brokerToEdit.id}/agreement_${Date.now()}_${editAttachedAgreementFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        updatedAgreementUrl = await uploadFileToStorage(editAttachedAgreementFile, path);
        updatedAgreementName = editAttachedAgreementFile.name;
      }

      const updatedBrokerData: Partial<Broker> = {
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
        faydaFinStatus: formData.faydaFinStatus,
        dealsClosedCount: Number(formData.dealsClosedCount) || 0,
        totalCommissionPaidETB: Number(formData.totalCommissionPaidETB) || 0,
        idDocumentUrl: updatedIdUrl,
        idDocumentName: updatedIdName,
        agreementDocumentUrl: updatedAgreementUrl,
        agreementDocumentName: updatedAgreementName,
        payoutBank: {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber.trim() || "1000000000000",
          accountHolderName: formData.accountHolderName.trim() || formData.fullName.trim(),
        },
        notes: formData.notes.trim() || undefined,
      };

      // 1. Direct Cloud Firestore updateDoc
      if (firestore && isFirebaseConfigured) {
        try {
          const brokerDocRef = doc(firestore, "brokers", brokerToEdit.id);
          await updateDoc(brokerDocRef, {
            ...updatedBrokerData,
            updatedAt: new Date().toISOString(),
          });
        } catch (fsErr) {
          console.warn("Direct Firestore updateDoc error:", fsErr);
        }
      }

      // 2. Sync to API route safely
      try {
        const res = await fetch("/api/v1/brokers", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: brokerToEdit.id,
            ...updatedBrokerData,
          }),
        });
        if (res.ok) {
          await res.json().catch(() => ({}));
        }
      } catch (apiErr) {
        console.warn("API broker update warning:", apiErr);
      }

      showNotification("success", `Broker "${formData.fullName}" updated permanently in Cloud Firestore!`);
      setIsEditModalOpen(false);
      setBrokerToEdit(null);
    } catch (err: any) {
      showNotification("error", err.message || "Network error while updating broker.");
    } finally {
      setIsSubmitting(false);
      setUploadStatus("");
    }
  };

  // 3. Handle Delete Broker (Firestore deleteDoc + API)
  const handleDeleteBroker = async () => {
    if (!brokerToDelete) return;

    try {
      setIsSubmitting(true);

      // 1. Direct Cloud Firestore deleteDoc
      if (firestore && isFirebaseConfigured) {
        try {
          const brokerDocRef = doc(firestore, "brokers", brokerToDelete.id);
          await deleteDoc(brokerDocRef);
        } catch (fsErr) {
          console.warn("Direct Firestore deleteDoc error:", fsErr);
        }
      }

      // 2. Sync to API route safely
      try {
        const res = await fetch(`/api/v1/brokers?id=${brokerToDelete.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          await res.json().catch(() => ({}));
        }
      } catch (apiErr) {
        console.warn("API broker delete warning:", apiErr);
      }

      showNotification("success", `Broker "${brokerToDelete.fullName}" has been permanently removed.`);
      setIsDeleteModalOpen(false);
      setBrokerToDelete(null);
    } catch (err: any) {
      showNotification("error", err.message || "Network error while deleting broker.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {notification && (
        <div
          className={cn(
            "fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-semibold transition-all duration-300",
            notification.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"
              : "bg-rose-950/90 border-rose-500/40 text-rose-200"
          )}
        >
          {notification.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-[#0a0a0a] border border-[#df2531]/30 shadow-lg">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 font-display">
            <Briefcase className="text-[#df2531]" size={24} />
            Ethiopian Brokers &amp; Sourcing Agents Directory
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Permanent Cloud Firestore registry, Firebase Storage documents, Fayda FIN verification, and commission payout management.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData(initialFormState);
            setAttachedIdFile(null);
            setAttachedIdFileName("");
            setAttachedAgreementFile(null);
            setAttachedAgreementFileName("");
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold text-xs shadow-md shadow-[#df2531]/30 border border-[#df2531]/50 transition-all font-display cursor-pointer"
        >
          <Plus size={16} />
          <span>Add New Broker</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Active Brokers</span>
            <UserCheck size={16} className="text-[#df2531]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-display">{totalBrokers}</div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">
            {brokers.filter((b) => b.faydaFinStatus === "verified" || b.faydaFinNumber).length} Fayda verified
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Commission</span>
            <Percent size={16} className="text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-display">
            {avgCommission}%
          </div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">Standard 5% - 10% rate</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Total Deals Sourced</span>
            <TrendingUp size={16} className="text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-display">{totalDeals}</div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">Closed lease contracts</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Total Commission</span>
            <DollarSign size={16} className="text-[#df2531]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#df2531] font-display">
            {formatETB(totalCommissionETB)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">Disbursed to date</div>
        </div>
      </div>

      {/* Search, Filter Bar & Specialization Pills */}
      <div className="space-y-3 bg-[#0a0a0a] border border-[#df2531]/20 p-4 rounded-2xl">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search Broker Name, Phone, Region, or Subcity..."
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

          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-[#df2531] shrink-0 hidden sm:block" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-[#df2531] font-medium"
            >
              <option value="all">All Regions &amp; Corridors</option>
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
                "px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors border cursor-pointer",
                selectedSpec === spec
                  ? "bg-[#df2531] text-white border-[#df2531] font-display font-bold shadow-sm"
                  : "bg-neutral-900/80 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              )}
            >
              {spec === "all" ? "All Assets" : spec}
            </button>
          ))}
        </div>
      </div>

      {/* Brokers Directory Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="inline-block w-8 h-8 border-2 border-[#df2531] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-neutral-400 font-mono">Synchronizing broker records from Cloud Firestore...</p>
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
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredBrokers.map((broker) => {
            const isNameMatched = trimmedSearch && broker.fullName?.toLowerCase().includes(trimmedSearch);
            const isFaydaVerified = broker.faydaFinStatus === "verified" || Boolean(broker.faydaFinNumber);

            return (
              <div
                key={broker.id}
                className={cn(
                  "group relative rounded-2xl bg-[#0a0a0a] border p-5 transition-all duration-200 hover:border-[#df2531]/50 hover:shadow-xl hover:shadow-[#df2531]/10 flex flex-col justify-between",
                  isNameMatched ? "border-[#df2531] ring-1 ring-[#df2531]/40 bg-neutral-950" : "border-neutral-800"
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#df2531]/25 to-[#df2531]/10 border border-[#df2531]/30 flex items-center justify-center text-[#df2531] font-black text-sm shrink-0 shadow-inner font-display">
                        {broker.fullName
                          ?.split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("") || "BR"}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-sm font-bold text-white group-hover:text-[#df2531] transition-colors font-display">
                            {broker.fullName}
                          </h3>
                        </div>

                        {/* Specialization & Region Tags */}
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300">
                            {broker.specialization || "All Assets"}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400">
                            {broker.regionLocation?.region}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
                        {broker.commissionPct}%
                      </span>
                    </div>
                  </div>

                  {/* Fayda FIN Verification Badge */}
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border",
                        isFaydaVerified
                          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                          : "bg-amber-500/15 border-amber-500/30 text-amber-300"
                      )}
                    >
                      <ShieldCheck size={11} />
                      {isFaydaVerified ? "Fayda FIN Verified" : "Fayda Verification Pending"}
                    </span>
                    {broker.faydaFinNumber && (
                      <span className="text-[10px] font-mono text-neutral-400 truncate max-w-[150px]">
                        {broker.faydaFinNumber}
                      </span>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1.5 text-xs text-neutral-300 mb-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/80">
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

                    <div className="flex items-start justify-between gap-2 pt-1 border-t border-neutral-800/60">
                      <span className="text-neutral-400 shrink-0 flex items-center gap-1.5">
                        <MapPin size={13} className="text-[#df2531]" /> Address:
                      </span>
                      <span className="text-neutral-300 text-right font-medium truncate max-w-[200px]">
                        {broker.address}
                      </span>
                    </div>

                    {broker.payoutBank && (
                      <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60 text-[11px]">
                        <span className="text-neutral-400 flex items-center gap-1.5">
                          <Building2 size={12} className="text-[#df2531]" /> Payout:
                        </span>
                        <span className="font-mono text-neutral-300 truncate max-w-[170px]">
                          {broker.payoutBank.bankName.split("(")[0]} ({broker.payoutBank.accountNumber?.slice(-4) || "0000"})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Cloud Documents Links */}
                  {(broker.idDocumentUrl || broker.agreementDocumentUrl) && (
                    <div className="flex items-center gap-2 mb-3 px-1 text-[10px]">
                      <span className="text-neutral-500 font-semibold uppercase">Cloud Docs:</span>
                      {broker.idDocumentUrl && (
                        <a
                          href={broker.idDocumentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-[#df2531]/50 transition-colors"
                        >
                          <FileCheck size={11} className="text-[#df2531]" />
                          <span>ID File</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                      {broker.agreementDocumentUrl && (
                        <a
                          href={broker.agreementDocumentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-emerald-500/50 transition-colors"
                        >
                          <FileText size={11} className="text-emerald-400" />
                          <span>Agreement</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  )}

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
                    <button
                      onClick={() => openEditModal(broker)}
                      title="Edit Broker Details"
                      className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      onClick={() => {
                        setBrokerToDelete(broker);
                        setIsDeleteModalOpen(true);
                      }}
                      title="Delete Broker"
                      className="p-2 rounded-xl bg-neutral-800 hover:bg-rose-950/60 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
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
      {/* ADD NEW BROKER MODAL (All Required Fields + Storage) */}
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
                    Saved permanently to Cloud Firestore &amp; Firebase Storage.
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
                    City / Subcity / Corridor
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bole Subcity / Adama Corridor"
                    value={formData.citySubcity}
                    onChange={(e) => setFormData({ ...formData, citySubcity: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#df2531]"
                  />
                </div>

                {/* Specialization */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Asset Specialization Category *
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

                {/* Fayda FIN Verification Status */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Fayda FIN Verification Status *
                  </label>
                  <select
                    value={formData.faydaFinStatus}
                    onChange={(e) => setFormData({ ...formData, faydaFinStatus: e.target.value as any })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#df2531]"
                  >
                    <option value="verified">Verified (Active KYC)</option>
                    <option value="pending">Pending Document Verification</option>
                    <option value="unverified">Unverified</option>
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

                {/* Deals Closed Count */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Deals Closed (Contracts Sourced)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.dealsClosedCount}
                    onChange={(e) => setFormData({ ...formData, dealsClosedCount: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#df2531] font-mono"
                  />
                </div>

                {/* Total Commission Disbursed */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Total Commission Disbursed (ETB)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalCommissionPaidETB}
                    onChange={(e) => setFormData({ ...formData, totalCommissionPaidETB: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-emerald-400 font-bold focus:outline-none focus:border-[#df2531] font-mono"
                  />
                </div>
              </div>

              {/* Physical Office Address */}
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

              {/* Document Attachments for Firebase Storage */}
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <span className="text-xs font-bold text-[#df2531] uppercase tracking-wider block font-display flex items-center gap-1.5">
                  <Upload size={14} />
                  Attached Documents (Stored permanently in Firebase Cloud Storage: brokers/&#123;id&#125;/...)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Broker ID File */}
                  <div className="p-3 rounded-xl border border-dashed border-neutral-800 hover:border-[#df2531]/50 bg-black/40">
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Broker NID / Fayda ID Document
                    </label>
                    {attachedIdFile ? (
                      <div className="flex items-center justify-between text-xs text-emerald-400 font-mono">
                        <span className="truncate flex items-center gap-1">
                          <FileCheck size={14} />
                          <strong className="truncate max-w-[160px]">{attachedIdFileName}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setAttachedIdFile(null);
                            setAttachedIdFileName("");
                          }}
                          className="text-rose-400 hover:text-rose-300 text-[10px] font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center gap-1 py-1.5 cursor-pointer text-center">
                        <Upload size={16} className="text-[#df2531]" />
                        <span className="text-[11px] text-neutral-400">Upload Broker ID (PDF, JPG, PNG)</span>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setAttachedIdFile(e.target.files[0]);
                              setAttachedIdFileName(e.target.files[0].name);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {/* Broker Agreement File */}
                  <div className="p-3 rounded-xl border border-dashed border-neutral-800 hover:border-emerald-500/50 bg-black/40">
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Broker Commission Agreement Contract
                    </label>
                    {attachedAgreementFile ? (
                      <div className="flex items-center justify-between text-xs text-emerald-400 font-mono">
                        <span className="truncate flex items-center gap-1">
                          <FileText size={14} />
                          <strong className="truncate max-w-[160px]">{attachedAgreementFileName}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setAttachedAgreementFile(null);
                            setAttachedAgreementFileName("");
                          }}
                          className="text-rose-400 hover:text-rose-300 text-[10px] font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center gap-1 py-1.5 cursor-pointer text-center">
                        <Upload size={16} className="text-emerald-400" />
                        <span className="text-[11px] text-neutral-400">Upload Agreement Contract (PDF)</span>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setAttachedAgreementFile(e.target.files[0]);
                              setAttachedAgreementFileName(e.target.files[0].name);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
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

              {uploadStatus && (
                <div className="p-2.5 rounded-lg bg-[#df2531]/10 border border-[#df2531]/30 text-[#df2531] text-xs flex items-center gap-2 animate-pulse">
                  <Sparkles size={14} />
                  <span>{uploadStatus}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold text-xs shadow-md shadow-[#df2531]/25 transition-all disabled:opacity-50 font-display flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Permanently Saving...</span>
                    </>
                  ) : (
                    <span>Save &amp; Register Broker</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* EDIT BROKER MODAL (Firestore updateDoc) */}
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
                  <p className="text-xs text-neutral-400 font-sans">Update contact, address, or commission parameters in Cloud Firestore.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setBrokerToEdit(null);
                }}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
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
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Fayda FIN Verification Status
                  </label>
                  <select
                    value={formData.faydaFinStatus}
                    onChange={(e) => setFormData({ ...formData, faydaFinStatus: e.target.value as any })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#df2531]"
                  >
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="unverified">Unverified</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Deals Closed</label>
                  <input
                    type="number"
                    value={formData.dealsClosedCount}
                    onChange={(e) => setFormData({ ...formData, dealsClosedCount: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Total Commission Paid (ETB)</label>
                  <input
                    type="number"
                    value={formData.totalCommissionPaidETB}
                    onChange={(e) => setFormData({ ...formData, totalCommissionPaidETB: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-emerald-400 font-bold font-mono"
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

              {/* Upload Replacement Files in Edit Modal */}
              <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                <span className="text-xs font-bold text-neutral-300 block">Replace Cloud Documents in Storage</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">New Broker ID Document</label>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => e.target.files && setEditAttachedIdFile(e.target.files[0])}
                      className="text-xs text-neutral-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-neutral-800 file:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">New Agreement Contract</label>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => e.target.files && setEditAttachedAgreementFile(e.target.files[0])}
                      className="text-xs text-neutral-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-neutral-800 file:text-white"
                    />
                  </div>
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
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold text-xs shadow-md shadow-[#df2531]/25 transition-all disabled:opacity-50 font-display cursor-pointer"
                >
                  {isSubmitting ? "Updating..." : "Update Broker in Cloud"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* DELETE CONFIRMATION MODAL (Firestore deleteDoc) */}
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
                <p className="text-xs text-neutral-400">Permanently removes broker from Cloud Firestore.</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed mb-6">
              Are you sure you want to permanently remove{" "}
              <strong className="text-white">{brokerToDelete.fullName}</strong> ({brokerToDelete.commissionPct}% commission, {brokerToDelete.regionLocation?.region}) from the active broker registry?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setBrokerToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteBroker}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all disabled:opacity-50 cursor-pointer"
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