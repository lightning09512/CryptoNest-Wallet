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

      importWallet: (pk: string) => {
        try {
          // Normalize the private key (add 0x if missing)
          const formattedPk = pk.startsWith('0x') ? pk : `0x${pk}`;
          const wallet = new ethers.Wallet(formattedPk);
          set({
            address: wallet.address,
            privateKey: wallet.privateKey,
            mnemonic: null,
            balance: '0.00',
            kcoinBalance: 0,
          });
          return true;
        } catch (error) {
          console.error("Invalid private key", error);
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
