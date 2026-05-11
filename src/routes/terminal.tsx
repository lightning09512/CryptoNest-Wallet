import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { WalletShell } from "@/components/wallet-shell";
import { useState, useEffect, useRef, useCallback } from "react";
import { useWalletStore } from "@/store/wallet-store";
import {
  createChart,
  ColorType,
  ISeriesApi,
  CandlestickData,
  Time,
  CandlestickSeries,
} from "lightweight-charts";
import {
  TrendingUp,
  TrendingDown,
  Info,
  ChevronDown,
  LayoutGrid,
  Zap,
  ShieldCheck,
  Star,
  Settings,
  Maximize2,
  Camera,
  RotateCcw,
  MousePointer2,
  LineChart as LineChartIcon,
  Shapes,
  Type,
  Eye,
  Lock,
  Magnet,
  Trash2,
  Ruler,
  BarChart3,
  Search,
} from "lucide-react";
import { toast } from "sonner";

// ── Timeframe config ────────────────────────────────────────────────────────
type TF = "1m" | "5m" | "15m" | "1h" | "4h" | "1D" | "1W" | "1M" | "1Y";

const TF_SECONDS: Record<TF, number> = {
  "1m": 60,
  "5m": 300,
  "15m": 900,
  "1h": 3600,
  "4h": 14400,
  "1D": 86400,
  "1W": 604800,
  "1M": 2592000,
  "1Y": 31536000,
};

const TF_VOLATILITY: Record<TF, number> = {
  "1m": 0.003,
  "5m": 0.006,
  "15m": 0.01,
  "1h": 0.02,
  "4h": 0.035,
  "1D": 0.05,
  "1W": 0.1,
  "1M": 0.18,
  "1Y": 0.4,
};

const TIMEFRAMES: TF[] = ["1m", "5m", "15m", "1h", "4h", "1D", "1W"];

// ── Route ───────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/terminal")({
  head: () => ({ meta: [{ title: "Trading Terminal — CryptoNest" }] }),
  component: TerminalPage,
});

// ── Component ───────────────────────────────────────────────────────────────
function TerminalPage() {
  const { prices, tradingBalance, positions, openPosition, closePosition } = useWalletStore();

  const [activeTab, setActiveTab] = useState<"Spot" | "Futures">("Futures");
  const [chartTab, setChartTab] = useState<"Biểu đồ" | "Thông tin Coin" | "Thông tin tin">(
    "Biểu đồ",
  );
  const [selectedPair] = useState("ETH");
  const [leverage, setLeverage] = useState(10);
  const [amount, setAmount] = useState("");
  const [side, setSide] = useState<"long" | "short">("long");
  const [timeframe, setTimeframe] = useState<TF>("1m");
  const [ohlc, setOhlc] = useState<{ o: number; h: number; l: number; c: number } | null>(null);

  const currentPrice = prices[selectedPair]?.priceUsd || 3420.5;
  const priceChange = prices[selectedPair]?.change24h || 2.45;

  // ── Simulated Advanced Stats ──────────────────────────────────────────
  const markPrice = (currentPrice + (Math.random() - 0.5) * 2).toFixed(2);
  const indexPrice = (currentPrice + (Math.random() - 0.5) * 1.5).toFixed(2);
  const fundingRate = "0.0100%";
  const countdown = "07:39:30";

  // ── Chart refs ─────────────────────────────────────────────────────────
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const currentPriceRef = useRef(currentPrice);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    currentPriceRef.current = currentPrice;
  }, [currentPrice]);

  const loadCandles = useCallback((tf: TF) => {
    const series = seriesRef.current;
    if (!series) return;

    const candleSec = TF_SECONDS[tf];
    const vol = TF_VOLATILITY[tf];
    const nowSec = Math.floor(Date.now() / 1000);
    const baseTime = nowSec - (nowSec % candleSec);

    const initialData: CandlestickData[] = [];
    let lastClose = currentPriceRef.current * (1 - vol * 2 * Math.random());

    for (let i = 150; i >= 1; i--) {
      const candleTime = (baseTime - i * candleSec) as Time;
      const open = lastClose;
      const bodyRange = open * vol;
      const drift = (Math.random() - 0.48) * bodyRange;
      const close = Math.max(open + drift, 1);
      const wickRange = open * vol * 0.5;
      const high = Math.max(open, close) + Math.random() * wickRange;
      const low = Math.min(open, close) - Math.random() * wickRange;
      initialData.push({ time: candleTime, open, high, low, close });
      lastClose = close;
    }

    series.setData(initialData);

    if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);

    let candleOpen = lastClose;
    let candleHigh = lastClose;
    let candleLow = lastClose;
    let currentCandleTime = baseTime as Time;

    const tickMs = candleSec >= 86400 ? 5000 : 1000;

    tickIntervalRef.current = setInterval(() => {
      const livePrice = currentPriceRef.current;
      const nowMs = Math.floor(Date.now() / 1000);
      const alignedTime = (nowMs - (nowMs % candleSec)) as Time;

      if (alignedTime !== currentCandleTime) {
        candleOpen = livePrice;
        candleHigh = livePrice;
        candleLow = livePrice;
        currentCandleTime = alignedTime;
      }

      const tickVol = livePrice * TF_VOLATILITY[tf] * 0.05;
      const tick = livePrice + (Math.random() - 0.5) * tickVol;
      candleHigh = Math.max(candleHigh, tick);
      candleLow = Math.min(candleLow, tick);

      setOhlc({ o: candleOpen, h: candleHigh, l: candleLow, c: tick });

      if (seriesRef.current) {
        seriesRef.current.update({
          time: currentCandleTime,
          open: candleOpen,
          high: candleHigh,
          low: candleLow,
          close: tick,
        });
      }
    }, tickMs);
  }, []);

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
      height: 550,
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

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (seriesRef.current) loadCandles(timeframe);
  }, [timeframe, loadCandles]);

  const handleTrade = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      toast.error("Invalid amount");
      return;
    }
    const marginRequired = (val * currentPrice) / leverage;
    if (marginRequired > tradingBalance) {
      toast.error("Insufficient Trading Balance");
      return;
    }
    openPosition(selectedPair, side, val, leverage, currentPrice);
    toast.success(`Opened ${leverage}x ${side.toUpperCase()} on ${selectedPair}`);
    setAmount("");
  };

  return (
    <WalletShell fullWidth>
      <div className="flex flex-col min-h-screen bg-background scrollbar-hide">
        {/* ── Top Market Stats Bar (BingX Style) ────────────────────────── */}
        <div className="flex flex-wrap items-center gap-6 px-4 py-3 border-b bg-[#0B0E11] text-[11px]">
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="flex items-center gap-2">
              <span className="font-black text-base text-foreground tracking-tight">
                {selectedPair}USDT
              </span>
              <div className="flex flex-col">
                <ChevronDown className="size-3 text-muted-foreground group-hover:text-primary transition-colors" />
                <Star className="size-3 text-muted-foreground hover:text-yellow-500 transition-colors" />
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <span
              className={`text-base font-bold tabular-nums ${priceChange >= 0 ? "text-success" : "text-destructive"}`}
            >
              {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span
              className={`font-medium ${priceChange >= 0 ? "text-success" : "text-destructive"}`}
            >
              {priceChange > 0 ? "+" : ""}
              {priceChange.toFixed(2)}%
            </span>
          </div>

          <div className="hidden sm:flex gap-6">
            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground font-medium">Giá đánh dấu</span>
              <span className="text-foreground tabular-nums">{markPrice}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground font-medium">Giá chỉ số</span>
              <span className="text-foreground tabular-nums font-medium">{indexPrice}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground font-medium">Tài trợ (8h)/Quyết toán</span>
              <div className="flex gap-2">
                <span className="text-amber-500 font-bold">{fundingRate}</span>
                <span className="text-foreground tabular-nums">{countdown}</span>
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground font-medium">Cao nhất 24 giờ</span>
              <span className="text-foreground tabular-nums">
                {(currentPrice * 1.05).toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground font-medium">Thấp nhất 24 giờ</span>
              <span className="text-foreground tabular-nums">
                {(currentPrice * 0.95).toFixed(2)}
              </span>
            </div>
            <div className="hidden lg:flex flex-col gap-0.5">
              <span className="text-muted-foreground font-medium">Khối lượng 24 giờ (USDT)</span>
              <span className="text-foreground tabular-nums font-medium">1,245.82M</span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* ── Left Drawing Toolbar ─────────────────────────────────────── */}
          <div className="w-12 border-r bg-[#0B0E11] flex flex-col items-center py-4 gap-4 shrink-0">
            <div className="p-2 hover:bg-secondary rounded cursor-pointer text-primary">
              <MousePointer2 className="size-4" />
            </div>
            <div className="p-2 hover:bg-secondary rounded cursor-pointer">
              <LineChartIcon className="size-4 text-muted-foreground" />
            </div>
            <div className="p-2 hover:bg-secondary rounded cursor-pointer">
              <Shapes className="size-4 text-muted-foreground" />
            </div>
            <div className="p-2 hover:bg-secondary rounded cursor-pointer">
              <Zap className="size-4 text-muted-foreground" />
            </div>
            <div className="p-2 hover:bg-secondary rounded cursor-pointer">
              <Type className="size-4 text-muted-foreground" />
            </div>
            <div className="p-2 hover:bg-secondary rounded cursor-pointer">
              <Ruler className="size-4 text-muted-foreground" />
            </div>
            <div className="p-2 hover:bg-secondary rounded cursor-pointer">
              <Search className="size-4 text-muted-foreground" />
            </div>
            <div className="mt-auto flex flex-col gap-4">
              <div className="p-2 hover:bg-secondary rounded cursor-pointer">
                <Magnet className="size-4 text-muted-foreground" />
              </div>
              <div className="p-2 hover:bg-secondary rounded cursor-pointer">
                <Lock className="size-4 text-muted-foreground" />
              </div>
              <div className="p-2 hover:bg-secondary rounded cursor-pointer">
                <Eye className="size-4 text-muted-foreground" />
              </div>
              <div className="p-2 hover:bg-secondary rounded cursor-pointer text-destructive/70">
                <Trash2 className="size-4" />
              </div>
            </div>
          </div>

          {/* ── Main Chart Section ───────────────────────────────────────── */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Chart Tabs & Timeframes */}
            <div className="flex flex-col bg-background/50 border-b">
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
                <button className="p-1 hover:bg-secondary rounded">
                  <BarChart3 className="size-3.5 text-muted-foreground" />
                </button>
                <button className="p-1 hover:bg-secondary rounded">
                  <Settings className="size-3.5 text-muted-foreground" />
                </button>
                <button className="p-1 hover:bg-secondary rounded ml-auto">
                  <RotateCcw className="size-3.5 text-muted-foreground" />
                </button>
                <button className="p-1 hover:bg-secondary rounded">
                  <Camera className="size-3.5 text-muted-foreground" />
                </button>
                <button className="p-1 hover:bg-secondary rounded">
                  <Maximize2 className="size-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="flex-1 relative bg-[#0B0E11]">
              {/* OHLC Legend Overlay */}
              {ohlc && (
                <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-3 text-[10px] pointer-events-none bg-background/40 backdrop-blur-sm p-1.5 rounded-md border border-white/5">
                  <span className="text-muted-foreground font-bold">
                    {selectedPair}USDT · {timeframe} ·{" "}
                    <span className="text-primary font-black">CryptoNest</span>
                  </span>
                  <div className="flex gap-2 font-medium">
                    <span className="text-muted-foreground">
                      O: <span className="text-foreground tabular-nums">{ohlc.o.toFixed(2)}</span>
                    </span>
                    <span className="text-muted-foreground">
                      H: <span className="text-foreground tabular-nums">{ohlc.h.toFixed(2)}</span>
                    </span>
                    <span className="text-muted-foreground">
                      L: <span className="text-foreground tabular-nums">{ohlc.l.toFixed(2)}</span>
                    </span>
                    <span className="text-muted-foreground">
                      C:{" "}
                      <span className={ohlc.c >= ohlc.o ? "text-success" : "text-destructive"}>
                        {ohlc.c.toFixed(2)}
                      </span>
                    </span>
                    <span className={ohlc.c >= ohlc.o ? "text-success" : "text-destructive"}>
                      {(ohlc.c - ohlc.o).toFixed(2)} (
                      {(((ohlc.c - ohlc.o) / ohlc.o) * 100).toFixed(2)}%)
                    </span>
                  </div>
                </div>
              )}

              <div className="w-full h-full" ref={chartContainerRef} />

              {/* Positions Table (Floating/Bottom) */}
              <div className="absolute bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-md max-h-48 overflow-auto scrollbar-hide z-20 shadow-[0_-8px_30px_rgb(0,0,0,0.4)]">
                <div className="flex items-center justify-between px-4 py-2 border-b">
                  <div className="flex gap-6 text-[10px] font-black uppercase tracking-wider">
                    <button className="text-primary border-b-2 border-primary pb-1">
                      Vị thế ({positions.length})
                    </button>
                    <button className="text-muted-foreground hover:text-foreground">
                      Lệnh chờ (0)
                    </button>
                    <button className="text-muted-foreground hover:text-foreground">
                      Lịch sử lệnh
                    </button>
                  </div>
                </div>
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-secondary/20 sticky top-0 z-10">
                    <tr className="text-muted-foreground border-b uppercase text-[9px] font-black">
                      <th className="px-4 py-2">Thị trường</th>
                      <th className="px-4 py-2">Kích thước</th>
                      <th className="px-4 py-2">Giá vào</th>
                      <th className="px-4 py-2">Giá đánh dấu</th>
                      <th className="px-4 py-2">PnL</th>
                      <th className="px-4 py-2 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {positions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-muted-foreground italic"
                        >
                          Không có vị thế hoạt động.
                        </td>
                      </tr>
                    ) : (
                      positions.map((p) => {
                        const pnl =
                          p.side === "long"
                            ? (currentPrice - p.entryPrice) * p.amount
                            : (p.entryPrice - currentPrice) * p.amount;
                        const pnlPct = (pnl / ((p.amount * p.entryPrice) / p.leverage)) * 100;
                        return (
                          <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                            <td className="px-4 py-3 font-bold">
                              {p.symbol}{" "}
                              <span
                                className={p.side === "long" ? "text-success" : "text-destructive"}
                              >
                                {p.leverage}x
                              </span>
                            </td>
                            <td className="px-4 py-3 tabular-nums font-medium">
                              {p.amount} {p.symbol}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground tabular-nums">
                              ${p.entryPrice.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 tabular-nums">
                              ${currentPrice.toLocaleString()}
                            </td>
                            <td
                              className={`px-4 py-3 font-bold tabular-nums ${pnl >= 0 ? "text-success" : "text-destructive"}`}
                            >
                              {pnl >= 0 ? "+" : ""}
                              {pnl.toFixed(2)} ({pnlPct.toFixed(2)}%)
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => closePosition(p.id, currentPrice)}
                                className="px-3 py-1 rounded bg-secondary hover:bg-destructive hover:text-white transition-all font-bold uppercase text-[9px]"
                              >
                                Đóng
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── Right Trading Sidebar ───────────────────────────────────── */}
          <div className="w-72 sm:w-80 border-l bg-[#0B0E11] flex flex-col shrink-0">
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

            <div className="px-4 flex-1 overflow-auto scrollbar-hide">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setSide("long")}
                  className={`flex-1 py-3 rounded-xl font-black text-xs uppercase transition-all ${side === "long" ? "bg-success text-black shadow-[0_0_20px_rgba(34,197,94,0.4)]" : "bg-secondary text-muted-foreground"}`}
                >
                  MUA / LONG
                </button>
                <button
                  onClick={() => setSide("short")}
                  className={`flex-1 py-3 rounded-xl font-black text-xs uppercase transition-all ${side === "short" ? "bg-destructive text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]" : "bg-secondary text-muted-foreground"}`}
                >
                  BÁN / SHORT
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase mb-1.5">
                    <span>Số lượng ({selectedPair})</span>
                    <span>Tối đa: {((tradingBalance * leverage) / currentPrice).toFixed(3)}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-secondary/40 border border-white/5 focus:border-primary/50 rounded-xl px-4 py-3 outline-none text-lg font-black tabular-nums transition-all no-spinner"
                    />
                    <Zap className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase mb-1.5">
                    <span>Đòn bẩy</span>
                    <span className="text-primary">{leverage}x</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={leverage}
                    onChange={(e) => setLeverage(parseInt(e.target.value))}
                    className="w-full accent-primary h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] text-muted-foreground font-black mt-1">
                    <span>1x</span>
                    <span>10x</span>
                    <span>25x</span>
                    <span>50x</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-secondary/20 border border-white/5 space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Ký quỹ yêu cầu</span>
                    <span className="font-bold tabular-nums text-foreground">
                      {amount && !isNaN(parseFloat(amount))
                        ? ((parseFloat(amount) * currentPrice) / leverage).toFixed(2)
                        : "0.00"}{" "}
                      USDT
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Giá thanh lý ước tính</span>
                    <span className="font-bold tabular-nums text-destructive">
                      {amount && !isNaN(parseFloat(amount))
                        ? (side === "long"
                          ? currentPrice * (1 - 1 / leverage)
                          : currentPrice * (1 + 1 / leverage)
                        ).toFixed(2)
                        : "--"}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-xs font-black mb-2 px-1">
                    <span className="text-muted-foreground">Số dư</span>
                    <span className="text-foreground tabular-nums">
                      {(tradingBalance || 0).toLocaleString()} USDT
                    </span>
                  </div>
                  <button
                    onClick={handleTrade}
                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 ${side === "long" ? "bg-success text-black" : "bg-destructive text-white"}`}
                  >
                    Mở Vị Thế {side.toUpperCase()}
                  </button>
                </div>

                <div className="mt-8 flex flex-col gap-2 opacity-60">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
                    <ShieldCheck className="size-3 text-primary" />
                    <span className="text-[9px] font-black text-primary/80 uppercase">
                      Chế độ ký quỹ cô lập
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
                    <Info className="size-3 text-amber-500" />
                    <span className="text-[9px] font-black text-amber-500/80 uppercase">
                      Cơ chế giá thời gian thực
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WalletShell>
  );
}
