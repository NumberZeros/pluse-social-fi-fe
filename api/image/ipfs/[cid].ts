import type { VercelRequest, VercelResponse } from '@vercel/node';
import { extractIpfsCid } from '../../_lib/og-image-url.js';

const GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs',
  'https://dweb.link/ipfs',
  'https://w3s.link/ipfs',
  'https://ipfs.io/ipfs',
] as const;

const FETCH_TIMEOUT_MS = 20_000;

async function fetchFromGateways(cid: string): Promise<{ body: Buffer; contentType: string } | null> {
  for (const gateway of GATEWAYS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(`${gateway}/${cid}`, { signal: controller.signal });
      if (!response.ok) continue;

      const contentType = response.headers.get('content-type') || 'image/jpeg';
      if (!contentType.startsWith('image/')) continue;

      const body = Buffer.from(await response.arrayBuffer());
      if (body.length === 0) continue;

      return { body, contentType };
    } catch {
      // try next gateway
    } finally {
      clearTimeout(timeout);
    }
  }

  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const rawCid = req.query.cid;
  const cid = typeof rawCid === 'string' ? extractIpfsCid(`ipfs://${rawCid}`) : null;

  if (!cid) {
    res.status(400).json({ error: 'Invalid CID' });
    return;
  }

  const result = await fetchFromGateways(cid);
  if (!result) {
    res.status(502).json({ error: 'Image unavailable' });
    return;
  }

  res.setHeader('Content-Type', result.contentType);
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
  res.status(200).send(result.body);
}
