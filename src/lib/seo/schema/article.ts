import { absoluteUrl } from '../constants';
import type { SchemaOrgObject } from './types';

export interface ArticleSchemaOptions {
  postId: string;
  headline: string;
  description: string;
  authorName: string;
  authorPath: string;
  datePublished: string;
  dateModified?: string;
  images?: string[];
  videos?: string[];
  likes?: number;
  comments?: number;
  isAccessibleForFree: boolean;
  articleBody?: string;
}

export function buildSocialMediaPostingSchema(options: ArticleSchemaOptions): SchemaOrgObject {
  const url = absoluteUrl(`/post/${options.postId}`);
  const authorUrl = absoluteUrl(options.authorPath);

  const schema: SchemaOrgObject = {
    '@type': 'SocialMediaPosting',
    '@id': url,
    headline: options.headline,
    description: options.description,
    url,
    datePublished: options.datePublished,
    dateModified: options.dateModified || options.datePublished,
    author: {
      '@type': 'Person',
      name: options.authorName,
      url: authorUrl,
    },
    isAccessibleForFree: options.isAccessibleForFree,
    publisher: { '@id': absoluteUrl('/#organization') },
  };

  if (options.isAccessibleForFree && options.articleBody) {
    schema.articleBody = options.articleBody;
  }

  if (options.images && options.images.length > 0) {
    schema.image = options.images.map((img) => ({
      '@type': 'ImageObject',
      url: img,
    }));
  }

  if (options.videos && options.videos.length > 0) {
    schema.video = options.videos.map((video) => ({
      '@type': 'VideoObject',
      contentUrl: video,
      uploadDate: options.datePublished,
    }));
  }

  const stats: SchemaOrgObject[] = [];
  if (options.likes !== undefined) {
    stats.push({
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/LikeAction',
      userInteractionCount: options.likes,
    });
  }
  if (options.comments !== undefined) {
    stats.push({
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/CommentAction',
      userInteractionCount: options.comments,
    });
  }
  if (stats.length > 0) {
    schema.interactionStatistic = stats;
  }

  return schema;
}
