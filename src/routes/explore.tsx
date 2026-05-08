import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, Circle, Infinity, Layers, Globe } from "lucide-react";
import { useRef, useState } from "react";
import { WalletShell } from "@/components/wallet-shell";

export const Route = createFileRoute("/explore")({
  head: () => ({ meta: [{ title: "Khám phá — Fox Wallet" }] }),
  component: ExplorePage,
});

function ExplorePage() {
  const nav = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Tốc độ cuộn khi kéo
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // Categories data
  const categories = [
    { id: "tokens", label: "Tokens", icon: Circle, color: "#2E8B57", bgColor: "#1E3B2D" }, // Greenish
    { id: "perps", label: "Perps", icon: Infinity, color: "#000", bgColor: "#FFC0CB" },    // Pinkish
    { id: "lists", label: "Lists", icon: Layers, color: "#000", bgColor: "#B19CD9" },      // Purple
    { id: "sites", label: "Sites", icon: Globe, color: "#fff", bgColor: "#4169E1" },       // Blue
  ];

  // Mock data for trending sites
  const trendingSites = [
    { 
      name: "Jupiter", 
      category: "DeFi", 
      icon: "🪐", 
      color: "#1a1e23", 
      badge: "1", 
      badgeColor: "#F5B041" 
    },
    { 
      name: "pump.fun", 
      category: "DeFi", 
      icon: "💊", 
      color: "#ffffff", 
      badge: "2", 
      badgeColor: "#808B96" 
    },
    { 
      name: "Zealy", 
      category: "Community", 
      icon: "Z", 
      color: "#E83A65", 
      badge: "3", 
      badgeColor: "#E74C3C" 
    },
  ];

  // Mock data for learn
  const learnContent = [
    { 
      title: "Liquid Staking 101", 
      description: "What is liquid staking?", 
      icon: "🌊",
      color: "#82E0AA"
    },
    { 
      title: "Monad 101", 
      description: "Learn more about Monad", 
      icon: "👻",
      color: "#34224A"
    },
    { 
      title: "New ways to Pay", 
      description: "Onboard with Google or Apple pay", 
      icon: "💳",
      color: "#1c1c1c"
    },
  ];

  return (
    <WalletShell>
      <div className="min-h-screen min-w-[360px] bg-[#121212] px-4 pb-8 text-white font-sans">
        
        {/* Placeholder for header area to match screenshot's top spacing */}
        <div className="pt-2">
          <div className="rounded-2xl bg-[#1e1e1e] px-4 py-3 mb-6">
            <span className="text-sm font-medium text-slate-300">90 tokens</span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="size-5" />
            </div>
            <input
              type="text"
              placeholder="Search for sites, tokens"
              className="w-full rounded-[16px] border border-white/5 bg-[#1a1a1c] pl-12 pr-4 py-4 text-[15px] text-white placeholder:text-slate-500 outline-none focus:border-white/20 transition-colors"
            />
          </div>

          {/* Categories Horizontal Scroll */}
          <div 
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="flex items-center gap-3 overflow-x-auto pb-2 -mx-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] cursor-grab active:cursor-grabbing select-none"
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                className="flex items-center gap-3 whitespace-nowrap rounded-[20px] bg-[#1c1c1e] pr-5 pl-1.5 py-1.5 transition hover:bg-white/[0.06] flex-shrink-0"
              >
                <div 
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px]"
                  style={{ backgroundColor: cat.bgColor, color: cat.color }}
                >
                  <cat.icon className="size-5" strokeWidth={2.5} />
                </div>
                <span className="text-[15px] font-semibold text-white">{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Trending Sites Section */}
          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-[17px] font-semibold text-white">Trending Sites</h2>
              <button className="text-[14px] font-medium text-[#A688FA] hover:text-[#B698FA] transition">See More</button>
            </div>
            
            <div className="rounded-[24px] bg-[#1c1c1e] p-2">
              {trendingSites.map((site) => (
                <button
                  key={site.name}
                  className="w-full flex items-center gap-4 rounded-[20px] px-3 py-3 text-left transition hover:bg-white/[0.04]"
                >
                  <div className="relative shrink-0">
                    <div 
                      className="flex h-14 w-14 items-center justify-center rounded-[18px] text-2xl font-bold shadow-inner"
                      style={{ backgroundColor: site.color, color: site.name === 'pump.fun' ? '#000' : '#fff' }}
                    >
                      {site.icon}
                    </div>
                    {/* Badge */}
                    <div 
                      className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#1c1c1e] text-[10px] font-bold text-white shadow-sm"
                      style={{ backgroundColor: site.badgeColor }}
                    >
                      {site.badge}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[16px] font-semibold text-white truncate">{site.name}</div>
                    <div className="text-[14px] text-slate-400 truncate">{site.category}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Learn Section */}
          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-[17px] font-semibold text-white">Learn</h2>
              <button className="text-[14px] font-medium text-[#A688FA] hover:text-[#B698FA] transition">See More</button>
            </div>
            
            <div className="rounded-[24px] bg-[#1c1c1e] p-2">
              {learnContent.map((item) => (
                <button
                  key={item.title}
                  className="w-full flex items-center gap-4 rounded-[20px] px-3 py-3 text-left transition hover:bg-white/[0.04]"
                >
                  <div className="relative shrink-0">
                    <div 
                      className="flex h-14 w-14 items-center justify-center rounded-[18px] text-2xl"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.icon}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[16px] font-semibold text-white truncate">{item.title}</div>
                    <div className="text-[14px] text-slate-400 truncate">{item.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </WalletShell>
  );
}

