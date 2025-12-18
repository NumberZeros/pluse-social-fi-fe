import { useState, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAnchorWallet, useConnection } from '../lib/wallet-adapter';
import { SocialFiSDK } from '../services/socialfi-sdk';
import { toast } from 'react-hot-toast';
import { withAnchorToast } from '../utils/error-handler';
import { PublicKey } from '@solana/web3.js';
import { CacheManager } from '../services/storage';

export const useMintPost = () => {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();
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
   * @param metadata - Optional metadata including description and images
   * @returns NFT mint details or null on error
   */
  const mintPost = useCallback(async (
    postPubkey: string | PublicKey,
    title: string,
    metadata?: { description?: string; images?: string[] }
  ) => {
    if (!sdk) {
      toast.error('Wallet not connected');
      return null;
    }

    if (!title.trim()) {
      toast.error('Please enter a title for the NFT');
      return null;
    }

    // Metaplex NFT name limit is 32 bytes
    if (title.length > 32) {
      toast.error('NFT title must be 32 characters or less');
      return null;
    }

    setLoading(true);
    const toastId = toast.loading('Minting post as NFT...');

    try {
      const pubkey = typeof postPubkey === 'string' 
        ? new PublicKey(postPubkey) 
        : postPubkey;

      // Prepare NFT metadata with images
      const nftMetadata = {
        title,
        description: metadata?.description || '',
        images: metadata?.images || [],
      };

      const result = await withAnchorToast(
        () => sdk.mintPost(pubkey, title, nftMetadata),
        {
          loading: 'Minting NFT...',
          success: 'Post minted as NFT! 🎉',
        }
      );

      // Clear cache and invalidate queries to refetch fresh data from blockchain
      await CacheManager.clearCache();
      queryClient.invalidateQueries({ queryKey: ['feed_timeline'] });

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
