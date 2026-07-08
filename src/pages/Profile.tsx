import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { IconVerified } from '../components/icons/PulseIcons';
import { useProfile } from '../hooks/useProfile';
import { useIsFollowing, useFollowers, useFollowing, useFollowUser, useUnfollowUser } from '../hooks/useFollow';
import { useUserPosts, useLikePost, useUnlikePost, useTipPost } from '../hooks/useFeed';
import { useReadOnlySdk } from '../services/read-only-sdk';
import { useQuery } from '@tanstack/react-query';
import { ProfileCreationModal } from '../components/profile/ProfileCreationModal';
import { SendTipModal } from '../components/profile/SendTipModal';
import { useShares } from '../hooks/useShares';
import { BuySharesModal } from '../components/shares/BuySharesModal';
import { SellSharesModal } from '../components/shares/SellSharesModal';
import { FeedPostCard, type FeedPostData } from '../components/feed/FeedPostCard';
import { TipPostModal } from '../components/feed/TipPostModal';
import { usePlatformAction } from '../hooks/usePlatformAction';
import { useRequireWallet } from '../hooks/useRequireWallet';
import { PostSkeleton } from '../components/LoadingStates';
import { toast } from 'react-hot-toast';
import { Crown, Grid, MessageSquare, Image as ImageIcon, Users } from 'lucide-react';
import { buildProfilePageGraph } from '../lib/seo/schema';
import { AppLayout } from '../components/layout/AppLayout';
import { trackEvent } from '../lib/analytics';
import { SEO } from '../components/SEO';
import { ShareProfileButton } from '../components/feed/SharePostButton';
import { Button, Card, getButtonClassName, MotionCard } from '../design-system';

const getAvatarUrl = (address: string) => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`;
};

const getBannerUrl = (index: number) => {
  const banners = [
    'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=1200&h=400&fit=crop',
  ];
  return banners[index % banners.length];
};

export function Profile() {
  const { username } = useParams();
  const { publicKey } = useWallet();
  const readSdk = useReadOnlySdk();
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'media'>('posts');
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [showSendTip, setShowSendTip] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showSell, setShowSell] = useState(false);
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [selectedPostForTip, setSelectedPostForTip] = useState<FeedPostData | null>(null);

  const { isPaused, guardAction } = usePlatformAction();
  const requireWallet = useRequireWallet();
  const likePostMutation = useLikePost();
  const unlikePostMutation = useUnlikePost();
  const tipPostMutation = useTipPost();

  const walletPubkeyFromUrl = useMemo(() => {
    if (!username) return publicKey ?? null;
    try {
      return new PublicKey(username);
    } catch {
      return null;
    }
  }, [username, publicKey]);

  const { data: resolvedPubkey, isPending: isResolvingUsername, isError: isResolveError } = useQuery({
    queryKey: ['resolve_username', username],
    queryFn: async () => {
      if (!readSdk || !username) return null;
      try {
        new PublicKey(username);
        return null;
      } catch {
        return readSdk.resolveUsernameToPubkey(username);
      }
    },
    enabled: !!readSdk && !!username && !walletPubkeyFromUrl,
  });

  const effectivePubkey =
    walletPubkeyFromUrl ||
    resolvedPubkey ||
    (username ? null : publicKey ?? null);

  const postAuthorAddress =
    effectivePubkey?.toBase58() ??
    (publicKey && !username ? publicKey.toBase58() : undefined);

  const isOwnProfile = publicKey && effectivePubkey && publicKey.equals(effectivePubkey);

  const { profile, isLoading: isProfileLoading, hasProfile } = useProfile(effectivePubkey || undefined);
  const { userBalance, shares: creatorPool } = useShares(effectivePubkey || undefined);
  const isSupporter = userBalance > 0;

  const { data: isFollowing, isPending: isFollowingLoading, isError: isFollowingError } = useIsFollowing(
    effectivePubkey?.toString() || '',
  );
  const { data: followers = [] } = useFollowers(effectivePubkey?.toString() || '');
  const { data: following = [] } = useFollowing(effectivePubkey?.toString() || '');
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const { data: chainPosts = [], isPending: isPostsLoading } = useUserPosts(postAuthorAddress);

  const { data: userReplies = [], isPending: isRepliesLoading } = useQuery({
    queryKey: ['user_replies', effectivePubkey?.toString()],
    queryFn: async () => {
      if (!readSdk || !effectivePubkey) return [];
      return readSdk.getCommentsByAuthor(effectivePubkey);
    },
    enabled: !!readSdk && !!effectivePubkey,
  });

  const user = useMemo(() => {
    if (!effectivePubkey) return null;

    if (hasProfile && profile) {
      const address = effectivePubkey.toString();
      return {
        username: profile.username,
        address,
        avatar: getAvatarUrl(address),
        banner: getBannerUrl(parseInt(address.slice(0, 8), 36)),
        bio: creatorPool
          ? 'Creator on Pulse — support with Supporter Shares to unlock exclusive posts.'
          : `@${profile.username} on Pulse Social`,
        verified: false,
        followers: followers.length,
        following: following.length,
        posts: chainPosts.length,
        tipsSent: (profile.totalTipsSent.toNumber() / 1e9).toFixed(3),
        tipsReceived: (profile.totalTipsReceived.toNumber() / 1e9).toFixed(3),
        joined: new Date(profile.createdAt.toNumber() * 1000).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        }),
      };
    }

    return null;
  }, [effectivePubkey, profile, hasProfile, followers.length, following.length, creatorPool, chainPosts.length]);

  const feedPosts: FeedPostData[] = useMemo(() => {
    if (!user) return [];

    const mapped: FeedPostData[] = chainPosts.map((post) => ({
      id: post.id,
      content: post.content,
      author: {
        username: user.username,
        authorUsername: user.username,
        address: user.address,
        avatar: user.avatar,
      },
      timestamp: post.createdAt,
      images: post.imageUrls,
      likes: post.likes,
      comments: post.comments,
      tips: post.tips,
      isLiked: post.isLiked ?? false,
      accessLevel: post.accessLevel || (post.isSubscriberOnly ? 'supporters' : 'public'),
      gatedContentUri: post.gatedContentUri,
      videos: post.videoUrls,
    }));

    switch (activeTab) {
      case 'media':
        return mapped.filter((p) => p.images.length > 0);
      case 'posts':
      default:
        return mapped;
    }
  }, [user, chainPosts, activeTab]);

  const handleFollow = () => {
    guardAction(() => {
      if (!requireWallet() || !effectivePubkey || !publicKey) return;

      if (isFollowing) {
        unfollowMutation.mutate(
          { followerId: publicKey.toString(), followingId: effectivePubkey.toString() },
          {
            onSuccess: () => toast.success('Unfollowed'),
            onError: () => toast.error('Failed to unfollow'),
          },
        );
      } else {
        followMutation.mutate(
          { followerId: publicKey.toString(), followingId: effectivePubkey.toString() },
          {
            onSuccess: () => toast.success('Followed!'),
            onError: () => toast.error('Failed to follow'),
          },
        );
      }
    });
  };

  const handleSendTip = () => {
    guardAction(() => {
      if (!effectivePubkey || !hasProfile) return;
      setShowSendTip(true);
    });
  };

  const handleSupport = () => {
    guardAction(() => {
      if (effectivePubkey) {
        trackEvent('gating_cta_click', {
          creator: effectivePubkey.toBase58(),
          source: 'profile',
        });
      }
      setShowSupport(true);
    });
  };

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
        onError: () => toast.error('Failed to send tip'),
      },
    );
  };

  const isPageLoading =
    isProfileLoading ||
    isResolvingUsername ||
    (!walletPubkeyFromUrl && !!username && resolvedPubkey === undefined && !isResolvingUsername);

  if (isPageLoading) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-muted mt-4">Loading profile...</p>
        </div>
      </AppLayout>
    );
  }

  if (isResolveError) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <h1 className="text-h2 text-foreground mb-4">Failed to load profile</h1>
          <p className="text-muted mb-8">
            Could not resolve this profile. Check your connection and try again.
          </p>
          <Link to="/explore" className={getButtonClassName('primary', 'md')}>
            Explore Profiles
          </Link>
        </div>
      </AppLayout>
    );
  }

  if (!hasProfile && isOwnProfile) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <h1 className="text-h2 text-foreground mb-4">Create Your Profile</h1>
          <p className="text-muted mb-8">
            You don&apos;t have a profile yet. Create one to get started!
          </p>
          <Button onClick={() => setShowCreateProfile(true)} className="shadow-glow">
            Create Profile
          </Button>
        </div>
        {showCreateProfile && (
          <ProfileCreationModal isOpen onClose={() => setShowCreateProfile(false)} />
        )}
      </AppLayout>
    );
  }

  if (!user || !hasProfile) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <h1 className="text-h2 text-foreground mb-4">Profile Not Found</h1>
          <p className="text-muted mb-8">
            This user hasn&apos;t created a profile yet.
          </p>
          <Link to="/explore" className={getButtonClassName('primary', 'md')}>
            Explore Profiles
          </Link>
        </div>
      </AppLayout>
    );
  }

  const displayUser = user;
  const profilePath = `/${displayUser.username}`;
  const profileSchema = buildProfilePageGraph({
    name: displayUser.username,
    description: displayUser.bio,
    path: profilePath,
    identifier: displayUser.address,
    image: displayUser.avatar,
    followers: displayUser.followers,
    posts: displayUser.posts,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: `@${displayUser.username}`, path: profilePath },
    ],
  });

  const isPostsTabLoading =
    (activeTab === 'posts' || activeTab === 'media') && isPostsLoading;
  const isRepliesTabLoading = activeTab === 'replies' && isRepliesLoading;

  return (
    <AppLayout>
      <SEO
        title={`@${displayUser.username}`}
        description={displayUser.bio}
        url={profilePath}
        type="profile"
        image={`/api/og-image/profile/${encodeURIComponent(displayUser.username)}`}
        imageAlt={`@${displayUser.username} on Pulse Social`}
        schema={profileSchema}
      />
      <div className="max-w-[1000px] mx-auto pb-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-72 rounded-b-3xl overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
          {displayUser.banner && (
            <img src={displayUser.banner} alt="Banner" className="w-full h-full object-cover" />
          )}
        </motion.div>

        <div className="px-6 pb-6 relative z-20">
          <div className="flex flex-col md:flex-row justify-between items-end md:items-start -mt-24 md:-mt-20 mb-6 gap-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-info rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
              <img
                src={displayUser.avatar}
                alt={displayUser.username}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background bg-surface-2 relative z-10 object-cover"
              />
              {displayUser.verified && (
                <div className="absolute bottom-2 right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center border-4 border-background z-20 shadow-lg">
                  <IconVerified className="w-5 h-5 text-background" />
                </div>
              )}
            </motion.div>

            <div className="flex-1 flex flex-col md:flex-row justify-between items-center md:items-start gap-4 w-full md:w-auto mt-4 md:mt-24">
              <div className="text-center md:text-left">
                <h1 className="text-h2 mb-1 text-foreground">{displayUser.username}</h1>
                <p className="text-muted font-mono text-sm bg-surface-2 px-3 py-1 rounded-full inline-block border border-border">
                  {displayUser.address.slice(0, 4)}...{displayUser.address.slice(-4)}
                </p>
              </div>

              <div className="flex gap-3 flex-wrap justify-center md:justify-end">
                <ShareProfileButton
                  username={displayUser.username}
                  title={`@${displayUser.username} on Pulse Social`}
                  text={displayUser.bio}
                />
                {!isOwnProfile ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendTip}
                      className={getButtonClassName('cta', 'md', 'shadow-glow')}
                    >
                      💎 Tip
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleFollow}
                      disabled={isFollowingLoading || isFollowingError || followMutation.isPending || unfollowMutation.isPending}
                      className={`${getButtonClassName('secondary', 'md')} ${
                        isFollowing
                          ? 'hover:bg-danger/10 hover:border-danger/50 hover:text-danger'
                          : '!bg-foreground !text-background border-border hover:!bg-surface-2'
                      }`}
                    >
                      {isFollowingLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSupport}
                      disabled={isSupporter}
                      className={getButtonClassName(
                        'secondary',
                        'md',
                        'bg-primary/20 text-primary border-primary/30 hover:bg-primary/30',
                      )}
                    >
                      <Crown className="w-4 h-4" />
                      {isSupporter ? 'Supporting' : 'Support Creator'}
                    </motion.button>
                    {isSupporter && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowSell(true)}
                        className={getButtonClassName('secondary', 'md')}
                      >
                        Cash out support
                      </motion.button>
                    )}
                  </>
                ) : (
                  <Link to="/dashboard">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={getButtonClassName('primary', 'md', 'shadow-glow')}
                    >
                      <Crown className="w-5 h-5" />
                      Dashboard
                    </motion.button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          <Card variant="glass" className="p-8 rounded-3xl border border-border mt-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-700" />
            <p className="text-xl text-foreground mb-6 leading-relaxed relative z-10">{displayUser.bio}</p>
            <div className="flex gap-8 text-sm flex-wrap relative z-10">
              <div className="flex flex-col">
                <span className="font-bold text-2xl text-foreground">{displayUser.following}</span>
                <span className="text-muted">Following</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-2xl text-foreground">{displayUser.followers}</span>
                <span className="text-muted">Followers</span>
              </div>
              {displayUser.tipsReceived && (
                <div className="flex flex-col">
                  <span className="font-bold text-2xl text-info">
                    {displayUser.tipsReceived} SOL
                  </span>
                  <span className="text-muted">Tips Received</span>
                </div>
              )}
              {displayUser.tipsSent && isOwnProfile && (
                <div className="flex flex-col">
                  <span className="font-bold text-2xl text-muted">{displayUser.tipsSent} SOL</span>
                  <span className="text-muted">Tips Sent</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {creatorPool && (
          <div className="px-6 py-4">
            <Card variant="glass" className="rounded-2xl p-5 border border-primary/20 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-primary">
                <Users className="w-5 h-5" />
                <span className="font-bold">Supporter Shares active</span>
              </div>
              <div className="text-sm text-muted">
                {Number(creatorPool.supply)} Supporter Shares ·{' '}
                {creatorPool.holdersCount != null ? Number(creatorPool.holdersCount) : '—'} supporters
              </div>
              {!isOwnProfile && !isSupporter && (
                <Button onClick={handleSupport} size="sm" className="ml-auto">
                  Become a supporter
                </Button>
              )}
            </Card>
          </div>
        )}

        <div className="sticky top-20 z-30 bg-background/80 backdrop-blur-xl border-b border-border mt-8">
          <div className="flex px-6 max-w-[1000px] mx-auto">
            {[
              { id: 'posts', label: 'Posts', icon: Grid },
              { id: 'replies', label: 'Replies', icon: MessageSquare },
              { id: 'media', label: 'Media', icon: ImageIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'posts' | 'replies' | 'media')}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-bold transition-colors relative ${
                  activeTab === tab.id ? 'text-foreground' : 'text-muted hover:text-muted'
                }`}
              >
                <tab.icon
                  className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary' : ''}`}
                />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-8">
          <div className="space-y-6">
            {isPostsTabLoading || isRepliesTabLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <PostSkeleton key={i} />
                ))}
              </div>
            ) : activeTab === 'replies' ? (
              userReplies.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 rounded-full bg-surface-2 flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="w-10 h-10 text-muted" />
                  </div>
                  <h3 className="text-xl font-bold text-muted">No replies yet</h3>
                </div>
              ) : (
                userReplies.map((reply, index) => (
                  <MotionCard
                    key={reply.publicKey}
                    variant="glass"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-2xl p-6 border border-border"
                  >
                    <p className="text-foreground whitespace-pre-wrap">{reply.content}</p>
                    <p className="text-sm text-muted mt-2">
                      {new Date(reply.createdAt * 1000).toLocaleDateString()}
                    </p>
                  </MotionCard>
                ))
              )
            ) : feedPosts.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-full bg-surface-2 flex items-center justify-center mx-auto mb-6">
                  <Grid className="w-10 h-10 text-muted" />
                </div>
                <h3 className="text-xl font-bold text-muted">No posts yet</h3>
                <p className="text-muted mt-2">
                  When {displayUser.username} posts, it will show up here.
                </p>
              </div>
            ) : (
              feedPosts.map((post, index) => (
                <FeedPostCard
                  key={post.id}
                  post={post}
                  index={index}
                  viewerAddress={publicKey?.toBase58()}
                  isPaused={isPaused}
                  onLike={handleLikePost}
                  onTip={handleTip}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {showSendTip && effectivePubkey && (
        <SendTipModal
          recipientPubkey={effectivePubkey}
          recipientUsername={displayUser.username}
          onClose={() => setShowSendTip(false)}
        />
      )}
      {showSupport && effectivePubkey && (
        <BuySharesModal
          isOpen={showSupport}
          onClose={() => setShowSupport(false)}
          creatorPubkey={effectivePubkey}
          creatorUsername={displayUser.username}
        />
      )}
      {showSell && effectivePubkey && (
        <SellSharesModal
          creatorPubkey={effectivePubkey}
          creatorUsername={displayUser.username}
          onClose={() => setShowSell(false)}
        />
      )}
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
