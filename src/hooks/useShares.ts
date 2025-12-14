import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useSocialFi } from './useSocialFi';

/**
 * Hook for managing creator shares operations
 */
export function useShares(creatorPubkey?: PublicKey) {
  const { getCreatorShares, buyShares, sellShares, calculateSharePrice, publicKey } = useSocialFi();
  const queryClient = useQueryClient();

  // Fetch shares data
  const {
    data: shares,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['shares', creatorPubkey?.toBase58()],
    queryFn: async () => {
      if (!creatorPubkey) return null;
      return await getCreatorShares(creatorPubkey);
    },
    enabled: !!creatorPubkey,
    staleTime: 10000, // 10 seconds
  });

  // Calculate price query
  const {
    data: estimatedPrice,
    isLoading: isPriceLoading,
    refetch: refetchPrice,
  } = useQuery({
    queryKey: ['sharePrice', creatorPubkey?.toBase58(), 1],
    queryFn: async () => {
      if (!creatorPubkey) return 0;
      return await calculateSharePrice(creatorPubkey, 1);
    },
    enabled: !!creatorPubkey,
    staleTime: 5000, // 5 seconds
  });

  // Buy shares mutation
  const buySharesMutation = useMutation({
    mutationFn: async ({ amount, maxPrice }: { amount: number; maxPrice: number }) => {
      if (!creatorPubkey) throw new Error('Creator pubkey not set');
      return await buyShares(creatorPubkey, amount, maxPrice);
    },
    onSuccess: () => {
      // Invalidate shares query
      queryClient.invalidateQueries({ queryKey: ['shares', creatorPubkey?.toBase58()] });
      queryClient.invalidateQueries({ queryKey: ['sharePrice'] });
    },
  });

  // Sell shares mutation
  const sellSharesMutation = useMutation({
    mutationFn: async ({ amount, minPrice }: { amount: number; minPrice: number }) => {
      if (!creatorPubkey) throw new Error('Creator pubkey not set');
      return await sellShares(creatorPubkey, amount, minPrice);
    },
    onSuccess: () => {
      // Invalidate shares query
      queryClient.invalidateQueries({ queryKey: ['shares', creatorPubkey?.toBase58()] });
      queryClient.invalidateQueries({ queryKey: ['sharePrice'] });
    },
  });

  // Calculate price for specific amount
  const calculatePriceForAmount = useCallback(
    async (amount: number) => {
      if (!creatorPubkey) return 0;
      return await calculateSharePrice(creatorPubkey, amount);
    },
    [creatorPubkey, calculateSharePrice]
  );

  // Get user's balance for this creator
  const getUserBalance = useCallback(() => {
    // TODO: Need to fetch shareHolding account for user
    // CreatorPool doesn't have holders array, need separate query
    return 0;
  }, [shares, publicKey]);

  return {
    // Shares data
    shares,
    isLoading,
    error,
    refetch,

    // Price data
    estimatedPrice: estimatedPrice ? estimatedPrice / 1e9 : 0, // Convert to SOL
    isPriceLoading,
    refetchPrice,

    // User balance
    userBalance: getUserBalance(),

    // Operations
    buyShares: buySharesMutation.mutateAsync,
    sellShares: sellSharesMutation.mutateAsync,
    isBuying: buySharesMutation.isPending,
    isSelling: sellSharesMutation.isPending,

    // Utilities
    calculatePriceForAmount,
  };
}
