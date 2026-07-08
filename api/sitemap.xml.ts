import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SITE_URL } from '../_lib/constants';
import { fetchAllPostIds, fetchAllProfileUsernames } from '../_lib/solana';

const STATIC_URLS = [
  { loc: '/', priority: '1.0', changefreq: 'daily' },
  { loc: '/feed', priority: '0.9', changefreq: 'hourly' },
  { loc: '/explore', priority: '0.9', changefreq: 'hourly' },
  { loc: '/what', priority: '0.7', changefreq: 'weekly' },
  { loc: '/why', priority: '0.7', changefreq: 'weekly' },
  { loc: '/guide', priority: '0.7', changefreq: 'weekly' },
];

function urlEntry(loc: string, priority: string, changefreq: string, lastmod?: string): string {
  const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
  return `  <url>
    <loc>${SITE_URL}${loc}</loc>${lastmodTag}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const staticEntries = STATIC_URLS.map((u) =>
      urlEntry(u.loc, u.priority, u.changefreq, today),
    );

    const [postIds, usernames] = await Promise.all([
      fetchAllPostIds(5000),
      fetchAllProfileUsernames(5000),
    ]);

    const postEntries = postIds.map((id) =>
      urlEntry(`/post/${id}`, '0.6', 'weekly', today),
    );
    const profileEntries = usernames.map((name) =>
      urlEntry(`/${encodeURIComponent(name)}`, '0.8', 'weekly', today),
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...postEntries, ...profileEntries].join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Sitemap error:', error);
    res.status(500).send('Error generating sitemap');
  }
}
