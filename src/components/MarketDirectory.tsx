import React, { useState } from "react";
import { MarketBooth } from "../types";
import { MapPin, Calendar, Star, ArrowRight, Award } from "lucide-react";
import { motion } from "motion/react";

// Helper function to render star ratings including fractional (half) stars
const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(
        <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
      );
    } else if (i === fullStars + 1 && rating % 1 >= 0.25) {
      if (rating % 1 >= 0.75) {
        stars.push(
          <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
        );
      } else {
        stars.push(
          <div key={i} className="relative inline-block w-3.5 h-3.5 shrink-0 align-middle">
            <Star className="w-3.5 h-3.5 text-stone-300 absolute" />
            <div className="absolute overflow-hidden w-[50%] left-0 top-0 h-full">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            </div>
          </div>
        );
      }
    } else {
      stars.push(
        <Star key={i} className="w-3.5 h-3.5 text-stone-300 shrink-0" />
      );
    }
  }
  return stars;
};

interface MarketDirectoryProps {
  booths: MarketBooth[];
  onSelectBooth: (boothId: string) => void;
  itemCounts: Record<string, number>;
}

export default function MarketDirectory({ booths, onSelectBooth, itemCounts }: MarketDirectoryProps) {
  const [applicationSent, setApplicationSent] = useState(false);
  return (
    <div className="space-y-12 animate-fade-in" id="market_directory_container">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="font-mono text-xs uppercase tracking-widest text-amber-700 font-bold block">
          Behind the Garments
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-[#1C1A17]">
          The Curators & Stallholders
        </h2>
        <p className="text-[#6B6152] font-sans">
          Unlike ordinary mass-market platforms, every piece in our vault is curated by independent physical stallholders who source, authenticate, and care for fashion history. Meet the masters.
        </p>
      </div>

      {/* Booths Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="market_stalls_grid_list">
        {booths.map((booth, idx) => {
          const stockCount = itemCounts[booth.id] || 0;
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={booth.id}
              id={`booth_card_${booth.id}`}
              className="bg-[#FCFBF8] border border-[#EBE8DF] rounded-2xl overflow-hidden hover:shadow-lg transition-all group flex flex-col md:flex-row"
            >
              {/* Image banner section */}
              <div className="w-full md:w-2/5 relative h-48 md:h-auto min-h-[180px] bg-stone-100">
                <img
                  src={booth.bannerImage}
                  alt={booth.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-end p-4 md:p-6 text-white">
                  <span className="font-mono text-[10px] uppercase tracking-widest bg-amber-500 text-stone-950 px-2 py-0.5 rounded font-bold self-start mb-2">
                    {booth.aesthetic}
                  </span>
                  <div className="flex items-center gap-2">
                    <img
                      src={booth.avatar}
                      alt={booth.curator}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full border-1 border-white/60 object-cover"
                    />
                    <div>
                      <p className="text-xs text-stone-200">Curated by</p>
                      <p className="text-sm font-bold">{booth.curator}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informative description */}
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-[#1C1A17] group-hover:text-amber-800 transition-colors">
                        {booth.name}
                      </h3>
                      <div className="flex items-center gap-1 text-[#877F70] text-sm mt-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        <span>{booth.location}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 rounded-lg text-amber-800 font-mono text-sm font-bold border border-amber-100">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{booth.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-0.5" title={`Rating: ${booth.rating.toFixed(1)} out of 5`}>
                        {renderStars(booth.rating)}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-[#544E45] italic leading-relaxed">
                    "{booth.tagline}"
                  </p>
                  
                  <p className="text-xs text-[#877F70] leading-relaxed line-clamp-3">
                    {booth.bio}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#EBE8DF]/60 flex justify-between items-center">
                  <div className="flex items-center gap-4 text-xs font-mono text-[#877F70]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      {booth.established}
                    </span>
                    <span className="bg-[#FAF9F5] px-2 py-1 rounded border border-[#EBE8DF] text-[#1C1A17]">
                      {stockCount} Pieces Listed
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectBooth(booth.id)}
                    id={`view_stall_btn_${booth.id}`}
                    className="flex items-center gap-1 text-sm font-medium text-[#1C1A17] hover:text-amber-700 transition-colors group/btn"
                  >
                    <span>View Stall</span>
                    <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Extra Interactive Section to Establish Authenticity */}
      <div className="bg-[#1C1A17] text-[#FAF9F5] p-8 sm:p-12 rounded-2xl border border-stone-800 flex flex-col md:flex-row items-center justify-between gap-8 mt-12 shadow-md">
        <div className="space-y-4 max-w-xl">
          <div className="flex items-center gap-2">
            <Award className="text-amber-400 w-6 h-6" />
            <span className="font-mono text-xs uppercase tracking-widest text-amber-400 font-bold">
              The Atelier Curator Charter
            </span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl">Are you a curated vendor?</h3>
          <p className="text-stone-300 text-sm leading-relaxed">
            We onboard physical boutique owners who seek to dodge fast-fashion listing models. Apply to list your physical vintage market box on Atelier, enable authentic auction-bidding processes, and directly reach true archivists.
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-3">
          {applicationSent ? (
            <div className="bg-emerald-900/60 border border-emerald-700 text-emerald-300 px-5 py-3 rounded-lg text-xs font-mono font-bold">
              ✓ Application received — our team will reach out within 48 hrs!
            </div>
          ) : (
            <button
              onClick={() => setApplicationSent(true)}
              className="bg-[#FAF9F5] text-[#1C1A17] hover:bg-[#FAF9F5]/90 transition-all font-medium py-3.5 px-6 rounded-lg text-sm whitespace-nowrap shadow-sm"
            >
              Request Curated Verify
            </button>
          )}
          <p className="text-[10px] text-stone-500 font-mono max-w-xs text-right">
            Custom shop registrations are also enabled inside the <strong className="text-stone-400">Curate a Piece</strong> tab.
          </p>
        </div>
      </div>
    </div>
  );
}
