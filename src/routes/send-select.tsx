import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ALL_TOKENS } from "@/lib/wallet-data";
import { WalletShell } from "@/components/wallet-shell";

export const Route = createFileRoute("/send-select")({
  head: () => ({ meta: [{ title: "Chọn token — Fox Wallet" }] }),
  component: SendSelectPage,
});

function SendSelectPage() {
  const nav = useNavigate();

  const handleTokenSelect = (token: typeof ALL_TOKENS[0]) => {
    nav({ 
      to: "/send", 
      search: { token: token.symbol }
    });
  };

  return (
    <WalletShell>
      <div className="p-4">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="size-4" /> Quay lại
        </Link>
        <h1 className="text-2xl font-bold mb-6">Chọn token để gửi</h1>

        <div className="space-y-2">
          {ALL_TOKENS.map((token) => {
            const value = token.balance * token.priceUsd;
            return (
              <button
                key={token.symbol}
                onClick={() => handleTokenSelect(token)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent transition-colors text-left"
              >
                <span
                  className="size-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ backgroundColor: token.color }}
                >
                  {token.symbol}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[15px]">{token.name}</div>
                  <div className="text-xs text-muted-foreground tabular-nums">
                    ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold tabular-nums text-[15px]">
                    {token.balance.toLocaleString("en-US", { maximumFractionDigits: 4 })} {token.symbol}
                  </div>
                  <div className="text-xs text-muted-foreground tabular-nums">
                    ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
