import type { VercelRequest, VercelResponse } from '@vercel/node';
import { renderBotHtml } from '../../_lib/bot-html.js';
import { buildPostMeta } from '../../_lib/post-meta.js';
import { buildSchemaFromPostMeta } from '../../_lib/schema-builder.js';
import { warmOgImageCache } from '../../_lib/warm-image-cache.js';

export const config = {
  maxDuration: 60,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const postId = req.query.postId as string;
  if (!postId) {
    res.status(400).json({ error: 'Missing postId' });
    return;
  }

  try {
    const meta = await buildPostMeta(postId);
    if (!meta) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    await warmOgImageCache(meta.image);

    const html = renderBotHtml(meta, buildSchemaFromPostMeta(meta));
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(html);
  } catch (error) {
    console.error('OG post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
