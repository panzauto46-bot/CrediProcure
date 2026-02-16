import {
  TrendingUp,
  FileText,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  AlertCircle,
  Coins,
  Zap,
  ExternalLink
} from 'lucide-react';
// import { mockVendor, mockInvoices } from '@/data/mockData';
import { Invoice } from '@/types';
import { useWallet } from '@/context/WalletContext';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { cn } from '@/utils/cn';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function VendorDashboard() {
  const { account, contracts } = useWallet();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  // const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!account || !contracts.invoiceNFT) return;
      try {
        const balance = await contracts.invoiceNFT.balanceOf(account);
        const fetched: Invoice[] = [];
        for (let i = 0; i < Number(balance); i++) {
          const tokenId = await contracts.invoiceNFT.tokenOfOwnerByIndex(account, i);
          const iv = await contracts.invoiceNFT.invoices(tokenId);
          fetched.push({
            id: iv.id.toString(),
            invoiceNumber: `INV-${iv.id}`,
            clientName: "My Company",
            amount: Number(ethers.formatUnits(iv.amount, 18)),
            status: iv.isFunded ? 'funded' : 'minted',
            dueDate: new Date(Number(iv.dueDate) * 1000).toISOString().split('T')[0],
            yieldRate: Number(iv.yieldRate) / 100,
            description: `Invoice #${iv.id}`,
            tokenId: iv.id.toString(),
            riskLevel: 'low',
            createdAt: new Date().toISOString().split('T')[0]
          });
        }
        setInvoices(fetched.reverse());
      } catch (e) {
        console.error(e);
      } finally {
        // setIsLoading(false);
      }
    };
    loadData();
  }, [account, contracts]);

  const totalInvoiceValue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const fundedAmount = invoices
    .filter(inv => inv.status === 'funded')
    .reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoices
    .filter(inv => inv.status === 'minted') // Only 'minted' is pending funding
    .reduce((sum, inv) => sum + inv.amount, 0);

  const stats = [
    {
      title: 'Total Invoice Value',
      value: formatCurrency(totalInvoiceValue),
      change: '+12.5%',
      trend: 'up',
      icon: FileText,
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Funded Amount',
      value: formatCurrency(fundedAmount),
      change: '+8.2%',
      trend: 'up',
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Pending Funding',
      value: formatCurrency(pendingAmount),
      change: '-5.1%',
      trend: 'down',
      icon: Clock,
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Credit Score',
      value: '785', // Hardcoded good score or random
      change: '+15 pts',
      trend: 'up',
      icon: TrendingUp,
      gradient: 'from-purple-500 to-pink-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/30">
                  Verified Business
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                Welcome back, {account ? `Vendor ${account.slice(0, 6)}...` : 'Guest'}! 👋
              </h1>
              <p className="text-slate-400 max-w-lg">
                Manage your invoices and get instant funding through Creditcoin's decentralized invoice factoring
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl px-5 py-4">
                <p className="text-xs text-slate-400 mb-1">KYB Status</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-white font-medium">Verified</span>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl px-5 py-4">
                <p className="text-xs text-slate-400 mb-1">On-Chain Score</p>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-white font-bold">785</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-[hsl(var(--card))] rounded-2xl p-5 border border-[hsl(var(--border))] hover:border-emerald-500/30 transition-colors group">
            <div className="flex items-start justify-between mb-4">
              <div className={cn("w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg", stat.gradient)}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg",
                stat.trend === 'up'
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                  : 'text-red-600 dark:text-red-400 bg-red-500/10'
              )}>
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {stat.change}
              </div>
            </div>
            <h3 className="text-sm text-[hsl(var(--muted-foreground))] mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Invoices & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices */}
        <div className="lg:col-span-2 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]">
          <div className="p-5 border-b border-[hsl(var(--border))] flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">Recent Invoices</h3>
            <button className="text-sm text-emerald-500 hover:text-emerald-600 font-medium">View All</button>
          </div>
          <div className="p-4 space-y-3">
            {invoices.slice(0, 4).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 bg-[hsl(var(--muted))] rounded-xl hover:bg-[hsl(var(--accent))] transition-colors group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    invoice.status === 'funded' || invoice.status === 'repaid' ? 'bg-emerald-500/10' :
                      invoice.status === 'minted' ? 'bg-blue-500/10' : 'bg-amber-500/10'
                  )}>
                    <FileText className={cn(
                      "w-5 h-5",
                      invoice.status === 'funded' || invoice.status === 'repaid' ? 'text-emerald-500' :
                        invoice.status === 'minted' ? 'text-blue-500' : 'text-amber-500'
                    )} />
                  </div>
                  <div>
                    <p className="font-medium text-[hsl(var(--foreground))]">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{invoice.clientName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[hsl(var(--foreground))]">{formatCurrency(invoice.amount)}</p>
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                    invoice.status === 'funded' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                      invoice.status === 'minted' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                        invoice.status === 'repaid' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' :
                          'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  )}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-5">
            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all group">
                <FileText className="w-5 h-5" />
                <span className="font-medium">Create New Invoice</span>
                <ArrowUpRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all group">
                <Coins className="w-5 h-5" />
                <span className="font-medium">Mint Invoice to RWA</span>
                <ArrowUpRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button className="w-full flex items-center gap-3 p-4 bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] rounded-xl hover:bg-[hsl(var(--accent))] transition-colors group">
                <DollarSign className="w-5 h-5" />
                <span className="font-medium">Request Liquidity</span>
                <ArrowUpRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

          {/* Alert */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">Pending Invoices</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  You have 2 invoices ready to be minted as RWA tokens
                </p>
                <button className="mt-2 text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
                  Review now <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
