# CryptoNest Wallet

**CryptoNest Wallet** là một ứng dụng ví tiền điện tử Web3 được xây dựng nhằm phục vụ mục đích học tập và nghiên cứu trong lĩnh vực Blockchain. Ứng dụng cho phép người dùng tạo ví, quản lý tài sản, gửi/nhận ETH trên mạng Ethereum Sepolia Testnet, swap token, theo dõi giá thị trường theo thời gian thực, giao dịch Futures với đòn bẩy lên đến 50x, và khám phá NFT — tất cả trong một giao diện hiện đại, tối ưu cho thiết bị di động.

---

## Mục lục

- [Tổng quan dự án](#tổng-quan-dự-án)
- [Tính năng chính](#tính-năng-chính)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Hướng dẫn cài đặt](#hướng-dẫn-cài-đặt)
- [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)
- [API và dữ liệu thị trường](#api-và-dữ-liệu-thị-trường)
- [Bảo mật](#bảo-mật)
- [Giới hạn và lưu ý](#giới-hạn-và-lưu-ý)
- [Đóng góp](#đóng-góp)
- [Giấy phép](#giấy-phép)

---

## Tổng quan dự án

CryptoNest Wallet là sản phẩm thuộc môn học **Lập và Quản lý Dự án Công nghệ Thông tin**. Dự án mô phỏng một ví tiền điện tử phi tập trung (non-custodial wallet) tương tự Phantom, MetaMask, hoặc Trust Wallet, kết nối trực tiếp với mạng Ethereum Sepolia Testnet để thực hiện các giao dịch thực trên blockchain.

Ứng dụng được thiết kế theo phong cách mobile-first với giao diện tối (dark theme), lấy cảm hứng từ các ví tiền điện tử hàng đầu hiện nay.

### Đặc điểm nổi bật

- **Ví thực (Non-custodial)**: Tạo ví bằng Ethers.js, sinh Seed Phrase 12 từ và Private Key. Người dùng có toàn quyền kiểm soát khoá riêng của mình.
- **Giao dịch thực trên Blockchain**: Gửi/nhận ETH trên mạng Sepolia Testnet thông qua RPC công cộng, ký giao dịch trực tiếp từ trình duyệt.
- **Dữ liệu thị trường theo thời gian thực**: Tích hợp CoinGecko API và Binance WebSocket để cập nhật giá các đồng tiền điện tử liên tục.
- **Giao dịch Futures mô phỏng**: Terminal giao dịch chuyên nghiệp với biểu đồ TradingView, hỗ trợ Long/Short với đòn bẩy từ 1x-50x.
- **Triển khai trên Cloudflare Workers**: Server-Side Rendering (SSR) trên Cloudflare edge network.

---

## Tính năng chính

### 1. Quản lý ví (Wallet Management)

- **Tạo ví mới**: Sinh ngẫu nhiên ví Ethereum (Seed Phrase 12 từ + Private Key) bằng thư viện `ethers.js`.
- **Nhập ví**: Hỗ trợ nhập ví từ Seed Phrase (12 từ) hoặc Private Key có sẵn.
- **Bảo vệ bằng PIN**: Người dùng thiết lập mã PIN 4 số để bảo vệ ví. Ví tự động khoá khi tải trang và yêu cầu nhập PIN để mở khoá.
- **Đặt tên người dùng**: Tạo username ngẫu nhiên hoặc tự tuỳ chỉnh.
- **Xuất khoá**: Xem lại Seed Phrase hoặc Private Key bất kỳ lúc nào từ giao diện.
- **Đăng xuất / Xoá ví**: Xoá toàn bộ dữ liệu ví khỏi bộ nhớ cục bộ.

### 2. Quản lý tài sản (Portfolio)

- **Hiển thị số dư tổng**: Tính tổng giá trị USD của tất cả tài sản (ETH thực + token ảo).
- **Danh sách token**: Hiển thị BTC, ETH, BNB, XRP, SOL, DOGE với giá thực từ CoinGecko, và token tuỳ chỉnh KCOIN.
- **Cập nhật số dư ETH thực**: Gọi trực tiếp đến node Sepolia để lấy số dư on-chain mới nhất của địa chỉ ví.
- **Giá thị trường real-time**: Tự động cập nhật giá từ CoinGecko API mỗi 60 giây.

### 3. Gửi tiền (Send)

- **Gửi ETH thực**: Ký và gửi giao dịch ETH trên mạng Sepolia Testnet. Giao dịch được phát sóng lên blockchain thực sự.
- **Gửi token ảo**: Hỗ trợ gửi KCOIN và các token ảo khác (xử lý nội bộ).
- **Hiển thị giá trị USD tương đương**: Tự động chuyển đổi số lượng token sang giá trị USD.
- **Xác nhận trên Etherscan**: Sau khi gửi ETH thành công, cung cấp link trực tiếp đến Sepolia Etherscan để xác minh giao dịch.

### 4. Nhận tiền (Receive)

- **Mã QR**: Sinh mã QR tự động từ địa chỉ ví để chia sẻ nhanh.
- **Sao chép địa chỉ**: Nút sao chép địa chỉ ví vào clipboard.
- **Cảnh báo mạng**: Nhắc nhở người dùng chỉ gửi token trên mạng Sepolia Testnet.
- **Liên kết Faucet**: Liên kết trực tiếp đến Sepolia Faucet để nhận ETH testnet miễn phí.

### 5. Swap token

- **Giao diện swap trực quan**: Chọn token nguồn và token đích, nhập số lượng và swap.
- **Tính toán tỷ giá tự động**: Chuyển đổi giá trị dựa trên giá thị trường thực.
- **Hỗ trợ nhiều token**: Swap giữa ETH, BTC, BNB, SOL, XRP, DOGE, KCOIN và nhiều token khác.
- **Modal chọn token**: Giao diện bottom sheet để chọn token với thông tin giá và số dư.
- **Thông tin xu hướng**: Hiển thị danh sách token xu hướng với giá và biến động 24h.

### 6. Terminal giao dịch Futures

Đây là tính năng nổi bật nhất của CryptoNest, mô phỏng một sàn giao dịch phái sinh chuyên nghiệp:

- **Biểu đồ TradingView**: Tích hợp widget TradingView chính thức với đủ các công cụ vẽ, chỉ báo kỹ thuật, và nhiều khung thời gian (1m, 5m, 15m, 1h, 4h, 1D, 1W).
- **Giá real-time qua WebSocket**: Kết nối trực tiếp đến Binance WebSocket Stream (`wss://stream.binance.com`) để nhận giá mới nhất theo thời gian thực, với cơ chế dự phòng (fallback) gọi REST API mỗi 2 giây.
- **Giao dịch Long/Short**: Mở vị thế Long (mua lên) hoặc Short (bán xuống) với đòn bẩy tuỳ chỉnh.
- **Đòn bẩy lên đến 50x**: Chọn mức đòn bẩy từ 1x đến 50x cho mỗi vị thế.
- **Quản lý vị thế**: Xem tất cả các vị thế đang mở với thông tin chi tiết: giá vào, giá hiện tại, giá thanh lý, ký quỹ, lãi/lỗ (PnL) tính theo thời gian thực.
- **Đóng vị thế**: Đóng từng vị thế hoặc đóng toàn bộ cùng lúc.
- **Nhiều cặp giao dịch**: Hỗ trợ BTC, ETH, SOL, BNB, XRP, ADA, AVAX, DOT, LINK, NEAR.
- **Funding Rate thực**: Lấy tỷ lệ funding rate thực từ Binance Futures API, đếm ngược thời gian đến phiên funding tiếp theo.
- **Lịch sử giao dịch**: Lưu trữ lịch sử đặt lệnh, lịch sử giao dịch, và lịch sử dòng vốn vào localStorage.
- **Banner vị thế trên biểu đồ**: Hiển thị banner vị thế đang mở trực tiếp trên biểu đồ với thông tin lãi/lỗ real-time.

### 7. Lịch sử giao dịch (Activity)

- **Lịch sử on-chain**: Gọi Etherscan API (V2, chainid Sepolia) để lấy lịch sử giao dịch thực từ blockchain, bao gồm cả giao dịch internal.
- **Lịch sử nội bộ**: Kết hợp giao dịch nội bộ (swap, gửi token ảo) với giao dịch on-chain.
- **Loại bỏ trùng lặp**: Tự động deduplicate giao dịch theo transaction hash.
- **Phân nhóm theo ngày**: Hiển thị giao dịch theo nhóm ngày, sắp xếp từ mới đến cũ.
- **Liên kết Etherscan**: Mỗi giao dịch có thể bấm vào để xem chi tiết trên Sepolia Etherscan.

### 8. NFT Explorer

- **Tab Collections**: Hiển thị các bộ sưu tập xu hướng và hàng đầu với floor price, volume, và biến động.
- **Tab Trending**: Danh sách các bộ sưu tập đang thịnh hành.
- **Tab Categories**: Phân loại NFT theo thể loại: Art, Gaming, PFP, Music.
- **Tab Marketplace**: Liên kết đến các sàn NFT: Tensor, Magic Eden, OpenSea, Solanart.
- **Tab Learn**: Nội dung học tập về NFT: NFT Basics, How to Mint, NFT Security.

### 9. Khám phá (Explore)

- **Tìm kiếm**: Thanh tìm kiếm token và trang web.
- **Phân loại**: Danh mục nhanh: Tokens, Perps, Lists, Sites.
- **Trang xu hướng**: Hiển thị các trang web DeFi đang thịnh hành: Jupiter, pump.fun, Zealy.
- **Học tập**: Nội dung học tập về Liquid Staking, Monad, phương thức thanh toán mới.

### 10. Màn hình khoá (Lock Screen)

- **Tự động khoá**: Ví tự động khoá khi tải lại trang.
- **Nhập PIN**: Giao diện nhập 4 chấm PIN trực quan, tự động mở khoá khi nhập đủ.
- **Đặt lại ví**: Tuỳ chọn xoá ví và đặt lại nếu quên PIN.

---

## Kiến trúc hệ thống

```
+-----------------------------------------------------------+
|                     Trình duyệt (Client)                   |
|                                                            |
|  +-------+  +-------+  +--------+  +--------+  +-------+  |
|  | Onbo- |  | Port- |  | Send/  |  | Swap   |  | Termi-|  |
|  | arding |  | folio |  | Recv   |  |        |  | nal   |  |
|  +-------+  +-------+  +--------+  +--------+  +-------+  |
|       |          |           |           |           |      |
|  +----------------------------------------------------------+
|  |              Zustand Store (wallet-store)                |
|  |  - address, privateKey, mnemonic, pin, balance           |
|  |  - positions[], localTxs[], prices{}                     |
|  |  - persist -> localStorage                               |
|  +----------------------------------------------------------+
|       |                    |                    |            |
|  +---------+      +----------------+    +-------------+     |
|  | Ethers  |      | CoinGecko API  |    | Binance WS  |     |
|  | (web3)  |      | (giá token)    |    | (giá RT)    |     |
|  +---------+      +----------------+    +-------------+     |
|       |                                                     |
|  +---------+                                                |
|  | Sepolia |                                                |
|  | Testnet |                                                |
|  +---------+                                                |
+-----------------------------------------------------------+
|                   Cloudflare Workers (SSR)                  |
+-----------------------------------------------------------+
```

### Luồng dữ liệu

1. **Tạo ví**: `ethers.Wallet.createRandom()` -> lưu vào Zustand store (persist localStorage).
2. **Lấy số dư**: `ethers.JsonRpcProvider` gọi đến Sepolia RPC -> format từ Wei sang ETH.
3. **Gửi ETH**: `ethers.Wallet.sendTransaction()` -> ký và phát giao dịch lên Sepolia.
4. **Giá token**: CoinGecko REST API mỗi 60 giây + Binance WebSocket cho giá real-time.
5. **Futures**: Mở/đóng vị thế trong Zustand store, tính PnL dựa trên giá hiện tại từ WebSocket.

---

## Công nghệ sử dụng

### Frontend

| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| React | 19.2 | Thư viện UI chính |
| TypeScript | 5.8 | Ngôn ngữ lập trình |
| TanStack Router | 1.168 | Định tuyến phía client và server |
| TanStack Start | 1.167 | Framework full-stack (SSR) |
| TanStack React Query | 5.83 | Quản lý trạng thái server |
| Zustand | 5.0 | Quản lý trạng thái toàn cục |
| Tailwind CSS | 4.2 | Framework CSS utility-first |
| Radix UI | Nhiều | Thư viện component headless (46 component) |
| shadcn/ui | New York style | Hệ thống component UI xây dựng trên Radix |
| Lucide React | 0.575 | Thư viện icon |
| Recharts | 2.15 | Biểu đồ và đồ thị |
| Sonner | 2.0 | Hệ thống thông báo toast |
| Vaul | 1.1 | Component Drawer |

### Web3 và Blockchain

| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| ethers.js | 6.16 | Tương tác blockchain Ethereum |
| Sepolia Testnet | - | Mạng test Ethereum |
| PublicNode RPC | - | Node RPC công cộng cho Sepolia |

### API bên ngoài

| API | Mục đích |
|-----|----------|
| CoinGecko API | Lấy giá token (BTC, ETH, BNB, XRP, SOL, DOGE) |
| Binance WebSocket | Nhận giá real-time cho terminal giao dịch |
| Binance Futures API | Lấy funding rate thực |
| Etherscan API V2 | Lấy lịch sử giao dịch on-chain (Sepolia) |
| QR Server API | Sinh mã QR cho địa chỉ ví |
| TradingView Widget | Biểu đồ giao dịch chuyên nghiệp |

### Build và Deployment

| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| Vite | 7.3 | Build tool và dev server |
| Cloudflare Workers | - | Nền tảng triển khai (SSR edge) |
| Wrangler | - | CLI quản lý Cloudflare Workers |
| ESLint | 9.32 | Kiểm tra chất lượng code |
| Prettier | 3.7 | Định dạng code tự động |

---

## Cấu trúc thư mục

```
CryptoNest Wallet/
|
|-- public/                     # Tài nguyên tĩnh
|-- img/                        # Hình ảnh token (BTC, ETH, BNB, SOL, XRP, DOGE, KCOIN)
|-- src/
|   |-- assets/                 # Tài nguyên được import (logo)
|   |-- components/
|   |   |-- ui/                 # 46 component shadcn/ui (Button, Card, Dialog, ...)
|   |   |-- onboarding-view.tsx # Màn hình giới thiệu và tạo ví
|   |   |-- portfolio-view.tsx  # Giao diện portfolio chính
|   |   |-- wallet-shell.tsx    # Layout bao bọc (header, nav, auth guard)
|   |   |-- lock-screen.tsx     # Màn hình khoá PIN
|   |-- hooks/
|   |   |-- use-mobile.tsx      # Hook phát hiện thiết bị di động
|   |-- lib/
|   |   |-- wallet-data.ts      # Định nghĩa Token, Tx, dữ liệu token mặc định
|   |   |-- web3.ts             # Kết nối Sepolia RPC, gửi giao dịch ETH
|   |   |-- utils.ts            # Hàm tiện ích (cn - class name merge)
|   |   |-- error-capture.ts    # Bắt lỗi phía server
|   |   |-- error-page.ts       # Trang lỗi HTML
|   |-- routes/
|   |   |-- __root.tsx          # Layout gốc (HTML shell, meta tags, providers)
|   |   |-- index.tsx           # Trang chủ (Portfolio)
|   |   |-- send-select.tsx     # Chọn token để gửi
|   |   |-- send.tsx            # Gửi token/ETH
|   |   |-- receive.tsx         # Nhận token (QR code)
|   |   |-- swap.tsx            # Swap token
|   |   |-- terminal.tsx        # Terminal giao dịch Futures
|   |   |-- activity.tsx        # Lịch sử giao dịch
|   |   |-- explore.tsx         # Khám phá DeFi
|   |   |-- nft.tsx             # NFT Explorer
|   |   |-- nfts.tsx            # Bộ sưu tập NFT
|   |   |-- buy.tsx             # Mua token
|   |-- store/
|   |   |-- wallet-store.ts     # Zustand store (trạng thái toàn cục)
|   |-- router.tsx              # Cấu hình router
|   |-- server.ts               # Entry point SSR (Cloudflare Workers)
|   |-- start.ts                # Điểm khởi động ứng dụng
|   |-- styles.css              # CSS toàn cục và Tailwind
|   |-- routeTree.gen.ts        # Route tree tự động sinh bởi TanStack Router
|
|-- components.json             # Cấu hình shadcn/ui
|-- package.json                # Dependencies và scripts
|-- tsconfig.json               # Cấu hình TypeScript
|-- vite.config.ts              # Cấu hình Vite + TanStack + Cloudflare
|-- wrangler.jsonc              # Cấu hình Cloudflare Workers
|-- eslint.config.js            # Cấu hình ESLint
|-- .prettierrc                 # Cấu hình Prettier
```

---

## Hướng dẫn cài đặt

### Yêu cầu hệ thống

- **Node.js**: Phiên bản 18.0 trở lên
- **npm** hoặc **bun**: Trình quản lý gói

### Các bước cài đặt

1. **Clone repository**

```bash
git clone https://github.com/lightning09512/CryptoNest-Wallet.git
cd CryptoNest-Wallet
```

2. **Cài đặt dependencies**

```bash
npm install
```

Hoặc sử dụng Bun:

```bash
bun install
```

3. **Chạy môi trường phát triển**

```bash
npm run dev
```

Ứng dụng sẽ khởi động tại `http://localhost:5173` (hoặc port khác nếu 5173 đã được sử dụng).

4. **Build production**

```bash
npm run build
```

5. **Xem trước bản build**

```bash
npm run preview
```

### Scripts có sẵn

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Khởi động dev server với hot reload |
| `npm run build` | Build production |
| `npm run build:dev` | Build development mode |
| `npm run preview` | Xem trước bản build production |
| `npm run lint` | Kiểm tra code với ESLint |
| `npm run format` | Định dạng code với Prettier |

---

## Hướng dẫn sử dụng

### Tạo ví mới

1. Mở ứng dụng tại `http://localhost:5173`.
2. Bấm nút **"Create a new wallet"**.
3. Nhập mã PIN 4 số (dùng để bảo vệ ví).
4. Tuỳ chỉnh username hoặc giữ mặc định.
5. **Ghi lại Seed Phrase 12 từ** — đây là cách duy nhất để khôi phục ví.
6. Bấm **"I Saved It"** rồi bấm **"Get Started"**.

### Nhập ví có sẵn

1. Bấm **"I already have a wallet"**.
2. Nhập 12 từ Seed Phrase vào các ô tương ứng (hỗ trợ paste tất cả cùng lúc).
3. Thiết lập PIN và username.

### Nhận ETH testnet miễn phí

1. Từ trang Portfolio, bấm **"Get Testnet ETH"** để truy cập Sepolia Faucet.
2. Hoặc vào trang `/receive` để sao chép địa chỉ ví.
3. Dán địa chỉ vào Sepolia Faucet (sepoliafaucet.com) để nhận ETH miễn phí.

### Gửi ETH

1. Bấm nút **Send** từ trang Portfolio.
2. Chọn token cần gửi (ETH hoặc KCOIN).
3. Nhập địa chỉ người nhận và số lượng.
4. Bấm **"Confirm Send"** — giao dịch sẽ được ký và gửi lên blockchain Sepolia.

### Sử dụng Terminal giao dịch

1. Từ trang Portfolio, bấm vào banner **"Meet Phantom Terminal"**.
2. Chọn cặp giao dịch (VD: ETHUSDT, BTCUSDT).
3. Chọn **Long** (mua lên) hoặc **Short** (bán xuống).
4. Nhập số lượng và điều chỉnh đòn bẩy (1x-50x).
5. Bấm nút đặt lệnh. Vị thế sẽ hiển thị trong bảng phía dưới với PnL cập nhật theo thời gian thực.
6. Bấm **"Đóng"** để đóng vị thế và tính lãi/lỗ.

---

## API và dữ liệu thị trường

### CoinGecko API

- **Endpoint**: `https://api.coingecko.com/api/v3/simple/price`
- **Dữ liệu**: Giá USD và biến động 24h của BTC, ETH, BNB, XRP, SOL, DOGE.
- **Tần suất**: Cập nhật mỗi 60 giây.
- **Giới hạn**: API miễn phí có giới hạn số lượng request.

### Binance WebSocket

- **Endpoint**: `wss://stream.binance.com:9443/ws/{symbol}@ticker`
- **Dữ liệu**: Giá real-time của cặp giao dịch (VD: ethusdt, btcusdt).
- **Dự phòng**: Nếu WebSocket thất bại, tự động chuyển sang REST API (`api.binance.com`) mỗi 2 giây.

### Binance Futures API

- **Endpoint**: `https://fapi.binance.com/fapi/v1/premiumIndex`
- **Dữ liệu**: Tỷ lệ funding rate thực tế cho các cặp giao dịch futures.
- **Tần suất**: Cập nhật mỗi 60 giây.

### Etherscan API V2

- **Endpoint**: `https://api.etherscan.io/v2/api`
- **Chain ID**: 11155111 (Sepolia)
- **Dữ liệu**: Lịch sử giao dịch (normal + internal transactions).
- **Lưu ý**: Sử dụng API key. Lịch sử giao dịch giới hạn 50 giao dịch gần nhất.

### Sepolia RPC

- **Endpoint**: `https://ethereum-sepolia-rpc.publicnode.com`
- **Mục đích**: Lấy số dư ví, gửi giao dịch ETH.
- **Thư viện**: ethers.js `JsonRpcProvider`.

---

## Bảo mật

### Lưu trữ dữ liệu

- **Private Key và Seed Phrase** được lưu trong `localStorage` của trình duyệt thông qua Zustand persist middleware.
- **Mã PIN** cũng được lưu trong localStorage để xác thực khi mở khoá.
- **Không có backend**: Toàn bộ dữ liệu ví lưu trữ phía client, không được gửi lên bất kỳ server nào.

### Cảnh báo bảo mật

- Dự án này chỉ phục vụ mục đích **học tập và nghiên cứu**. **KHÔNG** sử dụng cho ví chứa tài sản thực trên mainnet.
- Việc lưu Private Key trong localStorage không an toàn cho môi trường production. Các ví tiền điện tử thực sử dụng các phương pháp mã hoá tiên tiến hơn (Secure Enclave, hardware wallet, encrypted keystore).
- Không chia sẻ Seed Phrase hoặc Private Key với bất kỳ ai.

---

## Giới hạn và lưu ý

1. **Chỉ hỗ trợ Sepolia Testnet**: Ứng dụng chỉ tương tác với mạng Ethereum Sepolia. Không gửi tài sản thực (mainnet) đến địa chỉ trong ứng dụng.
2. **Swap mô phỏng**: Chức năng swap không tương tác với smart contract thực (ngoại trừ ETH). Token ảo (KCOIN, BTC, BNB, ...) chỉ xử lý nội bộ trong store.
3. **Futures mô phỏng**: Giao dịch futures không tương tác với sàn giao dịch thực. Số dư giao dịch ($10,000 mặc định) là tài khoản ảo.
4. **NFT mô phỏng**: Dữ liệu NFT là mock data, không lấy từ blockchain thực.
5. **Giá token hiển thị**: Giá BTC, ETH, BNB, SOL, XRP, DOGE là giá thực từ CoinGecko/Binance. Các token khác hiển thị giá mặc định.
6. **Không hỗ trợ đa mạng**: Hiện tại chỉ hỗ trợ mạng Sepolia, chưa hỗ trợ chuyển đổi giữa các mạng khác (Mainnet, Goerli, BSC, ...).

---

## Đóng góp

1. Fork repository.
2. Tạo branch mới: `git checkout -b feature/ten-tinh-nang`.
3. Commit thay đổi: `git commit -m "Mô tả thay đổi"`.
4. Push lên branch: `git push origin feature/ten-tinh-nang`.
5. Tạo Pull Request.

### Quy tắc code

- Sử dụng TypeScript strict mode.
- Tuân thủ ESLint và Prettier config của dự án.
- Đặt tên component bằng PascalCase, đặt tên file bằng kebab-case.
- Sử dụng path alias `@/` cho tất cả import từ thư mục `src/`.

---

## Giấy phép

Dự án này được phát triển cho mục đích học tập trong khuôn khổ môn học **Lập và Quản lý Dự án Công nghệ Thông tin**.

---

## Thông tin liên hệ

- **Dự án**: CryptoNest Wallet
- **Repository**: [github.com/lightning09512/CryptoNest-Wallet](https://github.com/lightning09512/CryptoNest-Wallet)
