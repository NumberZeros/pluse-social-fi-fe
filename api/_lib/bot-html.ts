import { OG_HEIGHT, OG_WIDTH, TWITTER_HANDLE } from './constants';
import type { PageMeta } from './meta-builder';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderBotHtml(meta: PageMeta, schema: object): string {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const schemaJson = JSON.stringify(schema).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta name="robots" content="${meta.robots}" />
  <link rel="canonical" href="${meta.url}" />
  <meta property="og:type" content="${meta.type}" />
  <meta property="og:url" content="${meta.url}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${meta.image}" />
  <meta property="og:image:width" content="${OG_WIDTH}" />
  <meta property="og:image:height" content="${OG_HEIGHT}" />
  <meta property="og:site_name" content="Pulse Social" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="${TWITTER_HANDLE}" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${meta.image}" />
  ${meta.author ? `<meta property="article:author" content="${escapeHtml(meta.author)}" />` : ''}
  ${meta.publishedTime ? `<meta property="article:published_time" content="${meta.publishedTime}" />` : ''}
  <script type="application/ld+json">${schemaJson}</script>
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
  <a href="${meta.url}">View on Pulse Social</a>
</body>
</html>`;
}

export function botHtmlResponse(html: string): Response {
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
