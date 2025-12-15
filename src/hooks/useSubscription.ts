import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useSocialFi } from './useSocialFi';
import { toast } from 'react-hot-toast';

export const useSubscription = (subscriberPubkey?: PublicKey, creatorPubkey?: PublicKey) => {
  const { sdk } = useSocialFi();
  const queryClient = useQueryClient();

  // Query subscription info
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription', subscriberPubkey?.toString(), creatorPubkey?.toString()],
    queryFn: async () => {
      if (!subscriberPubkey || !creatorPubkey || !sdk) return null;
      return await sdk.getSubscription(subscriberPubkey, creatorPubkey);
    },
    enabled: !!sdk && !!subscriberPubkey && !!creatorPubkey,
  });

  // Query subscription tiers for a creator
  const { data: tiers, isLoading: tiersLoading } = useQuery({
    queryKey: ['subscription_tiers', creatorPubkey?.toString()],
    queryFn: async () => {
      if (!creatorPubkey || !sdk) return null;
      return await sdk.getCreatorSubscriptionTiers(creatorPubkey);
    },
    enabled: !!sdk && !!creatorPubkey,
  });

  // Check if user is subscribed
  const { data: isSubscribed } = useQuery({
    queryKey: ['is_subscribed', subscriberPubkey?.toString(), creatorPubkey?.toString()],
    queryFn: async () => {
      return subscription !== null;
    },
    enabled: !!subscription,
  });

  // Create subscription tier mutation
  const createTierMutation = useMutation({
    mutationFn: async ({
      name,
      description,
      priceInSol,
      durationDays,
    }: {
      name: string;
      description: string;
      priceInSol: number;
      durationDays: number;
    }) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.createSubscriptionTier(name, description, priceInSol, durationDays);
    },
    onSuccess: () => {
      toast.success('Subscription tier created!');
      queryClient.invalidateQueries({ queryKey: ['subscription_tiers'] });
    },
    onError: (error: any) => {
      console.error('Create tier error:', error);
      toast.error(error.message || 'Failed to create subscription tier');
    },
  });

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async ({ creator, tierId }: { creator: PublicKey; tierId?: number }) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.subscribe(creator, tierId);
    },
    onSuccess: () => {
      toast.success('Subscribed successfully!');
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['is_subscribed'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to subscribe');
    },
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (creator: PublicKey) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.cancelSubscription(creator);
    },
    onSuccess: () => {
      toast.success('Subscription cancelled');
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['is_subscribed'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel subscription');
    },
  });

  return {
    subscription,
    isLoading,
    isSubscribed,
    tiers,
    tiersLoading,
    createTier: createTierMutation.mutateAsync,
    isCreatingTier: createTierMutation.isPending,
    subscribe: subscribeMutation.mutateAsync,
    cancelSubscription: cancelSubscriptionMutation.mutateAsync,
    isSubscribing: subscribeMutation.isPending,
    isCancelling: cancelSubscriptionMutation.isPending,
  };
};
