import React, { useState, useEffect, Suspense, lazy } from "react";
import Navbar from "./components/Navbar";
import { emailNotificationService } from "./lib/emailNotificationService";
import { safeLocalStorage } from "./lib/storage";
import { tokenStore, cartApi } from "./lib/api";
import { useAppData } from "./lib/useAppData";
import type { VendorReview } from "./components/FeedbackModal";

const VintageGrid    = lazy(() => import("./components/VintageGrid"));
const MarketDirectory = lazy(() => import("./components/MarketDirectory"));
const SellForm       = lazy(() => import("./components/SellForm"));
const ClosetHub      = lazy(() => import("./components/ClosetHub"));
const ItemDetailModal = lazy(() => import("./components/ItemDetailModal"));
const AdminDashboard  = lazy(() => import("./components/AdminDashboard"));
const AuthModal       = lazy(() => import("./components/AuthModal"));
const VendorProfile   = lazy(() => import("./components/VendorProfile"));
const FeedbackModal   = lazy(() => import("./components/FeedbackModal"));
const CartDrawer      = lazy(() => import("./components/CartDrawer"));
const OrdersPage      = lazy(() => import("./components/OrdersPage"));

import { VintageItem, MarketBooth, BidRecord } from "./types";
import { Star, Shield, ShieldCheck, Heart, Instagram, ShoppingBag, User, Search, Zap, Award, Truck } from "lucide-react";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("browse");
  const [booths, setBooths] = useState<MarketBooth[]>([]);
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
  const [isCartOpen, setIsCartOpen]           = useState(false);
  const [cartCount, setCartCount]             = useState(0);
  const [searchQuery, setSearchQuery]         = useState<string>("");

  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() =>
    safeLocalStorage.getItem("vintage_dark_mode") === "true"
  );

  // ── Backend-powered data hook ─────────────────────────────────────────────
  const {
    items, setItems,
    sellers,
    bidLogs, setBidLogs,
    purchasedItemIds, setPurchasedItemIds,
    wishlist,
    isLoading,
    usingBackend,
    loadData,
    reloadSellers,
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

  // Keep booths state in sync with sellers from DB
  useEffect(() => {
    setBooths(sellers);
  }, [sellers]);
  useEffect(() => {
    if (usingBackend && feedbackVendorId) return; // reviews loaded per-vendor
    try {
      const stored = safeLocalStorage.getItem("vintage_vendor_reviews_list");
      setAllReviews(stored ? JSON.parse(stored) : []);
    } catch { setAllReviews([]); }
  }, [usingBackend]);
  // ── Cart handler ─────────────────────────────────────────────────────────
  const handleAddToCart = async (itemId: string) => {
    if (isGuest) { setIsAuthModalOpen(true); return; }
    try {
      await cartApi.add(itemId);
      setCartCount(c => c + 1);
      setIsCartOpen(true);
    } catch (err: any) {
      console.error("Add to cart failed:", err.message);
    }
  };

  // Load cart count on auth
  useEffect(() => {
    if (!isGuest) {
      cartApi.get().then(items => setCartCount(items.length)).catch(() => {});
    } else {
      setCartCount(0);
    }
  }, [isGuest]);

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
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-200 ${
      isDarkMode ? "bg-[#1f1f2d] text-[#e2e2f0]" : "bg-white text-[#1a1a2e]"
    }`}>
      <div>
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          activeBidCount={activeBidCount}
          wishlistCount={wishlist.length}
          cartCount={cartCount}
          onOpenCart={() => setIsCartOpen(true)}
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

        {/* ── Enhanced Hero — always visible on browse tab ── */}
        {currentTab === "browse" && !selectedBoothId && (
          <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="text-white space-y-6">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/30">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Authenticated Vintage Marketplace
                  </div>
                  <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight italic">
                    Rare pieces.<br />
                    <span className="text-yellow-300">Real stories.</span>
                  </h1>
                  <p className="text-white/80 text-lg max-w-md leading-relaxed">
                    Authenticated vintage garments sourced from London, Tokyo, New York and Milan. Bid live or buy outright.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => { const el = document.getElementById("shop-section"); el?.scrollIntoView({ behavior: "smooth" }); }}
                      className="px-6 py-3 bg-white text-[#667eea] font-bold text-sm rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-lg"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Shop Collection
                    </button>
                    {isGuest && (
                      <button
                        onClick={() => setIsAuthModalOpen(true)}
                        className="px-6 py-3 border-2 border-white/60 text-white font-semibold text-sm rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        Create Account
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-white/70 text-sm">
                    <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-green-300" />Provenance verified</span>
                    <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />Flat measurements</span>
                    <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-blue-300" />Insured dispatch</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden lg:grid grid-cols-2 gap-4">
                  {[
                    { value: `${items.length || "500"}+`, label: "Archive pieces", icon: "👗" },
                    { value: "4", label: "Global cities", icon: "🌍" },
                    { value: "Live", label: "Real-time bidding", icon: "⚡" },
                    { value: "100%", label: "Authenticated", icon: "✅" },
                  ].map(({ value, label, icon }) => (
                    <div key={label} className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 border border-white/20 text-white">
                      <div className="text-3xl mb-1">{icon}</div>
                      <div className="text-2xl font-bold">{value}</div>
                      <div className="text-white/70 text-sm">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Decorative wave */}
            <div className="absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 60L1440 60L1440 0C1200 50 960 60 720 40C480 20 240 0 0 30L0 60Z" fill={isDarkMode ? "#1f1f2d" : "#ffffff"}/>
              </svg>
            </div>
          </section>
        )}

        {/* ── Features strip ── */}
        {currentTab === "browse" && !selectedBoothId && (
          <div className={`border-b ${isDarkMode ? "border-[#3d3d5c] bg-[#2a2a3c]" : "border-gray-100 bg-white"}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-wrap justify-center gap-8 text-sm">
                {[
                  { icon: <Truck className="w-4 h-4 text-[#667eea]" />, text: "Free shipping on orders over ₦50,000" },
                  { icon: <ShieldCheck className="w-4 h-4 text-green-500" />, text: "100% authentic, provenance verified" },
                  { icon: <Zap className="w-4 h-4 text-yellow-500" />, text: "Live bidding in real time" },
                  { icon: <Award className="w-4 h-4 text-[#ff6b6b]" />, text: "9,000+ satisfied customers" },
                ].map(({ icon, text }) => (
                  <span key={text} className={`flex items-center gap-2 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {icon}{text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Guest notice */}
        {isGuest && items.length > 0 && currentTab === "browse" && (
          <div className="bg-indigo-50 border-b border-indigo-200 text-indigo-800 text-sm py-2.5 px-4 text-center">
            <button onClick={() => setIsAuthModalOpen(true)} className="font-semibold hover:underline">Sign in</button>
            {" "}to save items, place bids and checkout
          </div>
        )}

        {/* Main content */}
        <Suspense fallback={
          <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm text-stone-400">
            Loading…
          </div>
        }>
          <main id="shop-section" className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isDarkMode ? "bg-[#1f1f2d]" : "bg-white"}`}>
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
              <div className="max-w-md mx-auto py-24 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-stone-800">No items found</h3>
                <p className="text-sm text-stone-500 mt-2">
                  {searchQuery ? `No results for "${searchQuery}"` : "No items in the collection yet."}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-5 px-5 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 transition-colors"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )
          )}

          {currentTab === "wishlist" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-stone-900">Saved Items</h2>
                <span className="text-sm text-stone-500">
                  {wishlist.length} {wishlist.length === 1 ? "item" : "items"}
                </span>
              </div>
              {wishlist.length > 0 ? (
                <VintageGrid
                  items={filteredItems.filter(i => wishlist.includes(i.id))}
                  onSelectItem={(item) => setSelectedItem(item)}
                  selectedBoothId={null}
                  clearBoothFilter={() => {}}
                  wishlist={wishlist}
                  onToggleWishlist={handleToggleWishlist}
                  isWishlistView={true}
                />
              ) : (
                <div className="text-center py-24">
                  <div className="text-4xl mb-4">🤍</div>
                  <h3 className="text-xl font-semibold text-stone-800">No saved items yet</h3>
                  <p className="text-sm text-stone-500 mt-2">
                    Tap the heart on any item to save it here.
                  </p>
                  <button
                    onClick={() => setCurrentTab("browse")}
                    className="mt-5 px-5 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 transition-colors"
                  >
                    Browse collection
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
            <div className="text-center py-24">
              <p className="text-2xl mb-3">📚</p>
              <h3 className="text-xl font-semibold">Lookbooks coming soon</h3>
            </div>
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

          {currentTab === "orders" && (
            <Suspense fallback={<div className="py-20 text-center text-stone-400">Loading orders…</div>}>
              <OrdersPage />
            </Suspense>
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
              isAdmin={isAdmin}
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
              onSellersChanged={reloadSellers}
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
            onAddToCart={handleAddToCart}
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

      {/* Cart Drawer */}
      <Suspense fallback={null}>
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onOrderPlaced={() => { setCartCount(0); setCurrentTab("orders"); }}
          userName={userName}
        />
      </Suspense>

      <footer style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #2d2d4e 100%)" }} className="text-gray-400 mt-20 border-t border-indigo-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-indigo-900/30">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-bold text-xl text-white" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>FitCheck</span>
              </div>
              <p className="text-sm leading-relaxed">
                Authenticated vintage clothing marketplace. Every piece verified, measured and sourced.
              </p>
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold mb-3">Shop</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => setCurrentTab("browse")} className="hover:text-white transition-colors">All items</button></li>
                <li><button onClick={() => setCurrentTab("markets")} className="hover:text-white transition-colors">Sellers</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold mb-3">Sourced from</h4>
              <ul className="space-y-2 text-sm">
                <li>Portobello Road, London</li>
                <li>Shimokitazawa, Tokyo</li>
                <li>Brooklyn Flea, New York</li>
                <li>Navigli, Milan</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold mb-3">Trust & Safety</h4>
              <ul className="space-y-2 text-sm">
                <li>✓ Provenance verified</li>
                <li>✓ Flat measurements</li>
                <li>✓ Secure checkout</li>
                <li>✓ Insured dispatch</li>
              </ul>
            </div>
          </div>
          <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
            <p>© {new Date().getFullYear()} FitCheck. All rights reserved.</p>
            <div className="flex items-center gap-2 text-indigo-400">
              <Instagram className="w-4 h-4" />
              <span>@fitcheck_vintage</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
