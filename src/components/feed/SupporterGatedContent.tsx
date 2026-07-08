import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicKey } from '@solana/web3.js';
import { Lock } from 'lucide-react';
import { useSupporterAccess } from '../../hooks/useSupporterAccess';
import { useGatedPostContent } from '../../hooks/useGatedPostContent';
import { BuySharesModal } from '../shares/BuySharesModal';
import type { PostAccessLevel } from '../../services/ipfs';
import { Button } from '../../design-system';
import { trackEvent } from '../../lib/analytics';

interface SupporterGatedContentProps {
  creatorAddress: string;
  viewerAddress?: string;
  accessLevel?: PostAccessLevel;
  creatorUsername: string;
  postId: string;
  previewContent: string;
  previewImages?: string[];
  previewVideos?: string[];
  gatedContentUri?: string;
}

function PostBody({
  postId,
  content,
  images,
  videos,
}: {
  postId: string;
  content: string;
  images: string[];
  videos: string[];
}) {
  return (
    <>
      <Link to={`/post/${postId}`} className="block">
        <div className="text-foreground mb-4 leading-relaxed whitespace-pre-wrap hover:text-foreground transition-colors">
          {content}
        </div>
      </Link>

      {images.length > 0 && (
        <Link to={`/post/${postId}`} className="block">
          <div
            className={`grid gap-2 mb-4 rounded-xl overflow-hidden ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}
          >
            {images.map((img, i) => (
              <img key={i} src={img} alt="" className="w-full h-64 object-cover" />
            ))}
          </div>
        </Link>
      )}

      {videos.length > 0 && (
        <div className="space-y-2 mb-4">
          {videos.map((video, i) => (
            <video key={i} src={video} controls className="w-full max-h-96 object-contain bg-background rounded-xl" />
          ))}
        </div>
      )}
    </>
  );
}

export function SupporterGatedContent({
  creatorAddress,
  viewerAddress,
  accessLevel = 'public',
  creatorUsername,
  postId,
  previewContent,
  previewImages = [],
  previewVideos = [],
  gatedContentUri,
}: SupporterGatedContentProps) {
  const [showSupportModal, setShowSupportModal] = useState(false);
  const isGated = accessLevel === 'supporters';
  const { data: access, isLoading, isError } = useSupporterAccess(
    isGated ? creatorAddress : undefined,
    viewerAddress,
  );

  const shouldFetchGated = isGated && !!access?.hasAccess && !!gatedContentUri;
  const { data: gatedContent, isLoading: isGatedLoading } = useGatedPostContent(
    gatedContentUri,
    shouldFetchGated,
  );

  if (!isGated) {
    return (
      <PostBody
        postId={postId}
        content={previewContent}
        images={previewImages}
        videos={previewVideos}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-xl bg-surface-2 border border-border p-6 animate-pulse h-24" />
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl bg-surface-2 border border-danger/20 p-6 text-center text-sm text-muted">
        Could not verify supporter access. Try again later.
      </div>
    );
  }

  if (access?.hasAccess) {
    if (gatedContentUri && isGatedLoading) {
      return (
        <div className="rounded-xl bg-surface-2 border border-border p-6 animate-pulse h-24" />
      );
    }

    const content = gatedContent?.content ?? previewContent;
    const images = gatedContent?.images ?? previewImages;
    const videos = gatedContent?.videos ?? previewVideos;

    return <PostBody postId={postId} content={content} images={images} videos={videos} />;
  }

  return (
    <>
      <div className="relative rounded-xl overflow-hidden border border-primary/20">
        <div className="blur-md select-none pointer-events-none opacity-40 p-4 min-h-[80px]">
          <PostBody
            postId={postId}
            content={previewContent}
            images={previewImages}
            videos={[]}
          />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm p-6 text-center">
          <Lock className="w-8 h-8 text-primary mb-3" />
          <p className="font-bold text-foreground mb-1">Supporters-only content</p>
          <p className="text-sm text-muted mb-4 max-w-xs">
            Become a supporter of @{creatorUsername} to unlock this post.
          </p>
          <Button
            size="sm"
            onClick={() => {
              trackEvent('gating_cta_click', {
                creator: creatorAddress,
                post_id: postId,
              });
              setShowSupportModal(true);
            }}
          >
            Become a supporter
          </Button>
        </div>
      </div>

      {showSupportModal && (
        <BuySharesModal
          isOpen
          onClose={() => setShowSupportModal(false)}
          creatorPubkey={new PublicKey(creatorAddress)}
          creatorUsername={creatorUsername}
        />
      )}
    </>
  );
}
