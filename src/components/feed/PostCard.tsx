import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSolanaTipping } from '../../hooks/useSolana';
import { toast } from 'react-hot-toast';
import { useUIStore } from '../../stores/useUIStore';
import { useUserStore } from '../../stores/useUserStore';
import { useAirdropStore } from '../../stores/useAirdropStore';
import useSubscriptionStore from '../../stores/useSubscriptionStore';
import { IconCoin, IconHeart, IconRepost, IconVerified } from '../icons/PulseIcons';
import { highlightHashtags } from '../../utils/hashtag.tsx';
import SubscriptionBadge, {
  SubscriberOnlyOverlay,
} from '../subscription/SubscriptionBadge';
import { formatRelativeTime } from '../../utils/format';
import { shareContent } from '../../utils/clipboard';

interface Comment {
  id: string;
  author: {
    username: string;
    address: string;
    avatar: string;
    verified?: boolean;
  };
  content: string;
  timestamp: Date;
}

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
  comments: number;
  images?: string[];
  isLiked: boolean;
  isReposted: boolean;
  isSubscriberOnly?: boolean;
  tierName?: string;
}

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onRepost: (postId: string) => void;
  onTip: (postId: string, amount: number) => void;
}

export function PostCard({ post, onLike, onRepost, onTip }: PostCardProps) {
  const { connected, publicKey } = useWallet();
  const { sendTip } = useSolanaTipping();
  const { tipModal, openTipModal, closeTipModal, isProcessing, setProcessing } =
    useUIStore();
  const incrementTipsSent = useUserStore((state) => state.incrementTipsSent);
  const bookmarkPost = useUserStore((state) => state.bookmarkPost);
  const unbookmarkPost = useUserStore((state) => state.unbookmarkPost);
  const isPostBookmarked = useUserStore((state) => state.isPostBookmarked);
  const updateAirdropProgress = useAirdropStore((state) => state.updateProgress);
  const markDayActive = useUserStore((state) => state.markDayActive);
  const { hasActiveSubscription } = useSubscriptionStore();

  const [tipAmount, setTipAmount] = useState('5');
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const showTipModal = tipModal.isOpen && tipModal.postId === post.id;
  const isBookmarked = isPostBookmarked(post.id);
  const userProfile = useUserStore((state) => state.profile);

  // Check if user has access to subscriber-only content
  const hasSubscriptionAccess =
    !post.isSubscriberOnly ||
    (publicKey && hasActiveSubscription(publicKey.toBase58(), post.author.address)) ||
    (publicKey && publicKey.toBase58() === post.author.address); // Author can see their own content

  const handleBookmark = () => {
    if (isBookmarked) {
      unbookmarkPost(post.id);
      toast.success('Removed from bookmarks');
    } else {
      bookmarkPost(post.id);
      toast.success('Added to bookmarks');
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/${post.author.username}/post/${post.id}`;
    const shareText = `Check out this post by @${post.author.username} on Pulse Social:\n\n${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}`;

    await shareContent({
      title: `Post by @${post.author.username}`,
      text: shareText,
      url: shareUrl,
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: {
        username: userProfile.username || 'user',
        address: userProfile.walletAddress || '0x000',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.username || 'user'}`,
        verified: false,
      },
      content: newComment,
      timestamp: new Date(),
    };

    setComments([...comments, comment]);
    setNewComment('');
    toast.success('Comment added!');
  };

  const handleTip = async () => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    const amount = parseFloat(tipAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setProcessing(true);
    try {
      const success = await sendTip(post.author.address, amount);
      if (success) {
        // Update local state
        onTip(post.id, amount);

        // Update global stores
        incrementTipsSent(amount);
        updateAirdropProgress('tips_sent', 1);
        markDayActive();

        closeTipModal();
        setTipAmount('5');
        toast.success(`Sent $${amount} to @${post.author.username}!`);
      }
    } catch (error) {
      console.error('Tip failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <motion.article
      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
      className="p-6 border-b border-white/10 transition-colors"
    >
      <div className="flex gap-4">
        <Link to={`/${post.author.username}`}>
          <img
            src={post.author.avatar}
            alt={post.author.username}
            className="w-12 h-12 rounded-full bg-gray-800 hover:opacity-80 transition-opacity"
          />
        </Link>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <Link to={`/${post.author.username}`} className="font-bold hover:underline">
              @{post.author.username}
            </Link>
            {post.author.verified && <IconVerified className="w-5 h-5 text-[#D4AF37]" />}
            <span className="text-gray-500 text-sm">·</span>
            <span className="text-gray-500 text-sm">
              {formatRelativeTime(post.timestamp)}
            </span>
          </div>

          {/* Subscription Badge */}
          {post.isSubscriberOnly && (
            <div className="mb-3">
              <SubscriptionBadge
                isSubscriberOnly={true}
                tierName={post.tierName}
                size="sm"
              />
            </div>
          )}

          {/* Content - with overlay if subscriber-only and no access */}
          <div className="relative">
            {!hasSubscriptionAccess && <SubscriberOnlyOverlay tierName={post.tierName} />}

            <p
              className={`text-white text-[15px] leading-relaxed mb-3 whitespace-pre-wrap ${!hasSubscriptionAccess ? 'blur-md select-none' : ''}`}
            >
              {highlightHashtags(post.content)}
            </p>

            {/* Images */}
            {post.images && post.images.length > 0 && (
              <div className="mb-3 rounded-xl overflow-hidden bg-white/5">
                <img
                  src={post.images[0]}
                  alt="Post media"
                  loading="lazy"
                  className={`w-full max-h-96 object-cover ${!hasSubscriptionAccess ? 'blur-lg' : ''}`}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6 mt-4">
            {/* Comment */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 group"
              aria-label={`${showComments ? 'Hide' : 'Show'} comments (${post.comments + comments.length})`}
            >
              <div className="p-2 rounded-full text-gray-500 hover:text-blue-500 hover:bg-blue-500/10 transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <span className="text-sm text-gray-500">
                {post.comments + comments.length}
              </span>
            </motion.button>

            {/* Like */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onLike(post.id)}
              className="flex items-center gap-2 group"
              aria-label={`${post.isLiked ? 'Unlike' : 'Like'} post (${post.likes} likes)`}
              aria-pressed={post.isLiked}
            >
              <div
                className={`p-2 rounded-full transition-colors ${
                  post.isLiked
                    ? 'text-red-500'
                    : 'text-gray-500 hover:text-red-500 hover:bg-red-500/10'
                }`}
              >
                <IconHeart
                  className="w-5 h-5"
                  fill={post.isLiked ? 'currentColor' : 'none'}
                />
              </div>
              <span
                className={`text-sm ${post.isLiked ? 'text-red-500' : 'text-gray-500'}`}
              >
                {post.likes}
              </span>
            </motion.button>

            {/* Repost */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onRepost(post.id)}
              className="flex items-center gap-2 group"
              aria-label={`${post.isReposted ? 'Unrepost' : 'Repost'} (${post.reposts} reposts)`}
              aria-pressed={post.isReposted}
            >
              <div
                className={`p-2 rounded-full transition-colors ${
                  post.isReposted
                    ? 'text-green-500'
                    : 'text-gray-500 hover:text-green-500 hover:bg-green-500/10'
                }`}
              >
                <IconRepost className="w-5 h-5" />
              </div>
              <span
                className={`text-sm ${post.isReposted ? 'text-green-500' : 'text-gray-500'}`}
              >
                {post.reposts}
              </span>
            </motion.button>

            {/* Tip */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() =>
                openTipModal(post.id, post.author.address, post.author.username)
              }
              className="flex items-center gap-2 group relative"
              aria-label={`Tip @${post.author.username} (${post.tips > 0 ? `$${post.tips.toFixed(2)} already tipped` : 'no tips yet'})`}
            >
              <div className="p-2 rounded-full text-gray-500 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors">
                <IconCoin className="w-5 h-5" />
              </div>
              <span className="text-sm text-gray-500">
                {post.tips > 0 ? `$${post.tips.toFixed(2)}` : 'Tip'}
              </span>
            </motion.button>

            {/* Share */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="flex items-center gap-2 group"
              aria-label="Share post"
            >
              <div className="p-2 rounded-full text-gray-500 hover:text-purple-500 hover:bg-purple-500/10 transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              </div>
            </motion.button>

            {/* Bookmark */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleBookmark}
              className="flex items-center gap-2 group ml-auto"
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
              aria-pressed={isBookmarked}
            >
              <div
                className={`p-2 rounded-full transition-colors ${
                  isBookmarked
                    ? 'text-[#ABFE2C]'
                    : 'text-gray-500 hover:text-[#ABFE2C] hover:bg-[#ABFE2C]/10'
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill={isBookmarked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </div>
            </motion.button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-white/10"
            >
              {/* Add Comment */}
              <div className="flex gap-3 mb-4">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.username || 'user'}`}
                  alt="Your avatar"
                  className="w-10 h-10 rounded-full bg-gray-800"
                />
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-500 text-sm resize-none outline-none focus:border-[#ABFE2C] transition-colors"
                    rows={2}
                    aria-label="Write a comment"
                  />
                  <div className="flex justify-end mt-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="px-4 py-1.5 bg-[#ABFE2C] text-black rounded-full text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#9FE51C] transition-colors"
                      aria-label="Submit comment"
                    >
                      Comment
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-3">
                {comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <img
                      src={comment.author.avatar}
                      alt={comment.author.username}
                      className="w-8 h-8 rounded-full bg-gray-800"
                    />
                    <div className="flex-1 bg-white/5 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm">
                          @{comment.author.username}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {formatRelativeTime(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{comment.content}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Tip Modal */}
      {showTipModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !isProcessing && closeTipModal()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="tip-modal-title"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-2xl p-8 max-w-md w-full border border-white/10 shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#D4AF37] to-[#C9A62F] rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-black"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 id="tip-modal-title" className="text-2xl font-bold mb-2">
                Tip @{post.author.username}
              </h3>
              <p className="text-gray-400">Send SOL instantly to support this creator</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {[1, 5, 10, 20, 50, 100].map((amount) => (
                  <motion.button
                    key={amount}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTipAmount(amount.toString())}
                    disabled={isProcessing}
                    className={`py-3 rounded-xl font-bold transition-all ${
                      tipAmount === amount.toString()
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#C9A62F] text-black shadow-lg shadow-[#D4AF37]/30'
                        : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                    }`}
                  >
                    ${amount}
                  </motion.button>
                ))}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2 font-medium">
                  Custom Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                    $
                  </span>
                  <input
                    type="number"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    disabled={isProcessing}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-4 text-white text-lg outline-none focus:border-[#D4AF37] focus:bg-white/10 transition-all disabled:opacity-50"
                    placeholder="0.00"
                    min="0.1"
                    step="0.5"
                    aria-label="Custom tip amount in USD"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ≈ {(parseFloat(tipAmount || '0') * 0.01).toFixed(4)} SOL
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeTipModal}
                  disabled={isProcessing}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-colors disabled:opacity-50"
                  aria-label="Cancel tip"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleTip}
                  disabled={isProcessing || !tipAmount || parseFloat(tipAmount) <= 0}
                  className="flex-1 py-4 bg-gradient-to-r from-[#D4AF37] to-[#C9A62F] text-black rounded-xl font-bold hover:shadow-lg hover:shadow-[#D4AF37]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Send $${tipAmount || '0'} tip to @${post.author.username}`}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    `Send $${tipAmount || '0'} Tip`
                  )}
                </motion.button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-2">
                🔒 Secure Solana transaction • No platform fees
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.article>
  );
}

export default PostCard;
