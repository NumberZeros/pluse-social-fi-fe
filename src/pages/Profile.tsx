import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWallet } from '../lib/wallet-adapter';
import { PublicKey } from '@solana/web3.js';
import { Navbar } from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { IconVerified } from '../components/icons/PulseIcons';
import { useProfile } from '../hooks/useProfile';
import { useIsFollowing, useFollowers, useFollowing, useFollowUser, useUnfollowUser } from '../hooks/useFollow';
import { ProfileCreationModal } from '../components/profile/ProfileCreationModal';
import { SendTipModal } from '../components/profile/SendTipModal';
import { Crown, ExternalLink, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useUserNFTs } from '../hooks/useUserNFTs';
import { NETWORK } from '../utils/constants';

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

// Username resolution now requires on-chain username NFT registry

export function Profile() {
  const { username } = useParams();
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'media'>('posts');
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [showSendTip, setShowSendTip] = useState(false);

  // Resolve username to PublicKey via on-chain registry
  const targetPublicKey = useMemo(() => {
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
    publicKey?.toString() || '',
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

    // Username NFT registry not implemented yet
    // No profile found
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
      <>
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-solana-green)] mx-auto"></div>
          <p className="text-slate-400 mt-4">Loading profile...</p>
        </div>
      </>
    );
  }

  // No profile found - show create profile if own wallet
  if (!hasProfile && isOwnProfile) {
    return (
      <>
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Create Your Profile</h1>
          <p className="text-slate-400 mb-8">
            You don't have a profile yet. Create one to get started!
          </p>
          <button
            onClick={() => setShowCreateProfile(true)}
            className="inline-block px-6 py-3 bg-[var(--color-solana-green)] hover:bg-[#9FE51C] text-black font-bold rounded-lg transition-all"
          >
            Create Profile
          </button>
        </div>
        {showCreateProfile && <ProfileCreationModal isOpen={true} onClose={() => setShowCreateProfile(false)} />}
      </>
    );
  }

  // Profile not found for other user
  if (!user || !hasProfile) {
    return (
      <>
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Profile Not Found</h1>
          <p className="text-slate-400 mb-8">
            This user hasn't created a profile yet.
          </p>
          <Link
            to="/explore"
            className="inline-block px-6 py-3 bg-[var(--color-solana-green)] hover:bg-[#9FE51C] text-black font-bold rounded-lg transition-all"
          >
            Explore Profiles
          </Link>
        </div>
      </>
    );
  }

  const displayUser = user;

  return (
    <div className="bg-[#000000] min-h-screen text-white">
      <Navbar />

      <div className="max-w-[1000px] mx-auto pt-16">
        {/* Banner */}
        <div className="relative h-64 bg-gradient-to-br from-[var(--color-solana-green)]/10 to-transparent overflow-hidden">
          {displayUser.banner && (
            <img
              src={displayUser.banner}
              alt="Banner"
              className="w-full h-full object-cover opacity-40"
            />
          )}
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex justify-between items-start -mt-20 mb-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <img
                src={displayUser.avatar}
                alt={displayUser.username}
                className="w-32 h-32 rounded-full border-4 border-black bg-gray-900"
              />
              {displayUser.verified && (
                <div className="absolute bottom-2 right-2 w-8 h-8 bg-[var(--color-solana-green)] rounded-full flex items-center justify-center border-2 border-black">
                  <IconVerified className="w-5 h-5 text-black" />
                </div>
              )}
            </motion.div>

            {!isOwnProfile && (
              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendTip}
                  className="px-6 py-2 bg-gradient-to-r from-[var(--color-social-cyan)] to-[var(--color-primary-green)] hover:opacity-90 text-black rounded-full font-bold transition-all shadow-lg shadow-[var(--color-social-cyan)]/30"
                >
                  💎 Send Tip
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFollow}
                  className={`px-6 py-2 rounded-full font-bold transition-all ${
                    isFollowing
                      ? 'bg-white/10 text-white border border-white/20 hover:bg-red-500/20 hover:border-red-500'
                      : 'bg-[var(--color-social-cyan)] hover:bg-[var(--color-social-cyan-hover)] text-black shadow-lg shadow-[var(--color-social-cyan)]/30'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-gradient-to-r from-[var(--color-premium-purple)] to-[var(--color-premium-pink)] hover:opacity-90 text-white rounded-full font-bold transition-all shadow-lg shadow-[var(--color-premium-purple)]/30"
                >
                  Subscribe
                </motion.button>
              </div>
            )}

            {isOwnProfile && (
              <div className="flex gap-3 mt-6">
                <Link to="/creator">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-6 py-2 bg-[var(--color-solana-green)] hover:bg-[#9FE51C] text-black rounded-full font-bold transition-all"
                  >
                    <Crown className="w-5 h-5" />
                    Creator Dashboard
                  </motion.button>
                </Link>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">@{displayUser.username}</h1>
              <p className="text-gray-400 font-mono text-sm">
                {displayUser.address.slice(0, 4)}...{displayUser.address.slice(-4)}
              </p>
            </div>

            <p className="text-lg text-gray-300">{displayUser.bio}</p>

            <div className="flex gap-6 text-sm flex-wrap">
              <div>
                <span className="font-bold text-white">{displayUser.following}</span>
                <span className="text-gray-400 ml-1">Following</span>
              </div>
              <div>
                <span className="font-bold text-white">{displayUser.followers}</span>
                <span className="text-gray-400 ml-1">Followers</span>
              </div>
              {displayUser.tipsReceived && (
                <div>
                  <span className="font-bold text-[var(--color-social-cyan)]">{displayUser.tipsReceived} SOL</span>
                  <span className="text-gray-400 ml-1">Tips Received</span>
                </div>
              )}
              {displayUser.tipsSent && isOwnProfile && (
                <div>
                  <span className="font-bold text-slate-400">{displayUser.tipsSent} SOL</span>
                  <span className="text-gray-400 ml-1">Tips Sent</span>
                </div>
              )}
              <div className="text-gray-400">Joined {displayUser.joined}</div>
            </div>
          </div>
        </div>

        {/* Username NFT Cards (if own profile) */}
        {isOwnProfile && (
          <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Your Username NFTs</h2>
              <span className="text-sm text-gray-400">{userNFTs.length} NFT{userNFTs.length !== 1 ? 's' : ''}</span>
            </div>

            {isLoadingNFTs && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-solana-green)] mx-auto"></div>
                <p className="text-gray-400 mt-2 text-sm">Loading your NFTs...</p>
              </div>
            )}

            {!isLoadingNFTs && userNFTs.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card rounded-2xl p-8 border border-white/10 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-gray-400 mb-4">You don't have any username NFTs yet</p>
                <Link to="/">
                  <button className="px-6 py-2 bg-gradient-to-r from-[var(--color-value-amber)] to-[var(--color-primary-green)] hover:opacity-90 text-black rounded-lg font-bold transition-all shadow-lg">
                    Mint Your Username
                  </button>
                </Link>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userNFTs.map((nft, index) => (
                <motion.div
                  key={nft.mint}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-2xl p-6 border border-white/10 bg-gradient-to-br from-[var(--color-premium-purple)]/10 to-transparent hover:border-[var(--color-premium-purple)]/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {nft.image ? (
                        <img 
                          src={nft.image} 
                          alt={nft.username}
                          className="w-12 h-12 rounded-xl object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-premium-purple)] to-[var(--color-premium-pink)] flex items-center justify-center">
                          <span className="text-white font-bold text-xl">
                            {nft.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="text-lg font-bold text-white mb-1">@{nft.username}</div>
                        <div className="text-xs text-gray-400">
                          {nft.mintedAt 
                            ? new Date(nft.mintedAt * 1000).toLocaleDateString()
                            : 'Username NFT'}
                        </div>
                      </div>
                    </div>
                    {nft.category && (
                      <div className="px-2 py-1 rounded-full bg-gradient-to-r from-[var(--color-premium-purple)] to-[var(--color-premium-pink)] text-white text-xs font-bold capitalize">
                        {nft.category}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-xs">
                      <span className="text-gray-400">Mint</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(nft.mint);
                          toast.success('Mint address copied!');
                        }}
                        className="flex items-center gap-1 text-[var(--color-social-cyan)] hover:text-[var(--color-social-cyan-hover)] transition-colors"
                      >
                        <span className="font-mono">{nft.mint.slice(0, 6)}...{nft.mint.slice(-4)}</span>
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`https://explorer.solana.com/address/${nft.mint}${NETWORK !== 'mainnet-beta' ? `?cluster=${NETWORK}` : ''}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-all text-xs"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Explorer
                    </a>
                    <a
                      href={`https://solscan.io/token/${nft.mint}${NETWORK !== 'mainnet-beta' ? `?cluster=${NETWORK}` : ''}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-all text-xs"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Solscan
                    </a>
                    <a
                      href={`https://magiceden.io/item-details/${nft.mint}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-[var(--color-value-amber)] to-[var(--color-primary-green)] hover:opacity-90 text-black rounded-lg font-bold transition-all text-xs shadow-lg"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Magic Eden
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-white/10">
          <div className="flex px-6">
            {(['posts', 'replies', 'media'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-bold capitalize transition-colors relative ${
                  activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--color-solana-green)]"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Posts */}
        <div className="divide-y divide-white/10">
          {posts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No posts yet. Posts are stored on-chain.</p>
            </div>
          ) : posts.map((post) => (
            <div
              key={post.id}
              className="bg-white/5 rounded-lg p-4 border border-white/10"
            >
              <div className="text-white">{post.content}</div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
      
      {/* Modals */}
      {showSendTip && targetPublicKey && (
        <SendTipModal
          recipientPubkey={targetPublicKey}
          recipientUsername={displayUser.username}
          onClose={() => setShowSendTip(false)}
        />
      )}
    </div>
  );
}
