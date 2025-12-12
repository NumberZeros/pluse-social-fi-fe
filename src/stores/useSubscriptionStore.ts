import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SubscriptionTier {
  id: string;
  creatorAddress: string;
  name: string;
  description: string;
  price: number; // in SOL
  priceUSD: number;
  benefits: string[];
  subscriberCount: number;
  createdAt: string;
}

export interface Subscription {
  id: string;
  subscriberId: string;
  creatorAddress: string;
  tierId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  transactionSignature?: string;
  autoRenew: boolean;
}

interface SubscriptionStore {
  // State
  tiers: SubscriptionTier[];
  subscriptions: Subscription[];
  mySubscriptions: Set<string>; // Set of creator addresses I subscribe to
  mySubscribers: Set<string>; // Set of subscriber addresses (for creators)

  // Tier Management
  createTier: (
    tier: Omit<SubscriptionTier, 'id' | 'subscriberCount' | 'createdAt'>,
  ) => string;
  updateTier: (tierId: string, updates: Partial<SubscriptionTier>) => void;
  deleteTier: (tierId: string) => void;
  getTiersByCreator: (creatorAddress: string) => SubscriptionTier[];
  getTierById: (tierId: string) => SubscriptionTier | undefined;

  // Subscription Management
  subscribe: (
    subscription: Omit<Subscription, 'id' | 'startDate' | 'endDate' | 'status'>,
  ) => string;
  unsubscribe: (subscriptionId: string) => void;
  cancelSubscription: (subscriptionId: string) => void;
  renewSubscription: (subscriptionId: string) => void;
  toggleAutoRenew: (subscriptionId: string) => void;

  // Query Functions
  getActiveSubscription: (
    subscriberId: string,
    creatorAddress: string,
  ) => Subscription | undefined;
  getMyActiveSubscriptions: () => Subscription[];
  getSubscribersByCreator: (creatorAddress: string) => Subscription[];
  isSubscribedTo: (creatorAddress: string) => boolean;
  hasActiveSubscription: (subscriberId: string, creatorAddress: string) => boolean;

  // Stats
  getTotalRevenue: (creatorAddress: string) => number;
  getMonthlyRevenue: (creatorAddress: string) => number;

  // Utilities
  checkExpiredSubscriptions: () => void;
}

const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set, get) => ({
      // Initial State
      tiers: [],
      subscriptions: [],
      mySubscriptions: new Set<string>(),
      mySubscribers: new Set<string>(),

      // Tier Management
      createTier: (tierData) => {
        const newTier: SubscriptionTier = {
          ...tierData,
          id: `tier-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          subscriberCount: 0,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          tiers: [...state.tiers, newTier],
        }));

        return newTier.id;
      },

      updateTier: (tierId, updates) => {
        set((state) => ({
          tiers: state.tiers.map((tier) =>
            tier.id === tierId ? { ...tier, ...updates } : tier,
          ),
        }));
      },

      deleteTier: (tierId) => {
        set((state) => ({
          tiers: state.tiers.filter((tier) => tier.id !== tierId),
        }));
      },

      getTiersByCreator: (creatorAddress) => {
        return get().tiers.filter((tier) => tier.creatorAddress === creatorAddress);
      },

      getTierById: (tierId) => {
        return get().tiers.find((tier) => tier.id === tierId);
      },

      // Subscription Management
      subscribe: (subscriptionData) => {
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

        const newSubscription: Subscription = {
          ...subscriptionData,
          id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          status: 'active',
          autoRenew: true,
        };

        set((state) => {
          const updatedTiers = state.tiers.map((tier) =>
            tier.id === subscriptionData.tierId
              ? { ...tier, subscriberCount: tier.subscriberCount + 1 }
              : tier,
          );

          const newMySubscriptions = new Set(state.mySubscriptions);
          newMySubscriptions.add(subscriptionData.creatorAddress);

          return {
            subscriptions: [...state.subscriptions, newSubscription],
            tiers: updatedTiers,
            mySubscriptions: newMySubscriptions,
          };
        });

        return newSubscription.id;
      },

      unsubscribe: (subscriptionId) => {
        const subscription = get().subscriptions.find((sub) => sub.id === subscriptionId);
        if (!subscription) return;

        set((state) => {
          const updatedTiers = state.tiers.map((tier) =>
            tier.id === subscription.tierId
              ? { ...tier, subscriberCount: Math.max(0, tier.subscriberCount - 1) }
              : tier,
          );

          const newMySubscriptions = new Set(state.mySubscriptions);
          newMySubscriptions.delete(subscription.creatorAddress);

          return {
            subscriptions: state.subscriptions.filter((sub) => sub.id !== subscriptionId),
            tiers: updatedTiers,
            mySubscriptions: newMySubscriptions,
          };
        });
      },

      cancelSubscription: (subscriptionId) => {
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === subscriptionId
              ? { ...sub, status: 'cancelled' as const, autoRenew: false }
              : sub,
          ),
        }));
      },

      renewSubscription: (subscriptionId) => {
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) => {
            if (sub.id === subscriptionId) {
              const newEndDate = new Date(sub.endDate);
              newEndDate.setMonth(newEndDate.getMonth() + 1);
              return {
                ...sub,
                endDate: newEndDate.toISOString(),
                status: 'active' as const,
              };
            }
            return sub;
          }),
        }));
      },

      toggleAutoRenew: (subscriptionId) => {
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === subscriptionId ? { ...sub, autoRenew: !sub.autoRenew } : sub,
          ),
        }));
      },

      // Query Functions
      getActiveSubscription: (subscriberId, creatorAddress) => {
        return get().subscriptions.find(
          (sub) =>
            sub.subscriberId === subscriberId &&
            sub.creatorAddress === creatorAddress &&
            sub.status === 'active' &&
            new Date(sub.endDate) > new Date(),
        );
      },

      getMyActiveSubscriptions: () => {
        const now = new Date();
        return get().subscriptions.filter(
          (sub) => sub.status === 'active' && new Date(sub.endDate) > now,
        );
      },

      getSubscribersByCreator: (creatorAddress) => {
        const now = new Date();
        return get().subscriptions.filter(
          (sub) =>
            sub.creatorAddress === creatorAddress &&
            sub.status === 'active' &&
            new Date(sub.endDate) > now,
        );
      },

      isSubscribedTo: (creatorAddress) => {
        return get().mySubscriptions.has(creatorAddress);
      },

      hasActiveSubscription: (subscriberId, creatorAddress) => {
        const subscription = get().getActiveSubscription(subscriberId, creatorAddress);
        return !!subscription;
      },

      // Stats
      getTotalRevenue: (creatorAddress) => {
        const tiers = get().getTiersByCreator(creatorAddress);
        const subscriptions = get().subscriptions.filter(
          (sub) => sub.creatorAddress === creatorAddress,
        );

        return subscriptions.reduce((total, sub) => {
          const tier = tiers.find((t) => t.id === sub.tierId);
          return total + (tier?.price || 0);
        }, 0);
      },

      getMonthlyRevenue: (creatorAddress) => {
        const now = new Date();
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const tiers = get().getTiersByCreator(creatorAddress);
        const recentSubscriptions = get().subscriptions.filter(
          (sub) =>
            sub.creatorAddress === creatorAddress &&
            new Date(sub.startDate) >= oneMonthAgo,
        );

        return recentSubscriptions.reduce((total, sub) => {
          const tier = tiers.find((t) => t.id === sub.tierId);
          return total + (tier?.price || 0);
        }, 0);
      },

      // Utilities
      checkExpiredSubscriptions: () => {
        const now = new Date();
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) => {
            if (sub.status === 'active' && new Date(sub.endDate) <= now) {
              return { ...sub, status: 'expired' as const };
            }
            return sub;
          }),
        }));
      },
    }),
    {
      name: 'subscription-storage',
      partialize: (state) => ({
        tiers: state.tiers,
        subscriptions: state.subscriptions,
        mySubscriptions: Array.from(state.mySubscriptions),
        mySubscribers: Array.from(state.mySubscribers),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert arrays back to Sets after rehydration
          state.mySubscriptions = new Set(state.mySubscriptions as unknown as string[]);
          state.mySubscribers = new Set(state.mySubscribers as unknown as string[]);
          // Check for expired subscriptions on load
          state.checkExpiredSubscriptions();
        }
      },
    },
  ),
);

export default useSubscriptionStore;
