import { useContext, useMemo } from 'react';
import { WalletContext, ConnectionContext } from './contexts';
import type { WalletState, AnchorWallet } from './types';
import type { Connection } from '@solana/web3.js';

/**
 * Hook to use wallet state
 */
export function useWallet(): WalletState {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}

/**
 * Hook to use connection
 */
export function useConnection(): { connection: Connection } {
  const connection = useContext(ConnectionContext);
  if (!connection) {
    throw new Error('useConnection must be used within WalletProvider');
  }
  return { connection };
}

/**
 * Hook to get Anchor-compatible wallet
 * This ensures compatibility with Coral's Anchor framework
 */
export function useAnchorWallet(): AnchorWallet | undefined {
  const { wallet, publicKey, connected } = useWallet();

  return useMemo(() => {
    if (!wallet || !publicKey || !connected) {
      return undefined;
    }

    return {
      publicKey,
      signTransaction: wallet.signTransaction.bind(wallet),
      signAllTransactions: wallet.signAllTransactions.bind(wallet),
    } as AnchorWallet;
  }, [wallet, publicKey, connected]);
}
