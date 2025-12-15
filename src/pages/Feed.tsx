import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Navbar } from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { CreatePost } from '../components/feed/CreatePost';
import TrendingSidebar from '../components/feed/TrendingSidebar';
import { useUserStore } from '../stores/useUserStore';
import { SEO } from '../components/SEO';
import { useTimeline, useCreatePost, useLikePost, useUnlikePost, useRepostPost, useTipPost } from '../hooks/useFeed';
import { Heart, Repeat2, DollarSign, MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function Feed() {
  const { publicKey } = useWallet();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const profile = useUserStore((state) => state.profile);

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useTimeline();
  const createPostMutation = useCreatePost();
  const likePostMutation = useLikePost();
  const unlikePostMutation = useUnlikePost();
  const repostMutation = useRepostPost();
  const tipPostMutation = useTipPost();

  const posts = (data?.pages.flatMap((page) => page) || []).map((post) => ({
    ...post,
    author: {
      username: post.authorUsername,
      address: post.authorAddress,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorAddress}`,
      verified: false,
    },
    timestamp: post.createdAt,
    images: post.imageUrls,
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
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  const handleCreatePost = (content: string, images: string[]) => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    const username = profile.username || publicKey.toBase58().slice(0, 8);
    createPostMutation.mutate(
      {
        content,
        images,
        authorId: publicKey.toBase58(),
        authorUsername: username,
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
      { postId, userId: publicKey.toBase58() },
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
                      className="glass-card rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all"
                    >
                      {/* Post Header */}
                      <div className="flex items-start gap-3 mb-4">
                        <img
                          src={post.author.avatar}
                          alt={post.author.username}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{post.author.username}</span>
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
                      <div className="text-white mb-4">{post.content}</div>

                      {/* Post Images */}
                      {post.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-4 rounded-lg overflow-hidden">
                          {post.images.map((img, i) => (
                            <img key={i} src={img} alt="" className="w-full h-48 object-cover" />
                          ))}
                        </div>
                      )}

                      {/* Post Actions */}
                      <div className="flex items-center gap-6 text-gray-400">
                        <button
                          onClick={() => handleLikePost(post.id, post.isLiked)}
                          className={`flex items-center gap-2 hover:text-pink-500 transition-colors ${
                            post.isLiked ? 'text-pink-500' : ''
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                          <span>{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                          <MessageCircle className="w-5 h-5" />
                          <span>{post.comments}</span>
                        </button>
                        <button
                          onClick={() => handleRepost(post.id)}
                          className={`flex items-center gap-2 hover:text-green-500 transition-colors ${
                            post.isReposted ? 'text-green-500' : ''
                          }`}
                        >
                          <Repeat2 className="w-5 h-5" />
                          <span>{post.reposts}</span>
                        </button>
                        <button
                          onClick={() => handleTip(post.id)}
                          className="flex items-center gap-2 hover:text-[var(--color-solana-green)] transition-colors"
                        >
                          <DollarSign className="w-5 h-5" />
                          <span>{post.tips.toFixed(2)} SOL</span>
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
                        <div className="w-5 h-5 border-2 border-[#ABFE2C] border-t-transparent rounded-full animate-spin"></div>
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
