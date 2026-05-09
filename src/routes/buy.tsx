import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CreditCard } from "lucide-react";
import { WalletShell } from "@/components/wallet-shell";

export const Route = createFileRoute("/buy")({
  head: () => ({ meta: [{ title: "Mua crypto — Fox Wallet" }] }),
  component: BuyPage,
});

function BuyPage() {
  return (
    <WalletShell>
      <div className="p-4">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="size-4" /> Back
        </Link>
        <h1 className="text-2xl font-bold mb-6">Mua crypto</h1>

        <div className="rounded-2xl border bg-gradient-to-br from-accent/40 to-card p-8 text-center">
          <div className="mx-auto size-16 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground shadow-[var(--shadow-soft)]">
            <CreditCard className="size-7" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">Coming Soon</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Fiat on-ramp integration with MoonPay and Transak to buy crypto with credit cards will be available in the next version.
          </p>
        </div>
      </div>
    </WalletShell>
  );
}
