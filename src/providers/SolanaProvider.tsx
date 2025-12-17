import { useMemo } from 'react';
import { NETWORK, RPC_ENDPOINTS } from '../utils/constants';
import { WalletProvider, WalletError } from '../lib/wallet-adapter';

interface SolanaProviderProps {
  children: React.ReactNode;
}

/**
 * Custom Solana Provider using our RainbowKit-inspired wallet adapter
 * Replaces the old @solana/wallet-adapter implementation
 */
export function SolanaProvider({ children }: SolanaProviderProps) {
  const endpoint = useMemo(() => RPC_ENDPOINTS[NETWORK], []);

  const handleError = (error: WalletError) => {
    console.error('Wallet connection error:', error);
    // You can add toast notifications here
  };

  return (
    <WalletProvider 
      endpoint={endpoint}
      config={{
        autoConnect: true,
        onError: handleError,
        localStorageKey: 'solana-wallet-adapter',
      }}
    >
      {children}
    </WalletProvider>
  );
}
