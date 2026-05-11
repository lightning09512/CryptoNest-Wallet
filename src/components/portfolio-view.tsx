import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Send,
  ArrowLeftRight,
  QrCode,
  DollarSign,
  ArrowRight,
  Sparkles,
  X,
  Image,
} from "lucide-react";
import { TOKENS } from "@/lib/wallet-data";
import { useWalletStore } from "@/store/wallet-store";
import { fetchWalletBalance } from "@/lib/web3";

export function PortfolioView() {
  const [showPromo, setShowPromo] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { address, balance, kcoinBalance, setBalance, prices } = useWalletStore();

  useEffect(() => {
    if (address) {
      setIsRefreshing(true);
      fetchWalletBalance(address).then((bal) => {
        setBalance(bal);
        setIsRefreshing(false);
      });
    }
  }, [address, setBalance]);

  const ethAmount = parseFloat(balance || "0");
  const ethPriceUsd = prices["ETH"]?.priceUsd || 3000; // Fallback to 3000 if not yet loaded
  const kcoinPriceUsd = 36.41; // 1 KCoin = 36.41 USD

  const totalUsd = ethAmount * ethPriceUsd + kcoinBalance * kcoinPriceUsd;

  const ethToken = {
    symbol: "ETH",
    name: "Ethereum",
    balance: ethAmount,
    priceUsd: ethPriceUsd,
    color: "#627EEA",
    icon: "/img/eth.png",
  };

  const kcoinToken = {
    symbol: "KCOIN",
    name: "Khánh Coin",
    balance: kcoinBalance,
    priceUsd: kcoinPriceUsd,
    color: "#E83A65",
    icon: "/img/khanh.jpg",
  };

  // Combine real/local tokens with the mock tokens (ordered by Market Cap, KCoin at the bottom)
  const displayTokens = TOKENS.map((t) => {
    if (t.symbol === "ETH") return ethToken;
    return {
      ...t,
      priceUsd: prices[t.symbol]?.priceUsd || t.priceUsd,
      change24h: prices[t.symbol]?.change24h || t.change24h,
    };
  }).concat([kcoinToken]);

  const actions = [
    { to: "/send-select", label: "Send", icon: Send },
    { to: "/swap", label: "Swap", icon: ArrowLeftRight },
    { to: "/receive", label: "Receive", icon: QrCode },
    { to: "/buy", label: "Buy", icon: DollarSign },
    { to: "/nft", label: "NFT", icon: Image },
  ];

  return (
    <div className="flex flex-col px-4 pb-6">
      {/* Balance hero */}
      <div className="pt-4 pb-6 text-center">
        <h1 className="text-5xl font-semibold tracking-tight tabular-nums flex items-center justify-center gap-2">
          $
          {totalUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h1>
        <div className="text-sm text-slate-400 mt-2">
          {isRefreshing ? "Updating..." : `${balance} ETH`}
        </div>
      </div>

      {/* Welcome banner */}
      <div className="rounded-2xl bg-card p-4 mb-5">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-lg shrink-0">
            👋
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">Welcome to CryptoNest!</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              You can get free testnet ETH from Sepolia Faucet.
            </div>
            <div className="flex gap-2 mt-3">
              <a
                href="https://sepoliafaucet.com/"
                target="_blank"
                rel="noreferrer"
                className="flex-1 rounded-full bg-primary text-black text-xs font-semibold py-2 text-center hover:opacity-90 transition-opacity"
              >
                Get Testnet ETH
              </a>
              <Link
                to="/receive"
                className="flex-1 rounded-full bg-secondary text-foreground text-xs font-semibold py-2 text-center hover:bg-accent transition-colors"
              >
                Receive
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-5 gap-2 mb-5">
        {actions.map((a) => (
          <Link key={a.to} to={a.to} className="flex flex-col items-center gap-1.5 group">
            <span className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors shadow-sm">
              <a.icon className="size-5" strokeWidth={2.5} />
            </span>
            <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {a.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Promo card */}
      {showPromo && (
        <Link
          to="/terminal"
          className="block relative rounded-2xl bg-gradient-to-br from-primary/20 to-card border border-primary/10 p-4 mb-5 overflow-hidden group hover:shadow-lg hover:shadow-primary/5 transition-all"
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowPromo(false);
            }}
            className="absolute top-2 right-2 z-10 size-6 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground"
            aria-label="Dismiss"
          >
            <X className="size-3.5" />
          </button>
          <div className="flex items-center gap-3 pr-6">
            <div className="size-9 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="size-4 text-primary animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold leading-tight group-hover:text-primary transition-colors">
                Meet Phantom Terminal
              </div>
              <div className="text-xs text-muted-foreground">
                Trade Futures with 50x leverage using live data
              </div>
            </div>
            <ArrowRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0" />
          </div>
        </Link>
      )}

      {/* Token list - Always visible on main screen */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Your Assets</h2>
        <ul className="flex flex-col">
          {displayTokens.map((t) => {
            const value = t.balance * t.priceUsd;
            return (
              <li key={t.symbol}>
                <button className="w-full flex items-center gap-3 py-3 hover:bg-secondary/40 -mx-2 px-2 rounded-xl transition-colors text-left">
                  {t.icon ? (
                    <img
                      src={t.icon}
                      alt={t.symbol}
                      className="size-10 rounded-full shrink-0 object-cover bg-white"
                    />
                  ) : (
                    <span
                      className="size-10 rounded-full flex items-center justify-center text-white font-bold text-[11px] shrink-0"
                      style={{ backgroundColor: t.color }}
                    >
                      {t.symbol.slice(0, 3)}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate text-[15px]">{t.name}</div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      $
                      {t.priceUsd.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold tabular-nums text-[15px]">
                      {t.balance.toLocaleString("en-US", { maximumFractionDigits: 4 })} {t.symbol}
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      $
                      {value.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
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
