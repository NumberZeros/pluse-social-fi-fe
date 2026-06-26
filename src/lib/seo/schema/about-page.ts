import { SITE_URL } from '../constants';
import type { SchemaOrgObject } from './types';

export function buildAboutPageSchema(options: {
  name: string;
  description: string;
}): SchemaOrgObject {
  return {
    '@type': 'AboutPage',
    '@id': `${SITE_URL}/what#webpage`,
    url: `${SITE_URL}/what`,
    name: options.name,
    description: options.description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#organization` },
  };
}
