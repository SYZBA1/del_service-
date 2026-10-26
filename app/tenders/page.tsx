"use client";

import React, { useState, useEffect } from "react";
import {
  FileSignature,
  Building2,
  Calendar,
  Clock,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Search,
  Truck,
  Car,
  HardHat,
  Filter,
  DollarSign,
  ChevronRight,
  Bot,
  Volume2,
  VolumeX,
  X,
  Check,
  Languages,
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { cn, formatETB } from "@/lib/utils";
import { TenderItem, TenderChecklistItem } from "@/lib/types";

export default function TendersPage() {
  const { currentUser, openDelsBot } = useTenant();
  const role = currentUser?.role || "head_dispatcher";

  const [tenders, setTenders] = useState<TenderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingLive, setFetchingLive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivisionTab, setSelectedDivisionTab] = useState<"all" | "elshaday" | "liora">("all");
  const [selectedSourceTab, setSelectedSourceTab] = useState<"all" | "merkato" | "egp">("all");

  // Active Tender Detail & Checklist Modal
  const [activeChecklistTender, setActiveChecklistTender] = useState<TenderItem | null>(null);

  // Post-Purchase Document Upload Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTenderTargetId, setUploadTenderTargetId] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [ragUploadSuccess, setRagUploadSuccess] = useState<string | null>(null);

  // Morning Briefing Audio
  const [isSpeakingBriefing, setIsSpeakingBriefing] = useState(false);

  // Load Tenders
  const loadTenders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/tenders");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTenders(json.data);
      }
    } catch (e) {
      console.error("Failed to load tenders", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenders();
  }, []);

  // Fetch Live Tenders from 2merkato.com and EGP
  const handleFetchLiveTenders = async () => {
    try {
      setFetchingLive(true);
      const res = await fetch("/api/v1/tenders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "fetch_live" }),
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTenders(json.data);
      }
    } catch (e) {
      console.error("Live scraper failed", e);
    } finally {
      setFetchingLive(false);
    }
  };

  // Toggle Checklist Task Status
  const handleToggleChecklistTask = async (tenderId: string, checklistId: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    try {
      setTenders((prev) =>
        prev.map((t) => {
          if (t.id !== tenderId) return t;
          return {
            ...t,
            checklist: t.checklist.map((c) => (c.id === checklistId ? { ...c, status: newStatus } : c)),
          };
        })
      );

      if (activeChecklistTender && activeChecklistTender.id === tenderId) {
        setActiveChecklistTender((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            checklist: prev.checklist.map((c) => (c.id === checklistId ? { ...c, status: newStatus } : c)),
          };
        });
      }

      await fetch("/api/v1/tenders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_checklist",
          tenderId,
          checklistId,
          status: newStatus,
        }),
      });
    } catch (e) {
      console.error("Failed to toggle checklist", e);
    }
  };

  // Handle Post-Purchase Document Upload & RAG Extraction
  const handleUploadRfpDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFileName) return;

    setUploadingDoc(true);
    setRagUploadSuccess(null);

    try {
      const res = await fetch("/api/v1/tenders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze_doc",
          fileName: uploadedFileName,
          fileSize: "4.2 MB",
          fileType: "pdf",
          tenderId: uploadTenderTargetId,
          targetDivision: role === "elshaday_admin" ? "elshaday" : role === "liora_admin" ? "liora" : "both",
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setRagUploadSuccess(
          `RAG Extraction Complete: Ingested '${uploadedFileName}'. Extracted ETB ${json.data.detectedCPOAmount.toLocaleString()} CPO requirement and ${json.data.checklist.length} compliance checklist tasks.`
        );
        loadTenders();
      }
    } catch (err: any) {
      console.error("RAG upload failed", err);
    } finally {
      setUploadingDoc(false);
    }
  };

  // Play Morning Briefing Audio
  const handlePlayBriefing = () => {
    if (typeof window === "undefined" || !('speechSynthesis' in window)) return;

    if (isSpeakingBriefing) {
      window.speechSynthesis.cancel();
      setIsSpeakingBriefing(false);
      return;
    }

    const briefingText =
      "Good morning DEL Services team. Here is your automated tender intelligence briefing from 2merkato.com and the Ethiopian Government EGP portal. All expired opportunities have been filtered out. For Liora Heavy Machinery, the Ethiopian Roads Administration expressway tender is our top 96 percent match. For Elshaday Car Rental, Ethio Telecom's 4WD tower maintenance fleet is our top 94 percent match. All required machinery and vehicles are available in our yards.";

    const utterance = new SpeechSynthesisUtterance(briefingText);
    utterance.rate = 1.0;
    utterance.onstart = () => setIsSpeakingBriefing(true);
    utterance.onend = () => setIsSpeakingBriefing(false);
    utterance.onerror = () => setIsSpeakingBriefing(false);
    window.speechSynthesis.speak(utterance);
  };

  // ----------------------------------------------------
  // AUTOMATIC EXPIRED TENDER FILTERING
  // ----------------------------------------------------
  const now = new Date();
  const activeUnexpiredTenders = tenders.filter((t) => {
    if (!t.closingDate) return true;
    const closingDate = new Date(t.closingDate);
    // Allow through end of closing day (+24h)
    return closingDate.getTime() + 86400000 >= now.getTime();
  });

  const getDaysRemaining = (closingDateStr: string) => {
    const closing = new Date(closingDateStr);
    const diffMs = closing.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Closing Today";
    if (diffDays === 1) return "1 Day Left";
    return `${diffDays} Days Left`;
  };

  // Filter Tenders by Tab and Search
  const filteredTenders = activeUnexpiredTenders.filter((t) => {
    if (selectedDivisionTab === "elshaday" && t.targetDivision !== "elshaday" && t.targetDivision !== "both") {
      return false;
    }
    if (selectedDivisionTab === "liora" && t.targetDivision !== "liora" && t.targetDivision !== "both") {
      return false;
    }
    if (selectedSourceTab !== "all" && t.source !== selectedSourceTab) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.titleAmharic.toLowerCase().includes(q) ||
        t.refNumber.toLowerCase().includes(q) ||
        t.issuingOrganization.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Aggregate Metrics based on active unexpired opportunities
  const totalBudgetETB = activeUnexpiredTenders.reduce((acc, t) => acc + t.estimatedBudgetETB, 0);
  const totalCpoETB = activeUnexpiredTenders.reduce((acc, t) => acc + t.cpoAmountETB, 0);
  const elshadayCount = activeUnexpiredTenders.filter((t) => t.targetDivision === "elshaday" || t.targetDivision === "both").length;
  const lioraCount = activeUnexpiredTenders.filter((t) => t.targetDivision === "liora" || t.targetDivision === "both").length;

  return (
    <div className="space-y-5 pb-16 font-sans">
      {/* ---------------------------------------------------- */}
      {/* HEADER: Clean Minimalist Title & Icon-Only Controls  */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-lg sm:text-xl text-white tracking-wide">
              Tender Intelligence &amp; Procurement
            </h1>
          </div>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Real-time opportunities from <strong className="text-neutral-200">2merkato.com</strong> &amp; <strong className="text-neutral-200">Ethiopian EGP (egp.ppa.gov.et)</strong> • Active RFPs Only
          </p>
        </div>

        {/* Compact Icon-Only Action Buttons (32px × 32px) with Hover Tooltips (Per Requirement 4) */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {/* Ask Del's Bot AI (32px × 32px) */}
          <button
            onClick={() =>
              openDelsBot("Provide an overview of all active open tenders from 2merkato and EGP.")
            }
            className="h-8 w-8 rounded-xl border border-neutral-800 hover:border-[#df2531] bg-neutral-900/90 hover:bg-[#df2531]/15 text-neutral-300 hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-sm"
            title="Ask Del's Bot AI (Voice & Intelligence)"
            aria-label="Ask Del's Bot AI"
          >
            <Bot size={15} className="text-[#df2531]" />
          </button>

          {/* Listen to Daily Morning Briefing (32px × 32px) */}
          <button
            onClick={handlePlayBriefing}
            className={cn(
              "h-8 w-8 rounded-xl border transition-all flex items-center justify-center cursor-pointer shadow-sm",
              isSpeakingBriefing
                ? "bg-emerald-950/80 border-emerald-500 text-emerald-300 animate-pulse"
                : "border-neutral-800 hover:border-neutral-600 bg-neutral-900/90 text-neutral-300 hover:text-white"
            )}
            title={isSpeakingBriefing ? "Stop Briefing Audio" : "Listen to Morning Tender Briefing"}
            aria-label="Listen to Briefing"
          >
            {isSpeakingBriefing ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>

          {/* Upload Purchased RFP Document (32px × 32px) */}
          <button
            onClick={() => {
              setUploadTenderTargetId(null);
              setUploadedFileName("ERA_Highway_RFP_Contract_Specification_2026.pdf");
              setIsUploadModalOpen(true);
            }}
            className="h-8 w-8 rounded-xl border border-neutral-800 hover:border-neutral-600 bg-neutral-900/90 text-neutral-300 hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-sm"
            title="Upload Purchased RFP Document (Post-Purchase RAG Reader)"
            aria-label="Upload RFP Document"
          >
            <Upload size={14} />
          </button>

          {/* Refresh / Fetch Latest (32px × 32px) */}
          <button
            onClick={handleFetchLiveTenders}
            disabled={fetchingLive}
            className="h-8 w-8 rounded-xl border border-neutral-800 hover:border-[#df2531] bg-neutral-900/90 hover:bg-[#df2531]/20 text-neutral-300 hover:text-white transition-all flex items-center justify-center disabled:opacity-40 cursor-pointer shadow-sm"
            title="Fetch Latest Tenders from 2merkato.com & EGP"
            aria-label="Fetch Latest Tenders"
          >
            <RefreshCw size={13} className={cn(fetchingLive && "animate-spin text-[#df2531]")} />
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MINIMALIST METRICS BAR (Uncluttered Streamlined View) */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/60">
          <span className="text-[10px] text-neutral-400 uppercase font-mono block">Active Open Tenders</span>
          <div className="text-xl font-bold text-white font-mono mt-0.5">{activeUnexpiredTenders.length}</div>
          <span className="text-[10px] text-neutral-500 font-mono">Expired auto-filtered</span>
        </div>

        <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/60">
          <span className="text-[10px] text-neutral-400 uppercase font-mono block">Elshaday Car Fleet</span>
          <div className="text-xl font-bold text-white font-mono mt-0.5">{elshadayCount}</div>
          <span className="text-[10px] text-neutral-500 font-mono">Top: 94% Match Fit</span>
        </div>

        <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/60">
          <span className="text-[10px] text-neutral-400 uppercase font-mono block">Liora Heavy Machinery</span>
          <div className="text-xl font-bold text-white font-mono mt-0.5">{lioraCount}</div>
          <span className="text-[10px] text-neutral-500 font-mono">Top: 96% Match Fit</span>
        </div>

        <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/60">
          <span className="text-[10px] text-neutral-400 uppercase font-mono block">Pipeline Contract Value</span>
          <div className="text-xl font-bold text-white font-mono mt-0.5 truncate">
            ETB {(totalBudgetETB / 1000000).toFixed(1)}M
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">CPO: ETB {(totalCpoETB / 1000).toFixed(0)}k</span>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* STREAMLINED FILTER & SEARCH TABS                     */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Division Filter */}
          <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800/80 text-xs">
            <button
              onClick={() => setSelectedDivisionTab("all")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer",
                selectedDivisionTab === "all" ? "bg-neutral-800 text-white font-bold" : "text-neutral-400 hover:text-white"
              )}
            >
              All ({activeUnexpiredTenders.length})
            </button>
            <button
              onClick={() => setSelectedDivisionTab("elshaday")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer",
                selectedDivisionTab === "elshaday" ? "bg-neutral-800 text-white font-bold" : "text-neutral-400 hover:text-white"
              )}
            >
              Elshaday ({elshadayCount})
            </button>
            <button
              onClick={() => setSelectedDivisionTab("liora")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer",
                selectedDivisionTab === "liora" ? "bg-neutral-800 text-white font-bold" : "text-neutral-400 hover:text-white"
              )}
            >
              Liora ({lioraCount})
            </button>
          </div>

          {/* Source Filter */}
          <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800/80 text-xs">
            <button
              onClick={() => setSelectedSourceTab("all")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer",
                selectedSourceTab === "all" ? "bg-neutral-800 text-white font-bold" : "text-neutral-400 hover:text-white"
              )}
            >
              All Sources
            </button>
            <button
              onClick={() => setSelectedSourceTab("merkato")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer",
                selectedSourceTab === "merkato" ? "bg-neutral-800 text-white font-bold" : "text-neutral-400 hover:text-white"
              )}
            >
              2merkato
            </button>
            <button
              onClick={() => setSelectedSourceTab("egp")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer",
                selectedSourceTab === "egp" ? "bg-neutral-800 text-white font-bold" : "text-neutral-400 hover:text-white"
              )}
            >
              EGP
            </button>
          </div>
        </div>

        {/* Minimal Search Input */}
        <div className="relative min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tenders..."
            className="w-full pl-8 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 focus:border-[#df2531] rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MINIMALIST TENDER CARDS LIST                         */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredTenders.map((tender) => {
          const daysLeftStr = getDaysRemaining(tender.closingDate);

          return (
            <div
              key={tender.id}
              className="rounded-2xl bg-neutral-950/90 border border-neutral-800/70 hover:border-neutral-700 p-4 space-y-3 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                {/* Top Row: Source, Ref, Match % */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300 font-semibold">
                      {tender.source === "merkato" ? "2merkato.com" : "EGP Portal"}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">
                      Ref: {tender.refNumber}
                    </span>
                  </div>

                  <span
                    className={cn(
                      "text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border",
                      tender.matchScore >= 90
                        ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                        : "bg-amber-950/40 border-amber-500/40 text-amber-300"
                    )}
                  >
                    {tender.matchScore}% Match
                  </span>
                </div>

                {/* Tender Titles */}
                <div>
                  <h3 className="font-display font-semibold text-sm text-white leading-snug">
                    {tender.title}
                  </h3>
                  <p className="text-[11px] text-neutral-400 font-sans mt-0.5 line-clamp-1">
                    {tender.titleAmharic}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
                    <Building2 size={12} className="text-neutral-500 shrink-0" />
                    <span>{tender.issuingOrganization}</span>
                    <span>•</span>
                    <span>{tender.location}</span>
                  </p>
                </div>

                {/* Required Fleet Mini Pills */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-neutral-500 block">Fleet Required</span>
                  <div className="flex flex-wrap gap-1.5">
                    {tender.requiredFleet.map((rf, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-neutral-900 border border-neutral-800/80 text-neutral-300 flex items-center gap-1"
                      >
                        {rf.category === "heavy_machinery" ? <Truck size={10} /> : <Car size={10} />}
                        <span>{rf.quantity}x {rf.description.split("(")[0]}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Commercials: Value & CPO */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-900 text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-neutral-500 block uppercase">Est. Value</span>
                    <span className="text-xs font-bold text-neutral-200">
                      ETB {formatETB(tender.estimatedBudgetETB)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-neutral-500 block uppercase">CPO Guarantee</span>
                    <span className="text-xs font-bold text-[#df2531]">
                      ETB {formatETB(tender.cpoAmountETB)}
                    </span>
                  </div>
                </div>

                {/* Deadline */}
                <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-0.5 font-mono">
                  <span>Closing: {tender.closingDate}</span>
                  <span className="text-amber-400/90 font-semibold">{daysLeftStr}</span>
                </div>
              </div>

              {/* Minimalist Action Toolbar */}
              <div className="flex items-center gap-2 pt-3 border-t border-neutral-900">
                <button
                  onClick={() =>
                    openDelsBot(
                      `Analyze tender ${tender.refNumber} (${tender.title}) against our fleet and explain how DEL Services can fulfill this bid.`
                    )
                  }
                  className="flex-1 px-2.5 py-1.5 rounded-xl border border-neutral-800 hover:border-[#df2531] bg-neutral-900/60 hover:bg-[#df2531]/10 text-neutral-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Bot size={13} className="text-[#df2531]" />
                  <span>Analyze with Bot</span>
                </button>

                <button
                  onClick={() => setActiveChecklistTender(tender)}
                  className="px-3 py-1.5 rounded-xl border border-neutral-800 hover:border-neutral-700 bg-neutral-900/60 text-neutral-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Checklist ({tender.checklist.filter((c) => c.status === "completed").length}/{tender.checklist.length})
                </button>

                <button
                  onClick={() => {
                    setUploadTenderTargetId(tender.id);
                    setUploadedFileName(`${tender.refNumber.replace(/[^a-zA-Z0-9]/g, "_")}_RFP_Document.pdf`);
                    setIsUploadModalOpen(true);
                  }}
                  className="p-2 rounded-xl border border-neutral-800 hover:border-[#df2531] bg-neutral-900/60 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  title="Upload Purchased RFP Document"
                >
                  <Upload size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTenders.length === 0 && (
        <div className="p-8 text-center rounded-2xl bg-neutral-950 border border-neutral-900 text-neutral-500 text-xs">
          No open tenders match the selected filters. All expired deadlines have been removed.
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* COMPLIANCE CHECKLIST MODAL                           */}
      {/* ---------------------------------------------------- */}
      {activeChecklistTender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl max-h-[85vh] flex flex-col rounded-3xl bg-[#09090b] border border-neutral-800 shadow-2xl p-5 text-white space-y-3 font-sans">
            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800">
              <div>
                <h3 className="font-display font-semibold text-sm text-white">
                  Compliance Checklist • {activeChecklistTender.refNumber}
                </h3>
                <p className="text-[11px] text-neutral-400 font-sans">
                  {activeChecklistTender.issuingOrganization}
                </p>
              </div>
              <button
                onClick={() => setActiveChecklistTender(null)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {activeChecklistTender.checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleChecklistTask(activeChecklistTender.id, item.id, item.status)}
                  className={cn(
                    "p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5",
                    item.status === "completed"
                      ? "bg-emerald-950/20 border-emerald-500/40 text-neutral-200"
                      : "bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-300"
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all",
                      item.status === "completed"
                        ? "bg-emerald-500 border-emerald-400 text-black"
                        : "border-neutral-600 bg-neutral-900"
                    )}
                  >
                    {item.status === "completed" && <Check size={11} />}
                  </div>

                  <div className="space-y-0.5 flex-1">
                    <p className={cn("text-xs font-medium text-white", item.status === "completed" && "line-through opacity-75")}>
                      {item.taskEn}
                    </p>
                    <p className="text-[11px] text-[#df2531] font-sans">
                      {item.taskAm}
                    </p>
                    <span className="text-[10px] text-neutral-500 font-mono block">
                      Due: {item.deadline}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-xs">
              <span className="text-neutral-400 text-[11px]">
                {activeChecklistTender.checklist.filter((c) => c.status === "completed").length} of {activeChecklistTender.checklist.length} Completed
              </span>
              <button
                onClick={() => setActiveChecklistTender(null)}
                className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* POST-PURCHASE DOCUMENT UPLOAD MODAL (RAG Ingestion)  */}
      {/* ---------------------------------------------------- */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-[#09090b] border border-neutral-800 shadow-2xl p-5 text-white space-y-3 font-sans">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div>
                <h3 className="font-display font-semibold text-sm text-white">
                  Post-Purchase Document Ingestion (RAG)
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Upload purchased RFP PDF for automated milestone extraction.
                </p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleUploadRfpDocument} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">RFP / TOR File Name</label>
                <input
                  type="text"
                  value={uploadedFileName}
                  onChange={(e) => setUploadedFileName(e.target.value)}
                  placeholder="e.g. ERA_Tender_RFP_Specification.pdf"
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-[#df2531] rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                />
              </div>

              <div className="border border-dashed border-neutral-800 rounded-xl p-5 text-center space-y-1 bg-neutral-950">
                <FileText size={18} className="mx-auto text-neutral-500" />
                <p className="text-xs text-neutral-300">Click or drag &amp; drop RFP file here</p>
                <p className="text-[10px] text-neutral-500">PDF or Scanned Document</p>
              </div>

              {ragUploadSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs">
                  ✓ {ragUploadSuccess}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-900 text-neutral-300 hover:text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingDoc || !uploadedFileName}
                  className="px-4 py-1.5 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white text-xs font-medium flex items-center gap-1.5 disabled:opacity-40"
                >
                  {uploadingDoc && <RefreshCw size={12} className="animate-spin" />}
                  <span>{uploadingDoc ? "Extracting..." : "Run RAG Extraction"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
