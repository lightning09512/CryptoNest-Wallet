import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ethers } from 'ethers';

interface WalletState {
  address: string | null;
  privateKey: string | null;
  mnemonic: string | null;
  balance: string;
  kcoinBalance: number;
  createWallet: () => void;
  importWallet: (privateKey: string) => boolean;
  logout: () => void;
  setBalance: (balance: string) => void;
  addKCoin: (amount: number) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      address: null,
      privateKey: null,
      mnemonic: null,
      balance: '0.00',
      kcoinBalance: 0,
      
      createWallet: () => {
        const wallet = ethers.Wallet.createRandom();
        set({
          address: wallet.address,
          privateKey: wallet.privateKey,
          mnemonic: wallet.mnemonic?.phrase || null,
          balance: '0.00',
          kcoinBalance: 0,
        });
      },

      importWallet: (input: string) => {
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
            mnemonic: wallet.mnemonic?.phrase || null,
            balance: '0.00',
            kcoinBalance: 0,
          });
          return true;
        } catch (error) {
          console.error("Invalid wallet input", error);
          return false;
        }
      },

      logout: () => {
        set({ address: null, privateKey: null, mnemonic: null, balance: '0.00', kcoinBalance: 0 });
      },

      setBalance: (balance: string) => {
        set({ balance });
      },

      addKCoin: (amount: number) => {
        set((state) => ({ kcoinBalance: state.kcoinBalance + amount }));
      },
    }),
    {
      name: 'cryptonest-wallet-storage',
    }
  )
);
