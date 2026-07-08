import { TWITTER_HANDLE } from './constants.js';
import type { PageMeta } from './meta-builder.js';

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
  const image = escapeHtml(meta.image);
  const url = escapeHtml(meta.url);
  const schemaJson = JSON.stringify(schema).replace(/</g, '\\u003c');
  const imageDimensions =
    meta.imageWidth != null && meta.imageHeight != null
      ? `<meta property="og:image:width" content="${meta.imageWidth}" />
  <meta property="og:image:height" content="${meta.imageHeight}" />`
      : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta name="robots" content="${meta.robots}" />
  <link rel="canonical" href="${url}" />
  <meta property="og:type" content="${meta.type}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  ${imageDimensions}
  <meta property="og:site_name" content="Pulse Social" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="${TWITTER_HANDLE}" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  ${meta.author ? `<meta property="article:author" content="${escapeHtml(meta.author)}" />` : ''}
  ${meta.publishedTime ? `<meta property="article:published_time" content="${meta.publishedTime}" />` : ''}
  <script type="application/ld+json">${schemaJson}</script>
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
  <a href="${url}">View on Pulse Social</a>
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
