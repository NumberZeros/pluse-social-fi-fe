import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Navbar } from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { CreatePost } from '../components/feed/CreatePost';
import PostCard from '../components/feed/PostCard';
import TrendingSidebar from '../components/feed/TrendingSidebar';
import { useUserStore } from '../stores/useUserStore';
import { SEO } from '../components/SEO';

// Mock data for now - timestamps created outside component
const timestamp1 = new Date();
timestamp1.setHours(timestamp1.getHours() - 1);

const timestamp2 = new Date();
timestamp2.setHours(timestamp2.getHours() - 2);

const MOCK_POSTS = [
  {
    id: '1',
    author: {
      username: 'vitalik',
      address: '5eykt...j7Pn',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vitalik',
      verified: true,
    },
    content:
      'Building the future of social media on Solana. ZK Compression is a game changer! 🚀',
    timestamp: timestamp1,
    likes: 234,
    reposts: 45,
    tips: 12.5,
    comments: 12,
    images: [] as string[],
    isLiked: false,
    isReposted: false,
  },
  {
    id: '2',
    author: {
      username: 'anatoly',
      address: '8eykt...k9Qm',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anatoly',
      verified: true,
    },
    content:
      'Just minted my @username.pulse handle. The future is on-chain and compressed! 💜',
    timestamp: timestamp2,
    likes: 567,
    reposts: 123,
    tips: 45.2,
    comments: 34,
    images: [] as string[],
    isLiked: true,
    isReposted: false,
  },
];

export function Feed() {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [isLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const profile = useUserStore((state) => state.profile);
  const likePost = useUserStore((state) => state.likePost);
  const unlikePost = useUserStore((state) => state.unlikePost);
  const isPostLiked = useUserStore((state) => state.isPostLiked);
  const repostPost = useUserStore((state) => state.repostPost);
  const unrepostPost = useUserStore((state) => state.unrepostPost);
  const isPostReposted = useUserStore((state) => state.isPostReposted);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && hasMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingMore, hasMore]);

  const loadMorePosts = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate mock posts
    const newPosts = Array.from({ length: 5 }, (_, i) => ({
      id: `generated-${Date.now()}-${i}`,
      author: {
        username: `user${Math.floor(Math.random() * 100)}`,
        address: '5eykt...j7Pn',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${Math.floor(Math.random() * 100)}`,
        verified: Math.random() > 0.7,
      },
      content: `This is a generated post #${posts.length + i + 1}. Building on Solana! 🚀`,
      timestamp: new Date(),
      likes: Math.floor(Math.random() * 500),
      reposts: Math.floor(Math.random() * 100),
      tips: Math.random() * 50,
      comments: Math.floor(Math.random() * 50),
      images: [] as string[],
      isLiked: false,
      isReposted: false,
    }));

    setPosts([...posts, ...newPosts]);
    setIsLoadingMore(false);

    // Simulate reaching end after 3 loads
    if (posts.length > 20) {
      setHasMore(false);
    }
  };

  const handleCreatePost = (content: string, images: string[]) => {
    const newPost = {
      id: Date.now().toString(),
      author: {
        username: profile.username || 'user',
        address: profile.walletAddress || '5eykt...j7Pn',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username || 'user'}`,
        verified: false,
      },
      content,
      timestamp: new Date(),
      likes: 0,
      reposts: 0,
      tips: 0,
      comments: 0,
      images,
      isLiked: false,
      isReposted: false,
    };

    setPosts([newPost, ...posts]);
  };

  const handleLike = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    if (isPostLiked(postId)) {
      unlikePost(postId);
      setPosts(
        posts.map((p) =>
          p.id === postId ? { ...p, isLiked: false, likes: Math.max(0, p.likes - 1) } : p,
        ),
      );
    } else {
      likePost(postId);
      setPosts(
        posts.map((p) =>
          p.id === postId ? { ...p, isLiked: true, likes: p.likes + 1 } : p,
        ),
      );
    }
  };

  const handleRepost = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    if (isPostReposted(postId)) {
      unrepostPost(postId);
      setPosts(
        posts.map((p) =>
          p.id === postId
            ? { ...p, isReposted: false, reposts: Math.max(0, p.reposts - 1) }
            : p,
        ),
      );
    } else {
      repostPost(postId);
      setPosts(
        posts.map((p) =>
          p.id === postId ? { ...p, isReposted: true, reposts: p.reposts + 1 } : p,
        ),
      );
    }
  };

  const handleTip = (postId: string, amount: number) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, tips: post.tips + amount } : post,
      ),
    );
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <SEO
        title="Feed"
        description="Stay updated with the latest posts from the Pulse Social community. Share your thoughts, tip creators, and engage with content on Solana."
        url="/feed"
      />
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-4 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-7 xl:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <CreatePost onPost={handleCreatePost} />

              {/* Loading State */}
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="glass-card rounded-2xl p-6 border border-white/10 animate-pulse"
                    >
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-full"></div>
                        <div className="flex-1 space-y-3">
                          <div className="h-4 bg-white/10 rounded w-1/4"></div>
                          <div className="h-4 bg-white/10 rounded w-3/4"></div>
                          <div className="h-4 bg-white/10 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <PostCard
                        post={post}
                        onLike={handleLike}
                        onRepost={handleRepost}
                        onTip={handleTip}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="glass-card rounded-2xl p-12 border border-white/10 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/5 rounded-full mb-4">
                    <svg
                      className="w-8 h-8 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">No posts yet</h3>
                  <p className="text-gray-400">Be the first to post something!</p>
                </div>
              )}

              {/* Infinite Scroll Trigger */}
              {!isLoading && posts.length > 0 && (
                <div ref={loadMoreRef} className="py-8">
                  {isLoadingMore && (
                    <div className="flex justify-center">
                      <div className="flex items-center gap-2 text-gray-400">
                        <div className="w-5 h-5 border-2 border-[#ABFE2C] border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading more posts...</span>
                      </div>
                    </div>
                  )}
                  {!hasMore && (
                    <div className="text-center text-gray-500 py-4">
                      <p>You've reached the end! 🎉</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4">
            <TrendingSidebar />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
