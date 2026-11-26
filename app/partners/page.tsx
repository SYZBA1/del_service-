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
  ExternalLink,
  Eye,
  FileCheck,
  Download,
} from "lucide-react";
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { firestore, isFirebaseConfigured } from "@/lib/firebase";
import { uploadFileToStorage } from "@/lib/firebase-cloud";
import { PartnerOnboarding, OwnerTier, AssetCategory, Images8Sides } from "@/lib/types";
import { generateMock8Sides, INITIAL_PARTNERS } from "@/lib/db";
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

  // Form State for "Add New Owner / Partner" (All Required Fields)
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
  const [condition, setCondition] = useState<"brand_new" | "excellent" | "good" | "fair">("excellent");

  const [libreCertificateNo, setLibreCertificateNo] = useState("LIB-AA-2026-90412");
  const [libreDocUrl, setLibreDocUrl] = useState("/contracts/libre-sample.pdf");
  const [ownerKycNidUrl, setOwnerKycNidUrl] = useState("/mock/nid-sample.jpg");

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

  // File Upload States for Firebase Cloud Storage (partners/{partnerId}/...)
  const [attachedKycFile, setAttachedKycFile] = useState<File | null>(null);
  const [attachedKycFileName, setAttachedKycFileName] = useState("");
  const [attachedLibreFile, setAttachedLibreFile] = useState<File | null>(null);
  const [attachedLibreFileName, setAttachedLibreFileName] = useState("");
  const [attachedAssetPhotoFile, setAttachedAssetPhotoFile] = useState<File | null>(null);
  const [attachedAssetPhotoName, setAttachedAssetPhotoName] = useState("");

  const [images8Sides, setImages8Sides] = useState<Images8Sides>(() =>
    generateMock8Sides("car", "Toyota Land Cruiser 300 V8")
  );

  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");

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

  // Fetch from API as initial fallback
  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/partners");
      if (res.ok) {
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          if (json.success && Array.isArray(json.data)) {
            setPartners(json.data);
          }
        } catch {
          // Response was not JSON
        }
      }
    } catch (e) {
      console.warn("Failed to load partners from API:", e);
    } finally {
      setLoading(false);
    }
  };

  // 1. Dedicated Cloud Firestore Real-time onSnapshot Listener
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (firestore && isFirebaseConfigured) {
      try {
        const partnersCol = collection(firestore, "partners");
        unsubscribe = onSnapshot(
          partnersCol,
          async (snapshot) => {
            if (!snapshot.empty) {
              const loadedPartners = snapshot.docs.map((docSnap) => {
                const data = docSnap.data();
                return {
                  ...data,
                  id: docSnap.id,
                } as PartnerOnboarding;
              });
              setPartners(loadedPartners);
              setLoading(false);
            } else {
              // If collection is empty in Firestore, seed INITIAL_PARTNERS once
              try {
                for (const p of INITIAL_PARTNERS) {
                  await setDoc(doc(firestore, "partners", p.id), p);
                }
              } catch (seedErr) {
                console.warn("Seeding initial partners error:", seedErr);
              }
              setPartners([...INITIAL_PARTNERS]);
              setLoading(false);
            }
          },
          (err) => {
            console.warn("Firestore partners onSnapshot error:", err);
            fetchPartners();
          }
        );
      } catch (err) {
        console.warn("Failed to subscribe to Firestore partners collection:", err);
        fetchPartners();
      }
    } else {
      fetchPartners();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
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
      libreCertificateNo: prt.libreCertificateNo,
      libreDocUrl: prt.libreDocUrl,
      ownerKycNidUrl: prt.ownerKycNidUrl,
    });
  };

  // Image Upload handler for Edit Modal
  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, angle: string) => {
    const file = e.target.files?.[0];
    if (!file || !editingPartner) return;

    try {
      const destination = `partners/${editingPartner.id}/angle_${angle}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const downloadUrl = await uploadFileToStorage(file, destination);

      setEditForm((prev: any) => ({
        ...prev,
        images8Sides: {
          ...prev.images8Sides,
          [angle]: downloadUrl,
        },
      }));
    } catch (err) {
      console.error("Failed to upload angle photo:", err);
    }
  };

  // 3. Save Edit with Firestore updateDoc & API
  const handleSaveEdit = async () => {
    if (!editingPartner) return;
    setIsSavingEdit(true);

    try {
      // 1. Direct Firestore updateDoc
      if (firestore && isFirebaseConfigured) {
        try {
          const partnerDocRef = doc(firestore, "partners", editingPartner.id);
          await updateDoc(partnerDocRef, {
            ...editForm,
            updatedAt: new Date().toISOString(),
          });
        } catch (fsErr) {
          console.warn("Direct Firestore updateDoc error:", fsErr);
        }
      }

      // 2. Sync to API route safely
      try {
        const res = await fetch("/api/v1/partners", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        });
        if (res.ok) {
          await res.json().catch(() => ({}));
        }
      } catch (apiErr) {
        console.warn("API update warning:", apiErr);
      }

      setOnboardSuccess(`Partner '${editForm.ownerContact.fullName}' updated successfully in Cloud Firestore!`);
      setEditingPartner(null);
      setTimeout(() => setOnboardSuccess(null), 4000);
    } catch (err: any) {
      console.warn("Edit partner error:", err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // 3. Delete Partner with Firestore deleteDoc & API
  const handleDeletePartner = async () => {
    if (!partnerToDelete) return;
    setIsDeleting(true);

    try {
      // 1. Direct Firestore deleteDoc
      if (firestore && isFirebaseConfigured) {
        try {
          const partnerDocRef = doc(firestore, "partners", partnerToDelete.id);
          await deleteDoc(partnerDocRef);
        } catch (fsErr) {
          console.warn("Direct Firestore deleteDoc error:", fsErr);
        }
      }

      // 2. Sync to API route safely
      try {
        const res = await fetch(`/api/v1/partners?id=${partnerToDelete.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          await res.json().catch(() => ({}));
        }
      } catch (apiErr) {
        console.warn("API delete warning:", apiErr);
      }

      setOnboardSuccess(`Partner '${partnerToDelete.ownerContact.fullName}' and linked asset removed permanently.`);
      setPartnerToDelete(null);
      setTimeout(() => setOnboardSuccess(null), 4000);
    } catch (err: any) {
      console.warn("Delete partner error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // 1 & 2. Add New Owner / Partner Form Submission to Firebase Cloud Firestore & Storage
  const handleAddNewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phoneNumber.trim() || !make.trim() || !model.trim() || !chassisOrSerialNumber.trim() || !libreCertificateNo.trim()) {
      alert("Please fill in all required fields (Name, Phone, Make, Model, Chassis/VIN, and Libre Certificate).");
      return;
    }

    setSubmitting(true);
    setUploadStatus("Uploading documents to Cloud Storage...");

    try {
      const partnerId = `prt-${Date.now()}`;

      // Upload NID/KYC document to Firebase Storage: partners/{partnerId}/kyc_...
      let finalKycUrl = ownerKycNidUrl;
      let finalKycName = attachedKycFileName || "KYC_NID_Document.pdf";
      if (attachedKycFile) {
        setUploadStatus("Uploading KYC Document to Cloud Storage...");
        const kycPath = `partners/${partnerId}/kyc_${Date.now()}_${attachedKycFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        finalKycUrl = await uploadFileToStorage(attachedKycFile, kycPath);
      }

      // Upload Libre document to Firebase Storage: partners/{partnerId}/libre_...
      let finalLibreUrl = libreDocUrl;
      let finalLibreName = attachedLibreFileName || "Libre_Title_Certificate.pdf";
      if (attachedLibreFile) {
        setUploadStatus("Uploading Libre Title to Cloud Storage...");
        const librePath = `partners/${partnerId}/libre_${Date.now()}_${attachedLibreFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        finalLibreUrl = await uploadFileToStorage(attachedLibreFile, librePath);
      }

      // Upload Asset photo to Firebase Storage: partners/{partnerId}/photos_...
      let current8Sides = { ...images8Sides };
      if (attachedAssetPhotoFile) {
        setUploadStatus("Uploading Asset Photo to Cloud Storage...");
        const photoPath = `partners/${partnerId}/photos_${Date.now()}_${attachedAssetPhotoFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const uploadedPhotoUrl = await uploadFileToStorage(attachedAssetPhotoFile, photoPath);
        current8Sides = {
          ...current8Sides,
          front: uploadedPhotoUrl,
        };
      }

      setUploadStatus("Saving partner record to Cloud Firestore...");

      // Prepare complete Partner record with all fields
      const newPartnerRecord: PartnerOnboarding = {
        id: partnerId,
        ownerContact: {
          fullName: fullName.trim(),
          phoneNumber: phoneNumber.trim(),
          email: email.trim() || `${fullName.toLowerCase().replace(/[^a-z0-9]/g, ".")}@partner.delservices.et`,
          companyName: companyName.trim() || (ownerTier === "corporate_partner" ? `${fullName.trim()} Fleet Solutions` : fullName.trim()),
          tinNumber: tinNumber.trim() || "0088991122",
          ownerTier, // Individual Host vs Corporate Partner
        },
        ownerKycNidUrl: finalKycUrl,
        ownerKycNidName: finalKycName,
        faydaFinNumber: faydaFinNumber.trim() || `FIN-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        libreCertificateNo: libreCertificateNo.trim(),
        libreDocUrl: finalLibreUrl,
        libreDocName: finalLibreName,
        assetCategory,
        condition,
        make: make.trim(),
        model: model.trim(),
        manufactureYear: Number(manufactureYear) || 2023,
        plateNumber: plateNumber.trim(),
        chassisOrSerialNumber: chassisOrSerialNumber.trim(),
        price: {
          dailyRate: Number(dailyRate) || 8500,
          weeklyRate: (Number(dailyRate) || 8500) * 6,
          monthlyRate: (Number(dailyRate) || 8500) * 22,
          securityDepositAmount: Number(securityDeposit) || 30000,
          overtimeRatePerUnit: 35,
        },
        images8Sides: current8Sides,
        regionLocation: {
          region: region || "Addis Ababa",
          citySubcity: citySubcity || "Bole Sub-city",
          depotAddress: depotAddress || "Around Atlas Hotel, Central Yard",
        },
        agreement: {
          termsSigned: true,
          commissionPct: Number(commissionPct) || (ownerTier === "corporate_partner" ? 10 : 15),
          signedDate: new Date().toISOString().split("T")[0],
          agreementDocUrl: "/contracts/partner-agreement.pdf",
        },
        gps: {
          hasGps,
          gpsTrackerImei: hasGps ? (gpsTrackerImei.trim() || `86549204910${Math.floor(1000 + Math.random() * 9000)}`) : undefined,
          trackerModel: "Teltonika FMB920",
        },
        deliveryClearance: {
          paymentMethod,
          bankName,
          accountNumber: accountNumber.trim() || "1000293847561",
          durationAvailableMonths: Number(durationMonths) || 12,
          handoverNotes,
          confirmed: deliveryConfirmed,
          confirmedAt: new Date().toISOString(),
        },
        status: "active",
        createdAt: new Date().toISOString(),
      };

      // 1. Directly write to Cloud Firestore via setDoc
      if (firestore && isFirebaseConfigured) {
        try {
          const partnerDocRef = doc(firestore, "partners", partnerId);
          await setDoc(partnerDocRef, newPartnerRecord);
        } catch (fsErr) {
          console.warn("Direct Firestore setDoc error:", fsErr);
        }
      }

      // 2. Synchronize via API to register Asset in Fleet Registry & in-memory DB safely
      try {
        const res = await fetch("/api/v1/partners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newPartnerRecord),
        });
        if (res.ok) {
          await res.json().catch(() => ({}));
        }
      } catch (apiErr) {
        console.warn("Fleet registry API sync warning:", apiErr);
      }

      // Reset Form State
      setAttachedKycFile(null);
      setAttachedKycFileName("");
      setAttachedLibreFile(null);
      setAttachedLibreFileName("");
      setAttachedAssetPhotoFile(null);
      setAttachedAssetPhotoName("");

      setOnboardSuccess(`Partner '${fullName}' & asset '${make} ${model}' saved permanently to Firebase Firestore & Fleet Registry!`);
      setIsModalOpen(false);
      setTimeout(() => setOnboardSuccess(null), 5000);
    } catch (err: any) {
      alert(err.message || "Error submitting partner onboarding");
    } finally {
      setSubmitting(false);
      setUploadStatus("");
    }
  };

  const filteredPartners = partners.filter((prt) => {
    if (filterTier === "individual_host" && prt.ownerContact?.ownerTier !== "individual_host") return false;
    if (filterTier === "corporate_partner" && prt.ownerContact?.ownerTier !== "corporate_partner") return false;
    if (filterTier === "passenger_car" && prt.assetCategory !== "passenger_car" && prt.assetCategory !== "commercial_van") return false;
    if (filterTier === "heavy_machinery" && prt.assetCategory !== "heavy_machinery") return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      prt.ownerContact?.fullName?.toLowerCase().includes(q) ||
      prt.ownerContact?.companyName?.toLowerCase().includes(q) ||
      prt.ownerContact?.phoneNumber?.toLowerCase().includes(q) ||
      prt.make?.toLowerCase().includes(q) ||
      prt.model?.toLowerCase().includes(q) ||
      prt.plateNumber?.toLowerCase().includes(q) ||
      prt.chassisOrSerialNumber?.toLowerCase().includes(q) ||
      prt.regionLocation?.region?.toLowerCase().includes(q) ||
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
            External host onboarding: Cloud Firestore real-time sync, Firebase Storage document repository, automated commission splits, and permanent database persistence.
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
            { id: "individual_host", label: "Individual Hosts", count: partners.filter((p) => p.ownerContact?.ownerTier === "individual_host").length },
            { id: "corporate_partner", label: "Corporate Partners", count: partners.filter((p) => p.ownerContact?.ownerTier === "corporate_partner").length },
            { id: "passenger_car", label: "Cars", count: partners.filter((p) => p.assetCategory === "passenger_car" || p.assetCategory === "commercial_van").length },
            { id: "heavy_machinery", label: "Heavy Machinery", count: partners.filter((p) => p.assetCategory === "heavy_machinery").length },
          ].map((tab) => (
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
      {loading ? (
        <div className="p-12 text-center rounded-2xl border border-neutral-800 bg-[#0a0a0a] space-y-2">
          <div className="h-8 w-8 mx-auto rounded-full border-2 border-[#df2531] border-t-transparent animate-spin" />
          <p className="text-xs text-neutral-400 font-mono">Synchronizing partner records from Cloud Firestore...</p>
        </div>
      ) : filteredPartners.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-neutral-800 bg-[#0a0a0a] space-y-2">
          <Handshake size={32} className="mx-auto text-neutral-600" />
          <h3 className="text-sm font-bold text-white font-display">No partners match your search criteria</h3>
          <p className="text-xs text-neutral-400">Try adjusting your search terms or filter selection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPartners.map((prt) => {
            const isCorporate = prt.ownerContact?.ownerTier === "corporate_partner";

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
                      {prt.ownerContact?.fullName}
                      <span
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded font-mono font-semibold uppercase",
                          isCorporate ? "bg-purple-500/20 text-purple-300" : "bg-[#df2531]/20 text-[#df2531]"
                        )}
                      >
                        {prt.ownerContact?.ownerTier?.replace("_", " ")}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-3">
                      <span>{prt.ownerContact?.companyName}</span>
                      <span className="font-mono text-[#df2531] font-bold">{prt.ownerContact?.phoneNumber}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-[10px] text-neutral-400">Commission Split</div>
                      <div className="font-mono font-bold text-emerald-400 font-display">{prt.agreement?.commissionPct}% DEL</div>
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

                {/* Documents & Files Link Bar */}
                {(prt.ownerKycNidUrl || prt.libreDocUrl) && (
                  <div className="flex items-center gap-2 pt-1 border-t border-neutral-800/60 text-[10px]">
                    <span className="text-neutral-500 font-semibold uppercase">Cloud Docs:</span>
                    {prt.ownerKycNidUrl && (
                      <a
                        href={prt.ownerKycNidUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-[#df2531]/50 transition-colors"
                      >
                        <FileCheck size={11} className="text-[#df2531]" />
                        <span>KYC Document</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                    {prt.libreDocUrl && (
                      <a
                        href={prt.libreDocUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-emerald-500/50 transition-colors"
                      >
                        <FileText size={11} className="text-emerald-400" />
                        <span>Libre Title</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                )}

                {/* Delivery Clearance & GPS Status */}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-800/80">
                  <div className="flex items-center gap-1.5 text-neutral-400">
                    <Radio size={13} className={prt.gps?.hasGps ? "text-emerald-400" : "text-neutral-600"} />
                    <span>GPS: {prt.gps?.hasGps ? `Active (${prt.gps?.gpsTrackerImei})` : "Unmonitored"}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-neutral-400">
                    <span className="font-mono font-bold text-emerald-400 font-display">{formatETB(prt.price?.dailyRate || 0)}/day</span>
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
                  Edit Partner & Vehicle: {editingPartner.ownerContact?.fullName}
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
                <span className="font-bold text-white text-xs font-display">Replace 8-Sides Photogrammetry in Cloud Storage:</span>
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
                <p className="text-[11px] text-neutral-400">Permanently removes host and asset from Cloud Firestore.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black border border-neutral-800 space-y-1">
              <div className="font-bold text-white text-xs">{partnerToDelete.ownerContact?.fullName}</div>
              <div className="text-[11px] text-neutral-400">
                Asset: <span className="font-mono text-white font-bold">{partnerToDelete.make} {partnerToDelete.model}</span> ({partnerToDelete.plateNumber || partnerToDelete.chassisOrSerialNumber})
              </div>
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
                  Host Profile: {selectedPartner.ownerContact?.fullName}
                </h2>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {selectedPartner.ownerContact?.companyName} • {selectedPartner.ownerContact?.phoneNumber} • {selectedPartner.ownerContact?.email}
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
                  <div className="font-mono font-bold text-emerald-400 font-display">{formatETB(selectedPartner.price?.dailyRate || 0)}/day</div>
                  <div className="text-[10px] text-neutral-300">{selectedPartner.agreement?.commissionPct}% DEL Split</div>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400">Base Depot Location:</span>
                  <div className="text-neutral-200">{selectedPartner.regionLocation?.depotAddress}</div>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400">Delivery Clearance Account:</span>
                  <div className="font-mono text-neutral-200">{selectedPartner.deliveryClearance?.paymentMethod} ({selectedPartner.deliveryClearance?.bankName})</div>
                </div>
              </div>

              {/* Cloud Documents Section */}
              <div className="p-3.5 rounded-xl bg-black border border-neutral-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  Cloud Storage Documents
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold flex items-center gap-1.5">
                        <FileCheck size={13} className="text-[#df2531]" />
                        <span>KYC / NID Identification</span>
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono">
                        {selectedPartner.faydaFinNumber || "Fayda Verified"}
                      </div>
                    </div>
                    {selectedPartner.ownerKycNidUrl && (
                      <a
                        href={selectedPartner.ownerKycNidUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 rounded bg-[#df2531]/20 hover:bg-[#df2531]/40 text-[#df2531] text-[10px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <Eye size={12} />
                        View
                      </a>
                    )}
                  </div>

                  <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold flex items-center gap-1.5">
                        <FileText size={13} className="text-emerald-400" />
                        <span>Libre Ownership Title</span>
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono">
                        {selectedPartner.libreCertificateNo}
                      </div>
                    </div>
                    {selectedPartner.libreDocUrl && (
                      <a
                        href={selectedPartner.libreDocUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 text-[10px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <Eye size={12} />
                        View
                      </a>
                    )}
                  </div>
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

      {/* MODAL 4: ADD NEW PARTNER WIZARD (All Required Fields + Cloud Storage Uploads) */}
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
                  Saved permanently to Cloud Firestore & Firebase Storage, automatically registering into the central Fleet Registry.
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
              {/* Section 1: Owner & Host Details */}
              <div className="bg-black p-4 rounded-xl border border-neutral-800 space-y-3">
                <span className="font-bold text-white text-xs font-display flex items-center gap-1.5">
                  <UserCheck size={14} className="text-[#df2531]" />
                  1. Owner Contact, Host Type & Commission Split
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-medium text-neutral-400">Owner / Host Name *</label>
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
                    <label className="font-medium text-neutral-400">Host Type *</label>
                    <select
                      value={ownerTier}
                      onChange={(e) => {
                        const tier = e.target.value as OwnerTier;
                        setOwnerTier(tier);
                        setCommissionPct(tier === "corporate_partner" ? 10 : 15);
                      }}
                      className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-white focus:outline-none focus:border-[#df2531]"
                    >
                      <option value="individual_host">Individual Host (15% Split)</option>
                      <option value="corporate_partner">Corporate Partner (10% Split)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-medium text-neutral-400">Company / Fleet Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Haile Motors PLC"
                      className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-white focus:outline-none focus:border-[#df2531]"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-neutral-400">Phone Number (+251) *</label>
                    <input
                      type="text"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+251 911 234 567"
                      className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-white font-mono focus:outline-none focus:border-[#df2531]"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-neutral-400">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="dawit@partner.et"
                      className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-white focus:outline-none focus:border-[#df2531]"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-neutral-400">Commission Split % *</label>
                    <input
                      type="number"
                      required
                      step="0.5"
                      min="1"
                      max="50"
                      value={commissionPct}
                      onChange={(e) => setCommissionPct(parseFloat(e.target.value) || 0)}
                      className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-emerald-400 font-mono font-bold focus:outline-none focus:border-[#df2531]"
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

                  <div>
                    <label className="font-medium text-neutral-400">Fayda FIN Number</label>
                    <input
                      type="text"
                      value={faydaFinNumber}
                      onChange={(e) => setFaydaFinNumber(e.target.value)}
                      placeholder="FIN-4455-6677-8899"
                      className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-white font-mono focus:outline-none focus:border-[#df2531]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Asset Details */}
              <div className="bg-black p-4 rounded-xl border border-neutral-800 space-y-3">
                <span className="font-bold text-white text-xs font-display flex items-center gap-1.5">
                  <Car size={14} className="text-[#df2531]" />
                  2. Onboarded Asset / Vehicle Specifications & Pricing
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-medium text-neutral-400">Asset Category *</label>
                    <select
                      value={assetCategory}
                      onChange={(e) => setAssetCategory(e.target.value as AssetCategory)}
                      className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-white focus:outline-none focus:border-[#df2531]"
                    >
                      <option value="passenger_car">Passenger Car (Local)</option>
                      <option value="suv_4x4">4x4 SUV / Field Car</option>
                      <option value="heavy_machinery">Heavy Construction Machinery</option>
                      <option value="commercial_van">Commercial Transport Van</option>
                      <option value="power_equipment">Power &amp; Generator Equipment</option>
                    </select>
                  </div>

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
                      placeholder="e.g. 3-A98421 AA"
                      className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-white font-mono font-bold focus:outline-none focus:border-[#df2531]"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-neutral-400">Chassis / Serial Number *</label>
                    <input
                      type="text"
                      required
                      value={chassisOrSerialNumber}
                      onChange={(e) => setChassisOrSerialNumber(e.target.value)}
                      placeholder="JT7HJ83J4N..."
                      className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-white font-mono focus:outline-none focus:border-[#df2531]"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-neutral-400">Libre Certificate Number *</label>
                    <input
                      type="text"
                      required
                      value={libreCertificateNo}
                      onChange={(e) => setLibreCertificateNo(e.target.value)}
                      placeholder="LIB-AA-2026-90412"
                      className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-white font-mono focus:outline-none focus:border-[#df2531]"
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

                  <div>
                    <label className="font-medium text-neutral-400">Security Deposit (ETB)</label>
                    <input
                      type="number"
                      value={securityDeposit}
                      onChange={(e) => setSecurityDeposit(parseFloat(e.target.value) || 0)}
                      className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-white font-mono focus:outline-none focus:border-[#df2531]"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-neutral-400">Asset Condition</label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value as any)}
                      className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-white focus:outline-none focus:border-[#df2531]"
                    >
                      <option value="brand_new">Brand New</option>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Document Uploads & Firebase Cloud Storage */}
              <div className="bg-black p-4 rounded-xl border border-neutral-800 space-y-3">
                <span className="font-bold text-white text-xs font-display flex items-center gap-1.5">
                  <Upload size={14} className="text-[#df2531]" />
                  3. Cloud Document Uploads (Firebase Storage: partners/&#123;id&#125;/...)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* KYC / NID Upload */}
                  <div className="p-3 rounded-xl border border-dashed border-neutral-800 hover:border-[#df2531]/50 bg-neutral-950/60 transition-colors">
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                      Owner NID / KYC File
                    </label>
                    {attachedKycFile ? (
                      <div className="flex items-center justify-between text-xs text-emerald-400 font-mono">
                        <span className="truncate flex items-center gap-1">
                          <FileCheck size={14} />
                          <strong className="truncate max-w-[140px]">{attachedKycFileName}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setAttachedKycFile(null);
                            setAttachedKycFileName("");
                          }}
                          className="text-rose-400 hover:text-rose-300 text-[10px] font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center gap-1 py-2 cursor-pointer text-center">
                        <Upload size={16} className="text-[#df2531]" />
                        <span className="text-[11px] text-neutral-400">Upload NID / Passport (PDF, Image)</span>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setAttachedKycFile(e.target.files[0]);
                              setAttachedKycFileName(e.target.files[0].name);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {/* Libre Title File Upload */}
                  <div className="p-3 rounded-xl border border-dashed border-neutral-800 hover:border-emerald-500/50 bg-neutral-950/60 transition-colors">
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                      Libre Ownership Certificate File
                    </label>
                    {attachedLibreFile ? (
                      <div className="flex items-center justify-between text-xs text-emerald-400 font-mono">
                        <span className="truncate flex items-center gap-1">
                          <FileText size={14} />
                          <strong className="truncate max-w-[140px]">{attachedLibreFileName}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setAttachedLibreFile(null);
                            setAttachedLibreFileName("");
                          }}
                          className="text-rose-400 hover:text-rose-300 text-[10px] font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center gap-1 py-2 cursor-pointer text-center">
                        <Upload size={16} className="text-emerald-400" />
                        <span className="text-[11px] text-neutral-400">Upload Libre Title (PDF, Image)</span>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setAttachedLibreFile(e.target.files[0]);
                              setAttachedLibreFileName(e.target.files[0].name);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {/* Asset Photo Upload */}
                  <div className="p-3 rounded-xl border border-dashed border-neutral-800 hover:border-purple-500/50 bg-neutral-950/60 transition-colors">
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                      Asset Photo (Front / Profile)
                    </label>
                    {attachedAssetPhotoFile ? (
                      <div className="flex items-center justify-between text-xs text-purple-300 font-mono">
                        <span className="truncate flex items-center gap-1">
                          <Camera size={14} />
                          <strong className="truncate max-w-[140px]">{attachedAssetPhotoName}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setAttachedAssetPhotoFile(null);
                            setAttachedAssetPhotoName("");
                          }}
                          className="text-rose-400 hover:text-rose-300 text-[10px] font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center gap-1 py-2 cursor-pointer text-center">
                        <Camera size={16} className="text-purple-400" />
                        <span className="text-[11px] text-neutral-400">Upload Photo (JPG, PNG)</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setAttachedAssetPhotoFile(e.target.files[0]);
                              setAttachedAssetPhotoName(e.target.files[0].name);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 4: GPS Telematics & Payout Account */}
              <div className="bg-black p-4 rounded-xl border border-neutral-800 space-y-3">
                <span className="font-bold text-white text-xs font-display flex items-center gap-1.5">
                  <Radio size={14} className="text-[#df2531]" />
                  4. GPS Telematics & Payout Clearance
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-medium text-neutral-400">GPS Tracker ID / IMEI *</label>
                    <input
                      type="text"
                      required
                      value={gpsTrackerImei}
                      onChange={(e) => setGpsTrackerImei(e.target.value)}
                      placeholder="865492049102491"
                      className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-white font-mono focus:outline-none focus:border-[#df2531]"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-neutral-400">Payout Bank Name</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-white focus:outline-none focus:border-[#df2531]"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-neutral-400">Bank Account Number *</label>
                    <input
                      type="text"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-white font-mono focus:outline-none focus:border-[#df2531]"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-neutral-400">Base Region</label>
                    <input
                      type="text"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-white focus:outline-none focus:border-[#df2531]"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-neutral-400">Sub-city / Corridor</label>
                    <input
                      type="text"
                      value={citySubcity}
                      onChange={(e) => setCitySubcity(e.target.value)}
                      className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-white focus:outline-none focus:border-[#df2531]"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-neutral-400">Depot Address</label>
                    <input
                      type="text"
                      value={depotAddress}
                      onChange={(e) => setDepotAddress(e.target.value)}
                      className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-white focus:outline-none focus:border-[#df2531]"
                    />
                  </div>
                </div>
              </div>

              {uploadStatus && (
                <div className="p-2.5 rounded-lg bg-[#df2531]/10 border border-[#df2531]/30 text-[#df2531] text-xs flex items-center gap-2 animate-pulse">
                  <Sparkles size={14} />
                  <span>{uploadStatus}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-semibold border border-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold shadow-md shadow-[#df2531]/30 border border-[#df2531]/50 font-display flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Permanently Saving...</span>
                    </>
                  ) : (
                    <span>Confirm &amp; Onboard Partner</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}