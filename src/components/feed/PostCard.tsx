import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { IconCoin, IconHeart, IconRepost, IconVerified } from '../icons/PulseIcons';

interface Post {
  id: string;
  author: {
    username: string;
    address: string;
    avatar: string;
    verified?: boolean;
  };
  content: string;
  timestamp: Date;
  likes: number;
  reposts: number;
  tips: number;
  images?: string[];
  isLiked: boolean;
  isReposted: boolean;
}

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onRepost: (postId: string) => void;
  onTip: (postId: string, amount: number) => void;
}

export function PostCard({ post, onLike, onRepost, onTip }: PostCardProps) {
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipAmount, setTipAmount] = useState('1');

  const formatTime = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  const handleTip = async () => {
    const amount = parseFloat(tipAmount);
    if (amount > 0) {
      // In production, this would call the Solana transaction
      // For now, we'll just update the UI
      onTip(post.id, amount);
      setShowTipModal(false);
      setTipAmount('1');
    }
  };

  return (
    <motion.article
      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
      className="p-6 border-b border-white/10 transition-colors"
    >
      <div className="flex gap-4">
        <Link to={`/@${post.author.username}`}>
          <img 
            src={post.author.avatar}
            alt={post.author.username}
            className="w-12 h-12 rounded-full bg-gray-800 hover:opacity-80 transition-opacity"
          />
        </Link>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <Link 
              to={`/@${post.author.username}`}
              className="font-bold hover:underline"
            >
              @{post.author.username}
            </Link>
            {post.author.verified && (
              <IconVerified className="w-5 h-5 text-[#D4AF37]" />
            )}
            <span className="text-gray-500 text-sm">·</span>
            <span className="text-gray-500 text-sm">{formatTime(post.timestamp)}</span>
          </div>

          {/* Content */}
          <p className="text-white text-[15px] leading-relaxed mb-3 whitespace-pre-wrap">
            {post.content}
          </p>

          {/* Images */}
          {post.images && post.images.length > 0 && (
            <div className="mb-3 rounded-xl overflow-hidden">
              <img 
                src={post.images[0]}
                alt="Post media"
                className="w-full max-h-96 object-cover"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-6 mt-4">
            {/* Like */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onLike(post.id)}
              className="flex items-center gap-2 group"
            >
              <div className={`p-2 rounded-full transition-colors ${
                post.isLiked 
                  ? 'text-red-500' 
                  : 'text-gray-500 hover:text-red-500 hover:bg-red-500/10'
              }`}>
                <IconHeart className="w-5 h-5" fill={post.isLiked ? 'currentColor' : 'none'} />
              </div>
              <span className={`text-sm ${post.isLiked ? 'text-red-500' : 'text-gray-500'}`}>
                {post.likes}
              </span>
            </motion.button>

            {/* Repost */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onRepost(post.id)}
              className="flex items-center gap-2 group"
            >
              <div className={`p-2 rounded-full transition-colors ${
                post.isReposted 
                  ? 'text-green-500' 
                  : 'text-gray-500 hover:text-green-500 hover:bg-green-500/10'
              }`}>
                <IconRepost className="w-5 h-5" />
              </div>
              <span className={`text-sm ${post.isReposted ? 'text-green-500' : 'text-gray-500'}`}>
                {post.reposts}
              </span>
            </motion.button>

            {/* Tip */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowTipModal(true)}
              className="flex items-center gap-2 group relative"
            >
              <div className="p-2 rounded-full text-gray-500 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors">
                <IconCoin className="w-5 h-5" />
              </div>
              <span className="text-sm text-gray-500">
                {post.tips > 0 ? `$${post.tips.toFixed(2)}` : 'Tip'}
              </span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Tip Modal */}
      {showTipModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowTipModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1a1a1a] rounded-2xl p-6 max-w-md w-full border border-white/10"
          >
            <h3 className="text-2xl font-bold mb-4">Tip @{post.author.username}</h3>
            <p className="text-gray-400 mb-6">Send USDC to support this creator</p>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                {[1, 5, 10, 20].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setTipAmount(amount.toString())}
                    className={`flex-1 py-3 rounded-lg font-bold transition-colors ${
                      tipAmount === amount.toString()
                        ? 'bg-[#D4AF37] text-black'
                        : 'bg-white/5 hover:bg-white/10 text-white'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Custom Amount</label>
                <input
                  type="number"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
                  placeholder="Enter amount"
                  min="0.1"
                  step="0.1"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowTipModal(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-lg font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTip}
                  className="flex-1 py-3 bg-[#D4AF37] text-black rounded-lg font-bold hover:bg-[#C79F2F] transition-colors"
                >
                  Send Tip
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.article>
  );
}
