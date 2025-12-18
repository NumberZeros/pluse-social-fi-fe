import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWallet } from '../lib/wallet-adapter';
import { PublicKey } from '@solana/web3.js';
import { IconVerified } from '../components/icons/PulseIcons';
import { useProfile } from '../hooks/useProfile';
import { useIsFollowing, useFollowers, useFollowing, useFollowUser, useUnfollowUser } from '../hooks/useFollow';
import { ProfileCreationModal } from '../components/profile/ProfileCreationModal';
import { SendTipModal } from '../components/profile/SendTipModal';
import { Crown, ExternalLink, Copy, Grid, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useUserNFTs } from '../hooks/useUserNFTs';
import { NETWORK } from '../utils/constants';
import { AppLayout } from '../components/layout/AppLayout';

// Helper to generate avatar from wallet address
const getAvatarUrl = (address: string) => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`;
};

// Helper to generate banner from wallet address
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
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'media'>('posts');
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [showSendTip, setShowSendTip] = useState(false);

  // Resolve username to PublicKey via on-chain registry
  const targetPublicKey :any = useMemo(() => {
    if (!username) return publicKey;
    
    // Check if username is actually a wallet address
    try {
      return new PublicKey(username);
    } catch {
      // TODO: Query username NFT registry for PublicKey
      // For now, only direct wallet addresses are supported
      return null;
    }
  }, [username, publicKey]);

  // Check if viewing own profile
  const isOwnProfile = publicKey && targetPublicKey && publicKey.equals(targetPublicKey);

  // Fetch real profile from blockchain
  const { profile, isLoading, hasProfile } = useProfile(targetPublicKey || undefined);

  // Fetch user's NFTs (only for own profile)
  const { data: userNFTs = [], isLoading: isLoadingNFTs } = useUserNFTs(
    isOwnProfile ? targetPublicKey : undefined
  );

  // Follow hooks
  const { data: isFollowing } = useIsFollowing(
    targetPublicKey?.toString() || ''
  );
  const { data: followers = [] } = useFollowers(targetPublicKey?.toString() || '');
  const { data: following = [] } = useFollowing(targetPublicKey?.toString() || '');
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  // Prepare user data from blockchain profile
  const user = useMemo(() => {
    if (!targetPublicKey) return null;

    // If profile exists on-chain, use it
    if (hasProfile && profile) {
      const address = targetPublicKey.toString();
      return {
        username: profile.username,
        address,
        avatar: getAvatarUrl(address),
        banner: getBannerUrl(parseInt(address.slice(0, 8), 36)),
        bio: `@${profile.username} on Pulse Social`, // TODO: Add bio to contract
        verified: false, // TODO: Add verification system
        followers: followers.length, // Use real follow data
        following: following.length, // Use real follow data
        posts: profile.postsCount.toNumber(),
        tipsSent: (profile.totalTipsSent.toNumber() / 1e9).toFixed(3),
        tipsReceived: (profile.totalTipsReceived.toNumber() / 1e9).toFixed(3),
        joined: new Date(profile.createdAt.toNumber() * 1000).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric'
        }),
      };
    }

    return null;
  }, [targetPublicKey, profile, hasProfile, followers.length, following.length]);

  // Posts will be fetched from blockchain
  const posts = useMemo(() => {
    if (!user) return [];

    const timestamp = new Date();
    timestamp.setHours(timestamp.getHours() - 1);

    return [
      {
        id: '1',
        author: {
          username: user.username,
          address: user.address,
          avatar: user.avatar,
          verified: user.verified,
        },
        content: `GM to all builders on Solana! Today we ship 🚀`,
        timestamp: timestamp,
        likes: 234,
        reposts: 45,
        tips: 12.5,
        comments: 18,
        images: [] as string[],
        isLiked: false,
        isReposted: false,
      },
      {
        id: '2',
        author: {
          username: user.username,
          address: user.address,
          avatar: user.avatar,
          verified: user.verified,
        },
        content: `Just minted my @${user.username}.pulse handle. The future is on-chain! 💜`,
        timestamp: new Date(new Date().getTime() - 3600000),
        likes: 156,
        reposts: 23,
        tips: 8.3,
        comments: 9,
        images: [] as string[],
        isLiked: false,
        isReposted: false,
      },
    ];
  }, [user]);

  const handleFollow = () => {
    if (!publicKey || !targetPublicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    if (isFollowing) {
      unfollowMutation.mutate(
        { followerId: publicKey.toString(), followingId: targetPublicKey.toString() },
        {
          onSuccess: () => {
            toast.success('Unfollowed');
          },
          onError: () => {
            toast.error('Failed to unfollow');
          },
        }
      );
    } else {
      followMutation.mutate(
        { followerId: publicKey.toString(), followingId: targetPublicKey.toString() },
        {
          onSuccess: () => {
            toast.success('Followed!');
          },
          onError: () => {
            toast.error('Failed to follow');
          },
        }
      );
    }
  };

  const handleSendTip = () => {
    if (!targetPublicKey || !hasProfile) return;
    setShowSendTip(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[var(--color-solana-green)] border-t-transparent mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading profile...</p>
        </div>
      </AppLayout>
    );
  }

  // No profile found - show create profile if own wallet
  if (!hasProfile && isOwnProfile) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Create Your Profile</h1>
          <p className="text-gray-400 mb-8">
            You don't have a profile yet. Create one to get started!
          </p>
          <button
            onClick={() => setShowCreateProfile(true)}
            className="inline-block px-8 py-3 bg-[var(--color-solana-green)] hover:bg-[#9FE51C] text-black font-bold rounded-full transition-all shadow-[0_0_20px_rgba(20,241,149,0.3)] hover:shadow-[0_0_30px_rgba(20,241,149,0.5)]"
          >
            Create Profile
          </button>
        </div>
        {showCreateProfile && <ProfileCreationModal isOpen={true} onClose={() => setShowCreateProfile(false)} />}
      </AppLayout>
    );
  }

  // Profile not found for other user
  if (!user || !hasProfile) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Profile Not Found</h1>
          <p className="text-gray-400 mb-8">
            This user hasn't created a profile yet.
          </p>
          <Link
            to="/explore"
            className="inline-block px-8 py-3 bg-[var(--color-solana-green)] hover:bg-[#9FE51C] text-black font-bold rounded-full transition-all"
          >
            Explore Profiles
          </Link>
        </div>
      </AppLayout>
    );
  }

  const displayUser = user;

  return (
    <AppLayout>
      <div className="max-w-[1000px] mx-auto pb-12">
        {/* Banner */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-72 rounded-b-3xl overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
          {displayUser.banner && (
            <img
              src={displayUser.banner}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>

        {/* Profile Info */}
        <div className="px-6 pb-6 relative z-20">
          <div className="flex flex-col md:flex-row justify-between items-end md:items-start -mt-24 md:-mt-20 mb-6 gap-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-solana-green)] to-blue-500 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
              <img
                src={displayUser.avatar}
                alt={displayUser.username}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-black bg-gray-900 relative z-10 object-cover"
              />
              {displayUser.verified && (
                <div className="absolute bottom-2 right-2 w-10 h-10 bg-[var(--color-solana-green)] rounded-full flex items-center justify-center border-4 border-black z-20 shadow-lg">
                  <IconVerified className="w-5 h-5 text-black" />
                </div>
              )}
            </motion.div>

            <div className="flex-1 flex flex-col md:flex-row justify-between items-center md:items-start gap-4 w-full md:w-auto mt-4 md:mt-24">
               <div className="text-center md:text-left">
                  <h1 className="text-4xl font-bold mb-1 text-white">{displayUser.username}</h1>
                  <p className="text-gray-400 font-mono text-sm bg-white/5 px-3 py-1 rounded-full inline-block border border-white/10">
                    {displayUser.address.slice(0, 4)}...{displayUser.address.slice(-4)}
                  </p>
               </div>

               <div className="flex gap-3">
                 {!isOwnProfile ? (
                   <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendTip}
                      className="px-6 py-2.5 bg-gradient-to-r from-[var(--color-social-cyan)] to-[var(--color-primary-green)] text-black rounded-full font-bold shadow-[0_0_20px_rgba(20,241,149,0.3)] hover:shadow-[0_0_30px_rgba(20,241,149,0.5)] transition-all"
                    >
                      💎 Tip
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleFollow}
                      className={`px-6 py-2.5 rounded-full font-bold transition-all border ${
                        isFollowing
                          ? 'bg-white/5 text-white border-white/20 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500'
                          : 'bg-white text-black border-white hover:bg-gray-200'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </motion.button>
                   </>
                 ) : (
                   <Link to="/creator">
                     <motion.button
                       whileHover={{ scale: 1.05 }}
                       whileTap={{ scale: 0.95 }}
                       className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-solana-green)] hover:bg-[#9FE51C] text-black rounded-full font-bold transition-all shadow-[0_0_20px_rgba(20,241,149,0.3)]"
                     >
                       <Crown className="w-5 h-5" />
                       Creator Dashboard
                     </motion.button>
                   </Link>
                 )}
               </div>
            </div>
          </div>

          <div className="glass-card p-8 rounded-3xl border border-white/10 mt-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-solana-green)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[var(--color-solana-green)]/10 transition-colors duration-700" />
            
            <p className="text-xl text-gray-200 mb-6 leading-relaxed relative z-10">{displayUser.bio}</p>

            <div className="flex gap-8 text-sm flex-wrap relative z-10">
              <div className="flex flex-col">
                <span className="font-bold text-2xl text-white">{displayUser.following}</span>
                <span className="text-gray-400">Following</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-2xl text-white">{displayUser.followers}</span>
                <span className="text-gray-400">Followers</span>
              </div>
              {displayUser.tipsReceived && (
                <div className="flex flex-col">
                  <span className="font-bold text-2xl text-[var(--color-social-cyan)]">{displayUser.tipsReceived} SOL</span>
                  <span className="text-gray-400">Tips Received</span>
                </div>
              )}
              {displayUser.tipsSent && isOwnProfile && (
                <div className="flex flex-col">
                  <span className="font-bold text-2xl text-gray-400">{displayUser.tipsSent} SOL</span>
                  <span className="text-gray-500">Tips Sent</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Username NFT Cards (if own profile) */}
        {isOwnProfile && (
          <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Crown className="w-6 h-6 text-[var(--color-solana-purple)]" />
                Your Username NFTs
              </h2>
              <span className="px-3 py-1 bg-white/5 rounded-full text-sm text-gray-400 border border-white/10">{userNFTs.length} owned</span>
            </div>

            {isLoadingNFTs && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-solana-green)] border-t-transparent mx-auto"></div>
                <p className="text-gray-400 mt-4">Loading your NFTs...</p>
              </div>
            )}

            {!isLoadingNFTs && userNFTs.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card rounded-2xl p-10 border border-white/10 text-center bg-gradient-to-b from-white/5 to-transparent"
              >
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                  <Crown className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Username NFTs Found</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">Username NFTs grant you special privileges and verified status on the platform.</p>
                <Link to="/">
                  <button className="px-8 py-3 bg-gradient-to-r from-[var(--color-value-amber)] to-[var(--color-primary-green)] text-black rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105">
                    Mint Your Username
                  </button>
                </Link>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userNFTs.map((nft, index) => (
                <motion.div
                  key={nft.mint}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative overflow-hidden rounded-2xl border border-white/10 hover:border-[var(--color-solana-purple)]/50 transition-all group bg-gradient-to-br from-gray-900/80 to-black"
                >
                  {/* NFT Image Header */}
                  <div className="relative h-48 overflow-hidden">
                    {nft.image ? (
                      <img 
                        src={nft.image} 
                        alt={nft.username}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-[#9945FF] via-[#14F195] to-[#00C2FF] flex items-center justify-center"><span class="text-white font-bold text-6xl drop-shadow-lg">${nft.username.charAt(0).toUpperCase()}</span></div>`;
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#9945FF] via-[#14F195] to-[#00C2FF] flex items-center justify-center">
                        <span className="text-white font-bold text-6xl drop-shadow-lg">
                          {nft.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    {/* Category Badge */}
                    {nft.category && (
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[var(--color-premium-pink)] border border-[var(--color-premium-purple)]/30 text-xs font-bold capitalize">
                        {nft.category}
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-premium-purple)] to-[var(--color-premium-pink)] flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">
                          {nft.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-white group-hover:text-[var(--color-solana-purple)] transition-colors">
                          @{nft.username}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                          <svg className="w-3 h-3 text-[var(--color-solana-green)]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified NFT
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 text-xs mb-4">
                      <span className="text-gray-500 uppercase tracking-wider font-bold">Mint</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(nft.mint);
                          toast.success('Mint address copied!');
                        }}
                        className="flex items-center gap-2 text-[var(--color-social-cyan)] hover:text-white transition-colors"
                      >
                        <span className="font-mono">{nft.mint.slice(0, 6)}...{nft.mint.slice(-4)}</span>
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>

                    <a
                      href={`https://explorer.solana.com/address/${nft.mint}${NETWORK !== 'mainnet-beta' ? `?cluster=${NETWORK}` : ''}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-[var(--color-solana-purple)]/20 to-[var(--color-solana-green)]/20 hover:from-[var(--color-solana-purple)]/30 hover:to-[var(--color-solana-green)]/30 rounded-xl font-medium transition-all text-sm border border-white/10"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on Explorer
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="sticky top-20 z-30 bg-[#000000]/80 backdrop-blur-xl border-b border-white/10 mt-8">
          <div className="flex px-6 max-w-[1000px] mx-auto">
            {[
              { id: 'posts', label: 'Posts', icon: Grid },
              { id: 'replies', label: 'Replies', icon: MessageSquare },
              { id: 'media', label: 'Media', icon: ImageIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-bold transition-colors relative ${
                  activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-[var(--color-solana-green)]' : ''}`} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--color-solana-green)] rounded-t-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Posts */}
        <div className="px-6 py-8">
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-20">
                 <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                   <Grid className="w-10 h-10 text-gray-500" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-300">No posts yet</h3>
                 <p className="text-gray-500 mt-2">When {displayUser.username} posts, it will show up here.</p>
              </div>
            ) : posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all hover:bg-white/5"
              >
                <div className="flex gap-4">
                   <img src={post.author.avatar} className="w-12 h-12 rounded-full border border-white/10" alt="" />
                   <div className="flex-1">
                      <div className="flex justify-between items-start">
                         <div>
                            <div className="flex items-center gap-2">
                               <span className="font-bold text-white hover:underline cursor-pointer">{post.author.username}</span>
                               <span className="text-gray-500 text-sm">@{post.author.address.slice(0, 4)}...</span>
                               <span className="text-gray-600">·</span>
                               <span className="text-sm text-gray-500">{new Date(post.timestamp).toLocaleDateString()}</span>
                            </div>
                         </div>
                      </div>
                      
                      <div className="mt-3 text-gray-200 text-lg leading-relaxed whitespace-pre-wrap">{post.content}</div>
                      
                      {/* Placeholder Actions */}
                      <div className="flex gap-6 mt-4 pt-4 border-t border-white/5 text-gray-500">
                         <button className="flex items-center gap-2 hover:text-[var(--color-solana-green)] transition-colors">
                            <Grid className="w-5 h-5" /> 0
                         </button>
                      </div>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Modals */}
      {showSendTip && targetPublicKey && (
        <SendTipModal
          recipientPubkey={targetPublicKey}
          recipientUsername={displayUser.username}
          onClose={() => setShowSendTip(false)}
        />
      )}
    </AppLayout>
  );
}

