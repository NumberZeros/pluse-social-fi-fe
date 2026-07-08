import { SITE_URL } from '../constants';
import type { GuideSection } from '../guide-data';
import type { SchemaOrgObject } from './types';

export function buildHowToSchema(section: GuideSection): SchemaOrgObject {
  return {
    '@type': 'HowTo',
    '@id': `${SITE_URL}/guide#${section.id}`,
    name: section.title,
    description: section.description,
    step: section.steps.map((text, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      text,
    })),
  };
}

export function buildHowToSchemas(sections: GuideSection[]): SchemaOrgObject[] {
  return sections.map(buildHowToSchema);
}
