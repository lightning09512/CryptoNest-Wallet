export type Token = {
  symbol: string;
  name: string;
  balance: number;
  priceUsd: number;
  change24h: number;
  color: string;
};

export type Tx = {
  id: string;
  type: "send" | "receive" | "swap" | "contract";
  token: string;
  amount: number;
  to: string;
  from: string;
  date: string;
  status: "confirmed" | "pending" | "failed";
  hash: string;
};

export const WALLET_ADDRESS = "0x7A3f9C2bE4d8a51F3d2bC9aE8f1D6b9C4eA7F123";

// Tokens displayed on main page (large market cap only)
export const TOKENS: Token[] = [
  { symbol: "BTC", name: "Bitcoin", balance: 0, priceUsd: 68420.0, change24h: 0, color: "oklch(0.7 0.18 60)" },
  { symbol: "ETH", name: "Ethereum", balance: 0, priceUsd: 3420.55, change24h: 0, color: "oklch(0.55 0.18 270)" },
  { symbol: "BNB", name: "Binance Coin", balance: 0, priceUsd: 612.45, change24h: 0, color: "oklch(0.65 0.15 45)" },
  { symbol: "XRP", name: "Ripple", balance: 0, priceUsd: 0.52, change24h: 0, color: "oklch(0.6 0.2 340)" },
  { symbol: "SOL", name: "Solana", balance: 0, priceUsd: 168.42, change24h: 0, color: "oklch(0.7 0.2 295)" },
  { symbol: "DOGE", name: "Dogecoin", balance: 0, priceUsd: 0.16, change24h: 0, color: "oklch(0.7 0.15 35)" },
];

// All tokens including stablecoins and others for search functionality
export const ALL_TOKENS: Token[] = [
  { symbol: "BTC", name: "Bitcoin", balance: 0, priceUsd: 68420.0, change24h: 0, color: "oklch(0.7 0.18 60)" },
  { symbol: "ETH", name: "Ethereum", balance: 0, priceUsd: 3420.55, change24h: 0, color: "oklch(0.55 0.18 270)" },
  { symbol: "BNB", name: "Binance Coin", balance: 0, priceUsd: 612.45, change24h: 0, color: "oklch(0.65 0.15 45)" },
  { symbol: "XRP", name: "Ripple", balance: 0, priceUsd: 0.52, change24h: 0, color: "oklch(0.6 0.2 340)" },
  { symbol: "SOL", name: "Solana", balance: 0, priceUsd: 168.42, change24h: 0, color: "oklch(0.7 0.2 295)" },
  { symbol: "DOGE", name: "Dogecoin", balance: 0, priceUsd: 0.16, change24h: 0, color: "oklch(0.7 0.15 35)" },
  { symbol: "USDC", name: "USD Coin", balance: 0, priceUsd: 1.00, change24h: 0, color: "oklch(0.5 0.18 200)" },
  { symbol: "USDT", name: "Tether", balance: 0, priceUsd: 1.00, change24h: 0, color: "oklch(0.5 0.18 50)" },
  { symbol: "ADA", name: "Cardano", balance: 0, priceUsd: 0.48, change24h: 0, color: "oklch(0.6 0.15 180)" },
  { symbol: "AVAX", name: "Avalanche", balance: 0, priceUsd: 38.92, change24h: 0, color: "oklch(0.65 0.18 280)" },
  { symbol: "DOT", name: "Polkadot", balance: 0, priceUsd: 7.85, change24h: 0, color: "oklch(0.6 0.15 220)" },
  { symbol: "POL", name: "Polygon", balance: 0, priceUsd: 0.89, change24h: 0, color: "oklch(0.65 0.18 150)" },
  { symbol: "LINK", name: "Chainlink", balance: 0, priceUsd: 14.23, change24h: 0, color: "oklch(0.55 0.18 90)" },
  { symbol: "UNI", name: "Uniswap", balance: 0, priceUsd: 8.67, change24h: 0, color: "oklch(0.65 0.15 255)" },
  { symbol: "ATOM", name: "Cosmos", balance: 0, priceUsd: 9.34, change24h: 0, color: "oklch(0.6 0.18 170)" },
  { symbol: "SUI", name: "Sui", balance: 0, priceUsd: 3.42, change24h: 0, color: "oklch(0.7 0.15 230)" },
  { symbol: "MON", name: "Monad", balance: 0, priceUsd: 0, change24h: 0, color: "oklch(0.6 0.15 295)" },
  { symbol: "FIL", name: "Filecoin", balance: 0, priceUsd: 11.45, change24h: 0, color: "oklch(0.65 0.15 140)" },
  { symbol: "AR", name: "Arweave", balance: 0, priceUsd: 27.89, change24h: 0, color: "oklch(0.7 0.18 80)" },
  { symbol: "HYPE", name: "Hyperliquid", balance: 0, priceUsd: 0, change24h: 0, color: "oklch(0.6 0.2 310)" },
];

export const TXS: Tx[] = [
  { id: "1", type: "receive", token: "ETH", amount: 0.5, to: WALLET_ADDRESS, from: "0x9F2c...A41B", date: "2026-05-07T10:24:00", status: "confirmed", hash: "0xabc1...d4f2" },
  { id: "2", type: "send", token: "USDC", amount: 250, to: "0x4B8e...C912", from: WALLET_ADDRESS, date: "2026-05-06T18:02:00", status: "confirmed", hash: "0xdef3...a821" },
  { id: "3", type: "swap", token: "ETH→USDC", amount: 0.2, to: WALLET_ADDRESS, from: WALLET_ADDRESS, date: "2026-05-05T09:11:00", status: "confirmed", hash: "0x7c9b...f102" },
  { id: "4", type: "send", token: "MATIC", amount: 120, to: "0x2A1f...88E0", from: WALLET_ADDRESS, date: "2026-05-04T22:55:00", status: "pending", hash: "0x44ee...90ca" },
  { id: "5", type: "receive", token: "LINK", amount: 12.5, to: WALLET_ADDRESS, from: "0xC3d4...77AA", date: "2026-05-02T08:30:00", status: "confirmed", hash: "0xbeef...1234" },
  { id: "6", type: "contract", token: "UNI", amount: 0, to: "Uniswap V3", from: WALLET_ADDRESS, date: "2026-04-30T12:00:00", status: "confirmed", hash: "0xfade...c0de" },
];

export const totalBalanceUsd = () =>
  TOKENS.reduce((sum, t) => sum + t.balance * t.priceUsd, 0);

export const shortAddr = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`;
