import { createFileRoute } from "@tanstack/react-router";
import { ArrowUp, ArrowDown, ArrowLeftRight, FileCode, Loader2, Clock } from "lucide-react";
import { WalletShell } from "@/components/wallet-shell";
import type { Tx } from "@/lib/wallet-data";
import { useWalletStore } from "@/store/wallet-store";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

export const Route = createFileRoute("/activity")({
  head: () => ({ meta: [{ title: "Activity — CryptoNest" }] }),
  component: ActivityPage,
});

const iconFor = (type: Tx["type"]) => {
  switch (type) {
    case "send":
      return ArrowUp;
    case "receive":
      return ArrowDown;
    case "swap":
      return ArrowLeftRight;
    default:
      return FileCode;
  }
};

const labelFor = (type: Tx["type"]) =>
  ({
    send: "Sent",
    receive: "Received",
    swap: "Swapped",
    contract: "Contract",
  })[type];

function ActivityPage() {
  const { address, localTxs } = useWalletStore();
  const [allTxs, setAllTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;

    let isMounted = true;

    const fetchTxs = async () => {
      try {
        const [normalRes, internalRes] = await Promise.all([
          fetch(
            `https://api.etherscan.io/v2/api?chainid=11155111&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc&apikey=5Z1UAC29DUWV415YFVCA1N4R6UIUP1ASJQ`,
          ),
          fetch(
            `https://api.etherscan.io/v2/api?chainid=11155111&module=account&action=txlistinternal&address=${address}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc&apikey=5Z1UAC29DUWV415YFVCA1N4R6UIUP1ASJQ`,
          ),
        ]);

        const normalData = await normalRes.json();
        const internalData = await internalRes.json();

        if (normalData.status === "0" && normalData.message !== "No transactions found") {
          console.warn("Etherscan API Error:", normalData.result);
        }

        let etherscanTxs: Tx[] = [];

        const processData = (data: { status: string; result?: unknown[] }, isInternal: boolean) => {
          if (data.status === "1" && Array.isArray(data.result)) {
            return data.result.map(
              (tx: {
                hash: string;
                from: string;
                to: string;
                value: string;
                timeStamp: string;
                isError: string;
              }) => ({
                id: tx.hash + (isInternal ? "-int" : ""),
                type: tx.from.toLowerCase() === address.toLowerCase() ? "send" : "receive",
                token: "ETH",
                amount: parseFloat(ethers.formatEther(tx.value)),
                to: tx.to,
                from: tx.from,
                date: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
                status: tx.isError === "0" ? "confirmed" : "failed",
                hash: tx.hash,
              }),
            );
          }
          return [];
        };

        if (isMounted) {
          etherscanTxs = [...processData(normalData, false), ...processData(internalData, true)];

          // Merge localTxs and etherscanTxs, deduplicate by hash
          const combined = [...localTxs, ...etherscanTxs];
          const uniqueTxs = Array.from(new Map(combined.map((item) => [item.hash, item])).values());

          // Sort by date desc
          uniqueTxs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          setAllTxs(uniqueTxs);
        }
      } catch (e) {
        console.error("Failed to fetch txs", e);
        if (isMounted) setAllTxs(localTxs); // fallback to local
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTxs();

    return () => {
      isMounted = false;
    };
  }, [address, localTxs]);

  const groups = allTxs.reduce(
    (acc, tx) => {
      const day = new Date(tx.date).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      (acc[day] ||= []).push(tx);
      return acc;
    },
    {} as Record<string, Tx[]>,
  );

  return (
    <WalletShell>
      <div className="p-4 min-h-[calc(100vh-140px)]">
        <h1 className="text-2xl font-bold mb-4">Activity</h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="size-8 animate-spin mb-4 text-primary" />
            <p>Loading network data...</p>
          </div>
        ) : allTxs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
            <div className="size-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Clock className="size-8 opacity-50" />
            </div>
            <p className="font-medium">No transactions yet</p>
            <p className="text-sm opacity-80 mt-1">Your transactions will appear here.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(groups).map(([day, txs]) => (
              <section key={day}>
                <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 px-1">
                  {day}
                </h2>
                <ul className="rounded-2xl border bg-card divide-y overflow-hidden">
                  {txs.map((tx) => {
                    const Icon = iconFor(tx.type);
                    const positive = tx.type === "receive";
                    return (
                      <li
                        key={tx.id}
                        className="flex items-center gap-3 p-3 hover:bg-secondary/60 transition-colors"
                      >
                        <span
                          className={`size-10 rounded-full flex items-center justify-center shrink-0 ${
                            positive ? "bg-success/15 text-success" : "bg-secondary text-foreground"
                          }`}
                        >
                          <Icon className="size-4" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline gap-2">
                            <span className="font-medium truncate">{labelFor(tx.type)}</span>
                            <span
                              className={`font-semibold tabular-nums text-sm ${positive ? "text-success" : ""}`}
                            >
                              {positive ? "+" : tx.type === "send" ? "-" : ""}
                              {tx.amount.toFixed(4).replace(/\.?0+$/, "")} {tx.token}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <a
                              href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono hover:text-primary transition-colors hover:underline"
                            >
                              {tx.hash.slice(0, 10)}...
                            </a>
                            <span
                              className={
                                tx.status === "pending"
                                  ? "text-primary"
                                  : tx.status === "failed"
                                    ? "text-destructive"
                                    : ""
                              }
                            >
                              {tx.status === "confirmed"
                                ? "Confirmed"
                                : tx.status === "pending"
                                  ? "Pending"
                                  : "Failed"}
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
        )}
      </div>
    </WalletShell>
  );
}
