import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useSocialFi } from './useSocialFi';
import { toast } from 'react-hot-toast';
import { PDAs } from '../services/pda';

export interface ListingData {
  id: string;
  nftPubkey: PublicKey;
  sellerAddress: string;
  username: string;
  price: number;
  createdAt: number;
  expiresAt?: number;
}



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

export const useCancelListing = () => {
  const { sdk } = useSocialFi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingPubkey: PublicKey) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.cancelListing(listingPubkey);
    },
    onSuccess: () => {
      toast.success('Listing cancelled!');
      queryClient.invalidateQueries({ queryKey: ['marketplace_listings'] });
      queryClient.invalidateQueries({ queryKey: ['user_listings'] });
    },
    onError: (error: any) => {
      console.error('Cancel listing error:', error);
      toast.error(error.message || 'Failed to cancel listing');
    },
  });
};

export const useListings = () => {
  const { sdk } = useSocialFi();

  return useQuery({
    queryKey: ['marketplace_listings'],
    queryFn: async () => {
      if (!sdk) return [];
      try {
        // Fetch all listing accounts
        const listings = await sdk.program.account.listing.all();
        
        // Transform to simpler format
        return listings.map(l => ({
          id: l.publicKey.toBase58(),
          nftPubkey: PDAs.getUsernameNFT(l.account.username)[0],
          sellerAddress: l.account.seller.toBase58(),
          username: l.account.username,
          // @ts-ignore
          price: l.account.price.toNumber() / 1e9,
          // @ts-ignore
          createdAt: l.account.listedAt.toNumber() * 1000,
          // Map u8 category to string
          category: ['premium', 'short', 'rare', 'custom'][l.account.category] || 'custom',
        }));
      } catch (e) {
        console.error("Failed to fetch listings:", e);
        return [];
      }
    },
    enabled: !!sdk,
  });
};
