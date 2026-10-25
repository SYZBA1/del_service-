"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Building2,
  Bell,
  CheckCircle2,
  Shield,
  Layers,
  ChevronDown,
  Sun,
  Moon,
  LogOut,
  UserCheck,
  Check,
  Clock,
  Sparkles,
  Menu,
  X,
  Truck,
  FileText,
  Calendar,
  AlertTriangle,
  Briefcase,
  Settings,
  Trash2,
  CheckCheck,
  Eye,
  ExternalLink,
  Image as ImageIcon,
  Download,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { cn } from "@/lib/utils";
import { INITIAL_ASSETS, INITIAL_OPERATORS, INITIAL_BOOKINGS, INITIAL_BROKERS } from "@/lib/db";

export function TopUtilityBar() {
  const router = useRouter();
  const {
    activeTenantId,
    setActiveTenantId,
    activePhase,
    setActivePhase,
    searchQuery,
    setSearchQuery,
    tenants,
    theme,
    toggleTheme,
    currentUser,
    logoutUser,
    approveUserRegistration,
    notifications,
    approveNotification,
    markNotificationRead,
    markAllNotificationsRead,
    removeNotification,
    clearAllNotifications,
    toggleMobileSidebar,
  } = useTenant();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationTab, setNotificationTab] = useState<"pending" | "all">("pending");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [viewingAttachment, setViewingAttachment] = useState<any | null>(null);
  const [docZoom, setDocZoom] = useState(1);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const settingsContainerRef = useRef<HTMLDivElement>(null);

  // Close search and settings dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (settingsContainerRef.current && !settingsContainerRef.current.contains(event.target as Node)) {
        setSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pendingNotifications = notifications.filter((n) => n.status === "pending");
  const displayNotifications =
    notificationTab === "pending" ? pendingNotifications : notifications;

  // Live search results
  const trimmedSearch = searchQuery.trim().toLowerCase();
  const matchingAssets = trimmedSearch
    ? INITIAL_ASSETS.filter(
        (a) =>
          a.model.toLowerCase().includes(trimmedSearch) ||
          a.make.toLowerCase().includes(trimmedSearch) ||
          (a.plateNumber && a.plateNumber.toLowerCase().includes(trimmedSearch)) ||
          a.chassisOrSerialNumber.toLowerCase().includes(trimmedSearch)
      ).slice(0, 3)
    : [];

  const matchingOperators = trimmedSearch
    ? INITIAL_OPERATORS.filter(
        (o) =>
          o.fullName.toLowerCase().includes(trimmedSearch) ||
          o.phoneNumber.includes(trimmedSearch) ||
          o.dispatchArea.toLowerCase().includes(trimmedSearch)
      ).slice(0, 3)
    : [];

  const matchingBookings = trimmedSearch
    ? INITIAL_BOOKINGS.filter(
        (b) =>
          b.bookingReference.toLowerCase().includes(trimmedSearch) ||
          b.renterName.toLowerCase().includes(trimmedSearch)
      ).slice(0, 3)
    : [];

  const matchingBrokers = trimmedSearch
    ? INITIAL_BROKERS.filter(
        (b) =>
          b.fullName.toLowerCase().includes(trimmedSearch) ||
          b.phoneNumber.includes(trimmedSearch) ||
          b.address.toLowerCase().includes(trimmedSearch) ||
          b.regionLocation.region.toLowerCase().includes(trimmedSearch) ||
          (b.regionLocation.citySubcity && b.regionLocation.citySubcity.toLowerCase().includes(trimmedSearch))
      ).slice(0, 3)
    : [];

  const hasSearchResults =
    trimmedSearch &&
    (matchingAssets.length > 0 || matchingOperators.length > 0 || matchingBookings.length > 0 || matchingBrokers.length > 0);

  return (
    <header className="h-14 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black px-3 sm:px-6 flex items-center justify-between text-neutral-800 dark:text-neutral-200 z-20 sticky top-0 shadow-sm select-none transition-colors">
      {/* Left: Mobile Hamburger + Quick Live Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
          title="Open Mobile Navigation"
          aria-label="Open Navigation"
        >
          <Menu size={18} />
        </button>

        {/* Global Live Search Bar */}
        <div ref={searchContainerRef} className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400" size={15} />
          <input
            type="text"
            placeholder="Search Plate (e.g. 3-B24591), Asset, Operator, or Booking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-xl pl-9 pr-8 py-2 text-xs text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#df2531]/80 focus:border-[#df2531] transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setIsSearchFocused(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            >
              <X size={13} />
            </button>
          )}

          {/* Live Search Instant Dropdown Overlay */}
          {isSearchFocused && hasSearchResults && (
            <div className="absolute left-0 right-0 mt-2 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl p-3 z-50 text-xs space-y-3 animate-fadeIn">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-2 pb-1 border-b border-neutral-800 flex items-center justify-between">
                <span>Instant Live Matches</span>
                <span className="text-[#df2531]">ESC to close</span>
              </div>

              {/* Assets Results */}
              {matchingAssets.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] text-[#df2531] font-bold px-2 flex items-center gap-1.5">
                    <Truck size={12} /> Fleet Assets ({matchingAssets.length})
                  </div>
                  {matchingAssets.map((a) => (
                    <Link
                      key={a.id}
                      href="/assets"
                      onClick={() => setIsSearchFocused(false)}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-neutral-900 transition-colors text-white"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{a.make} {a.model}</span>
                        <span className="font-mono text-[10px] text-neutral-400">({a.plateNumber || a.chassisOrSerialNumber})</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono capitalize">{a.status}</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Operators Results */}
              {matchingOperators.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-neutral-800">
                  <div className="text-[10px] text-emerald-400 font-bold px-2 flex items-center gap-1.5">
                    <UserCheck size={12} /> Certified Operators ({matchingOperators.length})
                  </div>
                  {matchingOperators.map((o) => (
                    <Link
                      key={o.id}
                      href="/operators"
                      onClick={() => setIsSearchFocused(false)}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-neutral-900 transition-colors text-white"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{o.fullName}</span>
                        <span className="text-[10px] text-neutral-400 font-mono">{o.driverLicenseGrade}</span>
                      </div>
                      <span className="text-[10px] text-[#df2531] font-mono">{o.phoneNumber}</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Bookings Results */}
              {matchingBookings.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-neutral-800">
                  <div className="text-[10px] text-[#df2531] font-bold px-2 flex items-center gap-1.5">
                    <FileText size={12} /> Bookings ({matchingBookings.length})
                  </div>
                  {matchingBookings.map((b) => (
                    <Link
                      key={b.id}
                      href="/dispatch/calendar"
                      onClick={() => setIsSearchFocused(false)}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-neutral-900 transition-colors text-white"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#df2531]">{b.bookingReference}</span>
                        <span className="text-neutral-300 truncate w-36">{b.renterName}</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono uppercase">{b.status}</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Brokers Results */}
              {matchingBrokers.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-neutral-800">
                  <div className="text-[10px] text-[#df2531] font-bold px-2 flex items-center gap-1.5">
                    <Briefcase size={12} /> Brokers & Agents ({matchingBrokers.length})
                  </div>
                  {matchingBrokers.map((brk) => (
                    <Link
                      key={brk.id}
                      href="/brokers"
                      onClick={() => setIsSearchFocused(false)}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-neutral-900 transition-colors text-white"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{brk.fullName}</span>
                        <span className="text-[10px] text-neutral-400 font-mono">({brk.regionLocation.region})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-[#df2531]/15 text-[#df2531] px-1.5 py-0.5 rounded font-bold font-mono">
                          {brk.commissionPct}% Comm
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline">{brk.phoneNumber}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Header Settings Menu + Notification + User Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Header Settings Menu (Phase 1 vs 2 Mode Switcher, Division, Theme) */}
        <div ref={settingsContainerRef} className="relative">
          <button
            onClick={() => {
              setSettingsOpen(!settingsOpen);
              setNotificationsOpen(false);
              setUserMenuOpen(false);
            }}
            className={cn(
              "p-2 rounded-xl border transition-all flex items-center justify-center",
              settingsOpen
                ? "bg-[#df2531]/20 border-[#df2531] text-[#df2531]"
                : "bg-neutral-100 dark:bg-[#0a0a0a] border-neutral-300 dark:border-neutral-800 hover:bg-neutral-200 dark:hover:bg-[#121212] text-neutral-700 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            )}
            title="Header Settings (Operating Mode & System Configuration)"
            aria-label="Settings"
          >
            <Settings size={16} />
          </button>

          {/* Settings Dropdown */}
          {settingsOpen && (
            <div className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-auto sm:mt-2 w-[calc(100vw-24px)] sm:w-80 bg-[#0a0a0a] border border-[#df2531]/40 rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-4 animate-fadeIn">
              {/* Dropdown Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-[#df2531]/15 text-[#df2531]">
                    <Settings size={14} />
                  </span>
                  <span className="font-bold text-white text-xs font-display">Workspace & System Settings</span>
                </div>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="text-neutral-500 hover:text-white"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Operating Mode: Phase 1: Internal ERP vs Phase 2: P2P Turo */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Platform Operating Mode
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#df2531] uppercase">
                    {activePhase === "phase1_erp" ? "ERP Mode" : "P2P Mode"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                  <button
                    onClick={() => setActivePhase("phase1_erp")}
                    className={cn(
                      "p-2 rounded-lg text-left transition-all flex flex-col gap-0.5",
                      activePhase === "phase1_erp"
                        ? "bg-[#df2531] text-white shadow-md shadow-[#df2531]/30"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                    )}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Shield size={12} />
                      Phase 1: ERP
                    </div>
                    <span className="text-[9px] opacity-80 leading-tight">
                      Internal fleet & dispatch
                    </span>
                  </button>

                  <button
                    onClick={() => setActivePhase("phase2_p2p")}
                    className={cn(
                      "p-2 rounded-lg text-left transition-all flex flex-col gap-0.5",
                      activePhase === "phase2_p2p"
                        ? "bg-[#df2531] text-white shadow-md shadow-[#df2531]/30"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                    )}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Layers size={12} />
                      Phase 2: P2P
                    </div>
                    <span className="text-[9px] opacity-80 leading-tight">
                      Peer-to-peer host market
                    </span>
                  </button>
                </div>
              </div>

              {/* Operating Division / Tenant */}
              <div className="space-y-1.5 pt-2 border-t border-neutral-800">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Building2 size={12} className="text-[#df2531]" />
                  Active Operating Division
                </label>
                <select
                  value={activeTenantId}
                  onChange={(e) => setActiveTenantId(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#df2531]"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id} className="bg-neutral-950 text-white">
                      {t.companyName} {t.platformCommissionPct > 0 ? `(${t.platformCommissionPct}%)` : "(0%)"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Theme Toggle */}
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-xs text-neutral-300 font-medium">Interface Theme</span>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-xs font-medium text-neutral-300 hover:text-white transition-all cursor-pointer"
                >
                  {theme === "dark" ? <Sun size={13} className="text-[#df2531]" /> : <Moon size={13} className="text-[#df2531]" />}
                  <span className="capitalize">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                </button>
              </div>

              {/* Sign Out / Reset Session Button inside Settings */}
              <div className="pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setSettingsOpen(false);
                    logoutUser();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 font-bold transition-all text-xs font-display cursor-pointer"
                >
                  <LogOut size={14} className="text-[#df2531]" />
                  Sign Out / Reset Session
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Real-time Head Dispatcher Notification Center */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors relative"
            title="Head Dispatcher Alerts & KYC Approvals"
          >
            <Bell size={17} />
            {pendingNotifications.length > 0 && (
              <>
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#df2531] ring-2 ring-black animate-ping" />
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-[#df2531] text-white font-black text-[9px] flex items-center justify-center shadow shadow-[#df2531]/40">
                  {pendingNotifications.length}
                </span>
              </>
            )}
          </button>

          {/* Spacious Luxury Notification Center Dropdown */}
          {notificationsOpen && (
            <div className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-auto sm:mt-2 w-[calc(100vw-24px)] sm:w-[440px] max-w-lg bg-[#0a0a0a] border border-[#df2531]/30 rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-3 animate-fadeIn">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#df2531]/15 text-[#df2531]">
                    <Bell size={15} />
                  </span>
                  <div>
                    <div className="font-bold text-white text-sm font-display">
                      {currentUser?.role === "elshaday_admin"
                        ? "Elshaday Admin Notifications"
                        : currentUser?.role === "liora_admin"
                        ? "Liora Admin Notifications"
                        : currentUser?.role === "dalol_admin"
                        ? "Dalol Admin Notifications"
                        : "Head Dispatcher Notifications"}
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      Logged in: {currentUser?.fullName || "Yonas Bekele"}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Tabs & Bulk Action Controls */}
              <div className="flex items-center justify-between gap-2 pt-0.5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setNotificationTab("pending")}
                    className={cn(
                      "px-3 py-1 rounded-lg font-bold text-xs transition-all font-display",
                      notificationTab === "pending"
                        ? "bg-[#df2531] text-white shadow-md shadow-[#df2531]/30"
                        : "bg-[#121212] text-neutral-400 hover:text-white"
                    )}
                  >
                    Pending ({pendingNotifications.length})
                  </button>
                  <button
                    onClick={() => setNotificationTab("all")}
                    className={cn(
                      "px-3 py-1 rounded-lg font-bold text-xs transition-all font-display",
                      notificationTab === "all"
                        ? "bg-[#df2531] text-white shadow-md shadow-[#df2531]/30"
                        : "bg-[#121212] text-neutral-400 hover:text-white"
                    )}
                  >
                    All Alerts ({notifications.length})
                  </button>
                </div>

                {/* Bulk Actions: Mark All Read & Clear All */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => markAllNotificationsRead()}
                    className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-[10px] font-bold text-neutral-200 hover:text-white flex items-center gap-1 transition-colors font-display"
                    title="Mark All as Read"
                  >
                    <CheckCheck size={11} className="text-[#df2531]" />
                    All Read
                  </button>
                  <button
                    type="button"
                    onClick={() => clearAllNotifications()}
                    className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-rose-950/60 border border-neutral-700 hover:border-rose-500/50 text-[10px] font-bold text-neutral-300 hover:text-rose-300 flex items-center gap-1 transition-colors font-display"
                    title="Clear All Notifications"
                  >
                    <Trash2 size={11} className="text-rose-400" />
                    Clear All
                  </button>
                </div>
              </div>

              {/* Notification Cards List */}
              <div className="max-h-96 overflow-y-auto space-y-2.5 pr-1 pt-1">
                {displayNotifications.length === 0 ? (
                  <div className="text-center py-8 text-neutral-400 text-xs">
                    No {notificationTab === "pending" ? "pending" : "active"} notifications
                  </div>
                ) : (
                  displayNotifications.map((notif) => {
                    const isPending = notif.status === "pending";
                    const isKyc = notif.type === "kyc_validation";

                    return (
                      <div
                        key={notif.id}
                        className={cn(
                          "p-3.5 rounded-xl border space-y-2 transition-all text-left relative group",
                          isPending
                            ? "bg-[#0C0C0C] border-[#df2531]/50 shadow-md shadow-[#df2531]/10"
                            : "bg-[#080808] border-neutral-800 text-neutral-400"
                        )}
                      >
                        {/* Title, Time, and Individual Action Buttons */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-bold text-xs text-white flex items-center gap-1.5">
                            {isKyc ? (
                              <UserCheck size={14} className="text-[#df2531] shrink-0" />
                            ) : (
                              <Shield size={14} className="text-[#df2531] shrink-0" />
                            )}
                            <span className="font-display">{notif.title}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] font-mono text-neutral-400">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {!notif.read && (
                              <button
                                type="button"
                                onClick={() => markNotificationRead(notif.id)}
                                className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-emerald-400 transition-colors"
                                title="Mark as read"
                              >
                                <Check size={12} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeNotification(notif.id)}
                              className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-rose-400 transition-colors"
                              title="Delete notification"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Message */}
                        <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                          {notif.message}
                        </p>

                        {/* Scanned Guarantee Contract Attachment Badge with Interactive Preview */}
                        {notif.contractFileName && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingAttachment(notif);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center justify-between font-mono cursor-pointer transition-all hover:scale-[1.01] group/att"
                            title="Click to view attached contract / document preview"
                          >
                            <span className="truncate pr-1 flex items-center gap-1.5">
                              {notif.contractFileType === "image" || /\.(png|jpe?g|webp)$/i.test(notif.contractFileName) ? (
                                <ImageIcon size={13} className="text-emerald-400 shrink-0" />
                              ) : (
                                <FileText size={13} className="text-emerald-400 shrink-0" />
                              )}
                              <strong className="text-emerald-200 group-hover/att:underline">{notif.contractFileName}</strong>
                              {notif.contractFileSize ? <span className="text-neutral-400 text-[10px]">({notif.contractFileSize})</span> : null}
                            </span>
                            <span className="shrink-0 text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 group-hover/att:bg-emerald-500/30 text-emerald-400 font-bold uppercase flex items-center gap-1">
                              <Eye size={10} /> View Doc
                            </span>
                          </div>
                        )}

                        {/* Action Bar for Pending KYC */}
                        {isKyc && isPending && (
                          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-2">
                            <span className="text-[10px] text-[#df2531] font-mono flex items-center gap-1">
                              <Sparkles size={11} />
                              Requires Head Dispatcher Sign-off
                            </span>
                            <button
                              type="button"
                              onClick={async () => {
                                await approveNotification(notif.id);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#df2531] hover:bg-[#df2531]/80 text-white font-black text-xs flex items-center gap-1.5 shadow shadow-[#df2531]/30 active:scale-95 cursor-pointer font-display"
                            >
                              <Check size={13} />
                              Approve & Sign KYC
                            </button>
                          </div>
                        )}

                        {/* Approved Stamp */}
                        {notif.status === "approved" && (
                          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5 pt-1 border-t border-neutral-800">
                            <CheckCircle2 size={13} />
                            Approved & Signed by Head Dispatcher Yonas Bekele
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Identity / Dispatcher Badge (Static Display Pill - Profile List Visibility Removed) */}
        <div className="flex items-center gap-2 pl-2 border-l border-neutral-300 dark:border-neutral-800">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#df2531] to-[#7f1118] flex items-center justify-center font-black text-white text-xs shadow-md border border-[#df2531]/40 shrink-0 font-display">
            {currentUser?.fullName?.split(" ").map((n) => n[0]).join("") || "HD"}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-neutral-900 dark:text-white leading-tight font-display">
              {currentUser?.fullName || "Head Dispatcher"}
            </div>
            <div className="text-[10px] text-[#df2531] font-semibold">
              {currentUser?.role === "head_dispatcher"
                ? "Head Dispatcher"
                : currentUser?.role === "elshaday_admin"
                ? "Elshaday Admin"
                : currentUser?.role === "liora_admin"
                ? "Liora Admin"
                : currentUser?.role === "dalol_admin"
                ? "Dalol Admin"
                : "Platform Control"}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Document / Contract Attachment Preview Modal */}
      {viewingAttachment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn text-neutral-200">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                {viewingAttachment.contractFileType === "image" || /\.(png|jpe?g|webp)$/i.test(viewingAttachment.contractFileName) ? (
                  <ImageIcon className="text-[#df2531]" size={20} />
                ) : (
                  <FileText className="text-[#df2531]" size={20} />
                )}
                <div>
                  <h3 className="font-bold text-white text-sm font-display">
                    {viewingAttachment.contractFileName}
                  </h3>
                  <p className="text-[10px] text-neutral-400">
                    Attached Document Archive • {viewingAttachment.contractFileSize || "Verified File"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingAttachment(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body: Image Preview or Real PDF Viewer */}
            {viewingAttachment.contractFileType === "image" || /\.(png|jpe?g|webp)$/i.test(viewingAttachment.contractFileName) ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center min-h-[350px] max-h-[60vh] overflow-hidden relative group">
                  <img
                    src={viewingAttachment.contractFileUrl || "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80"}
                    alt={viewingAttachment.contractFileName}
                    style={{ transform: `scale(${docZoom})` }}
                    className="max-h-[55vh] w-auto max-w-full rounded-lg object-contain shadow-2xl border border-neutral-700/60 transition-transform duration-200"
                  />
                </div>
                <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <ImageIcon size={16} className="text-[#df2531] shrink-0" />
                    <div>
                      <div className="text-white font-bold truncate">{viewingAttachment.contractFileName}</div>
                      <div className="text-[10px] text-neutral-400">Certified Digital Snapshot / Inspection Stamp</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 bg-black p-1 rounded-lg border border-neutral-800">
                      <button
                        type="button"
                        onClick={() => setDocZoom((z) => Math.max(0.5, z - 0.25))}
                        className="p-1 rounded hover:bg-neutral-800 text-neutral-300"
                        title="Zoom out"
                      >
                        <ZoomOut size={13} />
                      </button>
                      <span className="px-1 text-[10px] font-mono font-bold text-neutral-300">{Math.round(docZoom * 100)}%</span>
                      <button
                        type="button"
                        onClick={() => setDocZoom((z) => Math.min(2.5, z + 0.25))}
                        className="p-1 rounded hover:bg-neutral-800 text-neutral-300"
                        title="Zoom in"
                      >
                        <ZoomIn size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDocZoom(1)}
                        className="p-1 rounded hover:bg-neutral-800 text-neutral-300 text-[10px]"
                        title="Reset zoom"
                      >
                        Reset
                      </button>
                    </div>
                    <a
                      href={viewingAttachment.contractFileUrl || "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80"}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={viewingAttachment.contractFileName}
                      className="px-3.5 py-1.5 rounded-lg bg-[#df2531] hover:bg-[#c41e29] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#df2531]/30 font-sans transition-all cursor-pointer"
                    >
                      <Download size={13} /> Download
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-full h-[520px] rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 flex items-center justify-center relative">
                  <iframe
                    src={viewingAttachment.contractFileUrl || "/contracts/guarantor-legal-affidavit.pdf"}
                    className="w-full h-full rounded-xl bg-neutral-900 border-0"
                    title={viewingAttachment.contractFileName}
                  />
                </div>
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <FileText size={16} className="text-[#df2531] shrink-0" />
                    <div>
                      <div className="font-bold text-white truncate">{viewingAttachment.contractFileName}</div>
                      <div className="text-[10px] text-neutral-400">
                        {viewingAttachment.renterName ? `Lessee: ${viewingAttachment.renterName} • ` : ""}
                        {viewingAttachment.assetName ? `Asset: ${viewingAttachment.assetName}` : ""}
                      </div>
                    </div>
                  </div>
                  <a
                    href={viewingAttachment.contractFileUrl || "/contracts/guarantor-legal-affidavit.pdf"}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={viewingAttachment.contractFileName}
                    className="shrink-0 px-3.5 py-1.5 rounded-lg bg-[#df2531] hover:bg-[#c41e29] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#df2531]/30 font-sans transition-all cursor-pointer"
                  >
                    <Download size={13} /> Download / Open Original File
                  </a>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2">
              <div>
                {viewingAttachment.status === "pending" && viewingAttachment.type === "kyc_validation" && (
                  <button
                    onClick={async () => {
                      await approveNotification(viewingAttachment.id);
                      setViewingAttachment(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#df2531]/30 font-display cursor-pointer"
                  >
                    <Check size={14} /> Approve & Sign KYC
                  </button>
                )}
              </div>
              <button
                onClick={() => setViewingAttachment(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-colors font-display cursor-pointer"
              >
                Close Document
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
