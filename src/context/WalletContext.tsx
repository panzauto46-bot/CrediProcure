import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import InvoiceNFTAbi from '../abis/InvoiceNFT.json';
import LendingPoolAbi from '../abis/LendingPool.json';
import MockStablecoinAbi from '../abis/MockStablecoin.json';

// REPLACE THESE WITH YOUR DEPLOYED CONTRACT ADDRESSES
const CONTRACT_ADDRESSES = {
    InvoiceNFT: "0x1234567890123456789012345678901234567890",
    LendingPool: "0x0987654321098765432109876543210987654321",
    MockStablecoin: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
};

interface WalletContextType {
    account: string | null;
    provider: ethers.BrowserProvider | null;
    signer: ethers.JsonRpcSigner | null;
    contracts: {
        invoiceNFT: ethers.Contract | null;
        lendingPool: ethers.Contract | null;
        stablecoin: ethers.Contract | null;
    };
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    chainId: number | null;
}

const WalletContext = createContext<WalletContextType>({
    account: null,
    provider: null,
    signer: null,
    contracts: { invoiceNFT: null, lendingPool: null, stablecoin: null },
    connectWallet: async () => { },
    disconnectWallet: () => { },
    chainId: null,
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [account, setAccount] = useState<string | null>(null);
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
    const [contracts, setContracts] = useState<any>({ invoiceNFT: null, lendingPool: null, stablecoin: null });
    const [chainId, setChainId] = useState<number | null>(null);

    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);

                // Auto-switch to Creditcoin Testnet
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0x18E8F' }], // 102031 in hex
                    });
                } catch (switchError: any) {
                    // This error code indicates that the chain has not been added to MetaMask.
                    if (switchError.code === 4902) {
                        try {
                            await window.ethereum.request({
                                method: 'wallet_addEthereumChain',
                                params: [
                                    {
                                        chainId: '0x18E8F',
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
                        } catch (addError) {
                            console.error("Failed to add Creditcoin Testnet:", addError);
                        }
                    }
                }

                const signer = await provider.getSigner();
                setAccount(accounts[0]);

                const { chainId: networkChainId } = await provider.getNetwork();

                setProvider(provider);
                setSigner(signer);
                setChainId(Number(networkChainId));

                // Initialize Contracts
                const _invoiceNFT = new ethers.Contract(CONTRACT_ADDRESSES.InvoiceNFT, InvoiceNFTAbi.abi, signer);
                const _lendingPool = new ethers.Contract(CONTRACT_ADDRESSES.LendingPool, LendingPoolAbi.abi, signer);
                const _stablecoin = new ethers.Contract(CONTRACT_ADDRESSES.MockStablecoin, MockStablecoinAbi.abi, signer);

                setContracts({
                    invoiceNFT: _invoiceNFT,
                    lendingPool: _lendingPool,
                    stablecoin: _stablecoin
                });

            } catch (error) {
                console.error("Failed to connect wallet:", error);
            }
        } else {
            alert("Please install MetaMask!");
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        setProvider(null);
        setSigner(null);
        setContracts({ invoiceNFT: null, lendingPool: null, stablecoin: null });
    };

    // Handle chain changes or account changes
    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                if (accounts.length > 0) {
                    connectWallet(); // Re-connect to update signer/account
                } else {
                    disconnectWallet();
                }
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }
    }, []);

    return (
        <WalletContext.Provider value={{ account, provider, signer, contracts, connectWallet, disconnectWallet, chainId }}>
            {children}
        </WalletContext.Provider>
    );
};

// Add typescript support for window.ethereum
declare global {
    interface Window {
        ethereum: any;
    }
}
