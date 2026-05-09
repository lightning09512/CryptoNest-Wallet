import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowDown, ChevronDown, TrendingUp, X } from "lucide-react";
import { useState, useMemo } from "react";
import { WalletShell } from "@/components/wallet-shell";
import { toast } from "sonner";
import { useWalletStore } from "@/store/wallet-store";
import { sendSepoliaETH } from "@/lib/web3";

import { TOKENS } from "@/lib/wallet-data";

export const Route = createFileRoute("/swap")({
  head: () => ({ meta: [{ title: "Swap — CryptoNest" }] }),
  component: SwapPage,
});

const TRENDING = [
  { rank: 1, symbol: "SOL", name: "Solana", price: 168.42, mc: "$76.8B", change: 2.0, color: "oklch(0.7 0.2 295)", icon: "/img/solana.png" },
  { rank: 2, symbol: "BNB", name: "Binance Coin", price: 612.45, mc: "$89.5B", change: 1.5, color: "oklch(0.65 0.15 45)", icon: "/img/bnb.png" },
  { rank: 3, symbol: "DOGE", name: "Dogecoin", price: 0.16, mc: "$23.1B", change: 5.4, color: "oklch(0.7 0.15 35)", icon: "/img/doge.png" },
  { rank: 4, symbol: "XRP", name: "Ripple", price: 0.52, mc: "$28.4B", change: -0.8, color: "oklch(0.6 0.2 340)", icon: "/img/xrp.png" },
  { rank: 5, symbol: "ETH", name: "Ethereum", price: 3420.55, mc: "$411B", change: 1.2, color: "oklch(0.55 0.18 270)", icon: "/img/eth.png" },
];

const TABS = ["Tokens", "Perps"] as const;
type Tab = (typeof TABS)[number];

type TokenInfo = {
  symbol: string;
  name: string;
  balance: number;
  priceUsd: number;
  color: string;
  icon?: string;
};

const TokenBox = ({
  token,
  label,
  value,
  onChange,
  readOnly,
  showActions,
  onSelect,
}: {
  token: TokenInfo;
  label: string;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  showActions?: boolean;
  onSelect: () => void;
}) => {
  return (
  <div className="rounded-2xl bg-card p-4">
    <div className="text-xs text-muted-foreground mb-2">{label}</div>
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onSelect}
        className="flex items-center gap-2 rounded-full bg-secondary hover:bg-accent transition-colors px-2 py-1 shrink-0"
      >
        {token.icon ? (
          <img src={token.icon} alt={token.symbol} className="size-6 rounded-full object-cover bg-white" />
        ) : (
          <span
            className="size-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
            style={{ backgroundColor: token.color }}
          >
            {token.symbol.slice(0, 3)}
          </span>
        )}
        <span className="font-bold text-sm">{token.symbol}</span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </button>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => {
          const val = e.target.value.replace(/,/g, ".");
          if (val === "" || /^\d*\.?\d*$/.test(val)) {
            onChange?.(val);
          }
        }}
        readOnly={readOnly}
        placeholder="0"
        className="flex-1 min-w-0 bg-transparent text-3xl font-semibold outline-none tabular-nums text-right no-spinner"
      />
    </div>
    <div className="flex items-center justify-between mt-3">
      <div className="text-xs text-muted-foreground tabular-nums">
        ${(parseFloat(value || "0") * token.priceUsd).toFixed(2)}
      </div>
      {showActions && (
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => onChange?.((token.balance / 2).toString())}
            className="rounded-full bg-secondary hover:bg-accent text-[10px] font-bold px-3 py-1 transition-colors"
          >
            50%
          </button>
          <button
            type="button"
            onClick={() => onChange?.(token.balance.toString())}
            className="rounded-full bg-secondary hover:bg-accent text-[10px] font-bold px-3 py-1 transition-colors"
          >
            Max
          </button>
        </div>
      )}
    </div>
  </div>
)};

function SwapPage() {
  const nav = useNavigate();
  const { balance, kcoinBalance, privateKey, addKCoin, addTx, prices } = useWalletStore();
  
  const ethAmount = parseFloat(balance || "0");
  const ethPriceUsd = prices["ETH"]?.priceUsd || 3420.55;
  const kcoinPriceUsd = 36.41;

  const ALL_SWAP_TOKENS: TokenInfo[] = useMemo(() => {
    const ethToken: TokenInfo = {
      symbol: "ETH",
      name: "Sepolia ETH",
      balance: ethAmount,
      priceUsd: ethPriceUsd,
      color: "#627EEA",
      icon: "/img/eth.png",
    };

    const kcoinToken: TokenInfo = {
      symbol: "KCOIN",
      name: "Khánh Coin",
      balance: kcoinBalance,
      priceUsd: kcoinPriceUsd,
      color: "#E83A65",
      icon: "/img/khanh.jpg",
    };

    return TOKENS.map(t => {
      if (t.symbol === "ETH") return ethToken;
      return {
        ...t,
        priceUsd: prices[t.symbol]?.priceUsd || t.priceUsd,
      };
    }).concat([kcoinToken]);
  }, [ethAmount, ethPriceUsd, kcoinBalance, prices]);

  const [from, setFrom] = useState<TokenInfo>(ALL_SWAP_TOKENS[0]);
  const [to, setTo] = useState<TokenInfo>(ALL_SWAP_TOKENS[ALL_SWAP_TOKENS.length - 1]);
  const [amount, setAmount] = useState("");
  const [tab, setTab] = useState<Tab>("Tokens");
  const [isSwapping, setIsSwapping] = useState(false);
  const [selectingFor, setSelectingFor] = useState<"from" | "to" | null>(null);

  const out = useMemo(() => {
    if (!amount) return 0;
    return parseFloat(amount) * (from.priceUsd / to.priceUsd);
  }, [amount, from, to]);

  const switchTokens = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const submit = async () => {
    if (!amount || parseFloat(amount) <= 0) return toast.error("Enter a valid amount");
    if (parseFloat(amount) > from.balance) {
      return toast.error(`Insufficient ${from.symbol} balance`);
    }

    setIsSwapping(true);
    const toastId = toast.loading(`Swapping ${from.symbol} to ${to.symbol}...`);

    // Simulate swap logic
    setTimeout(() => {
      if (from.symbol === "KCOIN") {
         useWalletStore.getState().subtractKCoin(parseFloat(amount));
      }
      if (to.symbol === "KCOIN") {
         addKCoin(out);
      }
      
      addTx({
        id: `swap-${Date.now()}`,
        type: "swap",
        token: `${from.symbol}→${to.symbol}`,
        amount: parseFloat(amount),
        to: "Swap Protocol",
        from: "Your Wallet",
        date: new Date().toISOString(),
        status: "confirmed",
        hash: `0x${Math.random().toString(16).slice(2, 10)}...`,
      });

      setIsSwapping(false);
      toast.success(`Swap successful! Received ${out.toFixed(4)} ${to.symbol}`, { id: toastId });
      setAmount("");
      nav({ to: "/" });
    }, 2000);
  };



  return (
    <WalletShell>
      <div className="px-4 pt-2 pb-6">
        {/* Swap card */}
        <div className="relative">
          <TokenBox
            token={from}
            label="You Pay"
            value={amount}
            onChange={setAmount}
            showActions
            onSelect={() => setSelectingFor("from")}
          />

          <div className="flex justify-center my-1 relative z-10">
            <button
              type="button"
              onClick={switchTokens}
              aria-label="Switch tokens"
              className="size-10 rounded-full bg-card border-[6px] border-background flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <ArrowDown className="size-4" />
            </button>
          </div>

          <TokenBox
            token={to}
            label="You Receive"
            value={out ? out.toFixed(6) : ""}
            readOnly
            onSelect={() => setSelectingFor("to")}
          />
        </div>

        {/* Token Selector Modal */}
        {selectingFor && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div 
              className="absolute inset-0" 
              onClick={() => setSelectingFor(null)} 
            />
            <div className="relative w-full max-w-md bg-card border-t sm:border rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-bold">Select Token</h3>
                <button onClick={() => setSelectingFor(null)} className="p-2 hover:bg-secondary rounded-full">
                  <X className="size-5" />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto scrollbar-hide p-2">
                {ALL_SWAP_TOKENS.map(t => (
                  <button
                    key={t.symbol}
                    onClick={() => {
                      if (selectingFor === "from") setFrom(t);
                      else setTo(t);
                      setSelectingFor(null);
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-secondary/60 rounded-2xl transition-colors text-left"
                  >
                    {t.icon ? (
                      <img src={t.icon} alt={t.symbol} className="size-10 rounded-full object-cover bg-white" />
                    ) : (
                      <span className="size-10 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: t.color }}>
                        {t.symbol.slice(0, 3)}
                      </span>
                    )}
                    <div className="flex-1">
                      <div className="font-bold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.symbol}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">{t.balance.toFixed(4)}</div>
                      <div className="text-[10px] text-muted-foreground">${t.priceUsd.toFixed(2)}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={submit}
          disabled={isSwapping}
          className={`w-full mt-4 rounded-full bg-primary text-black font-semibold py-3.5 transition-opacity ${isSwapping ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`}
        >
          {isSwapping ? "Processing..." : "Swap"}
        </button>

        {/* Trending */}
        <div className="mt-7">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-5">
              {TABS.map((t) => {
                const active = t === tab;
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`text-base font-semibold transition-colors ${
                      active ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <button className="text-xs font-semibold text-muted-foreground hover:text-foreground">
              See More
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground px-1 mb-1">
            <div className="flex items-center gap-1">
              <TrendingUp className="size-3" />
              <span>Rank · Solana</span>
            </div>
            <span>24h</span>
          </div>

          <ul className="flex flex-col">
            {TRENDING.map((t) => {
              const livePrice = prices[t.symbol]?.priceUsd || t.price;
              const liveChange = prices[t.symbol]?.change24h || t.change;
              return (
              <li key={t.symbol}>
                <button className="w-full flex items-center gap-3 py-2.5 -mx-2 px-2 rounded-xl hover:bg-secondary/40 transition-colors text-left">
                  <span className="text-xs text-muted-foreground tabular-nums w-4">{t.rank}</span>
                  {t.icon ? (
                    <img src={t.icon} alt={t.symbol} className="size-10 rounded-full shrink-0 object-cover bg-white" />
                  ) : (
                    <span
                      className="size-10 rounded-full flex items-center justify-center text-white font-bold text-[10px] shrink-0"
                      style={{ backgroundColor: t.color }}
                    >
                      {t.symbol.slice(0, 3)}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[15px] truncate">{t.symbol}</div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      ${livePrice < 0.01 ? livePrice.toFixed(8) : livePrice.toFixed(4)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-medium tabular-nums">
                      {t.mc} <span className="text-muted-foreground text-[10px]">MC</span>
                    </div>
                    <div className={`text-xs font-semibold tabular-nums ${liveChange >= 0 ? "text-success" : "text-destructive"}`}>
                      {liveChange >= 0 ? "+" : ""}
                      {liveChange.toFixed(2)}%
                    </div>
                  </div>
                </button>
              </li>
            )})}
          </ul>
        </div>
      </div>
    </WalletShell>
  );
}
