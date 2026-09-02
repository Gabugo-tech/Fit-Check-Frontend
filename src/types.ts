export interface VintageItem {
  id: string;
  title: string;
  description: string;
  category: string;
  era: string;
  condition: string;
  size: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  marketName: string;
  imageUrl: string;
  startingBid: number;
  currentBid: number;
  buyPrice: number | null;
  bidsCount: number;
  highestBidder: string | null;
  biddingEndsAt: string; // ISO Datetime string
  isSold: boolean;
  tags: string[];
  bidDropped?: boolean;
  bidDroppedReason?: string;
  measurements?: {
    pitToPit?: string;
    length?: string;
    waist?: string;
  };
  materials?: string[];
  history?: string; // Rich back-story/provenance of the piece
}

export interface MarketBooth {
  id: string;
  name: string;
  curator: string;
  avatar: string;
  tagline: string;
  bio: string;
  location: string;
  rating: number;
  established: string;
  aesthetic: string;
  bannerImage: string;
}

export interface BidRecord {
  id: string;
  itemId: string;
  itemTitle: string;
  bidderName: string;
  amount: number;
  timestamp: string;
}

export interface Lookbook {
  id: string;
  title: string;
  description: string;
  curatorId: string;
  curatorName: string;
  itemIds: string[]; // Vintage items that make up this styled fit
  imageUrl: string;
  tags: string[];
}
