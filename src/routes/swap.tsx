import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowDown, ChevronDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { WalletShell } from "@/components/wallet-shell";
import { toast } from "sonner";
import { useWalletStore } from "@/store/wallet-store";
import { sendSepoliaETH } from "@/lib/web3";

export const Route = createFileRoute("/swap")({
  head: () => ({ meta: [{ title: "Swap — Phantom Wallet" }] }),
  component: SwapPage,
});

const TRENDING = [
  { rank: 1, symbol: "SOL", name: "Solana", price: 168.42, mc: "$76.8B", change: 2.0, color: "oklch(0.7 0.2 295)", icon: "/img/solana.png" },
  { rank: 2, symbol: "BNB", name: "Binance Coin", price: 612.45, mc: "$89.5B", change: 1.5, color: "oklch(0.65 0.15 45)", icon: "/img/bnb.png" },
  { rank: 3, symbol: "DOGE", name: "Dogecoin", price: 0.16, mc: "$23.1B", change: 5.4, color: "oklch(0.7 0.15 35)", icon: "/img/doge.png" },
  { rank: 4, symbol: "XRP", name: "Ripple", price: 0.52, mc: "$28.4B", change: -0.8, color: "oklch(0.6 0.2 340)", icon: "/img/xrp.png" },
  { rank: 5, symbol: "ETH", name: "Ethereum", price: 3420.55, mc: "$411B", change: 1.2, color: "oklch(0.55 0.18 270)", icon: "/img/eth.png" },
];

const TABS = ["Tokens", "Perps"] as const;
type Tab = (typeof TABS)[number];

function SwapPage() {
  const nav = useNavigate();
  const { balance, kcoinBalance, privateKey, addKCoin, addTx } = useWalletStore();
  
  const ethAmount = parseFloat(balance || "0");
  const LOCAL_TOKENS = [
    { symbol: "ETH", name: "Ethereum (Sepolia)", balance: ethAmount, priceUsd: 3000, color: "#627EEA" },
    { symbol: "KCOIN", name: "Khánh Coin", balance: kcoinBalance, priceUsd: 1.0, color: "#E83A65" },
  ];

  const [from, setFrom] = useState(LOCAL_TOKENS[0]);
  const [to, setTo] = useState(LOCAL_TOKENS[1]);
  const [amount, setAmount] = useState("");
  const [tab, setTab] = useState<Tab>("Tokens");
  const [isSwapping, setIsSwapping] = useState(false);

  const out = parseFloat(amount || "0") * (from.priceUsd / (to.priceUsd || 1));

  const switchTokens = () => {
    toast.error("Phiên bản Demo chỉ hỗ trợ Swap 1 chiều: ETH -> KCoin");
  };

  const submit = async () => {
    if (!amount || parseFloat(amount) <= 0) return toast.error("Nhập số lượng hợp lệ");
    if (from.symbol !== "ETH" || to.symbol !== "KCOIN") {
      return toast.error("Chỉ hỗ trợ swap từ ETH sang KCoin");
    }
    if (parseFloat(amount) > ethAmount) {
      return toast.error("Số dư ETH không đủ");
    }
    if (!privateKey) {
      return toast.error("Lỗi ví: Không tìm thấy Private Key");
    }

    setIsSwapping(true);
    const toastId = toast.loading("Đang đẩy giao dịch lên mạng Sepolia...");

    // Gửi ETH vào burn address để giả lập việc Swap mất ETH
    const BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD";
    const result = await sendSepoliaETH(privateKey, BURN_ADDRESS, amount);

    setIsSwapping(false);

    if (result.success) {
      addKCoin(out); // Cộng KCoin cục bộ
      
      // Log local transaction
      addTx({
        id: `swap-${Date.now()}`,
        type: "swap",
        token: "ETH→KCOIN",
        amount: parseFloat(amount),
        to: "Burn Address",
        from: "Ví của bạn",
        date: new Date().toISOString(),
        status: "confirmed",
        hash: result.hash || `0x${Math.random().toString(16).slice(2, 10)}...`,
      });

      toast.success(`Đã Swap thành công! Nhận được ${out.toFixed(2)} KCoin`, { id: toastId });
      setAmount("");
      nav({ to: "/" });
    } else {
      toast.error(`Swap thất bại: ${result.error}`, { id: toastId });
    }
  };

  const TokenBox = ({
    token,
    label,
    value,
    onChange,
    readOnly,
    showActions,
  }: {
    token: { symbol: string, color: string, balance: number, priceUsd: number };
    label: string;
    value: string;
    onChange?: (v: string) => void;
    readOnly?: boolean;
    showActions?: boolean;
  }) => (
    <div className="rounded-2xl bg-card p-4">
      <div className="text-xs text-muted-foreground mb-2">{label}</div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex items-center gap-2 rounded-full bg-secondary hover:bg-accent transition-colors px-2.5 py-1.5 shrink-0"
        >
          <span
            className="size-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
            style={{ backgroundColor: token.color }}
          >
            {token.symbol.slice(0, 3)}
          </span>
          <span className="font-semibold text-sm">{token.symbol}</span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
        <input
          type="number"
          inputMode="decimal"
          step="any"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          placeholder="0"
          className="flex-1 min-w-0 bg-transparent text-3xl font-semibold outline-none tabular-nums text-right"
        />
      </div>
      {showActions && (
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-muted-foreground tabular-nums">
            ${(parseFloat(value || "0") * token.priceUsd).toFixed(2)}
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => onChange?.((token.balance / 2).toString())}
              className="rounded-full bg-secondary hover:bg-accent text-xs font-semibold px-3 py-1 transition-colors"
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => onChange?.(token.balance.toString())}
              className="rounded-full bg-secondary hover:bg-accent text-xs font-semibold px-3 py-1 transition-colors"
            >
              Max
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <WalletShell>
      <div className="px-4 pt-2 pb-6">
        {/* Swap card */}
        <div className="relative">
          <TokenBox
            token={from}
            label="You Pay"
            value={amount}
            onChange={setAmount}
            showActions
          />

          <div className="flex justify-center my-1.5 relative z-10">
            <button
              type="button"
              onClick={switchTokens}
              aria-label="Switch tokens"
              className="size-9 rounded-full bg-card border-4 border-background flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <ArrowDown className="size-4" />
            </button>
          </div>

          <TokenBox
            token={to}
            label="You Receive"
            value={out ? out.toFixed(6) : ""}
            readOnly
          />
        </div>

        <button
          onClick={submit}
          disabled={isSwapping}
          className={`w-full mt-4 rounded-full bg-primary text-black font-semibold py-3.5 transition-opacity ${isSwapping ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`}
        >
          {isSwapping ? "Đang xử lý giao dịch..." : "Hoán đổi (Swap)"}
        </button>

        {/* Trending */}
        <div className="mt-7">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-5">
              {TABS.map((t) => {
                const active = t === tab;
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`text-base font-semibold transition-colors ${
                      active ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <button className="text-xs font-semibold text-muted-foreground hover:text-foreground">
              See More
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground px-1 mb-1">
            <div className="flex items-center gap-1">
              <TrendingUp className="size-3" />
              <span>Rank · Solana</span>
            </div>
            <span>24h</span>
          </div>

          <ul className="flex flex-col">
            {TRENDING.map((t) => (
              <li key={t.symbol}>
                <button className="w-full flex items-center gap-3 py-2.5 -mx-2 px-2 rounded-xl hover:bg-secondary/40 transition-colors text-left">
                  <span className="text-xs text-muted-foreground tabular-nums w-4">{t.rank}</span>
                  {t.icon ? (
                    <img src={t.icon} alt={t.symbol} className="size-10 rounded-full shrink-0 object-cover bg-white" />
                  ) : (
                    <span
                      className="size-10 rounded-full flex items-center justify-center text-white font-bold text-[10px] shrink-0"
                      style={{ backgroundColor: t.color }}
                    >
                      {t.symbol.slice(0, 3)}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[15px] truncate">{t.symbol}</div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      ${t.price < 0.01 ? t.price.toFixed(8) : t.price.toFixed(4)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-medium tabular-nums">
                      {t.mc} <span className="text-muted-foreground text-[10px]">MC</span>
                    </div>
                    <div className={`text-xs font-semibold tabular-nums ${t.change >= 0 ? "text-success" : "text-destructive"}`}>
                      {t.change >= 0 ? "+" : ""}
                      {t.change.toFixed(2)}%
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </WalletShell>
  );
}
