import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useSocialFi } from './useSocialFi';
import { useReadOnlySdk } from '../services/read-only-sdk';
import { CacheManager } from '../services/storage';

/**
 * Hook for managing user profile operations
 */
export function useProfile(ownerPubkey?: PublicKey) {
  const { createProfile, publicKey } = useSocialFi();
  const readSdk = useReadOnlySdk();
  const queryClient = useQueryClient();
  const targetPubkey = ownerPubkey || publicKey;

  const {
    data: profile,
    isPending,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['profile', targetPubkey?.toBase58()],
    queryFn: async () => {
      if (!readSdk || !targetPubkey) return null;
      try {
        const result = await readSdk.getUserProfile(targetPubkey);
        if (result) {
          await CacheManager.setCachedMetadata(`profile:${targetPubkey.toBase58()}`, result);
        }
        return result;
      } catch (err) {
        console.error('Error fetching profile:', err);
        const cached = await CacheManager.getCachedMetadata(`profile:${targetPubkey.toBase58()}`);
        if (cached) {
          console.log('📱 Using cached profile (error fallback)');
          return cached as Awaited<ReturnType<typeof readSdk.getUserProfile>>;
        }
        throw err;
      }
    },
    enabled: !!readSdk && !!targetPubkey,
    staleTime: 30000,
  });

  const createProfileMutation = useMutation({
    mutationFn: async ({ username }: { username: string }) => {
      return await createProfile(username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', publicKey?.toBase58()] });
    },
  });

  const hasProfile = useCallback(() => {
    return !!profile;
  }, [profile]);

  const isOwnProfile = useCallback(() => {
    return publicKey && targetPubkey && publicKey.equals(targetPubkey);
  }, [publicKey, targetPubkey]);

  return {
    profile,
    isLoading: isPending || isLoading,
    isPending,
    error,
    refetch,
    hasProfile: hasProfile(),
    isOwnProfile: isOwnProfile(),
    createProfile: createProfileMutation.mutateAsync,
    isCreating: createProfileMutation.isPending,
  };
}
