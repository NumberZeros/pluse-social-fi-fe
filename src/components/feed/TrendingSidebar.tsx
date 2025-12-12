import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useUserStore } from '../../stores/useUserStore';

const TRENDING_TOPICS = [
  { tag: 'SolanaBreakpoint', posts: 12500 },
  { tag: 'ZKCompression', posts: 8900 },
  { tag: 'Web3Social', posts: 6700 },
  { tag: 'DeFi', posts: 15300 },
  { tag: 'NFTs', posts: 9200 },
];

const SUGGESTED_USERS = [
  {
    username: 'solana',
    address: '5eykt...j7Pn',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=solana',
    verified: true,
    bio: 'Official Solana account',
  },
  {
    username: 'helius',
    address: '8eykt...k9Qm',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=helius',
    verified: true,
    bio: 'Best RPC on Solana',
  },
  {
    username: 'metaplex',
    address: '3eykt...m2Kl',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=metaplex',
    verified: true,
    bio: 'NFT standard for Solana',
  },
];

export function TrendingSidebar() {
  const follow = useUserStore((state) => state.follow);
  const unfollow = useUserStore((state) => state.unfollow);
  const isFollowing = useUserStore((state) => state.isFollowing);

  const handleFollowClick = (username: string) => {
    if (isFollowing(username)) {
      unfollow(username);
    } else {
      follow(username);
    }
  };

  return (
    <div className="space-y-6 sticky top-24">
      {/* Trending Topics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 border border-white/10"
      >
        <h2 className="text-xl font-bold mb-4">Trending on Pulse</h2>
        <div className="space-y-4">
          {TRENDING_TOPICS.map((topic, index) => (
            <motion.div
              key={topic.tag}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">#{index + 1} Trending</p>
                  <p className="font-bold group-hover:text-[#ABFE2C] transition-colors">
                    #{topic.tag}
                  </p>
                  <p className="text-sm text-gray-500">
                    {topic.posts.toLocaleString()} posts
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <button className="w-full mt-4 py-2 text-[#ABFE2C] hover:bg-white/5 rounded-lg transition-colors font-medium">
          Show more
        </button>
      </motion.div>

      {/* Suggested Users */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-6 border border-white/10"
      >
        <h2 className="text-xl font-bold mb-4">Who to follow</h2>
        <div className="space-y-4">
          {SUGGESTED_USERS.map((user, index) => (
            <motion.div
              key={user.username}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="flex items-start gap-3"
            >
              <Link to={`/@${user.username}`}>
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-12 h-12 rounded-full bg-gray-800 hover:opacity-80 transition-opacity"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <Link
                    to={`/@${user.username}`}
                    className="font-bold hover:underline truncate"
                  >
                    @{user.username}
                  </Link>
                  {user.verified && (
                    <svg
                      className="w-4 h-4 text-[#ABFE2C] flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">{user.bio}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleFollowClick(user.username)}
                  className={`mt-2 px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                    isFollowing(user.username)
                      ? 'bg-white/10 text-white border border-white/20 hover:bg-red-500/20'
                      : 'bg-white text-black hover:bg-[#ABFE2C]'
                  }`}
                >
                  {isFollowing(user.username) ? 'Following' : 'Follow'}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Creator Subscription Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass-card rounded-2xl p-6 border border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/5 to-transparent overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <svg
              className="w-5 h-5 text-[#D4AF37]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                clipRule="evenodd"
              />
            </svg>
            <h2 className="text-lg font-bold">Become a Creator</h2>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Start earning from your content with subscriptions and tips
          </p>
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <svg
                className="w-4 h-4 text-[#ABFE2C]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-300">Paid subscriptions</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <svg
                className="w-4 h-4 text-[#ABFE2C]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-300">1-click tipping</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <svg
                className="w-4 h-4 text-[#ABFE2C]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-300">Private groups</span>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C9A62F] text-black rounded-xl font-bold hover:shadow-lg hover:shadow-[#D4AF37]/30 transition-all"
          >
            Start Earning
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-2xl p-6 border border-white/10"
      >
        <h2 className="text-xl font-bold mb-4">Network Stats</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total Users</span>
            <span className="font-bold text-[#ABFE2C]">12.5K</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Posts Today</span>
            <span className="font-bold text-[#ABFE2C]">3.2K</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Tips Sent</span>
            <span className="font-bold text-[#ABFE2C]">$45.8K</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-white/10">
            <span className="text-gray-400">Your Earnings</span>
            <span className="font-bold text-[#D4AF37]">$0.00</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default TrendingSidebar;
