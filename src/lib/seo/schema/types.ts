export type SchemaOrgObject = Record<string, unknown>;

export type SchemaType =
  | 'Organization'
  | 'WebSite'
  | 'WebPage'
  | 'AboutPage'
  | 'FAQPage'
  | 'HowTo'
  | 'BreadcrumbList'
  | 'Person'
  | 'ProfilePage'
  | 'SocialMediaPosting'
  | 'ItemList'
  | 'VideoObject'
  | 'ImageObject'
  | 'SoftwareApplication';

export interface BreadcrumbItem {
  name: string;
  path: string;
}
