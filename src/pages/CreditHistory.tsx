import { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock,
  Loader2,
  FileText,
  ExternalLink
} from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { ethers } from 'ethers';
import { cn } from '@/utils/cn';

interface HistoryItem {
  id: string;
  action: 'Invoice Funded' | 'Loan Repaid' | 'Invoice Minted';
  amount: number;
  timestamp: string;
  txHash: string;
  creditImpact: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

export function CreditHistory() {
  const { account, contracts } = useWallet();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      if (!account || !contracts.lendingPool || !contracts.invoiceNFT) return;
      setIsLoading(true);
      try {
        const events: HistoryItem[] = [];

        // 1. Fetch InvoiceFunded events (Vendor receives funds)
        // event InvoiceFunded(uint256 indexed tokenId, address indexed borrower, uint256 amount);
        const fundedFilter = contracts.lendingPool.filters.InvoiceFunded(null, account);
        const fundedEvents = await contracts.lendingPool.queryFilter(fundedFilter);

        for (const e of fundedEvents) {
          if ('args' in e) {
            const block = await e.getBlock();
            events.push({
              id: e.transactionHash + '_fund',
              action: 'Invoice Funded',
              amount: Number(ethers.formatUnits(e.args[2], 18)), // amount
              timestamp: new Date(block.timestamp * 1000).toLocaleString(),
              txHash: e.transactionHash,
              creditImpact: +10
            });
          }
        }

        // 2. Fetch Minted Events (Transfer from 0x0 to Vendor)
        // event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
        const mintFilter = contracts.invoiceNFT.filters.Transfer(ethers.ZeroAddress, account);
        const mintEvents = await contracts.invoiceNFT.queryFilter(mintFilter);

        for (const e of mintEvents) {
          if ('args' in e) {
            const block = await e.getBlock();
            // We don't have amount in Transfer event, would need to fetch invoice data.
            // For speed, we just log the event with 0 or fetch if needed.
            // Let's just say "Invoice Minted"
            events.push({
              id: e.transactionHash + '_mint',
              action: 'Invoice Minted',
              amount: 0, // Placeholder or fetch
              timestamp: new Date(block.timestamp * 1000).toLocaleString(),
              txHash: e.transactionHash,
              creditImpact: +5
            });
          }
        }

        // Sort by date desc
        events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setHistory(events);

      } catch (e) {
        console.error("Error fetching history:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [account, contracts]);


  const filteredHistory = history.filter(item =>
    item.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!account) return <div className="p-8 text-center text-[hsl(var(--muted-foreground))]">Connect Wallet to view history.</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">On-Chain Credit History</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Your credit history recorded on Creditcoin blockchain</p>
      </div>

      {/* Credit Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-slate-400 mb-1">Creditcoin Credit Score</p>
              <h2 className="text-5xl font-bold text-white mb-2">785</h2>
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full w-fit">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-medium">+92 pts</span>
                <span className="text-xs text-slate-400 ml-1">Last 30 days</span>
              </div>
            </div>

            <div className="flex gap-6 text-center">
              <div>
                <p className="text-3xl font-bold mb-1">{history.filter(h => h.action === 'Invoice Minted').length}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Total Invoices</p>
              </div>
              <div>
                <p className="text-3xl font-bold mb-1">{history.filter(h => h.action === 'Loan Repaid').length}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Total Repaid</p>
              </div>
              <div>
                <p className="text-3xl font-bold mb-1 text-emerald-400">88%</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Success Rate</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Repayment History</p>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[85%]" />
              </div>
              <p className="text-right text-xs mt-1 text-emerald-400">250/300</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Invoice Volume</p>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[90%]" />
              </div>
              <p className="text-right text-xs mt-1 text-blue-400">180/200</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Business Verification</p>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 w-[100%]" />
              </div>
              <p className="text-right text-xs mt-1 text-purple-400">200/200</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Platform Tenure</p>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[55%]" />
              </div>
              <p className="text-right text-xs mt-1 text-amber-400">155/300</p>
            </div>
          </div>
        </div>

        <div className="bg-[hsl(var(--card))] rounded-2xl p-6 border border-[hsl(var(--border))]">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-[hsl(var(--foreground))] mb-2">High Score = Lower Interest</h3>
          <p className="text-[hsl(var(--muted-foreground))] mb-4 text-sm">
            With a credit score of 785, you're eligible for interest rates starting from 6.5%! Keep repaying on time to improve your score.
          </p>
          <button className="w-full py-2.5 bg-[hsl(var(--muted))] hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] rounded-xl text-sm font-medium transition-colors">
            View Interest Rate Tiers
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] overflow-hidden">
        <div className="p-5 border-b border-[hsl(var(--border))] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">Transaction History</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              <input
                type="text"
                placeholder="Search tx hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-full sm:w-64"
              />
            </div>
            <button className="p-2 border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--accent))]">
              <Filter className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            </button>
            <button className="p-2 border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--accent))]">
              <Download className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            </button>
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
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
              ) : filteredHistory.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-[hsl(var(--muted-foreground))]">No transactions found</td></tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          item.action === 'Loan Repaid' ? 'bg-purple-500/10' :
                            item.action === 'Invoice Funded' ? 'bg-emerald-500/10' : 'bg-blue-500/10'
                        )}>
                          {item.action === 'Loan Repaid' ? <CheckCircle className="w-4 h-4 text-purple-500" /> :
                            item.action === 'Invoice Funded' ? <ArrowDownRight className="w-4 h-4 text-emerald-500" /> :
                              <FileText className="w-4 h-4 text-blue-500" />}
                        </div>
                        <span className="font-medium text-[hsl(var(--foreground))]">{item.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-[hsl(var(--foreground))]">
                      {item.amount > 0 ? formatCurrency(item.amount) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-[hsl(var(--muted-foreground))]">
                      {item.timestamp}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[hsl(var(--muted-foreground))]">
                      {item.txHash.slice(0, 6)}...{item.txHash.slice(-4)}
                      <ExternalLink className="w-3 h-3 inline ml-1 opacity-50 hover:opacity-100 cursor-pointer" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-xs font-medium">
                        +{item.creditImpact}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
