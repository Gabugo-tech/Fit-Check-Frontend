import { VintageItem, MarketBooth, Lookbook } from "./types";

export const INITIAL_BOOTHS: MarketBooth[] = [
  {
    id: "booth-1",
    name: "Neon Nostalgia",
    curator: "Chloe Sterling",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
    tagline: "London's premier crate of 70s rebellion and Y2K technical gear.",
    bio: "Based out of Portobello Road Market, Chloe has spent fifteen years scouring the attic trunks of Camden and Shoreditch to assemble a collection that merges 70s rock rebellion with futuristic Y2K functionality.",
    location: "London, UK (Portobello Road)",
    rating: 4.9,
    established: "Est. 2011",
    aesthetic: "70s Rock & Y2K Tech",
    bannerImage: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80"
  },
  {
    id: "booth-2",
    name: "Concrete Paradise",
    curator: "Hiroshi Tanaka",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    tagline: "Satin flight bombers, Japanese workwear, and City-Pop relics.",
    bio: "Hiroshi's booth in Shimokitazawa is a haven for lovers of Showa-era Japan. Every piece is sourced directly from vintage collectors across Kyoto and Tokyo, with an uncompromising focus on fabrics and craftsmanship.",
    location: "Tokyo, JP (Shimokitazawa)",
    rating: 4.8,
    established: "Est. 2015",
    aesthetic: "Japanese Denim & Souvenir Jackets",
    bannerImage: "https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5c?w=800&q=80"
  },
  {
    id: "booth-3",
    name: "Vagabond Threads",
    curator: "Jax Montgomery",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80",
    tagline: "Single-stitched rock tour relics and thrifted lumberjack grunge.",
    bio: "Operating out of Brooklyn Flea, Jax hunts down highly coveted 90s vintage. We live for paper-thin tees, faded band logos, and rugged denim with a lifetime of character.",
    location: "Brooklyn, NY (Brooklyn Flea)",
    rating: 4.7,
    established: "Est. 2018",
    aesthetic: "90s Alternative & Grunge",
    bannerImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80"
  },
  {
    id: "booth-4",
    name: "The Velvet Archive",
    curator: "Alessia Moretti",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    tagline: "Mid-century European high couture and Milanese operatic wear.",
    bio: "Alessia's collection at Milan's Navigli Flea Market represents the pinnacle of luxury vintage. Sourced from estate sales across Florence and Rome, every piece is vetted for luxury vintage heritage.",
    location: "Milan, Italy (Navigli Flea)",
    rating: 5.0,
    established: "Est. 2008",
    aesthetic: "Classic Luxury & Italian Silk",
    bannerImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80"
  }
];

export const INITIAL_ITEMS: VintageItem[] = [
  {
    id: "item-1",
    title: "1978 Schott Perfecto Leather Motorcycle Jacket",
    description: "The ultimate relic of rock and roll culture. Made in the USA from ultra-durable heavyweight hide, this Schott Perfecto leather jacket is a beautiful display of worn-in character.",
    category: "Outerwear",
    era: "70s Rocker",
    condition: "Distressed Charm",
    size: "L",
    sellerId: "booth-1",
    sellerName: "Neon Nostalgia",
    sellerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
    marketName: "Portobello Road Market",
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
    startingBid: 180,
    currentBid: 245,
    buyPrice: 380,
    bidsCount: 7,
    highestBidder: "Alex J.",
    biddingEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), // 2 days from now
    isSold: false,
    tags: ["Leather", "Schott", "DoubleRider", "VintageRocker"],
    measurements: {
      pitToPit: "22 in",
      length: "25.5 in"
    },
    materials: ["Steerhide Leather", "Quilted Nylon Lining"],
    history: "Originally purchased by an indie radio DJ in Soho, London back in the winter of 1978. It toured with various post-punk acts through the early 80s, accumulating its signature collar creases and pocket-edge patinas. It was acquired at a private loft clearance off Carnaby Street."
  },
  {
    id: "item-2",
    title: "1984 Kyoto Cranes embroidered Satin Bomber (Sukajan)",
    description: "An authentic, double-sided silk-satin Souvenir Jacket featuring exquisite hand-guided chainstitch embroidery representing the eternal flight of Kyoto Cranes.",
    category: "Outerwear",
    era: "80s Retro",
    condition: "Excellent",
    size: "M",
    sellerId: "booth-2",
    sellerName: "Concrete Paradise",
    sellerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    marketName: "Shimokitazawa Tokyo",
    imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80",
    startingBid: 210,
    currentBid: 320,
    buyPrice: 480,
    bidsCount: 12,
    highestBidder: "Kenji S.",
    biddingEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 1 day from now
    isSold: false,
    bidDropped: true,
    bidDroppedReason: "Previous high bidder retracted - current price dropped back to ₦320",
    tags: ["Sukajan", "Embroidered", "Satin", "Grailed"],
    measurements: {
      pitToPit: "20 in",
      length: "24 in"
    },
    materials: ["100% Rayon Satin", "Cotton Ribbing"],
    history: "This jacket was worn back during the absolute peak of the Japanese City-Pop wave. Sourced from a specialized retro boutique near Kichijoji, Toyko. The golden satin side features hand-stitched detailing, while the reverse navy side presents a minimalist unembroidered finish."
  },
  {
    id: "item-3",
    title: "1993 Nirvana 'In Utero' Tour Promotional Tee",
    description: "The holy grail of alt-rock garments. Single-stitched, printed on a classic Brockum tag, showcasing the iconic anatomical angel graphic with impeccable fading.",
    category: "Tops",
    era: "90s Grunge",
    condition: "Gently Loved",
    size: "XL",
    sellerId: "booth-3",
    sellerName: "Vagabond Threads",
    sellerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80",
    marketName: "Brooklyn Flea Market",
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80",
    startingBid: 290,
    currentBid: 360,
    buyPrice: 550,
    bidsCount: 15,
    highestBidder: "Sarah F.",
    biddingEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(), // 12 hours from now
    isSold: false,
    tags: ["Nirvana", "SingleStitch", "BandTee", "Cobain"],
    measurements: {
      pitToPit: "24 in",
      length: "30 in"
    },
    materials: ["100% Pre-shrunk Cotton"],
    history: "Acquired from a concertgoer who purchased it from the merch table at the Rosemont Horizon concert in Chicago, December 1993. It displays stellar vintage cracking on the back graphic and fits with the signature boxy, fluid drape coveted by modern designers."
  },
  {
    id: "item-4",
    title: "1972 Yves Saint Laurent Rive Gauche Silk Velvet Gown",
    description: "An extraordinary artifact of Italian high-couture. Heavy silk velvet with delicate gold rope piping and structured balloon sleeves.",
    category: "Dresses",
    era: "70s Boho-Chic",
    condition: "Pristine Vintage",
    size: "S",
    sellerId: "booth-4",
    sellerName: "The Velvet Archive",
    sellerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    marketName: "Navigli Flea Milan",
    imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80",
    startingBid: 450,
    currentBid: 580,
    buyPrice: 580,
    bidsCount: 8,
    highestBidder: "Isabella G.",
    biddingEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(), // 3 days from now
    isSold: false,
    tags: ["YSL", "SilkVelvet", "HauteCouture", "MilanDesign"],
    measurements: {
      pitToPit: "17.5 in",
      length: "56 in",
      waist: "26 in"
    },
    materials: ["70% Silk Velvet", "30% Viscose", "Silk Lining"],
    history: "Presented during YSL's monumental early 70s collections. Sourced directly from the estate of a former Milanese stage actress. It was stored in a climate-controlled archives chest for over 40 years, retaining its deep, ink-black lustre."
  },
  {
    id: "item-5",
    title: "1998 Helmut Lang Industrial Paint Splatter Denim Jeans",
    description: "An iconic piece of minimalist industrial design. Raw indigo heavy-weight denim washed and hand-distressed with deliberate white paint splatters on the thighs and cuffs.",
    category: "Bottoms",
    era: "90s Minimalist",
    condition: "Excellent",
    size: "32",
    sellerId: "booth-2",
    sellerName: "Concrete Paradise",
    sellerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    marketName: "Shimokitazawa Tokyo",
    imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80",
    startingBid: 160,
    currentBid: 290,
    buyPrice: 420,
    bidsCount: 9,
    highestBidder: "Daisuke N.",
    biddingEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(), // 36 hours from now
    isSold: false,
    bidDropped: true,
    bidDroppedReason: "Reserve lowered by curator - current price dropped to ₦290",
    tags: ["HelmutLang", "PaintSplatter", "Archive", "Minimalist"],
    measurements: {
      waist: "32 in",
      length: "32 in"
    },
    materials: ["100% Selvedge Cotton Denim"],
    history: "This piece is from Lang's golden era when production shifted back to Italy. Sourced from an architectural designer in Tokyo, who purchased them brand-new during Helmut Lang's seminal 1998 autumn launch."
  },
  {
    id: "item-6",
    title: "Y2K Oakley Technical Utility Hood Jacket",
    description: "An incredible piece of technical hiking equipment repurposed for modern urban streets. Packed with metal drawstring systems, zip vents, and technical ballistic mesh overlays.",
    category: "Outerwear",
    era: "Y2K Gorpcore",
    condition: "Excellent",
    size: "XL",
    sellerId: "booth-1",
    sellerName: "Neon Nostalgia",
    sellerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
    marketName: "Portobello Road Market",
    imageUrl: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&q=80",
    startingBid: 140,
    currentBid: 190,
    buyPrice: 280,
    bidsCount: 4,
    highestBidder: "Leo Wood",
    biddingEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(), // 18 hours from now
    isSold: false,
    tags: ["Oakley", "Gorpcore", "Techwear", "Tactical"],
    measurements: {
      pitToPit: "25 in",
      length: "29 in"
    },
    materials: ["Nylon Taslan Shell", "Gore-Tex Membrane"],
    history: "Sourced from a Swiss backcountry guide's garage collection. The jacket demonstrates Oakley's premium focus on over-engineered activewear at the turn of the millennium, featuring multi-lock storm guards and dynamic underarm ventilation flaps."
  }
];

export const INITIAL_LOOKBOOKS: Lookbook[] = [
  {
    id: "lookbook-1",
    title: "The Tokyo Cyber-Gorp Uniform",
    description: "An absolute fusion of techwear capabilities and 90s minimalism. Combining raw painted worker denims with structural, storm-guarded hoods to create the ultimate urban traveler silhouette.",
    curatorId: "booth-2",
    curatorName: "Concrete Paradise",
    itemIds: ["item-5", "item-6"],
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
    tags: ["Cyberpunk", "Gorpcore", "Minimalism"]
  },
  {
    id: "lookbook-2",
    title: "1970s Soho Rocker Revival",
    description: "Channeling raw CBGB energy or the London pub scene. Double-rider steerhide leather thrown over a Boxy single-stitched vintage music tee generates an unmatched retro rebellious essence with real-world history.",
    curatorId: "booth-1",
    curatorName: "Neon Nostalgia",
    itemIds: ["item-1", "item-3"],
    imageUrl: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=800&q=80",
    tags: ["PunkRocker", "RetroStreetwear", "SummerSeventies"]
  }
];
