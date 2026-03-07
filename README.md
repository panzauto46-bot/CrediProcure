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
3. **Investors** browse the marketplace and fund a full invoice directly or deposit stablecoins into the pool.
4. **Repayment activity** is recorded on-chain and reflected in the vendor credit history plus investor portfolio views.

---

## ✨ Key Features

### 🏢 Vendor Portal (Borrowers)
| Feature | Description |
|:---|:---|
| **📊 Real-Time Dashboard** | Combines on-chain invoice reads with local draft management so vendors can track minted and funded invoices in one place. |
| **📄 Invoice Creation & Minting** | Create invoice drafts locally, then mint them as ERC-721 RWA tokens on Creditcoin from the deployed owner wallet. |
| **💧 Liquidity Request** | Prepare invoice funding terms and review maximum LTV before sharing the request with investors. |
| **📦 Inventory Management** | Track procurement stock with persistent add, edit, and delete functionality. |
| **🛡️ KYB Verification** | Interactive Know-Your-Business verification flow with persistent status. |
| **📈 On-Chain Credit History** | Transaction history fetched from `Transfer`, `InvoiceFunded`, and `LoanRepaid` blockchain events. |

### 💰 Investor Portal (Lenders)
| Feature | Description |
|:---|:---|
| **🏪 Invoice Marketplace** | Browse available RWA invoices on-chain, filter by risk level, and fund a full invoice with stablecoins. |
| **📊 Yield Portfolio** | Track direct funding positions using on-chain funding and repayment events. |
| **🏦 Liquidity Pool** | Deposit and withdraw stablecoins against the deployed lending pool contract. |
| **📉 Yield Performance Chart** | Visual chart showing projected and historical yield performance. |
| **🔗 Direct P2P Funding** | Fund specific invoices directly from the marketplace while the pool remains available for LP-style participation. |

### 🔗 Blockchain & Web3
| Feature | Description |
|:---|:---|
| **🦊 Multi-Wallet Integration** | Connect with MetaMask, Phantom (EVM mode), or Bitget Wallet with automatic Creditcoin Testnet switching. |
| **⛓️ Live On-Chain Data** | Marketplace invoices, LP balances, funding history, and credit history are fetched directly from deployed smart contracts. |
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
| **Wallet** | MetaMask / Phantom (EVM) / Bitget | Latest |
| **Blockchain** | Creditcoin Testnet | — |
| **Smart Contracts** | Solidity + Hardhat | 0.8.20 |
| **Contract Standards** | OpenZeppelin | 5.x |
| **State Management** | React Context API | — |
| **Navigation** | Internal state-driven app shell | — |

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
│   ├── 📄 App.tsx                         # State-based app shell
│   ├── 📄 index.css                       # Global styles & design tokens
│   │
│   ├── 📁 pages/                          # Application Pages (10 pages)
│   │   ├── 📄 VendorDashboard.tsx         # Vendor analytics with on-chain invoice reads
│   │   ├── 📄 InvestorDashboard.tsx       # Investor analytics with LP + direct funding views
│   │   ├── 📄 Invoices.tsx                # Invoice drafts + owner-assisted RWA minting
│   │   ├── 📄 Marketplace.tsx             # Browse & fund invoices on-chain
│   │   ├── 📄 LiquidityPool.tsx           # LP deposit/withdraw against the live pool contract
│   │   ├── 📄 LiquidityRequest.tsx        # Funding-request preparation flow
│   │   ├── 📄 Portfolio.tsx               # Direct funding portfolio + allocation chart
│   │   ├── 📄 Inventory.tsx               # Procurement stock management
│   │   ├── 📄 KYB.tsx                     # KYB verification flow
│   │   └── 📄 CreditHistory.tsx           # On-chain credit history via events
│   │
│   ├── 📁 components/                     # Shared UI Components
│   │   └── 📄 Layout.tsx                  # App shell: sidebar, header, navigation
│   │
│   ├── 📁 context/                        # React Context Providers
│   │   ├── 📄 WalletContext.tsx           # Wallet connection + contract instances
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
│   ├── 📁 deployments/                    # Deployed address records
│   │   └── 📄 creditcoin-testnet.json     # Creditcoin testnet contracts
│   │
│   ├── 📁 test/                           # Unit Tests
│   │   └── 📄 CrediProcure.test.ts        # Contract test suite
│   │
│   └── 📁 artifacts/                      # Compiled contract artifacts
│       └── ...
│
└── 📄 README.md                           # This file
```

---

## ⚡ Current Deployment Notes

The current Creditcoin testnet deployment is optimized for a hackathon demo and uses a few explicit constraints:

### 1. Owner-Assisted Minting
- Invoice drafts can be created from any connected wallet.
- The deployed `InvoiceNFT` contract currently allows on-chain minting from the deployed owner wallet (`0xFEE547941c3E3d3D66dC2e47ee9c16879E870F9b`).

### 2. Real Contract Reads Where It Matters
- Marketplace inventory, LP balances, total pool liquidity, credit history, and direct funding positions are loaded from live smart contract reads or contract events.
- Inventory, KYB state, and invoice drafts remain local-first for faster product iteration during the hackathon.

### 3. Honest Demo Boundaries
- The `Liquidity Request` page is a preparation flow for funding terms, not an on-chain escrow queue.
- The yield performance chart is a portfolio visualization, while realized direct-investment yield is driven by on-chain repayment events.

---

## 🗺️ Development Roadmap

| Phase | Milestone | Deliverables | Status |
|:---:|:---|:---|:---:|
| **1** | 🎨 UI/UX Design & Prototyping | Wireframes, user flows, component library, responsive layout | ✅ Done |
| **2** | ⛓️ Smart Contract Development | InvoiceNFT (ERC-721), LendingPool, MockStablecoin, unit tests | ✅ Done |
| **3** | 🔗 Web3 Integration | MetaMask wallet connect, contract integration, live data fetching | ✅ Done |
| **4** | 🚀 Live Feature Activation | Replace core marketplace, LP, and credit history flows with blockchain reads/writes while keeping local-first draft workflows | ✅ Done |
| **5** | 🌐 Deployment & Submission | Creditcoin Testnet deployment, Vercel hosting, submission package | ✅ Done |
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
| **Currency Symbol** | `tCTC` |
| **Block Explorer** | `https://creditcoin-testnet.blockscout.com/` |

---

## 🔗 Live Deployment References

### Frontend
- **App URL**: `https://credi-procure.vercel.app`
- **Repository**: `https://github.com/panzauto46-bot/CrediProcure`

### Smart Contracts (Creditcoin Testnet)
- **InvoiceNFT**: `0x39eDc878beEe808B5Ba6e2Cf4AC13c4d6F60f912`
- **LendingPool**: `0x7918Ce640b5B57eE964c2062Fe346F2a8324e0c2`
- **MockStablecoin**: `0xc30D717e367aC4E9524ae7eF90EC5B4e3e10FaD0`

### Block Explorer Links
- **InvoiceNFT**: `https://creditcoin-testnet.blockscout.com/address/0x39eDc878beEe808B5Ba6e2Cf4AC13c4d6F60f912`
- **LendingPool**: `https://creditcoin-testnet.blockscout.com/address/0x7918Ce640b5B57eE964c2062Fe346F2a8324e0c2`
- **MockStablecoin**: `https://creditcoin-testnet.blockscout.com/address/0xc30D717e367aC4E9524ae7eF90EC5B4e3e10FaD0`

---

## 🧾 Submission Artifacts (DoraHacks)

- **Project Sector**: DeFi + RWA
- **Project Deck / Whitepaper (PDF URL)**: `TODO_ADD_LINK`
- **Prototype Demo Video URL**: `TODO_ADD_LINK`

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
