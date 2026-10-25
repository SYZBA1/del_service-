"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Truck,
  PlusCircle,
  ClipboardCheck,
  Wrench,
  ReceiptText,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Handshake,
  Briefcase,
  Car,
  HardHat,
  Sparkles,
  X,
  ExternalLink,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTenant } from "@/context/TenantContext";

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { activePhase, currentUser, isMobileSidebarOpen, closeMobileSidebar } = useTenant();

  const getNavGroups = () => {
    const role = currentUser?.role || "head_dispatcher";

    if (role === "elshaday_admin") {
      return [
        {
          group: "Operations",
          items: [
            { label: "Command Center", href: "/dashboard", icon: LayoutDashboard },
            { label: "Dispatch Gantt", href: "/dispatch/calendar", icon: CalendarDays },
            { label: "Bookings", href: "/bookings/new", icon: PlusCircle },
            { label: "Inspections", href: "/operations/inspect", icon: ClipboardCheck },
          ],
        },
        {
          group: "Asset Management",
          items: [
            { label: "Fleet Registry", href: "/assets", icon: Car },
            { label: "Drivers", href: "/operators", icon: UserCheck },
            { label: "Partners", href: "/partners", icon: Handshake },
            { label: "Brokers", href: "/brokers", icon: Briefcase },
          ],
        },
        {
          group: "Finance & Accounts",
          items: [
            { label: "Elshaday", href: "/finance/elshaday", icon: Car },
          ],
        },
      ];
    }

    if (role === "liora_admin") {
      return [
        {
          group: "Operations",
          items: [
            { label: "Command Center", href: "/dashboard", icon: LayoutDashboard },
            { label: "Dispatch Gantt", href: "/dispatch/calendar", icon: CalendarDays },
            { label: "Bookings", href: "/bookings/new", icon: PlusCircle },
            { label: "Inspections", href: "/operations/inspect", icon: ClipboardCheck },
          ],
        },
        {
          group: "Asset Management",
          items: [
            { label: "Fleet Registry", href: "/assets", icon: Truck },
            { label: "Certified Operators", href: "/operators", icon: UserCheck },
            { label: "Partners", href: "/partners", icon: Handshake },
            { label: "Brokers", href: "/brokers", icon: Briefcase },
            { label: "Maintenance", href: "/maintenance", icon: Wrench },
          ],
        },
        {
          group: "Finance & Accounts",
          items: [
            { label: "Liora", href: "/finance/liora", icon: HardHat },
          ],
        },
      ];
    }

    if (role === "dalol_admin") {
      return [
        {
          group: "Operations",
          items: [
            { label: "Command Center", href: "/dashboard", icon: LayoutDashboard },
            { label: "Bookings", href: "/bookings/new", icon: PlusCircle },
          ],
        },
        {
          group: "Asset Management",
          items: [
            { label: "Fleet Registry", href: "/assets", icon: Truck },
          ],
        },
        {
          group: "Finance & Accounts",
          items: [
            { label: "Dalol", href: "/finance/dalol", icon: Sparkles },
          ],
        },
      ];
    }

    // Default: Head Dispatcher (Full Super-Admin)
    return [
      {
        group: "Operations",
        items: [
          { label: "Command Center", href: "/dashboard", icon: LayoutDashboard },
          { label: "Dispatch Gantt", href: "/dispatch/calendar", icon: CalendarDays },
          { label: "Bookings", href: "/bookings/new", icon: PlusCircle },
          { label: "Inspections", href: "/operations/inspect", icon: ClipboardCheck },
        ],
      },
      {
        group: "Asset Management",
        items: [
          { label: "Fleet Registry", href: "/assets", icon: Truck },
          { label: "Certified Operators", href: "/operators", icon: UserCheck },
          { label: "Partners", href: "/partners", icon: Handshake },
          { label: "Brokers", href: "/brokers", icon: Briefcase },
          { label: "Maintenance", href: "/maintenance", icon: Wrench },
          { label: "Permissions", href: "/permissions", icon: Shield },
        ],
      },
      {
        group: "Finance & Divisions",
        items: [
          { label: "Elshaday", href: "/finance/elshaday", icon: Car },
          { label: "Liora", href: "/finance/liora", icon: HardHat },
          { label: "Dalol", href: "/finance/dalol", icon: Sparkles },
          { label: "Tax Ledger", href: "/finance/settlements", icon: ReceiptText },
        ],
      },
    ];
  };

  const navGroups = getNavGroups();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-black text-neutral-800 dark:text-neutral-300 select-none">
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-3.5">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 dark:bg-black/60 border border-[#df2531]/40 shadow-sm shadow-[#df2531]/20 p-1">
              <img src="/del-logo.png" alt="DEL Services" className="h-6 w-auto object-contain" />
            </div>
            <div className="font-display font-bold text-neutral-900 dark:text-white text-sm tracking-wider flex items-center gap-1.5">
              DEL SERVICES
              <span className="text-[9px] font-sans font-semibold uppercase px-1 py-0.2 rounded bg-[#df2531]/15 text-[#df2531] border border-[#df2531]/40">
                ET
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 dark:bg-black/60 border border-[#df2531]/40 p-1">
            <img src="/del-logo.png" alt="DEL" className="h-6 w-auto object-contain" />
          </div>
        )}

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex absolute -right-3 top-16 h-6 w-6 items-center justify-center rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-[#df2531] hover:text-white shadow-md z-40 transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={closeMobileSidebar}
          className="md:hidden p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {navGroups.map((group) => (
          <div key={group.group} className="space-y-0.5">
            {!collapsed && (
              <div className="px-2.5 text-[9px] font-bold uppercase tracking-wider text-[#4B5563] dark:text-neutral-500 mb-1">
                {group.group}
              </div>
            )}
            {group.items.map((item: any) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileSidebar}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all group",
                    isActive
                      ? "bg-[#df2531] text-white shadow-[0_0_12px_rgba(223,37,49,0.45)] border border-[#df2531]"
                      : "text-[#374151] dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#121212] hover:text-neutral-900 dark:hover:text-white"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    size={16}
                    className={cn(
                      "shrink-0 transition-colors",
                      isActive ? "text-white" : "text-[#4B5563] dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-200"
                    )}
                  />
                  {!collapsed && (
                    <div className="flex items-center justify-between flex-1 min-w-0">
                      <span className="truncate">{item.label}</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Public Storefront Shortcut Link */}
      {!collapsed && (
        <div className="mx-3 mb-2">
          <Link
            href="/"
            onClick={closeMobileSidebar}
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-100 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 hover:border-[#df2531]/40 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-all group"
          >
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#df2531] shadow-[0_0_8px_rgba(223,37,49,0.8)]" />
              Public Storefront
            </span>
            <ExternalLink size={12} className="text-neutral-400 group-hover:text-[#df2531]" />
          </Link>
        </div>
      )}

      {/* User Profile Badge */}
      {!collapsed && (
        <div className="mx-3 my-2 p-2.5 rounded-xl bg-neutral-100 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#df2531] to-[#7f1118] flex items-center justify-center font-bold text-white text-xs shadow-md shadow-[#df2531]/30">
              {currentUser?.fullName?.split(" ").map((n) => n[0]).join("") || "HD"}
            </div>
            <div className="text-left">
              <div className="font-bold text-neutral-900 dark:text-white text-xs truncate w-24">
                {currentUser?.fullName || "Head Dispatcher"}
              </div>
              <div className="text-[10px] text-[#df2531] font-medium truncate w-28">
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
          {currentUser?.role === "head_dispatcher" && (
            <Link
              href="/permissions"
              onClick={closeMobileSidebar}
              className="p-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-800 hover:bg-[#df2531]/20 text-neutral-700 dark:text-neutral-300 hover:text-[#df2531] transition-colors"
              title="Permissions & Roles"
            >
              <Shield size={14} />
            </Link>
          )}
        </div>
      )}

      {/* Ethiopian Rails System Footnote */}
      {!collapsed && (
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-400 space-y-1 bg-neutral-50 dark:bg-black">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-800 dark:text-neutral-300">Ethiopian Rails</span>
            <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>
          <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
            Fayda 2.0 • Telebirr • GiST Exclusion
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          "hidden md:flex relative flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-800 dark:text-neutral-300 transition-all duration-300 z-30 select-none shrink-0",
          collapsed ? "w-16" : "w-56"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer with Backdrop */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={closeMobileSidebar}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 border-r border-neutral-800">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
