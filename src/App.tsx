import React, { useState, useEffect, Suspense, lazy } from "react";
import Navbar from "./components/Navbar";
import { emailNotificationService } from "./lib/emailNotificationService";
import { safeLocalStorage } from "./lib/storage";
import { tokenStore, reviewsApi } from "./lib/api";
import { useAppData } from "./lib/useAppData";
import type { VendorReview } from "./components/FeedbackModal";

const VintageGrid = lazy(() => import("./components/VintageGrid"));
const MarketDirectory = lazy(() => import("./components/MarketDirectory"));
const LookbookShowcase = lazy(() => import("./components/LookbookShowcase"));
const SellForm = lazy(() => import("./components/SellForm"));
const ClosetHub = lazy(() => import("./components/ClosetHub"));
const ItemDetailModal = lazy(() => import("./components/ItemDetailModal"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const AuthModal = lazy(() => import("./components/AuthModal"));
const VendorProfile = lazy(() => import("./components/VendorProfile"));
const FeedbackModal = lazy(() => import("./components/FeedbackModal"));

import { VintageItem, MarketBooth, BidRecord, Lookbook } from "./types";
import { INITIAL_BOOTHS, INITIAL_ITEMS, INITIAL_LOOKBOOKS } from "./data";
import { Star, Shield, ShieldCheck, HelpCircle, Heart, Instagram, ShoppingBag, User, Search } from "lucide-react";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("browse");
  const [booths, setBooths] = useState<MarketBooth[]>([]);
  const [lookbooks, setLookbooks] = useState<Lookbook[]>([]);
  const [selectedBoothId, setSelectedBoothId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<VintageItem | null>(null);

  // Vendor profiles detailing and review states
  const [selectedBoothIdForProfile, setSelectedBoothIdForProfile] = useState<string | null>(null);
  const [feedbackVendorId, setFeedbackVendorId] = useState<string | null>(null);
  const [feedbackItemTitle, setFeedbackItemTitle] = useState<string>("");
  const [allReviews, setAllReviews] = useState<VendorReview[]>([]);

  // Auth state
  const [userEmail, setUserEmail] = useState<string>(() =>
    safeLocalStorage.getItem("user_email") || "guest@fitcheck.com"
  );
  const [userName, setUserName] = useState<string>(() =>
    safeLocalStorage.getItem("user_name") || "Guest Customer"
  );
  const [userPhone, setUserPhone] = useState<string>(() =>
    safeLocalStorage.getItem("user_phone") || ""
  );
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() =>
    safeLocalStorage.getItem("vintage_dark_mode") === "true"
  );

  // ── Backend-powered data hook ─────────────────────────────────────────────
  const {
    items, setItems,
    bidLogs, setBidLogs,
    purchasedItemIds, setPurchasedItemIds,
    wishlist,
    isLoading,
    usingBackend,
    loadData,
    placeBid: apiBidPlace,
    buyNow: apiBuyNow,
    toggleWishlist: apiToggleWishlist,
  } = useAppData();

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      safeLocalStorage.setItem("vintage_dark_mode", next ? "true" : "false");
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  };

  const isAdmin = userEmail.trim().toLowerCase() === (import.meta.env.VITE_ADMIN_EMAIL || "nnanwubagabriel@gmail.com").toLowerCase();
  const isGuest = !userEmail || userEmail === "guest@fitcheck.com" || userEmail.trim().toLowerCase().includes("guest");
  const isDemoMode = !usingBackend || isGuest;

  useEffect(() => {
    const stored = safeLocalStorage.getItem("vintage_dark_mode") === "true";
    if (stored) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    try {
      const storedReviews = safeLocalStorage.getItem("vintage_vendor_reviews_list");
      if (storedReviews) {
        setAllReviews(JSON.parse(storedReviews));
      } else {
        setAllReviews([]);
      }
    } catch (e) {
      console.error("Failed to load reviews:", e);
    }
  }, []);

  const handleSetUserEmail = (email: string) => {
    setUserEmail(email);
    safeLocalStorage.setItem("user_email", email);
    
    // Automatically set name for admin account
    if (email.trim().toLowerCase() === (import.meta.env.VITE_ADMIN_EMAIL || "nnanwubagabriel@gmail.com").toLowerCase()) {
      setUserName("Gabriel");
      safeLocalStorage.setItem("user_name", "Gabriel");
    }
  };

  const handleLogout = () => {
    safeLocalStorage.removeItem("user_email");
    safeLocalStorage.removeItem("user_name");
    safeLocalStorage.removeItem("user_phone");
    tokenStore.clear();
    setUserEmail("guest@fitcheck.com");
    setUserName("Guest Customer");
    setUserPhone("");
    setCurrentTab("browse");
    setSelectedItem(null);
  };

  const handleAuthSuccess = (email: string, phone: string, name: string, token?: string) => {
    setUserEmail(email);
    setUserName(name);
    setUserPhone(phone);
    safeLocalStorage.setItem("user_email", email);
    safeLocalStorage.setItem("user_name", name);
    safeLocalStorage.setItem("user_phone", phone);
    if (token) {
      tokenStore.set(token);
      // Reload data with authenticated context (wishlist, purchases)
      loadData();
    }
  };

  // Load booths and lookbooks (static for now)
  useEffect(() => {
    setBooths(INITIAL_BOOTHS);
    setLookbooks(INITIAL_LOOKBOOKS);
  }, []);

  // Load reviews — from DB if available, else localStorage
  useEffect(() => {
    if (usingBackend && feedbackVendorId) return; // reviews loaded per-vendor
    try {
      const stored = safeLocalStorage.getItem("vintage_vendor_reviews_list");
      setAllReviews(stored ? JSON.parse(stored) : []);
    } catch { setAllReviews([]); }
  }, [usingBackend]);
  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleToggleWishlist = async (itemId: string) => {
    try {
      await apiToggleWishlist(itemId);
    } catch (err) {
      console.error("Wishlist toggle failed:", err);
    }
  };

  const handlePlaceBid = async (itemId: string, amount: number, bidderName: string) => {
    const matchedItem = items.find(i => i.id === itemId);
    const prevHighestBidder = matchedItem?.highestBidder;

    if (prevHighestBidder && prevHighestBidder !== bidderName && matchedItem) {
      const prevBidderEmail = prevHighestBidder === userName
        ? userEmail
        : `${prevHighestBidder.toLowerCase().replace(/\s+/g, "")}@fitcheck.com`;
      emailNotificationService.notifyOutbid(prevBidderEmail, bidderName, matchedItem.title, amount);
    }

    try {
      await apiBidPlace(itemId, amount, bidderName);
      // Sync modal if open
      if (selectedItem && selectedItem.id === itemId) {
        setSelectedItem(prev => prev ? {
          ...prev, currentBid: amount, bidsCount: prev.bidsCount + 1, highestBidder: bidderName
        } : null);
      }
    } catch (err: any) {
      console.error("Bid failed:", err.message);
      throw err;
    }
  };

  const handleBuyNow = async (itemId: string, buyerName: string) => {
    const purchasedItem = items.find(i => i.id === itemId);
    try {
      await apiBuyNow(itemId, buyerName);

      if (purchasedItem) {
        emailNotificationService.notifyPurchaseFinalized(
          userEmail || "customer@fitcheck.com",
          buyerName,
          purchasedItem.title,
          purchasedItem.buyPrice || purchasedItem.currentBid,
          `TXN-FITCHECK-${Date.now()}`
        );
        setTimeout(() => {
          setFeedbackVendorId(purchasedItem.sellerId);
          setFeedbackItemTitle(purchasedItem.title);
        }, 2605);
      }
    } catch (err: any) {
      console.error("Purchase failed:", err.message);
      throw err;
    }
  };

  const handleClearPurchases = () => {
    if (!window.confirm("Reset all vault purchases? Items will be restored to active listings.")) return;
    const restoredItems = items.map(item =>
      purchasedItemIds.includes(item.id) ? { ...item, isSold: false, highestBidder: null } : item
    );
    setPurchasedItemIds([]);
    setItems(restoredItems);
    safeLocalStorage.setItem("vintage_purchased_ids", JSON.stringify([]));
    safeLocalStorage.setItem("vintage_items_list", JSON.stringify(restoredItems));
    if (selectedItem && purchasedItemIds.includes(selectedItem.id)) setSelectedItem(null);
  };

  // persistState — kept for AdminDashboard compatibility
  const persistState = (newItems: VintageItem[], _newBooths: MarketBooth[], newBids: BidRecord[], newPurchases: string[]) => {
    setItems(newItems);
    setBidLogs(newBids);
    setPurchasedItemIds(newPurchases);
    safeLocalStorage.setItem("vintage_items_list", JSON.stringify(newItems));
    safeLocalStorage.setItem("vintage_bidlogs_list", JSON.stringify(newBids));
    safeLocalStorage.setItem("vintage_purchased_ids", JSON.stringify(newPurchases));
  };

  const handleAddListing = (newItem: VintageItem, newBooth?: MarketBooth) => {
    const updatedItems = [newItem, ...items];
    if (newBooth) setBooths(prev => [newBooth, ...prev]);
    setItems(updatedItems);
    safeLocalStorage.setItem("vintage_items_list", JSON.stringify(updatedItems));
    window.dispatchEvent(new Event("storage"));
    setCurrentTab("browse");
    setSelectedBoothId(null);
  };

  // Filter triggers from Booth Directory
  const handleSelectBoothFilter = (boothId: string) => {
    setSelectedBoothId(boothId);
    setCurrentTab("browse"); // shift focus back to collection listing with active badge filter
  };

  // Counts of stock items categorized by vendor booth
  const computeItemCounts = () => {
    const counts: Record<string, number> = {};
    items.forEach((item) => {
      counts[item.sellerId] = (counts[item.sellerId] || 0) + 1;
    });
    return counts;
  };

  const activeBidCount = bidLogs.filter(b => b.bidderName.toLowerCase() === userName.toLowerCase() && b.bidderName !== "").length;

  // Jumia-style real-time search filtering helper
  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.era.toLowerCase().includes(query) ||
      item.condition.toLowerCase().includes(query) ||
      item.tags.some((t) => t.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1C1A17] dark:bg-[#131211] dark:text-[#EBE7DF] font-sans flex flex-col justify-between transition-colors duration-300 selection:bg-amber-100 selection:text-amber-900" id="editorial_app_main">
      <div>
        
        {/* Sticky top headers */}
        <Navbar 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          activeBidCount={activeBidCount} 
          wishlistCount={wishlist.length}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          userEmail={userEmail}
          setUserEmail={handleSetUserEmail}
          userPhone={userPhone}
          userName={userName}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
        />

        {isDemoMode && isGuest && (
          <div className="border-b border-stone-200 bg-stone-50 dark:bg-stone-900 dark:border-stone-800 text-stone-600 dark:text-stone-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em]">
              <User className="w-3 h-3" />
              Browsing as guest — sign in to save items and checkout
            </div>
          </div>
        )}

        {/* Hero banner — visible only on the main browse feed */}
        {currentTab === "browse" && !selectedBoothId && (
          <section className="bg-[#1C1A17] text-[#FAF9F5] border-b border-stone-800" id="editorial_hero_banner">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[420px]">

                {/* Left: Copy */}
                <div className="flex flex-col justify-center py-16 sm:py-20 space-y-6 lg:pr-16">
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-400 font-bold">
                    Authenticated Vintage Marketplace
                  </span>
                  <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] italic">
                    Rare pieces. <br />Real provenance.
                  </h1>
                  <p className="text-stone-400 text-sm leading-relaxed max-w-md">
                    Every garment is sourced, measured, and photographed by independent curators across London, Tokyo, New York, and Milan. Bid live or buy outright — no fast fashion, no replicas.
                  </p>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentTab("browse")}
                      className="px-5 py-2.5 bg-[#F68B1E] hover:bg-amber-500 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Browse Collection
                    </button>
                    {isGuest && (
                      <button
                        type="button"
                        onClick={() => setIsAuthModalOpen(true)}
                        className="px-5 py-2.5 border border-stone-600 hover:border-stone-400 text-stone-300 hover:text-white font-mono text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        Create Account
                      </button>
                    )}
                  </div>

                  {/* Trust signals */}
                  <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-[11px] font-mono text-stone-500">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Provenance verified
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      Flat measurements on every listing
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-blue-400" />
                      Secure checkout via Stripe
                    </span>
                  </div>
                </div>

                {/* Right: Stats panel */}
                <div className="hidden lg:flex flex-col justify-center border-l border-stone-800 pl-16 py-16 space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { value: "500+", label: "Archive pieces" },
                      { value: "4", label: "Global sourcing cities" },
                      { value: "Live", label: "Real-time bidding" },
                      { value: "100%", label: "Physical origin" },
                    ].map(({ value, label }) => (
                      <div key={label} className="space-y-1">
                        <div className="font-serif text-3xl font-bold text-amber-400">{value}</div>
                        <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500">{label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-stone-800 pt-6 space-y-3">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-stone-500">Sourced from</p>
                    <div className="flex flex-wrap gap-2 text-[11px] font-mono text-stone-300">
                      {["Portobello Road, London", "Shimokitazawa, Tokyo", "Brooklyn Flea, NY", "Navigli, Milan"].map(loc => (
                        <span key={loc} className="px-2.5 py-1 border border-stone-700 rounded-full">{loc}</span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>
        )}

        {/* Main Content Render Layout */}
        <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-12 text-center text-sm text-stone-500 font-mono uppercase tracking-[0.2em]">Loading showroom…</div>}>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 dark:bg-[#131211]">
          {currentTab === "browse" && (
            filteredItems.length > 0 ? (
              <VintageGrid
                items={filteredItems}
                onSelectItem={(item) => setSelectedItem(item)}
                selectedBoothId={selectedBoothId}
                clearBoothFilter={() => setSelectedBoothId(null)}
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
              />
            ) : (
              <div className="max-w-xl mx-auto py-20 text-center bg-[#FCFBF8] border border-dashed border-[#E6E1D5] rounded-2xl px-6" id="no_search_results_state">
                <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 mx-auto mb-4 flex items-center justify-center">
                  <Search className="w-7 h-7 text-amber-700" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#1C1A17]">No pieces match your search</h3>
                <p className="text-sm text-stone-500 mt-2 leading-relaxed">
                  Try a different era, category, or market name to discover more archive pieces from our sourcing network.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1C1A17] text-white text-[11px] font-mono uppercase tracking-wider font-bold transition-colors hover:bg-stone-800"
                >
                  Clear search
                </button>
              </div>
            )
          )}

          {currentTab === "wishlist" && (
            <div className="space-y-8 animate-fade-in" id="wishlist_view_section">
              <div className="border-b border-[#EBE8DF] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div>
                  <span className="font-mono text-xs uppercase tracking-[0.25em] text-amber-700 font-bold block mb-1">
                    Your Curated Showroom Vault
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold italic text-[#1C1A17]">My Wishlist</h2>
                </div>
                <div className="font-mono text-xs text-amber-900 bg-amber-50 border border-amber-200/60 px-3.5 py-1.5 rounded-full whitespace-nowrap">
                  {items.filter((item) => wishlist.includes(item.id)).length} {items.filter((item) => wishlist.includes(item.id)).length === 1 ? "piece" : "pieces"} cataloged
                </div>
              </div>

              {items.filter((item) => wishlist.includes(item.id)).length > 0 ? (
                <VintageGrid
                  items={filteredItems.filter((item) => wishlist.includes(item.id))}
                  onSelectItem={(item) => setSelectedItem(item)}
                  selectedBoothId={null}
                  clearBoothFilter={() => {}}
                  wishlist={wishlist}
                  onToggleWishlist={handleToggleWishlist}
                  isWishlistView={true}
                />
              ) : (
                <div className="text-center py-20 bg-[#FCFBF8] border border-dashed border-[#EBE8DF] rounded-2xl max-w-lg mx-auto" id="empty_wishlist_panel">
                  <div className="w-16 h-16 rounded-full bg-rose-50/50 flex items-center justify-center mx-auto mb-4 border border-rose-100">
                    <Heart className="w-8 h-8 text-rose-400" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#1C1A17]">Wishlist is currently empty</h3>
                  <p className="text-xs text-[#6B6152] mt-2 px-6 leading-relaxed">
                    Explore the collections from Portobello, Shimokitazawa & Brooklyn flea, then tap the heart icon on any piece to register it to your wishlist.
                  </p>
                  <button
                    onClick={() => setCurrentTab("browse")}
                    className="mt-6 inline-flex text-xs font-mono font-bold text-amber-800 hover:text-[#1C1A17] border-b border-amber-800 pb-0.5"
                  >
                    Browse The Collection
                  </button>
                </div>
              )}
            </div>
          )}

          {currentTab === "markets" && (
            selectedBoothIdForProfile ? (
              <VendorProfile
                booth={booths.find(b => b.id === selectedBoothIdForProfile)!}
                items={items}
                allReviews={allReviews}
                onSelectItem={(item) => setSelectedItem(item)}
                onBack={() => setSelectedBoothIdForProfile(null)}
                onOpenFeedbackModal={() => {
                  const b = booths.find(b => b.id === selectedBoothIdForProfile);
                  if (b) {
                    setFeedbackVendorId(b.id);
                    setFeedbackItemTitle("Direct Curator Consultation");
                  }
                }}
              />
            ) : (
              <MarketDirectory
                booths={booths}
                onSelectBooth={(boothId) => setSelectedBoothIdForProfile(boothId)}
                itemCounts={computeItemCounts()}
              />
            )
          )}

          {currentTab === "lookbooks" && (
            <LookbookShowcase
              lookbooks={lookbooks}
              items={items}
              onSelectItem={(item) => setSelectedItem(item)}
            />
          )}

          {currentTab === "sell" && (
            isAdmin ? (
              <SellForm
                booths={booths}
                onAddListing={handleAddListing}
                userEmail={userEmail}
              />
            ) : (
              <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-850 text-center space-y-4" id="sell_auth_restricted_gate">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-serif text-xl font-bold">Curator Authorization Required</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  The upload lounge and garment listing options are restricted to certified admin curators. Please log in with an administrator account to list pieces.
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentTab("browse")}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-950 text-white text-[11px] font-mono rounded-lg uppercase font-black tracking-wider transition-colors"
                >
                  Return to Showroom
                </button>
              </div>
            )
          )}

          {currentTab === "closet" && (
            <ClosetHub
              items={items}
              bidLogs={bidLogs}
              purchasedItemIds={purchasedItemIds}
              onSelectItem={(item) => setSelectedItem(item)}
              onClearPurchases={handleClearPurchases}
              wishlist={wishlist}
              currentUserName={userName}
            />
          )}

          {currentTab === "admin" && (
            <AdminDashboard
              items={items}
              setItems={setItems}
              persistState={persistState}
              booths={booths}
              bidLogs={bidLogs}
              setBidLogs={setBidLogs}
              purchasedItemIds={purchasedItemIds}
              userEmail={userEmail}
            />
          )}
          </main>
        </Suspense>
      </div>

      {/* Exquisite detail inspection overlay modal */}
      <Suspense fallback={null}>
        {selectedItem && (
          <ItemDetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onPlaceBid={handlePlaceBid}
            onBuyNow={handleBuyNow}
            bidLogs={bidLogs}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
          />
        )}
      </Suspense>

      {/* Auth verification Modal flow */}
      <Suspense fallback={null}>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
          hideCloseButton={false}
        />
      </Suspense>

      {/* Feedback Submission Modal */}
      <Suspense fallback={null}>
        {feedbackVendorId && (
          <FeedbackModal
            isOpen={!!feedbackVendorId}
            onClose={() => {
              setFeedbackVendorId(null);
              setFeedbackItemTitle("");
            }}
            vendorId={feedbackVendorId}
            vendorName={booths.find(b => b.id === feedbackVendorId)?.name || "FitCheck Curators"}
            itemTitle={feedbackItemTitle}
            defaultCustomerName={userName || "Verified Buyer"}
            onSubmitSuccess={() => {
              // Re-sync local storage updates inside active session state
              try {
                const storedReviews = safeLocalStorage.getItem("vintage_vendor_reviews_list");
                if (storedReviews) {
                  setAllReviews(JSON.parse(storedReviews));
                }
              } catch (err) {
                console.error("Failed to load reviews:", err);
              }
            }}
          />
        )}
      </Suspense>

      {/* Footer Column - High Aesthetic details */}
      <footer className="bg-[#1C1A17] text-[#FAF9F5] border-t border-stone-805 mt-20" id="curated_boutique_footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-8 pb-12 border-b border-stone-800">
            {/* Column 1 */}
            <div className="space-y-4">
              <span className="font-sans font-black text-xl bg-orange-600 px-3 py-1 rounded w-fit text-white block">
                FITCHECK
              </span>
              <p className="text-stone-400 text-xs leading-relaxed max-w-sm">
                A digital counter-response to crowded, low-quality superstores. Dedicated to premium vintage garments that tell original tales. We verify flat-measurements and materials so you buy only lasting design heritage.
              </p>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <h4 className="font-mono text-xs uppercase tracking-wider text-amber-500 font-bold">
                Affiliated Sourcing Locations
              </h4>
              <ul className="text-xs text-stone-300 space-y-2 font-mono">
                <li>• Portobello Road Gate 4, London, UK</li>
                <li>• Shimokitazawa Block 3, Setagaya, Tokyo</li>
                <li>• Brooklyn Flea Stand 9B, Brooklyn, NY</li>
                <li>• Milan Navigli Canal Central Chest, Italy</li>
              </ul>
            </div>

            {/* Column 3 */}
            <div className="space-y-4">
              <h4 className="font-mono text-xs uppercase tracking-wider text-amber-500 font-bold">
                Archival Stewardship
              </h4>
              <p className="text-stone-400 text-xs leading-relaxed">
                By purchasing real vintage instead of cheap modern synthetics: <br />
                <strong className="text-emerald-400">Carbon Saved per bid checkout: ~14.2kg CO2e.</strong> <br />
                Insured flat-box courier dispatch guaranteed.
              </p>
              <div className="flex gap-3 pt-2 text-stone-400">
                <Instagram className="w-4 h-4 hover:text-amber-400 transition-colors" />
                <span className="text-[10px] uppercase font-mono tracking-widest hover:text-amber-400 cursor-pointer">@fitcheck_vintage</span>
              </div>
            </div>
          </div>

          {/* Copyright details */}
          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono text-stone-500">
            <p>© {new Date().getFullYear()} FitCheck. All physical provenance recorded.</p>
            <div className="flex gap-4">
              <span className="hover:text-stone-300 cursor-pointer">Buyer Protection Charter</span>
              <span>•</span>
              <span className="hover:text-stone-300 cursor-pointer">Steward Terms of Auction</span>
              <span>•</span>
              <span className="hover:text-stone-300 cursor-pointer">Flat Measurement Guidelines</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
