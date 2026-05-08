import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowDown, ChevronDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { WalletShell } from "@/components/wallet-shell";
import { TOKENS } from "@/lib/wallet-data";
import { toast } from "sonner";

export const Route = createFileRoute("/swap")({
  head: () => ({ meta: [{ title: "Swap — Phantom Wallet" }] }),
  component: SwapPage,
});

const TRENDING = [
  { rank: 1, symbol: "HANTA", name: "Solana", price: 0.00869412, mc: "$8.6M", change: 209.0, color: "oklch(0.7 0.2 295)" },
  { rank: 2, symbol: "HENTAI", name: "Solana", price: 0.00081159, mc: "$811K", change: 201.01, color: "oklch(0.7 0.18 30)" },
  { rank: 3, symbol: "PNUT", name: "Solana", price: 0.42018, mc: "$420M", change: 18.42, color: "oklch(0.65 0.2 80)" },
  { rank: 4, symbol: "WIF", name: "Solana", price: 2.184, mc: "$2.1B", change: 12.04, color: "oklch(0.7 0.15 60)" },
  { rank: 5, symbol: "BONK", name: "Solana", price: 0.0000284, mc: "$1.8B", change: -3.21, color: "oklch(0.75 0.18 50)" },
];

const TABS = ["Tokens", "Perps"] as const;
type Tab = (typeof TABS)[number];

function SwapPage() {
  const nav = useNavigate();
  const [from, setFrom] = useState(TOKENS[0]);
  const [to, setTo] = useState(TOKENS.find((t) => t.symbol === "USDC") ?? TOKENS[1]);
  const [amount, setAmount] = useState("");
  const [tab, setTab] = useState<Tab>("Tokens");

  const out = parseFloat(amount || "0") * (from.priceUsd / (to.priceUsd || 1));

  const switchTokens = () => {
    setFrom(to);
    setTo(from);
  };

  const submit = () => {
    if (!amount) return toast.error("Nhập số lượng");
    toast.success(`Đã swap ${amount} ${from.symbol} → ${out.toFixed(4)} ${to.symbol} (demo)`);
    nav({ to: "/activity" });
  };

  const TokenBox = ({
    token,
    label,
    value,
    onChange,
    readOnly,
    showActions,
  }: {
    token: typeof TOKENS[number];
    label: string;
    value: string;
    onChange?: (v: string) => void;
    readOnly?: boolean;
    showActions?: boolean;
  }) => (
    <div className="rounded-2xl bg-card p-4">
      <div className="text-xs text-muted-foreground mb-2">{label}</div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex items-center gap-2 rounded-full bg-secondary hover:bg-accent transition-colors px-2.5 py-1.5 shrink-0"
        >
          <span
            className="size-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
            style={{ backgroundColor: token.color }}
          >
            {token.symbol.slice(0, 3)}
          </span>
          <span className="font-semibold text-sm">{token.symbol}</span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
        <input
          type="number"
          inputMode="decimal"
          step="any"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          placeholder="0"
          className="flex-1 min-w-0 bg-transparent text-3xl font-semibold outline-none tabular-nums text-right"
        />
      </div>
      {showActions && (
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-muted-foreground tabular-nums">
            ${(parseFloat(value || "0") * token.priceUsd).toFixed(2)}
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => onChange?.((token.balance / 2).toString())}
              className="rounded-full bg-secondary hover:bg-accent text-xs font-semibold px-3 py-1 transition-colors"
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => onChange?.(token.balance.toString())}
              className="rounded-full bg-secondary hover:bg-accent text-xs font-semibold px-3 py-1 transition-colors"
            >
              Max
            </button>
          </div>
        </div>
      )}
    </div>
  );

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
          />

          <div className="flex justify-center my-1.5 relative z-10">
            <button
              type="button"
              onClick={switchTokens}
              aria-label="Switch tokens"
              className="size-9 rounded-full bg-card border-4 border-background flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <ArrowDown className="size-4" />
            </button>
          </div>

          <TokenBox
            token={to}
            label="You Receive"
            value={out ? out.toFixed(6) : ""}
            readOnly
          />
        </div>

        <button
          onClick={submit}
          className="w-full mt-4 rounded-full bg-primary text-primary-foreground font-semibold py-3.5 hover:opacity-90 transition-opacity"
        >
          Switch tokens
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
            {TRENDING.map((t) => (
              <li key={t.symbol}>
                <button className="w-full flex items-center gap-3 py-2.5 -mx-2 px-2 rounded-xl hover:bg-secondary/40 transition-colors text-left">
                  <span className="text-xs text-muted-foreground tabular-nums w-4">{t.rank}</span>
                  <span
                    className="size-10 rounded-full flex items-center justify-center text-white font-bold text-[10px] shrink-0"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.symbol.slice(0, 3)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[15px] truncate">{t.symbol}</div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      ${t.price < 0.01 ? t.price.toFixed(8) : t.price.toFixed(4)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-medium tabular-nums">
                      {t.mc} <span className="text-muted-foreground text-[10px]">MC</span>
                    </div>
                    <div className={`text-xs font-semibold tabular-nums ${t.change >= 0 ? "text-success" : "text-destructive"}`}>
                      {t.change >= 0 ? "+" : ""}
                      {t.change.toFixed(2)}%
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </WalletShell>
  );
}
