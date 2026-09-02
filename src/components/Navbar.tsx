import React, { useState, useRef, useEffect } from "react";
import { 
  Search, 
  ShoppingBag, 
  Store, 
  Shirt, 
  User, 
  PlusCircle, 
  Heart, 
  Sparkles, 
  HelpCircle,
  CheckCircle,
  ShieldCheck,
  ChevronDown,
  Database,
  Lock,
  PhoneCall,
  Flame,
  Info,
  Tag,
  Clock,
  Sun,
  Moon
} from "lucide-react";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeBidCount: number;
  wishlistCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  userPhone?: string;
  userName?: string;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

const ALL_SUGGESTIONS = [
  { text: "Outerwear", type: "category" },
  { text: "Tops", type: "category" },
  { text: "Bottoms", type: "category" },
  { text: "Dresses", type: "category" },
  { text: "70s", type: "era" },
  { text: "80s", type: "era" },
  { text: "90s", type: "era" },
  { text: "Y2K", type: "era" },
  { text: "70s Rocker", type: "era" },
  { text: "80s Retro", type: "era" },
  { text: "90s Grunge", type: "era" },
  { text: "70s Boho-Chic", type: "era" },
  { text: "90s Minimalist", type: "era" },
  { text: "Y2K Gorpcore", type: "era" }
];

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  activeBidCount, 
  wishlistCount,
  searchQuery, 
  setSearchQuery,
  userEmail,
  setUserEmail,
  userPhone = "",
  userName = "Guest Customer",
  onOpenAuthModal,
  onLogout,
  isDarkMode = false,
  onToggleDarkMode
}: NavbarProps) {
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [emailInput, setEmailInput] = useState(userEmail);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Keep emailInput in sync when prop changes (e.g. after Google sign-in)
  useEffect(() => {
    setEmailInput(userEmail);
  }, [userEmail]);
  const suggestionsContainerRef = useRef<HTMLDivElement>(null);
  const accountDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsContainerRef.current && !suggestionsContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
        setShowAccountDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredSuggestions = searchQuery.trim() 
    ? ALL_SUGGESTIONS.filter(item => 
        item.text.toLowerCase().includes(searchQuery.toLowerCase()) &&
        item.text.toLowerCase() !== searchQuery.toLowerCase().trim()
      ).slice(0, 5) // Limit to top 5 suggestions
    : [];

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    if (currentTab !== "browse") {
      setCurrentTab("browse");
    }
  };

  const isAdmin = userEmail.trim().toLowerCase() === "nnanwubagabriel@gmail.com";

  const handleUpdateEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setUserEmail(emailInput);
    setShowAccountDropdown(false);
  };

  const logoutToGuest = () => {
    if (onLogout) {
      onLogout();
    } else {
      setEmailInput("guest@fitcheck.com");
      setUserEmail("guest@fitcheck.com");
    }
    setShowAccountDropdown(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full" id="gabriel_header_root">
      
      {/* 1. Thin top announcement bar styled in Gabriel Vintage charcoal */}
      <div className="bg-[#1C1A17] text-stone-200 text-[11px] font-sans py-1.5 px-4 sm:px-6 lg:px-8 border-b border-stone-800 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 font-bold text-jumia-orange">
            <span className="w-1.5 h-1.5 rounded-full bg-jumia-orange animate-ping"></span>
            FitCheck — Physical Provenance Guaranteed
          </span>
          {isAdmin && (
            <>
              <span className="hidden md:inline-block text-stone-700">|</span>
              <button 
                type="button"
                onClick={() => setCurrentTab("sell")} 
                className="hover:text-jumia-orange transition-colors flex items-center gap-1 font-medium cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-jumia-orange" />
                Curator Upload Lounge
              </button>
            </>
          )}
        </div>

        {/* Real-time curator email toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-stone-900 px-2.5 py-1 rounded border border-stone-800">
            <span className="text-stone-400">Account:</span>
            <span className={`font-mono font-bold ${isAdmin ? "text-emerald-400" : "text-stone-300"}`}>
              {userEmail || "Guest User"}
            </span>
            {isAdmin ? (
              <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 rounded-full font-bold uppercase ml-1 block">
                ⭐ Admin Curator
              </span>
            ) : (
              <span className="text-[9px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 rounded-full font-bold uppercase ml-1 block">
                ✓ Verified Customer
              </span>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-1">
            {isAdmin ? (
              <button 
                onClick={logoutToGuest}
                className="text-[10px] text-stone-400 hover:text-white bg-stone-800 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
              >
                Logout to Guest
              </button>
            ) : (
              <button 
                onClick={() => {
                  if (onOpenAuthModal) onOpenAuthModal();
                }}
                className="text-[10px] text-white hover:bg-jumia-orange bg-stone-700 px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main E-commerce Header in Gabriel Slate & White */}
      <div className="bg-white py-3.5 px-4 sm:px-6 lg:px-8 border-b border-stone-200/90 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* FitCheck Logo */}
          <div 
            onClick={() => {
              setCurrentTab("browse");
              setSearchQuery("");
            }}
            className="cursor-pointer group flex items-center gap-2 select-none"
            id="brand_logo_nav"
          >
            <div className="bg-jumia-orange text-white px-3.5 py-1.5 rounded-lg font-black tracking-tight text-xl sm:text-2xl font-sans flex items-center gap-0.5">
              Fit<span className="text-stone-900 font-serif italic font-bold">Check</span>
            </div>
            <span className="text-[8px] border-2 border-stone-900 px-1 py-0.5 rounded font-mono font-bold hidden xl:inline">VERIFIED VINTAGE</span>
          </div>

          {/* Central Search Input with Help placeholder */}
          <div ref={suggestionsContainerRef} className="w-full md:max-w-xl flex-1 flex relative" id="jumia_search_container">
            <div className="relative flex-1">
              <input
                type="text"
                aria-label="Search vintage garments"
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                  if (currentTab !== "browse" && currentTab !== "wishlist") {
                    setCurrentTab("browse");
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setShowSuggestions(false);
                    if (currentTab !== "browse") setCurrentTab("browse");
                  }
                  if (e.key === "Escape") {
                    setShowSuggestions(false);
                  }
                }}
                placeholder="Search single-stitches, leathers, eras or sizes..."
                className="w-full bg-[#FAF9F5] border-2 border-stone-200 focus:border-jumia-orange rounded-l-lg p-3 pl-10 text-sm font-sans outline-none transition-colors text-stone-900"
              />
              <Search className="absolute left-3 top-3.5 w-4.5 h-4.5 text-stone-400 pointer-events-none" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3.5 text-xs text-stone-400 hover:text-stone-930 font-mono font-bold"
                >
                  CLEAR
                </button>
              )}

              {/* Autocomplete suggestions dropdown panel */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div 
                  className="absolute left-0 right-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-lg overflow-hidden z-50 text-left" 
                  id="search_autocomplete_suggestions_list"
                >
                  <p className="text-[10px] font-mono text-stone-400 p-2.5 uppercase tracking-wider font-extrabold bg-stone-50 border-b border-stone-100">
                    Sourcing suggestions
                  </p>
                  <div className="divide-y divide-stone-100">
                    {filteredSuggestions.map((item) => (
                      <button
                        key={item.text}
                        type="button"
                        onClick={() => handleSelectSuggestion(item.text)}
                        className="w-full text-left py-2 px-3.5 hover:bg-stone-50 transition-colors flex items-center justify-between text-xs font-bold text-stone-800 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          {item.type === "category" ? (
                            <Tag className="w-3.5 h-3.5 text-jumia-orange shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          )}
                          <span>{item.text}</span>
                        </div>
                        <span className="text-[8px] text-stone-500 font-mono bg-stone-100 px-1.5 py-0.5 rounded uppercase">
                          {item.type}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button 
              onClick={() => {
                if (currentTab !== "browse") {
                  setCurrentTab("browse");
                }
              }}
              className="bg-jumia-orange hover:bg-[#D55F02] text-white text-xs font-bold uppercase tracking-wider px-6 rounded-r-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 animate-fade-in"
            >
              <Search className="w-4 h-4" />
              Filter
            </button>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-4 sm:gap-5 font-sans text-xs sm:text-sm font-medium" id="header_right_controls">
            
            {/* Account dropdown / SMS Sign Up trigger */}
            <div className="relative" ref={accountDropdownRef}>
              <button 
                onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                className="flex items-center gap-1 text-stone-800 hover:text-jumia-orange py-2 px-1 transition-colors cursor-pointer"
                id="account_dropdown_trigger"
              >
                <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-stone-900 font-bold text-xs uppercase border border-stone-200 shrink-0">
                  {userName ? userName.charAt(0) : "U"}
                </div>
                <span className="max-w-[100px] truncate">
                  {isAdmin ? "Hi, Gabriel" : userName ? `Hi, ${userName.split(" ")[0]}` : "My Account"}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform duration-300 ${showAccountDropdown ? "rotate-180" : ""}`} />
              </button>

              {showAccountDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-stone-200/95 py-4 px-4 text-[#313131] z-50 animate-fade-in" id="navbar_auth_dropdown">
                  <div className="pb-3 border-b border-stone-100 mb-3 space-y-1">
                    <p className="text-[10px] font-mono text-stone-400 uppercase tracking-wider font-extrabold">Active Customer Signature</p>
                    <p className="font-bold text-xs text-stone-800 break-all">{userName || "Guest Customer"}</p>
                    <p className="font-mono text-[10px] text-stone-500">{userEmail}</p>
                    {userPhone && (
                      <p className="font-mono text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 w-fit flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                         Phone: {userPhone}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Trigger AuthModal button */}
                    <button
                      onClick={() => {
                        setShowAccountDropdown(false);
                        if (onOpenAuthModal) onOpenAuthModal();
                      }}
                      className="w-full py-2 bg-jumia-orange hover:bg-jumia-orange-hover text-white text-center rounded text-xs font-bold transition-all uppercase tracking-wide cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <User className="w-3.5 h-3.5" />
                      Create/Connect Account
                    </button>

                    <div className="pt-2 border-t border-stone-100 space-y-2">
                      <button 
                        onClick={logoutToGuest}
                        className="w-full text-center py-1.5 text-[10px] text-stone-500 hover:text-stone-900 font-mono font-bold"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode toggle icon button */}
            {onToggleDarkMode && (
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="p-2 hover:bg-stone-100 rounded-lg text-stone-700 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                title={isDarkMode ? "Switch to Light Aesthetic" : "Switch to Dark Aesthetic"}
                id="toggle_dark_mode_theme_btn"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : (
                  <Moon className="w-5 h-5 text-stone-600" />
                )}
              </button>
            )}

            {/* Wishlist Link */}
            <button 
              onClick={() => setCurrentTab("wishlist")}
              className={`flex items-center gap-1.5 relative px-2.5 py-1.5 rounded-lg transition-all ${
                currentTab === "wishlist" ? "bg-stone-100 text-jumia-orange" : "text-stone-850 hover:text-jumia-orange"
              }`}
            >
              <Heart className={`w-5 h-5 ${currentTab === "wishlist" ? "fill-rose-500 text-rose-500" : ""}`} />
              <span className="hidden md:inline">Saved</span>
              {wishlistCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center border border-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* My Vault / Cart */}
            <button 
              onClick={() => setCurrentTab("closet")}
              className={`flex items-center gap-1.5 relative px-2.5 py-1.5 rounded-lg transition-all ${
                currentTab === "closet" ? "bg-stone-100 text-jumia-orange" : "text-stone-850 hover:text-jumia-orange"
              }`}
            >
              <ShoppingBag className="w-5 h-5 text-stone-800" />
              <span className="hidden md:inline">My Vault</span>
              {activeBidCount > 0 && (
                <span className="bg-jumia-orange text-white text-[10px] font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center border border-white animate-pulse">
                  {activeBidCount}
                </span>
              )}
            </button>

          </div>
        </div>
      </div>

      {/* 3. Bottom E-Commerce Navigation (Gabriel Dark Grey bar containing main views) */}
      <div className="bg-[#1C1A17] shadow-md border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center overflow-x-auto justify-start md:justify-center gap-2 sm:gap-4 py-2 text-white no-scrollbar">
          
          <button
            onClick={() => {
              setCurrentTab("browse");
              setSearchQuery("");
            }}
            className={`flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
              currentTab === "browse" ? "bg-jumia-orange text-white" : "hover:bg-stone-800 hover:text-stone-200 text-stone-300"
            }`}
          >
            <Shirt className="w-4 h-4 shrink-0" />
            Showroom (Shop)
          </button>

          <button
            onClick={() => setCurrentTab("markets")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
              currentTab === "markets" ? "bg-jumia-orange text-white" : "hover:bg-stone-800 hover:text-stone-200 text-stone-300"
            }`}
          >
            <Store className="w-4 h-4 shrink-0" />
            Market Stalls
          </button>

          <button
            onClick={() => setCurrentTab("lookbooks")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
              currentTab === "lookbooks" ? "bg-jumia-orange text-white" : "hover:bg-stone-800 hover:text-stone-200 text-stone-300"
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            LOOKBOOKS
          </button>

          {/* Admin Dashboard Tab is prominent for Darcy, and helper link is present */}
          {isAdmin && (
            <button
              onClick={() => setCurrentTab("admin")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
                currentTab === "admin" ? "bg-emerald-600 text-white" : "hover:bg-emerald-900/60 hover:text-stone-200 text-emerald-400"
              }`}
            >
              <Database className="w-4 h-4 shrink-0 text-emerald-400" />
              ⭐ Admin Cockpit
            </button>
          )}

          <button
            onClick={() => setCurrentTab("closet")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
              currentTab === "closet" ? "bg-jumia-orange text-white" : "hover:bg-stone-800 hover:text-stone-200 text-stone-300"
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            My Vault
          </button>

        </div>
      </div>
    </header>
  );
}
