"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  ShieldCheck,
  UserCheck,
  Check,
  X,
  AlertCircle,
  Clock,
  Car,
  HardHat,
  Sparkles,
  Layers,
  ChevronRight,
  Mail,
  Building2,
  Lock,
  Unlock,
  Users,
  CheckCircle2,
  XCircle,
  FileText,
  BadgeAlert,
  KeyRound,
  Copy,
  ExternalLink,
  Send,
  Eye,
  CheckCheck,
  UserPlus,
  Trash2,
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { BrandLogoLoader } from "@/components/BrandLogoLoader";

interface RoleSpec {
  id: string;
  name: string;
  division: string;
  description: string;
  badgeColor: string;
  permissions: {
    canViewAllDivisions: boolean;
    canManageCars: boolean;
    canManageMachinery: boolean;
    canManageDalol: boolean;
    canApproveKYC: boolean;
    canManageFinance: boolean;
    canManageBrokers: boolean;
    canManagePartners: boolean;
    canManageRBAC: boolean;
  };
  allowedModules: string[];
}

const DEFAULT_ROLE_SPECS: RoleSpec[] = [
  {
    id: "head_dispatcher",
    name: "Head Dispatcher",
    division: "All Divisions (Global Consolidated)",
    description: "Full super-admin permissions to control and oversee the entire platform, all divisions, financial ledgers, and security governance.",
    badgeColor: "bg-[#df2531]/20 text-[#df2531] border-[#df2531]/40",
    permissions: {
      canViewAllDivisions: true,
      canManageCars: true,
      canManageMachinery: true,
      canManageDalol: true,
      canApproveKYC: true,
      canManageFinance: true,
      canManageBrokers: true,
      canManagePartners: true,
      canManageRBAC: true,
    },
    allowedModules: [
      "Command Center",
      "Dispatch Gantt",
      "Fleet Registry",
      "Certified Operators (ODR)",
      "Inspections & Walkaround",
      "Maintenance Schedules",
      "Elshaday Car Rental",
      "Liora Heavy Machinery",
      "Dalol Logistics Service",
      "Tax Ledger & Settlements",
      "Brokers & Commissions",
      "Partners Onboarding",
      "RBAC Governance & Permissions",
    ],
  },
  {
    id: "elshaday_admin",
    name: "Elshaday Admin",
    division: "Car Rental Division",
    description: "Scoped admin permissions to view, manage, and dispatch passenger vehicles, commercial vans, drivers, and rental revenues.",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    permissions: {
      canViewAllDivisions: false,
      canManageCars: true,
      canManageMachinery: false,
      canManageDalol: false,
      canApproveKYC: true,
      canManageFinance: true,
      canManageBrokers: true,
      canManagePartners: true,
      canManageRBAC: false,
    },
    allowedModules: [
      "Command Center",
      "Dispatch Gantt",
      "Fleet Registry (Passenger Vehicles)",
      "Chauffeurs & Drivers",
      "Inspections & Return Walkaround",
      "Elshaday Cashflow & Ledger",
      "Car Rental Brokers",
      "Individual Fleet Hosts",
    ],
  },
  {
    id: "liora_admin",
    name: "Liora Admin",
    division: "Machinery Division",
    description: "Scoped admin permissions to deploy heavy earthmoving plant, hydraulic attachments, quarry machinery, and site mobilization.",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    permissions: {
      canViewAllDivisions: false,
      canManageCars: false,
      canManageMachinery: true,
      canManageDalol: false,
      canApproveKYC: true,
      canManageFinance: true,
      canManageBrokers: true,
      canManagePartners: true,
      canManageRBAC: false,
    },
    allowedModules: [
      "Command Center",
      "Dispatch Gantt",
      "Fleet Registry (Excavators, Loaders, Breakers)",
      "Certified Operators (ODR Mobile Machinery)",
      "Site Inspections & Engine Hours",
      "Machinery Maintenance & Overhauls",
      "Liora Advance Vault & Ledger",
      "Infrastructure & Quarry Brokers",
      "Heavy Equipment Corporate Partners",
    ],
  },
  {
    id: "dalol_admin",
    name: "Dalol Admin",
    division: "Dalol Service",
    description: "Scoped admin permissions for Djibouti-Addis corridor freight dispatch, low-bed heavy transport, and RFID fuel smart releases.",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    permissions: {
      canViewAllDivisions: false,
      canManageCars: false,
      canManageMachinery: false,
      canManageDalol: true,
      canApproveKYC: false,
      canManageFinance: true,
      canManageBrokers: true,
      canManagePartners: true,
      canManageRBAC: false,
    },
    allowedModules: [
      "Command Center",
      "Fleet Registry (Corridor Freight & Lowbeds)",
      "Dalol Escrow & Freight Bookings",
      "Dalol Fuel Escrow Rail & Ledger",
      "Logistics Freight Brokers",
      "Corridor Commercial Carriers",
    ],
  },
];

const DEFAULT_EMAILS: Record<string, string> = {
  head_dispatcher: "yonas.bekele@delservices.et",
  elshaday_admin: "elshaday.admin@delservices.et",
  liora_admin: "liora.admin@delservices.et",
  dalol_admin: "dalol.admin@delservices.et",
};

export default function PermissionsPage() {
  const { currentUser, approveUserRegistration, fetchNotifications } = useTenant();
  const [selectedRoleTab, setSelectedRoleTab] = useState<string>("head_dispatcher");
  const [roles, setRoles] = useState<RoleSpec[]>(DEFAULT_ROLE_SPECS);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionProcessing, setActionProcessing] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Role Credential Input & Link State
  const [roleEmails, setRoleEmails] = useState<Record<string, string>>(DEFAULT_EMAILS);
  const [sendingRole, setSendingRole] = useState<string | null>(null);
  const [recentGeneratedLinks, setRecentGeneratedLinks] = useState<
    Record<string, { link: string; token: string; email: string }>
  >({});
  const [copiedRole, setCopiedRole] = useState<string | null>(null);

  // Branded HTML Email Preview Modal State
  const [emailPreviewModal, setEmailPreviewModal] = useState<{
    isOpen: boolean;
    emailHtml: string;
    emailSubject: string;
    recipient: string;
    token: string;
    resetLink: string;
    roleName: string;
    sentVia?: string;
  } | null>(null);
  const [copiedHtml, setCopiedHtml] = useState<boolean>(false);

  // Add User Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    fullName: "",
    email: "",
    role: "elshaday_admin",
    assignedDivision: "elshaday",
    phoneNumber: "",
    password: "",
  });
  const [savingUser, setSavingUser] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/permissions");
      const json = await res.json();
      if (json.success) {
        if (json.roles && json.roles.length > 0) {
          setRoles(json.roles);
        }
        setPendingUsers(json.pendingUsers || []);
        setAllUsers(json.allUsers || json.users || []);

        // Pre-fill email inputs from active users if present
        const activeUsers = json.allUsers || json.users || [];
        const updatedEmails: Record<string, string> = { ...DEFAULT_EMAILS };
        activeUsers.forEach((u: any) => {
          if (u.role && u.email && u.status === "active") {
            if (!updatedEmails[u.role] || updatedEmails[u.role] === DEFAULT_EMAILS[u.role]) {
              updatedEmails[u.role] = u.email;
            }
          }
        });
        setRoleEmails(updatedEmails);
      }
    } catch (e) {
      console.error("Failed to load permissions data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (userId: string, userName: string) => {
    setActionProcessing(userId);
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
        setToastMessage({
          type: "success",
          text: `Permissions approved for ${userName}. Account activated successfully!`,
        });
        await loadData();
        await fetchNotifications();
      } else {
        setToastMessage({ type: "error", text: json.error || "Approval failed" });
      }
    } catch (e: any) {
      setToastMessage({ type: "error", text: e.message || "Failed to approve user" });
    } finally {
      setActionProcessing(null);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const handleReject = async (userId: string, userName: string) => {
    setActionProcessing(userId);
    try {
      const res = await fetch("/api/v1/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          userId,
          approverName: currentUser?.fullName || "Yonas Bekele",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setToastMessage({
          type: "success",
          text: `Registration request for ${userName} has been rejected.`,
        });
        await loadData();
        await fetchNotifications();
      } else {
        setToastMessage({ type: "error", text: json.error || "Action failed" });
      }
    } catch (e: any) {
      setToastMessage({ type: "error", text: e.message || "Failed to reject user" });
    } finally {
      setActionProcessing(null);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete account for ${userName}?`)) {
      return;
    }
    setActionProcessing(userId);
    try {
      const res = await fetch("/api/v1/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_user",
          userId,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setToastMessage({
          type: "success",
          text: `Account for ${userName} has been removed from platform directory.`,
        });
        await loadData();
      } else {
        setToastMessage({ type: "error", text: json.error || "Failed to delete user" });
      }
    } catch (e: any) {
      setToastMessage({ type: "error", text: e.message || "Failed to delete user" });
    } finally {
      setActionProcessing(null);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.fullName.trim() || !newUserData.email.trim()) {
      setToastMessage({ type: "error", text: "Please enter both full name and email." });
      return;
    }
    setSavingUser(true);
    try {
      const res = await fetch("/api/v1/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_user",
          ...newUserData,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setToastMessage({
          type: "success",
          text: `Account registered successfully for ${newUserData.fullName} (${newUserData.role})!`,
        });
        setIsAddUserModalOpen(false);
        setNewUserData({
          fullName: "",
          email: "",
          role: "elshaday_admin",
          assignedDivision: "elshaday",
          phoneNumber: "",
          password: "",
        });
        await loadData();
      } else {
        setToastMessage({ type: "error", text: json.error || "Failed to create user" });
      }
    } catch (e: any) {
      setToastMessage({ type: "error", text: e.message || "Failed to create user" });
    } finally {
      setSavingUser(false);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  // Dispatch Role Credential Setup / Reset Link directly to recipient email provider
  const handleSendRoleResetLink = async (roleId: string) => {
    const targetEmail = (roleEmails[roleId] || "").trim();
    if (!targetEmail) {
      setToastMessage({
        type: "error",
        text: "Please enter a valid email address to assign credentials.",
      });
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    setSendingRole(roleId);

    try {
      // 1. Call backend to bind email to role, generate token, and dispatch formatted HTML email via Firebase
      const res = await fetch("/api/v1/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "provision_credentials",
          role: roleId,
          email: targetEmail,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to provision role credentials");
      }

      // 2. Dispatch via Firebase Auth sendPasswordResetEmail if client auth is available
      if (auth) {
        sendPasswordResetEmail(auth, targetEmail).catch((err) => {
          console.warn("Client Firebase Auth email notification notice:", err.message);
        });
      }

      // 3. Store generated reset link for quick local test / copy
      setRecentGeneratedLinks((prev) => ({
        ...prev,
        [roleId]: {
          link: json.resetLink,
          token: json.token,
          email: targetEmail,
        },
      }));

      const roleName = roles.find((r) => r.id === roleId)?.name || roleId;

      // 4. Store preview data without force-opening the inspection modal
      if (json.emailHtml) {
        setEmailPreviewModal({
          isOpen: false,
          emailHtml: json.emailHtml,
          emailSubject: json.emailSubject || `[DEL Services] Setup Your Access Credentials — ${roleName}`,
          recipient: targetEmail,
          token: json.token,
          resetLink: json.resetLink,
          roleName,
          sentVia: json.sentVia,
        });
      }

      // 5. Confirmation Toast showing real inbox delivery
      setToastMessage({
        type: "success",
        text: `Setup email sent directly to ${targetEmail} inbox via Google Firebase Provider for ${roleName}!`,
      });

      // 6. Refresh user tables to show updated status
      await loadData();
      await fetchNotifications();
    } catch (e: any) {
      setToastMessage({
        type: "error",
        text: e.message || "Failed to dispatch password setup link",
      });
    } finally {
      setSendingRole(null);
      setTimeout(() => setToastMessage(null), 6000);
    }
  };

  const handleCopyLink = (roleId: string, link: string) => {
    const fullUrl = `${window.location.origin}${link}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedRole(roleId);
    setTimeout(() => setCopiedRole(null), 2500);
  };

  const handleCopyEmailHtml = () => {
    if (!emailPreviewModal?.emailHtml) return;
    navigator.clipboard.writeText(emailPreviewModal.emailHtml);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2500);
  };

  if (loading && roles.length === 0) {
    return (
      <BrandLogoLoader
        fullScreen
        message="Loading DEL Services RBAC Governance & Permissions Desk..."
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#ECEEF2] dark:bg-black text-[#111827] dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8 transition-colors">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-300 dark:border-[#df2531]/20 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#df2531] mb-1 font-display">
            <Shield size={14} />
            DEL Services • Security & Governance
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111827] dark:text-white tracking-tight flex items-center gap-3 font-display">
            Role-Based Access Control (RBAC) & Permissions Desk
          </h1>
          <p className="text-xs sm:text-sm text-[#374151] dark:text-neutral-400 mt-1 max-w-2xl font-sans">
            Manage multi-division access boundaries across Elshaday Car Rental, Liora Machinery, and Dalol Services. Review pending registrations, provision role credentials, dispatch real branded HTML emails, and audit security scopes.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-[#2D323B] dark:bg-[#0a0a0a] border border-[#3E4551] dark:border-[#df2531]/30 text-right shadow">
            <div className="text-[10px] uppercase font-bold text-[#E5E7EB] dark:text-neutral-400 font-sans">Governance Lead</div>
            <div className="text-xs font-bold text-[#FF4D58] dark:text-[#df2531] flex items-center gap-1.5 justify-end font-display">
              <ShieldCheck size={13} />
              {currentUser?.fullName || "Yonas Bekele (Head Dispatcher)"}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Alert Toast */}
      {toastMessage && (
        <div
          className={cn(
            "p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3 shadow-2xl transition-all animate-fadeIn font-sans",
            toastMessage.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/60 text-emerald-200"
              : "bg-rose-950/90 border-[#df2531]/60 text-rose-200"
          )}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle size={18} className="shrink-0 text-[#df2531]" />
          )}
          <span className="flex-1">{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-neutral-400 hover:text-white text-xs px-2 py-0.5 rounded"
          >
            ✕
          </button>
        </div>
      )}

      {/* High-Level Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        <div className="p-4 rounded-2xl bg-[#0a0a0a] light:bg-[#3A3F47] border border-[#df2531]/30 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[11px] text-[#df2531] font-bold uppercase tracking-wider flex items-center gap-1 font-display">
              <Clock size={12} />
              Pending Approvals
            </div>
            <div className="text-2xl font-black text-white mt-1 font-display">{pendingUsers.length}</div>
            <div className="text-[10px] text-neutral-400 light:text-neutral-200 mt-0.5">Awaiting Head Dispatcher sign-off</div>
          </div>
          <span className="h-10 w-10 rounded-xl bg-[#df2531]/15 text-[#df2531] flex items-center justify-center font-bold">
            {pendingUsers.length > 0 ? (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#df2531] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#df2531]"></span>
              </span>
            ) : (
              <Check size={18} />
            )}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a0a0a] light:bg-[#3A3F47] border border-neutral-800 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[11px] text-neutral-400 light:text-neutral-200 font-bold uppercase tracking-wider flex items-center gap-1">
              <Users size={12} />
              Active Users
            </div>
            <div className="text-2xl font-black text-white mt-1 font-display">
              {allUsers.filter((u) => u.status === "active").length}
            </div>
            <div className="text-[10px] text-neutral-400 light:text-neutral-200 mt-0.5">Across 4 system roles</div>
          </div>
          <span className="h-10 w-10 rounded-xl bg-neutral-900 light:bg-[#4A505A] text-neutral-300 flex items-center justify-center font-bold">
            <ShieldCheck size={18} />
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a0a0a] light:bg-[#3A3F47] border border-neutral-800 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[11px] text-neutral-300 light:text-neutral-200 font-bold uppercase tracking-wider flex items-center gap-1">
              <Building2 size={12} />
              Multi-Division Scopes
            </div>
            <div className="text-2xl font-black text-white mt-1 font-display">4 Tiers</div>
            <div className="text-[10px] text-neutral-400 light:text-neutral-200 mt-0.5">Elshaday • Liora • Dalol • Super</div>
          </div>
          <span className="h-10 w-10 rounded-xl bg-[#df2531]/10 text-[#df2531] flex items-center justify-center font-bold">
            <Layers size={18} />
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a0a0a] light:bg-[#3A3F47] border border-neutral-800 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Mail size={12} />
              Branded HTML Dispatch
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1 font-display">Active</div>
            <div className="text-[10px] text-neutral-400 light:text-neutral-200 mt-0.5">Real email + instant preview</div>
          </div>
          <span className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <Send size={18} />
          </span>
        </div>
      </div>

      {/* SECTION 1: PENDING ROLE APPROVALS QUEUE */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0a0a0a] light:bg-[#3A3F47] border border-[#df2531]/30 space-y-4 shadow-xl font-sans card-dark-silver">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#df2531]/15 text-[#df2531]">
              <BadgeAlert size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 font-display section-heading">
                Pending Account Approvals Queue
                {pendingUsers.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-[#df2531] text-white font-display">
                    {pendingUsers.length} Action Needed
                  </span>
                )}
              </h2>
              <p className="text-xs text-neutral-400 light:text-neutral-200">
                New user registrations awaiting Head Dispatcher review and role assignment confirmation.
              </p>
            </div>
          </div>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="py-8 text-center rounded-xl bg-neutral-900/40 light:bg-[#4A505A]/40 border border-dashed border-neutral-800 text-neutral-400 light:text-neutral-200 text-xs">
            <CheckCircle2 size={24} className="mx-auto text-emerald-400 mb-2" />
            No pending registration approvals. All platform user accounts are active and verified.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingUsers.map((user) => {
              const isProcessing = actionProcessing === user.id;
              return (
                <div
                  key={user.id}
                  className="p-4 rounded-xl bg-neutral-950 light:bg-[#4A505A] border border-[#df2531]/30 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-[#df2531]/60"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-white text-sm font-display">{user.fullName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#df2531]/15 text-[#df2531] border border-[#df2531]/30">
                        Requested: {user.role?.replace("_", " ")}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/80 flex items-center gap-1">
                        <Mail size={11} />
                        Confirmation Email Dispatched
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-neutral-400 light:text-neutral-200 flex-wrap">
                      <span>Email: <strong className="text-white font-mono">{user.email}</strong></span>
                      <span>Phone: <strong className="text-white font-mono">{user.phoneNumber || "N/A"}</strong></span>
                      <span>Division Scope: <strong className="text-[#df2531] capitalize">{user.assignedDivision || "Division Specific"}</strong></span>
                      <span>Registered: <strong className="text-neutral-300 light:text-neutral-100">{new Date(user.createdAt).toLocaleDateString()}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleReject(user.id, user.fullName)}
                      className="px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-800 light:bg-[#2D3138] text-neutral-300 hover:bg-neutral-700 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <X size={14} className="text-rose-400" />
                      Reject
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleApprove(user.id, user.fullName)}
                      className="px-4 py-2 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-[#df2531]/25 transition-all active:scale-95 font-display"
                    >
                      <Check size={14} />
                      {isProcessing ? "Granting..." : "Approve & Grant Permissions"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: 4-TIER ROLE ARCHITECTURE & PASSWORD RESET CONTROL CENTER */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0a0a0a] light:bg-[#3A3F47] border border-neutral-800 space-y-6 shadow-xl font-sans card-dark-silver">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2 font-display section-heading">
              <Layers size={18} className="text-[#df2531]" />
              4-Tier RBAC Architecture & Module Permissions Matrix
            </h2>
            <p className="text-xs text-neutral-400 light:text-neutral-200 mt-0.5">
              Direct role-specific credential provisioning, branded HTML email dispatch, and operational authorization limits per role.
            </p>
          </div>
          <div className="px-3 py-1 rounded-full bg-[#df2531]/10 border border-[#df2531]/30 text-[11px] text-[#df2531] font-mono flex items-center gap-1.5 w-fit font-display">
            <KeyRound size={12} />
            Branded HTML Email Enabled
          </div>
        </div>

        {/* 4 Interactive Role Cards with "Assign / Reset Role Credentials" */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((role) => {
            const isSelected = selectedRoleTab === role.id;
            const isSending = sendingRole === role.id;
            const activeUserUnderRole = allUsers.find(
              (u) => u.role === role.id && u.status === "active"
            );
            const genLink = recentGeneratedLinks[role.id];

            // Icon by role
            const RoleIcon =
              role.id === "head_dispatcher"
                ? ShieldCheck
                : role.id === "elshaday_admin"
                ? Car
                : role.id === "liora_admin"
                ? HardHat
                : Sparkles;

            return (
              <div
                key={role.id}
                className={cn(
                  "p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-4 relative card-dark-silver",
                  isSelected
                    ? "border-[#df2531] shadow-xl shadow-[#df2531]/20 bg-[#0d0d0d] light:bg-[#3A3F47] ring-1 ring-[#df2531]/50"
                    : "border-neutral-800 light:border-[#2D3138] hover:border-neutral-700 bg-neutral-950/60 light:bg-[#3A3F47]"
                )}
              >
                {/* Role Header (Clickable to switch tab) */}
                <div
                  onClick={() => setSelectedRoleTab(role.id)}
                  className="cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all",
                        isSelected
                          ? "bg-[#df2531] text-white shadow-md shadow-[#df2531]/30"
                          : "bg-neutral-900 light:bg-[#4A505A] text-neutral-400 light:text-white group-hover:text-white"
                      )}
                    >
                      <RoleIcon size={16} />
                    </span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border",
                        role.badgeColor
                      )}
                    >
                      {role.division.split(" ")[0]}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-[#df2531] transition-colors font-display role-title">
                      {role.name}
                    </h3>
                    <p className="text-[11px] text-neutral-300 light:text-neutral-100 line-clamp-2 mt-0.5 leading-snug">
                      {role.description}
                    </p>
                  </div>

                  {/* Current Active Account Badge */}
                  <div className="pt-1">
                    <div className="text-[10px] text-neutral-400 light:text-neutral-300 font-semibold uppercase tracking-wider">
                      Current Authorized Account:
                    </div>
                    <div className="text-xs font-mono text-white truncate flex items-center gap-1.5 mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                      {activeUserUnderRole ? (
                        <span title={activeUserUnderRole.email}>{activeUserUnderRole.email}</span>
                      ) : (
                        <span className="text-neutral-400 italic">None assigned yet</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ASSIGN / RESET ROLE CREDENTIALS CONTROL */}
                <div className="pt-3 border-t border-neutral-800/80 light:border-[#2D3138] space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-white font-display">
                    <span className="flex items-center gap-1">
                      <KeyRound size={12} className="text-[#df2531]" />
                      Assign / Reset Role Credentials
                    </span>
                  </div>

                  {/* Email Input Field */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-300 light:text-neutral-200 uppercase font-semibold block">
                      Target Account Email:
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-400">
                        <Mail size={13} />
                      </div>
                      <input
                        type="email"
                        value={roleEmails[role.id] ?? ""}
                        onChange={(e) =>
                          setRoleEmails((prev) => ({ ...prev, [role.id]: e.target.value }))
                        }
                        placeholder={`admin@delservices.et`}
                        className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-neutral-900 light:bg-white border border-neutral-700 light:border-neutral-300 focus:border-[#df2531] text-xs text-white light:text-neutral-900 placeholder-neutral-500 light:placeholder-neutral-400 outline-none transition-all font-mono font-medium"
                      />
                    </div>
                  </div>

                  {/* Send Button */}
                  <button
                    type="button"
                    disabled={isSending}
                    onClick={() => handleSendRoleResetLink(role.id)}
                    className="w-full py-2 px-3 rounded-xl bg-[#df2531] hover:bg-[#c41e29] active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#df2531]/20 transition-all font-display cursor-pointer"
                  >
                    {isSending ? (
                      <>
                        <BrandLogoLoader size="inline" message="" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send size={12} />
                        <span>Send</span>
                      </>
                    )}
                  </button>

                  {/* Generated Link Shortcut & Preview Trigger Bar */}
                  {genLink && (
                    <div className="p-2.5 rounded-xl bg-neutral-900/90 light:bg-[#4A505A] border border-emerald-500/40 text-[11px] space-y-1.5 animate-fadeIn">
                      <div className="flex items-center justify-between text-emerald-400 font-bold">
                        <span className="flex items-center gap-1 text-[10px]">
                          <CheckCircle2 size={11} /> Email Dispatched
                        </span>
                        <span className="font-mono text-[9px] px-1 py-0.5 rounded bg-emerald-950 text-emerald-300">
                          {genLink.token}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(role.id, genLink.link)}
                          className="flex-1 py-1 px-2 rounded-lg bg-neutral-800 light:bg-[#2D3138] hover:bg-neutral-700 text-neutral-200 text-[10px] font-semibold flex items-center justify-center gap-1 transition-all"
                        >
                          {copiedRole === role.id ? (
                            <>
                              <Check size={11} className="text-emerald-400" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={11} /> Copy Link
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (emailPreviewModal) {
                              setEmailPreviewModal((prev) => prev ? { ...prev, isOpen: true } : null);
                            }
                          }}
                          className="py-1 px-2 rounded-lg bg-neutral-800 light:bg-[#2D3138] hover:bg-neutral-700 text-neutral-200 text-[10px] font-semibold flex items-center gap-1 transition-all"
                          title="Preview Branded Email"
                        >
                          <Eye size={11} className="text-[#df2531]" /> Preview
                        </button>
                        <Link
                          href={genLink.link}
                          target="_blank"
                          className="py-1 px-2 rounded-lg bg-[#df2531]/20 hover:bg-[#df2531]/30 text-[#df2531] border border-[#df2531]/40 text-[10px] font-bold flex items-center gap-1 transition-all"
                        >
                          <ExternalLink size={11} /> Open
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Switch to Detailed View Trigger */}
                  <button
                    type="button"
                    onClick={() => setSelectedRoleTab(role.id)}
                    className={cn(
                      "w-full text-center text-[10px] font-semibold pt-1 transition-colors flex items-center justify-center gap-1",
                      isSelected ? "text-[#df2531] font-bold" : "text-neutral-400 light:text-neutral-200 hover:text-white"
                    )}
                  >
                    <span>{isSelected ? "Active View Scopes" : "View Scopes & Matrix"}</span>
                    <ChevronRight size={11} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Role Deep Dive Matrix */}
        {(() => {
          const activeRole = roles.find((r) => r.id === selectedRoleTab) || roles[0];
          if (!activeRole) return null;

          return (
            <div className="space-y-4 pt-4 border-t border-neutral-800 light:border-[#2D3138]">
              <div className="p-4 rounded-xl bg-neutral-950 light:bg-[#4A505A] border border-neutral-800 light:border-[#2D3138] flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-mono uppercase text-[#df2531] font-bold font-display">
                    {activeRole.division}
                  </div>
                  <h3 className="text-lg font-bold text-white font-display">{activeRole.name}</h3>
                  <p className="text-xs text-neutral-300 light:text-neutral-100 mt-1 max-w-xl">{activeRole.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="px-3 py-1.5 rounded-lg bg-neutral-900 light:bg-[#2D3138] border border-neutral-700 text-xs font-mono text-neutral-200">
                    Role Key: <strong className="text-[#df2531]">{activeRole.id}</strong>
                  </div>
                  <Link
                    href={`/reset-password?role=${encodeURIComponent(activeRole.id)}&email=${encodeURIComponent(
                      roleEmails[activeRole.id] || ""
                    )}`}
                    className="px-3 py-1.5 rounded-lg bg-[#df2531]/20 border border-[#df2531]/40 text-xs font-bold text-[#df2531] hover:bg-[#df2531]/30 flex items-center gap-1.5 transition-all font-display"
                  >
                    <KeyRound size={13} />
                    Direct Reset Portal
                  </Link>
                </div>
              </div>

              {/* Matrix of Allowed Modules */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 light:text-neutral-200 mb-2 font-display">
                  Accessible Modules & Interfaces ({activeRole.allowedModules.length} Modules):
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {activeRole.allowedModules.map((mod) => (
                    <div
                      key={mod}
                      className="px-3 py-2 rounded-xl bg-neutral-950/80 light:bg-[#4A505A] border border-neutral-800 light:border-[#2D3138] text-xs font-medium text-white flex items-center gap-2"
                    >
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                      <span className="truncate">{mod}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Permission Capabilities Flags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-neutral-950/50 light:bg-[#4A505A] border border-neutral-800 light:border-[#2D3138] text-xs flex items-center justify-between">
                  <span className="text-neutral-300 light:text-neutral-100">Car Fleet Control</span>
                  {activeRole.permissions.canManageCars ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Unlock size={12} /> Granted
                    </span>
                  ) : (
                    <span className="text-neutral-400 light:text-neutral-300 flex items-center gap-1">
                      <Lock size={12} /> Restricted
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-neutral-950/50 light:bg-[#4A505A] border border-neutral-800 light:border-[#2D3138] text-xs flex items-center justify-between">
                  <span className="text-neutral-300 light:text-neutral-100">Heavy Machinery Control</span>
                  {activeRole.permissions.canManageMachinery ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Unlock size={12} /> Granted
                    </span>
                  ) : (
                    <span className="text-neutral-400 light:text-neutral-300 flex items-center gap-1">
                      <Lock size={12} /> Restricted
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-neutral-950/50 light:bg-[#4A505A] border border-neutral-800 light:border-[#2D3138] text-xs flex items-center justify-between">
                  <span className="text-neutral-300 light:text-neutral-100">Brokers & Commissions</span>
                  {activeRole.permissions.canManageBrokers ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Unlock size={12} /> Granted
                    </span>
                  ) : (
                    <span className="text-neutral-400 light:text-neutral-300 flex items-center gap-1">
                      <Lock size={12} /> Restricted
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-neutral-950/50 light:bg-[#4A505A] border border-neutral-800 light:border-[#2D3138] text-xs flex items-center justify-between">
                  <span className="text-neutral-300 light:text-neutral-100">Partners Onboarding</span>
                  {activeRole.permissions.canManagePartners ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Unlock size={12} /> Granted
                    </span>
                  ) : (
                    <span className="text-neutral-400 light:text-neutral-300 flex items-center gap-1">
                      <Lock size={12} /> Restricted
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-neutral-950/50 light:bg-[#4A505A] border border-neutral-800 light:border-[#2D3138] text-xs flex items-center justify-between">
                  <span className="text-neutral-300 light:text-neutral-100">Financial Ledger & Payouts</span>
                  {activeRole.permissions.canManageFinance ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Unlock size={12} /> Granted
                    </span>
                  ) : (
                    <span className="text-neutral-400 light:text-neutral-300 flex items-center gap-1">
                      <Lock size={12} /> Restricted
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-neutral-950/50 light:bg-[#4A505A] border border-neutral-800 light:border-[#2D3138] text-xs flex items-center justify-between">
                  <span className="text-neutral-300 light:text-neutral-100">Super-Admin RBAC Grant</span>
                  {activeRole.permissions.canManageRBAC ? (
                    <span className="text-[#df2531] font-black flex items-center gap-1 font-display">
                      <ShieldCheck size={12} /> Full Super
                    </span>
                  ) : (
                    <span className="text-neutral-400 light:text-neutral-300 flex items-center gap-1">
                      <Lock size={12} /> Restricted
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* SECTION 3: SYSTEM USERS ROSTER */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0a0a0a] light:bg-[#3A3F47] border border-neutral-800 space-y-4 shadow-xl font-sans card-dark-silver">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2 font-display section-heading">
              <Users size={18} className="text-[#df2531]" />
              Registered Platform Accounts & Permission Directory
            </h2>
            <p className="text-xs text-neutral-400 light:text-neutral-200 mt-0.5">
              Audit log of all registered accounts, assigned divisions, and verification approval states.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddUserModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#df2531]/25 transition-all font-display cursor-pointer active:scale-95"
            >
              <UserPlus size={13} />
              Add User
            </button>
            <span className="px-3 py-1.5 rounded-xl bg-neutral-900 light:bg-[#4A505A] border border-neutral-800 text-neutral-300 text-xs font-mono">
              Total Accounts: <strong className="text-white">{allUsers.length}</strong>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-neutral-800 light:border-[#2D3138] text-neutral-400 light:text-neutral-200 uppercase text-[10px] tracking-wider font-bold font-display">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Division Scope</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Credentials Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 light:divide-[#2D3138]">
              {allUsers.map((u) => {
                const isActive = u.status === "active";
                return (
                  <tr key={u.id} className="hover:bg-neutral-900/40 light:hover:bg-[#4A505A]/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-neutral-900 light:bg-[#2D3138] border border-[#df2531]/30 flex items-center justify-center text-[10px] text-[#df2531] font-display">
                          {u.fullName?.split(" ").map((n: string) => n[0]).join("")}
                        </div>
                        <span className="font-display">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-300 light:text-neutral-100">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase bg-neutral-900 light:bg-[#2D3138] text-neutral-200 border border-neutral-800 light:border-neutral-700">
                        {u.role?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#df2531] capitalize">
                      {u.assignedDivision || "All"}
                    </td>
                    <td className="py-3.5 px-4">
                      {isActive ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                          <CheckCircle2 size={10} /> Active & Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#df2531]/15 text-[#df2531] border border-[#df2531]/30 flex items-center gap-1 w-fit font-display">
                          <Clock size={10} /> Pending Approval
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right text-neutral-400 light:text-neutral-200 text-[11px]">
                      <div className="flex items-center justify-end gap-1.5">
                        {isActive ? (
                          <Link
                            href={`/reset-password?role=${encodeURIComponent(u.role)}&email=${encodeURIComponent(u.email)}`}
                            className="px-2.5 py-1 rounded-lg bg-neutral-900 light:bg-[#2D3138] hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-[10px] font-semibold flex items-center gap-1 transition-all"
                            title="Reset Password Portal"
                          >
                            <KeyRound size={11} className="text-[#df2531]" />
                            Reset Password
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleApprove(u.id, u.fullName)}
                            className="px-2.5 py-1 rounded-lg bg-[#df2531] hover:bg-[#c41e29] text-white font-bold text-[11px] shadow font-display cursor-pointer"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id, u.fullName)}
                          className="p-1.5 rounded-lg bg-neutral-900 light:bg-[#2D3138] hover:bg-rose-950/80 border border-neutral-700 hover:border-rose-600/50 text-neutral-400 hover:text-rose-400 text-[10px] font-semibold transition-all cursor-pointer"
                          title={`Delete ${u.fullName} account`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          ADD NEW PLATFORM USER MODAL
          ======================================================== */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn select-none font-sans">
          <div className="w-full max-w-md bg-[#0a0a0a] light:bg-[#3A3F47] border border-[#df2531]/40 rounded-3xl shadow-2xl overflow-hidden animate-scaleUp">
            <div className="px-5 py-4 border-b border-neutral-800 light:border-[#2D3138] flex items-center justify-between bg-black/60 light:bg-[#2D3138]/60">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#df2531]/15 text-[#df2531]">
                  <UserPlus size={16} />
                </span>
                <span className="font-bold text-white text-sm font-display">Add Platform Account</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1.5 rounded-xl bg-neutral-900 light:bg-[#2D3138] text-neutral-400 hover:text-white"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-300 light:text-neutral-200 uppercase font-bold block">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newUserData.fullName}
                  onChange={(e) => setNewUserData((prev) => ({ ...prev, fullName: e.target.value }))}
                  placeholder="e.g. Samuel Yosef"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 light:bg-white border border-neutral-700 light:border-neutral-300 focus:border-[#df2531] text-xs text-white light:text-neutral-900 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-300 light:text-neutral-200 uppercase font-bold block">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={(e) => setNewUserData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="name@delservices.et"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 light:bg-white border border-neutral-700 light:border-neutral-300 focus:border-[#df2531] text-xs text-white light:text-neutral-900 font-mono outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-300 light:text-neutral-200 uppercase font-bold block">
                    Role *
                  </label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => {
                      const selectedRole = e.target.value;
                      const div =
                        selectedRole === "elshaday_admin"
                          ? "elshaday"
                          : selectedRole === "liora_admin"
                          ? "liora"
                          : selectedRole === "dalol_admin"
                          ? "dalol"
                          : "all";
                      setNewUserData((prev) => ({
                        ...prev,
                        role: selectedRole,
                        assignedDivision: div,
                      }));
                    }}
                    className="w-full px-2.5 py-2 rounded-xl bg-neutral-900 light:bg-white border border-neutral-700 light:border-neutral-300 text-xs text-white light:text-neutral-900 outline-none"
                  >
                    <option value="head_dispatcher">Head Dispatcher</option>
                    <option value="elshaday_admin">Elshaday Admin</option>
                    <option value="liora_admin">Liora Admin</option>
                    <option value="dalol_admin">Dalol Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-300 light:text-neutral-200 uppercase font-bold block">
                    Assigned Division
                  </label>
                  <select
                    value={newUserData.assignedDivision}
                    onChange={(e) => setNewUserData((prev) => ({ ...prev, assignedDivision: e.target.value }))}
                    className="w-full px-2.5 py-2 rounded-xl bg-neutral-900 light:bg-white border border-neutral-700 light:border-neutral-300 text-xs text-white light:text-neutral-900 outline-none"
                  >
                    <option value="all">All Divisions</option>
                    <option value="elshaday">Elshaday Car Rental</option>
                    <option value="liora">Liora Heavy Machinery</option>
                    <option value="dalol">Dalol Logistics</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-300 light:text-neutral-200 uppercase font-bold block">
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  value={newUserData.phoneNumber}
                  onChange={(e) => setNewUserData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="+251 9..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 light:bg-white border border-neutral-700 light:border-neutral-300 text-xs text-white light:text-neutral-900 font-mono outline-none"
                />
              </div>

              <div className="pt-3 border-t border-neutral-800 light:border-[#2D3138] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 light:bg-[#2D3138] text-neutral-300 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-5 py-2 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white text-xs font-bold font-display shadow-md shadow-[#df2531]/30 cursor-pointer"
                >
                  {savingUser ? "Adding..." : "Add Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          BRANDED HTML EMAIL DISPATCH PREVIEW MODAL
          ======================================================== */}
      {emailPreviewModal && emailPreviewModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn select-none font-sans">
          <div className="w-full max-w-2xl max-h-[92vh] bg-[#0a0a0a] light:bg-[#3A3F47] border border-[#df2531]/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-neutral-800 light:border-[#2D3138] flex items-center justify-between bg-black/50 light:bg-[#2D3138]/60">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-black border border-[#df2531]/40 flex items-center justify-center p-1">
                  <img src="/del-logo.png" alt="DEL Services" className="h-full w-auto object-contain" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm font-display flex items-center gap-2">
                    Branded HTML Email Dispatch Inspector
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Dispatched to Recipient Inbox
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 light:text-neutral-200">
                    DEL Services Enterprise Communication System
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEmailPreviewModal(null)}
                className="p-1.5 rounded-xl bg-neutral-900 light:bg-[#2D3138] hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Email Meta Bar */}
            <div className="px-5 py-3 bg-neutral-950/80 light:bg-[#2D3138] border-b border-neutral-800 light:border-[#2D3138] text-xs space-y-1">
              <div className="flex items-center justify-between text-neutral-300 light:text-neutral-100 flex-wrap gap-1">
                <div>
                  <span className="text-neutral-500 light:text-neutral-300 font-semibold uppercase text-[10px]">To:</span>{" "}
                  <strong className="text-white font-mono">{emailPreviewModal.recipient}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 light:text-neutral-300 font-semibold uppercase text-[10px]">Token:</span>{" "}
                  <strong className="text-[#df2531] font-mono">{emailPreviewModal.token}</strong>
                </div>
              </div>
              <div className="text-neutral-300 light:text-neutral-100 truncate">
                <span className="text-neutral-500 light:text-neutral-300 font-semibold uppercase text-[10px]">Subject:</span>{" "}
                <strong className="text-white">{emailPreviewModal.emailSubject}</strong>
              </div>
            </div>

            {/* Live Rendered HTML Email Preview */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-black/90 light:bg-[#1E2125]">
              <div className="w-full bg-[#0a0a0a] border border-[#df2531]/30 rounded-2xl p-2 sm:p-4 overflow-hidden shadow-xl">
                <iframe
                  title="Branded Email Preview"
                  srcDoc={emailPreviewModal.emailHtml}
                  className="w-full h-[380px] sm:h-[420px] rounded-xl border-0 bg-black"
                />
              </div>
            </div>

            {/* Modal Action Bar */}
            <div className="px-5 py-3.5 bg-black/60 light:bg-[#2D3138] border-t border-neutral-800 light:border-[#2D3138] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-[11px] text-neutral-400 light:text-neutral-200">
                Email template formatted with high-contrast crimson accents & DEL wordmark.
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyEmailHtml}
                  className="px-3 py-2 rounded-xl bg-neutral-900 light:bg-[#4A505A] hover:bg-neutral-800 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  {copiedHtml ? (
                    <>
                      <Check size={13} className="text-emerald-400" /> Copied HTML!
                    </>
                  ) : (
                    <>
                      <Copy size={13} /> Copy HTML
                    </>
                  )}
                </button>
                <Link
                  href={emailPreviewModal.resetLink}
                  target="_blank"
                  className="px-4 py-2 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-[#df2531]/30 transition-all font-display"
                >
                  <ExternalLink size={13} />
                  Open Reset Portal
                </Link>
                <button
                  type="button"
                  onClick={() => setEmailPreviewModal(null)}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 light:bg-[#4A505A] hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
