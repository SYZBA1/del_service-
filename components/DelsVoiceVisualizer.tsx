"use client";

import React, { useEffect, useState } from "react";
import { Mic, MicOff, Volume2, VolumeX, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface DelsVoiceVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  language: 'en' | 'am';
  onToggleListening: () => void;
  onToggleLanguage: () => void;
  isAudioMuted: boolean;
  onToggleMute: () => void;
}

export function DelsVoiceVisualizer({
  isListening,
  isSpeaking,
  isProcessing,
  language,
  onToggleListening,
  onToggleLanguage,
  isAudioMuted,
  onToggleMute,
}: DelsVoiceVisualizerProps) {
  // Animated wave bar heights
  const [waveHeights, setWaveHeights] = useState<number[]>([14, 28, 42, 20, 36, 18, 45, 24, 32, 16]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening || isSpeaking) {
      interval = setInterval(() => {
        setWaveHeights(
          Array.from({ length: 12 }, () => Math.floor(Math.random() * 42) + 10)
        );
      }, 120);
    } else {
      setWaveHeights([8, 12, 16, 12, 8, 14, 10, 8, 12, 10, 8, 14]);
    }
    return () => clearInterval(interval);
  }, [isListening, isSpeaking]);

  const statusTextEn = isListening
    ? "Listening... Speak in English or Amharic"
    : isSpeaking
    ? "Del's Bot is Speaking..."
    : isProcessing
    ? "Analyzing ERP Database & RAG Knowledge..."
    : "Standby • Click Mic or Press Space to Speak";

  const statusTextAm = isListening
    ? "እያደመጥኩ ነው... በእንግሊዝኛ ወይም በአማርኛ ይናገሩ"
    : isSpeaking
    ? "ዴል ቦት እየተናገረ ነው..."
    : isProcessing
    ? "የኢአርፒ መረጃን በመመርመር ላይ..."
    : "ዝግጁ • ለመናገር ማይኩን ይጫኑ";

  return (
    <div className="relative flex flex-col items-center justify-center py-6 px-4 select-none overflow-hidden rounded-2xl bg-gradient-to-b from-neutral-950 via-[#0d0708] to-black border border-[#df2531]/30 shadow-2xl">
      {/* Background ambient crimson glow */}
      <div
        className={cn(
          "absolute inset-0 bg-[#df2531]/5 transition-opacity duration-700 pointer-events-none",
          isListening || isSpeaking ? "opacity-100" : "opacity-30"
        )}
      />

      {/* Pulsing Concentric Circular Voice Waves (Visualizer) */}
      <div className="relative flex items-center justify-center w-48 h-48 sm:w-56 sm:h-56 my-2">
        {/* Ring 3 (Outer ripple wave) */}
        <div
          className={cn(
            "absolute inset-0 rounded-full border border-[#df2531]/20 transition-all duration-1000",
            (isListening || isSpeaking) && "animate-ping opacity-60 scale-110",
            !isListening && !isSpeaking && "opacity-20 scale-95"
          )}
          style={{ animationDuration: isSpeaking ? "1.8s" : "2.4s" }}
        />

        {/* Ring 2 (Mid pulsing wave) */}
        <div
          className={cn(
            "absolute inset-4 rounded-full border border-[#df2531]/40 bg-[#df2531]/5 transition-all duration-700",
            isListening && "scale-105 border-[#df2531] shadow-lg shadow-[#df2531]/20 animate-pulse",
            isSpeaking && "scale-105 border-emerald-500/70 shadow-lg shadow-emerald-500/20 animate-pulse",
            !isListening && !isSpeaking && "scale-100 opacity-40"
          )}
        />

        {/* Ring 1 (Inner audio wave border) */}
        <div
          className={cn(
            "absolute inset-8 rounded-full border border-[#df2531]/60 transition-transform duration-300",
            isListening && "scale-105 border-[#df2531]",
            isSpeaking && "scale-105 border-emerald-400"
          )}
        />

        {/* Central DEL Services Logo Core */}
        <div className="relative z-10 flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-b from-[#1c1c1e] to-[#0a0a0a] border-2 border-[#df2531] shadow-2xl shadow-[#df2531]/40 p-3 group">
          <img
            src="/del-logo.png"
            alt="DEL Services"
            className={cn(
              "w-14 h-14 sm:w-16 sm:h-16 object-contain filter drop-shadow-[0_0_12px_rgba(223,37,49,0.7)] transition-transform duration-500",
              (isListening || isSpeaking) && "scale-110",
              isListening && "rotate-3",
              isSpeaking && "-rotate-3"
            )}
          />

          {/* Audio Activity Status Dot */}
          <div className="absolute -bottom-1 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/90 border border-[#df2531]/50 text-[9px] font-mono font-bold text-white shadow-md">
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                isListening
                  ? "bg-[#df2531] animate-ping"
                  : isSpeaking
                  ? "bg-emerald-400 animate-ping"
                  : isProcessing
                  ? "bg-amber-400 animate-pulse"
                  : "bg-neutral-500"
              )}
            />
            <span className="uppercase tracking-wider">
              {isListening ? "Listening" : isSpeaking ? "Voice Out" : isProcessing ? "RAG AI" : "Standby"}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Audio Frequency EQ Waveform Bar Array */}
      <div className="flex items-center justify-center gap-1.5 h-12 w-full max-w-xs my-2">
        {waveHeights.map((h, i) => (
          <div
            key={i}
            className={cn(
              "w-1.5 rounded-full transition-all duration-100",
              isListening
                ? "bg-gradient-to-t from-[#df2531] to-rose-400 shadow-sm shadow-[#df2531]/50"
                : isSpeaking
                ? "bg-gradient-to-t from-emerald-600 to-emerald-300 shadow-sm shadow-emerald-400/50"
                : isProcessing
                ? "bg-amber-500/80 animate-pulse"
                : "bg-neutral-800"
            )}
            style={{
              height: `${isListening || isSpeaking ? h : 6}px`,
              transition: "height 0.1s ease-in-out",
            }}
          />
        ))}
      </div>

      {/* Dynamic Status Title */}
      <div className="text-center my-1">
        <p className="text-xs sm:text-sm font-display font-semibold text-white tracking-wide">
          {language === 'am' ? statusTextAm : statusTextEn}
        </p>
        <p className="text-[10px] text-neutral-400 font-sans mt-0.5">
          {language === 'am' ? "እንግሊዝኛ እና አማርኛ አቀላጥፎ ይናገራል" : "Fluent Dual Voice: English & Amharic (አማርኛ)"}
        </p>
      </div>

      {/* Voice Controls Toolbar */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-neutral-800/80 w-full justify-center">
        {/* Main Microphone Hands-Free Toggle */}
        <button
          onClick={onToggleListening}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer",
            isListening
              ? "bg-[#df2531] text-white shadow-[#df2531]/40 border border-white/20 animate-pulse"
              : "bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 hover:border-neutral-500"
          )}
          title="Toggle Continuous Voice Recognition"
        >
          {isListening ? <Mic size={15} className="animate-bounce" /> : <MicOff size={15} />}
          <span>{isListening ? "Stop Listening" : "Start Voice (ማይክሮፎን)"}</span>
        </button>

        {/* Language Switcher (EN / AM) */}
        <button
          onClick={onToggleLanguage}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-mono font-bold transition-all cursor-pointer"
          title="Switch Voice & Text Language"
        >
          <span>{language === 'am' ? "🇪🇹 አማርኛ" : "🇺🇸 English"}</span>
        </button>

        {/* Text-to-Speech Mute/Unmute */}
        <button
          onClick={onToggleMute}
          className={cn(
            "p-2 rounded-xl border transition-all cursor-pointer",
            isAudioMuted
              ? "bg-neutral-900 border-neutral-700 text-neutral-500 hover:text-neutral-300"
              : "bg-emerald-950/60 border-emerald-500/40 text-emerald-400"
          )}
          title={isAudioMuted ? "Unmute Bot Voice Speech" : "Mute Bot Voice Speech"}
        >
          {isAudioMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      </div>
    </div>
  );
}
