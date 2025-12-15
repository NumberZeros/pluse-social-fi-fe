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
      // TODO: Implement actual SDK call
      return null;
    },
    enabled: !!groupPubkey,
  });

  // Query group member status
  const { data: isMember, isLoading: memberLoading } = useQuery({
    queryKey: ['group_member', groupPubkey?.toString(), memberPubkey?.toString()],
    queryFn: async () => {
      // TODO: Implement actual SDK call
      return false;
    },
    enabled: !!groupPubkey && !!memberPubkey,
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
      // TODO: Implement actual SDK call
      console.log('Creating group:', name, description, isPrivate, entryFeeInSol);
      return { success: true };
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
      // TODO: Implement actual SDK call
      console.log('Joining group:', groupPubkey.toBase58());
      return { success: true };
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

  // Update member role mutation (admin only)
  const updateMemberRoleMutation = useMutation({
    mutationFn: async ({
      groupPubkey,
      targetMemberPubkey,
      newRole,
    }: {
      groupPubkey: PublicKey;
      targetMemberPubkey: PublicKey;
      newRole: number;
    }) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.updateMemberRole(groupPubkey, targetMemberPubkey, newRole);
    },
    onSuccess: () => {
      toast.success('Member role updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['group_member'] });
      queryClient.invalidateQueries({ queryKey: ['group'] });
    },
    onError: (error: any) => {
      console.error('Update role error:', error);
      toast.error(error.message || 'Failed to update member role');
    },
  });

  // Kick member mutation (admin only)
  const kickMemberMutation = useMutation({
    mutationFn: async ({
      groupPubkey,
      targetMemberPubkey,
    }: {
      groupPubkey: PublicKey;
      targetMemberPubkey: PublicKey;
    }) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.kickMember(groupPubkey, targetMemberPubkey);
    },
    onSuccess: () => {
      toast.success('Member kicked from group!');
      queryClient.invalidateQueries({ queryKey: ['group_member'] });
      queryClient.invalidateQueries({ queryKey: ['group'] });
    },
    onError: (error: any) => {
      console.error('Kick member error:', error);
      toast.error(error.message || 'Failed to kick member');
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
    updateMemberRole: updateMemberRoleMutation.mutateAsync,
    kickMember: kickMemberMutation.mutateAsync,
    isCreating: createGroupMutation.isPending,
    isJoining: joinGroupMutation.isPending,
    isLeaving: leaveGroupMutation.isPending,
    isUpdatingRole: updateMemberRoleMutation.isPending,
    isKicking: kickMemberMutation.isPending,
  };
};
