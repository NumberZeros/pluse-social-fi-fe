import { useCallback } from 'react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import toast from 'react-hot-toast';
import { markUserInitiatedConnect } from '../utils/wallet-errors';

export function useOpenWalletModal() {
  const { setVisible } = useWalletModal();

  return useCallback((options?: { toast?: boolean }) => {
    markUserInitiatedConnect();
    setVisible(true);
    if (options?.toast) {
      toast('Connect your wallet to continue', { icon: '👛' });
    }
  }, [setVisible]);
}
