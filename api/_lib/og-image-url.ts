import { absoluteUrl } from './constants.js';
import { sanitizeImageUrl } from './sanitize-image-url.js';

const IPFS_PATH_RE = /\/ipfs\/([A-Za-z0-9]+)/;

/** CIDv0 base58 — reject path traversal and odd characters. */
const CID_RE = /^[A-Za-z0-9]{32,128}$/;

export function extractIpfsCid(url: string): string | null {
  if (url.startsWith('ipfs://')) {
    const cid = url.slice('ipfs://'.length).split('/')[0];
    return cid && CID_RE.test(cid) ? cid : null;
  }

  const match = url.match(IPFS_PATH_RE);
  if (!match?.[1] || !CID_RE.test(match[1])) return null;
  return match[1];
}

/**
 * Resolve an image URL for OG crawlers (Telegram, etc.).
 * IPFS images are proxied through our domain so crawlers avoid slow gateway timeouts.
 */
export function toOgImageUrl(url: string): string | null {
  const sanitized = sanitizeImageUrl(url);
  if (!sanitized) return null;

  const cid = extractIpfsCid(url) ?? extractIpfsCid(sanitized);
  if (cid) {
    return absoluteUrl(`/api/image/ipfs/${cid}`);
  }

  return sanitized;
}
