export const SITE_URL = (process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://pulsesol.xyz').replace(
  /\/$/,
  '',
);

export const SITE_NAME = 'Pulse Social';

export const DEFAULT_DESCRIPTION =
  'Fans buy Supporter Shares to unlock exclusive creator content. Creators earn via tips and on-chain support — built on Solana.';

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export const TWITTER_HANDLE = '@pulsesocial';

export const RESERVED_USERNAMES = new Set([
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
]);

export function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}
