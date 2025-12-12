import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AirdropCriteria {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  points: number;
  completed: boolean;
}

export interface BonusMultiplier {
  id: string;
  name: string;
  description: string;
  multiplier: number;
  active: boolean;
  requirement: string;
}

interface AirdropStore {
  criteria: AirdropCriteria[];
  bonusMultipliers: BonusMultiplier[];
  joinedDate: string | null;
  referralCount: number;

  // Computed values
  getTotalPoints: () => number;
  getMaxPoints: () => number;
  getEligibilityPercentage: () => number;
  getEstimatedAllocation: () => string;
  getMultiplier: () => string;
  getActiveBonuses: () => BonusMultiplier[];
  getTotalBonusMultiplier: () => number;
  getFinalPoints: () => number;

  // Actions
  updateProgress: (id: string, progress: number) => void;
  markCompleted: (id: string) => void;
  initializeCriteria: () => void;
  setJoinedDate: (date: string) => void;
  addReferral: () => void;
  checkAndUpdateBonuses: () => void;
}

const initialCriteria: AirdropCriteria[] = [
  {
    id: 'posts',
    title: 'Create Posts',
    description: 'Share your thoughts on Pulse',
    progress: 0,
    target: 10,
    points: 100,
    completed: false,
  },
  {
    id: 'tips_sent',
    title: 'Send Tips',
    description: 'Support creators with tips',
    progress: 0,
    target: 5,
    points: 150,
    completed: false,
  },
  {
    id: 'username',
    title: 'Mint Username',
    description: 'Claim your @handle identity',
    progress: 0,
    target: 1,
    points: 200,
    completed: false,
  },
  {
    id: 'active_days',
    title: 'Active Days',
    description: 'Be active on the platform',
    progress: 0,
    target: 7,
    points: 250,
    completed: false,
  },
  {
    id: 'engagement',
    title: 'Engagement',
    description: 'Like, repost, and comment',
    progress: 0,
    target: 20,
    points: 100,
    completed: false,
  },
];

export const useAirdropStore = create<AirdropStore>()(
  persist(
    (set, get) => ({
      criteria: initialCriteria,
      bonusMultipliers: [
        {
          id: 'early_adopter',
          name: 'Early Adopter',
          description: 'Joined in the first week',
          multiplier: 1.5,
          active: false,
          requirement: 'Join within first 7 days',
        },
        {
          id: 'content_creator',
          name: 'Content Creator',
          description: 'Created 10+ quality posts',
          multiplier: 1.3,
          active: false,
          requirement: 'Create 10+ posts',
        },
        {
          id: 'community_builder',
          name: 'Community Builder',
          description: 'Referred 5+ friends',
          multiplier: 1.2,
          active: false,
          requirement: 'Refer 5+ users',
        },
        {
          id: 'whale_tipper',
          name: 'Whale Tipper',
          description: 'Sent over 1 SOL in tips',
          multiplier: 1.2,
          active: false,
          requirement: 'Tip >1 SOL total',
        },
      ],
      joinedDate: null,
      referralCount: 0,

      getTotalPoints: () => {
        const { criteria } = get();
        return criteria.reduce((sum, c) => sum + (c.completed ? c.points : 0), 0);
      },

      getMaxPoints: () => {
        const { criteria } = get();
        return criteria.reduce((sum, c) => sum + c.points, 0);
      },

      getEligibilityPercentage: () => {
        const total = get().getTotalPoints();
        const max = get().getMaxPoints();
        return Math.round((total / max) * 100);
      },

      getActiveBonuses: () => {
        return get().bonusMultipliers.filter((b) => b.active);
      },

      getTotalBonusMultiplier: () => {
        const activeBonuses = get().getActiveBonuses();
        if (activeBonuses.length === 0) return 1;

        // Multiply all active bonuses (max 2.5x as per tokenomics)
        const total = activeBonuses.reduce((acc, b) => acc * b.multiplier, 1);
        return Math.min(total, 2.5);
      },

      getFinalPoints: () => {
        const basePoints = get().getTotalPoints();
        const multiplier = get().getTotalBonusMultiplier();
        return Math.round(basePoints * multiplier);
      },

      getEstimatedAllocation: () => {
        const total = get().getFinalPoints();
        if (total >= 500) return '2,500';
        if (total >= 300) return '1,000';
        return '500';
      },

      getMultiplier: () => {
        const total = get().getTotalPoints();
        if (total >= 500) return '50x';
        if (total >= 300) return '25x';
        return '5x';
      },

      updateProgress: (id, progress) =>
        set((state) => ({
          criteria: state.criteria.map((c) =>
            c.id === id
              ? {
                  ...c,
                  progress: Math.min(progress, c.target),
                  completed: progress >= c.target,
                }
              : c,
          ),
        })),

      markCompleted: (id) =>
        set((state) => ({
          criteria: state.criteria.map((c) =>
            c.id === id ? { ...c, completed: true, progress: c.target } : c,
          ),
        })),

      initializeCriteria: () => set({ criteria: initialCriteria }),

      setJoinedDate: (date) => {
        set({ joinedDate: date });
        get().checkAndUpdateBonuses();
      },

      addReferral: () => {
        set((state) => ({ referralCount: state.referralCount + 1 }));
        get().checkAndUpdateBonuses();
      },

      checkAndUpdateBonuses: () => {
        const state = get();
        const { criteria, joinedDate, referralCount, bonusMultipliers } = state;

        const updatedBonuses = bonusMultipliers.map((bonus) => {
          switch (bonus.id) {
            case 'early_adopter':
              // Check if joined within first 7 days (Week 1)
              if (joinedDate) {
                const launchDate = new Date('2024-12-01'); // Mock launch date
                const joined = new Date(joinedDate);
                const daysSinceLaunch = Math.floor(
                  (joined.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24),
                );
                return { ...bonus, active: daysSinceLaunch <= 7 };
              }
              return bonus;

            case 'content_creator': {
              // Check if created 10+ posts
              const postsCriteria = criteria.find((c) => c.id === 'posts');
              return { ...bonus, active: (postsCriteria?.progress || 0) >= 10 };
            }

            case 'community_builder':
              // Check if referred 5+ users
              return { ...bonus, active: referralCount >= 5 };

            case 'whale_tipper': {
              // Check if sent >1 SOL in tips (will be tracked in UserStore)
              // For now, checking if completed tips_sent criteria (5 tips)
              const tipsCriteria = criteria.find((c) => c.id === 'tips_sent');
              return { ...bonus, active: tipsCriteria?.completed || false };
            }

            default:
              return bonus;
          }
        });

        set({ bonusMultipliers: updatedBonuses });
      },
    }),
    {
      name: 'pulse-airdrop-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Initialize joined date if not set
          if (!state.joinedDate) {
            state.setJoinedDate(new Date().toISOString());
          }
          // Check bonuses on load
          state.checkAndUpdateBonuses();
        }
      },
    },
  ),
);
