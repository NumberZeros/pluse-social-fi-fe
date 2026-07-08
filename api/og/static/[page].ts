import type { VercelRequest, VercelResponse } from '@vercel/node';
import { renderBotHtml } from '../../_lib/bot-html';
import { buildStaticPageMeta } from '../../_lib/meta-builder';
import { buildSchemaForStaticPage } from '../../_lib/schema-builder';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const page = req.query.page as string;
  if (!page) {
    res.status(400).json({ error: 'Missing page' });
    return;
  }

  try {
    const meta = buildStaticPageMeta(page);
    if (!meta) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }

    const schema = await buildSchemaForStaticPage(page);
    const html = renderBotHtml(meta, schema);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    res.status(200).send(html);
  } catch (error) {
    console.error('OG static error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
