export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  dueDate: string;
  createdAt: string;
  status: 'pending' | 'minted' | 'funded' | 'repaid';
  riskLevel: 'low' | 'medium' | 'high';
  yieldRate: number;
  description: string;
  tokenId?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  category: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface Vendor {
  id: string;
  businessName: string;
  email: string;
  kybStatus: 'pending' | 'verified' | 'rejected';
  creditScore: number;
  totalInvoices: number;
  totalRepaid: number;
  walletAddress: string;
}

export interface Investment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  vendorName: string;
  amount: number;
  yieldRate: number;
  investedAt: string;
  maturityDate: string;
  status: 'active' | 'matured' | 'repaid';
  earnedYield: number;
}

export interface CreditHistory {
  id: string;
  action: string;
  amount: number;
  timestamp: string;
  txHash: string;
  creditImpact: number;
}
