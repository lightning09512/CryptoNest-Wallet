import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { WalletShell } from "@/components/wallet-shell";
import { ALL_TOKENS } from "@/lib/wallet-data";
import { toast } from "sonner";

export const Route = createFileRoute("/send")({
  head: () => ({ meta: [{ title: "Gửi crypto — Fox Wallet" }] }),
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
  const [token, setToken] = useState(selectedToken ? ALL_TOKENS.find(t => t.symbol === selectedToken) || ALL_TOKENS[0] : ALL_TOKENS[0]);
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !amount) return toast.error("Vui lòng nhập đủ thông tin");
    toast.success(`Đã gửi ${amount} ${token.symbol} (demo)`);
    nav({ to: "/activity" });
  };

  const usd = parseFloat(amount || "0") * token.priceUsd;

  return (
    <WalletShell>
      <div className="p-4">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="size-4" /> Quay lại
        </Link>
        <h1 className="text-2xl font-bold mb-6">Gửi token</h1>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Tài sản</label>
            <select
              value={token.symbol}
              onChange={(e) => setToken(ALL_TOKENS.find((t) => t.symbol === e.target.value)!)}
              className="w-full rounded-xl border bg-card p-3 font-medium"
            >
              {ALL_TOKENS.map((t) => (
                <option key={t.symbol} value={t.symbol}>
                  {t.name} ({t.balance.toFixed(4)} {t.symbol})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Địa chỉ người nhận</label>
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="0x..."
              className="w-full rounded-xl border bg-card p-3 font-mono text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Số lượng</label>
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-baseline gap-2">
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-3xl font-bold outline-none tabular-nums w-full"
                />
                <span className="font-semibold text-muted-foreground">{token.symbol}</span>
              </div>
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>≈ ${usd.toFixed(2)}</span>
                <button type="button" onClick={() => setAmount(String(token.balance))} className="font-medium text-primary">
                  Max: {token.balance}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-secondary p-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phí mạng (ước tính)</span>
              <span className="tabular-nums">~$0.42</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Tổng</span>
              <span className="tabular-nums">${(usd + 0.42).toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-semibold py-3.5 shadow-[var(--shadow-soft)] hover:opacity-95 transition-opacity"
          >
            Xác nhận gửi
          </button>
        </form>
      </div>
    </WalletShell>
  );
}
