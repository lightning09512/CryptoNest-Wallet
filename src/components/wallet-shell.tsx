import { Link, useLocation } from "@tanstack/react-router";
import {
  Copy,
  Check,
  Monitor,
  Maximize2,
  Search,
  Home,
  ArrowLeftRight,
  Clock,
  SlidersHorizontal,
  LogOut,
  Key,
} from "lucide-react";
import { useState, useEffect } from "react";
import ghostLogo from "@/assets/ghost-logo.png";
import { toast } from "sonner";
import { useWalletStore } from "@/store/wallet-store";
import { OnboardingView } from "./onboarding-view";
import { LockScreen } from "./lock-screen";

export function WalletShell({
  children,
  headerAction,
  fullWidth = false,
  hideNav = false,
  hideHeader = false,
}: {
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  fullWidth?: boolean;
  hideNav?: boolean;
  hideHeader?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const location = useLocation();
  const { address, mnemonic, privateKey, logout, isUnlocked, username, fetchPrices } =
    useWalletStore();

  useEffect(() => {
    fetchPrices();
    // Also set up an interval to fetch every 60 seconds
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  if (!address) {
    return <OnboardingView />;
  }

  if (!isUnlocked) {
    return <LockScreen />;
  }

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Address copied");
    setTimeout(() => setCopied(false), 1500);
  };

  const showSecret = () => {
    const secret = mnemonic || privateKey;
    const isMnemonic = !!mnemonic;

    toast(
      <div className="flex flex-col gap-2 p-1">
        <strong className="text-destructive font-bold">
          {isMnemonic ? "Seed Phrase" : "Private Key"}
        </strong>
        <p className="font-mono text-xs break-all bg-secondary p-2 rounded-md border border-destructive/20 select-all">
          {secret}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">Never share this with anyone!</p>
      </div>,
      { duration: 15000 },
    );
  };

  const tabs = [
    { to: "/", label: "Home", icon: Home },
    { to: "/swap", label: "Swap", icon: ArrowLeftRight },
    { to: "/activity", label: "Activity", icon: Clock },
    { to: "/explore", label: "Explore", icon: Search },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div
        className={`mx-auto ${fullWidth ? "max-w-none" : "max-w-md"} min-h-screen bg-background flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all duration-500`}
      >
        {/* Header */}
        {!hideHeader && (
          <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
            <button
              onClick={copy}
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity text-left"
            >
              <span className="size-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center overflow-hidden">
                <img src={ghostLogo} alt="" width={28} height={28} className="size-7" />
              </span>
              <div className="leading-tight">
                <div className="text-xs text-muted-foreground font-medium">
                  {username || "Sepolia Wallet"}
                </div>
                <div className="flex items-center gap-1.5 text-sm font-semibold">
                  {truncateAddress(address)}
                  {copied ? (
                    <Check className="size-3 text-success" />
                  ) : (
                    <Copy className="size-3 text-muted-foreground" />
                  )}
                </div>
              </div>
            </button>

            <div className="flex items-center gap-1 text-muted-foreground">
              {headerAction ?? (
                <>
                  <button
                    onClick={showSecret}
                    className="size-9 rounded-full hover:bg-secondary flex items-center justify-center transition-colors text-amber-400"
                    title="View Seed Phrase / Private Key"
                  >
                    <Key className="size-4" />
                  </button>
                  <button
                    onClick={logout}
                    className="size-9 rounded-full hover:bg-secondary flex items-center justify-center transition-colors text-rose-400"
                    title="Log out / Delete wallet"
                  >
                    <LogOut className="size-4" />
                  </button>
                </>
              )}
            </div>
          </header>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">{children}</div>

        {/* Bottom tabs */}
        {!hideNav && (
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
                    <span
                      className={`size-10 rounded-full flex items-center justify-center transition-colors ${
                        active ? "bg-primary/15 text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
