import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useSocialFi } from './useSocialFi';

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
      return await getUserProfile(targetPubkey);
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
