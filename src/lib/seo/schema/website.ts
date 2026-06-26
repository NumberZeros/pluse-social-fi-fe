import { SITE_NAME, SITE_URL } from '../constants';
import type { SchemaOrgObject } from './types';

export function buildWebSiteSchema(): SchemaOrgObject {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/explore?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
