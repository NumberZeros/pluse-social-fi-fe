import { sanitizeImageUrl } from './sanitize-image-url.js';
import {
  absoluteUrl,
  DEFAULT_DESCRIPTION,
  OG_HEIGHT,
  OG_WIDTH,
  SITE_NAME,
} from './constants.js';
import { fetchPostMetadata } from './ipfs.js';
import { fetchPost, fetchProfile } from './solana-rpc.js';
import type { PageMeta } from './meta-builder.js';

export async function buildPostMeta(postId: string): Promise<PageMeta | null> {
  const post = await fetchPost(postId);
  if (!post) return null;

  const [metadata, profile] = await Promise.all([
    fetchPostMetadata(post.uri),
    fetchProfile(post.author),
  ]);
  const authorName = profile?.username || post.author.slice(0, 8);
  const isGated = metadata.accessLevel === 'supporters';

  const cardImage = absoluteUrl(`/api/og-image/post/${postId}`);
  let image = cardImage;
  let imageWidth: number | undefined = OG_WIDTH;
  let imageHeight: number | undefined = OG_HEIGHT;

  if (!isGated && metadata.images[0]) {
    const sanitized = sanitizeImageUrl(metadata.images[0]);
    if (sanitized) {
      image = sanitized;
      imageWidth = undefined;
      imageHeight = undefined;
    }
  }

  return {
    title: `${authorName}: ${isGated ? 'Supporters-only post' : metadata.content.slice(0, 60)} | ${SITE_NAME}`,
    description: isGated
      ? `Supporters-only post by @${authorName}. Buy Supporter Shares to unlock.`
      : metadata.content.slice(0, 160) || DEFAULT_DESCRIPTION,
    url: absoluteUrl(`/post/${postId}`),
    image,
    imageWidth,
    imageHeight,
    type: 'article',
    robots: isGated ? 'noindex, nofollow' : 'index, follow',
    author: authorName,
    publishedTime: new Date(post.createdAt * 1000).toISOString(),
  };
}
