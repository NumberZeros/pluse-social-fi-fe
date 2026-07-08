import { useCallback } from 'react';
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { useOpenWalletModal } from './useOpenWalletModal';

/**
 * Returns a guard that opens the wallet modal when the user is not fully connected.
 * Checks both publicKey and anchorWallet to avoid the connected-but-not-ready race.
 */
export function useRequireWallet() {
  const { publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();
  const openWalletModal = useOpenWalletModal();

  return useCallback(
    (options?: { toast?: boolean }) => {
      if (publicKey && anchorWallet) {
        return true;
      }
      openWalletModal({ toast: options?.toast ?? true });
      return false;
    },
    [publicKey, anchorWallet, openWalletModal],
  );
}
