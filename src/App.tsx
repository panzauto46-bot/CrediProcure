import { useState } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { Layout } from '@/components/Layout';
import { VendorDashboard } from '@/pages/VendorDashboard';
import { Inventory } from '@/pages/Inventory';
import { Invoices } from '@/pages/Invoices';
import { LiquidityRequest } from '@/pages/LiquidityRequest';
import { KYB } from '@/pages/KYB';
import { CreditHistory } from '@/pages/CreditHistory';
import { InvestorDashboard } from '@/pages/InvestorDashboard';
import { Marketplace } from '@/pages/Marketplace';
import { Portfolio } from '@/pages/Portfolio';
import { LiquidityPool } from '@/pages/LiquidityPool';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userType, setUserType] = useState<'vendor' | 'investor'>('vendor');

  const renderPage = () => {
    switch (currentPage) {
      // Vendor Pages
      case 'dashboard':
        return <VendorDashboard />;
      case 'inventory':
        return <Inventory />;
      case 'invoices':
        return <Invoices />;
      case 'liquidity':
        return <LiquidityRequest />;
      case 'kyb':
        return <KYB />;
      case 'credit-history':
        return <CreditHistory />;
      
      // Investor Pages
      case 'investor-dashboard':
        return <InvestorDashboard />;
      case 'marketplace':
        return <Marketplace />;
      case 'portfolio':
        return <Portfolio />;
      case 'pool':
        return <LiquidityPool />;
      
      default:
        return <VendorDashboard />;
    }
  };

  return (
    <Layout 
      currentPage={currentPage} 
      setCurrentPage={setCurrentPage}
      userType={userType}
      setUserType={setUserType}
    >
      {renderPage()}
    </Layout>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
