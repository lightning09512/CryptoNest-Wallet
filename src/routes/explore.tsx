import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Search, TrendingUp, Globe, Layers, BookOpen } from "lucide-react";
import { useState } from "react";
import { ALL_TOKENS } from "@/lib/wallet-data";
import { WalletShell } from "@/components/wallet-shell";

export const Route = createFileRoute("/explore")({
  head: () => ({ meta: [{ title: "Khám phá — Fox Wallet" }] }),
  component: ExplorePage,
});

function ExplorePage() {
  const nav = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("tokens");

  const tabs = [
    { id: "tokens", label: "Tokens", icon: TrendingUp },
    { id: "perps", label: "Perps", icon: TrendingUp },
    { id: "lists", label: "Lists", icon: Layers },
    { id: "sites", label: "Sites", icon: Globe },
    { id: "learn", label: "Learn", icon: BookOpen },
  ];

  // Mock data cho trending tokens
  const trendingTokens = [
    { symbol: "HANTA", name: "Hanta", price: 0.00839372, marketCap: 8400000, change: 111.16, color: "#FFD13F" },
    { symbol: "HENTAI", name: "Hentai", price: 0.00084941, marketCap: 838000, change: 190.16, color: "#4A87F2" },
    { symbol: "ALIENS", name: "Aliens", price: 0.0022548, marketCap: 2200000, change: 176.09, color: "#2EC08B" },
  ];

  // Mock data cho trending perps
  const trendingPerps = [
    { symbol: "CRWV", name: "CRWV", price: 112.66, volume: 21000000, change: -14.68, leverage: "10x", color: "#AB9FF2" },
    { symbol: "SNDK", name: "SNDK", price: 1468.60, volume: 103000000, change: 8.30, leverage: "10x", color: "#4A87F2" },
    { symbol: "RKLB", name: "RKLB", price: 95.98, volume: 3000000, change: 15.89, leverage: "10x", color: "#2EC08B" },
  ];

  // Mock data cho top lists
  const topLists = [
    { name: "Top Gainers", count: 15, icon: "📈" },
    { name: "Meme", count: 100, icon: "🐸" },
    { name: "Tokenized Stocks", count: 80, icon: "📊" },
  ];

  // Mock data cho trending sites
  const trendingSites = [
    { name: "DRiP", category: "Collectibles", icon: "🎨", color: "#AB9FF2" },
    { name: "Jupiter", category: "DeFi", icon: "🪐", color: "#4A87F2" },
    { name: "pump.fun", category: "DeFi", icon: "🚀", color: "#2EC08B" },
  ];

  // Mock data cho learn
  const learnContent = [
    { title: "Liquid Staking 101", description: "What is liquid staking?", icon: "💧" },
    { title: "Monad 101", description: "Learn more about Monad", icon: "⚡" },
    { title: "New ways to Pay", description: "Onboard with Google or Apple pay", icon: "💳" },
  ];

  return (
    <WalletShell>
      <div className="p-4">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="size-4" /> Quay lại
        </Link>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 size-4 text-muted-foreground transform -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm trang web, token"
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
        {activeTab === "tokens" && (
          <div className="space-y-6">
            {/* Trending Tokens */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Token xu hướng</h2>
                <button className="text-sm text-primary hover:underline">
                  Xem thêm
                </button>
              </div>
              <div className="space-y-2">
                {trendingTokens.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => nav({ to: "/send-select" })}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent transition-colors text-left"
                  >
                    <div className="size-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: token.color }}>
                      <div className="w-5 h-6 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center">
                        <span className="text-[10px] font-bold">{token.symbol.slice(0, 2)}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-sm">{token.symbol}</div>
                      </div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        ${(token.marketCap / 1000000).toFixed(1)}M MC
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold tabular-nums text-sm">
                        ${token.price.toFixed(8)}
                      </div>
                      <div className={`text-xs tabular-nums ${token.change >= 0 ? "text-success" : "text-destructive"}`}>
                        {token.change >= 0 ? "+" : ""}{token.change.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "perps" && (
          <div className="space-y-6">
            {/* Trending Perps */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Perps xu hướng</h2>
                <button className="text-sm text-primary hover:underline">
                  Xem thêm
                </button>
              </div>
              <div className="space-y-2">
                {trendingPerps.map((perp) => (
                  <button
                    key={perp.symbol}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent transition-colors text-left"
                  >
                    <div className="size-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: perp.color }}>
                      <div className="w-5 h-6 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center">
                        <span className="text-[10px] font-bold">{perp.symbol.slice(0, 2)}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-sm">{perp.symbol}</div>
                        <div className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">
                          {perp.leverage}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        ${(perp.volume / 1000000).toFixed(1)}M Vol
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold tabular-nums text-sm">
                        ${perp.price.toFixed(2)}
                      </div>
                      <div className={`text-xs tabular-nums ${perp.change >= 0 ? "text-success" : "text-destructive"}`}>
                        {perp.change >= 0 ? "+" : ""}{perp.change.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "lists" && (
          <div className="space-y-6">
            {/* Top Lists */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Danh sách hàng đầu</h2>
                <button className="text-sm text-primary hover:underline">
                  Xem thêm
                </button>
              </div>
              <div className="space-y-2">
                {topLists.map((list) => (
                  <button
                    key={list.name}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent transition-colors text-left"
                  >
                    <div className="size-7 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-sm">
                      {list.icon}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="font-medium text-sm">{list.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {list.count} token
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "sites" && (
          <div className="space-y-6">
            {/* Trending Sites */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Trang web xu hướng</h2>
                <button className="text-sm text-primary hover:underline">
                  Xem thêm
                </button>
              </div>
              <div className="space-y-2">
                {trendingSites.map((site) => (
                  <button
                    key={site.name}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent transition-colors text-left"
                  >
                    <div className="size-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: site.color }}>
                      <div className="w-5 h-6 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center">
                        <span className="text-lg">{site.icon}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="font-medium text-sm">{site.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {site.category}
                      </div>
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
                <h2 className="text-lg font-semibold">Học hỏi</h2>
                <button className="text-sm text-primary hover:underline">
                  Xem thêm
                </button>
              </div>
              <div className="space-y-2">
                {learnContent.map((item) => (
                  <button
                    key={item.title}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent transition-colors text-left"
                  >
                    <div className="size-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-lg">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="font-medium text-sm">{item.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer note */}
        <div className="mt-8 p-4 bg-card/50 rounded-xl text-xs text-muted-foreground leading-relaxed">
          Tokenized Stocks là các công cụ dựa trên blockchain do bên thứ ba phát hành được thiết kế để theo dõi hiệu suất của cổ phiếu cơ sở. Mặc dù chúng theo dõi các biến động giá và cơ chế của chứng khoán thực tế, chúng không trao quyền sở hữu hoặc quyền lợi của cổ đông. Chúng chỉ có sẵn ở một số khu vực pháp lý nhất định. Danh sách token được tạo bằng dữ liệu thị trường do các nhà cung cấp bên thứ ba khác nhau cung cấp bao gồm CoinGecko, Birdeye, Jupiter và Hyperliquid. Hiệu suất được hiển thị dựa trên khoảng thời gian đã chọn. Hiệu suất trong quá khứ không phải là chỉ báo về hiệu suất trong tương lai.
        </div>
      </div>
    </WalletShell>
  );
}
