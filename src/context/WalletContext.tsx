import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import InvoiceNFTAbi from '../abis/InvoiceNFT.json';
import LendingPoolAbi from '../abis/LendingPool.json';
import MockStablecoinAbi from '../abis/MockStablecoin.json';

// REPLACE THESE WITH YOUR DEPLOYED CONTRACT ADDRESSES
const CONTRACT_ADDRESSES = {
  InvoiceNFT: '0x1234567890123456789012345678901234567890',
  LendingPool: '0x0987654321098765432109876543210987654321',
  MockStablecoin: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
};

const CREDITCOIN_CHAIN_HEX = '0x18E8F';

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (eventName: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (eventName: string, listener: (...args: unknown[]) => void) => void;
  providers?: EthereumProvider[];
  isMetaMask?: boolean;
  isPhantom?: boolean;
}

type ContractsState = {
  invoiceNFT: ethers.Contract | null;
  lendingPool: ethers.Contract | null;
  stablecoin: ethers.Contract | null;
};

interface WalletContextType {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  contracts: ContractsState;
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => void;
  chainId: number | null;
}

const EMPTY_CONTRACTS: ContractsState = {
  invoiceNFT: null,
  lendingPool: null,
  stablecoin: null,
};

const WalletContext = createContext<WalletContextType>({
  account: null,
  provider: null,
  signer: null,
  contracts: EMPTY_CONTRACTS,
  connectWallet: async () => false,
  disconnectWallet: () => {},
  chainId: null,
});

export const useWallet = () => useContext(WalletContext);

function getPreferredProvider(): EthereumProvider | null {
  const injected = window.ethereum;
  if (!injected) return null;

  const availableProviders =
    Array.isArray(injected.providers) && injected.providers.length > 0
      ? injected.providers
      : [injected];

  const metaMaskProvider = availableProviders.find((provider) => provider.isMetaMask && !provider.isPhantom);
  if (metaMaskProvider) return metaMaskProvider;

  const nonPhantomProvider = availableProviders.find((provider) => !provider.isPhantom);
  if (nonPhantomProvider) return nonPhantomProvider;

  return availableProviders[0] ?? null;
}

async function ensureCreditcoinNetwork(provider: EthereumProvider): Promise<boolean> {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: CREDITCOIN_CHAIN_HEX }],
    });
    return true;
  } catch (switchError) {
    const errorCode = (switchError as { code?: number }).code;
    if (errorCode === 4902) {
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: CREDITCOIN_CHAIN_HEX,
              chainName: 'Creditcoin Testnet',
              nativeCurrency: {
                name: 'CTC',
                symbol: 'CTC',
                decimals: 18,
              },
              rpcUrls: ['https://rpc.cc3-testnet.creditcoin.network'],
              blockExplorerUrls: ['https://creditcoin-testnet.blockscout.com/'],
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error('Failed to add Creditcoin Testnet:', addError);
        return false;
      }
    }

    console.error('Failed to switch Creditcoin Testnet:', switchError);
    return false;
  }
}

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [contracts, setContracts] = useState<ContractsState>(EMPTY_CONTRACTS);
  const [chainId, setChainId] = useState<number | null>(null);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setContracts(EMPTY_CONTRACTS);
    setChainId(null);
  }, []);

  const connectWallet = useCallback(async () => {
    const selectedProvider = getPreferredProvider();

    if (!selectedProvider) {
      alert('Please install MetaMask (or another EVM wallet) to continue.');
      return false;
    }

    // Phantom set as default provider often fails on Creditcoin custom network.
    if (selectedProvider.isPhantom && !selectedProvider.isMetaMask) {
      alert('Phantom EVM is not compatible with Creditcoin Testnet. Please use MetaMask for this dApp.');
      return false;
    }

    try {
      const browserProvider = new ethers.BrowserProvider(selectedProvider);
      await browserProvider.send('eth_requestAccounts', []);

      const networkReady = await ensureCreditcoinNetwork(selectedProvider);
      if (!networkReady) {
        alert('Please switch to Creditcoin Testnet in your wallet, then try Launch App again.');
        return false;
      }

      const nextSigner = await browserProvider.getSigner();
      const nextAccount = await nextSigner.getAddress();
      const network = await browserProvider.getNetwork();

      setAccount(nextAccount);
      setProvider(browserProvider);
      setSigner(nextSigner);
      setChainId(Number(network.chainId));

      const nextContracts: ContractsState = {
        invoiceNFT: new ethers.Contract(CONTRACT_ADDRESSES.InvoiceNFT, InvoiceNFTAbi.abi, nextSigner),
        lendingPool: new ethers.Contract(CONTRACT_ADDRESSES.LendingPool, LendingPoolAbi.abi, nextSigner),
        stablecoin: new ethers.Contract(CONTRACT_ADDRESSES.MockStablecoin, MockStablecoinAbi.abi, nextSigner),
      };
      setContracts(nextContracts);

      return true;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    const selectedProvider = getPreferredProvider();
    if (!selectedProvider || !selectedProvider.on) return;

    const handleAccountsChanged = (accountsArg: unknown) => {
      const nextAccounts = Array.isArray(accountsArg) ? (accountsArg as string[]) : [];
      if (nextAccounts.length === 0) {
        disconnectWallet();
      } else {
        void connectWallet();
      }
    };

    const handleChainChanged = () => {
      void connectWallet();
    };

    selectedProvider.on('accountsChanged', handleAccountsChanged);
    selectedProvider.on('chainChanged', handleChainChanged);

    return () => {
      selectedProvider.removeListener?.('accountsChanged', handleAccountsChanged);
      selectedProvider.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [connectWallet, disconnectWallet]);

  return (
    <WalletContext.Provider value={{ account, provider, signer, contracts, connectWallet, disconnectWallet, chainId }}>
      {children}
    </WalletContext.Provider>
  );
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}
