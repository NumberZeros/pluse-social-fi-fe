import { buildPostMeta, buildProfileMeta, buildStaticPageMeta } from './meta-builder.js';
import { fetchPostMetadata } from './ipfs.js';
import { fetchPost, fetchProfile, resolveUsername } from './solana.js';
import { absoluteUrl } from './constants.js';

export async function buildSchemaForStaticPage(page: string): Promise<object> {
  const meta = buildStaticPageMeta(page);
  if (!meta) return buildDefaultSchema();

  const graph: object[] = [
    {
      '@type': 'Organization',
      '@id': `${absoluteUrl('/')}#organization`,
      name: 'Pulse Social',
      url: absoluteUrl('/'),
    },
    {
      '@type': 'WebPage',
      '@id': `${meta.url}#webpage`,
      url: meta.url,
      name: meta.title,
      description: meta.description,
    },
  ];

  if (page === 'index') {
    graph.push({
      '@type': 'WebSite',
      '@id': `${absoluteUrl('/')}#website`,
      name: 'Pulse Social',
      url: absoluteUrl('/'),
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

export async function buildSchemaForPost(postId: string): Promise<object> {
  const post = await fetchPost(postId);
  if (!post) return buildDefaultSchema();

  const metadata = await fetchPostMetadata(post.uri);
  const { PublicKey } = await import('@solana/web3.js');
  const profile = await fetchProfile(new PublicKey(post.author));
  const authorName = profile?.username || post.author.slice(0, 8);
  const isGated = metadata.accessLevel === 'supporters';
  const url = absoluteUrl(`/post/${postId}`);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${absoluteUrl('/')}#organization`,
        name: 'Pulse Social',
        url: absoluteUrl('/'),
      },
      {
        '@type': 'SocialMediaPosting',
        '@id': url,
        headline: `${authorName} on Pulse Social`,
        description: isGated
          ? 'Supporters-only post'
          : metadata.content.slice(0, 160),
        url,
        datePublished: new Date(post.createdAt * 1000).toISOString(),
        author: {
          '@type': 'Person',
          name: authorName,
          url: absoluteUrl(`/${authorName}`),
        },
        isAccessibleForFree: !isGated,
        ...(isGated ? {} : { articleBody: metadata.content }),
      },
    ],
  };
}

export async function buildSchemaForProfile(username: string): Promise<object> {
  const pubkey = await resolveUsername(username);
  if (!pubkey) return buildDefaultSchema();

  const profile = await fetchProfile(pubkey);
  const displayName = profile?.username || username;
  const url = absoluteUrl(`/${displayName}`);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${absoluteUrl('/')}#organization`,
        name: 'Pulse Social',
        url: absoluteUrl('/'),
      },
      {
        '@type': 'ProfilePage',
        '@id': `${url}#profilepage`,
        url,
        name: `@${displayName}`,
        mainEntity: {
          '@type': 'Person',
          name: displayName,
          url,
          identifier: pubkey.toBase58(),
        },
      },
    ],
  };
}

function buildDefaultSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${absoluteUrl('/')}#organization`,
        name: 'Pulse Social',
        url: absoluteUrl('/'),
      },
    ],
  };
}

export { buildPostMeta, buildProfileMeta, buildStaticPageMeta };
