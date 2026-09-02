import React, { useState } from "react";
import { X, Send, Star, CheckCircle, Quote } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { safeLocalStorage } from "../lib/storage";

export interface VendorReview {
  id: string;
  vendorId: string;
  vendorName: string;
  itemTitle: string;
  customerName: string;
  rating: number;
  comment: string;
  timestamp: string;
}

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorId: string;
  vendorName: string;
  itemTitle: string;
  defaultCustomerName?: string;
  onSubmitSuccess?: () => void;
}

export default function FeedbackModal({
  isOpen,
  onClose,
  vendorId,
  vendorName,
  itemTitle,
  defaultCustomerName = "Verified Buyer",
  onSubmitSuccess
}: FeedbackModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [customerName, setCustomerName] = useState(defaultCustomerName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);

    // Simulate database write delay
    setTimeout(() => {
      const newReview: VendorReview = {
        id: `rev-${Date.now()}`,
        vendorId,
        vendorName,
        itemTitle,
        customerName: customerName.trim() || "Anonymous Patron",
        rating,
        comment: comment.trim(),
        timestamp: new Date().toISOString()
      };

      try {
        const storedReviews = safeLocalStorage.getItem("vintage_vendor_reviews_list");
        const reviews: VendorReview[] = storedReviews ? JSON.parse(storedReviews) : [];
        reviews.unshift(newReview);
        safeLocalStorage.setItem("vintage_vendor_reviews_list", JSON.stringify(reviews));
        window.dispatchEvent(new Event("storage"));
      } catch (err) {
        console.error("Failed to save vendor review:", err);
      }

      setIsSubmitting(false);
      setSubmitted(true);

      setTimeout(() => {
        if (onSubmitSuccess) onSubmitSuccess();
        onClose();
        // Reset local states
        setComment("");
        setRating(5);
        setSubmitted(false);
      }, 2000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="vendor_review_submission_modal_root">
      {/* Dark overlay backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all border border-stone-200"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 text-stone-400 hover:text-stone-900 p-1.5 hover:bg-stone-100 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <AnimatePresence mode="wait">
            {!submitted ? (
              <div className="space-y-5">
                <div className="text-center space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#E61601] bg-red-50 px-2.5 py-1 rounded-full inline-block">
                    Order Accomplished!
                  </span>
                  <h3 className="text-lg font-bold font-serif text-[#1C1A17] italic">
                    How was your experience with {vendorName}?
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed px-4">
                    Leave a signature text review for the curator regarding your acquisition of{" "}
                    <strong className="text-stone-850 font-bold font-mono">"{itemTitle}"</strong>.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                  {/* Star Selection */}
                  <div className="space-y-1.5 text-center">
                    <label className="text-[10px] font-mono text-stone-400 uppercase tracking-wider font-bold block">
                      Curator Rating
                    </label>
                    <div className="flex justify-center items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = hoverRating !== null ? star <= hoverRating : star <= rating;
                        return (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            className="p-1 text-stone-300 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star
                              className={`w-7 h-7 transition-colors duration-250 ${
                                isFilled
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-stone-200"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Customer Signature Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-stone-500 uppercase tracking-widest font-bold block">
                      Your Signature / Buyer Name
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Verified Buyer Name"
                      className="w-full bg-[#FAF9F5] border-2 border-stone-200 focus:border-jumia-orange rounded-lg p-2.5 text-xs text-stone-900 outline-none transition-colors"
                    />
                  </div>

                  {/* Review text comment */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-stone-500 uppercase tracking-widest font-bold block">
                      Text Review Commentary
                    </label>
                    <div className="relative">
                      <textarea
                        required
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Detail your shipping box packaging, materials quality, physical fitting checks or communication experience..."
                        className="w-full bg-[#FAF9F5] border-2 border-stone-200 focus:border-jumia-orange rounded-lg p-3 text-xs text-stone-900 outline-none transition-colors resize-none leading-relaxed"
                      />
                      <Quote className="absolute right-3.5 bottom-3 text-stone-200 w-8 h-8 pointer-events-none transform rotate-180" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#1C1A17] hover:bg-stone-950 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Filing provenance review...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-amber-400" />
                        <span>Submit Secure Review</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-150 flex items-center justify-center mx-auto mb-2 animate-bounce">
                  <CheckCircle className="w-9 h-9 text-emerald-600" />
                </div>
                <h3 className="font-serif text-xl font-bold text-stone-900 italic">
                  Feedback Successfully Cataloged!
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                  Thank you! Your textual review has been logged to the ledger of{" "}
                  <strong className="text-stone-850 font-bold">{vendorName}</strong>. This updates active curator scores in real-time.
                </p>
                <div className="text-[10px] text-stone-400 font-mono">
                  Closing modal in a few seconds...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
