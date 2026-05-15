import { createFileRoute, useNavigate } from '@tanstack/react-router'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { WalletShell } from "@/components/wallet-shell"
import { useWalletStore } from "@/store/wallet-store"
import ghostLogo from "@/assets/ghost-logo.png";
import {
  RotateCcw,
  Camera,
  Maximize2,
  BarChart3,
  Settings,
  Zap,
  ShieldCheck,
  Info,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  MousePointer2,
  LineChart as LineChartIcon,
  Shapes,
  Type,
  Ruler,
  Search,
  Magnet,
  Lock as LockIcon,
  Eye,
  Trash2,
  Copy,
  Check,
  X,
  Key,
  LogOut
} from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/terminal')({
  component: TerminalPage,
})

type TF = "1m" | "5m" | "15m" | "1h" | "4h" | "1D" | "1W" | "1M" | "1Y";
const TIMEFRAMES: TF[] = ["1m", "5m", "15m", "1h", "4h", "1D", "1W"];

const TF_SECONDS: Record<TF, number> = {
  "1m": 60, "5m": 300, "15m": 900, "1h": 3600, "4h": 14400, "1D": 86400, "1W": 604800, "1M": 2592000, "1Y": 31536000
};

const TF_VOLATILITY: Record<TF, number> = {
  "1m": 0.001, "5m": 0.002, "15m": 0.004, "1h": 0.008, "4h": 0.015, "1D": 0.03, "1W": 0.06, "1M": 0.12, "1Y": 0.25
};

// ── TradingView Widget (extracted & memoized to prevent re-mount on parent re-render) ──
const TradingViewWidget = React.memo(({ symbol, interval }: { symbol: string; interval: string }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // Clear previous widget
    container.current.innerHTML = '<div id="tv_chart_container" style="width:100%;height:100%"></div>';

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.type = "text/javascript";
    script.async = true;
    script.onload = () => {
      if (typeof (window as any).TradingView !== 'undefined') {
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: `BINANCE:${symbol}`,
          interval: interval,
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "vi_VN",
          toolbar_bg: "#161A1E",
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          container_id: "tv_chart_container",
          backgroundColor: "#0B0E11",
          gridColor: "rgba(39, 39, 42, 0.3)",
          withdateranges: true,
          hide_side_toolbar: false,
          details: false,
          hotlist: false,
          calendar: false,
          show_popup_button: true,
          popup_width: "1000",
          popup_height: "650",
          overrides: {
            "mainSeriesProperties.candleStyle.upColor": "#22c55e",
            "mainSeriesProperties.candleStyle.downColor": "#ef4444",
            "mainSeriesProperties.candleStyle.drawWick": true,
            "mainSeriesProperties.candleStyle.drawBorder": false,
            "paneProperties.background": "#0B0E11",
            "paneProperties.vertGridProperties.color": "rgba(39, 39, 42, 0.3)",
            "paneProperties.horzGridProperties.color": "rgba(39, 39, 42, 0.3)",
          }
        });
      }
    };
    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = "";
      }
    };
  }, [symbol, interval]);

  return (
    <div className="tradingview-widget-container w-full h-full" ref={container}>
      <div id="tv_chart_container" className="w-full h-full" />
    </div>
  );
});
TradingViewWidget.displayName = 'TradingViewWidget';

function TerminalPage() {
  const navigate = useNavigate();
  const { address, mnemonic, privateKey, logout, username, prices, tradingBalance, positions, openPosition, closePosition } = useWalletStore();
  const [selectedPair, setSelectedPair] = useState("ETH");
  const [copied, setCopied] = useState(false);
  const [timeframe, setTimeframe] = useState<TF>("15m");
  const [chartTab, setChartTab] = useState<"Biểu đồ" | "Thông tin Coin" | "Thông tin tin">("Biểu đồ");
  const [bottomTab, setBottomTab] = useState("Vị thế");
  const [activeTab, setActiveTab] = useState<"Spot" | "Futures">("Futures");
  const [side, setSide] = useState<"long" | "short">("long");
  const [amount, setAmount] = useState("");
  const [leverage, setLeverage] = useState(10);
  const [qtyUnit, setQtyUnit] = useState<"asset" | "usdt">("asset");
  const [filterCurrentPair, setFilterCurrentPair] = useState(false);
  const [isMarketSelectorOpen, setIsMarketSelectorOpen] = useState(false);
  const [marketSearch, setMarketSearch] = useState("");
  const [orderHistory, setOrderHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('cryptonest_order_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [tradeHistory, setTradeHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('cryptonest_trade_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [fundingHistory, setFundingHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('cryptonest_funding_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [fundingRate, setFundingRate] = useState("0.0100%");
  const [fundingTimer, setFundingTimer] = useState("08:00:00");

  // Fetch Real Funding Rate & Countdown
  useEffect(() => {
    const updateFunding = async () => {
      try {
        const res = await fetch(`https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${selectedPair.toUpperCase()}USDT`);
        const data = await res.json();
        if (data && data.lastFundingRate) {
          const rate = (parseFloat(data.lastFundingRate) * 100).toFixed(4);
          setFundingRate(`${rate}%`);
        }
      } catch (e) { }
    };

    updateFunding();
    const interval = setInterval(updateFunding, 60000); // Update rate every minute
    return () => clearInterval(interval);
  }, [selectedPair]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const next = new Date();
      // Funding happens every 8 hours: 0, 8, 16 UTC (7, 15, 23 VN)
      const hours = now.getHours();
      let targetHour = 7;
      if (hours >= 7 && hours < 15) targetHour = 15;
      else if (hours >= 15 && hours < 23) targetHour = 23;
      else if (hours >= 23) {
        targetHour = 7;
        next.setDate(next.getDate() + 1);
      }

      next.setHours(targetHour, 0, 0, 0);
      const diff = next.getTime() - now.getTime();

      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setFundingTimer(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Persist history to localStorage
  useEffect(() => {
    localStorage.setItem('cryptonest_order_history', JSON.stringify(orderHistory));
  }, [orderHistory]);

  useEffect(() => {
    localStorage.setItem('cryptonest_trade_history', JSON.stringify(tradeHistory));
  }, [tradeHistory]);

  useEffect(() => {
    localStorage.setItem('cryptonest_funding_history', JSON.stringify(fundingHistory));
  }, [fundingHistory]);
  const TOP_COINS = [
    { symbol: "BTC", name: "Bitcoin", logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.png" },
    { symbol: "ETH", name: "Ethereum", logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png" },
    { symbol: "SOL", name: "Solana", logo: "https://cryptologos.cc/logos/solana-sol-logo.png" },
    { symbol: "BNB", name: "BNB", logo: "https://cryptologos.cc/logos/bnb-bnb-logo.png" },
    { symbol: "XRP", name: "XRP", logo: "https://cryptologos.cc/logos/xrp-xrp-logo.png" },
    { symbol: "ADA", name: "Cardano", logo: "https://cryptologos.cc/logos/cardano-ada-logo.png" },
    { symbol: "AVAX", name: "Avalanche", logo: "https://cryptologos.cc/logos/avalanche-avax-logo.png" },
    { symbol: "DOT", name: "Polkadot", logo: "https://cryptologos.cc/logos/polkadot-new-dot-logo.png" },
    { symbol: "LINK", name: "Chainlink", logo: "https://cryptologos.cc/logos/chainlink-link-logo.png" },
    { symbol: "NEAR", name: "Near", logo: "https://cryptologos.cc/logos/near-protocol-near-logo.png" },
  ];
  const [ohlc, setOhlc] = useState<{ o: number; h: number; l: number; c: number } | null>(null);

  // Compute widget props (stable values to pass to memoized widget)
  const tvSymbol = `${selectedPair}USDT`;
  const TV_INTERVAL_MAP: Record<TF, string> = {
    "1m": "1", "5m": "5", "15m": "15", "1h": "60", "4h": "240",
    "1D": "D", "1W": "W", "1M": "M", "1Y": "12M"
  };
  const tvInterval = TV_INTERVAL_MAP[timeframe] || "15";

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const currentPriceRef = useRef(0);

  // Auto-focus search input when selector opens
  useEffect(() => {
    if (isMarketSelectorOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isMarketSelectorOpen]);

  // Sync ref with state for chart usage
  useEffect(() => {
    currentPriceRef.current = currentPrice;
  }, [currentPrice]);

  // WebSocket and Fallback Price Engine
  useEffect(() => {
    const symbol = `${selectedPair.toLowerCase()}usdt`;
    let ws: WebSocket | null = null;
    let fallbackInterval: ReturnType<typeof setInterval> | null = null;

    // Reset price immediately to prevent "sticky" prices from previous assets
    const initialPrice = prices[selectedPair]?.priceUsd || 0;
    setCurrentPrice(initialPrice);
    currentPriceRef.current = initialPrice;
    setOhlc(null); // Clear OHLC to force refresh

    const connectWS = () => {
      ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@ticker`);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const newPrice = parseFloat(data.c);
        if (!isNaN(newPrice)) {
          setCurrentPrice(newPrice);
          currentPriceRef.current = newPrice;
          if (fallbackInterval) {
            clearInterval(fallbackInterval);
            fallbackInterval = null;
          }
        }
      };
      ws.onerror = () => startFallback();
    };

    const startFallback = () => {
      if (fallbackInterval) return;
      const fetchPrice = async () => {
        try {
          const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${selectedPair.toUpperCase()}USDT`);
          const data = await res.json();
          const newPrice = parseFloat(data.price);
          if (!isNaN(newPrice)) {
            setCurrentPrice(newPrice);
            currentPriceRef.current = newPrice;
          }
        } catch (e) { }
      };
      fetchPrice(); // Fetch immediately once
      fallbackInterval = setInterval(fetchPrice, 2000);
    };

    connectWS();
    startFallback();

    return () => {
      ws?.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [selectedPair]);




  const handleTrade = () => {
    let qty = parseFloat(amount);
    if (!qty || qty <= 0) {
      toast.error("Vui lòng nhập số lượng");
      return;
    }

    // Convert USDT to Asset amount if needed
    if (qtyUnit === "usdt") {
      qty = qty / currentPrice;
    }

    const marginRequired = (qty * currentPrice) / leverage;

    if (marginRequired > tradingBalance) {
      toast.error("Số dư không đủ để ký quỹ");
      return;
    }

    openPosition(
      selectedPair,
      side,
      qty,
      leverage,
      currentPrice
    );

    // Record to Order History
    setOrderHistory(prev => [{
      id: Date.now(),
      symbol: selectedPair,
      side,
      type: "MARKET",
      amount: qty,
      price: currentPrice,
      status: "FILLED",
      time: new Date().toLocaleTimeString()
    }, ...prev]);

    setAmount("");
    toast.success(`Đã mở vị thế ${side.toUpperCase()} ${selectedPair}`);
  };

  const handleClosePosition = (id: string, price: number) => {
    const pos = positions.find(p => p.id === id);
    if (!pos) return;

    const pnl = pos.side === 'long' ? (price - pos.entryPrice) * pos.amount : (pos.entryPrice - price) * pos.amount;

    // Record to Trade History
    setTradeHistory(prev => [{
      id: Date.now(),
      symbol: pos.symbol,
      side: pos.side,
      entryPrice: pos.entryPrice,
      closePrice: price,
      amount: pos.amount,
      pnl,
      time: new Date().toLocaleTimeString()
    }, ...prev]);

    // Record to Funding History
    setFundingHistory(prev => [{
      id: Date.now(),
      type: "REALIZED PNL",
      amount: pnl,
      asset: "USDT",
      time: new Date().toLocaleTimeString()
    }, ...prev]);

    closePosition(id, price);
  };

  const handleCloseAll = () => {
    const targets = positions.filter(p => {
      if (!filterCurrentPair) return true;
      const pSym = p.symbol.includes('/') ? p.symbol.split('/')[0] : p.symbol;
      return pSym.toUpperCase() === selectedPair.toUpperCase();
    });

    if (targets.length === 0) {
      toast.error("Không có vị thế nào để đóng");
      return;
    }

    targets.forEach(p => handleClosePosition(p.id, currentPrice));
    toast.success(`Đã đóng ${targets.length} vị thế`);
  };

  return (
    <WalletShell fullWidth hideNav hideHeader>
      <div className="min-h-screen bg-[#0B0E11] text-foreground overflow-y-auto scrollbar-hide">
        {/* Market Header - Sticky */}
        <div className="h-14 border-b bg-background/80 backdrop-blur-md flex items-center px-4 justify-between sticky top-0 z-[100] shrink-0">
          <div className="flex items-center gap-6">
            <div
              className="flex items-center gap-3 cursor-pointer hover:bg-white/5 px-2 py-1 rounded-lg transition-all group"
              onClick={() => setIsMarketSelectorOpen(true)}
            >
              <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary overflow-hidden">
                <img
                  src={TOP_COINS.find(c => c.symbol === selectedPair)?.logo || "https://cryptologos.cc/logos/ethereum-eth-logo.png"}
                  alt=""
                  className="size-5"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-black text-sm uppercase tracking-tight">
                  {selectedPair}USDT
                  <ChevronDown className={`size-3 text-muted-foreground transition-transform ${isMarketSelectorOpen ? 'rotate-180' : ''}`} />
                </div>
                <div className="text-[10px] text-success font-medium flex items-center gap-0.5">
                  <TrendingUp className="size-2.5" /> +1.24%
                </div>
              </div>
            </div>

            <div className="h-8 w-px bg-border/50 mx-2" />

            <div className="flex gap-8">
              <div>
                <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-0.5">Giá</div>
                <div className="text-sm font-black tabular-nums text-success">${currentPrice.toLocaleString()}</div>
              </div>
              <div className="hidden sm:block">
                <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-0.5">Cao 24h</div>
                <div className="text-sm font-black tabular-nums">${(currentPrice * 1.05).toLocaleString()}</div>
              </div>
              <div className="hidden sm:block">
                <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-0.5">Thấp 24h</div>
                <div className="text-sm font-black tabular-nums">${(currentPrice * 0.96).toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4 text-[10px] font-black uppercase tracking-tighter mr-2">
              <div className="text-muted-foreground">Tỷ lệ Funding: <span className="text-amber-500">{fundingRate}</span></div>
              <div className="text-muted-foreground">Thời gian: <span className="text-foreground">{fundingTimer}</span></div>
            </div>

            <div className="h-8 w-px bg-border/50 mx-1 hidden sm:block" />

            {/* User Profile Section (BingX Style) */}
            <div className="flex items-center gap-3 pl-2 border-l border-white/5">
              <div className="flex flex-col items-end leading-none">
                <span className="text-[11px] font-bold text-foreground">{username || "User"}</span>
                <button
                  onClick={() => {
                    if (address) {
                      navigator.clipboard.writeText(address);
                      setCopied(true);
                      toast.success("Address copied");
                      setTimeout(() => setCopied(false), 1500);
                    }
                  }}
                  className="text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  {address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "0x00...0000"}
                  {copied ? <Check className="size-2.5" /> : <Copy className="size-2.5" />}
                </button>
              </div>
              <div className="size-8 rounded-full bg-secondary flex items-center justify-center border border-white/10 overflow-hidden ring-2 ring-primary/20 ring-offset-2 ring-offset-background cursor-pointer hover:scale-110 transition-all">
                <img src={ghostLogo} alt="" className="size-6" />
              </div>
            </div>

            <div className="flex items-center gap-1 ml-2">
              <button onClick={() => navigate({ to: "/" })} className="p-2 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-lg transition-all" title="Quay lại Ví">
                <X className="size-4" />
              </button>
              <button className="p-2 hover:bg-secondary rounded-lg transition-all text-muted-foreground hover:text-foreground">
                <Settings className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area - Dashboard Layout */}
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-56px)] p-2 gap-2">
          {/* Left Column: Chart & Positions */}
          <div className="flex-1 flex flex-col min-w-0 gap-2">
            {/* 1. Main Chart Panel */}
            <div className="h-[700px] flex flex-col relative bg-[#161A1E] rounded-xl border border-white/5 overflow-hidden shadow-2xl">
              <div className="flex flex-col bg-card/30 border-b shrink-0">
                <div className="flex items-center gap-6 px-4 py-1.5 border-b">
                  {(["Biểu đồ", "Thông tin Coin", "Thông tin tin"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setChartTab(tab)}
                      className={`text-[11px] font-bold pb-1 transition-all ${chartTab === tab ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>


              {/* Chart Main Display - UPGRADED TO TRADINGVIEW WIDGET */}
              <div className="flex-1 relative bg-[#0B0E11] overflow-hidden min-h-0">
                <TradingViewWidget symbol={tvSymbol} interval={tvInterval} />

                {/* Fixed Position Banners - pinned at top-right of chart */}
                {positions.filter(p => {
                  const pSym = p.symbol.includes('/') ? p.symbol.split('/')[0] : p.symbol;
                  return pSym.toUpperCase() === selectedPair.toUpperCase();
                }).length > 0 && (
                  <div className="absolute top-[50px] right-[60px] z-30 flex flex-col gap-1">
                    {positions.filter(p => {
                      const pSym = p.symbol.includes('/') ? p.symbol.split('/')[0] : p.symbol;
                      return pSym.toUpperCase() === selectedPair.toUpperCase();
                    }).map(p => {
                      const pnl = p.side === 'long'
                        ? (currentPrice - p.entryPrice) * p.amount
                        : (p.entryPrice - currentPrice) * p.amount;
                      const pnlPercent = ((pnl / (p.entryPrice * p.amount)) * 100);
                      const lineColor = p.side === 'long' ? '#22c55e' : '#ef4444';

                      return (
                        <div key={p.id} className="flex items-stretch rounded-[4px] overflow-hidden shadow-xl border border-white/10">
                          {/* Color indicator */}
                          <div className="w-1 shrink-0" style={{ backgroundColor: lineColor }} />
                          {/* Side & Leverage */}
                          <div className="px-2 py-1 bg-[#1a1d23] text-[10px] font-black text-white flex items-center gap-1 border-r border-white/10">
                            {p.side === 'long' ? <TrendingUp className="size-3" style={{ color: lineColor }} /> : <TrendingDown className="size-3" style={{ color: lineColor }} />}
                            <span style={{ color: lineColor }}>{p.side.toUpperCase()}</span>
                            <span className="text-muted-foreground">{p.leverage}x</span>
                          </div>
                          {/* Entry Price */}
                          <div className="px-2 py-1 bg-[#1a1d23] text-[10px] font-bold text-muted-foreground flex items-center gap-1 border-r border-white/10">
                            Entry <span className="text-foreground tabular-nums">${p.entryPrice.toLocaleString()}</span>
                          </div>
                          {/* Qty */}
                          <div className="px-2 py-1 bg-[#1a1d23] text-[10px] font-bold text-muted-foreground flex items-center gap-1 border-r border-white/10">
                            Qty <span className="text-foreground tabular-nums">{p.amount.toLocaleString()}</span>
                          </div>
                          {/* PnL */}
                          <div className={`px-2 py-1 bg-[#1a1d23] text-[10px] font-black tabular-nums flex items-center gap-1 border-r border-white/10 ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {pnl >= 0 ? '+' : ''}{pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            <span className="opacity-70">({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)</span>
                          </div>
                          {/* Close button */}
                          <button
                            onClick={() => closePosition(p.id, currentPrice)}
                            className="px-2 py-1 bg-[#1a1d23] hover:bg-destructive/80 transition-colors flex items-center"
                          >
                            <X className="size-3 text-muted-foreground hover:text-white" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 4. Footer Row: Positions & Orders Panel */}
            <div className="flex-1 bg-[#161A1E] rounded-xl border border-white/5 flex flex-col overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 border-b border-white/5 shrink-0 bg-card/20">
                <div className="flex items-center gap-6">
                  {[
                    { id: "Vị thế", label: `Vị thế (${positions.length})` },
                    { id: "Lệnh mở", label: "Lệnh mở (0)" },
                    { id: "Lịch sử đặt lệnh", label: `Lịch sử đặt lệnh (${orderHistory.length})` },
                    { id: "Lịch sử giao dịch", label: `Lịch sử giao dịch (${tradeHistory.length})` },
                    { id: "Lịch sử vị thế", label: "Lịch sử vị thế" },
                    { id: "Lịch sử dòng vốn", label: "Lịch sử dòng vốn" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setBottomTab(tab.id)}
                      className={`text-[11px] font-black py-3 transition-all relative ${bottomTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      {tab.label}
                      {bottomTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="current-only"
                      checked={filterCurrentPair}
                      onChange={(e) => setFilterCurrentPair(e.target.checked)}
                      className="size-3 rounded border-white/10 bg-white/5 cursor-pointer accent-primary"
                    />
                    <label htmlFor="current-only" className="text-[9px] text-muted-foreground font-bold cursor-pointer">Cặp hiện tại</label>
                  </div>
                  <button
                    onClick={handleCloseAll}
                    className="px-3 py-1 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded font-black uppercase text-[9px] transition-all border border-destructive/20"
                  >
                    Đóng toàn bộ
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-x-auto scrollbar-hide">
                {bottomTab === "Vị thế" ? (
                  <table className="w-full text-left min-w-[900px]">
                    <thead className="bg-secondary/5 sticky top-0 z-10 border-b border-white/5">
                      <tr className="text-muted-foreground uppercase text-[9px] font-black tracking-wider whitespace-nowrap">
                        <th className="px-4 py-2">Hợp đồng</th>
                        <th className="px-4 py-2">Kích thước</th>
                        <th className="px-4 py-2">Giá vào</th>
                        <th className="px-4 py-2">Giá đánh dấu</th>
                        <th className="px-4 py-2">Giá thanh lý</th>
                        <th className="px-4 py-2">Ký quỹ</th>
                        <th className="px-4 py-2">Lãi Lỗ (PNL%)</th>
                        <th className="px-4 py-2 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(() => {
                        const filtered = positions.filter(p => {
                          if (!filterCurrentPair) return true;
                          const pSym = p.symbol.includes('/') ? p.symbol.split('/')[0] : p.symbol;
                          return pSym.toUpperCase() === selectedPair.toUpperCase();
                        });

                        if (filtered.length === 0) {
                          return <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground text-[11px] italic">Không có vị thế hoạt động.</td></tr>;
                        }

                        return filtered.map(p => {
                          const pSymOnly = p.symbol.includes('/') ? p.symbol.split('/')[0] : p.symbol;
                          // CRITICAL: Prioritize currentPrice if it's the active chart asset to ensure 100% sync
                          const pMarkPrice = (pSymOnly.toUpperCase() === selectedPair.toUpperCase())
                            ? currentPrice
                            : (prices[pSymOnly]?.priceUsd || p.entryPrice);

                          const pnl = p.side === 'long' ? (pMarkPrice - p.entryPrice) * p.amount : (p.entryPrice - pMarkPrice) * p.amount;
                          const margin = (p.amount * p.entryPrice) / p.leverage;
                          const pnlPercent = (pnl / margin) * 100;
                          const liqPrice = p.side === 'long' ? p.entryPrice * (1 - 1 / p.leverage * 0.9) : p.entryPrice * (1 + 1 / p.leverage * 0.9);

                          return (
                            <tr key={p.id} className="group hover:bg-white/[0.03] transition-colors relative whitespace-nowrap">
                              <td
                                className="px-4 py-3 relative cursor-pointer group/sym"
                                onClick={() => setSelectedPair(pSymOnly.toUpperCase())}
                              >
                                {/* Left indicator bar - Integrated */}
                                <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${p.side === 'long' ? 'bg-success' : 'bg-destructive'}`} />

                                <div className="flex flex-col ml-1">
                                  <div className="text-[12px] font-black text-foreground uppercase group-hover/sym:text-primary transition-colors flex items-center gap-1">
                                    {p.symbol.replace('/', '')}
                                    <BarChart3 className="size-2.5 opacity-0 group-hover/sym:opacity-100 transition-opacity text-primary" />
                                  </div>
                                  <div className="flex items-center gap-1 mt-1">
                                    <span className={`px-1 rounded-[2px] text-[9px] font-black uppercase ${p.side === 'long' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                                      {p.side === 'long' ? 'Long' : 'Short'}
                                    </span>
                                    <span className="px-1 rounded-[2px] bg-white/10 text-muted-foreground/60 text-[9px] font-black uppercase">{p.leverage}X</span>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-3 text-[12px] font-bold tabular-nums text-foreground">
                                {qtyUnit === "asset"
                                  ? p.amount.toLocaleString()
                                  : (p.amount * pMarkPrice).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " USDT"
                                }
                              </td>

                              <td className="px-4 py-3 text-[12px] font-medium tabular-nums text-muted-foreground">
                                {p.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>

                              <td className="px-4 py-3 text-[12px] font-medium tabular-nums text-primary">
                                {pMarkPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>

                              <td className="px-4 py-3 text-[12px] font-medium tabular-nums text-destructive">
                                {liqPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>

                              <td className="px-4 py-3 text-[12px] font-medium tabular-nums text-foreground">
                                {margin.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT
                              </td>

                              <td className="px-4 py-3">
                                <div className="flex flex-col">
                                  <div className={`text-[12px] font-bold tabular-nums ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                                    {pnl >= 0 ? '+' : ''}{pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </div>
                                  <div className={`text-[10px] font-bold tabular-nums ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                                    ({pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => handleClosePosition(p.id, pMarkPrice)}
                                  className="px-4 py-1.5 rounded-md bg-[#1E2329] hover:bg-destructive hover:text-white transition-all font-black uppercase text-[10px] text-foreground"
                                >
                                  Đóng
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      })()}
                    </tbody>
                  </table>
                ) : bottomTab === "Lịch sử đặt lệnh" ? (
                  <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-secondary/5 border-b border-white/5">
                      <tr className="text-muted-foreground uppercase text-[9px] font-black">
                        <th className="px-4 py-3">Thời gian</th>
                        <th className="px-4 py-3">Cặp</th>
                        <th className="px-4 py-3">Loại</th>
                        <th className="px-4 py-3">Hướng</th>
                        <th className="px-4 py-3">Giá</th>
                        <th className="px-4 py-3">Số lượng</th>
                        <th className="px-4 py-3">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {orderHistory.length === 0 ? (
                        <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground text-[11px] italic">Không có lịch sử đặt lệnh.</td></tr>
                      ) : (
                        orderHistory.map(o => (
                          <tr key={o.id} className="text-[11px] font-bold hover:bg-white/[0.02]">
                            <td className="px-4 py-3 text-muted-foreground">{o.time}</td>
                            <td className="px-4 py-3 uppercase">{o.symbol}USDT</td>
                            <td className="px-4 py-3 text-primary">{o.type}</td>
                            <td className="px-4 py-3"><span className={o.side === 'long' ? 'text-success' : 'text-destructive'}>{o.side.toUpperCase()}</span></td>
                            <td className="px-4 py-3 tabular-nums">{o.price.toLocaleString()}</td>
                            <td className="px-4 py-3 tabular-nums">{o.amount.toFixed(4)}</td>
                            <td className="px-4 py-3 text-success">{o.status}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                ) : bottomTab === "Lịch sử giao dịch" ? (
                  <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-secondary/5 border-b border-white/5">
                      <tr className="text-muted-foreground uppercase text-[9px] font-black">
                        <th className="px-4 py-3">Thời gian</th>
                        <th className="px-4 py-3">Cặp</th>
                        <th className="px-4 py-3">Giá đóng</th>
                        <th className="px-4 py-3">Số lượng</th>
                        <th className="px-4 py-3">Lãi lỗ thực tế</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {tradeHistory.length === 0 ? (
                        <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground text-[11px] italic">Không có lịch sử giao dịch.</td></tr>
                      ) : (
                        tradeHistory.map(t => (
                          <tr key={t.id} className="text-[11px] font-bold hover:bg-white/[0.02]">
                            <td className="px-4 py-3 text-muted-foreground">{t.time}</td>
                            <td className="px-4 py-3 uppercase">{t.symbol}USDT</td>
                            <td className="px-4 py-3 tabular-nums">{t.closePrice.toLocaleString()}</td>
                            <td className="px-4 py-3 tabular-nums">{t.amount.toFixed(4)}</td>
                            <td className={`px-4 py-3 tabular-nums ${t.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>{t.pnl.toFixed(2)} USDT</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                ) : bottomTab === "Lịch sử dòng vốn" ? (
                  <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-secondary/5 border-b border-white/5">
                      <tr className="text-muted-foreground uppercase text-[9px] font-black">
                        <th className="px-4 py-3">Thời gian</th>
                        <th className="px-4 py-3">Loại</th>
                        <th className="px-4 py-3">Số tiền</th>
                        <th className="px-4 py-3">Tài sản</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {fundingHistory.length === 0 ? (
                        <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground text-[11px] italic">Không có lịch sử dòng vốn.</td></tr>
                      ) : (
                        fundingHistory.map(f => (
                          <tr key={f.id} className="text-[11px] font-bold hover:bg-white/[0.02]">
                            <td className="px-4 py-3 text-muted-foreground">{f.time}</td>
                            <td className="px-4 py-3 text-primary uppercase">{f.type}</td>
                            <td className={`px-4 py-3 tabular-nums ${f.amount >= 0 ? 'text-success' : 'text-destructive'}`}>{f.amount.toFixed(2)}</td>
                            <td className="px-4 py-3">{f.asset}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/40">
                    <div className="text-[11px] font-black uppercase tracking-widest italic mb-2">No Data Available</div>
                    <div className="text-[10px]">Tính năng {bottomTab} đang được đồng bộ...</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Trading Dashboard (Sticky) */}
          <div className="w-full lg:w-[320px] shrink-0 sticky top-[72px] self-start flex flex-col gap-2 pb-10">
            {/* Trade Form Panel */}
            <div className="bg-[#161A1E] rounded-xl border border-white/5 flex flex-col shadow-xl shrink-0">
              <div className="flex p-1 bg-secondary/30 m-4 rounded-xl border border-white/5">
                {(["Spot", "Futures"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === t ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="px-4 pb-6">
                <div className="flex gap-2 mb-4">
                  <button onClick={() => setSide("long")} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase transition-all ${side === "long" ? "bg-success text-black shadow-[0_0_20px_rgba(34,197,94,0.4)]" : "bg-secondary text-muted-foreground"}`}>MUA / LONG</button>
                  <button onClick={() => setSide("short")} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase transition-all ${side === "short" ? "bg-destructive text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]" : "bg-secondary text-muted-foreground"}`}>BÁN / SHORT</button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => setQtyUnit(qtyUnit === "asset" ? "usdt" : "asset")}
                        className="text-[10px] font-black uppercase text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                      >
                        Số lượng ({qtyUnit === "asset" ? selectedPair : "USDT"})
                        <RotateCcw className="size-2.5" />
                      </button>
                      <span className="text-[10px] font-black uppercase text-muted-foreground">
                        Tối đa: {(() => {
                          const max = qtyUnit === "asset"
                            ? (tradingBalance * leverage) / currentPrice
                            : (tradingBalance * leverage);
                          return max.toLocaleString(undefined, { maximumFractionDigits: qtyUnit === "asset" ? 3 : 2 });
                        })()}
                      </span>
                    </div>
                    <div className="relative">
                      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-secondary/40 border border-white/5 focus:border-primary/50 rounded-xl px-4 py-3 outline-none text-lg font-black tabular-nums transition-all no-spinner" />
                      <Zap className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase mb-1.5">
                      <span>Đòn bẩy</span>
                      <span className="text-primary">{leverage}x</span>
                    </div>
                    <input type="range" min="1" max="50" value={leverage} onChange={(e) => setLeverage(parseInt(e.target.value))} className="w-full accent-primary h-1 bg-secondary rounded-lg appearance-none cursor-pointer" />
                  </div>

                  <div className="p-3 rounded-xl bg-secondary/20 border border-white/5 space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Ký quỹ</span>
                      <span className="font-bold tabular-nums text-foreground">
                        {amount ? (() => {
                          const val = parseFloat(amount) || 0;
                          const posValue = qtyUnit === "asset" ? val * currentPrice : val;
                          return (posValue / leverage).toFixed(2);
                        })() : "0.00"} USDT
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Giá thanh lý</span>
                      <span className="font-bold tabular-nums text-destructive">
                        {amount ? (side === "long" ? currentPrice * (1 - 1 / leverage) : currentPrice * (1 + 1 / leverage)).toFixed(2) : "--"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between text-xs font-black mb-2 px-1">
                      <span className="text-muted-foreground">Số dư</span>
                      <span className="text-foreground tabular-nums">{(tradingBalance || 0).toLocaleString()} USDT</span>
                    </div>
                    <button onClick={handleTrade} className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 ${side === "long" ? "bg-success text-black" : "bg-destructive text-white"}`}>Mở Vị Thế {side.toUpperCase()}</button>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 opacity-60">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10"><ShieldCheck className="size-3 text-primary" /><span className="text-[9px] font-black text-primary/80 uppercase">Isolated Margin</span></div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10"><Info className="size-3 text-amber-500" /><span className="text-[9px] font-black text-amber-500/80 uppercase">Real-time Price Engine</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assets/Account Panel */}
            <div className="bg-[#161A1E] rounded-xl border border-white/5 p-4 shadow-xl shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Tài khoản</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] text-muted-foreground font-bold uppercase mb-2">Thông tin Ký quỹ</div>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Rủi ro</span>
                      <span className="text-success flex items-center gap-1 font-bold"><ShieldCheck className="size-3" /> An toàn</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Ký Quỹ Duy Trì</span>
                      <span className="font-bold tabular-nums">0.00 USDT</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Ký quỹ khả dụng</span>
                      <span className="font-bold tabular-nums text-primary">{tradingBalance.toLocaleString()} USDT</span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-white/5" />

                <div>
                  <div className="text-[10px] text-muted-foreground font-bold uppercase mb-2">Số dư USDT</div>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Số dư ví</span>
                      <span className="font-bold tabular-nums">{tradingBalance.toLocaleString()} USDT</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Lãi Lỗ chưa thực hiện</span>
                      <span className="font-bold tabular-nums text-success">0.00 USDT</span>
                    </div>
                  </div>
                </div>

                <button className="w-full py-2 bg-secondary/50 hover:bg-secondary text-[11px] font-bold rounded-lg transition-all mt-2">Phân tích Lãi Lỗ hợp đồng</button>
              </div>
            </div>
          </div>
        </div>
        {/* Market Selector Dropdown (Slide Down Style) */}
        {isMarketSelectorOpen && (
          <>
            <div className="fixed inset-0 z-[140]" onClick={() => setIsMarketSelectorOpen(false)} />
            <div className="absolute top-14 left-4 z-[150] w-[450px] bg-[#161A1E] border border-white/10 rounded-b-2xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden animate-in slide-in-from-top-2 duration-200">
              {/* Search Header */}
              <div className="p-4 bg-card/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    ref={searchInputRef}
                    placeholder="Tìm kiếm crypto"
                    className="w-full bg-[#0B0E11] border border-white/5 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-primary/50 transition-all text-foreground"
                    value={marketSearch}
                    onChange={(e) => setMarketSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 px-4 border-b border-white/5 bg-card/5">
                {["Tuyển chọn", "Hợp đồng", "TradFi"].map((tab, idx) => (
                  <button key={tab} className={`text-[11px] font-black py-3 relative ${idx === 0 ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                    {tab}
                    {idx === 0 && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                  </button>
                ))}
              </div>

              {/* Column Headers */}
              <div className="grid grid-cols-[1fr_80px_80px] gap-2 px-4 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest border-b border-white/5 bg-secondary/5">
                <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">Cặp giao dịch / KL <ChevronDown className="size-2" /></div>
                <div className="text-right flex items-center justify-end gap-1 cursor-pointer hover:text-foreground">Giá cuối <ChevronDown className="size-2" /></div>
                <div className="text-right flex items-center justify-end gap-1 cursor-pointer hover:text-foreground">T.đổi 24h <ChevronDown className="size-2" /></div>
              </div>

              {/* Market List */}
              <div className="flex-1 overflow-y-auto max-h-[500px] scrollbar-hide">
                <div className="grid grid-cols-1">
                  {TOP_COINS.filter(c => c.symbol.toLowerCase().includes(marketSearch.toLowerCase()) || c.name.toLowerCase().includes(marketSearch.toLowerCase())).map((coin) => (
                    <button
                      key={coin.symbol}
                      onClick={() => {
                        setSelectedPair(coin.symbol);
                        setIsMarketSelectorOpen(false);
                        setMarketSearch("");
                      }}
                      className={`grid grid-cols-[1fr_80px_80px] gap-2 items-center p-4 hover:bg-white/5 transition-all group ${selectedPair === coin.symbol ? 'bg-primary/10' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <img src={coin.logo} alt="" className="size-6 rounded-full border border-white/10" />
                          <div className="text-left">
                            <div className="text-xs font-black uppercase text-foreground group-hover:text-primary transition-colors">{coin.symbol}USDT</div>
                            <div className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">733.26M</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-[11px] font-bold tabular-nums text-foreground">
                        {coin.symbol === "BTC" ? "63,241.50" : coin.symbol === "ETH" ? "2,311.73" : "1.24"}
                      </div>
                      <div className={`text-right text-[10px] font-black ${coin.symbol === "ETH" ? "text-destructive" : "text-success"}`}>
                        {coin.symbol === "ETH" ? "-1.05%" : "+2.45%"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#0B0E11] border-t border-white/5 flex items-center justify-center text-[9px] font-black uppercase text-muted-foreground/30">
                Hiển thị dữ liệu thị trường trực tiếp
              </div>
            </div>
          </>
        )}
      </div>
    </WalletShell>
  )
}
