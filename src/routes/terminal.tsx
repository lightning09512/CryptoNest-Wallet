import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState, useCallback } from 'react'
import {
  createChart,
  ColorType,
  CandlestickSeries,
  Time,
  ISeriesApi,
  CandlestickData,
  IChartApi
} from 'lightweight-charts'
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

function TerminalPage() {
  const navigate = useNavigate();
  const { address, mnemonic, privateKey, logout, username, prices, tradingBalance, positions, openPosition, closePosition } = useWalletStore();
  const [selectedPair] = useState("ETH");
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
  const [ohlc, setOhlc] = useState<{ o: number; h: number; l: number; c: number } | null>(null);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [currentPrice, setCurrentPrice] = useState(2300);
  const currentPriceRef = useRef(currentPrice);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isLoadingHistory = useRef(false);
  const firstCandleTimeRef = useRef<number | null>(null);
  const priceLinesRef = useRef<any[]>([]);
  const [posCoords, setPosCoords] = useState<Record<string, number>>({});

  // Sync ref with state for chart usage
  useEffect(() => {
    currentPriceRef.current = currentPrice;
  }, [currentPrice]);

  // WebSocket and Fallback Price Engine
  useEffect(() => {
    const symbol = `${selectedPair.toLowerCase()}usdt`;
    let ws: WebSocket | null = null;
    let fallbackInterval: ReturnType<typeof setInterval> | null = null;

    const connectWS = () => {
      ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@ticker`);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const newPrice = parseFloat(data.c);
        if (!isNaN(newPrice)) {
          setCurrentPrice(newPrice);
          currentPriceRef.current = newPrice;
          // Clear fallback if WS is working
          if (fallbackInterval) {
            clearInterval(fallbackInterval);
            fallbackInterval = null;
          }
        }
      };

      ws.onerror = () => {
        console.warn("WebSocket error, using fallback polling");
        startFallback();
      };
    };

    const startFallback = () => {
      if (fallbackInterval) return;
      fallbackInterval = setInterval(async () => {
        try {
          const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${selectedPair}USDT`);
          const data = await res.json();
          const newPrice = parseFloat(data.price);
          if (!isNaN(newPrice)) {
            setCurrentPrice(newPrice);
            currentPriceRef.current = newPrice;
          }
        } catch (e) {
          console.error("Price fallback failed", e);
        }
      }, 2000);
    };

    connectWS();
    // Start fallback anyway to ensure we have a price immediately
    startFallback();

    return () => {
      ws?.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [selectedPair]);

  // ── Fetch real historical candles from Binance API ──────────────────
  const loadCandles = useCallback(
    async (tf: TF, endTime?: number) => {
      const series = seriesRef.current;
      if (!series || isLoadingHistory.current) return;

      isLoadingHistory.current = true;

      const intervalMap: Record<string, string> = {
        "1m": "1m", "5m": "5m", "15m": "15m", "1h": "1h", "4h": "4h",
        "1D": "1d", "1W": "1w", "1M": "1M", "1Y": "1M",
      };
      const interval = intervalMap[tf] || "1m";
      const symbol = `${selectedPair}USDT`;
      const limit = 1000;

      try {
        let url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
        if (endTime) url += `&endTime=${endTime}`;

        const res = await fetch(url);
        const data = await res.json();

        if (!Array.isArray(data)) throw new Error("Invalid API response");

        const history: CandlestickData[] = data.map((d: any) => ({
          time: (d[0] / 1000) as Time,
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
        }));

        if (endTime) {
          const currentData = series.data() as CandlestickData[];
          series.setData([...history, ...currentData].sort((a, b) => (a.time as number) - (b.time as number)));
        } else {
          series.setData(history);
          const lastCandle = history[history.length - 1];
          const startPrice = lastCandle.close;
          setCurrentPrice(startPrice);
          currentPriceRef.current = startPrice;
          setOhlc({ o: lastCandle.open, h: lastCandle.high, l: lastCandle.low, c: lastCandle.close });
          setupLiveTicks(tf, lastCandle);
        }

        if (history.length > 0) {
          firstCandleTimeRef.current = (history[0].time as number) * 1000;
        }

      } catch (err) {
        console.error("Failed to fetch history:", err);
        if (!endTime) toast.error("Không thể tải dữ liệu từ Binance.");
      } finally {
        isLoadingHistory.current = false;
      }
    },
    [selectedPair],
  );

  const setupLiveTicks = (tf: TF, lastCandle: CandlestickData) => {
    if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);

    const candleSec = TF_SECONDS[tf];
    let currentCandleTime = lastCandle.time as number;

    tickIntervalRef.current = setInterval(() => {
      const livePrice = currentPriceRef.current;
      const nowSec = Math.floor(Date.now() / 1000);
      const alignedTime = nowSec - (nowSec % candleSec);

      setOhlc((prev) => {
        const isNewCandle = alignedTime > currentCandleTime;
        if (isNewCandle) {
          currentCandleTime = alignedTime;
        }

        const nextO = isNewCandle ? livePrice : (prev?.o || livePrice);
        const nextH = isNewCandle ? livePrice : Math.max(prev?.h || livePrice, livePrice);
        const nextL = isNewCandle ? livePrice : Math.min(prev?.l || livePrice, livePrice);

        if (seriesRef.current) {
          seriesRef.current.update({
            time: currentCandleTime as Time,
            open: nextO,
            high: nextH,
            low: nextL,
            close: livePrice,
          });
        }
        return { o: nextO, h: nextH, l: nextL, c: livePrice };
      });
    }, 1000);
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#a1a1aa",
      },
      grid: {
        vertLines: { color: "rgba(39, 39, 42, 0.3)" },
        horzLines: { color: "rgba(39, 39, 42, 0.3)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 500,
      timeScale: {
        borderColor: "rgba(39, 39, 42, 0.5)",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: { color: "rgba(161,161,170,0.3)", labelBackgroundColor: "#1e1b4b" },
        horzLine: { color: "rgba(161,161,170,0.3)", labelBackgroundColor: "#1e1b4b" },
      },
    });

    chartRef.current = chart;

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    seriesRef.current = series;
    loadCandles(timeframe);

    chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (!range) return;
      if (range.from < 50 && !isLoadingHistory.current && firstCandleTimeRef.current) {
        loadCandles(timeframe, firstCandleTimeRef.current - 1);
      }
    });

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight
        });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [timeframe, loadCandles]);

  // Sync Price Lines for Positions
  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;

    // Remove old lines
    priceLinesRef.current.forEach(line => {
      try { series.removePriceLine(line); } catch (e) { }
    });
    priceLinesRef.current = [];

    // Add lines for current pair positions
    positions
      .filter(p => {
        const pSym = p.symbol.includes('/') ? p.symbol.split('/')[0] : p.symbol;
        return pSym.toUpperCase() === selectedPair.toUpperCase();
      })
      .forEach(p => {
        const line = series.createPriceLine({
          price: p.entryPrice,
          color: p.side === 'long' ? '#22ab94' : '#ff4a68', // Professional exchange colors
          lineWidth: 1,
          lineStyle: 0, // Solid line
          axisLabelVisible: true,
          title: `${p.side.toUpperCase()} ${p.leverage}X`,
        });
        priceLinesRef.current.push(line);
      });
  }, [positions, selectedPair]);

  // Update floating badge coordinates
  useEffect(() => {
    const chart = chartRef.current;
    const series = seriesRef.current;
    if (!chart || !series || positions.length === 0) return;

    const updateCoords = () => {
      const newCoords: Record<string, number> = {};
      positions.forEach(p => {
        if (p.symbol.replace('/', '') === `${selectedPair}USDT`) {
          const y = series.priceToCoordinate(p.entryPrice);
          if (y !== null) newCoords[p.id] = y;
        }
      });
      setPosCoords(newCoords);
    };

    chart.timeScale().subscribeVisibleLogicalRangeChange(updateCoords);
    // Initial update
    setTimeout(updateCoords, 100);

    return () => {
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(updateCoords);
    };
  }, [positions, selectedPair, currentPrice]);

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
    setAmount("");
    toast.success(`Đã mở vị thế ${side.toUpperCase()} ${selectedPair}`);
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

    targets.forEach(p => closePosition(p.id, currentPrice));
    toast.success(`Đã đóng ${targets.length} vị thế`);
  };

  return (
    <WalletShell fullWidth hideNav hideHeader>
      <div className="min-h-screen bg-[#0B0E11] text-foreground overflow-y-auto scrollbar-hide">
        {/* Market Header - Sticky */}
        <div className="h-14 border-b bg-background/80 backdrop-blur-md flex items-center px-4 justify-between sticky top-0 z-[100] shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">Ξ</div>
              <div>
                <div className="flex items-center gap-1.5 font-black text-sm uppercase tracking-tight">
                  {selectedPair}USDT
                  <ChevronDown className="size-3 text-muted-foreground" />
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
              <div className="text-muted-foreground">Tỷ lệ Funding: <span className="text-amber-500">0.0100%</span></div>
              <div className="text-muted-foreground">Thời gian: <span className="text-foreground">07:59:59</span></div>
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
                <div className="flex items-center gap-2 px-4 py-2 text-[11px]">
                  <span className="text-muted-foreground font-bold mr-2">Thời gian:</span>
                  {TIMEFRAMES.map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-2 py-0.5 rounded font-black transition-all ${timeframe === tf ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-secondary"}`}
                    >
                      {tf}
                    </button>
                  ))}
                  <div className="h-4 w-px bg-border mx-2" />
                  <button className="p-1 hover:bg-secondary rounded"><BarChart3 className="size-3.5 text-muted-foreground" /></button>
                  <button className="p-1 hover:bg-secondary rounded"><Settings className="size-3.5 text-muted-foreground" /></button>
                  <button className="p-1 hover:bg-secondary rounded ml-auto"><RotateCcw className="size-3.5 text-muted-foreground" /></button>
                  <button className="p-1 hover:bg-secondary rounded"><Camera className="size-3.5 text-muted-foreground" /></button>
                </div>
              </div>

              {/* 2. Middle Row: Drawing Sidebar + Chart Area */}
              <div className="flex-1 flex overflow-hidden min-h-0">
                {/* Left Drawing Sidebar */}
                <div className="w-12 border-r bg-[#0B0E11] flex flex-col items-center py-4 gap-4 shrink-0 border-white/5">
                  <div className="p-2 hover:bg-secondary rounded-lg cursor-pointer text-primary transition-colors">
                    <MousePointer2 className="size-4" />
                  </div>
                  <div className="p-2 hover:bg-secondary rounded-lg cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                    <LineChartIcon className="size-4" />
                  </div>
                  <div className="p-2 hover:bg-secondary rounded-lg cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                    <Shapes className="size-4" />
                  </div>
                  <div className="p-2 hover:bg-secondary rounded-lg cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                    <Zap className="size-4" />
                  </div>
                  <div className="p-2 hover:bg-secondary rounded-lg cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                    <Type className="size-4" />
                  </div>
                  <div className="p-2 hover:bg-secondary rounded-lg cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                    <Ruler className="size-4" />
                  </div>
                  <div className="p-2 hover:bg-secondary rounded-lg cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                    <Search className="size-4" />
                  </div>

                  <div className="h-px w-6 bg-white/5 my-2" />

                  <div className="mt-auto flex flex-col gap-4">
                    <div className="p-2 hover:bg-secondary rounded-lg cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                      <Magnet className="size-4" />
                    </div>
                    <div className="p-2 hover:bg-secondary rounded-lg cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                      <LockIcon className="size-4" />
                    </div>
                    <div className="p-2 hover:bg-secondary rounded-lg cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                      <Eye className="size-4" />
                    </div>
                    <div className="p-2 hover:bg-secondary rounded-lg cursor-pointer text-destructive/70 hover:text-destructive transition-colors">
                      <Trash2 className="size-4" />
                    </div>
                  </div>
                </div>

                {/* Chart Main Display */}
                <div className="flex-1 relative bg-[#0B0E11] overflow-hidden">
                  {/* OHLC Overlay */}
                  {ohlc && (
                    <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-3 text-[10px] pointer-events-none bg-background/40 backdrop-blur-sm p-1.5 rounded-md border border-white/5">
                      <span className="text-muted-foreground font-bold">{selectedPair}USDT · {timeframe} · <span className="text-primary font-black">CryptoNest</span></span>
                      <div className="flex gap-2 font-medium">
                        <span className="text-muted-foreground">O: <span className="text-foreground tabular-nums">{ohlc.o.toFixed(2)}</span></span>
                        <span className="text-muted-foreground">H: <span className="text-foreground tabular-nums">{ohlc.h.toFixed(2)}</span></span>
                        <span className="text-muted-foreground">L: <span className="text-muted-foreground tabular-nums">{ohlc.l.toFixed(2)}</span></span>
                        <span className="text-muted-foreground">C: <span className={ohlc.c >= ohlc.o ? "text-success" : "text-destructive"}>{ohlc.c.toFixed(2)}</span></span>
                      </div>
                    </div>
                  )}
                  <div className="w-full h-full pr-1" ref={chartContainerRef} />

                  {/* Floating Position Badges Overlay */}
                  <div className="absolute inset-0 pointer-events-none z-20">
                    {positions.filter(p => p.symbol.replace('/', '') === `${selectedPair}USDT`).map(p => {
                      const y = posCoords[p.id];
                      if (y === undefined || y < 0) return null;
                      const pnl = p.side === 'long' ? (currentPrice - p.entryPrice) * p.amount : (p.entryPrice - currentPrice) * p.amount;

                      return (
                        <div
                          key={`badge-${p.id}`}
                          style={{ top: `${y}px`, transform: 'translateY(-50%)' }}
                          className="absolute left-4 lg:left-10 flex items-center gap-0 overflow-hidden rounded-[4px] border border-white/10 shadow-2xl transition-all duration-75 pointer-events-auto"
                        >
                          <div className="bg-[#1E2329] px-2 py-1 text-[10px] font-black text-muted-foreground border-r border-white/5">
                            {p.amount.toLocaleString()}
                          </div>
                          <div className={`px-2 py-1 text-[10px] font-black flex items-center gap-1 ${p.side === 'long' ? 'bg-success/90 text-white' : 'bg-destructive/90 text-white'}`}>
                            {p.side.toUpperCase()} {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
                          </div>
                          <button
                            onClick={() => closePosition(p.id, currentPrice)}
                            className="bg-[#1E2329] px-2 py-1 hover:bg-destructive transition-colors border-l border-white/5"
                          >
                            <X className="size-3 text-white" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3. Bottom Row: TradingView Status Bar */}
              <div className="h-7 bg-[#0B0E11] border-t border-white/5 flex items-center justify-between px-2 shrink-0 text-[10px] text-muted-foreground z-10">
                <div className="flex items-center gap-4">
                  <button className="hover:text-foreground transition-colors">
                    <svg viewBox="0 0 18 18" fill="none" className="size-3.5" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H4C2.89543 2 2 2.89543 2 4V14C2 15.1046 2.89543 16 4 16H14C15.1046 16 16 15.1046 16 14V4C16 2.89543 15.1046 2 14 2Z" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M2 6H16" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  </button>
                  <span className="font-bold uppercase tracking-tighter opacity-50">Market Open</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 tabular-nums">
                    <span className="opacity-80 font-medium">{new Date().toLocaleTimeString('vi-VN', { hour12: false })} (UTC+7)</span>
                    <div className="w-px h-3 bg-white/10 mx-1" />
                    <button className="px-1 hover:text-foreground uppercase font-bold">ETH</button>
                    <button className="px-1 hover:text-foreground uppercase font-bold">%</button>
                    <button className="px-1 hover:text-foreground uppercase font-bold">log</button>
                    <button
                      onClick={() => chartRef.current?.timeScale().fitContent()}
                      className="ml-2 px-2 py-0.5 bg-[#2a2e39] hover:bg-[#363a45] text-foreground rounded-[3px] text-[9px] font-black uppercase transition-all shadow-sm border border-white/5"
                    >
                      tự động
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Footer Row: Positions & Orders Panel */}
            <div className="flex-1 bg-[#161A1E] rounded-xl border border-white/5 flex flex-col overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 border-b border-white/5 shrink-0 bg-card/20">
                <div className="flex items-center gap-6">
                  {[
                    { id: "Vị thế", label: `Vị thế (${positions.length})` },
                    { id: "Lệnh mở", label: "Lệnh mở (0)" },
                    { id: "Lịch sử đặt lệnh", label: "Lịch sử đặt lệnh" },
                    { id: "Lịch sử giao dịch", label: "Lịch sử giao dịch" },
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
                          const pnl = p.side === 'long' ? (currentPrice - p.entryPrice) * p.amount : (p.entryPrice - currentPrice) * p.amount;
                          const margin = (p.amount * p.entryPrice) / p.leverage;
                          const pnlPercent = (pnl / margin) * 100;
                          const liqPrice = p.side === 'long'
                            ? p.entryPrice * (1 - 0.95 / p.leverage)
                            : p.entryPrice * (1 + 0.95 / p.leverage);

                          return (
                            <tr key={p.id} className="group hover:bg-white/[0.03] transition-colors relative whitespace-nowrap">
                              <td className="px-4 py-3 relative">
                                {/* Left indicator bar - Integrated */}
                                <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${p.side === 'long' ? 'bg-success' : 'bg-destructive'}`} />

                                <div className="flex flex-col ml-1">
                                  <div className="text-[12px] font-black text-foreground uppercase">{p.symbol.replace('/', '')}</div>
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
                                  : (p.amount * currentPrice).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " USDT"
                                }
                              </td>

                              <td className="px-4 py-3 text-[12px] font-medium tabular-nums text-muted-foreground">
                                {p.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>

                              <td className="px-4 py-3 text-[12px] font-medium tabular-nums text-primary">
                                {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                                    {pnl >= 0 ? '+' : ''}{pnl.toFixed(4)}
                                  </div>
                                  <div className={`text-[10px] font-bold tabular-nums ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                                    ({pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => closePosition(p.id, currentPrice)}
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
      </div>
    </WalletShell>
  )
}
