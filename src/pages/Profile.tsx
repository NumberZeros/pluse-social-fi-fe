import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Navbar } from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { IconVerified } from '../components/icons/PulseIcons';
import { useProfile } from '../hooks/useProfile';
import { ProfileCreationModal } from '../components/profile/ProfileCreationModal';
import { SendTipModal } from '../components/profile/SendTipModal';
import { Crown } from 'lucide-react';

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
  const [isFollowing, setIsFollowing] = useState(false);

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

  // Fetch real profile from blockchain
  const { profile, isLoading, hasProfile } = useProfile(targetPublicKey || undefined);

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
        followers: profile.followersCount.toNumber(),
        following: profile.followingCount.toNumber(),
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
  }, [targetPublicKey, profile, hasProfile, username]);

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
    if (!user) return;
    setIsFollowing(!isFollowing);
    // TODO: Implement on-chain follow system
  };

  const handleSendTip = () => {
    if (!targetPublicKey || !hasProfile) return;
    setShowSendTip(true);
  };

  const isOwnProfile = publicKey && targetPublicKey && publicKey.equals(targetPublicKey);

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

        {/* Username NFT Card (if own profile and has username) */}
        {isOwnProfile && displayUser.username && (
          <div className="px-6 py-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6 border border-white/10 bg-gradient-to-br from-[var(--color-premium-purple)]/10 to-transparent"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-premium-purple)] to-[var(--color-premium-pink)] flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white mb-1">Your Username NFT</div>
                    <div className="text-sm text-gray-400">Minted on Solana</div>
                  </div>
                </div>
                {displayUser.verified && (
                  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-[var(--color-premium-purple)] to-[var(--color-premium-pink)] text-white text-xs font-bold">
                    VERIFIED
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-gray-400 text-sm">Username</span>
                  <span className="text-white font-bold text-lg">@{displayUser.username}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-gray-400 text-sm">Handle</span>
                  <span className="text-[var(--color-social-cyan)] font-mono text-sm">{displayUser.username}.pulse</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-gray-400 text-sm">NFT Type</span>
                  <span className="text-[var(--color-value-amber)] font-bold text-sm">Premium Username</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-all text-sm">
                    View on Explorer
                  </button>
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-[var(--color-value-amber)] to-[var(--color-primary-green)] hover:opacity-90 text-black rounded-lg font-bold transition-all text-sm shadow-lg shadow-[var(--color-value-amber)]/30">
                    List on Marketplace
                  </button>
                </div>
              </div>
            </motion.div>
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
