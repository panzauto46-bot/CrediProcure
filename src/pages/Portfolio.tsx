import { 
  TrendingUp, 
  FileText,
  CheckCircle,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { mockInvestments } from '@/data/mockData';
import { cn } from '@/utils/cn';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

export function Portfolio() {
  const totalInvested = mockInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalYield = mockInvestments.reduce((sum, inv) => sum + inv.earnedYield, 0);
  const activeInvestments = mockInvestments.filter(inv => inv.status === 'active');
  const repaidInvestments = mockInvestments.filter(inv => inv.status === 'repaid');

  const pieData = [
    { name: 'Active', value: activeInvestments.reduce((sum, inv) => sum + inv.amount, 0), color: '#3b82f6' },
    { name: 'Repaid', value: repaidInvestments.reduce((sum, inv) => sum + inv.amount, 0), color: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Yield Portfolio</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Track your investment returns and performance</p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 p-6 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <h3 className="text-lg font-semibold mb-6 text-cyan-100">Portfolio Overview</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-cyan-100 text-sm mb-1">Total Invested</p>
                <p className="text-2xl font-bold">{formatCurrency(totalInvested)}</p>
              </div>
              <div>
                <p className="text-cyan-100 text-sm mb-1">Total Yield</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{formatCurrency(totalYield)}</p>
                  <ArrowUpRight className="w-5 h-5 text-emerald-300" />
                </div>
              </div>
              <div>
                <p className="text-cyan-100 text-sm mb-1">Portfolio Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totalInvested + totalYield)}</p>
              </div>
              <div>
                <p className="text-cyan-100 text-sm mb-1">Return Rate</p>
                <p className="text-2xl font-bold text-emerald-300">
                  +{((totalYield / totalInvested) * 100).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-5">
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">Allocation</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatCurrency(value as number)} 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--card))',
                    color: 'hsl(var(--foreground))'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-[hsl(var(--muted-foreground))]">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FileText, label: 'Total Investments', value: mockInvestments.length, color: 'bg-blue-500/10 text-blue-500' },
          { icon: Clock, label: 'Active', value: activeInvestments.length, color: 'bg-cyan-500/10 text-cyan-500' },
          { icon: CheckCircle, label: 'Repaid', value: repaidInvestments.length, color: 'bg-emerald-500/10 text-emerald-500' },
          { icon: TrendingUp, label: 'Avg. Yield', value: `${(mockInvestments.reduce((sum, inv) => sum + inv.yieldRate, 0) / mockInvestments.length).toFixed(1)}%`, color: 'bg-purple-500/10 text-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-[hsl(var(--card))] rounded-xl p-5 border border-[hsl(var(--border))]">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.color.split(' ')[0])}>
                <stat.icon className={cn("w-5 h-5", stat.color.split(' ')[1])} />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{stat.label}</p>
                <p className="text-xl font-bold text-[hsl(var(--foreground))]">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Investment List */}
      <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] overflow-hidden">
        <div className="p-5 border-b border-[hsl(var(--border))]">
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">All Investments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
                <th className="text-left px-6 py-4 text-sm font-semibold text-[hsl(var(--foreground))]">Invoice</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[hsl(var(--foreground))]">Vendor</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-[hsl(var(--foreground))]">Invested</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-[hsl(var(--foreground))]">Yield Rate</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-[hsl(var(--foreground))]">Earned</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[hsl(var(--foreground))]">Maturity</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[hsl(var(--foreground))]">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockInvestments.map((investment) => (
                <tr key={investment.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center",
                        investment.status === 'active' ? 'bg-blue-500/10' : 'bg-emerald-500/10'
                      )}>
                        <FileText className={cn(
                          "w-4 h-4",
                          investment.status === 'active' ? 'text-blue-500' : 'text-emerald-500'
                        )} />
                      </div>
                      <span className="font-medium text-[hsl(var(--foreground))]">{investment.invoiceNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[hsl(var(--muted-foreground))]">{investment.vendorName}</td>
                  <td className="px-6 py-4 text-right font-semibold text-[hsl(var(--foreground))]">
                    {formatCurrency(investment.amount)}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-cyan-500">
                    {investment.yieldRate}%
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-emerald-500">
                    +{formatCurrency(investment.earnedYield)}
                  </td>
                  <td className="px-6 py-4 text-sm text-[hsl(var(--muted-foreground))]">{investment.maturityDate}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-xs font-medium",
                      investment.status === 'active' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                      investment.status === 'repaid' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 
                      'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    )}>
                      {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
