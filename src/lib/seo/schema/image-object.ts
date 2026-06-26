import type { SchemaOrgObject } from './types';

export function buildImageObjectSchema(options: {
  url: string;
  caption?: string;
}): SchemaOrgObject {
  const schema: SchemaOrgObject = {
    '@type': 'ImageObject',
    url: options.url,
  };
  if (options.caption) schema.caption = options.caption;
  return schema;
}
