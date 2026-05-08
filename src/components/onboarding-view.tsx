import { useState } from "react";
import { useWalletStore } from "@/store/wallet-store";
import { toast } from "sonner";
import ghostLogo from "@/assets/ghost-logo.png";

export function OnboardingView() {
  const { createWallet, importWallet } = useWalletStore();
  const [isImporting, setIsImporting] = useState(false);
  const [privateKey, setPrivateKey] = useState("");

  const handleCreate = () => {
    createWallet();
    toast.success("Tạo ví thành công!");
  };

  const handleImport = () => {
    if (!privateKey.trim()) {
      toast.error("Vui lòng nhập Private Key");
      return;
    }
    const success = importWallet(privateKey.trim());
    if (success) {
      toast.success("Nhập ví thành công!");
    } else {
      toast.error("Private Key không hợp lệ");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-white font-sans max-w-md mx-auto">
      <div className="size-24 mb-8 bg-gradient-to-br from-primary/30 to-primary/10 rounded-3xl flex items-center justify-center shadow-lg">
        <img src={ghostLogo} alt="Logo" className="size-16" />
      </div>
      
      <h1 className="text-3xl font-bold mb-3 text-center">CryptoNest</h1>
      <p className="text-muted-foreground text-center mb-10 leading-relaxed">
        Ví Web3 thử nghiệm của bạn. Kết nối với mạng Ethereum Sepolia để bắt đầu giao dịch.
      </p>

      {!isImporting ? (
        <div className="w-full space-y-4">
          <button 
            onClick={handleCreate}
            className="w-full bg-primary text-black font-semibold py-4 rounded-full text-[15px] hover:opacity-90 transition-opacity"
          >
            Tạo Ví Mới
          </button>
          <button 
            onClick={() => setIsImporting(true)}
            className="w-full bg-[#1c1c1e] text-white font-semibold py-4 rounded-full text-[15px] hover:bg-white/[0.06] transition-colors"
          >
            Đã có ví? Nhập Private Key
          </button>
        </div>
      ) : (
        <div className="w-full space-y-4">
          <div className="text-left w-full">
            <label className="text-sm text-slate-400 mb-2 block font-medium">Private Key của bạn</label>
            <input 
              type="text" 
              placeholder="Ví dụ: 0x123abc..."
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              className="w-full bg-[#1a1a1c] border border-white/10 rounded-[16px] px-4 py-4 text-white outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <button 
            onClick={handleImport}
            className="w-full bg-primary text-black font-semibold py-4 rounded-full text-[15px] hover:opacity-90 transition-opacity"
          >
            Khôi phục ví
          </button>
          <button 
            onClick={() => setIsImporting(false)}
            className="w-full bg-transparent text-slate-400 font-semibold py-3 rounded-full text-sm hover:text-white transition-colors"
          >
            Quay lại
          </button>
        </div>
      )}
    </div>
  );
}
