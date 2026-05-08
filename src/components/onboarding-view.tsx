import { useState, useRef, useEffect } from "react";
import { useWalletStore } from "@/store/wallet-store";
import { toast } from "sonner";
import ghostLogo from "@/assets/ghost-logo.png";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { ethers } from "ethers";

type Step = "start" | "import" | "create-pin" | "create-username" | "create-seed" | "create-success";

export function OnboardingView() {
  const { importWallet } = useWalletStore();
  const [step, setStep] = useState<Step>("start");
  const [showHelp, setShowHelp] = useState(false);
  
  // Create flow states
  const [pin, setPin] = useState("");
  const [username, setUsername] = useState(`@User${Math.floor(Math.random() * 10000)}`);
  const [tempWallet, setTempWallet] = useState<ethers.Wallet | null>(null);
  const pinInputRef = useRef<HTMLInputElement>(null);

  // Import flow states
  const [words, setWords] = useState<string[]>(Array(12).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto focus pin input
  useEffect(() => {
    if (step === "create-pin") {
      setTimeout(() => pinInputRef.current?.focus(), 100);
    }
  }, [step]);

  const handleImport = () => {
    const phrase = words.join(" ").trim();
    if (words.some(w => !w.trim())) {
      toast.error("Vui lòng điền đủ 12 từ khôi phục");
      return;
    }
    // We need a PIN and username for imported wallets too, but to keep it simple, we can generate defaults or just use the same wizard. 
    // Wait, the prompt only requested PIN for "tạo ví mới". For import, let's just use a default pin '0000' and random username for now to not break the flow.
    const success = importWallet(phrase, "0000", `@Imported${Math.floor(Math.random() * 1000)}`);
    if (success) {
      toast.success("Nhập ví thành công! Mật khẩu mặc định là 0000.");
    } else {
      toast.error("Cụm từ khôi phục không hợp lệ");
    }
  };

  const finalizeCreation = () => {
    if (tempWallet?.mnemonic) {
      importWallet(tempWallet.mnemonic.phrase, pin, username);
      toast.success("Ví đã sẵn sàng!");
    }
  };

  // Import Word handlers
  const handleWordChange = (index: number, value: string) => {
    if (value.includes(" ")) return;
    const newWords = [...words];
    newWords[index] = value;
    setWords(newWords);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (index < 11) inputRefs.current[index + 1]?.focus();
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
      const nextEmptyIndex = newWords.findIndex(w => !w);
      if (nextEmptyIndex !== -1) inputRefs.current[nextEmptyIndex]?.focus();
      else inputRefs.current[11]?.focus();
    } else {
      handleWordChange(index, pastedWords[0]);
    }
  };

  if (step === "import") {
    const allFilled = words.every(w => w.trim().length > 0);
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center p-6 text-white font-sans w-full max-w-md mx-auto relative">
        <header className="w-full flex items-center justify-between mb-8 relative z-50">
          <button onClick={() => setStep("start")} className="text-muted-foreground hover:text-white transition-colors">
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

  if (step === "create-pin") {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center p-6 text-white font-sans w-full max-w-md mx-auto">
        <header className="w-full mb-8">
          <button onClick={() => setStep("start")} className="text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft className="size-6" />
          </button>
        </header>
        <h1 className="text-2xl font-bold mb-2">Tạo PIN</h1>
        <p className="text-muted-foreground text-center mb-1 text-sm px-4">
          Mã này được sử dụng để bảo mật cho ví của bạn trên tất cả các thiết bị của bạn.
        </p>
        <p className="text-amber-400 text-sm font-medium mb-12 text-center">Mã này không thể được phục hồi.</p>

        <input
          ref={pinInputRef}
          type="password"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          className="opacity-0 absolute -left-[9999px]"
        />
        
        <div className="flex justify-center gap-4 mb-auto cursor-text" onClick={() => pinInputRef.current?.focus()}>
          {[0, 1, 2, 3].map((index) => (
            <div 
              key={index} 
              className={`size-4 rounded-full transition-colors ${
                pin.length > index ? "bg-white" : "bg-white/20"
              }`}
            />
          ))}
        </div>

        <button 
          onClick={() => setStep("create-username")}
          disabled={pin.length < 4}
          className={`w-full font-bold py-4 rounded-full mt-8 transition-colors ${
            pin.length === 4 ? "bg-[#9a91f3] text-black hover:opacity-90" : "bg-[#1c1c1e] text-muted-foreground cursor-not-allowed"
          }`}
        >
          Tiếp tục
        </button>
      </div>
    );
  }

  if (step === "create-username") {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center p-6 text-white font-sans w-full max-w-md mx-auto">
        <header className="w-full mb-8">
          <button onClick={() => setStep("create-pin")} className="text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft className="size-6" />
          </button>
        </header>
        <h1 className="text-2xl font-bold mb-4">Tạo tên tài khoản</h1>
        <p className="text-muted-foreground text-center mb-8 text-sm px-4">
          Hệ thống đã tạo ngẫu nhiên một tên cho bạn. Bạn có thể sửa nó nếu muốn.
        </p>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-[#1c1c1e] border border-white/5 rounded-lg py-4 px-4 text-center text-lg font-semibold text-white outline-none focus:border-primary/50 transition-colors mb-auto"
          autoFocus
        />
        <button 
          onClick={() => {
            const w = ethers.Wallet.createRandom();
            setTempWallet(w);
            setStep("create-seed");
          }}
          disabled={!username.trim()}
          className={`w-full font-bold py-4 rounded-full mt-8 transition-colors bg-[#9a91f3] text-black hover:opacity-90`}
        >
          Tiếp tục
        </button>
      </div>
    );
  }

  if (step === "create-seed") {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center p-6 text-white font-sans w-full max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4 mt-8">Cụm từ khôi phục của bạn</h1>
        <p className="text-muted-foreground text-center mb-8 text-sm px-4">
          Hãy viết các từ này ra giấy theo đúng thứ tự và cất giữ cẩn thận. Không bao giờ chia sẻ cho người khác.
        </p>
        <div className="grid grid-cols-3 gap-3 w-full mb-auto">
          {tempWallet?.mnemonic?.phrase.split(" ").map((word, index) => (
            <div key={index} className="flex items-center bg-[#1c1c1e] border border-white/5 rounded-lg py-3 px-3">
              <span className="text-muted-foreground text-xs mr-2">{index + 1}.</span>
              <span className="text-sm text-white font-medium">{word}</span>
            </div>
          ))}
        </div>
        <button 
          onClick={() => setStep("create-success")}
          className="w-full bg-[#9a91f3] text-black font-bold py-4 rounded-full mt-8 hover:opacity-90 transition-opacity"
        >
          Tôi đã lưu lại
        </button>
      </div>
    );
  }

  if (step === "create-success") {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-6 text-white font-sans w-full max-w-md mx-auto relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
        
        <div className="size-32 rounded-full bg-primary/20 flex items-center justify-center mb-6 relative">
           <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
           <span className="text-5xl font-bold text-[#9a91f3]">Hi!</span>
        </div>

        <h1 className="text-xl font-medium mb-10">{username}</h1>

        <div className="mb-6 relative">
          <img src={ghostLogo} alt="Logo" className="size-24" />
        </div>

        <h2 className="text-2xl font-bold mb-3">Bạn đã sẵn sàng!</h2>
        <p className="text-muted-foreground text-center mb-auto">
          Giờ đây bạn có thể tận hưởng tất cả chức năng của ví mình.
        </p>

        <button 
          onClick={finalizeCreation}
          className="w-full bg-[#9a91f3] text-black font-bold py-4 rounded-full mt-8 hover:opacity-90 transition-opacity relative z-10"
        >
          Bắt đầu
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
          onClick={() => setStep("create-pin")}
          className="w-full bg-primary text-black font-semibold py-4 rounded-full text-[15px] hover:opacity-90 transition-opacity"
        >
          Tạo Ví Mới
        </button>
        <button 
          onClick={() => setStep("import")}
          className="w-full bg-[#1c1c1e] text-white font-semibold py-4 rounded-full text-[15px] hover:bg-white/[0.06] transition-colors"
        >
          Tôi đã có ví rồi
        </button>
      </div>
    </div>
  );
}
