# CryptoNest Wallet

**CryptoNest Wallet** la mot ung dung vi tien dien tu Web3 duoc xay dung nham phuc vu muc dich hoc tap va nghien cuu trong linh vuc Blockchain. Ung dung cho phep nguoi dung tao vi, quan ly tai san, gui/nhan ETH tren mang Ethereum Sepolia Testnet, swap token, theo doi gia thi truong theo thoi gian thuc, giao dich Futures voi don bay len den 50x, va kham pha NFT — tat ca trong mot giao dien hien dai, toi uu cho thiet bi di dong.

---

## Muc luc

- [Tong quan du an](#tong-quan-du-an)
- [Tinh nang chinh](#tinh-nang-chinh)
- [Kien truc he thong](#kien-truc-he-thong)
- [Cong nghe su dung](#cong-nghe-su-dung)
- [Cau truc thu muc](#cau-truc-thu-muc)
- [Huong dan cai dat](#huong-dan-cai-dat)
- [Huong dan su dung](#huong-dan-su-dung)
- [API va du lieu thi truong](#api-va-du-lieu-thi-truong)
- [Bao mat](#bao-mat)
- [Gioi han va luu y](#gioi-han-va-luu-y)
- [Dong gop](#dong-gop)
- [Giay phep](#giay-phep)

---

## Tong quan du an

CryptoNest Wallet la san pham thuoc mon hoc **Lap va Quan ly Du an Cong nghe Thong tin**. Du an mo phong mot vi tien dien tu phi tap trung (non-custodial wallet) tuong tu Phantom, MetaMask, hoac Trust Wallet, ket noi truc tiep voi mang Ethereum Sepolia Testnet de thuc hien cac giao dich thuc tren blockchain.

Ung dung duoc thiet ke theo phong cach mobile-first voi giao dien toi (dark theme), lay cam hung tu cac vi tien dien tu hang dau hien nay.

### Dac diem noi bat

- **Vi thuc (Non-custodial)**: Tao vi bang Ethers.js, sinh Seed Phrase 12 tu va Private Key. Nguoi dung co toan quyen kiem soat khoa rieng cua minh.
- **Giao dich thuc tren Blockchain**: Gui/nhan ETH tren mang Sepolia Testnet thong qua RPC cong cong, ky giao dich truc tiep tu trinh duyet.
- **Du lieu thi truong theo thoi gian thuc**: Tich hop CoinGecko API va Binance WebSocket de cap nhat gia cac dong tien dien tu lien tuc.
- **Giao dich Futures mo phong**: Terminal giao dich chuyen nghiep voi bieu do TradingView, ho tro Long/Short voi don bay tu 1x-50x.
- **Trien khai tren Cloudflare Workers**: Server-Side Rendering (SSR) tren Cloudflare edge network.

---

## Tinh nang chinh

### 1. Quan ly vi (Wallet Management)

- **Tao vi moi**: Sinh ngau nhien vi Ethereum (Seed Phrase 12 tu + Private Key) bang thu vien `ethers.js`.
- **Nhap vi**: Ho tro nhap vi tu Seed Phrase (12 tu) hoac Private Key co san.
- **Bao ve bang PIN**: Nguoi dung thiet lap ma PIN 4 so de bao ve vi. Vi tu dong khoa khi tai trang va yeu cau nhap PIN de mo khoa.
- **Dat ten nguoi dung**: Tao username ngau nhien hoac tu tuy chinh.
- **Xuat khoa**: Xem lai Seed Phrase hoac Private Key bat ky luc nao tu giao dien.
- **Dang xuat/Xoa vi**: Xoa toan bo du lieu vi khoi bo nho cuc bo.

### 2. Quan ly tai san (Portfolio)

- **Hien thi so du tong**: Tinh tong gia tri USD cua tat ca tai san (ETH thuc + token ao).
- **Danh sach token**: Hien thi BTC, ETH, BNB, XRP, SOL, DOGE voi gia thuc tu CoinGecko, va token tuy chinh KCOIN.
- **Cap nhat so du ETH thuc**: Goi truc tiep den node Sepolia de lay so du on-chain moi nhat cua dia chi vi.
- **Gia thi truong real-time**: Tu dong cap nhat gia tu CoinGecko API moi 60 giay.

### 3. Gui tien (Send)

- **Gui ETH thuc**: Ky va gui giao dich ETH tren mang Sepolia Testnet. Giao dich duoc phat song len blockchain thuc su.
- **Gui token ao**: Ho tro gui KCOIN va cac token ao khac (xu ly noi bo).
- **Hien thi gia tri USD tuong duong**: Tu dong chuyen doi so luong token sang gia tri USD.
- **Xac nhan tren Etherscan**: Sau khi gui ETH thanh cong, cung cap link truc tiep den Sepolia Etherscan de xac minh giao dich.

### 4. Nhan tien (Receive)

- **Ma QR**: Sinh ma QR tu dong tu dia chi vi de chia se nhanh.
- **Sao chep dia chi**: Nut sao chep dia chi vi vao clipboard.
- **Canh bao mang**: Nhac nho nguoi dung chi gui token tren mang Sepolia Testnet.
- **Lien ket Faucet**: Lien ket truc tiep den Sepolia Faucet de nhan ETH testnet mien phi.

### 5. Swap token

- **Giao dien swap truc quan**: Chon token nguon va token dich, nhap so luong va swap.
- **Tinh toan ty gia tu dong**: Chuyen doi gia tri dua tren gia thi truong thuc.
- **Ho tro nhieu token**: Swap giua ETH, BTC, BNB, SOL, XRP, DOGE, KCOIN va nhieu token khac.
- **Modal chon token**: Giao dien bottom sheet de chon token voi thong tin gia va so du.
- **Thong tin xu huong**: Hien thi danh sach token xu huong voi gia va bien dong 24h.

### 6. Terminal giao dich Futures

Day la tinh nang noi bat nhat cua CryptoNest, mo phong mot san giao dich phai sinh chuyen nghiep:

- **Bieu do TradingView**: Tich hop widget TradingView chinh thuc voi du cac cong cu ve, chi bao ky thuat, va nhieu khung thoi gian (1m, 5m, 15m, 1h, 4h, 1D, 1W).
- **Gia real-time qua WebSocket**: Ket noi truc tiep den Binance WebSocket Stream (`wss://stream.binance.com`) de nhan gia moi nhat theo thoi gian thuc, voi co che du phong (fallback) goi REST API moi 2 giay.
- **Giao dich Long/Short**: Mo vi the Long (mua len) hoac Short (ban xuong) voi don bay tu tuy chinh.
- **Don bay len den 50x**: Chon muc don bay tu 1x den 50x cho moi vi the.
- **Quan ly vi the**: Xem tat ca cac vi the dang mo voi thong tin chi tiet: gia vao, gia hien tai, gia thanh ly, ky quy, lai/lo (PnL) tinh theo thoi gian thuc.
- **Dong vi the**: Dong tung vi the hoac dong toan bo cung luc.
- **Nhieu cap giao dich**: Ho tro BTC, ETH, SOL, BNB, XRP, ADA, AVAX, DOT, LINK, NEAR.
- **Funding Rate thuc**: Lay ty le funding rate thuc tu Binance Futures API, dem nguoc thoi gian den phien funding tiep theo.
- **Lich su giao dich**: Luu tru lich su dat lenh, lich su giao dich, va lich su dong von vao localStorage.
- **Banner vi the tren bieu do**: Hien thi banner vi the dang mo truc tiep tren bieu do voi thong tin lai/lo real-time.

### 7. Lich su giao dich (Activity)

- **Lich su on-chain**: Goi Etherscan API (V2, chainid Sepolia) de lay lich su giao dich thuc tu blockchain, bao gom ca giao dich internal.
- **Lich su noi bo**: Ket hop giao dich noi bo (swap, gui token ao) voi giao dich on-chain.
- **Loai bo trung lap**: Tu dong deduplicate giao dich theo transaction hash.
- **Phan nhom theo ngay**: Hien thi giao dich theo nhom ngay, sap xep tu moi den cu.
- **Lien ket Etherscan**: Moi giao dich co the bam vao de xem chi tiet tren Sepolia Etherscan.

### 8. NFT Explorer

- **Tab Collections**: Hien thi cac bo suu tap xu huong va hang dau voi floor price, volume, va bien dong.
- **Tab Trending**: Danh sach cac bo suu tap dang thong hanh.
- **Tab Categories**: Phan loai NFT theo the loai: Art, Gaming, PFP, Music.
- **Tab Marketplace**: Lien ket den cac san NFT: Tensor, Magic Eden, OpenSea, Solanart.
- **Tab Learn**: Noi dung hoc tap ve NFT: NFT Basics, How to Mint, NFT Security.

### 9. Explore (Kham pha)

- **Tim kiem**: Thanh tim kiem token va trang web.
- **Phan loai**: Danh muc nhanh: Tokens, Perps, Lists, Sites.
- **Trang xu huong**: Hien thi cac trang web DeFi dang thong hanh: Jupiter, pump.fun, Zealy.
- **Hoc tap**: Noi dung hoc tap ve Liquid Staking, Monad, phuong thuc thanh toan moi.

### 10. Man hinh khoa (Lock Screen)

- **Tu dong khoa**: Vi tu dong khoa khi tai lai trang.
- **Nhap PIN**: Giao dien nhap 4 cham PIN truc quan, tu dong mo khoa khi nhap du.
- **Dat lai vi**: Tuy chon xoa vi va dat lai neu quen PIN.

---

## Kien truc he thong

```
+-----------------------------------------------------------+
|                     Trinh duyet (Client)                   |
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
|  | (web3)  |      | (gia token)    |    | (gia RT)    |     |
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

### Luong du lieu

1. **Tao vi**: `ethers.Wallet.createRandom()` -> luu vao Zustand store (persist localStorage).
2. **Lay so du**: `ethers.JsonRpcProvider` goi den Sepolia RPC -> format tu Wei sang ETH.
3. **Gui ETH**: `ethers.Wallet.sendTransaction()` -> ky va phat giao dich len Sepolia.
4. **Gia token**: CoinGecko REST API moi 60 giay + Binance WebSocket cho gia real-time.
5. **Futures**: Mo/dong vi the trong Zustand store, tinh PnL dua tren gia hien tai tu WebSocket.

---

## Cong nghe su dung

### Frontend

| Cong nghe | Phien ban | Muc dich |
|-----------|-----------|----------|
| React | 19.2 | Thu vien UI chinh |
| TypeScript | 5.8 | Ngon ngu lap trinh |
| TanStack Router | 1.168 | Dinh tuyen phia client va server |
| TanStack Start | 1.167 | Framework full-stack (SSR) |
| TanStack React Query | 5.83 | Quan ly trang thai server |
| Zustand | 5.0 | Quan ly trang thai toan cuc |
| Tailwind CSS | 4.2 | Framework CSS utility-first |
| Radix UI | Nhieu | Thu vien component headless (46 component) |
| shadcn/ui | New York style | He thong component UI xay dung tren Radix |
| Lucide React | 0.575 | Thu vien icon |
| Recharts | 2.15 | Bieu do va do thi |
| Sonner | 2.0 | He thong thong bao toast |
| Vaul | 1.1 | Component Drawer |

### Web3 va Blockchain

| Cong nghe | Phien ban | Muc dich |
|-----------|-----------|----------|
| ethers.js | 6.16 | Tuong tac blockchain Ethereum |
| Sepolia Testnet | - | Mang test Ethereum |
| PublicNode RPC | - | Node RPC cong cong cho Sepolia |

### API ben ngoai

| API | Muc dich |
|-----|----------|
| CoinGecko API | Lay gia token (BTC, ETH, BNB, XRP, SOL, DOGE) |
| Binance WebSocket | Nhan gia real-time cho terminal giao dich |
| Binance Futures API | Lay funding rate thuc |
| Etherscan API V2 | Lay lich su giao dich on-chain (Sepolia) |
| QR Server API | Sinh ma QR cho dia chi vi |
| TradingView Widget | Bieu do giao dich chuyen nghiep |

### Build va Deployment

| Cong nghe | Phien ban | Muc dich |
|-----------|-----------|----------|
| Vite | 7.3 | Build tool va dev server |
| Cloudflare Workers | - | Nen tang trien khai (SSR edge) |
| Wrangler | - | CLI quan ly Cloudflare Workers |
| ESLint | 9.32 | Kiem tra chat luong code |
| Prettier | 3.7 | Dinh dang code tu dong |

---

## Cau truc thu muc

```
CryptoNest Wallet/
|
|-- public/                     # Tai nguyen tinh
|-- img/                        # Hinh anh token (BTC, ETH, BNB, SOL, XRP, DOGE, KCOIN)
|-- src/
|   |-- assets/                 # Tai nguyen duoc import (logo)
|   |-- components/
|   |   |-- ui/                 # 46 component shadcn/ui (Button, Card, Dialog, ...)
|   |   |-- onboarding-view.tsx # Man hinh gioi thieu va tao vi
|   |   |-- portfolio-view.tsx  # Giao dien portfolio chinh
|   |   |-- wallet-shell.tsx    # Layout bao boc (header, nav, auth guard)
|   |   |-- lock-screen.tsx     # Man hinh khoa PIN
|   |-- hooks/
|   |   |-- use-mobile.tsx      # Hook phat hien thiet bi di dong
|   |-- lib/
|   |   |-- wallet-data.ts      # Dinh nghia Token, Tx, du lieu token mac dinh
|   |   |-- web3.ts             # Ket noi Sepolia RPC, gui giao dich ETH
|   |   |-- utils.ts            # Ham tien ich (cn - class name merge)
|   |   |-- error-capture.ts    # Bat loi phia server
|   |   |-- error-page.ts       # Trang loi HTML
|   |-- routes/
|   |   |-- __root.tsx          # Layout goc (HTML shell, meta tags, providers)
|   |   |-- index.tsx           # Trang chu (Portfolio)
|   |   |-- send-select.tsx     # Chon token de gui
|   |   |-- send.tsx            # Gui token/ETH
|   |   |-- receive.tsx         # Nhan token (QR code)
|   |   |-- swap.tsx            # Swap token
|   |   |-- terminal.tsx        # Terminal giao dich Futures
|   |   |-- activity.tsx        # Lich su giao dich
|   |   |-- explore.tsx         # Kham pha DeFi
|   |   |-- nft.tsx             # NFT Explorer
|   |   |-- nfts.tsx            # Bo suu tap NFT
|   |   |-- buy.tsx             # Mua token
|   |-- store/
|   |   |-- wallet-store.ts     # Zustand store (trang thai toan cuc)
|   |-- router.tsx              # Cau hinh router
|   |-- server.ts               # Entry point SSR (Cloudflare Workers)
|   |-- start.ts                # Diem khoi dong ung dung
|   |-- styles.css              # CSS toan cuc va Tailwind
|   |-- routeTree.gen.ts        # Route tree tu dong sinh boi TanStack Router
|
|-- components.json             # Cau hinh shadcn/ui
|-- package.json                # Dependencies va scripts
|-- tsconfig.json               # Cau hinh TypeScript
|-- vite.config.ts              # Cau hinh Vite + TanStack + Cloudflare
|-- wrangler.jsonc              # Cau hinh Cloudflare Workers
|-- eslint.config.js            # Cau hinh ESLint
|-- .prettierrc                 # Cau hinh Prettier
```

---

## Huong dan cai dat

### Yeu cau he thong

- **Node.js**: Phien ban 18.0 tro len
- **npm** hoac **bun**: Trinh quan ly goi

### Cac buoc cai dat

1. **Clone repository**

```bash
git clone https://github.com/lightning09512/CryptoNest-Wallet.git
cd CryptoNest-Wallet
```

2. **Cai dat dependencies**

```bash
npm install
```

Hoac su dung Bun:

```bash
bun install
```

3. **Chay moi truong phat trien**

```bash
npm run dev
```

Ung dung se khoi dong tai `http://localhost:5173` (hoac port khac neu 5173 da duoc su dung).

4. **Build production**

```bash
npm run build
```

5. **Xem truoc ban build**

```bash
npm run preview
```

### Scripts co san

| Lenh | Mo ta |
|------|-------|
| `npm run dev` | Khoi dong dev server voi hot reload |
| `npm run build` | Build production |
| `npm run build:dev` | Build development mode |
| `npm run preview` | Xem truoc ban build production |
| `npm run lint` | Kiem tra code voi ESLint |
| `npm run format` | Dinh dang code voi Prettier |

---

## Huong dan su dung

### Tao vi moi

1. Mo ung dung tai `http://localhost:5173`.
2. Bam nut **"Create a new wallet"**.
3. Nhap ma PIN 4 so (dung de bao ve vi).
4. Tuy chinh username hoac giu mac dinh.
5. **Ghi lai Seed Phrase 12 tu** — day la cach duy nhat de khoi phuc vi.
6. Bam **"I Saved It"** roi bam **"Get Started"**.

### Nhap vi co san

1. Bam **"I already have a wallet"**.
2. Nhap 12 tu Seed Phrase vao cac o tuong ung (ho tro paste tat ca cung luc).
3. Thiet lap PIN va username.

### Nhan ETH testnet mien phi

1. Tu trang Portfolio, bam **"Get Testnet ETH"** de truy cap Sepolia Faucet.
2. Hoac vao trang `/receive` de sao chep dia chi vi.
3. Dan dia chi vao Sepolia Faucet (sepoliafaucet.com) de nhan ETH mien phi.

### Gui ETH

1. Bam nut **Send** tu trang Portfolio.
2. Chon token can gui (ETH hoac KCOIN).
3. Nhap dia chi nguoi nhan va so luong.
4. Bam **"Confirm Send"** — giao dich se duoc ky va gui len blockchain Sepolia.

### Su dung Terminal giao dich

1. Tu trang Portfolio, bam vao banner **"Meet Phantom Terminal"**.
2. Chon cap giao dich (VD: ETHUSDT, BTCUSDT).
3. Chon **Long** (mua len) hoac **Short** (ban xuong).
4. Nhap so luong va dieu chinh don bay (1x-50x).
5. Bam nut dat lenh. Vi the se hien thi trong bang phia duoi voi PnL cap nhat theo thoi gian thuc.
6. Bam **"Dong"** de dong vi the va tinh lai/lo.

---

## API va du lieu thi truong

### CoinGecko API

- **Endpoint**: `https://api.coingecko.com/api/v3/simple/price`
- **Du lieu**: Gia USD va bien dong 24h cua BTC, ETH, BNB, XRP, SOL, DOGE.
- **Tan suat**: Cap nhat moi 60 giay.
- **Gioi han**: API mien phi co gioi han so luong request.

### Binance WebSocket

- **Endpoint**: `wss://stream.binance.com:9443/ws/{symbol}@ticker`
- **Du lieu**: Gia real-time cua cap giao dich (VD: ethusdt, btcusdt).
- **Du phong**: Neu WebSocket that bai, tu dong chuyen sang REST API (`api.binance.com`) moi 2 giay.

### Binance Futures API

- **Endpoint**: `https://fapi.binance.com/fapi/v1/premiumIndex`
- **Du lieu**: Ty le funding rate thuc te cho cac cap giao dich futures.
- **Tan suat**: Cap nhat moi 60 giay.

### Etherscan API V2

- **Endpoint**: `https://api.etherscan.io/v2/api`
- **Chain ID**: 11155111 (Sepolia)
- **Du lieu**: Lich su giao dich (normal + internal transactions).
- **Luu y**: Su dung API key. Lich su giao dich gioi han 50 giao dich gan nhat.

### Sepolia RPC

- **Endpoint**: `https://ethereum-sepolia-rpc.publicnode.com`
- **Muc dich**: Lay so du vi, gui giao dich ETH.
- **Thu vien**: ethers.js `JsonRpcProvider`.

---

## Bao mat

### Luu tru du lieu

- **Private Key va Seed Phrase** duoc luu trong `localStorage` cua trinh duyet thong qua Zustand persist middleware.
- **Ma PIN** cung duoc luu trong localStorage de xac thuc khi mo khoa.
- **Khong co backend**: Toan bo du lieu vi luu tru phia client, khong duoc gui len bat ky server nao.

### Canh bao bao mat

- Du an nay chi phuc vu muc dich **hoc tap va nghien cuu**. **KHONG** su dung cho vi chua tai san thuc tren mainnet.
- Viec luu Private Key trong localStorage khong an toan cho moi truong production. Cac vi tien dien tu thuc su dung cac phuong phap ma hoa tien tien hon (Secure Enclave, hardware wallet, encrypted keystore).
- Khong chia se Seed Phrase hoac Private Key voi bat ky ai.

---

## Gioi han va luu y

1. **Chi ho tro Sepolia Testnet**: Ung dung chi tuong tac voi mang Ethereum Sepolia. Khong gui tai san thuc (mainnet) den dia chi trong ung dung.
2. **Swap mo phong**: Chuc nang swap khong tuong tac voi smart contract thuc (ngoai tru ETH). Token ao (KCOIN, BTC, BNB, ...) chi xu ly noi bo trong store.
3. **Futures mo phong**: Giao dich futures khong tuong tac voi san giao dich thuc. So du giao dich ($10,000 mac dinh) la tai khoan ao.
4. **NFT mo phong**: Du lieu NFT la mock data, khong lay tu blockchain thuc.
5. **Gia token hien thi**: Gia BTC, ETH, BNB, SOL, XRP, DOGE la gia thuc tu CoinGecko/Binance. Cac token khac hien thi gia mac dinh.
6. **Khong ho tro da mang**: Hien tai chi ho tro mang Sepolia, chua ho tro chuyen doi giua cac mang khac (Mainnet, Goerli, BSC, ...).

---

## Dong gop

1. Fork repository.
2. Tao branch moi: `git checkout -b feature/ten-tinh-nang`.
3. Commit thay doi: `git commit -m "Mo ta thay doi"`.
4. Push len branch: `git push origin feature/ten-tinh-nang`.
5. Tao Pull Request.

### Quy tac code

- Su dung TypeScript strict mode.
- Tuan thu ESLint va Prettier config cua du an.
- Dat ten component bang PascalCase, dat ten file bang kebab-case.
- Su dung path alias `@/` cho tat ca import tu thu muc `src/`.

---

## Giay phep

Du an nay duoc phat trien cho muc dich hoc tap trong khuon kho mon hoc **Lap va Quan ly Du an Cong nghe Thong tin**.

---

## Thong tin lien he

- **Du an**: CryptoNest Wallet
- **Repository**: [github.com/lightning09512/CryptoNest-Wallet](https://github.com/lightning09512/CryptoNest-Wallet)
