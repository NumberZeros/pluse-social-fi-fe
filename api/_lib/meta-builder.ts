import { PublicKey } from '@solana/web3.js';
import { sanitizeImageUrl } from '../../src/lib/seo/sanitize-image-url';
import { absoluteUrl, DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, OG_HEIGHT, OG_WIDTH, SITE_NAME } from './constants';
import { fetchPostMetadata } from './ipfs';
import { fetchPost, fetchProfile, resolveUsername } from './solana';

export interface PageMeta {
  title: string;
  description: string;
  url: string;
  image: string;
  imageWidth?: number;
  imageHeight?: number;
  type: 'website' | 'article' | 'profile';
  robots: string;
  author?: string;
  publishedTime?: string;
}

const STATIC_PAGES: Record<string, Omit<PageMeta, 'url'> & { path: string }> = {
  index: {
    path: '/',
    title: 'Pulse Social — Supporter Shares on Solana',
    description: DEFAULT_DESCRIPTION,
    image: DEFAULT_OG_IMAGE,
    type: 'website',
    robots: 'index, follow',
  },
  feed: {
    path: '/feed',
    title: 'Feed | Pulse Social',
    description:
      'Your personalized feed from creators you follow, plus a global discover feed. Buy Supporter Shares to unlock exclusive content.',
    image: absoluteUrl('/og-image-feed.png'),
    type: 'website',
    robots: 'index, follow',
  },
  explore: {
    path: '/explore',
    title: 'Explore | Pulse Social',
    description:
      'Discover creators on Pulse. Find supporters-only content and support your favorites.',
    image: absoluteUrl('/og-image-explore.png'),
    type: 'website',
    robots: 'index, follow',
  },
  what: {
    path: '/what',
    title: 'What is Pulse Social?',
    description:
      'Learn how Supporter Shares let fans back creators on-chain and unlock exclusive content.',
    image: absoluteUrl('/og-image-what.png'),
    type: 'website',
    robots: 'index, follow',
  },
  why: {
    path: '/why',
    title: 'Why Pulse Social?',
    description: 'Creator-owned economics on Solana. Fair support and direct fan relationships.',
    image: absoluteUrl('/og-image-why.png'),
    type: 'website',
    robots: 'index, follow',
  },
  guide: {
    path: '/guide',
    title: 'User Guide | Pulse Social',
    description: 'Step-by-step guide to Supporter Shares, exclusive posts, and supporting creators.',
    image: absoluteUrl('/og-image-guide.png'),
    type: 'website',
    robots: 'index, follow',
  },
};

export function buildStaticPageMeta(page: string): PageMeta | null {
  const config = STATIC_PAGES[page];
  if (!config) return null;
  return {
    ...config,
    url: absoluteUrl(config.path),
  };
}

export async function buildPostMeta(postId: string): Promise<PageMeta | null> {
  const post = await fetchPost(postId);
  if (!post) return null;

  const metadata = await fetchPostMetadata(post.uri);
  const profile = await fetchProfile(new PublicKey(post.author));
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

export async function buildProfileMeta(username: string): Promise<PageMeta | null> {
  const pubkey = await resolveUsername(username);
  if (!pubkey) return null;

  const profile = await fetchProfile(pubkey);
  const displayName = profile?.username || username;

  return {
    title: `@${displayName} | ${SITE_NAME}`,
    description: `View @${displayName}'s profile on Pulse Social. Support with Supporter Shares to unlock exclusive posts.`,
    url: absoluteUrl(`/${displayName}`),
    image: absoluteUrl(`/api/og-image/profile/${encodeURIComponent(displayName)}`),
    type: 'profile',
    robots: 'index, follow',
    author: displayName,
  };
}

export { STATIC_PAGES };
