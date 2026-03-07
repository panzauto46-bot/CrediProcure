import { useEffect, useState } from 'react';
import {
  Coins,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  Plus,
  Minus,
  Info,
  CheckCircle,
  X,
  Loader2,
  Shield,
  Wallet,
} from 'lucide-react';
import { ethers } from 'ethers';
import { cn } from '@/utils/cn';
import { useWallet } from '@/context/WalletContext';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

export function LiquidityPool() {
  const { account, contracts } = useWallet();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [poolData, setPoolData] = useState({
    totalLiquidity: 0,
    yourDeposit: 0,
    walletStableBalance: 0,
    currentAPY: 8.7,
    totalInvoicesFunded: 0,
  });

  useEffect(() => {
    const loadPoolData = async () => {
      if (!account || !contracts.lendingPool || !contracts.stablecoin) return;

      setIsLoading(true);
      try {
        const [totalLiquidityRaw, yourDepositRaw, walletStableRaw, fundedEvents] = await Promise.all([
          contracts.lendingPool.totalLiquidity(),
          contracts.lendingPool.lpBalances(account),
          contracts.stablecoin.balanceOf(account),
          contracts.lendingPool.queryFilter(contracts.lendingPool.filters.InvoiceFunded()),
        ]);

        setPoolData({
          totalLiquidity: Number(ethers.formatUnits(totalLiquidityRaw, 18)),
          yourDeposit: Number(ethers.formatUnits(yourDepositRaw, 18)),
          walletStableBalance: Number(ethers.formatUnits(walletStableRaw, 18)),
          currentAPY: 8.7,
          totalInvoicesFunded: fundedEvents.length,
        });
      } catch (loadError) {
        console.error('Failed to load liquidity pool data:', loadError);
      } finally {
        setIsLoading(false);
      }
    };

    void loadPoolData();
  }, [account, contracts, refreshKey]);

  const closeModal = () => {
    setShowConfirmModal(false);
    setIsProcessing(false);
    setIsComplete(false);
    setError(null);
    setAmount('');
  };

  const handleSubmit = async () => {
    if (!account || !contracts.lendingPool || !contracts.stablecoin) {
      alert('Connect wallet first.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert('Enter a valid amount.');
      return;
    }

    setShowConfirmModal(true);
    setIsProcessing(true);
    setIsComplete(false);
    setError(null);

    try {
      const parsedAmount = ethers.parseUnits(amount, 18);

      if (activeTab === 'deposit') {
        const approvalTx = await contracts.stablecoin.approve(contracts.lendingPool.target, parsedAmount);
        await approvalTx.wait();
        const depositTx = await contracts.lendingPool.deposit(parsedAmount);
        await depositTx.wait();
      } else {
        const withdrawTx = await contracts.lendingPool.withdraw(parsedAmount);
        await withdrawTx.wait();
      }

      setIsComplete(true);
      setRefreshKey((current) => current + 1);
    } catch (submitError) {
      console.error('Liquidity pool action failed:', submitError);
      setError(
        activeTab === 'deposit'
          ? 'Deposit failed. Check your stablecoin balance and wallet confirmation.'
          : 'Withdrawal failed. The pool may not have enough liquid balance for this amount yet.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const yourShare =
    poolData.totalLiquidity > 0 ? (poolData.yourDeposit / poolData.totalLiquidity) * 100 : 0;
  const monthlyYieldEstimate = poolData.yourDeposit * (poolData.currentAPY / 100 / 12);

  if (!account) {
    return (
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center text-[hsl(var(--muted-foreground))]">
        Connect your wallet to interact with the Creditcoin liquidity pool.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Liquidity Pool</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Deposit mock stablecoins into the live pool contract or withdraw available liquidity.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 lg:p-8">
        <div className="absolute top-0 right-0 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/2 translate-y-1/2 rounded-full bg-pink-500/20 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Coins className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">CrediProcure Invoice Pool</h3>
              <p className="text-purple-200">Backed by the contracts deployed on Creditcoin testnet</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="mb-1 text-xs text-purple-200">Pool Liquidity</p>
              <p className="text-xl font-bold text-white">{formatCurrency(poolData.totalLiquidity)}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="mb-1 text-xs text-purple-200">Estimated APY</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-violet-300">{poolData.currentAPY}%</p>
                <ArrowUpRight className="h-4 w-4 text-violet-300" />
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="mb-1 text-xs text-purple-200">Your Deposit</p>
              <p className="text-xl font-bold text-white">{formatCurrency(poolData.yourDeposit)}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="mb-1 text-xs text-purple-200">Invoices Funded</p>
              <p className="text-xl font-bold text-white">{poolData.totalInvoicesFunded}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <h3 className="mb-4 text-lg font-semibold text-[hsl(var(--foreground))]">Your Position</h3>
          {isLoading ? (
            <div className="py-10 text-center text-[hsl(var(--muted-foreground))]">
              <Loader2 className="mx-auto h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Your Deposit', value: formatCurrency(poolData.yourDeposit), highlight: false },
                { label: 'Pool Share', value: `${yourShare.toFixed(2)}%`, highlight: false },
                { label: 'Wallet Stablecoin', value: formatCurrency(poolData.walletStableBalance), highlight: false },
                { label: 'Est. Monthly Yield', value: formatCurrency(monthlyYieldEstimate), highlight: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between border-b border-[hsl(var(--border))] py-3 last:border-0">
                  <span className="text-[hsl(var(--muted-foreground))]">{item.label}</span>
                  <span className={cn('font-semibold', item.highlight ? 'text-violet-500' : 'text-[hsl(var(--foreground))]')}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 lg:col-span-2">
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setActiveTab('deposit')}
              className={cn(
                'flex-1 rounded-xl py-3 font-medium transition-all',
                activeTab === 'deposit'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                  : 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]'
              )}
            >
              <span className="inline-flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Deposit
              </span>
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className={cn(
                'flex-1 rounded-xl py-3 font-medium transition-all',
                activeTab === 'withdraw'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                  : 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]'
              )}
            >
              <span className="inline-flex items-center gap-2">
                <Minus className="h-5 w-5" />
                Withdraw
              </span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[hsl(var(--foreground))]">
                Amount (mUSD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                <input
                  type="number"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] py-4 pl-12 pr-4 text-2xl font-bold text-[hsl(var(--foreground))] outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                {activeTab === 'deposit'
                  ? `Wallet balance: ${formatCurrency(poolData.walletStableBalance)}`
                  : `Available to withdraw: ${formatCurrency(poolData.yourDeposit)}`}
              </p>
            </div>

            <div className="flex gap-2">
              {(activeTab === 'deposit' ? [100, 500, 1000, 5000] : [0.25, 0.5, 0.75, 1]).map((value) => (
                <button
                  key={value}
                  onClick={() =>
                    setAmount(
                      activeTab === 'deposit'
                        ? value.toString()
                        : Math.floor(poolData.yourDeposit * Number(value)).toString()
                    )
                  }
                  className="flex-1 rounded-lg bg-[hsl(var(--muted))] px-3 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--accent))]"
                >
                  {activeTab === 'deposit' ? formatCurrency(Number(value)) : `${Number(value) * 100}%`}
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-5 w-5 text-indigo-500" />
                <div className="text-sm">
                  <p className="mb-1 font-medium text-[hsl(var(--foreground))]">
                    {activeTab === 'deposit' ? 'Deposit Flow' : 'Withdrawal Note'}
                  </p>
                  <p className="text-[hsl(var(--muted-foreground))]">
                    {activeTab === 'deposit'
                      ? 'Deposits approve the mock stablecoin first, then move funds into the live lending pool contract.'
                      : 'Withdrawals only succeed when the pool still holds enough liquid stablecoins after any invoice funding.'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!amount || isProcessing}
              className={cn(
                'w-full rounded-xl py-4 font-medium transition-all',
                amount && !isProcessing
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25'
                  : 'cursor-not-allowed bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
              )}
            >
              {activeTab === 'deposit' ? 'Deposit to Pool' : 'Withdraw from Pool'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[
          {
            icon: TrendingUp,
            title: 'Real Pool Reads',
            desc: 'Total liquidity and LP balances are fetched directly from the deployed lending contract.',
            color: 'bg-violet-500/10 text-violet-500',
          },
          {
            icon: Shield,
            title: 'On-Chain Funding',
            desc: 'Investor deposits can be used by the owner wallet to fund invoices already minted on Creditcoin.',
            color: 'bg-blue-500/10 text-blue-500',
          },
          {
            icon: Wallet,
            title: 'Wallet-Based Actions',
            desc: 'Every deposit and withdrawal requires confirmation in the connected wallet and settles on testnet.',
            color: 'bg-purple-500/10 text-purple-500',
          },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <div className={cn('mb-4 flex h-10 w-10 items-center justify-center rounded-lg', item.color.split(' ')[0])}>
              <item.icon className={cn('h-5 w-5', item.color.split(' ')[1])} />
            </div>
            <h4 className="mb-2 font-semibold text-[hsl(var(--foreground))]">{item.title}</h4>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{item.desc}</p>
          </div>
        ))}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 animate-slide-in">
            {isProcessing ? (
              <div className="py-12 text-center">
                <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-indigo-500" />
                <h4 className="mb-2 font-semibold text-[hsl(var(--foreground))]">Processing Transaction</h4>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Please confirm the transaction in your wallet...</p>
              </div>
            ) : isComplete ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10">
                  <CheckCircle className="h-8 w-8 text-violet-500" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-[hsl(var(--foreground))]">
                  {activeTab === 'deposit' ? 'Deposit Successful!' : 'Withdrawal Successful!'}
                </h3>
                <p className="mb-6 text-[hsl(var(--muted-foreground))]">
                  {activeTab === 'deposit'
                    ? 'Your funds are now recorded in the live liquidity pool contract.'
                    : 'Your liquidity position has been reduced on-chain.'}
                </p>
                <div className="mb-6 space-y-2 rounded-xl bg-[hsl(var(--muted))] p-4 text-left text-sm">
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--muted-foreground))]">Amount</span>
                    <span className="font-medium text-[hsl(var(--foreground))]">{formatCurrency(Number(amount))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--muted-foreground))]">Updated LP Balance</span>
                    <span className="font-medium text-[hsl(var(--foreground))]">
                      {formatCurrency(
                        activeTab === 'deposit'
                          ? poolData.yourDeposit + Number(amount)
                          : Math.max(poolData.yourDeposit - Number(amount), 0)
                      )}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 font-medium text-white"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="py-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                  <X className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-[hsl(var(--foreground))]">Transaction Failed</h3>
                <p className="mb-6 text-sm text-[hsl(var(--muted-foreground))]">{error}</p>
                <button
                  onClick={closeModal}
                  className="w-full rounded-xl bg-[hsl(var(--muted))] py-3 font-medium text-[hsl(var(--foreground))]"
                >
                  Close
                </button>
              </div>
            )}

            {!isProcessing && !isComplete && !error ? (
              <button
                onClick={closeModal}
                className="absolute right-4 top-4 rounded-lg p-2 hover:bg-[hsl(var(--accent))]"
              >
                <X className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
