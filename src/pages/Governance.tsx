import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useWallet } from '../lib/wallet-adapter';
import { AppLayout } from '../components/layout/AppLayout';
import { useGovernance } from '../hooks/useGovernance';
import {
  Lock,
  Vote,
  Plus,
  X,
  ShieldCheck,
  TrendingUp,
  Clock,
  AlertCircle,
  FileText
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
    isStaking,
    isUnstaking,
    isCreatingProposal,
  } = useGovernance(publicKey || undefined);

  const myVotingPower = stakePosition ? Number(stakePosition.amount) / 1e9 : 0;

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
      toast.success('Proposal created successfully!');
    } catch (error) {
      console.error('Create proposal failed:', error);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-[1280px] mx-auto pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 relative overflow-hidden glass-card rounded-[2.5rem] p-10 border border-white/10"
        >
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--color-value-amber)]/10 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          
          <div className="relative z-10">
            <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tight">
              COMMUNITY <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-value-amber)] to-orange-500">
                GOVERNANCE
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
              Stake your tokens to earn rewards and wield voting power. Shape the future of the protocol through decentralized decision making.
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {[
            {
              label: 'My Staked Balance',
              value: stakePosition ? (Number(stakePosition.amount) / 1e9).toFixed(2) + ' SOL' : '0.00 SOL',
              icon: Lock,
              color: 'text-[var(--color-solana-green)]',
              bg: 'bg-[var(--color-solana-green)]/10'
            },
            {
              label: 'My Voting Power',
              value: myVotingPower.toLocaleString('en-US', { maximumFractionDigits: 0 }),
              icon: ShieldCheck,
              color: 'text-[var(--color-value-amber)]',
              bg: 'bg-[var(--color-value-amber)]/10'
            }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="glass-card rounded-[2rem] p-8 border border-white/10"
            >
              <div className="flex items-center justify-between">
                <div>
                   <div className="text-gray-400 font-medium mb-1">{stat.label}</div>
                   <div className={`text-4xl font-black ${stat.color}`}>{stat.value}</div>
                </div>
                <div className={`w-16 h-16 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center border border-white/5`}>
                   <stat.icon className="w-8 h-8" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="glass-card p-2 rounded-full border border-white/10 flex items-center gap-2">
            {[
              { id: 'stake', label: 'Stake & Earn', icon: TrendingUp },
              { id: 'proposals', label: 'Proposals', icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${
                  activeTab === tab.id 
                    ? 'bg-white text-black shadow-lg shadow-white/10' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stake Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'stake' && (
            <motion.div
              key="stake"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Stake Form */}
              <div className="lg:col-span-7 glass-card rounded-[2.5rem] p-10 border border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-solana-green)]/20 flex items-center justify-center text-[var(--color-solana-green)] border border-[var(--color-solana-green)]/30">
                     <Lock className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-bold">New Stake</h2>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="block text-gray-400 font-bold mb-3 ml-1">Amount to Stake (SOL)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-6 py-5 bg-[#0A0A0A] border border-white/10 rounded-2xl text-white text-2xl placeholder-gray-600 outline-none focus:border-[var(--color-solana-green)] transition-all font-mono"
                      />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500 bg-white/5 px-2 py-1 rounded">SOL</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 font-bold mb-3 ml-1">Lock Period</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {lockOptions.map((option) => (
                        <button
                          key={option.days}
                          onClick={() => setLockPeriodDays(option.days)}
                          className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${
                            lockPeriodDays === option.days
                              ? 'bg-[var(--color-solana-green)] text-black border-[var(--color-solana-green)] shadow-[0_0_20px_rgba(20,241,149,0.3)]'
                              : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                          }`}
                        >
                          <div className="font-black text-sm">{option.label}</div>
                          <div className={`text-[10px] font-bold ${lockPeriodDays === option.days ? 'text-black/70' : 'text-[var(--color-solana-green)]'}`}>{option.apy}% APY</div>
                          <div className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${lockPeriodDays === option.days ? 'bg-black/10' : 'bg-white/10 text-gray-400'}`}>
                            {option.multiplier} Power
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleStake}
                    disabled={isStaking || !stakeAmount || parseFloat(stakeAmount) <= 0}
                    className="w-full py-5 bg-[var(--color-solana-green)] text-black rounded-2xl font-black text-xl hover:bg-[#9FE51C] disabled:bg-white/5 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-xl shadow-[var(--color-solana-green)]/10 hover:shadow-[var(--color-solana-green)]/20 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {isStaking ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"/>
                        Staking...
                      </span>
                    ) : 'Stake Tokens'}
                  </button>
                </div>
              </div>

              {/* My Stake Info */}
              <div className="lg:col-span-5 space-y-6">
                <div className="glass-card rounded-[2.5rem] p-8 border border-white/10 h-full flex flex-col">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    Active Position
                  </h3>

                  {stakePosition ? (
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="space-y-6">
                          <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                            <div className="text-sm text-gray-400 mb-2">Staked Amount</div>
                            <div className="text-3xl font-mono font-bold text-white">
                              {(Number(stakePosition.amount) / 1e9).toFixed(2)} <span className="text-lg text-gray-500">SOL</span>
                            </div>
                          </div>

                          <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                            <div className="text-sm text-gray-400 mb-2">Voting Power</div>
                            <div className="text-3xl font-mono font-bold text-[var(--color-value-amber)]">
                              {myVotingPower.toFixed(0)} <span className="text-lg text-gray-500 opacity-50">VP</span>
                            </div>
                          </div>
                          
                          <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-400 mb-1">Lock Status</div>
                                <div className="font-bold text-white">
                                    {stakePosition.lockPeriod.toNumber() > 0
                                    ? `${Math.ceil(stakePosition.lockPeriod.toNumber() / (24 * 60 * 60))} days remaining`
                                    : 'No Lock / Flexible'}
                                </div>
                            </div>
                            <Lock className={`w-6 h-6 ${stakePosition.lockPeriod.toNumber() > 0 ? 'text-[var(--color-solana-green)]' : 'text-gray-600'}`} />
                          </div>
                        </div>

                        <button
                          onClick={handleUnstake}
                          disabled={isUnstaking}
                          className="w-full mt-8 py-4 bg-red-500/10 text-red-500 rounded-2xl font-bold hover:bg-red-500/20 disabled:bg-white/5 disabled:text-gray-500 disabled:cursor-not-allowed transition-all border border-red-500/20 hover:border-red-500/40"
                        >
                          {isUnstaking ? 'Unstaking...' : 'Unstake Position'}
                        </button>
                      </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white/5 rounded-3xl border border-dashed border-white/10">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                         <Lock className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-gray-300 font-bold text-lg mb-2">No active stakes found</p>
                      <p className="text-sm text-gray-500 max-w-[200px]">
                        Start staking to earn rewards and participate in governance.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'proposals' && (
            <motion.div
              key="proposals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-white/10">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-[var(--color-value-amber)]/10 text-[var(--color-value-amber)]">
                     <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">Governance Requirements</h3>
                    <p className="text-sm text-gray-400">
                       You need at least <span className="text-white font-bold">1,000 VP</span> to create new proposals.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateProposal(true)}
                  disabled={myVotingPower < 1000}
                  className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${
                    myVotingPower >= 1000
                      ? 'bg-[var(--color-value-amber)] text-black hover:bg-yellow-400 shadow-yellow-500/10'
                      : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                  Create Proposal
                </button>
              </div>

              {/* Placeholder: No proposals */}
              <div className="glass-card rounded-[3rem] p-20 text-center border border-white/10 dashed-border bg-gradient-to-br from-white/5 to-transparent">
                <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <Vote className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-3xl font-bold mb-4">No active proposals</h3>
                <p className="text-gray-400 text-lg max-w-md mx-auto">
                  There are currently no active proposals to vote on. Be the first to create one!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Proposal Modal */}
      <AnimatePresence>
        {showCreateProposal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="glass-card rounded-3xl p-8 border border-white/10 max-w-2xl w-full shadow-2xl shadow-black/50"
            >
                <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">Create Proposal</h2>
                <button
                    onClick={() => setShowCreateProposal(false)}
                    className="p-3 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white"
                >
                    <X className="w-6 h-6" />
                </button>
                </div>

                <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2 ml-1">Title</label>
                    <input
                    type="text"
                    value={proposalTitle}
                    onChange={(e) => setProposalTitle(e.target.value)}
                    placeholder="Enter a descriptive title"
                    className="w-full px-5 py-4 bg-[#0A0A0A] border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none focus:border-[var(--color-value-amber)] transition-all font-bold text-lg"
                    maxLength={256}
                    />
                    <div className="text-right text-xs text-gray-500 mt-2 font-mono">
                    {proposalTitle.length}/256
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2 ml-1">Description</label>
                    <textarea
                    value={proposalDescription}
                    onChange={(e) => setProposalDescription(e.target.value)}
                    placeholder="Describe your proposal in detail..."
                    rows={6}
                    className="w-full px-5 py-4 bg-[#0A0A0A] border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none focus:border-[var(--color-value-amber)] transition-colors resize-none text-base leading-relaxed"
                    maxLength={2000}
                    />
                    <div className="text-right text-xs text-gray-500 mt-2 font-mono">
                    {proposalDescription.length}/2000
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2 ml-1">Category</label>
                    <div className="relative">
                        <select
                        value={proposalCategory}
                        onChange={(e) => setProposalCategory(Number(e.target.value))}
                        className="w-full px-5 py-4 bg-[#0A0A0A] border border-white/10 rounded-xl text-white outline-none focus:border-[var(--color-value-amber)] transition-colors appearance-none cursor-pointer"
                        >
                        <option value={0}>General Discussion</option>
                        <option value={1}>Technical Implementation</option>
                        <option value={2}>Treasury Allocation</option>
                        <option value={3}>Fee Structure Update</option>
                        <option value={4}>Other / Miscellaneous</option>
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                           <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           </svg>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                    onClick={() => setShowCreateProposal(false)}
                    className="flex-1 px-6 py-4 bg-white/5 text-white rounded-xl font-bold hover:bg-white/10 transition-colors"
                    >
                    Cancel
                    </button>
                    <button
                    onClick={handleCreateProposal}
                    disabled={isCreatingProposal || !proposalTitle.trim() || !proposalDescription.trim()}
                    className="flex-[2] px-6 py-4 bg-[var(--color-value-amber)] text-black rounded-xl font-bold hover:bg-yellow-400 disabled:bg-white/5 disabled:text-gray-500 transition-all shadow-lg shadow-yellow-500/20"
                    >
                    {isCreatingProposal ? 'Creating Proposal...' : 'Submit Proposal'}
                    </button>
                </div>
                </div>
            </motion.div>
            </div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
