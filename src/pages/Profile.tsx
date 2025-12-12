import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PostCard from '../components/feed/PostCard';
import { IconVerified } from '../components/icons/PulseIcons';
import { useUserStore } from '../stores/useUserStore';
import { Crown } from 'lucide-react';

// Helper to generate deterministic values from username
const hashUsername = (username: string) => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    const char = username.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

// Mock users database
const MOCK_USERS = {
  vitalik: {
    address: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vitalik',
    banner:
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&h=400&fit=crop',
    bio: 'Building the future of decentralized social media. Ethereum & Solana enthusiast.',
    verified: true,
    followers: 1234,
    following: 567,
    posts: 89,
    joined: 'December 2024',
  },
  anatoly: {
    address: '8eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anatoly',
    banner:
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=400&fit=crop',
    bio: 'Founder of Solana. Making blockchain fast and affordable for everyone.',
    verified: true,
    followers: 5678,
    following: 234,
    posts: 156,
    joined: 'November 2024',
  },
  solana: {
    address: '3eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=solana',
    banner:
      'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=1200&h=400&fit=crop',
    bio: 'Official Solana account. The fastest blockchain in the world.',
    verified: true,
    followers: 12345,
    following: 100,
    posts: 423,
    joined: 'October 2024',
  },
};

export function Profile() {
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'media'>('posts');

  // Get store values with proper selectors
  const currentUserUsername = useUserStore((state) => state.profile?.username);
  const currentUserWallet = useUserStore((state) => state.profile?.walletAddress);
  // const currentUserPostsCount = useUserStore((state) => state.profile?.postsCount || 0);
  const follow = useUserStore((state) => state.follow);
  const unfollow = useUserStore((state) => state.unfollow);
  const isFollowing = useUserStore((state) => state.isFollowing);

  // Get user data - simplified without useMemo to debug
  let user = null;
  if (username) {
    // Check mock users first
    const mockUser = MOCK_USERS[username as keyof typeof MOCK_USERS];
    if (mockUser) {
      user = {
        username,
        ...mockUser,
      };
    } else {
      // Default fallback for any username
      const hash = hashUsername(username);
      user = {
        username,
        address: `${hash.toString(36).padStart(15, '0')}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        banner:
          'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=400&fit=crop',
        bio: `@${username} on Pulse Social`,
        verified: false,
        followers: hash % 100,
        following: hash % 50,
        posts: hash % 20,
        joined: 'December 2024',
      };
    }
  }

  // Generate mock posts for user
  const mockPosts = useMemo(() => {
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
    if (!username) return;

    if (isFollowing(username)) {
      unfollow(username);
    } else {
      follow(username);
    }
  };

  if (!username) {
    return <Navigate to="/" replace />;
  }

  // Fallback if user data is not available
  const hash = hashUsername(username);
  const displayUser = user || {
    username: username,
    address: `${hash.toString(36).padStart(15, '0')}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    banner:
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=400&fit=crop',
    bio: `@${username} on Pulse Social`,
    verified: false,
    followers: 0,
    following: 0,
    posts: 0,
    joined: 'December 2024',
  };

  const isOwnProfile =
    currentUserUsername === username ||
    (!currentUserUsername && currentUserWallet === username);
  const isFollowingUser = username ? isFollowing(username) : false;

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />

      <div className="max-w-[1000px] mx-auto pt-16">
        {/* Banner */}
        <div className="relative h-64 bg-gradient-to-br from-[#D4AF37]/18 to-[#8B5CF6]/14 overflow-hidden">
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
                <div className="absolute bottom-2 right-2 w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center border-2 border-black">
                  <IconVerified className="w-5 h-5 text-black" />
                </div>
              )}
            </motion.div>

            {!isOwnProfile && (
              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFollow}
                  className={`px-6 py-2 rounded-full font-bold transition-colors ${
                    isFollowingUser
                      ? 'bg-white/10 text-white border border-white/20 hover:bg-red-500/20 hover:border-red-500'
                      : 'bg-white text-black hover:bg-[#D4AF37]'
                  }`}
                >
                  {isFollowingUser ? 'Following' : 'Follow'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-gradient-to-r from-[#50C878] to-[#3BA565] text-white rounded-full font-bold hover:opacity-90 transition-opacity"
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
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#ABFE2C] to-[#D4AF37] text-black rounded-full font-bold"
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

            <div className="flex gap-6 text-sm">
              <div>
                <span className="font-bold text-white">{displayUser.following}</span>
                <span className="text-gray-400 ml-1">Following</span>
              </div>
              <div>
                <span className="font-bold text-white">{displayUser.followers}</span>
                <span className="text-gray-400 ml-1">Followers</span>
              </div>
              <div className="text-gray-400">Joined {displayUser.joined}</div>
            </div>
          </div>
        </div>

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
                    className="absolute bottom-0 left-0 right-0 h-1 bg-[#D4AF37]"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Posts */}
        <div className="divide-y divide-white/10">
          {mockPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={() => {}}
              onRepost={() => {}}
              onTip={() => {}}
            />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
