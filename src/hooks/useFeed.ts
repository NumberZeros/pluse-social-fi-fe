import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useSocialFi } from './useSocialFi';
import { CacheManager, isOnline } from '../services/storage';

export interface Post {
  id: string; // PublicKey string
  publicKey: string; // Same as id, for backwards compatibility
  author: string; // PublicKey string
  authorUsername?: string; // Fetched from profile
  content: string;
  imageUrls: string[];
  createdAt: number;
  likes: number;
  comments: number;
  reposts: number;
  tips: number;
  mint?: string | null; // NFT mint address if minted
  isLiked?: boolean;
  isReposted?: boolean;
}

// Fetch metadata with IndexedDB caching
const fetchMetadata = async (uri: string): Promise<{ content: string; images: string[] }> => {
  try {
    // Check cache first
    const cached = await CacheManager.getCachedMetadata(uri);
    if (cached) {
      return cached;
    }

    let metadata: { content: string; images: string[] };

    // Plain text content
    if (uri.startsWith('text:')) {
      metadata = { content: uri.slice(5), images: [] };
    }
    // Mock storage in localStorage
    else if (uri.startsWith('mock:') || uri.startsWith('ipfs://post/')) {
      const data = localStorage.getItem(`post_metadata_${uri}`);
      metadata = data ? JSON.parse(data) : { content: `[Test Post] URI: ${uri}`, images: [] };
    }
    // Real HTTP/HTTPS URLs (Arweave, Pinata gateways)
    else if (uri.startsWith('http')) {
      const res = await fetch(uri);
      if (res.ok) {
        metadata = await res.json();
      } else {
        metadata = { content: `[Error] Failed to fetch: ${uri}`, images: [] };
      }
    }
    // Fallback: treat URI as plain text content
    else {
      console.warn('⚠️ Could not fetch metadata for URI:', uri);
      metadata = { content: `[Test Post] URI: ${uri}`, images: [] };
    }

    // Cache the result for next time
    await CacheManager.setCachedMetadata(uri, metadata);
    return metadata;
  } catch (e) {
    console.error('Failed to fetch metadata:', uri, e);
    
    // Try to use cached version on error
    const cached = await CacheManager.getCachedMetadata(uri);
    if (cached) return cached;
    
    return { content: `[Test Post] URI: ${uri}`, images: [] };
  }
};

const uploadMetadata = async (content: string, images: string[]): Promise<string> => {
  // Store metadata temporarily in localStorage with Pinata-style IPFS URI
  const id = `ipfs://post/${Date.now()}`;
  const metadata = { content, images };
  localStorage.setItem(`post_metadata_${id}`, JSON.stringify(metadata));
  
  // Also cache in IndexedDB
  await CacheManager.setCachedMetadata(id, metadata);
  
  return id;
};

interface RawPost {
  publicKey: string;
  author: string;
  uri: string;
  mint: string | null;
  createdAt: number;
}

/**
 * Get all posts from blockchain
 */
export const useTimeline = () => {
  const { sdk } = useSocialFi();

  return useQuery({
    queryKey: ['feed_timeline'],
    queryFn: async (): Promise<Post[]> => {
      try {
        if (!sdk) {
          // Try to return cached posts if offline
          const cached = await CacheManager.getCachedPosts();
          if (cached) {
            console.log('📱 Using cached posts (no SDK)');
            return cached;
          }
          return [];
        }

        const rawPosts: RawPost[] = await sdk.getAllPosts();
        
        // If we get no posts from API, use cache instead of overwriting with empty array
        if (!rawPosts || rawPosts.length === 0) {
          const cached = await CacheManager.getCachedPosts();
          if (cached) {
            console.log('📱 API returned no posts, using cached');
            return cached;
          }
          return [];
        }
        
        // Fetch metadata and stats for each post
        const enrichedPosts = await Promise.all(
          rawPosts.map(async (p) => {
            const metadata = await fetchMetadata(p.uri);
            
            // Don't fetch likes/comments/profile stats on initial load - too many RPC calls!
            // These cause rate limiting. Fetch them on-demand instead.
            // For now, return post with default stats (0 likes, 0 comments, no username)
            return {
              id: p.publicKey,
              publicKey: p.publicKey, // For backwards compatibility
              author: p.author,
              authorUsername: undefined, // Will be fetched on demand or from cache
              content: metadata.content,
              imageUrls: metadata.images || [],
              createdAt: p.createdAt * 1000, // Convert to ms
              likes: 0, // Will be fetched on demand
              comments: 0, // Will be fetched on demand
              reposts: 0,
              tips: 0,
              mint: p.mint, // NFT mint if exists
              isLiked: false,
              isReposted: false,
            };
          })
        );

        // Sort by createdAt descending
        const sorted = enrichedPosts.sort((a, b) => b.createdAt - a.createdAt);

        // Cache the fresh data (only if we have posts)
        if (sorted.length > 0) {
          await CacheManager.setCachedPosts(sorted);
        }

        return sorted as any;
      } catch (error) {
        console.error('Error fetching feed:', error);
        
        // Always try to return cached posts on error (offline or API failure)
        const cached = await CacheManager.getCachedPosts();
        if (cached) {
          const statusMsg = isOnline() ? '(API error - using cache)' : '(offline - using cache)';
          console.log(`📱 Using cached posts ${statusMsg}`);
          return cached as any;
        }

        throw error;
      }
    },
    enabled: !!sdk,
    staleTime: 1000 * 60 * 5, // 5 minutes (matches QueryClient default)
    refetchInterval: undefined, // Disable auto-refetch (too heavy - multiple RPC calls per post)
  });
};

/**
 * Create post mutation (on-chain)
 */
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const { sdk } = useSocialFi();

  return useMutation({
    mutationFn: async ({ content, images }: { content: string; images: string[] }) => {
      if (!sdk) throw new Error('SDK not initialized');
      
      const uri = await uploadMetadata(content, images);
      
      return await sdk.createPost(uri);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed_timeline'] });
      queryClient.invalidateQueries({ queryKey: ['user_posts'] });
      // Clear cache to force refresh
      CacheManager.clearCache();
    },
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
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.likePost(new PublicKey(postId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed_timeline'] });
      queryClient.invalidateQueries({ queryKey: ['post_likes'] });
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
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.unlikePost(new PublicKey(postId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed_timeline'] });
      queryClient.invalidateQueries({ queryKey: ['post_likes'] });
    },
  });
};

/**
 * Repost mutation (on-chain)
 */
export const useRepostPost = () => {
  const queryClient = useQueryClient();
  const { sdk } = useSocialFi();

  return useMutation({
    mutationFn: async ({ postId }: { postId: string }) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.createRepost(new PublicKey(postId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed_timeline'] });
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
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.createComment(new PublicKey(postId), content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post_comments'] });
      queryClient.invalidateQueries({ queryKey: ['feed_timeline'] });
    },
  });
};

/**
 * Tip post mutation (on-chain via sendTip)
 */
export const useTipPost = () => {
  const queryClient = useQueryClient();
  const { sdk } = useSocialFi();

  return useMutation({
    mutationFn: async ({ postId, amount }: { postId: string; amount: number }) => {
      if (!sdk) throw new Error('SDK not initialized');
      // Need to fetch post author first
      // This is a bit inefficient, ideally passed from UI
      // For now, let's assume UI passes author address or we fetch it
      // But sendTip needs recipient address.
      // We will fetch the post account to get the author
      // Implementation pending: fetch post -> get author -> sendTip
      console.log(`Tip ${amount} SOL to post ${postId}`);
      return { signature: 'placeholder' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed_timeline'] });
    },
  });
};

/**
 * Get post likes
 */
export const usePostLikes = (postId?: string) => {
  const { sdk } = useSocialFi();

  return useQuery({
    queryKey: ['post_likes', postId],
    queryFn: async () => {
      if (!sdk || !postId) return [];
      const cacheKey = `post_likes:${postId}`;
      try {
        const likes = await sdk.getPostLikes(new PublicKey(postId));
        // Cache if we got results
        if (likes && likes.length > 0) {
          await CacheManager.setCachedMetadata(cacheKey, likes);
        }
        return likes || [];
      } catch (error) {
        console.error('Error fetching post likes:', error);
        const cached = await CacheManager.getCachedMetadata(cacheKey);
        if (cached) {
          console.log('📱 Using cached post likes (error fallback)');
          return cached as any;
        }
        return [];
      }
    },
    enabled: !!sdk && !!postId,
  });
};

/**
 * Get post comments
 */
export const usePostComments = (postId?: string) => {
  const { sdk } = useSocialFi();

  return useQuery({
    queryKey: ['post_comments', postId],
    queryFn: async () => {
      if (!sdk || !postId) return [];
      const cacheKey = `post_comments:${postId}`;
      try {
        const comments = await sdk.getPostComments(new PublicKey(postId));
        // Cache if we got results
        if (comments && comments.length > 0) {
          await CacheManager.setCachedMetadata(cacheKey, comments);
        }
        return comments || [];
      } catch (error) {
        console.error('Error fetching post comments:', error);
        const cached = await CacheManager.getCachedMetadata(cacheKey);
        if (cached) {
          console.log('📱 Using cached post comments (error fallback)');
          return cached as any;
        }
        return [];
      }
    },
    enabled: !!sdk && !!postId,
  });
};

/**
 * Check if user has liked a post
 */
export const useHasLikedPost = (postId?: string) => {
  const { sdk } = useSocialFi();

  return useQuery({
    queryKey: ['has_liked', sdk?.wallet.publicKey?.toBase58(), postId],
    queryFn: async () => {
      if (!sdk || !postId) return false;
      return await sdk.hasLikedPost(new PublicKey(postId));
    },
    enabled: !!sdk && !!postId,
  });
};

/**
 * Trending topics (placeholder - can be computed from posts)
 */
export const useTrendingTopics = () => {
  return useQuery({
    queryKey: ['trending_topics'],
    queryFn: async () => {
      // Placeholder
      return [
        { tag: '#SocialFi', count: 234, trend: 'up' as const },
        { tag: '#Solana', count: 189, trend: 'stable' as const },
        { tag: '#Governance', count: 156, trend: 'up' as const },
      ];
    },
  });
};

/**
 * Suggested users (can be computed from follows data)
 */
export const useSuggestedUsers = () => {
  return useQuery({
    queryKey: ['suggested_users'],
    queryFn: async () => {
      // Placeholder
      return [
        { address: 'user1.sol', username: 'creator1', followerCount: 1234 },
        { address: 'user2.sol', username: 'creator2', followerCount: 567 },
        { address: 'user3.sol', username: 'creator3', followerCount: 890 },
      ];
    },
  });
};

/**
 * Get user posts
 */
export const useUserPosts = (userAddress?: string) => {
  const { sdk } = useSocialFi();

  return useQuery({
    queryKey: ['user_posts', userAddress],
    queryFn: async () => {
      if (!sdk || !userAddress) return [];
      const allPosts: RawPost[] = await sdk.getAllPosts();
      // Filter filtering on client side for now as contract doesn't have indexed user posts
      const userPosts = allPosts.filter(p => p.author === userAddress);
      
      // Enrich
      const enriched = await Promise.all(userPosts.map(async p => {
         const metadata = await fetchMetadata(p.uri);
         return {
            id: p.publicKey,
            author: p.author,
            content: metadata.content,
            imageUrls: metadata.images || [],
            createdAt: p.createdAt * 1000,
            likes: 0, 
            comments: 0,
            reposts: 0,
            tips: 0,
         };
      }));
      
      return enriched.sort((a, b) => b.createdAt - a.createdAt);
    },
    enabled: !!sdk && !!userAddress,
  });
};

/**
 * Legacy hook for backward compatibility - deprecated in favor of direct hooks
 */
export const useFeed = () => {
  return {};
};
