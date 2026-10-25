"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Truck,
  UserCheck,
  ShieldCheck,
  FileText,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertOctagon,
  Sparkles,
  Layers,
  MapPin,
  Clock,
  CheckCircle2,
  Car,
  Zap,
  Camera,
  Info,
  Plus,
  Compass,
  Navigation,
  Gauge,
  AlertTriangle,
  Eye,
  X,
  Building2,
  User,
} from "lucide-react";
import { Asset, OperatorDriver, BookingCollateral } from "@/lib/types";
import { CollateralAndGuarantorVault } from "@/components/CollateralAndGuarantorVault";
import { EthiopianRouteMap, POPULAR_ETHIOPIAN_CORRIDORS } from "@/components/EthiopianRouteMap";
import { PolymorphicAssetForm } from "@/components/PolymorphicAssetForm";
import { formatETB, cn } from "@/lib/utils";
import { calculateEthiopianQuote, QuoteBreakdown } from "@/lib/calculator";
import Link from "next/link";
import { useTenant } from "@/context/TenantContext";
import { DalolComingSoon } from "@/components/DalolComingSoon";

export default function NewBookingWizardPage() {
  const router = useRouter();
  const { currentUser, sendNotification, notifications } = useTenant();

  if (currentUser?.role === "dalol_admin") {
    return (
      <div className="p-8">
        <DalolComingSoon
          moduleName="Dalol Booking & Freight Contracts Desk"
          description="Dalol heavy transport dispatch, freight contract bookings, and automated escrow billing are currently in deployment."
        />
      </div>
    );
  }

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [operators, setOperators] = useState<OperatorDriver[]>([]);
  const [loading, setLoading] = useState(true);

  // Wizard State - Step 1: Dates & Asset Bundle
  const [startDate, setStartDate] = useState("2026-10-25T08:00");
  const [endDate, setEndDate] = useState("2026-10-30T18:00");
  const [selectedAssetCategoryTab, setSelectedAssetCategoryTab] = useState<"all" | "cars" | "machinery" | "power">("all");
  const [selectedAssetId, setSelectedAssetId] = useState<string>("ast-004"); // CAT 320D
  const [selectedAttachmentId, setSelectedAttachmentId] = useState<string>(""); // None by default (only included when chosen)
  const [pickupLocation, setPickupLocation] = useState("Bole Central Yard, Addis Ababa");
  const [dropoffLocation, setDropoffLocation] = useState("Ayat Commercial Complex Site 4, Addis Ababa");
  const [projectSiteRegion, setProjectSiteRegion] = useState("Addis Ababa / Oromia Border");
  const [isOutOfCity, setIsOutOfCity] = useState(true);

  // Wizard State - Step 2: Operator & Transport
  const [isSelfDrive, setIsSelfDrive] = useState(false);
  const [assignedOperatorId, setAssignedOperatorId] = useState<string>("opr-001"); // Kebede Alemu (Special Mobile Machinery)
  const [includeMobilization, setIncludeMobilization] = useState(true);

  // Wizard State - Step 2 & 3: Out-of-Addis Regional Corridor Route Map
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>("adama");
  const [selectedDestinationName, setSelectedDestinationName] = useState<string>("Adama (Nazret) Expressway Corridor");
  const [selectedDestinationRegion, setSelectedDestinationRegion] = useState<string>("Oromia");
  const [destinationOneWayKm, setDestinationOneWayKm] = useState<number>(99);
  const [agreedDealKm, setAgreedDealKm] = useState<number>(198);
  const [customDestinationName, setCustomDestinationName] = useState<string>("");
  const [customDistanceKm, setCustomDistanceKm] = useState<number>(120);

  // Gauge Tracking (Starting & Return Meter Readings)
  const [startGauge, setStartGauge] = useState<number>(0);
  const [endGauge, setEndGauge] = useState<number>(0);

  // Client Tax Category (B2B Corporate vs Individual Private Renter)
  const [isB2BCustomer, setIsB2BCustomer] = useState<boolean>(true);

  // Wizard State - Step 3: VeriFayda KYC & Collateral
  const [renterName, setRenterName] = useState("MIDROC Construction Ethiopia");
  const [renterPhone, setRenterPhone] = useState("+251 911 554 433");
  const [renterTin, setRenterTin] = useState("0099887766");
  const [renterFaydaFin, setRenterFaydaFin] = useState("FIN-8899-0011-2233");
  const [verifiedCollateral, setVerifiedCollateral] = useState<BookingCollateral | null>(null);

  // KYC Notarized Guarantee Contract Document State
  const [uploadedGuaranteeDoc, setUploadedGuaranteeDoc] = useState<{
    fileName: string;
    fileSize: string;
    fileUrl: string;
    uploadedAt: string;
  }>({
    fileName: "MIDROC_Notarized_Guarantee_Contract_2026.pdf",
    fileSize: "2.4 MB",
    fileUrl: "/contracts/guarantor-legal-affidavit.pdf",
    uploadedAt: "2026-10-24 10:15 AM",
  });
  const [dispatchAlertToast, setDispatchAlertToast] = useState<{
    title: string;
    message: string;
    contractName: string;
  } | null>(null);

  // Quote State
  const [quoteBreakdown, setQuoteBreakdown] = useState<QuoteBreakdown | null>(null);
  const [gistConflictError, setGistConflictError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccessRef, setBookingSuccessRef] = useState<string | null>(null);
  const [isRegisterAssetOpen, setIsRegisterAssetOpen] = useState(false);

  const reloadAssets = async (selectNewestId = false) => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/assets");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAssets(json.data);
        if (selectNewestId && json.data.length > 0) {
          const newest = json.data[json.data.length - 1];
          setSelectedAssetId(newest.id);
        }
      }
    } catch (e) {
      console.error("Error reloading assets", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [assetRes, opRes] = await Promise.all([
          fetch("/api/v1/assets"),
          fetch("/api/v1/operators"),
        ]);
        const aJson = await assetRes.json();
        const oJson = await opRes.json();
        if (aJson.success) setAssets(aJson.data);
        if (oJson.success) setOperators(oJson.data);
      } catch (e) {
        console.error("Error loading wizard assets", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);
  const selectedAttachment = selectedAttachmentId ? assets.find((a) => a.id === selectedAttachmentId) : null;
  const isAttachmentIncluded = Boolean(
    selectedAttachmentId &&
    selectedAsset?.category === "heavy_machinery" &&
    selectedAttachment &&
    selectedAttachment.rateCard
  );
  const selectedOperator = operators.find((u) => u.id === assignedOperatorId);

  // Rental duration in days
  const sTime = new Date(startDate).getTime();
  const eTime = new Date(endDate).getTime();
  const rentalDays = Math.max(1, Math.ceil((eTime - sTime) / (1000 * 60 * 60 * 24)));

  // Auto-sync starting gauge and reset attachment if non-machinery asset selected
  useEffect(() => {
    if (selectedAsset) {
      setStartGauge(selectedAsset.currentMeterReading || 0);
      if (selectedAsset.category !== "heavy_machinery") {
        setSelectedAttachmentId("");
      }
    }
  }, [selectedAsset?.id, selectedAsset?.currentMeterReading, selectedAsset?.category]);

  // Filter Categorized Assets
  const cars = assets.filter((a) => a.category === "passenger_car" || a.category === "commercial_van");
  const heavyMachinery = assets.filter((a) => a.category === "heavy_machinery");
  const powerEquipment = assets.filter((a) => a.category === "power_equipment");

  // Dynamic Billing & Ethiopian Tax Engine
  useEffect(() => {
    if (selectedAsset && selectedAsset.rateCard) {
      const currentStartGauge = startGauge || selectedAsset.currentMeterReading || 0;
      const actualUsedUnits = endGauge > currentStartGauge ? endGauge - currentStartGauge : undefined;
      const standardUnits = (selectedAsset.rateCard.includedMeterUnitsPerDay || (selectedAsset.category === "heavy_machinery" ? 8 : 200)) * rentalDays;
      const resolvedAgreedUnits = (isOutOfCity && agreedDealKm > 0 && selectedAsset.category !== "heavy_machinery")
        ? Math.max(standardUnits, agreedDealKm)
        : standardUnits;
      const overageUnits = (actualUsedUnits !== undefined && actualUsedUnits > resolvedAgreedUnits) ? actualUsedUnits - resolvedAgreedUnits : 0;
      const overageSurcharge = overageUnits * (selectedAsset.rateCard.overtimeRatePerUnit || 0);

      const opDailyWage = selectedAsset.rateCard.operatorDailyRate || 1500;
      const opPerDiemWage = selectedOperator?.estimatedPerDiem || selectedAsset.rateCard.operatorPerDiemRate || 1200;

      const quote = calculateEthiopianQuote({
        asset: selectedAsset,
        rateCard: selectedAsset.rateCard,
        days: rentalDays,
        includeOperator: !isSelfDrive && !!assignedOperatorId,
        isSelfDrive,
        isOutOfCity,
        includeMobilization,
        isB2BCustomer,
        customerHasTin: isB2BCustomer && !!renterTin,
        operatorDailyWage: opDailyWage,
        operatorPerDiemWage: opPerDiemWage,
        agreedDealKm: isOutOfCity ? agreedDealKm : 0,
        startGauge: currentStartGauge,
        endGauge: endGauge > 0 ? endGauge : undefined,
        actualUsedUnits,
        agreedDealUnits: resolvedAgreedUnits,
        overageSurcharge: endGauge > 0 ? overageSurcharge : 0,
      });

      // ONLY calculate auxiliary attachment if explicitly selected/included for heavy machinery
      if (isAttachmentIncluded && selectedAttachment && selectedAttachment.rateCard) {
        const attDaily = selectedAttachment.rateCard.dailyRate || 0;
        const attSubtotal = attDaily * rentalDays;
        quote.subtotal += attSubtotal;
        quote.baseRental += attSubtotal;
        quote.taxableSubtotal = quote.subtotal;
        quote.vat15Pct = Math.round(quote.taxableSubtotal * 0.15 * 100) / 100;
        if (quote.isWithholdingApplicable) {
          quote.withholding2Pct = Math.round(quote.taxableSubtotal * 0.02 * 100) / 100;
        } else {
          quote.withholding2Pct = 0;
        }
        quote.totalPayable = Math.round((quote.taxableSubtotal + quote.vat15Pct - quote.withholding2Pct) * 100) / 100;
        quote.securityDeposit += (selectedAttachment.rateCard.securityDepositAmount || 0);
      }

      setQuoteBreakdown(quote);
    }
  }, [
    selectedAsset,
    selectedAttachment,
    isAttachmentIncluded,
    rentalDays,
    assignedOperatorId,
    selectedOperator,
    isSelfDrive,
    isOutOfCity,
    includeMobilization,
    isB2BCustomer,
    renterTin,
    startGauge,
    endGauge,
    agreedDealKm,
  ]);

  const handleFinalBookingSubmit = async () => {
    setIsSubmitting(true);
    setGistConflictError(null);

    try {
      const currentStartGauge = startGauge || selectedAsset?.currentMeterReading || 0;
      const actualUsedUnits = endGauge > currentStartGauge ? endGauge - currentStartGauge : undefined;

      const itemsPayload = [
        {
          assetId: selectedAssetId,
          assignedOperatorId: isSelfDrive ? null : (assignedOperatorId || null),
          rentalPeriodStart: new Date(startDate).toISOString(),
          rentalPeriodEnd: new Date(endDate).toISOString(),
          mobilizationFeeCharged: includeMobilization ? (selectedAsset?.rateCard?.defaultMobilizationFee || 0) : 0,
          meterStart: currentStartGauge,
          meterEnd: endGauge > 0 ? endGauge : undefined,
          actualUsedUnits,
          agreedDealUnits: quoteBreakdown?.includedUnitsTotal,
          overageUnits: quoteBreakdown?.overtimeUnits,
          overageSurcharge: quoteBreakdown?.overtimeAmount,
        },
      ];

      if (isAttachmentIncluded && selectedAttachmentId) {
        itemsPayload.push({
          assetId: selectedAttachmentId,
          assignedOperatorId: null,
          rentalPeriodStart: new Date(startDate).toISOString(),
          rentalPeriodEnd: new Date(endDate).toISOString(),
          mobilizationFeeCharged: 0,
        });
      }

      const res = await fetch("/api/v1/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          renterId: "usr-007",
          bookingChannel: "internal_desk",
          pickupLocation,
          dropoffLocation,
          projectSiteRegion: isOutOfCity ? `${selectedDestinationName} (${selectedDestinationRegion})` : projectSiteRegion,
          isOutOfCity,
          destinationName: isOutOfCity ? selectedDestinationName : "Addis Ababa Central Depot",
          destinationDistanceKm: isOutOfCity ? destinationOneWayKm : 0,
          roundTripDistanceKm: isOutOfCity ? agreedDealKm : 0,
          agreedDealKm: isOutOfCity ? agreedDealKm : (rentalDays * 200),
          items: itemsPayload,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.code === "23P01") {
          setGistConflictError(
            `PostgreSQL GiST Double-Booking Conflict: ${json.detail}`
          );
        } else {
          setGistConflictError(json.error || "Booking transaction failed");
        }
        return;
      }

      // Bundle Notarized Guarantee Contract and Collateral Payload
      const collateralPayload: BookingCollateral = verifiedCollateral || {
        id: `col-${Date.now()}`,
        bookingId: json.booking?.id || `bkg-temp-${Date.now()}`,
        collateralType: "personal_guarantor_was",
        amount: quoteBreakdown?.securityDeposit || 150000,
        guarantorFullName: "Ato Tadesse Haile",
        guarantorPhone: "+251 911 332 211",
        guarantorFaydaFin: "FIN-9482-1049-3321",
        guarantorEmployerTin: "0011882244",
        contractDocumentUrl: uploadedGuaranteeDoc.fileUrl,
        contractDocumentName: uploadedGuaranteeDoc.fileName,
        contractDocumentSize: uploadedGuaranteeDoc.fileSize,
        contractUploadedAt: uploadedGuaranteeDoc.uploadedAt,
        isVerified: true,
        verifiedByUserId: currentUser?.id || "usr-002",
        verifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      if (json.booking?.id) {
        await fetch(`/api/v1/bookings/${json.booking.id}/collateral`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...collateralPayload,
            contractDocumentUrl: uploadedGuaranteeDoc.fileUrl,
            contractDocumentName: uploadedGuaranteeDoc.fileName,
            contractDocumentSize: uploadedGuaranteeDoc.fileSize,
            contractUploadedAt: uploadedGuaranteeDoc.uploadedAt,
          }),
        });
      }

      // Trigger instant notification/dispatch packet directly to Head Dispatcher
      await sendNotification({
        title: "New Booking Dispatched & KYC Packet Ready",
        message: `Booking #${json.booking.bookingReference} for ${renterName} (${selectedAsset?.make} ${selectedAsset?.model}) has been unlocked. Attached Scanned Notarized Guarantee Contract (${uploadedGuaranteeDoc.fileName}, ${uploadedGuaranteeDoc.fileSize}) is verified and ready for Head Dispatcher review.`,
        type: "kyc_validation",
        recipientRole: "dispatcher",
        bookingId: json.booking.id,
        renterName,
        assetName: `${selectedAsset?.make} ${selectedAsset?.model}`,
        collateralType: collateralPayload.collateralType,
        contractFileName: uploadedGuaranteeDoc.fileName,
        contractFileSize: uploadedGuaranteeDoc.fileSize,
      });

      setDispatchAlertToast({
        title: "Dispatch Packet Transmitted to Head Dispatcher",
        message: `Booking #${json.booking.bookingReference} and Notarized Guarantee Contract (${uploadedGuaranteeDoc.fileName}) sent directly to Head Dispatcher (Yonas Bekele).`,
        contractName: uploadedGuaranteeDoc.fileName,
      });

      setBookingSuccessRef(json.booking.bookingReference);
    } catch (e: any) {
      setGistConflictError(e.message || "Failed to submit booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAssetCard = (a: Asset) => {
    const isSelected = selectedAssetId === a.id;
    const isMaint = a.status === "maintenance";
    const photo = a.primaryImageUrl || a.images8Sides?.front;

    return (
      <div
        key={a.id}
        onClick={() => !isMaint && setSelectedAssetId(a.id)}
        className={cn(
          "p-3 rounded-xl border text-left cursor-pointer transition-all space-y-2 relative overflow-hidden",
          isSelected
            ? "bg-[#df2531]/15 border-[#df2531] shadow-md ring-2 ring-[#df2531]/50"
            : isMaint
            ? "bg-slate-950/40 border-rose-900/60 opacity-60 cursor-not-allowed"
            : "bg-[#0a0a0a] border-neutral-800 hover:border-[#df2531]/40"
        )}
      >
        {/* Photo + Specs Banner */}
        <div className="h-28 w-full rounded-lg bg-black overflow-hidden relative border border-neutral-800 flex items-center justify-center">
          {photo ? (
            <img src={photo} alt={a.model} className="h-full w-full object-cover" />
          ) : (
            <Camera size={24} className="text-neutral-600" />
          )}

          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-black/75 text-[9px] font-mono text-white font-bold">
            {a.plateNumber || a.chassisOrSerialNumber}
          </span>

          {isMaint ? (
            <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded bg-rose-600 text-[9px] font-bold text-white uppercase font-display">
              LOCKED
            </span>
          ) : (
            <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono font-bold text-emerald-400">
              {formatETB(a.rateCard?.dailyRate || 0)}/d
            </span>
          )}
        </div>

        {/* Title & Technical Specs */}
        <div>
          <div className="font-bold text-white text-xs font-display">{a.make} {a.model}</div>
          <div className="text-[10px] text-neutral-400 flex items-center justify-between mt-0.5">
            <span>Year {a.manufactureYear} • {a.condition || "Excellent"}</span>
            <span className="font-mono text-neutral-300">{a.currentMeterReading} {a.meterUnit === "odometer_km" ? "KM" : "Hrs"}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1 text-[9px]">
          {a.category === "heavy_machinery" ? (
            <>
              <span className="px-1.5 py-0.5 rounded bg-[#df2531]/20 text-white font-semibold">
                {a.specs.operatingWeightTons || 20}t Operating Weight
              </span>
              <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                8h Daily Cap
              </span>
            </>
          ) : (
            <>
              <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-200 font-semibold capitalize">
                {a.specs.transmission || "Auto"} • {a.specs.fuelType || "Diesel"}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                200 KM/day included
              </span>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 font-display">
            <Calendar className="text-[#df2531]" size={24} />
            Dispatcher Booking Wizard & KYC Desk
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Categorized asset selector with photos, dynamic ODR operator dispatch, and Ethiopian tax quote.
          </p>
        </div>

        {quoteBreakdown && (
          <div className="text-right">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-display">Live Estimated Total</span>
            <div className="font-mono text-xl font-black text-[#df2531] font-display">
              {step < 4 ? formatETB(quoteBreakdown.baseRental) : formatETB(quoteBreakdown.totalPayable)}
            </div>
            <span className="text-[10px] text-neutral-400">
              {step < 4
                ? "Base Equipment Estimate (Taxes calculated in Step 4)"
                : quoteBreakdown.isWithholdingApplicable
                ? "Includes 15% VAT - 2% WHT"
                : "Includes 15% VAT"}
            </span>
          </div>
        )}
      </div>

      {/* Stepper Tabs */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        {[
          { num: 1, title: "Categorized Assets", subtitle: "Cars, Machinery & Photos" },
          { num: 2, title: "Certified Operator", subtitle: "ODR Registry Integration" },
          { num: 3, title: "KYC & Guarantor Vault", subtitle: "Fayda & Collateral" },
          { num: 4, title: "Tax Quote & Sign", subtitle: "15% VAT & GiST Lock" },
        ].map((s) => (
          <button
            key={s.num}
            onClick={() => setStep(s.num as any)}
            className={cn(
              "p-3 rounded-xl border text-left transition-all font-display",
              step === s.num
                ? "bg-[#df2531]/15 border-[#df2531] text-white font-bold ring-1 ring-[#df2531]/40 shadow-sm"
                : step > s.num
                ? "bg-emerald-950/20 border-emerald-800 text-emerald-400"
                : "bg-[#0a0a0a] border-neutral-800 text-neutral-400 hover:text-white"
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono",
                  step === s.num
                    ? "bg-[#df2531] text-white"
                    : step > s.num
                    ? "bg-emerald-500 text-black"
                    : "bg-neutral-800 text-neutral-400"
                )}
              >
                {step > s.num ? <Check size={11} /> : s.num}
              </span>
              <span className="truncate">{s.title}</span>
            </div>
            <div className="text-[10px] text-neutral-400 font-normal mt-1 pl-7 truncate font-sans">{s.subtitle}</div>
          </button>
        ))}
      </div>

      {/* GiST Exclusion Conflict Alert */}
      {gistConflictError && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-200 text-xs space-y-1 animate-fadeIn">
          <div className="font-bold flex items-center gap-2 text-sm text-rose-300">
            <AlertOctagon size={18} />
            PostgreSQL GiST Double-Booking Conflict Prevented (Code 23P01)
          </div>
          <p>{gistConflictError}</p>
        </div>
      )}

      {/* Success View */}
      {bookingSuccessRef && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-8 text-center space-y-4 animate-fadeIn">
          <div className="h-14 w-14 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto text-2xl font-black">
            <Check size={32} />
          </div>
          <h2 className="text-2xl font-black text-white">Booking Dispatched Successfully!</h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Reference: <span className="font-mono font-bold text-white">{bookingSuccessRef}</span>.
            Anti-double-booking GiST lock engaged. Certified operator notified via dispatch alert.
          </p>

          {/* Attached Guarantee Contract & Head Dispatcher Notification Status */}
          <div className="max-w-md mx-auto p-4 rounded-xl bg-[#0a0a0a] border border-emerald-500/30 text-left space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 size={15} />
                Notarized Guarantee Contract Attached
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                Ready for Review
              </span>
            </div>
            <div className="text-[11px] text-slate-200 font-mono flex items-center gap-2">
              <FileText size={13} className="text-[#df2531] shrink-0" />
              <span>{uploadedGuaranteeDoc.fileName} ({uploadedGuaranteeDoc.fileSize})</span>
            </div>
            <div className="text-[11px] text-slate-400 pt-1 border-t border-[#1a1a1a]">
              ✓ Dispatch packet and scanned KYC affidavit transmitted to Head Dispatcher (Yonas Bekele) queue for sign-off.
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              onClick={() => router.push("/dispatch/calendar")}
              className="px-4 py-2 bg-[#df2531] hover:bg-[#c41e29] text-white font-bold rounded-lg text-xs shadow-md shadow-[#df2531]/20 transition-all cursor-pointer"
            >
              View on Dispatch Gantt
            </button>
            <button
              onClick={() => router.push("/finance/settlements")}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-xs"
            >
              View Invoices & Settlements
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: CATEGORIZED ASSET SELECTION WITH IMAGES */}
      {!bookingSuccessRef && step === 1 && (
        <div className="bg-[#0A0A0A] p-5 rounded-2xl border border-[#222222] space-y-5 text-xs">
          <div className="font-bold text-white text-sm flex items-center gap-2 border-b border-[#222222] pb-3">
            <Clock size={16} className="text-[#df2531]" />
            Step 1: Rental Period & Categorized Primary Assets (Cars vs Machinery)
          </div>

          {/* Dates & Depot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-slate-400">Start Date & Time</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full rounded-lg bg-black border border-white/10 px-3 py-2 text-xs text-white focus:border-[#df2531] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-medium text-slate-400">End Date & Time</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full rounded-lg bg-black border border-white/10 px-3 py-2 text-xs text-white focus:border-[#df2531] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-medium text-slate-400">Pickup Depot</label>
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="mt-1 w-full rounded-lg bg-black border border-white/10 px-3 py-2 text-xs text-white focus:border-[#df2531] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-medium text-slate-400">Site Dropoff Destination</label>
              <input
                type="text"
                value={dropoffLocation}
                onChange={(e) => setDropoffLocation(e.target.value)}
                className="mt-1 w-full rounded-lg bg-black border border-white/10 px-3 py-2 text-xs text-white focus:border-[#df2531] focus:outline-none"
              />
            </div>
          </div>

          {/* Categorized Filter Tabs */}
          <div className="pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
              <span className="font-bold text-white text-xs">Select Primary Asset by Category:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterAssetOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#df2531] hover:bg-[#c41e29] text-white font-bold text-xs shadow-md shadow-[#df2531]/20 transition-all cursor-pointer"
                >
                  <Plus size={14} />
                  Register New Fleet Asset
                </button>
                <div className="flex items-center rounded-lg border border-[#222222] bg-black p-0.5">
                  {[
                    { id: "all", label: "All Fleet", icon: Truck },
                    { id: "cars", label: "Cars & SUVs", icon: Car },
                    { id: "machinery", label: "Heavy Machinery", icon: Truck },
                    { id: "power", label: "Power & Generators", icon: Zap },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedAssetCategoryTab(t.id as any)}
                      className={cn(
                        "px-3 py-1 rounded font-medium transition-all text-xs flex items-center gap-1.5",
                        selectedAssetCategoryTab === t.id
                          ? "bg-[#df2531] text-white font-bold"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Render Category 1: Heavy Machinery */}
            {(selectedAssetCategoryTab === "all" || selectedAssetCategoryTab === "machinery") && (
              <div className="space-y-2 pt-2">
                <div className="text-[11px] font-bold text-[#df2531] uppercase tracking-wider flex items-center gap-1.5">
                  <Truck size={14} /> Heavy Construction Machinery & Excavators
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {heavyMachinery.map(renderAssetCard)}
                </div>
              </div>
            )}

            {/* Render Category 2: Passenger Cars & 4x4 SUVs */}
            {(selectedAssetCategoryTab === "all" || selectedAssetCategoryTab === "cars") && (
              <div className="space-y-2 pt-4">
                <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Car size={14} /> Passenger Vehicles & 4x4 Field Pickups
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {cars.map(renderAssetCard)}
                </div>
              </div>
            )}

            {/* Render Category 3: Power Equipment */}
            {(selectedAssetCategoryTab === "all" || selectedAssetCategoryTab === "power") && powerEquipment.length > 0 && (
              <div className="space-y-2 pt-4">
                <div className="text-[11px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap size={14} /> Power Equipment & Generators
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {powerEquipment.map(renderAssetCard)}
                </div>
              </div>
            )}
          </div>

          {/* Hydraulic Breaker Attachment Bundle (if excavator selected) */}
          {selectedAsset?.category === "heavy_machinery" && (
            <div className="p-3.5 rounded-xl bg-[#df2531]/10 border border-[#df2531]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Layers size={14} className="text-[#df2531]" />
                  Compatible Hydraulic Breaker Attachment Bundle
                </span>
                <span className="text-[10px] text-slate-400 font-mono">parent_asset_id Linkage</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAttachmentId(selectedAttachmentId ? "" : "ast-005")}
                  className={cn(
                    "p-2.5 rounded-lg border text-left transition-all",
                    selectedAttachmentId === "ast-005"
                      ? "bg-[#df2531]/20 border-[#df2531] text-white font-bold"
                      : "bg-[#0a0a0a] border-white/10 text-slate-400 hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>CAT H120Es Hydraulic Rock Breaker</span>
                    <span className="text-[#df2531] font-mono">ETB 12,000/d</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Pre-calibrated auxiliary lines for 20-ton CAT excavator</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAttachmentId("")}
                  className={cn(
                    "p-2.5 rounded-lg border text-left transition-all",
                    !selectedAttachmentId
                      ? "bg-white/10 border-white/30 text-white font-bold"
                      : "bg-[#0a0a0a] border-white/10 text-slate-400"
                  )}
                >
                  <div>No Auxiliary Attachment</div>
                  <div className="text-[10px] text-slate-400">Standard general purpose bucket only</div>
                </button>
              </div>
            </div>
          )}

          {/* Confirmed Selection Banner in Step 1 */}
          {selectedAsset && (
            <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#df2531]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md shadow-[#df2531]/10">
              <div className="flex items-center gap-3">
                <div className="h-14 w-20 rounded-lg bg-black border border-white/10 overflow-hidden shrink-0">
                  <img
                    src={selectedAsset.primaryImageUrl || selectedAsset.images8Sides?.front}
                    alt={selectedAsset.model}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    {selectedAsset.make} {selectedAsset.model}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                      Confirmed Asset
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Plate/Serial: <span className="font-mono text-slate-200">{selectedAsset.plateNumber || selectedAsset.chassisOrSerialNumber}</span> • {rentalDays} Rental Days • {formatETB(selectedAsset.rateCard?.dailyRate || 0)}/d
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold shadow-md shadow-[#df2531]/20 border border-[#df2531]/40 text-xs shrink-0 transition-all cursor-pointer font-display"
              >
                Continue to Step 2: Certified Operator & Transport
                <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: OPERATOR (FROM ODR MODULE) & TRANSPORT */}
      {!bookingSuccessRef && step === 2 && (
        <div className="bg-[#0A0A0A] p-5 rounded-2xl border border-[#222222] space-y-5 text-xs">
          <div className="font-bold text-white text-sm flex items-center justify-between border-b border-[#222222] pb-3">
            <span className="flex items-center gap-2">
              <UserCheck size={16} className="text-[#df2531]" />
              Step 2: Assign Certified Operator from ODR Registry & Transport
            </span>
            <Link
              href="/operators"
              target="_blank"
              className="text-emerald-400 hover:underline font-semibold flex items-center gap-1 text-[11px]"
            >
              Open ODR Registry →
            </Link>
          </div>

          {/* Operator Cards from ODR Module */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200">
                Select Operator ({selectedAsset?.category === "heavy_machinery" ? "Requires 'Special Mobile Machinery' Grade" : "Driver"})
              </label>
              {isSelfDrive && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#df2531]/20 text-[#df2531] border border-[#df2531]/30">
                  Self Drive Active — Driver selection bypassed
                </span>
              )}
            </div>

            {isSelfDrive && (
              <div className="p-3 rounded-xl bg-[#df2531]/10 border border-[#df2531]/20 text-white text-xs flex items-center justify-between">
                <span>
                  ✓ <strong>Self Drive is ON:</strong> You can pass directly to Step 3 without selecting or mentioning a driver name. (Selecting an operator below will switch Self Drive OFF).
                </span>
                <button
                  type="button"
                  onClick={() => setIsSelfDrive(false)}
                  className="text-xs text-[#df2531] underline hover:text-white font-medium ml-3 shrink-0 cursor-pointer"
                >
                  Turn Off Self Drive
                </button>
              </div>
            )}

            <div className={cn("grid grid-cols-1 sm:grid-cols-3 gap-3 transition-opacity", isSelfDrive && "opacity-75")}>
              {operators.map((op) => {
                const isSelected = !isSelfDrive && assignedOperatorId === op.id;
                const isSpecialMachinery = op.driverLicenseGrade === "Special Mobile Machinery" || (op.driverLicenseGrade && op.driverLicenseGrade.toLowerCase().includes("machinery"));

                return (
                  <div
                    key={op.id}
                    onClick={() => {
                      setAssignedOperatorId(op.id);
                      setIsSelfDrive(false);
                    }}
                    className={cn(
                      "p-3.5 rounded-xl border text-left cursor-pointer transition-all space-y-2 relative",
                      isSelected
                        ? "bg-[#df2531]/20 border-[#df2531] ring-2 ring-[#df2531] shadow-md shadow-[#df2531]/20"
                        : "bg-[#0a0a0a] border-white/10 hover:border-white/20"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="font-bold text-white text-sm flex items-center gap-1.5 font-display">
                        {op.fullName}
                        {op.kycVerified && (
                          <span title="VeriFayda NID Verified">
                            <ShieldCheck size={14} className="text-emerald-400" />
                          </span>
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded font-mono font-bold",
                          isSpecialMachinery ? "bg-[#df2531]/20 text-[#df2531]" : "bg-white/10 text-slate-300"
                        )}
                      >
                        {op.driverLicenseGrade}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 space-y-0.5">
                      <div>Experience: <span className="text-slate-200 font-semibold">{op.workExperienceYears} Years</span></div>
                      <div className="truncate">Living: <span className="text-slate-200">{op.livingArea}</span></div>
                      <div className="truncate">Dispatch: <span className="text-slate-200">{op.dispatchArea}</span></div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Per-Diem Allowance:</span>
                      <span className="font-mono font-bold text-[#df2531]">
                        {formatETB(op.estimatedPerDiem)}/d
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Without Driver / Self Drive Button & Toggle Card */}
          <div className={cn(
            "p-3.5 rounded-xl border flex items-center justify-between transition-all",
            isSelfDrive
              ? "bg-[#df2531]/15 border-[#df2531]/60 ring-1 ring-[#df2531]/40"
              : "bg-[#0a0a0a] border-white/10"
          )}>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">Self Drive (Without Driver)</span>
                <span className={cn(
                  "text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase",
                  isSelfDrive ? "bg-[#df2531] text-white" : "bg-white/10 text-slate-400"
                )}>
                  {isSelfDrive ? "Self Drive Active" : "Driver Included"}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Client / Contractor provides own qualified operator on-site. Enables passing to the next step without choosing a driver name, zeroes operator daily cost and per-diem allowance.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const nextState = !isSelfDrive;
                  setIsSelfDrive(nextState);
                  if (nextState) {
                    setAssignedOperatorId("");
                  }
                }}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                  isSelfDrive
                    ? "bg-[#df2531] text-white border-[#df2531] shadow-md shadow-[#df2531]/20"
                    : "bg-white/10 text-slate-300 border-white/20 hover:bg-white/20"
                )}
              >
                {isSelfDrive ? "✓ Self Drive ON" : "Self Drive"}
              </button>
              <input
                type="checkbox"
                checked={isSelfDrive}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsSelfDrive(checked);
                  if (checked) {
                    setAssignedOperatorId("");
                  }
                }}
                className="h-5 w-5 rounded border-white/20 text-[#df2531] bg-black accent-[#df2531] cursor-pointer"
              />
            </div>
          </div>

          {/* Out of City Per-Diem */}
          <div className="p-3.5 rounded-xl bg-[#0a0a0a] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-white flex items-center gap-2">
                  <span>Out of Addis Ababa Project Site</span>
                  {isOutOfCity && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#df2531]/20 text-[#df2531] font-bold border border-[#df2531]/30">
                      Regional Corridor Active
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Mandatory operator per-diem allowance will be added to quote. Unlocks Destination Route Map &amp; Odometer / Gauge Module in Step 3.
                </div>
              </div>
              <input
                type="checkbox"
                checked={isOutOfCity}
                onChange={(e) => setIsOutOfCity(e.target.checked)}
                className="h-5 w-5 rounded border-white/20 text-[#df2531] bg-black accent-[#df2531] cursor-pointer"
              />
            </div>

            {isOutOfCity && (
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-[#df2531]">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Compass size={14} />
                  Corridor Selected: <strong>{selectedDestinationName}</strong> ({agreedDealKm} KM round-trip)
                </span>
                <span className="text-slate-400">Configured in Step 3</span>
              </div>
            )}
          </div>

          {/* Low-Bed Transport */}
          {selectedAsset?.category === "heavy_machinery" && (
            <div className="p-3.5 rounded-xl bg-[#0a0a0a] border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Low-Bed Flatbed Mobilization Truck</div>
                <div className="text-[11px] text-slate-400">
                  Flatbed transport to site (ETB {selectedAsset?.rateCard?.defaultMobilizationFee || 28000})
                </div>
              </div>
              <input
                type="checkbox"
                checked={includeMobilization}
                onChange={(e) => setIncludeMobilization(e.target.checked)}
                className="h-5 w-5 rounded border-white/20 text-[#df2531] bg-black accent-[#df2531] cursor-pointer"
              />
            </div>
          )}

          <div className="flex justify-between pt-3">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/20 text-slate-300 font-semibold hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ArrowLeft size={15} />
              Back to Asset Selection
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold border border-[#df2531]/40 shadow-md shadow-[#df2531]/20 transition-all text-xs font-display cursor-pointer"
            >
              {isSelfDrive ? "Continue to Step 3: KYC & Guarantor Vault (Self Drive)" : "Continue to Step 3: KYC & Guarantor Vault"}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: KYC, OUT-OF-ADDIS ROUTE MAP & COLLATERAL VAULT */}
      {!bookingSuccessRef && step === 3 && (
        <div className="space-y-5">
          <div className="bg-[#0A0A0A] p-5 rounded-2xl border border-[#222222] space-y-4 text-xs">
            <div className="font-bold text-white text-sm flex items-center justify-between border-b border-[#222222] pb-3">
              <span className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                Step 3A: VeriFayda 2.0 eSignet Identity Verification
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px]">
                Fayda FIN Verified
              </span>
            </div>

            {/* Client Tax Category Selector (B2B Corporate vs Individual) */}
            <div className="p-3 rounded-xl bg-black border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-white text-xs block font-display">Client Tax Classification (Ministry of Revenue)</span>
                <span className="text-[11px] text-slate-400">
                  Determines whether 2% MoR Withholding Tax (WHT) is automatically deducted on subtotal &gt;10,000 ETB.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsB2BCustomer(true)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer",
                    isB2BCustomer
                      ? "bg-[#df2531] text-white border-[#df2531] shadow-md shadow-[#df2531]/25"
                      : "bg-[#0a0a0a] text-slate-400 border-white/10 hover:text-white"
                  )}
                >
                  <Building2 size={13} />
                  B2B Corporate (2% MoR WHT applies)
                </button>
                <button
                  type="button"
                  onClick={() => setIsB2BCustomer(false)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer",
                    !isB2BCustomer
                      ? "bg-[#df2531] text-white border-[#df2531] shadow-md shadow-[#df2531]/25"
                      : "bg-[#0a0a0a] text-slate-400 border-white/10 hover:text-white"
                  )}
                >
                  <User size={13} />
                  Individual Private Renter (No WHT)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-medium text-slate-400">Renter / Enterprise</label>
                <input
                  type="text"
                  value={renterName}
                  onChange={(e) => setRenterName(e.target.value)}
                  className="mt-1 w-full rounded-lg bg-black border border-white/10 px-3 py-1.5 text-xs text-white focus:border-[#df2531] focus:outline-none"
                />
              </div>
              <div>
                <label className="font-medium text-slate-400">Phone (+251)</label>
                <input
                  type="text"
                  value={renterPhone}
                  onChange={(e) => setRenterPhone(e.target.value)}
                  className="mt-1 w-full rounded-lg bg-black border border-white/10 px-3 py-1.5 text-xs text-white font-mono focus:border-[#df2531] focus:outline-none"
                />
              </div>
              <div>
                <label className="font-medium text-slate-400">Ministry of Revenue TIN</label>
                <input
                  type="text"
                  value={renterTin}
                  onChange={(e) => setRenterTin(e.target.value)}
                  className="mt-1 w-full rounded-lg bg-black border border-white/10 px-3 py-1.5 text-xs text-white font-mono focus:border-[#df2531] focus:outline-none"
                />
              </div>
              <div>
                <label className="font-medium text-slate-400">VeriFayda FIN</label>
                <input
                  type="text"
                  value={renterFaydaFin}
                  onChange={(e) => setRenterFaydaFin(e.target.value)}
                  className="mt-1 w-full rounded-lg bg-black border border-white/10 px-3 py-1.5 text-xs text-emerald-400 font-mono font-bold focus:border-[#df2531] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* STEP 3B: OUT-OF-ADDIS ROUTE MAP & ODOMETER/GAUGE MODULE */}
          {isOutOfCity && (
            <EthiopianRouteMap
              meterUnit={selectedAsset?.meterUnit === "engine_hours" ? "Engine Hours" : "KM"}
              rentalDays={rentalDays}
              dailyRate={selectedAsset?.rateCard?.dailyRate || 0}
              includedUnitsPerDay={selectedAsset?.rateCard?.includedMeterUnitsPerDay || (selectedAsset?.category === "heavy_machinery" ? 8 : 200)}
              overtimeRatePerUnit={selectedAsset?.rateCard?.overtimeRatePerUnit || 35}
              currentAssetMeter={selectedAsset?.currentMeterReading || 0}
              isMachinery={selectedAsset?.category === "heavy_machinery"}
              selectedDestinationId={selectedDestinationId}
              customDestinationName={customDestinationName}
              customDistanceKm={customDistanceKm}
              onDestinationChange={(dest) => {
                setSelectedDestinationId(dest.id);
                setSelectedDestinationName(dest.name);
                setSelectedDestinationRegion(dest.region);
                setDestinationOneWayKm(dest.oneWayKm);
                setAgreedDealKm(dest.roundTripKm);
              }}
              startGauge={startGauge || (selectedAsset?.currentMeterReading || 0)}
              endGauge={endGauge}
              onGaugeChange={(start, end) => {
                setStartGauge(start);
                setEndGauge(end);
              }}
            />
          )}

          {/* STEP 3C: COLLATERAL VAULT & INTERACTIVE NOTARIZED GUARANTEE UPLOAD */}
          <CollateralAndGuarantorVault
            depositRequired={quoteBreakdown?.securityDeposit || 150000}
            renterName={renterName}
            assetName={selectedAsset ? `${selectedAsset.make} ${selectedAsset.model}` : "Heavy Equipment"}
            onCollateralVerified={(col) => {
              setVerifiedCollateral(col);
              if (col.contractDocumentName) {
                setUploadedGuaranteeDoc({
                  fileName: col.contractDocumentName,
                  fileSize: col.contractDocumentSize || "2.4 MB",
                  fileUrl: col.contractDocumentUrl || "/contracts/guarantor-legal-affidavit.pdf",
                  uploadedAt: col.contractUploadedAt || new Date().toLocaleTimeString(),
                });
              }
            }}
            onContractUploaded={(doc) => {
              setUploadedGuaranteeDoc(doc);
            }}
          />

          <div className="flex justify-between pt-3">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/20 text-slate-300 font-semibold hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ArrowLeft size={15} />
              Back to Operator
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold border border-[#df2531]/40 shadow-md shadow-[#df2531]/20 transition-all text-xs font-display cursor-pointer"
            >
              Continue to Step 4: Review Ethiopian Tax Quote & Contract
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: TAX QUOTE & CONFIRMATION */}
      {!bookingSuccessRef && step === 4 && quoteBreakdown && (
        <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-[#222222] space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#222222] pb-3">
            <span className="flex items-center gap-2 font-bold text-white text-sm font-display">
              <FileText size={16} className="text-[#df2531]" />
              Step 4: Ethiopian Billing Statement &amp; Pro-Forma Tax Invoice
            </span>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
              <span>Duration: {rentalDays} Days</span>
              <span>•</span>
              <span>Operator: {isSelfDrive ? "Self Drive (Without Company Driver)" : (selectedOperator?.fullName || "Not Assigned")}</span>
              {isOutOfCity && (
                <>
                  <span>•</span>
                  <span className="text-[#df2531] font-semibold">{selectedDestinationName}</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2.5 bg-black p-5 rounded-xl border border-white/10">
            {/* Line Item 1: Base Asset Rental */}
            <div className="flex justify-between items-center py-1 text-slate-300">
              <div>
                <span className="font-semibold text-white">
                  Base Equipment: {selectedAsset?.make} {selectedAsset?.model}
                </span>
                <span className="text-slate-400 ml-1.5 font-mono text-[11px]">
                  ({rentalDays} days @ {formatETB(selectedAsset?.rateCard?.dailyRate || 0)}/day)
                </span>
              </div>
              <span className="font-mono font-bold text-white text-sm">
                ETB {formatETB(rentalDays * (selectedAsset?.rateCard?.dailyRate || 0))}
              </span>
            </div>

            {/* Line Item 2: Auxiliary Attachment (only when included) */}
            {isAttachmentIncluded && selectedAttachment && selectedAttachment.rateCard && (
              <div className="flex justify-between items-center py-1 text-white">
                <div>
                  <span className="font-semibold text-white">
                    Auxiliary Tool: {selectedAttachment.make} {selectedAttachment.model}
                  </span>
                  <span className="text-slate-400 ml-1.5 font-mono text-[11px]">
                    ({rentalDays} days @ {formatETB(selectedAttachment.rateCard.dailyRate || 0)}/day)
                  </span>
                </div>
                <span className="font-mono font-bold text-[#df2531] text-sm">
                  ETB {formatETB(rentalDays * (selectedAttachment.rateCard.dailyRate || 0))}
                </span>
              </div>
            )}

            {/* Line Item 3: Certified Operator Fee */}
            {isSelfDrive ? (
              <div className="flex justify-between items-center py-1 text-slate-400">
                <div className="flex items-center gap-1.5">
                  <UserCheck size={14} className="text-[#df2531]" />
                  <span>Self-Drive Agreement (Client Provides Qualified Operator)</span>
                </div>
                <span className="font-mono text-emerald-400 font-semibold">ETB 0.00 (Waived)</span>
              </div>
            ) : (
              <div className="flex justify-between items-center py-1 text-slate-300">
                <div>
                  <span className="font-semibold text-white">
                    Certified Operator Wage ({selectedOperator?.fullName || "Assigned Operator"})
                  </span>
                  <span className="text-slate-400 ml-1.5 font-mono text-[11px]">
                    ({rentalDays} days @ {formatETB(quoteBreakdown.operatorDailyRate)}/day)
                  </span>
                </div>
                <span className="font-mono font-bold text-white text-sm">
                  ETB {formatETB(quoteBreakdown.operatorDailyTotal)}
                </span>
              </div>
            )}

            {/* Line Item 4: Driver Regional Per-Diem */}
            {!isSelfDrive && isOutOfCity && (
              <div className="flex justify-between items-center py-1 text-white">
                <div>
                  <span className="font-semibold text-white">
                    Driver Regional Per-Diem ({selectedDestinationName})
                  </span>
                  <span className="text-slate-400 ml-1.5 font-mono text-[11px]">
                    ({rentalDays} days @ {formatETB(quoteBreakdown.operatorPerDiemRate)}/day)
                  </span>
                </div>
                <span className="font-mono font-bold text-[#df2531] text-sm">
                  ETB {formatETB(quoteBreakdown.operatorPerDiemTotal)}
                </span>
              </div>
            )}

            {/* Line Item 5: Low-bed Mobilization Truck */}
            {quoteBreakdown.mobilizationFee > 0 && (
              <div className="flex justify-between items-center py-1 text-slate-300">
                <div>
                  <span className="font-semibold text-white">
                    Low-Bed Flatbed Mobilization Truck Transport
                  </span>
                  <span className="text-slate-400 ml-1.5 text-[11px]">
                    (Addis Central Yard → {isOutOfCity ? selectedDestinationName : "Ayat Site"})
                  </span>
                </div>
                <span className="font-mono font-bold text-white text-sm">
                  ETB {formatETB(quoteBreakdown.mobilizationFee)}
                </span>
              </div>
            )}

            {/* Line Item 6: Out-of-Addis Agreed Corridor Distance */}
            {isOutOfCity && (
              <div className="flex justify-between items-center py-1 text-slate-400">
                <div>
                  <span className="font-medium text-slate-300">
                    Regional Corridor Route Allowance
                  </span>
                  <span className="text-slate-400 ml-1.5 font-mono text-[11px]">
                    ({agreedDealKm} KM round-trip agreed allowance included)
                  </span>
                </div>
                <span className="font-mono text-emerald-400 text-xs">Included in Agreement</span>
              </div>
            )}

            {/* Line Item 7: Excess Gauge Overage (if reported) */}
            {quoteBreakdown.overtimeAmount > 0 && (
              <div className="flex justify-between items-center py-1 text-rose-300 bg-rose-950/20 px-2 rounded-lg border border-rose-900/40">
                <div>
                  <span className="font-semibold text-rose-200">
                    Excess {quoteBreakdown.meterUnit} Usage Surcharge
                  </span>
                  <span className="text-rose-400/80 ml-1.5 font-mono text-[11px]">
                    ({quoteBreakdown.overtimeUnits} {quoteBreakdown.meterUnit} excess @ {formatETB(quoteBreakdown.overtimeRate)}/{quoteBreakdown.meterUnit})
                  </span>
                </div>
                <span className="font-mono font-bold text-rose-300 text-sm">
                  +ETB {formatETB(quoteBreakdown.overtimeAmount)}
                </span>
              </div>
            )}

            {/* Taxable Subtotal */}
            <div className="border-t border-white/10 my-2 pt-3 flex justify-between items-center font-bold text-slate-200 text-sm">
              <span className="flex items-center gap-1.5">
                <span>Taxable Subtotal (Before VAT)</span>
              </span>
              <span className="font-mono text-[#df2531] text-base font-display">
                ETB {formatETB(quoteBreakdown.taxableSubtotal)}
              </span>
            </div>

            {/* 15% Ethiopian VAT */}
            <div className="flex justify-between items-center py-1 text-emerald-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <span>Ethiopian Value Added Tax (+15% VAT)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 font-mono">15% on ETB {formatETB(quoteBreakdown.taxableSubtotal)}</span>
              </span>
              <span className="font-mono font-bold text-sm">
                +ETB {formatETB(quoteBreakdown.vat15Pct)}
              </span>
            </div>

            {/* Conditional 2% Withholding Tax (WHT) */}
            {quoteBreakdown.isWithholdingApplicable ? (
              <div className="flex justify-between items-center py-1 text-white font-semibold">
                <span className="flex items-center gap-1.5">
                  <span>B2B Ministry of Revenue Withholding Tax (-2% WHT)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 font-mono">2% on ETB {formatETB(quoteBreakdown.taxableSubtotal)}</span>
                </span>
                <span className="font-mono font-bold text-sm text-[#df2531]">
                  -ETB {formatETB(quoteBreakdown.withholding2Pct)}
                </span>
              </div>
            ) : (
              <div className="flex justify-between items-center py-1 text-slate-500 text-[11px]">
                <span>2% Ministry of Revenue Withholding Tax (WHT)</span>
                <span className="font-mono">
                  ETB 0.00 ({!isB2BCustomer ? "Individual Renter Exempt" : "Subtotal ≤ 10,000 ETB"})
                </span>
              </div>
            )}

            {/* Net Payable */}
            <div className="border-t-2 border-white/20 pt-3 flex justify-between items-baseline font-black text-white">
              <div>
                <div className="text-base text-white font-display">Net Total Payable</div>
                <div className="text-[10px] text-slate-400 font-normal">
                  Taxable Subtotal + 15% VAT {quoteBreakdown.isWithholdingApplicable ? "- 2% MoR WHT" : ""}
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-2xl text-[#df2531] font-black font-display">
                  ETB {formatETB(quoteBreakdown.totalPayable)}
                </span>
              </div>
            </div>
          </div>

          {/* Scanned Notarized Guarantee Contract Attachment Status */}
          <div className="p-3.5 rounded-xl bg-black border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <div className="font-bold text-white text-xs flex items-center gap-2">
                  <span>Notarized Guarantee Contract</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 font-mono">
                    Attached &amp; Ready
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {uploadedGuaranteeDoc.fileName} • {uploadedGuaranteeDoc.fileSize} • Uploaded {uploadedGuaranteeDoc.uploadedAt}
                </div>
              </div>
            </div>
            <div className="text-right text-[11px] text-emerald-400 font-semibold shrink-0">
              ✓ Attached to Dispatch Packet for Head Dispatcher
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/20 text-slate-300 font-semibold hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ArrowLeft size={15} />
              Back to KYC Vault &amp; Map
            </button>

            <button
              onClick={handleFinalBookingSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-black shadow-lg shadow-[#df2531]/30 text-xs disabled:opacity-50 border border-[#df2531]/50 transition-all cursor-pointer font-display"
            >
              <Sparkles size={16} />
              {isSubmitting ? "Executing GiST Anti-Double-Booking Transaction..." : "Confirm & Unlock Dispatch"}
            </button>
          </div>
        </div>
      )}

      {/* Polymorphic Asset Registration Modal */}
      <PolymorphicAssetForm
        isOpen={isRegisterAssetOpen}
        onClose={() => setIsRegisterAssetOpen(false)}
        onAssetCreated={() => reloadAssets(true)}
      />
    </div>
  );
}
