import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useSocialFi } from './useSocialFi';
import { CacheManager } from '../services/storage';

/**
 * Hook for managing user profile operations
 */
export function useProfile(ownerPubkey?: PublicKey) {
  const { getUserProfile, createProfile, publicKey } = useSocialFi();
  const queryClient = useQueryClient();
  const targetPubkey = ownerPubkey || publicKey;

  // Fetch profile data
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['profile', targetPubkey?.toBase58()],
    queryFn: async () => {
      if (!targetPubkey) return null;
      try {
        const result = await getUserProfile(targetPubkey);
        // Cache profile if successful and not null
        if (result) {
          await CacheManager.setCachedMetadata(`profile:${targetPubkey.toBase58()}`, result);
        }
        return result;
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Try to return cached profile on error
        const cached = await CacheManager.getCachedMetadata(`profile:${targetPubkey.toBase58()}`);
        if (cached) {
          console.log('📱 Using cached profile (error fallback)');
          return cached as any;
        }
        throw error;
      }
    },
    enabled: !!targetPubkey,
    staleTime: 30000, // 30 seconds
  });

  // Create profile mutation
  const createProfileMutation = useMutation({
    mutationFn: async ({ username }: { username: string }) => {
      return await createProfile(username);
    },
    onSuccess: () => {
      // Invalidate profile query
      queryClient.invalidateQueries({ queryKey: ['profile', publicKey?.toBase58()] });
    },
  });

  // Helper functions
  const hasProfile = useCallback(() => {
    return !!profile;
  }, [profile]);

  const isOwnProfile = useCallback(() => {
    return publicKey && targetPubkey && publicKey.equals(targetPubkey);
  }, [publicKey, targetPubkey]);

  return {
    // Profile data
    profile,
    isLoading,
    error,
    refetch,

    // Profile state
    hasProfile: hasProfile(),
    isOwnProfile: isOwnProfile(),

    // Mutations
    createProfile: createProfileMutation.mutateAsync,
    isCreating: createProfileMutation.isPending,
  };
}
