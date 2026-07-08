import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { CreatePost } from '../components/feed/CreatePost';
import TrendingSidebar from '../components/feed/TrendingSidebar';
import { FeedPostCard } from '../components/feed/FeedPostCard';
import type { FeedPostData } from '../components/feed/FeedPostCard';
import { MySupportPanel } from '../components/shares/MySupportPanel';
import { useUserStore } from '../stores/useUserStore';
import { SEO } from '../components/SEO';
import {
  useTimeline,
  useLikePost,
  useUnlikePost,
  useTipPost,
  FEED_PAGE_SIZE,
} from '../hooks/useFeed';
import { useFollowers, useFollowing } from '../hooks/useFollow';
import { useCache } from '../hooks/useCache';
import { usePlatformAction } from '../hooks/usePlatformAction';
import { useRequireWallet } from '../hooks/useRequireWallet';
import { TipPostModal } from '../components/feed/TipPostModal';
import { Wifi, WifiOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AppLayout } from '../components/layout/AppLayout';
import { PostSkeleton } from '../components/LoadingStates';
import { PAGE_SEO_CONFIG } from '../lib/seo/page-config';
import { Card } from '../design-system';
import { buildFeedPageSchema } from '../lib/seo/schema';

type FeedTab = 'following' | 'all';

export function Feed() {
  const { publicKey } = useWallet();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const profile = useUserStore((state) => state.profile);
  const { isOnline } = useCache();
  const feedConfig = PAGE_SEO_CONFIG['/feed'];

  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [selectedPostForTip, setSelectedPostForTip] = useState<FeedPostData | null>(null);
  const [feedTab, setFeedTab] = useState<FeedTab>('all');
  const defaultTabSet = useRef(false);

  const { data: rawPosts, isPending, isError } = useTimeline();
  const { isPaused, guardAction } = usePlatformAction();
  const requireWallet = useRequireWallet();
  const { data: followers = [] } = useFollowers(publicKey?.toBase58() || '');
  const { data: following = [] } = useFollowing(publicKey?.toBase58() || '');
  const [page, setPage] = useState(1);
  const likePostMutation = useLikePost();
  const unlikePostMutation = useUnlikePost();
  const tipPostMutation = useTipPost();

  useEffect(() => {
    if (!defaultTabSet.current && following.length > 0) {
      setFeedTab('following');
      defaultTabSet.current = true;
    }
  }, [following.length]);

  const followingAddresses = useMemo(
    () => new Set(following.map((f) => f.following)),
    [following],
  );

  const allPosts = useMemo(() => rawPosts ?? [], [rawPosts]);

  const filteredPosts = useMemo(() => {
    if (feedTab === 'all') return allPosts;
    if (!publicKey) return [];
    return allPosts.filter((post) => followingAddresses.has(post.author));
  }, [allPosts, feedTab, followingAddresses, publicKey]);

  useEffect(() => {
    setPage(1);
  }, [feedTab]);

  const hasNextPage = page * FEED_PAGE_SIZE < filteredPosts.length;
  const fetchNextPage = useCallback(() => {
    if (page * FEED_PAGE_SIZE < filteredPosts.length) {
      setPage((p) => p + 1);
    }
  }, [page, filteredPosts.length]);

  const posts: FeedPostData[] = filteredPosts.slice(0, page * FEED_PAGE_SIZE).map((post) => ({
    id: post.id || post.publicKey,
    content: post.content || '',
    author: {
      username: post.authorUsername || post.author,
      authorUsername: post.authorUsername,
      address: post.author,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}`,
    },
    timestamp: post.createdAt,
    images: post.imageUrls || [],
    videos: post.videoUrls || [],
    likes: post.likes || 0,
    comments: post.comments || 0,
    tips: post.tips || 0,
    isLiked: post.isLiked || false,
    accessLevel: post.accessLevel || (post.isSubscriberOnly ? 'supporters' : 'public'),
    gatedContentUri: post.gatedContentUri,
  }));

  const schemaPosts = filteredPosts.slice(0, 20).map((post) => ({
    id: post.id,
    name: (post.content || 'Post').slice(0, 60),
    path: `/post/${post.id}`,
  }));

  const schema = buildFeedPageSchema(feedConfig.breadcrumbs ?? [], schemaPosts);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  const handleLikePost = (postId: string, isLiked: boolean) => {
    guardAction(() => {
      if (!requireWallet()) return;
      if (isLiked) {
        unlikePostMutation.mutate(postId);
      } else {
        likePostMutation.mutate(postId);
      }
    });
  };

  const handleTip = (post: FeedPostData) => {
    guardAction(() => {
      if (!requireWallet()) return;
      setSelectedPostForTip(post);
      setTipModalOpen(true);
    });
  };

  const handleTipSubmit = (amount: number) => {
    if (!selectedPostForTip) return;
    tipPostMutation.mutate(
      {
        postId: selectedPostForTip.id,
        authorAddress: selectedPostForTip.author.address,
        amount,
      },
      {
        onSuccess: () => {
          toast.success(`Tipped ${amount} SOL!`);
          setTipModalOpen(false);
          setSelectedPostForTip(null);
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
        title={feedConfig.title}
        description={feedConfig.description}
        keywords={feedConfig.keywords}
        image={feedConfig.ogImage}
        imageAlt="Pulse Social Feed"
        url="/feed"
        schema={schema}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-6 lg:pb-12">
        <div className="hidden lg:block lg:col-span-3">
          <div className="sticky top-28 space-y-6">
            <Card variant="glass" className="rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-info" />
                <div>
                  <div className="font-bold">{profile.username || 'Anon User'}</div>
                  <div className="text-sm text-muted">@{profile.username || 'creator'}</div>
                </div>
              </div>
              <div className="space-y-4 text-sm text-muted">
                <div className="flex justify-between">
                  <span>Followers</span>
                  <span className="font-bold text-foreground">{followers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Following</span>
                  <span className="font-bold text-foreground">{following.length}</span>
                </div>
              </div>
            </Card>

            {publicKey && <MySupportPanel walletAddress={publicKey.toBase58()} />}
          </div>
        </div>

        <div className="lg:col-span-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <CreatePost />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2 p-1 bg-surface-2 rounded-pill border border-border w-fit">
                {(['following', 'all'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFeedTab(tab)}
                    className={`px-5 py-2 rounded-pill text-sm font-bold transition-colors ${
                      feedTab === tab
                        ? 'bg-primary text-background'
                        : 'text-muted hover:text-foreground'
                    }`}
                  >
                    {tab === 'following' ? 'Following' : 'All'}
                  </button>
                ))}
              </div>

              <motion.div
                animate={{ opacity: isOnline ? 1 : 0.8 }}
                className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-pill border shrink-0 ${
                  isOnline
                    ? 'bg-success/10 text-success border-success/20'
                    : 'bg-warning/10 text-warning border-warning/20'
                }`}
              >
                {isOnline ? (
                  <>
                    <Wifi className="w-4 h-4" />
                    <span className="text-sm font-medium">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4" />
                    <span className="text-sm font-medium">Offline (Using Cache)</span>
                  </>
                )}
              </motion.div>
            </div>

            {isPending ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <PostSkeleton key={i} />
                ))}
              </div>
            ) : isError ? (
              <Card variant="glass" className="rounded-2xl p-12 border border-border text-center">
                <h3 className="text-xl font-bold mb-2">Failed to load feed</h3>
                <p className="text-muted">Check your connection and try again.</p>
              </Card>
            ) : feedTab === 'following' && !publicKey ? (
              <Card variant="glass" className="rounded-2xl p-12 border border-border text-center">
                <h3 className="text-xl font-bold mb-2">Connect to see Following</h3>
                <p className="text-muted">Connect your wallet to view posts from creators you follow.</p>
              </Card>
            ) : posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post, index) => (
                  <FeedPostCard
                    key={post.id}
                    post={post}
                    index={index}
                    viewerAddress={publicKey?.toBase58()}
                    isPaused={isPaused}
                    onLike={handleLikePost}
                    onTip={handleTip}
                  />
                ))}
              </div>
            ) : (
              <Card variant="glass" className="rounded-2xl p-12 border border-border text-center">
                <h3 className="text-xl font-bold mb-2">
                  {feedTab === 'following' ? 'No posts from people you follow' : 'No posts yet'}
                </h3>
                <p className="text-muted">
                  {feedTab === 'following'
                    ? 'Follow creators on Explore, or switch to All to see the global feed.'
                    : 'Be the first to post something!'}
                </p>
              </Card>
            )}

            {!isPending && posts.length > 0 && (
              <div ref={loadMoreRef} className="py-8">
                {!hasNextPage && (
                  <div className="text-center text-muted py-4">
                    <p>You&apos;ve reached the end!</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        <div className="hidden lg:block lg:col-span-3">
          <div className="sticky top-28 space-y-6">
            <TrendingSidebar />
          </div>
        </div>
      </div>

      <TipPostModal
        isOpen={tipModalOpen}
        onClose={() => {
          setTipModalOpen(false);
          setSelectedPostForTip(null);
        }}
        onSubmit={handleTipSubmit}
        isSubmitting={tipPostMutation.isPending}
      />
    </AppLayout>
  );
}
