import { useState, useCallback, useMemo } from 'react';
import { useAnchorWallet, useConnection } from '../lib/wallet-adapter';
import { SocialFiSDK } from '../services/socialfi-sdk';
import { toast } from 'react-hot-toast';
import { withAnchorToast } from '../utils/error-handler';

export const usePost = () => {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);

  // Memoize SDK instance - only recreate when wallet or connection changes
  const sdk = useMemo(() => {
    if (!wallet) return null;
    try {
      return new SocialFiSDK(wallet, connection);
    } catch (error) {
      console.error('Failed to create SDK:', error);
      return null;
    }
  }, [wallet, connection]);

  const createPost = useCallback(async (uri: string) => {
    if (!sdk) {
      toast.error('Wallet not connected');
      return null;
    }

    setLoading(true);

    try {
      
      const result = await withAnchorToast(
        () => sdk.createPost(uri),
        {
          loading: 'Creating post...',
          success: 'Post created!',
        }
      );
      
    
      
      return result;
    } finally {
      setLoading(false);
    }
  }, [sdk]);

  return {
    createPost,
    loading,
  };
};
