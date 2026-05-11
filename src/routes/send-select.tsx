import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { WalletShell } from "@/components/wallet-shell";
import { useWalletStore } from "@/store/wallet-store";
import { TOKENS } from "@/lib/wallet-data";

export const Route = createFileRoute("/send-select")({
  head: () => ({ meta: [{ title: "Select Token — CryptoNest" }] }),
  component: SendSelectPage,
});

function SendSelectPage() {
  const nav = useNavigate();
  const { balance, kcoinBalance, prices } = useWalletStore();

  const ethAmount = parseFloat(balance || "0");
  const ethPriceUsd = prices["ETH"]?.priceUsd || 3420.55;
  const kcoinPriceUsd = 36.41;

  const ethToken = {
    symbol: "ETH",
    name: "Sepolia ETH",
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

  // Logic gộp y hệt trang chủ
  const displayTokens = TOKENS.map((t) => {
    if (t.symbol === "ETH") return ethToken;
    return {
      ...t,
      priceUsd: prices[t.symbol]?.priceUsd || t.priceUsd,
    };
  }).concat([kcoinToken]);

  const handleTokenSelect = (tokenSymbol: string) => {
    nav({
      to: "/send",
      search: { token: tokenSymbol },
    });
  };

  return (
    <WalletShell>
      <div className="p-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="size-4" /> Back
        </Link>
        <h1 className="text-2xl font-bold mb-6">Select Asset to Send</h1>

        <div className="space-y-2">
          {displayTokens.map((token) => {
            const value = token.balance * token.priceUsd;
            return (
              <button
                key={token.symbol}
                onClick={() => handleTokenSelect(token.symbol)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-secondary/40 transition-colors text-left"
              >
                {token.icon ? (
                  <img
                    src={token.icon}
                    alt={token.symbol}
                    className="size-12 rounded-full shrink-0 object-cover bg-white"
                  />
                ) : (
                  <span
                    className="size-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: token.color }}
                  >
                    {token.symbol.slice(0, 3)}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[15px]">{token.name}</div>
                  <div className="text-xs text-muted-foreground tabular-nums">
                    $
                    {token.priceUsd.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold tabular-nums text-[15px]">
                    {token.balance.toLocaleString("en-US", { maximumFractionDigits: 4 })}{" "}
                    {token.symbol}
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
            );
          })}
        </div>
      </div>
    </WalletShell>
  );
}
