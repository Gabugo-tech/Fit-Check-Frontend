import { useState, useEffect, useCallback } from "react";
import {
  itemsApi,
  bidsApi,
  purchasesApi,
  wishlistApi,
  checkoutApi,
  mapDbItem,
  mapDbBid,
  tokenStore,
} from "./api";
import { safeLocalStorage } from "./storage";
import { INITIAL_BOOTHS, INITIAL_LOOKBOOKS } from "../data";
import type { VintageItem, BidRecord } from "../types";

export function useAppData() {
  const [items, setItems] = useState<VintageItem[]>([]);
  const [bidLogs, setBidLogs] = useState<BidRecord[]>([]);
  const [purchasedItemIds, setPurchasedItemIds] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingBackend, setUsingBackend] = useState(false);

  // ─── Load all data ───────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setIsLoading(true);
    const hasToken = Boolean(tokenStore.get());

    try {
      // Try backend first
      const [dbItems, dbBids] = await Promise.all([
        itemsApi.getAll(),
        bidsApi.getAll(),
      ]);

      const mappedItems = dbItems.map(mapDbItem) as VintageItem[];
      const mappedBids = dbBids.map(mapDbBid) as BidRecord[];

      setItems(mappedItems);
      setBidLogs(mappedBids);
      setUsingBackend(true);

      // Load purchases & wishlist if logged in
      if (hasToken) {
        const [purchases, wl] = await Promise.all([
          purchasesApi.getAll(),
          wishlistApi.get(),
        ]);
        setPurchasedItemIds(purchases.map((p: any) => p.item_id));
        setWishlist(wl);
      }
    } catch {
      // Backend not available — fall back to localStorage
      setUsingBackend(false);
      loadFromLocalStorage();
    }

    setIsLoading(false);
  }, []);

  function loadFromLocalStorage() {
    try {
      const storedItems = safeLocalStorage.getItem("vintage_items_list");
      const storedBids = safeLocalStorage.getItem("vintage_bidlogs_list");
      const storedPurchases = safeLocalStorage.getItem("vintage_purchased_ids");
      const storedWishlist = safeLocalStorage.getItem("wishlist");

      setItems(storedItems ? JSON.parse(storedItems) : []);
      setBidLogs(storedBids ? JSON.parse(storedBids) : []);
      setPurchasedItemIds(storedPurchases ? JSON.parse(storedPurchases) : []);
      setWishlist(storedWishlist ? JSON.parse(storedWishlist) : []);
    } catch {
      setItems([]);
    }
  }

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Place bid ───────────────────────────────────────────────────────────
  const placeBid = useCallback(async (
    itemId: string,
    amount: number,
    bidderName: string
  ) => {
    if (usingBackend) {
      const bid = await bidsApi.place({ itemId, amount, bidderName });
      const mapped = mapDbBid(bid) as BidRecord;
      setBidLogs(prev => [...prev, mapped]);
      setItems(prev => prev.map(i =>
        i.id === itemId
          ? { ...i, currentBid: amount, bidsCount: i.bidsCount + 1, highestBidder: bidderName }
          : i
      ));
      return mapped;
    } else {
      // localStorage fallback
      const newBid: BidRecord = {
        id: `bid-${Date.now()}`,
        itemId,
        itemTitle: items.find(i => i.id === itemId)?.title || "",
        bidderName,
        amount,
        timestamp: new Date().toISOString(),
      };
      const updatedBids = [...bidLogs, newBid];
      const updatedItems = items.map(i =>
        i.id === itemId
          ? { ...i, currentBid: amount, bidsCount: i.bidsCount + 1, highestBidder: bidderName }
          : i
      );
      setBidLogs(updatedBids);
      setItems(updatedItems);
      safeLocalStorage.setItem("vintage_bidlogs_list", JSON.stringify(updatedBids));
      safeLocalStorage.setItem("vintage_items_list", JSON.stringify(updatedItems));
      return newBid;
    }
  }, [usingBackend, items, bidLogs]);

  // ─── Buy now ─────────────────────────────────────────────────────────────
  const buyNow = useCallback(async (itemId: string, buyerName: string) => {
    if (usingBackend) {
      try {
        const checkoutSession = await checkoutApi.createSession({ itemId, buyerName });

        if (checkoutSession.url) {
          window.location.href = checkoutSession.url;
          return;
        }

        setPurchasedItemIds(prev => [...prev, itemId]);
        setItems(prev => prev.map(i =>
          i.id === itemId ? { ...i, isSold: true, highestBidder: buyerName } : i
        ));

        if (checkoutSession.message) {
          console.info(checkoutSession.message);
        }

        return;
      } catch {
        // Fall back to direct purchase if checkout session creation fails.
      }

      try {
        await purchasesApi.complete({ itemId, buyerName });
        setPurchasedItemIds(prev => [...prev, itemId]);
        setItems(prev => prev.map(i =>
          i.id === itemId ? { ...i, isSold: true, highestBidder: buyerName } : i
        ));
        return;
      } catch {
        // Keep local fallback below when backend purchase APIs are unavailable.
      }
    }

    const updated = [...purchasedItemIds, itemId];
    const updatedItems = items.map(i =>
      i.id === itemId ? { ...i, isSold: true, highestBidder: buyerName } : i
    );
    setPurchasedItemIds(updated);
    setItems(updatedItems);
    safeLocalStorage.setItem("vintage_purchased_ids", JSON.stringify(updated));
    safeLocalStorage.setItem("vintage_items_list", JSON.stringify(updatedItems));
  }, [usingBackend, items, purchasedItemIds]);

  // ─── Toggle wishlist ──────────────────────────────────────────────────────
  const toggleWishlist = useCallback(async (itemId: string) => {
    if (usingBackend) {
      const result = await wishlistApi.toggle(itemId);
      setWishlist(prev =>
        result.action === "added"
          ? [...prev, itemId]
          : prev.filter(id => id !== itemId)
      );
    } else {
      const updated = wishlist.includes(itemId)
        ? wishlist.filter(id => id !== itemId)
        : [...wishlist, itemId];
      setWishlist(updated);
      safeLocalStorage.setItem("wishlist", JSON.stringify(updated));
    }
  }, [usingBackend, wishlist]);

  return {
    items, setItems,
    bidLogs, setBidLogs,
    purchasedItemIds, setPurchasedItemIds,
    wishlist, setWishlist,
    isLoading,
    usingBackend,
    loadData,
    placeBid,
    buyNow,
    toggleWishlist,
  };
}
