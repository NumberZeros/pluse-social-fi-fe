import type { SchemaOrgObject } from './types';

export function buildVideoObjectSchema(options: {
  contentUrl: string;
  thumbnailUrl?: string;
  uploadDate: string;
  name?: string;
}): SchemaOrgObject {
  const schema: SchemaOrgObject = {
    '@type': 'VideoObject',
    contentUrl: options.contentUrl,
    uploadDate: options.uploadDate,
  };
  if (options.thumbnailUrl) schema.thumbnailUrl = options.thumbnailUrl;
  if (options.name) schema.name = options.name;
  return schema;
}
