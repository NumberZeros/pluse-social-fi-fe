import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { SEO } from '../components/SEO';
import { FeedPostCard } from '../components/feed/FeedPostCard';
import { TipPostModal } from '../components/feed/TipPostModal';
import { PostSkeleton } from '../components/LoadingStates';
import { useSinglePost } from '../hooks/useSinglePost';
import { useLikePost, useUnlikePost, useTipPost } from '../hooks/useFeed';
import { useWallet } from '@solana/wallet-adapter-react';
import { usePlatformAction } from '../hooks/usePlatformAction';
import { useRequireWallet } from '../hooks/useRequireWallet';
import { buildPostPageSchema } from '../lib/seo/schema';
import { PAGE_SEO_CONFIG } from '../lib/seo/page-config';
import { toast } from 'react-hot-toast';

export function Post() {
  const { postId } = useParams<{ postId: string }>();
  const { publicKey } = useWallet();
  const { data: post, isLoading, isError } = useSinglePost(postId);
  const { isPaused, guardAction } = usePlatformAction();
  const requireWallet = useRequireWallet();
  const likePostMutation = useLikePost();
  const unlikePostMutation = useUnlikePost();
  const tipPostMutation = useTipPost();
  const [tipModalOpen, setTipModalOpen] = useState(false);

  const authorUsername = post?.authorUsername || post?.author || 'creator';
  const authorPath = post?.authorUsername || post?.author || '';
  const isGated = post?.accessLevel === 'supporters';
  const isPublic = !isGated;

  const seoTitle = post
    ? `${authorUsername}: ${isGated ? 'Supporters-only post' : post.content.slice(0, 60)}`
    : 'Post';

  const seoDescription = post
    ? isGated
      ? `Supporters-only post by @${authorUsername}. Buy Supporter Shares to unlock.`
      : post.content.slice(0, 160)
    : 'View this post on Pulse Social';

  const ogImage = postId
    ? `/api/og-image/post/${postId}`
    : PAGE_SEO_CONFIG['/feed'].ogImage;

  const schema =
    post && postId
      ? buildPostPageSchema(
          {
            postId,
            headline: seoTitle,
            description: seoDescription,
            authorName: authorUsername,
            authorPath: `/${authorPath}`,
            datePublished: new Date(post.createdAt).toISOString(),
            images: post.imageUrls,
            videos: post.videoUrls,
            likes: post.likes,
            comments: post.comments,
            isAccessibleForFree: isPublic,
            articleBody: isPublic ? post.content : undefined,
          },
          [
            { name: 'Home', path: '/' },
            { name: 'Feed', path: '/feed' },
            { name: `@${authorUsername}`, path: `/${authorPath}` },
            { name: 'Post', path: `/post/${postId}` },
          ],
        )
      : undefined;

  const handleLike = (id: string, isLiked: boolean) => {
    guardAction(() => {
      if (!requireWallet()) return;
      if (isLiked) unlikePostMutation.mutate(id);
      else likePostMutation.mutate(id);
    });
  };

  const handleTip = () => {
    guardAction(() => {
      if (!requireWallet()) return;
      setTipModalOpen(true);
    });
  };

  const handleTipSubmit = (amount: number) => {
    if (!post) return;
    tipPostMutation.mutate(
      { postId: post.id, authorAddress: post.author, amount },
      {
        onSuccess: () => {
          toast.success(`Tipped ${amount} SOL!`);
          setTipModalOpen(false);
        },
        onError: () => toast.error('Failed to send tip'),
      },
    );
  };

  const feedPost = post
    ? {
        id: post.id,
        content: post.content,
        author: {
          username: authorUsername,
          authorUsername: post.authorUsername,
          address: post.author,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}`,
        },
        timestamp: post.createdAt,
        images: post.imageUrls,
        videos: post.videoUrls,
        likes: post.likes,
        comments: post.comments,
        tips: post.tips,
        isLiked: post.isLiked,
        accessLevel: post.accessLevel,
        gatedContentUri: post.gatedContentUri,
      }
    : null;

  return (
    <AppLayout>
      <SEO
        title={seoTitle}
        description={seoDescription}
        url={postId ? `/post/${postId}` : '/feed'}
        type="article"
        author={authorUsername}
        publishedTime={post ? new Date(post.createdAt).toISOString() : undefined}
        image={ogImage}
        imageAlt={seoTitle}
        noindex={isGated}
        schema={schema}
        video={post?.videoUrls[0]}
      />

      <div className="max-w-2xl mx-auto pb-12">
        <Link
          to="/feed"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Feed
        </Link>

        {isLoading ? (
          <PostSkeleton />
        ) : isError || !feedPost ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-2xl p-12 border border-white/10 text-center"
          >
            <h1 className="text-2xl font-bold mb-2">Post not found</h1>
            <p className="text-gray-400 mb-6">
              This post may have been removed or the link is invalid.
            </p>
            <Link
              to="/feed"
              className="text-[var(--color-solana-green)] hover:underline"
            >
              Go to Feed
            </Link>
          </motion.div>
        ) : (
          <FeedPostCard
            post={feedPost}
            viewerAddress={publicKey?.toBase58()}
            isPaused={isPaused}
            onLike={handleLike}
            onTip={handleTip}
            showShare
          />
        )}
      </div>

      <TipPostModal
        isOpen={tipModalOpen}
        onClose={() => setTipModalOpen(false)}
        onSubmit={handleTipSubmit}
        isSubmitting={tipPostMutation.isPending}
      />
    </AppLayout>
  );
}

export default Post;
