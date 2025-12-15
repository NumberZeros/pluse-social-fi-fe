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
  useSocialFi();
  const queryClient = useQueryClient();

  // Mint username mutation
  const mintUsernameMutation = useMutation({
    mutationFn: async (username: string) => {
      // TODO: Implement actual SDK call
      console.log('Minting username:', username);
      return { success: true };
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
      // TODO: Implement actual SDK call
      console.log('Listing username:', nftPubkey.toBase58(), priceInSol);
      return { success: true };
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
      // TODO: Implement actual SDK call
      console.log('Buying username:', nftPubkey.toBase58(), 'from listing:', listingPubkey.toBase58(), 'seller:', sellerPubkey.toBase58());
      return { success: true };
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

  // Make offer mutation
  const makeOfferMutation = useMutation({
    mutationFn: async ({
      usernameNftPubkey: _usernameNftPubkey,
      listingPubkey: _listingPubkey,
      offerAmountInSol,
    }: {
      usernameNftPubkey: PublicKey;
      listingPubkey: PublicKey;
      offerAmountInSol: number;
    }) => {
      // TODO: Implement actual SDK call
      console.log('Making offer:', offerAmountInSol);
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Offer submitted!');
      queryClient.invalidateQueries({ queryKey: ['listing_offers'] });
    },
    onError: (error: any) => {
      console.error('Make offer error:', error);
      toast.error(error.message || 'Failed to make offer');
    },
  });

  // Accept offer mutation (seller only)
  const acceptOfferMutation = useMutation({
    mutationFn: async ({
      usernameNftPubkey: _usernameNftPubkey,
      listingPubkey: _listingPubkey,
      buyerPubkey,
    }: {
      usernameNftPubkey: PublicKey;
      listingPubkey: PublicKey;
      buyerPubkey: PublicKey;
    }) => {
      // TODO: Implement actual SDK call
      console.log('Accepting offer from:', buyerPubkey.toBase58());
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Offer accepted!');
      queryClient.invalidateQueries({ queryKey: ['marketplace_listings'] });
      queryClient.invalidateQueries({ queryKey: ['user_nfts'] });
      queryClient.invalidateQueries({ queryKey: ['listing_offers'] });
    },
    onError: (error: any) => {
      console.error('Accept offer error:', error);
      toast.error(error.message || 'Failed to accept offer');
    },
  });

  // Cancel offer mutation (buyer only)
  const cancelOfferMutation = useMutation({
    mutationFn: async ({
      listingPubkey,
    }: {
      listingPubkey: PublicKey;
    }) => {
      // TODO: Implement actual SDK call
      console.log('Cancelling offer for listing:', listingPubkey.toBase58());
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Offer cancelled and funds returned!');
      queryClient.invalidateQueries({ queryKey: ['listing_offers'] });
      queryClient.invalidateQueries({ queryKey: ['my_offers'] });
    },
    onError: (error: any) => {
      console.error('Cancel offer error:', error);
      toast.error(error.message || 'Failed to cancel offer');
    },
  });

  return {
    mintUsername: mintUsernameMutation.mutateAsync,
    isMinting: mintUsernameMutation.isPending,
    listUsername: listUsernameMutation.mutateAsync,
    isListing: listUsernameMutation.isPending,
    buyUsername: buyUsernameMutation.mutateAsync,
    isBuying: buyUsernameMutation.isPending,
    makeOffer: makeOfferMutation.mutateAsync,
    isMakingOffer: makeOfferMutation.isPending,
    acceptOffer: acceptOfferMutation.mutateAsync,
    isAcceptingOffer: acceptOfferMutation.isPending,
    cancelOffer: cancelOfferMutation.mutateAsync,
    isCancellingOffer: cancelOfferMutation.isPending,
  };
};

// Exported hooks for component usage
export const useMintUsername = () => {
  const { sdk } = useSocialFi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ username, metadataUri }: { username: string; metadataUri: string }) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.mintUsername(username, metadataUri);
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
    mutationFn: async ({ nftPubkey, mintPubkey, priceInSol }: { nftPubkey: PublicKey; mintPubkey: PublicKey; priceInSol: number }) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.listUsername(nftPubkey, mintPubkey, priceInSol);
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
      mintPubkey,
      sellerPubkey,
    }: {
      listingPubkey: PublicKey;
      nftPubkey: PublicKey;
      mintPubkey: PublicKey;
      sellerPubkey: PublicKey;
    }) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.buyUsername(listingPubkey, nftPubkey, mintPubkey, sellerPubkey);
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

export const useMakeOffer = () => {
  const { sdk } = useSocialFi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      usernameNftPubkey,
      listingPubkey,
      offerAmountInSol,
    }: {
      usernameNftPubkey: PublicKey;
      listingPubkey: PublicKey;
      offerAmountInSol: number;
    }) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.makeOffer(usernameNftPubkey, listingPubkey, offerAmountInSol * 1e9);
    },
    onSuccess: () => {
      toast.success('Offer submitted!');
      queryClient.invalidateQueries({ queryKey: ['listing_offers'] });
    },
    onError: (error: any) => {
      console.error('Make offer error:', error);
      toast.error(error.message || 'Failed to make offer');
    },
  });
};

export const useAcceptOffer = () => {
  const { sdk } = useSocialFi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      usernameNftPubkey,
      listingPubkey,
      mintPubkey,
      buyerPubkey,
    }: {
      usernameNftPubkey: PublicKey;
      listingPubkey: PublicKey;
      mintPubkey: PublicKey;
      buyerPubkey: PublicKey;
    }) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.acceptOffer(usernameNftPubkey, listingPubkey, mintPubkey, buyerPubkey);
    },
    onSuccess: () => {
      toast.success('Offer accepted!');
      queryClient.invalidateQueries({ queryKey: ['marketplace_listings'] });
      queryClient.invalidateQueries({ queryKey: ['user_nfts'] });
      queryClient.invalidateQueries({ queryKey: ['listing_offers'] });
    },
    onError: (error: any) => {
      console.error('Accept offer error:', error);
      toast.error(error.message || 'Failed to accept offer');
    },
  });
};
