import { useMemo } from 'react';
import { Keypair } from '@solana/web3.js';
import { useConnection } from '../lib/wallet-adapter';
import type { AnchorWallet } from '../lib/wallet-adapter';
import { SocialFiSDK } from './socialfi-sdk';

function createReadOnlyWallet(): AnchorWallet {
  const dummyKeypair = Keypair.generate();
  return {
    publicKey: dummyKeypair.publicKey,
    signTransaction: async <T>(tx: T): Promise<T> => tx,
    signAllTransactions: async <T>(txs: T[]): Promise<T[]> => txs,
  };
}

/**
 * Read-only SDK for on-chain queries — does not require a connected wallet.
 */
export function useReadOnlySdk(): SocialFiSDK | null {
  const { connection } = useConnection();

  return useMemo(() => {
    try {
      return new SocialFiSDK(createReadOnlyWallet(), connection, { registerGlobalProvider: false });
    } catch (error) {
      console.error('Failed to create read-only SDK:', error);
      return null;
    }
  }, [connection]);
}
