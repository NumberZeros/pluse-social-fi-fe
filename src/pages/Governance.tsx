import { motion } from 'framer-motion';
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Navbar } from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useGovernanceStore } from '../stores/useGovernanceStore';
import { useGovernance } from '../hooks/useGovernance';
import {
  Lock,
  TrendingUp,
  Vote,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export function Governance() {
  const { publicKey, connected } = useWallet();
  const [activeTab, setActiveTab] = useState<'stake' | 'proposals'>('stake');
  const [stakeAmount, setStakeAmount] = useState('');
  const [lockPeriod, setLockPeriod] = useState(0);

  // Use blockchain hooks
  const { stakePosition, stake: stakeTokens, isStaking } = useGovernance(publicKey || undefined);

  // Governance data from blockchain
  const stakes: any[] = []; // TODO: Query all stake_position PDAs
  const proposals: any[] = []; // TODO: Query all proposal PDAs from blockchain  
  const totalStaked = 0; // TODO: Calculate from platform_config
  const unstake = useGovernanceStore((state) => state.unstake);
  const claimRewards = useGovernanceStore((state) => state.claimRewards);
  const vote = useGovernanceStore((state) => state.vote);
  const canVote = useGovernanceStore((state) => state.canVote);
  const hasVoted = useGovernanceStore((state) => state.hasVoted);

  const myStakes = publicKey
    ? stakes.filter((s) => s.walletAddress === publicKey.toBase58())
    : [];
  
  // Calculate voting power from blockchain stake position
  const myVotingPower = stakePosition 
    ? Number(stakePosition.amount) / 1e9 // Convert lamports to SOL
    : 0;
  
  const activeProposals = proposals.filter((p) => p.status === 'active');

  const lockOptions = [
    { days: 0, label: 'No Lock', apy: 5, multiplier: '1x' },
    { days: 30, label: '30 Days', apy: 10, multiplier: '1.2x' },
    { days: 90, label: '90 Days', apy: 15, multiplier: '1.5x' },
    { days: 180, label: '180 Days', apy: 20, multiplier: '2x' },
    { days: 365, label: '1 Year', apy: 30, multiplier: '3x' },
  ];

  const handleStake = async () => {
    if (!connected) {
      toast.error('Please connect your wallet');
      return;
    }
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await stakeTokens({ amount: parseFloat(stakeAmount), lockPeriod });
      setStakeAmount('');
    } catch (error) {
      console.error('Stake failed:', error);
    }
  };

  const handleUnstake = (stakeId: string) => {
    const stake = stakes.find((s) => s.id === stakeId);
    if (!stake) return;

    if (Date.now() < stake.unlocksAt) {
      toast.error('Stake is still locked');
      return;
    }

    unstake(stakeId);
    toast.success('Stake removed!');
  };

  const handleVote = (proposalId: string, choice: 'for' | 'against' | 'abstain') => {
    if (!connected) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!canVote(proposalId, publicKey!.toBase58())) {
      toast.error('Cannot vote on this proposal');
      return;
    }

    vote(proposalId, publicKey!.toBase58(), choice, myVotingPower);
    toast.success('Vote submitted!');
  };

  const getProposalStatus = (proposal: any) => {
    if (proposal.status === 'active') {
      const timeLeft = proposal.votingEndsAt - Date.now();
      const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
      return {
        label: `${hoursLeft}h left`,
        color: 'text-blue-400',
        icon: Clock,
      };
    }
    if (proposal.status === 'passed') {
      return { label: 'Passed', color: 'text-green-400', icon: CheckCircle };
    }
    if (proposal.status === 'rejected') {
      return { label: 'Rejected', color: 'text-red-400', icon: XCircle };
    }
    if (proposal.status === 'executed') {
      return { label: 'Executed', color: 'text-[var(--color-solana-green)]', icon: CheckCircle };
    }
    return { label: 'Cancelled', color: 'text-gray-400', icon: AlertCircle };
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />

      <div className="max-w-[1200px] mx-auto px-6 pt-24 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[var(--color-primary-green)] to-[var(--color-value-amber)] bg-clip-text text-transparent">
            Governance
          </h1>
          <p className="text-gray-400 text-lg">
            Stake PULSE tokens and vote on protocol decisions
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            {
              label: 'Total Staked',
              value: `${totalStaked.toLocaleString()} PULSE`,
              icon: Lock,
            },
            {
              label: 'My Voting Power',
              value: myVotingPower.toLocaleString(),
              icon: Vote,
            },
            {
              label: 'Active Proposals',
              value: activeProposals.length,
              icon: TrendingUp,
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-2">
                <stat.icon className="w-5 h-5 text-[var(--color-value-amber)]" />
                <div className="text-2xl font-bold">{stat.value}</div>
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="border-b border-white/10 mb-6">
          <div className="flex gap-6">
            {[
              { id: 'stake', label: 'Stake & Earn', icon: Lock },
              { id: 'proposals', label: 'Proposals', icon: Vote },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative pb-4 font-medium transition-colors flex items-center gap-2 ${
                  activeTab === tab.id ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="govTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-solana-green)]"
                    transition={{ type: 'spring', duration: 0.5 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Stake Tab */}
        {activeTab === 'stake' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stake Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-2xl p-8 border border-white/10"
            >
              <h2 className="text-2xl font-bold mb-6">Stake PULSE</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Amount</label>
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 outline-none focus:border-white/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Lock Period</label>
                  <div className="grid grid-cols-2 gap-3">
                    {lockOptions.map((option) => (
                      <button
                        key={option.days}
                        onClick={() => setLockPeriod(option.days)}
                        className={`p-4 rounded-lg border transition-all ${
                          lockPeriod === option.days
                            ? 'bg-[var(--color-solana-green)] text-black border-[var(--color-solana-green)]'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="font-bold mb-1">{option.label}</div>
                        <div className="text-xs opacity-80">{option.apy}% APY</div>
                        <div className="text-xs opacity-80">
                          {option.multiplier} Power
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleStake}
                  disabled={isStaking || !stakeAmount || parseFloat(stakeAmount) <= 0}
                  className="w-full px-6 py-3 bg-[var(--color-solana-green)] text-black rounded-lg font-bold text-lg hover:bg-[#9FE51C] disabled:bg-gray-700 disabled:text-gray-500 transition-colors"
                >
                  {isStaking ? 'Staking...' : 'Stake PULSE'}
                </button>
              </div>
            </motion.div>

            {/* My Stakes */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold mb-4">My Stakes</h2>

              {myStakes.map((stake) => {
                const isLocked = Date.now() < stake.unlocksAt;
                const timeLeft = stake.unlocksAt - Date.now();
                const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));

                return (
                  <div
                    key={stake.id}
                    className="glass-card rounded-xl p-6 border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-2xl font-bold mb-1">
                          {stake.amount} PULSE
                        </div>
                        <div className="text-sm text-gray-400">
                          Voting Power: {stake.votingPower.toFixed(0)}
                        </div>
                      </div>
                      {isLocked ? (
                        <span className="px-3 py-1 rounded-lg bg-yellow-500/20 text-yellow-400 text-sm font-medium flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          {daysLeft}d left
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-sm font-medium">
                          Unlocked
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => claimRewards(stake.id)}
                        className="flex-1 px-4 py-2 bg-white/5 rounded-lg font-medium hover:bg-white/10 transition-colors"
                      >
                        Claim Rewards
                      </button>
                      <button
                        onClick={() => handleUnstake(stake.id)}
                        disabled={isLocked}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                          isLocked
                            ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                            : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        }`}
                      >
                        Unstake
                      </button>
                    </div>
                  </div>
                );
              })}

              {myStakes.length === 0 && (
                <div className="glass-card rounded-xl p-12 text-center border border-white/10">
                  <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-400">No active stakes</p>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Proposals Tab */}
        {activeTab === 'proposals' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-400">
                  You need 1000+ voting power to create proposals
                </div>
              </div>
              <button
                onClick={() => {
                  /* TODO: Implement create proposal modal */
                }}
                disabled={myVotingPower < 1000}
                className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                  myVotingPower >= 1000
                    ? 'bg-[var(--color-solana-green)] text-black hover:bg-[#9FE51C]'
                    : 'bg-white/5 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Plus className="w-4 h-4" />
                Create Proposal
              </button>
            </div>

            {proposals.map((proposal) => {
              const status = getProposalStatus(proposal);
              const totalVotes =
                proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
              const quorumProgress = (totalVotes / proposal.quorumRequired) * 100;
              const voted = publicKey
                ? hasVoted(proposal.id, publicKey.toBase58())
                : false;
              const canVoteOn = publicKey
                ? canVote(proposal.id, publicKey.toBase58())
                : false;

              return (
                <motion.div
                  key={proposal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl p-6 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{proposal.title}</h3>
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${status.color} bg-current/10`}
                        >
                          <status.icon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{proposal.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="px-2 py-1 bg-white/5 rounded">
                          {proposal.category}
                        </span>
                        <span>
                          Proposer: {proposal.proposer.slice(0, 4)}...
                          {proposal.proposer.slice(-4)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Vote Distribution */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">For: {proposal.votesFor}</span>
                      <span className="text-red-400">
                        Against: {proposal.votesAgainst}
                      </span>
                      <span className="text-gray-400">
                        Abstain: {proposal.votesAbstain}
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden flex">
                      <div
                        className="bg-green-500"
                        style={{
                          width: `${totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0}%`,
                        }}
                      />
                      <div
                        className="bg-red-500"
                        style={{
                          width: `${totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 0}%`,
                        }}
                      />
                      <div
                        className="bg-gray-500"
                        style={{
                          width: `${totalVotes > 0 ? (proposal.votesAbstain / totalVotes) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-400">
                      Quorum: {quorumProgress.toFixed(1)}% ({totalVotes} /{' '}
                      {proposal.quorumRequired})
                    </div>
                  </div>

                  {/* Voting Buttons */}
                  {!voted && canVoteOn && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVote(proposal.id, 'for')}
                        className="flex-1 px-4 py-2 bg-green-500/10 text-green-400 rounded-lg font-medium hover:bg-green-500/20 transition-colors"
                      >
                        Vote For
                      </button>
                      <button
                        onClick={() => handleVote(proposal.id, 'against')}
                        className="flex-1 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg font-medium hover:bg-red-500/20 transition-colors"
                      >
                        Vote Against
                      </button>
                      <button
                        onClick={() => handleVote(proposal.id, 'abstain')}
                        className="px-4 py-2 bg-white/5 rounded-lg font-medium hover:bg-white/10 transition-colors"
                      >
                        Abstain
                      </button>
                    </div>
                  )}

                  {voted && (
                    <div className="px-4 py-2 bg-[var(--color-solana-green)]/10 text-[var(--color-solana-green)] rounded-lg text-center font-medium">
                      You voted on this proposal
                    </div>
                  )}
                </motion.div>
              );
            })}

            {proposals.length === 0 && (
              <div className="glass-card rounded-2xl p-12 text-center border border-white/10">
                <Vote className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400">No proposals yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
