import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

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
                  <p className="text-sm text-gray-500">{topic.posts.toLocaleString()} posts</p>
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
                    <svg className="w-4 h-4 text-[#ABFE2C] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">{user.bio}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-2 px-4 py-1.5 bg-white text-black rounded-full text-sm font-bold hover:bg-[#ABFE2C] transition-colors"
                >
                  Follow
                </motion.button>
              </div>
            </motion.div>
          ))}
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
        </div>
      </motion.div>
    </div>
  );
}
