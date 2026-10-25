"use client";

import React, { useState } from "react";
import {
  AssetCategory,
  MeterUnit,
  Asset,
  AssetRateCard,
} from "@/lib/types";
import { useTenant } from "@/context/TenantContext";
import {
  Truck,
  Layers,
  Fuel,
  Gauge,
  Calendar,
  Save,
  CheckCircle2,
  X,
  Plus,
  Car,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PolymorphicAssetFormProps {
  onSuccess?: (newAsset: any) => void;
  onCancel?: () => void;
  parentAssets?: Asset[];
  isOpen?: boolean;
  onClose?: () => void;
  onAssetCreated?: () => void | Promise<void>;
}

export function PolymorphicAssetForm({
  onSuccess,
  onCancel,
  parentAssets = [],
  isOpen,
  onClose,
  onAssetCreated,
}: PolymorphicAssetFormProps) {
  const { activeTenantId } = useTenant();

  const [category, setCategory] = useState<AssetCategory>("passenger_car");
  const [make, setMake] = useState("BTD");
  const [model, setModel] = useState("Segule");
  const [manufactureYear, setManufactureYear] = useState(2023);
  const [plateNumber, setPlateNumber] = useState("3-B99210 AA");
  const [chassisOrSerialNumber, setChassisOrSerialNumber] = useState("CAT320D-ET-2023-99");
  const [libreCertificateNo, setLibreCertificateNo] = useState("LIB-ET-2023-998");
  const [bolloExpiryDate, setBolloExpiryDate] = useState("2027-06-30");
  const [insuranceExpiryDate, setInsuranceExpiryDate] = useState("2027-06-30");
  const [currentMeterReading, setCurrentMeterReading] = useState(12000);
  const [requiresCompanyOperator, setRequiresCompanyOperator] = useState(false);
  const [parentAssetId, setParentAssetId] = useState<string>("");

  // Rate Card State
  const [dailyRate, setDailyRate] = useState(3000);
  const [weeklyRate, setWeeklyRate] = useState(18000);
  const [monthlyRate, setMonthlyRate] = useState(66000);
  const [overtimeRatePerUnit, setOvertimeRatePerUnit] = useState(45);
  const [securityDepositAmount, setSecurityDepositAmount] = useState(150000);

  // Machinery Specific Specs
  const [operatingWeightTons, setOperatingWeightTons] = useState(21.8);
  const [bucketCapacityM3, setBucketCapacityM3] = useState(1.2);
  const [dailyEngineHourCap, setDailyEngineHourCap] = useState(8);
  const [idleDayMinimumHours, setIdleDayMinimumHours] = useState(4);
  const [defaultMobilizationFee, setDefaultMobilizationFee] = useState(28000);
  const [hydraulicAuxLines, setHydraulicAuxLines] = useState(true);
  const [operatorDailyRate, setOperatorDailyRate] = useState(0);
  const [operatorPerDiemRate, setOperatorPerDiemRate] = useState(0); // Operator Per-Diem Allowance

  // Passenger Car Specific Specs
  const [transmission, setTransmission] = useState<"automatic" | "manual">("automatic");
  const [seats, setSeats] = useState(5);
  const [fuelType, setFuelType] = useState<"diesel" | "benzin" | "electric">("electric");
  const [dailyKmLimit, setDailyKmLimit] = useState(200);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-adapt meter unit when category switches
  const meterUnit: MeterUnit =
    category === "passenger_car" || category === "commercial_van"
      ? "odometer_km"
      : category === "attachment"
      ? "calendar_days_only"
      : "engine_hours";

  const handleCategoryChange = (newCat: AssetCategory) => {
    setCategory(newCat);
    if (newCat === "passenger_car") {
      setMake("BTD");
      setModel("Segule");
      setPlateNumber("3-B99210 AA");
      setChassisOrSerialNumber("CAT320D-ET-2023-99");
      setLibreCertificateNo("LIB-ET-2023-998");
      setDailyRate(3000);
      setOvertimeRatePerUnit(45);
      setSecurityDepositAmount(150000);
      setCurrentMeterReading(12000);
      setRequiresCompanyOperator(false);
      setOperatorDailyRate(0);
      setOperatorPerDiemRate(0);
      setDefaultMobilizationFee(0);
      setTransmission("automatic");
      setSeats(5);
      setFuelType("electric");
      setDailyKmLimit(200);
    } else if (newCat === "commercial_van") {
      setMake("Toyota");
      setModel("Hilux Double Cab 4x4");
      setPlateNumber("3-C12445 AA");
      setChassisOrSerialNumber("MR0HA3CD-2023-44");
      setLibreCertificateNo("LIB-ET-2023-552");
      setDailyRate(9500);
      setOvertimeRatePerUnit(40);
      setSecurityDepositAmount(80000);
      setCurrentMeterReading(34000);
      setRequiresCompanyOperator(false);
      setOperatorDailyRate(0);
      setOperatorPerDiemRate(0);
      setDefaultMobilizationFee(0);
      setTransmission("manual");
      setSeats(5);
      setFuelType("diesel");
      setDailyKmLimit(250);
    } else if (newCat === "heavy_machinery") {
      setMake("Caterpillar");
      setModel("320D Excavator");
      setPlateNumber("SPL-04899 AA");
      setChassisOrSerialNumber("CAT320D-ET-2023-99");
      setLibreCertificateNo("LIB-ET-2023-998");
      setDailyRate(38000);
      setOvertimeRatePerUnit(4800);
      setSecurityDepositAmount(250000);
      setCurrentMeterReading(3150);
      setRequiresCompanyOperator(true);
      setOperatorDailyRate(2500);
      setOperatorPerDiemRate(1500);
      setDefaultMobilizationFee(28000);
      setOperatingWeightTons(21.8);
      setBucketCapacityM3(1.2);
      setDailyEngineHourCap(8);
      setIdleDayMinimumHours(4);
      setHydraulicAuxLines(true);
    } else if (newCat === "attachment") {
      setMake("Caterpillar");
      setModel("H120Es Breaker");
      setPlateNumber("ATT-BRK-99");
      setChassisOrSerialNumber("CAT-BRK-9981-SN");
      setLibreCertificateNo("LIB-ATT-2023-01");
      setDailyRate(12000);
      setOvertimeRatePerUnit(1500);
      setSecurityDepositAmount(60000);
      setCurrentMeterReading(50);
      setRequiresCompanyOperator(false);
      setOperatorDailyRate(0);
      setOperatorPerDiemRate(0);
      setDefaultMobilizationFee(5000);
      setHydraulicAuxLines(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        ownerId: !activeTenantId || activeTenantId === "all" ? "tenant-001" : activeTenantId,
        parentAssetId: category === "attachment" && parentAssetId ? parentAssetId : null,
        category,
        make,
        model,
        manufactureYear,
        plateNumber: plateNumber || undefined,
        chassisOrSerialNumber,
        libreCertificateNo,
        bolloExpiryDate,
        insuranceExpiryDate,
        meterUnit,
        currentMeterReading,
        requiresCompanyOperator,
        primaryImageUrl:
          category === "passenger_car"
            ? "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=800&q=80"
            : category === "commercial_van"
            ? "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80"
            : category === "attachment"
            ? "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80"
            : "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=800&q=80",
        specs:
          category === "heavy_machinery"
            ? {
                operatingWeightTons,
                bucketCapacityM3,
                dailyEngineHourCap,
                idleDayMinimumHours,
                hydraulicAuxLines,
              }
            : category === "passenger_car" || category === "commercial_van"
            ? {
                transmission,
                seats,
                fuelType,
                dailyKmLimit,
              }
            : {
                hydraulicAuxLines,
              },
        rateCard: {
          dailyRate,
          weeklyRate,
          monthlyRate,
          includedMeterUnitsPerDay: meterUnit === "odometer_km" ? dailyKmLimit : dailyEngineHourCap,
          overtimeRatePerUnit,
          idleDayMinimumHours: category === "heavy_machinery" ? idleDayMinimumHours : 0,
          operatorDailyRate,
          operatorPerDiemRate,
          defaultMobilizationFee,
          securityDepositAmount,
        },
      };

      const res = await fetch("/api/v1/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to register asset");
      }

      if (onAssetCreated) {
        await onAssetCreated();
      }
      if (onSuccess) {
        onSuccess(json.asset);
      }
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit asset");
    } finally {
      setSubmitting(false);
    }
  };

  const formElement = (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs text-neutral-200">
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 animate-fadeIn">
          {errorMsg}
        </div>
      )}

      {/* Asset Category Type (Image 1 reference) */}
      <div className="space-y-2">
        <label className="font-bold text-white text-sm font-display">Asset Category Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { id: "heavy_machinery", label: "Heavy Machinery", desc: "Hours + Tonnage" },
            { id: "passenger_car", label: "Passenger Car", desc: "KM + Fuel + Seats" },
            { id: "commercial_van", label: "Commercial / 4x4", desc: "Field Double Cab" },
            { id: "attachment", label: "Attachment", desc: "Breakers & Buckets" },
          ].map((cat) => (
            <button
              type="button"
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id as AssetCategory)}
              className={cn(
                "p-3 rounded-xl border text-left transition-all cursor-pointer",
                category === cat.id
                  ? "bg-[#df2531]/15 border-[#df2531] text-white font-bold ring-1 ring-[#df2531]/50 shadow-md shadow-[#df2531]/20"
                  : "bg-[#141414] border-[#262626] text-neutral-400 hover:bg-[#1C1C1C] hover:text-white"
              )}
            >
              <div className="font-bold text-xs font-display">{cat.label}</div>
              <div className="text-[10px] text-neutral-500 mt-0.5">{cat.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* General Specs Row (Image 1 reference) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0A0A0A] p-4 rounded-xl border border-[#222222]">
        <div>
          <label className="font-medium text-neutral-400">Make / Manufacturer</label>
          <input
            type="text"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            className="mt-1 w-full rounded-lg bg-[#000000] border border-[#262626] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#df2531]"
            required
          />
        </div>
        <div>
          <label className="font-medium text-neutral-400">Model Specification</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="mt-1 w-full rounded-lg bg-[#000000] border border-[#262626] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#df2531]"
            required
          />
        </div>
        <div>
          <label className="font-medium text-neutral-400">Manufacture Year</label>
          <input
            type="number"
            value={manufactureYear}
            onChange={(e) => setManufactureYear(parseInt(e.target.value, 10))}
            className="mt-1 w-full rounded-lg bg-[#000000] border border-[#262626] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#df2531]"
            required
          />
        </div>
        <div>
          <label className="font-medium text-neutral-400">Plate Number (Ethiopia)</label>
          <input
            type="text"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
            placeholder="e.g. 3-B99210 AA"
            className="mt-1 w-full rounded-lg bg-[#000000] border border-[#262626] px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#df2531]"
          />
        </div>
        <div>
          <label className="font-medium text-neutral-400">Chassis / Serial Number</label>
          <input
            type="text"
            value={chassisOrSerialNumber}
            onChange={(e) => setChassisOrSerialNumber(e.target.value)}
            className="mt-1 w-full rounded-lg bg-[#000000] border border-[#262626] px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#df2531]"
            required
          />
        </div>
        <div>
          <label className="font-medium text-neutral-400">Libre Certificate No</label>
          <input
            type="text"
            value={libreCertificateNo}
            onChange={(e) => setLibreCertificateNo(e.target.value)}
            className="mt-1 w-full rounded-lg bg-[#000000] border border-[#262626] px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#df2531]"
          />
        </div>
      </div>

      {/* Dynamic Section 2: Specs (Image 1 reference) */}
      {(category === "passenger_car" || category === "commercial_van") && (
        <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#222222] space-y-3">
          <div className="flex items-center justify-between border-b border-[#222222] pb-2">
            <span className="font-bold text-[#df2531] flex items-center gap-1.5 font-display">
              <Car size={15} />
              Vehicle Capacity, Transmission & Fuel Specs
            </span>
            <span className="text-[10px] text-neutral-400 font-mono uppercase">
              METER UNIT: ODOMETER_KM
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="font-medium text-neutral-400">Transmission</label>
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value as any)}
                className="mt-1 w-full rounded-lg bg-[#000000] border border-[#262626] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#df2531]"
              >
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <div>
              <label className="font-medium text-neutral-400">Seats Capacity</label>
              <input
                type="number"
                value={seats}
                onChange={(e) => setSeats(parseInt(e.target.value, 10))}
                className="mt-1 w-full rounded-lg bg-[#000000] border border-[#262626] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#df2531]"
              />
            </div>
            <div>
              <label className="font-medium text-neutral-400">Fuel Type</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as any)}
                className="mt-1 w-full rounded-lg bg-[#000000] border border-[#262626] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#df2531]"
              >
                <option value="electric">Electric (EV)</option>
                <option value="diesel">Diesel</option>
                <option value="benzin">Benzin (Gasoline)</option>
              </select>
            </div>
            <div>
              <label className="font-medium text-neutral-400">Daily Included KM</label>
              <input
                type="number"
                value={dailyKmLimit}
                onChange={(e) => setDailyKmLimit(parseInt(e.target.value, 10))}
                className="mt-1 w-full rounded-lg bg-[#000000] border border-[#262626] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#df2531]"
              />
            </div>
          </div>
        </div>
      )}

      {category === "heavy_machinery" && (
        <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#222222] space-y-3">
          <div className="flex items-center justify-between border-b border-[#222222] pb-2">
            <span className="font-bold text-[#df2531] flex items-center gap-1.5 font-display">
              <Truck size={15} />
              Heavy Machinery Operating & Aux Specs
            </span>
            <span className="text-[10px] text-neutral-400 font-mono uppercase">
              METER UNIT: ENGINE_HOURS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="font-medium text-neutral-400">Operating Weight (Tons)</label>
              <input
                type="number"
                step="0.1"
                value={operatingWeightTons}
                onChange={(e) => setOperatingWeightTons(parseFloat(e.target.value))}
                className="mt-1 w-full rounded-lg bg-[#000000] border border-[#262626] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#df2531]"
              />
            </div>
            <div>
              <label className="font-medium text-neutral-400">Bucket Capacity (m³)</label>
              <input
                type="number"
                step="0.1"
                value={bucketCapacityM3}
                onChange={(e) => setBucketCapacityM3(parseFloat(e.target.value))}
                className="mt-1 w-full rounded-lg bg-[#000000] border border-[#262626] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#df2531]"
              />
            </div>
            <div>
              <label className="font-medium text-neutral-400">Daily Engine Hour Cap</label>
              <input
                type="number"
                value={dailyEngineHourCap}
                onChange={(e) => setDailyEngineHourCap(parseInt(e.target.value, 10))}
                className="mt-1 w-full rounded-lg bg-[#000000] border border-[#262626] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#df2531]"
              />
            </div>
            <div>
              <label className="font-medium text-neutral-400">Idle Day Minimum Hours</label>
              <input
                type="number"
                value={idleDayMinimumHours}
                onChange={(e) => setIdleDayMinimumHours(parseInt(e.target.value, 10))}
                className="mt-1 w-full rounded-lg bg-[#000000] border border-[#262626] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#df2531]"
              />
            </div>
          </div>

          <div className="pt-1 flex items-center gap-2">
            <input
              type="checkbox"
              id="auxLines"
              checked={hydraulicAuxLines}
              onChange={(e) => setHydraulicAuxLines(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-700 text-[#df2531] bg-[#000000] accent-[#df2531]"
            />
            <label htmlFor="auxLines" className="font-medium text-neutral-300">
              Auxiliary Hydraulic Breaker Lines Pre-Calibrated
            </label>
          </div>
        </div>
      )}

      {category === "attachment" && (
        <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#222222] space-y-3">
          <div className="flex items-center justify-between border-b border-[#222222] pb-2">
            <span className="font-bold text-[#df2531] flex items-center gap-1.5 font-display">
              <Layers size={15} />
              Attachment & Compatibility Linkage
            </span>
            <span className="text-[10px] text-neutral-400 font-mono uppercase">
              METER UNIT: CALENDAR_DAYS_ONLY
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-neutral-400">Parent Carrier Machine Linkage</label>
              <select
                value={parentAssetId}
                onChange={(e) => setParentAssetId(e.target.value)}
                className="mt-1 w-full rounded-lg bg-[#000000] border border-[#262626] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#df2531]"
              >
                <option value="">No Primary Carrier (Standalone Bundle)</option>
                {parentAssets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.make} {p.model} ({p.plateNumber || p.chassisOrSerialNumber})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-medium text-neutral-400">Auxiliary Line Compatibility</label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="attAux"
                  checked={hydraulicAuxLines}
                  onChange={(e) => setHydraulicAuxLines(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-700 text-[#df2531] bg-[#000000] accent-[#df2531]"
                />
                <label htmlFor="attAux" className="text-neutral-300">
                  Standard Two-Way High Pressure Breaker Lines
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Ethiopian Rate Card (Image 1 reference) */}
      <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#222222] space-y-3">
        <div className="flex items-center justify-between border-b border-[#222222] pb-2">
          <span className="font-bold text-[#df2531] font-display">Ethiopian Rate Card (ETB Pricing Matrix)</span>
          <span className="text-[10px] text-neutral-400 font-mono">Includes 15% VAT calculation rule</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="font-medium text-neutral-400">Daily Base Rate (ETB)</label>
            <input
              type="number"
              value={dailyRate}
              onChange={(e) => setDailyRate(parseFloat(e.target.value) || 0)}
              className="mt-1 w-full rounded-lg bg-[#000000] border border-[#262626] px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#df2531]"
              required
            />
          </div>
          <div>
            <label className="font-medium text-neutral-400">Overtime Rate per KM/Hour (ETB)</label>
            <input
              type="number"
              value={overtimeRatePerUnit}
              onChange={(e) => setOvertimeRatePerUnit(parseFloat(e.target.value) || 0)}
              className="mt-1 w-full rounded-lg bg-[#000000] border border-[#262626] px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#df2531]"
            />
          </div>
          <div>
            <label className="font-medium text-neutral-400">Security Deposit / CPO (ETB)</label>
            <input
              type="number"
              value={securityDepositAmount}
              onChange={(e) => setSecurityDepositAmount(parseFloat(e.target.value) || 0)}
              className="mt-1 w-full rounded-lg bg-[#000000] border border-[#262626] px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#df2531]"
            />
          </div>
          <div>
            <label className="font-medium text-neutral-400">Operator Daily Rate (ETB)</label>
            <input
              type="number"
              value={operatorDailyRate}
              onChange={(e) => setOperatorDailyRate(parseFloat(e.target.value) || 0)}
              className="mt-1 w-full rounded-lg bg-[#000000] border border-[#262626] px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#df2531]"
            />
          </div>
          <div>
            <label className="font-medium text-neutral-400">Operator Per-Diem Allowance (ETB)</label>
            <input
              type="number"
              value={operatorPerDiemRate}
              onChange={(e) => setOperatorPerDiemRate(parseFloat(e.target.value) || 0)}
              className="mt-1 w-full rounded-lg bg-[#000000] border border-[#262626] px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#df2531]"
            />
          </div>
          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="reqOperator"
              checked={requiresCompanyOperator}
              onChange={(e) => setRequiresCompanyOperator(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-700 text-[#df2531] bg-[#000000] accent-[#df2531]"
            />
            <label htmlFor="reqOperator" className="font-medium text-neutral-200 cursor-pointer">
              Requires Certified DEL Operator
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3">
        {(onCancel || onClose) && (
          <button
            type="button"
            onClick={onClose || onCancel}
            className="px-5 py-2.5 rounded-xl border border-neutral-700 hover:bg-neutral-800 text-neutral-300 font-semibold cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold text-xs shadow-md shadow-[#df2531]/20 border border-[#df2531]/40 cursor-pointer disabled:opacity-50 transition-all font-display"
        >
          <Save size={16} />
          {submitting ? "Registering Fleet Asset..." : "Register Fleet Asset"}
        </button>
      </div>
    </form>
  );

  // If called as a modal
  if (isOpen !== undefined) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
        <div className="relative w-full max-w-4xl bg-[#0A0A0A] border border-[#262626] rounded-2xl shadow-2xl p-6 my-auto text-xs space-y-6 max-h-[92vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#222222] pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                <Truck className="text-[#df2531]" size={20} />
                Register Fleet Asset
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Polymorphic asset registry for Heavy Machinery, Passenger Cars, Field 4x4s, and Attachments.
              </p>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {formElement}
        </div>
      </div>
    );
  }

  return formElement;
}
