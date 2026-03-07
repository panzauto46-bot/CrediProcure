import { ethers } from 'ethers';
import { Invoice } from '@/types';

function toNumber(value: bigint | number | string | undefined | null): number {
  if (value === undefined || value === null) return 0;
  return typeof value === 'bigint' ? Number(value) : Number(value);
}

export function mapInvoiceStatus(statusValue: bigint | number | string | undefined): Invoice['status'] {
  switch (toNumber(statusValue)) {
    case 1:
      return 'funded';
    case 2:
      return 'repaid';
    default:
      return 'minted';
  }
}

export function mapInvoiceRisk(yieldRateValue: bigint | number | string | undefined): Invoice['riskLevel'] {
  const yieldRate = toNumber(yieldRateValue);
  if (yieldRate >= 1000) return 'high';
  if (yieldRate >= 500) return 'medium';
  return 'low';
}

export function mapChainInvoiceToInvoice(
  data: {
    id: bigint | number | string;
    vendor: string;
    amount: bigint | number | string;
    dueDate: bigint | number | string;
    yieldRate: bigint | number | string;
    status: bigint | number | string;
  },
  overrides: Partial<Invoice> = {}
): Invoice {
  const tokenId = toNumber(data.id).toString();

  return {
    id: tokenId,
    invoiceNumber: `INV-${tokenId}`,
    clientName: overrides.clientName ?? `Vendor ${data.vendor.slice(0, 6)}...`,
    amount: Number(ethers.formatUnits(data.amount, 18)),
    dueDate: new Date(toNumber(data.dueDate) * 1000).toISOString().split('T')[0],
    createdAt: overrides.createdAt ?? new Date().toISOString().split('T')[0],
    status: mapInvoiceStatus(data.status),
    riskLevel: mapInvoiceRisk(data.yieldRate),
    yieldRate: toNumber(data.yieldRate) / 100,
    description: overrides.description ?? `Invoice token #${tokenId}`,
    tokenId,
    ...overrides,
  };
}
