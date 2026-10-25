"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BrandLogoLoaderProps {
  fullScreen?: boolean;
  message?: string;
  size?: "sm" | "md" | "lg" | "inline";
  className?: string;
}

export function BrandLogoLoader({
  fullScreen = false,
  message = "Loading DEL Services Operating System...",
  size = "md",
  className,
}: BrandLogoLoaderProps) {
  const sizeMap = {
    inline: {
      container: "w-5 h-5",
      logo: "w-3.5 h-3.5",
      ring: "w-5 h-5",
      border: "border",
    },
    sm: {
      container: "w-10 h-10",
      logo: "w-6 h-6",
      ring: "w-10 h-10",
      border: "border-2",
    },
    md: {
      container: "w-16 h-16",
      logo: "w-9 h-9",
      ring: "w-16 h-16",
      border: "border-2",
    },
    lg: {
      container: "w-24 h-24",
      logo: "w-14 h-14",
      ring: "w-24 h-24",
      border: "border-3",
    },
  };

  const currentSize = sizeMap[size];

  const loaderElement = (
    <div className={cn("flex flex-col items-center justify-center gap-3.5 select-none", className)}>
      <div className={cn("relative flex items-center justify-center", currentSize.container)}>
        {/* Outer Rotating Crimson HUD Ring */}
        <div
          className={cn(
            "absolute inset-0 rounded-full border-t-[#df2531] border-r-[#df2531]/40 border-b-transparent border-l-[#df2531]/10 animate-spin",
            currentSize.border
          )}
          style={{ animationDuration: "1.2s" }}
        />

        {/* Counter-rotating subtle orbital ring */}
        <div
          className={cn(
            "absolute -inset-1 rounded-full border-b-[#df2531]/80 border-t-transparent border-l-transparent border-r-[#df2531]/20 animate-spin opacity-75",
            currentSize.border
          )}
          style={{ animationDuration: "2.4s", animationDirection: "reverse" }}
        />

        {/* Pulsing Red Ambient Backglow */}
        <div className="absolute inset-0 rounded-full bg-[#df2531]/20 blur-md animate-pulse" />

        {/* Central DEL Services Emblem */}
        <div className="relative z-10 flex items-center justify-center p-1 rounded-xl bg-black/90 border border-[#df2531]/40 shadow-lg shadow-[#df2531]/20">
          <img
            src="/del-logo.png"
            alt="DEL Services"
            className={cn("object-contain animate-pulse duration-1000", currentSize.logo)}
          />
        </div>
      </div>

      {/* Optional Status Message */}
      {message && size !== "inline" && (
        <div className="text-center space-y-1">
          <div className="text-xs font-bold text-white font-display tracking-wider uppercase flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#df2531] animate-ping" />
            {message}
          </div>
          <div className="text-[10px] text-neutral-400 font-sans tracking-wide">
            Enterprise Fleet & Machinery Operating System
          </div>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
        {loaderElement}
      </div>
    );
  }

  return loaderElement;
}
