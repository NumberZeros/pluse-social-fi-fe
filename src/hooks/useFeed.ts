import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useSocialFi } from './useSocialFi';
import { useReadOnlySdk } from '../services/read-only-sdk';
import { useWallet } from '@solana/wallet-adapter-react';
import { CacheManager, isOnline } from '../services/storage';
import { toast } from 'react-hot-toast';
import { type PostAccessLevel, fetchMetadata } from '../services/ipfs';
import { assertPlatformNotPaused } from '../utils/platformPauseGuard';

export const FEED_PAGE_SIZE = 10;

export interface Post {
  id: string; // PublicKey string
  publicKey: string; // Same as id, for backwards compatibility
  author: string; // PublicKey string
  authorUsername?: string; // Fetched from profile
  content: string;
  imageUrls: string[];
  videoUrls: string[];
  createdAt: number;
  likes: number;
  comments: number;
  reposts: number;
  tips: number;
  mint?: string | null;
  groupId?: string;
  accessLevel?: PostAccessLevel;
  gatedContentUri?: string;
  /** @deprecated Use accessLevel */
  isSubscriberOnly?: boolean;
  isLiked?: boolean;
  isReposted?: boolean;
}

// Re-export for consumers that imported from useFeed
export { fetchMetadata } from '../services/ipfs';

interface RawPost {
  publicKey: string;
  author: string;
  uri: string;
  mint: string | null;
  createdAt: number;
}

async function buildUsernameMap(readSdk: NonNullable<ReturnType<typeof useReadOnlySdk>>) {
  try {
    const profiles = await readSdk.program.account.userProfile.all();
    return new Map(
      profiles.map((p) => [p.account.owner.toBase58(), p.account.username] as const),
    );
  } catch {
    return new Map<string, string>();
  }
}

/**
 * Get all posts from blockchain
 */
export const useTimeline = () => {
  const readSdk = useReadOnlySdk();
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: ['feed_timeline', publicKey?.toBase58()],
    queryFn: async (): Promise<Post[]> => {
      if (!readSdk) {
        throw new Error('Read-only SDK not initialized');
      }

      try {
        const rawPosts: RawPost[] = await readSdk.getAllPosts();
        const usernameByAuthor = await buildUsernameMap(readSdk);

        const enrichedPosts = await Promise.all(
          rawPosts.map(async (p) => {
            const metadata = await fetchMetadata(p.uri);

            return {
              id: p.publicKey,
              publicKey: p.publicKey,
              author: p.author,
              authorUsername: usernameByAuthor.get(p.author),
              content: metadata.content,
              imageUrls: metadata.images || [],
              videoUrls: metadata.videos || [],
              createdAt: p.createdAt * 1000,
              likes: 0,
              comments: 0,
              reposts: 0,
              tips: 0,
              mint: p.mint,
              groupId: metadata.groupId,
              accessLevel: metadata.accessLevel,
              gatedContentUri: metadata.gatedContentUri,
              isSubscriberOnly: metadata.accessLevel === 'supporters',
              isLiked: false,
              isReposted: false,
            };
          }),
        );

        const engagementIndex = await readSdk.buildEngagementIndex(publicKey || undefined);
        const withEngagement = enrichedPosts.map((post) => {
          const engagement = engagementIndex.get(post.id);
          if (!engagement) return post;
          return {
            ...post,
            likes: engagement.likes,
            comments: engagement.comments,
            reposts: engagement.reposts,
            isLiked: engagement.isLiked,
          };
        });

        const sorted = withEngagement.sort((a, b) => b.createdAt - a.createdAt);

        if (sorted.length > 0) {
          await CacheManager.setCachedPosts(sorted);
        }

        return sorted as Post[];
      } catch (error) {
        console.error('Error fetching feed:', error);

        if (!isOnline()) {
          const cached = await CacheManager.getCachedPosts();
          if (cached) {
            console.warn('Using stale cache — RPC may be failing (offline)');
            return cached as Post[];
          }
        }

        const cached = await CacheManager.getCachedPosts();
        if (cached) {
          console.warn('Using stale cache — RPC may be failing');
          return cached as Post[];
        }

        throw error;
      }
    },
    enabled: !!readSdk,
    staleTime: 1000 * 60 * 5,
    refetchInterval: undefined,
  });
};

/**
 * Batch engagement for visible posts (single index fetch, shared across cards).
 */
export const useFeedEngagement = (postIds: string[]) => {
  const readSdk = useReadOnlySdk();
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: ['feed_engagement', postIds.join(','), publicKey?.toBase58()],
    queryFn: async () => {
      if (!readSdk || postIds.length === 0) {
        return new Map<string, { likes: number; comments: number; reposts: number; isLiked: boolean }>();
      }
      const index = await readSdk.buildEngagementIndex(publicKey || undefined);
      const filtered = new Map<string, { likes: number; comments: number; reposts: number; isLiked: boolean }>();
      for (const id of postIds) {
        const entry = index.get(id);
        if (entry) filtered.set(id, entry);
      }
      return filtered;
    },
    enabled: !!readSdk && postIds.length > 0,
    staleTime: 1000 * 60 * 2,
  });
};

/**
 * Like post mutation (on-chain)
 */
export const useLikePost = () => {
  const queryClient = useQueryClient();
  const { sdk } = useSocialFi();

  return useMutation({
    mutationFn: async (postId: string) => {
      await assertPlatformNotPaused(sdk);
      return await sdk!.likePost(new PublicKey(postId));
    },
    onSuccess: (_data, postId) => {
      queryClient.invalidateQueries({ queryKey: ['feed_timeline'] });
      queryClient.invalidateQueries({ queryKey: ['feed_engagement'] });
      queryClient.invalidateQueries({ queryKey: ['post_likes'] });
      queryClient.invalidateQueries({ queryKey: ['single_post', postId] });
      queryClient.invalidateQueries({ queryKey: ['has_liked'] });
      queryClient.invalidateQueries({ queryKey: ['post_engagement'] });
    },
  });
};

/**
 * Unlike post mutation (on-chain)
 */
export const useUnlikePost = () => {
  const queryClient = useQueryClient();
  const { sdk } = useSocialFi();

  return useMutation({
    mutationFn: async (postId: string) => {
      await assertPlatformNotPaused(sdk);
      return await sdk!.unlikePost(new PublicKey(postId));
    },
    onSuccess: (_data, postId) => {
      queryClient.invalidateQueries({ queryKey: ['feed_timeline'] });
      queryClient.invalidateQueries({ queryKey: ['feed_engagement'] });
      queryClient.invalidateQueries({ queryKey: ['post_likes'] });
      queryClient.invalidateQueries({ queryKey: ['single_post', postId] });
      queryClient.invalidateQueries({ queryKey: ['has_liked'] });
      queryClient.invalidateQueries({ queryKey: ['post_engagement'] });
    },
  });
};

/**
 * Create comment mutation (on-chain)
 */
export const useCreateComment = () => {
  const queryClient = useQueryClient();
  const { sdk } = useSocialFi();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      await assertPlatformNotPaused(sdk);
      return await sdk!.createComment(new PublicKey(postId), content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post_comments'] });
      queryClient.invalidateQueries({ queryKey: ['feed_timeline'] });
      queryClient.invalidateQueries({ queryKey: ['feed_engagement'] });
      queryClient.invalidateQueries({ queryKey: ['single_post'] });
      queryClient.invalidateQueries({ queryKey: ['user_replies'] });
    },
  });
};

/**
 * Tip post mutation (on-chain via sendTip)
 * Fetches post to get author, then sends tip to author
 */
export const useTipPost = () => {
  const queryClient = useQueryClient();
  const { sdk } = useSocialFi();

  return useMutation({
    mutationFn: async ({ authorAddress, amount }: { postId: string; authorAddress: string; amount: number }) => {
      await assertPlatformNotPaused(sdk);
      if (amount <= 0) throw new Error('Tip amount must be greater than 0');
      if (amount > 65) throw new Error('Maximum tip is 65 SOL');

      const authorPubkey = new PublicKey(authorAddress);
      const amountInLamports = Math.floor(amount * 1e9);

      return await sdk!.sendTip(authorPubkey, amountInLamports);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed_timeline'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['single_post'] });
      toast.success('Tip sent successfully! 🎉');
    },
    onError: (error) => {
      console.error('❌ Tip error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to send tip'
      );
    },
  });
};

/**
 * Get a specific post by ID
 */
export const useGetPost = (postId?: string) => {
  const readSdk = useReadOnlySdk();

  return useQuery({
    queryKey: ['post_details', postId],
    queryFn: async () => {
      if (!readSdk || !postId) return null;
      const cacheKey = `post_details:${postId}`;
      try {
        const post = await readSdk.getPost(new PublicKey(postId));
        if (post) {
          await CacheManager.setCachedMetadata(cacheKey, post);
        }
        return post;
      } catch (error) {
        console.error('Error fetching post:', error);
        const cached = await CacheManager.getCachedMetadata(cacheKey);
        if (cached) {
          console.log('📱 Using cached post details (error fallback)');
          return cached;
        }
        return null;
      }
    },
    enabled: !!readSdk && !!postId,
  });
};

/**
 * Get post likes
 */
export const usePostLikes = (postId?: string) => {
  const readSdk = useReadOnlySdk();

  return useQuery({
    queryKey: ['post_likes', postId],
    queryFn: async () => {
      if (!readSdk || !postId) return [];
      const cacheKey = `post_likes:${postId}`;
      try {
        const likes = await readSdk.getPostLikes(new PublicKey(postId));
        if (likes && likes.length > 0) {
          await CacheManager.setCachedMetadata(cacheKey, likes);
        }
        return likes || [];
      } catch (error) {
        console.error('Error fetching post likes:', error);
        const cached = await CacheManager.getCachedMetadata(cacheKey);
        if (cached) {
          console.log('📱 Using cached post likes (error fallback)');
          return cached as ReturnType<typeof readSdk.getPostLikes> extends Promise<infer T> ? T : never;
        }
        return [];
      }
    },
    enabled: !!readSdk && !!postId,
  });
};

/**
 * Get post comments
 */
export const usePostComments = (postId?: string) => {
  const readSdk = useReadOnlySdk();

  return useQuery({
    queryKey: ['post_comments', postId],
    queryFn: async () => {
      if (!readSdk || !postId) return [];
      const cacheKey = `post_comments:${postId}`;
      try {
        const comments = await readSdk.getPostComments(new PublicKey(postId));
        if (comments && comments.length > 0) {
          await CacheManager.setCachedMetadata(cacheKey, comments);
        }
        return comments || [];
      } catch (error) {
        console.error('Error fetching post comments:', error);
        const cached = await CacheManager.getCachedMetadata(cacheKey);
        if (cached) {
          console.log('📱 Using cached post comments (error fallback)');
          return cached as Awaited<ReturnType<typeof readSdk.getPostComments>>;
        }
        return [];
      }
    },
    enabled: !!readSdk && !!postId,
  });
};

/**
 * Check if user has liked a post
 */
export const useHasLikedPost = (postId?: string) => {
  const readSdk = useReadOnlySdk();
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: ['has_liked', publicKey?.toBase58(), postId],
    queryFn: async () => {
      if (!readSdk || !postId || !publicKey) return false;
      return await readSdk.hasLikedPost(new PublicKey(postId), publicKey);
    },
    enabled: !!readSdk && !!postId && !!publicKey,
  });
};

/**
 * Lazy-load engagement stats per post (likes, comments, reposts)
 */
export const usePostEngagement = (postId?: string) => {
  const readSdk = useReadOnlySdk();
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: ['post_engagement', postId, publicKey?.toBase58()],
    queryFn: async () => {
      if (!readSdk || !postId) {
        return { likes: 0, comments: 0, reposts: 0, isLiked: false };
      }
      const postPubkey = new PublicKey(postId);
      const [likes, comments, reposts, isLiked] = await Promise.all([
        readSdk.getPostLikes(postPubkey),
        readSdk.getPostComments(postPubkey),
        readSdk.getPostReposts(postPubkey),
        publicKey ? readSdk.hasLikedPost(postPubkey, publicKey) : Promise.resolve(false),
      ]);
      return {
        likes: likes.length,
        comments: comments.length,
        reposts: reposts.length,
        isLiked,
      };
    },
    enabled: !!readSdk && !!postId,
    staleTime: 1000 * 60 * 2,
  });
};

/**
 * Trending hashtags derived from the shared timeline cache (no extra RPC).
 */
export const useTrendingTopics = () => {
  const { data: timeline = [], isPending, isError } = useTimeline();

  const data = useMemo(() => {
    const tagCounts = new Map<string, number>();

    for (const post of timeline.slice(0, 50)) {
      const matches = (post.content || '').match(/#\w+/g) || [];
      for (const tag of matches) {
        const normalized = tag.toLowerCase();
        tagCounts.set(normalized, (tagCounts.get(normalized) || 0) + 1);
      }
    }

    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({
        tag: tag.replace('#', ''),
        count,
        trend: 'up' as const,
      }));
  }, [timeline]);

  return { data, isPending, isError };
};

/**
 * Suggested users from recent on-chain profiles
 */
export const useSuggestedUsers = () => {
  const readSdk = useReadOnlySdk();

  return useQuery({
    queryKey: ['suggested_users'],
    queryFn: async () => {
      if (!readSdk) return [];
      try {
        const profiles = await readSdk.program.account.userProfile.all();
        return profiles.slice(0, 5).map((p) => ({
          address: p.account.owner.toBase58(),
          username: p.account.username,
          followerCount: p.account.followersCount.toNumber(),
        }));
      } catch {
        return [];
      }
    },
    enabled: !!readSdk,
    staleTime: 1000 * 60 * 10,
  });
};

/**
 * Get user posts — derived from the shared timeline source.
 */
export const useUserPosts = (userAddress?: string) => {
  const { data: timeline = [], isPending, isError, error } = useTimeline();

  const userPosts = useMemo(() => {
    if (!userAddress) return [];
    return timeline.filter((p) => p.author === userAddress);
  }, [timeline, userAddress]);

  return {
    data: userPosts,
    isPending,
    isError,
    error,
  };
};

/**
 * Legacy hook for backward compatibility - deprecated in favor of direct hooks
 */
export const useFeed = () => {
  return {};
};
