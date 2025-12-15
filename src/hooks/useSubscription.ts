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
      if (!subscriberPubkey || !creatorPubkey) return null;
      return await sdk?.getSubscription(subscriberPubkey, creatorPubkey);
    },
    enabled: !!sdk && !!subscriberPubkey && !!creatorPubkey,
  });

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async ({ creator }: { creator: PublicKey; durationMonths?: number }) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.subscribe(creator);
    },
    onSuccess: (tx) => {
      toast.success('Subscribed successfully!');
      console.log('Subscribe tx:', tx);
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
    onError: (error: any) => {
      console.error('Subscribe error:', error);
      toast.error(error.message || 'Failed to subscribe');
    },
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (creator: PublicKey) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.cancelSubscription(creator);
    },
    onSuccess: (tx) => {
      toast.success('Subscription cancelled');
      console.log('Cancel subscription tx:', tx);
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
    onError: (error: any) => {
      console.error('Cancel subscription error:', error);
      toast.error(error.message || 'Failed to cancel subscription');
    },
  });

  return {
    subscription,
    isLoading,
    subscribe: subscribeMutation.mutateAsync,
    cancelSubscription: cancelSubscriptionMutation.mutateAsync,
    isSubscribing: subscribeMutation.isPending,
    isCancelling: cancelSubscriptionMutation.isPending,
  };
};
