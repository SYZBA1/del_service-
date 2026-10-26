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
  Layers,
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
import { DelsBotModal } from "@/components/DelsBotModal";

export default function TendersPage() {
  const { currentUser } = useTenant();
  const role = currentUser?.role || "head_dispatcher";

  const [tenders, setTenders] = useState<TenderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingLive, setFetchingLive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivisionTab, setSelectedDivisionTab] = useState<"all" | "elshaday" | "liora">("all");
  const [selectedSourceTab, setSelectedSourceTab] = useState<"all" | "merkato" | "egp">("all");

  // Del's Bot Modal State
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [botInitialQuery, setBotInitialQuery] = useState<string | undefined>(undefined);

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
      // Optimistic update
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
          `RAG Analysis Complete: Ingested '${uploadedFileName}'. Extracted ETB ${json.data.detectedCPOAmount.toLocaleString()} CPO bond requirement and ${json.data.checklist.length} compliance checklist milestones.`
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
      "Good morning DEL Services team. Here is your automated tender intelligence briefing from 2merkato.com and the Ethiopian Government EGP portal. We have 6 active high-probability tenders with total contract pipeline value exceeding 82 million Birr. For Liora Heavy Machinery, the Ethiopian Roads Administration highway tender is our top 96 percent match, closing in 17 days. For Elshaday Car Rental, Ethio Telecom's 4WD tower maintenance fleet is our top 94 percent match, requiring 10 Hilux units. All required machinery and vehicles are in stock in our yards. Have a productive dispatch day.";

    const utterance = new SpeechSynthesisUtterance(briefingText);
    utterance.rate = 1.0;
    utterance.onstart = () => setIsSpeakingBriefing(true);
    utterance.onend = () => setIsSpeakingBriefing(false);
    utterance.onerror = () => setIsSpeakingBriefing(false);
    window.speechSynthesis.speak(utterance);
  };

  // Filter Tenders
  const filteredTenders = tenders.filter((t) => {
    // Division filter
    if (selectedDivisionTab === "elshaday" && t.targetDivision !== "elshaday" && t.targetDivision !== "both") {
      return false;
    }
    if (selectedDivisionTab === "liora" && t.targetDivision !== "liora" && t.targetDivision !== "both") {
      return false;
    }

    // Source filter
    if (selectedSourceTab !== "all" && t.source !== selectedSourceTab) {
      return false;
    }

    // Search query
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

  // Aggregate Metrics
  const totalBudgetETB = tenders.reduce((acc, t) => acc + t.estimatedBudgetETB, 0);
  const totalCpoETB = tenders.reduce((acc, t) => acc + t.cpoAmountETB, 0);
  const elshadayCount = tenders.filter((t) => t.targetDivision === "elshaday" || t.targetDivision === "both").length;
  const lioraCount = tenders.filter((t) => t.targetDivision === "liora" || t.targetDivision === "both").length;

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Page Title & Actions Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#df2531]/20 to-neutral-900 border border-[#df2531]/40 text-[#df2531]">
              <FileSignature size={22} />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl sm:text-2xl text-white tracking-wide flex items-center gap-2">
                Tender Intelligence &amp; Procurement Hub
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase font-bold">
                  Live Sync
                </span>
              </h1>
              <p className="text-xs text-neutral-400">
                Automated Scraping from <span className="text-white font-semibold">2merkato.com</span> &amp;{" "}
                <span className="text-white font-semibold">Ethiopian EGP (egp.ppa.gov.et)</span> • AI Fleet Match • RAG Compliance Reader
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Ask Del's Bot */}
          <button
            onClick={() => {
              setBotInitialQuery("Give me a comprehensive tender summary of all active Merkato and EGP opportunities");
              setIsBotOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-neutral-900 to-black hover:border-[#df2531] border border-[#df2531]/50 text-white text-xs font-bold transition-all shadow-md shadow-[#df2531]/15 group cursor-pointer"
          >
            <Bot size={15} className="text-[#df2531] group-hover:scale-110 transition-transform" />
            <span>Ask Del's Bot</span>
          </button>

          {/* Listen to Morning Briefing */}
          <button
            onClick={handlePlayBriefing}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-md",
              isSpeakingBriefing
                ? "bg-emerald-950/80 border-emerald-500 text-emerald-300 animate-pulse"
                : "bg-neutral-900 border-neutral-700 hover:border-neutral-500 text-neutral-200"
            )}
            title="Listen to Morning AI Briefing"
          >
            {isSpeakingBriefing ? <VolumeX size={15} /> : <Volume2 size={15} className="text-[#df2531]" />}
            <span>{isSpeakingBriefing ? "Stop Briefing" : "Listen to Morning Briefing"}</span>
          </button>

          {/* Upload Purchased RFP Doc (Post-Purchase RAG) */}
          <button
            onClick={() => {
              setUploadTenderTargetId(null);
              setUploadedFileName("ERA_Highway_RFP_Contract_Specification_2026.pdf");
              setIsUploadModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white text-xs font-bold transition-all cursor-pointer"
          >
            <Upload size={14} className="text-[#df2531]" />
            <span>Upload RFP Doc (RAG)</span>
          </button>

          {/* Fetch Live (Merkato & EGP) Scraper */}
          <button
            onClick={handleFetchLiveTenders}
            disabled={fetchingLive}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white text-xs font-bold transition-all shadow-lg shadow-[#df2531]/25 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={14} className={cn(fetchingLive && "animate-spin")} />
            <span>{fetchingLive ? "Scraping Portals..." : "Fetch Latest (Merkato & EGP)"}</span>
          </button>
        </div>
      </div>

      {/* Top Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span className="font-semibold">Active Tenders</span>
            <FileSignature size={15} className="text-[#df2531]" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{tenders.length}</div>
          <div className="text-[10px] text-emerald-400 font-mono">100% Verified RFPs</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span className="font-semibold">Elshaday Car RFPs</span>
            <Car size={15} className="text-[#df2531]" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{elshadayCount}</div>
          <div className="text-[10px] text-neutral-400 font-mono">Top Match: 94% (Hilux GD-6)</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span className="font-semibold">Liora Machinery RFPs</span>
            <HardHat size={15} className="text-[#df2531]" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{lioraCount}</div>
          <div className="text-[10px] text-neutral-400 font-mono">Top Match: 96% (CAT 320D)</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span className="font-semibold">Pipeline Value</span>
            <DollarSign size={15} className="text-emerald-400" />
          </div>
          <div className="text-xl font-black text-white font-mono truncate">
            ETB {(totalBudgetETB / 1000000).toFixed(1)}M
          </div>
          <div className="text-[10px] text-neutral-400 font-mono">Total Potential Contracts</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-neutral-800 space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span className="font-semibold">CPO Bid Bonds Req.</span>
            <ShieldCheck size={15} className="text-[#df2531]" />
          </div>
          <div className="text-xl font-black text-[#df2531] font-mono truncate">
            ETB {(totalCpoETB / 1000).toFixed(0)}k
          </div>
          <div className="text-[10px] text-neutral-400 font-mono">CBE &amp; Awash Bank Ready</div>
        </div>
      </div>

      {/* Daily Morning AI Briefing Banner */}
      <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-neutral-950 via-[#14080a] to-[#0a0a0a] border border-[#df2531]/40 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#df2531]/15 border border-[#df2531]/40 text-[#df2531] shadow-md shadow-[#df2531]/20">
              <Bot size={22} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm text-white">
                  Del's Bot Morning Tender Briefing
                </span>
                <span className="text-[9px] font-mono font-bold px-2 py-0.2 rounded bg-[#df2531]/20 text-[#df2531] border border-[#df2531]/40 uppercase">
                  Daily 07:00 AM EAT
                </span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed max-w-3xl">
                Automated fetch complete across <strong className="text-white">2merkato.com</strong> and{" "}
                <strong className="text-white">Ethiopian Government EGP</strong>. <strong className="text-[#df2531]">6 high-probability opportunities</strong> identified. Top recommendations:{" "}
                <span className="text-white underline">ERA Modjo-Hawassa Heavy Equipment (96% Fit)</span> and{" "}
                <span className="text-white underline">Ethio Telecom 4WD Field Towers Fleet (94% Fit)</span>. All matching assets currently available in Bole and Kality yards.
              </p>
            </div>
          </div>

          <button
            onClick={handlePlayBriefing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white text-xs font-bold transition-all shadow-md shadow-[#df2531]/20 shrink-0 cursor-pointer"
          >
            {isSpeakingBriefing ? <VolumeX size={15} /> : <Volume2 size={15} />}
            <span>{isSpeakingBriefing ? "Stop Voice" : "Listen (ድምፅ አጫውት)"}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#0a0a0a] p-3 rounded-2xl border border-neutral-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* Division Filters */}
          <div className="flex items-center bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs">
            <button
              onClick={() => setSelectedDivisionTab("all")}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer",
                selectedDivisionTab === "all" ? "bg-[#df2531] text-white shadow-sm" : "text-neutral-400 hover:text-white"
              )}
            >
              All Divisions ({tenders.length})
            </button>
            <button
              onClick={() => setSelectedDivisionTab("elshaday")}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                selectedDivisionTab === "elshaday" ? "bg-[#df2531] text-white shadow-sm" : "text-neutral-400 hover:text-white"
              )}
            >
              <Car size={13} />
              Elshaday Cars ({elshadayCount})
            </button>
            <button
              onClick={() => setSelectedDivisionTab("liora")}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                selectedDivisionTab === "liora" ? "bg-[#df2531] text-white shadow-sm" : "text-neutral-400 hover:text-white"
              )}
            >
              <HardHat size={13} />
              Liora Machinery ({lioraCount})
            </button>
          </div>

          {/* Source Filters (Merkato vs EGP) */}
          <div className="flex items-center bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs">
            <button
              onClick={() => setSelectedSourceTab("all")}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer",
                selectedSourceTab === "all" ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-white"
              )}
            >
              All Sources
            </button>
            <button
              onClick={() => setSelectedSourceTab("merkato")}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer",
                selectedSourceTab === "merkato" ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-white"
              )}
            >
              2merkato.com
            </button>
            <button
              onClick={() => setSelectedSourceTab("egp")}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer",
                selectedSourceTab === "egp" ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-white"
              )}
            >
              EGP Government
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tender title, client, ref number..."
            className="w-full pl-9 pr-4 py-2 bg-neutral-900 border border-neutral-800 focus:border-[#df2531] rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Tender Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTenders.map((tender) => {
          const isLiora = tender.targetDivision === "liora";
          const isElshaday = tender.targetDivision === "elshaday";

          return (
            <div
              key={tender.id}
              className="rounded-2xl bg-[#0a0a0a] border border-neutral-800/90 hover:border-[#df2531]/60 p-5 space-y-4 transition-all shadow-lg hover:shadow-2xl hover:shadow-[#df2531]/10 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Card Top Metadata Bar */}
                <div className="flex items-center justify-between gap-2 border-b border-neutral-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase border",
                        tender.source === "merkato"
                          ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          : "bg-blue-500/15 text-blue-400 border-blue-500/30"
                      )}
                    >
                      {tender.sourceName}
                    </span>

                    <span className="text-[10px] font-mono text-neutral-400">
                      Ref: <strong className="text-white">{tender.refNumber}</strong>
                    </span>
                  </div>

                  {/* High Match Score Badge */}
                  <div
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono font-bold text-xs border shadow-sm",
                      tender.matchScore >= 90
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    )}
                  >
                    <Sparkles size={12} />
                    <span>{tender.matchScore}% Match Fit</span>
                  </div>
                </div>

                {/* Title & Issuing Organization */}
                <div>
                  <h3 className="font-display font-bold text-base text-white leading-snug">
                    {tender.title}
                  </h3>
                  <p className="text-xs text-[#df2531] font-medium mt-0.5 font-sans">
                    {tender.titleAmharic}
                  </p>
                  <p className="text-xs text-neutral-400 font-sans mt-1 flex items-center gap-1.5">
                    <Building2 size={13} className="text-neutral-500 shrink-0" />
                    <span className="text-white font-medium">{tender.issuingOrganization}</span>
                    <span className="text-neutral-500">•</span>
                    <span>{tender.location}</span>
                  </p>
                </div>

                {/* Match Summary Note */}
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 space-y-1">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                    <CheckCircle2 size={13} />
                    <span>DEL Services Capability Match</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {tender.matchSummary}
                  </p>
                </div>

                {/* Required Fleet Table Breakdown */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-bold uppercase text-neutral-400 tracking-wider flex items-center justify-between">
                    <span>Required Equipment / Fleet</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Inventory Ready</span>
                  </div>
                  <div className="space-y-1.5">
                    {tender.requiredFleet.map((rf, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-neutral-900/80 border border-neutral-800 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          {rf.category === "heavy_machinery" ? (
                            <Truck size={13} className="text-[#df2531]" />
                          ) : (
                            <Car size={13} className="text-emerald-400" />
                          )}
                          <span className="text-white font-medium">{rf.description}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="text-neutral-400">Req: {rf.quantity}</span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                            Available: {rf.availableCount}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Commercial Figures: Budget & CPO Bond */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 block uppercase font-mono">Estimated Contract Value</span>
                    <span className="font-bold font-mono text-white text-sm">
                      ETB {formatETB(tender.estimatedBudgetETB)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block uppercase font-mono">Bid Security CPO Bond</span>
                    <span className="font-bold font-mono text-[#df2531] text-sm">
                      ETB {formatETB(tender.cpoAmountETB)}
                    </span>
                  </div>
                </div>

                {/* Deadline & Closing Countdown */}
                <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Clock size={13} className="text-amber-400" />
                    <span>Closing: {tender.closingDate}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-bold text-[10px]">
                    {tender.closingCountdown}
                  </span>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-neutral-800">
                {/* Ask Del's Bot about this Tender */}
                <button
                  onClick={() => {
                    setBotInitialQuery(`Analyze tender ${tender.refNumber} (${tender.title}) against our fleet and explain how we can win this bid.`);
                    setIsBotOpen(true);
                  }}
                  className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-[#df2531]/20 hover:border-[#df2531] border border-neutral-700 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <Bot size={14} className="text-[#df2531]" />
                  <span>Analyze with Bot</span>
                </button>

                {/* Compliance Checklist */}
                <button
                  onClick={() => setActiveChecklistTender(tender)}
                  className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <FileText size={14} className="text-emerald-400" />
                  <span>
                    Checklist ({tender.checklist.filter((c) => c.status === "completed").length}/{tender.checklist.length})
                  </span>
                </button>

                {/* Post-Purchase Upload RFP */}
                <button
                  onClick={() => {
                    setUploadTenderTargetId(tender.id);
                    setUploadedFileName(`${tender.refNumber.replace(/[^a-zA-Z0-9]/g, "_")}_RFP_Full_Specification.pdf`);
                    setIsUploadModalOpen(true);
                  }}
                  className="p-2 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white transition-all shadow-md shadow-[#df2531]/20 cursor-pointer"
                  title="Upload Purchased RFP Document for RAG analysis"
                >
                  <Upload size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compliance Checklist Modal */}
      {activeChecklistTender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-[#09090b] border border-neutral-800 shadow-2xl p-6 text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                  <FileText size={18} className="text-[#df2531]" />
                  Tender Compliance Checklist (የጨረታ መስፈርቶች ማረጋገጫ)
                </h3>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  Ref: {activeChecklistTender.refNumber} • {activeChecklistTender.issuingOrganization}
                </p>
              </div>
              <button
                onClick={() => setActiveChecklistTender(null)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-2">
              {activeChecklistTender.checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleChecklistTask(activeChecklistTender.id, item.id, item.status)}
                  className={cn(
                    "p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3",
                    item.status === "completed"
                      ? "bg-emerald-950/20 border-emerald-500/40 text-neutral-200"
                      : "bg-neutral-900/80 border-neutral-800 hover:border-neutral-600 text-neutral-300"
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all",
                      item.status === "completed"
                        ? "bg-emerald-500 border-emerald-400 text-black"
                        : "border-neutral-600 bg-neutral-950"
                    )}
                  >
                    {item.status === "completed" && <Check size={13} />}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn("text-xs font-bold text-white", item.status === "completed" && "line-through opacity-80")}>
                        {item.taskEn}
                      </p>
                      <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                        Due: {item.deadline}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#df2531] font-medium font-sans">
                      {item.taskAm}
                    </p>

                    {item.notes && (
                      <p className="text-[10px] text-neutral-400 font-mono pt-1">
                        ℹ️ {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-neutral-800 text-xs">
              <span className="text-neutral-400">
                Completed:{" "}
                <strong className="text-emerald-400">
                  {activeChecklistTender.checklist.filter((c) => c.status === "completed").length}
                </strong>{" "}
                of {activeChecklistTender.checklist.length}
              </span>
              <button
                onClick={() => setActiveChecklistTender(null)}
                className="px-5 py-2 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post-Purchase Document Upload Modal (RAG Reader Pipeline) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-[#09090b] border border-neutral-800 shadow-2xl p-6 text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                  <Upload size={18} className="text-[#df2531]" />
                  Post-Purchase Document RAG Ingestion
                </h3>
                <p className="text-xs text-neutral-400">
                  Upload purchased RFP PDF / Scanned TOR for Del's Bot AI checklist extraction.
                </p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadRfpDocument} className="space-y-4 text-xs">
              <div>
                <label className="text-neutral-400 font-medium block mb-1">RFP / Tender Document File Name</label>
                <input
                  type="text"
                  value={uploadedFileName}
                  onChange={(e) => setUploadedFileName(e.target.value)}
                  placeholder="e.g. ERA_Modjo_Hawassa_Tender_Document_2026.pdf"
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-[#df2531] rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none"
                />
              </div>

              {/* Upload Dropzone Preview */}
              <div className="border-2 border-dashed border-neutral-800 hover:border-[#df2531]/50 rounded-2xl p-6 text-center space-y-2 bg-neutral-950/60 transition-colors">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-[#df2531]">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Click or drag &amp; drop RFP PDF</p>
                  <p className="text-[10px] text-neutral-500">PDF, Scanned Contract, or Image up to 50MB</p>
                </div>
              </div>

              {ragUploadSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs leading-relaxed animate-fadeIn">
                  ✓ {ragUploadSuccess}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingDoc || !uploadedFileName}
                  className="px-5 py-2.5 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#df2531]/25 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {uploadingDoc && <RefreshCw size={13} className="animate-spin" />}
                  <span>{uploadingDoc ? "Running RAG Pipeline..." : "Extract Checklist (Del's Bot)"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Del's Bot AI Assistant Modal */}
      <DelsBotModal
        isOpen={isBotOpen}
        onClose={() => setIsBotOpen(false)}
        initialQuery={botInitialQuery}
      />
    </div>
  );
}
