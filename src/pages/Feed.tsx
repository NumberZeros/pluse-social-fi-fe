import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Navbar } from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { CreatePost } from '../components/feed/CreatePost';
import TrendingSidebar from '../components/feed/TrendingSidebar';
import { useUserStore } from '../stores/useUserStore';
import { SEO } from '../components/SEO';

// Posts will be stored on-chain (Shadow Drive, Arweave, or IPFS)
// For now, feed is empty until on-chain post storage is implemented
const POSTS: any[] = [];

export function Feed() {
  const [posts, setPosts] = useState(POSTS);
  const [isLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const profile = useUserStore((state) => state.profile);

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

    // TODO: Query more posts from blockchain storage
    // For now, no posts are available until storage is implemented
    setIsLoadingMore(false);
    setHasMore(false);
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
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <div className="text-white">{post.content}</div>
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
