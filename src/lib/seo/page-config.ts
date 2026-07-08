import { DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, DEFAULT_TITLE } from './constants';
import type { BreadcrumbItem, SchemaType } from './schema/types';

export type RobotsDirective = 'index,follow' | 'noindex,nofollow' | 'noindex,follow';

export interface PageSeoConfig {
  path: string;
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogType: 'website' | 'article' | 'profile';
  robots: RobotsDirective;
  schemaTypes: SchemaType[];
  breadcrumbs?: BreadcrumbItem[];
}

const HOME_BREADCRUMB: BreadcrumbItem[] = [{ name: 'Home', path: '/' }];

export const PAGE_SEO_CONFIG: Record<string, PageSeoConfig> = {
  '/': {
    path: '/',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    keywords: ['pulse social', 'supporter shares', 'solana', 'creator economy', 'web3 social'],
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
    robots: 'index,follow',
    schemaTypes: ['Organization', 'WebSite', 'SoftwareApplication', 'WebPage'],
  },
  '/feed': {
    path: '/feed',
    title: 'Feed',
    description:
      'Your personalized feed from creators you follow, plus a global discover feed. Buy Supporter Shares to unlock exclusive content.',
    keywords: ['feed', 'posts', 'creators', 'supporter shares', 'pulse social'],
    ogImage: '/og-image-feed.png',
    ogType: 'website',
    robots: 'index,follow',
    schemaTypes: ['WebPage', 'ItemList', 'BreadcrumbList'],
    breadcrumbs: [...HOME_BREADCRUMB, { name: 'Feed', path: '/feed' }],
  },
  '/explore': {
    path: '/explore',
    title: 'Explore',
    description:
      'Discover creators on Pulse. Find supporters-only content and support your favorites with Supporter Shares.',
    keywords: ['explore', 'discover', 'creators', 'trending', 'pulse social'],
    ogImage: '/og-image-explore.png',
    ogType: 'website',
    robots: 'index,follow',
    schemaTypes: ['WebPage', 'ItemList', 'BreadcrumbList'],
    breadcrumbs: [...HOME_BREADCRUMB, { name: 'Explore', path: '/explore' }],
  },
  '/dashboard': {
    path: '/dashboard',
    title: 'Creator Dashboard',
    description: 'Manage your creator profile, Supporter Shares pool, and on-chain stats.',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
    robots: 'noindex,nofollow',
    schemaTypes: ['WebPage'],
    breadcrumbs: [...HOME_BREADCRUMB, { name: 'Dashboard', path: '/dashboard' }],
  },
  '/what': {
    path: '/what',
    title: 'What is Pulse Social?',
    description:
      'Learn how Supporter Shares let fans back creators on-chain and unlock exclusive content on Solana.',
    keywords: ['what is pulse', 'supporter shares', 'solana social', 'creator platform'],
    ogImage: '/og-image-what.png',
    ogType: 'website',
    robots: 'index,follow',
    schemaTypes: ['AboutPage', 'BreadcrumbList'],
    breadcrumbs: [...HOME_BREADCRUMB, { name: 'What is Pulse', path: '/what' }],
  },
  '/why': {
    path: '/why',
    title: 'Why Pulse Social?',
    description:
      'Creator-owned economics on Solana. Fair support, transparent pricing, and direct fan relationships.',
    keywords: ['why pulse', 'creator economics', 'web3 social', 'fair creator pay'],
    ogImage: '/og-image-why.png',
    ogType: 'website',
    robots: 'index,follow',
    schemaTypes: ['WebPage', 'BreadcrumbList'],
    breadcrumbs: [...HOME_BREADCRUMB, { name: 'Why Pulse', path: '/why' }],
  },
  '/guide': {
    path: '/guide',
    title: 'User Guide',
    description:
      'Step-by-step guide to creating a profile, launching Supporter Shares, posting exclusive content, and supporting creators.',
    keywords: ['user guide', 'how to', 'supporter shares', 'pulse social tutorial'],
    ogImage: '/og-image-guide.png',
    ogType: 'website',
    robots: 'index,follow',
    schemaTypes: ['WebPage', 'FAQPage', 'HowTo', 'BreadcrumbList'],
    breadcrumbs: [...HOME_BREADCRUMB, { name: 'User Guide', path: '/guide' }],
  },
};

const STATIC_PATHS = new Set(Object.keys(PAGE_SEO_CONFIG));

export function getPageSeoConfig(pathname: string): PageSeoConfig | null {
  const path = pathname.split('?')[0].split('#')[0] || '/';
  if (STATIC_PATHS.has(path)) {
    return PAGE_SEO_CONFIG[path];
  }
  if (path.startsWith('/post/')) {
    return null;
  }
  if (path.match(/^\/[^/]+$/)) {
    return null;
  }
  return null;
}

export function getBreadcrumbsForPath(pathname: string): BreadcrumbItem[] {
  const config = getPageSeoConfig(pathname);
  return config?.breadcrumbs ?? HOME_BREADCRUMB;
}
