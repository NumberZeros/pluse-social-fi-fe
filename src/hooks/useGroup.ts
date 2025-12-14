import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useSocialFi } from './useSocialFi';
import { toast } from 'react-hot-toast';

export const useGroup = (groupPubkey?: PublicKey) => {
  const { sdk } = useSocialFi();
  const queryClient = useQueryClient();

  // Query group info
  const { data: group, isLoading } = useQuery({
    queryKey: ['group', groupPubkey?.toString()],
    queryFn: async () => {
      if (!groupPubkey) return null;
      return await sdk?.getGroup(groupPubkey);
    },
    enabled: !!sdk && !!groupPubkey,
  });

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: async ({ name, description, entryFee }: { name: string; description: string; entryFee: number }) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.createGroup(name, description, entryFee);
    },
    onSuccess: (tx) => {
      toast.success('Group created successfully!');
      console.log('Create group tx:', tx);
      queryClient.invalidateQueries({ queryKey: ['group'] });
    },
    onError: (error: any) => {
      console.error('Create group error:', error);
      toast.error(error.message || 'Failed to create group');
    },
  });

  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async (groupPubkey: PublicKey) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.joinGroup(groupPubkey);
    },
    onSuccess: (tx) => {
      toast.success('Joined group successfully!');
      console.log('Join group tx:', tx);
      queryClient.invalidateQueries({ queryKey: ['group'] });
    },
    onError: (error: any) => {
      console.error('Join group error:', error);
      toast.error(error.message || 'Failed to join group');
    },
  });

  return {
    group,
    isLoading,
    createGroup: createGroupMutation.mutateAsync,
    joinGroup: joinGroupMutation.mutateAsync,
    isCreating: createGroupMutation.isPending,
    isJoining: joinGroupMutation.isPending,
  };
};
