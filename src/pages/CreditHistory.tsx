import { 
  History, 
  TrendingUp, 
  ExternalLink,
  ArrowUpRight,
  Coins,
  FileText,
  CheckCircle,
  Shield,
  Zap
} from 'lucide-react';
import { mockCreditHistory, mockVendor } from '@/data/mockData';
import { cn } from '@/utils/cn';

const formatCurrency = (amount: number) => {
  if (amount === 0) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

export function CreditHistory() {
  const getActionIcon = (action: string) => {
    if (action.includes('Repaid')) return CheckCircle;
    if (action.includes('Minted')) return Coins;
    if (action.includes('KYB')) return Shield;
    return FileText;
  };

  const getActionColor = (action: string) => {
    if (action.includes('Repaid')) return 'bg-emerald-500/10 text-emerald-500';
    if (action.includes('Minted')) return 'bg-blue-500/10 text-blue-500';
    if (action.includes('KYB')) return 'bg-purple-500/10 text-purple-500';
    return 'bg-amber-500/10 text-amber-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">On-Chain Credit History</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Your credit history recorded on Creditcoin blockchain</p>
      </div>

      {/* Credit Score Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <p className="text-slate-400 text-sm font-medium">Creditcoin Credit Score</p>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-6xl lg:text-7xl font-bold text-white">{mockVendor.creditScore}</span>
                <div className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 rounded-full">
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-400">+92 pts</span>
                </div>
              </div>
              <p className="text-slate-400 mt-2">Last 30 days</p>
            </div>

            <div className="flex gap-3">
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl px-5 py-4 text-center">
                <p className="text-xs text-slate-400 mb-1">Total Invoices</p>
                <p className="text-2xl font-bold text-white">{mockVendor.totalInvoices}</p>
              </div>
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl px-5 py-4 text-center">
                <p className="text-xs text-slate-400 mb-1">Total Repaid</p>
                <p className="text-2xl font-bold text-white">{mockVendor.totalRepaid}</p>
              </div>
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl px-5 py-4 text-center">
                <p className="text-xs text-slate-400 mb-1">Success Rate</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {Math.round((mockVendor.totalRepaid / mockVendor.totalInvoices) * 100)}%
                </p>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <h4 className="text-sm text-slate-400 mb-4 font-medium">Score Breakdown</h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Repayment History', score: 250, max: 300 },
                { label: 'Invoice Volume', score: 180, max: 200 },
                { label: 'Business Verification', score: 200, max: 200 },
                { label: 'Platform Tenure', score: 155, max: 300 },
              ].map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="text-white font-medium">{item.score}/{item.max}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${(item.score / item.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h4 className="font-semibold text-[hsl(var(--foreground))] mb-1">High Score = Lower Interest</h4>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              With a credit score of {mockVendor.creditScore}, you're eligible for interest rates starting from 6.5%! 
              Keep repaying on time to improve your score.
            </p>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] overflow-hidden">
        <div className="p-5 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">Transaction History</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
                <th className="text-left px-6 py-4 text-sm font-semibold text-[hsl(var(--foreground))]">Action</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-[hsl(var(--foreground))]">Amount</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[hsl(var(--foreground))]">Timestamp</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[hsl(var(--foreground))]">Tx Hash</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-[hsl(var(--foreground))]">Credit Impact</th>
              </tr>
            </thead>
            <tbody>
              {mockCreditHistory.map((item) => {
                const Icon = getActionIcon(item.action);
                const colorClass = getActionColor(item.action);
                return (
                  <tr key={item.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", colorClass.split(' ')[0])}>
                          <Icon className={cn("w-4 h-4", colorClass.split(' ')[1])} />
                        </div>
                        <span className="font-medium text-[hsl(var(--foreground))]">{item.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-[hsl(var(--foreground))]">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[hsl(var(--muted-foreground))]">
                      {item.timestamp}
                    </td>
                    <td className="px-6 py-4">
                      <a 
                        href="#" 
                        className="flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-600 font-mono"
                      >
                        {item.txHash}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold">
                        <ArrowUpRight className="w-4 h-4" />
                        +{item.creditImpact}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
