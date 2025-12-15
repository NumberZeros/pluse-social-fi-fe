import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UsernameListing {
  id: string;
  username: string;
  seller: string;
  price: number; // in SOL
  category: 'premium' | 'short' | 'rare' | 'custom';
  listed_at: number;
  expires_at?: number;
  verified: boolean;
}

export interface UsernameOffer {
  id: string;
  listingId: string;
  username: string;
  buyer: string;
  amount: number; // in SOL
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  created_at: number;
  expires_at: number;
}

export interface UsernameAuction {
  id: string;
  username: string;
  seller: string;
  startPrice: number;
  currentBid: number;
  highestBidder: string | null;
  startTime: number;
  endTime: number;
  status: 'active' | 'ended' | 'cancelled';
  bidCount: number;
}

interface MarketplaceStore {
  listings: UsernameListing[];
  offers: UsernameOffer[];
  auctions: UsernameAuction[];
  myListings: Set<string>;
  myOffers: Set<string>;
  myBids: Set<string>;

  // Listings
  createListing: (
    username: string,
    price: number,
    seller: string,
    category: UsernameListing['category'],
  ) => void;
  removeListing: (listingId: string) => void;
  updateListingPrice: (listingId: string, newPrice: number) => void;
  purchaseListing: (listingId: string, buyer: string) => void;

  // Offers
  makeOffer: (listingId: string, username: string, buyer: string, amount: number) => void;
  acceptOffer: (offerId: string) => void;
  rejectOffer: (offerId: string) => void;
  cancelOffer: (offerId: string) => void;

  // Auctions
  createAuction: (
    username: string,
    startPrice: number,
    seller: string,
    duration: number,
  ) => void;
  placeBid: (auctionId: string, bidder: string, amount: number) => void;
  endAuction: (auctionId: string) => void;

  // Queries
  getListingsByCategory: (category: string) => UsernameListing[];
  getListingsByPriceRange: (min: number, max: number) => UsernameListing[];
  getMyListings: (wallet: string) => UsernameListing[];
  getMyOffers: (wallet: string) => UsernameOffer[];
  getMyBids: (wallet: string) => UsernameAuction[];
}

export const useMarketplaceStore = create<MarketplaceStore>()(
  persist(
    (set, get) => ({
      listings: [],
      offers: [],
      auctions: [],
      myListings: new Set<string>(),
      myOffers: new Set<string>(),
      myBids: new Set<string>(),

      // Listings
      createListing: (username, price, seller, category) => {
        const listing: UsernameListing = {
          id: `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          username,
          seller,
          price,
          category,
          listed_at: Date.now(),
          verified: false,
        };

        set((state) => ({
          listings: [...state.listings, listing],
          myListings: new Set([...state.myListings, listing.id]),
        }));
      },

      removeListing: (listingId) => {
        set((state) => {
          const newMyListings = new Set(state.myListings);
          newMyListings.delete(listingId);

          return {
            listings: state.listings.filter((l) => l.id !== listingId),
            myListings: newMyListings,
          };
        });
      },

      updateListingPrice: (listingId, newPrice) => {
        set((state) => ({
          listings: state.listings.map((l) =>
            l.id === listingId ? { ...l, price: newPrice } : l,
          ),
        }));
      },

      purchaseListing: (listingId, _buyer) => {
        const listing = get().listings.find((l) => l.id === listingId);
        if (!listing) return;

        // In real app: transfer username NFT and SOL
        set((state) => ({
          listings: state.listings.filter((l) => l.id !== listingId),
        }));
      },

      // Offers
      makeOffer: (listingId, username, buyer, amount) => {
        const offer: UsernameOffer = {
          id: `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          listingId,
          username,
          buyer,
          amount,
          status: 'pending',
          created_at: Date.now(),
          expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        };

        set((state) => ({
          offers: [...state.offers, offer],
          myOffers: new Set([...state.myOffers, offer.id]),
        }));
      },

      acceptOffer: (offerId) => {
        const offer = get().offers.find((o) => o.id === offerId);
        if (!offer) return;

        // In real app: execute transfer
        set((state) => ({
          offers: state.offers.map((o) =>
            o.id === offerId ? { ...o, status: 'accepted' as const } : o,
          ),
          listings: state.listings.filter((l) => l.id !== offer.listingId),
        }));
      },

      rejectOffer: (offerId) => {
        set((state) => ({
          offers: state.offers.map((o) =>
            o.id === offerId ? { ...o, status: 'rejected' as const } : o,
          ),
        }));
      },

      cancelOffer: (offerId) => {
        set((state) => {
          const newMyOffers = new Set(state.myOffers);
          newMyOffers.delete(offerId);

          return {
            offers: state.offers.filter((o) => o.id !== offerId),
            myOffers: newMyOffers,
          };
        });
      },

      // Auctions
      createAuction: (username, startPrice, seller, duration) => {
        const auction: UsernameAuction = {
          id: `auction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          username,
          seller,
          startPrice,
          currentBid: startPrice,
          highestBidder: null,
          startTime: Date.now(),
          endTime: Date.now() + duration,
          status: 'active',
          bidCount: 0,
        };

        set((state) => ({
          auctions: [...state.auctions, auction],
        }));
      },

      placeBid: (auctionId, bidder, amount) => {
        set((state) => {
          const auction = state.auctions.find((a) => a.id === auctionId);
          if (!auction || auction.status !== 'active') return state;
          if (amount <= auction.currentBid) return state;

          const newMyBids = new Set(state.myBids);
          newMyBids.add(auctionId);

          return {
            auctions: state.auctions.map((a) =>
              a.id === auctionId
                ? {
                    ...a,
                    currentBid: amount,
                    highestBidder: bidder,
                    bidCount: a.bidCount + 1,
                  }
                : a,
            ),
            myBids: newMyBids,
          };
        });
      },

      endAuction: (auctionId) => {
        set((state) => ({
          auctions: state.auctions.map((a) =>
            a.id === auctionId ? { ...a, status: 'ended' as const } : a,
          ),
        }));
      },

      // Queries
      getListingsByCategory: (category) => {
        return get().listings.filter((l) => l.category === category);
      },

      getListingsByPriceRange: (min, max) => {
        return get().listings.filter((l) => l.price >= min && l.price <= max);
      },

      getMyListings: (wallet) => {
        return get().listings.filter((l) => l.seller === wallet);
      },

      getMyOffers: (wallet) => {
        return get().offers.filter((o) => o.buyer === wallet);
      },

      getMyBids: (wallet) => {
        return get().auctions.filter((a) => a.highestBidder === wallet);
      },
    }),
    {
      name: 'pulse-marketplace-storage',
      partialize: (state) => ({
        listings: state.listings,
        offers: state.offers,
        auctions: state.auctions,
        myListings: Array.from(state.myListings),
        myOffers: Array.from(state.myOffers),
        myBids: Array.from(state.myBids),
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        myListings: new Set(persistedState.myListings || []),
        myOffers: new Set(persistedState.myOffers || []),
        myBids: new Set(persistedState.myBids || []),
      }),
    },
  ),
);
