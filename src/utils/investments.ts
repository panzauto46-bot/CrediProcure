import { ethers } from 'ethers';

export interface DirectInvestmentRecord {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  amount: number;
  yieldRate: number;
  earnedYield: number;
  maturityDate: string;
  status: 'active' | 'repaid';
  fundedAt: string;
  tokenId: string;
}

interface ContractsLike {
  invoiceNFT: ethers.Contract | null;
  lendingPool: ethers.Contract | null;
}

export async function fetchDirectInvestmentsForAccount(
  contracts: ContractsLike,
  account: string
): Promise<DirectInvestmentRecord[]> {
  if (!contracts.invoiceNFT || !contracts.lendingPool) return [];

  const normalizedAccount = account.toLowerCase();
  const fundedEvents = await contracts.lendingPool.queryFilter(
    contracts.lendingPool.filters.InvoiceFunded()
  );

  const directInvestments = await Promise.all(
    fundedEvents.map(async (event: any) => {
      const tx = await event.getTransaction();
      if (!tx?.from || tx.from.toLowerCase() !== normalizedAccount) {
        return null;
      }

      const tokenId = event.args[0].toString();
      const invoiceData = await contracts.invoiceNFT?.invoices(tokenId);
      if (!invoiceData) return null;

      const repaymentEvents = (await contracts.lendingPool?.queryFilter(
        contracts.lendingPool.filters.LoanRepaid(event.args[0])
      )) ?? [];
      const totalRepaid = repaymentEvents.reduce(
        (sum: number, repaymentEvent: any) =>
          sum + Number(ethers.formatUnits(repaymentEvent.args[1], 18)),
        0
      );

      const amount = Number(ethers.formatUnits(invoiceData.amount, 18));
      const yieldRate = Number(invoiceData.yieldRate) / 100;
      const fundedBlock = await event.getBlock();
      const status = repaymentEvents.length > 0 ? 'repaid' : 'active';

      return {
        id: `${event.transactionHash}_${tokenId}`,
        invoiceNumber: `INV-${invoiceData.id}`,
        vendorName: `Vendor ${invoiceData.vendor.toString().slice(0, 6)}...`,
        amount,
        yieldRate,
        earnedYield: Math.max(totalRepaid - amount, 0),
        maturityDate: new Date(Number(invoiceData.dueDate) * 1000).toISOString().split('T')[0],
        status,
        fundedAt: new Date(fundedBlock.timestamp * 1000).toISOString(),
        tokenId,
      } satisfies DirectInvestmentRecord;
    })
  );

  return directInvestments
    .filter((investment): investment is DirectInvestmentRecord => investment !== null)
    .sort((a, b) => new Date(b.fundedAt).getTime() - new Date(a.fundedAt).getTime());
}
