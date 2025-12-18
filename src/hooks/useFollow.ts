import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useSocialFi } from './useSocialFi';
import { toast } from 'react-hot-toast';
import { CacheManager } from '../services/storage';

/**
 * Hook to check if current user is following another user
 */
export const useIsFollowing = (followingAddress?: string) => {
  const { sdk } = useSocialFi();

  return useQuery({
    queryKey: ['is_following', sdk?.wallet.publicKey?.toBase58(), followingAddress],
    queryFn: async () => {
      if (!sdk || !followingAddress) return false;
      try {
        return await sdk.isFollowing(new PublicKey(followingAddress));
      } catch {
        return false;
      }
    },
    enabled: !!sdk && !!followingAddress,
  });
};

/**
 * Hook to get followers of a user (on-chain)
 */
export const useFollowers = (targetAddress?: string) => {
  const { sdk } = useSocialFi();

  return useQuery({
    queryKey: ['followers', targetAddress],
    queryFn: async () => {
      if (!sdk || !targetAddress) return [];
      const cacheKey = `followers:${targetAddress}`;
      try {
        const followers = await sdk.getFollowers(new PublicKey(targetAddress));
        // Cache if we got results
        if (followers && followers.length > 0) {
          await CacheManager.setCachedMetadata(cacheKey, followers);
        }
        return followers || [];
      } catch (error) {
        console.error('Error fetching followers:', error);
        // Try to return cached followers on error
        const cached = await CacheManager.getCachedMetadata(cacheKey);
        if (cached) {
          console.log('📱 Using cached followers (error fallback)');
          return cached as any;
        }
        return [];
      }
    },
    enabled: !!sdk && !!targetAddress,
  });
};

/**
 * Hook to get users that a user is following (on-chain)
 */
export const useFollowing = (targetAddress?: string) => {
  const { sdk } = useSocialFi();

  return useQuery({
    queryKey: ['following', targetAddress],
    queryFn: async () => {
      if (!sdk || !targetAddress) return [];
      const cacheKey = `following:${targetAddress}`;
      try {
        const following = await sdk.getFollowing(new PublicKey(targetAddress));
        // Cache if we got results
        if (following && following.length > 0) {
          await CacheManager.setCachedMetadata(cacheKey, following);
        }
        return following || [];
      } catch (error) {
        console.error('Error fetching following:', error);
        // Try to return cached following on error
        const cached = await CacheManager.getCachedMetadata(cacheKey);
        if (cached) {
          console.log('📱 Using cached following (error fallback)');
          return cached as any;
        }
        return [];
      }
    },
    enabled: !!sdk && !!targetAddress,
  });
};

/**
 * Hook to follow a user (on-chain)
 */
export const useFollowUser = () => {
  const queryClient = useQueryClient();
  const { sdk } = useSocialFi();

  return useMutation({
    mutationFn: async ({ followingId }: { followerId: string; followingId: string }) => {
      if (!sdk) throw new Error('SDK not initialized');
      
      const toastId = toast.loading('Following user...');
      try {
        const result = await sdk.followUser(new PublicKey(followingId));
        toast.success('Followed!', { id: toastId });
        return result;
      } catch (error: any) {
        toast.error(error.message || 'Failed to follow', { id: toastId });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['is_following'] });
    },
  });
};

/**
 * Hook to unfollow a user (on-chain)
 */
export const useUnfollowUser = () => {
  const queryClient = useQueryClient();
  const { sdk } = useSocialFi();

  return useMutation({
    mutationFn: async ({ followingId }: { followerId: string; followingId: string }) => {
      if (!sdk) throw new Error('SDK not initialized');
      
      const toastId = toast.loading('Unfollowing user...');
      try {
        const result = await sdk.unfollowUser(new PublicKey(followingId));
        toast.success('Unfollowed!', { id: toastId });
        return result;
      } catch (error: any) {
        toast.error(error.message || 'Failed to unfollow', { id: toastId });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['is_following'] });
    },
  });
};
