import { useState, useRef, useEffect } from "react";
import { useWalletStore } from "@/store/wallet-store";
import { toast } from "sonner";
import ghostLogo from "@/assets/ghost-logo.png";
import { Lock, LogOut } from "lucide-react";

export function LockScreen() {
  const { unlockWallet, username, logout } = useWalletStore();
  const [pin, setPin] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 4) {
      setPin(val);
      if (val.length === 4) {
        // Auto submit when 4 digits are entered
        const success = unlockWallet(val);
        if (!success) {
          toast.error("Incorrect PIN!");
          setPin(""); // reset
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-white font-sans max-w-md mx-auto">
      <div className="w-full flex justify-end mb-8">
        <button
          onClick={() => {
            if (
              window.confirm(
                "Are you sure you want to reset your wallet? You will need your Secret Recovery Phrase to restore access.",
              )
            ) {
              logout();
            }
          }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-rose-400 transition-colors"
        >
          <LogOut className="size-4" /> Forgot PIN? Reset wallet
        </button>
      </div>

      <div className="size-24 mb-6 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full flex items-center justify-center shadow-lg relative">
        <img src={ghostLogo} alt="Logo" className="size-16" />
        <div className="absolute -bottom-2 -right-2 bg-[#1c1c1e] rounded-full p-2 border-2 border-background">
          <Lock className="size-4 text-primary" />
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-2 text-center">Welcome back!</h1>
      <p className="text-muted-foreground text-center mb-10 text-sm">
        {username ? username : "Enter PIN to unlock your wallet"}
      </p>

      <div className="w-full max-w-[240px] mx-auto">
        {/* Hidden actual input */}
        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          value={pin}
          onChange={handlePinChange}
          className="opacity-0 absolute -left-[9999px]"
          autoFocus
        />

        {/* Visual Dots */}
        <div
          className="flex justify-center gap-4 mb-8 cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`size-4 rounded-full transition-all duration-200 ${
                pin.length > index
                  ? "bg-primary scale-110 shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
