export const SITE_URL =
  import.meta.env.VITE_SITE_URL?.replace(/\/$/, '') || 'https://pulse.social';

export const SITE_NAME = 'Pulse Social';

export const DEFAULT_TITLE = 'Pulse Social — Supporter Shares on Solana';

export const DEFAULT_DESCRIPTION =
  'Fans buy Supporter Shares to unlock exclusive creator content. Creators earn via tips and on-chain support — built on Solana.';

export const DEFAULT_OG_IMAGE = '/og-image.png';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export const OG_LOCALE = 'en_US';

export const TWITTER_HANDLE = '@pulsesocial';
export const TWITTER_SITE = '@pulsesocial';

export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/pulsesocial',
  discord: 'https://discord.gg/pulse',
  telegram: 'https://t.me/pulsesocial',
  github: 'https://github.com/NumberZeros/pluse-social-fi-fe',
} as const;

export const RESERVED_USERNAMES = [
  'feed',
  'explore',
  'dashboard',
  'what',
  'why',
  'guide',
  'post',
  'api',
  'assets',
  'shares',
  'creator',
  'marketplace',
  'groups',
  'governance',
  'subscriptions',
  'airdrop',
  'moderation',
  'export',
] as const;

export function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function resolveOgImage(image?: string): string {
  if (!image) return absoluteUrl(DEFAULT_OG_IMAGE);
  return image.startsWith('http') ? image : absoluteUrl(image);
}
