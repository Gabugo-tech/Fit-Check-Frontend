import React, { useState, useRef, useEffect } from "react";
import {
  Search, ShoppingBag, Store, Shirt, User, Heart,
  ChevronDown, Tag, Clock, Sun, Moon, Menu, X,
  Sparkles, Database, LogOut, Settings, Package
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

const SUGGESTIONS = [
  { text: "Outerwear", type: "category" },
  { text: "Tops", type: "category" },
  { text: "Bottoms", type: "category" },
  { text: "Dresses", type: "category" },
  { text: "70s Rocker", type: "era" },
  { text: "80s Retro", type: "era" },
  { text: "90s Grunge", type: "era" },
  { text: "Y2K Gorpcore", type: "era" },
];

const NAV_TABS = [
  { id: "browse",    label: "Shop",        icon: Shirt },
  { id: "markets",   label: "Sellers",     icon: Store },
  { id: "lookbooks", label: "Lookbooks",   icon: Sparkles },
  { id: "closet",    label: "My Orders",   icon: Package },
];

export default function Navbar({
  currentTab, setCurrentTab,
  activeBidCount, wishlistCount,
  searchQuery, setSearchQuery,
  userEmail, setUserEmail,
  userPhone = "", userName = "",
  onOpenAuthModal, onLogout,
  isDarkMode = false, onToggleDarkMode,
}: NavbarProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const isAdmin = userEmail.trim().toLowerCase() === (import.meta.env.VITE_ADMIN_EMAIL || "nnanwubagabriel@gmail.com").toLowerCase();
  const isGuest = !userEmail || userEmail.includes("guest");
  const displayName = userName && !isGuest ? userName.split(" ")[0] : null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setShowDropdown(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const suggestions = searchQuery.trim()
    ? SUGGESTIONS.filter(s =>
        s.text.toLowerCase().includes(searchQuery.toLowerCase()) &&
        s.text.toLowerCase() !== searchQuery.toLowerCase()
      ).slice(0, 5)
    : [];

  const handleSuggestion = (text: string) => {
    setSearchQuery(text);
    setShowSuggestions(false);
    setCurrentTab("browse");
  };

  const handleLogout = () => {
    const ok = window.confirm("Are you sure you want to sign out?");
    if (!ok) return;
    onLogout?.();
    setShowDropdown(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-stone-200 shadow-sm">

      {/* ── Announcement bar ── */}
      <div className="bg-stone-900 text-stone-300 text-xs py-2 px-4 text-center hidden sm:block">
        Free shipping on orders over ₦50,000 · Provenance verified on every piece
        {isAdmin && (
          <button
            onClick={() => setCurrentTab("sell")}
            className="ml-4 text-brand font-semibold hover:underline"
          >
            + Add new listing
          </button>
        )}
      </div>

      {/* ── Main header ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">

        {/* Logo */}
        <button
          onClick={() => { setCurrentTab("browse"); setSearchQuery(""); }}
          className="shrink-0 flex items-center gap-1.5 select-none"
          aria-label="FitCheck home"
        >
          <span className="bg-brand text-white px-2.5 py-1 rounded-md font-extrabold text-lg tracking-tight leading-none">
            Fit
          </span>
          <span className="font-serif font-bold text-lg italic text-stone-900 leading-none -ml-0.5">
            Check
          </span>
        </button>

        {/* Search */}
        <div ref={searchRef} className="flex-1 max-w-xl relative hidden md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              aria-label="Search garments"
              value={searchQuery}
              placeholder="Search by era, brand, category…"
              onFocus={() => setShowSuggestions(true)}
              onChange={e => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
                if (currentTab !== "browse") setCurrentTab("browse");
              }}
              onKeyDown={e => {
                if (e.key === "Enter") { setShowSuggestions(false); setCurrentTab("browse"); }
                if (e.key === "Escape") setShowSuggestions(false);
              }}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2.5 pl-9 pr-4 text-sm text-stone-900 outline-none focus:border-brand focus:bg-white transition-colors placeholder:text-stone-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden z-50">
              {suggestions.map(s => (
                <button
                  key={s.text}
                  type="button"
                  onClick={() => handleSuggestion(s.text)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-stone-50 text-left text-sm text-stone-700 transition-colors"
                >
                  {s.type === "category"
                    ? <Tag className="w-3.5 h-3.5 text-brand shrink-0" />
                    : <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  }
                  <span className="font-medium">{s.text}</span>
                  <span className="ml-auto text-xs text-stone-400 capitalize">{s.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1 sm:gap-2 ml-auto md:ml-0">

          {/* Dark mode */}
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
              title={isDarkMode ? "Light mode" : "Dark mode"}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
            </button>
          )}

          {/* Wishlist */}
          <button
            onClick={() => setCurrentTab("wishlist")}
            className="relative p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
            aria-label="Wishlist"
          >
            <Heart className={`w-5 h-5 ${currentTab === "wishlist" ? "fill-rose-500 text-rose-500" : ""}`} />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            )}
          </button>

          {/* Cart / Vault */}
          <button
            onClick={() => setCurrentTab("closet")}
            className="relative p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
            aria-label="My orders"
          >
            <ShoppingBag className={`w-5 h-5 ${currentTab === "closet" ? "text-brand" : ""}`} />
            {activeBidCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-brand text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {activeBidCount > 9 ? "9+" : activeBidCount}
              </span>
            )}
          </button>

          {/* Account */}
          <div className="relative" ref={dropdownRef}>
            {isGuest ? (
              <button
                onClick={() => onOpenAuthModal?.()}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <User className="w-4 h-4" />
                Sign in
              </button>
            ) : (
              <button
                onClick={() => setShowDropdown(p => !p)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center uppercase shrink-0">
                  {(displayName || "U").charAt(0)}
                </div>
                <span className="hidden sm:block text-sm font-medium text-stone-800 max-w-[80px] truncate">
                  {displayName || "Account"}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform hidden sm:block ${showDropdown ? "rotate-180" : ""}`} />
              </button>
            )}

            {showDropdown && !isGuest && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-stone-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                {/* User info */}
                <div className="px-4 py-3 bg-stone-50 border-b border-stone-100">
                  <p className="text-sm font-semibold text-stone-900 truncate">{userName || "User"}</p>
                  <p className="text-xs text-stone-500 truncate mt-0.5">{userEmail}</p>
                  {isAdmin && (
                    <span className="mt-1.5 inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      Admin
                    </span>
                  )}
                </div>

                {/* Menu items */}
                <div className="py-1.5">
                  <button
                    onClick={() => { setCurrentTab("closet"); setShowDropdown(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    <Package className="w-4 h-4 text-stone-400" />
                    My Orders
                  </button>
                  <button
                    onClick={() => { setCurrentTab("wishlist"); setShowDropdown(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    <Heart className="w-4 h-4 text-stone-400" />
                    Saved Items
                    {wishlistCount > 0 && (
                      <span className="ml-auto text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-medium">{wishlistCount}</span>
                    )}
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => { setCurrentTab("admin"); setShowDropdown(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors"
                    >
                      <Database className="w-4 h-4 text-emerald-500" />
                      Admin Dashboard
                    </button>
                  )}
                </div>

                <div className="border-t border-stone-100 py-1.5">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(p => !p)}
            className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile search ── */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            placeholder="Search garments…"
            onChange={e => { setSearchQuery(e.target.value); setCurrentTab("browse"); }}
            className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2.5 pl-9 pr-4 text-sm text-stone-900 outline-none focus:border-brand transition-colors"
          />
        </div>
      </div>

      {/* ── Bottom nav tabs ── */}
      <nav className="border-t border-stone-100 bg-white hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {NAV_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCurrentTab(id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                currentTab === id
                  ? "border-brand text-brand"
                  : "border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
          {isAdmin && (
            <button
              onClick={() => setCurrentTab("admin")}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                currentTab === "admin"
                  ? "border-emerald-500 text-emerald-700"
                  : "border-transparent text-emerald-600 hover:text-emerald-700 hover:border-emerald-300"
              }`}
            >
              <Database className="w-4 h-4" />
              Admin
            </button>
          )}
        </div>
      </nav>

      {/* ── Mobile nav drawer ── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-100 bg-white animate-fade-in">
          <div className="px-4 py-2 space-y-1">
            {NAV_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setCurrentTab(id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  currentTab === id ? "bg-brand/10 text-brand" : "text-stone-700 hover:bg-stone-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
            {isGuest && (
              <button
                onClick={() => { onOpenAuthModal?.(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-white bg-brand mt-2"
              >
                <User className="w-4 h-4" />
                Sign in / Create account
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
