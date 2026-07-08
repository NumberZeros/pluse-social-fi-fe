import { PublicKey } from '@solana/web3.js';
import { absoluteUrl, SITE_NAME } from './constants.js';
import { fetchProfile, resolveUsername } from './solana.js';
import type { PageMeta } from './meta-builder.js';

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
