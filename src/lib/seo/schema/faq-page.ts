import { SITE_URL } from '../constants';
import type { FaqItem } from '../guide-data';
import type { SchemaOrgObject } from './types';

export function buildFaqPageSchema(faqs: FaqItem[]): SchemaOrgObject {
  return {
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/guide#faq`,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };
}
