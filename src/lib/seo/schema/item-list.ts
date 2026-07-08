import { absoluteUrl } from '../constants';
import type { SchemaOrgObject } from './types';

export interface ItemListEntry {
  id: string;
  name: string;
  path: string;
}

export function buildItemListSchema(
  items: ItemListEntry[],
  listName: string,
): SchemaOrgObject | null {
  if (items.length === 0) return null;

  return {
    '@type': 'ItemList',
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}
