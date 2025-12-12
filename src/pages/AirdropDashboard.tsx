import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAirdropStore } from '../stores/useAirdropStore';
import { useUserStore } from '../stores/useUserStore';
import { Copy, Check, Users } from 'lucide-react';
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
    <div className="bg-black min-h-screen text-white">
      <Navbar />

      <div className="max-w-[1200px] mx-auto px-4 pt-24 pb-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-solana-green)]/30 bg-[var(--color-solana-green)]/10 backdrop-blur-sm mb-6">
            <span className="w-2 h-2 bg-[var(--color-solana-green)] rounded-full animate-pulse" />
            <span className="text-sm font-medium text-[var(--color-solana-green)]">
              Early User Airdrop Active
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">
            Airdrop <span className="text-gradient-lens">Eligibility</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Complete tasks to qualify for the upcoming PULSE token airdrop. Early users
            get 5-50x allocation.
          </p>
        </motion.div>

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-3xl p-8 mb-8 border border-white/10 bg-gradient-to-br from-[var(--color-solana-green)]/5 to-transparent relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-solana-green)]/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Your Progress</h2>
                <p className="text-gray-400">
                  Keep going to maximize your airdrop allocation
                </p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold text-[var(--color-solana-green)]">
                  {eligibilityPercentage}%
                </div>
                <div className="text-gray-400">
                  {totalPoints} / {maxPoints} points
                </div>
              </div>
            </div>

            <div className="relative h-4 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${eligibilityPercentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--color-solana-green)] to-[#14C58E] rounded-full"
              />
            </div>

            {eligibilityPercentage >= 50 && (
              <div className="mt-4 flex items-center gap-2 text-[var(--color-solana-green)]">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-bold">
                  You're eligible! Complete more to increase allocation
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Bonus Multipliers Section */}
        {bonusMultipliers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>🎁</span>
              Bonus Multipliers
              {activeBonuses.length > 0 && (
                <span className="px-3 py-1 bg-[#D4AF37]/20 text-[#D4AF37] text-sm rounded-full">
                  {activeBonuses.length} Active
                </span>
              )}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {bonusMultipliers.map((bonus, index) => (
                <motion.div
                  key={bonus.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className={`glass-card rounded-xl p-4 border transition-all ${
                    bonus.active
                      ? 'border-[#D4AF37] bg-gradient-to-br from-[#D4AF37]/20 to-transparent shadow-lg shadow-[#D4AF37]/20'
                      : 'border-white/10 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-sm">{bonus.name}</h3>
                    {bonus.active ? (
                      <div className="px-2 py-1 bg-[#D4AF37] text-black text-xs font-bold rounded">
                        ✓ {bonus.multiplier}x
                      </div>
                    ) : (
                      <div className="px-2 py-1 bg-white/10 text-gray-400 text-xs font-bold rounded">
                        {bonus.multiplier}x
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{bonus.description}</p>
                  <div className="text-xs text-gray-500 italic">{bonus.requirement}</div>
                </motion.div>
              ))}
            </div>

            {activeBonuses.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-4 bg-gradient-to-r from-[#D4AF37]/10 to-[#ABFE2C]/10 rounded-xl border border-[#D4AF37]/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Your Bonus Multiplier</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Base Points: {totalPoints} → Final Points: {finalPoints}
                    </p>
                  </div>
                  <div className="text-3xl font-bold text-[#D4AF37]">
                    {bonusMultiplier.toFixed(2)}x
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Referral System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-[#50C878]" />
            <h2 className="text-2xl font-bold">🔗 Referral Program</h2>
          </div>

          <div className="glass-card rounded-xl p-6 border border-white/10">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Referral Link Card */}
              <div>
                <div className="text-sm text-gray-400 mb-2">Your Referral Link</div>
                {profile.referralCode ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/?ref=${profile.referralCode}`}
                      readOnly
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#50C878]/50"
                    />
                    <button
                      onClick={handleCopyReferralLink}
                      className="px-4 py-2 bg-gradient-to-r from-[#50C878] to-[#3BA565] rounded-lg hover:opacity-90 transition-opacity"
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">Generating referral code...</div>
                )}
                <div className="mt-3 text-xs text-gray-500">
                  Share this link with friends. When they join and complete their first
                  post, you'll earn referral credit!
                </div>
              </div>

              {/* Referral Stats Card */}
              <div>
                <div className="text-sm text-gray-400 mb-3">Referral Progress</div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-3xl font-bold text-[#50C878]">
                    {profile.referralsCount}
                  </div>
                  <div className="text-gray-400">/</div>
                  <div className="text-2xl font-bold text-gray-500">5</div>
                  <div className="text-sm text-gray-500">referrals for 1.2x bonus</div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/5 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-[#50C878] to-[#3BA565] h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min((profile.referralsCount / 5) * 100, 100)}%`,
                    }}
                  />
                </div>

                {profile.referralsCount >= 5 ? (
                  <div className="text-sm text-[#50C878] font-bold">
                    ✓ Bonus Unlocked!
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    {5 - profile.referralsCount} more{' '}
                    {5 - profile.referralsCount === 1 ? 'referral' : 'referrals'} needed
                  </div>
                )}
              </div>
            </div>

            {/* Referred Users List */}
            {referrals.size > 0 && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="text-sm text-gray-400 mb-3">
                  Your Referrals ({referrals.size})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {Array.from(referrals)
                    .slice(0, 6)
                    .map((address) => (
                      <div
                        key={address}
                        className="bg-white/5 rounded-lg px-3 py-2 text-xs font-mono text-gray-400 flex items-center gap-2"
                      >
                        <Users className="w-3 h-3 text-[#50C878]" />
                        {address.slice(0, 6)}...{address.slice(-4)}
                      </div>
                    ))}
                </div>
                {referrals.size > 6 && (
                  <div className="text-xs text-gray-500 mt-2">
                    +{referrals.size - 6} more
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Criteria Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {criteria.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="glass-card rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1 group-hover:text-[var(--color-solana-green)] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[var(--color-solana-green)]">
                    +{item.points}
                  </div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Progress</span>
                  <span className="font-medium">
                    {item.progress} / {item.target}
                  </span>
                </div>
                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.progress / item.target) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`absolute inset-y-0 left-0 rounded-full ${
                      item.completed
                        ? 'bg-[var(--color-solana-green)]'
                        : 'bg-gradient-to-r from-gray-600 to-gray-500'
                    }`}
                  />
                </div>
              </div>

              {item.completed ? (
                <div className="mt-4 flex items-center gap-2 text-[var(--color-solana-green)]">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-bold">Completed</span>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg font-bold transition-colors"
                >
                  Continue
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 glass-card rounded-2xl p-8 border border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/5 to-transparent text-center"
        >
          <h3 className="text-2xl font-bold mb-4">Snapshot Date: Q1 2025</h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            The snapshot will be taken on a random date in Q1 2025. Continue being active
            to maximize your allocation. Top 10k early users will receive 5-50x the base
            allocation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-6 py-3 bg-white/5 rounded-xl">
              <div className="text-sm text-gray-400">Estimated Allocation</div>
              <div className="text-2xl font-bold text-[#D4AF37]">
                {getEstimatedAllocation()} PULSE
              </div>
            </div>
            <div className="px-6 py-3 bg-white/5 rounded-xl">
              <div className="text-sm text-gray-400">Multiplier</div>
              <div className="text-2xl font-bold text-[var(--color-solana-green)]">
                {getMultiplier()}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
