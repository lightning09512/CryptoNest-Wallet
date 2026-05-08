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
  unlockWallet: (pin: string) => boolean;
  lockWallet: () => void;
  addTx: (tx: Tx) => void;
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
            mnemonic: wallet.mnemonic?.phrase || null,
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
      }
    }),
    {
      name: 'cryptonest-wallet-storage',
      partialize: (state) => Object.fromEntries(
        Object.entries(state).filter(([key]) => key !== 'isUnlocked')
      ),
    }
  )
);
