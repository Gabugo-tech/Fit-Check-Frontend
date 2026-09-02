import React, { useState, useEffect, useMemo } from "react";
import { VintageItem, BidRecord } from "../types";
import { safeLocalStorage } from "../lib/storage";
import { Heart, ShieldCheck, Store, Edit2, CheckCircle } from "lucide-react";

interface ClosetHubProps {
  items: VintageItem[];
  bidLogs: BidRecord[];
  purchasedItemIds: string[];
  onSelectItem: (item: VintageItem) => void;
  onClearPurchases: () => void;
  wishlist: string[];
  currentUserName?: string;
}

export default function ClosetHub({ items, bidLogs, purchasedItemIds, onSelectItem, onClearPurchases, wishlist, currentUserName }: ClosetHubProps) {
  const [userName, setUserName] = useState(currentUserName || "Anonymous Archivist");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInputValue, setNameInputValue] = useState(currentUserName || "");

  // Stable custodian number so it doesn't re-roll on every render
  const custodianNumber = useMemo(() => Math.floor(Math.random() * 8000 + 1000), []);

  // Sync state from localStorage, falling back to prop
  useEffect(() => {
    const savedName = currentUserName || safeLocalStorage.getItem("user_name") || safeLocalStorage.getItem("vintage_bidder_name") || "Anonymous Archivist";
    setUserName(savedName);
    setNameInputValue(savedName);
  }, [currentUserName]);

  const handleSaveName = () => {
    if (!nameInputValue.trim()) return;
    safeLocalStorage.setItem("vintage_bidder_name", nameInputValue.trim());
    setUserName(nameInputValue.trim());
    setIsEditingName(false);
  };

  // Wishlist driven by live prop from parent
  const bookmarkedItems = items.filter((item) => wishlist.includes(item.id));

  // Calculate items purchased or won by the user
  const wonItems = items.filter((item) => {
    if (purchasedItemIds.includes(item.id)) return true;
    return item.isSold && item.highestBidder?.toLowerCase() === userName.toLowerCase();
  });

  // Items listed by user custom booths
  const customListedItems = items.filter((item) => item.sellerId.startsWith("booth-custom"));

  return (
    <div className="space-y-10 animate-fade-in" id="closet_hub_root">
      
      {/* Profile Bio block */}
      <div className="bg-[#1C1A17] text-[#FAF9F5] p-6 sm:p-10 rounded-2xl border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center text-[#1C1A17] font-serif text-3xl font-bold border border-amber-300">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInputValue}
                    onChange={(e) => setNameInputValue(e.target.value)}
                    className="bg-stone-850 border border-stone-700 text-white rounded px-2.5 py-1 text-sm outline-none font-mono"
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 px-3 bg-amber-500 text-stone-900 rounded font-bold text-xs cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold">{userName}</h2>
                  <button 
                    onClick={() => setIsEditingName(true)}
                    className="p-1 hover:bg-stone-800 rounded text-stone-400 hover:text-white transition-colors cursor-pointer"
                    title="Edit archivist name"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <p className="font-mono text-xs text-amber-400"> FitCheck Licensed Custodian #V-{custodianNumber}</p>
          </div>
        </div>

        <div className="flex gap-4 font-mono text-xs text-center">
          <div className="bg-stone-900 border border-stone-800 p-3.5 rounded-xl min-w-[80px]">
            <span className="text-[#877F70] block text-[9px] uppercase">Bookmarked</span>
            <strong className="text-amber-400 text-lg mt-1 block">{bookmarkedItems.length}</strong>
          </div>
          <div className="bg-stone-900 border border-stone-800 p-3.5 rounded-xl min-w-[80px]">
            <span className="text-[#877F70] block text-[9px] uppercase">Purchased</span>
            <strong className="text-amber-400 text-lg mt-1 block">{wonItems.length}</strong>
          </div>
          <div className="bg-stone-900 border border-stone-800 p-3.5 rounded-xl min-w-[80px]">
            <span className="text-[#877F70] block text-[9px] uppercase">My Listings</span>
            <strong className="text-amber-400 text-lg mt-1 block">{customListedItems.length}</strong>
          </div>
        </div>
      </div>

      {/* Grid of Bookmarked vs Purchases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Bookmarked garments section */}
        <div className="bg-[#FCFBF8] border border-[#EBE8DF] p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#1C1A17] pb-3 border-b border-[#EBE8DF] flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-650 fill-rose-100" />
            My Bookmarked Archives ({bookmarkedItems.length})
          </h3>

          <div className="space-y-4" id="closet_hub_active_bids">
            {bookmarkedItems.length > 0 ? (
              bookmarkedItems.map((item) => {
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    className="p-4 bg-[#FAF9F5] border border-[#EBE8DF]/80 hover:border-amber-700/40 rounded-xl cursor-pointer transition-all flex justify-between items-center group"
                  >
                    <div className="flex gap-3">
                      <img src={item.imageUrl} alt={item.title} referrerPolicy="no-referrer" className="w-12 h-14 object-cover rounded" />
                      <div>
                        <h4 className="font-serif text-sm font-bold text-[#1C1A17] group-hover:text-amber-800 line-clamp-1">{item.title}</h4>
                        <p className="font-mono text-[10px] text-stone-500 mt-1">Direct buy price: <strong className="text-stone-900">₦{item.buyPrice || item.currentBid}</strong></p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-block bg-amber-50 text-amber-800 text-[9px] font-mono font-bold px-2.5 py-1 rounded border border-amber-200">
                        {item.condition}
                      </span>
                      <span className="block text-[9px] text-[#877F70] mt-1.5 underline">Inspect archive</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-[#877F70]">
                <p className="text-xs">You have not bookmarked any vintage pieces yet.</p>
                <p className="text-[10px] text-stone-400 mt-1">Tap the heart emblem on garments to keep them cataloged here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Won/Purchased Items section */}
        <div className="bg-[#FCFBF8] border border-[#EBE8DF] p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#EBE8DF]">
            <h3 className="font-serif text-lg font-bold text-[#1C1A17] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              Secured Vaulted Closet ({wonItems.length})
            </h3>
            {wonItems.length > 0 && (
              <button
                onClick={onClearPurchases}
                id="clear_locked_vault_btn"
                className="text-[9px] font-mono text-red-700 hover:text-red-900 border-b border-red-200 cursor-pointer"
              >
                Reset purchases
              </button>
            )}
          </div>

          <div className="space-y-4" id="closet_hub_secured_closet">
            {wonItems.length > 0 ? (
              wonItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="p-4 bg-[#FAF9F5] border border-emerald-200 hover:border-emerald-500 rounded-xl cursor-pointer transition-all flex justify-between items-center group"
                >
                  <div className="flex gap-3">
                    <img src={item.imageUrl} alt={item.title} className="w-12 h-14 object-cover rounded" />
                    <div>
                      <h4 className="font-serif text-sm font-bold text-emerald-950 line-clamp-1">{item.title}</h4>
                      <p className="font-mono text-[10px] text-emerald-800 mt-1">Directly Purchased: <strong className="text-[#1C1A17]">₦{item.buyPrice || item.currentBid}</strong></p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold py-1 px-2.5 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-700" />
                      SECURED & AUTHENTICATED
                    </span>
                    <span className="block text-[9px] text-[#877F70] mt-1.5">Open Proof scroll</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-[#877F70]">
                <p className="text-xs">Your personal closet vault space is empty.</p>
                <p className="text-[10px] text-stone-400 mt-1">Conclude checkouts on pieces to securely lock them into your shipping manifest.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Custom listings manager */}
      <div className="bg-[#FCFBF8] border border-[#EBE8DF] p-6 sm:p-8 rounded-2xl shadow-sm space-y-4">
        <h3 className="font-serif text-lg font-bold text-[#1C1A17] pb-3 border-b border-[#EBE8DF] flex items-center gap-2">
          <Store className="w-5 h-5 text-amber-700" />
          My Listed Booth Items ({customListedItems.length})
        </h3>

        {customListedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" id="personal_listings_list">
            {customListedItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="bg-[#FAF9F5] hover:bg-white border border-[#EBE8DF] rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div className="aspect-square bg-stone-100 rounded-lg overflow-hidden mb-3">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="font-mono text-[9px] uppercase text-amber-700 font-bold block">{item.era}</span>
                  <h4 className="font-serif text-sm font-bold text-[#1C1A17] line-clamp-1 mt-0.5">{item.title}</h4>
                  <p className="font-mono text-xs text-stone-600 mt-2 flex items-center justify-between">
                    <span>Retail Price:</span>
                    <strong>₦{item.buyPrice || item.currentBid}</strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-[#877F70] border border-dashed border-[#EBE8DF] rounded-xl max-w-lg mx-auto">
            <p className="text-xs">You have not uploaded any custom clothes yet.</p>
            <p className="text-[10px] text-stone-400 mt-1">Use the upload lounges to catalog new curated inventory pieces.</p>
          </div>
        )}
      </div>

    </div>
  );
}
