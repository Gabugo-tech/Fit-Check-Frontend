import React, { useMemo } from "react";
import { MarketBooth, VintageItem } from "../types";
import { VendorReview } from "./FeedbackModal";
import { MapPin, Calendar, Star, Award, ChevronLeft, Shirt, Quote, MessageSquare, Flame } from "lucide-react";
import { motion } from "motion/react";

interface VendorProfileProps {
  booth: MarketBooth;
  items: VintageItem[];
  allReviews: VendorReview[];
  onSelectItem: (item: VintageItem) => void;
  onBack: () => void;
  onOpenFeedbackModal: () => void;
}

export default function VendorProfile({
  booth,
  items,
  allReviews,
  onSelectItem,
  onBack,
  onOpenFeedbackModal
}: VendorProfileProps) {
  // 1. Dynamic items listed by this specific seller
  const sellerItems = useMemo(() => {
    return items.filter((item) => item.sellerId === booth.id);
  }, [items, booth.id]);

  // 2. Dynamic calculated items sold in general (+ base simulated offline sales for historic richness)
  const itemsSoldStatistics = useMemo(() => {
    const activeSoldInSession = sellerItems.filter(i => i.isSold).length;
    // Base historic sales depending on established year
    let baseSells = 45;
    if (booth.id === "booth-1") baseSells = 84;
    if (booth.id === "booth-2") baseSells = 62;
    if (booth.id === "booth-3") baseSells = 51;
    if (booth.id === "booth-4") baseSells = 109;

    return baseSells + activeSoldInSession;
  }, [sellerItems, booth.id]);

  // 3. Simulated joined dates based on Est. year
  const joinedDateString = useMemo(() => {
    const yearPart = booth.established.replace(/Est\.\s+/i, "").trim();
    const months = ["January", "March", "June", "September", "November"];
    // Deterministic month depending on booth ID
    const monthIndex = Math.abs(booth.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % months.length;
    return `${months[monthIndex]} ${yearPart}`;
  }, [booth.established, booth.id]);

  // 4. Filter reviews designated for this curator
  const reviewsForThisBooth = useMemo(() => {
    // Standard historic seeded reviews to make the page instantly rich
    const seedReviews: VendorReview[] = [
      {
        id: `rev-seed-1-${booth.id}`,
        vendorId: booth.id,
        vendorName: booth.name,
        itemTitle: sellerItems[0]?.title || "Vintage Piece",
        customerName: "Eleanor Vance",
        rating: 5,
        comment: `Absolutely supreme vintage quality. The wax packaging on my courier box was perfect and measurements are millisecond accurate! Will buy here again.`,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() // 5 days ago
      },
      {
        id: `rev-seed-2-${booth.id}`,
        vendorId: booth.id,
        vendorName: booth.name,
        itemTitle: sellerItems[1]?.title || "Bespoke Outerwear",
        customerName: "Davian K.",
        rating: 4,
        comment: `Excellent, prompt customer interaction. The historical bio story card included in the pocket is such a spectacular touch. Fabric feels premium and heavyweight!`,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString() // 12 days ago
      }
    ];

    const actualSavedReviews = allReviews.filter(rev => rev.vendorId === booth.id);
    return [...actualSavedReviews, ...seedReviews];
  }, [allReviews, booth.id, booth.name, sellerItems]);

  // Helper star renderer
  const renderStars = (ratingCount: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${
          i < Math.round(ratingCount)
            ? "fill-amber-400 text-amber-400"
            : "text-stone-300"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-8 animate-fade-in" id={`vendor_profile_page_${booth.id}`}>
      
      {/* Back button link and top action */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-stone-500 hover:text-[#1C1A17] text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
        >
          <div className="p-1 px-1.5 bg-white border border-stone-200 group-hover:border-stone-400 rounded transition-colors flex items-center">
            <ChevronLeft className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span>Back to Market Directory</span>
        </button>

        <span className="text-[10px] bg-stone-900 text-amber-400 px-3 py-1 rounded font-mono font-bold uppercase tracking-widest border border-stone-800">
          Verified Curator # {booth.id}
        </span>
      </div>

      {/* Profile Header Deck */}
      <div className="bg-[#FCFBF8] border border-[#EBE8DF] rounded-2xl overflow-hidden shadow-sm">
        {/* Banner */}
        <div className="h-48 sm:h-64 relative bg-stone-200">
          <img
            src={booth.bannerImage}
            alt={booth.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A17]/85 via-[#1C1A17]/40 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div className="flex items-center gap-4">
              <img
                src={booth.avatar}
                alt={booth.curator}
                referrerPolicy="no-referrer"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#FAF9F5]/70 object-cover shadow-md"
              />
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest bg-amber-500 text-stone-950 px-2 py-0.5 rounded font-black self-start">
                  {booth.aesthetic}
                </span>
                <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-white mt-1">
                  {booth.name}
                </h1>
                <p className="text-xs text-stone-300 font-medium">Curator: {booth.curator}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-stone-900/60 p-2 rounded-xl backdrop-blur-xs border border-white/10 self-start sm:self-auto shrink-0">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
              <div className="text-right">
                <span className="text-sm font-bold block leading-none">{booth.rating.toFixed(1)} / 5.0</span>
                <span className="text-[9px] text-stone-400 font-mono block mt-0.5">({reviewsForThisBooth.length} client logs)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Curator statistics card row */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-b border-[#EBE8DF] text-center divide-x divide-[#EBE8DF] bg-white">
          <div className="py-4">
            <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest font-black">Physical Station</p>
            <p className="text-xs font-bold text-stone-900 mt-1 flex items-center justify-center gap-0.5 px-2">
              <MapPin className="w-3.5 h-3.5 text-amber-600 inline shrink-0" />
              <span className="truncate">{booth.location.split("(")[0].trim()}</span>
            </p>
          </div>
          <div className="py-4">
            <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest font-black">Joined Date</p>
            <p className="text-xs font-bold text-stone-900 mt-1 flex items-center justify-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>{joinedDateString}</span>
            </p>
          </div>
          <div className="py-4">
            <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest font-black">Total Items Sold</p>
            <p className="text-xs font-mono font-extrabold text-stone-900 mt-1">
              {itemsSoldStatistics} Sells
            </p>
          </div>
          <div className="py-4 font-mono">
            <p className="text-[10px] text-stone-400 uppercase tracking-widest font-black">In-Stock Catalog</p>
            <p className="text-xs font-bold text-jumia-orange mt-1">
              {sellerItems.length} active listed
            </p>
          </div>
        </div>

        {/* Bio & Details text */}
        <div className="p-6 sm:p-8 bg-white grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-3.5">
            <h3 className="font-serif text-lg font-bold text-stone-950 flex items-center gap-1.5">
              <Award className="w-5 h-5 text-amber-600" />
              Curator Retrospective & Mission statement
            </h3>
            <p className="text-sm text-stone-800 leading-relaxed font-sans first-letter:text-3xl first-letter:font-serif first-letter:float-left first-letter:mr-2">
              {booth.bio}
            </p>
            <div className="p-4 bg-stone-50 border-l-4 border-amber-600 rounded-r-lg italic text-stone-600 text-xs leading-relaxed font-medium">
              "{booth.tagline}"
            </div>
          </div>

          <div className="space-y-4 bg-[#FCFBF8] border border-[#EBE8DF]/80 p-5 rounded-xl self-start">
            <h4 className="text-xs font-mono text-stone-500 uppercase tracking-wider font-extrabold">Shop Specialism</h4>
            <div className="flex flex-wrap gap-2 pt-0.5">
              <span className="bg-stone-900 text-amber-300 font-mono text-[10px] font-bold px-2.5 py-1 rounded">
                {booth.aesthetic}
              </span>
              <span className="bg-amber-100/60 text-amber-900 font-mono text-[10px] px-2.5 py-1 rounded">
                {booth.established}
              </span>
              <span className="bg-stone-100 text-stone-700 font-mono text-[10px] px-2.5 py-1 rounded">
                Verified Physical Booth
              </span>
            </div>
            
            <p className="text-[11px] text-stone-500 leading-relaxed border-t border-stone-200/60 pt-3">
              This shop registers single-stitch garments and bespoke garments that avoid fast-fashion metrics. All sizes are hand-measured.
            </p>
            
            <button
              onClick={onOpenFeedbackModal}
              className="text-[11px] font-mono font-bold text-center w-full py-2 bg-[#FAF9F5] hover:bg-stone-900 hover:text-white border border-[#EBE8DF] rounded transition-all cursor-pointer text-stone-800 uppercase tracking-widest mt-2 block"
            >
              Submit Feedback Log
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Listings vs Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Listed pieces by seller column - Take up 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border-b border-[#EBE8DF] pb-3 flex items-center justify-between">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1A17] flex items-center gap-2">
              <Shirt className="w-5 h-5 text-amber-700" />
              Store Vault Catalog ({sellerItems.length})
            </h2>
            <span className="text-[10px] font-mono text-[#877F70]">PHYSICAL STALL ORIGINS OWNED</span>
          </div>

          {sellerItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {sellerItems.map((item) => {
                const calcOriginalPrice = Math.floor((item.buyPrice || item.currentBid * 1.5) * 1.4);
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    id={`curator_item_card_${item.id}`}
                    className="group bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-md hover:border-stone-300 transition-all cursor-pointer"
                  >
                    <div className="relative aspect-square overflow-hidden bg-stone-50">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      />
                      {item.isSold && (
                        <div className="absolute inset-0 bg-[#1C1A17]/70 backdrop-blur-xs flex items-center justify-center">
                          <span className="bg-stone-950 text-white font-mono text-[10px] font-bold tracking-widest uppercase py-1 px-3 border border-white/20 rounded z-10">
                            Acquired / Archived
                          </span>
                        </div>
                      )}
                      <span className="absolute top-2 left-2 bg-stone-900 text-white text-[8px] font-mono px-1.5 py-0.5 rounded font-black">
                        {item.era}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <span className="text-[10px] text-stone-400 font-mono uppercase">{item.category}</span>
                      <h4 className="text-xs font-bold font-sans text-stone-850 truncate group-hover:text-jumia-orange transition-colors">
                        {item.title}
                      </h4>
                      <div className="flex items-baseline justify-between pt-1 border-t border-stone-50">
                        <div>
                          <p className="text-sm font-black text-stone-900 mt-0.5">₦{item.buyPrice || item.currentBid}</p>
                          <p className="text-[9px] text-stone-400 line-through">₦{calcOriginalPrice}</p>
                        </div>
                        <span className="text-[9px] font-bold bg-stone-100 text-stone-500 py-0.5 px-2 rounded">
                          size {item.size}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white border border-dashed border-[#EBE8DF] rounded-xl">
              <Shirt className="w-10 h-10 text-stone-300 mx-auto mb-2 animate-pulse" />
              <p className="text-xs font-mono text-stone-500">Curator does not have active listings in shop catalog.</p>
            </div>
          )}
        </div>

        {/* Feedbacks Column - Take up 1 column */}
        <div className="space-y-6">
          <div className="border-b border-[#EBE8DF] pb-3 flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-[#1C1A17] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-700" />
              Client Feedback ({reviewsForThisBooth.length})
            </h2>
            <span className="text-amber-500 font-mono text-xs font-bold leading-none">★ {booth.rating.toFixed(1)}</span>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 no-scrollbar">
            {reviewsForThisBooth.length > 0 ? (
              reviewsForThisBooth.map((review) => (
                <div
                  key={review.id}
                  className="bg-white border border-stone-200 p-4 rounded-xl space-y-3 shadow-2xs hover:border-stone-300 transition-colors relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-stone-800">{review.customerName}</p>
                      <p className="text-[9px] text-stone-400 font-mono italic">
                        Item: {review.itemTitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {renderStars(review.rating)}
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed font-serif italic">
                    "{review.comment}"
                  </p>

                  <div className="flex justify-between items-center text-[9px] text-stone-400 font-mono pt-1 border-t border-stone-50">
                    <span className="text-[8px] tracking-wider uppercase font-extrabold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100">
                      ✓ Authenticated Buyer
                    </span>
                    <span>
                      {new Date(review.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white border border-dashed border-[#EBE8DF] rounded-xl">
                <Quote className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-xs font-mono text-stone-400">No client feedback reviews logged yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
