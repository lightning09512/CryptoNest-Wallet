import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { useState } from "react";
import { WalletShell } from "@/components/wallet-shell";
import { useWalletStore } from "@/store/wallet-store";
import { toast } from "sonner";

export const Route = createFileRoute("/receive")({
  head: () => ({ meta: [{ title: "Nhận crypto — Fox Wallet" }] }),
  component: ReceivePage,
});

function ReceivePage() {
  const { address } = useWalletStore();
  const [copied, setCopied] = useState(false);
  
  const displayAddress = address || "";

  const copy = () => {
    navigator.clipboard.writeText(displayAddress);
    setCopied(true);
    toast.success("Đã sao chép");
    setTimeout(() => setCopied(false), 1500);
  };

  // simple QR placeholder using external image-free SVG pattern
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${displayAddress}`;

  return (
    <WalletShell>
      <div className="p-4">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="size-4" /> Quay lại
        </Link>
        <h1 className="text-2xl font-bold mb-2">Nhận token</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Chia sẻ địa chỉ này để nhận ETH hoặc bất kỳ token nào trên mạng Sepolia.
        </p>

        <div className="rounded-2xl border bg-card p-6 flex flex-col items-center shadow-[var(--shadow-card)]">
          <div className="rounded-xl bg-white p-3 border">
            <img src={qrUrl} alt="Wallet QR code" width={240} height={240} className="size-60" />
          </div>
          <p className="mt-5 text-xs text-muted-foreground">Địa chỉ ví của bạn</p>
          <p className="mt-1 font-mono text-sm break-all text-center px-4">{displayAddress}</p>
          <button
            onClick={copy}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 font-medium text-sm hover:bg-accent transition-colors"
          >
            {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
            {copied ? "Đã sao chép" : "Sao chép địa chỉ"}
          </button>
        </div>

        <div className="mt-4 rounded-xl bg-accent/50 border border-primary/20 p-3 text-xs text-accent-foreground">
          ⚠️ Chỉ gửi token trên mạng <strong>Sepolia Testnet</strong>. Gửi token sai mạng có thể bị mất.
        </div>
      </div>
    </WalletShell>
  );
}
