import { useState, useEffect } from 'react';
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

export function Invoices() {
  const { contracts, account } = useWallet();
  const [searchTerm, setSearchTerm] = useState('');
  const [showMintModal, setShowMintModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [mintStep, setMintStep] = useState(0);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // New Invoice Form State
  const [newInvoice, setNewInvoice] = useState({
    clientName: '',
    amount: '',
    dueDate: '',
    description: ''
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

          chainInvoices.push({
            id: iv.id.toString(),
            invoiceNumber: `INV-${iv.id}`,
            clientName: "My Company",
            amount: Number(ethers.formatUnits(iv.amount, 18)),
            status: iv.isFunded ? 'funded' : 'minted',
            dueDate: new Date(Number(iv.dueDate) * 1000).toISOString().split('T')[0],
            yieldRate: Number(iv.yieldRate) / 100,
            description: `RWA Invoice #${iv.id}`,
            tokenId: iv.id.toString(),
            riskLevel: Number(iv.yieldRate) >= 1000 ? 'high' : Number(iv.yieldRate) >= 500 ? 'medium' : 'low',
            createdAt: new Date().toISOString().split('T')[0]
          });
        }
        allInvoices.push(...chainInvoices.reverse());
      } catch (chainErr) {
        console.error("Blockchain fetch failed:", chainErr);
      }
    }

    // 3. Set State (Combined)
    setInvoices(allInvoices);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [account, contracts.invoiceNFT]);


  const handleCreateInvoice = () => {
    if (!account) return alert('Connect wallet');

    // Validation
    if (!newInvoice.clientName || !newInvoice.amount) {
      alert('Please fill in Client Name and Amount');
      return;
    }

    const mockId = `draft-${Date.now()}`;
    const invoice: Invoice = {
      id: mockId,
      invoiceNumber: `DRAFT-${Math.floor(Math.random() * 10000)}`,
      clientName: newInvoice.clientName,
      amount: Number(newInvoice.amount),
      dueDate: newInvoice.dueDate || new Date().toISOString().split('T')[0],
      description: newInvoice.description || 'No description',
      status: 'pending',
      riskLevel: 'low',
      createdAt: new Date().toISOString().split('T')[0],
      yieldRate: 10
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
      setNewInvoice({ clientName: '', amount: '', dueDate: '', description: '' });

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
      const interestRate = 1000; // Fixed 10% for demo (1000 basis points)

      const tx = await contracts.invoiceNFT.mintInvoice(account, amount, dueDate, interestRate);

      setMintStep(2); // Confirming
      await tx.wait();

      // Fix: Use Safe Account Lowercase for Deletion key
      const safeAccount = account.toLowerCase();
      const draftsKey = `crediprocure_drafts_${safeAccount}`;

      const drafts: Invoice[] = JSON.parse(localStorage.getItem(draftsKey) || '[]');
      const updatedDrafts = drafts.filter(i => i.id !== selectedInvoice.id);
      localStorage.setItem(draftsKey, JSON.stringify(updatedDrafts));

      setMintStep(3); // Done

      setTimeout(() => {
        setShowMintModal(false);
        setMintStep(0);
        loadData(); // Reload to see new minted status
      }, 2000); // 2 second delay before reload logic

    } catch (error) {
      console.error("Mint failed:", error);
      alert("Minting failed! See console.");
      setMintStep(0);
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
      case 'funded': return { color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', icon: DollarSign, label: 'Funded' };
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[hsl(var(--card))] p-5 rounded-xl border border-[hsl(var(--border))]">
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Total Invoices</p>
          <p className="text-2xl font-bold">{invoices.length}</p>
        </div>
        <div className="bg-[hsl(var(--card))] p-5 rounded-xl border border-[hsl(var(--border))]">
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Minted to RWA</p>
          <p className="text-2xl font-bold text-blue-500">
            {invoices.filter(i => i.status === 'minted' || i.status === 'funded').length}
          </p>
        </div>
        <div className="bg-[hsl(var(--card))] p-5 rounded-xl border border-[hsl(var(--border))]">
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Funded</p>
          <p className="text-2xl font-bold text-emerald-500">
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
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
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
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all font-medium"
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
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Mint to RWA
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
                  className="w-full px-4 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
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
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
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
                    className="w-full px-4 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    value={newInvoice.dueDate}
                    onChange={e => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Description (Optional)</label>
                <textarea
                  className="w-full px-4 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none min-h-[100px]"
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
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors font-bold shadow-lg shadow-emerald-500/20"
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
                    This will tokenize invoice <span className="font-mono text-[hsl(var(--foreground))]">{selectedInvoice.invoiceNumber}</span> on the Creditcoin blockchain correctly.
                  </p>

                  <div className="bg-[hsl(var(--muted))] p-4 rounded-xl mb-8 text-left">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">Gas Fee (Est.)</span>
                      <span className="font-medium">~0.002 CTC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">Platform Fee</span>
                      <span className="font-medium text-emerald-500">Free</span>
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
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-emerald-500">Success! Invoice Minted on Chain.</h3>
                  <p className="text-[hsl(var(--muted-foreground))]">Redirecting...</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
