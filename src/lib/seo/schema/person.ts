import { absoluteUrl } from '../constants';
import type { SchemaOrgObject } from './types';

export function buildPersonSchema(options: {
  name: string;
  identifier?: string;
  image?: string;
  path: string;
  followers?: number;
  posts?: number;
}): SchemaOrgObject {
  const url = absoluteUrl(options.path);
  const schema: SchemaOrgObject = {
    '@type': 'Person',
    '@id': `${url}#person`,
    name: options.name,
    url,
  };

  if (options.identifier) {
    schema.identifier = options.identifier;
  }
  if (options.image) {
    schema.image = options.image;
  }
  if (options.followers !== undefined || options.posts !== undefined) {
    const stats: SchemaOrgObject[] = [];
    if (options.followers !== undefined) {
      stats.push({
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/FollowAction',
        userInteractionCount: options.followers,
      });
    }
    if (options.posts !== undefined) {
      stats.push({
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/WriteAction',
        userInteractionCount: options.posts,
      });
    }
    schema.interactionStatistic = stats;
  }

  return schema;
}
