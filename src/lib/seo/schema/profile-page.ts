import { absoluteUrl } from '../constants';
import type { SchemaOrgObject } from './types';

export function buildProfilePageSchema(options: {
  name: string;
  description: string;
  path: string;
}): SchemaOrgObject {
  const url = absoluteUrl(options.path);
  return {
    '@type': 'ProfilePage',
    '@id': `${url}#profilepage`,
    url,
    name: options.name,
    description: options.description,
    mainEntity: { '@id': `${url}#person` },
  };
}
