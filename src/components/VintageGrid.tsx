import React, { useState, useEffect } from "react";
import { VintageItem } from "../types";
import { 
  ShoppingBag, 
  Grid2X2, 
  ArrowUpDown,
  X, 
  Heart, 
  TrendingDown, 
  Truck, 
  ShieldCheck, 
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VintageGridProps {
  items: VintageItem[];
  onSelectItem: (item: VintageItem) => void;
  selectedBoothId: string | null;
  clearBoothFilter: () => void;
  wishlist?: string[];
  onToggleWishlist?: (itemId: string) => void;
  isWishlistView?: boolean;
}

// FitCheck Promotional Banners for Slider Carousel
const GABRIEL_BANNERS = [
  {
    id: 1,
    title: "FITCHECK ARCHIVAL SALE",
    subtitle: "Up to 50% Off Verified Single-Stitches, Aviators & Steerhide Leathers",
    badge: "Official Curated Stores",
    bg: "bg-gradient-to-r from-stone-900 to-amber-900",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80"
  },
  {
    id: 2,
    title: "FITCHECK EXPRESS DISPATCH",
    subtitle: "Fully Measured Flat-Fit Checked Items & Delivered globally within 24 Hours",
    badge: "Super Speed Courier",
    bg: "bg-gradient-to-r from-stone-800 to-stone-900",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80"
  },
  {
    id: 3,
    title: "KYOTO SILKS & SOUVENIRS",
    subtitle: "Hand-checked satin sukajans and Italian cashmere audited by certified archivists",
    badge: "Provenance Guaranteed",
    bg: "bg-gradient-to-r from-amber-950 via-stone-900 to-stone-950",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80"
  }
];

export default function VintageGrid({ 
  items, 
  onSelectItem, 
  selectedBoothId, 
  clearBoothFilter,
  wishlist = [],
  onToggleWishlist,
  isWishlistView = false
}: VintageGridProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedEra, setSelectedEra] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  
  // Showcase State for Customer Friendly Shopping Guide Walkthrough
  const [showShoppingGuide, setShowShoppingGuide] = useState(true);
  const [activeGuideStep, setActiveGuideStep] = useState<number | null>(null);

  // Rotating carousel banner index
  const [activeSlide, setActiveSlide] = useState(0);
  // Tick every minute so countdown strings stay fresh
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  // Auto rotate Gabriel promo slider
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % GABRIEL_BANNERS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const categories = ["All", "Outerwear", "Tops", "Bottoms", "Dresses"];
  const eras = ["All", "70s", "80s", "90s", "Y2K"];
  const locations = ["All", "London", "Tokyo", "Brooklyn", "Milan"];

  // Filter items matching Gabriel Sidebar selections
  const filteredItems = items.filter((item) => {
    const matchesBooth = selectedBoothId ? item.sellerId === selectedBoothId : true;
    const matchesCategory = selectedCategory === "All" ? true : item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesEra = selectedEra === "All" ? true : item.era.toLowerCase().includes(selectedEra.toLowerCase());
    const matchesLocation = selectedLocation === "All" ? true : item.marketName.toLowerCase().includes(selectedLocation.toLowerCase());

    return matchesBooth && matchesCategory && matchesEra && matchesLocation;
  });

  // Sorting
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "high-bid") {
      return b.currentBid - a.currentBid;
    }
    if (sortBy === "low-bid") {
      return a.currentBid - b.currentBid;
    }
    if (sortBy === "newest") {
      return b.id.localeCompare(a.id);
    }
    return 0; // Default
  });

  // Countdown calculations
  const getCountdownString = (endTimeStr: string) => {
    const diff = new Date(endTimeStr).getTime() - Date.now();
    if (diff <= 0) return "Auction Ended";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d left`;
    }
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m left`;
  };

  const checkIfEndingSoon = (endTimeStr: string): boolean => {
    const diff = new Date(endTimeStr).getTime() - Date.now();
    return diff > 0 && diff < 24 * 60 * 60 * 1000;
  };

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + GABRIEL_BANNERS.length) % GABRIEL_BANNERS.length);
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % GABRIEL_BANNERS.length);
  };

  // Safe user guidance helper triggers
  const guideStepsDetails = [
    {
      title: "How to Shop & Navigate Products",
      desc: "Use the 'Fashion Eras' or 'Categories' side buttons to drill down to specific years. Or type size tags like 'L' directly in the top Search bar. Under 'Market Stalls' at the header, you can shop items from certified boutique stalls individually!"
    },
    {
      title: "Real-time Bidding & Sledding",
      desc: "Tap any product card below. You will see historical logs of prior bidders, certified pit-to-pit flat measurements, and an interactive pricing form where you can submit real-time bids or opt for Buyout checkout. Everything is verified instantly."
    },
    {
      title: "Creating Accounts & Safe Credentials",
      desc: "Create your personal account by clicking 'My Account' -> 'Create Account'. Get instant cellular verification through simulated 6-digit Codes in the broadcast bar. Once verified, save components and track bids in your personal Vault!"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in" id="gabriel_vintage_grid">
      
      {/* Active Booth Filter Badge */}
      {selectedBoothId && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200 w-fit" id="active_booth_badge">
          <span className="text-xs font-sans font-bold text-jumia-orange flex items-center gap-1">
            <CheckCircleIcon />
            Stall Store Filtered: {items.find(i => i.sellerId === selectedBoothId)?.sellerName || "Selected Stall"}
          </span>
          <button 
            onClick={clearBoothFilter}
            className="p-1 hover:bg-amber-100/80 rounded text-stone-700 transition-colors cursor-pointer"
            title="Clear stall filter"
          >
            <X className="w-3.5 h-3.5 text-stone-850" />
          </button>
        </div>
      )}

      {/* Main Split Grid */}
      <div className={`grid gap-6 ${isWishlistView ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-4"}`}>

        {/* =======================================================
            DESKTOP-FIRST SIDEBAR CATEGORIES (hidden on wishlist view)
            ======================================================= */}
        {!isWishlistView && (
        <aside className="hidden lg:block bg-white border border-stone-200 rounded-xl shadow-sm p-4 space-y-6 h-fit" id="gabriel_sidebar_nav">
          
          {/* Categories list */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase font-extrabold text-[#111] tracking-wider flex items-center gap-1.5 pb-2 border-b border-stone-100">
              <span className="w-1.5 h-3.5 bg-jumia-orange rounded-sm block"></span>
              Department Shop
            </h3>
            <ul className="space-y-1 text-sm">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <li key={cat}>
                    <button
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left py-1.5 px-2.5 rounded transition-colors text-xs font-bold flex items-center justify-between cursor-pointer ${
                        isActive 
                          ? "bg-amber-50 text-jumia-orange" 
                          : "text-stone-700 hover:bg-stone-50 hover:text-stone-900"
                      }`}
                    >
                      <span>{cat === "All" ? "All Vintage Pieces" : cat}</span>
                      {isActive && <span className="w-1 h-3 bg-jumia-orange rounded"></span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Eras Filter */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase font-extrabold text-[#111] tracking-wider flex items-center gap-1.5 pb-2 border-b border-stone-100">
              <span className="w-1.5 h-3.5 bg-jumia-orange rounded-sm block"></span>
              Fashion Eras
            </h3>
            <ul className="space-y-1 text-sm">
              {eras.map((era) => {
                const isActive = selectedEra === era;
                return (
                  <li key={era}>
                    <button
                      onClick={() => setSelectedEra(era)}
                      className={`w-full text-left py-1.5 px-2.5 rounded transition-colors text-xs font-bold flex items-center justify-between cursor-pointer ${
                        isActive 
                          ? "bg-amber-50 text-jumia-orange" 
                          : "text-stone-700 hover:bg-stone-50 hover:text-stone-900"
                      }`}
                    >
                      <span>{era === "All" ? "All Eras" : `${era} Sourced`}</span>
                      {isActive && <span className="w-1 h-3 bg-jumia-orange rounded"></span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Fleamarket Sourcing Chest Locations */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase font-extrabold text-[#111] tracking-wider flex items-center gap-1.5 pb-2 border-b border-stone-100">
              <span className="w-1.5 h-3.5 bg-jumia-orange rounded-sm block"></span>
              Physical Sourcing Flea
            </h3>
            <ul className="space-y-1 text-sm">
              {locations.map((loc) => {
                const isActive = selectedLocation === loc;
                return (
                  <li key={loc}>
                    <button
                      onClick={() => setSelectedLocation(loc)}
                      className={`w-full text-left py-1.5 px-2.5 rounded transition-colors text-xs font-bold flex items-center justify-between cursor-pointer ${
                        isActive 
                          ? "bg-amber-50 text-jumia-orange" 
                          : "text-stone-700 hover:bg-stone-50 hover:text-stone-900"
                      }`}
                    >
                      <span>{loc === "All" ? "Global Hand-Picks" : `${loc} Chest`}</span>
                      {isActive && <span className="w-1 h-3 bg-jumia-orange rounded"></span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Safe Purchase Badges */}
          <div className="pt-4 border-t border-stone-200/80 space-y-3">
            <div className="flex gap-2.5 items-center text-stone-600 text-xs font-medium">
              <Truck className="w-5 h-5 text-jumia-orange shrink-0 animate-pulse" />
              <span>FitCheck Express Courier</span>
            </div>
            <div className="flex gap-2.5 items-center text-stone-600 text-xs font-medium">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>100% Insured Authenticated</span>
            </div>
          </div>

        </aside>
        )} {/* end !isWishlistView sidebar */}


        {/* =======================================================
            MAIN CONTENT AREA: Slider, Live Sales & Product Grid
            ======================================================= */}
        <div className={`space-y-6 ${isWishlistView ? "col-span-1" : "col-span-1 lg:col-span-3"}`}>

          {/* 1. Large Gabriel Promo Banner Carousel — hidden on wishlist view */}
          {!isWishlistView && (
          <div className="relative rounded-2xl overflow-hidden h-48 sm:h-72 shadow-sm border border-stone-200 flex" id="g_slider_carousel">
            <div className={`flex-1 ${GABRIEL_BANNERS[activeSlide].bg} text-white p-6 sm:p-12 flex flex-col justify-center relative overflow-hidden`}>
              
              {/* Highlight badge */}
              <span className="bg-stone-950/30 text-[#FFF] border border-white/20 text-[10px] uppercase font-bold tracking-widest py-1 px-3.5 rounded-full w-fit mb-3">
                {GABRIEL_BANNERS[activeSlide].badge}
              </span>

              <h2 className="text-xl sm:text-4xl font-extrabold tracking-tight leading-none uppercase drop-shadow text-[#FAF9F5]">
                {GABRIEL_BANNERS[activeSlide].title}
              </h2>
              
              <p className="text-xs sm:text-sm text-stone-200 mt-2 leading-snug max-w-sm sm:max-w-md drop-shadow-sm font-light">
                {GABRIEL_BANNERS[activeSlide].subtitle}
              </p>

              {/* Slider Action triggers */}
              <div className="flex gap-4 mt-4 sm:mt-6">
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedEra("All");
                    setSelectedLocation("All");
                  }}
                  className="px-5 py-2 sm:py-2.5 bg-[#FAF9F5] text-stone-900 border border-stone-200 font-bold rounded-lg text-xs hover:bg-stone-100 transition-all cursor-pointer shadow-sm uppercase tracking-wider"
                >
                  Explore Deals
                </button>
              </div>

              {/* Decorative Absolute image inside slider */}
              <div className="absolute right-0 top-0 bottom-0 w-2/5 hidden md:block">
                <img 
                  src={GABRIEL_BANNERS[activeSlide].image} 
                  alt="Promo background" 
                  className="w-full h-full object-cover opacity-75"
                />
                <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-stone-900/0 via-stone-900/80 to-stone-900"></div>
              </div>
            </div>

            {/* Slider Controls */}
            <button 
              onClick={handlePrevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-stone-950/40 text-stone-200 rounded-full hover:bg-stone-950 transition-all shrink-0 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-stone-950/40 text-stone-200 rounded-full hover:bg-stone-950 transition-all shrink-0 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Slider dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {GABRIEL_BANNERS.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`w-2 h-2 rounded-full ${activeSlide === idx ? "bg-jumia-orange scale-110" : "bg-white/40 hover:bg-white"}`}
                />
              ))}
            </div>
          </div>
          )} {/* end !isWishlistView carousel */}

          {/* =======================================================
              CRITICAL CUSTOMER FRIENDLY COMPANION & WALKTHROUGH GUIDE
              ======================================================= */}
          {!isWishlistView && (
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4" id="customer_walkthrough_hub">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-jumia-orange" />
                <h3 className="font-sans font-extrabold text-sm text-[#111] uppercase tracking-wider">
                  FitCheck Customer Guide & Walkthrough
                </h3>
              </div>
              <button
                onClick={() => setShowShoppingGuide(!showShoppingGuide)}
                className="text-xs text-stone-500 hover:text-stone-900 font-mono font-bold flex items-center gap-1 cursor-pointer"
              >
                {showShoppingGuide ? "Hide Companion Help [-]" : "Display Companion Help [+]"}
              </button>
            </div>

            <AnimatePresence>
              {showShoppingGuide && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-3 overflow-hidden text-xs"
                >
                  {guideStepsDetails.map((step, idx) => {
                    const isSelected = activeGuideStep === idx;
                    return (
                      <div 
                        key={idx}
                        onClick={() => setActiveGuideStep(isSelected ? null : idx)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected 
                            ? "bg-amber-50/50 border-jumia-orange shadow-sm scale-[1.01]" 
                            : "bg-[#FAF9F5] border-stone-200 hover:bg-white hover:border-stone-300"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-stone-900">
                          <span className="w-5 h-5 bg-jumia-orange text-white text-[10px] font-black rounded-full flex items-center justify-center font-mono">
                            {idx + 1}
                          </span>
                          <span>{step.title}</span>
                        </div>
                        <p className="text-stone-600 mt-2 leading-relaxed">
                          {step.desc}
                        </p>
                        <div className="text-[9px] text-jumia-orange font-bold uppercase mt-2 select-none">
                          {isSelected ? "Click to collapse guide" : "Click to highlight details"}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          )} {/* end !isWishlistView guide */}

          {/* Quick Department Filter (Phone scroller) — hidden on wishlist view */}
          {!isWishlistView && (
          <div className="lg:hidden bg-white p-3 border border-stone-200 rounded-lg shadow-sm space-y-2">
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Quick Sourcing Filter:</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat 
                      ? "bg-jumia-orange text-white" 
                      : "bg-stone-100 text-stone-700 hover:bg-stone-150"
                  }`}
                >
                  {cat === "All" ? "All Apparels" : cat}
                </button>
              ))}
            </div>
          </div>
          )} {/* end !isWishlistView mobile filter */}

          {/* 2. Gabriel Premium Sourced banner — hidden on wishlist view */}
          {!isWishlistView && (
          <div className="bg-[#1C1A17] text-[#FAF9F5] p-3.5 rounded-xl shadow-sm flex items-center justify-between flex-wrap gap-2 border border-stone-800" id="gabriel_flash_sale_ribbon">
            <div className="flex items-center gap-2 font-bold font-sans">
              <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-xs sm:text-sm uppercase tracking-wider">FITCHECK EXCLUSIVE COUTURE ARCHIVE — PHYSICAL PROVENANCE CERTIFIED</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="font-mono bg-stone-900 border border-stone-750 text-emerald-400 font-extrabold px-2.5 py-1 rounded text-[10px]">
                ORGANIC CURATED STOCK
              </span>
            </div>
          </div>
          )} {/* end !isWishlistView banner */}

          {/* Quick Filter Header bar */}
          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-stone-500 font-medium">
              Showing <strong className="text-stone-850 font-bold">{sortedItems.length}</strong> authenticated vintage pieces
              {(selectedCategory !== "All" || selectedEra !== "All" || selectedLocation !== "All") && (
                <button
                  onClick={() => { setSelectedCategory("All"); setSelectedEra("All"); setSelectedLocation("All"); }}
                  className="ml-2 text-jumia-orange hover:underline font-bold text-[10px] uppercase tracking-wide"
                >
                  Clear filters ✕
                </button>
              )}
            </div>
            
            {/* Sort Dropdown option */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" />
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#FAF9F5] border border-stone-250 p-1.5 rounded-md text-xs font-bold text-stone-800 outline-none cursor-pointer"
              >
                <option value="default">Most Relevant</option>
                <option value="low-bid">Price: Low to High</option>
                <option value="high-bid">Price: High to Low</option>
                <option value="newest">Newest Sourced</option>
              </select>
            </div>
          </div>

          {/* 3. Product grid listing */}
          <AnimatePresence mode="popLayout">
            {sortedItems.length > 0 ? (
              <motion.div 
                layout
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                id="vintage_clothing_cards_grid"
              >
                {sortedItems.map((item) => {
                  const countdown = getCountdownString(item.biddingEndsAt);
                  const isEndingSoon = checkIfEndingSoon(item.biddingEndsAt);
                  
                  // Calculate markup crossed-out price
                  const calcOriginalPrice = Math.floor((item.buyPrice || item.currentBid * 1.5) * 1.4);
                  // Percentage calculation
                  const percentageOff = Math.floor(((calcOriginalPrice - item.currentBid) / calcOriginalPrice) * 100);

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={item.id}
                      id={`item_card_${item.id}`}
                      onClick={() => onSelectItem(item)}
                      className="group bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer relative"
                    >
                      {/* Product image container */}
                      <div className="relative aspect-square overflow-hidden bg-stone-100 border-b border-stone-100">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transform duration-700 scale-100 group-hover:scale-105"
                        />

                        {/* Sold Stamp overlay */}
                        {item.isSold && (
                          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[1.5px] z-20 flex items-center justify-center transition-all duration-300">
                            <div className="border-[3px] border-red-500 text-red-500 font-mono text-sm tracking-widest font-black uppercase py-2 px-5 rounded-md -rotate-12 bg-white/95 shadow-2xl flex flex-col items-center select-none">
                              <span className="text-[8px] tracking-wider font-sans font-bold text-stone-500 leading-none mb-0.5">ARCHIVED</span>
                              <span className="leading-tight text-red-650 font-black text-base">SOLD</span>
                              <span className="text-[7px] font-sans font-semibold tracking-normal text-stone-400 leading-none">VAULT SECURED</span>
                            </div>
                          </div>
                        )}

                        {/* Top Overlays */}
                        {/* Delivery indicator */}
                        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
                          <span className="font-sans text-[8px] uppercase font-black tracking-wider bg-jumia-orange text-stone-900 px-2.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                            <Truck className="w-3 h-3 text-stone-900" />
                            G-EXPRESS
                          </span>
                          <span className="bg-stone-950 text-white text-[8px] font-mono tracking-widest font-extrabold px-1.5 py-0.5 rounded w-fit uppercase">
                            {item.era}
                          </span>
                        </div>

                        {/* Wishlist toggle button */}
                        <button
                          id={`wishlist_btn_${item.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onToggleWishlist) {
                              onToggleWishlist(item.id);
                            }
                          }}
                          className={`absolute top-2 right-2 p-1.5 rounded-full border shadow-sm transition-all duration-300 pointer-events-auto z-10 ${
                            wishlist.includes(item.id)
                              ? "bg-rose-50 border-rose-300 text-rose-500 scale-105"
                              : "bg-white border-stone-200 text-stone-450 hover:text-rose-500 hover:bg-rose-50/50"
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${wishlist.includes(item.id) ? "fill-rose-500 text-rose-500" : ""}`} />
                        </button>

                        {/* Rarity & stock indicator overlay */}
                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-sans font-bold shadow-sm bg-stone-900/80 text-white pointer-events-none z-10">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                          <span>1 of 1 Archive</span>
                        </div>

                        {/* Price drop tag */}
                        {item.bidDropped && (
                          <div className="absolute bottom-2 right-2 flex items-center gap-0.5 bg-teal-600 text-white px-2 py-1 rounded text-[9px] uppercase font-mono font-bold shadow-sm">
                            <TrendingDown className="w-2.5 h-2.5 animate-pulse" />
                            <span>Cut ↓</span>
                          </div>
                        )}
                      </div>

                      {/* Details specs */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1">
                          
                          {/* Stall detail */}
                          <div className="flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase tracking-tight">
                            <span>{item.sellerName}</span>
                            <span className="text-jumia-orange">• {item.category}</span>
                          </div>

                          {/* Product Title */}
                          <h3 className="font-sans text-xs text-stone-800 line-clamp-2 leading-snug group-hover:text-jumia-orange transition-colors font-bold">
                            {item.title}
                          </h3>

                          {/* Auction countdown */}
                          {!item.isSold && (
                            <div className={`flex items-center gap-1 text-[9px] font-mono font-bold pt-1 ${isEndingSoon ? "text-red-600 animate-pulse" : "text-stone-400"}`}>
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>{countdown}</span>
                            </div>
                          )}

                          {/* Dynamic rating based on bids */}
                          <div className="flex items-center gap-1 pt-1">
                            {(() => {
                              const score = item.bidsCount >= 10 ? 5 : item.bidsCount >= 5 ? 4 : item.bidsCount >= 2 ? 4 : 3;
                              const pct = item.bidsCount >= 10 ? "98%" : item.bidsCount >= 5 ? "95%" : item.bidsCount >= 2 ? "91%" : "87%";
                              return (
                                <>
                                  <div className="flex items-center text-amber-500">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star key={i} className={`w-3.5 h-3.5 ${i < score ? "fill-amber-400 text-amber-500" : "text-stone-300"}`} />
                                    ))}
                                  </div>
                                  <span className="text-[10px] text-stone-400 font-mono">({pct} positive)</span>
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Gabriel Pricing Layout */}
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between" id="jumia_pricing_card_row">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base font-black text-[#1C1A17] font-sans">
                                ₦{item.buyPrice || item.currentBid}
                              </span>
                              <span className="text-[9px] bg-[#FEF2E9] text-jumia-orange font-bold font-mono px-1.5 py-0.5 rounded">
                                {item.condition}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-stone-400 line-through">
                                ₦{calcOriginalPrice}
                              </span>
                              <span className="text-[10px] text-jumia-orange bg-orange-50 font-bold px-1 rounded">
                                -{percentageOff}%
                              </span>
                            </div>
                          </div>

                          {/* Size tag */}
                          <span className="text-[9px] font-bold text-stone-500 bg-stone-100 py-1 px-2 rounded-full uppercase">
                            size {item.size}
                          </span>
                        </div>

                        {/* Immediate secure buyout trigger */}
                        <button
                          onClick={(e) => { e.stopPropagation(); onSelectItem(item); }}
                          className="w-full bg-stone-900 hover:bg-stone-950 text-stone-100 hover:text-white py-2.5 rounded-lg font-extrabold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-jumia-orange" />
                          <span>Inspect / Buy Now</span>
                        </button>

                      </div>

                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-white border border-stone-200 rounded-2xl max-w-lg mx-auto"
                id="empty_search_alert"
              >
                <Grid2X2 className="w-12 h-12 text-stone-300 mx-auto mb-3 animate-pulse" />
                <h3 className="font-sans text-lg font-bold text-stone-950 uppercase">No archival catalog items match</h3>
                <p className="text-xs text-stone-500 mt-2 px-6 leading-relaxed">
                  Refine your current department filters or clear search query keyword. Only organic actual items are listed. No artificial bot items.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedEra("All");
                    setSelectedLocation("All");
                  }}
                  className="mt-6 inline-flex bg-jumia-orange text-white text-xs font-bold px-5 py-2.5 rounded-lg uppercase hover:bg-jumia-orange-hover transition-colors cursor-pointer"
                >
                  Reset Sourcing Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}

// Icon Components
function CheckCircleIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-jumia-orange inline shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}
