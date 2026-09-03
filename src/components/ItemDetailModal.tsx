import React, { useState, useEffect } from "react";
import { VintageItem, BidRecord } from "../types";
import { safeLocalStorage } from "../lib/storage";
import {
  X, Heart, Share2, Check, CheckCircle, Clock,
  MapPin, Tag, Ruler, Shield, Send, ShoppingBag,
  ChevronUp, ChevronDown, Star
} from "lucide-react";
import { motion } from "motion/react";

interface ItemDetailModalProps {
  item: VintageItem | null;
  onClose: () => void;
  onPlaceBid: (itemId: string, amount: number, bidderName: string) => void;
  onBuyNow: (itemId: string, buyerName: string) => void;
  bidLogs: BidRecord[];
  wishlist?: string[];
  onToggleWishlist?: (itemId: string) => void;
}

function getCountdown(endStr: string) {
  const diff = new Date(endStr).getTime() - Date.now();
  if (diff <= 0) return "Auction ended";
  const h = Math.floor(diff / 3_600_000);
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h remaining`;
  if (h >= 1)  return `${h}h ${Math.floor((diff % 3_600_000) / 60_000)}m remaining`;
  return `${Math.floor(diff / 60_000)}m remaining`;
}

export default function ItemDetailModal({
  item, onClose, onPlaceBid, onBuyNow,
  bidLogs, wishlist = [], onToggleWishlist,
}: ItemDetailModalProps) {
  const [mode, setMode]                 = useState<"bid" | "buy">("bid");
  const [buyerName, setBuyerName]       = useState("");
  const [bidAmount, setBidAmount]       = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bidSuccess, setBidSuccess]     = useState("");
  const [buySuccess, setBuySuccess]     = useState("");
  const [error, setError]               = useState("");
  const [copied, setCopied]             = useState(false);
  const [detailsOpen, setDetailsOpen]   = useState(false);

  useEffect(() => {
    if (!item) return;
    const name = safeLocalStorage.getItem("user_name") || safeLocalStorage.getItem("vintage_bidder_name") || "";
    setBuyerName(name);
    setBidAmount((item.currentBid || item.startingBid || 0) + 10);
    setBidSuccess(""); setBuySuccess(""); setError("");
    setMode("bid");
  }, [item?.id]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!item) return null;

  const price      = item.buyPrice ?? item.currentBid;
  const minBid     = (item.currentBid || item.startingBid || 0) + 1;
  const inWishlist = wishlist.includes(item.id);
  const itemBids   = bidLogs.filter(b => b.itemId === item.id);

  const handleShare = async () => {
    const url = `${window.location.origin}/?item=${item.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };

  const handleBid = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!buyerName.trim()) { setError("Please enter your name."); return; }
    if (bidAmount < minBid) { setError(`Minimum bid is ₦${minBid.toLocaleString()}.`); return; }
    setIsProcessing(true);
    setTimeout(() => {
      onPlaceBid(item.id, bidAmount, buyerName.trim());
      safeLocalStorage.setItem("vintage_bidder_name", buyerName.trim());
      setBidSuccess(`Your bid of ₦${bidAmount.toLocaleString()} was placed successfully!`);
      setIsProcessing(false);
    }, 800);
  };

  const handleBuy = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!buyerName.trim()) { setError("Please enter your name to continue."); return; }
    setIsProcessing(true);
    setTimeout(() => {
      onBuyNow(item.id, buyerName.trim());
      safeLocalStorage.setItem("vintage_bidder_name", buyerName.trim());
      setBuySuccess(`Order placed! ₦${price.toLocaleString()} · ${buyerName.trim()}`);
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white w-full sm:max-w-4xl rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row max-h-[95vh] sm:max-h-[90vh]"
      >
        {/* ── Image panel ── */}
        <div className="w-full lg:w-[45%] relative bg-stone-100 shrink-0">
          <img
            src={item.imageUrl}
            alt={item.title}
            referrerPolicy="no-referrer"
            className="w-full h-64 sm:h-80 lg:h-full object-cover"
          />

          {/* Sold overlay */}
          {item.isSold && (
            <div className="absolute inset-0 bg-stone-900/70 flex items-center justify-center">
              <span className="bg-white text-stone-900 font-bold text-lg px-6 py-2 rounded-full -rotate-6 shadow-xl">
                SOLD
              </span>
            </div>
          )}

          {/* Top-left badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <span className="bg-stone-900/80 text-white text-xs font-medium px-2.5 py-1 rounded-full">
              {item.era}
            </span>
            {item.bidDropped && (
              <span className="bg-teal-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                Price drop
              </span>
            )}
          </div>

          {/* Top-right actions */}
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-stone-700 hover:bg-white shadow-sm transition-colors"
              aria-label="Share"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
            {onToggleWishlist && (
              <button
                onClick={() => onToggleWishlist(item.id)}
                className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-colors ${
                  inWishlist ? "bg-rose-500 text-white" : "bg-white/90 text-stone-700 hover:bg-white"
                }`}
                aria-label={inWishlist ? "Remove from wishlist" : "Save"}
              >
                <Heart className={`w-4 h-4 ${inWishlist ? "fill-white" : ""}`} />
              </button>
            )}
          </div>

          {/* Source badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
            <MapPin className="w-3 h-3" />
            {item.marketName}
          </div>
        </div>

        {/* ── Info panel ── */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between p-5 pb-0">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-brand bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                  {item.category}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  item.condition === "Pristine Vintage" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                  item.condition === "Excellent"        ? "bg-blue-50 text-blue-700 border border-blue-200" :
                  "bg-stone-100 text-stone-600 border border-stone-200"
                }`}>
                  {item.condition}
                </span>
              </div>
              <h2 className="font-serif text-xl font-bold text-stone-900 leading-snug">
                {item.title}
              </h2>
              <p className="text-sm text-stone-500 mt-1">
                by <span className="font-medium text-stone-700">{item.sellerName}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200 shrink-0 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Price & auction info */}
          <div className="px-5 py-4 border-b border-stone-100">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-stone-900">₦{price.toLocaleString()}</span>
              {item.buyPrice && item.currentBid < item.buyPrice && (
                <span className="text-sm text-stone-400 line-through">₦{item.buyPrice.toLocaleString()}</span>
              )}
              <span className="text-xs text-stone-500">Size: <strong>{item.size}</strong></span>
            </div>

            {!item.isSold && (
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <div className="flex items-center gap-1.5 text-sm text-stone-600">
                  <Clock className="w-4 h-4 text-brand" />
                  <span>{getCountdown(item.biddingEndsAt)}</span>
                </div>
                {item.bidsCount > 0 && (
                  <span className="text-sm text-stone-500">
                    {item.bidsCount} {item.bidsCount === 1 ? "bid" : "bids"}
                    {item.highestBidder && (
                      <span className="ml-1">· Top: <strong className="text-stone-700">{item.highestBidder}</strong></span>
                    )}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Trust badges */}
          <div className="px-5 py-3 flex flex-wrap gap-3 border-b border-stone-100 bg-stone-50">
            <span className="flex items-center gap-1.5 text-xs text-stone-600">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              Provenance verified
            </span>
            <span className="flex items-center gap-1.5 text-xs text-stone-600">
              <Ruler className="w-3.5 h-3.5 text-blue-500" />
              Flat measurements included
            </span>
            <span className="flex items-center gap-1.5 text-xs text-stone-600">
              <Tag className="w-3.5 h-3.5 text-amber-500" />
              Authentic {item.era} piece
            </span>
          </div>

          {/* Action area */}
          <div className="p-5 flex-1">
            {item.isSold ? (
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-stone-800">This item has been sold</p>
                <p className="text-sm text-stone-500 mt-1">Check out similar pieces in the collection</p>
              </div>
            ) : buySuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="font-semibold text-emerald-800">Order confirmed!</p>
                <p className="text-sm text-emerald-700">{buySuccess}</p>
              </div>
            ) : bidSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-800 text-sm">Bid placed!</p>
                  <p className="text-sm text-emerald-700 mt-0.5">{bidSuccess}</p>
                  <button
                    onClick={() => { setBidSuccess(""); setBidAmount(bidAmount + 10); }}
                    className="mt-2 text-xs text-emerald-700 font-semibold hover:underline"
                  >
                    Place a higher bid
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mode toggle */}
                <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 rounded-xl">
                  <button
                    onClick={() => { setMode("bid"); setError(""); }}
                    className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
                      mode === "bid" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
                    }`}
                  >
                    Place a bid
                  </button>
                  <button
                    onClick={() => { setMode("buy"); setError(""); }}
                    className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
                      mode === "buy" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
                    }`}
                  >
                    Buy now · ₦{price.toLocaleString()}
                  </button>
                </div>

                {/* Name input (shared) */}
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1.5">Your name</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={e => setBuyerName(e.target.value)}
                    placeholder="Enter your name"
                    disabled={isProcessing}
                    className="w-full border border-stone-200 rounded-lg py-2.5 px-3 text-sm text-stone-900 outline-none focus:border-brand transition-colors disabled:opacity-50"
                  />
                </div>

                {mode === "bid" && (
                  <form onSubmit={handleBid} className="space-y-3">
                    {/* Current bid info */}
                    <div className="bg-stone-50 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-stone-500">Current highest bid</p>
                        <p className="font-bold text-stone-900">₦{(item.currentBid || item.startingBid || 0).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-stone-500">Your minimum</p>
                        <p className="font-bold text-brand">₦{minBid.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Bid amount */}
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1.5">Your bid (₦)</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setBidAmount(a => Math.max(minBid, a - 10))}
                          className="w-10 h-10 rounded-lg border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          value={bidAmount}
                          onChange={e => setBidAmount(Number(e.target.value))}
                          min={minBid}
                          disabled={isProcessing}
                          className="flex-1 border border-stone-200 rounded-lg py-2.5 px-3 text-sm font-bold text-stone-900 text-center outline-none focus:border-brand transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setBidAmount(a => a + 10)}
                          className="w-10 h-10 rounded-lg border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                      </div>
                      {/* Quick increments */}
                      <div className="flex gap-2 mt-2">
                        {[50, 100, 250, 500].map(inc => (
                          <button
                            key={inc}
                            type="button"
                            onClick={() => setBidAmount((item.currentBid || item.startingBid || 0) + inc)}
                            className="flex-1 py-1.5 text-xs font-medium border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors"
                          >
                            +₦{inc}
                          </button>
                        ))}
                      </div>
                    </div>

                    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isProcessing ? (
                        <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Placing bid…</>
                      ) : (
                        <><Send className="w-4 h-4" />Place bid · ₦{bidAmount.toLocaleString()}</>
                      )}
                    </button>
                  </form>
                )}

                {mode === "buy" && (
                  <form onSubmit={handleBuy} className="space-y-3">
                    <div className="bg-stone-50 rounded-xl p-4 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-600">Item price</span>
                        <span className="font-semibold text-stone-900">₦{price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-600">Shipping</span>
                        <span className="text-stone-600">Calculated at checkout</span>
                      </div>
                      <div className="border-t border-stone-200 pt-2 mt-2 flex justify-between">
                        <span className="font-semibold text-stone-900">Total</span>
                        <span className="font-bold text-stone-900">₦{price.toLocaleString()}</span>
                      </div>
                    </div>

                    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-3.5 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isProcessing ? (
                        <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing…</>
                      ) : (
                        <><ShoppingBag className="w-4 h-4" />Buy now · ₦{price.toLocaleString()}</>
                      )}
                    </button>
                    <p className="text-xs text-stone-500 text-center">You'll complete payment at checkout</p>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Collapsible details */}
          <div className="border-t border-stone-100">
            <button
              onClick={() => setDetailsOpen(p => !p)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
            >
              <span>Item details</span>
              {detailsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
            {detailsOpen && (
              <div className="px-5 pb-5 space-y-3 text-sm text-stone-600">
                {item.description && <p className="leading-relaxed">{item.description}</p>}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {item.size && <div><span className="text-stone-400">Size</span><br /><span className="font-medium text-stone-800">{item.size}</span></div>}
                  {item.era  && <div><span className="text-stone-400">Era</span><br /><span className="font-medium text-stone-800">{item.era}</span></div>}
                  {item.condition && <div><span className="text-stone-400">Condition</span><br /><span className="font-medium text-stone-800">{item.condition}</span></div>}
                  {item.materials?.length ? <div><span className="text-stone-400">Materials</span><br /><span className="font-medium text-stone-800">{item.materials.join(", ")}</span></div> : null}
                </div>
                {item.measurements && Object.keys(item.measurements).length > 0 && (
                  <div>
                    <p className="text-xs text-stone-400 mb-1.5 font-medium">Flat measurements</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(item.measurements).map(([k, v]) => v && (
                        <span key={k} className="text-xs bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full font-medium">
                          {k}: {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {item.history && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-900 leading-relaxed italic">
                    {item.history}
                  </div>
                )}
                {/* Recent bids */}
                {itemBids.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-stone-500 mb-2">Recent bids</p>
                    <div className="space-y-1.5">
                      {itemBids.slice(-4).reverse().map(b => (
                        <div key={b.id} className="flex items-center justify-between text-xs">
                          <span className="text-stone-700 font-medium">{b.bidderName}</span>
                          <span className="text-stone-900 font-bold">₦{b.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
