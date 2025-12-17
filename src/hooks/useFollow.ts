import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useSocialFi } from './useSocialFi';
import { toast } from 'react-hot-toast';

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
      return await sdk.getFollowers(new PublicKey(targetAddress));
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
      return await sdk.getFollowing(new PublicKey(targetAddress));
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
