import { useState, useRef } from "react";
import { useWalletStore } from "@/store/wallet-store";
import { toast } from "sonner";
import ghostLogo from "@/assets/ghost-logo.png";
import { ArrowLeft, HelpCircle } from "lucide-react";

export function OnboardingView() {
  const { createWallet, importWallet } = useWalletStore();
  const [isImporting, setIsImporting] = useState(false);
  const [words, setWords] = useState<string[]>(Array(12).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleCreate = () => {
    createWallet();
    toast.success("Tạo ví thành công!");
  };

  const handleImport = () => {
    const phrase = words.join(" ").trim();
    if (words.some(w => !w.trim())) {
      toast.error("Vui lòng điền đủ 12 từ khôi phục");
      return;
    }
    const success = importWallet(phrase);
    if (success) {
      toast.success("Nhập ví thành công!");
    } else {
      toast.error("Cụm từ khôi phục không hợp lệ");
    }
  };

  const handleWordChange = (index: number, value: string) => {
    // Nếu có dấu cách trong lúc gõ từng chữ, bỏ qua vì handleKeyDown sẽ xử lý
    if (value.includes(" ")) return;
    const newWords = [...words];
    newWords[index] = value;
    setWords(newWords);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault(); // Ngăn việc gõ dấu cách vào ô
      if (index < 11) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (e.key === "Backspace" && !words[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").trim();
    const pastedWords = pastedText.split(/\s+/);
    
    if (pastedWords.length > 1) {
      const newWords = [...words];
      for (let i = 0; i < pastedWords.length && index + i < 12; i++) {
        newWords[index + i] = pastedWords[i];
      }
      setWords(newWords);
      // Tự động focus vào ô trống tiếp theo hoặc ô cuối cùng
      const nextEmptyIndex = newWords.findIndex(w => !w);
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[11]?.focus();
      }
    } else {
      handleWordChange(index, pastedWords[0]);
    }
  };

  if (isImporting) {
    const allFilled = words.every(w => w.trim().length > 0);
    
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center p-6 text-white font-sans w-full max-w-md mx-auto relative">
        <header className="w-full flex items-center justify-between mb-8 relative z-50">
          <button onClick={() => setIsImporting(false)} className="text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft className="size-6" />
          </button>
          <div className="flex gap-2">
            <div className="size-2 rounded-full bg-primary"></div>
            <div className="size-2 rounded-full bg-white/20"></div>
            <div className="size-2 rounded-full bg-white/20"></div>
            <div className="size-2 rounded-full bg-white/20"></div>
          </div>
          <div className="relative group">
            <button className="text-muted-foreground hover:text-white transition-colors cursor-help">
              <HelpCircle className="size-6" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-64 bg-[#252528] border border-white/10 rounded-xl p-4 shadow-2xl z-50 text-left opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <h3 className="font-semibold text-sm mb-2 text-white">Hướng dẫn nhập ví</h3>
              <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4">
                <li>Cụm từ khôi phục gồm 12 từ tiếng Anh ngăn cách bằng dấu cách.</li>
                <li>Bạn có thể copy và <strong>Paste (Dán)</strong> cả cụm 12 từ vào ô số 1 để điền nhanh.</li>
                <li>Nếu bạn chỉ có Private Key, hãy dán toàn bộ chuỗi 64 ký tự vào ô số 1.</li>
              </ul>
            </div>
          </div>
        </header>

        <h1 className="text-3xl font-bold mb-4 text-center">Cụm từ khôi phục</h1>
        <p className="text-muted-foreground text-center mb-8 px-4 text-base">
          Nhập một ví hiện tại với cụm từ khôi phục gồm 12 ký tự của bạn.
        </p>

        <div className="grid grid-cols-3 gap-3 w-full mb-8">
          {words.map((word, index) => (
            <div key={index} className="relative flex items-center">
              <span className="absolute left-3 text-muted-foreground text-sm">{index + 1}.</span>
              <input
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                value={word}
                onChange={(e) => handleWordChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={(e) => handlePaste(e, index)}
                className="w-full bg-[#1c1c1e] border border-white/5 rounded-lg py-3.5 pl-8 pr-2 text-sm text-white outline-none focus:border-primary/50 focus:bg-[#252528] transition-colors"
                autoComplete="off"
                spellCheck="false"
              />
            </div>
          ))}
        </div>

        <button 
          onClick={handleImport}
          disabled={!allFilled}
          className={`w-full font-bold py-4 rounded-full mt-8 transition-colors ${
            allFilled ? "bg-primary text-black hover:bg-primary/90" : "bg-[#1c1c1e] text-muted-foreground cursor-not-allowed"
          }`}
        >
          Nhập Ví
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-white font-sans max-w-md mx-auto">
      <div className="size-24 mb-8 bg-gradient-to-br from-primary/30 to-primary/10 rounded-3xl flex items-center justify-center shadow-lg">
        <img src={ghostLogo} alt="Logo" className="size-16" />
      </div>
      
      <h1 className="text-3xl font-bold mb-3 text-center">CryptoNest</h1>
      <p className="text-muted-foreground text-center mb-10 leading-relaxed">
        Ví Web3 thử nghiệm của bạn. Kết nối với mạng Ethereum Sepolia để bắt đầu giao dịch.
      </p>

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
          Tôi đã có ví rồi
        </button>
      </div>
    </div>
  );
}
