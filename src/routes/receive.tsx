import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { useState } from "react";
import { WalletShell } from "@/components/wallet-shell";
import { useWalletStore } from "@/store/wallet-store";
import { toast } from "sonner";

export const Route = createFileRoute("/receive")({
  head: () => ({ meta: [{ title: "Receive Crypto — Fox Wallet" }] }),
  component: ReceivePage,
});

function ReceivePage() {
  const { address } = useWalletStore();
  const [copied, setCopied] = useState(false);

  const displayAddress = address || "";

  const copy = () => {
    navigator.clipboard.writeText(displayAddress);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };

  // simple QR placeholder using external image-free SVG pattern
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${displayAddress}`;

  return (
    <WalletShell>
      <div className="p-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="size-4" /> Back
        </Link>
        <h1 className="text-2xl font-bold mb-2">Receive Token</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Share this address to receive ETH or any token on the Sepolia network.
        </p>

        <div className="rounded-2xl border bg-card p-6 flex flex-col items-center shadow-[var(--shadow-card)]">
          <div className="rounded-xl bg-white p-3 border">
            <img src={qrUrl} alt="Wallet QR code" width={240} height={240} className="size-60" />
          </div>
          <p className="mt-5 text-xs text-muted-foreground">Your Wallet Address</p>
          <p className="mt-1 font-mono text-sm break-all text-center px-4">{displayAddress}</p>
          <button
            onClick={copy}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 font-medium text-sm hover:bg-accent transition-colors"
          >
            {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy Address"}
          </button>
        </div>

        <div className="mt-4 rounded-xl bg-accent/50 border border-primary/20 p-3 text-xs text-accent-foreground">
          ⚠️ Only send tokens on the <strong>Sepolia Testnet</strong>. Tokens sent on other networks
          may be lost.
        </div>
      </div>
    </WalletShell>
  );
}
