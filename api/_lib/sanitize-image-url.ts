const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

/** Reject characters that can break HTML attributes or enable injection. */
const UNSAFE_URL_CHARS = /[<>"'&\s]/;

/**
 * Normalize and validate an image URL for OG meta tags.
 * Accepts http(s):// URLs and converts ipfs://<cid> to Pinata gateway.
 */
export function sanitizeImageUrl(url: string): string | null {
  if (!url) return null;

  let resolved = url.trim();

  if (resolved.startsWith('ipfs://')) {
    const cid = resolved.slice('ipfs://'.length);
    if (!cid || UNSAFE_URL_CHARS.test(cid)) return null;
    resolved = `${PINATA_GATEWAY}/${cid}`;
  }

  if (!/^https?:\/\//i.test(resolved)) return null;
  if (UNSAFE_URL_CHARS.test(resolved)) return null;

  return resolved;
}
