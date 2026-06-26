import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, DollarSign, Lock } from 'lucide-react';
import { CommentThread } from './CommentThread';
import { SupporterGatedContent } from './SupporterGatedContent';
import { SharePostButton } from './SharePostButton';
import type { PostAccessLevel } from '../../services/ipfs';

export interface FeedPostData {
  id: string;
  content: string;
  author: {
    username: string;
    authorUsername?: string;
    address: string;
    avatar: string;
  };
  timestamp: number;
  images: string[];
  videos?: string[];
  likes: number;
  comments?: number;
  tips: number;
  isLiked: boolean;
  accessLevel: PostAccessLevel;
  gatedContentUri?: string;
}

interface FeedPostCardProps {
  post: FeedPostData;
  index?: number;
  viewerAddress?: string;
  isPaused?: boolean;
  onLike?: (postId: string, isLiked: boolean) => void;
  onTip?: (post: FeedPostData) => void;
  showShare?: boolean;
  showTipCount?: boolean;
}

export function FeedPostCard({
  post,
  index = 0,
  viewerAddress,
  isPaused = false,
  onLike,
  onTip,
  showShare = true,
  showTipCount = false,
}: FeedPostCardProps) {
  const authorPath = post.author.authorUsername || post.author.address;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all backdrop-blur-xl bg-black/40 hover:bg-black/60 shadow-lg"
    >
      <div className="flex items-start gap-3 mb-4">
        <Link to={`/${authorPath}`}>
          <img
            src={post.author.avatar}
            alt={post.author.username}
            className="w-12 h-12 rounded-full border border-white/10"
          />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/${authorPath}`}
              className="font-bold text-white hover:text-[var(--color-solana-green)] transition-colors"
            >
              {post.author.username}
            </Link>
            <span className="text-gray-400 text-sm">
              {post.author.address.slice(0, 4)}...{post.author.address.slice(-4)}
            </span>
            <span className="text-gray-500 text-sm">·</span>
            <Link
              to={`/post/${post.id}`}
              className="text-gray-500 text-sm hover:text-white transition-colors"
            >
              {new Date(post.timestamp).toLocaleDateString()}
            </Link>
            {post.accessLevel === 'supporters' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--color-solana-green)]/10 border border-[var(--color-solana-green)]/30 rounded-full text-xs font-medium text-[var(--color-solana-green)]">
                <Lock className="w-3 h-3" />
                Supporters
              </span>
            )}
          </div>
        </div>
      </div>

      <SupporterGatedContent
        creatorAddress={post.author.address}
        viewerAddress={viewerAddress}
        accessLevel={post.accessLevel}
        creatorUsername={post.author.username}
        postId={post.id}
        previewContent={post.content}
        previewImages={post.images}
        previewVideos={post.videos}
        gatedContentUri={post.gatedContentUri}
      />

      <div className="flex items-center gap-6 text-gray-500 pt-4 border-t border-white/5">
        {onLike && (
          <button
            onClick={() => onLike(post.id, post.isLiked)}
            disabled={isPaused}
            className={`flex items-center gap-2 hover:text-pink-500 transition-colors group ${post.isLiked ? 'text-pink-500' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div
              className={`p-2 rounded-full group-hover:bg-pink-500/10 ${post.isLiked ? 'bg-pink-500/10' : ''}`}
            >
              <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
            </div>
            <span className="text-sm font-medium">{post.likes}</span>
          </button>
        )}

        <CommentThread postId={post.id} commentCount={post.comments} />

        {onTip && (
          <button
            onClick={() => onTip(post)}
            disabled={isPaused}
            className="flex items-center gap-2 hover:text-[var(--color-solana-green)] transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Tip creator"
          >
            <div className="p-2 rounded-full group-hover:bg-[var(--color-solana-green)]/10">
              <DollarSign className="w-5 h-5" />
            </div>
            {showTipCount && (
              <span className="text-sm font-medium">{post.tips.toFixed(2)} SOL</span>
            )}
            {!showTipCount && (
              <span className="text-sm font-medium">Tip</span>
            )}
          </button>
        )}

        {showShare && (
          <SharePostButton
            postId={post.id}
            title={`Post by @${post.author.username}`}
            text={post.content.slice(0, 100)}
          />
        )}
      </div>
    </motion.div>
  );
}
