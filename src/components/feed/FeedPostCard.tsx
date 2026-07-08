import { MotionCard } from '../../design-system';
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
    <MotionCard
      variant="glass"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl p-6 border border-border hover:border-border transition-all backdrop-blur-xl bg-background/40 hover:bg-background/60 shadow-lg"
    >
      <div className="flex items-start gap-3 mb-4">
        <Link to={`/${authorPath}`}>
          <img
            src={post.author.avatar}
            alt={post.author.username}
            className="w-12 h-12 rounded-full border border-border"
          />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/${authorPath}`}
              className="font-bold text-foreground hover:text-primary transition-colors"
            >
              {post.author.username}
            </Link>
            <span className="text-muted text-sm">
              {post.author.address.slice(0, 4)}...{post.author.address.slice(-4)}
            </span>
            <span className="text-muted text-sm">·</span>
            <Link
              to={`/post/${post.id}`}
              className="text-muted text-sm hover:text-foreground transition-colors"
            >
              {new Date(post.timestamp).toLocaleDateString()}
            </Link>
            {post.accessLevel === 'supporters' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 border border-primary/30 rounded-full text-xs font-medium text-primary">
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

      <div className="flex items-center gap-6 text-muted pt-4 border-t border-border">
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
            className="flex items-center gap-2 hover:text-primary transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Tip creator"
          >
            <div className="p-2 rounded-full group-hover:bg-primary/10">
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
            text={post.content?.slice(0, 200) ?? ''}
          />
        )}
      </div>
    </MotionCard>
  );
}
