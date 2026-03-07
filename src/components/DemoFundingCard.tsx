import { useState } from 'react';
import { Coins, ExternalLink, Loader2 } from 'lucide-react';
import { ethers } from 'ethers';
import { useWallet } from '@/context/WalletContext';

interface DemoFundingCardProps {
  onMinted?: () => void | Promise<void>;
}

const DEMO_MINT_AMOUNT = '10000';

export function DemoFundingCard({ onMinted }: DemoFundingCardProps) {
  const { account, contracts } = useWallet();
  const [isMinting, setIsMinting] = useState(false);

  const handleMintDemoBalance = async () => {
    if (!account || !contracts.stablecoin) {
      alert('Connect wallet first.');
      return;
    }

    setIsMinting(true);
    try {
      const tx = await contracts.stablecoin.mint(account, ethers.parseUnits(DEMO_MINT_AMOUNT, 18));
      await tx.wait();
      await onMinted?.();
      alert(`Minted ${DEMO_MINT_AMOUNT} mUSD to ${account.slice(0, 6)}...${account.slice(-4)}.`);
    } catch (error) {
      console.error('Failed to mint demo stablecoin:', error);
      alert('Mint demo balance failed. Check wallet confirmation and try again.');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
            <Coins className="h-3.5 w-3.5" />
            Demo Funding
          </div>
          <p className="text-sm font-medium text-[hsl(var(--foreground))]">
            No real money required. Mint free mock stablecoins for investor flows, then use testnet `tCTC` only for gas.
          </p>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            This calls the public `MockStablecoin.mint()` function on the deployed Creditcoin testnet contract.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => {
              void handleMintDemoBalance();
            }}
            disabled={isMinting || !account}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isMinting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Coins className="h-4 w-4" />}
            Mint {DEMO_MINT_AMOUNT} mUSD
          </button>
          <a
            href="https://faucet.creditcoin.org/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--accent))]"
          >
            Get Testnet tCTC
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
