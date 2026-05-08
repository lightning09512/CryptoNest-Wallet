import { createFileRoute } from "@tanstack/react-router";
import { WalletShell } from "@/components/wallet-shell";
import { PortfolioView } from "@/components/portfolio-view";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fox Wallet — Ví crypto Web3 demo" },
      { name: "description", content: "Ví Web3 demo phong cách MetaMask: lưu trữ, gửi, nhận và swap crypto trên testnet." },
      { property: "og:title", content: "Fox Wallet — Ví crypto Web3 demo" },
      { property: "og:description", content: "Trải nghiệm ví Web3 phong cách MetaMask trên testnet." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <WalletShell>
      <PortfolioView />
    </WalletShell>
  );
}
