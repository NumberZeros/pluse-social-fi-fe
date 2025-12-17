import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useWallet } from '../lib/wallet-adapter';
import { CreatePost } from '../components/feed/CreatePost';
import TrendingSidebar from '../components/feed/TrendingSidebar';
import { useUserStore } from '../stores/useUserStore';
import { SEO } from '../components/SEO';
import { useTimeline, useCreatePost, useLikePost, useUnlikePost, useRepostPost, useTipPost } from '../hooks/useFeed';
import { Heart, Repeat2, DollarSign, MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AppLayout } from '../components/layout/AppLayout';

export function Feed() {
  const { publicKey } = useWallet();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const profile = useUserStore((state) => state.profile);

  const { data: rawPosts, isLoading } = useTimeline();
  const createPostMutation = useCreatePost();
  const likePostMutation = useLikePost();
  const unlikePostMutation = useUnlikePost();
  const repostMutation = useRepostPost();
  const tipPostMutation = useTipPost();

  // Mock pagination for now until SDK supports it
  const hasNextPage = false;
  const isFetchingNextPage = false;
  const fetchNextPage = () => {};

  const posts = (rawPosts || []).map((post) => ({
    ...post,
    author: {
      username: post.authorUsername || post.author.slice(0, 8), // Fallback if username missing
      address: post.author, // SDK returns author address as 'author' field
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}`,
      verified: false,
    },
    timestamp: post.createdAt, // SDK returns milliseconds or seconds? SDK uses Date.now() usually, let's check sdk.ts. It returns .toNumber().
    images: post.imageUrls || [], // Check if SDK returns imageUrls. sdk.ts: getAllPosts maps to { publicKey, author, uri, mint, createdAt }. URI needs fetching?
  }));

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [isFetchingNextPage, hasNextPage]);

  const handleCreatePost = (content: string, images: string[]) => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    createPostMutation.mutate(
      {
        content,
        images,
      },
      {
        onSuccess: () => {
          toast.success('Post created!');
        },
        onError: () => {
          toast.error('Failed to create post');
        },
      },
    );
  };

  const handleLikePost = (postId: string, isLiked: boolean) => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    if (isLiked) {
      unlikePostMutation.mutate(postId);
    } else {
      likePostMutation.mutate(postId);
    }
  };

  const handleRepost = (postId: string) => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    repostMutation.mutate(
      { postId },
      {
        onSuccess: () => {
          toast.success('Reposted!');
        },
      },
    );
  };

  const handleTip = (postId: string) => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    const amount = prompt('Enter tip amount (SOL):');
    if (!amount || isNaN(parseFloat(amount))) return;

    tipPostMutation.mutate(
      { postId, amount: parseFloat(amount) },
      {
        onSuccess: () => {
          toast.success(`Tipped ${amount} SOL!`);
        },
        onError: () => {
          toast.error('Failed to send tip');
        },
      },
    );
  };

  return (
    <AppLayout>
      <SEO
        title="Feed"
        description="Stay updated with the latest posts from the Pulse Social community."
        url="/feed"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
        {/* Left Sidebar (Optional Navigation/User Card) - Hidden on Mobile */}
        <div className="hidden lg:block lg:col-span-3">
           <div className="glass-card rounded-2xl p-6 sticky top-28 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[var(--color-solana-green)] to-blue-500" />
                 <div>
                    <div className="font-bold">{profile.username || 'Anon User'}</div>
                    <div className="text-sm text-gray-400">@handle</div>
                 </div>
              </div>
              <div className="space-y-4 text-sm text-gray-300">
                 <div className="flex justify-between">
                    <span>Followers</span>
                    <span className="font-bold text-white">1,240</span>
                 </div>
                 <div className="flex justify-between">
                    <span>Following</span>
                    <span className="font-bold text-white">584</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-6">
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
                    className="glass-card rounded-2xl p-6 border border-white/10 animate-pulse bg-white/5"
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
                    className="glass-card rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all backdrop-blur-xl bg-black/40 hover:bg-black/60 shadow-lg"
                  >
                    {/* Post Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <img
                        src={post.author.avatar}
                        alt={post.author.username}
                        className="w-12 h-12 rounded-full border border-white/10"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white hover:text-[var(--color-solana-green)] transition-colors cursor-pointer">{post.author.username}</span>
                          <span className="text-gray-400 text-sm">
                            {post.author.address.slice(0, 4)}...{post.author.address.slice(-4)}
                          </span>
                          <span className="text-gray-500 text-sm">·</span>
                          <span className="text-gray-500 text-sm">
                            {new Date(post.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="text-gray-200 mb-4 leading-relaxed whitespace-pre-wrap">{post.content}</div>

                    {/* Post Images */}
                    {post.images.length > 0 && (
                      <div className={`grid gap-2 mb-4 rounded-xl overflow-hidden ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {post.images.map((img, i) => (
                          <img key={i} src={img} alt="" className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500" />
                        ))}
                      </div>
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center justify-between text-gray-500 pt-4 border-t border-white/5">
                      <button
                        onClick={() => handleLikePost(post.id, post.isLiked ?? false)}
                        className={`flex items-center gap-2 hover:text-pink-500 transition-colors group ${
                          post.isLiked ? 'text-pink-500' : ''
                        }`}
                      >
                        <div className={`p-2 rounded-full group-hover:bg-pink-500/10 transition-colors ${post.isLiked ? 'bg-pink-500/10' : ''}`}>
                           <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                        </div>
                        <span className="text-sm font-medium">{post.likes}</span>
                      </button>
                      
                      <button className="flex items-center gap-2 hover:text-blue-400 transition-colors group">
                        <div className="p-2 rounded-full group-hover:bg-blue-400/10 transition-colors">
                           <MessageCircle className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium">{post.comments}</span>
                      </button>
                      
                      <button
                        onClick={() => handleRepost(post.id)}
                        className={`flex items-center gap-2 hover:text-green-500 transition-colors group ${
                          post.isReposted ? 'text-green-500' : ''
                        }`}
                      >
                        <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                           <Repeat2 className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium">{post.reposts}</span>
                      </button>
                      
                      <button
                        onClick={() => handleTip(post.id)}
                        className="flex items-center gap-2 hover:text-[var(--color-solana-green)] transition-colors group"
                      >
                        <div className="p-2 rounded-full group-hover:bg-[var(--color-solana-green)]/10 transition-colors">
                           <DollarSign className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium">{post.tips.toFixed(2)} SOL</span>
                      </button>
                    </div>
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
                {isFetchingNextPage && (
                  <div className="flex justify-center">
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-5 h-5 border-2 border-[var(--color-solana-green)] border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading more posts...</span>
                    </div>
                  </div>
                )}
                {!hasNextPage && (
                  <div className="text-center text-gray-500 py-4">
                    <p>You've reached the end! 🎉</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Sidebar (Trending) */}
        <div className="lg:col-span-3">
          <div className="sticky top-28 space-y-6">
             <TrendingSidebar />
             
             {/* Mini Footer */}
             <div className="glass-card p-4 rounded-xl border border-white/5 text-xs text-gray-500 space-y-2">
                <div className="flex flex-wrap gap-2">
                   <a href="#" className="hover:text-white transition-colors">Terms</a>
                   <a href="#" className="hover:text-white transition-colors">Privacy</a>
                   <a href="#" className="hover:text-white transition-colors">Docs</a>
                   <a href="#" className="hover:text-white transition-colors">Source</a>
                </div>
                <div>© 2024 Pulse Social. All rights reserved.</div>
             </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
