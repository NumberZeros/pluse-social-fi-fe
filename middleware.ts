const BOT_UA =
  /facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot|Googlebot|bingbot|Applebot|Slurp|DuckDuckBot|ia_archiver|Pinterestbot|Embedly|Quora Link Preview|Showyoubot|outbrain|W3C_Validator|redditbot|Rogerbot|vkShare|facebot/i;

const RESERVED = new Set([
  'feed',
  'explore',
  'dashboard',
  'what',
  'why',
  'guide',
  'post',
  'api',
  'assets',
  'shares',
  'creator',
  'marketplace',
  'groups',
  'governance',
  'subscriptions',
  'airdrop',
  'moderation',
  'export',
]);

const STATIC_PAGES: Record<string, string> = {
  '/': 'index',
  '/feed': 'feed',
  '/explore': 'explore',
  '/what': 'what',
  '/why': 'why',
  '/guide': 'guide',
};

export default async function middleware(request: Request) {
  const ua = request.headers.get('user-agent') || '';
  if (!BOT_UA.test(ua)) {
    return;
  }

  const url = new URL(request.url);
  const { pathname } = url;

  if (pathname.startsWith('/api/')) {
    return;
  }

  const postMatch = pathname.match(/^\/post\/([^/]+)$/);
  if (postMatch) {
    return Response.rewrite(new URL(`/api/og/post/${postMatch[1]}`, request.url));
  }

  const staticPage = STATIC_PAGES[pathname];
  if (staticPage) {
    return Response.rewrite(new URL(`/api/og/static/${staticPage}`, request.url));
  }

  const profileMatch = pathname.match(/^\/([^/]+)$/);
  if (profileMatch && !RESERVED.has(profileMatch[1].toLowerCase())) {
    return Response.rewrite(
      new URL(`/api/og/profile/${encodeURIComponent(profileMatch[1])}`, request.url),
    );
  }

  return;
}

export const config = {
  matcher: [
    '/',
    '/feed',
    '/explore',
    '/what',
    '/why',
    '/guide',
    '/post/:path*',
    '/:username',
  ],
};
