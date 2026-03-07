import { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Coins,
  CheckCircle,
  Clock,
  DollarSign,
  X,
  Loader2
} from 'lucide-react';
import { Invoice } from '@/types';
import { ethers } from 'ethers';
import { cn } from '@/utils/cn';
import { useWallet } from '@/context/WalletContext';
import { DemoFundingCard } from '@/components/DemoFundingCard';
import { mapChainInvoiceToInvoice, mapInvoiceRisk } from '@/utils/invoices';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

export function Invoices() {
  const { contracts, account } = useWallet();
  const [searchTerm, setSearchTerm] = useState('');
  const [showMintModal, setShowMintModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [mintStep, setMintStep] = useState(0);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [repayAmount, setRepayAmount] = useState('');
  const [repayStep, setRepayStep] = useState(0);
  const [repayDue, setRepayDue] = useState(0);
  const [repayWalletBalance, setRepayWalletBalance] = useState(0);

  // New Invoice Form State
  const [newInvoice, setNewInvoice] = useState({
    clientName: '',
    amount: '',
    dueDate: '',
    description: '',
    yieldRate: '10',
  });

  const loadData = async () => {
    if (!account) return;
    setIsLoading(true);

    // 1. ALWAYS Load Drafts First
    const allInvoices: Invoice[] = [];
    try {
      const safeAccount = account.toLowerCase();
      const draftsKey = `crediprocure_drafts_${safeAccount}`;
      const drafts: Invoice[] = JSON.parse(localStorage.getItem(draftsKey) || '[]');
      allInvoices.push(...drafts);
    } catch (e) {
      console.error("Draft load error:", e);
    }

    // 2. Try Load Blockchain Data (Don't let it block drafts)
    if (contracts.invoiceNFT) {
      try {
        const balance = await contracts.invoiceNFT.balanceOf(account);
        console.log(`Fetching ${balance} invoices from chain...`);

        const chainInvoices: Invoice[] = [];
        for (let i = 0; i < Number(balance); i++) {
          const tokenId = await contracts.invoiceNFT.tokenOfOwnerByIndex(account, i);
          const iv = await contracts.invoiceNFT.invoices(tokenId);

          chainInvoices.push(
            mapChainInvoiceToInvoice(iv, {
              clientName: 'My Company',
              description: `RWA Invoice #${iv.id}`,
            })
          );
        }
        allInvoices.push(...chainInvoices.reverse());
      } catch (chainErr) {
        console.error("Blockchain fetch failed:", chainErr);
      }
    }

    // 3. Set State (Combined)
    allInvoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setInvoices(allInvoices);
    setIsLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, [account, contracts.invoiceNFT]);

  const handleCreateInvoice = () => {
    if (!account) return alert('Connect wallet');

    // Validation
    if (!newInvoice.clientName || !newInvoice.amount || !newInvoice.dueDate) {
      alert('Please fill in client name, amount, and due date');
      return;
    }

    const dueDateTimestamp = new Date(newInvoice.dueDate).getTime();
    if (Number.isNaN(dueDateTimestamp) || dueDateTimestamp <= Date.now()) {
      alert('Due date must be in the future.');
      return;
    }

    const mockId = `draft-${Date.now()}`;
    const invoice: Invoice = {
      id: mockId,
      invoiceNumber: `DRAFT-${Math.floor(Math.random() * 10000)}`,
      clientName: newInvoice.clientName,
      amount: Number(newInvoice.amount),
      dueDate: newInvoice.dueDate,
      description: newInvoice.description || 'No description',
      status: 'pending',
      riskLevel: mapInvoiceRisk(Math.round(Number(newInvoice.yieldRate || '10') * 100)),
      createdAt: new Date().toISOString().split('T')[0],
      yieldRate: Number(newInvoice.yieldRate || '10')
    };

    // Save to LocalStorage (Case Insensitive Key)
    const safeAccount = account.toLowerCase();
    const draftsKey = `crediprocure_drafts_${safeAccount}`;

    try {
      const current = JSON.parse(localStorage.getItem(draftsKey) || '[]');
      current.push(invoice);
      localStorage.setItem(draftsKey, JSON.stringify(current));

      // OPTIMISTIC UPDATE (Force UI update immediately)
      setInvoices(prev => [invoice, ...prev]); // Add to top of list

      setShowCreateModal(false);
      setNewInvoice({ clientName: '', amount: '', dueDate: '', description: '', yieldRate: '10' });

      // Optional: Show success feedback?
      // alert('Draft Created!'); 
    } catch (e) {
      console.error("LocalStorage Error:", e);
      alert("Failed to save draft. Check console.");
    }
  };

  const handleMint = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowMintModal(true);
    setMintStep(0);
  };

  const processMint = async () => {
    if (!selectedInvoice || !contracts.invoiceNFT || !account) return;

    try {
      setMintStep(1); // Creating

      const amount = ethers.parseUnits(selectedInvoice.amount.toString(), 18);
      const dueDate = Math.floor(new Date(selectedInvoice.dueDate).getTime() / 1000);
      if (dueDate <= Math.floor(Date.now() / 1000)) {
        alert('The invoice due date must be in the future before minting.');
        setMintStep(0);
        return;
      }
      const interestRate = Math.round(selectedInvoice.yieldRate * 100);

      const tx = await contracts.invoiceNFT.mintInvoice(amount, dueDate, interestRate);

      setMintStep(2); // Confirming
      await tx.wait();

      const safeAccount = account.toLowerCase();
      const draftsKey = `crediprocure_drafts_${safeAccount}`;
      const drafts: Invoice[] = JSON.parse(localStorage.getItem(draftsKey) || '[]');
      const updatedDrafts = drafts.filter((draft) => draft.id !== selectedInvoice.id);
      localStorage.setItem(draftsKey, JSON.stringify(updatedDrafts));

      setMintStep(3); // Done

      setTimeout(() => {
        setShowMintModal(false);
        setMintStep(0);
        setSelectedInvoice(null);
        void loadData();
      }, 2000);

    } catch (error) {
      console.error("Mint failed:", error);
      alert("Minting failed! See console.");
      setMintStep(0);
    }
  };

  const handleOpenRepay = async (invoice: Invoice) => {
    if (!invoice.tokenId || !contracts.lendingPool || !contracts.stablecoin || !account) {
      alert('Connect wallet first.');
      return;
    }

    setSelectedInvoice(invoice);
    setShowRepayModal(true);
    setRepayStep(0);

    try {
      const [remainingDueRaw, walletStableRaw] = await Promise.all([
        contracts.lendingPool.remainingDue(invoice.tokenId),
        contracts.stablecoin.balanceOf(account),
      ]);

      const remainingDue = Number(ethers.formatUnits(remainingDueRaw, 18));
      setRepayDue(remainingDue);
      setRepayWalletBalance(Number(ethers.formatUnits(walletStableRaw, 18)));
      setRepayAmount(remainingDue > 0 ? remainingDue.toString() : '');
    } catch (error) {
      console.error('Failed to prepare repayment:', error);
      alert('Failed to load repayment details.');
      setShowRepayModal(false);
    }
  };

  const processRepay = async () => {
    if (!selectedInvoice?.tokenId || !contracts.lendingPool || !contracts.stablecoin) return;
    if (!repayAmount || Number(repayAmount) <= 0) {
      alert('Enter a valid repayment amount.');
      return;
    }

    try {
      setRepayStep(1);
      const parsedAmount = ethers.parseUnits(repayAmount, 18);

      const approvalTx = await contracts.stablecoin.approve(contracts.lendingPool.target, parsedAmount);
      await approvalTx.wait();

      setRepayStep(2);
      const repayTx = await contracts.lendingPool.repay(selectedInvoice.tokenId, parsedAmount);
      await repayTx.wait();

      setRepayStep(3);
      setTimeout(() => {
        setShowRepayModal(false);
        setRepayStep(0);
        setRepayAmount('');
        setRepayDue(0);
        void loadData();
      }, 2000);
    } catch (error) {
      console.error('Repayment failed:', error);
      alert('Repayment failed. Check your demo stablecoin balance and wallet confirmation.');
      setRepayStep(0);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    if (!inv) return false;
    const term = searchTerm.toLowerCase();
    return (
      (inv.invoiceNumber || '').toLowerCase().includes(term) ||
      (inv.clientName || '').toLowerCase().includes(term)
    );
  });

  const getStatusConfig = (status: Invoice['status']) => {
    switch (status) {
      case 'pending': return { color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', icon: Clock, label: 'Pending' };
      case 'minted': return { color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', icon: Coins, label: 'Minted' };
      case 'funded': return { color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400', icon: DollarSign, label: 'Funded' };
      case 'repaid': return { color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', icon: CheckCircle, label: 'Repaid' };
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
      </div>

      {/* Stats */}
      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-100">
        Draft invoices stay local until you mint them. Minted invoices are stored on Creditcoin testnet, and funded invoices can be repaid directly from this page.
      </div>

      <DemoFundingCard
        onMinted={async () => {
          if (showRepayModal && selectedInvoice) {
            await handleOpenRepay(selectedInvoice);
          }
        }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[hsl(var(--card))] p-5 rounded-xl border border-[hsl(var(--border))]">
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Total Invoices</p>
          <p className="text-2xl font-bold">{invoices.length}</p>
        </div>
        <div className="bg-[hsl(var(--card))] p-5 rounded-xl border border-[hsl(var(--border))]">
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Minted to RWA</p>
          <p className="text-2xl font-bold text-blue-500">
            {invoices.filter(i => i.status !== 'pending').length}
          </p>
        </div>
        <div className="bg-[hsl(var(--card))] p-5 rounded-xl border border-[hsl(var(--border))]">
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Funded</p>
          <p className="text-2xl font-bold text-violet-500">
            {invoices.filter(i => i.status === 'funded').length}
          </p>
        </div>
        <div className="bg-[hsl(var(--card))] p-5 rounded-xl border border-[hsl(var(--border))]">
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Repaid</p>
          <p className="text-2xl font-bold text-purple-500">
            {invoices.filter(i => i.status === 'repaid').length}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl hover:bg-[hsl(var(--accent))] transition-colors"
            title="Refresh List"
          >
            <Loader2 className={cn("w-5 h-5", isLoading && "animate-spin")} />
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white rounded-xl hover:shadow-lg hover:shadow-violet-500/25 transition-all font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>


      {/* Invoices List */}
      <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] overflow-hidden">
        {isLoading && invoices.length === 0 ? (
          <div className="p-8 text-center text-[hsl(var(--muted-foreground))]">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 opacity-50" />
            <p>Loading invoices...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-[hsl(var(--muted-foreground))]">
            <p>No invoices found. Create one to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-[hsl(var(--border))]">
            {filteredInvoices.map((invoice) => {
              const status = getStatusConfig(invoice.status);
              return (
                <div key={invoice.id} className="p-5 hover:bg-[hsl(var(--muted))] transition-colors group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[hsl(var(--muted))] flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[hsl(var(--foreground))]">{invoice.invoiceNumber}</h3>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">{invoice.clientName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 sm:ml-auto">
                      <div className="text-right">
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Amount</p>
                        <p className="font-bold text-[hsl(var(--foreground))]">{formatCurrency(invoice.amount)}</p>
                      </div>

                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Due Date</p>
                        <p className="font-medium text-[hsl(var(--foreground))]">{invoice.dueDate}</p>
                      </div>

                      <div className={cn("px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-medium", status.color)}>
                        <status.icon className="w-3.5 h-3.5" />
                        {status.label}
                      </div>

                      {invoice.status === 'pending' && (
                        <button
                          onClick={() => handleMint(invoice)}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Mint to RWA
                        </button>
                      )}

                      {invoice.status === 'funded' && (
                        <button
                          onClick={() => {
                            void handleOpenRepay(invoice);
                          }}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-violet-600 hover:bg-violet-700 text-white"
                        >
                          Repay Invoice
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[hsl(var(--border))] flex items-center justify-between">
              <h3 className="text-xl font-bold">Create New Invoice</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Client Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                  placeholder="e.g. Acme Corp"
                  value={newInvoice.clientName}
                  onChange={e => setNewInvoice({ ...newInvoice, clientName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Amount (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="number"
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                      placeholder="0.00"
                      value={newInvoice.amount}
                      onChange={e => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Due Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                    value={newInvoice.dueDate}
                    onChange={e => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                    min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Yield Rate (%)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  step="0.1"
                  className="w-full px-4 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                  placeholder="10"
                  value={newInvoice.yieldRate}
                  onChange={e => setNewInvoice({ ...newInvoice, yieldRate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Description (Optional)</label>
                <textarea
                  className="w-full px-4 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none min-h-[100px]"
                  placeholder="Details about services provided..."
                  value={newInvoice.description}
                  onChange={e => setNewInvoice({ ...newInvoice, description: e.target.value })}
                />
              </div>
            </div>

            <div className="p-6 border-t border-[hsl(var(--border))] flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-5 py-2.5 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateInvoice}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-colors font-bold shadow-lg shadow-violet-500/20"
              >
                Create Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mint Modal */}
      {showMintModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-8 text-center">
              {mintStep === 0 && (
                <>
                  <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Coins className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Mint Invoice to RWA</h3>
                  <p className="text-[hsl(var(--muted-foreground))] mb-8">
                    This will tokenize invoice <span className="font-mono text-[hsl(var(--foreground))]">{selectedInvoice.invoiceNumber}</span> on Creditcoin testnet using your connected vendor wallet.
                  </p>

                  <div className="bg-[hsl(var(--muted))] p-4 rounded-xl mb-8 text-left">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">Gas Fee (Est.)</span>
                      <span className="font-medium">~0.002 CTC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">Yield Rate</span>
                      <span className="font-medium text-violet-500">{selectedInvoice.yieldRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">Platform Fee</span>
                      <span className="font-medium text-violet-500">Free</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowMintModal(false)}
                      className="flex-1 py-3 rounded-xl border border-[hsl(var(--border))] font-medium hover:bg-[hsl(var(--muted))]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={processMint}
                      className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/25"
                    >
                      Confirm Mint
                    </button>
                  </div>
                </>
              )}

              {mintStep === 1 && (
                <>
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-6" />
                  <h3 className="text-xl font-bold mb-2">Minting {selectedInvoice.invoiceNumber}</h3>
                  <p className="text-[hsl(var(--muted-foreground))]">Please confirm the transaction in your wallet...</p>
                </>
              )}

              {mintStep === 2 && (
                <>
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-6" />
                  <h3 className="text-xl font-bold mb-2">Confirming on Chain</h3>
                  <p className="text-[hsl(var(--muted-foreground))]">Waiting for block confirmation...</p>
                </>
              )}

              {mintStep === 3 && (
                <>
                  <div className="w-16 h-16 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-violet-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-violet-500">Success! Invoice Minted on Chain.</h3>
                  <p className="text-[hsl(var(--muted-foreground))]">Redirecting...</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showRepayModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[hsl(var(--border))] flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Repay Funded Invoice</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{selectedInvoice.invoiceNumber}</p>
              </div>
              <button
                onClick={() => {
                  setShowRepayModal(false);
                  setRepayStep(0);
                }}
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {repayStep === 0 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-[hsl(var(--muted))] p-4">
                      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Outstanding Due</p>
                      <p className="text-xl font-bold text-[hsl(var(--foreground))]">{formatCurrency(repayDue)}</p>
                    </div>
                    <div className="rounded-xl bg-[hsl(var(--muted))] p-4">
                      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Wallet Stablecoin</p>
                      <p className="text-xl font-bold text-[hsl(var(--foreground))]">{formatCurrency(repayWalletBalance)}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Repayment Amount (mUSD)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={repayAmount}
                      onChange={(e) => setRepayAmount(e.target.value)}
                      className="w-full px-4 py-4 text-2xl font-bold bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-[hsl(var(--foreground))]"
                    />
                    <div className="mt-3 flex gap-2">
                      {[0.25, 0.5, 1].map((portion) => (
                        <button
                          key={portion}
                          onClick={() => setRepayAmount((repayDue * portion).toFixed(2))}
                          className="flex-1 py-2.5 px-3 bg-[hsl(var(--muted))] hover:bg-[hsl(var(--accent))] rounded-lg text-sm font-medium text-[hsl(var(--foreground))] transition-colors"
                        >
                          {portion === 1 ? 'Full Due' : `${portion * 100}%`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-4 text-sm text-[hsl(var(--muted-foreground))]">
                    Repayment requires a mock stablecoin approval first. Use the free demo funding card above if this wallet needs more mUSD.
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowRepayModal(false)}
                      className="flex-1 py-3 rounded-xl border border-[hsl(var(--border))] font-medium hover:bg-[hsl(var(--muted))]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={processRepay}
                      disabled={!repayAmount || Number(repayAmount) <= 0 || Number(repayAmount) > repayDue}
                      className={cn(
                        'flex-1 py-3 rounded-xl font-bold transition-colors',
                        !repayAmount || Number(repayAmount) <= 0 || Number(repayAmount) > repayDue
                          ? 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-not-allowed'
                          : 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/25'
                      )}
                    >
                      Approve & Repay
                    </button>
                  </div>
                </div>
              )}

              {repayStep === 1 && (
                <div className="py-10 text-center">
                  <Loader2 className="w-12 h-12 text-violet-500 animate-spin mx-auto mb-4" />
                  <h4 className="text-xl font-bold mb-2">Approving Stablecoin</h4>
                  <p className="text-[hsl(var(--muted-foreground))]">Confirm the approval in your wallet.</p>
                </div>
              )}

              {repayStep === 2 && (
                <div className="py-10 text-center">
                  <Loader2 className="w-12 h-12 text-violet-500 animate-spin mx-auto mb-4" />
                  <h4 className="text-xl font-bold mb-2">Submitting Repayment</h4>
                  <p className="text-[hsl(var(--muted-foreground))]">Waiting for Creditcoin confirmation.</p>
                </div>
              )}

              {repayStep === 3 && (
                <div className="py-8 text-center">
                  <div className="w-16 h-16 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-violet-500" />
                  </div>
                  <h4 className="text-xl font-bold mb-2 text-violet-500">Repayment Recorded</h4>
                  <p className="text-[hsl(var(--muted-foreground))]">The lending pool state and invoice status are being refreshed.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
