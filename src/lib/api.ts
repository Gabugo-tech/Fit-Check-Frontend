/**
 * FitCheck API Client
 * Development: set VITE_API_URL=http://localhost:3001 in .env.local
 * Production:  set VITE_API_URL=https://your-fitcheck-backend.vercel.app in Vercel
 */

const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");



// ─── Token management ───────────────────────────────────────────────────────
export const tokenStore = {
  get: () => localStorage.getItem("fitcheck_token") || "",
  set: (t: string) => localStorage.setItem("fitcheck_token", t),
  clear: () => localStorage.removeItem("fitcheck_token"),
};

function authHeaders(): HeadersInit {
  const token = tokenStore.get();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data as T;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface CheckoutSessionResponse {
  id: string;
  url?: string | null;
  mode: "stripe" | "demo";
  amount: number;
  message?: string;
}

export const authApi = {
  register: (data: { name: string; email: string; phone: string; password: string }) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
};

// ─── OTP ─────────────────────────────────────────────────────────────────────
export const otpApi = {
  send: (email: string) =>
    request<{ ok: boolean; message: string; email: string }>(
      "/otp/send",
      { method: "POST", body: JSON.stringify({ email }) }
    ),

  verify: (email: string, code: string) =>
    request<{ ok: boolean; message: string; email: string }>(
      "/otp/verify",
      { method: "POST", body: JSON.stringify({ email, code }) }
    ),
};

export const checkoutApi = {
  createSession: (data: { itemId: string; buyerName: string }) =>
    request<CheckoutSessionResponse>("/checkout/session", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── Items ───────────────────────────────────────────────────────────────────
export const itemsApi = {
  getAll: () => request<any[]>("/items"),

  create: (data: any) =>
    request<any>("/items", { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: any) =>
    request<any>(`/items/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  delete: (id: string) =>
    request<{ ok: boolean }>(`/items/${id}`, { method: "DELETE" }),
};

// ─── Bids ────────────────────────────────────────────────────────────────────
export const bidsApi = {
  getAll: (itemId?: string) =>
    request<any[]>(itemId ? `/bids?itemId=${itemId}` : "/bids"),

  place: (data: { itemId: string; amount: number; bidderName: string }) =>
    request<any>("/bids", { method: "POST", body: JSON.stringify(data) }),
};

// ─── Purchases ───────────────────────────────────────────────────────────────
export const purchasesApi = {
  getAll: () => request<any[]>("/purchases"),

  complete: (data: { itemId: string; buyerName: string }) =>
    request<any>("/purchases", { method: "POST", body: JSON.stringify(data) }),
};

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export const wishlistApi = {
  get: () => request<string[]>("/wishlist"),

  toggle: (itemId: string) =>
    request<{ action: "added" | "removed"; itemId: string }>(
      "/wishlist",
      { method: "POST", body: JSON.stringify({ itemId }) }
    ),
};

// ─── Reviews ─────────────────────────────────────────────────────────────────
export const reviewsApi = {
  getByVendor: (vendorId: string) => request<any[]>(`/reviews?vendorId=${vendorId}`),

  submit: (data: {
    vendorId: string;
    vendorName: string;
    itemTitle: string;
    customerName: string;
    rating: number;
    comment: string;
  }) => request<any>("/reviews", { method: "POST", body: JSON.stringify(data) }),
};

// ─── DB to Frontend type mapper ───────────────────────────────────────────────
export function mapDbItem(row: any) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    category: row.category || "Outerwear",
    era: row.era || "Vintage",
    condition: row.condition || "Good",
    size: row.size || "M",
    sellerId: row.seller_id || "booth-1",
    sellerName: row.seller_name || "FitCheck",
    sellerAvatar: row.seller_avatar || "",
    marketName: row.market_name || "",
    imageUrl: row.image_url || "",
    startingBid: Number(row.starting_bid || 0),
    currentBid: Number(row.current_bid || 0),
    buyPrice: row.buy_price ? Number(row.buy_price) : null,
    bidsCount: Number(row.bids_count || 0),
    highestBidder: row.highest_bidder || null,
    biddingEndsAt: row.bidding_ends_at || new Date(Date.now() + 86400000 * 3).toISOString(),
    isSold: Boolean(row.is_sold),
    bidDropped: Boolean(row.bid_dropped),
    bidDroppedReason: row.bid_dropped_reason || "",
    tags: row.tags || [],
    measurements: row.measurements || {},
    materials: row.materials || [],
    history: row.history || "",
  };
}

export function mapDbBid(row: any) {
  return {
    id: row.id,
    itemId: row.item_id,
    itemTitle: row.item_title || "",
    bidderName: row.bidder_name || "",
    amount: Number(row.amount || 0),
    timestamp: row.created_at || new Date().toISOString(),
  };
}
