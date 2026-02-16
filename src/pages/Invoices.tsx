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
      }, 2000);

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
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all font-medium"
        >
          <Plus className="w-5 h-5" />
          Create Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Invoices', value: invoices.length, color: 'text-[hsl(var(--foreground))]' },
          { label: 'Minted to RWA', value: invoices.filter(i => i.status === 'minted').length, color: 'text-blue-500' },
          { label: 'Funded', value: invoices.filter(i => i.status === 'funded').length, color: 'text-emerald-500' },
          { label: 'Repaid', value: invoices.filter(i => i.status === 'repaid').length, color: 'text-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-[hsl(var(--card))] rounded-xl p-4 border border-[hsl(var(--border))]">
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">{stat.label}</p>
            <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? <div className="col-span-2 text-center py-10"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div> :
          filteredInvoices.length === 0 ? <div className="col-span-2 text-center py-10 text-[hsl(var(--muted-foreground))]">No invoices found. Create one to get started.</div> :
            filteredInvoices.map((invoice) => {
              const statusConfig = getStatusConfig(invoice.status);
              return (
                <div key={invoice.id} className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-5 hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-gray-500" />
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
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-[hsl(var(--muted))] rounded-lg p-3">
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Amount</p>
                      <p className="font-bold">{formatCurrency(invoice.amount)}</p>
                    </div>
                    <div className="bg-[hsl(var(--muted))] rounded-lg p-3">
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Due Date</p>
                      <p className="font-medium">{invoice.dueDate}</p>
                    </div>
                  </div>

                  {invoice.status === 'pending' && (
                    <button
                      onClick={() => handleMint(invoice)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium"
                    >
                      <Coins className="w-4 h-4" /> Mint to RWA
                    </button>
                  )}
                  {invoice.status === 'minted' && (
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all font-medium">
                      <DollarSign className="w-4 h-4" /> Request Funding
                    </button>
                  )}
                </div>
              );
            })}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-[hsl(var(--card))] p-6 rounded-2xl w-full max-w-md border border-[hsl(var(--border))] shadow-2xl relative">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold">Create New Invoice</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-black/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                className="w-full p-3 bg-[hsl(var(--muted))] rounded-xl border border-[hsl(var(--border))] focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Client Name"
                value={newInvoice.clientName}
                onChange={e => setNewInvoice({ ...newInvoice, clientName: e.target.value })}
              />
              <input
                className="w-full p-3 bg-[hsl(var(--muted))] rounded-xl border border-[hsl(var(--border))] focus:ring-2 focus:ring-emerald-500 outline-none"
                type="number"
                placeholder="Amount (USD)"
                value={newInvoice.amount}
                onChange={e => setNewInvoice({ ...newInvoice, amount: e.target.value })}
              />
              <input
                className="w-full p-3 bg-[hsl(var(--muted))] rounded-xl border border-[hsl(var(--border))] focus:ring-2 focus:ring-emerald-500 outline-none"
                type="date"
                placeholder="Due Date"
                value={newInvoice.dueDate}
                onChange={e => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
              />
              <input
                className="w-full p-3 bg-[hsl(var(--muted))] rounded-xl border border-[hsl(var(--border))] focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Description"
                value={newInvoice.description}
                onChange={e => setNewInvoice({ ...newInvoice, description: e.target.value })}
              />
              <button
                onClick={handleCreateInvoice}
                className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all hover:shadow-lg hover:shadow-emerald-500/25"
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
          <div className="bg-[hsl(var(--card))] rounded-2xl w-full max-w-lg p-6 border border-[hsl(var(--border))] shadow-2xl relative">
            <h3 className="text-xl font-bold mb-4">Minting {selectedInvoice.invoiceNumber}</h3>
            {mintStep === 0 && <button onClick={processMint} className="w-full py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-bold transition-all">Confirm Mint</button>}
            {mintStep === 1 && <p className="text-center flex items-center justify-center gap-2 py-4"><Loader2 className="animate-spin" /> Minting...</p>}
            {mintStep === 2 && <p className="text-center flex items-center justify-center gap-2 py-4"><Loader2 className="animate-spin" /> Confirming Transaction...</p>}
            {mintStep === 3 && <p className="text-center text-emerald-500 font-bold py-4">Success! Invoice Minted on Chain.</p>}

            {mintStep === 0 && (
              <button onClick={() => setShowMintModal(false)} className="w-full mt-2 py-2 text-sm text-[hsl(var(--muted-foreground))] hover:underline">Cancel</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
