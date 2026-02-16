import { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Wallet,
  Zap,
  Loader2
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useWallet } from '@/context/WalletContext';
import { ethers } from 'ethers';
import { Invoice } from '@/types';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Link } from 'react-router-dom';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Static projection for demo purpose as we don't have historical indexer
const yieldData = [
  { month: 'Jan', yield: 1200 },
  { month: 'Feb', yield: 2100 },
  { month: 'Mar', yield: 2745 },
  { month: 'Apr', yield: 3500 },
  { month: 'May', yield: 4200 },
  { month: 'Jun', yield: 5100 },
];

export function InvestorDashboard() {
  const { account, contracts } = useWallet();
  const [directInvested, setDirectInvested] = useState(0);
  const [lpInvested, setLpInvested] = useState(0);
  const [earnedYield, setEarnedYield] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [avgYield, setAvgYield] = useState(0);
  const [recentInvestments, setRecentInvestments] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!account || !contracts.lendingPool || !contracts.invoiceNFT) return;
      setIsLoading(true);
      try {
        // 1. Fetch LP Balance
        const lpBal = await contracts.lendingPool.lpBalances(account);
        const lpVal = Number(ethers.formatUnits(lpBal, 18)); // Mock stablecoin 18 decimals
        setLpInvested(lpVal);

        // 2. Fetch Direct Investments (from LocalStorage + Contract)
        const portfolioKey = `crediprocure_portfolio_${account}`;
        const storedIds = JSON.parse(localStorage.getItem(portfolioKey) || '[]');

        let dInvested = 0;
        let dYield = 0;
        let dActive = 0;
        let totalYieldRate = 0;
        const recent = [];

        for (const id of storedIds) {
          try {
            const data = await contracts.invoiceNFT.invoices(id);
            // Simple assumption: if fetched, it exists
            const amt = Number(ethers.formatUnits(data.amount, 18));
            const yRate = Number(data.yieldRate) / 100;

            // Check if repaid (mock logic: check due date)
            const dueDate = new Date(Number(data.dueDate) * 1000);
            const isRepaid = new Date() > dueDate;

            dInvested += amt;
            if (isRepaid) {
              dYield += amt * (yRate / 100);
            } else {
              dActive++;
            }
            totalYieldRate += yRate;

            recent.push({
              id: data.id.toString(),
              invoiceNumber: `INV-${data.id}`,
              vendorName: `Vendor ${data.vendor.toString().slice(0, 6)}`,
              amount: amt,
              earnedYield: isRepaid ? amt * (yRate / 100) : 0,
              status: isRepaid ? 'repaid' : 'active',
              yieldRate: yRate
            });
          } catch (e) { console.error(e); }
        }

        setDirectInvested(dInvested);
        setEarnedYield(dYield); // Note: LP yield is not calculated here, overly complex for demo
        setActiveCount(dActive);
        setAvgYield(storedIds.length > 0 ? totalYieldRate / storedIds.length : 0);
        setRecentInvestments(recent.reverse().slice(0, 5)); // Latest 5

        // 3. Fetch Opportunities (Not Funded Invoices)
        // Fetch top 3
        const total = await contracts.invoiceNFT.totalSupply();
        const count = Number(total);
        const ops = [];
        let fetchedCount = 0;
        for (let i = count - 1; i >= 0 && fetchedCount < 3; i--) {
          const tokenId = await contracts.invoiceNFT.tokenByIndex(i);
          const data = await contracts.invoiceNFT.invoices(tokenId);
          if (!data.isFunded) {
            ops.push({
              id: data.id.toString(),
              invoiceNumber: `INV-${data.id}`,
              clientName: `Vendor ${data.vendor.toString().slice(0, 4)}`,
              amount: Number(ethers.formatUnits(data.amount, 18)),
              yieldRate: Number(data.yieldRate) / 100,
              dueDate: new Date(Number(data.dueDate) * 1000).toISOString().split('T')[0],
              status: 'minted',
              riskLevel: 'low', // default
              description: 'New Invoice',
              tokenId: data.id.toString()
            } as Invoice);
            fetchedCount++;
          }
        }
        setOpportunities(ops);

      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [account, contracts]);

  const totalInvested = directInvested + lpInvested;

  const stats = [
    {
      title: 'Total Invested',
      value: formatCurrency(totalInvested),
      change: '+18.2%', // Mock trend
      trend: 'up',
      icon: Wallet,
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Yield Earned',
      value: formatCurrency(earnedYield),
      change: '+24.5%', // Mock trend
      trend: 'up',
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Active Investments',
      value: activeInvestments.toString(),
      change: '+2',
      trend: 'up',
      icon: FileText,
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Avg. Yield Rate',
      value: `${avgYield.toFixed(1)}%`,
      change: '+0.5%',
      trend: 'up',
      icon: PieChart,
      gradient: 'from-purple-500 to-pink-600',
    },
  ];

  if (!account) return <div className="p-8 text-center text-[hsl(var(--muted-foreground))]">Connect Wallet to view dashboard.</div>;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 p-6 lg:p-8 animate-fade-in">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-yellow-300" />
                <span className="text-cyan-100 text-sm font-medium">DeFi Investor Portal</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                Investor Dashboard 💰
              </h1>
              <p className="text-cyan-100">
                Earn yield by funding real business invoices on Creditcoin
              </p>
            </div>
            <div className="flex gap-3">
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl px-5 py-4">
                <p className="text-xs text-cyan-100 mb-1">Portfolio Value</p>
                <p className="text-xl font-bold text-white">{formatCurrency(totalInvested + earnedYield)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl px-5 py-4">
                <p className="text-xs text-cyan-100 mb-1">APY</p>
                <p className="text-xl font-bold text-emerald-300">~{avgYield.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin mx-auto text-emerald-500" /></div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="bg-[hsl(var(--card))] rounded-2xl p-5 border border-[hsl(var(--border))] hover:border-cyan-500/30 transition-colors animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
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

          {/* Chart & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Yield Chart */}
            <div className="lg:col-span-2 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-5">
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-6">Yield Performance (Projected)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={yieldData}>
                    <defs>
                      <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value as number), 'Yield']}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--card))',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                    <Area type="monotone" dataKey="yield" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorYield)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-5">
                <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link to="/marketplace" className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all group">
                    <Coins className="w-5 h-5" />
                    <span className="font-medium">Fund Invoice</span>
                    <ArrowUpRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                  <Link to="/pool" className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all group">
                    <DollarSign className="w-5 h-5" />
                    <span className="font-medium">Add to Pool</span>
                    <ArrowUpRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </div>
              </div>

              {/* Opportunity */}
              {opportunities.length > 0 && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-5">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">New Opportunity</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                    {opportunities.length} new invoices available directly from vendors.
                  </p>
                  <Link to="/marketplace" className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
                    View Marketplace <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Investments */}
          <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]">
            <div className="p-5 border-b border-[hsl(var(--border))] flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">Recent Investments</h3>
              <Link to="/portfolio" className="text-sm text-cyan-500 hover:text-cyan-600 font-medium">View All</Link>
            </div>
            <div className="p-4 space-y-3">
              {recentInvestments.length === 0 ? (
                <div className="text-center py-4 text-[hsl(var(--muted-foreground))]">No investments yet.</div>
              ) : (
                recentInvestments.map((investment) => (
                  <div key={investment.id} className="flex items-center justify-between p-4 bg-[hsl(var(--muted))] rounded-xl hover:bg-[hsl(var(--accent))] transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        investment.status === 'active' ? 'bg-blue-500/10' :
                          investment.status === 'repaid' ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                      )}>
                        <FileText className={cn(
                          "w-5 h-5",
                          investment.status === 'active' ? 'text-blue-500' :
                            investment.status === 'repaid' ? 'text-emerald-500' : 'text-amber-500'
                        )} />
                      </div>
                      <div>
                        <p className="font-medium text-[hsl(var(--foreground))]">{investment.invoiceNumber}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">{investment.vendorName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[hsl(var(--foreground))]">{formatCurrency(investment.amount)}</p>
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-sm text-emerald-500 font-medium">+{formatCurrency(investment.earnedYield)}</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          investment.status === 'active' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                            investment.status === 'repaid' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                              'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        )}>
                          {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
