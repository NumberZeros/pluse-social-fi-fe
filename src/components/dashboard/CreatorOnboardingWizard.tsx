import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useProfile } from '../../hooks/useProfile';
import { useSocialFi } from '../../hooks/useSocialFi';
import { useShares } from '../../hooks/useShares';
import { useQueryClient } from '@tanstack/react-query';
import { useTimeline } from '../../hooks/useFeed';
import { ProfileCreationModal } from '../profile/ProfileCreationModal';
import { Check, ChevronRight, User, TrendingUp, MessageSquare } from 'lucide-react';

type WizardStep = 'profile' | 'pool' | 'post';

const STEPS: { id: WizardStep; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Create profile', icon: <User className="w-5 h-5" /> },
  { id: 'pool', label: 'Launch Supporter Shares', icon: <TrendingUp className="w-5 h-5" /> },
  { id: 'post', label: 'First post', icon: <MessageSquare className="w-5 h-5" /> },
];

export function CreatorOnboardingWizard({ onComplete }: { onComplete?: () => void }) {
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();
  const { hasProfile } = useProfile(publicKey || undefined);
  const { initializeCreatorPool } = useSocialFi();
  const { shares, isLoading: poolLoading } = useShares(publicKey || undefined);
  const { data: timeline = [] } = useTimeline();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isInitializingPool, setIsInitializingPool] = useState(false);

  const postCount = publicKey
    ? timeline.filter((p) => p.author === publicKey.toBase58()).length
    : 0;

  const hasPool = !!shares;
  const hasFirstPost = postCount > 0;
  const isComplete = hasProfile && hasPool && hasFirstPost;

  useEffect(() => {
    if (isComplete) {
      onComplete?.();
    }
  }, [isComplete, onComplete]);

  const currentStep: WizardStep = !hasProfile
    ? 'profile'
    : !hasPool
      ? 'pool'
      : !hasFirstPost
        ? 'post'
        : 'post';

  const stepIndex = STEPS.findIndex((s) => s.id === currentStep);

  const handleInitPool = async () => {
    setIsInitializingPool(true);
    try {
      await initializeCreatorPool();
      queryClient.invalidateQueries({ queryKey: ['shares'] });
      queryClient.invalidateQueries({ queryKey: ['sharePrice'] });
      queryClient.invalidateQueries({ queryKey: ['all_creator_pools'] });
      queryClient.invalidateQueries({ queryKey: ['user_share_holdings'] });
    } finally {
      setIsInitializingPool(false);
    }
  };

  if (isComplete) {
    return null;
  }

  if (poolLoading && !hasPool) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-[2rem] p-8 border border-[var(--color-solana-green)]/30 mb-12"
    >
      <h2 className="text-2xl font-black mb-2">Get started as a creator</h2>
      <p className="text-gray-400 mb-8">Complete these steps to launch your supporter community.</p>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {STEPS.map((step, index) => {
          const done =
            (step.id === 'profile' && hasProfile) ||
            (step.id === 'pool' && hasPool) ||
            (step.id === 'post' && hasFirstPost);
          const active = index === stepIndex;

          return (
            <div
              key={step.id}
              className={`flex-1 flex items-center gap-3 p-4 rounded-xl border ${
                done
                  ? 'border-[var(--color-solana-green)]/40 bg-[var(--color-solana-green)]/10'
                  : active
                    ? 'border-white/20 bg-white/5'
                    : 'border-white/5 opacity-50'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  done ? 'bg-[var(--color-solana-green)] text-black' : 'bg-white/10 text-gray-400'
                }`}
              >
                {done ? <Check className="w-5 h-5" /> : step.icon}
              </div>
              <span className="font-semibold text-sm">{step.label}</span>
            </div>
          );
        })}
      </div>

      <div className="bg-black/30 rounded-xl p-6 border border-white/10">
        {currentStep === 'profile' && (
          <div>
            <h3 className="font-bold text-lg mb-2">Step 1: Create your profile</h3>
            <p className="text-gray-400 text-sm mb-4">
              Claim your on-chain username so fans can find you.
            </p>
            <button
              onClick={() => setShowProfileModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-solana-green)] text-black rounded-xl font-bold"
            >
              Create profile
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {currentStep === 'pool' && (
          <div>
            <h3 className="font-bold text-lg mb-2">Step 2: Launch Supporter Shares</h3>
            <p className="text-gray-400 text-sm mb-4">
              Initialize your supporter pool so fans can back you and unlock exclusive content.
            </p>
            <button
              onClick={handleInitPool}
              disabled={isInitializingPool || poolLoading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-solana-green)] text-black rounded-xl font-bold disabled:opacity-50"
            >
              {isInitializingPool ? 'Launching...' : 'Launch Supporter Shares'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {currentStep === 'post' && !hasFirstPost && (
          <div>
            <h3 className="font-bold text-lg mb-2">Step 3: Post your first update</h3>
            <p className="text-gray-400 text-sm mb-4">
              Share a public welcome post or gate exclusive content to supporters only.
            </p>
            <button
              onClick={() => navigate('/feed')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-solana-green)] text-black rounded-xl font-bold"
            >
              Go to Feed
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {currentStep === 'post' && hasFirstPost && (
          <div>
            <h3 className="font-bold text-lg mb-2">All set!</h3>
            <p className="text-gray-400 text-sm">
              Your profile, Supporter Shares pool, and first post are live. Head to your dashboard
              to track your community.
            </p>
          </div>
        )}
      </div>

      {showProfileModal && (
        <ProfileCreationModal
          isOpen
          onClose={() => {
            setShowProfileModal(false);
            queryClient.invalidateQueries({ queryKey: ['profile'] });
          }}
        />
      )}
    </motion.div>
  );
}
