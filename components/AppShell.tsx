"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppSidebar } from "./AppSidebar";
import { TopUtilityBar } from "./TopUtilityBar";
import { useTenant } from "@/context/TenantContext";

import { BrandLogoLoader } from "./BrandLogoLoader";
import { DelsBotWidget } from "./DelsBotWidget";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, authLoaded } = useTenant();
  const isLoginPage = pathname === "/login";
  const isStorefrontPage = pathname === "/";
  const isResetPasswordPage = pathname?.startsWith("/reset-password");
  const isPublicPage = isLoginPage || isStorefrontPage || isResetPasswordPage;

  useEffect(() => {
    if (!isPublicPage && authLoaded && !currentUser) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isPublicPage, authLoaded, currentUser, pathname, router]);

  if (isPublicPage) {
    return <div className="min-h-screen w-full bg-[#000000] text-slate-100">{children}</div>;
  }

  if (authLoaded && !currentUser) {
    return (
      <BrandLogoLoader
        fullScreen
        message="Authenticating access to DEL Services ERP..."
      />
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Collapsible Left Navigation Sidebar */}
      <AppSidebar />

      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Global Top Utility Bar */}
        <TopUtilityBar />

        {/* View Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#000000] dark:bg-[#000000] light:bg-slate-50 p-3.5 sm:p-4 lg:p-5 text-slate-100 transition-colors">
          {children}
        </main>
      </div>

      {/* Floating Bottom-Right Del's Bot AI Assistant & Voice Interface */}
      <DelsBotWidget />
    </div>
  );
}
