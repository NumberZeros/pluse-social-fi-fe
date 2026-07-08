import { absoluteUrl } from '../constants';
import type { BreadcrumbItem, SchemaOrgObject } from './types';

export function buildBreadcrumbSchema(items: BreadcrumbItem[]): SchemaOrgObject {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
