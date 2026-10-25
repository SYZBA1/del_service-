"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Car,
  Calendar,
  MapPin,
  Search,
  Star,
  Award,
  Users,
  ShieldCheck,
  Clock,
  Phone,
  Mail,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  FileText,
  Key,
  Sun,
  Moon,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Truck,
  Wrench,
  Fuel,
  Gauge,
  SlidersHorizontal,
  X,
  Layers,
  Check,
  LogIn,
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { cn } from "@/lib/utils";

export default function StorefrontHomePage() {
  const router = useRouter();
  const { theme, toggleTheme, currentUser } = useTenant();

  const handleProtectedAction = (targetPath: string) => {
    if (!currentUser) {
      router.push(`/login?redirect=${encodeURIComponent(targetPath)}`);
    } else {
      router.push(targetPath);
    }
  };

  // Category filter state
  const [activeCategory, setActiveCategory] = useState<"all" | "cars" | "machinery" | "attachments">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Contact & Direct Booking Modal State (Requirement 7)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedAssetForInquiry, setSelectedAssetForInquiry] = useState<string>("");
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryLocation, setInquiryLocation] = useState("Addis Ababa");
  const [inquiryDays, setInquiryDays] = useState("3");
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  const openContactModal = (assetName?: string) => {
    setSelectedAssetForInquiry(assetName || "General Fleet Inquiry");
    setInquirySubmitted(false);
    setIsContactModalOpen(true);
  };

  // Multi-Asset Slow Image Slider State & Slides (Requirement 6)
  const heroSlides = [
    {
      name: "Toyota Land Cruiser 300 V8",
      category: "Luxury 4x4 Expedition SUV",
      location: "Ready in Addis Ababa Yard",
      image: "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1200&q=80",
    },
    {
      name: "Caterpillar 320D Hydraulic Excavator",
      category: "Heavy Earthmoving Rig",
      location: "Adama Smart Bypass Corridor",
      image: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80",
    },
    {
      name: "Toyota Hilux GD-6 Double Cab",
      category: "Commercial 4WD Field Pickup",
      location: "Kality Logistics Hub",
      image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
    },
    {
      name: "SDLG 956L Heavy Wheel Loader",
      category: "5-Ton Quarry & Batching Loader",
      location: "Bole Central Depot",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    },
    {
      name: "Shantui SD22 Heavy Crawler Bulldozer",
      category: "235 HP Civil Earthworks Dozer",
      location: "Oromia Highway Station",
      image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  useEffect(() => {
    const sliderInterval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(sliderInterval);
  }, [heroSlides.length]);

  // Quick Booking Form State
  const [selectedLocation, setSelectedLocation] = useState("Bole Central Depot, Addis Ababa");
  const [pickupDate, setPickupDate] = useState("2026-03-01");
  const [returnDate, setReturnDate] = useState("2026-03-05");

  // Track scroll position for floating scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Promo Countdown Timer State
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 43,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Ethiopian Verified Fleet Catalog
  const fleetData = [
    {
      id: "ast-001",
      name: "Toyota Land Cruiser 300 V8",
      category: "cars",
      imageUrl: "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=800&q=80",
      specs: "Automatic • 7 Seats • 3.3L Twin Turbo Diesel • 4WD",
      priceEtb: "ETB 16,500",
      rateNumber: 16500,
      badge: "VIP Expedition",
      badgeColor: "bg-amber-500 text-black font-black",
      depot: "Bole Central Yard",
    },
    {
      id: "ast-002",
      name: "Toyota Hilux GD-6 Double Cab",
      category: "cars",
      imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
      specs: "Manual • 5 Seats • 2.8L Diesel • Heavy Field Offroad",
      priceEtb: "ETB 9,500",
      rateNumber: 9500,
      badge: "Field Pickup",
      badgeColor: "bg-blue-600 text-white font-bold",
      depot: "Kality Logistics Hub",
    },
    {
      id: "ast-003",
      name: "Caterpillar 320D Excavator",
      category: "machinery",
      imageUrl: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=800&q=80",
      specs: "21.8-Ton Operating Weight • 1.2 m³ Bucket • Aux Breaker Lines",
      priceEtb: "ETB 38,000",
      rateNumber: 38000,
      badge: "Heavy Earthmoving",
      badgeColor: "bg-amber-500 text-black font-black",
      depot: "Adama Smart Bypass",
    },
    {
      id: "ast-004",
      name: "Komatsu PC200-8 Excavator",
      category: "machinery",
      imageUrl: "https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=800&q=80",
      specs: "20.5-Ton Operating Weight • 1.0 m³ Bucket • Heavy Hydraulic Line",
      priceEtb: "ETB 36,000",
      rateNumber: 36000,
      badge: "Quarry Duty",
      badgeColor: "bg-orange-600 text-white font-bold",
      depot: "Hawassa Hub",
    },
    {
      id: "ast-005",
      name: "CAT H120Es Hydraulic Rock Breaker",
      category: "attachments",
      imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
      specs: "Attachment Linkage • High Pressure Two-Way Breaker Circuit",
      priceEtb: "ETB 12,000",
      rateNumber: 12000,
      badge: "Attachment",
      badgeColor: "bg-purple-600 text-white font-bold",
      depot: "Central Tool Vault",
    },
    {
      id: "ast-006",
      name: "Mercedes-Benz S-Class Maybach",
      category: "cars",
      imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80",
      specs: "Automatic • 4 Executive Seats • Chauffeur Driven VIP",
      priceEtb: "ETB 28,000",
      rateNumber: 28000,
      badge: "Presidential VIP",
      badgeColor: "bg-emerald-600 text-white font-bold",
      depot: "Bole Airport VIP",
    },
    {
      id: "ast-007",
      name: "SDLG 956L Heavy Wheel Loader",
      category: "machinery",
      imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
      specs: "5-Ton Rated Load • 3.0 m³ Aggregate Bucket • Pilot Joystick",
      priceEtb: "ETB 32,000",
      rateNumber: 32000,
      badge: "Batching Plant",
      badgeColor: "bg-amber-600 text-white font-bold",
      depot: "Central Yard",
    },
    {
      id: "ast-008",
      name: "Toyota Coaster Executive Minibus",
      category: "cars",
      imageUrl: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80",
      specs: "Manual • 28 Seats • Dual AC • Delegation Transfer",
      priceEtb: "ETB 14,000",
      rateNumber: 14000,
      badge: "Delegation Bus",
      badgeColor: "bg-blue-700 text-white font-bold",
      depot: "Kazanchis Super Hub",
    },
  ];

  const filteredFleet = fleetData.filter((item) => {
    if (activeCategory !== "all" && item.category !== activeCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.specs.toLowerCase().includes(q) ||
        item.depot.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div id="home" className="min-h-screen bg-[#000000] text-slate-100 flex flex-col font-sans transition-colors selection:bg-[#df2531] selection:text-white scroll-smooth">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#000000]/95 backdrop-blur-md border-b border-[#222222] px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors">
        {/* Brand Logo & Wordmark (Mokoto / Futuristic Geometric Display) */}
        <Link href="/" className="flex items-center gap-3 group" title="DEL Services">
          <div className="h-10 px-2 py-1 rounded-xl bg-black/60 flex items-center justify-center border border-[#df2531]/40 shadow-sm shadow-[#df2531]/20 group-hover:scale-105 transition-transform">
            <img src="/del-logo.png" alt="DEL Services" className="h-8 w-auto object-contain" />
          </div>
          <span className="font-display font-bold text-white text-base tracking-widest hidden sm:inline-block">
            DEL SERVICES
          </span>
        </Link>

        {/* Center Menu Links (Single-Word Crisp Labels & Balanced Spacing) */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-xs sm:text-sm font-semibold text-neutral-300">
          <button
            onClick={() => scrollToSection("home")}
            className="text-[#df2531] font-bold hover:text-[#df2531]/80 transition-colors cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => {
              setActiveCategory("all");
              scrollToSection("fleet");
            }}
            className="hover:text-[#df2531] transition-colors cursor-pointer"
          >
            Fleet
          </button>
          <button
            onClick={() => {
              setActiveCategory("machinery");
              scrollToSection("fleet");
            }}
            className="hover:text-[#df2531] transition-colors cursor-pointer"
          >
            Machinery
          </button>
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="hover:text-[#df2531] transition-colors cursor-pointer"
          >
            Services
          </button>
          <button
            onClick={() => openContactModal()}
            className="hover:text-[#df2531] transition-colors cursor-pointer"
          >
            Contact
          </button>
        </nav>

        {/* Right CTA Buttons & Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-[#0a0a0a] border border-neutral-800 hover:bg-[#121212] text-[#df2531] hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-sm"
            title={`Toggle ${theme === "dark" ? "Creamy Light" : "Dark"} Mode`}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Sign In Portal Link */}
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0a0a0a] border border-neutral-800 hover:border-[#df2531]/40 text-xs font-bold text-neutral-200 hover:text-white transition-all cursor-pointer"
          >
            <LogIn size={14} className="text-[#df2531]" />
            Sign In
          </Link>

          {/* Book Now Button (Direct Contact & Booking Modal per Requirement 7) */}
          <button
            type="button"
            onClick={() => openContactModal()}
            className="px-5 py-2 rounded-xl bg-[#df2531] hover:bg-[#df2531]/80 text-white font-bold text-xs sm:text-sm tracking-wide uppercase transition-all shadow-md shadow-[#df2531]/30 hover:shadow-[0_0_20px_rgba(223,37,49,0.5)] active:scale-95 cursor-pointer"
          >
            Book Now
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-10 pb-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Copy */}
          <div className="lg:col-span-7 space-y-4 text-left z-10">
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-[1.08]">
              RENT A CAR & HEAVY MACHINERY<br />
              <span className="text-[#df2531] drop-shadow-[0_0_25px_rgba(223,37,49,0.5)]">EASY, FAST & RELIABLE</span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 max-w-xl font-normal leading-relaxed">
              Wide selection of certified luxury 4x4 SUVs, sedans, and heavy construction equipment for your executive travel, safari expeditions, and infrastructure projects across Ethiopia.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a0a0a] border border-neutral-800 text-xs text-neutral-300">
                <CheckCircle2 size={13} className="text-[#df2531]" />
                100% Maintained Units
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a0a0a] border border-neutral-800 text-xs text-neutral-300">
                <CheckCircle2 size={13} className="text-[#df2531]" />
                Certified Drivers & Operators (ODR)
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a0a0a] border border-neutral-800 text-xs text-neutral-300">
                <CheckCircle2 size={13} className="text-[#df2531]" />
                Transparent Rates & No Hidden Fees
              </span>
            </div>
          </div>

          {/* Right Hero Multi-Asset Slow Image Slider */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="absolute -inset-4 bg-gradient-to-r from-[#df2531]/20 to-[#df2531]/5 blur-3xl rounded-full" />
            <div className="relative w-full aspect-[16/11] max-w-md lg:max-w-none rounded-2xl overflow-hidden border border-[#df2531]/30 shadow-2xl shadow-black/80">
              {heroSlides.map((slide, index) => (
                <div
                  key={slide.name}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                    index === currentHeroSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  )}
                >
                  <img
                    src={slide.image}
                    alt={slide.name}
                    className="w-full h-full object-cover transition-transform duration-1000 transform scale-100 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute top-3 left-3 z-20">
                    <span className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-[#df2531] font-bold text-[10px] uppercase tracking-wider border border-[#df2531]/40">
                      {slide.category}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs z-20">
                    <span className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-white font-bold border border-white/10">
                      {slide.name}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-[#df2531] text-white font-bold shadow-md shadow-[#df2531]/30">
                      {slide.location}
                    </span>
                  </div>
                </div>
              ))}

              {/* Slider Dots */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded-full backdrop-blur-sm">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentHeroSlide(idx)}
                    className={cn(
                      "h-1.5 rounded-full transition-all cursor-pointer",
                      idx === currentHeroSlide ? "w-5 bg-[#df2531]" : "w-1.5 bg-neutral-600 hover:bg-neutral-400"
                    )}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Quick Search Card */}
        <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-[#0a0a0a] border border-[#df2531]/25 shadow-2xl shadow-black/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              scrollToSection("fleet");
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-end"
          >
            {/* Pickup Location */}
            <div className="space-y-1 text-left">
              <label className="text-[11px] font-bold text-neutral-300 flex items-center gap-1.5">
                <MapPin size={13} className="text-[#df2531]" />
                Pickup Location / Yard Hub
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#df2531] cursor-pointer font-medium"
              >
                <option value="Bole Central Depot, Addis Ababa">Bole Central Depot, Addis Ababa</option>
                <option value="Kality Industrial Ring Logistics Park">Kality Industrial Ring Logistics Park</option>
                <option value="Kazanchis Super Host Hub">Kazanchis Super Host Hub</option>
                <option value="Bole International Airport (Terminal 2)">Bole International Airport (Terminal 2)</option>
                <option value="Hawassa Industrial Park Depot">Hawassa Industrial Park Depot</option>
                <option value="Adama Smart City Bypass Depot">Adama Smart City Bypass Depot</option>
              </select>
            </div>

            {/* Pickup Date */}
            <div className="space-y-1 text-left">
              <label className="text-[11px] font-bold text-neutral-300 flex items-center gap-1.5">
                <Calendar size={13} className="text-[#df2531]" />
                Pickup Date
              </label>
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#df2531]"
              />
            </div>

            {/* Return Date */}
            <div className="space-y-1 text-left">
              <label className="text-[11px] font-bold text-neutral-300 flex items-center gap-1.5">
                <Calendar size={13} className="text-[#df2531]" />
                Return Date
              </label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#df2531]"
              />
            </div>

            {/* Search Button */}
            <div>
              <button
                type="button"
                onClick={() => scrollToSection("fleet")}
                className="w-full py-2.5 px-4 rounded-xl bg-[#df2531] hover:bg-[#df2531]/80 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#df2531]/30 hover:shadow-[0_0_20px_rgba(223,37,49,0.5)] active:scale-95 cursor-pointer"
              >
                <Search size={15} />
                SEARCH FOR CARS & TOOLS
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 3. PROMO COUNTDOWN RIBBON */}
      {/* 3. PROMO COUNTDOWN BANNER */}
      <section id="promo" className="px-4 sm:px-8 max-w-7xl mx-auto w-full mb-12">
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0a0a0a] via-[#121212] to-[#0a0a0a] border border-[#df2531]/40 shadow-xl shadow-[#df2531]/10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Promo Badge */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-[#df2531] to-[#7f1118] flex flex-col items-center justify-center text-white font-black shadow-lg shadow-[#df2531]/30 shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-tight">DISCOUNT</span>
              <span className="text-xs uppercase font-extrabold -mt-1">UNTIL</span>
              <span className="text-xl sm:text-2xl font-black leading-none">30%</span>
            </div>
            <div className="text-left">
              <div className="font-display text-base sm:text-lg font-black text-white uppercase tracking-wide">
                SPECIAL PROMO TODAY!
              </div>
              <p className="text-xs text-neutral-300 mt-0.5">
                Rent a car & heavy machinery now and get a limited special discount!
              </p>
            </div>
          </div>

          {/* Middle Countdown Box */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-[#121212] border border-[#2A2A2A] flex items-center justify-center text-xl sm:text-2xl font-black text-[#df2531] shadow-inner font-mono">
                {String(timeLeft.hours).padStart(2, "0")}
              </div>
              <span className="text-[9px] uppercase font-bold text-neutral-400 mt-1">HOURS</span>
            </div>
            <span className="text-xl font-black text-[#df2531] pb-4">:</span>

            <div className="flex flex-col items-center">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-[#121212] border border-[#2A2A2A] flex items-center justify-center text-xl sm:text-2xl font-black text-[#df2531] shadow-inner font-mono">
                {String(timeLeft.minutes).padStart(2, "0")}
              </div>
              <span className="text-[9px] uppercase font-bold text-neutral-400 mt-1">MINUTES</span>
            </div>
            <span className="text-xl font-black text-[#df2531] pb-4">:</span>

            <div className="flex flex-col items-center">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-[#121212] border border-[#2A2A2A] flex items-center justify-center text-xl sm:text-2xl font-black text-[#df2531] shadow-inner font-mono">
                {String(timeLeft.seconds).padStart(2, "0")}
              </div>
              <span className="text-[9px] uppercase font-bold text-neutral-400 mt-1">SECONDS</span>
            </div>
          </div>

          {/* Right Button */}
          <button
            type="button"
            onClick={() => scrollToSection("fleet")}
            className="px-6 py-2.5 rounded-xl bg-[#df2531] hover:bg-[#df2531]/80 text-white font-bold text-xs sm:text-sm uppercase tracking-wide transition-all shadow-md shadow-[#df2531]/30 hover:shadow-[0_0_20px_rgba(223,37,49,0.5)] active:scale-95 shrink-0 cursor-pointer"
          >
            CLAIM PROMO
          </button>
        </div>
      </section>

      {/* 4. FOUR TRUST STAT CARDS */}
      <section className="px-4 sm:px-8 max-w-7xl mx-auto w-full mb-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#0A0A0A] border border-[#222222]">
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#121212] border border-[#202020]">
            <div className="h-11 w-11 rounded-xl bg-[#df2531]/15 border border-[#df2531]/30 flex items-center justify-center text-[#df2531] shrink-0">
              <Award size={22} />
            </div>
            <div className="text-left">
              <div className="font-display text-sm sm:text-base font-black text-white">10+ Years</div>
              <div className="text-[11px] text-neutral-400">Industry Experience</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#121212] border border-[#202020]">
            <div className="h-11 w-11 rounded-xl bg-[#df2531]/15 border border-[#df2531]/30 flex items-center justify-center text-[#df2531] shrink-0">
              <Users size={22} />
            </div>
            <div className="text-left">
              <div className="font-display text-sm sm:text-base font-black text-white">5,000+</div>
              <div className="text-[11px] text-neutral-400">Verified Clients</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#121212] border border-[#202020]">
            <div className="h-11 w-11 rounded-xl bg-[#df2531]/15 border border-[#df2531]/30 flex items-center justify-center text-[#df2531] shrink-0">
              <Car size={22} />
            </div>
            <div className="text-left">
              <div className="font-display text-sm sm:text-base font-black text-white">50+ Units</div>
              <div className="text-[11px] text-neutral-400">Heavy & Fleet Registry</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#121212] border border-[#202020]">
            <div className="h-11 w-11 rounded-xl bg-[#df2531]/15 border border-[#df2531]/30 flex items-center justify-center text-[#df2531] shrink-0">
              <Clock size={22} />
            </div>
            <div className="text-left">
              <div className="font-display text-sm sm:text-base font-black text-white">24/7 Support</div>
              <div className="text-[11px] text-neutral-400">Central Dispatch Desk</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. EXPLORE OUR CERTIFIED FLEET */}
      <section id="fleet" className="px-4 sm:px-8 max-w-7xl mx-auto w-full mb-16 text-center scroll-mt-20">
        <div className="space-y-2 mb-6">
          <h2 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
            EXPLORE OUR CERTIFIED FLEET
          </h2>
          <p className="text-xs text-neutral-400">
            Choose from executive SUVs, commercial 4x4 pickups, heavy construction excavators, and breaker attachments.
          </p>
          <div className="h-1 w-20 bg-[#df2531] mx-auto rounded-full mt-2 shadow-[0_0_10px_rgba(223,37,49,0.7)]" />
        </div>

        {/* Category Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveCategory("all")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                activeCategory === "all"
                  ? "bg-[#df2531] text-white border-[#df2531] shadow-md shadow-[#df2531]/30 font-black"
                  : "bg-[#0a0a0a] border-neutral-800 text-neutral-400 hover:text-white hover:bg-[#121212]"
              )}
            >
              All Fleet Units ({fleetData.length})
            </button>
            <button
              onClick={() => setActiveCategory("cars")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                activeCategory === "cars"
                  ? "bg-[#df2531] text-white border-[#df2531] shadow-md shadow-[#df2531]/30 font-black"
                  : "bg-[#0a0a0a] border-neutral-800 text-neutral-400 hover:text-white hover:bg-[#121212]"
              )}
            >
              Passenger Cars & 4x4 ({fleetData.filter(f => f.category === "cars").length})
            </button>
            <button
              onClick={() => setActiveCategory("machinery")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                activeCategory === "machinery"
                  ? "bg-[#df2531] text-white border-[#df2531] shadow-md shadow-[#df2531]/30 font-black"
                  : "bg-[#0a0a0a] border-neutral-800 text-neutral-400 hover:text-white hover:bg-[#121212]"
              )}
            >
              Heavy Construction Machinery ({fleetData.filter(f => f.category === "machinery").length})
            </button>
            <button
              onClick={() => setActiveCategory("attachments")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                activeCategory === "attachments"
                  ? "bg-[#df2531] text-white border-[#df2531] shadow-md shadow-[#df2531]/30 font-black"
                  : "bg-[#0a0a0a] border-neutral-800 text-neutral-400 hover:text-white hover:bg-[#121212]"
              )}
            >
              Breaker Attachments ({fleetData.filter(f => f.category === "attachments").length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by model, specs, depot..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#0a0a0a] border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#df2531]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Fleet Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredFleet.map((vehicle) => (
            <div
              key={vehicle.id}
              className="group relative rounded-2xl bg-[#0A0A0A] border border-[#222222] hover:border-[#df2531]/60 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-[#df2531]/15 text-left"
            >
              {/* Badge */}
              {vehicle.badge && (
                <div className="absolute top-3 left-3 z-20">
                  <span className={cn("px-2.5 py-0.5 rounded-lg text-[10px] tracking-wider uppercase shadow", vehicle.badgeColor)}>
                    {vehicle.badge}
                  </span>
                </div>
              )}

              {/* Card Image */}
              <div className="relative w-full aspect-[16/11] bg-gradient-to-b from-[#141414] to-[#0A0A0A] p-3 flex items-center justify-center overflow-hidden">
                <img
                  src={vehicle.imageUrl}
                  alt={vehicle.name}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white group-hover:text-[#df2531] transition-colors">
                    {vehicle.name}
                  </h3>
                  <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-2">
                    <span>{vehicle.specs}</span>
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-1 flex items-center gap-1 font-mono">
                    <MapPin size={11} className="text-[#df2531]" />
                    {vehicle.depot}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1F1F1F]">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display text-base font-black text-[#df2531]">
                      {vehicle.priceEtb}
                    </span>
                    <span className="text-[11px] text-neutral-400">/ day</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openContactModal(vehicle.name)}
                    className="mt-3 w-full py-2.5 rounded-xl bg-[#df2531] hover:bg-[#df2531]/80 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#df2531]/30 hover:shadow-[0_0_15px_rgba(223,37,49,0.45)] active:scale-95 cursor-pointer"
                  >
                    Book Now
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Fleet Registry Link (Opens Direct Contact Modal per Requirement 7) */}
        <div className="mt-10">
          <button
            type="button"
            onClick={() => openContactModal("Complete Fleet & Machinery Catalog Inquiry")}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0a0a0a] hover:bg-[#121212] border border-neutral-800 hover:border-[#df2531]/40 text-xs font-bold text-neutral-200 transition-all shadow cursor-pointer"
          >
            Open Fleet Registry & Polymorphic Catalog
            <ChevronRight size={14} className="text-[#df2531]" />
          </button>
        </div>
      </section>

      {/* 6. HOW TO RENT IN 5 SIMPLE STEPS */}
      <section id="how-it-works" className="px-4 sm:px-8 max-w-7xl mx-auto w-full mb-16 text-center scroll-mt-20">
        <div className="space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider font-display">
            HOW TO RENT IN 5 SIMPLE STEPS
          </h2>
          <p className="text-xs text-neutral-400">
            Streamlined Ethiopian rental dispatch workflow compliant with VeriFayda FIN and legal Guarantor verification.
          </p>
          <div className="h-1 w-20 bg-[#df2531] mx-auto rounded-full mt-2" />
        </div>

        {/* 5 Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-5 relative">
          <div className="flex flex-col items-center space-y-3 p-4 rounded-2xl bg-[#0a0a0a] border border-[#222222] hover:border-[#df2531]/40 transition-all">
            <div className="h-14 w-14 rounded-full bg-[#141414] border-2 border-[#df2531]/60 flex items-center justify-center text-[#df2531] shadow-lg shadow-[#df2531]/20">
              <Search size={22} />
            </div>
            <div className="font-bold text-sm text-white">1. Select Unit</div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Pick your vehicle, excavator, or auxiliary hydraulic breaker bundle
            </p>
          </div>

          <div className="flex flex-col items-center space-y-3 p-4 rounded-2xl bg-[#0a0a0a] border border-[#222222] hover:border-[#df2531]/40 transition-all">
            <div className="h-14 w-14 rounded-full bg-[#141414] border-2 border-[#df2531]/60 flex items-center justify-center text-[#df2531] shadow-lg shadow-[#df2531]/20">
              <Calendar size={22} />
            </div>
            <div className="font-bold text-sm text-white">2. Schedule Dates</div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Specify pickup date, return schedule, and operational location
            </p>
          </div>

          <div className="flex flex-col items-center space-y-3 p-4 rounded-2xl bg-[#0a0a0a] border border-[#222222] hover:border-[#df2531]/40 transition-all">
            <div className="h-14 w-14 rounded-full bg-[#141414] border-2 border-[#df2531]/60 flex items-center justify-center text-[#df2531] shadow-lg shadow-[#df2531]/20">
              <FileText size={22} />
            </div>
            <div className="font-bold text-sm text-white">3. KYC & Guarantor Vault</div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Instant Fayda FIN check, CPO deposit, or Third-Party Guarantor
            </p>
          </div>

          <div className="flex flex-col items-center space-y-3 p-4 rounded-2xl bg-[#0a0a0a] border border-[#222222] hover:border-[#df2531]/40 transition-all">
            <div className="h-14 w-14 rounded-full bg-[#141414] border-2 border-[#df2531]/60 flex items-center justify-center text-[#df2531] shadow-lg shadow-[#df2531]/20">
              <CheckCircle2 size={22} />
            </div>
            <div className="font-bold text-sm text-white">4. Dispatcher Sign-off</div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Validation by Head Dispatcher Yonas Bekele with 1-click clearance
            </p>
          </div>

          <div className="flex flex-col items-center space-y-3 p-4 rounded-2xl bg-[#0a0a0a] border border-[#222222] hover:border-[#df2531]/40 transition-all">
            <div className="h-14 w-14 rounded-full bg-[#141414] border-2 border-[#df2531]/60 flex items-center justify-center text-[#df2531] shadow-lg shadow-[#df2531]/20">
              <Key size={22} />
            </div>
            <div className="font-bold text-sm text-white">5. Ready for Dispatch!</div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Vehicle handover with 8-angle camera inspection and GPS tracking
            </p>
          </div>
        </div>
      </section>

      {/* 7. RATES, ETHIOPIAN TAX & CLIENT REVIEWS */}
      <section id="pricing" className="px-4 sm:px-8 max-w-7xl mx-auto w-full mb-16 scroll-mt-20">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider font-display">
            TRANSPARENT RATES & ETHIOPIAN TAX BREAKDOWN
          </h2>
          <p className="text-xs text-neutral-400">
            Clear daily quotes with automated Ethiopian 15% VAT and conditional 2% Withholding Tax calculations.
          </p>
          <div className="h-1 w-20 bg-[#df2531] mx-auto rounded-full mt-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-[#222222] hover:border-[#df2531]/40 transition-all space-y-3">
            <div className="text-[#df2531] font-bold text-sm font-display">Odometer KM Pricing</div>
            <div className="text-xs text-neutral-300">
              For executive sedans and 4x4 SUVs. Standard 200 KM daily allowance included with clear per-KM overtime billing.
            </div>
            <div className="pt-2 border-t border-[#1F1F1F] text-[11px] text-neutral-400">
              Starting from <strong className="text-white">ETB 9,500/day</strong>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-[#222222] hover:border-[#df2531]/40 transition-all space-y-3">
            <div className="text-[#df2531] font-bold text-sm font-display">Engine Hours & Low-bed Mobilization</div>
            <div className="text-xs text-neutral-300">
              For excavators and heavy earthmoving machinery. 8-hour daily cap, idle minimums, and flat mobilization transport.
            </div>
            <div className="pt-2 border-t border-[#1F1F1F] text-[11px] text-neutral-400">
              Starting from <strong className="text-white">ETB 32,000/day</strong>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-[#222222] hover:border-[#df2531]/40 transition-all space-y-3">
            <div className="text-[#df2531] font-bold text-sm font-display">Operator Per-Diem Allowance</div>
            <div className="text-xs text-neutral-300">
              Certified operators from the ODR registry. Includes daily base rate and regional per-diem for out-of-city assignments.
            </div>
            <div className="pt-2 border-t border-[#1F1F1F] text-[11px] text-neutral-400">
              Starting from <strong className="text-white">ETB 1,200/day per-diem</strong>
            </div>
          </div>
        </div>

        {/* Client Testimonials */}
        <div id="testimonials" className="scroll-mt-24">
          <div className="text-center space-y-2 mb-8">
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-display">
              WHAT OUR CLIENTS SAY
            </h3>
            <div className="h-0.5 w-14 bg-[#df2531] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-[#222222] hover:border-[#df2531]/40 transition-all space-y-4">
              <div className="flex items-center gap-1 text-[#df2531]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#df2531" />
                ))}
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed italic">
                &quot;The CAT 320D Excavator delivered to our Mojo-Hawassa expressway site within 6 hours. Certified operator was exceptionally skilled.&quot;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-[#1F1F1F]">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"
                  alt="Ato Tadesse Haile"
                  className="h-10 w-10 rounded-full object-cover border border-[#df2531]/40"
                />
                <div>
                  <div className="text-xs font-bold text-white">Ato Tadesse Haile</div>
                  <div className="text-[10px] text-neutral-400">MIDROC Construction Ethiopia</div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-[#222222] hover:border-[#df2531]/40 transition-all space-y-4">
              <div className="flex items-center gap-1 text-[#df2531]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#df2531" />
                ))}
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed italic">
                &quot;Flawless service for our diplomatic delegation. The Land Cruiser 300 V8 was brand new, immaculate, and VeriFayda KYC took under 5 minutes.&quot;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-[#1F1F1F]">
                <img
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80"
                  alt="W/ro Bethlehem Mengistu"
                  className="h-10 w-10 rounded-full object-cover border border-[#df2531]/40"
                />
                <div>
                  <div className="text-xs font-bold text-white">W/ro Bethlehem Mengistu</div>
                  <div className="text-[10px] text-neutral-400">Bole Subcity Corporate Delegation</div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-[#222222] hover:border-[#df2531]/40 transition-all space-y-4">
              <div className="flex items-center gap-1 text-[#df2531]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#df2531" />
                ))}
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed italic">
                &quot;The 8-angle check-out photo verification gave us complete confidence. No deposit disputes and full automated VAT invoices.&quot;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-[#1F1F1F]">
                <img
                  src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80"
                  alt="Samuel Girma"
                  className="h-10 w-10 rounded-full object-cover border border-[#df2531]/40"
                />
                <div>
                  <div className="text-xs font-bold text-white">Samuel Girma</div>
                  <div className="text-[10px] text-neutral-400">Shewa Expressway Logistics</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CRIMSON CTA BANNER */}
      <section id="about" className="px-4 sm:px-8 max-w-7xl mx-auto w-full mb-16 scroll-mt-20">
        <div className="relative rounded-2xl bg-gradient-to-r from-[#df2531] via-[#c41e29] to-[#8a131b] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-[#df2531]/30 border border-[#df2531]/50 overflow-hidden text-white">
          <div className="flex items-center gap-6 z-10 text-left">
            <div className="hidden sm:block h-20 w-32 rounded-xl overflow-hidden shrink-0 border-2 border-white/20 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80"
                alt="Luxury Fleet"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight font-display text-white">
                NEED A VEHICLE OR HEAVY MACHINERY TODAY?
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-white/90 mt-1">
                Reach out to our Addis Ababa Central Dispatch desk 24/7 or chat directly on WhatsApp!
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/251911223344"
            target="_blank"
            rel="noopener noreferrer"
            className="z-10 inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-black hover:bg-neutral-900 text-white font-extrabold text-xs sm:text-sm transition-all shadow-xl active:scale-95 shrink-0 border border-white/20"
          >
            <MessageSquare size={16} className="text-emerald-400" />
            Chat on WhatsApp
          </a>
        </div>
      </section>

      {/* 9. FOOTER (English) */}
      <footer id="contact" className="bg-[#000000] border-t border-[#1a1a1a] pt-12 pb-8 px-4 sm:px-8 text-neutral-400 text-xs scroll-mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-left">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 px-2 rounded-lg bg-transparent flex items-center justify-center border border-white/10">
                <img src="/del-logo.png" alt="DEL" className="h-5 w-auto object-contain" />
              </div>
              <span className="font-extrabold text-white text-base tracking-wider uppercase font-display">
                DEL SERVICES ET
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Ethiopia&apos;s premier multi-tenant vehicle & heavy machinery rental ERP and future P2P marketplace. Safe, reliable, and verified.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2.5">
            <div className="font-bold text-white text-xs uppercase tracking-wider font-display">NAVIGATION</div>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button onClick={() => scrollToSection("home")} className="hover:text-[#df2531] transition-colors cursor-pointer">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("fleet")} className="hover:text-[#df2531] transition-colors cursor-pointer">
                  Fleet Catalog
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("pricing")} className="hover:text-[#df2531] transition-colors cursor-pointer">
                  Rates & Quotes
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("how-it-works")} className="hover:text-[#df2531] transition-colors cursor-pointer">
                  How It Works
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleProtectedAction("/dashboard")}
                  className="text-[#df2531] font-bold hover:underline cursor-pointer"
                >
                  Dispatcher ERP Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2.5">
            <div className="font-bold text-white text-xs uppercase tracking-wider font-display">CONTACT DISPATCH</div>
            <ul className="space-y-2 text-[11px]">
              <li className="flex items-center gap-2">
                <Phone size={13} className="text-[#df2531]" />
                <span>+251 911 223 344 / +251 922 445 566</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={13} className="text-[#df2531]" />
                <span>dispatch@delservices.et</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={13} className="text-[#df2531] shrink-0 mt-0.5" />
                <span>Bole Medhanialem Central Depot, Addis Ababa, Ethiopia</span>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-2.5">
            <div className="font-bold text-white text-xs uppercase tracking-wider font-display">COMPLIANCE & HUBS</div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              VeriFayda FIN Verified • GiST Anti-Double-Booking Protection • 15% VAT Invoicing • CBE & Telebirr Integrated.
            </p>
            <div className="pt-2">
              <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                ● Central Addis Ababa Yard Live
              </span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#1C1C1C] text-center text-[10px] text-neutral-400">
          © 2026 DEL Services Ethiopia. All Rights Reserved. Full-Stack Multi-Tenant Rental ERP.
        </div>
      </footer>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-[#df2531] hover:bg-[#c41e29] text-white shadow-2xl shadow-[#df2531]/40 border border-[#df2531] transition-all transform hover:scale-110 active:scale-95 cursor-pointer animate-fadeIn"
          title="Scroll to top"
          aria-label="Scroll to top"
        >
          <ArrowUp size={18} strokeWidth={2.5} />
        </button>
      )}

      {/* 10. COMPANY CONTACT & DIRECT BOOKING MODAL (Requirement 7) */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-[#df2531]/30 rounded-2xl shadow-2xl p-6 sm:p-8 text-left space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#222222] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#df2531]">
                    DEL Services • Dispatch Desk
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-1 font-display">
                  Direct Booking &amp; Company Contact
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Connect immediately with our central dispatch team for reservations, site deliveries, and corporate contracts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsContactModalOpen(false)}
                className="p-1.5 rounded-xl bg-[#181818] text-neutral-400 hover:text-white hover:bg-[#242424] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contact Channels Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <a
                href="tel:+251911223344"
                className="p-3.5 rounded-xl bg-[#121212] border border-[#222222] hover:border-[#df2531]/50 flex items-center gap-3 transition-colors group cursor-pointer"
              >
                <div className="h-10 w-10 rounded-lg bg-[#df2531]/10 border border-[#df2531]/30 flex items-center justify-center text-[#df2531] shrink-0 group-hover:scale-105 transition-transform">
                  <Phone size={18} />
                </div>
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase font-semibold">24/7 Dispatch Hotline</div>
                  <div className="text-xs font-bold text-white group-hover:text-[#df2531] transition-colors font-mono">
                    +251 911 223 344
                  </div>
                </div>
              </a>

              <a
                href="tel:+251922445566"
                className="p-3.5 rounded-xl bg-[#121212] border border-[#222222] hover:border-[#df2531]/50 flex items-center gap-3 transition-colors group cursor-pointer"
              >
                <div className="h-10 w-10 rounded-lg bg-[#df2531]/10 border border-[#df2531]/30 flex items-center justify-center text-[#df2531] shrink-0 group-hover:scale-105 transition-transform">
                  <Phone size={18} />
                </div>
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase font-semibold">Corporate &amp; Machinery Line</div>
                  <div className="text-xs font-bold text-white group-hover:text-[#df2531] transition-colors font-mono">
                    +251 922 445 566
                  </div>
                </div>
              </a>

              <a
                href="mailto:dispatch@delservices.et"
                className="p-3.5 rounded-xl bg-[#121212] border border-[#222222] hover:border-[#df2531]/50 flex items-center gap-3 transition-colors group cursor-pointer"
              >
                <div className="h-10 w-10 rounded-lg bg-[#df2531]/10 border border-[#df2531]/30 flex items-center justify-center text-[#df2531] shrink-0 group-hover:scale-105 transition-transform">
                  <Mail size={18} />
                </div>
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase font-semibold">Official Email</div>
                  <div className="text-xs font-bold text-white group-hover:text-[#df2531] transition-colors font-mono">
                    dispatch@delservices.et
                  </div>
                </div>
              </a>

              <a
                href="https://wa.me/251911223344"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-xl bg-[#121212] border border-[#222222] hover:border-emerald-500/50 flex items-center gap-3 transition-colors group cursor-pointer"
              >
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase font-semibold">Instant WhatsApp Chat</div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors font-mono">
                    Chat with Dispatcher
                  </div>
                </div>
              </a>
            </div>

            {/* Physical Location & Operating Hours */}
            <div className="p-4 rounded-xl bg-[#121212] border border-[#202020] space-y-2 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-[#df2531] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Central Yard &amp; Depot:</span>{" "}
                  <span className="text-neutral-300">
                    Bole Sub-City, Wordea 03, Central Freight &amp; Fleet Depot (Near Bole Medhanialem), Addis Ababa, Ethiopia
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock size={16} className="text-[#df2531] shrink-0" />
                <div>
                  <span className="font-bold text-white">Operating Hours:</span>{" "}
                  <span className="text-neutral-300">
                    24 Hours / 7 Days a Week — Continuous Field Dispatch &amp; Roadside Support
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Inquiry Form */}
            <div className="space-y-3 pt-2 border-t border-[#222222]">
              <div className="font-bold text-white text-xs uppercase tracking-wider flex items-center justify-between font-display">
                <span>Quick Booking Inquiry</span>
                {selectedAssetForInquiry && (
                  <span className="text-[#df2531] font-mono text-[11px] normal-case">
                    Target: {selectedAssetForInquiry}
                  </span>
                )}
              </div>

              {inquirySubmitted ? (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-3">
                  <CheckCircle2 size={20} className="shrink-0 text-emerald-400" />
                  <div>
                    <div className="font-bold text-white">Inquiry Received!</div>
                    <div>Our central dispatcher will contact you within 15 minutes to confirm availability and dispatch options.</div>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setInquirySubmitted(true);
                  }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={inquiryName}
                        onChange={(e) => setInquiryName(e.target.value)}
                        placeholder="e.g. Solomon Bekele"
                        className="w-full px-3 py-2 rounded-xl bg-[#161616] border border-[#2A2A2A] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#df2531] focus:ring-1 focus:ring-[#df2531]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={inquiryPhone}
                        onChange={(e) => setInquiryPhone(e.target.value)}
                        placeholder="+251 9... / 09..."
                        className="w-full px-3 py-2 rounded-xl bg-[#161616] border border-[#2A2A2A] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#df2531] focus:ring-1 focus:ring-[#df2531] font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Project Site / Destination</label>
                      <input
                        type="text"
                        value={inquiryLocation}
                        onChange={(e) => setInquiryLocation(e.target.value)}
                        placeholder="Addis Ababa or Out-of-Addis corridor"
                        className="w-full px-3 py-2 rounded-xl bg-[#161616] border border-[#2A2A2A] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#df2531] focus:ring-1 focus:ring-[#df2531]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Duration (Days)</label>
                      <input
                        type="number"
                        min="1"
                        value={inquiryDays}
                        onChange={(e) => setInquiryDays(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#161616] border border-[#2A2A2A] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#df2531] focus:ring-1 focus:ring-[#df2531] font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <a
                      href={`https://wa.me/251911223344?text=${encodeURIComponent(
                        `Hello DEL Services, I would like to inquire about booking ${selectedAssetForInquiry || "a fleet unit"}. Name: ${inquiryName || "Client"}, Phone: ${inquiryPhone || "N/A"}, Location: ${inquiryLocation}, Days: ${inquiryDays}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#181818] border border-neutral-700 hover:border-emerald-500 text-xs font-bold text-emerald-400 hover:text-white transition-all cursor-pointer"
                    >
                      <MessageSquare size={14} />
                      Send via WhatsApp
                    </a>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#df2531] hover:bg-[#c41e29] text-white font-black font-display text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer shadow-[#df2531]/30"
                    >
                      Submit Direct Inquiry
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
