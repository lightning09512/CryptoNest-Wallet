import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useState } from "react";
import { WalletShell } from "@/components/wallet-shell";
import { ALL_TOKENS } from "@/lib/wallet-data";
import { toast } from "sonner";
import { useWalletStore } from "@/store/wallet-store";
import { sendSepoliaETH } from "@/lib/web3";

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
  const { privateKey, balance } = useWalletStore();
  
  // Mặc định luôn dùng Sepolia ETH cho màn hình Send thực tế của đồ án
  const [token, setToken] = useState({ symbol: "ETH", name: "Sepolia ETH", priceUsd: 3000, balance: parseFloat(balance || "0") });
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [isSending, setIsSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !amount) return toast.error("Vui lòng nhập đủ thông tin");
    if (!privateKey) return toast.error("Lỗi ví: Không tìm thấy Private Key");
    
    if (parseFloat(amount) > parseFloat(balance)) {
      return toast.error("Số dư Sepolia ETH không đủ");
    }

    setIsSending(true);
    const toastId = toast.loading("Đang đẩy giao dịch lên mạng Sepolia...");

    const result = await sendSepoliaETH(privateKey, to, amount);

    setIsSending(false);

    if (result.success) {
      toast.success(
        <div className="flex flex-col gap-1">
          <span>Giao dịch thành công!</span>
          <a 
            href={`https://sepolia.etherscan.io/tx/${result.hash}`} 
            target="_blank" 
            rel="noreferrer"
            className="text-primary text-xs flex items-center gap-1 underline"
          >
            Xem trên Etherscan <ExternalLink className="size-3" />
          </a>
        </div>, 
        { id: toastId, duration: 8000 }
      );
      setTo("");
      setAmount("");
      nav({ to: "/activity" });
    } else {
      toast.error(`Gửi thất bại: ${result.error}`, { id: toastId });
    }
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
            <div className="w-full rounded-xl border bg-card p-3 font-medium flex justify-between items-center opacity-80 cursor-not-allowed">
              <span>{token.name}</span>
              <span className="text-muted-foreground">{token.balance} ETH</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Địa chỉ người nhận (Sepolia)</label>
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="0x..."
              className="w-full rounded-xl border bg-card p-3 font-mono text-sm outline-none focus:border-primary/50"
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
            {isSending ? "Đang xử lý..." : "Xác nhận gửi"}
          </button>
        </form>
      </div>
    </WalletShell>
  );
}
