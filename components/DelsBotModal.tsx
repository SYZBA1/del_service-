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
  Sparkles,
  Shield,
  Layers,
  ArrowRight,
  RotateCcw,
  Languages,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Cpu,
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { cn } from "@/lib/utils";
import { DelsVoiceVisualizer } from "./DelsVoiceVisualizer";
import { DelsBotMessage } from "@/lib/types";

interface DelsBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export function DelsBotModal({ isOpen, onClose, initialQuery }: DelsBotModalProps) {
  const { currentUser } = useTenant();
  const role = currentUser?.role || "head_dispatcher";

  const [language, setLanguage] = useState<'en' | 'am'>('en');
  const [messages, setMessages] = useState<DelsBotMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(true);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize initial welcome message tailored to the user's role
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      let welcomeEn = "";
      let welcomeAm = "";

      if (role === "elshaday_admin") {
        welcomeEn = "👋 Greetings Elshaday Admin! I am Del's Bot. My intelligence layer is strictly scoped to your Passenger Cars, 4x4 SUVs, Drivers, Per Diem, and Fuel. Ask me anything or speak hands-free!";
        welcomeAm = "👋 ሰላም የኤልሻዳይ ክፍል አስተዳዳሪ! እኔ ዴል ቦት ነኝ። መረጃዬ ለመንገደኞች መኪኖች፣ 4x4 ተሽከርካሪዎች፣ አሽከርካሪዎች እና ነዳጅ ብቻ የተወሰነ ነው። በማንኛውም ጊዜ ይጠይቁኝ!";
      } else if (role === "liora_admin") {
        welcomeEn = "👋 Greetings Liora Admin! I am Del's Bot. Scoped to Liora Heavy Construction Machinery, Excavators, Bulldozers, Certified Operators, and Engine Hours. Ready for your command!";
        welcomeAm = "👋 ሰላም የሊዮራ ክፍል አስተዳዳሪ! እኔ ዴል ቦት ነኝ። ለከባድ ኮንስትራክሽን ማሽነሪዎች፣ ኤክስካቫተሮች፣ ኦፕሬተሮች እና የስራ ሰዓት የተመደብኩ ረዳትዎ ነኝ። ምን ልርዳዎት?";
      } else if (role === "dalol_admin") {
        welcomeEn = "👋 Greetings Dalol Admin! I am Del's Bot. Scoped to Dalol's corporate holding status, strategic asset reserves, and active inter-company clearing processes.";
        welcomeAm = "👋 ሰላም የዳሎል ክፍል አስተዳዳሪ! እኔ ዴል ቦት ነኝ። የዳሎልን የሆልዲንግ ሁኔታ እና የኩባንያዎች የእርስ በእርስ ሂሳብ ማጣሪያ መረጃዎችን አቀርባለሁ።";
      } else {
        welcomeEn = "👋 Welcome Head Dispatcher Yonas Bekele! Del's Bot Super Admin Intelligence online. Full cross-divisional oversight active across Elshaday, Liora, Dalol, and 2merkato/EGP tender feeds.";
        welcomeAm = "👋 ሰላም ዋና ዲፓቸር ዮናስ በቀለ! ዴል ቦት ማዕከላዊ ኢንተለጀንስ ዝግጁ ነው። በኤልሻዳይ፣ ሊዮራ፣ ዳሎል እና ጨረታዎች ላይ ሙሉ ቁጥጥር አለኝ።";
      }

      const welcomeMsg: DelsBotMessage = {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        content: welcomeEn,
        contentAmharic: welcomeAm,
        language: 'en',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        roleScopedDivision: role === 'elshaday_admin' ? 'elshaday' : role === 'liora_admin' ? 'liora' : role === 'dalol_admin' ? 'dalol' : 'all',
      };
      setMessages([welcomeMsg]);

      // Speak welcome if not muted
      if (!isAudioMuted) {
        speakText(welcomeEn, 'en');
      }
    }
  }, [isOpen, role]);

  // Execute initialQuery if passed
  useEffect(() => {
    if (isOpen && initialQuery) {
      handleSendQuery(initialQuery);
    }
  }, [isOpen, initialQuery]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ----------------------------------------------------
  // SPEECH SYNTHESIS (TTS)
  // ----------------------------------------------------
  const speakText = (text: string, lang: 'en' | 'am') => {
    if (isAudioMuted || typeof window === "undefined" || !('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#`_\[\]()]/g, "").trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      if (lang === 'am') {
        utterance.lang = "am-ET";
      } else {
        utterance.lang = "en-US";
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setIsSpeaking(false);
    }
  };

  // ----------------------------------------------------
  // SPEECH RECOGNITION (Web Speech API with Fallback)
  // ----------------------------------------------------
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type your query.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'am' ? "am-ET" : "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleSendQuery(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn("Speech recognition initiation failed:", e);
      setIsListening(false);
    }
  };

  // ----------------------------------------------------
  // QUERY HANDLER & API CALL
  // ----------------------------------------------------
  const handleSendQuery = async (queryText?: string) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend || isProcessing) return;

    setInputText("");

    const userMsg: DelsBotMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: textToSend,
      language,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const res = await fetch("/api/v1/bot/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          role,
          language,
          division: currentUser?.assignedDivision || "all",
        }),
      });

      const json = await res.json();

      if (json.success && json.data) {
        const botData = json.data;
        const botMsg: DelsBotMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'bot',
          content: botData.answerEn,
          contentAmharic: botData.answerAm,
          language,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          roleScopedDivision: botData.roleScopedDivision,
          isRestricted: botData.isRestricted,
          metadata: {
            queriedStats: botData.stats,
          },
        };

        setMessages((prev) => [...prev, botMsg]);

        // Speak answer
        const speechContent = language === 'am' && botData.answerAm ? botData.answerAm : botData.answerEn;
        speakText(speechContent, language);
      } else {
        throw new Error(json.error || "Failed to get AI response");
      }
    } catch (error: any) {
      const errorMsg: DelsBotMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        content: `Error: Unable to process ERP query. ${error.message}`,
        language: 'en',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick Prompt Pills tailored to role
  const getSuggestedPrompts = () => {
    if (role === "elshaday_admin") {
      return [
        { en: "How many 4x4 Hiluxes are available in Elshaday?", am: "በኤልሻዳይ ስንት 4x4 ሃይሉክስ መኪኖች ዝግጁ ናቸው?" },
        { en: "What are our driver daily per-diem rates?", am: "የአሽከርካሪዎች ዕለታዊ የውሎ አበል ተመን ስንት ነው?" },
        { en: "Show Ethio Telecom & CBE car rental tenders", am: "የኢትዮ ቴሌኮም እና ንግድ ባንክ የመኪና ኪራይ ጨረታዎችን አሳየኝ" },
        { en: "What is our out-of-city fuel policy?", am: "ከአዲስ አበባ ውጭ የነዳጅ ፖሊሲያችን ምንድነው?" },
      ];
    }
    if (role === "liora_admin") {
      return [
        { en: "What is the status of our CAT 320D Excavator fleet?", am: "የCAT 320D ኤክስካቫተሮቻችን የስራ ዝግጁነት ሁኔታ ምንድነው?" },
        { en: "Show ERA highway and MIDROC quarry tenders", am: "የመንገዶች አስተዳደር እና ሚድሮክ የከባድ ማሽነሪ ጨረታዎችን አሳየኝ" },
        { en: "List certified operators with Special Mobile Machinery licenses", am: "የልዩ ተንቀሳቃሽ ማሽነሪ ፈቃድ ያላቸውን ኦፕሬተሮች ዘርዝር" },
        { en: "What is our engine hour overtime tariff?", am: "የማሽን የትርፍ ሰዓት (Overtime) ተመን ስንት ነው?" },
      ];
    }
    if (role === "dalol_admin") {
      return [
        { en: "What is Dalol's current corporate holding status?", am: "የዳሎል ሆልዲንግ ወቅታዊ ሁኔታ ምንድነው?" },
        { en: "Provide active inter-company clearing overview", am: "የኩባንያዎች የውስጥ ሂሳብ ማጣሪያ መረጃ ስጠኝ" },
      ];
    }
    // Head Dispatcher / Super Admin
    return [
      { en: "Give me a cross-division summary (Elshaday, Liora, Dalol)", am: "የኤልሻዳይ፣ ሊዮራ እና ዳሎል አጠቃላይ መረጃ ስጠኝ" },
      { en: "Show all high-match 2merkato and EGP tenders", am: "ሁሉንም ከፍተኛ ተዛማጅነት ያላቸው የ2merkato እና EGP ጨረታዎች አሳየኝ" },
      { en: "Are there any dispatch double-booking conflicts?", am: "የተደራረበ የዲፓች ግጭት (Double-booking) አለ?" },
      { en: "What is our total active fleet count across Ethiopia?", am: "በኢትዮጵያ አጠቃላይ ዝግጁ የሆኑ ተሽከርካሪዎችና ማሽኖች ስንት ናቸው?" },
    ];
  };

  const roleLabel =
    role === "elshaday_admin"
      ? "Elshaday Admin • Car Fleet Scoped"
      : role === "liora_admin"
      ? "Liora Admin • Machinery Scoped"
      : role === "dalol_admin"
      ? "Dalol Admin • Holding Scoped"
      : "Head Dispatcher • Full ERP Oversight";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl h-[90vh] max-h-[850px] flex flex-col rounded-3xl bg-[#09090b] border-2 border-[#df2531]/40 shadow-2xl shadow-[#df2531]/20 overflow-hidden text-white font-sans">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-black/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-900 border border-[#df2531] p-1.5 shadow-md shadow-[#df2531]/30">
              <img src="/del-logo.png" alt="Del's Bot" className="h-full w-auto object-contain" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#df2531] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#df2531]"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-base tracking-wide text-white flex items-center gap-1.5">
                  Del's Bot AI
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#df2531]/20 text-[#df2531] border border-[#df2531]/40 font-bold uppercase">
                    RAG & Voice v2.4
                  </span>
                </h2>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono flex items-center gap-1.5">
                <Shield size={11} className="text-emerald-400" />
                <span>{roleLabel}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Wave Visualizer Mode */}
            <button
              onClick={() => setShowVisualizer(!showVisualizer)}
              className={cn(
                "px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer",
                showVisualizer
                  ? "bg-[#df2531]/20 border-[#df2531] text-[#df2531]"
                  : "bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white"
              )}
              title="Toggle Voice Visualizer Wave"
            >
              <Cpu size={13} />
              <span className="hidden sm:inline">Voice Wave</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs font-mono font-bold transition-all cursor-pointer"
            >
              <Languages size={13} className="text-[#df2531]" />
              <span>{language === 'am' ? "🇪🇹 አማርኛ" : "🇺🇸 English"}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                if (typeof window !== "undefined" && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                onClose();
              }}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Area: Visualizer + Chat Thread */}
        <div className="flex-1 flex flex-col overflow-hidden bg-neutral-950/60 p-4 gap-4">
          {/* Animated Central Voice Waveform Visualizer */}
          {showVisualizer && (
            <div className="shrink-0 animate-fadeIn">
              <DelsVoiceVisualizer
                isListening={isListening}
                isSpeaking={isSpeaking}
                isProcessing={isProcessing}
                language={language}
                onToggleListening={toggleListening}
                onToggleLanguage={() => setLanguage(language === 'en' ? 'am' : 'en')}
                isAudioMuted={isAudioMuted}
                onToggleMute={() => setIsAudioMuted(!isAudioMuted)}
              />
            </div>
          )}

          {/* Chat Messages Thread */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 rounded-2xl bg-black/40 border border-neutral-800/80 p-4">
            {messages.map((m) => {
              const isBot = m.sender === 'bot';
              return (
                <div
                  key={m.id}
                  className={cn(
                    "flex flex-col gap-1 max-w-[88%]",
                    isBot ? "self-start items-start" : "self-end items-end ml-auto"
                  )}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono px-1">
                    {isBot ? (
                      <>
                        <span className="font-bold text-[#df2531]">DEL'S BOT</span>
                        <span>•</span>
                        <span>{m.timestamp}</span>
                        {m.roleScopedDivision && (
                          <span className="uppercase text-[9px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                            {m.roleScopedDivision}
                          </span>
                        )}
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
                      "p-3.5 rounded-2xl text-xs leading-relaxed transition-all shadow-md",
                      isBot
                        ? m.isRestricted
                          ? "bg-rose-950/40 border border-rose-600/70 text-rose-200"
                          : "bg-neutral-900 border border-neutral-700 text-neutral-200"
                        : "bg-[#df2531] text-white shadow-[#df2531]/30 font-medium"
                    )}
                  >
                    <div className="whitespace-pre-line">
                      {language === 'am' && m.contentAmharic ? m.contentAmharic : m.content}
                    </div>

                    {/* Dual language toggle inside bot message */}
                    {isBot && m.contentAmharic && (
                      <div className="mt-2.5 pt-2 border-t border-neutral-700/60 flex items-center justify-between text-[10px] text-neutral-400">
                        <button
                          onClick={() => {
                            const newLang = language === 'am' ? 'en' : 'am';
                            setLanguage(newLang);
                            const text = newLang === 'am' ? m.contentAmharic! : m.content;
                            speakText(text, newLang);
                          }}
                          className="flex items-center gap-1 text-[#df2531] hover:underline cursor-pointer font-bold"
                        >
                          <Languages size={11} />
                          <span>{language === 'am' ? "Read in English 🇺🇸" : "በአማርኛ አንብብ 🇪🇹"}</span>
                        </button>

                        <button
                          onClick={() => {
                            const text = language === 'am' && m.contentAmharic ? m.contentAmharic : m.content;
                            speakText(text, language);
                          }}
                          className="flex items-center gap-1 text-neutral-400 hover:text-white cursor-pointer"
                        >
                          <Volume2 size={11} />
                          <span>Voice Replay</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isProcessing && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-neutral-900/80 border border-neutral-700 text-xs text-neutral-300 self-start animate-pulse">
                <Sparkles size={14} className="text-[#df2531] animate-spin" />
                <span>Del's Bot RAG is querying ERP database & scraping tenders...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Role-Scoped Prompt Pills */}
          <div className="shrink-0 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {getSuggestedPrompts().map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendQuery(language === 'am' ? p.am : p.en)}
                className="shrink-0 px-3 py-1.5 rounded-full bg-neutral-900 hover:bg-[#df2531]/20 hover:border-[#df2531] border border-neutral-800 text-[11px] text-neutral-300 hover:text-white transition-all cursor-pointer truncate max-w-xs"
              >
                {language === 'am' ? p.am : p.en}
              </button>
            ))}
          </div>

          {/* Query Input Bar */}
          <div className="shrink-0 flex items-center gap-2 pt-1">
            <button
              onClick={toggleListening}
              className={cn(
                "p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-center shrink-0",
                isListening
                  ? "bg-[#df2531] text-white border-white animate-pulse shadow-lg shadow-[#df2531]/40"
                  : "bg-neutral-900 border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500"
              )}
              title={isListening ? "Listening... click to stop" : "Start speaking"}
            >
              {isListening ? <Mic size={18} className="animate-bounce" /> : <MicOff size={18} />}
            </button>

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
              placeholder={
                language === 'am'
                  ? "ዴል ቦትን ይጠይቁ (ተሽከርካሪ፣ ከባድ ማሽነሪ፣ ጨረታዎች፣ ነዳጅ)..."
                  : "Ask Del's Bot (Fleet status, Heavy machinery, Merkato & EGP tenders, Fuel)..."
              }
              className="flex-1 bg-black border border-neutral-700 focus:border-[#df2531] rounded-2xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none transition-all font-sans"
            />

            <button
              onClick={() => handleSendQuery()}
              disabled={!inputText.trim() || isProcessing}
              className="px-5 py-3 rounded-2xl bg-[#df2531] hover:bg-[#c41e29] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#df2531]/30 transition-all cursor-pointer shrink-0"
            >
              <span>Send</span>
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
