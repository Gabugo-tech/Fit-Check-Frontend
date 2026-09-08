import React, { useState, useEffect } from "react";
import { Package, Clock, Truck, CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";
import { ordersApi, tokenStore } from "../lib/api";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode; bg: string }> = {
  pending:   { label: "Order Placed",  color: "text-amber-700",  bg: "bg-amber-50 border-amber-200",  icon: <Clock className="w-4 h-4" /> },
  confirmed: { label: "Confirmed",     color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",    icon: <CheckCircle className="w-4 h-4" /> },
  shipped:   { label: "Shipped",       color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: <Truck className="w-4 h-4" /> },
  delivered: { label: "Delivered ✓",  color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: <CheckCircle className="w-4 h-4" /> },
  cancelled: { label: "Cancelled",    color: "text-red-700",    bg: "bg-red-50 border-red-200",       icon: <XCircle className="w-4 h-4" /> },
};

export default function OrdersPage() {
  const [orders, setOrders]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isLoggedIn = Boolean(tokenStore.get());

  const load = async () => {
    setLoading(true);
    try {
      const data = await ordersApi.getAll();
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (!isLoggedIn) {
    return (
      <div className="text-center py-24">
        <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-stone-700">Sign in to view your orders</h3>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-[#667eea]" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-24">
        <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-stone-700">No orders yet</h3>
        <p className="text-stone-400 text-sm mt-1">Your orders will appear here after checkout</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-stone-900">My Orders</h2>
        <button onClick={load} className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {orders.map(order => {
        const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
        return (
          <div key={order.id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Status bar */}
            <div className={`flex items-center gap-2 px-5 py-3 border-b ${cfg.bg}`}>
              <span className={cfg.color}>{cfg.icon}</span>
              <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
              <span className="ml-auto text-xs text-stone-400 font-mono">#{order.order_number}</span>
            </div>

            {/* Order details */}
            <div className="p-5 flex gap-4">
              {order.item_image && (
                <img src={order.item_image} alt={order.item_title} className="w-16 h-16 object-cover rounded-xl border border-stone-200 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-900 leading-snug line-clamp-2">{order.item_title}</p>
                <p className="text-sm text-stone-500 mt-0.5">{order.seller_name || "FitCheck"}</p>
                <p className="text-lg font-bold mt-1" style={{ color: "#667eea" }}>₦{Number(order.amount).toLocaleString()}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="px-5 pb-4">
              <div className="flex items-center gap-1">
                {["pending", "confirmed", "shipped", "delivered"].map((s, i) => {
                  const statuses = ["pending", "confirmed", "shipped", "delivered"];
                  const currentIdx = statuses.indexOf(order.status);
                  const done = i <= currentIdx && order.status !== "cancelled";
                  return (
                    <React.Fragment key={s}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors ${
                        done ? "border-[#667eea] bg-[#667eea] text-white" : "border-stone-200 bg-white text-stone-400"
                      }`}>
                        {i + 1}
                      </div>
                      {i < 3 && <div className={`flex-1 h-0.5 ${done && i < currentIdx ? "bg-[#667eea]" : "bg-stone-200"}`} />}
                    </React.Fragment>
                  );
                })}
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-stone-400">
                <span>Placed</span><span>Confirmed</span><span>Shipped</span><span>Delivered</span>
              </div>
            </div>

            {/* Address */}
            {order.address && (
              <div className="px-5 pb-4 text-xs text-stone-500">
                📍 {order.address}
              </div>
            )}

            <div className="px-5 pb-4 text-xs text-stone-400">
              Ordered {new Date(order.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
