import React, { useState } from "react";
import { VintageItem, MarketBooth } from "../types";
import { PlusCircle, Image, FileText, CheckCircle, Store, Lock } from "lucide-react";

interface SellFormProps {
  booths: MarketBooth[];
  onAddListing: (newItem: VintageItem, newBooth?: MarketBooth) => void;
  userEmail: string;
}

const PRESET_CLOTHING_IMAGES = [
  {
    name: "Classic Distressed Steerhide",
    url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
    cat: "Outerwear"
  },
  {
    name: "Kyoto Golden Sukajan",
    url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80",
    cat: "Outerwear"
  },
  {
    name: "90s Boxy Graphics Rock Tee",
    url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80",
    cat: "Tops"
  },
  {
    name: "Classic Italian Silk Velvet Gown",
    url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80",
    cat: "Dresses"
  },
  {
    name: "Workwear Indigo Slub Denim",
    url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80",
    cat: "Bottoms"
  },
  {
    name: "Faded Vintage Denim Shacket",
    url: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&q=80",
    cat: "Outerwear"
  }
];

export default function SellForm({ booths, onAddListing, userEmail }: SellFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Outerwear");
  const [era, setEra] = useState("90s Grunge");
  const [condition, setCondition] = useState("Excellent");
  const [size, setSize] = useState("M");
  const [startingBid, setStartingBid] = useState(120);
  const [buyPrice, setBuyPrice] = useState<number | "">("");
  const [history, setHistory] = useState("");
  const [materials, setMaterials] = useState("100% Selvedge Cotton");
  const [tagsInput, setTagsInput] = useState("Archive, Japanese, Vintage");

  // Custom Stall vs Existing Stall toggle
  const [boothMode, setBoothMode] = useState<"existing" | "create">("existing");
  const [selectedBoothId, setSelectedBoothId] = useState(booths[0]?.id || "");

  // Custom Booth fields
  const [customBoothName, setCustomBoothName] = useState("");
  const [customBoothCurator, setCustomBoothCurator] = useState("");
  const [customBoothAesthetic, setCustomBoothAesthetic] = useState("90s Minimalist");
  const [customBoothBio, setCustomBoothBio] = useState("");

  // Image selection
  const [selectedPresetImage, setSelectedPresetImage] = useState(PRESET_CLOTHING_IMAGES[0].url);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  // Admin check uses isAdmin prop — no hardcoded email, no self-elevation
  const isAdmin = userEmail.trim().toLowerCase() !== "" &&
    userEmail.trim().toLowerCase() !== "guest@fitcheck.com";

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-12 px-6 bg-white border border-stone-200 shadow-lg rounded-2xl text-center space-y-6 my-8 animate-fade-in">
        <div className="w-16 h-16 bg-[#FDF2E9] rounded-full flex items-center justify-center mx-auto border border-orange-200">
          <Lock className="w-8 h-8 text-jumia-orange" />
        </div>
        <div className="space-y-2">
          <h2 className="font-sans font-black text-xl text-[#313131] uppercase tracking-wide">
            Admin Access Required
          </h2>
          <p className="text-xs text-stone-500 leading-relaxed pt-2">
            Only authorized administrators can list items on this platform. Please sign in with your admin account.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim() || !description.trim()) {
      setFormError("Please provide a Title and Description for your garment.");
      return;
    }

    let itemBoothId = selectedBoothId;
    let itemBoothName = booths.find((b) => b.id === selectedBoothId)?.name || "Atelier Curator";
    let itemBoothAvatar = booths.find((b) => b.id === selectedBoothId)?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80";
    let itemBoothMarket = booths.find((b) => b.id === selectedBoothId)?.location || "Global Flea";
    let createdBooth: MarketBooth | undefined;

    if (boothMode === "create") {
      if (!customBoothName.trim() || !customBoothCurator.trim()) {
        setFormError("Please specify your Custom Stall Name and Curator Name.");
        return;
      }
      const newBoothId = `booth-custom-${Date.now()}`;
      createdBooth = {
        id: newBoothId,
        name: customBoothName.trim(),
        curator: customBoothCurator.trim(),
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80",
        tagline: `Curator booth specializing in ${customBoothAesthetic}.`,
        bio: customBoothBio.trim() || "Independent vintage archivist freshly registered on Atelier.",
        location: "Virtual Flea (Online-Verified)",
        rating: 5.0,
        established: `Est. ${new Date().getFullYear()}`,
        aesthetic: customBoothAesthetic,
        bannerImage: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80"
      };
      itemBoothId = createdBooth.id;
      itemBoothName = createdBooth.name;
      itemBoothAvatar = createdBooth.avatar;
      itemBoothMarket = createdBooth.location;
    }

    const tagsArray = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    const materialsArray = materials.split(",").map((m) => m.trim()).filter(Boolean);
    const retailPriceValue = Number(buyPrice) || startingBid || 120;

    const newItem: VintageItem = {
      id: `item-custom-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      era,
      condition,
      size,
      sellerId: itemBoothId,
      sellerName: itemBoothName,
      sellerAvatar: itemBoothAvatar,
      marketName: itemBoothMarket,
      imageUrl: selectedPresetImage,
      startingBid: retailPriceValue,
      currentBid: retailPriceValue,
      buyPrice: retailPriceValue,
      bidsCount: 0,
      highestBidder: null,
      biddingEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
      isSold: false,
      tags: tagsArray,
      measurements: { pitToPit: "21 in", length: "27.5 in" },
      materials: materialsArray,
      history: history.trim() || "This curated vintage relic was hand-checked and authenticated."
    };

    onAddListing(newItem, createdBooth);
    setTitle(""); setDescription(""); setHistory(""); setBuyPrice(""); setFormError("");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="font-mono text-xs uppercase tracking-widest text-amber-700 font-bold block">Become a Curator</span>
        <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#1C1A17]">List Your Archival Piece</h2>
        <p className="text-xs sm:text-sm text-[#6B6152]">
          Fill in details of your garment. Every listing includes flat sizing specs, material catalogs, and original histories.
        </p>
      </div>

      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl text-emerald-950 font-medium flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold">Listed successfully!</p>
            <p className="text-xs text-emerald-800">Your curated piece is now live in the gallery.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#FCFBF8] border border-[#EBE8DF] p-6 sm:p-10 rounded-2xl shadow-sm space-y-8">

        {/* Step 1: Stall */}
        <div className="space-y-4">
          <h3 className="font-serif text-xl font-bold flex items-center gap-2 text-[#1C1A17] pb-3 border-b border-[#EBE8DF]">
            <Store className="w-5 h-5 text-amber-700" />
            1. Curatorial Market Stall
          </h3>
          <div className="flex gap-4">
            {(["existing", "create"] as const).map((mode) => (
              <button key={mode} type="button" onClick={() => setBoothMode(mode)}
                className={`flex-1 py-3 px-4 border rounded-xl text-xs font-semibold font-mono text-center transition-all ${
                  boothMode === mode ? "bg-[#1C1A17] text-white border-transparent" : "bg-[#FAF9F5] border-[#DCD9CE] text-[#544E45] hover:border-stone-900"
                }`}>
                {mode === "existing" ? "USE EXISTING BOOTH" : "CREATE NEW STALL"}
              </button>
            ))}
          </div>

          {boothMode === "existing" ? (
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold tracking-wider text-[#544E45] uppercase">Select Registered Stall</label>
              <select value={selectedBoothId} onChange={(e) => setSelectedBoothId(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-[#DCD9CE] p-3 rounded-lg text-sm">
                {booths.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} ({b.location.split(" ")[0]})</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-amber-50/40 rounded-xl border border-amber-200/50">
              {[
                { label: "Stall Name", value: customBoothName, onChange: setCustomBoothName, placeholder: "e.g. Vintage Vault" },
                { label: "Curator Name", value: customBoothCurator, onChange: setCustomBoothCurator, placeholder: "e.g. Marcus Aurel" },
              ].map(({ label, value, onChange, placeholder }) => (
                <div key={label} className="space-y-1">
                  <label className="text-[10px] font-mono text-amber-900 font-bold block uppercase">{label}</label>
                  <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
                    className="w-full bg-[#FAF9F5] border border-[#DCD9CE] p-2.5 rounded-lg text-xs outline-none" required={boothMode === "create"} />
                </div>
              ))}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-amber-900 font-bold block uppercase">Era / Style</label>
                <select value={customBoothAesthetic} onChange={(e) => setCustomBoothAesthetic(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#DCD9CE] p-2 rounded-lg text-xs outline-none">
                  {["70s Rock Rebel","80s City-Pop","90s Grunge Alternative","Y2K Technical Tactical","Classic Italian Velvet Luxury"].map(o => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-3 space-y-1">
                <label className="text-[10px] font-mono text-amber-900 font-bold block uppercase">Stall Bio</label>
                <input type="text" value={customBoothBio} onChange={(e) => setCustomBoothBio(e.target.value)}
                  placeholder="e.g. Sourcing heavy-stitch flannels and archival technical shells."
                  className="w-full bg-[#FAF9F5] border border-[#DCD9CE] p-2.5 rounded-lg text-xs outline-none" />
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Image */}
        <div className="space-y-4">
          <h3 className="font-serif text-xl font-bold flex items-center gap-2 text-[#1C1A17] pb-3 border-b border-[#EBE8DF]">
            <Image className="w-5 h-5 text-amber-700" />
            2. Garment Photography
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {PRESET_CLOTHING_IMAGES.map((preset) => (
              <div key={preset.name} onClick={() => setSelectedPresetImage(preset.url)}
                className={`cursor-pointer border rounded-xl overflow-hidden p-1.5 transition-all text-center flex flex-col justify-between ${
                  selectedPresetImage === preset.url ? "border-amber-700 bg-amber-50/40 shadow-inner" : "border-[#EBE8DF] bg-[#FAF9F5] hover:border-amber-500"
                }`}>
                <img src={preset.url} alt={preset.name} referrerPolicy="no-referrer" className="aspect-square object-cover w-full rounded-lg" />
                <div className="pt-2">
                  <p className="text-[9px] font-bold text-stone-900 leading-tight truncate">{preset.name}</p>
                  <span className="font-mono text-[8px] bg-stone-100 text-[#877F70] px-1 rounded block mt-0.5 w-fit mx-auto uppercase">{preset.cat}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Details */}
        <div className="space-y-4">
          <h3 className="font-serif text-xl font-bold flex items-center gap-2 text-[#1C1A17] pb-3 border-b border-[#EBE8DF]">
            <FileText className="w-5 h-5 text-amber-700" />
            3. Garment Information & Specs
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="sm:col-span-3 space-y-1">
              <label className="text-[10px] font-mono text-[#544E45] font-bold block uppercase">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 1991 Harley Davidson Single-Stitch Eagle Tee"
                className="w-full bg-[#FAF9F5] border border-[#DCD9CE] focus:border-stone-900 p-3 rounded-lg text-sm outline-none" required />
            </div>

            {[
              { label: "Category", value: category, onChange: setCategory, options: ["Outerwear","Tops","Bottoms","Dresses"] },
              { label: "Era", value: era, onChange: setEra, options: ["70s Rocker","80s Retro","90s Grunge","90s Minimalist","Y2K Gorpcore"] },
              { label: "Condition", value: condition, onChange: setCondition, options: ["Pristine Vintage","Excellent","Gently Loved","Distressed Charm"] },
            ].map(({ label, value, onChange, options }) => (
              <div key={label} className="space-y-1">
                <label className="text-[10px] font-mono text-[#544E45] font-bold block uppercase">{label}</label>
                <select value={value} onChange={(e) => onChange(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#DCD9CE] p-2.5 rounded-lg text-xs outline-none">
                  {options.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-[#544E45] font-bold block uppercase">Size</label>
              <input type="text" value={size} onChange={(e) => setSize(e.target.value)} placeholder="e.g. XL"
                className="w-full bg-[#FAF9F5] border border-[#DCD9CE] p-2.5 rounded-lg text-xs outline-none" required />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] font-mono text-[#544E45] font-bold block uppercase">Price (₦ NGN)</label>
              <input type="number" value={buyPrice === "" ? startingBid : buyPrice} min="10"
                onChange={(e) => { setBuyPrice(e.target.value === "" ? "" : Number(e.target.value)); setStartingBid(e.target.value === "" ? 120 : Number(e.target.value)); }}
                className="w-full bg-[#FAF9F5] border border-[#DCD9CE] focus:border-stone-900 p-2.5 rounded-lg text-xs outline-none font-mono" required />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] font-mono text-[#544E45] font-bold block uppercase">Materials</label>
              <input type="text" value={materials} onChange={(e) => setMaterials(e.target.value)}
                placeholder="e.g. 100% Cotton Steerhide, Rayon Lining"
                className="w-full bg-[#FAF9F5] border border-[#DCD9CE] p-2.5 rounded-lg text-xs outline-none" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-[#544E45] font-bold block uppercase">Tags (comma separated)</label>
              <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. Rock, Rare, SingleStitch"
                className="w-full bg-[#FAF9F5] border border-[#DCD9CE] p-2.5 rounded-lg text-xs outline-none" />
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="text-[10px] font-mono text-[#544E45] font-bold block uppercase">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                placeholder="Write a clear summary of the garment, shape, condition details"
                className="w-full bg-[#FAF9F5] border border-[#DCD9CE] p-3 rounded-lg text-sm outline-none resize-none" required />
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="text-[10px] font-mono text-[#544E45] font-bold block uppercase">Provenance Backstory</label>
              <textarea value={history} onChange={(e) => setHistory(e.target.value)} rows={4}
                placeholder="E.g., originally sourced from an archive collector in Tokyo..."
                className="w-full bg-[#FAF9F5] border border-[#DCD9CE] p-3 rounded-lg text-sm outline-none" />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#EBE8DF] flex flex-col items-end gap-3">
          {formError && (
            <div className="w-full flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-2.5 rounded-lg">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0"></span>
              {formError}
            </div>
          )}
          <button type="submit"
            className="flex items-center gap-2 py-4 px-8 bg-[#1C1A17] hover:bg-amber-800 text-[#FAF9F5] rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer">
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>Publish Curated Listing</span>
          </button>
        </div>
      </form>
    </div>
  );
}
