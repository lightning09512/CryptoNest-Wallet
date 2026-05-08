import { Link, useLocation } from "@tanstack/react-router";
import { Copy, Check, Monitor, Maximize2, Search, Home, ArrowLeftRight, Clock, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import ghostLogo from "@/assets/ghost-logo.png";
import { WALLET_ADDRESS } from "@/lib/wallet-data";
import { toast } from "sonner";

export function WalletShell({ children, headerAction }: { children: React.ReactNode; headerAction?: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const location = useLocation();

  const copy = () => {
    navigator.clipboard.writeText(WALLET_ADDRESS);
    setCopied(true);
    toast.success("Đã sao chép địa chỉ");
    setTimeout(() => setCopied(false), 1500);
  };

  const tabs = [
    { to: "/", label: "Trang chủ", icon: Home },
    { to: "/swap", label: "Swap", icon: ArrowLeftRight },
    { to: "/activity", label: "Hoạt động", icon: Clock },
    { to: "/nfts", label: "Khám phá", icon: Search },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3">
          <button
            onClick={copy}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity text-left"
          >
            <span className="size-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center overflow-hidden">
              <img src={ghostLogo} alt="" width={28} height={28} className="size-7" />
            </span>
            <div className="leading-tight">
              <div className="text-xs text-muted-foreground">@lightning095</div>
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                Account 1
                {copied ? <Check className="size-3 text-success" /> : <Copy className="size-3 text-muted-foreground" />}
              </div>
            </div>
          </button>

          <div className="flex items-center gap-1 text-muted-foreground">
            {headerAction ?? (
              <>
                <button className="size-9 rounded-full hover:bg-secondary flex items-center justify-center transition-colors">
                  <Monitor className="size-4" />
                </button>
                <button className="size-9 rounded-full hover:bg-secondary flex items-center justify-center transition-colors">
                  <SlidersHorizontal className="size-4" />
                </button>
                <button className="size-9 rounded-full hover:bg-secondary flex items-center justify-center transition-colors">
                  <Maximize2 className="size-4" />
                </button>
              </>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1">{children}</div>

        {/* Bottom tabs */}
        <nav className="border-t border-border bg-background sticky bottom-0">
          <div className="flex justify-around py-2">
            {tabs.map((t) => {
              const active = location.pathname === t.to;
              const Icon = t.icon;
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className="flex flex-col items-center justify-center px-4 py-2"
                  aria-label={t.label}
                >
                  <span className={`size-10 rounded-full flex items-center justify-center transition-colors ${
                    active ? "bg-primary/15 text-primary" : "text-muted-foreground"
                  }`}>
                    <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
