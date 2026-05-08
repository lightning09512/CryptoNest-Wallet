import { createFileRoute } from "@tanstack/react-router";
import { ArrowUp, ArrowDown, ArrowLeftRight, FileCode } from "lucide-react";
import { WalletShell } from "@/components/wallet-shell";
import { TXS, type Tx } from "@/lib/wallet-data";

export const Route = createFileRoute("/activity")({
  head: () => ({ meta: [{ title: "Hoạt động — Fox Wallet" }] }),
  component: ActivityPage,
});

const iconFor = (type: Tx["type"]) => {
  switch (type) {
    case "send": return ArrowUp;
    case "receive": return ArrowDown;
    case "swap": return ArrowLeftRight;
    default: return FileCode;
  }
};

const labelFor = (type: Tx["type"]) => ({
  send: "Đã gửi", receive: "Đã nhận", swap: "Swap", contract: "Hợp đồng",
}[type]);

function ActivityPage() {
  const groups = TXS.reduce((acc, tx) => {
    const day = new Date(tx.date).toLocaleDateString("vi-VN", { day: "numeric", month: "long" });
    (acc[day] ||= []).push(tx);
    return acc;
  }, {} as Record<string, Tx[]>);

  return (
    <WalletShell>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Hoạt động</h1>
        <div className="space-y-5">
          {Object.entries(groups).map(([day, txs]) => (
            <section key={day}>
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 px-1">{day}</h2>
              <ul className="rounded-2xl border bg-card divide-y overflow-hidden">
                {txs.map((tx) => {
                  const Icon = iconFor(tx.type);
                  const positive = tx.type === "receive";
                  return (
                    <li key={tx.id} className="flex items-center gap-3 p-3 hover:bg-secondary/60 transition-colors">
                      <span className={`size-10 rounded-full flex items-center justify-center shrink-0 ${
                        positive ? "bg-success/15 text-success" : "bg-secondary text-foreground"
                      }`}>
                        <Icon className="size-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline gap-2">
                          <span className="font-medium truncate">{labelFor(tx.type)}</span>
                          <span className={`font-semibold tabular-nums text-sm ${positive ? "text-success" : ""}`}>
                            {positive ? "+" : tx.type === "send" ? "-" : ""}{tx.amount} {tx.token}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span className="font-mono">{tx.hash}</span>
                          <span className={tx.status === "pending" ? "text-primary" : tx.status === "failed" ? "text-destructive" : ""}>
                            {tx.status === "confirmed" ? "Đã xác nhận" : tx.status === "pending" ? "Đang chờ" : "Thất bại"}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </WalletShell>
  );
}
