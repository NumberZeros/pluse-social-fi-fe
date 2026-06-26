import { Helmet } from 'react-helmet-async';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  OG_HEIGHT,
  OG_LOCALE,
  OG_WIDTH,
  SITE_NAME,
  SITE_URL,
  TWITTER_HANDLE,
  TWITTER_SITE,
  absoluteUrl,
  resolveOgImage,
} from '../lib/seo/constants';
import type { SchemaOrgObject } from '../lib/seo/schema/types';

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
  noindex?: boolean;
  canonical?: string;
  schema?: SchemaOrgObject | SchemaOrgObject[];
  video?: string;
  videoWidth?: number;
  videoHeight?: number;
  tags?: string[];
}

function formatTitle(title?: string): string {
  if (!title) return DEFAULT_TITLE;
  if (title.includes('Pulse Social')) return title;
  return `${title} | Pulse Social`;
}

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_OG_IMAGE,
  imageAlt,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  keywords,
  noindex = false,
  canonical,
  schema,
  video,
  videoWidth,
  videoHeight,
  tags,
}: SEOProps) {
  const fullTitle = formatTitle(title);
  const canonicalPath = canonical ?? url ?? '/';
  const fullUrl = canonicalPath.startsWith('http')
    ? canonicalPath
    : absoluteUrl(canonicalPath === '/' ? '' : canonicalPath);
  const fullImage = resolveOgImage(image);
  const robotsContent = noindex ? 'noindex, nofollow' : 'index, follow';

  const schemaData = schema
    ? Array.isArray(schema)
      ? { '@context': 'https://schema.org', '@graph': schema }
      : schema
    : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}

      <link rel="canonical" href={fullUrl} />
      <link rel="alternate" hrefLang="en" href={fullUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content={String(OG_WIDTH)} />
      <meta property="og:image:height" content={String(OG_HEIGHT)} />
      <meta property="og:image:alt" content={imageAlt || fullTitle} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={OG_LOCALE} />

      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' &&
        tags?.map((tag) => <meta key={tag} property="article:tag" content={tag} />)}

      {video && (
        <>
          <meta property="og:video" content={video} />
          <meta property="og:video:secure_url" content={video} />
          <meta property="og:video:type" content="video/mp4" />
          {videoWidth && (
            <meta property="og:video:width" content={String(videoWidth)} />
          )}
          {videoHeight && (
            <meta property="og:video:height" content={String(videoHeight)} />
          )}
        </>
      )}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_SITE} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:image:alt" content={imageAlt || fullTitle} />

      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />
      <meta name="language" content="English" />

      <meta name="theme-color" content="#ABFE2C" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Pulse" />

      <meta name="web3" content="solana" />
      <meta name="blockchain" content="solana" />

      {schemaData && (
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      )}
    </Helmet>
  );
}

export { SITE_URL, DEFAULT_TITLE, DEFAULT_DESCRIPTION };
