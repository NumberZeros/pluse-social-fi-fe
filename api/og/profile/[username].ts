import type { VercelRequest, VercelResponse } from '@vercel/node';
import { renderBotHtml } from '../../_lib/bot-html.js';
import { buildProfileMeta } from '../../_lib/meta-builder.js';
import { buildSchemaForProfile } from '../../_lib/schema-builder.js';

export const config = {
  maxDuration: 60,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const username = req.query.username as string;
  if (!username) {
    res.status(400).json({ error: 'Missing username' });
    return;
  }

  try {
    const meta = await buildProfileMeta(username);
    if (!meta) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    const schema = await buildSchemaForProfile(username);
    const html = renderBotHtml(meta, schema);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(html);
  } catch (error) {
    console.error('OG profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
