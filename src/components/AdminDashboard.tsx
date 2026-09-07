import React, { useState } from "react";
import { VintageItem, MarketBooth, BidRecord } from "../types";
import { safeLocalStorage } from "../lib/storage";
import { sellersApi } from "../lib/api";
import {
  TrendingDown, Trash2, Edit3, ShieldCheck, Tag, BarChart2,
  Gavel, Plus, Percent, Package, Users, Sparkles, Globe,
  ArrowUpRight, Database, RefreshCw, FolderOpen, AlertTriangle,
  UploadCloud, Image, Store, X, Check, Loader2
} from "lucide-react";

interface AdminDashboardProps {
  items: VintageItem[];
  setItems: React.Dispatch<React.SetStateAction<VintageItem[]>>;
  persistState: (newItems: VintageItem[], newBooths: MarketBooth[], newBids: BidRecord[], newPurchases: string[]) => void;
  booths: MarketBooth[];
  bidLogs: BidRecord[];
  setBidLogs: React.Dispatch<React.SetStateAction<BidRecord[]>>;
  purchasedItemIds: string[];
  userEmail: string;
  onSellersChanged?: () => Promise<void>;
}

export default function AdminDashboard({
  items,
  setItems,
  persistState,
  booths,
  bidLogs,
  setBidLogs,
  purchasedItemIds,
  userEmail,
  onSellersChanged,
}: AdminDashboardProps) {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [editedPrice, setEditedPrice] = useState<string>("");
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [priceCutReason, setPriceCutReason] = useState<string>("");
  const [adminToast, setAdminToast] = useState<string | null>(null);

  // ── Seller management state ───────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"items" | "sellers">("items");
  const [sellerForm, setSellerForm] = useState({
    name: "", curator: "", location: "", tagline: "",
    bio: "", aesthetic: "", established: "", avatar: "", bannerImage: "",
  });
  const [sellerFormError, setSellerFormError] = useState("");
  const [sellerSaving, setSellerSaving] = useState(false);
  const [editingSellerId, setEditingSellerId] = useState<string | null>(null);
  const [deletingSellerId, setDeletingSellerId] = useState<string | null>(null);
  const [sellerDeleteLoading, setSellerDeleteLoading] = useState(false);

  const showAdminToast = (msg: string) => {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(null), 4000);
  };
  
  // Quick pre-packaged premium listing generator (no bots, just a 1-click admin developer mock action)
  const [previewAddTitle, setPreviewAddTitle] = useState("");
  const [previewCategory, setPreviewCategory] = useState("Tops");
  const [previewSize, setPreviewSize] = useState("L");
  const [previewStartingBid, setPreviewStartingBid] = useState("85");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");

  const isAdmin = userEmail.trim().toLowerCase() === (import.meta.env.VITE_ADMIN_EMAIL || "nnanwubagabriel@gmail.com").toLowerCase();

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-16 px-8 text-center bg-white border border-stone-200 rounded-2xl shadow-lg my-12" id="admin_unauthorized_card">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-200">
          <Database className="w-8 h-8 text-red-500 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 uppercase font-sans">Curator Privilege Required</h2>
        <p className="text-xs text-stone-500 mt-2 max-w-sm mx-auto leading-relaxed">
          The Admin Dashboard is restricted to authorized administrators only.
        </p>
        <div className="bg-[#FEF5EF] text-xs font-mono text-stone-700 p-2.5 rounded border border-orange-100 font-bold max-w-xs mx-auto my-4">
          Sign in with the admin account to access this dashboard.
        </div>
        <p className="text-[11px] text-stone-400">
          Sign in with the admin account to access the dashboard.
        </p>
      </div>
    );
  }

  // Calculate high-fidelity stats
  const totalListings = items.length;
  const soldItemsCount = items.filter(i => i.isSold).length;
  const activeAuctions = items.filter(i => !i.isSold).length;
  
  // Calculate total bidding valuation capital
  const totalBidCapital = items.reduce((acc, curr) => acc + curr.currentBid, 0);
  
  // Estimated greenhouse carbon offset (each garment prevents ~14.2kg CO2e)
  const totalCarbonOffset = (totalListings * 14.2).toFixed(1);

  // Take down a listing from the collection immediately
  const handleTakedownListing = (itemId: string) => {
    const updated = items.filter(item => item.id !== itemId);
    setItems(updated);
    persistState(updated, booths, bidLogs, purchasedItemIds);

    // Trigger cross-tab multi window sync instantly
    safeLocalStorage.setItem("vintage_items_list", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    
    // Clear deletion state
    setConfirmingDeleteId(null);
  };

  // Start editing a listing price or bid dropped status
  const startEditing = (item: VintageItem) => {
    setEditingItemId(item.id);
    setEditedPrice(item.currentBid.toString());
    setEditedTitle(item.title);
    setPriceCutReason(item.bidDroppedReason || "Premium discount applied by FitCheck Administrator");
  };

  // Save edits (Apply a real-time price cut or titling correction)
  const handleSaveEdits = (itemId: string) => {
    const parsedPrice = parseFloat(editedPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      showAdminToast("⚠ Please specify a valid numeric listing price.");
      return;
    }

    const updated = items.map(item => {
      if (item.id === itemId) {
        const isBiggerPriceCut = parsedPrice < item.currentBid;
        return {
          ...item,
          title: editedTitle,
          currentBid: parsedPrice,
          bidDropped: isBiggerPriceCut ? true : item.bidDropped,
          bidDroppedReason: isBiggerPriceCut ? priceCutReason : item.bidDroppedReason
        };
      }
      return item;
    });

    setItems(updated);
    persistState(updated, booths, bidLogs, purchasedItemIds);
    setEditingItemId(null);

    // Sync tab storages
    safeLocalStorage.setItem("vintage_items_list", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  };

  // Force trigger simulated organic pricing cut (helpful for customer friendliness test simulation)
  const triggerRandomPriceCut = () => {
    const unsold = items.filter(i => !i.isSold && !i.bidDropped);
    if (unsold.length === 0) {
      showAdminToast("⚠ No available unsold items to price cut currently!");
      return;
    }
    const targetItem = unsold[Math.floor(Math.random() * unsold.length)];
    const originalPrice = targetItem.currentBid;
    const cutPrice = Math.floor(originalPrice * 0.85); // 15% drop

    const updated = items.map(item => {
      if (item.id === targetItem.id) {
        return {
          ...item,
          currentBid: cutPrice,
          bidDropped: true,
          bidDroppedReason: "💥 ADMIN FLASH DISPATCH: Authorized 15% Price Cut applied by FitCheck Admin!"
        };
      }
      return item;
    });

    setItems(updated);
    persistState(updated, booths, bidLogs, purchasedItemIds);

    // Sync localStorage
    safeLocalStorage.setItem("vintage_items_list", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));

    showAdminToast(`✅ Applied 15% Price Cut on: "${targetItem.title}" (₦${originalPrice.toLocaleString()} → ₦${cutPrice.toLocaleString()})`);
  };

  // ── Add item prop so we can reload after DB save ─────────────────────────
  const [listingSaving, setListingSaving] = useState(false);

  // Admin manually registers a live listing — saves to DB so all customers see it
  const handleManualListingCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewAddTitle.trim()) {
      showAdminToast("⚠ Please provide a title");
      return;
    }

    const starting = parseFloat(previewStartingBid) || 50;

    // Pick first registered seller if available
    const firstSeller = booths[0];

    const payload = {
      title: previewAddTitle.trim(),
      description: `Authentic archival designer ${previewCategory}. Listed via FitCheck admin workspace.`,
      category: previewCategory,
      era: "90s Archival",
      condition: "Excellent",
      size: previewSize,
      sellerId:     firstSeller?.id     || "admin",
      sellerName:   firstSeller?.name   || "FitCheck",
      sellerAvatar: firstSeller?.avatar || "",
      marketName:   firstSeller?.location || "FitCheck HQ",
      imageUrl: uploadedImageUrl || "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
      startingBid: starting,
      buyPrice: Math.round(starting * 1.5),
      biddingEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
      tags: ["curated", previewCategory.toLowerCase()],
    };

    setListingSaving(true);
    try {
      // Save to DB so every customer sees it
      const { itemsApi, mapDbItem } = await import("../lib/api");
      const saved = await itemsApi.create(payload);
      const mapped = mapDbItem(saved);
      const updated = [mapped as any, ...items];
      setItems(updated);
      setPreviewAddTitle("");
      setUploadedImageUrl("");
      setUploadError("");
      showAdminToast(`✅ "${mapped.title}" listed and saved to database!`);
    } catch (err: any) {
      // Fallback to local if API fails
      showAdminToast(`⚠ DB save failed (${err.message}) — item added locally only.`);
      const localItem = {
        id: `item-${Date.now()}`, ...payload,
        currentBid: starting, bidsCount: 0, highestBidder: null, isSold: false,
        measurements: {}, materials: [], history: "", bidDropped: false, bidDroppedReason: "",
      } as any;
      setItems(prev => [localItem, ...prev]);
    } finally {
      setListingSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setUploadError("Please upload an image file (PNG, JPG, WebP, etc.)");
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setUploadError("Image is too large (max 8MB file size allowed)");
        return;
      }
      setUploadError("");
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setUploadError("Please drop an image file.");
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setUploadError("Image is too large (max 8MB allowed)");
        return;
      }
      setUploadError("");
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // ── Seller management handlers ────────────────────────────────────────────
  const resetSellerForm = () => {
    setSellerForm({ name: "", curator: "", location: "", tagline: "", bio: "", aesthetic: "", established: "", avatar: "", bannerImage: "" });
    setSellerFormError("");
    setEditingSellerId(null);
  };

  const handleSellerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerForm.name.trim() || !sellerForm.curator.trim()) {
      setSellerFormError("Seller name and curator name are required.");
      return;
    }
    setSellerSaving(true);
    setSellerFormError("");
    try {
      const payload = {
        name: sellerForm.name.trim(),
        curator: sellerForm.curator.trim(),
        location: sellerForm.location.trim() || undefined,
        tagline: sellerForm.tagline.trim() || undefined,
        bio: sellerForm.bio.trim() || undefined,
        aesthetic: sellerForm.aesthetic.trim() || undefined,
        established: sellerForm.established.trim() || undefined,
        avatar: sellerForm.avatar.trim() || undefined,
        bannerImage: sellerForm.bannerImage.trim() || undefined,
      };
      if (editingSellerId) {
        await sellersApi.update(editingSellerId, payload);
        showAdminToast(`✅ Seller "${payload.name}" updated.`);
      } else {
        await sellersApi.create(payload);
        showAdminToast(`✅ Seller "${payload.name}" registered.`);
      }
      resetSellerForm();
      await onSellersChanged?.();
    } catch (err: any) {
      setSellerFormError(err.message || "Failed to save seller.");
    } finally {
      setSellerSaving(false);
    }
  };

  const handleEditSeller = (booth: any) => {
    setEditingSellerId(booth.id);
    setSellerForm({
      name: booth.name || "",
      curator: booth.curator || "",
      location: booth.location || "",
      tagline: booth.tagline || "",
      bio: booth.bio || "",
      aesthetic: booth.aesthetic || "",
      established: booth.established || "",
      avatar: booth.avatar || "",
      bannerImage: booth.bannerImage || "",
    });
    setActiveTab("sellers");
  };

  const handleDeleteSeller = async (id: string) => {
    setSellerDeleteLoading(true);
    try {
      await sellersApi.delete(id);
      showAdminToast("✅ Seller removed.");
      setDeletingSellerId(null);
      await onSellersChanged?.();
    } catch (err: any) {
      showAdminToast(`❌ ${err.message}`);
    } finally {
      setSellerDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="admin_dashboard_workspace">

      {/* Inline admin toast notification */}
      {adminToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-stone-900 border border-jumia-orange text-amber-300 px-5 py-3 rounded-xl shadow-2xl text-xs font-mono font-bold animate-fade-in flex items-center gap-2 max-w-lg w-full mx-4">
          <span className="w-2 h-2 rounded-full bg-jumia-orange animate-ping shrink-0"></span>
          {adminToast}
        </div>
      )}
      <div className="bg-[#313131] text-[#FAF9F5] p-6 rounded-2xl border border-stone-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-jumia-orange text-white uppercase font-serif px-2.5 py-0.5 rounded font-bold tracking-wider">
              Secure Cockpit Active
            </span>
            <span className="text-stone-400 font-mono text-[10px]">v1.4.1</span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight font-sans">
            FitCheck Admin Workspace
          </h2>
          <p className="text-stone-300 text-xs font-mono max-w-xl leading-relaxed">
            Authorized Administrator Curator Panel: <strong className="text-emerald-400">{userEmail}</strong>. 
            Listing controls, automated sync hooks, real-time telemetry metrics, and item maintenance logs.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={triggerRandomPriceCut}
            className="px-4 py-2 bg-jumia-orange hover:bg-jumia-orange-hover text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
          >
            <TrendingDown className="w-4 h-4" />
            Trigger instant 15% Price Cut
          </button>
        </div>
      </div>

      {/* 4-Column System Stats Telemetry widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="system_telemetry_metrics">
        
        <div className="bg-white dark:bg-[#181716] p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-50 dark:bg-orange-950/20 text-jumia-orange rounded-lg flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-stone-400 dark:text-stone-500 uppercase font-black">Stock Catalog Assets</p>
            <h4 className="text-lg font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">{totalListings} garments</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-[#181716] p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950/20 text-amber-505 rounded-lg flex items-center justify-center shrink-0">
            <Tag className="w-5 h-5 text-amber-650 dark:text-amber-400 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-stone-400 dark:text-stone-500 uppercase font-black">Catalog Stock Value</p>
            <h4 className="text-lg font-extrabold text-stone-900 dark:text-stone-100 font-mono">₦{totalBidCapital.toLocaleString()} NGN</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-[#181716] p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-stone-400 dark:text-stone-500 uppercase font-black">Atmospheric Carbon Saved</p>
            <h4 className="text-lg font-extrabold text-stone-900 dark:text-stone-100 font-mono text-emerald-600 dark:text-emerald-400">~{totalCarbonOffset} kg</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-[#181716] p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-lg flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-stone-400 dark:text-stone-500 uppercase font-black">Settled sales</p>
            <h4 className="text-lg font-extrabold text-stone-900 dark:text-stone-100 font-mono">{soldItemsCount} checkouts</h4>
          </div>
        </div>

      </div>

      {/* ── Tab switcher: Items / Sellers ── */}
      <div className="flex border-b border-stone-200">
        {[
          { id: "items",   label: "Item Listings" },
          { id: "sellers", label: "Seller Management" },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as "items" | "sellers")}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === t.id
                ? "border-brand text-brand"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── SELLERS PANEL ── */}
      {activeTab === "sellers" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Form */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-brand" />
              {editingSellerId ? "Edit Seller" : "Register New Seller"}
            </h3>

            <form onSubmit={handleSellerSubmit} className="space-y-3">
              {[
                { label: "Seller / Stall Name *", key: "name",      placeholder: "e.g. Neon Nostalgia" },
                { label: "Curator Name *",         key: "curator",   placeholder: "e.g. Chloe Sterling" },
                { label: "Location",               key: "location",  placeholder: "e.g. London, UK (Portobello Road)" },
                { label: "Tagline",                key: "tagline",   placeholder: "e.g. London's premier crate of 70s rebellion" },
                { label: "Aesthetic / Style",      key: "aesthetic", placeholder: "e.g. 70s Rock & Y2K Tech" },
                { label: "Established",            key: "established", placeholder: "e.g. Est. 2011" },
                { label: "Avatar Image URL",       key: "avatar",    placeholder: "https://..." },
                { label: "Banner Image URL",       key: "bannerImage", placeholder: "https://..." },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
                  <input
                    type="text"
                    value={sellerForm[key as keyof typeof sellerForm]}
                    onChange={e => setSellerForm(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-900 outline-none focus:border-brand transition-colors"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Bio</label>
                <textarea
                  value={sellerForm.bio}
                  onChange={e => setSellerForm(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Describe the seller and their sourcing story…"
                  rows={3}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-900 outline-none focus:border-brand transition-colors resize-none"
                />
              </div>

              {sellerFormError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {sellerFormError}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={sellerSaving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60"
                >
                  {sellerSaving
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving…</>
                    : <><Check className="w-3.5 h-3.5" />{editingSellerId ? "Update Seller" : "Register Seller"}</>
                  }
                </button>
                {editingSellerId && (
                  <button
                    type="button"
                    onClick={resetSellerForm}
                    className="px-3 py-2.5 border border-stone-200 text-stone-600 text-xs font-semibold rounded-lg hover:bg-stone-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Seller list */}
          <div className="xl:col-span-2 bg-white border border-stone-200 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-stone-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Store className="w-4 h-4 text-brand" />
                Registered Sellers ({booths.length})
              </span>
            </h3>

            {booths.length === 0 ? (
              <div className="text-center py-12 text-stone-400">
                <Store className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No sellers registered yet.</p>
                <p className="text-xs mt-1">Use the form to register your first seller.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {booths.map(booth => (
                  <div key={booth.id} className="border border-stone-100 rounded-xl p-4 flex items-start gap-3">
                    {booth.avatar && (
                      <img
                        src={booth.avatar}
                        alt={booth.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-stone-200"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-stone-900 truncate">{booth.name}</p>
                          <p className="text-xs text-stone-500">by {booth.curator} · {booth.location || "—"}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleEditSeller(booth)}
                            className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {deletingSellerId === booth.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDeleteSeller(booth.id)}
                                disabled={sellerDeleteLoading}
                                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg"
                              >
                                {sellerDeleteLoading ? "…" : "Confirm"}
                              </button>
                              <button
                                onClick={() => setDeletingSellerId(null)}
                                className="px-2 py-1 border border-stone-200 text-stone-600 text-xs rounded-lg hover:bg-stone-50"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingSellerId(booth.id)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      {booth.tagline && (
                        <p className="text-xs text-stone-500 italic mt-1 truncate">"{booth.tagline}"</p>
                      )}
                      {booth.aesthetic && (
                        <span className="inline-block mt-1.5 text-[10px] bg-orange-50 text-brand border border-orange-200 px-2 py-0.5 rounded-full font-medium">
                          {booth.aesthetic}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ITEMS PANEL (existing content) ── */}
      {activeTab === "items" && (
        <React.Fragment>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Simplified Garment Creator (Saves typing long forms) */}
        <div className="bg-white dark:bg-[#181716] p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
          <h3 className="text-xs uppercase font-black text-stone-900 dark:text-stone-100 tracking-wider flex items-center gap-1.5 pb-2 border-b border-stone-100 dark:border-stone-800">
            <span className="w-1.5 h-3.5 bg-jumia-orange rounded-sm block"></span>
            Admin Fast-List Curate Panel
          </h3>

          <form onSubmit={handleManualListingCreate} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-stone-500 font-bold uppercase block">Garment Name/Title</label>
              <input
                type="text"
                required
                value={previewAddTitle}
                onChange={(e) => setPreviewAddTitle(e.target.value)}
                placeholder="Ex: 1991 Carhartt Active Canvas Jacket"
                className="w-full border border-stone-300 dark:border-stone-700 p-2 text-xs rounded bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 outline-none focus:border-jumia-orange"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-stone-500 font-bold uppercase block">Department</label>
                <select
                  value={previewCategory}
                  onChange={(e) => setPreviewCategory(e.target.value)}
                  className="w-full border border-stone-300 dark:border-stone-700 p-2 text-xs rounded bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 outline-none cursor-pointer"
                >
                  <option value="Outerwear">Outerwear</option>
                  <option value="Tops">Tops</option>
                  <option value="Bottoms">Bottoms</option>
                  <option value="Dresses">Dresses</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-stone-500 font-bold uppercase block">Size Tag</label>
                <select
                  value={previewSize}
                  onChange={(e) => setPreviewSize(e.target.value)}
                  className="w-full border border-stone-300 dark:border-stone-700 p-2 text-xs rounded bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 outline-none cursor-pointer"
                >
                  <option value="S">Small (S)</option>
                  <option value="M">Medium (M)</option>
                  <option value="L">Large (L)</option>
                  <option value="XL">Extra Large (XL)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-stone-500 font-bold uppercase block">Retail Price (₦ Naira / NGN)</label>
              <input
                type="number"
                required
                value={previewStartingBid}
                onChange={(e) => setPreviewStartingBid(e.target.value)}
                className="w-full border border-stone-300 dark:border-stone-700 p-2 text-xs rounded bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 outline-none focus:border-jumia-orange"
              />
            </div>

            {/* Local Storage Drag-and-Drop Image Uploader */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[10px] font-mono text-stone-500 font-bold uppercase block">
                Couture Garment Image (Local Device Upload)
              </label>
              
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                  isDragging 
                    ? "border-jumia-orange bg-orange-50/10" 
                    : "border-stone-300 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-600 bg-stone-50/30 dark:bg-stone-900/30"
                }`}
              >
                <input
                  type="file"
                  id="garment_image_file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {uploadedImageUrl ? (
                  <div className="space-y-3 relative" id="image-upload-preview-container">
                    <img 
                      src={uploadedImageUrl} 
                      alt="Garment Preview" 
                      className="max-h-36 mx-auto rounded-lg object-contain shadow-sm border border-stone-200 dark:border-stone-800"
                    />
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedImageUrl("");
                          setUploadError("");
                        }}
                        className="py-1 px-3 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-mono uppercase font-black transition-all cursor-pointer"
                      >
                        Remove
                      </button>
                      <label 
                        htmlFor="garment_image_file"
                        className="py-1 px-3 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded text-[10px] font-mono uppercase font-black transition-all cursor-pointer"
                      >
                        Change Image
                      </label>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="garment_image_file" className="block cursor-pointer py-3 space-y-2">
                    <div className="flex justify-center">
                      <UploadCloud className="w-8 h-8 text-stone-400 dark:text-stone-500 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                        Drag & drop a local image, or <span className="text-jumia-orange underline">browse device</span>
                      </p>
                      <p className="text-[9px] text-stone-400 mt-1 uppercase font-mono tracking-wider">
                        PNG, JPG, WEBP • Max 8MB
                      </p>
                    </div>
                  </label>
                )}
              </div>

              {uploadError && (
                <p className="text-[10px] text-red-600 font-mono font-semibold animate-pulse mt-1">
                  ⚠ {uploadError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={listingSaving}
              className="w-full py-2.5 bg-stone-900 dark:bg-stone-800 hover:bg-stone-950 dark:hover:bg-stone-700 text-white rounded font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1 disabled:opacity-60"
            >
              {listingSaving ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Saving to database…</>
              ) : (
                <><Plus className="w-4 h-4 text-jumia-orange" />Publish & Save to DB</>
              )}
            </button>
          </form>

          {/* Quick Info text block */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-150 dark:border-blue-900/40 rounded text-[10px] text-stone-605 dark:text-stone-300 leading-relaxed space-y-1">
            <span className="font-bold text-stone-850 dark:text-stone-200 block">Real-Time Data Streams API</span>
            <p>
              Publishing adds pieces live into user browsers instantly. Users bidding on other tabs will see these updates in real-time without refreshing. No automated listing bots are added, satisfying your specific directive.
            </p>
          </div>
        </div>


        {/* MAIN COLUMN: Active Stock Management list */}
        <div className="col-span-1 xl:col-span-2 bg-white dark:bg-[#181716] p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-150 dark:border-stone-800">
            <h3 className="text-xs uppercase font-black text-stone-900 dark:text-stone-100 tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-jumia-orange rounded-sm block"></span>
              Live Catalog Control Board
            </h3>
            <span className="text-[10px] text-stone-400 font-mono">
              Count: {items.length} items cataloged
            </span>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 no-scrollbar" id="catalog_control_panel">
            {items.map((item) => {
              const isEditing = editingItemId === item.id;
              const isConfirmingDelete = confirmingDeleteId === item.id;
              return (
                <div 
                  key={item.id}
                  className={`p-3 border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs transition-all duration-200 ${
                    item.isSold ? "bg-stone-50 border-stone-150 opacity-70" : "bg-white border-stone-200 hover:bg-stone-50/50"
                  } dark:bg-stone-900/40 dark:border-stone-800`}
                >
                  {isConfirmingDelete ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-red-50/90 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-2.5 rounded-lg w-full animate-fade-in" id={`confirm_delete_panel_${item.id}`}>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 animate-pulse" />
                        <div className="space-y-0.5">
                          <p className="font-sans font-bold text-red-800 dark:text-red-300">Confirm Curation Takedown?</p>
                          <p className="text-[10px] text-red-600/80 dark:text-red-405 font-mono">Purge "{item.title}" immediately from catalog?</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => handleTakedownListing(item.id)}
                          className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Purge Item
                        </button>
                        <button
                          onClick={() => setConfirmingDeleteId(null)}
                          className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-300 rounded font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-10 h-10 object-cover rounded border border-stone-200 shrink-0" 
                        />
                        <div className="space-y-0.5">
                          {isEditing ? (
                            <div className="space-y-1.5">
                              <input 
                                type="text" 
                                value={editedTitle} 
                                onChange={(e) => setEditedTitle(e.target.value)}
                                className="bg-white border border-stone-300 p-1 rounded font-bold text-stone-900 text-xs w-full max-w-xs"
                                placeholder="Item title"
                              />
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] shrink-0">Price ₦:</span>
                                <input 
                                  type="number" 
                                  value={editedPrice} 
                                  onChange={(e) => setEditedPrice(e.target.value)}
                                  className="bg-white border border-stone-300 p-0.5 rounded font-mono text-xs w-20"
                                  title="Set current price"
                                />
                              </div>
                              <input
                                type="text"
                                value={priceCutReason}
                                onChange={(e) => setPriceCutReason(e.target.value)}
                                placeholder="Price cut reason (optional)"
                                className="bg-white border border-stone-300 p-1 rounded text-stone-700 text-[10px] w-full max-w-xs font-mono"
                              />
                            </div>
                          ) : (
                            <h4 className="font-sans font-bold text-stone-900 dark:text-stone-100 line-clamp-1">{item.title}</h4>
                          )}
                          
                          <div className="flex flex-wrap gap-2 text-[10px] text-stone-500 font-mono pt-0.5">
                            <span className="bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded text-stone-700 dark:text-stone-300">size {item.size}</span>
                            <span className="bg-orange-50 dark:bg-orange-950/40 px-1 py-0.5 rounded text-jumia-orange dark:text-orange-400 font-bold">price: ₦{item.currentBid.toLocaleString()}</span>
                            {item.bidDropped && (
                              <span className="bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 px-1 py-0.5 rounded border border-teal-200 dark:border-teal-900/50 font-bold">
                                ↓ price cut
                              </span>
                            )}
                            {item.isSold ? (
                              <span className="bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 px-1 py-0.5 rounded font-bold">SOLD OUT</span>
                            ) : (
                              <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-1 py-0.5 rounded font-bold">ACTIVE</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Operational actions */}
                      <div className="flex items-center gap-2" id="editing_admin_actions">
                        {isEditing ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleSaveEdits(item.id)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px] transition-colors cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingItemId(null)}
                              className="px-2 py-1 bg-stone-400 hover:bg-stone-500 text-white rounded font-bold text-[10px] transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(item)}
                              className="p-1.5 text-stone-600 dark:text-stone-450 hover:text-jumia-orange hover:bg-stone-100 dark:hover:bg-stone-800 rounded transition-colors"
                              title="Edit garments specs / drop price"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setConfirmingDeleteId(item.id)}
                              className="p-1.5 text-stone-600 dark:text-stone-450 hover:text-rose-600 hover:bg-stone-100 dark:hover:bg-stone-800 rounded transition-colors"
                              title="Revoke & delete listing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* Orders log */}
      <div className="bg-white dark:bg-[#181716] p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <h3 className="text-xs uppercase font-black text-stone-900 dark:text-stone-100 tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-3.5 bg-jumia-orange rounded-sm block"></span>
          Checkout Log ({bidLogs.length} orders)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 font-mono text-[10px] uppercase">
                <th className="py-2.5">Buyer</th>
                <th className="py-2.5">Item</th>
                <th className="py-2.5">Amount</th>
                <th className="py-2.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {bidLogs.slice().reverse().map((bid, idx) => (
                <tr key={bid.id || idx} className="hover:bg-stone-50/50">
                  <td className="py-2.5 text-stone-800 font-bold">{bid.bidderName}</td>
                  <td className="py-2.5 text-stone-600 max-w-[200px] truncate">{bid.itemTitle}</td>
                  <td className="py-2.5 text-brand font-mono font-bold">₦{bid.amount.toLocaleString()}</td>
                  <td className="py-2.5 text-stone-400 text-[10px] font-mono">
                    {new Date(bid.timestamp).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bidLogs.length === 0 && (
            <div className="text-center py-6 text-stone-400 text-xs">No orders yet.</div>
          )}
        </div>
      </div>
        </React.Fragment>
      )}

    </div>
  );
}
