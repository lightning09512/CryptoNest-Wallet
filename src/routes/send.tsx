import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useState, useMemo } from "react";
import { WalletShell } from "@/components/wallet-shell";
import { ALL_TOKENS } from "@/lib/wallet-data";
import { toast } from "sonner";
import { useWalletStore } from "@/store/wallet-store";
import { sendSepoliaETH } from "@/lib/web3";

export const Route = createFileRoute("/send")({
  head: () => ({ meta: [{ title: "Send Crypto — CryptoNest" }] }),
  component: SendPage,
  validateSearch: (search: Record<string, string>) => {
    return {
      token: search.token as string || undefined,
    };
  },
});

function SendPage() {
  const { token: selectedToken } = Route.useSearch();
  const nav = useNavigate();
  const { privateKey, balance, kcoinBalance, subtractKCoin, addTx, prices } = useWalletStore();
  
  const token = useMemo(() => {
    if (selectedToken === "KCOIN") {
      return { symbol: "KCOIN", name: "Khánh Coin", balance: kcoinBalance, priceUsd: 36.41 };
    }
    if (!selectedToken || selectedToken === "ETH") {
      return { symbol: "ETH", name: "Sepolia ETH", balance: parseFloat(balance || "0"), priceUsd: prices.ETH?.priceUsd || 3420.55 };
    }
    const found = ALL_TOKENS.find(t => t.symbol === selectedToken);
    if (found) {
      return { ...found, priceUsd: prices[found.symbol]?.priceUsd || found.priceUsd };
    }
    return { symbol: "???", name: "Unknown Token", balance: 0, priceUsd: 0 };
  }, [selectedToken, balance, kcoinBalance, prices]);

  const isRealETH = token.symbol === "ETH";

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [isSending, setIsSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !amount) return toast.error("Please fill in all fields");
    
    const amountFloat = parseFloat(amount);
    if (amountFloat > token.balance) {
      return toast.error(`Insufficient ${token.name} balance`);
    }

    setIsSending(true);
    const toastId = toast.loading(`Processing ${token.symbol} transfer...`);

    if (!isRealETH) {
      // Mock transfer for KCOIN and other virtual tokens
      setTimeout(() => {
        if (token.symbol === "KCOIN") {
          subtractKCoin(amountFloat);
        }
        addTx({
          id: `send-${Date.now()}`,
          type: "send",
          token: token.symbol,
          amount: amountFloat,
          to: to,
          from: "Your Wallet",
          date: new Date().toISOString(),
          status: "confirmed",
          hash: `0x${Math.random().toString(16).slice(2, 10)}...`,
        });
        setIsSending(false);
        toast.success(`${amountFloat} ${token.symbol} sent successfully!`, { id: toastId });
        nav({ to: "/activity" });
      }, 1500);
    } else {
      // Real transfer for Sepolia ETH
      if (!privateKey) {
        setIsSending(false);
        return toast.error("Wallet error: Private Key not found", { id: toastId });
      }

      const result = await sendSepoliaETH(privateKey, to, amount);
      setIsSending(false);

      if (result.success) {
        // Log local transaction
        addTx({
          id: `send-${Date.now()}`,
          type: "send",
          token: "ETH",
          amount: amountFloat,
          to: to,
          from: "Your Wallet",
          date: new Date().toISOString(),
          status: "confirmed",
          hash: result.hash || `0x${Math.random().toString(16).slice(2, 10)}...`,
        });

        toast.success(
          <div className="flex flex-col gap-1">
            <span>Transaction successful!</span>
            <a 
              href={`https://sepolia.etherscan.io/tx/${result.hash}`} 
              target="_blank" 
              rel="noreferrer"
              className="text-primary text-xs flex items-center gap-1 underline"
            >
              View on Etherscan <ExternalLink className="size-3" />
            </a>
          </div>, 
          { id: toastId, duration: 8000 }
        );
        nav({ to: "/activity" });
      } else {
        toast.error(`Send failed: ${result.error}`, { id: toastId });
      }
    }
  };

  const usd = parseFloat(amount || "0") * token.priceUsd;

  return (
    <WalletShell>
      <div className="p-4">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="size-4" /> Back
        </Link>
        <h1 className="text-2xl font-bold mb-6">Send Token</h1>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Asset</label>
            <div className="w-full rounded-xl border bg-card p-3 font-medium flex justify-between items-center opacity-80 cursor-not-allowed">
              <span>{token.name}</span>
              <span className="text-muted-foreground">{token.balance} ETH</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Recipient Address (Sepolia)</label>
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="0x..."
              className="w-full rounded-xl border bg-card p-3 font-mono text-sm outline-none focus:border-primary/50"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Amount</label>
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-baseline gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/,/g, ".");
                    if (val === "" || /^\d*\.?\d*$/.test(val)) {
                      setAmount(val);
                    }
                  }}
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-3xl font-bold outline-none tabular-nums w-full no-spinner"
                />
                <span className="font-semibold text-muted-foreground">{token.symbol}</span>
              </div>
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>≈ ${usd.toFixed(2)}</span>
                <button type="button" onClick={() => setAmount(String(token.balance))} className="font-medium text-primary hover:underline">
                  Max: {token.balance}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSending}
            className={`w-full rounded-full bg-gradient-to-r from-primary to-primary-glow text-black font-semibold py-3.5 shadow-[var(--shadow-soft)] transition-opacity ${isSending ? "opacity-50 cursor-not-allowed" : "hover:opacity-95"}`}
          >
            {isSending ? "Processing..." : "Confirm Send"}
          </button>
        </form>
      </div>
    </WalletShell>
  );
}
