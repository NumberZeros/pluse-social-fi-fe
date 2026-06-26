import { useCallback, useMemo, useState } from 'react';
import { useAnchorWallet, useConnection } from '../lib/wallet-adapter';
import { SocialFiSDK } from '../services/socialfi-sdk';
import { toast } from 'react-hot-toast';
import { withAnchorToast } from '../utils/error-handler';
import { assertPlatformNotPaused } from '../utils/platformPauseGuard';
import { PublicKey } from '@solana/web3.js';
import { CacheManager } from '../services/storage';
import { useQueryClient } from '@tanstack/react-query';

export const usePost = () => {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();
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

  const invalidatePostEngagement = useCallback(
    (postId?: string) => {
      queryClient.invalidateQueries({ queryKey: ['feed_timeline'] });
      queryClient.invalidateQueries({ queryKey: ['feed_engagement'] });
      queryClient.invalidateQueries({ queryKey: ['post_likes'] });
      queryClient.invalidateQueries({ queryKey: ['post_comments'] });
      queryClient.invalidateQueries({ queryKey: ['has_liked'] });
      queryClient.invalidateQueries({ queryKey: ['post_engagement'] });
      queryClient.invalidateQueries({ queryKey: ['user_replies'] });
      if (postId) {
        queryClient.invalidateQueries({ queryKey: ['single_post', postId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['single_post'] });
      }
    },
    [queryClient],
  );

  /**
   * Create a post
   * @param uri - URI pointing to post metadata (JSON with content, images, etc.)
   * @returns Post PDA and transaction signature
   */
  const createPost = useCallback(async (uri: string) => {
    if (!sdk) {
      toast.error('Wallet not connected');
      return null;
    }

    setLoading(true);

    try {
      await assertPlatformNotPaused(sdk);
      const result = await withAnchorToast(
        () => sdk.createPost(uri),
        {
          loading: 'Creating post...',
          success: 'Post created!',
        }
      );
      
      // Clear cache to force refresh
      await CacheManager.clearCache();
      queryClient.invalidateQueries({ queryKey: ['feed_timeline'] });
      queryClient.invalidateQueries({ queryKey: ['creator_posts'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['feed_engagement'] });
      queryClient.invalidateQueries({ queryKey: ['trending_topics'] });
      
      return result;
    } finally {
      setLoading(false);
    }
  }, [sdk, queryClient]);

  /**
   * Like a post
   * @param postPubkey - Post PDA to like
   */
  const likePost = useCallback(async (postPubkey: string | PublicKey) => {
    if (!sdk) {
      toast.error('Wallet not connected');
      return null;
    }

    setLoading(true);

    try {
      await assertPlatformNotPaused(sdk);
      const pubkey = typeof postPubkey === 'string' 
        ? new PublicKey(postPubkey) 
        : postPubkey;

      const result = await withAnchorToast(
        () => sdk.likePost(pubkey),
        {
          loading: 'Liking post...',
          success: '❤️ Liked!',
        }
      );

      invalidatePostEngagement(pubkey.toBase58());
      return result;
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to like post'
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, [sdk, invalidatePostEngagement]);

  /**
   * Unlike a post
   * @param postPubkey - Post PDA to unlike
   */
  const unlikePost = useCallback(async (postPubkey: string | PublicKey) => {
    if (!sdk) {
      toast.error('Wallet not connected');
      return null;
    }

    setLoading(true);

    try {
      await assertPlatformNotPaused(sdk);
      const pubkey = typeof postPubkey === 'string' 
        ? new PublicKey(postPubkey) 
        : postPubkey;

      const result = await withAnchorToast(
        () => sdk.unlikePost(pubkey),
        {
          loading: 'Unliking post...',
          success: 'Unliked',
        }
      );

      invalidatePostEngagement(pubkey.toBase58());
      return result;
    } catch (error) {
      console.error('Error unliking post:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to unlike post'
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, [sdk, invalidatePostEngagement]);

  /**
   * Repost a post
   * @param originalPostPubkey - Original post PDA to repost
   */
  const repostPost = useCallback(async (originalPostPubkey: string | PublicKey) => {
    if (!sdk) {
      toast.error('Wallet not connected');
      return null;
    }

    setLoading(true);

    try {
      await assertPlatformNotPaused(sdk);
      const pubkey = typeof originalPostPubkey === 'string' 
        ? new PublicKey(originalPostPubkey) 
        : originalPostPubkey;

      const result = await withAnchorToast(
        () => sdk.createRepost(pubkey),
        {
          loading: 'Reposting...',
          success: '🔄 Reposted!',
        }
      );

      return result;
    } catch (error) {
      console.error('Error reposting:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to repost'
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, [sdk]);

  /**
   * Create a comment on a post
   * @param postPubkey - Post PDA to comment on
   * @param content - Comment content (max 280 characters)
   */
  const createComment = useCallback(async (postPubkey: string | PublicKey, content: string) => {
    if (!sdk) {
      toast.error('Wallet not connected');
      return null;
    }

    if (!content || content.trim().length === 0) {
      toast.error('Comment cannot be empty');
      return null;
    }

    if (content.length > 280) {
      toast.error('Comment must be 280 characters or less');
      return null;
    }

    setLoading(true);

    try {
      await assertPlatformNotPaused(sdk);
      const pubkey = typeof postPubkey === 'string' 
        ? new PublicKey(postPubkey) 
        : postPubkey;

      const result = await withAnchorToast(
        () => sdk.createComment(pubkey, content),
        {
          loading: 'Posting comment...',
          success: '💬 Comment posted!',
        }
      );

      invalidatePostEngagement(pubkey.toBase58());
      return result;
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to post comment'
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, [sdk, invalidatePostEngagement]);

  /**
   * Send a tip to a post author
   * @param authorPubkey - Author wallet address
   * @param amountInSol - Amount in SOL (will be converted to lamports)
   */
  const tipPostAuthor = useCallback(async (authorPubkey: string | PublicKey, amountInSol: number) => {
    if (!sdk) {
      toast.error('Wallet not connected');
      return null;
    }

    if (amountInSol <= 0) {
      toast.error('Tip amount must be greater than 0');
      return null;
    }

    if (amountInSol > 65) {
      toast.error('Maximum tip is 65 SOL');
      return null;
    }

    setLoading(true);

    try {
      await assertPlatformNotPaused(sdk);
      const pubkey = typeof authorPubkey === 'string' 
        ? new PublicKey(authorPubkey) 
        : authorPubkey;

      const amountInLamports = Math.floor(amountInSol * 1e9);

      const result = await withAnchorToast(
        () => sdk.sendTip(pubkey, amountInLamports),
        {
          loading: `Sending ${amountInSol} SOL tip...`,
          success: `🎉 Sent ${amountInSol} SOL!`,
        }
      );

      queryClient.invalidateQueries({ queryKey: ['profile'] });
      invalidatePostEngagement();
      return result;
    } catch (error) {
      console.error('Error sending tip:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to send tip'
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, [sdk, queryClient, invalidatePostEngagement]);

  /**
   * Get a specific post
   * @param postPubkey - Post PDA to fetch
   */
  const getPost = useCallback(async (postPubkey: string | PublicKey) => {
    if (!sdk) {
      return null;
    }

    try {
      const pubkey = typeof postPubkey === 'string' 
        ? new PublicKey(postPubkey) 
        : postPubkey;

      return await sdk.getPost(pubkey);
    } catch (error) {
      console.error('Error fetching post:', error);
      return null;
    }
  }, [sdk]);

  /**
   * Get likes for a post
   * @param postPubkey - Post PDA
   */
  const getPostLikes = useCallback(async (postPubkey: string | PublicKey) => {
    if (!sdk) {
      return [];
    }

    try {
      const pubkey = typeof postPubkey === 'string' 
        ? new PublicKey(postPubkey) 
        : postPubkey;

      return await sdk.getPostLikes(pubkey);
    } catch (error) {
      console.error('Error fetching likes:', error);
      return [];
    }
  }, [sdk]);

  /**
   * Get comments for a post
   * @param postPubkey - Post PDA
   */
  const getPostComments = useCallback(async (postPubkey: string | PublicKey) => {
    if (!sdk) {
      return [];
    }

    try {
      const pubkey = typeof postPubkey === 'string' 
        ? new PublicKey(postPubkey) 
        : postPubkey;

      return await sdk.getPostComments(pubkey);
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }, [sdk]);

  /**
   * Get reposts of a post
   * @param postPubkey - Post PDA
   */
  const getPostReposts = useCallback(async (postPubkey: string | PublicKey) => {
    if (!sdk) {
      return [];
    }

    try {
      const pubkey = typeof postPubkey === 'string' 
        ? new PublicKey(postPubkey) 
        : postPubkey;

      return await sdk.getPostReposts(pubkey);
    } catch (error) {
      console.error('Error fetching reposts:', error);
      return [];
    }
  }, [sdk]);

  return {
    // State
    loading,

    // Post operations
    createPost,
    getPost,

    // Engagement operations
    likePost,
    unlikePost,
    repostPost,
    createComment,
    tipPostAuthor,

    // Data fetching
    getPostLikes,
    getPostComments,
    getPostReposts,
  };
};
