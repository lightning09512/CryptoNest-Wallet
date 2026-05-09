import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ethers } from 'ethers';
import type { Tx } from '@/lib/wallet-data';

interface WalletState {
  address: string | null;
  privateKey: string | null;
  mnemonic: string | null;
  balance: string;
  kcoinBalance: number;
  pin: string | null;
  username: string | null;
  isUnlocked: boolean;
  localTxs: Tx[];
  createWallet: (pin: string, username: string) => void;
  importWallet: (input: string, pin: string, username: string) => boolean;
  logout: () => void;
  setBalance: (balance: string) => void;
  addKCoin: (amount: number) => void;
  subtractKCoin: (amount: number) => void;
  unlockWallet: (pin: string) => boolean;
  lockWallet: () => void;
  addTx: (tx: Tx) => void;
  prices: Record<string, { priceUsd: number; change24h: number }>;
  fetchPrices: () => Promise<void>;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      address: null,
      privateKey: null,
      mnemonic: null,
      balance: '0.00',
      kcoinBalance: 0,
      pin: null,
      username: null,
      isUnlocked: false,
      localTxs: [],
      prices: {},
      
      createWallet: (pin: string, username: string) => {
        const wallet = ethers.Wallet.createRandom();
        set({
          address: wallet.address,
          privateKey: wallet.privateKey,
          mnemonic: wallet.mnemonic?.phrase || null,
          balance: '0.00',
          kcoinBalance: 0,
          pin,
          username,
          isUnlocked: true,
          localTxs: [],
        });
      },

      importWallet: (input: string, pin: string, username: string) => {
        try {
          let wallet;
          const trimmed = input.trim();
          // Kiểm tra nếu là Seed Phrase (có dấu cách)
          if (trimmed.includes(' ')) {
            wallet = ethers.Wallet.fromPhrase(trimmed);
          } else {
            // Ngược lại giả định là Private Key
            const formattedPk = trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`;
            wallet = new ethers.Wallet(formattedPk);
          }
          
          set({
            address: wallet.address,
            privateKey: wallet.privateKey,
            mnemonic: (wallet as ethers.HDNodeWallet).mnemonic?.phrase || null,
            balance: '0.00',
            kcoinBalance: 0,
            pin,
            username,
            isUnlocked: true,
            localTxs: [],
          });
          return true;
        } catch (error) {
          console.error("Invalid wallet input", error);
          return false;
        }
      },

      logout: () => {
        set({ address: null, privateKey: null, mnemonic: null, balance: '0.00', kcoinBalance: 0, pin: null, username: null, isUnlocked: false, localTxs: [] });
      },

      setBalance: (balance: string) => {
        set({ balance });
      },

      addKCoin: (amount: number) => {
        set((state) => ({ kcoinBalance: state.kcoinBalance + amount }));
      },

      subtractKCoin: (amount: number) => {
        set((state) => ({ kcoinBalance: Math.max(0, state.kcoinBalance - amount) }));
      },

      unlockWallet: (inputPin: string) => {
        const { pin } = get();
        if (pin === inputPin) {
          set({ isUnlocked: true });
          return true;
        }
        return false;
      },

      lockWallet: () => {
        set({ isUnlocked: false });
      },

      addTx: (tx: Tx) => {
        set((state) => ({ localTxs: [tx, ...state.localTxs] }));
      },

      fetchPrices: async () => {
        try {
          // Map our symbols to CoinGecko IDs
          const coinGeckoIds = [
            "bitcoin", "ethereum", "binancecoin", "ripple", "solana", "dogecoin"
          ].join(',');

          const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoIds}&vs_currencies=usd&include_24hr_change=true`);
          if (!res.ok) throw new Error("Failed to fetch prices");
          
          const data = await res.json();
          
          const newPrices: Record<string, { priceUsd: number; change24h: number }> = {
            "BTC": { priceUsd: data.bitcoin?.usd || 0, change24h: data.bitcoin?.usd_24h_change || 0 },
            "ETH": { priceUsd: data.ethereum?.usd || 0, change24h: data.ethereum?.usd_24h_change || 0 },
            "BNB": { priceUsd: data.binancecoin?.usd || 0, change24h: data.binancecoin?.usd_24h_change || 0 },
            "XRP": { priceUsd: data.ripple?.usd || 0, change24h: data.ripple?.usd_24h_change || 0 },
            "SOL": { priceUsd: data.solana?.usd || 0, change24h: data.solana?.usd_24h_change || 0 },
            "DOGE": { priceUsd: data.dogecoin?.usd || 0, change24h: data.dogecoin?.usd_24h_change || 0 },
          };

          set({ prices: newPrices });
        } catch (error) {
          console.error("Error fetching prices from CoinGecko:", error);
        }
      }
    }),
    {
      name: 'cryptonest-wallet-storage',
      partialize: (state) => Object.fromEntries(
        Object.entries(state).filter(([key]) => !['isUnlocked', 'prices'].includes(key))
      ),
    }
  )
);
