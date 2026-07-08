import { SITE_NAME, SITE_URL } from '../constants';
import type { SchemaOrgObject } from './types';

export function buildSoftwareApplicationSchema(): SchemaOrgObject {
  return {
    '@type': 'SoftwareApplication',
    '@id': `${SITE_URL}/#software`,
    name: SITE_NAME,
    applicationCategory: 'SocialNetworkingApplication',
    operatingSystem: 'Web',
    url: SITE_URL,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}
