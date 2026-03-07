import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import InvoiceNFTAbi from '../abis/InvoiceNFT.json';
import LendingPoolAbi from '../abis/LendingPool.json';
import MockStablecoinAbi from '../abis/MockStablecoin.json';
import { CONTRACT_ADDRESSES } from '@/config/contracts';

const CREDITCOIN_CHAIN_HEX = '0x18E8F';

export type WalletType = 'auto' | 'metamask' | 'phantom' | 'bitget';

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (eventName: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (eventName: string, listener: (...args: unknown[]) => void) => void;
  providers?: EthereumProvider[];
  isMetaMask?: boolean;
  isPhantom?: boolean;
  isBitGetWallet?: boolean;
  isBitKeep?: boolean;
  isBitget?: boolean;
  _metamask?: unknown;
}

interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EthereumProvider;
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
  connectWallet: (walletType?: WalletType) => Promise<boolean>;
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
  connectWallet: async (_walletType?: WalletType) => false,
  disconnectWallet: () => {},
  chainId: null,
});

export const useWallet = () => useContext(WalletContext);

function getWalletLabel(walletType: WalletType): string {
  switch (walletType) {
    case 'metamask':
      return 'MetaMask';
    case 'phantom':
      return 'Phantom';
    case 'bitget':
      return 'Bitget Wallet';
    default:
      return 'Wallet';
  }
}

function getInjectedProviders(): EthereumProvider[] {
  const injected = window.ethereum;
  if (!injected) return [];

  return Array.isArray(injected.providers) && injected.providers.length > 0
    ? injected.providers
    : [injected];
}

function isBitgetProvider(provider: EthereumProvider): boolean {
  return Boolean(provider.isBitGetWallet || provider.isBitKeep || provider.isBitget);
}

function isLikelyMetaMaskProvider(provider: EthereumProvider): boolean {
  return Boolean(provider.isMetaMask && !provider.isPhantom && !isBitgetProvider(provider));
}

function detectWalletType(provider: EthereumProvider): WalletType {
  if (provider.isPhantom) return 'phantom';
  if (isBitgetProvider(provider)) return 'bitget';
  if (provider.isMetaMask) return 'metamask';
  return 'auto';
}

function detectWalletTypeFromInfo(info: EIP6963ProviderInfo, provider: EthereumProvider): WalletType {
  const rdns = (info.rdns || '').toLowerCase();
  const name = (info.name || '').toLowerCase();

  if (rdns.includes('metamask') || name.includes('metamask')) return 'metamask';
  if (rdns.includes('phantom') || name.includes('phantom')) return 'phantom';
  if (rdns.includes('bitget') || rdns.includes('bitkeep') || name.includes('bitget') || name.includes('bitkeep')) return 'bitget';

  return detectWalletType(provider);
}

function selectProvider(
  walletType: WalletType,
  discoveredProviders: Array<{ type: WalletType; provider: EthereumProvider }>
): EthereumProvider | null {
  const discoveredByType = (type: WalletType) =>
    discoveredProviders.find((item) => item.type === type)?.provider ?? null;

  if (walletType === 'auto') {
    const discoveredAuto = discoveredByType('metamask') ?? discoveredByType('bitget') ?? discoveredByType('phantom');
    if (discoveredAuto) return discoveredAuto;
  } else {
    const discoveredSpecific = discoveredByType(walletType);
    if (discoveredSpecific) return discoveredSpecific;
  }

  const providers = getInjectedProviders();
  if (providers.length === 0) return null;

  if (walletType === 'metamask') {
    const metamaskWithInternalApi = providers.find(
      (provider) => isLikelyMetaMaskProvider(provider) && provider._metamask
    );
    if (metamaskWithInternalApi) return metamaskWithInternalApi;

    return providers.find((provider) => isLikelyMetaMaskProvider(provider)) ?? null;
  }

  if (walletType === 'phantom') {
    return providers.find((provider) => provider.isPhantom) ?? null;
  }

  if (walletType === 'bitget') {
    return providers.find((provider) => isBitgetProvider(provider)) ?? null;
  }

  const metamask = providers.find((provider) => provider.isMetaMask && !provider.isPhantom && !isBitgetProvider(provider));
  if (metamask) return metamask;

  const bitget = providers.find((provider) => isBitgetProvider(provider));
  if (bitget) return bitget;

  const phantom = providers.find((provider) => provider.isPhantom);
  if (phantom) return phantom;

  return providers[0] ?? null;
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
                name: 'Test Creditcoin',
                symbol: 'tCTC',
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
  const [eventProvider, setEventProvider] = useState<EthereumProvider | null>(null);
  const [activeWalletType, setActiveWalletType] = useState<WalletType>('auto');
  const [discoveredProviders, setDiscoveredProviders] = useState<Array<{ type: WalletType; provider: EthereumProvider }>>([]);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setContracts(EMPTY_CONTRACTS);
    setChainId(null);
    setEventProvider(null);
    setActiveWalletType('auto');
  }, []);

  const connectWallet = useCallback(async (walletType: WalletType = 'auto') => {
    const selectedProvider = selectProvider(walletType, discoveredProviders);

    if (!selectedProvider) {
      if (walletType === 'auto') {
        alert('No EVM wallet detected. Please install MetaMask, Phantom, or Bitget Wallet.');
      } else if (walletType === 'metamask') {
        alert(
          'MetaMask is not detected.\n\n' +
            'Tips:\n' +
            '1) Unlock MetaMask extension.\n' +
            '2) Make sure this site is allowed in MetaMask.\n' +
            '3) In Phantom settings, disable "Default App Wallet" for EVM if active.\n' +
            '4) Refresh page and try again.'
        );
      } else {
        alert(
          `${getWalletLabel(walletType)} is not detected.\n\n` +
            'If the extension is installed, enable site access for this domain and refresh the page.'
        );
      }
      return false;
    }

    try {
      const browserProvider = new ethers.BrowserProvider(selectedProvider);
      await browserProvider.send('eth_requestAccounts', []);

      const networkReady = await ensureCreditcoinNetwork(selectedProvider);
      if (!networkReady) {
        const label = walletType === 'auto' ? getWalletLabel(detectWalletType(selectedProvider)) : getWalletLabel(walletType);
        alert(`${label} failed to switch to Creditcoin Testnet. Please switch network manually or choose another wallet.`);
        return false;
      }

      const nextSigner = await browserProvider.getSigner();
      const nextAccount = await nextSigner.getAddress();
      const network = await browserProvider.getNetwork();

      setAccount(nextAccount);
      setProvider(browserProvider);
      setSigner(nextSigner);
      setChainId(Number(network.chainId));
      setEventProvider(selectedProvider);
      setActiveWalletType(walletType === 'auto' ? detectWalletType(selectedProvider) : walletType);

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
  }, [discoveredProviders]);

  useEffect(() => {
    const onAnnounceProvider = (event: Event) => {
      const customEvent = event as CustomEvent<EIP6963ProviderDetail>;
      const detail = customEvent.detail;
      if (!detail?.provider || !detail?.info) return;

      const walletType = detectWalletTypeFromInfo(detail.info, detail.provider);
      if (walletType === 'auto') return;

      setDiscoveredProviders((prev) => {
        const exists = prev.some((item) => item.provider === detail.provider);
        if (exists) return prev;
        return [...prev, { type: walletType, provider: detail.provider }];
      });
    };

    window.addEventListener('eip6963:announceProvider', onAnnounceProvider as EventListener);
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    return () => {
      window.removeEventListener('eip6963:announceProvider', onAnnounceProvider as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!eventProvider || !eventProvider.on) return;

    const handleAccountsChanged = (accountsArg: unknown) => {
      const nextAccounts = Array.isArray(accountsArg) ? (accountsArg as string[]) : [];
      if (nextAccounts.length === 0) {
        disconnectWallet();
      } else {
        void connectWallet(activeWalletType);
      }
    };

    const handleChainChanged = () => {
      void connectWallet(activeWalletType);
    };

    eventProvider.on('accountsChanged', handleAccountsChanged);
    eventProvider.on('chainChanged', handleChainChanged);

    return () => {
      eventProvider.removeListener?.('accountsChanged', handleAccountsChanged);
      eventProvider.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [activeWalletType, connectWallet, disconnectWallet, eventProvider]);

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
