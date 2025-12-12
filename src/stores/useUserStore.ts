import { create } from 'zustand';

interface UserProfile {
  username: string | null;
  walletAddress: string | null;
  avatar: string | null;
  verified: boolean;
  totalTipsSent: number;
  totalTipsReceived: number;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  referralCode: string | null;
  referredBy: string | null;
  referralsCount: number;
}

interface UserStore {
  profile: UserProfile;
  activeDays: Set<string>;
  following: Set<string>; // usernames being followed
  likedPosts: Set<string>; // post IDs that user liked
  repostedPosts: Set<string>; // post IDs that user reposted
  bookmarkedPosts: Set<string>; // post IDs that user bookmarked
  referrals: Set<string>; // wallet addresses of referred users

  // Actions
  setUsername: (username: string) => void;
  setWalletAddress: (address: string) => void;
  incrementTipsSent: (amount: number) => void;
  incrementTipsReceived: (amount: number) => void;
  incrementPostsCount: () => void;
  markDayActive: () => void;
  follow: (username: string) => void;
  generateReferralCode: () => void;
  setReferredBy: (code: string) => void;
  addReferral: (walletAddress: string) => void;
  unfollow: (username: string) => void;
  isFollowing: (username: string) => boolean;
  likePost: (postId: string) => void;
  unlikePost: (postId: string) => void;
  isPostLiked: (postId: string) => boolean;
  repostPost: (postId: string) => void;
  unrepostPost: (postId: string) => void;
  isPostReposted: (postId: string) => boolean;
  bookmarkPost: (postId: string) => void;
  unbookmarkPost: (postId: string) => void;
  isPostBookmarked: (postId: string) => boolean;
  resetProfile: () => void;
}

const defaultProfile: UserProfile = {
  username: null,
  walletAddress: null,
  avatar: null,
  verified: false,
  totalTipsSent: 0,
  totalTipsReceived: 0,
  postsCount: 0,
  followersCount: 0,
  followingCount: 0,
  referralCode: null,
  referredBy: null,
  referralsCount: 0,
};

// Generate a unique 8-character referral code
const generateCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const useUserStore = create<UserStore>()((set, get) => ({
  profile: defaultProfile,
  activeDays: new Set<string>(),
  following: new Set<string>(),
  likedPosts: new Set<string>(),
  repostedPosts: new Set<string>(),
  bookmarkedPosts: new Set<string>(),
  referrals: new Set<string>(),

  setUsername: (username) =>
    set((state) => ({
      profile: { ...state.profile, username },
    })),

  setWalletAddress: (address) =>
    set((state) => ({
      profile: { ...state.profile, walletAddress: address },
    })),

  incrementTipsSent: (amount) =>
    set((state) => ({
      profile: {
        ...state.profile,
        totalTipsSent: state.profile.totalTipsSent + amount,
      },
    })),

  incrementTipsReceived: (amount) =>
    set((state) => ({
      profile: {
        ...state.profile,
        totalTipsReceived: state.profile.totalTipsReceived + amount,
      },
    })),

  incrementPostsCount: () =>
    set((state) => ({
      profile: {
        ...state.profile,
        postsCount: state.profile.postsCount + 1,
      },
    })),

  markDayActive: () =>
    set((state) => {
      const today = new Date().toISOString().split('T')[0];
      const newActiveDays = new Set(state.activeDays);
      newActiveDays.add(today);
      return { activeDays: newActiveDays };
    }),

  follow: (username) =>
    set((state) => {
      const newFollowing = new Set(state.following);
      newFollowing.add(username);
      return {
        following: newFollowing,
        profile: {
          ...state.profile,
          followingCount: state.profile.followingCount + 1,
        },
      };
    }),

  unfollow: (username) =>
    set((state) => {
      const newFollowing = new Set(state.following);
      newFollowing.delete(username);
      return {
        following: newFollowing,
        profile: {
          ...state.profile,
          followingCount: Math.max(0, state.profile.followingCount - 1),
        },
      };
    }),

  isFollowing: (username) => get().following.has(username),

  likePost: (postId) =>
    set((state) => {
      const newLikedPosts = new Set(state.likedPosts);
      newLikedPosts.add(postId);
      return { likedPosts: newLikedPosts };
    }),

  unlikePost: (postId) =>
    set((state) => {
      const newLikedPosts = new Set(state.likedPosts);
      newLikedPosts.delete(postId);
      return { likedPosts: newLikedPosts };
    }),

  isPostLiked: (postId) => get().likedPosts.has(postId),

  repostPost: (postId) =>
    set((state) => {
      const newRepostedPosts = new Set(state.repostedPosts);
      newRepostedPosts.add(postId);
      return { repostedPosts: newRepostedPosts };
    }),

  unrepostPost: (postId) =>
    set((state) => {
      const newRepostedPosts = new Set(state.repostedPosts);
      newRepostedPosts.delete(postId);
      return { repostedPosts: newRepostedPosts };
    }),

  isPostReposted: (postId) => get().repostedPosts.has(postId),

  bookmarkPost: (postId) =>
    set((state) => {
      const newBookmarkedPosts = new Set(state.bookmarkedPosts);
      newBookmarkedPosts.add(postId);
      return { bookmarkedPosts: newBookmarkedPosts };
    }),

  unbookmarkPost: (postId) =>
    set((state) => {
      const newBookmarkedPosts = new Set(state.bookmarkedPosts);
      newBookmarkedPosts.delete(postId);
      return { bookmarkedPosts: newBookmarkedPosts };
    }),

  isPostBookmarked: (postId) => get().bookmarkedPosts.has(postId),

  generateReferralCode: () =>
    set((state) => {
      // Only generate if user doesn't have one yet
      if (state.profile.referralCode) return state;

      const newCode = generateCode();
      return {
        profile: { ...state.profile, referralCode: newCode },
      };
    }),

  setReferredBy: (code) =>
    set((state) => {
      // Only allow setting once
      if (state.profile.referredBy) return state;

      return {
        profile: { ...state.profile, referredBy: code },
      };
    }),

  addReferral: (walletAddress) =>
    set((state) => {
      const newReferrals = new Set(state.referrals);

      // Avoid duplicates
      if (newReferrals.has(walletAddress)) return state;

      newReferrals.add(walletAddress);

      return {
        referrals: newReferrals,
        profile: {
          ...state.profile,
          referralsCount: state.profile.referralsCount + 1,
        },
      };
    }),

  resetProfile: () =>
    set({
      profile: defaultProfile,
      activeDays: new Set<string>(),
      following: new Set<string>(),
      likedPosts: new Set<string>(),
      repostedPosts: new Set<string>(),
      bookmarkedPosts: new Set<string>(),
      referrals: new Set<string>(),
    }),
}));
