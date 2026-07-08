import { Helmet } from 'react-helmet-async';
import type { SchemaOrgObject } from '../lib/seo/schema/types';

interface JsonLdProps {
  schema: SchemaOrgObject | SchemaOrgObject[];
}

export function JsonLd({ schema }: JsonLdProps) {
  const data = Array.isArray(schema)
    ? { '@context': 'https://schema.org', '@graph': schema }
  : schema;

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}
