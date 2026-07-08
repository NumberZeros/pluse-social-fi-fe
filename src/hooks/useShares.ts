import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useSocialFi } from './useSocialFi';
import { useReadOnlySdk } from '../services/read-only-sdk';
import { trackEvent } from '../lib/analytics';

export const useAllCreatorPools = () => {
  const readSdk = useReadOnlySdk();

  return useQuery({
    queryKey: ['all_creator_pools'],
    queryFn: async () => {
      if (!readSdk) return [];
      return readSdk.getAllCreatorPools();
    },
    enabled: !!readSdk,
    staleTime: 1000 * 60 * 2,
  });
};

export const useUserShareHoldings = (holderPubkey?: PublicKey) => {
  const readSdk = useReadOnlySdk();

  return useQuery({
    queryKey: ['user_share_holdings', holderPubkey?.toBase58()],
    queryFn: async () => {
      if (!readSdk || !holderPubkey) return [];
      return readSdk.getUserShareHoldings(holderPubkey);
    },
    enabled: !!readSdk && !!holderPubkey,
    staleTime: 1000 * 60 * 2,
  });
};

/**
 * Hook for Supporter Shares pool operations (buy, sell, price)
 */
export function useShares(creatorPubkey?: PublicKey) {
  const { buyShares, sellShares, publicKey } = useSocialFi();
  const readSdk = useReadOnlySdk();
  const queryClient = useQueryClient();

  const { data: userHoldings = [] } = useUserShareHoldings(publicKey || undefined);

  const userBalance =
    creatorPubkey && userHoldings.length > 0
      ? userHoldings.find((h) => h.creator === creatorPubkey.toBase58())?.amount ?? 0
      : 0;

  const {
    data: shares,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['shares', creatorPubkey?.toBase58()],
    queryFn: async () => {
      if (!readSdk || !creatorPubkey) return null;
      return await readSdk.getCreatorShares(creatorPubkey);
    },
    enabled: !!readSdk && !!creatorPubkey,
    staleTime: 10000,
  });

  const {
    data: estimatedPrice,
    isLoading: isPriceLoading,
    refetch: refetchPrice,
  } = useQuery({
    queryKey: ['sharePrice', creatorPubkey?.toBase58(), 1],
    queryFn: async () => {
      if (!readSdk || !creatorPubkey) return 0;
      return await readSdk.calculateSharePrice(creatorPubkey, 1);
    },
    enabled: !!readSdk && !!creatorPubkey,
    staleTime: 5000,
  });

  const buySharesMutation = useMutation({
    mutationFn: async ({ amount, maxPrice }: { amount: number; maxPrice: number }) => {
      if (!creatorPubkey) throw new Error('Creator pubkey not set');
      return await buyShares(creatorPubkey, amount, maxPrice);
    },
    onSuccess: (_data, { amount }) => {
      trackEvent('buy_shares', {
        creator: creatorPubkey?.toBase58(),
        amount,
      });
      queryClient.invalidateQueries({ queryKey: ['shares', creatorPubkey?.toBase58()] });
      queryClient.invalidateQueries({ queryKey: ['sharePrice'] });
      queryClient.invalidateQueries({ queryKey: ['user_share_holdings'] });
      queryClient.invalidateQueries({ queryKey: ['all_creator_pools'] });
      queryClient.invalidateQueries({ queryKey: ['supporter_access'] });
    },
  });

  const sellSharesMutation = useMutation({
    mutationFn: async ({ amount, minPrice }: { amount: number; minPrice: number }) => {
      if (!creatorPubkey) throw new Error('Creator pubkey not set');
      return await sellShares(creatorPubkey, amount, minPrice);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shares', creatorPubkey?.toBase58()] });
      queryClient.invalidateQueries({ queryKey: ['sharePrice'] });
      queryClient.invalidateQueries({ queryKey: ['user_share_holdings'] });
      queryClient.invalidateQueries({ queryKey: ['all_creator_pools'] });
      queryClient.invalidateQueries({ queryKey: ['supporter_access'] });
    },
  });

  const calculatePriceForAmount = useCallback(
    async (amount: number) => {
      if (!readSdk || !creatorPubkey) return 0;
      return await readSdk.calculateSharePrice(creatorPubkey, amount);
    },
    [readSdk, creatorPubkey],
  );

  const getUserBalance = useCallback(() => userBalance, [userBalance]);

  return {
    shares,
    isLoading,
    error,
    refetch,
    estimatedPrice: estimatedPrice ?? 0,
    isPriceLoading,
    refetchPrice,
    userBalance: getUserBalance(),
    buyShares: buySharesMutation.mutateAsync,
    sellShares: sellSharesMutation.mutateAsync,
    isBuying: buySharesMutation.isPending,
    isSelling: sellSharesMutation.isPending,
    calculatePriceForAmount,
  };
}
