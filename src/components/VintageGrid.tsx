import React, { useState, useEffect } from "react";
import { VintageItem } from "../types";
import { Heart, Clock, Star, TrendingDown, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VintageGridProps {
  items: VintageItem[];
  onSelectItem: (item: VintageItem) => void;
  selectedBoothId: string | null;
  clearBoothFilter: () => void;
  wishlist?: string[];
  onToggleWishlist?: (itemId: string) => void;
  isWishlistView?: boolean;
  isGuest?: boolean;
  onAuthRequired?: () => void;
}

const CATEGORIES = ["All", "Outerwear", "Tops", "Bottoms", "Dresses"];
const ERAS       = ["All", "70s", "80s", "90s", "Y2K"];
const LOCATIONS  = ["All", "London", "Tokyo", "Brooklyn", "Milan"];
const SORT_OPTIONS = [
  { value: "default",   label: "Most relevant" },
  { value: "low-bid",   label: "Price: Low to High" },
  { value: "high-bid",  label: "Price: High to Low" },
  { value: "newest",    label: "Newest first" },
];

function getCountdown(endStr: string) {
  const diff = new Date(endStr).getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const h = Math.floor(diff / 3_600_000);
  if (h >= 24) return `${Math.floor(h / 24)}d left`;
  if (h >= 1)  return `${h}h left`;
  return `${Math.floor(diff / 60_000)}m left`;
}

function isEndingSoon(endStr: string) {
  return new Date(endStr).getTime() - Date.now() < 3_600_000 * 6;
}

export default function VintageGrid({
  items, onSelectItem,
  selectedBoothId, clearBoothFilter,
  wishlist = [], onToggleWishlist,
  isWishlistView = false,
  isGuest = false,
  onAuthRequired,
}: VintageGridProps) {
  const [category, setCategory]   = useState("All");
  const [era, setEra]             = useState("All");
  const [location, setLocation]   = useState("All");
  const [sortBy, setSortBy]       = useState("default");
  const [filterOpen, setFilterOpen] = useState(false);
  const [, tick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => tick(n => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  const filtered = items
    .filter(i => selectedBoothId ? i.sellerId === selectedBoothId : true)
    .filter(i => category === "All" || i.category.toLowerCase() === category.toLowerCase())
    .filter(i => era      === "All" || i.era.toLowerCase().includes(era.toLowerCase()))
    .filter(i => location === "All" || i.marketName.toLowerCase().includes(location.toLowerCase()));

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "high-bid") return b.currentBid - a.currentBid;
    if (sortBy === "low-bid")  return a.currentBid - b.currentBid;
    if (sortBy === "newest")   return b.id.localeCompare(a.id);
    return 0;
  });

  const hasFilters = category !== "All" || era !== "All" || location !== "All" || !!selectedBoothId;

  const clearAll = () => {
    setCategory("All");
    setEra("All");
    setLocation("All");
    clearBoothFilter();
  };

  return (
    <div className="space-y-5">

      {/* ── Filter / sort bar ── */}
      {!isWishlistView && (
        <div className="flex flex-wrap items-center gap-3">

          {/* Category chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  category === c
                    ? "bg-stone-900 text-white border-stone-900"
                    : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                }`}
              >
                {c === "All" ? "All items" : c}
              </button>
            ))}
          </div>

          {/* More filters button */}
          <button
            onClick={() => setFilterOpen(p => !p)}
            className="ml-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border border-stone-200 bg-white text-stone-600 hover:border-stone-400 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasFilters && <span className="w-2 h-2 bg-brand rounded-full"></span>}
          </button>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-full text-sm font-medium border border-stone-200 bg-white text-stone-600 outline-none cursor-pointer hover:border-stone-400 transition-colors"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
          </div>
        </div>
      )}

      {/* ── Expanded filters panel ── */}
      <AnimatePresence>
        {filterOpen && !isWishlistView && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-stone-200 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {/* Era */}
              <div>
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Era</p>
                <div className="flex flex-wrap gap-1.5">
                  {ERAS.map(e => (
                    <button
                      key={e}
                      onClick={() => setEra(e)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        era === e ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                      }`}
                    >
                      {e === "All" ? "All eras" : e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Location</p>
                <div className="flex flex-wrap gap-1.5">
                  {LOCATIONS.map(l => (
                    <button
                      key={l}
                      onClick={() => setLocation(l)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        location === l ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                      }`}
                    >
                      {l === "All" ? "Worldwide" : l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear */}
              <div className="flex items-end">
                {hasFilters && (
                  <button
                    onClick={clearAll}
                    className="flex items-center gap-1.5 text-sm text-rose-600 hover:text-rose-700 font-medium"
                  >
                    <X className="w-4 h-4" />
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Active filter badges ── */}
      {(selectedBoothId || hasFilters) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-stone-500">{sorted.length} results</span>
          {selectedBoothId && (
            <span className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
              Seller filter active
              <button onClick={clearBoothFilter} className="hover:text-amber-900"><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}

      {/* ── Empty state ── */}
      {sorted.length === 0 && (
        <div className="text-center py-20 bg-white border border-dashed border-stone-200 rounded-2xl">
          <p className="text-2xl mb-2">🔍</p>
          <h3 className="text-lg font-semibold text-stone-800">No items found</h3>
          <p className="text-sm text-stone-500 mt-1">Try adjusting your filters</p>
          {hasFilters && (
            <button onClick={clearAll} className="mt-4 text-sm text-brand font-semibold hover:underline">
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* ── Product grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {sorted.map(item => (
            <ProductCard
              key={item.id}
              item={item}
              onSelect={() => onSelectItem(item)}
              inWishlist={wishlist.includes(item.id)}
              onToggleWishlist={isGuest ? onAuthRequired : onToggleWishlist}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({
  item, onSelect, inWishlist, onToggleWishlist,
}: {
  item: VintageItem;
  onSelect: () => void;
  inWishlist: boolean;
  onToggleWishlist?: ((id: string) => void) | (() => void);
}) {
  const countdown = getCountdown(item.biddingEndsAt);
  const endingSoon = isEndingSoon(item.biddingEndsAt);
  const price = item.buyPrice ?? item.currentBid;

  // star rating derived from bid count
  const stars = item.bidsCount >= 10 ? 5 : item.bidsCount >= 5 ? 4 : item.bidsCount >= 2 ? 3 : 3;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="group bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col"
      onClick={onSelect}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Sold overlay */}
        {item.isSold && (
          <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center">
            <span className="bg-white text-stone-900 font-bold text-sm px-4 py-1.5 rounded-full -rotate-6 shadow-lg">
              SOLD
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {item.bidDropped && (
            <span className="flex items-center gap-1 bg-teal-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              <TrendingDown className="w-2.5 h-2.5" />
              Price drop
            </span>
          )}
          <span className="bg-stone-900/80 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
            {item.era}
          </span>
        </div>

        {/* Wishlist */}
        <button
          onClick={e => { e.stopPropagation(); onToggleWishlist ? (onToggleWishlist as any)(item.id) : undefined; }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center shadow-sm border transition-colors ${
            inWishlist
              ? "bg-rose-50 border-rose-200 text-rose-500"
              : "bg-white border-stone-200 text-stone-400 hover:text-rose-500"
          }`}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? "fill-rose-500" : ""}`} />
        </button>

        {/* Countdown */}
        {!item.isSold && (
          <div className={`absolute bottom-2.5 left-2.5 flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${
            endingSoon ? "bg-red-600 text-white" : "bg-black/60 text-white"
          }`}>
            <Clock className="w-2.5 h-2.5" />
            {countdown}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="text-[11px] text-stone-400 font-medium truncate">{item.sellerName} · {item.category}</p>
        <h3 className="text-sm font-semibold text-stone-900 line-clamp-2 leading-snug group-hover:text-brand transition-colors">
          {item.title}
        </h3>

        {/* Stars */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < stars ? "fill-amber-400 text-amber-400" : "text-stone-200"}`} />
          ))}
        </div>

        {/* Price */}
        <div className="mt-auto pt-1.5 flex items-center justify-between">
          <div>
            <span className="text-base font-bold text-stone-900">₦{price.toLocaleString()}</span>
            {item.buyPrice && item.currentBid < item.buyPrice && (
              <span className="ml-1.5 text-xs text-stone-400 line-through">₦{item.buyPrice.toLocaleString()}</span>
            )}
          </div>
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
            item.condition === "Pristine Vintage" ? "bg-emerald-50 text-emerald-700" :
            item.condition === "Excellent"        ? "bg-blue-50 text-blue-700" :
            "bg-stone-100 text-stone-600"
          }`}>
            {item.condition}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
