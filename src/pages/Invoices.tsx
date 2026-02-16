import { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Upload,
  Coins,
  ExternalLink,
  CheckCircle,
  Clock,
  DollarSign,
  X,
  Loader2
} from 'lucide-react';
import { mockInvoices } from '@/data/mockData';
import { Invoice } from '@/types';
import { cn } from '@/utils/cn';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

export function Invoices() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showMintModal, setShowMintModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [mintStep, setMintStep] = useState(0);
  const [invoices] = useState<Invoice[]>(mockInvoices);

  const filteredInvoices = invoices.filter(inv =>
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMint = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowMintModal(true);
    setMintStep(0);
  };

  const processMint = () => {
    if (mintStep < 3) {
      setMintStep(mintStep + 1);
    } else {
      setShowMintModal(false);
      setMintStep(0);
    }
  };

  const mintSteps = [
    { title: 'Document Validation', desc: 'Verifying invoice authenticity...' },
    { title: 'Creating RWA Token', desc: 'Minting NFT on Creditcoin...' },
    { title: 'On-Chain Confirmation', desc: 'Waiting for blockchain confirmation...' },
    { title: 'Complete', desc: 'Invoice successfully minted as RWA!' },
  ];

  const getStatusConfig = (status: Invoice['status']) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', icon: Clock, label: 'Pending' };
      case 'minted':
        return { color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', icon: Coins, label: 'Minted' };
      case 'funded':
        return { color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', icon: DollarSign, label: 'Funded' };
      case 'repaid':
        return { color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', icon: CheckCircle, label: 'Repaid' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Invoices & RWA Tokens</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Manage invoices and mint them as Real World Assets</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all font-medium">
          <Plus className="w-5 h-5" />
          Create Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Invoices', value: invoices.length, color: 'text-[hsl(var(--foreground))]' },
          { label: 'Minted to RWA', value: invoices.filter(i => i.status !== 'pending').length, color: 'text-blue-500' },
          { label: 'Funded', value: invoices.filter(i => i.status === 'funded').length, color: 'text-emerald-500' },
          { label: 'Repaid', value: invoices.filter(i => i.status === 'repaid').length, color: 'text-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-[hsl(var(--card))] rounded-xl p-4 border border-[hsl(var(--border))]">
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">{stat.label}</p>
            <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
        <input
          type="text"
          placeholder="Search invoices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
        />
      </div>

      {/* Invoice Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredInvoices.map((invoice) => {
          const statusConfig = getStatusConfig(invoice.status);
          return (
            <div key={invoice.id} className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-5 hover:border-emerald-500/30 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-[hsl(var(--muted-foreground))]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[hsl(var(--foreground))]">{invoice.invoiceNumber}</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{invoice.clientName}</p>
                  </div>
                </div>
                <span className={cn("px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5", statusConfig.color)}>
                  <statusConfig.icon className="w-3.5 h-3.5" />
                  {statusConfig.label}
                </span>
              </div>

              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">{invoice.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[hsl(var(--muted))] rounded-lg p-3">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Amount</p>
                  <p className="font-bold text-[hsl(var(--foreground))]">{formatCurrency(invoice.amount)}</p>
                </div>
                <div className="bg-[hsl(var(--muted))] rounded-lg p-3">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Due Date</p>
                  <p className="font-medium text-[hsl(var(--foreground))]">{invoice.dueDate}</p>
                </div>
                <div className="bg-[hsl(var(--muted))] rounded-lg p-3">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Risk Level</p>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium",
                    invoice.riskLevel === 'low' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                    invoice.riskLevel === 'medium' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 
                    'bg-red-500/10 text-red-600 dark:text-red-400'
                  )}>
                    {invoice.riskLevel.toUpperCase()}
                  </span>
                </div>
                <div className="bg-[hsl(var(--muted))] rounded-lg p-3">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Yield Rate</p>
                  <p className="font-medium text-emerald-500">{invoice.yieldRate}%</p>
                </div>
              </div>

              {invoice.tokenId && (
                <div className="bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 rounded-lg p-3 mb-4 border border-emerald-500/20">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">RWA Token ID</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-[hsl(var(--foreground))]">{invoice.tokenId}</span>
                    <ExternalLink className="w-4 h-4 text-emerald-500 cursor-pointer hover:text-emerald-600" />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {invoice.status === 'pending' && (
                  <button 
                    onClick={() => handleMint(invoice)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all font-medium"
                  >
                    <Coins className="w-4 h-4" />
                    Mint to RWA
                  </button>
                )}
                {invoice.status === 'minted' && (
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all font-medium">
                    <DollarSign className="w-4 h-4" />
                    Request Funding
                  </button>
                )}
                {(invoice.status === 'funded' || invoice.status === 'repaid') && (
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] rounded-xl hover:bg-[hsl(var(--accent))] transition-colors font-medium">
                    <ExternalLink className="w-4 h-4" />
                    View Details
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mint Modal */}
      {showMintModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[hsl(var(--card))] rounded-2xl w-full max-w-lg p-6 border border-[hsl(var(--border))] animate-slide-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Mint Invoice to RWA</h3>
              <button onClick={() => setShowMintModal(false)} className="p-2 hover:bg-[hsl(var(--accent))] rounded-lg">
                <X className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
              </button>
            </div>

            {/* Invoice Info */}
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

            {/* Upload Area */}
            {mintStep === 0 && (
              <div className="border-2 border-dashed border-[hsl(var(--border))] rounded-xl p-8 text-center mb-6 hover:border-emerald-500/50 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-3" />
                <p className="text-[hsl(var(--foreground))] font-medium mb-1">Upload Invoice Document</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">PDF or image, max 10MB</p>
              </div>
            )}

            {/* Progress Steps */}
            {mintStep > 0 && (
              <div className="space-y-3 mb-6">
                {mintSteps.map((step, index) => (
                  <div key={index} className={cn(
                    "flex items-center gap-3 p-4 rounded-xl transition-all",
                    index < mintStep ? 'bg-emerald-500/10' :
                    index === mintStep ? 'bg-blue-500/10' : 'bg-[hsl(var(--muted))]'
                  )}>
                    {index < mintStep ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : index === mintStep ? (
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-[hsl(var(--border))] rounded-full" />
                    )}
                    <div>
                      <p className={cn(
                        "font-medium",
                        index < mintStep ? 'text-emerald-600 dark:text-emerald-400' :
                        index === mintStep ? 'text-blue-600 dark:text-blue-400' : 'text-[hsl(var(--muted-foreground))]'
                      )}>{step.title}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Button */}
            <button 
              onClick={processMint}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all font-medium"
            >
              {mintStep === 0 ? (
                <>
                  <Coins className="w-5 h-5" />
                  Start Minting Process
                </>
              ) : mintStep < 3 ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Done
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
