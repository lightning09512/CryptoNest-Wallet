import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Send, ArrowLeftRight, QrCode, DollarSign, ArrowRight, Sparkles, X } from "lucide-react";
import { TOKENS, totalBalanceUsd } from "@/lib/wallet-data";

export function PortfolioView() {
  const total = totalBalanceUsd();
  const [showPromo, setShowPromo] = useState(true);

  const actions = [
    { to: "/send-select", label: "Send", icon: Send },
    { to: "/swap", label: "Swap", icon: ArrowLeftRight },
    { to: "/receive", label: "Receive", icon: QrCode },
    { to: "/buy", label: "Buy", icon: DollarSign },
  ];

  return (
    <div className="flex flex-col px-4 pb-6">
      {/* Balance hero */}
      <div className="pt-4 pb-6 text-center">
        <h1 className="text-5xl font-semibold tracking-tight tabular-nums">
          ${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h1>
      </div>

      {/* Welcome banner */}
      <div className="rounded-2xl bg-card p-4 mb-5">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-lg shrink-0">
            👋
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">Welcome, @lightning095</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Add Solana (SOL) to your wallet to get started
            </div>
            <div className="flex gap-2 mt-3">
              <Link to="/buy" className="flex-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold py-2 text-center hover:opacity-90 transition-opacity">
                Buy SOL with cash
              </Link>
              <Link to="/receive" className="flex-1 rounded-full bg-secondary text-foreground text-xs font-semibold py-2 text-center hover:bg-accent transition-colors">
                Transfer crypto
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {actions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="flex flex-col items-center gap-1.5 group"
          >
            <span className="size-12 rounded-full bg-card flex items-center justify-center text-primary group-hover:bg-accent transition-colors">
              <a.icon className="size-[18px]" />
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Promo card */}
      {showPromo && (
        <div className="relative rounded-2xl bg-gradient-to-br from-accent to-card p-4 mb-5 overflow-hidden">
          <button
            onClick={() => setShowPromo(false)}
            className="absolute top-2 right-2 size-6 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground"
            aria-label="Dismiss"
          >
            <X className="size-3.5" />
          </button>
          <div className="flex items-center gap-3 pr-6">
            <div className="size-9 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="size-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold leading-tight">Meet Phantom Terminal</div>
              <div className="text-xs text-muted-foreground">your new home for desktop trading</div>
            </div>
            <ArrowRight className="size-4 text-muted-foreground shrink-0" />
          </div>
        </div>
      )}

      {/* Token list - Always visible on main screen */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Your Assets</h2>
        <ul className="flex flex-col">
          {TOKENS.map((t) => {
            const value = t.balance * t.priceUsd;
            return (
              <li key={t.symbol}>
                <button className="w-full flex items-center gap-3 py-3 hover:bg-secondary/40 -mx-2 px-2 rounded-xl transition-colors text-left">
                  <span
                    className="size-10 rounded-full flex items-center justify-center text-white font-bold text-[11px] shrink-0"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.symbol}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate text-[15px]">{t.name}</div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold tabular-nums text-[15px]">
                      {t.balance.toLocaleString("en-US", { maximumFractionDigits: 4 })} {t.symbol}
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

          </div>
  );
}
