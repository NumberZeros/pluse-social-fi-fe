import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useSocialFi } from './useSocialFi';
import { toast } from 'react-hot-toast';

export const useGovernance = (stakerPubkey?: PublicKey) => {
  const { sdk } = useSocialFi();
  const queryClient = useQueryClient();

  // Query stake position
  const { data: stakePosition, isLoading: isLoadingStake } = useQuery({
    queryKey: ['stakePosition', stakerPubkey?.toString()],
    queryFn: async () => {
      if (!stakerPubkey) return null;
      return await sdk?.getStakePosition(stakerPubkey);
    },
    enabled: !!sdk && !!stakerPubkey,
  });

  // Stake tokens mutation
  const stakeMutation = useMutation({
    mutationFn: async ({ amount, lockPeriod }: { amount: number; lockPeriod: number }) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.stakeTokens(amount, lockPeriod);
    },
    onSuccess: (tx) => {
      toast.success('Tokens staked successfully!');
      console.log('Stake tx:', tx);
      queryClient.invalidateQueries({ queryKey: ['stakePosition'] });
    },
    onError: (error: any) => {
      console.error('Stake error:', error);
      toast.error(error.message || 'Failed to stake tokens');
    },
  });

  // Create proposal mutation
  const createProposalMutation = useMutation({
    mutationFn: async ({ title, description, proposalType }: { title: string; description: string; proposalType: number }) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.createProposal(title, description, proposalType);
    },
    onSuccess: (tx) => {
      toast.success('Proposal created successfully!');
      console.log('Create proposal tx:', tx);
      queryClient.invalidateQueries({ queryKey: ['proposal'] });
    },
    onError: (error: any) => {
      console.error('Create proposal error:', error);
      toast.error(error.message || 'Failed to create proposal');
    },
  });

  // Cast vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ proposalPubkey, support }: { proposalPubkey: PublicKey; support: boolean }) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.castVote(proposalPubkey, support);
    },
    onSuccess: (tx) => {
      toast.success('Vote cast successfully!');
      console.log('Vote tx:', tx);
      queryClient.invalidateQueries({ queryKey: ['proposal'] });
    },
    onError: (error: any) => {
      console.error('Vote error:', error);
      toast.error(error.message || 'Failed to cast vote');
    },
  });

  // Query proposal
  const useProposal = (proposalPubkey?: PublicKey) => {
    return useQuery({
      queryKey: ['proposal', proposalPubkey?.toString()],
      queryFn: async () => {
        if (!proposalPubkey) return null;
        return await sdk?.getProposal(proposalPubkey);
      },
      enabled: !!sdk && !!proposalPubkey,
    });
  };

  return {
    stakePosition,
    isLoadingStake,
    stake: stakeMutation.mutateAsync,
    createProposal: createProposalMutation.mutateAsync,
    vote: voteMutation.mutateAsync,
    isStaking: stakeMutation.isPending,
    isCreatingProposal: createProposalMutation.isPending,
    isVoting: voteMutation.isPending,
    useProposal,
  };
};
