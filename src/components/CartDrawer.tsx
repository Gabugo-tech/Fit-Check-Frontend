import React, { useState, useEffect } from "react";
import { X, ShoppingBag, Trash2, CheckCircle, Loader2, MapPin } from "lucide-react";
import { cartApi, ordersApi } from "../lib/api";
import { tokenStore } from "../lib/api";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced?: () => void;
  userName?: string;
}

export default function CartDrawer({ isOpen, onClose, onOrderPlaced, userName = "" }: CartDrawerProps) {
  const [cartItems, setCartItems]   = useState<any[]>([]);
  const [loading, setLoading]       = useState(false);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [address, setAddress]       = useState("");
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);

  const isLoggedIn = Boolean(tokenStore.get());

  const loadCart = async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    try {
      const items = await cartApi.get();
      setCartItems(items);
    } catch {
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) loadCart();
  }, [isOpen]);

  const handleRemove = async (itemId: string) => {
    try {
      await cartApi.remove(itemId);
      setCartItems(prev => prev.filter(i => i.item_id !== itemId));
    } catch {}
  };

  const handleCheckout = async (item: any) => {
    if (!address.trim()) { setError("Please enter your delivery address."); return; }
    setError(null);
    setCheckingOut(item.item_id);
    try {
      const order = await ordersApi.place({
        itemId: item.item_id,
        buyerName: userName || item.user_email,
        address: address.trim(),
      });
      setCartItems(prev => prev.filter(i => i.item_id !== item.item_id));
      setOrderSuccess(`Order #${order.order_number} placed! We'll contact you soon.`);
      onOrderPlaced?.();
      setTimeout(() => setOrderSuccess(null), 6000);
    } catch (err: any) {
      setError(err.message || "Checkout failed. Please try again.");
    } finally {
      setCheckingOut(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#667eea]" />
            <h2 className="text-lg font-bold text-stone-900">My Cart</h2>
            {cartItems.length > 0 && (
              <span className="bg-[#667eea] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {cartItems.length}
              </span>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors">
            <X className="w-4 h-4 text-stone-600" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!isLoggedIn ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
              <p className="text-stone-500 text-sm">Sign in to view your cart</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-[#667eea]" />
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
              <p className="font-semibold text-stone-700">Your cart is empty</p>
              <p className="text-stone-400 text-sm">Add items from the shop to get started</p>
            </div>
          ) : (
            <>
              {orderSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-800 font-medium">{orderSuccess}</p>
                </div>
              )}

              {/* Delivery address */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Delivery Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={e => { setAddress(e.target.value); setError(null); }}
                  placeholder="e.g. 12 Lagos Street, Ikeja, Lagos"
                  className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#667eea] transition-colors"
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
              )}

              {/* Cart items */}
              <div className="space-y-3">
                {cartItems.map(item => (
                  <div key={item.item_id} className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                    <div className="flex gap-3 mb-3">
                      {item.image_url && (
                        <img src={item.image_url} alt={item.title} className="w-16 h-16 object-cover rounded-lg shrink-0 border border-stone-200" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-stone-900 text-sm line-clamp-2 leading-snug">{item.title}</p>
                        <p className="text-xs text-stone-500 mt-0.5">{item.condition} · Size {item.size}</p>
                        <p className="text-base font-bold text-[#667eea] mt-1">
                          ₦{Number(item.buy_price || item.current_bid).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(item.item_id)}
                        className="w-7 h-7 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.is_sold ? (
                      <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center font-medium">
                        This item was sold — please remove it
                      </p>
                    ) : (
                      <button
                        onClick={() => handleCheckout(item)}
                        disabled={checkingOut === item.item_id}
                        className="w-full py-2.5 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                        style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}
                      >
                        {checkingOut === item.item_id ? (
                          <><Loader2 className="w-4 h-4 animate-spin" />Placing order…</>
                        ) : (
                          <><CheckCircle className="w-4 h-4" />Checkout · ₦{Number(item.buy_price || item.current_bid).toLocaleString()}</>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
