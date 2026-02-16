import { useState } from 'react';
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
  Zap,
  Shield
} from 'lucide-react';
import { cn } from '@/utils/cn';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

export function LiquidityPool() {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const poolData = {
    totalLiquidity: 5250000,
    yourDeposit: 125000,
    yourShare: 2.38,
    currentAPY: 8.7,
    utilizationRate: 72.5,
    totalInvoicesFunded: 156,
  };

  const handleSubmit = () => {
    setShowConfirmModal(true);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
    }, 2000);
  };

  const closeModal = () => {
    setShowConfirmModal(false);
    setIsProcessing(false);
    setIsComplete(false);
    setAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Liquidity Pool</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Deposit stablecoins to fund invoices and earn yield</p>
      </div>

      {/* Pool Stats */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">CrediProcure Invoice Pool</h3>
              <p className="text-purple-200">Backed by verified business invoices</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white/10 backdrop-blur border border-white/10 rounded-xl p-4">
              <p className="text-xs text-purple-200 mb-1">Total Liquidity</p>
              <p className="text-xl font-bold text-white">{formatCurrency(poolData.totalLiquidity)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/10 rounded-xl p-4">
              <p className="text-xs text-purple-200 mb-1">Current APY</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-emerald-300">{poolData.currentAPY}%</p>
                <ArrowUpRight className="w-4 h-4 text-emerald-300" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/10 rounded-xl p-4">
              <p className="text-xs text-purple-200 mb-1">Utilization</p>
              <p className="text-xl font-bold text-white">{poolData.utilizationRate}%</p>
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/10 rounded-xl p-4">
              <p className="text-xs text-purple-200 mb-1">Invoices Funded</p>
              <p className="text-xl font-bold text-white">{poolData.totalInvoicesFunded}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Your Position + Deposit/Withdraw */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Your Position */}
        <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-5">
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">Your Position</h3>
          <div className="space-y-4">
            {[
              { label: 'Your Deposit', value: formatCurrency(poolData.yourDeposit), highlight: false },
              { label: 'Pool Share', value: `${poolData.yourShare}%`, highlight: false },
              { label: 'Pending Yield', value: `+${formatCurrency(poolData.yourDeposit * (poolData.currentAPY / 100 / 12))}`, highlight: true },
              { label: 'Est. Monthly Yield', value: formatCurrency(poolData.yourDeposit * (poolData.currentAPY / 100 / 12)), highlight: false },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-[hsl(var(--border))] last:border-0">
                <span className="text-[hsl(var(--muted-foreground))]">{item.label}</span>
                <span className={cn(
                  "font-semibold",
                  item.highlight ? 'text-emerald-500' : 'text-[hsl(var(--foreground))]'
                )}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Deposit/Withdraw */}
        <div className="lg:col-span-2 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-5">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('deposit')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all",
                activeTab === 'deposit'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                  : 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]'
              )}
            >
              <Plus className="w-5 h-5" />
              Deposit
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all",
                activeTab === 'withdraw'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                  : 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]'
              )}
            >
              <Minus className="w-5 h-5" />
              Withdraw
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                Amount (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-12 pr-4 py-4 text-2xl font-bold bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-[hsl(var(--foreground))]"
                />
              </div>
              {activeTab === 'withdraw' && (
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
                  Available: {formatCurrency(poolData.yourDeposit)}
                </p>
              )}
            </div>

            {/* Quick Amounts */}
            <div className="flex gap-2">
              {activeTab === 'deposit' ? (
                [10000, 50000, 100000, 500000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(val.toString())}
                    className="flex-1 py-2.5 px-3 bg-[hsl(var(--muted))] hover:bg-[hsl(var(--accent))] rounded-lg text-sm font-medium text-[hsl(var(--foreground))] transition-colors"
                  >
                    ${(val / 1000)}K
                  </button>
                ))
              ) : (
                [0.25, 0.5, 0.75, 1].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setAmount(Math.floor(poolData.yourDeposit * pct).toString())}
                    className="flex-1 py-2.5 px-3 bg-[hsl(var(--muted))] hover:bg-[hsl(var(--accent))] rounded-lg text-sm font-medium text-[hsl(var(--foreground))] transition-colors"
                  >
                    {pct * 100}%
                  </button>
                ))
              )}
            </div>

            {/* Info */}
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-indigo-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-[hsl(var(--foreground))] mb-1">
                    {activeTab === 'deposit' ? 'How Deposits Work' : 'Withdrawal Info'}
                  </p>
                  <p className="text-[hsl(var(--muted-foreground))]">
                    {activeTab === 'deposit' 
                      ? 'Your deposit will be used to fund verified business invoices. You earn yield as invoices are repaid.'
                      : 'Withdrawals are processed within 24-48 hours depending on pool utilization.'}
                  </p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSubmit}
              disabled={!amount}
              className={cn(
                "w-full py-4 rounded-xl font-medium transition-all",
                amount
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25'
                  : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-not-allowed'
              )}
            >
              {activeTab === 'deposit' ? 'Deposit to Pool' : 'Withdraw from Pool'}
            </button>
          </div>
        </div>
      </div>

      {/* Pool Benefits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { icon: TrendingUp, title: 'Stable Yields', desc: 'Earn consistent yields from real business invoice payments', color: 'bg-emerald-500/10 text-emerald-500' },
          { icon: Shield, title: 'Diversified Risk', desc: 'Your deposit is spread across multiple verified invoices', color: 'bg-blue-500/10 text-blue-500' },
          { icon: Zap, title: 'Auto-Compound', desc: 'Yields are automatically reinvested to maximize returns', color: 'bg-purple-500/10 text-purple-500' },
        ].map((item, i) => (
          <div key={i} className="bg-[hsl(var(--card))] rounded-xl p-5 border border-[hsl(var(--border))]">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-4", item.color.split(' ')[0])}>
              <item.icon className={cn("w-5 h-5", item.color.split(' ')[1])} />
            </div>
            <h4 className="font-semibold text-[hsl(var(--foreground))] mb-2">{item.title}</h4>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[hsl(var(--card))] rounded-2xl w-full max-w-md p-6 border border-[hsl(var(--border))] animate-slide-in">
            {isProcessing ? (
              <div className="text-center py-12">
                <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mx-auto mb-4" />
                <h4 className="font-semibold text-[hsl(var(--foreground))] mb-2">Processing Transaction</h4>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Please confirm in your wallet...</p>
              </div>
            ) : isComplete ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2">
                  {activeTab === 'deposit' ? 'Deposit Successful!' : 'Withdrawal Initiated!'}
                </h3>
                <p className="text-[hsl(var(--muted-foreground))] mb-6">
                  {activeTab === 'deposit' 
                    ? 'Your funds are now earning yield in the pool'
                    : 'Your withdrawal will be processed within 24-48 hours'}
                </p>
                <div className="bg-[hsl(var(--muted))] rounded-xl p-4 text-left text-sm space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--muted-foreground))]">Amount</span>
                    <span className="font-medium text-[hsl(var(--foreground))]">{formatCurrency(Number(amount))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--muted-foreground))]">New Balance</span>
                    <span className="font-medium text-[hsl(var(--foreground))]">
                      {formatCurrency(activeTab === 'deposit' 
                        ? poolData.yourDeposit + Number(amount)
                        : poolData.yourDeposit - Number(amount))}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={closeModal}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium"
                >
                  Done
                </button>
              </div>
            ) : null}
            
            {!isProcessing && !isComplete && (
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 hover:bg-[hsl(var(--accent))] rounded-lg"
              >
                <X className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
