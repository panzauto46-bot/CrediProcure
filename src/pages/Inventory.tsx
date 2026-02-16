import { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X
} from 'lucide-react';
import { mockInventory } from '@/data/mockData';
import { InventoryItem } from '@/types';
import { cn } from '@/utils/cn';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

export function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [inventory] = useState<InventoryItem[]>(mockInventory);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const lowStockCount = inventory.filter(item => item.status === 'low_stock').length;
  const outOfStockCount = inventory.filter(item => item.status === 'out_of_stock').length;

  const getStatusIcon = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'low_stock':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'out_of_stock':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusLabel = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock':
        return 'In Stock';
      case 'low_stock':
        return 'Low Stock';
      case 'out_of_stock':
        return 'Out of Stock';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Inventory Management</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Track and manage your procurement stock</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Item
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[hsl(var(--card))] rounded-xl p-5 border border-[hsl(var(--border))]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Total Inventory Value</p>
              <p className="text-xl font-bold text-[hsl(var(--foreground))]">{formatCurrency(totalValue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-[hsl(var(--card))] rounded-xl p-5 border border-[hsl(var(--border))]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Low Stock Items</p>
              <p className="text-xl font-bold text-[hsl(var(--foreground))]">{lowStockCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-[hsl(var(--card))] rounded-xl p-5 border border-[hsl(var(--border))]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-red-500/10 rounded-xl flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Out of Stock</p>
              <p className="text-xl font-bold text-[hsl(var(--foreground))]">{outOfStockCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Search items or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
          />
        </div>
        <button className="flex items-center gap-2 px-5 py-3 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl hover:bg-[hsl(var(--accent))] transition-colors">
          <Filter className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
          <span className="text-[hsl(var(--foreground))]">Filter</span>
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
                <th className="text-left px-6 py-4 text-sm font-semibold text-[hsl(var(--foreground))]">Item Name</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[hsl(var(--foreground))]">SKU</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[hsl(var(--foreground))]">Category</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-[hsl(var(--foreground))]">Qty</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-[hsl(var(--foreground))]">Price</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[hsl(var(--foreground))]">Status</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-[hsl(var(--foreground))]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[hsl(var(--muted))] rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                      </div>
                      <span className="font-medium text-[hsl(var(--foreground))]">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[hsl(var(--muted-foreground))] font-mono text-sm">{item.sku}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] rounded-lg text-sm">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-[hsl(var(--foreground))]">{item.quantity}</td>
                  <td className="px-6 py-4 text-right text-[hsl(var(--foreground))]">{formatCurrency(item.price)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className={cn(
                        "text-sm font-medium",
                        item.status === 'in_stock' ? 'text-emerald-600 dark:text-emerald-400' :
                        item.status === 'low_stock' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                      )}>
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-2 hover:bg-[hsl(var(--accent))] rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                      </button>
                      <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[hsl(var(--card))] rounded-2xl w-full max-w-md p-6 border border-[hsl(var(--border))] animate-slide-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Add New Item</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-[hsl(var(--accent))] rounded-lg">
                <X className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">Item Name</label>
                <input type="text" className="w-full px-4 py-3 bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-[hsl(var(--foreground))]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">SKU</label>
                  <input type="text" className="w-full px-4 py-3 bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-[hsl(var(--foreground))]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">Category</label>
                  <select className="w-full px-4 py-3 bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-[hsl(var(--foreground))]">
                    <option>Networking</option>
                    <option>Industrial</option>
                    <option>Server</option>
                    <option>Power</option>
                    <option>Cabling</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">Quantity</label>
                  <input type="number" className="w-full px-4 py-3 bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-[hsl(var(--foreground))]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">Price (USD)</label>
                  <input type="number" className="w-full px-4 py-3 bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-[hsl(var(--foreground))]" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 border border-[hsl(var(--border))] text-[hsl(var(--foreground))] rounded-xl hover:bg-[hsl(var(--accent))] transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all font-medium"
              >
                Save Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
