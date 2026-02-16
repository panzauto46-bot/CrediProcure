# CrediProcure 🚀

**Web3 B2B Invoice Financing Platform powered by Real World Assets (RWA) on Creditcoin**

---

## 📖 About CrediProcure

**CrediProcure** is a decentralized solution bridging the gap between B2B vendors and global investors through **Real World Asset (RWA)** tokenization. We empower businesses to unlock instant liquidity from their invoices while offering investors secure, transparent, and stable yield opportunities within the DeFi ecosystem.

Built as a high-performance prototype for the DoraHacks Hackathon, focusing on speed, security, and a seamless user experience.

---

## ✨ Key Features

### 🏢 For Vendors (Borrowers)
- **Integrated Procurement Dashboard**: Manage invoices, request funding, and track approval status in real-time.
- **Instant Liquidity**: Get paid immediately after invoice approval and funding by decentralized investors.
- **Transparent Process**: Track every step of the funding lifecycle on-chain.

### 💰 For Investors (Lenders)
- **Decentralized Marketplace**: Browse verified invoice funding opportunities.
- **Stable Yields**: Earn competitive returns backed by real-world assets (invoices).
- **RWA Security**: Investments are secured by actual invoices recorded on the Creditcoin network.

---

## 🏗️ Smart Contract Architecture

Our decentralized backend is powered by secure and efficient smart contracts deployed on the **Creditcoin Network**.

### 1. InvoiceNFT (ERC-721)
Represents the Real World Asset (Invoice) on-chain.
- **Minting**: Vendors mint an NFT representing their invoice data (Amount, Due Date, Interest Rate).
- **Metadata**: Stores immutable invoice details directly on-chain for transparency.
- **Status Tracking**: Tracks funding status (`isFunded`) to prevent double-financing.

### 2. LendingPool
The liquidity engine connecting investors and vendors.
- **Liquidity Provision**: Investors deposit stablecoins (USDC/USDT) into the pool to earn yields.
- **Automated Funding**: Approved invoices are automatically funded from the pool, transferring stablecoins to the vendor.
- **Repayment Logic**: Handles loan repayments and distributes interest back to the liquidity providers.

---

## 🛠️ Tech Stack

Built with cutting-edge technology for maximum performance and scalability:

### Frontend
- **Framework**: [React 19](https://react.dev/) & [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Blockchain & Smart Contracts
- **Network**: [Creditcoin Testnet](https://creditcoin.org/)
- **Development Environment**: [Hardhat](https://hardhat.org/)
- **Language**: [Solidity 0.8.20](https://soliditylang.org/)
- **Testing**: Chai & Ethers.js

---

## 🗺️ Development Roadmap

| Phase | Description | Status |
| :--- | :--- | :--- |
| **Phase 1** | Concept & UI/UX Design (User Flow, Dashboard, Marketplace) | ✅ Completed |
| **Phase 2** | Smart Contract Development (Invoice NFT, Liquidity Pool, Unit Tests) | ✅ Completed |
| **Phase 3** | Frontend & Web3 Integration (Wallet Connect, Contract Integration) | 🚧 In Progress |
| **Phase 4** | Finalization & Submission (Demo Video, Pitch Deck) | 📅 Upcoming |

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### 1. Frontend Setup

```bash
# Clone the repository
git clone https://github.com/panzauto46-bot/CrediProcure.git
cd CrediProcure

# Install dependencies
npm install

# Start development server
npm run dev
```
Visit `http://localhost:5173` to view the application.

### 2. Smart Contract Development

The smart contracts are located in the `smart-contracts/` directory.

```bash
# Navigate to smart contracts folder
cd smart-contracts

# Install dependencies
npm install

# Run Unit Tests
npx hardhat test

# Compile Contracts
npx hardhat compile
```

#### Deployment to Creditcoin Testnet
1. Create a `.env` file in `smart-contracts/` based on `.env.example`.
2. Add your `PRIVATE_KEY`.
3. Run the deployment script:
   ```bash
   npx hardhat run scripts/deploy.ts --network creditcoinTestnet
   ```

---

© 2026 CrediProcure. Built for the Future of Finance.
Licensed by Pandu Dargah.
