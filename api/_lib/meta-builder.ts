import { absoluteUrl, DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, SITE_NAME } from './constants.js';

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

export { STATIC_PAGES };
