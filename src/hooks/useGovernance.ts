import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useSocialFi } from './useSocialFi';
import { toast } from 'react-hot-toast';
import { CacheManager } from '../services/storage';

export const useGovernance = (stakerPubkey?: PublicKey, proposalPubkey?: PublicKey) => {
  const { sdk } = useSocialFi();
  const queryClient = useQueryClient();

  // Query stake position
  const { data: stakePosition, isLoading: isLoadingStake } = useQuery({
    queryKey: ['stakePosition', stakerPubkey?.toString()],
    queryFn: async () => {
      if (!stakerPubkey || !sdk) return null;
      const cacheKey = `stakePosition:${stakerPubkey.toString()}`;
      try {
        const position = await sdk.getStakePosition(stakerPubkey);
        if (position) {
          await CacheManager.setCachedMetadata(cacheKey, position);
        }
        return position;
      } catch (error) {
        console.error('Error fetching stake position:', error);
        const cached = await CacheManager.getCachedMetadata(cacheKey);
        if (cached) {
          console.log('📱 Using cached stake position (error fallback)');
          return cached as any;
        }
        return null;
      }
    },
    enabled: !!sdk && !!stakerPubkey,
  });

  // Query proposal
  const { data: proposal, isLoading: isLoadingProposal } = useQuery({
    queryKey: ['proposal', proposalPubkey?.toString()],
    queryFn: async () => {
      if (!proposalPubkey || !sdk) return null;
      const cacheKey = `proposal:${proposalPubkey.toString()}`;
      try {
        const prop = await sdk.getProposal(proposalPubkey);
        if (prop) {
          await CacheManager.setCachedMetadata(cacheKey, prop);
        }
        return prop;
      } catch (error) {
        console.error('Error fetching proposal:', error);
        const cached = await CacheManager.getCachedMetadata(cacheKey);
        if (cached) {
          console.log('📱 Using cached proposal (error fallback)');
          return cached as any;
        }
        return null;
      }
    },
    enabled: !!sdk && !!proposalPubkey,
  });

  // Query user's vote on proposal
  const { data: userVote } = useQuery({
    queryKey: ['userVote', proposalPubkey?.toString(), stakerPubkey?.toString()],
    queryFn: async () => {
      if (!proposalPubkey || !stakerPubkey || !sdk) return null;
      const cacheKey = `userVote:${proposalPubkey.toString()}:${stakerPubkey.toString()}`;
      try {
        const vote = await sdk.getVote(proposalPubkey, stakerPubkey);
        if (vote) {
          await CacheManager.setCachedMetadata(cacheKey, vote);
        }
        return vote;
      } catch (error) {
        console.error('Error fetching user vote:', error);
        const cached = await CacheManager.getCachedMetadata(cacheKey);
        if (cached) {
          console.log('📱 Using cached user vote (error fallback)');
          return cached as any;
        }
        return null;
      }
    },
    enabled: !!sdk && !!proposalPubkey && !!stakerPubkey,
  });

  // Stake tokens mutation
  const stakeMutation = useMutation({
    mutationFn: async ({
      amountInSol,
      lockDaysUnix,
    }: {
      amountInSol: number;
      lockDaysUnix?: number;
    }) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.stakeTokens(amountInSol, lockDaysUnix);
    },
    onSuccess: () => {
      toast.success('Tokens staked successfully!');
      queryClient.invalidateQueries({ queryKey: ['stakePosition'] });
    },
    onError: (error: any) => {
      console.error('Stake error:', error);
      toast.error(error.message || 'Failed to stake tokens');
    },
  });

  // Unstake tokens mutation
  const unstakeMutation = useMutation({
    mutationFn: async () => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.unstakeTokens();
    },
    onSuccess: () => {
      toast.success('Tokens unstaked successfully!');
      queryClient.invalidateQueries({ queryKey: ['stakePosition'] });
    },
    onError: (error: any) => {
      console.error('Unstake error:', error);
      toast.error(error.message || 'Failed to unstake tokens');
    },
  });

  // Create proposal mutation
  const createProposalMutation = useMutation({
    mutationFn: async ({
      title,
      description,
      category = 0,
      executionDelay = 0,
    }: {
      title: string;
      description: string;
      category?: number;
      executionDelay?: number;
    }) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.createProposal(title, description, category, executionDelay);
    },
    onSuccess: () => {
      toast.success('Proposal created successfully!');
      queryClient.invalidateQueries({ queryKey: ['proposal'] });
    },
    onError: (error: any) => {
      console.error('Create proposal error:', error);
      toast.error(error.message || 'Failed to create proposal');
    },
  });

  // Cast vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({
      proposalPubkey,
      support,
    }: {
      proposalPubkey: PublicKey;
      support: boolean;
    }) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.castVote(proposalPubkey, support);
    },
    onSuccess: () => {
      toast.success('Vote cast successfully!');
      queryClient.invalidateQueries({ queryKey: ['userVote'] });
      queryClient.invalidateQueries({ queryKey: ['proposal'] });
    },
    onError: (error: any) => {
      console.error('Vote error:', error);
      toast.error(error.message || 'Failed to cast vote');
    },
  });

  // Execute proposal mutation
  const executeProposalMutation = useMutation({
    mutationFn: async (proposalPubkey: PublicKey) => {
      if (!sdk) throw new Error('SDK not initialized');
      return await sdk.executeProposal(proposalPubkey);
    },
    onSuccess: () => {
      toast.success('Proposal executed!');
      queryClient.invalidateQueries({ queryKey: ['proposal'] });
    },
    onError: (error: any) => {
      console.error('Execute proposal error:', error);
      toast.error(error.message || 'Failed to execute proposal');
    },
  });

  return {
    stakePosition,
    isLoadingStake,
    proposal,
    isLoadingProposal,
    userVote,
    stake: stakeMutation.mutateAsync,
    unstake: unstakeMutation.mutateAsync,
    createProposal: createProposalMutation.mutateAsync,
    vote: voteMutation.mutateAsync,
    executeProposal: executeProposalMutation.mutateAsync,
    isStaking: stakeMutation.isPending,
    isUnstaking: unstakeMutation.isPending,
    isCreatingProposal: createProposalMutation.isPending,
    isVoting: voteMutation.isPending,
    isExecuting: executeProposalMutation.isPending,
  };
};
