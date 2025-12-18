import { useState, useCallback, useMemo } from 'react';
import { useAnchorWallet, useConnection } from '../lib/wallet-adapter';
import { SocialFiSDK } from '../services/socialfi-sdk';
import { toast } from 'react-hot-toast';
import { withAnchorToast } from '../utils/error-handler';
import { PublicKey } from '@solana/web3.js';

export const useMintPost = () => {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);

  // Memoize SDK instance
  const sdk = useMemo(() => {
    if (!wallet) return null;
    try {
      return new SocialFiSDK(wallet, connection);
    } catch (error) {
      console.error('Failed to create SDK:', error);
      return null;
    }
  }, [wallet, connection]);

  /**
   * Mint a post as an NFT
   * @param postPubkey - Post account public key
   * @param title - NFT title
   * @returns NFT mint details or null on error
   */
  const mintPost = useCallback(async (postPubkey: string | PublicKey, title: string) => {
    if (!sdk) {
      toast.error('Wallet not connected');
      return null;
    }

    if (!title.trim()) {
      toast.error('Please enter a title for the NFT');
      return null;
    }

    setLoading(true);
    const toastId = toast.loading('Minting post as NFT...');

    try {
      const pubkey = typeof postPubkey === 'string' 
        ? new PublicKey(postPubkey) 
        : postPubkey;


      const result = await withAnchorToast(
        () => sdk.mintPost(pubkey, title),
        {
          loading: 'Minting NFT...',
          success: 'Post minted as NFT! 🎉',
        }
      );

    

      return result;
    } catch (error) {
      console.error('❌ Error minting post:', error);
      toast.error(
        `Failed to mint: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { id: toastId }
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, [sdk]);

  return {
    mintPost,
    loading,
  };
};
