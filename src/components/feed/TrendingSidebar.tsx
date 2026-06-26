import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTrendingTopics, useSuggestedUsers } from '../../hooks/useFeed';
import { useIsFollowing, useFollowUser, useUnfollowUser } from '../../hooks/useFollow';
import { useWallet } from '@solana/wallet-adapter-react';
import { usePlatformAction } from '../../hooks/usePlatformAction';
import { useRequireWallet } from '../../hooks/useRequireWallet';

export function TrendingSidebar() {
  const { publicKey } = useWallet();
  const { data: trendingTopics = [], isPending: trendingPending } = useTrendingTopics();
  const { data: suggestedUsers = [], isPending: suggestedPending } = useSuggestedUsers();

  return (
    <div className="space-y-6 sticky top-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 border border-white/10"
      >
        <h2 className="text-xl font-bold mb-4">Trending on Pulse</h2>
        {trendingPending ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Loading topics...</p>
          </div>
        ) : trendingTopics.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No trending topics yet</p>
            <p className="text-xs mt-2">Use hashtags in your posts!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trendingTopics.map((topic, index) => (
              <motion.div
                key={topic.tag}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <p className="text-sm text-gray-500">#{index + 1} Trending</p>
                <p className="font-bold group-hover:text-[#ABFE2C] transition-colors">#{topic.tag}</p>
                <p className="text-sm text-gray-500">{topic.count.toLocaleString()} posts</p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-6 border border-white/10"
      >
        <h2 className="text-xl font-bold mb-4">Creators to support</h2>
        {suggestedPending ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Loading suggestions...</p>
          </div>
        ) : suggestedUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No suggestions yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestedUsers.map((user, index) => (
              <SuggestedUserRow key={user.address} user={user} index={index} currentWallet={publicKey?.toBase58()} />
            ))}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass-card rounded-2xl p-6 border border-[var(--color-solana-green)]/30 bg-gradient-to-br from-[var(--color-solana-green)]/5 to-transparent"
      >
        <h2 className="text-lg font-bold mb-3">Become a Creator</h2>
        <p className="text-sm text-gray-400 mb-4">Launch Supporter Shares and earn from tips</p>
        <Link
          to="/dashboard"
          className="block w-full py-2.5 text-center bg-gradient-to-r from-[var(--color-solana-green)] to-[var(--color-solana-green)] text-black rounded-xl font-bold hover:shadow-lg transition-all"
        >
          Start Earning
        </Link>
      </motion.div>
    </div>
  );
}

function SuggestedUserRow({
  user,
  index,
  currentWallet,
}: {
  user: { address: string; username: string; followerCount: number };
  index: number;
  currentWallet?: string;
}) {
  const { data: isFollowing, isPending: isFollowingPending, isError: isFollowingError } =
    useIsFollowing(user.address);
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  const { guardAction } = usePlatformAction();
  const requireWallet = useRequireWallet();
  const isSelf = currentWallet === user.address;

  const handleFollow = () => {
    guardAction(() => {
      if (isSelf) return;
      if (!requireWallet() || !currentWallet) return;
      if (isFollowing) {
        unfollowMutation.mutate({ followerId: currentWallet, followingId: user.address });
      } else {
        followMutation.mutate({ followerId: currentWallet, followingId: user.address });
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
      className="flex items-start gap-3"
    >
      <Link to={`/${user.username}`}>
        <img
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.address}`}
          alt={user.username}
          className="w-12 h-12 rounded-full bg-gray-800"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/${user.username}`} className="font-bold hover:underline truncate block">
          @{user.username}
        </Link>
        {user.followerCount > 0 && (
          <p className="text-xs text-gray-500">{user.followerCount.toLocaleString()} followers</p>
        )}
        {!isSelf && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFollow}
            disabled={isFollowingPending || isFollowingError}
            className={`mt-2 px-4 py-1.5 rounded-full text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isFollowing
                ? 'bg-white/10 text-white border border-white/20'
                : 'bg-[#ABFE2C] text-black hover:bg-[#9FE51C]'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

export default TrendingSidebar;
