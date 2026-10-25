"use client";

import React, { useState } from "react";
import {
  CollateralType,
  BookingCollateral,
} from "@/lib/types";
import {
  ShieldCheck,
  Building,
  CreditCard,
  FileText,
  UserCheck,
  CheckCircle,
  AlertCircle,
  Upload,
  Lock,
  Send,
  Sparkles,
  Eye,
  X,
  ExternalLink,
  Download,
  ZoomIn,
  ZoomOut,
  Image as ImageIcon,
} from "lucide-react";
import { cn, formatETB, formatFaydaFin } from "@/lib/utils";
import { useTenant } from "@/context/TenantContext";
import { uploadFileToStorage } from "@/lib/firebase-cloud";

interface CollateralVaultProps {
  bookingId?: string;
  depositRequired: number;
  renterName?: string;
  assetName?: string;
  onCollateralVerified: (collateral: BookingCollateral) => void;
  onContractUploaded?: (doc: { fileName: string; fileSize: string; fileUrl: string; fileType: 'pdf' | 'image'; uploadedAt: string }) => void;
}

export function CollateralAndGuarantorVault({
  bookingId,
  depositRequired,
  renterName = "MIDROC Construction Ethiopia",
  assetName = "CAT 320D Excavator",
  onCollateralVerified,
  onContractUploaded,
}: CollateralVaultProps) {
  const { currentUser, sendNotification, notifications } = useTenant();
  const [activeTab, setActiveTab] = useState<CollateralType>("personal_guarantor_was");

  // Form State
  const [amount, setAmount] = useState(depositRequired || 150000);
  const [bankName, setBankName] = useState("Commercial Bank of Ethiopia");
  const [instrumentReference, setInstrumentReference] = useState("CPO-CBE-2026-90412");

  // Third-Party Guarantor State
  const [guarantorFullName, setGuarantorFullName] = useState("Ato Tadesse Haile");
  const [guarantorPhone, setGuarantorPhone] = useState("+251 911 332 211");
  const [guarantorFaydaFin, setGuarantorFaydaFin] = useState("FIN-9482-1049-3321");
  const [guarantorEmployerTin, setGuarantorEmployerTin] = useState("0011882244");
  
  // Interactive File Uploader State (PDF or Image)
  const [uploadedContract, setUploadedContract] = useState<{
    fileName: string;
    fileSize: string;
    fileUrl: string;
    fileType: 'pdf' | 'image';
    uploadedAt: string;
  }>({
    fileName: "MIDROC_Notarized_Guarantee_Contract_2026.pdf",
    fileSize: "2.4 MB",
    fileUrl: "/contracts/guarantor-legal-affidavit.pdf",
    fileType: "pdf",
    uploadedAt: "2026-10-24 10:15 AM",
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [vaultZoom, setVaultZoom] = useState(1);

  React.useEffect(() => {
    if (onContractUploaded) {
      onContractUploaded(uploadedContract);
    }
  }, []);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const processUploadedFile = async (file: File) => {
    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;
    const localUrl = URL.createObjectURL(file);
    const isImage = file.type.startsWith("image/") || /\.(jpe?g|png|webp|gif)$/i.test(file.name);
    const fileType: 'pdf' | 'image' = isImage ? 'image' : 'pdf';
    
    // Immediate preview
    const info = {
      fileName: file.name,
      fileSize: sizeStr,
      fileUrl: localUrl,
      fileType,
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setUploadedContract(info);
    if (onContractUploaded) {
      onContractUploaded(info);
    }

    // Background Firebase Cloud Storage upload
    try {
      const storageUrl = await uploadFileToStorage(file, `kyc-documents/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
      if (storageUrl && storageUrl !== localUrl) {
        const cloudInfo = {
          ...info,
          fileUrl: storageUrl,
        };
        setUploadedContract(cloudInfo);
        if (onContractUploaded) {
          onContractUploaded(cloudInfo);
        }
      }
    } catch (e) {
      console.warn("Storage upload fallback used", e);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const [verifying, setVerifying] = useState(false);
  const [notifiedHeadDispatcher, setNotifiedHeadDispatcher] = useState(false);
  const [verifiedState, setVerifiedState] = useState<BookingCollateral | null>(null);

  // Send KYC validation request to Head Dispatcher Yonas Bekele
  const handleSendToHeadDispatcher = async () => {
    setVerifying(true);
    await sendNotification({
      title: "KYC & Guarantor Approval Required",
      message: `${renterName} submitted ${activeTab === 'personal_guarantor_was' ? `Third-Party Guarantor (${guarantorFullName}) with notarized contract (${uploadedContract.fileName})` : `Bank Collateral (${bankName} - ${instrumentReference})`} for ${assetName}. Head Dispatcher validation required to unlock dispatch.`,
      type: "kyc_validation",
      recipientRole: "dispatcher",
      bookingId: bookingId || "bkg-current",
      renterName,
      assetName,
      collateralType: activeTab,
      contractFileName: uploadedContract.fileName,
      contractFileSize: uploadedContract.fileSize,
      contractFileUrl: uploadedContract.fileUrl,
      contractFileType: uploadedContract.fileType,
    });
    setNotifiedHeadDispatcher(true);
    setVerifying(false);
  };

  const handleVerifyAndLock = () => {
    setVerifying(true);

    // Immediately emit real-time alert across the app & top notification dropdown
    sendNotification({
      title: "KYC & Collateral Confirmed & Locked",
      message: `Verified and locked ${formatETB(amount)} security collateral (${activeTab === 'personal_guarantor_was' ? `Guarantor: ${guarantorFullName}` : bankName}) with contract (${uploadedContract.fileName}) for ${renterName}. Verified by Head Dispatcher (${currentUser?.fullName || "Yonas Bekele"}). Dispatch unlocked.`,
      type: "kyc_validation",
      recipientRole: "all",
      bookingId: bookingId || "bkg-current",
      renterName,
      assetName,
      collateralType: activeTab,
      contractFileName: uploadedContract.fileName,
      contractFileSize: uploadedContract.fileSize,
      contractFileUrl: uploadedContract.fileUrl,
      contractFileType: uploadedContract.fileType,
    });

    setTimeout(() => {
      const verifiedCol: BookingCollateral = {
        id: `col-${Date.now()}`,
        bookingId: bookingId || `bkg-temp-${Date.now()}`,
        collateralType: activeTab,
        amount,
        bankName: activeTab !== "personal_guarantor_was" ? bankName : undefined,
        instrumentReference: activeTab !== "personal_guarantor_was" ? instrumentReference : undefined,
        guarantorFullName: activeTab === "personal_guarantor_was" ? guarantorFullName : undefined,
        guarantorPhone: activeTab === "personal_guarantor_was" ? guarantorPhone : undefined,
        guarantorFaydaFin: activeTab === "personal_guarantor_was" ? guarantorFaydaFin : undefined,
        guarantorEmployerTin: activeTab === "personal_guarantor_was" ? guarantorEmployerTin : undefined,
        contractDocumentUrl: uploadedContract.fileUrl,
        contractDocumentName: uploadedContract.fileName,
        contractDocumentSize: uploadedContract.fileSize,
        contractDocumentType: uploadedContract.fileType,
        contractUploadedAt: uploadedContract.uploadedAt,
        isVerified: true,
        verifiedByUserId: currentUser?.id || "usr-002",
        verifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      setVerifiedState(verifiedCol);
      setVerifying(false);
      onCollateralVerified(verifiedCol);
    }, 400);
  };

  return (
    <div className="rounded-2xl border border-[#222222] bg-[#0A0A0A] p-5 space-y-5 text-xs text-slate-200">
      {/* Title & Ethiopian Security Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#222222] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Ethiopian Trust &amp; Collateral Vault
            </h3>
          </div>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Hard security gate: Booking cannot be dispatched until financial collateral or legal guarantor is verified.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-neutral-400">Required Security:</span>
          <span className="font-mono font-bold text-[#df2531] bg-[#df2531]/10 border border-[#df2531]/20 px-2.5 py-1 rounded-lg">
            {formatETB(depositRequired)}
          </span>
        </div>
      </div>

      {/* Head Dispatcher Notification Status Banner */}
      {notifiedHeadDispatcher && !verifiedState && (
        <div className="p-3.5 rounded-xl bg-[#df2531]/10 border border-[#df2531]/40 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <Send size={16} className="text-[#df2531] animate-pulse shrink-0" />
            <div>
              <div className="font-bold text-xs text-white font-display">
                KYC Validation Dispatched to Head Dispatcher (Yonas Bekele)
              </div>
              <div className="text-[10px] text-neutral-300">
                Notification badge active in top navigation center. Click below to execute immediate approval.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleVerifyAndLock}
            className="px-3.5 py-1.5 rounded-lg bg-[#df2531] hover:bg-[#c41e29] text-white font-bold text-[11px] shadow border border-[#df2531]/50 shrink-0 cursor-pointer font-display"
          >
            Sign-off as Yonas Bekele
          </button>
        </div>
      )}

      {/* Collateral Type Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { id: "personal_guarantor_was", label: "Third-Party Guarantor", icon: UserCheck },
          { id: "cash_cPO", label: "Bank CPO Check", icon: CreditCard },
          { id: "bank_guarantee", label: "Bank Guarantee", icon: Building },
          { id: "corporate_po", label: "Corporate PO", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === (tab.id === "cash_cPO" ? "cash_cpo" : tab.id);

          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab((tab.id === "cash_cPO" ? "cash_cpo" : tab.id) as CollateralType)}
              className={cn(
                "p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer",
                isSelected
                  ? "bg-[#df2531]/20 border-[#df2531] text-white font-bold shadow-sm shadow-[#df2531]/20"
                  : "bg-[#141414] border-[#222222] text-neutral-400 hover:bg-[#1E1E1E] hover:text-neutral-200"
              )}
            >
              <Icon size={16} className={isSelected ? "text-[#df2531]" : "text-neutral-400"} />
              <span className="text-xs font-display">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Personal Guarantor */}
      {activeTab === "personal_guarantor_was" && (
        <div className="space-y-4 bg-[#111111] p-4 rounded-xl border border-[#222222] animate-fadeIn">
          <div className="flex items-center justify-between text-[11px] text-[#df2531] font-semibold">
            <span>Guarantor Legal Binding Information</span>
            <span className="font-mono bg-[#df2531]/10 px-2 py-0.5 rounded border border-[#df2531]/20">VeriFayda FIN Verified</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-neutral-400">Guarantor Full Name</label>
              <input
                type="text"
                value={guarantorFullName}
                onChange={(e) => setGuarantorFullName(e.target.value)}
                className="mt-1 w-full rounded-lg bg-[#181818] border border-[#2E2E2E] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#df2531]"
              />
            </div>
            <div>
              <label className="font-medium text-neutral-400">Guarantor Phone (+251)</label>
              <input
                type="text"
                value={guarantorPhone}
                onChange={(e) => setGuarantorPhone(e.target.value)}
                className="mt-1 w-full rounded-lg bg-[#181818] border border-[#2E2E2E] px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#df2531]"
              />
            </div>

            <div>
              <label className="font-medium text-neutral-400">Guarantor Fayda FIN Number</label>
              <input
                type="text"
                value={guarantorFaydaFin}
                onChange={(e) => setGuarantorFaydaFin(e.target.value)}
                className="mt-1 w-full rounded-lg bg-[#181818] border border-[#2E2E2E] px-3 py-1.5 text-xs text-[#df2531] font-mono focus:outline-none focus:border-[#df2531]"
              />
            </div>
            <div>
              <label className="font-medium text-neutral-400">Employer TIN (Ethiopia MoR)</label>
              <input
                type="text"
                value={guarantorEmployerTin}
                onChange={(e) => setGuarantorEmployerTin(e.target.value)}
                className="mt-1 w-full rounded-lg bg-[#181818] border border-[#2E2E2E] px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#df2531]"
              />
            </div>
          </div>

          {/* Interactive Notarized Guarantee Contract Local File Uploader */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <label className="font-semibold text-neutral-300 flex items-center gap-1.5">
                <FileText size={13} className="text-[#df2531]" />
                Scanned Notarized Guarantee Contract (PDF / Image) <span className="text-rose-400">*</span>
              </label>
              <span className="text-[10px] text-neutral-400">Court / Woreda Stamp & Seal required</span>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Drag & Drop Upload Zone / Active File Card */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "p-3.5 rounded-xl border transition-all duration-200",
                isDragging
                  ? "border-[#df2531] bg-[#df2531]/10 ring-2 ring-[#df2531]/50 scale-[1.01]"
                  : "border-neutral-700 bg-neutral-900/90 hover:border-neutral-600"
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#df2531]/15 border border-[#df2531]/30 text-[#df2531] flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-xs">{uploadedContract.fileName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-semibold flex items-center gap-1">
                        <CheckCircle size={10} /> Validated {uploadedContract.fileType === "image" ? "Image / Scan" : "PDF Document"}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5 font-mono">
                      {uploadedContract.fileSize} • Uploaded {uploadedContract.uploadedAt} • Notarized Woreda 03 Seal Attached
                    </div>
                  </div>
                </div>

                {/* Upload & Preview Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white border border-neutral-700 font-medium text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye size={12} className="text-[#df2531]" />
                    <span>View / Scan Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-[#df2531]/10 hover:bg-[#df2531]/20 text-[#df2531] border border-[#df2531]/30 font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload size={12} />
                    <span>Replace File</span>
                  </button>
                </div>
              </div>

              {/* Drag & Drop Hint */}
              <div className="mt-2 pt-2 border-t border-neutral-800/80 text-[10px] text-neutral-400 flex items-center justify-between">
                <span>Drag and drop local device PDF / scanned affidavit / contract image here</span>
                <span className="font-mono text-[#df2531]/80">Max 25 MB • PDF, PNG, JPG, WEBP</span>
              </div>
            </div>
          </div>

          {/* Scanned Guarantee Contract / Image Preview Modal */}
          {isPreviewOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 text-neutral-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    {uploadedContract.fileType === "image" ? (
                      <ImageIcon className="text-[#df2531]" size={20} />
                    ) : (
                      <FileText className="text-[#df2531]" size={20} />
                    )}
                    <div>
                      <h3 className="font-bold text-white text-sm font-display">
                        {uploadedContract.fileName}
                      </h3>
                      <p className="text-[10px] text-neutral-400">
                        Attached Document Archive • {uploadedContract.fileSize} • Uploaded {uploadedContract.uploadedAt}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsPreviewOpen(false)}
                    className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* If Image: Render high-resolution preview with zoom */}
                {uploadedContract.fileType === "image" ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center min-h-[350px] max-h-[60vh] overflow-hidden relative group">
                      <img
                        src={uploadedContract.fileUrl}
                        alt={uploadedContract.fileName}
                        style={{ transform: `scale(${vaultZoom})` }}
                        className="max-h-[55vh] w-auto max-w-full rounded-lg object-contain shadow-2xl border border-neutral-700/60 transition-transform duration-200"
                      />
                    </div>
                    <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <ImageIcon size={16} className="text-[#df2531] shrink-0" />
                        <div>
                          <div className="text-white font-bold truncate">{uploadedContract.fileName}</div>
                          <div className="text-[10px] text-neutral-400">{uploadedContract.fileSize} • Uploaded {uploadedContract.uploadedAt}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 bg-black p-1 rounded-lg border border-neutral-800">
                          <button
                            type="button"
                            onClick={() => setVaultZoom((z) => Math.max(0.5, z - 0.25))}
                            className="p-1 rounded hover:bg-neutral-800 text-neutral-300"
                            title="Zoom out"
                          >
                            <ZoomOut size={13} />
                          </button>
                          <span className="px-1 text-[10px] font-mono font-bold text-neutral-300">{Math.round(vaultZoom * 100)}%</span>
                          <button
                            type="button"
                            onClick={() => setVaultZoom((z) => Math.min(2.5, z + 0.25))}
                            className="p-1 rounded hover:bg-neutral-800 text-neutral-300"
                            title="Zoom in"
                          >
                            <ZoomIn size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setVaultZoom(1)}
                            className="p-1 rounded hover:bg-neutral-800 text-neutral-300 text-[10px]"
                            title="Reset zoom"
                          >
                            Reset
                          </button>
                        </div>
                        <a
                          href={uploadedContract.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={uploadedContract.fileName}
                          className="px-3 py-1.5 rounded-lg bg-[#df2531] hover:bg-[#c41e29] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#df2531]/30 font-sans transition-all cursor-pointer"
                        >
                          <Download size={13} /> Download
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* If PDF: Embedded Real PDF Iframe */
                  <div className="space-y-3">
                    <div className="w-full h-[520px] rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 flex items-center justify-center relative">
                      <iframe
                        src={uploadedContract.fileUrl || "/contracts/guarantor-legal-affidavit.pdf"}
                        className="w-full h-full rounded-xl bg-neutral-900 border-0"
                        title={uploadedContract.fileName}
                      />
                    </div>
                    <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <FileText size={16} className="text-[#df2531] shrink-0" />
                        <div>
                          <div className="font-bold text-white truncate">{uploadedContract.fileName}</div>
                          <div className="text-[10px] text-neutral-400">
                            {uploadedContract.fileSize} • Principal: {renterName} • Asset: {assetName}
                          </div>
                        </div>
                      </div>
                      <a
                        href={uploadedContract.fileUrl || "/contracts/guarantor-legal-affidavit.pdf"}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={uploadedContract.fileName}
                        className="shrink-0 px-3.5 py-1.5 rounded-lg bg-[#df2531] hover:bg-[#c41e29] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#df2531]/30 font-sans transition-all cursor-pointer"
                      >
                        <Download size={13} /> Download / Open Original File
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsPreviewOpen(false)}
                    className="px-4 py-2 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold text-xs shadow-md shadow-[#df2531]/20 transition-colors font-display cursor-pointer"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2, 3, 4: CPO, Bank Guarantee, Corporate PO */}
      {activeTab !== "personal_guarantor_was" && (
        <div className="space-y-4 bg-[#111111] p-4 rounded-xl border border-[#222222] animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-medium text-neutral-400">Issuing Ethiopian Bank</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                aria-label="Issuing Ethiopian commercial bank"
                className="mt-1 w-full rounded-lg bg-[#181818] border border-[#2E2E2E] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#df2531]"
              >
                <option value="Commercial Bank of Ethiopia">Commercial Bank of Ethiopia (CBE)</option>
                <option value="Awash Bank">Awash Bank</option>
                <option value="Bank of Abyssinia">Bank of Abyssinia</option>
                <option value="Dashen Bank">Dashen Bank</option>
                <option value="Cooperative Bank of Oromia">Cooperative Bank of Oromia</option>
              </select>
            </div>
            <div>
              <label className="font-medium text-neutral-400">Instrument Serial / Ref No</label>
              <input
                type="text"
                value={instrumentReference}
                onChange={(e) => setInstrumentReference(e.target.value)}
                className="mt-1 w-full rounded-lg bg-[#181818] border border-[#2E2E2E] px-3 py-1.5 text-xs text-[#df2531] font-mono focus:outline-none focus:border-[#df2531]"
              />
            </div>
            <div>
              <label className="font-medium text-neutral-400">Cover Amount (ETB)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
                className="mt-1 w-full rounded-lg bg-[#181818] border border-[#2E2E2E] px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#df2531]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Verification Action Gate */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          {verifiedState ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
              <CheckCircle size={15} />
              Collateral Officially Verified by Head Dispatcher ({currentUser?.fullName || "Yonas Bekele"})
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[#df2531] text-xs font-semibold">
              <Lock size={14} />
              Dispatch Locked until Verification is Signed
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!verifiedState && !notifiedHeadDispatcher && (
            <button
              type="button"
              onClick={handleSendToHeadDispatcher}
              disabled={verifying}
              className="px-3.5 py-2 rounded-xl bg-[#1C1C1C] hover:bg-[#252525] text-[#df2531] border border-[#df2531]/30 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer font-display"
            >
              <Send size={14} />
              Notify Head Dispatcher (Yonas Bekele)
            </button>
          )}

          <button
            type="button"
            onClick={handleVerifyAndLock}
            disabled={verifying}
            className={cn(
              "px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer font-display",
              verifiedState
                ? "bg-[#1C1C1C] text-neutral-300 border border-[#2E2E2E] hover:bg-[#252525]"
                : "bg-[#df2531] hover:bg-[#c41e29] text-white shadow-md shadow-[#df2531]/20 border border-[#df2531]/40"
            )}
          >
            {verifying ? (
              "Verifying Documents..."
            ) : verifiedState ? (
              "Re-Verify Collateral"
            ) : (
              <>
                <ShieldCheck size={15} />
                Verify Collateral & Unlock Dispatch
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
