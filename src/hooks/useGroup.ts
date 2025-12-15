import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useSocialFi } from './useSocialFi';
import { toast } from 'react-hot-toast';

export const useGroup = (groupPubkey?: PublicKey, memberPubkey?: PublicKey) => {
  const { sdk } = useSocialFi();
  const queryClient = useQueryClient();

  // Query group info
  const { data: group, isLoading } = useQuery({
    queryKey: ['group', groupPubkey?.toString()],
    queryFn: async () => {
      if (!groupPubkey || !sdk) return null;
      return await sdk.getGroup(groupPubkey);
    },
    enabled: !!sdk && !!groupPubkey,
  });

  // Query group member status
  const { data: isMember, isLoading: memberLoading } = useQuery({
    queryKey: ['group_member', groupPubkey?.toString(), memberPubkey?.toString()],
    queryFn: async () => {
      if (!groupPubkey || !memberPubkey || !sdk) return false;
      return await sdk.isGroupMember(groupPubkey, memberPubkey);
    },
    enabled: !!sdk && !!groupPubkey && !!memberPubkey,
  });

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: async ({
      name,
      description,
      isPrivate = false,
      entryFeeInSol,
    }: {
      name: string;
      description: string;
      isPrivate?: boolean;
      entryFeeInSol?: number;
    }) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.createGroup(name, description, isPrivate, entryFeeInSol);
    },
    onSuccess: () => {
      toast.success('Group created successfully!');
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
    onSuccess: () => {
      toast.success('Joined group successfully!');
      queryClient.invalidateQueries({ queryKey: ['group_member'] });
      queryClient.invalidateQueries({ queryKey: ['group'] });
    },
    onError: (error: any) => {
      console.error('Join group error:', error);
      toast.error(error.message || 'Failed to join group');
    },
  });

  // Leave group mutation
  const leaveGroupMutation = useMutation({
    mutationFn: async (groupPubkey: PublicKey) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.leaveGroup(groupPubkey);
    },
    onSuccess: () => {
      toast.success('Left group successfully!');
      queryClient.invalidateQueries({ queryKey: ['group_member'] });
      queryClient.invalidateQueries({ queryKey: ['group'] });
    },
    onError: (error: any) => {
      console.error('Leave group error:', error);
      toast.error(error.message || 'Failed to leave group');
    },
  });

  return {
    group,
    isLoading,
    isMember,
    memberLoading,
    createGroup: createGroupMutation.mutateAsync,
    joinGroup: joinGroupMutation.mutateAsync,
    leaveGroup: leaveGroupMutation.mutateAsync,
    isCreating: createGroupMutation.isPending,
    isJoining: joinGroupMutation.isPending,
    isLeaving: leaveGroupMutation.isPending,
  };
};
