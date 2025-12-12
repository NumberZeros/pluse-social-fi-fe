import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CreatorShare {
  creatorAddress: string;
  creatorUsername: string;
  supply: number;
  holders: number;
  price: number; // Current price in SOL
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
}

export interface ShareHolding {
  id: string;
  holder: string;
  creatorAddress: string;
  creatorUsername: string;
  amount: number;
  purchasePrice: number;
  purchasedAt: number;
}

export interface ShareTransaction {
  id: string;
  buyer: string;
  seller: string | null; // null for initial mint
  creatorAddress: string;
  amount: number;
  price: number;
  total: number;
  timestamp: number;
  type: 'buy' | 'sell';
}

interface SharesStore {
  creatorShares: Map<string, CreatorShare>;
  holdings: ShareHolding[];
  transactions: ShareTransaction[];
  myHoldings: Set<string>;

  // Actions
  initializeCreator: (creatorAddress: string, creatorUsername: string) => void;
  buyShares: (
    buyer: string,
    creatorAddress: string,
    creatorUsername: string,
    amount: number,
  ) => void;
  sellShares: (seller: string, creatorAddress: string, amount: number) => void;

  // Queries
  getCreatorPrice: (creatorAddress: string) => number;
  getBuyPrice: (creatorAddress: string, amount: number) => number;
  getSellPrice: (creatorAddress: string, amount: number) => number;
  getMyHoldings: (wallet: string) => ShareHolding[];
  getPortfolioValue: (wallet: string) => number;
  getCreatorHolders: (creatorAddress: string) => number;
}

// Bonding curve formula: price = basePrice * (supply/100)^2
const calculatePrice = (supply: number, basePrice: number = 0.001): number => {
  return basePrice * Math.pow(1 + supply / 100, 2);
};

const calculateBuyPrice = (supply: number, amount: number): number => {
  let total = 0;
  for (let i = 0; i < amount; i++) {
    total += calculatePrice(supply + i);
  }
  return total;
};

const calculateSellPrice = (supply: number, amount: number): number => {
  let total = 0;
  for (let i = 0; i < amount; i++) {
    total += calculatePrice(supply - i - 1);
  }
  return total * 0.9; // 10% fee
};

export const useSharesStore = create<SharesStore>()(
  persist(
    (set, get) => ({
      creatorShares: new Map(),
      holdings: [],
      transactions: [],
      myHoldings: new Set(),

      initializeCreator: (creatorAddress, creatorUsername) => {
        const existing = get().creatorShares.get(creatorAddress);
        if (existing) return;

        const newShare: CreatorShare = {
          creatorAddress,
          creatorUsername,
          supply: 0,
          holders: 0,
          price: calculatePrice(0),
          marketCap: 0,
          volume24h: 0,
          priceChange24h: 0,
        };

        set((state) => {
          const newMap = new Map(state.creatorShares);
          newMap.set(creatorAddress, newShare);
          return { creatorShares: newMap };
        });
      },

      buyShares: (buyer, creatorAddress, creatorUsername, amount) => {
        const creator = get().creatorShares.get(creatorAddress);

        if (!creator) {
          get().initializeCreator(creatorAddress, creatorUsername);
        }

        const currentCreator = get().creatorShares.get(creatorAddress)!;
        const price = calculateBuyPrice(currentCreator.supply, amount);
        const newSupply = currentCreator.supply + amount;
        const newPrice = calculatePrice(newSupply);

        // Update creator data
        const updatedCreator: CreatorShare = {
          ...currentCreator,
          supply: newSupply,
          holders: currentCreator.holders + 1,
          price: newPrice,
          marketCap: newPrice * newSupply,
          volume24h: currentCreator.volume24h + price,
          priceChange24h:
            ((newPrice - currentCreator.price) / currentCreator.price) * 100,
        };

        // Create holding
        const holding: ShareHolding = {
          id: `holding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          holder: buyer,
          creatorAddress,
          creatorUsername,
          amount,
          purchasePrice: price / amount,
          purchasedAt: Date.now(),
        };

        // Create transaction
        const transaction: ShareTransaction = {
          id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          buyer,
          seller: null,
          creatorAddress,
          amount,
          price: price / amount,
          total: price,
          timestamp: Date.now(),
          type: 'buy',
        };

        set((state) => {
          const newMap = new Map(state.creatorShares);
          newMap.set(creatorAddress, updatedCreator);

          return {
            creatorShares: newMap,
            holdings: [...state.holdings, holding],
            transactions: [...state.transactions, transaction],
            myHoldings: new Set([...state.myHoldings, holding.id]),
          };
        });
      },

      sellShares: (seller, creatorAddress, amount) => {
        const creator = get().creatorShares.get(creatorAddress);
        if (!creator) return;

        const holding = get().holdings.find(
          (h) =>
            h.holder === seller &&
            h.creatorAddress === creatorAddress &&
            h.amount >= amount,
        );
        if (!holding) return;

        const price = calculateSellPrice(creator.supply, amount);
        const newSupply = creator.supply - amount;
        const newPrice = calculatePrice(newSupply);

        // Update creator data
        const updatedCreator: CreatorShare = {
          ...creator,
          supply: newSupply,
          price: newPrice,
          marketCap: newPrice * newSupply,
          volume24h: creator.volume24h + price,
          priceChange24h: ((newPrice - creator.price) / creator.price) * 100,
        };

        // Update holding
        const updatedHolding = {
          ...holding,
          amount: holding.amount - amount,
        };

        // Create transaction
        const transaction: ShareTransaction = {
          id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          buyer: creatorAddress, // Creator buys back
          seller,
          creatorAddress,
          amount,
          price: price / amount,
          total: price,
          timestamp: Date.now(),
          type: 'sell',
        };

        set((state) => {
          const newMap = new Map(state.creatorShares);
          newMap.set(creatorAddress, updatedCreator);

          const newHoldings = state.holdings
            .map((h) => (h.id === holding.id ? updatedHolding : h))
            .filter((h) => h.amount > 0);

          return {
            creatorShares: newMap,
            holdings: newHoldings,
            transactions: [...state.transactions, transaction],
          };
        });
      },

      getCreatorPrice: (creatorAddress) => {
        const creator = get().creatorShares.get(creatorAddress);
        return creator?.price || calculatePrice(0);
      },

      getBuyPrice: (creatorAddress, amount) => {
        const creator = get().creatorShares.get(creatorAddress);
        const supply = creator?.supply || 0;
        return calculateBuyPrice(supply, amount);
      },

      getSellPrice: (creatorAddress, amount) => {
        const creator = get().creatorShares.get(creatorAddress);
        if (!creator) return 0;
        return calculateSellPrice(creator.supply, amount);
      },

      getMyHoldings: (wallet) => {
        return get().holdings.filter((h) => h.holder === wallet);
      },

      getPortfolioValue: (wallet) => {
        const holdings = get().getMyHoldings(wallet);
        return holdings.reduce((total, holding) => {
          const currentPrice = get().getCreatorPrice(holding.creatorAddress);
          return total + holding.amount * currentPrice;
        }, 0);
      },

      getCreatorHolders: (creatorAddress) => {
        const creator = get().creatorShares.get(creatorAddress);
        return creator?.holders || 0;
      },
    }),
    {
      name: 'pulse-shares-storage',
      partialize: (state) => ({
        creatorShares: Array.from(state.creatorShares.entries()),
        holdings: state.holdings,
        transactions: state.transactions,
        myHoldings: Array.from(state.myHoldings),
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        creatorShares: new Map(persistedState.creatorShares || []),
        myHoldings: new Set(persistedState.myHoldings || []),
      }),
    },
  ),
);
