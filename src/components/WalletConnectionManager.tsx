import { useEffect, useRef } from 'react';
import { useWallet } from '../lib/wallet-adapter';
import { useUserStore } from '../stores/useUserStore';

/**
 * Syncs wallet connection state with global store
 * Updated to use our custom wallet adapter
 */
export function WalletConnectionManager() {
  const { publicKey, connected } = useWallet();
  const setWalletAddress = useUserStore((state) => state.setWalletAddress);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (connected && publicKey && !syncedRef.current) {
      syncedRef.current = true;
      setWalletAddress(publicKey.toBase58());
    } else if (!connected && syncedRef.current) {
      syncedRef.current = false;
    }
  }, [connected, publicKey, setWalletAddress]);

  return null;
}
