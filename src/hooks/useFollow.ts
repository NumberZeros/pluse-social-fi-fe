import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useSocialFi } from './useSocialFi';
import { useReadOnlySdk } from '../services/read-only-sdk';
import { useWallet } from '../lib/wallet-adapter';
import { toast } from 'react-hot-toast';
import { assertPlatformNotPaused } from '../utils/platformPauseGuard';
import { CacheManager } from '../services/storage';

/**
 * Hook to check if current user is following another user
 */
export const useIsFollowing = (followingAddress?: string) => {
  const readSdk = useReadOnlySdk();
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: ['is_following', publicKey?.toBase58(), followingAddress],
    queryFn: async () => {
      if (!readSdk || !followingAddress || !publicKey) return false;
      return await readSdk.isFollowing(new PublicKey(followingAddress), publicKey);
    },
    enabled: !!readSdk && !!followingAddress && !!publicKey,
  });
};

/**
 * Hook to get followers of a user (on-chain)
 */
export const useFollowers = (targetAddress?: string) => {
  const readSdk = useReadOnlySdk();

  return useQuery({
    queryKey: ['followers', targetAddress],
    queryFn: async () => {
      if (!readSdk || !targetAddress) return [];
      const cacheKey = `followers:${targetAddress}`;
      try {
        const followers = await readSdk.getFollowers(new PublicKey(targetAddress));
        if (followers && followers.length > 0) {
          await CacheManager.setCachedMetadata(cacheKey, followers);
        }
        return followers || [];
      } catch (error) {
        console.error('Error fetching followers:', error);
        const cached = await CacheManager.getCachedMetadata(cacheKey);
        if (cached) {
          console.log('📱 Using cached followers (error fallback)');
          return cached as Awaited<ReturnType<typeof readSdk.getFollowers>>;
        }
        return [];
      }
    },
    enabled: !!readSdk && !!targetAddress,
  });
};

/**
 * Hook to get users that a user is following (on-chain)
 */
export const useFollowing = (targetAddress?: string) => {
  const readSdk = useReadOnlySdk();

  return useQuery({
    queryKey: ['following', targetAddress],
    queryFn: async () => {
      if (!readSdk || !targetAddress) return [];
      const cacheKey = `following:${targetAddress}`;
      try {
        const following = await readSdk.getFollowing(new PublicKey(targetAddress));
        if (following && following.length > 0) {
          await CacheManager.setCachedMetadata(cacheKey, following);
        }
        return following || [];
      } catch (error) {
        console.error('Error fetching following:', error);
        const cached = await CacheManager.getCachedMetadata(cacheKey);
        if (cached) {
          console.log('📱 Using cached following (error fallback)');
          return cached as Awaited<ReturnType<typeof readSdk.getFollowing>>;
        }
        return [];
      }
    },
    enabled: !!readSdk && !!targetAddress,
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
      await assertPlatformNotPaused(sdk);

      const toastId = toast.loading('Following user...');
      try {
        const result = await sdk!.followUser(new PublicKey(followingId));
        toast.success('Followed!', { id: toastId });
        return result;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to follow';
        toast.error(message, { id: toastId });
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
      await assertPlatformNotPaused(sdk);

      const toastId = toast.loading('Unfollowing user...');
      try {
        const result = await sdk!.unfollowUser(new PublicKey(followingId));
        toast.success('Unfollowed!', { id: toastId });
        return result;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to unfollow';
        toast.error(message, { id: toastId });
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
