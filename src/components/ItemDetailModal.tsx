import React, { useState, useEffect } from "react";
import { VintageItem, BidRecord } from "../types";
import { safeLocalStorage } from "../lib/storage";
import { X, CheckCircle, Clock, ShoppingCart, Tag, Ruler, Heart, Shield, Sparkles, Send, CreditCard, Compass, Smartphone, Fingerprint, Lock, Info, Check, Share2 } from "lucide-react";
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

export default function ItemDetailModal({ 
  item, 
  onClose, 
  onPlaceBid, 
  onBuyNow, 
  bidLogs,
  wishlist = [],
  onToggleWishlist
}: ItemDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"provenance" | "fit" | "transit" | "trend">("provenance");
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (!item) return;
    const shareUrl = `${window.location.origin}/?item=${item.id}`;
    const shareTitle = `FitCheck: ${item.title}`;
    const shareText = `Check out this rare ${item.era} ${item.title} sourced from ${item.marketName} on FitCheck!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    }
  };

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentOption, setPaymentOption] = useState<"credit" | "apple" | "paypal" | "mobile">("credit");
  
  // Custom states for Live Bidding feature
  const [interactionMode, setInteractionMode] = useState<"checkout" | "bid">("bid");
  const [customBidAmount, setCustomBidAmount] = useState<number>(0);
  const [bidSuccessMsg, setBidSuccessMsg] = useState("");
  
  // Card states
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  
  // Mobile money states
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileProvider, setMobileProvider] = useState<"mpesa" | "orange" | "wave">("mpesa");
  
  // Paypal states
  const [paypalEmail, setPaypalEmail] = useState("");
  
  // Apple/Google biometric simulation states
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Card formatting helpers
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const parts = [];
    for (let i = 0, len = v.length; i < len; i += 4) {
      parts.push(v.substring(i, i + 4));
    }
    return parts.join(" ").slice(0, 19);
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length > 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`.slice(0, 5);
    }
    return v.slice(0, 2);
  };

  const getCardBrand = (num: string) => {
    const cleanNum = num.replace(/\s/g, "");
    if (cleanNum.startsWith("4")) return "Visa";
    if (cleanNum.startsWith("5")) return "Mastercard";
    if (cleanNum.startsWith("3")) return "Amex";
    return "CuratorCard";
  };

  const triggerBiometricScan = () => {
    setBiometricScanning(true);
    setErrorMessage("");
    setTimeout(() => {
      setBiometricScanning(false);
      setBiometricSuccess(true);
    }, 1800);
  };

  // Auto-fill buyer particulars from Auth or localStorage
  useEffect(() => {
    const savedName = safeLocalStorage.getItem("user_name") || safeLocalStorage.getItem("vintage_bidder_name") || "";
    const savedEmail = safeLocalStorage.getItem("user_email") || "";
    const savedPhone = safeLocalStorage.getItem("user_phone") || "";
    setBuyerName(savedName);
    setCardHolder(savedName || "ARCHIVAL GUEST");
    setBuyerEmail(savedEmail);
    setBuyerPhone(savedPhone);
  }, [item]);

  // Synchronise custom bid input to (current highest bid + 10) on load or item change
  useEffect(() => {
    if (item) {
      const baseBid = item.currentBid || item.startingBid || 100;
      setCustomBidAmount(baseBid + 10);
      setBidSuccessMsg("");
      setErrorMessage("");
    }
  }, [item?.id, item?.currentBid]);

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    if (!buyerName.trim()) {
      setErrorMessage("Please specify your Bidder Name / Signature to authorize bid.");
      return;
    }
    const currentHighPrice = item.currentBid || item.startingBid || 0;
    if (customBidAmount <= currentHighPrice) {
      setErrorMessage(`Your offer must exceed the active highest bid of ₦${currentHighPrice.toLocaleString()}.`);
      return;
    }

    setErrorMessage("");
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      safeLocalStorage.setItem("vintage_bidder_name", buyerName.trim());
      
      // Execute live callback to main App state
      onPlaceBid(item.id, customBidAmount, buyerName.trim());
      
      setBidSuccessMsg(`Couture Bid of ₦${customBidAmount.toLocaleString()} officially secured! You are now the leading bidder.`);
    }, 1200);
  };

  if (!item) return null;

  const priceToPay = item.buyPrice || item.currentBid || 120;
  
  // Calculate crossed-out comparison MSRP price
  const calcOriginalPrice = Math.floor(priceToPay * 1.4);
  const percentageOff = Math.floor(((calcOriginalPrice - priceToPay) / calcOriginalPrice) * 100);

  const handleSafeCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim()) {
      setErrorMessage("Please supply a valid Signature / Full Name to verify order.");
      return;
    }
    if (!shippingAddress.trim()) {
      setErrorMessage("Please enter an destination address for our insured container dispatch.");
      return;
    }

    // Validate based on selected payment options
    if (paymentOption === "credit") {
      const cleanNum = cardNumber.replace(/\s/g, "");
      if (cleanNum.length < 16) {
        setErrorMessage("Please enter a valid 16-digit Card Number.");
        return;
      }
      if (cardExpiry.length < 5) {
        setErrorMessage("Please enter Expiration date (MM/YY).");
        return;
      }
      if (cardCvv.length < 3) {
        setErrorMessage("Please enter CVV code (3 or 4 digits).");
        return;
      }
      if (!cardHolder.trim()) {
        setErrorMessage("Please specify Cardholder Name.");
        return;
      }
    } else if (paymentOption === "apple") {
      if (!biometricSuccess) {
        setErrorMessage("Please click the fingerprint sensor scanner below to authenticate Apple Pay first.");
        return;
      }
    } else if (paymentOption === "paypal") {
      if (!paypalEmail.trim() || !paypalEmail.includes("@")) {
        setErrorMessage("Please supply a valid PayPal registered email.");
        return;
      }
    } else if (paymentOption === "mobile") {
      if (mobileNumber.length < 8) {
        setErrorMessage("Please supply a valid Mobile Phone Number for instant Mobile Money Push PIN popup.");
        return;
      }
    }

    setErrorMessage("");
    setIsProcessing(true);

    // Dynamic high-fidelity simulated packaging delay
    setTimeout(() => {
      setIsProcessing(false);
      safeLocalStorage.setItem("vintage_bidder_name", buyerName.trim());
      
      // Execute the genuine acquisition
      onBuyNow(item.id, buyerName.trim());
      
      let gatewayName = "Enforced Credit Card";
      if (paymentOption === "apple") gatewayName = " Pay Secured Biometrics";
      if (paymentOption === "paypal") gatewayName = `PayPal Courier Account (${paypalEmail})`;
      if (paymentOption === "mobile") gatewayName = `${mobileProvider.toUpperCase()} Mobile Money (${mobileNumber})`;
      
      setSuccessMsg(`Acquisition Secured! Processed ₦${priceToPay} via ${gatewayName}. Preparing wood container wax seal...`);
      
      setTimeout(() => {
        onClose();
      }, 3500);
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#FCFBF8] border border-[#DCD9CE] rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col lg:flex-row shadow-2xl relative"
        id={`detail_modal_container_${item.id}`}
      >
        {/* Close & Wishlist Button absolute group */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            id={`detail_share_btn_${item.id}`}
            onClick={handleShare}
            className={`p-2 rounded-full border transition-all shadow-sm cursor-pointer flex items-center transition-colors duration-200 ${
              copied
                ? "bg-emerald-50 border-emerald-300 text-emerald-600 scale-105"
                : "bg-[#FAF9F5] border-[#EBE8DF] text-stone-500 hover:text-stone-900 hover:bg-stone-105"
            }`}
            title="Share this rare find"
          >
            {copied ? (
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-[9px] font-mono font-bold pr-1 text-emerald-700 animate-fade-in">COPIED</span>
              </div>
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>

          {onToggleWishlist && (
            <button
              id={`detail_wishlist_btn_${item.id}`}
              onClick={() => onToggleWishlist(item.id)}
              className={`p-2 rounded-full border transition-all shadow-sm cursor-pointer ${
                wishlist.includes(item.id)
                  ? "bg-rose-50 border-rose-300 text-rose-500 hover:bg-rose-100 scale-105"
                  : "bg-[#FAF9F5] border-[#EBE8DF] text-stone-400 hover:text-rose-500 hover:border-rose-250 hover:bg-rose-50/50"
              }`}
              title={wishlist.includes(item.id) ? "Remove from Saved" : "Add to Saved"}
            >
              <Heart className={`w-4 h-4 ${wishlist.includes(item.id) ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>
          )}

          <button
            id={`detail_close_btn_${item.id}`}
            onClick={onClose}
            className="p-2 rounded-full bg-[#FAF9F5] border border-[#EBE8DF] text-stone-605 hover:bg-stone-100 hover:text-stone-900 transition-colors shadow-sm cursor-pointer"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Left Column: Authentic Hero Visual Showcase */}
        <div className="w-full lg:w-1/2 bg-stone-100 relative min-h-[300px] lg:min-h-0 flex items-center justify-center">
          <img
            src={item.imageUrl}
            alt={item.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover max-h-[45vh] lg:max-h-full"
            id={`detail_visual_${item.id}`}
          />
          
          <div className="absolute bottom-4 left-4 bg-stone-905 bg-stone-900/80 text-[#FAF9F5] px-3.5 py-1.5 rounded-lg border border-stone-800 text-[10px] font-mono tracking-wider flex items-center gap-1.5 backdrop-blur-xs select-none">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Sourced from {item.marketName}</span>
          </div>
        </div>

        {/* Right Column: Premium Interactive Archivist Desk */}
        <div className="w-full lg:w-1/2 p-6 overflow-y-auto max-h-[85vh] lg:max-h-[90vh] space-y-6 flex flex-col justify-between">
          
          {/* Item Basic Information */}
          <div className="space-y-2 mt-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-jumia-orange font-extrabold bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                {item.era} ARCHIVE
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-stone-500 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                ⭐ {item.category}
              </span>
            </div>
            
            <h2 className="font-serif text-xl sm:text-2xl font-bold italic tracking-tight text-[#1C1A17] leading-tight">
              {item.title}
            </h2>

            <p className="text-xs text-[#544E45] font-mono">
              Provenance curator: <strong className="text-stone-805 font-bold uppercase">{item.sellerName}</strong> • Condition status: <span className="text-emerald-700 font-bold underline">{item.condition}</span>
            </p>
          </div>

          <hr className="border-[#EBE8DF]" />

          {/* Sizing, Direct buyout pricing specifications */}
          <div className="bg-[#1C1A17] text-[#FAF9F5] p-4 rounded-xl border border-stone-800 space-y-3 shadow-inner">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 font-mono text-xs text-stone-400">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>FLAT RATE COUTURE ACQUISITION</span>
              </div>
              <span className="font-mono text-[9px] bg-emerald-950 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-900/60 font-bold">
                PROVENANCE GUARANTEED
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <p className="font-mono text-stone-400 text-[9px] uppercase tracking-wider">Direct Checkout Price</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-bold text-white font-mono">₦{priceToPay}</span>
                  <span className="text-[10px] text-stone-400 line-through">₦{calcOriginalPrice}</span>
                </div>
                <p className="text-[9px] text-stone-400 leading-none">Includes sealed certificate scroll</p>
              </div>
              
              <div>
                <p className="font-mono text-stone-400 text-[9px] uppercase tracking-wider">Garment Integrity</p>
                <div className="mt-1 flex items-center gap-1 text-emerald-400 text-xs font-mono font-bold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  100% Stitch Verified
                </div>
                <p className="text-[9.5px] text-stone-400 leading-none mt-1">Single-stitch flatcheck certified</p>
              </div>
            </div>
          </div>

          {/* Interactive Address Order & Checkout Form */}
          {item.isSold ? (
            <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl flex items-center gap-3 text-emerald-950 animate-fade-in">
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-sm">Archival Piece Secured & Sold • Closed</p>
                <p className="text-xs text-emerald-800 leading-relaxed">This unique vintage garment has been acquired. Relocating to verified closet vault space dispatch container.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 bg-[#FAF9F5] border border-[#EBE8DF] p-4 rounded-xl text-stone-900 shadow-xs" id="safe_checkout_section_box">
              {/* Flexible Segment Tab Switch */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 dark:bg-stone-850 rounded-lg" id="bidding_mode_toggle_bar">
                <button
                  type="button"
                  onClick={() => {
                    setInteractionMode("bid");
                    setErrorMessage("");
                  }}
                  className={`py-1.5 text-center text-xs font-bold font-mono rounded-md transition-all cursor-pointer ${
                    interactionMode === "bid"
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  Place Live Bid
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInteractionMode("checkout");
                    setErrorMessage("");
                  }}
                  className={`py-1.5 text-center text-xs font-bold font-mono rounded-md transition-all cursor-pointer ${
                    interactionMode === "checkout"
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  Buy Now Instantly
                </button>
              </div>

              {interactionMode === "bid" ? (
                <div className="space-y-3.5 animate-fade-in" id="bidding_interaction_content">
                  <div className="flex justify-between items-center pb-1 border-b border-[#EBE8DF]/60">
                    <span className="text-xs font-mono font-bold text-amber-900 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#E61601] animate-pulse animate-duration-1000" />
                      COUTURE SHOWROOM LIVE BIDDING
                    </span>
                    <span className="text-[10px] text-[#877F70] font-mono bg-white px-2 py-0.5 rounded border border-stone-200">
                      Bids ({item.bidsCount || 0})
                    </span>
                  </div>

                  <form onSubmit={handleBidSubmit} className="space-y-3.5">
                    {/* Compact stats overview */}
                    <div className="bg-stone-50 border border-[#EBE8DF]/50 p-2.5 rounded-lg grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest block font-bold">Showroom High Bid</span>
                        <span className="font-mono text-xs sm:text-sm font-black text-amber-955 text-amber-800">₦{(item.currentBid || item.startingBid || 100).toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest block font-bold">Leading Signature</span>
                        <span className="text-xs font-serif font-black italic text-stone-800 truncate block">
                          {item.highestBidder || "Showroom Reserve"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Bidder signature input */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-[#544E45] uppercase block font-bold">Bidder Name / Signature</label>
                        <input
                          type="text"
                          value={buyerName}
                          onChange={(e) => setBuyerName(e.target.value)}
                          placeholder="e.g. Darcy Won"
                          className="w-full bg-white border border-[#DCD9CE] focus:border-stone-900 p-2 rounded text-xs outline-none focus:ring-1 focus:ring-stone-900 font-sans"
                          required
                          disabled={isProcessing}
                        />
                      </div>

                      {/* Custom input with Currency symbol */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-[#544E45] uppercase block font-bold">Your Custom Bid Offering (NGN)</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={customBidAmount || ""}
                            onChange={(e) => setCustomBidAmount(Math.max((item.currentBid || item.startingBid) + 1, Number(e.target.value)))}
                            min={(item.currentBid || item.startingBid) + 1}
                            placeholder={`Min. ₦${((item.currentBid || item.startingBid) + 1).toLocaleString()}`}
                            className="w-full bg-white border border-[#DCD9CE] focus:border-stone-900 p-2 pl-7 rounded text-xs outline-none focus:ring-1 focus:ring-stone-900 font-mono text-stone-900 font-bold"
                            required
                            disabled={isProcessing}
                          />
                          <span className="absolute left-2.5 top-2 text-stone-400 font-mono text-xs select-none">₦</span>
                        </div>
                      </div>

                      {/* Speed Buttons/predefined Quick Bid increments */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[8.5px] font-mono text-stone-505 uppercase tracking-wider block font-black">
                          ⚡ PREDEFINED QUICK BID INCREMENTS
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          {[50, 100, 250].map((inc) => {
                            const baseVal = item.currentBid || item.startingBid || 100;
                            const possibleBid = baseVal + inc;
                            const isSelected = customBidAmount === possibleBid;
                            return (
                              <button
                                key={inc}
                                type="button"
                                onClick={() => {
                                  setCustomBidAmount(possibleBid);
                                  setErrorMessage("");
                                }}
                                className={`py-1.5 px-1 text-center rounded-lg flex flex-col items-center justify-center gap-0.5 text-[10.5px] font-mono border cursor-pointer transition-all ${
                                  isSelected
                                    ? "bg-stone-900 text-white border-transparent ring-2 ring-amber-500 scale-[1.02]"
                                    : "bg-white text-stone-700 border-[#EBE8DF]/80 hover:bg-stone-50 hover:border-stone-300"
                                }`}
                              >
                                <span className={`font-black tracking-tight text-xs ${isSelected ? "text-amber-400" : "text-amber-850"}`}>
                                  +₦{inc.toLocaleString()}
                                </span>
                                <span className="text-[8px] opacity-75 font-mono">
                                  ₦{possibleBid.toLocaleString()}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {errorMessage && (
                      <div className="text-red-705 text-xs font-semibold font-mono bg-red-50 p-2 rounded border border-red-200 flex items-center gap-1.5 animate-pulse">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0"></span>
                        <span className="text-red-700">{errorMessage}</span>
                      </div>
                    )}

                    {bidSuccessMsg && (
                      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-emerald-800 text-xs flex items-center gap-2 font-mono animate-zoom-in">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 animate-bounce" />
                        <span>{bidSuccessMsg}</span>
                      </div>
                    )}

                    {!bidSuccessMsg && (
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full flex items-center justify-center gap-1.5 py-3 mt-1 bg-stone-900 hover:bg-[#E61601] hover:text-white text-stone-100 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <span className="flex items-center gap-1 text-amber-300">
                            <span className="h-3.5 w-3.5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin"></span>
                            Broadcasting Secure Bids...
                          </span>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 text-amber-400" />
                            <span>Authorize Bid Offer: ₦{customBidAmount.toLocaleString()}</span>
                          </>
                        )}
                      </button>
                    )}
                  </form>
                </div>
              ) : (
                <div className="space-y-3.5 animate-fade-in" id="checkout_interaction_content">
                  <div className="flex justify-between items-center pb-2 border-b border-[#EBE8DF]/60">
                    <span className="text-xs font-mono font-bold text-amber-900 flex items-center gap-1">
                      <ShoppingCart className="w-3.5 h-3.5" />
                      SECURE ARCHIVIST ORDER FORM
                    </span>
                    <span className="text-[10px] text-[#877F70] font-mono bg-white px-2 py-0.5 rounded border border-stone-200">Insured Delivery</span>
                  </div>

                  {successMsg ? (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-xl text-xs space-y-3 font-sans animate-zoom-in">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span>ORDER SECURED SUCCESSFULLY</span>
                      </div>
                      <p className="italic font-serif">
                        “{successMsg}”
                      </p>
                      <hr className="border-emerald-200" />
                      <div className="space-y-1 text-[11px] font-mono leading-relaxed">
                        <p>• <strong>Consignee:</strong> {buyerName}</p>
                        <p>• <strong>Location:</strong> {shippingAddress}</p>
                        <p>• <strong>Item ID:</strong> {item.id}</p>
                        <p>• <strong>Method:</strong> {paymentOption.toUpperCase()}</p>
                        <p>• <strong>Status:</strong> Sealed & Dispatched (DHL flight express tracker generated)</p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSafeCheckoutSubmit} className="space-y-3.5">
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-[#544E45] uppercase block font-bold">Signature / Full Name</label>
                          <input
                            type="text"
                            value={buyerName}
                            onChange={(e) => {
                              setBuyerName(e.target.value);
                              setCardHolder(e.target.value);
                            }}
                            placeholder="e.g. Darcy Won"
                            className="w-full bg-white border border-[#DCD9CE] focus:border-stone-900 p-2 rounded text-xs outline-none focus:ring-1 focus:ring-stone-900 font-sans"
                            required
                            disabled={isProcessing}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-[#544E45] uppercase block font-bold">Contact Email</label>
                            <input
                              type="email"
                              value={buyerEmail}
                              onChange={(e) => setBuyerEmail(e.target.value)}
                              placeholder="e.g. name@email.com"
                              className="w-full bg-white border border-[#DCD9CE] focus:border-stone-900 p-2 rounded text-xs outline-none focus:ring-1 focus:ring-stone-900 font-mono text-stone-700"
                              required={interactionMode === "checkout"}
                              disabled={isProcessing}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-[#544E45] uppercase block font-bold">Verified Mobile</label>
                            <input
                              type="tel"
                              value={buyerPhone}
                              onChange={(e) => setBuyerPhone(e.target.value)}
                              placeholder="e.g. +254 755 319800"
                              className="w-full bg-white border border-[#DCD9CE] focus:border-stone-900 p-2 rounded text-xs outline-none focus:ring-1 focus:ring-stone-900 font-mono text-stone-700"
                              required={interactionMode === "checkout"}
                              disabled={isProcessing}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-[#544E45] uppercase block font-bold">Secure Delivery Destination Address</label>
                        <input
                          type="text"
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          placeholder="e.g. 742 Shimokitazawa Block 3, Setagaya, Tokyo"
                          className="w-full bg-white border border-[#DCD9CE] focus:border-stone-900 p-2 rounded text-xs outline-none focus:ring-1 focus:ring-stone-900 font-sans text-stone-900"
                          required={interactionMode === "checkout"}
                          disabled={isProcessing}
                        />
                      </div>

                      {/* Payment Method tabs */}
                      <div className="pt-1.5 space-y-1.5">
                        <p className="text-[9px] font-mono text-[#544E45] uppercase font-bold">Encrypted Checkout Gateway</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentOption("credit");
                              setErrorMessage("");
                            }}
                            className={`py-2 px-1 text-center rounded flex flex-col items-center justify-center gap-1 text-[10px] font-mono border cursor-pointer transition-all ${
                              paymentOption === "credit"
                                ? "bg-[#1C1A17] text-white border-transparent ring-2 ring-amber-500"
                                : "bg-white text-stone-605 border-stone-200 hover:bg-stone-50"
                            }`}
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Credit Card</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setPaymentOption("apple");
                              setErrorMessage("");
                            }}
                            className={`py-2 px-1 text-center rounded flex flex-col items-center justify-center gap-1 text-[10px] font-mono border cursor-pointer transition-all ${
                              paymentOption === "apple"
                                ? "bg-[#1C1A17] text-white border-transparent ring-2 ring-amber-500"
                                : "bg-white text-stone-605 border-stone-200 hover:bg-stone-50"
                            }`}
                          >
                            <span className="font-sans font-bold leading-none text-xs"> Pay</span>
                            <span>Biometrics</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setPaymentOption("paypal");
                              setErrorMessage("");
                            }}
                            className={`py-2 px-1 text-center rounded flex flex-col items-center justify-center gap-1 text-[10px] font-mono border cursor-pointer transition-all ${
                              paymentOption === "paypal"
                                ? "bg-[#1C1A17] text-white border-transparent ring-2 ring-amber-500"
                                : "bg-white text-stone-605 border-stone-200 hover:bg-stone-50"
                            }`}
                          >
                            <span className="font-serif italic font-black text-amber-600 block">Paypal</span>
                            <span>Fast Account</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setPaymentOption("mobile");
                              setErrorMessage("");
                            }}
                            className={`py-2 px-1 text-center rounded flex flex-col items-center justify-center gap-1 text-[10px] font-mono border cursor-pointer transition-all ${
                              paymentOption === "mobile"
                                ? "bg-[#1C1A17] text-white border-transparent ring-2 ring-amber-500"
                                : "bg-white text-stone-605 border-stone-200 hover:bg-stone-50"
                            }`}
                          >
                            <Smartphone className="w-3.5 h-3.5 text-stone-500" />
                            <span>Mobile Wallet</span>
                          </button>
                        </div>
                      </div>

                      {/* Render Payment input panels based on active state */}
                      <div className="bg-[#FAF9F5] border border-stone-200/50 rounded-xl p-3 mt-1">
                        {paymentOption === "credit" && (
                          <div className="space-y-3.5">
                            {/* Interactive Visual Card Container */}
                            <div className="relative h-36 w-full rounded-xl bg-gradient-to-tr from-stone-900 to-stone-800 p-4 text-white font-mono flex flex-col justify-between overflow-hidden shadow-inner border border-stone-800">
                              {/* Inner soft lights */}
                              <div className="absolute top-0 right-0 w-32 h-32 bg-stone-700/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                              
                              <div className="flex justify-between items-start">
                                <div className="space-y-0.5">
                                  <span className="text-[7px] uppercase tracking-[0.25em] text-amber-400 font-black block">FITCHECK</span>
                                  <span className="text-[8px] text-stone-400">ENCRYPTED COUTURE HUB</span>
                                </div>
                                
                                <span className="text-xs italic font-bold tracking-tight text-amber-300 bg-stone-950 px-2 py-0.5 rounded border border-stone-850">
                                  {getCardBrand(cardNumber)}
                                </span>
                              </div>

                              <span className="text-sm sm:text-base tracking-[0.16em] text-[#FEF2E9] py-1 block">
                                {cardNumber || "••••  ••••  ••••  ••••"}
                              </span>

                              <div className="flex justify-between items-end">
                                <div>
                                  <span className="text-[6.5px] text-stone-450 uppercase block tracking-wider font-bold">Consignee Custodian</span>
                                  <span className="text-[10px] text-stone-200 uppercase truncate max-w-[150px] block">
                                    {cardHolder || "ARCHIVAL GUEST"}
                                  </span>
                                </div>
                                
                                <div className="flex gap-3">
                                  <div>
                                    <span className="text-[6.5px] text-stone-450 uppercase block tracking-wider font-bold">Expires</span>
                                    <span className="text-[10px] text-stone-200 font-mono">
                                      {cardExpiry || "MM/YY"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-[6.5px] text-stone-450 uppercase block tracking-wider font-bold">CVV</span>
                                    <span className="text-[10px] text-amber-300 font-mono">
                                      {cardCvv ? "•••" : "000"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Card input forms */}
                            <div className="space-y-2">
                              <div className="space-y-1">
                                <label className="text-[8.5px] font-mono text-[#544E45] uppercase block font-bold">Card Number</label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                    placeholder="4111 2222 3333 4444"
                                    className="w-full bg-white border border-[#DCD9CE] focus:border-stone-900 p-2 pr-8 rounded text-xs outline-none focus:ring-1 focus:ring-stone-900 font-mono"
                                    required={paymentOption === "credit"}
                                    disabled={isProcessing}
                                  />
                                  <CreditCard className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-2.5" />
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-2 space-y-1">
                                  <label className="text-[8.5px] font-mono text-[#544E45] uppercase block font-bold">Cardholder Name</label>
                                  <input
                                    type="text"
                                    value={cardHolder}
                                    onChange={(e) => setCardHolder(e.target.value)}
                                    placeholder="FITCHECK MEMBER"
                                    className="w-full bg-white border border-[#DCD9CE] focus:border-stone-900 p-2 rounded text-xs outline-none focus:ring-1 focus:ring-stone-900 font-sans"
                                    required={paymentOption === "credit"}
                                    disabled={isProcessing}
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[8.5px] font-mono text-[#544E45] uppercase block font-bold">Expiry Date</label>
                                  <input
                                    type="text"
                                    value={cardExpiry}
                                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                                    placeholder="MM/YY"
                                    className="w-full bg-white border border-[#DCD9CE] focus:border-stone-900 p-2 rounded text-xs outline-none focus:ring-1 focus:ring-stone-900 font-mono"
                                    required={paymentOption === "credit"}
                                    disabled={isProcessing}
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[8.5px] font-mono text-[#544E45] uppercase block font-bold">Security CVV Code</label>
                                <input
                                  type="password"
                                  value={cardCvv}
                                  onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                                  placeholder="e.g. 123"
                                  className="w-full bg-white border border-[#DCD9CE] focus:border-stone-900 p-2 rounded text-xs outline-none focus:ring-1 focus:ring-stone-900 font-mono"
                                  required={paymentOption === "credit"}
                                  disabled={isProcessing}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {paymentOption === "apple" && (
                          <div className="p-3 bg-white rounded-lg border border-stone-200 flex flex-col items-center justify-center text-center space-y-3 py-4">
                            <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center border border-stone-200">
                              <Fingerprint className={`w-6 h-6 ${biometricSuccess ? "text-emerald-500 animate-pulse" : biometricScanning ? "text-amber-500 animate-ping" : "text-stone-700"}`} />
                            </div>
                            
                            <div className="space-y-1">
                              <p className="font-extrabold text-xs text-stone-900 font-sans">
                                {biometricSuccess ? "Apple Keychain Authorized!" : biometricScanning ? "Broadcasting secure token exchange..." : "Apple Secure Element Key"}
                              </p>
                              <p className="text-[10px] text-stone-400">
                                Authentication completes instant vault sealing to secure this item ID.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={triggerBiometricScan}
                              disabled={biometricScanning || biometricSuccess}
                              className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                biometricSuccess
                                  ? "bg-emerald-55 text-stone-900 bg-emerald-50 border border-emerald-300"
                                  : "bg-stone-900 text-white hover:bg-stone-950"
                              }`}
                            >
                              {biometricSuccess ? (
                                <>
                                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                                  Biometric Validated ✓
                                </>
                              ) : biometricScanning ? (
                                <span>Scanning Touch ID...</span>
                              ) : (
                                "Simulate Fingerprint Touch Secure ID"
                              )}
                            </button>
                          </div>
                        )}

                        {paymentOption === "paypal" && (
                          <div className="p-3.5 rounded-lg border border-amber-300 bg-amber-50/45 space-y-3">
                            <div className="flex items-center gap-1.5 text-amber-900">
                              <Info className="w-4 h-4 text-amber-700 shrink-0" />
                              <span className="text-[10px] font-mono uppercase font-extrabold">Instant Paypal Transfer</span>
                            </div>
                            <p className="text-[10.5px] text-[#504535] leading-relaxed">
                              Enter your PayPal login address below first. We'll simulate a 1-click token redirect authorization code.
                            </p>

                            <div className="space-y-1">
                              <label className="text-[9px] font-mono text-[#544E45] uppercase block font-bold">PayPal Account Email</label>
                              <input
                                type="email"
                                value={paypalEmail}
                                onChange={(e) => setPaypalEmail(e.target.value)}
                                placeholder="e.g. archivist-paypal@gmail.com"
                                className="w-full bg-white border border-[#DCD9CE] focus:border-stone-900 p-2 rounded text-xs outline-none focus:ring-1 focus:ring-stone-900 font-mono text-stone-700"
                                required={paymentOption === "paypal"}
                                disabled={isProcessing}
                              />
                            </div>
                          </div>
                        )}

                        {paymentOption === "mobile" && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black text-stone-705 uppercase bg-stone-100 px-2 py-0.5 rounded font-mono border border-stone-200">
                                MOBILE PAYMENT GATEWAY
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                              <div className="space-y-1">
                                <label className="text-[9px] font-mono text-[#544E45] uppercase block font-bold">Network Carrier</label>
                                <select
                                  value={mobileProvider}
                                  onChange={(e) => setMobileProvider(e.target.value as any)}
                                  className="w-full bg-white border border-[#DCD9CE] focus:border-stone-900 p-2 rounded text-xs outline-none text-stone-900"
                                  disabled={isProcessing}
                                >
                                  <option value="mpesa">Safaricom M-Pesa</option>
                                  <option value="orange">Orange Money</option>
                                  <option value="wave">Wave Mobile Money</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-mono text-[#544E45] uppercase block font-bold">Authorized Phone</label>
                                <input
                                  type="text"
                                  value={mobileNumber}
                                  onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9+]/g, ""))}
                                  placeholder="e.g. +254 755 319800"
                                  className="w-full bg-white border border-[#DCD9CE] focus:border-stone-900 p-2 rounded text-xs outline-none focus:ring-1 focus:ring-stone-900 font-mono text-stone-900"
                                  required={paymentOption === "mobile"}
                                  disabled={isProcessing}
                                />
                              </div>
                            </div>

                            <p className="text-[10px] text-stone-500 italic bg-white p-2 rounded border border-stone-150 leading-relaxed font-sans">
                              💡 Safety check: You will receive an encrypted authorization dialogue box callback on your device screen asking for your carrier PIN.
                            </p>
                          </div>
                        )}
                      </div>

                      {errorMessage && (
                        <div className="text-red-700 text-xs font-semibold font-mono bg-red-50 p-2 rounded border border-red-200 flex items-center gap-1.5 animate-pulse">
                          <span className="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0"></span>
                          <span>{errorMessage}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        id="submit_safe_order_btn"
                        disabled={isProcessing}
                        className="w-full flex items-center justify-center gap-1.5 py-3 mt-1 bg-stone-900 hover:bg-[#E61601] hover:text-white text-stone-100 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer border border-transparent disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <span className="flex items-center gap-1 text-amber-300">
                            <span className="h-3.5 w-3.5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin"></span>
                            Sealing Physical Provenance Wax Scroll...
                          </span>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 text-amber-400" />
                            <span>Authorize Secure Order: ₦{priceToPay.toLocaleString()}</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Secondary Info Tabs (Provenance, Flat Measurer specs, Shipping Trust) */}
          <div className="space-y-3">
            {/* Tabs Trigger */}
            <div className="flex flex-wrap border-b border-[#EBE8DF] text-xs font-mono font-medium gap-x-6">
              <button
                id="tab_trigger_provenance"
                onClick={() => setActiveTab("provenance")}
                className={`pb-2.5 border-b-2 transition-all cursor-pointer ${
                  activeTab === "provenance"
                    ? "border-[#1C1A17] text-[#1C1A17] font-bold"
                    : "border-transparent text-[#877F70] hover:text-[#1C1A17]"
                }`}
              >
                The Provenance
              </button>
              <button
                id="tab_trigger_fit"
                onClick={() => setActiveTab("fit")}
                className={`pb-2.5 border-b-2 transition-all cursor-pointer ${
                  activeTab === "fit"
                    ? "border-[#1C1A17] text-[#1C1A17] font-bold"
                    : "border-transparent text-[#877F70] hover:text-[#1C1A17]"
                }`}
              >
                Specs & Fit
              </button>
              <button
                id="tab_trigger_transit"
                onClick={() => setActiveTab("transit")}
                className={`pb-2.5 border-b-2 transition-all cursor-pointer ${
                  activeTab === "transit"
                    ? "border-[#1C1A17] text-[#1C1A17] font-bold"
                    : "border-transparent text-[#877F70] hover:text-[#1C1A17]"
                }`}
              >
                Transit & Guarantee
              </button>
              <button
                id="tab_trigger_trend"
                onClick={() => setActiveTab("trend")}
                className={`pb-2.5 border-b-2 transition-all cursor-pointer ${
                  activeTab === "trend"
                    ? "border-[#1C1A17] text-[#1C1A17] font-bold"
                    : "border-transparent text-[#877F70] hover:text-[#1C1A17]"
                }`}
              >
                Price Trend
              </button>
            </div>

            {/* Tab content displays */}
            <div className="pt-1 font-sans text-xs sm:text-sm text-stone-700 leading-relaxed min-h-[110px]">
              {activeTab === "provenance" && (
                <div className="space-y-3" id="panel_provenance">
                  <p>{item.description}</p>
                  {item.history && (
                    <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/40 text-stone-800 text-xs italic">
                      <strong className="block font-mono text-[10px] uppercase font-bold tracking-wider text-amber-800 mb-1 not-italic">
                        CURATED BACKSTORY & LOGS:
                      </strong>
                      "{item.history}"
                    </div>
                  )}
                </div>
              )}

              {activeTab === "fit" && (
                <div className="space-y-3" id="panel_fit_materials">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-mono text-[10px] uppercase tracking-wider text-[#1C1A17] font-bold flex items-center gap-1">
                        <Ruler className="w-3.5 h-3.5 text-amber-700" />
                        Flat Measurements
                      </h4>
                      <ul className="text-xs space-y-1 text-[#544E45] list-inside list-disc">
                        {item.measurements?.pitToPit && (
                          <li>Pit to Pit: <strong className="text-stone-900">{item.measurements.pitToPit}</strong></li>
                        )}
                        {item.measurements?.length && (
                          <li>Body Length: <strong className="text-stone-900">{item.measurements.length}</strong></li>
                        )}
                        {item.measurements?.waist && (
                          <li>Waist Size: <strong className="text-stone-900">{item.measurements.waist}</strong></li>
                        )}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-mono text-[10px] uppercase tracking-wider text-[#1C1A17] font-bold flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-amber-700" />
                        Fabric & Materials
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {item.materials && item.materials.length > 0 ? (
                          item.materials.map((m) => (
                            <span key={m} className="bg-stone-100 text-stone-800 text-[10px] px-2 py-0.5 rounded border border-stone-200">
                              {m}
                            </span>
                          ))
                        ) : (
                          <span className="text-stone-400">Archival blend vintage fibers</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "transit" && (
                <div className="space-y-2 text-stone-600 text-xs" id="panel_transit_charter">
                  <div className="bg-stone-50 border border-stone-200 p-3 rounded-lg space-y-2">
                    <h5 className="font-mono text-[10px] uppercase text-stone-800 font-extrabold tracking-wider">📦 INSURED WAX-SEALED CONTAINER EXPEDITION</h5>
                    <p className="leading-relaxed">
                      All premium archives are packaged in acid-free tissue paper sheets, placed inside moisture-impermeable hard wood containers, and sealed with custom FitCheck branding wax.
                    </p>
                    <p className="leading-relaxed">
                      Shipped via DHL premium carbon-neutral flight express with continuous tracker telemetry. Delivery completed within 2–4 business days worldwide.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "trend" && (() => {
                // Filter the live bids for this item
                const itemBids = bidLogs
                  .filter((b) => b.itemId === item.id)
                  .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

                // Build dataset
                const dataPoints: { label: string; amount: number; bidder: string; date: string }[] = [];

                // Base pricing item starting point
                dataPoints.push({
                  label: "Starting Reserve",
                  amount: item.startingBid,
                  bidder: "Reserve Base Price",
                  date: "Lot Curated"
                });

                // Follow up actual bids placed
                itemBids.forEach((bid, idx) => {
                  dataPoints.push({
                    label: `Bid #${idx + 1}`,
                    amount: bid.amount,
                    bidder: bid.bidderName,
                    date: new Date(bid.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  });
                });

                // Simulated secondary projection points if no bids or single bid exists (to render vintage trends)
                if (dataPoints.length === 1) {
                  dataPoints.push({
                    label: "Midway Appraisal",
                    amount: Math.round(item.startingBid * 1.08),
                    bidder: "Shimokitazawa Baseline Value",
                    date: "Appreciation Project"
                  });
                  dataPoints.push({
                    label: "Present Appraisal",
                    amount: item.currentBid || Math.round(item.startingBid * 1.15),
                    bidder: "Archivist Estimated Value",
                    date: "Spot Market Price"
                  });
                } else if (dataPoints.length === 2) {
                  dataPoints.push({
                    label: "Next Bidding Milestone",
                    amount: Math.round(dataPoints[1].amount * 1.05),
                    bidder: "Next Milestone Projection",
                    date: "Calculated Spot"
                  });
                }

                // Grid sizing settings
                const svgW = 460;
                const svgH = 180;
                const padL = 55;
                const padR = 20;
                const padT = 20;
                const padB = 35;

                const innerW = svgW - padL - padR;
                const innerH = svgH - padT - padB;

                const minVal = Math.min(...dataPoints.map((d) => d.amount)) * 0.98;
                const maxVal = Math.max(...dataPoints.map((d) => d.amount)) * 1.02;
                const rangeVal = (maxVal - minVal) || 1;

                const getX = (idx: number) => padL + (idx / (dataPoints.length - 1)) * innerW;
                const getY = (val: number) => {
                  const ratio = (val - minVal) / rangeVal;
                  return svgH - padB - ratio * innerH;
                };

                // Generate path string
                let dPath = "";
                dataPoints.forEach((pt, idx) => {
                  const x = getX(idx);
                  const y = getY(pt.amount);
                  if (idx === 0) dPath += `M ${x} ${y}`;
                  else dPath += ` L ${x} ${y}`;
                });

                // Closed area background gradient
                const dArea = dataPoints.length > 0 
                  ? `${dPath} L ${getX(dataPoints.length - 1)} ${svgH - padB} L ${getX(0)} ${svgH - padB} Z`
                  : "";

                // Get current active hovered node (or default to the highest latest bid)
                const activeIdx = hoveredPointIdx !== null ? hoveredPointIdx : dataPoints.length - 1;
                const activePoint = dataPoints[activeIdx];

                return (
                  <div className="space-y-4 animate-fade-in text-stone-800" id="price_trend_analysis_pane">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-[#FAF9F5] border border-[#EBE8DF] p-3 rounded-xl">
                      <div>
                        <h5 className="font-mono text-[10px] uppercase font-bold tracking-widest text-[#1C1A17] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-[#E61601] rounded-full"></span>
                          Archived Lot Price Trend Log
                        </h5>
                        <p className="text-[10px] text-stone-500 leading-tight">Authentic live valuation tracing for collectors.</p>
                      </div>
                      <div className="text-right sm:text-right flex sm:flex-col items-baseline sm:items-end gap-2 sm:gap-0">
                        <span className="text-[10px] font-mono text-stone-400 capitalize block">Active Selection Price</span>
                        <span className="text-sm font-bold text-[#1C1A17] font-mono">
                          ₦{activePoint ? activePoint.amount.toLocaleString() : "120"}
                        </span>
                      </div>
                    </div>

                    {/* Responsive interactive D3 SVG trend plot wrapping container */}
                    <div className="relative w-full bg-white p-3.5 rounded-xl border border-stone-200">
                      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto" style={{ overflow: "visible" }}>
                        <defs>
                          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#AF8B50" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#AF8B50" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Horizontal grid guide lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                          const yVal = minVal + ratio * rangeVal;
                          const yCoord = getY(yVal);
                          return (
                            <g key={i} className="opacity-45">
                              <line
                                x1={padL}
                                y1={yCoord}
                                x2={svgW - padR}
                                y2={yCoord}
                                stroke="#E5E4E0"
                                strokeWidth="1"
                                strokeDasharray="3,3"
                              />
                              <text
                                x={padL - 6}
                                y={yCoord + 3}
                                textAnchor="end"
                                className="font-mono text-[8.5px] fill-stone-450 font-bold"
                              >
                                ₦{Math.round(yVal).toLocaleString()}
                              </text>
                            </g>
                          );
                        })}

                        {/* Vertical timeline columns */}
                        {dataPoints.map((pt, idx) => {
                          const x = getX(idx);
                          return (
                            <line
                              key={idx}
                              x1={x}
                              y1={padT}
                              x2={x}
                              y2={svgH - padB}
                              stroke="#F1EFEA"
                              strokeWidth="1"
                              className="opacity-75"
                            />
                          );
                        })}

                        {/* Shaded Area */}
                        {dArea && (
                          <path d={dArea} fill="url(#trendGradient)" />
                        )}

                        {/* Line Path */}
                        {dPath && (
                          <path
                            d={dPath}
                            fill="none"
                            stroke="#AF8B50"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}

                        {/* Hover reference tracking bar overlay */}
                        {activeIdx !== null && activeIdx < dataPoints.length && (
                          <line
                            x1={getX(activeIdx)}
                            y1={padT}
                            x2={getX(activeIdx)}
                            y2={svgH - padB}
                            stroke="#AF8B50"
                            strokeWidth="1.5"
                            strokeDasharray="1,1"
                            className="opacity-80"
                          />
                        )}

                        {/* Interactive Data Nodes Circle triggers */}
                        {dataPoints.map((pt, idx) => {
                          const x = getX(idx);
                          const y = getY(pt.amount);
                          const isSelection = activeIdx === idx;

                          return (
                            <g
                              key={idx}
                              className="cursor-pointer"
                              onMouseEnter={() => setHoveredPointIdx(idx)}
                              onMouseLeave={() => setHoveredPointIdx(null)}
                            >
                              <circle
                                cx={x}
                                cy={y}
                                r={isSelection ? 5.5 : 4}
                                fill={isSelection ? "#AF8B50" : "#FAF9F5"}
                                stroke={isSelection ? "#FEF2E9" : "#AF8B50"}
                                strokeWidth={isSelection ? 2.5 : 1.5}
                                className="transition-all duration-150"
                              />
                              {/* Axis Tick Label text */}
                              <text
                                x={x}
                                y={svgH - padB + 14}
                                textAnchor="middle"
                                className={`font-mono text-[7.5px] font-semibold ${isSelection ? "fill-stone-900 font-bold" : "fill-stone-400"}`}
                              >
                                {pt.label}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                    {/* Integrated dynamic Tooltip metadata banner panel */}
                    {activePoint && (
                      <div className="bg-[#FAF9F5] border border-amber-200/60 p-3 rounded-lg flex items-center justify-between gap-4 select-none">
                        <div className="space-y-0.5 text-left">
                          <span className="text-[8px] font-mono uppercase tracking-wider text-amber-805 font-bold block">Point Collector Identity</span>
                          <span className="text-xs font-serif italic text-stone-900 font-extrabold leading-none">
                            {activePoint.bidder}
                          </span>
                        </div>
                        <div className="text-right space-y-0.5">
                          <span className="text-[8px] font-mono uppercase tracking-wider text-stone-400 block">Relative Time</span>
                          <span className="text-xs font-mono font-bold text-stone-500 block">
                            {activePoint.date}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* History Bid logs ledger checklist */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono uppercase text-stone-400 font-bold block text-left">Consignee Bid Queue Ledger</span>
                      <div className="max-h-36 overflow-y-auto border border-[#EBE8DF]/60 rounded-lg divide-y divide-[#EBE8DF]/40 bg-white">
                        {dataPoints.slice().reverse().map((bid, i) => (
                          <div 
                            key={i} 
                            onClick={() => setHoveredPointIdx(dataPoints.length - 1 - i)}
                            className={`p-2.5 flex items-center justify-between font-mono text-[10.5px] cursor-pointer transition-colors ${
                              activePoint?.amount === bid.amount ? "bg-amber-50/40" : "hover:bg-stone-50"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={`w-1.5 h-1.5 rounded-full ${bid.label.includes("Starting") ? "bg-stone-400" : "bg-[#E61601]"}`}></span>
                              <strong className="text-stone-850 truncate max-w-[130px] font-sans text-left">{bid.bidder}</strong>
                            </div>
                            <span className="text-[9px] text-[#877F70]">{bid.label} • {bid.date}</span>
                            <span className="text-stone-900 font-bold bg-[#FAF9F5] py-0.5 px-1.5 rounded border border-stone-150">
                              ₦{bid.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
          </div>
        </div>
      </div>
    </motion.div>
  </div>
  );
}
