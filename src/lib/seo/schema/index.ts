import { FAQ_ITEMS, GUIDE_SECTIONS } from '../guide-data';
import { buildAboutPageSchema } from './about-page';
import { buildSocialMediaPostingSchema, type ArticleSchemaOptions } from './article';
import { buildBreadcrumbSchema } from './breadcrumb';
import { buildFaqPageSchema } from './faq-page';
import { buildHowToSchemas } from './how-to';
import { buildItemListSchema, type ItemListEntry } from './item-list';
import { buildOrganizationSchema } from './organization';
import { buildPersonSchema } from './person';
import { buildProfilePageSchema } from './profile-page';
import { buildSoftwareApplicationSchema } from './software-app';
import { buildWebPageSchema } from './webpage';
import { buildWebSiteSchema } from './website';
import type { BreadcrumbItem, SchemaOrgObject } from './types';

export type { ArticleSchemaOptions, ItemListEntry, BreadcrumbItem, SchemaOrgObject };

export {
  buildAboutPageSchema,
  buildBreadcrumbSchema,
  buildFaqPageSchema,
  buildHowToSchemas,
  buildItemListSchema,
  buildOrganizationSchema,
  buildPersonSchema,
  buildProfilePageSchema,
  buildSocialMediaPostingSchema,
  buildSoftwareApplicationSchema,
  buildWebPageSchema,
  buildWebSiteSchema,
};

export function buildSchemaGraph(entities: (SchemaOrgObject | null | undefined)[]): SchemaOrgObject {
  const filtered = entities.filter((e): e is SchemaOrgObject => e != null);
  return {
    '@context': 'https://schema.org',
    '@graph': filtered,
  };
}

export function buildHomepageSchema(): SchemaOrgObject {
  return buildSchemaGraph([
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildSoftwareApplicationSchema(),
    buildWebPageSchema({
      path: '/',
      name: 'Pulse Social — Supporter Shares on Solana',
      description:
        'Fans buy Supporter Shares to unlock exclusive creator content. Creators earn via tips and on-chain support — built on Solana.',
    }),
  ]);
}

export function buildStaticPageSchema(
  path: string,
  name: string,
  description: string,
  breadcrumbs: BreadcrumbItem[],
  extra?: SchemaOrgObject | SchemaOrgObject[],
): SchemaOrgObject {
  const extras = extra ? (Array.isArray(extra) ? extra : [extra]) : [];
  return buildSchemaGraph([
    buildOrganizationSchema(),
    buildWebPageSchema({ path, name, description }),
    buildBreadcrumbSchema(breadcrumbs),
    ...extras,
  ]);
}

export function buildAboutPageGraph(
  name: string,
  description: string,
  breadcrumbs: BreadcrumbItem[],
): SchemaOrgObject {
  return buildSchemaGraph([
    buildOrganizationSchema(),
    buildAboutPageSchema({ name, description }),
    buildBreadcrumbSchema(breadcrumbs),
  ]);
}

export function buildGuidePageSchema(breadcrumbs: BreadcrumbItem[]): SchemaOrgObject {
  return buildSchemaGraph([
    buildOrganizationSchema(),
    buildWebPageSchema({
      path: '/guide',
      name: 'User Guide',
      description:
        'Learn how to create a profile, launch Supporter Shares, post exclusive content, and support creators on Pulse Social.',
    }),
    buildFaqPageSchema(FAQ_ITEMS),
    ...buildHowToSchemas(GUIDE_SECTIONS),
    buildBreadcrumbSchema(breadcrumbs),
  ]);
}

export function buildFeedPageSchema(
  breadcrumbs: BreadcrumbItem[],
  posts: ItemListEntry[],
): SchemaOrgObject {
  return buildSchemaGraph([
    buildOrganizationSchema(),
    buildWebPageSchema({
      path: '/feed',
      name: 'Feed',
      description:
        'Your personalized feed from creators you follow, plus a global discover feed. Buy Supporter Shares to unlock exclusive content.',
    }),
    buildItemListSchema(posts, 'Feed Posts'),
    buildBreadcrumbSchema(breadcrumbs),
  ]);
}

export function buildExplorePageSchema(
  breadcrumbs: BreadcrumbItem[],
  items: ItemListEntry[],
): SchemaOrgObject {
  return buildSchemaGraph([
    buildOrganizationSchema(),
    buildWebPageSchema({
      path: '/explore',
      name: 'Explore',
      description:
        'Discover creators on Pulse. Find supporters-only content and support your favorites with Supporter Shares.',
    }),
    buildItemListSchema(items, 'Trending on Pulse'),
    buildBreadcrumbSchema(breadcrumbs),
  ]);
}

export function buildPostPageSchema(
  article: ArticleSchemaOptions,
  breadcrumbs: BreadcrumbItem[],
): SchemaOrgObject {
  return buildSchemaGraph([
    buildOrganizationSchema(),
    buildSocialMediaPostingSchema(article),
    buildBreadcrumbSchema(breadcrumbs),
  ]);
}

export function buildProfilePageGraph(options: {
  name: string;
  description: string;
  path: string;
  identifier?: string;
  image?: string;
  followers?: number;
  posts?: number;
  breadcrumbs: BreadcrumbItem[];
}): SchemaOrgObject {
  return buildSchemaGraph([
    buildOrganizationSchema(),
    buildProfilePageSchema({
      name: options.name,
      description: options.description,
      path: options.path,
    }),
    buildPersonSchema({
      name: options.name,
      identifier: options.identifier,
      image: options.image,
      path: options.path,
      followers: options.followers,
      posts: options.posts,
    }),
    buildBreadcrumbSchema(options.breadcrumbs),
  ]);
}
