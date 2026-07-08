import { absoluteUrl } from './constants.js';

const FETCH_TIMEOUT_MS = 25_000;

/** Warm CDN cache before crawlers fetch og:image (Telegram ~5s timeout). */
export async function warmOgImageCache(imageUrl: string): Promise<void> {
  if (!imageUrl.startsWith(absoluteUrl('/api/image/ipfs/'))) return;

  try {
    const response = await fetch(imageUrl, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!response.ok) return;
    await response.arrayBuffer();
  } catch {
    // best-effort; crawlers may still retry
  }
}
