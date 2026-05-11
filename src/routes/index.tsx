import { createFileRoute } from "@tanstack/react-router";
import { WalletShell } from "@/components/wallet-shell";
import { PortfolioView } from "@/components/portfolio-view";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CryptoNest Wallet — Web3 Crypto Wallet Demo" },
      {
        name: "description",
        content:
          "MetaMask-style Web3 wallet demo: store, send, receive and swap crypto on testnet.",
      },
      { property: "og:title", content: "CryptoNest — Web3 Crypto Wallet Demo" },
      {
        property: "og:description",
        content: "Experience a MetaMask-style Web3 wallet on testnet.",
      },
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
