"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { FleetOwner, User, SystemNotification } from "@/lib/types";
import { Bell, Check, UserCheck, X, ShieldAlert, Sparkles } from "lucide-react";

interface TenantContextType {
  activeTenantId: string;
  setActiveTenantId: (id: string) => void;
  activePhase: "phase1_erp" | "phase2_p2p";
  setActivePhase: (phase: "phase1_erp" | "phase2_p2p") => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  tenants: FleetOwner[];
  currentTenant: FleetOwner | undefined;
  // Theme Toggle
  theme: "dark" | "light";
  toggleTheme: () => void;
  // User Authentication State
  currentUser: User | null;
  authLoaded: boolean;
  loginUser: (user: User) => void;
  logoutUser: () => void;
  approveUserRegistration: (userId: string) => Promise<boolean>;
  // Notifications & Head Dispatcher Approvals
  notifications: SystemNotification[];
  fetchNotifications: () => Promise<void>;
  sendNotification: (notif: {
    title: string;
    message: string;
    type?: "kyc_validation" | "safety" | "maintenance" | "booking" | "role_approval" | "payment";
    recipientRole?: "head_dispatcher" | "elshaday_admin" | "liora_admin" | "dalol_admin" | "dispatcher" | "all";
    targetDivision?: "all" | "elshaday" | "liora" | "dalol";
    bookingId?: string;
    renterName?: string;
    assetName?: string;
    collateralType?: string;
    contractFileName?: string;
    contractFileSize?: string;
    contractFileUrl?: string;
    contractFileType?: 'pdf' | 'image';
  }) => Promise<SystemNotification | null>;
  approveNotification: (id: string) => Promise<boolean>;
  markNotificationRead: (id: string) => Promise<boolean>;
  markAllNotificationsRead: () => Promise<boolean>;
  removeNotification: (id: string) => Promise<boolean>;
  clearAllNotifications: () => Promise<boolean>;
  latestLiveAlert: SystemNotification | null;
  dismissLiveAlert: () => void;
  // Mobile Sidebar Drawer
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const DEFAULT_YONAS_USER: User = {
  id: "usr-002",
  fullName: "Yonas Bekele",
  phoneNumber: "+251911223344",
  email: "yonas.bekele@delservices.et",
  role: "head_dispatcher",
  status: "active",
  assignedDivision: "all",
  faydaFinNumber: "FIN-2233-4455-6677",
  tinNumber: "0023456789",
  kycVerified: true,
  createdAt: "2026-01-05T08:00:00Z",
};

// Play modern audio chime using Web Audio API
function playChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    // Ignore audio permission or context restrictions
  }
}

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [activeTenantId, setActiveTenantId] = useState<string>("all");
  const [activePhase, setActivePhase] = useState<"phase1_erp" | "phase2_p2p">("phase1_erp");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoaded, setAuthLoaded] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [latestLiveAlert, setLatestLiveAlert] = useState<SystemNotification | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const seenNotificationIdsRef = useRef<Set<string>>(new Set());

  const toggleMobileSidebar = () => setIsMobileSidebarOpen((prev) => !prev);
  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

  const [tenants] = useState<FleetOwner[]>([
    {
      id: "all",
      primaryUserId: "usr-001",
      companyName: "Global Consolidated (All Tenants)",
      ownerType: "internal_company",
      platformCommissionPct: 0,
      instantBookEnabled: true,
      createdAt: "",
    },
    {
      id: "tenant-001",
      primaryUserId: "usr-001",
      companyName: "DEL Internal Fleet",
      ownerType: "internal_company",
      platformCommissionPct: 0,
      tinNumber: "0012345678",
      instantBookEnabled: true,
      createdAt: "",
    },
    {
      id: "tenant-002",
      primaryUserId: "usr-008",
      companyName: "Abyssinia Heavy Equipment Partners",
      ownerType: "corporate_partner",
      platformCommissionPct: 10,
      tinNumber: "0044556677",
      instantBookEnabled: true,
      createdAt: "",
    },
    {
      id: "tenant-003",
      primaryUserId: "usr-008",
      companyName: "Dawit Haile P2P Fleet (Turo Mode)",
      ownerType: "individual_host",
      platformCommissionPct: 15,
      tinNumber: "0077889900",
      instantBookEnabled: false,
      createdAt: "",
    },
  ]);

  // Sync theme with DOM and localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("del_theme") as "dark" | "light" | null;
    const initialTheme = savedTheme || "dark";
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }

    const savedUser = localStorage.getItem("del_user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
    setAuthLoaded(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("del_theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  };

  const loginUser = (user: User) => {
    setCurrentUser(user);
    if (typeof window !== "undefined") {
      localStorage.setItem("del_user", JSON.stringify(user));
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("del_user");
      window.location.href = "/login";
    }
  };

  const approveUserRegistration = async (userId: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/v1/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          userId,
          approverName: currentUser?.fullName || "Yonas Bekele",
        }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchNotifications();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const fetchNotifications = async (triggerAlertSound = false) => {
    try {
      const roleParam = currentUser?.role ? `role=${encodeURIComponent(currentUser.role)}` : "";
      const divParam = currentUser?.assignedDivision ? `division=${encodeURIComponent(currentUser.assignedDivision)}` : "";
      const query = [roleParam, divParam].filter(Boolean).join("&");
      const url = query ? `/api/v1/notifications?${query}` : "/api/v1/notifications";

      const res = await fetch(url);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const notifs: SystemNotification[] = json.data;
        setNotifications(notifs);

        // Detect new pending notifications
        let foundNewPending: SystemNotification | null = null;
        notifs.forEach((n) => {
          if (!seenNotificationIdsRef.current.has(n.id)) {
            seenNotificationIdsRef.current.add(n.id);
            if (n.status === "pending") {
              foundNewPending = n;
            }
          }
        });

        if (foundNewPending && triggerAlertSound) {
          playChime();
          setLatestLiveAlert(foundNewPending);
        }
      }
    } catch (e) {
      console.error("Failed to load notifications", e);
    }
  };

  // Initial fetch and real-time polling every 3 seconds
  useEffect(() => {
    fetchNotifications(false);
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const sendNotification = async (notifData: any) => {
    try {
      const res = await fetch("/api/v1/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifData),
      });
      const json = await res.json();
      if (json.success) {
        setLatestLiveAlert(json.data);
        playChime();
        await fetchNotifications(false);
        return json.data;
      }
    } catch (e) {
      console.error("Failed to send notification", e);
    }
    return null;
  };

  const approveNotification = async (id: string) => {
    try {
      const res = await fetch("/api/v1/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          action: "approve",
          approverName: currentUser?.fullName || "Yonas Bekele",
        }),
      });
      const json = await res.json();
      if (json.success) {
        if (latestLiveAlert?.id === id) {
          setLatestLiveAlert(null);
        }
        await fetchNotifications(false);
        return true;
      }
    } catch (e) {
      console.error("Failed to approve notification", e);
    }
    return false;
  };

  const markNotificationRead = async (id: string) => {
    try {
      const res = await fetch("/api/v1/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "read" }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchNotifications(false);
        return true;
      }
    } catch (e) {
      console.error("Failed to mark notification read", e);
    }
    return false;
  };

  const markAllNotificationsRead = async (): Promise<boolean> => {
    try {
      const role = currentUser?.role || "head_dispatcher";
      const res = await fetch("/api/v1/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read", role }),
      });
      const json = await res.json();
      if (json.success) {
        setNotifications((prev) =>
          prev.map((n) => ({
            ...n,
            read: true,
            status: n.status === "pending" ? "approved" : n.status,
          }))
        );
        if (typeof window !== "undefined" && currentUser?.role) {
          const roleKey = `del_notifs_${currentUser.role}`;
          const currentCached = localStorage.getItem(roleKey);
          if (currentCached) {
            try {
              const parsed = JSON.parse(currentCached);
              const updated = parsed.map((n: any) => ({
                ...n,
                read: true,
                status: n.status === "pending" ? "approved" : n.status,
              }));
              localStorage.setItem(roleKey, JSON.stringify(updated));
            } catch (e) {}
          }
        }
        await fetchNotifications(false);
        return true;
      }
    } catch (e) {
      console.error("Failed to mark all notifications read", e);
    }
    return false;
  };

  const removeNotification = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/v1/notifications?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setNotifications((prev) => {
          const next = prev.filter((n) => n.id !== id);
          if (typeof window !== "undefined" && currentUser?.role) {
            localStorage.setItem(`del_notifs_${currentUser.role}`, JSON.stringify(next));
          }
          return next;
        });
        if (latestLiveAlert?.id === id) {
          setLatestLiveAlert(null);
        }
        return true;
      }
    } catch (e) {
      console.error("Failed to delete notification", e);
    }
    return false;
  };

  const clearAllNotifications = async (): Promise<boolean> => {
    try {
      const role = currentUser?.role || "head_dispatcher";
      const res = await fetch(
        `/api/v1/notifications?action=clear_all&role=${encodeURIComponent(role)}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (json.success) {
        setNotifications([]);
        setLatestLiveAlert(null);
        if (typeof window !== "undefined" && currentUser?.role) {
          localStorage.removeItem(`del_notifs_${currentUser.role}`);
        }
        return true;
      }
    } catch (e) {
      console.error("Failed to clear all notifications", e);
    }
    return false;
  };

  // Switch notifications cache immediately when role changes
  useEffect(() => {
    if (!currentUser?.role || typeof window === "undefined") return;
    const roleKey = `del_notifs_${currentUser.role}`;
    const cached = localStorage.getItem(roleKey);
    if (cached) {
      try {
        setNotifications(JSON.parse(cached));
      } catch (e) {}
    }
    fetchNotifications(false);
  }, [currentUser?.role]);

  const dismissLiveAlert = () => {
    setLatestLiveAlert(null);
  };

  const currentTenant = tenants.find((t) => t.id === activeTenantId);

  return (
    <TenantContext.Provider
      value={{
        activeTenantId,
        setActiveTenantId,
        activePhase,
        setActivePhase,
        searchQuery,
        setSearchQuery,
        tenants,
        currentTenant,
        theme,
        toggleTheme,
        currentUser,
        authLoaded,
        loginUser,
        logoutUser,
        approveUserRegistration,
        notifications,
        fetchNotifications: () => fetchNotifications(false),
        sendNotification,
        approveNotification,
        markNotificationRead,
        markAllNotificationsRead,
        removeNotification,
        clearAllNotifications,
        latestLiveAlert,
        dismissLiveAlert,
        isMobileSidebarOpen,
        toggleMobileSidebar,
        closeMobileSidebar,
      }}
    >
      {children}

      {/* Real-time Interactive Floating KYC & Dispatcher Notification Toast (Brand Color #df2531) */}
      {latestLiveAlert && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full p-4 rounded-2xl bg-[#0D0E12] dark:bg-[#0A0A0A] border-2 border-[#df2531] shadow-2xl shadow-[#df2531]/40 text-white animate-bounce duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#df2531] text-white font-black shadow-lg shadow-[#df2531]/40 animate-pulse">
                <Bell size={18} />
              </span>
              <div>
                <div className="text-xs font-black text-[#FF4D58] uppercase tracking-wider flex items-center gap-1.5 font-display">
                  <Sparkles size={12} />
                  Live Dispatch Alert • Yonas Bekele
                </div>
                <div className="font-bold text-sm text-white font-display">{latestLiveAlert.title}</div>
              </div>
            </div>
            <button
              onClick={dismissLiveAlert}
              className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <p className="mt-2 text-xs text-neutral-200 leading-relaxed font-sans">
            {latestLiveAlert.message}
          </p>

          {latestLiveAlert.contractFileName && (
            <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-[11px] text-emerald-300 flex items-center justify-between font-mono">
              <span className="flex items-center gap-1.5 truncate pr-1">
                📄 <strong>PDF Contract Attached:</strong> {latestLiveAlert.contractFileName} {latestLiveAlert.contractFileSize ? `(${latestLiveAlert.contractFileSize})` : ""}
              </span>
              <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300">
                Ready for Review
              </span>
            </div>
          )}

          <div className="mt-3.5 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono text-[#FF4D58] font-bold">
              {latestLiveAlert.renterName ? `Renter: ${latestLiveAlert.renterName}` : "Pending Signature"}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={dismissLiveAlert}
                className="px-3 py-1.5 rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-200 text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Later
              </button>
              <button
                onClick={async () => {
                  await approveNotification(latestLiveAlert.id);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-[#df2531]/40 active:scale-95 transition-all cursor-pointer font-sans"
              >
                <Check size={14} className="stroke-[3]" />
                Approve & Sign as Head Dispatcher
              </button>
            </div>
          </div>
        </div>
      )}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}
