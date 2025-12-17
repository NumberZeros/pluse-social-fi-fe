import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useAirdropStore } from '../stores/useAirdropStore';
import { useUserStore } from '../stores/useUserStore';
import { Copy, Check, Users, Gift, TrendingUp, Award, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { copyToClipboard } from '../utils/clipboard';

export function AirdropDashboard() {
  const criteria = useAirdropStore((state) => state.criteria);
  const getTotalPoints = useAirdropStore((state) => state.getTotalPoints);
  const getFinalPoints = useAirdropStore((state) => state.getFinalPoints);
  const getMaxPoints = useAirdropStore((state) => state.getMaxPoints);
  const getEligibilityPercentage = useAirdropStore(
    (state) => state.getEligibilityPercentage,
  );
  const getEstimatedAllocation = useAirdropStore((state) => state.getEstimatedAllocation);
  const getMultiplier = useAirdropStore((state) => state.getMultiplier);
  const getActiveBonuses = useAirdropStore((state) => state.getActiveBonuses);
  const getTotalBonusMultiplier = useAirdropStore(
    (state) => state.getTotalBonusMultiplier,
  );
  const bonusMultipliers = useAirdropStore((state) => state.bonusMultipliers);
  const markDayActive = useUserStore((state) => state.markDayActive);
  const checkAndUpdateBonuses = useAirdropStore((state) => state.checkAndUpdateBonuses);
  const profile = useUserStore((state) => state.profile);
  const generateReferralCode = useUserStore((state) => state.generateReferralCode);
  const referrals = useUserStore((state) => state.referrals);

  const [copied, setCopied] = useState(false);

  // Sync user activity with criteria
  useEffect(() => {
    markDayActive();
    checkAndUpdateBonuses();

    // Generate referral code if user doesn't have one
    if (profile.walletAddress && !profile.referralCode) {
      generateReferralCode();
    }
  }, [
    markDayActive,
    checkAndUpdateBonuses,
    profile.walletAddress,
    profile.referralCode,
    generateReferralCode,
  ]);

  // Store referrer data in localStorage when code is generated
  useEffect(() => {
    if (profile.referralCode && profile.walletAddress) {
      localStorage.setItem(
        `referrer_${profile.referralCode}`,
        JSON.stringify({
          walletAddress: profile.walletAddress,
          username: profile.username || 'Anonymous',
        }),
      );
    }
  }, [profile.referralCode, profile.walletAddress, profile.username]);

  const totalPoints = getTotalPoints();
  const finalPoints = getFinalPoints();
  const maxPoints = getMaxPoints();
  const eligibilityPercentage = getEligibilityPercentage();
  const activeBonuses = getActiveBonuses();
  const bonusMultiplier = getTotalBonusMultiplier();

  const handleCopyReferralLink = async () => {
    if (!profile.referralCode) {
      toast.error('Referral code not generated yet');
      return;
    }
    const referralLink = `${window.location.origin}/?ref=${profile.referralCode}`;
    const success = await copyToClipboard(referralLink, 'Referral link copied!');
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-[1280px] mx-auto pb-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 relative"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-solana-green)]/30 bg-[var(--color-solana-green)]/10 backdrop-blur-3xl mb-8 relative z-10 shadow-[0_0_20px_rgba(20,241,149,0.2)]">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-solana-green)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--color-solana-green)]"></span>
            </span>
            <span className="text-sm font-bold text-[var(--color-solana-green)] uppercase tracking-wider">
              Early User Airdrop Active
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight relative z-10">
            AIRDROP <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-solana-green)] to-[#14C58E] drop-shadow-[0_0_30px_rgba(20,241,149,0.3)]">
              ELIGIBILITY
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Complete tasks to qualify for the upcoming <span className="text-white font-bold">$PULSE</span> token airdrop.
            <br className="hidden md:block" />
            Early users secure up to <span className="text-[var(--color-solana-green)] font-bold">50x allocation</span>.
          </p>
        </motion.div>

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.01 }}
          className="glass-card rounded-[2.5rem] p-10 mb-12 border border-white/10 relative overflow-hidden group shadow-2xl shadow-[var(--color-solana-green)]/5"
        >
          <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-[var(--color-solana-green)]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-[var(--color-solana-green)]/20 transition-all duration-700" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Gift className="w-8 h-8 text-[var(--color-solana-green)]" />
                <h2 className="text-3xl font-bold text-white">Your Allocation Progress</h2>
              </div>
              <p className="text-gray-400 text-lg max-w-xl">
                Keep participating to maximize your claim. Top tier users unlock exclusive multiplier bonuses.
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-2 mb-1">
                 <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[var(--color-solana-green)] to-emerald-400">
                   {eligibilityPercentage}%
                 </span>
              </div>
              <div className="text-gray-400 font-medium text-lg bg-white/5 px-4 py-2 rounded-xl inline-block border border-white/5">
                {totalPoints} <span className="text-gray-600 mx-2">/</span> {maxPoints} points
              </div>
            </div>
          </div>

          <div className="relative h-6 bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${eligibilityPercentage}%` }}
              transition={{ duration: 1.5, ease: 'circOut' }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--color-solana-green)] via-emerald-400 to-[#14C58E] relative"
            >
               <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
            </motion.div>
          </div>

          {eligibilityPercentage >= 50 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }} 
              className="mt-6 flex items-center gap-3 text-[var(--color-solana-green)] bg-[var(--color-solana-green)]/10 p-4 rounded-2xl border border-[var(--color-solana-green)]/20"
            >
              <Check className="w-6 h-6 bg-[var(--color-solana-green)] text-black rounded-full p-1" />
              <span className="font-bold text-lg">
                You're eligible! Continue completing tasks to increase your allocation multiplier.
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Bonus Multipliers Section */}
        {bonusMultipliers.length > 0 && (
          <div className="mb-12">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold mb-6 flex items-center gap-4"
            >
              <Award className="w-8 h-8 text-[var(--color-lens-lime)]" />
              Bonus Multipliers
              {activeBonuses.length > 0 && (
                <span className="px-3 py-1 bg-[var(--color-lens-lime)]/20 text-[var(--color-lens-lime)] text-sm font-bold rounded-full border border-[var(--color-lens-lime)]/30">
                  {activeBonuses.length} Active
                </span>
              )}
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {bonusMultipliers.map((bonus, index) => (
                <motion.div
                  key={bonus.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className={`glass-card rounded-2xl p-6 border transition-all relative overflow-hidden group ${
                    bonus.active
                      ? 'border-[var(--color-solana-green)] bg-[var(--color-solana-green)]/5'
                      : 'border-white/10 hover:border-white/20 opacity-80 hover:opacity-100'
                  }`}
                >
                   {bonus.active && (
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-solana-green)]/10 via-transparent to-transparent opacity-50" />
                   )}
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <h3 className={`font-bold text-lg ${bonus.active ? 'text-white' : 'text-gray-300'}`}>{bonus.name}</h3>
                    {bonus.active ? (
                      <div className="px-2 py-1 bg-[var(--color-solana-green)] text-black text-xs font-bold rounded shadow-[0_0_10px_rgba(20,241,149,0.4)]">
                        {bonus.multiplier}x
                      </div>
                    ) : (
                      <div className="px-2 py-1 bg-white/10 text-gray-400 text-xs font-bold rounded border border-white/10">
                        {bonus.multiplier}x
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-4 leading-relaxed relative z-10">{bonus.description}</p>
                  <div className="text-xs text-[var(--color-solana-green)] font-mono tracking-wide relative z-10 py-2 px-3 bg-black/40 rounded-lg inline-block border border-white/5">
                     {bonus.requirement}
                  </div>
                </motion.div>
              ))}
            </div>

            {activeBonuses.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 p-6 rounded-2xl border border-[var(--color-solana-green)]/30 bg-gradient-to-r from-[var(--color-solana-green)]/10 to-[#ABFE2C]/10 backdrop-blur-md relative overflow-hidden"
              >
                 <div className="absolute top-0 right-0 w-full h-full bg-[url('/grid.svg')] opacity-10"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                     <TrendingUp className="w-10 h-10 text-[var(--color-solana-green)]" />
                     <div>
                       <p className="text-gray-300 font-medium">Total Multiplier Applied</p>
                       <p className="text-sm text-gray-400 mt-1">
                         Base Points: <span className="text-white font-mono">{totalPoints}</span> → Final Points: <span className="text-white font-mono font-bold">{finalPoints}</span>
                       </p>
                     </div>
                  </div>
                  <div className="text-5xl font-black text-[var(--color-solana-green)] drop-shadow-[0_0_15px_rgba(20,241,149,0.3)]">
                    {bonusMultiplier.toFixed(2)}x
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Referral System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
               <Users className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold">Referral Program</h2>
            <div className="h-px bg-white/10 flex-1 ml-4" />
          </div>

          <div className="glass-card rounded-[2rem] p-8 border border-white/10 bg-gradient-to-b from-white/5 to-black/40">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Referral Link Card */}
              <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-bold mb-2 text-white">Share Your Link</h3>
                    <p className="text-gray-400 text-sm">
                      Earn bonus points when friends join and post.
                    </p>
                </div>
                
                {profile.referralCode ? (
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative flex gap-2">
                       <input
                         type="text"
                         value={`${window.location.origin}/?ref=${profile.referralCode}`}
                         readOnly
                         className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-4 text-white font-mono text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                       />
                       <button
                         onClick={handleCopyReferralLink}
                         className={`px-6 rounded-xl font-bold transition-all flex items-center gap-2 ${copied ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'}`}
                       >
                         {copied ? (
                           <><Check className="w-4 h-4" /> Copied</>
                         ) : (
                           <><Copy className="w-4 h-4" /> Copy</>
                         )}
                       </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 animate-pulse text-center text-gray-400">
                    Generating your unique referral code...
                  </div>
                )}
                
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-sm text-purple-200 leading-relaxed">
                   <strong className="text-white">Tip:</strong> Share this link on Twitter and Discord. You earn 10% of your referrals' points forever!
                </div>
              </div>

              {/* Referral Stats Card */}
              <div>
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Your Network</h3>
                    <div className="text-sm font-medium px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
                       Level 1
                    </div>
                 </div>

                <div className="flex items-end gap-3 mb-4">
                  <div className="text-5xl font-black text-white">
                    {profile.referralsCount}
                  </div>
                  <div className="text-gray-500 font-medium mb-2">/ 5 referrals</div>
                  <div className="ml-auto text-sm text-[var(--color-solana-green)] font-bold mb-2 bg-[var(--color-solana-green)]/10 px-3 py-1 rounded-lg">
                    Next Reward: 1.2x Multiplier
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/5 rounded-full h-4 mb-4 overflow-hidden border border-white/5">
                  <motion.div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((profile.referralsCount / 5) * 100, 100)}%` }}
                  >
                     <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                  </motion.div>
                </div>

                {profile.referralsCount >= 5 ? (
                  <div className="text-[#50C878] font-bold flex items-center gap-2 p-3 bg-[#50C878]/10 rounded-xl border border-[#50C878]/20">
                    <Check className="w-5 h-5" /> Bonus Unlocked! You're a top referrer.
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm p-3 bg-white/5 rounded-xl border border-white/5">
                    Need <span className="text-white font-bold">{5 - profile.referralsCount} more</span> referrals to unlock the next multiplier tier.
                  </div>
                )}
              </div>
            </div>

            {/* Referred Users List */}
            {referrals.size > 0 && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="text-sm text-gray-400 mb-4 font-bold uppercase tracking-wider">
                  Latest Signups
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from(referrals)
                    .slice(0, 6)
                    .map((address) => (
                      <div
                        key={address}
                        className="bg-black/40 border border-white/10 rounded-full pl-2 pr-4 py-2 text-xs font-mono text-gray-300 flex items-center gap-2 hover:border-white/30 transition-colors"
                      >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[8px] text-white font-bold">
                           {address.slice(0,2)}
                        </div>
                        {address.slice(0, 4)}...{address.slice(-4)}
                      </div>
                    ))}
                    {referrals.size > 6 && (
                      <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-400 flex items-center">
                        +{referrals.size - 6} others
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Criteria Grid */}
        <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8 pl-2 border-l-4 border-[var(--color-solana-green)]">Daily Tasks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {criteria.map((item, index) => (
                <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="glass-card rounded-[2rem] p-8 border border-white/10 hover:border-white/20 transition-all group hover:-translate-y-1"
                >
                <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--color-solana-green)] transition-colors">
                        {item.title}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
                    </div>
                    <div className="text-right pl-4">
                    <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
                        {item.points}
                    </div>
                    <div className="text-xs font-bold text-[var(--color-solana-green)] uppercase tracking-wider">PTS</div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium">Progress</span>
                    <span className="font-bold text-white">
                        {item.progress} <span className="text-gray-600">/</span> {item.target}
                    </span>
                    </div>
                    <div className="relative h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.progress / item.target) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`absolute inset-y-0 left-0 rounded-full ${
                        item.completed
                            ? 'bg-[var(--color-solana-green)]'
                            : 'bg-white/20'
                        }`}
                    />
                    </div>
                </div>

                {item.completed ? (
                    <div className="mt-6 flex items-center justify-center gap-2 text-[var(--color-solana-green)] bg-[var(--color-solana-green)]/10 py-3 rounded-xl border border-[var(--color-solana-green)]/20 font-bold">
                    <Check className="w-5 h-5" />
                    Completed
                    </div>
                ) : (
                    <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all border border-white/10 hover:border-white/20"
                    >
                    Go to Task
                    </motion.button>
                )}
                </motion.div>
            ))}
            </div>
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-card rounded-[2rem] p-10 border border-white/10 bg-gradient-to-b from-white/5 to-black/60 text-center relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 mb-6 border border-white/10">
               <Calendar className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-3xl font-bold mb-4">Estimated Snapshot: Q1 2025</h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
                The snapshot will be taken on a random date in Q1 2025. Continue being active
                to maximize your allocation. <span className="text-white font-bold">Top 10k early users</span> will receive 5-50x the base
                allocation.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
                <div className="px-8 py-6 bg-black/40 rounded-2xl border border-white/5 min-w-[200px]">
                <div className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Estimated Allocation</div>
                <div className="text-3xl font-black text-[var(--color-solana-green)]">
                    {getEstimatedAllocation()} <span className="text-lg text-gray-500">PULSE</span>
                </div>
                </div>
                <div className="px-8 py-6 bg-black/40 rounded-2xl border border-white/5 min-w-[200px]">
                <div className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Current Multiplier</div>
                <div className="text-3xl font-black text-white">
                    {getMultiplier()}x
                </div>
                </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
