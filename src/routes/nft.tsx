import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Search,
  TrendingUp,
  Globe,
  Layers,
  BookOpen,
  Image,
  Grid3x3,
  Star,
} from "lucide-react";
import { useState } from "react";
import { WalletShell } from "@/components/wallet-shell";

export const Route = createFileRoute("/nft")({
  head: () => ({ meta: [{ title: "NFT — CryptoNest Wallet" }] }),
  component: NFTPage,
});

function NFTPage() {
  const nav = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("collections");

  const tabs = [
    { id: "collections", label: "Collections", icon: Grid3x3 },
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "categories", label: "Categories", icon: Layers },
    { id: "marketplace", label: "Marketplace", icon: Globe },
    { id: "learn", label: "Learn", icon: BookOpen },
  ];

  // Mock data cho trending collections
  const trendingCollections = [
    {
      name: "Solana Monkey Business",
      symbol: "SMB",
      floorPrice: 15.8,
      volume24h: 125000,
      change: 8.5,
      items: 5000,
      image: "🐵",
      color: "#FFD13F",
    },
    {
      name: "DeGods",
      symbol: "DEGODS",
      floorPrice: 28.2,
      volume24h: 89000,
      change: -2.3,
      items: 10000,
      image: "👑",
      color: "#AB9FF2",
    },
    {
      name: "Okay Bears",
      symbol: "OKAY",
      floorPrice: 12.4,
      volume24h: 67000,
      change: 15.7,
      items: 10000,
      image: "🐻",
      color: "#2EC08B",
    },
  ];

  // Mock data cho top collections
  const topCollections = [
    {
      name: "Claynosaurz",
      symbol: "CLAY",
      floorPrice: 8.9,
      volume24h: 45000,
      change: 5.2,
      items: 10000,
      image: "🦕",
      color: "#4A87F2",
    },
    {
      name: "Mad Lads",
      symbol: "MAD",
      floorPrice: 18.5,
      volume24h: 156000,
      change: 12.8,
      items: 10000,
      image: "😎",
      color: "#FF7243",
    },
    {
      name: "Tinysaurus",
      symbol: "TINY",
      floorPrice: 3.2,
      volume24h: 23000,
      change: -5.6,
      items: 5555,
      image: "🦖",
      color: "#D95A2F",
    },
  ];

  // Mock data cho categories
  const categories = [
    { name: "Art", count: 1250, icon: "🎨", color: "#FFD13F" },
    { name: "Gaming", count: 890, icon: "🎮", color: "#4A87F2" },
    { name: "PFP", count: 2100, icon: "👤", color: "#2EC08B" },
    { name: "Music", count: 450, icon: "🎵", color: "#AB9FF2" },
  ];

  // Mock data cho marketplace
  const marketplaceSites = [
    { name: "Tensor", category: "NFT Marketplace", icon: "⚡", color: "#FFD13F" },
    { name: "Magic Eden", category: "NFT Marketplace", icon: "✨", color: "#AB9FF2" },
    { name: "OpenSea", category: "NFT Marketplace", icon: "🌊", color: "#4A87F2" },
    { name: "Solanart", category: "NFT Marketplace", icon: "🎨", color: "#2EC08B" },
  ];

  // Mock data cho learn
  const learnContent = [
    { title: "NFT Basics", description: "Learn what NFTs are and how they work", icon: "📚" },
    {
      title: "How to Mint",
      description: "Step-by-step guide to minting your first NFT",
      icon: "🚀",
    },
    { title: "NFT Security", description: "Best practices for keeping your NFTs safe", icon: "🔒" },
  ];

  return (
    <WalletShell>
      <div className="p-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="size-4" /> Back
        </Link>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 size-4 text-muted-foreground transform -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search collections, NFTs"
            className="w-full pl-10 pr-4 py-3 bg-card border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-5 px-1 mb-6 border-b border-border overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors whitespace-nowrap relative ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content based on active tab */}
        {activeTab === "collections" && (
          <div className="space-y-6">
            {/* Trending Collections */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Trending Collections</h2>
                <button className="text-sm font-medium text-primary hover:opacity-80 transition-opacity">
                  See more
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {trendingCollections.map((collection) => (
                  <button
                    key={collection.symbol}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent transition-colors text-left"
                  >
                    <div
                      className="size-12 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: collection.color }}
                    >
                      <span className="text-2xl">{collection.image}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-sm">{collection.name}</div>
                        <div className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">
                          {collection.symbol}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {collection.items.toLocaleString()} items
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">
                        {collection.floorPrice.toFixed(1)} SOL
                      </div>
                      <div
                        className={`text-xs ${collection.change >= 0 ? "text-success" : "text-destructive"}`}
                      >
                        {collection.change >= 0 ? "+" : ""}
                        {collection.change.toFixed(1)}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Top Collections */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Top Collections</h2>
                <button className="text-sm text-primary hover:underline">See more</button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {topCollections.map((collection, index) => (
                  <button
                    key={collection.name}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent transition-colors text-left"
                  >
                    <div className="size-8 rounded-lg flex items-center justify-center text-sm font-bold text-white bg-muted shrink-0">
                      #{index + 1}
                    </div>
                    <div
                      className="size-12 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: collection.color }}
                    >
                      <span className="text-2xl">{collection.image}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{collection.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {collection.items.toLocaleString()} items
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">
                        {collection.floorPrice.toFixed(1)} SOL
                      </div>
                      <div
                        className={`text-xs ${collection.change >= 0 ? "text-success" : "text-destructive"}`}
                      >
                        {collection.change >= 0 ? "+" : ""}
                        {collection.change.toFixed(1)}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "trending" && (
          <div className="space-y-6">
            {/* Trending Now */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Trending Now</h2>
                <button className="text-sm font-medium text-primary hover:opacity-80 transition-opacity">
                  See more
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {[...trendingCollections, ...topCollections].map((collection) => (
                  <button
                    key={collection.symbol || collection.name}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent transition-colors text-left"
                  >
                    <div
                      className="size-12 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: collection.color }}
                    >
                      <span className="text-2xl">{collection.image}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-sm">{collection.name}</div>
                        <TrendingUp className="size-3 text-success" />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Volume: ${(collection.volume24h / 1000).toFixed(0)}K
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">
                        {collection.floorPrice.toFixed(1)} SOL
                      </div>
                      <div
                        className={`text-xs ${collection.change >= 0 ? "text-success" : "text-destructive"}`}
                      >
                        {collection.change >= 0 ? "+" : ""}
                        {collection.change.toFixed(1)}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "categories" && (
          <div className="space-y-6">
            {/* Categories */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Categories</h2>
                <button className="text-sm font-medium text-primary hover:opacity-80 transition-opacity">
                  See more
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    className="w-full p-4 rounded-xl border bg-card hover:bg-accent transition-colors text-left"
                  >
                    <div
                      className="size-12 rounded-xl flex items-center justify-center text-2xl mb-3"
                      style={{ backgroundColor: category.color }}
                    >
                      <span>{category.icon}</span>
                    </div>
                    <div className="font-medium text-sm">{category.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {category.count} collections
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "marketplace" && (
          <div className="space-y-6">
            {/* Marketplace */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Marketplaces</h2>
                <button className="text-sm font-medium text-primary hover:opacity-80 transition-opacity">
                  See more
                </button>
              </div>
              <div className="space-y-2">
                {marketplaceSites.map((site) => (
                  <button
                    key={site.name}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent transition-colors text-left"
                  >
                    <div
                      className="size-12 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: site.color }}
                    >
                      <span className="text-2xl">{site.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{site.name}</div>
                      <div className="text-xs text-muted-foreground">{site.category}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "learn" && (
          <div className="space-y-6">
            {/* Learn */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Learn</h2>
                <button className="text-sm font-medium text-primary hover:opacity-80 transition-opacity">
                  See more
                </button>
              </div>
              <div className="space-y-2">
                {learnContent.map((item) => (
                  <button
                    key={item.title}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent transition-colors text-left"
                  >
                    <div className="size-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-lg">
                      <span>{item.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="font-medium text-sm">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer note */}
        <div className="mt-8 p-4 bg-card/50 rounded-xl text-xs text-muted-foreground leading-relaxed">
          NFTs (Non-Fungible Tokens) are unique digital assets on the blockchain. Each NFT has a
          unique identifier and is non-interchangeable. NFT value can be volatile and is not
          guaranteed. Please do your own research before buying or selling NFTs.
        </div>
      </div>
    </WalletShell>
  );
}
