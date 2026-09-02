import React from "react";
import { Lookbook, VintageItem } from "../types";
import { Sparkles, Shirt, Eye, ArrowRight, Gavel } from "lucide-react";
import { motion } from "motion/react";

interface LookbookShowcaseProps {
  lookbooks: Lookbook[];
  items: VintageItem[];
  onSelectItem: (item: VintageItem) => void;
}

export default function LookbookShowcase({ lookbooks, items, onSelectItem }: LookbookShowcaseProps) {
  return (
    <div className="space-y-12 animate-fade-in" id="lookbook_showcase_container">
      {/* Narrative header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="font-mono text-xs uppercase tracking-widest text-amber-700 font-bold block">
          Editorial Insights
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-[#1C1A17]">
          Curated Fit Lookbooks
        </h2>
        <p className="text-[#6B6152] font-sans">
          Discover hand-styled pairings arranged by our curators. Instead of singular items, experience garments structured into historical ensembles. Tap any featured item below to bid on it instantly.
        </p>
      </div>

      <div className="space-y-16" id="lookbooks_editorial_list">
        {lookbooks.map((lookbook, index) => {
          // Resolve lookbook items
          const featuredItems = items.filter((item) => lookbook.itemIds.includes(item.id));

          return (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              key={lookbook.id}
              id={`lookbook_section_${lookbook.id}`}
              className={`flex flex-col xl:flex-row items-stretch gap-8 lg:gap-12 bg-[#FCFBF8] border border-[#EBE8DF] p-6 lg:p-10 rounded-3xl ${
                index % 2 === 1 ? "xl:flex-row-reverse" : ""
              }`}
            >
              {/* Editorial aesthetic portrait */}
              <div className="w-full xl:w-1/2 relative min-h-[350px] lg:min-h-[450px] rounded-2xl overflow-hidden bg-stone-100 shadow-md">
                <img
                  src={lookbook.imageUrl}
                  alt={lookbook.title}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover transform duration-1000 hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 sm:p-10 flex flex-col justify-end text-white">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {lookbook.tags.map((tag) => (
                      <span key={tag} className="font-mono text-[9px] uppercase tracking-widest bg-amber-500 text-[#1C1A17] px-2.5 py-0.5 rounded font-bold">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-serif text-3xl font-bold tracking-tight mb-2">
                    {lookbook.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-stone-200 leading-relaxed max-w-lg">
                    {lookbook.description}
                  </p>
                  <p className="font-mono text-[10px] text-amber-400 mt-4 uppercase">
                    Curator Ensemble by {lookbook.curatorName}
                  </p>
                </div>
              </div>

              {/* Garments checklist slider */}
              <div className="w-full xl:w-1/2 flex flex-col justify-between py-2 space-y-6">
                <div>
                  <h4 className="font-mono text-xs uppercase tracking-widest text-[#1C1A17] font-bold pb-3 border-b border-[#EBE8DF] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-600 animate-pulse" />
                    Featured Closet Pieces Inside This Look ({featuredItems.length})
                  </h4>

                  <div className="space-y-4 pt-6" id="lookbook_item_subcards">
                    {featuredItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => onSelectItem(item)}
                        id={`lookbook_item_card_${item.id}`}
                        className="group flex gap-4 p-4 bg-[#FAF9F5] hover:bg-white border border-[#EBE8DF] hover:border-amber-700/50 rounded-2xl cursor-pointer transition-all shadow-xs hover:shadow-md"
                      >
                        {/* Circle photo */}
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-16 h-20 rounded-lg object-cover bg-stone-100 shadow-sm"
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="font-mono text-[10px] text-amber-800 font-bold uppercase">
                                {item.era} • Size {item.size}
                              </span>
                              <span className="font-mono text-[11px] font-bold text-stone-900 bg-stone-100 py-0.5 px-2 rounded">
                                {item.isSold ? "Closed" : "Active Auction"}
                              </span>
                            </div>
                            <h5 className="font-serif text-sm sm:text-base font-bold text-[#1C1A17] group-hover:text-amber-800 transition-colors line-clamp-1 mt-0.5">
                              {item.title}
                            </h5>
                          </div>

                          <div className="flex justify-between items-center pt-2">
                            <span className="text-xs text-[#544E45] font-mono">
                              Current Bid: <strong className="text-stone-900">₦{item.currentBid}</strong>
                            </span>
                            <span className="text-xs font-mono font-bold text-amber-700 group-hover:text-[#1C1A17] flex items-center gap-1">
                              <span>Examine Piece</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Aesthetic footer banner inside lookbook */}
                <div className="bg-amber-50/50 border border-amber-200/40 p-4 rounded-2xl text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    <strong className="text-[#1C1A17]">Exclusive Curation Advantage</strong>
                  </div>
                  <p className="text-[#6B6152] leading-relaxed text-[11px]">
                    Sourcing lookbook sets directly grants a <strong>₦2,500 reduction on combined shipping charges</strong> across booth catalogs. Each package leaves our clean room inspected and courier insured.
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
