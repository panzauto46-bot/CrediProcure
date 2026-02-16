import { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  Coins, 
  Store, 
  PieChart, 
  History,
  Shield,
  Menu,
  X,
  Wallet,
  ChevronDown,
  LogOut,
  Sun,
  Moon,
  Zap
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTheme } from '@/context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  userType: 'vendor' | 'investor';
  setUserType: (type: 'vendor' | 'investor') => void;
}

export function Layout({ children, currentPage, setCurrentPage, userType, setUserType }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const vendorMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'invoices', label: 'Invoices & RWA', icon: FileText },
    { id: 'liquidity', label: 'Request Liquidity', icon: Coins },
    { id: 'kyb', label: 'KYB Verification', icon: Shield },
    { id: 'credit-history', label: 'Credit History', icon: History },
  ];

  const investorMenuItems = [
    { id: 'investor-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'marketplace', label: 'Invoice Marketplace', icon: Store },
    { id: 'portfolio', label: 'Yield Portfolio', icon: PieChart },
    { id: 'pool', label: 'Liquidity Pool', icon: Coins },
  ];

  const menuItems = userType === 'vendor' ? vendorMenuItems : investorMenuItems;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] transition-colors duration-300">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-72 bg-[hsl(var(--card))] border-r border-[hsl(var(--border))] transform transition-transform duration-300 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-[hsl(var(--border))]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-[hsl(var(--foreground))]">CrediProcure</h1>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-medium tracking-wide">POWERED BY CREDITCOIN</p>
                </div>
              </div>
              <button 
                className="lg:hidden p-2 hover:bg-[hsl(var(--accent))] rounded-lg transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
              </button>
            </div>
          </div>

          {/* User Type Switch */}
          <div className="p-4">
            <div className="bg-[hsl(var(--muted))] rounded-xl p-1 flex">
              <button
                onClick={() => {
                  setUserType('vendor');
                  setCurrentPage('dashboard');
                }}
                className={cn(
                  "flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                  userType === 'vendor' 
                    ? "bg-[hsl(var(--card))] text-emerald-500 shadow-sm" 
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                )}
              >
                Vendor
              </button>
              <button
                onClick={() => {
                  setUserType('investor');
                  setCurrentPage('investor-dashboard');
                }}
                className={cn(
                  "flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                  userType === 'investor' 
                    ? "bg-[hsl(var(--card))] text-cyan-500 shadow-sm" 
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                )}
              >
                Investor
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  currentPage === item.id
                    ? "bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 text-emerald-500 dark:text-emerald-400"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5",
                  currentPage === item.id && "text-emerald-500"
                )} />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Wallet Status */}
          <div className="p-4 border-t border-[hsl(var(--border))]">
            <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-xl p-4 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-glow" />
                <span className="text-xs text-[hsl(var(--muted-foreground))]">Creditcoin Testnet</span>
              </div>
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-mono text-[hsl(var(--foreground))]">0x742d...F423</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Top Header */}
        <header className="sticky top-0 z-30 glass border-b border-[hsl(var(--border))]">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <button 
              className="lg:hidden p-2 hover:bg-[hsl(var(--accent))] rounded-lg transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6 text-[hsl(var(--foreground))]" />
            </button>

            <div className="hidden lg:block">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                {userType === 'vendor' ? 'Vendor Portal' : 'Investor Portal'}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 hover:bg-[hsl(var(--accent))] rounded-xl transition-all duration-200"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-400" />
                )}
              </button>

              {/* Network Badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Testnet</span>
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 p-2 hover:bg-[hsl(var(--accent))] rounded-xl transition-colors"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <span className="text-white text-sm font-bold">
                      {userType === 'vendor' ? 'V' : 'I'}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                      {userType === 'vendor' ? 'Maju Bersama' : 'Investor'}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {userType === 'vendor' ? 'Verified' : 'Active'}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-[hsl(var(--card))] rounded-xl shadow-xl border border-[hsl(var(--border))] py-2 z-50 animate-slide-in">
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] transition-colors">
                        <LogOut className="w-4 h-4" />
                        Disconnect Wallet
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
