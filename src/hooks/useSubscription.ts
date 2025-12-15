import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useSocialFi } from './useSocialFi';
import { toast } from 'react-hot-toast';

export const useSubscription = (subscriberPubkey?: PublicKey, creatorPubkey?: PublicKey) => {
  useSocialFi();
  const queryClient = useQueryClient();

  // Query subscription info
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription', subscriberPubkey?.toString(), creatorPubkey?.toString()],
    queryFn: async () => {
      // TODO: Implement actual SDK call
      return null;
    },
    enabled: !!subscriberPubkey && !!creatorPubkey,
  });

  // Query subscription tiers for a creator
  const { data: tiers, isLoading: tiersLoading } = useQuery({
    queryKey: ['subscription_tiers', creatorPubkey?.toString()],
    queryFn: async () => {
      // TODO: Implement actual SDK call
      return null;
    },
    enabled: !!creatorPubkey,
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
      // TODO: Implement actual SDK call
      console.log('Creating tier:', name, description, priceInSol, durationDays);
      return { success: true };
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
    mutationFn: async ({ creator, tierId: _tierId }: { creator: PublicKey; tierId?: number }) => {
      // TODO: Implement actual SDK call
      console.log('Subscribing to creator:', creator.toBase58());
      return { success: true };
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
      // TODO: Implement actual SDK call
      console.log('Cancelling subscription for creator:', creator.toBase58());
      return { success: true };
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
