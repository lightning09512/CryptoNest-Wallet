import { ethers } from "ethers";
import { useWalletStore } from "@/store/wallet-store";

// Sử dụng RPC công cộng của Sepolia (hoặc có thể thay bằng Alchemy/Infura)
const SEPOLIA_RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";

// Khởi tạo provider
export const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);

/**
 * Lấy số dư hiện tại của địa chỉ ví
 */
export const fetchWalletBalance = async (address: string): Promise<string> => {
  try {
    const balanceWei = await provider.getBalance(address);
    // Chuyển đổi từ Wei (đơn vị nhỏ nhất) sang ETH
    const balanceEth = ethers.formatEther(balanceWei);

    // Rút gọn lấy 4 chữ số thập phân
    return parseFloat(balanceEth).toFixed(4);
  } catch (error) {
    console.error("Error fetching balance:", error);
    return "0.0000";
  }
};

/**
 * Gửi ETH (Sepolia)
 */
export const sendSepoliaETH = async (privateKey: string, toAddress: string, amountEth: string) => {
  try {
    // 1. Tạo đối tượng Wallet kết nối với provider
    const wallet = new ethers.Wallet(privateKey, provider);

    // 2. Chuyển đổi số lượng sang Wei
    const amountWei = ethers.parseEther(amountEth);

    // 3. Tạo cấu hình giao dịch
    const tx = {
      to: toAddress,
      value: amountWei,
    };

    // 4. Ký và gửi giao dịch
    const transactionResponse = await wallet.sendTransaction(tx);

    // Trả về thông tin giao dịch đang xử lý
    return {
      success: true,
      hash: transactionResponse.hash,
      response: transactionResponse,
    };
  } catch (error: any) {
    console.error("Error sending transaction:", error);
    return {
      success: false,
      error: error.message || "An unknown error occurred",
    };
  }
};
