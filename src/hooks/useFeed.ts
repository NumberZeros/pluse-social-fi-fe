import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { toast } from 'react-hot-toast';
import type { CreatePostInput } from '../services/post-service';
import { postService } from '../services/post-service';

// Timeline with infinite scroll
export const useTimeline = () => {
  return useInfiniteQuery({
    queryKey: ['feed_timeline'],
    queryFn: async ({ pageParam = 0 }) => {
      const posts = await postService.getTimeline(20, pageParam);
      return posts;
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length * 20 : undefined;
    },
    initialPageParam: 0,
  });
};

// Create post mutation
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { content: string; images?: string[]; authorId: string; authorUsername: string }) => {
      return await postService.createPost(input.authorId, input.authorUsername, {
        content: input.content,
        imageUrls: input.images,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed_timeline'] });
    },
  });
};

// Like post mutation
export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      return await postService.likePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed_timeline'] });
    },
  });
};

// Unlike post mutation
export const useUnlikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      return await postService.unlikePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed_timeline'] });
    },
  });
};

// Repost mutation
export const useRepostPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, userId }: { postId: string; userId: string }) => {
      return await postService.repostPost(postId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed_timeline'] });
    },
  });
};

// Tip post mutation
export const useTipPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, amount }: { postId: string; amount: number }) => {
      return await postService.tipPost(postId, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed_timeline'] });
    },
  });
};

// Trending topics query
export const useTrendingTopics = () => {
  return useQuery({
    queryKey: ['trending_topics'],
    queryFn: async () => {
      return await postService.getTrendingTopics();
    },
  });
};

// Suggested users query
export const useSuggestedUsers = () => {
  return useQuery({
    queryKey: ['suggested_users'],
    queryFn: async () => {
      return await postService.getSuggestedUsers();
    },
  });
};

// Get user posts
export const useUserPosts = (userAddress?: string) => {
  return useQuery({
    queryKey: ['user_posts', userAddress],
    queryFn: async () => {
      if (!userAddress) return [];
      return await postService.getUserPosts(userAddress);
    },
    enabled: !!userAddress,
  });
};

// Legacy hook for backward compatibility
export const useFeed = (userPubkey?: PublicKey) => {
  const queryClient = useQueryClient();

  // Fetch timeline with infinite scroll
  const {
    data: timeline,
    fetchNextPage,
    hasNextPage,
    isLoading: isLoadingTimeline,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['feed_timeline'],
    queryFn: async ({ pageParam = 0 }) => {
      const posts = await postService.getTimeline(20, pageParam);
      return posts;
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length * 20 : undefined;
    },
    initialPageParam: 0,
  });

  // Flatten all pages
  const allPosts = timeline?.pages.flat() ?? [];

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (input: CreatePostInput) => {
      if (!userPubkey) throw new Error('Wallet not connected');
      // TODO: Get actual username from user profile
      const username = userPubkey.toBase58().slice(0, 8);
      return await postService.createPost(userPubkey.toBase58(), username, input);
    },
    onSuccess: () => {
      toast.success('Post created!');
      queryClient.invalidateQueries({ queryKey: ['feed_timeline'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create post');
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      return await postService.likePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed_timeline'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to like post');
    },
  });

  // Unlike post mutation
  const unlikePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      return await postService.unlikePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed_timeline'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to unlike post');
    },
  });

  // Repost mutation
  const repostMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!userPubkey) throw new Error('Wallet not connected');
      return await postService.repostPost(postId, userPubkey.toBase58());
    },
    onSuccess: () => {
      toast.success('Post reposted!');
      queryClient.invalidateQueries({ queryKey: ['feed_timeline'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to repost');
    },
  });

  // Tip post mutation
  const tipPostMutation = useMutation({
    mutationFn: async ({ postId, amountInSol }: { postId: string; amountInSol: number }) => {
      return await postService.tipPost(postId, amountInSol);
    },
    onSuccess: () => {
      toast.success('Post tipped!');
      queryClient.invalidateQueries({ queryKey: ['feed_timeline'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to tip post');
    },
  });

  // Trending topics query
  const { data: trendingTopics, isLoading: isLoadingTrending } = useQuery({
    queryKey: ['trending_topics'],
    queryFn: async () => {
      return await postService.getTrendingTopics();
    },
  });

  // Suggested users query
  const { data: suggestedUsers, isLoading: isLoadingSuggested } = useQuery({
    queryKey: ['suggested_users'],
    queryFn: async () => {
      return await postService.getSuggestedUsers();
    },
  });

  // Get user posts
  const useUserPosts = (userAddress?: string) => {
    return useQuery({
      queryKey: ['user_posts', userAddress],
      queryFn: async () => {
        if (!userAddress) return [];
        return await postService.getUserPosts(userAddress);
      },
      enabled: !!userAddress,
    });
  };

  return {
    posts: allPosts,
    isLoadingTimeline,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    createPost: createPostMutation.mutateAsync,
    isCreatingPost: createPostMutation.isPending,
    likePost: likePostMutation.mutateAsync,
    unlikePost: unlikePostMutation.mutateAsync,
    repostPost: repostMutation.mutateAsync,
    tipPost: tipPostMutation.mutateAsync,
    isLiking: likePostMutation.isPending,
    isUnliking: unlikePostMutation.isPending,
    isReposting: repostMutation.isPending,
    isTipping: tipPostMutation.isPending,
    trendingTopics,
    isLoadingTrending,
    suggestedUsers,
    isLoadingSuggested,
    useUserPosts,
  };
};
