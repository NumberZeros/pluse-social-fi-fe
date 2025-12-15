import { motion } from 'framer-motion';
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Navbar } from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
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
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export function Governance() {
  const { publicKey, connected } = useWallet();
  const [activeTab, setActiveTab] = useState<'stake' | 'proposals'>('stake');
  const [stakeAmount, setStakeAmount] = useState('');
  const [lockPeriodDays, setLockPeriodDays] = useState(0);
  const [showCreateProposal, setShowCreateProposal] = useState(false);
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [proposalCategory, setProposalCategory] = useState(0);

  // Use blockchain hooks
  const {
    stakePosition,
    stake,
    unstake,
    createProposal,
    vote,
    isStaking,
    isUnstaking,
    isCreatingProposal,
    isVoting,
  } = useGovernance(publicKey || undefined);

  const myVotingPower = stakePosition ? Number(stakePosition.amount) / 1e9 : 0;

  const lockOptions = [
    { days: 0, label: 'No Lock', apy: 5, multiplier: '1x' },
    { days: 30, label: '30 Days', apy: 10, multiplier: '1.2x' },
    { days: 90, label: '90 Days', apy: 15, multiplier: '1.5x' },
    { days: 180, label: '180 Days', apy: 20, multiplier: '2x' },
    { days: 365, label: '1 Year', apy: 30, multiplier: '3x' },
  ];

  const selectedLockOption = lockOptions.find((opt) => opt.days === lockPeriodDays);

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
      const lockDaysUnix = lockPeriodDays * 24 * 60 * 60; // Convert days to seconds
      await stake({
        amountInSol: parseFloat(stakeAmount),
        lockDaysUnix,
      });
      setStakeAmount('');
      setLockPeriodDays(0);
    } catch (error) {
      console.error('Stake failed:', error);
    }
  };

  const handleUnstake = async () => {
    if (!stakePosition) {
      toast.error('No active stake to unstake');
      return;
    }

    try {
      await unstake();
      toast.success('Unstaked successfully!');
    } catch (error) {
      console.error('Unstake failed:', error);
    }
  };

  const handleCreateProposal = async () => {
    if (!connected) {
      toast.error('Please connect your wallet');
      return;
    }
    if (myVotingPower < 1000) {
      toast.error('Need at least 1000 voting power to create proposals');
      return;
    }
    if (!proposalTitle.trim() || !proposalDescription.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await createProposal({
        title: proposalTitle,
        description: proposalDescription,
        category: proposalCategory,
        executionDelay: 0,
      });
      setShowCreateProposal(false);
      setProposalTitle('');
      setProposalDescription('');
      setProposalCategory(0);
    } catch (error) {
      console.error('Create proposal failed:', error);
    }
  }

  const getProposalStatus = (proposal: any) => {
    if (proposal.status === 'active') {
      return {
        label: 'Voting',
        color: 'text-blue-400',
        icon: Clock,
      };
    }
    if (proposal.status === 'passed' || proposal.status === 'succeeded') {
      return { label: 'Passed', color: 'text-green-400', icon: CheckCircle };
    }
    if (proposal.status === 'rejected' || proposal.status === 'defeated') {
      return { label: 'Rejected', color: 'text-red-400', icon: XCircle };
    }
    if (proposal.status === 'executed') {
      return { label: 'Executed', color: 'text-[var(--color-solana-green)]', icon: CheckCircle };
    }
    return { label: 'Closed', color: 'text-gray-400', icon: AlertCircle };
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
            Stake SOL tokens and vote on protocol decisions
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            {
              label: 'My Stake',
              value: stakePosition ? (Number(stakePosition.amount) / 1e9).toFixed(2) + ' SOL' : '0 SOL',
              icon: Lock,
            },
            {
              label: 'My Voting Power',
              value: myVotingPower.toLocaleString('en-US', { maximumFractionDigits: 2 }),
              icon: Vote,
            }
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
              <h2 className="text-2xl font-bold mb-6">Stake SOL</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Amount (SOL)</label>
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="Enter amount in SOL"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 outline-none focus:border-white/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Lock Period</label>
                  <div className="grid grid-cols-2 gap-3">
                    {lockOptions.map((option) => (
                      <button
                        key={option.days}
                        onClick={() => setLockPeriodDays(option.days)}
                        className={`p-4 rounded-lg border transition-all ${
                          lockPeriodDays === option.days
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
                  {isStaking ? 'Staking...' : 'Stake SOL'}
                </button>
              </div>
            </motion.div>

            {/* My Stake Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold mb-4">My Stake</h2>

              {stakePosition ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card rounded-xl p-6 border border-white/10"
                >
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Staked Amount</div>
                      <div className="text-3xl font-bold">
                        {(Number(stakePosition.amount) / 1e9).toFixed(2)} SOL
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400 mb-1">Voting Power</div>
                      <div className="text-2xl font-bold text-[var(--color-solana-green)]">
                        {myVotingPower.toFixed(0)}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400 mb-1">Lock Period</div>
                      <div className="font-medium">
                        {stakePosition.lockPeriod.toNumber() > 0
                          ? `${Math.ceil(
                              stakePosition.lockPeriod.toNumber() / (24 * 60 * 60)
                            )} days`
                          : 'Flexible'}
                      </div>
                    </div>

                    <button
                      onClick={handleUnstake}
                      disabled={isUnstaking}
                      className="w-full px-4 py-3 bg-red-500/10 text-red-400 rounded-lg font-bold hover:bg-red-500/20 disabled:bg-gray-700 disabled:text-gray-500 transition-colors"
                    >
                      {isUnstaking ? 'Unstaking...' : 'Unstake'}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="glass-card rounded-xl p-12 text-center border border-white/10">
                  <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-400">No active stake</p>
                  <p className="text-sm text-gray-500 mt-2">Stake SOL to participate in governance</p>
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
                onClick={() => setShowCreateProposal(true)}
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

            {/* Placeholder: No proposals */}
            <div className="glass-card rounded-2xl p-12 text-center border border-white/10">
              <Vote className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-400 text-lg">No proposals yet</p>
              <p className="text-sm text-gray-500 mt-2">Create a proposal to get started with governance</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Proposal Modal */}
      {showCreateProposal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-8 border border-white/10 max-w-2xl w-full mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Create Proposal</h2>
              <button
                onClick={() => setShowCreateProposal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  placeholder="Proposal title"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 outline-none focus:border-white/20 transition-colors"
                  maxLength={256}
                />
                <div className="text-xs text-gray-400 mt-1">
                  {proposalTitle.length}/256
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={proposalDescription}
                  onChange={(e) => setProposalDescription(e.target.value)}
                  placeholder="Proposal description..."
                  rows={5}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 outline-none focus:border-white/20 transition-colors resize-none"
                  maxLength={2000}
                />
                <div className="text-xs text-gray-400 mt-1">
                  {proposalDescription.length}/2000
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={proposalCategory}
                  onChange={(e) => setProposalCategory(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:border-white/20 transition-colors"
                >
                  <option value={0}>General</option>
                  <option value={1}>Technical</option>
                  <option value={2}>Treasury</option>
                  <option value={3}>Fee Structure</option>
                  <option value={4}>Other</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreateProposal}
                  disabled={isCreatingProposal || !proposalTitle.trim() || !proposalDescription.trim()}
                  className="flex-1 px-6 py-3 bg-[var(--color-solana-green)] text-black rounded-lg font-bold hover:bg-[#9FE51C] disabled:bg-gray-700 disabled:text-gray-500 transition-colors"
                >
                  {isCreatingProposal ? 'Creating...' : 'Create Proposal'}
                </button>
                <button
                  onClick={() => setShowCreateProposal(false)}
                  className="flex-1 px-6 py-3 bg-white/5 rounded-lg font-bold hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}

