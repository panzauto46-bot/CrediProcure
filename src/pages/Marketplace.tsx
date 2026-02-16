import { useState } from 'react';
import {
  Search,
  FileText,
  TrendingUp,
  Shield,
  DollarSign,
  ExternalLink,
  X,
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { mockMarketplaceInvoices } from '@/data/mockData';
import { Invoice } from '@/types';
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

export function Marketplace() {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [showFundModal, setShowFundModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [fundAmount, setFundAmount] = useState('');
  const [fundStep, setFundStep] = useState(1);
  const { contracts, account } = useWallet();

  const filteredInvoices = mockMarketplaceInvoices.filter(inv => {
    const matchSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRisk = riskFilter === 'all' || inv.riskLevel === riskFilter;
    return matchSearch && matchRisk;
  });

  const handleFund = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowFundModal(true);
    setFundStep(1);
    setFundAmount('');
  };

  const processFund = async () => {
    if (!selectedInvoice || !contracts.lendingPool || !contracts.stablecoin || !account) {
      alert("Please connect wallet first!");
      return;
    }

    try {
      setFundStep(2); // "Processing..."

      const amountToFund = ethers.parseUnits(fundAmount, 18);

      // 1. Approve stablecoin transfer
      const approvalTx = await contracts.stablecoin.approve(contracts.lendingPool.target, amountToFund);
      await approvalTx.wait();

      // 2. Fund Invoice (P2P or Pool)
      // Note: This requires the contract to have 'fundInvoiceDirect' or similar, 
      // or if using Pool model, just 'deposit'
      // For this demo, we assume we call fundInvoiceDirect if added, or deposit.

      // Try fundInvoiceDirect if exists in ABI, else deposit
      let tx;
      if (contracts.lendingPool.fundInvoiceDirect) {
        tx = await contracts.lendingPool.fundInvoiceDirect(selectedInvoice.tokenId || 0); // Need real tokenId
      } else {
        // Fallback to deposit for demo
        tx = await contracts.lendingPool.deposit(amountToFund);
      }

      await tx.wait();

      setFundStep(3); // "Done"

      setTimeout(() => {
        setShowFundModal(false);
        setFundStep(1);
        setFundAmount('');
        alert(`Funding Successful! TX: ${tx.hash}`);
      }, 2000);

    } catch (error) {
      console.error("Funding failed:", error);
      alert("Funding failed! See console.");
      setFundStep(1);
    }
  };

  const getRiskBadge = (risk: Invoice['riskLevel']) => {
    switch (risk) {
      case 'low':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-medium">
            <Shield className="w-3.5 h-3.5" />
            Low Risk
          </span>
        );
      case 'medium':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            Medium
          </span>
        );
      case 'high':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            High Risk
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Invoice Marketplace</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Browse and fund real business invoices for yield</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20">
          <TrendingUp className="w-5 h-5" />
          <span className="font-semibold">Avg. Yield: 9.8%</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Available Invoices', value: mockMarketplaceInvoices.length, color: 'text-[hsl(var(--foreground))]' },
          { label: 'Total Value', value: formatCurrency(mockMarketplaceInvoices.reduce((sum, inv) => sum + inv.amount, 0)), color: 'text-blue-500' },
          { label: 'Low Risk', value: mockMarketplaceInvoices.filter(i => i.riskLevel === 'low').length, color: 'text-emerald-500' },
          { label: 'High Yield (12%+)', value: mockMarketplaceInvoices.filter(i => i.yieldRate >= 12).length, color: 'text-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-[hsl(var(--card))] rounded-xl p-4 border border-[hsl(var(--border))]">
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">{stat.label}</p>
            <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'low', 'medium', 'high'].map((risk) => (
            <button
              key={risk}
              onClick={() => setRiskFilter(risk)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                riskFilter === risk
                  ? 'bg-cyan-500 text-white'
                  : 'bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]'
              )}
            >
              {risk === 'all' ? 'All' : risk.charAt(0).toUpperCase() + risk.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredInvoices.map((invoice) => (
          <div key={invoice.id} className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-5 hover:border-cyan-500/30 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-[hsl(var(--foreground))]">{invoice.invoiceNumber}</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">{invoice.clientName}</p>
                </div>
              </div>
              {getRiskBadge(invoice.riskLevel)}
            </div>

            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">{invoice.description}</p>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-[hsl(var(--muted))] rounded-lg p-3">
                <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Amount</p>
                <p className="font-bold text-[hsl(var(--foreground))]">{formatCurrency(invoice.amount)}</p>
              </div>
              <div className="bg-emerald-500/10 rounded-lg p-3">
                <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Yield</p>
                <p className="font-bold text-emerald-500">{invoice.yieldRate}%</p>
              </div>
              <div className="bg-blue-500/10 rounded-lg p-3">
                <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Due Date</p>
                <p className="font-bold text-blue-500">{invoice.dueDate}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[hsl(var(--border))]">
              <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                <span className="font-mono text-xs">{invoice.tokenId}</span>
                <ExternalLink className="w-3.5 h-3.5 cursor-pointer hover:text-[hsl(var(--foreground))]" />
              </div>
              <button
                onClick={() => handleFund(invoice)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all font-medium"
              >
                <DollarSign className="w-4 h-4" />
                Fund Invoice
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Fund Modal */}
      {showFundModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[hsl(var(--card))] rounded-2xl w-full max-w-lg p-6 border border-[hsl(var(--border))] animate-slide-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Fund Invoice</h3>
              <button onClick={() => setShowFundModal(false)} className="p-2 hover:bg-[hsl(var(--accent))] rounded-lg">
                <X className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
              </button>
            </div>

            {fundStep === 1 && (
              <>
                <div className="bg-[hsl(var(--muted))] rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                    <span className="font-semibold text-[hsl(var(--foreground))]">{selectedInvoice.invoiceNumber}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p className="text-[hsl(var(--muted-foreground))]">Client: <span className="text-[hsl(var(--foreground))]">{selectedInvoice.clientName}</span></p>
                    <p className="text-[hsl(var(--muted-foreground))]">Amount: <span className="text-[hsl(var(--foreground))] font-semibold">{formatCurrency(selectedInvoice.amount)}</span></p>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                    Amount to Fund (USD)
                  </label>
                  <input
                    type="number"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-4 text-2xl font-bold bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-[hsl(var(--foreground))]"
                  />
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">Max: {formatCurrency(selectedInvoice.amount)}</p>
                </div>

                <div className="flex gap-2 mb-6">
                  {[0.25, 0.5, 0.75, 1].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setFundAmount(Math.floor(selectedInvoice.amount * pct).toString())}
                      className="flex-1 py-2.5 px-3 bg-[hsl(var(--muted))] hover:bg-[hsl(var(--accent))] rounded-lg text-sm font-medium text-[hsl(var(--foreground))] transition-colors"
                    >
                      {pct * 100}%
                    </button>
                  ))}
                </div>

                {fundAmount && (
                  <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl p-5 mb-6 border border-cyan-500/20">
                    <h4 className="font-semibold text-[hsl(var(--foreground))] mb-3">Expected Returns</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[hsl(var(--muted-foreground))]">Principal</span>
                        <span className="font-medium text-[hsl(var(--foreground))]">{formatCurrency(Number(fundAmount))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[hsl(var(--muted-foreground))]">Expected Yield ({selectedInvoice.yieldRate}%)</span>
                        <span className="font-medium text-emerald-500">+{formatCurrency(Number(fundAmount) * (selectedInvoice.yieldRate / 100))}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-cyan-500/20">
                        <span className="font-medium text-[hsl(var(--foreground))]">Total Return</span>
                        <span className="font-bold text-cyan-500">{formatCurrency(Number(fundAmount) * (1 + selectedInvoice.yieldRate / 100))}</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {fundStep === 2 && (
              <div className="text-center py-12">
                <Loader2 className="w-16 h-16 text-cyan-500 animate-spin mx-auto mb-4" />
                <h4 className="font-semibold text-[hsl(var(--foreground))] mb-2">Processing Transaction</h4>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Please confirm the transaction in your wallet...</p>
              </div>
            )}

            {fundStep === 3 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2">Funding Successful!</h3>
                <p className="text-[hsl(var(--muted-foreground))] mb-6">
                  You have successfully funded this invoice
                </p>
                <div className="bg-[hsl(var(--muted))] rounded-xl p-4 text-left text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--muted-foreground))]">Amount Funded</span>
                    <span className="font-medium text-[hsl(var(--foreground))]">{formatCurrency(Number(fundAmount))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--muted-foreground))]">Expected Return</span>
                    <span className="font-medium text-emerald-500">{formatCurrency(Number(fundAmount) * (1 + selectedInvoice.yieldRate / 100))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--muted-foreground))]">Maturity</span>
                    <span className="font-medium text-[hsl(var(--foreground))]">{selectedInvoice.dueDate}</span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={processFund}
              disabled={fundStep === 1 && !fundAmount}
              className={cn(
                "w-full mt-4 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-medium transition-all",
                fundStep === 1 && !fundAmount
                  ? 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/25'
              )}
            >
              {fundStep === 1 ? 'Confirm Funding' : fundStep === 2 ? 'Processing...' : 'Done'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
