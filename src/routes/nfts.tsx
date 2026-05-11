import { createFileRoute } from "@tanstack/react-router";
import { ImageIcon } from "lucide-react";
import { WalletShell } from "@/components/wallet-shell";

export const Route = createFileRoute("/nfts")({
  head: () => ({ meta: [{ title: "NFTs — CryptoNest Wallet" }] }),
  component: NftsPage,
});

const NFTS = [
  { name: "Pixel Fox #042", collection: "Foxtopia", color: "oklch(0.7 0.18 45)" },
  { name: "Cosmic Ape #1187", collection: "Cosmic Apes", color: "oklch(0.6 0.18 280)" },
  { name: "Crypto Punk #9921", collection: "Punks Lite", color: "oklch(0.65 0.15 180)" },
  { name: "Neon Cat #018", collection: "Neon Pets", color: "oklch(0.7 0.2 340)" },
];

function NftsPage() {
  return (
    <WalletShell>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">NFT Collection</h1>
        <div className="grid grid-cols-2 gap-3">
          {NFTS.map((n) => (
            <div
              key={n.name}
              className="rounded-2xl border bg-card overflow-hidden hover:shadow-[var(--shadow-soft)] transition-shadow cursor-pointer"
            >
              <div
                className="aspect-square flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${n.color}, oklch(0.95 0.02 70))` }}
              >
                <ImageIcon className="size-10 text-white/80" />
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm truncate">{n.name}</p>
                <p className="text-xs text-muted-foreground truncate">{n.collection}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WalletShell>
  );
}
