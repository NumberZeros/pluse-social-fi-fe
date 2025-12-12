import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  username: string;
  address: string;
  avatar: string;
  bio?: string;
  verified?: boolean;
}

interface Post {
  id: string;
  author: User;
  content: string;
  timestamp: Date;
  likes: number;
  reposts: number;
  tips: number;
  images?: string[];
  isLiked: boolean;
  isReposted: boolean;
}

interface SocialStore {
  // User state
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Posts state
  posts: Post[];
  addPost: (post: Post) => void;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  deletePost: (postId: string) => void;

  // Social interactions
  likePost: (postId: string) => void;
  repostPost: (postId: string) => void;
  tipPost: (postId: string, amount: number) => void;

  // Following state
  following: string[];
  follow: (username: string) => void;
  unfollow: (username: string) => void;
}

export const useSocialStore = create<SocialStore>()(
  persist(
    (set) => ({
      // Initial state
      currentUser: null,
      posts: [],
      following: [],

      // User actions
      setCurrentUser: (user) => set({ currentUser: user }),

      // Post actions
      addPost: (post) => set((state) => ({ 
        posts: [post, ...state.posts] 
      })),

      updatePost: (postId, updates) => set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId ? { ...post, ...updates } : post
        ),
      })),

      deletePost: (postId) => set((state) => ({
        posts: state.posts.filter((post) => post.id !== postId),
      })),

      // Social interaction actions
      likePost: (postId) => set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              }
            : post
        ),
      })),

      repostPost: (postId) => set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isReposted: !post.isReposted,
                reposts: post.isReposted ? post.reposts - 1 : post.reposts + 1,
              }
            : post
        ),
      })),

      tipPost: (postId, amount) => set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                tips: post.tips + amount,
              }
            : post
        ),
      })),

      // Following actions
      follow: (username) => set((state) => ({
        following: [...state.following, username],
      })),

      unfollow: (username) => set((state) => ({
        following: state.following.filter((u) => u !== username),
      })),
    }),
    {
      name: 'pulse-social-storage',
    }
  )
);
