import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { toast } from 'react-hot-toast';
import { useSocialFi } from './useSocialFi';

export interface Post {
  id: string; // PublicKey string
  author: string; // PublicKey string
  authorUsername?: string; // Fetched from profile
  content: string;
  imageUrls: string[];
  createdAt: number;
  likes: number;
  comments: number;
  reposts: number;
  tips: number;
  isLiked?: boolean;
  isReposted?: boolean;
}

// Mock storage helper for dev environment (since we don't have IPFS backend yet)
const fetchMetadata = async (uri: string): Promise<{ content: string; images: string[] }> => {
  try {
    if (uri.startsWith('text:')) {
      return { content: uri.slice(5), images: [] };
    }
    if (uri.startsWith('mock:')) {
      const data = localStorage.getItem(`post_metadata_${uri}`);
      if (data) return JSON.parse(data);
    }
    if (uri.startsWith('http')) {
      const res = await fetch(uri);
      return await res.json();
    }
  } catch (e) {
    console.error('Failed to fetch metadata', e);
  }
  return { content: 'Content unavailable', images: [] };
};

const uploadMetadata = async (content: string, images: string[]): Promise<string> => {
  // Simulating IPFS upload
  const id = `mock:${Date.now()}`;
  const metadata = { content, images };
  localStorage.setItem(`post_metadata_${id}`, JSON.stringify(metadata));
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
      if (!sdk) return [];
      const rawPosts: RawPost[] = await sdk.getAllPosts();
      
      // Fetch metadata and stats for each post
      const enrichedPosts = await Promise.all(
        rawPosts.map(async (p) => {
          const metadata = await fetchMetadata(p.uri);
          
          // Parallelize stats fetching
          const [likes, comments, profile] = await Promise.all([
             sdk.getPostLikes(new PublicKey(p.publicKey)),
             sdk.getPostComments(new PublicKey(p.publicKey)),
             sdk.getUserProfile(new PublicKey(p.author))
          ]);

          return {
            id: p.publicKey,
            author: p.author,
            authorUsername: profile?.username,
            content: metadata.content,
            imageUrls: metadata.images || [],
            createdAt: p.createdAt * 1000, // Convert to ms
            likes: likes.length,
            comments: comments.length,
            reposts: 0, // SDK doesn't have getReposts yet?
            tips: 0, // Placeholder
            isLiked: false, // Needs user context, can be fetched separately or here if we have user
            isReposted: false,
          };
        })
      );

      // Sort by createdAt descending
      return enrichedPosts.sort((a, b) => b.createdAt - a.createdAt);
    },
    enabled: !!sdk,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
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
      
      let uri = '';
      if (content.length < 190 && images.length === 0) {
          uri = `text:${content}`;
      } else {
          uri = await uploadMetadata(content, images);
      }
      
      return await sdk.createPost(uri);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed_timeline'] });
      queryClient.invalidateQueries({ queryKey: ['user_posts'] });
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
      return await sdk.getPostLikes(new PublicKey(postId));
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
      return await sdk.getPostComments(new PublicKey(postId));
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
