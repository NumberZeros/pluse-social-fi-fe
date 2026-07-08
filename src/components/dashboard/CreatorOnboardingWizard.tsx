import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useProfile } from '../../hooks/useProfile';
import { useSocialFi } from '../../hooks/useSocialFi';
import { useShares } from '../../hooks/useShares';
import { useQueryClient } from '@tanstack/react-query';
import { useTimeline } from '../../hooks/useFeed';
import { ProfileCreationModal } from '../profile/ProfileCreationModal';
import { Check, ChevronRight, User, TrendingUp, MessageSquare } from 'lucide-react';
import { Button, MotionCard } from '../../design-system';
import { trackEvent } from '../../lib/analytics';

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
  const trackedStepsRef = useRef<Set<WizardStep>>(new Set());

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

  useEffect(() => {
    const completed: { step: WizardStep; done: boolean }[] = [
      { step: 'profile', done: hasProfile },
      { step: 'pool', done: hasPool },
      { step: 'post', done: hasFirstPost },
    ];

    for (const { step, done } of completed) {
      if (done && !trackedStepsRef.current.has(step)) {
        trackedStepsRef.current.add(step);
        trackEvent('wizard_step_completed', { step });
      }
    }
  }, [hasProfile, hasPool, hasFirstPost]);

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
    <MotionCard
      variant="glass"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[2rem] p-8 border border-primary/30 mb-12"
    >
      <h2 className="text-2xl font-black mb-2">Get started as a creator</h2>
      <p className="text-muted mb-8">Complete these steps to launch your supporter community.</p>

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
                  ? 'border-primary/40 bg-primary/10'
                  : active
                    ? 'border-border bg-surface-2'
                    : 'border-border opacity-50'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  done ? 'bg-primary text-background' : 'bg-surface-2 text-muted'
                }`}
              >
                {done ? <Check className="w-5 h-5" /> : step.icon}
              </div>
              <span className="font-semibold text-sm">{step.label}</span>
            </div>
          );
        })}
      </div>

      <div className="bg-background/30 rounded-xl p-6 border border-border">
        {currentStep === 'profile' && (
          <div>
            <h3 className="font-bold text-lg mb-2">Step 1: Create your profile</h3>
            <p className="text-muted text-sm mb-4">
              Claim your on-chain username so fans can find you.
            </p>
            <Button onClick={() => setShowProfileModal(true)} size="sm">
              Create profile
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {currentStep === 'pool' && (
          <div>
            <h3 className="font-bold text-lg mb-2">Step 2: Launch Supporter Shares</h3>
            <p className="text-muted text-sm mb-4">
              Initialize your supporter pool so fans can back you and unlock exclusive content.
            </p>
            <Button
              onClick={handleInitPool}
              disabled={isInitializingPool || poolLoading}
              size="sm"
            >
              {isInitializingPool ? 'Launching...' : 'Launch Supporter Shares'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {currentStep === 'post' && !hasFirstPost && (
          <div>
            <h3 className="font-bold text-lg mb-2">Step 3: Post your first update</h3>
            <p className="text-muted text-sm mb-4">
              Share a public welcome post or gate exclusive content to supporters only.
            </p>
            <Button onClick={() => navigate('/feed')} size="sm">
              Go to Feed
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {currentStep === 'post' && hasFirstPost && (
          <div>
            <h3 className="font-bold text-lg mb-2">All set!</h3>
            <p className="text-muted text-sm">
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
    </MotionCard>
  );
}
