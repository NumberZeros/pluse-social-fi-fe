import { SITE_URL } from '../constants';
import type { SchemaOrgObject } from './types';

export function buildWebPageSchema(options: {
  path: string;
  name: string;
  description: string;
}): SchemaOrgObject {
  const url = `${SITE_URL}${options.path}`;
  return {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: options.name,
    description: options.description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#organization` },
  };
}
