<p align="center">
  <img src="https://img.shields.io/badge/Creditcoin-Testnet-00C896?style=for-the-badge&logo=ethereum&logoColor=white" />
  <img src="https://img.shields.io/badge/Solidity-0.8.20-363636?style=for-the-badge&logo=solidity&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Ethers.js-6-7B3FE4?style=for-the-badge&logo=ethers&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
</p>

<h1 align="center">🚀 CrediProcure</h1>
<h3 align="center">Decentralized B2B Invoice Financing Platform Powered by Real World Assets (RWA) on Creditcoin</h3>

<p align="center">
  <i>Unlocking instant liquidity for businesses. Delivering transparent, high-yield opportunities for investors. All on-chain.</i>
</p>

---

## 🌍 The Problem

Small and Medium Enterprises (SMEs) globally face a **$3.6 trillion trade finance gap.** Traditional invoice financing is slow, opaque, and inaccessible. Businesses wait 30–90 days to get paid, while investors have limited access to stable, real-world-backed yield opportunities in DeFi.

**Key Pain Points:**
- 🐌 **Slow Settlements**: SMEs wait months to receive payment, crippling cash flow.
- 🔒 **Limited Access**: Traditional factoring requires extensive paperwork & intermediaries.
- 🙈 **Opaque Processes**: Lack of transparency in pricing, fees, and funding status.
- 📉 **DeFi Yield Gap**: DeFi investors seek stable, real-world-backed yields beyond volatile crypto assets.

---

## ✅ Our Solution: CrediProcure

CrediProcure is a **fully decentralized, end-to-end invoice financing platform** that bridges the gap between B2B vendors and global DeFi investors through **Real World Asset (RWA) tokenization** on the **Creditcoin Network**.

### How It Works (4 Simple Steps)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  1. CREATE   │────▶│   2. MINT    │────▶│   3. FUND    │────▶│  4. REPAY    │
│   Invoice    │     │  as RWA NFT  │     │  by Investor │     │  + Interest  │
│  (Vendor)    │     │  (On-Chain)  │     │  (DeFi Pool) │     │  (Auto-Dist) │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

1. **Vendor** creates an invoice (e.g., $10,000 payment due from a client).
2. **Invoice is Minted** as an ERC-721 NFT (RWA Token) on Creditcoin, with immutable on-chain data.
3. **Investors** browse the marketplace and fund the invoice (up to 85% LTV), earning yield.
4. **Upon repayment**, the smart contract automatically distributes principal + interest to investors.

---

## ✨ Key Features

### 🏢 Vendor Portal (Borrowers)
| Feature | Description |
|:---|:---|
| **📊 Real-Time Dashboard** | Live stats on total invoice value, funded amounts, and pending funding — all from the blockchain. |
| **📄 Invoice Creation & Minting** | Create invoice drafts, then mint them as ERC-721 RWA tokens on Creditcoin with one click. |
| **💧 Liquidity Request** | Select a minted invoice and request up to 85% LTV funding from the investor marketplace. |
| **📦 Inventory Management** | Track procurement stock with persistent add, edit, and delete functionality. |
| **🛡️ KYB Verification** | Interactive Know-Your-Business verification flow with persistent status. |
| **📈 On-Chain Credit History** | Full transaction history fetched from real blockchain events (`InvoiceMinted`, `InvoiceFunded`). |

### 💰 Investor Portal (Lenders)
| Feature | Description |
|:---|:---|
| **🏪 Invoice Marketplace** | Browse all available RWA invoices on-chain, filter by risk level, and fund with stablecoins. |
| **📊 Yield Portfolio** | Track all funded invoices, earned yields, and maturity dates with live pie chart allocation. |
| **🏦 Liquidity Pool** | Deposit stablecoins into the lending pool to earn passive yields from invoice financing. |
| **📉 Yield Performance Chart** | Visual chart showing projected and historical yield performance. |
| **🔗 Direct P2P Funding** | Fund specific invoices directly (peer-to-peer) or via the pooled liquidity model. |

### 🔗 Blockchain & Web3
| Feature | Description |
|:---|:---|
| **🦊 MetaMask Integration** | One-click wallet connection with automatic Creditcoin Testnet detection. |
| **⛓️ Live On-Chain Data** | All dashboard stats, invoices, and history are fetched directly from deployed smart contracts. |
| **🌙 Dark/Light Mode** | Premium glassmorphism UI with full theme support. |
| **📱 Responsive Design** | Fully responsive across desktop, tablet, and mobile devices. |

---

## 🏗️ Smart Contract Architecture

Our protocol consists of **3 core smart contracts** deployed on the **Creditcoin Testnet**, built with OpenZeppelin standards for security and composability.

```
┌─────────────────────────────────────────────────────────────────┐
│                     CREDIPROCURE PROTOCOL                       │
├─────────────────────┬──────────────────┬────────────────────────┤
│   InvoiceNFT.sol    │  LendingPool.sol │  MockStablecoin.sol   │
│   (ERC-721)         │  (Core Engine)   │  (ERC-20 Test Token)  │
├─────────────────────┼──────────────────┼────────────────────────┤
│ • mintInvoice()     │ • deposit()      │ • mint()              │
│ • getInvoice()      │ • withdraw()     │ • transfer()          │
│ • setFunded()       │ • fundInvoice()  │ • approve()           │
│ • invoices mapping  │ • fundDirect()   │                       │
│ • ERC721Enumerable  │ • repay()        │                       │
│ • totalSupply()     │ • lpBalances     │                       │
│ • tokenByIndex()    │ • totalLiquidity │                       │
└─────────────────────┴──────────────────┴────────────────────────┘
```

### `InvoiceNFT.sol` — Real World Asset Token (ERC-721 + Enumerable)
- **Purpose**: Represents a real-world invoice as an on-chain NFT.
- **Data Stored On-Chain**: `id`, `vendor`, `amount`, `dueDate`, `yieldRate`, `isFunded`.
- **Key Functions**:
  - `mintInvoice(to, amount, dueDate, yieldRate)` → Mints a new invoice RWA token.
  - `getInvoice(tokenId)` → Returns full invoice data struct.
  - `setFunded(tokenId, status)` → Called by LendingPool to mark as funded.
  - `tokenByIndex(i)` / `totalSupply()` → Enumerable support for marketplace indexing.

### `LendingPool.sol` — Liquidity Engine
- **Purpose**: Manages the flow of capital between investors and vendors.
- **Dual Funding Model**:
  - **Pool Model**: Investors deposit stablecoins → Pool funds invoices automatically.
  - **P2P Model**: Investors fund specific invoices directly via `fundInvoiceDirect()`.
- **Key Functions**:
  - `deposit(amount)` → Investor deposits stablecoins into the pool.
  - `withdraw(amount)` → Investor withdraws from the pool.
  - `fundInvoice(tokenId)` → Admin/DAO funds an invoice from pool reserves.
  - `fundInvoiceDirect(tokenId)` → P2P: Investor funds a specific invoice directly.
  - `repay(tokenId, amount)` → Vendor repays loan, interest distributed to LPs.

### `MockStablecoin.sol` — Test ERC-20 Token
- **Purpose**: Simulates USDC/USDT for testnet operations.
- Standard OpenZeppelin ERC-20 with public `mint()` for testing.

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|:---|:---|:---|
| **Frontend Framework** | React + Vite | 19.2 + 7.2 |
| **Language** | TypeScript | 5.9 |
| **Styling** | Tailwind CSS | 4.1 |
| **Charts & Data Viz** | Recharts | 3.7 |
| **Icons** | Lucide React | 0.564 |
| **Web3 Library** | Ethers.js | 6.16 |
| **Wallet** | MetaMask | Latest |
| **Blockchain** | Creditcoin Testnet | — |
| **Smart Contracts** | Solidity + Hardhat | 0.8.20 |
| **Contract Standards** | OpenZeppelin | 5.x |
| **State Management** | React Context API | — |
| **Routing** | React Router DOM | 7.x |

---

## 📂 Project Structure

```
CrediProcure/
├── 📄 index.html                          # Entry point
├── 📄 package.json                        # Frontend dependencies
├── 📄 vite.config.ts                      # Vite build configuration
├── 📄 tsconfig.json                       # TypeScript configuration
│
├── 📁 src/                                # Frontend Source Code
│   ├── 📄 main.tsx                        # React entry point
│   ├── 📄 App.tsx                         # Router & app shell
│   ├── 📄 index.css                       # Global styles & design tokens
│   │
│   ├── 📁 pages/                          # Application Pages (10 pages)
│   │   ├── 📄 VendorDashboard.tsx         # Vendor analytics — live blockchain data
│   │   ├── 📄 InvestorDashboard.tsx       # Investor analytics — live blockchain data
│   │   ├── 📄 Invoices.tsx                # Invoice CRUD + RWA minting (on-chain)
│   │   ├── 📄 Marketplace.tsx             # Browse & fund invoices (on-chain)
│   │   ├── 📄 LiquidityPool.tsx           # LP deposit/withdraw (on-chain)
│   │   ├── 📄 LiquidityRequest.tsx        # Request funding for minted invoices
│   │   ├── 📄 Portfolio.tsx               # Yield tracking + pie chart
│   │   ├── 📄 Inventory.tsx               # Procurement stock management
│   │   ├── 📄 KYB.tsx                     # KYB verification flow
│   │   └── 📄 CreditHistory.tsx           # On-chain credit history via events
│   │
│   ├── 📁 components/                     # Shared UI Components
│   │   └── 📄 Layout.tsx                  # App shell: sidebar, header, navigation
│   │
│   ├── 📁 context/                        # React Context Providers
│   │   ├── 📄 WalletContext.tsx           # MetaMask + contract instances
│   │   └── 📄 ThemeContext.tsx            # Dark/light mode toggle
│   │
│   ├── 📁 abis/                           # Contract ABI Files
│   │   ├── 📄 InvoiceNFT.json            # InvoiceNFT ABI
│   │   ├── 📄 LendingPool.json           # LendingPool ABI
│   │   └── 📄 MockStablecoin.json        # MockStablecoin ABI
│   │
│   ├── 📁 types/                          # TypeScript Interfaces
│   │   └── 📄 index.ts                   # Invoice, Vendor, Investment types
│   │
│   └── 📁 utils/                          # Utility Functions
│       └── 📄 cn.ts                       # Tailwind class merge helper
│
├── 📁 smart-contracts/                    # Blockchain Backend
│   ├── 📄 hardhat.config.ts               # Hardhat config (Creditcoin Testnet)
│   ├── 📄 package.json                    # Smart contract dependencies
│   │
│   ├── 📁 contracts/                      # Solidity Source Files
│   │   ├── 📄 InvoiceNFT.sol              # ERC-721 RWA Invoice Token
│   │   ├── 📄 LendingPool.sol             # Liquidity pool + P2P funding
│   │   └── 📄 MockStablecoin.sol          # Test ERC-20 stablecoin
│   │
│   ├── 📁 scripts/                        # Deployment Scripts
│   │   └── 📄 deploy.ts                   # Automated deployment script
│   │
│   ├── 📁 test/                           # Unit Tests
│   │   └── 📄 InvoiceNFT.test.ts          # Contract test suite
│   │
│   └── 📁 artifacts/                      # Compiled contract artifacts
│       └── ...
│
└── 📄 README.md                           # This file
```

---

## ⚡ Technical Highlights: Handling Real-World Latency

Building on a Testnet often involves RPC latency and indexing delays. CrediProcure implements **Advanced UX Patterns** to ensure a seamless experience despite blockchain lag:

### 1. 🔄 Hybrid Data Fetching Engine
The application uses a **Dual-Source Truth** system for invoices:
- **Source A (Blockchain)**: The ultimate source of truth via RPC calls.
- **Source B (Local Optimistic Storage)**: Immediate capture of "Minted" status locally.
- **The Engine**: Automatically merges both sources, deduplicates, and presents a unified view. This means **Zero Waiting Time** for users after minting.

### 2. 🚀 Optimistic UI Updates
We don't make users wait for block confirmations to see progress.
- **Instant Feedback**: Creating a draft or minting an invoice updates the UI immediately.
- **Background Synchronization**: The app polls the blockchain in the background to confirm stability without freezing the interface.

### 3. 🛡️ Real-Time System Diagnostics
Transparencry is key. We included a **Live Debug Panel** in the `Liquidity Request` page that shows:
- **Wallet Connection Strength**
- **On-Chain vs. Local Data Sync Status**
- **Real-Time RPC Fetching Indicators**

*This architecture ensures CrediProcure is robust enough for real-world usage where network conditions are unpredictable.*

---

## 🗺️ Development Roadmap

| Phase | Milestone | Deliverables | Status |
|:---:|:---|:---|:---:|
| **1** | 🎨 UI/UX Design & Prototyping | Wireframes, user flows, component library, responsive layout | ✅ Done |
| **2** | ⛓️ Smart Contract Development | InvoiceNFT (ERC-721), LendingPool, MockStablecoin, unit tests | ✅ Done |
| **3** | 🔗 Web3 Integration | MetaMask wallet connect, contract integration, live data fetching | ✅ Done |
| **4** | 🚀 Live Feature Activation | Replace all mock data with blockchain reads/writes, LocalStorage persistence | ✅ Done |
| **5** | 🌐 Deployment & Submission | Creditcoin Testnet deployment, Vercel hosting, demo video, pitch deck | ✅ Done |
| **6** | 📈 Future: Mainnet & DAO | Governance token, on-chain credit scoring, multi-chain support | 🔮 Planned |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18.x
- **MetaMask** browser extension
- **CTC** tokens on Creditcoin Testnet ([Faucet](https://faucet.creditcoin.org/))

### 1. Clone & Install

```bash
git clone https://github.com/panzauto46-bot/CrediProcure.git
cd CrediProcure
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Visit **`http://localhost:5173`** — Connect MetaMask to Creditcoin Testnet to interact.

### 3. Smart Contract Development

```bash
cd smart-contracts
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Creditcoin Testnet
# (Ensure .env has your PRIVATE_KEY)
npx hardhat run scripts/deploy.ts --network creditcoinTestnet
```

### 4. Configure Contract Addresses
After deployment, update the addresses in:
```
src/context/WalletContext.tsx → CONTRACT_ADDRESSES
```

---

## 🌐 Network Configuration

| Parameter | Value |
|:---|:---|
| **Network Name** | Creditcoin Testnet |
| **RPC URL** | `https://rpc.cc3-testnet.creditcoin.network` |
| **Chain ID** | `102031` |
| **Currency Symbol** | `CTC` |
| **Block Explorer** | `https://creditcoin-testnet.blockscout.com/` |

---

## 🔐 Security Considerations

- ✅ All smart contracts use **OpenZeppelin** audited libraries.
- ✅ `ReentrancyGuard` on all financial functions (deposit, withdraw, fund, repay).
- ✅ `Ownable` access control on sensitive admin operations.
- ✅ `onlyPool` modifier ensures only the LendingPool can mark invoices as funded.
- ✅ Private keys are stored in `.env` files (excluded from Git via `.gitignore`).
- ⚠️ **Note**: This is a hackathon prototype. Production deployment requires formal smart contract auditing.

---

## 🤝 Why Creditcoin?

CrediProcure is built on **Creditcoin** because it is the **only Layer-1 blockchain purpose-built for credit and lending infrastructure**:

- **Native Credit History**: On-chain credit scoring enables risk assessment without traditional credit bureaus.
- **RWA Focus**: Creditcoin's ecosystem is designed to bridge real-world financial assets with DeFi.
- **EVM Compatible**: Full Solidity support with low transaction costs on testnet.
- **Mission Aligned**: Both CrediProcure and Creditcoin share the mission of **financial inclusion** for underserved businesses globally.

---

## 📊 Impact & Market Opportunity

| Metric | Value |
|:---|:---|
| **Global Trade Finance Gap** | $3.6 Trillion (ADB, 2024) |
| **SMEs Affected** | 40%+ of SMEs in developing nations |
| **Invoice Financing Market** | $4B+ annually |
| **Average Invoice Payment Delay** | 30–90 days |
| **CrediProcure Target Reduction** | < 24 hours |

---

## 👤 Team

| Name | Role |
|:---|:---|
| **Pandu Dargah** | Full-Stack Developer & Founder |

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <b>© 2026 CrediProcure</b> — Built for the Future of Finance on Creditcoin.<br/>
  <i>Unlocking $3.6T in trapped trade finance, one invoice at a time.</i>
</p>

<p align="center">
  <a href="https://github.com/panzauto46-bot/CrediProcure">⭐ Star this repo</a> •
  <a href="https://creditcoin.org">Creditcoin</a> •
  <a href="https://dorahacks.io">DoraHacks</a>
</p>
