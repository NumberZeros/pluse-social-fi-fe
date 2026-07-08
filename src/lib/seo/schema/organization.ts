import { SITE_NAME, SITE_URL, SOCIAL_LINKS, absoluteUrl } from '../constants';
import type { SchemaOrgObject } from './types';

export function buildOrganizationSchema(): SchemaOrgObject {
  return {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/pulse.svg'),
    },
    sameAs: [
      SOCIAL_LINKS.twitter,
      SOCIAL_LINKS.discord,
      SOCIAL_LINKS.telegram,
      SOCIAL_LINKS.github,
    ],
  };
}
