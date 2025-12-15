import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useSocialFi } from './useSocialFi';
import { toast } from 'react-hot-toast';

export interface ListingData {
  id: string;
  nftPubkey: PublicKey;
  sellerAddress: string;
  username: string;
  price: number;
  createdAt: number;
  expiresAt?: number;
}

export const useMarketplace = (_sellerPubkey?: PublicKey) => {
  const { sdk } = useSocialFi();
  const queryClient = useQueryClient();

  // Mint username mutation
  const mintUsernameMutation = useMutation({
    mutationFn: async (username: string) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.mintUsername(username);
    },
    onSuccess: () => {
      toast.success('Username NFT minted!');
      queryClient.invalidateQueries({ queryKey: ['user_nfts'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to mint username NFT');
    },
  });

  // List username mutation
  const listUsernameMutation = useMutation({
    mutationFn: async ({ nftPubkey, priceInSol }: { nftPubkey: PublicKey; priceInSol: number }) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.listUsername(nftPubkey, priceInSol);
    },
    onSuccess: () => {
      toast.success('Username listed for sale!');
      queryClient.invalidateQueries({ queryKey: ['marketplace_listings'] });
      queryClient.invalidateQueries({ queryKey: ['user_listings'] });
    },
    onError: (error: any) => {
      console.error('List error:', error);
      toast.error(error.message || 'Failed to list username');
    },
  });

  // Buy username mutation
  const buyUsernameMutation = useMutation({
    mutationFn: async ({
      listingPubkey,
      nftPubkey,
      sellerPubkey,
    }: {
      listingPubkey: PublicKey;
      nftPubkey: PublicKey;
      sellerPubkey: PublicKey;
    }) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.buyUsername(listingPubkey, nftPubkey, sellerPubkey);
    },
    onSuccess: () => {
      toast.success('Username purchased!');
      queryClient.invalidateQueries({ queryKey: ['marketplace_listings'] });
      queryClient.invalidateQueries({ queryKey: ['user_nfts'] });
    },
    onError: (error: any) => {
      console.error('Buy error:', error);
      toast.error(error.message || 'Failed to purchase username');
    },
  });

  return {
    mintUsername: mintUsernameMutation.mutateAsync,
    isMinting: mintUsernameMutation.isPending,
    listUsername: listUsernameMutation.mutateAsync,
    isListing: listUsernameMutation.isPending,
    buyUsername: buyUsernameMutation.mutateAsync,
    isBuying: buyUsernameMutation.isPending,
  };
};

// Exported hooks for component usage
export const useMintUsername = () => {
  const { sdk } = useSocialFi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.mintUsername(username);
    },
    onSuccess: () => {
      toast.success('Username NFT minted!');
      queryClient.invalidateQueries({ queryKey: ['user_nfts'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to mint username NFT');
    },
  });
};

export const useListUsername = () => {
  const { sdk } = useSocialFi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nftPubkey, priceInSol }: { nftPubkey: PublicKey; priceInSol: number }) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.listUsername(nftPubkey, priceInSol);
    },
    onSuccess: () => {
      toast.success('Username listed for sale!');
      queryClient.invalidateQueries({ queryKey: ['marketplace_listings'] });
      queryClient.invalidateQueries({ queryKey: ['user_listings'] });
    },
    onError: (error: any) => {
      console.error('List error:', error);
      toast.error(error.message || 'Failed to list username');
    },
  });
};

export const useBuyUsername = () => {
  const { sdk } = useSocialFi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listingPubkey,
      nftPubkey,
      sellerPubkey,
    }: {
      listingPubkey: PublicKey;
      nftPubkey: PublicKey;
      sellerPubkey: PublicKey;
    }) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.buyUsername(listingPubkey, nftPubkey, sellerPubkey);
    },
    onSuccess: () => {
      toast.success('Username purchased!');
      queryClient.invalidateQueries({ queryKey: ['marketplace_listings'] });
      queryClient.invalidateQueries({ queryKey: ['user_nfts'] });
    },
    onError: (error: any) => {
      console.error('Buy error:', error);
      toast.error(error.message || 'Failed to purchase username');
    },
  });
};
