"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  X,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Plus,
  History,
  Minus,
  Maximize2,
  Minimize2,
  Trash2,
  Languages,
  Activity,
  AlertCircle,
  Sparkles,
  Shield,
  Clock,
  RotateCcw,
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { cn } from "@/lib/utils";
import { DelsVoiceVisualizer } from "./DelsVoiceVisualizer";
import { DelsBotMessage } from "@/lib/types";
import { isAmharicText } from "@/lib/dels-bot-engine";

interface ChatSession {
  id: string;
  title: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  messages: DelsBotMessage[];
}

const AMHARIC_INITIAL_GREETING = "ሰላም! እኔ ዴልስ ቦት ነኝ። ዛሬ በምን ልረዳዎት እችላለሁ?";
const ENGLISH_INITIAL_GREETING = "Hello! I am Del's Bot. How can I assist you today?";

export function DelsBotWidget() {
  const {
    currentUser,
    isDelsBotOpen,
    openDelsBot,
    closeDelsBot,
    delsBotInitialQuery,
    clearDelsBotInitialQuery,
  } = useTenant();

  const role = currentUser?.role || "head_dispatcher";

  // Widget Window State
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(false);

  // Chat Sessions & Active Session
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Voice & Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [detectedLang, setDetectedLang] = useState<'en' | 'am'>('am');

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Storage key scoped to user role
  const storageKey = `dels_bot_sessions_${role}`;

  // ----------------------------------------------------
  // INITIALIZE / LOAD SESSIONS FROM LOCALSTORAGE
  // ----------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed: ChatSession[] = JSON.parse(stored);
        if (parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to load chat sessions from localStorage:", e);
    }

    // Initialize with a fresh session and Amharic greeting
    createNewChatSession();
  }, [role]);

  // Persist sessions to localStorage
  const saveSessionsToStorage = (updatedSessions: ChatSession[]) => {
    setSessions(updatedSessions);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedSessions));
    } catch (e) {
      console.warn("Failed to persist sessions to localStorage:", e);
    }
  };

  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // ----------------------------------------------------
  // CREATE NEW CHAT SESSION (With Amharic Voice Greeting)
  // ----------------------------------------------------
  const createNewChatSession = () => {
    const newSessionId = `session-${Date.now()}`;
    const initialMsg: DelsBotMessage = {
      id: `msg-${Date.now()}`,
      sender: 'bot',
      content: ENGLISH_INITIAL_GREETING,
      contentAmharic: AMHARIC_INITIAL_GREETING,
      language: 'am',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      roleScopedDivision:
        role === 'elshaday_admin'
          ? 'elshaday'
          : role === 'liora_admin'
          ? 'liora'
          : role === 'dalol_admin'
          ? 'dalol'
          : 'all',
    };

    const newSession: ChatSession = {
      id: newSessionId,
      title: "New Conversation (አዲስ ውይይት)",
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [initialMsg],
    };

    const updated = [newSession, ...sessions.filter((s) => s.id !== newSessionId)];
    saveSessionsToStorage(updated);
    setActiveSessionId(newSessionId);
    setShowHistoryDrawer(false);

    // Speak initial Amharic Greeting when user opens voice/chat dialog
    if (!isAudioMuted && isDelsBotOpen) {
      speakText(AMHARIC_INITIAL_GREETING, 'am');
    }
  };

  // Switch chat session
  const selectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setShowHistoryDrawer(false);
  };

  // Delete chat session
  const deleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = sessions.filter((s) => s.id !== sessionId);
    if (filtered.length === 0) {
      createNewChatSession();
    } else {
      saveSessionsToStorage(filtered);
      if (activeSessionId === sessionId) {
        setActiveSessionId(filtered[0].id);
      }
    }
  };

  // Trigger initial query if passed via context
  useEffect(() => {
    if (isDelsBotOpen && delsBotInitialQuery) {
      handleSendQuery(delsBotInitialQuery);
      clearDelsBotInitialQuery();
    }
  }, [isDelsBotOpen, delsBotInitialQuery]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages]);

  // ----------------------------------------------------
  // ROBUST SPEECH SYNTHESIS (TTS)
  // ----------------------------------------------------
  const speakText = (text: string, lang: 'en' | 'am') => {
    if (isAudioMuted || typeof window === "undefined" || !('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#`_\[\]()]/g, "").trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Try selecting an Amharic voice or fallback
      const voices = window.speechSynthesis.getVoices();
      if (lang === 'am') {
        const amVoice = voices.find((v) => v.lang.startsWith("am") || v.lang.includes("ET"));
        if (amVoice) utterance.voice = amVoice;
        utterance.lang = "am-ET";
        utterance.rate = 0.95;
      } else {
        const enVoice = voices.find((v) => v.lang.startsWith("en"));
        if (enVoice) utterance.voice = enVoice;
        utterance.lang = "en-US";
        utterance.rate = 1.0;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        console.warn("Speech synthesis error:", e);
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis exception:", e);
      setIsSpeaking(false);
    }
  };

  const toggleMute = () => {
    setIsAudioMuted((prev) => {
      const next = !prev;
      if (next && typeof window !== "undefined" && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      return next;
    });
  };

  // ----------------------------------------------------
  // ROBUST SPEECH RECOGNITION (Error Handled & Auto-Recovered)
  // ----------------------------------------------------
  const toggleListening = () => {
    setVoiceError(null);

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore already stopped
        }
      }
      setIsListening(false);
      return;
    }

    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError("Voice recognition not supported in this browser. Please type your query.");
      return;
    }

    try {
      // Abort any existing instance
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      // Auto-listen with Amharic & English fallback
      recognition.lang = detectedLang === 'am' ? "am-ET" : "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
      };

      recognition.onresult = (event: any) => {
        if (event.results && event.results[0] && event.results[0][0]) {
          const transcript = event.results[0][0].transcript;
          if (transcript && transcript.trim().length > 0) {
            handleSendQuery(transcript.trim());
          }
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error event:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          setVoiceError("Microphone permission denied. Please allow microphone in browser.");
        } else if (event.error === "audio-capture") {
          setVoiceError("No microphone detected. Please check your audio hardware.");
        } else if (event.error === "no-speech") {
          // Normal timeout when silence, reset silently
          setVoiceError(null);
        } else {
          setVoiceError(`Voice input error (${event.error}). Please type below.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn("Failed to start speech recognition:", err);
      setIsListening(false);
      setVoiceError("Microphone error. Please click to retry or type your message.");
    }
  };

  // ----------------------------------------------------
  // SEND QUERY (Automatic Language Switching Amharic ↔ English)
  // ----------------------------------------------------
  const handleSendQuery = async (queryText?: string) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend || isProcessing) return;

    setInputText("");
    setVoiceError(null);

    // Auto-detect language (Amharic vs English)
    const isAmharicInput = isAmharicText(textToSend);
    const inputLang: 'en' | 'am' = isAmharicInput ? 'am' : 'en';
    setDetectedLang(inputLang);

    const userMsg: DelsBotMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: textToSend,
      language: inputLang,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Append to current session
    const updatedMessages = [...(currentSession?.messages || []), userMsg];
    const sessionTitle =
      currentSession.messages.length <= 1
        ? textToSend.slice(0, 32) + (textToSend.length > 32 ? "..." : "")
        : currentSession.title;

    const updatedSession: ChatSession = {
      ...currentSession,
      title: sessionTitle,
      updatedAt: new Date().toISOString(),
      messages: updatedMessages,
    };

    saveSessionsToStorage(
      sessions.map((s) => (s.id === currentSession.id ? updatedSession : s))
    );

    setIsProcessing(true);

    try {
      const res = await fetch("/api/v1/bot/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          role,
          language: inputLang,
        }),
      });

      const json = await res.json();

      if (json.success && json.data) {
        const answer = json.data.answer;
        const answerLang = json.data.language || inputLang;

        const botMsg: DelsBotMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'bot',
          content: answer,
          language: answerLang,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          roleScopedDivision: json.data.roleScopedDivision,
          isRestricted: json.data.isRestricted,
        };

        const finalMessages = [...updatedMessages, botMsg];
        const finalSession: ChatSession = {
          ...updatedSession,
          updatedAt: new Date().toISOString(),
          messages: finalMessages,
        };

        saveSessionsToStorage(
          sessions.map((s) => (s.id === currentSession.id ? finalSession : s))
        );

        // Auto-speak response in the matching language!
        speakText(answer, answerLang);
      } else {
        throw new Error(json.error || "Failed to process AI response");
      }
    } catch (error: any) {
      const errorMsg: DelsBotMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        content: `Connection error: ${error.message || "Failed to retrieve AI response."}`,
        language: 'en',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const finalMessages = [...updatedMessages, errorMsg];
      saveSessionsToStorage(
        sessions.map((s) => (s.id === currentSession.id ? { ...updatedSession, messages: finalMessages } : s))
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // If chatbot is completely closed, render the bottom-right gently bouncing circular DEL logo trigger
  if (!isDelsBotOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-40 select-none">
        <button
          onClick={() => {
            openDelsBot();
            setIsMinimized(false);
            // Play initial greeting on open
            if (!isAudioMuted && currentSession?.messages?.length <= 1) {
              speakText(AMHARIC_INITIAL_GREETING, 'am');
            }
          }}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-black via-[#141416] to-[#252528] border-2 border-[#df2531] shadow-2xl shadow-[#df2531]/40 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer animate-bounce"
          title="Del's Bot AI (Voice UI & Role-Scoped ERP Intelligence)"
          aria-label="Open Del's Bot AI Assistant"
        >
          {/* Subtle Ambient Pulse Ring */}
          <span className="absolute -inset-1 rounded-full bg-[#df2531]/20 animate-ping pointer-events-none" />

          {/* DEL Logo Emblem (NO EXTERNAL TEXT LABEL) */}
          <img
            src="/del-logo.png"
            alt="Del's Bot"
            className="h-7 w-auto object-contain filter drop-shadow-[0_0_8px_rgba(223,37,49,0.8)] group-hover:scale-110 transition-transform duration-300"
          />

          {/* Small Status Glow Dot */}
          <span className="absolute bottom-1 right-1 flex h-2.5 w-2.5">
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#df2531]"></span>
          </span>
        </button>
      </div>
    );
  }

  // If chatbot is minimized, render sleek compact bottom bar
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 p-2 px-3 rounded-2xl bg-[#09090b] border-2 border-[#df2531]/60 shadow-2xl shadow-[#df2531]/30 select-none animate-fadeIn text-white text-xs">
        <div
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90"
          title="Click to restore Del's Bot"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-neutral-900 border border-[#df2531] p-1">
            <img src="/del-logo.png" alt="Del's Bot" className="h-full w-auto object-contain" />
          </div>
          <div>
            <div className="font-display font-bold text-xs text-white">Del's Bot AI</div>
            <div className="text-[10px] text-neutral-400 font-mono">
              {isListening ? "🔴 Listening..." : isSpeaking ? "🔊 Speaking..." : "Session Active"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 ml-2 border-l border-neutral-800 pl-2">
          {/* Restore Button (32px × 32px) */}
          <button
            onClick={() => setIsMinimized(false)}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Restore Window"
          >
            <Maximize2 size={13} />
          </button>

          {/* Close Button (32px × 32px) */}
          <button
            onClick={closeDelsBot}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Close Del's Bot"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  // Full or Compact Widget Panel
  return (
    <div
      className={cn(
        "fixed z-50 transition-all duration-300 font-sans select-none flex flex-col rounded-3xl bg-[#09090b] border-2 border-[#df2531]/50 shadow-2xl shadow-[#df2531]/30 overflow-hidden text-white",
        isExpanded
          ? "inset-4 sm:inset-8 max-w-5xl max-h-[90vh] mx-auto my-auto"
          : "bottom-6 right-6 w-[92vw] sm:w-[420px] h-[590px] max-h-[85vh]"
      )}
    >
      {/* ---------------------------------------------------- */}
      {/* TOP HEADER: Window Controls & Title Inside Header    */}
      {/* ---------------------------------------------------- */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-black/90 shrink-0">
        {/* Left: Brand Emblem + Title & Scope Label */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 border border-[#df2531] p-1 shadow-md shadow-[#df2531]/30">
            <img src="/del-logo.png" alt="Del's Bot" className="h-full w-auto object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-sm tracking-wide text-white">Del's Bot AI</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#df2531]/20 text-[#df2531] border border-[#df2531]/40 uppercase font-bold">
                Voice &amp; ERP
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 font-mono flex items-center gap-1">
              <Shield size={10} className="text-emerald-400" />
              <span className="truncate max-w-[150px] sm:max-w-none">
                {role === "elshaday_admin"
                  ? "Elshaday Car Fleet"
                  : role === "liora_admin"
                  ? "Liora Heavy Machinery"
                  : role === "dalol_admin"
                  ? "Dalol Holding"
                  : "Head Dispatcher Full"}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Sleek 32px × 32px Icon-Only Action Buttons with Hover Tooltips */}
        <div className="flex items-center gap-1">
          {/* + New Chat (32px × 32px) */}
          <button
            onClick={createNewChatSession}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 hover:border hover:border-neutral-700 transition-colors cursor-pointer"
            title="Start New Chat (+ New Session)"
            aria-label="New Chat"
          >
            <Plus size={15} />
          </button>

          {/* Chat History Drawer (32px × 32px) */}
          <button
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer",
              showHistoryDrawer
                ? "bg-[#df2531]/20 text-[#df2531] border border-[#df2531]/40"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            )}
            title="Chat History Sessions"
            aria-label="Chat History"
          >
            <History size={14} />
          </button>

          {/* Toggle Voice Wave Visualizer (32px × 32px) */}
          <button
            onClick={() => setShowVisualizer(!showVisualizer)}
            className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer",
              showVisualizer
                ? "bg-[#df2531]/20 text-[#df2531] border border-[#df2531]/40"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            )}
            title="Toggle Voice Wave Visualizer"
            aria-label="Voice Waveform"
          >
            <Activity size={14} />
          </button>

          {/* Voice Mute / Unmute Audio Toggle (32px × 32px) */}
          <button
            onClick={toggleMute}
            className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer",
              isAudioMuted
                ? "bg-[#df2531]/20 text-[#df2531] border border-[#df2531]/40"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            )}
            title={isAudioMuted ? "Unmute Voice Audio (ድምፅ አብራ)" : "Mute Voice Audio (ድምፅ አጥፋ)"}
            aria-label={isAudioMuted ? "Unmute Voice Audio" : "Mute Voice Audio"}
          >
            {isAudioMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          {/* Minimize Window (—) (32px × 32px) */}
          <button
            onClick={() => setIsMinimized(true)}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Minimize Window"
            aria-label="Minimize"
          >
            <Minus size={15} />
          </button>

          {/* Restore Down / Expand Window (❐) (32px × 32px) */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title={isExpanded ? "Restore Down" : "Expand Window"}
            aria-label={isExpanded ? "Restore Down" : "Expand"}
          >
            {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>

          {/* Close Window (×) (32px × 32px) */}
          <button
            onClick={() => {
              if (typeof window !== "undefined" && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
              closeDelsBot();
            }}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Close Del's Bot"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* HISTORY SESSIONS DRAWER (Collapsible Dropdown)       */}
      {/* ---------------------------------------------------- */}
      {showHistoryDrawer && (
        <div className="border-b border-neutral-800 bg-black/95 p-3 space-y-2 max-h-56 overflow-y-auto animate-fadeIn shrink-0 text-xs">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-800 pb-1.5">
            <span>Past Chat Sessions ({sessions.length})</span>
            <button
              onClick={createNewChatSession}
              className="text-[#df2531] hover:underline flex items-center gap-1 font-sans cursor-pointer lowercase"
            >
              <Plus size={11} /> new chat
            </button>
          </div>
          <div className="space-y-1">
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => selectSession(s.id)}
                className={cn(
                  "flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer group",
                  s.id === activeSessionId
                    ? "bg-[#df2531]/15 text-white border border-[#df2531]/40"
                    : "hover:bg-neutral-900 text-neutral-300"
                )}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <Clock size={12} className="text-neutral-500 shrink-0" />
                  <span className="truncate font-medium">{s.title}</span>
                  <span className="text-[10px] text-neutral-500 font-mono">({s.messages.length})</span>
                </div>
                <button
                  onClick={(e) => deleteSession(s.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-rose-400 p-1 rounded transition-opacity cursor-pointer"
                  title="Delete Chat Session"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VOICE WAVE VISUALIZER (Optional Toggleable View)     */}
      {/* ---------------------------------------------------- */}
      {showVisualizer && (
        <div className="shrink-0 p-3 bg-neutral-950 border-b border-neutral-800/80 animate-fadeIn">
          <DelsVoiceVisualizer
            isListening={isListening}
            isSpeaking={isSpeaking}
            isProcessing={isProcessing}
            language={detectedLang}
            onToggleListening={toggleListening}
            onToggleLanguage={() => setDetectedLang(detectedLang === 'am' ? 'en' : 'am')}
            isAudioMuted={isAudioMuted}
            onToggleMute={() => setIsAudioMuted(!isAudioMuted)}
          />
        </div>
      )}

      {/* Voice Error Notice if mic error occurred */}
      {voiceError && (
        <div className="px-4 py-2 bg-rose-950/70 border-b border-rose-800 text-rose-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-rose-400 shrink-0" />
            <span>{voiceError}</span>
          </div>
          <button
            onClick={() => setVoiceError(null)}
            className="text-rose-400 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* CHAT MESSAGES THREAD                                 */}
      {/* ---------------------------------------------------- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-neutral-950/40">
        {currentSession?.messages?.map((m) => {
          const isBot = m.sender === 'bot';
          const isAmharic = m.language === 'am' || isAmharicText(m.content);

          return (
            <div
              key={m.id}
              className={cn(
                "flex flex-col gap-1 max-w-[90%]",
                isBot ? "self-start items-start" : "self-end items-end ml-auto"
              )}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono px-1">
                {isBot ? (
                  <>
                    <span className="font-bold text-[#df2531]">DEL'S BOT</span>
                    <span>•</span>
                    <span>{m.timestamp}</span>
                    <span className="text-[9px] px-1 rounded bg-neutral-800 text-neutral-400 border border-neutral-700 uppercase">
                      {isAmharic ? "አማርኛ" : "English"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-bold text-slate-300">YOU</span>
                    <span>•</span>
                    <span>{m.timestamp}</span>
                  </>
                )}
              </div>

              <div
                className={cn(
                  "p-3 rounded-2xl text-xs leading-relaxed transition-all shadow-md",
                  isBot
                    ? m.isRestricted
                      ? "bg-rose-950/40 border border-rose-600/70 text-rose-200"
                      : "bg-neutral-900 border border-neutral-800 text-neutral-200"
                    : "bg-[#df2531] text-white shadow-[#df2531]/30 font-medium"
                )}
              >
                <div className="whitespace-pre-line">
                  {m.contentAmharic && isAmharic ? m.contentAmharic : m.content}
                </div>

                {/* Voice Replay Button */}
                {isBot && (
                  <div className="mt-2 pt-1.5 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-400">
                    <button
                      onClick={() => speakText(m.contentAmharic && isAmharic ? m.contentAmharic : m.content, isAmharic ? 'am' : 'en')}
                      className="flex items-center gap-1 text-[#df2531] hover:underline cursor-pointer font-bold"
                      title="Replay Voice Speech"
                    >
                      <Volume2 size={11} />
                      <span>{isAmharic ? "ድምፅ አጫውት" : "Play Voice"}</span>
                    </button>
                    <span className="font-mono text-[9px] text-neutral-500">
                      Auto Language Match
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-300 self-start animate-pulse">
            <Sparkles size={13} className="text-[#df2531] animate-spin" />
            <span>Del's Bot AI is analyzing ERP database...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ---------------------------------------------------- */}
      {/* QUICK SUGGESTION PILLS                               */}
      {/* ---------------------------------------------------- */}
      <div className="shrink-0 px-3 py-1.5 bg-black/60 border-t border-neutral-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {role === "elshaday_admin" ? (
          <>
            <button
              onClick={() => handleSendQuery("የኤልሻዳይ 4x4 መኪኖች ስንት ናቸው?")}
              className="shrink-0 px-2.5 py-1 rounded-full bg-neutral-900 hover:bg-[#df2531]/20 border border-neutral-800 text-[11px] text-neutral-300 hover:text-white cursor-pointer"
            >
              የኤልሻዳይ 4x4 መኪኖች ስንት ናቸው?
            </button>
            <button
              onClick={() => handleSendQuery("What are our driver daily per-diem rates?")}
              className="shrink-0 px-2.5 py-1 rounded-full bg-neutral-900 hover:bg-[#df2531]/20 border border-neutral-800 text-[11px] text-neutral-300 hover:text-white cursor-pointer"
            >
              Driver daily per-diem rates
            </button>
            <button
              onClick={() => handleSendQuery("Show open car rental tenders from Ethio Telecom & CBE")}
              className="shrink-0 px-2.5 py-1 rounded-full bg-neutral-900 hover:bg-[#df2531]/20 border border-neutral-800 text-[11px] text-neutral-300 hover:text-white cursor-pointer"
            >
              Ethio Telecom car tenders
            </button>
          </>
        ) : role === "liora_admin" ? (
          <>
            <button
              onClick={() => handleSendQuery("የCAT 320D ኤክስካቫተሮቻችን የስራ ዝግጁነት ሁኔታ ምንድነው?")}
              className="shrink-0 px-2.5 py-1 rounded-full bg-neutral-900 hover:bg-[#df2531]/20 border border-neutral-800 text-[11px] text-neutral-300 hover:text-white cursor-pointer"
            >
              የCAT 320D ኤክስካቫተር ሁኔታ
            </button>
            <button
              onClick={() => handleSendQuery("Show ERA highway and MIDROC quarry tenders")}
              className="shrink-0 px-2.5 py-1 rounded-full bg-neutral-900 hover:bg-[#df2531]/20 border border-neutral-800 text-[11px] text-neutral-300 hover:text-white cursor-pointer"
            >
              ERA & MIDROC heavy tenders
            </button>
            <button
              onClick={() => handleSendQuery("List certified operators with Special Mobile Machinery licenses")}
              className="shrink-0 px-2.5 py-1 rounded-full bg-neutral-900 hover:bg-[#df2531]/20 border border-neutral-800 text-[11px] text-neutral-300 hover:text-white cursor-pointer"
            >
              Certified heavy machinery operators
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleSendQuery("የዛሬውን የ2merkato እና EGP ጨረታዎች አጠቃላይ መረጃ ስጠኝ")}
              className="shrink-0 px-2.5 py-1 rounded-full bg-neutral-900 hover:bg-[#df2531]/20 border border-neutral-800 text-[11px] text-neutral-300 hover:text-white cursor-pointer"
            >
              የዛሬው የጨረታዎች መረጃ (2merkato & EGP)
            </button>
            <button
              onClick={() => handleSendQuery("Give me a cross-division summary (Elshaday, Liora, Dalol)")}
              className="shrink-0 px-2.5 py-1 rounded-full bg-neutral-900 hover:bg-[#df2531]/20 border border-neutral-800 text-[11px] text-neutral-300 hover:text-white cursor-pointer"
            >
              Cross-division summary
            </button>
            <button
              onClick={() => handleSendQuery("Are there any dispatch double-booking conflicts?")}
              className="shrink-0 px-2.5 py-1 rounded-full bg-neutral-900 hover:bg-[#df2531]/20 border border-neutral-800 text-[11px] text-neutral-300 hover:text-white cursor-pointer"
            >
              Check dispatch conflicts
            </button>
          </>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* BOTTOM INPUT BAR: Voice Button + Text Input + Send  */}
      {/* ---------------------------------------------------- */}
      <div className="shrink-0 p-3 bg-black border-t border-neutral-800 flex items-center gap-2">
        {/* Voice Microphone Button (Fixed Speech Recognition Handler) */}
        <button
          onClick={toggleListening}
          className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 border",
            isListening
              ? "bg-[#df2531] text-white border-white animate-pulse shadow-lg shadow-[#df2531]/40"
              : "bg-neutral-900 border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500"
          )}
          title={isListening ? "Listening... click to stop" : "Speak hands-free in Amharic or English"}
          aria-label="Toggle Voice Input"
        >
          {isListening ? <Mic size={17} className="animate-bounce" /> : <MicOff size={17} />}
        </button>

        {/* Text Input with Automatic Language Switching */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendQuery();
            }
          }}
          placeholder="ይጻፉ ወይም ይናገሩ (Type or speak in Amharic / English)..."
          className="flex-1 bg-neutral-900 border border-neutral-800 focus:border-[#df2531] rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-all font-sans"
        />

        {/* Send Button */}
        <button
          onClick={() => handleSendQuery()}
          disabled={!inputText.trim() || isProcessing}
          className="h-10 px-3.5 rounded-xl bg-[#df2531] hover:bg-[#c41e29] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#df2531]/30 transition-all cursor-pointer shrink-0"
          title="Send query"
        >
          <Send size={13} />
        </button>
      </div>
    </div>
  );
}
