import { useState, useEffect } from 'react';
import {
  Coins,
  FileText,
  ArrowRight,
  CheckCircle,
  Info,
  Wallet,
  Clock,
  Zap,
  Loader2
} from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { Invoice } from '@/types';
import { ethers } from 'ethers';
import { cn } from '@/utils/cn';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

export function LiquidityRequest() {
  const { account, contracts } = useWallet();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [requestAmount, setRequestAmount] = useState('');
  const [step, setStep] = useState(1);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Minted Invoices
  const loadData = async () => {
    if (!account || !contracts.invoiceNFT) return;
    setIsLoading(true);
    try {
      const balance = await contracts.invoiceNFT.balanceOf(account);
      const fetched: Invoice[] = [];
      for (let i = 0; i < Number(balance); i++) {
        const tokenId = await contracts.invoiceNFT.tokenOfOwnerByIndex(account, i);
        const iv = await contracts.invoiceNFT.invoices(tokenId);

        if (!iv.isFunded) { // Only show MINTED (not funded) invoices
          fetched.push({
            id: iv.id.toString(),
            invoiceNumber: `INV-${iv.id}`,
            clientName: "My Company",
            amount: Number(ethers.formatUnits(iv.amount, 18)),
            status: 'minted',
            dueDate: new Date(Number(iv.dueDate) * 1000).toISOString().split('T')[0],
            yieldRate: Number(iv.yieldRate) / 100,
            description: `Invoice #${iv.id}`,
            tokenId: iv.id.toString(),
            riskLevel: 'low',
            createdAt: new Date().toISOString().split('T')[0]
          });
        }
      }
      setInvoices(fetched.reverse());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [account, contracts.invoiceNFT]);

  const selected = invoices.find(inv => inv.id === selectedInvoiceId);
  const maxLTV = selected ? selected.amount * 0.85 : 0;

  const handleSubmit = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  if (!account) return <div className="p-8 text-center text-[hsl(var(--muted-foreground))]">Connect Wallet to request liquidity.</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Request Liquidity</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Get instant funding for your minted invoices</p>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <h4 className="font-semibold text-[hsl(var(--foreground))] mb-1">How Invoice Factoring Works</h4>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              After your invoice is minted as an RWA token, investors can fund up to 85% of its value.
              When your client pays, the smart contract automatically repays investors with interest.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {[
          { num: 1, label: 'Select Invoice' },
          { num: 2, label: 'Set Amount' },
          { num: 3, label: 'Confirm' }
        ].map((s, i) => (
          <div key={s.num} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                step >= s.num ? 'bg-emerald-500 text-white' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
              )}>
                {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
              </div>
              <span className={cn(
                "hidden sm:block text-sm font-medium",
                step >= s.num ? 'text-emerald-500' : 'text-[hsl(var(--muted-foreground))]'
              )}>
                {s.label}
              </span>
            </div>
            {i < 2 && <ArrowRight className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6">
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">Select Invoice for Funding</h3>
              <button
                onClick={loadData}
                disabled={isLoading}
                className="p-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--accent))] transition-colors flex items-center gap-2"
                title="Refresh List"
              >
                <Loader2 className={cn("w-4 h-4", isLoading && "animate-spin")} />
                Refresh
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" /></div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-3 opacity-50" />
                <p className="text-[hsl(var(--foreground))] font-medium">No mint invoices available</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Mint invoices in "Invoices & RWA" first.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <button
                    key={invoice.id}
                    onClick={() => setSelectedInvoiceId(invoice.id)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all",
                      selectedInvoiceId === invoice.id
                        ? 'border-emerald-500 bg-emerald-500/5'
                        : 'border-[hsl(var(--border))] hover:border-[hsl(var(--muted-foreground))]'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          selectedInvoiceId === invoice.id ? 'bg-emerald-500/10' : 'bg-[hsl(var(--muted))]'
                        )}>
                          <FileText className={cn(
                            "w-5 h-5",
                            selectedInvoiceId === invoice.id ? 'text-emerald-500' : 'text-[hsl(var(--muted-foreground))]'
                          )} />
                        </div>
                        <div>
                          <p className="font-semibold text-[hsl(var(--foreground))]">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-[hsl(var(--muted-foreground))]">{invoice.clientName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[hsl(var(--foreground))]">{formatCurrency(invoice.amount)}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono">ID: {invoice.tokenId}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && selected && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">Set Funding Amount</h3>

            <div className="bg-[hsl(var(--muted))] rounded-xl p-4">
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Selected Invoice</p>
              <p className="font-semibold text-[hsl(var(--foreground))]">{selected.invoiceNumber} - {selected.clientName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                Amount Needed (USD)
              </label>
              <input
                type="number"
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-4 text-3xl font-bold bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-[hsl(var(--foreground))]"
              />
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">Min: {formatCurrency(selected.amount * 0.1)}</span>
                <span className="text-[hsl(var(--muted-foreground))]">Max (85% LTV): {formatCurrency(maxLTV)}</span>
              </div>
            </div>

            {/* Quick Select */}
            <div className="flex gap-2">
              {[0.5, 0.75, 0.85].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setRequestAmount(Math.floor(selected.amount * pct).toString())}
                  className="flex-1 py-2.5 px-3 bg-[hsl(var(--muted))] hover:bg-[hsl(var(--accent))] rounded-lg text-sm font-medium text-[hsl(var(--foreground))] transition-colors"
                >
                  {pct * 100}%
                </button>
              ))}
            </div>

            {/* Summary */}
            {requestAmount && (
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-5 border border-emerald-500/20">
                <h4 className="font-semibold text-[hsl(var(--foreground))] mb-3">Funding Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--muted-foreground))]">Request Amount</span>
                    <span className="font-medium text-[hsl(var(--foreground))]">{formatCurrency(Number(requestAmount))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--muted-foreground))]">Interest Rate ({selected.yieldRate}%)</span>
                    <span className="font-medium text-[hsl(var(--foreground))]">{formatCurrency(Number(requestAmount) * (selected.yieldRate / 100))}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-emerald-500/20">
                    <span className="font-medium text-[hsl(var(--foreground))]">Total Repayment</span>
                    <span className="font-bold text-emerald-500">{formatCurrency(Number(requestAmount) * (1 + selected.yieldRate / 100))}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && selected && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2">Request Submitted!</h3>
            <p className="text-[hsl(var(--muted-foreground))] mb-6">
              Your funding request regarding <strong>{selected.invoiceNumber}</strong> has been broadcast to investors.
            </p>

            <div className="mt-6 p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-xl border border-emerald-500/20">
              <div className="flex items-center gap-2 justify-center text-emerald-500">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Your credit score will increase upon repayment</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-[hsl(var(--border))]">
          {step > 1 && step < 3 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2.5 border border-[hsl(var(--border))] text-[hsl(var(--foreground))] rounded-xl hover:bg-[hsl(var(--accent))] transition-colors font-medium"
            >
              Back
            </button>
          )}
          {step < 3 && (
            <button
              onClick={handleSubmit}
              disabled={step === 1 ? !selectedInvoiceId : !requestAmount}
              className={cn(
                "flex-1 px-6 py-2.5 rounded-xl font-medium transition-all",
                (step === 1 ? selectedInvoiceId : requestAmount)
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/25'
                  : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-not-allowed'
              )}
            >
              {step === 2 ? 'Submit Request' : 'Continue'}
            </button>
          )}
          {step === 3 && (
            <button
              onClick={() => { setStep(1); setSelectedInvoiceId(null); setRequestAmount(''); }}
              className="flex-1 px-6 py-2.5 bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] rounded-xl hover:bg-[hsl(var(--accent))] transition-colors font-medium"
            >
              Submit Another Request
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
