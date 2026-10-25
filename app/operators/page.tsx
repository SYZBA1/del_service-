"use client";

import React, { useState, useEffect } from "react";
import {
  UserCheck,
  Plus,
  Search,
  ShieldCheck,
  MapPin,
  Truck,
  Award,
  Phone,
  Mail,
  Calendar,
  X,
  CheckCircle,
  FileText,
  AlertCircle,
  Camera,
  Pencil,
  Trash2,
  Upload,
} from "lucide-react";
import { OperatorDriver } from "@/lib/types";
import { formatETB, cn } from "@/lib/utils";

export default function OperatorsRegistryPage() {
  const [operators, setOperators] = useState<OperatorDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterGrade, setFilterGrade] = useState<string>("all");
  const [selectedOperator, setSelectedOperator] = useState<OperatorDriver | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit Operator State
  const [editingOperator, setEditingOperator] = useState<OperatorDriver | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete Operator State
  const [operatorToDelete, setOperatorToDelete] = useState<OperatorDriver | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State for "Add New"
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "+251 9",
    email: "",
    driverLicenseGrade: "Special Mobile Machinery",
    driverLicenseNo: "",
    licenseExpiryDate: "2028-12-31",
    faydaFinNumber: "",
    workExperienceYears: 5,
    experienceDetails: "",
    dispatchArea: "Addis Ababa & Oromia Corridor",
    livingArea: "Kality Industrial Zone, Addis Ababa",
    estimatedPerDiem: 1500,
    machineryHandledText: "CAT 320D Excavator, SDLG Loader",
    kycNidImageUrl: "/mock/nid-sample.jpg",
    avatarUrl: "/avatars/default-operator.png",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchOperators = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/operators");
      const json = await res.json();
      if (json.success) {
        setOperators(json.data);
      }
    } catch (e) {
      console.error("Failed to load operators", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  const handleOpenEdit = (op: OperatorDriver) => {
    setEditingOperator(op);
    setEditForm({
      id: op.id,
      fullName: op.fullName,
      phoneNumber: op.phoneNumber,
      email: op.email || "",
      driverLicenseGrade: op.driverLicenseGrade,
      driverLicenseNo: op.driverLicenseNo,
      licenseExpiryDate: op.licenseExpiryDate,
      faydaFinNumber: op.faydaFinNumber || "",
      workExperienceYears: op.workExperienceYears,
      experienceDetails: op.experienceDetails,
      dispatchArea: op.dispatchArea,
      livingArea: op.livingArea,
      estimatedPerDiem: op.estimatedPerDiem,
      kycNidImageUrl: op.kycNidImageUrl || "",
      avatarUrl: op.avatarUrl || "",
    });
  };

  // Image Upload handler for Edit Modal
  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: "avatar" | "nid") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (target === "avatar") {
        setEditForm((prev: any) => ({ ...prev, avatarUrl: dataUrl }));
      } else {
        setEditForm((prev: any) => ({ ...prev, kycNidImageUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Edit
  const handleSaveEdit = async () => {
    if (!editingOperator) return;
    setIsSavingEdit(true);

    try {
      const res = await fetch("/api/v1/operators", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update operator");

      setSuccessMessage(`Operator '${editForm.fullName}' updated successfully!`);
      setEditingOperator(null);
      fetchOperators();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Operator
  const handleDeleteOperator = async () => {
    if (!operatorToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/v1/operators?id=${operatorToDelete.id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete operator");

      setSuccessMessage(`Operator '${operatorToDelete.fullName}' removed from ODR registry.`);
      setOperatorToDelete(null);
      fetchOperators();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Add New Operator
  const handleAddNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const machineryArray = formData.machineryHandledText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/v1/operators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          machineryHandled: machineryArray,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to register operator");

      setSuccessMessage(`Certified Operator '${formData.fullName}' registered in ODR Module!`);
      setIsModalOpen(false);
      fetchOperators();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOperators = operators.filter((op) => {
    if (filterGrade !== "all" && op.driverLicenseGrade !== filterGrade) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = op.fullName.toLowerCase().includes(q);
      const matchArea = op.dispatchArea.toLowerCase().includes(q) || op.livingArea.toLowerCase().includes(q);
      const matchPhone = op.phoneNumber.includes(q);
      const matchLicense = op.driverLicenseNo.toLowerCase().includes(q);
      if (!matchName && !matchArea && !matchPhone && !matchLicense) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 rounded-2xl bg-[#0a0a0a] border border-[#df2531]/30 shadow-lg">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 font-display">
            <UserCheck className="text-[#df2531]" size={24} />
            Certified Operators & Drivers Registration (ODR)
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Official Ethiopian equipment operators registry. Verified KYC NID, license grades, dispatch &amp; living zones, and per-diem allowances.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold text-xs shadow-md shadow-[#df2531]/30 border border-[#df2531]/50 transition-all font-display"
        >
          <Plus size={16} />
          Add New Operator / Driver
        </button>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle size={16} className="text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter Ribbon */}
      <div className="bg-[#0a0a0a] p-4 rounded-xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All Certified Crew" },
            { id: "Special Mobile Machinery", label: "Special Mobile Machinery (Excavators & Heavy Equipment)" },
            { id: "Public 1", label: "Public 1 (VIP & Passenger Chauffeurs)" },
            { id: "Dry Freight 1", label: "Dry Freight 1 (Freight & Commercial Logistics)" },
          ].map((grade) => (
            <button
              key={grade.id}
              onClick={() => setFilterGrade(grade.id)}
              className={cn(
                "px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer",
                filterGrade === grade.id
                  ? "bg-[#df2531] text-white shadow border border-[#df2531]/50 font-display"
                  : "bg-black text-neutral-300 hover:bg-neutral-900 border border-neutral-800"
              )}
            >
              {grade.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
          <input
            type="text"
            placeholder="Search operator, area, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-black border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#df2531] w-56 font-mono"
          />
        </div>
      </div>

      {/* Operators Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOperators.map((op) => {
          const isHeavySpecialist = op.driverLicenseGrade === "Special Mobile Machinery" || (op.driverLicenseGrade && op.driverLicenseGrade.toLowerCase().includes("machinery"));

          return (
            <div
              key={op.id}
              className="p-4 rounded-2xl border border-neutral-800 bg-[#0a0a0a] hover:border-[#df2531]/40 transition-all space-y-3 relative group text-xs text-neutral-300 shadow-md"
            >
              {/* Card Top: Identity & Status + EDIT/DELETE */}
              <div className="flex items-start justify-between">
                <div
                  onClick={() => setSelectedOperator(op)}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <div className="h-10 w-10 rounded-full bg-black border border-neutral-800 flex items-center justify-center font-bold text-[#df2531] text-sm overflow-hidden shrink-0 font-display">
                    {op.avatarUrl ? (
                      <img src={op.avatarUrl} alt={op.fullName} className="w-full h-full object-cover" />
                    ) : (
                      op.fullName.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm flex items-center gap-1.5 font-display">
                      {op.fullName}
                      {op.kycVerified && (
                        <span title="VeriFayda KYC Verified">
                          <ShieldCheck size={14} className="text-emerald-400" />
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono">{op.phoneNumber}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                      op.status === "available"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-[#df2531]/15 text-[#df2531] border border-[#df2531]/40"
                    )}
                  >
                    {op.status}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(op);
                    }}
                    className="p-1.5 rounded-lg bg-neutral-900 hover:bg-[#df2531]/20 text-neutral-400 hover:text-[#df2531] border border-neutral-800 transition-colors"
                    title="Edit Operator & Photo"
                  >
                    <Pencil size={12} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOperatorToDelete(op);
                    }}
                    className="p-1.5 rounded-lg bg-neutral-900 hover:bg-rose-950/60 text-neutral-400 hover:text-rose-400 border border-neutral-800 transition-colors"
                    title="Delete Operator"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* License & Experience Badge */}
              <div
                onClick={() => setSelectedOperator(op)}
                className="flex items-center justify-between bg-black p-2.5 rounded-xl border border-neutral-800 cursor-pointer"
              >
                <div>
                  <div className="text-[10px] text-neutral-400">License Grade</div>
                  <div
                    className={cn(
                      "font-bold text-xs font-display",
                      isHeavySpecialist ? "text-[#df2531]" : "text-emerald-400"
                    )}
                  >
                    {op.driverLicenseGrade}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-neutral-400">Experience</div>
                  <div className="font-bold text-white font-display">{op.workExperienceYears} Years</div>
                </div>
              </div>

              {/* Living & Dispatch Areas */}
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <MapPin size={12} className="text-[#df2531] shrink-0" />
                  <span>Living: <span className="text-neutral-200 font-medium">{op.livingArea}</span></span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <Truck size={12} className="text-neutral-400 shrink-0" />
                  <span>Dispatch: <span className="text-neutral-200 font-medium">{op.dispatchArea}</span></span>
                </div>
              </div>

              {/* Per-Diem Allowance */}
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">Per-Diem Allowance:</span>
                <span className="font-mono font-bold text-[#df2531] bg-[#df2531]/10 px-2 py-0.5 rounded border border-[#df2531]/30 font-display">
                  {formatETB(op.estimatedPerDiem)}/day
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: EDIT OPERATOR */}
      {editingOperator && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0a0a0a] border border-[#df2531]/40 rounded-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl text-xs text-neutral-200 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2 font-display">
                  <Pencil className="text-[#df2531]" size={18} />
                  Edit Operator: {editingOperator.fullName}
                </h2>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Update operator license, dispatch zones, per-diem allowances, and image credentials.
                </p>
              </div>
              <button
                onClick={() => setEditingOperator(null)}
                className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Photo Upload Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-black border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-display">Profile Photo</span>
                    <label className="cursor-pointer px-2.5 py-1 rounded bg-[#df2531]/15 hover:bg-[#df2531]/25 text-[#df2531] font-bold text-[10px] flex items-center gap-1 font-display">
                      <Upload size={12} />
                      Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleEditImageUpload(e, "avatar")}
                      />
                    </label>
                  </div>
                  <div className="h-20 w-20 rounded-full bg-neutral-950 border border-neutral-800 overflow-hidden mx-auto flex items-center justify-center">
                    {editForm.avatarUrl ? (
                      <img src={editForm.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={20} className="text-neutral-600" />
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-display">KYC National ID Card</span>
                    <label className="cursor-pointer px-2.5 py-1 rounded bg-[#df2531]/15 hover:bg-[#df2531]/25 text-[#df2531] font-bold text-[10px] flex items-center gap-1 font-display">
                      <Upload size={12} />
                      Upload NID
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleEditImageUpload(e, "nid")}
                      />
                    </label>
                  </div>
                  <div className="h-20 w-full rounded-lg bg-neutral-950 border border-neutral-800 overflow-hidden flex items-center justify-center">
                    {editForm.kycNidImageUrl ? (
                      <img src={editForm.kycNidImageUrl} alt="NID" className="w-full h-full object-cover" />
                    ) : (
                      <FileText size={20} className="text-neutral-600" />
                    )}
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-neutral-400">Full Name</label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-white focus:outline-none focus:border-[#df2531]"
                  />
                </div>
                <div>
                  <label className="font-medium text-neutral-400">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-white font-mono focus:outline-none focus:border-[#df2531]"
                  />
                </div>
                <div>
                  <label className="font-medium text-neutral-400">License Grade</label>
                  <select
                    value={editForm.driverLicenseGrade}
                    onChange={(e) => setEditForm({ ...editForm, driverLicenseGrade: e.target.value })}
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-white font-semibold focus:outline-none focus:border-[#df2531]"
                  >
                    <option value="Special Mobile Machinery">Special Mobile Machinery (Excavators & Heavy Equipment)</option>
                    <option value="Public 1">Public 1 (VIP & Passenger Chauffeurs)</option>
                    <option value="Dry Freight 1">Dry Freight 1 (Freight & Commercial Logistics)</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-neutral-400">Driver License Number</label>
                  <input
                    type="text"
                    value={editForm.driverLicenseNo}
                    onChange={(e) => setEditForm({ ...editForm, driverLicenseNo: e.target.value })}
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-[#df2531] font-mono font-bold focus:outline-none focus:border-[#df2531]"
                  />
                </div>
                <div>
                  <label className="font-medium text-neutral-400">Living Area</label>
                  <input
                    type="text"
                    value={editForm.livingArea}
                    onChange={(e) => setEditForm({ ...editForm, livingArea: e.target.value })}
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-white focus:outline-none focus:border-[#df2531]"
                  />
                </div>
                <div>
                  <label className="font-medium text-neutral-400">Dispatch Area</label>
                  <input
                    type="text"
                    value={editForm.dispatchArea}
                    onChange={(e) => setEditForm({ ...editForm, dispatchArea: e.target.value })}
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-white focus:outline-none focus:border-[#df2531]"
                  />
                </div>
                <div>
                  <label className="font-medium text-neutral-400">Per-Diem Allowance (ETB/day)</label>
                  <input
                    type="number"
                    value={editForm.estimatedPerDiem}
                    onChange={(e) => setEditForm({ ...editForm, estimatedPerDiem: parseFloat(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-[#df2531] font-mono font-bold focus:outline-none focus:border-[#df2531]"
                  />
                </div>
                <div>
                  <label className="font-medium text-neutral-400">Years of Experience</label>
                  <input
                    type="number"
                    value={editForm.workExperienceYears}
                    onChange={(e) => setEditForm({ ...editForm, workExperienceYears: parseInt(e.target.value, 10) || 0 })}
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-white font-mono focus:outline-none focus:border-[#df2531]"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-neutral-400">Work Experience & Infrastructure Projects</label>
                <textarea
                  rows={2}
                  value={editForm.experienceDetails}
                  onChange={(e) => setEditForm({ ...editForm, experienceDetails: e.target.value })}
                  className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-white text-xs focus:outline-none focus:border-[#df2531]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
              <button
                onClick={() => setEditingOperator(null)}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-semibold border border-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="px-6 py-2.5 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold shadow-md shadow-[#df2531]/30 border border-[#df2531]/50 font-display"
              >
                {isSavingEdit ? "Saving..." : "Save Operator Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DELETE OPERATOR CONFIRMATION */}
      {operatorToDelete && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-[#df2531]/50 rounded-2xl p-6 space-y-4 shadow-2xl text-xs text-neutral-200 animate-fadeIn">
            <div className="flex items-center gap-3 text-[#df2531]">
              <div className="h-10 w-10 rounded-full bg-[#df2531]/20 border border-[#df2531]/40 flex items-center justify-center">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm font-display">Remove Operator</h3>
                <p className="text-[11px] text-neutral-400">This removes the crew member from active dispatch.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black border border-neutral-800 space-y-1">
              <div className="font-bold text-white text-xs">{operatorToDelete.fullName}</div>
              <div className="text-[11px] text-neutral-400">License: <span className="font-mono text-[#df2531] font-bold">{operatorToDelete.driverLicenseNo}</span> ({operatorToDelete.driverLicenseGrade})</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setOperatorToDelete(null)}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-semibold cursor-pointer border border-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteOperator}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold shadow-md shadow-[#df2531]/30 cursor-pointer font-display"
              >
                {isDeleting ? "Deleting..." : "Permanently Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW OPERATOR DETAILS */}
      {selectedOperator && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0a0a0a] border border-[#df2531]/40 rounded-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl text-xs text-neutral-200 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-black border border-neutral-800 flex items-center justify-center font-bold text-[#df2531] text-base overflow-hidden shrink-0 font-display">
                  {selectedOperator.avatarUrl ? (
                    <img src={selectedOperator.avatarUrl} alt={selectedOperator.fullName} className="w-full h-full object-cover" />
                  ) : (
                    selectedOperator.fullName.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-1.5 font-display">
                    {selectedOperator.fullName}
                    {selectedOperator.kycVerified && (
                      <ShieldCheck size={16} className="text-emerald-400" />
                    )}
                  </h2>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    {selectedOperator.driverLicenseGrade} • DL: {selectedOperator.driverLicenseNo}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedOperator(null)}
                className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 bg-black p-3 rounded-xl border border-neutral-800">
                <div>
                  <span className="text-[10px] text-neutral-400">Living Zone:</span>
                  <div className="font-semibold text-white">{selectedOperator.livingArea}</div>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400">Dispatch Jurisdiction:</span>
                  <div className="font-semibold text-white">{selectedOperator.dispatchArea}</div>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400">Per-Diem Allowance Rate:</span>
                  <div className="font-mono font-bold text-[#df2531] font-display">{formatETB(selectedOperator.estimatedPerDiem)}/day</div>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400">VeriFayda FIN:</span>
                  <div className="font-mono text-emerald-400 font-bold">{selectedOperator.faydaFinNumber || "FIN-VERIFIED"}</div>
                </div>
              </div>

              <div className="bg-black p-3 rounded-xl border border-neutral-800 space-y-1">
                <span className="font-bold text-white text-xs font-display">Work Experience Details:</span>
                <p className="text-[11px] text-neutral-300 leading-relaxed">{selectedOperator.experienceDetails}</p>
              </div>

              <div className="bg-black p-3 rounded-xl border border-neutral-800 space-y-1">
                <span className="font-bold text-white text-xs font-display">Certified Machinery Handled:</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedOperator.machineryHandled.map((m, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-[#df2531]/15 text-[#df2531] font-semibold text-[10px] border border-[#df2531]/30">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-neutral-800">
              <button
                onClick={() => setSelectedOperator(null)}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-semibold cursor-pointer border border-neutral-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD NEW OPERATOR */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0a0a0a] border border-[#df2531]/40 rounded-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl text-xs text-neutral-200 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2 font-display">
                  <UserCheck className="text-[#df2531]" size={18} />
                  Register Certified Operator / Driver (ODR)
                </h2>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Operators registered here appear dynamically in the Dispatcher Booking Desk.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddNew} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-neutral-400">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Hailu Kebede"
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-white focus:outline-none focus:border-[#df2531]"
                  />
                </div>
                <div>
                  <label className="font-medium text-neutral-400">Phone Number (+251) *</label>
                  <input
                    type="text"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-white font-mono focus:outline-none focus:border-[#df2531]"
                  />
                </div>
                <div>
                  <label className="font-medium text-neutral-400">Driver License Grade *</label>
                  <select
                    value={formData.driverLicenseGrade}
                    onChange={(e) => setFormData({ ...formData, driverLicenseGrade: e.target.value })}
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-white font-semibold focus:outline-none focus:border-[#df2531]"
                  >
                    <option value="Special Mobile Machinery">Special Mobile Machinery (Excavators & Heavy Equipment)</option>
                    <option value="Public 1">Public 1 (VIP & Passenger Chauffeurs)</option>
                    <option value="Dry Freight 1">Dry Freight 1 (Freight & Commercial Logistics)</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-neutral-400">Driver License Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.driverLicenseNo}
                    onChange={(e) => setFormData({ ...formData, driverLicenseNo: e.target.value })}
                    placeholder="DL-ETH-ET-xxxx"
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-[#df2531] font-mono font-bold focus:outline-none focus:border-[#df2531]"
                  />
                </div>
                <div>
                  <label className="font-medium text-neutral-400">Living Area (Residence) *</label>
                  <input
                    type="text"
                    required
                    value={formData.livingArea}
                    onChange={(e) => setFormData({ ...formData, livingArea: e.target.value })}
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-white focus:outline-none focus:border-[#df2531]"
                  />
                </div>
                <div>
                  <label className="font-medium text-neutral-400">Dispatch Jurisdiction *</label>
                  <input
                    type="text"
                    required
                    value={formData.dispatchArea}
                    onChange={(e) => setFormData({ ...formData, dispatchArea: e.target.value })}
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-white focus:outline-none focus:border-[#df2531]"
                  />
                </div>
                <div>
                  <label className="font-medium text-neutral-400">Estimated Per-Diem Allowance (ETB/day) *</label>
                  <input
                    type="number"
                    required
                    value={formData.estimatedPerDiem}
                    onChange={(e) => setFormData({ ...formData, estimatedPerDiem: parseFloat(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-[#df2531] font-mono font-bold focus:outline-none focus:border-[#df2531]"
                  />
                </div>
                <div>
                  <label className="font-medium text-neutral-400">Years of Experience</label>
                  <input
                    type="number"
                    value={formData.workExperienceYears}
                    onChange={(e) => setFormData({ ...formData, workExperienceYears: parseInt(e.target.value, 10) || 0 })}
                    className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-white font-mono focus:outline-none focus:border-[#df2531]"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-neutral-400">Machinery Handled (comma-separated)</label>
                <input
                  type="text"
                  value={formData.machineryHandledText}
                  onChange={(e) => setFormData({ ...formData, machineryHandledText: e.target.value })}
                  className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-white focus:outline-none focus:border-[#df2531]"
                />
              </div>

              <div>
                <label className="font-medium text-neutral-400">Experience Details & Key Projects</label>
                <textarea
                  rows={2}
                  value={formData.experienceDetails}
                  onChange={(e) => setFormData({ ...formData, experienceDetails: e.target.value })}
                  placeholder="Details of previous rail, high-rise, or highway projects..."
                  className="mt-1 w-full rounded-lg bg-black border border-neutral-800 px-3 py-2 text-white focus:outline-none focus:border-[#df2531]"
                />
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
                  {submitting ? "Registering..." : "Confirm & Register Operator"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
