import React, { useState, useEffect } from "react";
import { VintageItem, BidRecord } from "../types";
import { safeLocalStorage } from "../lib/storage";
import { ordersApi } from "../lib/api";
import { Heart, ShieldCheck, Store, CheckCircle, Clock, Truck, XCircle, RefreshCw } from "lucide-react";

interface ClosetHubProps {
  items: VintageItem[];
  bidLogs: BidRecord[];
  purchasedItemIds: string[];
  onSelectItem: (item: VintageItem) => void;
  onClearPurchases: () => void;
  wishlist: string[];
  currentUserName?: string;
  currentUserEmail?: string;
  isAdmin?: boolean;
}

const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: "Order Placed",  color: "text-amber-700",   icon: <Clock className="w-3.5 h-3.5" /> },
  confirmed: { label: "Confirmed",     color: "text-blue-700",    icon: <CheckCircle className="w-3.5 h-3.5" /> },
  shipped:   { label: "Shipped",       color: "text-purple-700",  icon: <Truck className="w-3.5 h-3.5" /> },
  delivered: { label: "Delivered",     color: "text-emerald-700", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  cancelled: { label: "Cancelled",     color: "text-red-700",     icon: <XCircle className="w-3.5 h-3.5" /> },
};

export default function ClosetHub({
  items, bidLogs, purchasedItemIds, onSelectItem, onClearPurchases,
  wishlist, currentUserName, currentUserEmail, isAdmin = false,
}: ClosetHubProps) {
  const userName = currentUserName || safeLocalStorage.getItem("user_name") || "Member";

  // Wishlist driven by live prop from parent
  const bookmarkedItems = items.filter((item) => wishlist.includes(item.id));

  // Items purchased or won by the user
  const wonItems = items.filter((item) => {
    if (purchasedItemIds.includes(item.id)) return true;
    return item.isSold && item.highestBidder?.toLowerCase() === userName.toLowerCase();
  });

  // Custom listings for admin
  const customListedItems = items.filter((item) => item.sellerId.startsWith("booth-custom"));

  // Seller orders section
  const [sellerOrders, setSellerOrders] = useState<any[]>([]);
  const [sellerOrdersLoading, setSellerOrdersLoading] = useState(false);
  // Determine if user is a seller by checking if any items list them as seller
  const userSellerId = items.find(i => i.sellerName === userName)?.sellerId || null;

  const loadSellerOrders = async () => {
    if (!userSellerId) return;
    setSellerOrdersLoading(true);
    try {
      const all = await ordersApi.getAll();
      setSellerOrders(all.filter((o: any) => o.seller_id === userSellerId));
    } catch {
      setSellerOrders([]);
    } finally {
      setSellerOrdersLoading(false);
    }
  };

  useEffect(() => {
    loadSellerOrders();
  }, [userSellerId]);

  return (
    <div className="space-y-10 animate-fade-in" id="closet_hub_root">

      {/* Profile bio block */}
      <div className="bg-[#1C1A17] text-[#FAF9F5] p-6 sm:p-10 rounded-2xl border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center text-[#1C1A17] font-serif text-3xl font-bold border border-amber-300">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h2 className="font-serif text-xl sm:text-2xl font-bold">{userName}</h2>
            {currentUserEmail && (
              <p className="text-stone-400 text-sm">{currentUserEmail}</p>
            )}
          </div>
        </div>

        <div className="flex gap-4 font-mono text-xs text-center">
          <div className="bg-stone-900 border border-stone-800 p-3.5 rounded-xl min-w-[80px]">
            <span className="text-[#877F70] block text-[9px] uppercase">Saved</span>
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

      {/* Grid of Saved vs Purchases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Saved items section */}
        <div className="bg-[#FCFBF8] border border-[#EBE8DF] p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#1C1A17] pb-3 border-b border-[#EBE8DF] flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-100" />
            Saved Items ({bookmarkedItems.length})
          </h3>

          <div className="space-y-4" id="closet_hub_saved_items">
            {bookmarkedItems.length > 0 ? (
              bookmarkedItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="p-4 bg-[#FAF9F5] border border-[#EBE8DF]/80 hover:border-amber-700/40 rounded-xl cursor-pointer transition-all flex justify-between items-center group"
                >
                  <div className="flex gap-3">
                    <img src={item.imageUrl} alt={item.title} referrerPolicy="no-referrer" className="w-12 h-14 object-cover rounded" />
                    <div>
                      <h4 className="font-serif text-sm font-bold text-[#1C1A17] group-hover:text-amber-800 line-clamp-1">{item.title}</h4>
                      <p className="font-mono text-[10px] text-stone-500 mt-1">Price: <strong className="text-stone-900">₦{(item.buyPrice || item.currentBid).toLocaleString()}</strong></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-amber-50 text-amber-800 text-[9px] font-mono font-bold px-2.5 py-1 rounded border border-amber-200">
                      {item.condition}
                    </span>
                    <span className="block text-[9px] text-[#877F70] mt-1.5 underline">View item</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-[#877F70]">
                <p className="text-xs">No saved items yet.</p>
                <p className="text-[10px] text-stone-400 mt-1">Tap the heart on any item to save it here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Purchases section */}
        <div className="bg-[#FCFBF8] border border-[#EBE8DF] p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#EBE8DF]">
            <h3 className="font-serif text-lg font-bold text-[#1C1A17] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              My Purchases ({wonItems.length})
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

          <div className="space-y-4" id="closet_hub_purchases">
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
                      <p className="font-mono text-[10px] text-emerald-800 mt-1">Purchased: <strong className="text-[#1C1A17]">₦{(item.buyPrice || item.currentBid).toLocaleString()}</strong></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold py-1 px-2.5 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-700" />
                      CONFIRMED
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-[#877F70]">
                <p className="text-xs">No purchases yet.</p>
                <p className="text-[10px] text-stone-400 mt-1">Complete a checkout to see your orders here.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Seller orders — shown if user has items listed */}
      {userSellerId && (
        <div className="bg-[#FCFBF8] border border-[#EBE8DF] p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EBE8DF]">
            <h3 className="font-serif text-lg font-bold text-[#1C1A17] flex items-center gap-2">
              <Store className="w-5 h-5 text-amber-700" />
              My Store Orders ({sellerOrders.length})
            </h3>
            <button
              onClick={loadSellerOrders}
              className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>

          {sellerOrdersLoading ? (
            <div className="py-8 text-center text-stone-400 text-xs">Loading orders…</div>
          ) : sellerOrders.length === 0 ? (
            <div className="text-center py-12 text-[#877F70]">
              <p className="text-xs">No orders for your items yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sellerOrders.map(order => {
                const cfg = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.pending;
                return (
                  <div key={order.id} className="border border-stone-200 rounded-xl p-4 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-900 text-sm truncate">{order.item_title}</p>
                      <p className="text-xs text-stone-500 mt-0.5">by {order.buyer_name || order.buyer_email}</p>
                      <p className="text-sm font-bold text-[#667eea] mt-1">₦{Number(order.amount).toLocaleString()}</p>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-semibold ${cfg.color}`}>
                      {cfg.icon}
                      {cfg.label}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Custom listings manager — admin only */}
      {isAdmin && (
        <div className="bg-[#FCFBF8] border border-[#EBE8DF] p-6 sm:p-8 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#1C1A17] pb-3 border-b border-[#EBE8DF] flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-700" />
            My Listed Items ({customListedItems.length})
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
                      <span>Price:</span>
                      <strong>₦{(item.buyPrice || item.currentBid).toLocaleString()}</strong>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-[#877F70] border border-dashed border-[#EBE8DF] rounded-xl max-w-lg mx-auto">
              <p className="text-xs">No custom listings yet.</p>
              <p className="text-[10px] text-stone-400 mt-1">Use the Admin Dashboard to add new items.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
