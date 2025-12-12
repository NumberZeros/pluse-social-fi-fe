import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StakePosition {
  id: string;
  walletAddress: string;
  amount: number; // PULSE tokens
  stakedAt: number;
  lockPeriod: number; // in days (0, 30, 90, 180, 365)
  unlocksAt: number;
  rewards: number;
  votingPower: number;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  category: 'protocol' | 'treasury' | 'feature' | 'parameter';
  status: 'active' | 'passed' | 'rejected' | 'executed' | 'cancelled';
  createdAt: number;
  votingEndsAt: number;
  executionDelay: number; // timelock in hours
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  quorumRequired: number;
  voters: Map<string, 'for' | 'against' | 'abstain'>;
  minVotingPower: number;
}

interface GovernanceStore {
  // Staking
  stakes: StakePosition[];
  totalStaked: number;
  myStakes: Set<string>;

  // Proposals
  proposals: Proposal[];
  myProposals: Set<string>;
  myVotes: Map<string, 'for' | 'against' | 'abstain'>;

  // Staking Actions
  stake: (wallet: string, amount: number, lockPeriod: number) => void;
  unstake: (stakeId: string) => void;
  claimRewards: (stakeId: string) => void;
  getVotingPower: (wallet: string) => number;
  getStakesByWallet: (wallet: string) => StakePosition[];

  // Governance Actions
  createProposal: (
    title: string,
    description: string,
    proposer: string,
    category: Proposal['category'],
    votingPeriodDays: number,
  ) => void;
  vote: (
    proposalId: string,
    voter: string,
    choice: 'for' | 'against' | 'abstain',
    votingPower: number,
  ) => void;
  executeProposal: (proposalId: string) => void;
  cancelProposal: (proposalId: string) => void;

  // Queries
  getActiveProposals: () => Proposal[];
  getProposalById: (id: string) => Proposal | undefined;
  hasVoted: (proposalId: string, wallet: string) => boolean;
  canVote: (proposalId: string, wallet: string) => boolean;
}

const APY_RATES = {
  0: 5, // No lock: 5% APY
  30: 10, // 30 days: 10% APY
  90: 15, // 90 days: 15% APY
  180: 20, // 180 days: 20% APY
  365: 30, // 365 days: 30% APY
};

const VOTING_POWER_MULTIPLIER = {
  0: 1,
  30: 1.2,
  90: 1.5,
  180: 2,
  365: 3,
};

export const useGovernanceStore = create<GovernanceStore>()(
  persist(
    (set, get) => ({
      stakes: [],
      totalStaked: 0,
      myStakes: new Set<string>(),
      proposals: [],
      myProposals: new Set<string>(),
      myVotes: new Map(),

      // Staking
      stake: (wallet, amount, lockPeriod) => {
        const now = Date.now();
        const lockDays = lockPeriod as keyof typeof APY_RATES;

        const stake: StakePosition = {
          id: `stake_${now}_${Math.random().toString(36).substr(2, 9)}`,
          walletAddress: wallet,
          amount,
          stakedAt: now,
          lockPeriod,
          unlocksAt: now + lockPeriod * 24 * 60 * 60 * 1000,
          rewards: 0,
          votingPower: amount * VOTING_POWER_MULTIPLIER[lockDays],
        };

        set((state) => ({
          stakes: [...state.stakes, stake],
          totalStaked: state.totalStaked + amount,
          myStakes: new Set([...state.myStakes, stake.id]),
        }));
      },

      unstake: (stakeId) => {
        const stake = get().stakes.find((s) => s.id === stakeId);
        if (!stake || Date.now() < stake.unlocksAt) return;

        set((state) => {
          const newMyStakes = new Set(state.myStakes);
          newMyStakes.delete(stakeId);

          return {
            stakes: state.stakes.filter((s) => s.id !== stakeId),
            totalStaked: state.totalStaked - stake.amount,
            myStakes: newMyStakes,
          };
        });
      },

      claimRewards: (stakeId) => {
        const stake = get().stakes.find((s) => s.id === stakeId);
        if (!stake) return;

        const daysStaked = (Date.now() - stake.stakedAt) / (1000 * 60 * 60 * 24);
        const lockDays = stake.lockPeriod as keyof typeof APY_RATES;
        const apy = APY_RATES[lockDays];
        const rewards = (stake.amount * apy * daysStaked) / (365 * 100);

        set((state) => ({
          stakes: state.stakes.map((s) =>
            s.id === stakeId ? { ...s, rewards, stakedAt: Date.now() } : s,
          ),
        }));
      },

      getVotingPower: (wallet) => {
        return get()
          .stakes.filter((s) => s.walletAddress === wallet)
          .reduce((total, s) => total + s.votingPower, 0);
      },

      getStakesByWallet: (wallet) => {
        return get().stakes.filter((s) => s.walletAddress === wallet);
      },

      // Governance
      createProposal: (title, description, proposer, category, votingPeriodDays) => {
        const now = Date.now();
        const votingPower = get().getVotingPower(proposer);

        if (votingPower < 1000) {
          throw new Error('Minimum 1000 voting power required to create proposal');
        }

        const proposal: Proposal = {
          id: `prop_${now}_${Math.random().toString(36).substr(2, 9)}`,
          title,
          description,
          proposer,
          category,
          status: 'active',
          createdAt: now,
          votingEndsAt: now + votingPeriodDays * 24 * 60 * 60 * 1000,
          executionDelay: 24, // 24 hours timelock
          votesFor: 0,
          votesAgainst: 0,
          votesAbstain: 0,
          quorumRequired: get().totalStaked * 0.1, // 10% of total staked
          voters: new Map(),
          minVotingPower: 100,
        };

        set((state) => ({
          proposals: [...state.proposals, proposal],
          myProposals: new Set([...state.myProposals, proposal.id]),
        }));
      },

      vote: (proposalId, voter, choice, votingPower) => {
        const proposal = get().proposals.find((p) => p.id === proposalId);
        if (!proposal || proposal.status !== 'active') return;
        if (Date.now() > proposal.votingEndsAt) return;
        if (votingPower < proposal.minVotingPower) return;
        if (proposal.voters.has(voter)) return;

        set((state) => {
          const updatedProposal = { ...proposal };
          updatedProposal.voters = new Map(proposal.voters);
          updatedProposal.voters.set(voter, choice);

          if (choice === 'for') updatedProposal.votesFor += votingPower;
          else if (choice === 'against') updatedProposal.votesAgainst += votingPower;
          else updatedProposal.votesAbstain += votingPower;

          const totalVotes =
            updatedProposal.votesFor +
            updatedProposal.votesAgainst +
            updatedProposal.votesAbstain;
          if (totalVotes >= updatedProposal.quorumRequired) {
            if (updatedProposal.votesFor > updatedProposal.votesAgainst) {
              updatedProposal.status = 'passed';
            } else {
              updatedProposal.status = 'rejected';
            }
          }

          const newMyVotes = new Map(state.myVotes);
          newMyVotes.set(proposalId, choice);

          return {
            proposals: state.proposals.map((p) =>
              p.id === proposalId ? updatedProposal : p,
            ),
            myVotes: newMyVotes,
          };
        });
      },

      executeProposal: (proposalId) => {
        const proposal = get().proposals.find((p) => p.id === proposalId);
        if (!proposal || proposal.status !== 'passed') return;

        const timeSinceVotingEnded = Date.now() - proposal.votingEndsAt;
        const timelockPassed =
          timeSinceVotingEnded >= proposal.executionDelay * 60 * 60 * 1000;
        if (!timelockPassed) return;

        set((state) => ({
          proposals: state.proposals.map((p) =>
            p.id === proposalId ? { ...p, status: 'executed' as const } : p,
          ),
        }));
      },

      cancelProposal: (proposalId) => {
        set((state) => ({
          proposals: state.proposals.map((p) =>
            p.id === proposalId ? { ...p, status: 'cancelled' as const } : p,
          ),
        }));
      },

      // Queries
      getActiveProposals: () => {
        return get().proposals.filter((p) => p.status === 'active');
      },

      getProposalById: (id) => {
        return get().proposals.find((p) => p.id === id);
      },

      hasVoted: (proposalId, wallet) => {
        const proposal = get().proposals.find((p) => p.id === proposalId);
        return proposal?.voters.has(wallet) || false;
      },

      canVote: (proposalId, wallet) => {
        const proposal = get().proposals.find((p) => p.id === proposalId);
        if (!proposal || proposal.status !== 'active') return false;
        if (Date.now() > proposal.votingEndsAt) return false;
        if (proposal.voters.has(wallet)) return false;

        const votingPower = get().getVotingPower(wallet);
        return votingPower >= proposal.minVotingPower;
      },
    }),
    {
      name: 'pulse-governance-storage',
      partialize: (state) => ({
        stakes: state.stakes,
        totalStaked: state.totalStaked,
        myStakes: Array.from(state.myStakes),
        proposals: state.proposals.map((p) => ({
          ...p,
          voters: Array.from(p.voters.entries()),
        })),
        myProposals: Array.from(state.myProposals),
        myVotes: Array.from(state.myVotes.entries()),
      }),
      merge: (persistedState: any, currentState) => {
        const proposals = (persistedState.proposals || []).map((p: any) => ({
          ...p,
          voters: new Map(p.voters || []),
        }));

        return {
          ...currentState,
          ...persistedState,
          myStakes: new Set(persistedState.myStakes || []),
          myProposals: new Set(persistedState.myProposals || []),
          myVotes: new Map(persistedState.myVotes || []),
          proposals,
        };
      },
    },
  ),
);
