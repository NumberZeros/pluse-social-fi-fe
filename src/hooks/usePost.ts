import { useState, useCallback } from 'react';
import { useAnchorWallet, useConnection } from '../lib/wallet-adapter';
import { PublicKey } from '@solana/web3.js';
import { SocialFiSDK } from '../services/socialfi-sdk';
import { toast } from 'react-hot-toast';

export const usePost = () => {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);

  const createPost = useCallback(async (uri: string) => {
    if (!wallet) {
      toast.error('Wallet not connected');
      return null;
    }

    setLoading(true);
    const toastId = toast.loading('Creating post...');

    try {
      const sdk = new SocialFiSDK(wallet, connection);
      const result = await sdk.createPost(uri);
      
      toast.success('Post created!', { id: toastId });
      return result;
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error(`Failed to create post: ${error.message}`, { id: toastId });
      return null;
    } finally {
      setLoading(false);
    }
  }, [wallet, connection]);

  const mintPost = useCallback(async (postPubkey: PublicKey, title: string) => {
    if (!wallet) {
      toast.error('Wallet not connected');
      return null;
    }

    setLoading(true);
    const toastId = toast.loading('Minting post as NFT...');

    try {
      const sdk = new SocialFiSDK(wallet, connection);
      const result = await sdk.mintPost(postPubkey, title);
      
      toast.success('Post minted as NFT!', { id: toastId });
      return result;
    } catch (error: any) {
      console.error('Error minting post:', error);
      toast.error(`Failed to mint post: ${error.message}`, { id: toastId });
      return null;
    } finally {
      setLoading(false);
    }
  }, [wallet, connection]);

  return {
    createPost,
    mintPost,
    loading,
  };
};
