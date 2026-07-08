/**
 * IPFS Upload Service
 * Handles uploading post files and metadata to IPFS via Pinata.
 * Pinata is required in production builds.
 *
 * Supporter-only posts use a split model:
 * - On-chain URI → public preview JSON (teaser + gatedContentUri pointer)
 * - Gated blob → full text/media, fetched only after on-chain access check
 */

import { uploadFileToPinata, uploadJSONToPinata, hasPinataCredentials } from './pinata';
import { CacheManager } from './storage';

export type PostAccessLevel = 'public' | 'supporters';

export interface GatedPostContent {
  content: string;
  images?: string[];
  videos?: string[];
}

export interface PostMetadata {
  content: string;
  images?: string[];
  videos?: string[];
  timestamp?: number;
  groupId?: string;
  /** Preferred gating field for MVP */
  accessLevel?: PostAccessLevel;
  /** Pointer to gated IPFS blob — only present for supporters-only posts */
  gatedContentUri?: string;
  /** @deprecated Use accessLevel: "supporters" */
  isSubscriberOnly?: boolean;
  tierName?: string;
}

export interface ResolvedPostMetadata {
  content: string;
  images: string[];
  videos: string[];
  groupId?: string;
  accessLevel: PostAccessLevel;
  isSubscriberOnly?: boolean;
  gatedContentUri?: string;
}

const GATED_TEASER_LENGTH = 120;

export function resolveAccessLevel(metadata: {
  accessLevel?: PostAccessLevel;
  isSubscriberOnly?: boolean;
}): PostAccessLevel {
  if (metadata.accessLevel === 'supporters' || metadata.accessLevel === 'public') {
    return metadata.accessLevel;
  }
  return metadata.isSubscriberOnly ? 'supporters' : 'public';
}

function assertPinataForProduction(): void {
  if (import.meta.env.PROD && !hasPinataCredentials()) {
    throw new Error(
      'VITE_PINATA_JWT is required in production for decentralized post storage.',
    );
  }
}


/**
 * Upload file to IPFS via Pinata.
 * Dev-only: falls back to local mock storage when Pinata is not configured.
 */
export async function uploadFileToIPFS(file: File): Promise<string> {
  assertPinataForProduction();

  if (!hasPinataCredentials()) {
    console.warn('No Pinata credentials — using dev mock storage');
    return uploadFileMock(file);
  }

  return uploadFileToPinata(file, {
    name: `Post Media: ${file.name}`,
    keyvalues: { type: 'post-media', platform: 'social-fi' },
  });
}

async function uploadFileMock(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const mockId = `mock_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(mockId, base64);
      resolve(`mock://${mockId}`);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Upload gated post body (full content + media) — not referenced on-chain directly.
 */
export async function uploadGatedContentToIPFS(content: GatedPostContent): Promise<string> {
  assertPinataForProduction();

  const payload = {
    ...content,
    timestamp: Date.now(),
    schema: 'pulse-gated-v1',
  };

  if (!hasPinataCredentials()) {
    const uri = `ipfs://gated/${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(`gated_content_${uri}`, JSON.stringify(payload));
    return uri;
  }

  return uploadJSONToPinata(payload, {
    name: `Gated Post Content: ${Date.now()}`,
    keyvalues: { type: 'gated-content', platform: 'social-fi' },
  });
}

/**
 * Upload post metadata to IPFS via Pinata.
 * For supporters-only posts, splits public preview from gated body.
 */
export async function uploadPostMetadata(metadata: PostMetadata): Promise<string> {
  assertPinataForProduction();

  const accessLevel = resolveAccessLevel(metadata);

  if (accessLevel === 'supporters') {
    const gatedUri = await uploadGatedContentToIPFS({
      content: metadata.content,
      images: metadata.images,
      videos: metadata.videos,
    });

    const teaser =
      metadata.content.length > GATED_TEASER_LENGTH
        ? `${metadata.content.slice(0, GATED_TEASER_LENGTH)}…`
        : metadata.content;

    const publicMetadata: PostMetadata = {
      content: teaser,
      accessLevel: 'supporters',
      gatedContentUri: gatedUri,
      ...(metadata.groupId ? { groupId: metadata.groupId } : {}),
    };

    return uploadMetadataToIPFS(publicMetadata);
  }

  return uploadMetadataToIPFS(metadata);
}

/**
 * Upload post metadata JSON (public preview or full public post).
 */
export async function uploadMetadataToIPFS(metadata: PostMetadata): Promise<string> {
  assertPinataForProduction();

  const metadataWithTimestamp = {
    ...metadata,
    accessLevel: resolveAccessLevel(metadata),
    timestamp: Date.now(),
  };

  if (!hasPinataCredentials()) {
    console.warn('No Pinata credentials — using dev mock storage');
    return uploadMetadataMock(metadataWithTimestamp);
  }

  return uploadJSONToPinata(metadataWithTimestamp, {
    name: `Post Metadata: ${Date.now()}`,
    keyvalues: { type: 'post-metadata', platform: 'social-fi' },
  });
}

function uploadMetadataMock(metadata: PostMetadata): string {
  const uri = `ipfs://post/${Date.now()}`;
  localStorage.setItem(`post_metadata_${uri}`, JSON.stringify(metadata));
  return uri;
}

async function fetchJsonFromUri(uri: string): Promise<Record<string, unknown> | null> {
  if (uri.startsWith('mock:') || uri.startsWith('ipfs://post/') || uri.startsWith('ipfs://gated/')) {
    const metadataKey = `post_metadata_${uri}`;
    const gatedKey = `gated_content_${uri}`;
    const data = localStorage.getItem(gatedKey) ?? localStorage.getItem(metadataKey);
    return data ? (JSON.parse(data) as Record<string, unknown>) : null;
  }

  if (uri.startsWith('ipfs://')) {
    const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${uri.replace('ipfs://', '')}`;
    const res = await fetch(gatewayUrl);
    if (!res.ok) return null;
    return (await res.json()) as Record<string, unknown>;
  }

  if (uri.startsWith('http')) {
    const res = await fetch(uri);
    if (!res.ok) return null;
    return (await res.json()) as Record<string, unknown>;
  }

  return null;
}

function mapImages(images: unknown): string[] {
  if (!Array.isArray(images)) return [];
  return images.map((img) => {
    if (typeof img !== 'string') return '';
    const resolved = resolveMockUrl(img);
    return resolved || img;
  });
}

function parsePublicMetadata(json: Record<string, unknown>): ResolvedPostMetadata {
  return {
    content: typeof json.content === 'string' ? json.content : '',
    images: mapImages(json.images),
    videos: mapImages(json.videos),
    groupId: typeof json.groupId === 'string' ? json.groupId : undefined,
    isSubscriberOnly: json.isSubscriberOnly === true,
    accessLevel: resolveAccessLevel({
      accessLevel: json.accessLevel as PostAccessLevel | undefined,
      isSubscriberOnly: json.isSubscriberOnly === true,
    }),
    gatedContentUri:
      typeof json.gatedContentUri === 'string' ? json.gatedContentUri : undefined,
  };
}

/**
 * Fetch gated post body — only call after on-chain supporter access is verified.
 */
export async function fetchGatedContent(uri: string): Promise<GatedPostContent> {
  const json = await fetchJsonFromUri(uri);
  if (!json) {
    throw new Error('Failed to fetch gated content');
  }

  return {
    content: typeof json.content === 'string' ? json.content : '',
    images: mapImages(json.images),
    videos: mapImages(json.videos),
  };
}

/** Resolve mock:// URLs to actual data (dev only) */
export function resolveMockUrl(url: string): string | null {
  if (!url.startsWith('mock://')) return null;
  const mockId = url.replace('mock://', '');
  return localStorage.getItem(mockId);
}

export function validateFile(
  file: File,
  type: 'image' | 'video',
): { valid: boolean; error?: string } {
  const maxSizes = {
    image: 10 * 1024 * 1024,
    video: 100 * 1024 * 1024,
  };

  const allowedTypes = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/webm', 'video/quicktime'],
  };

  if (file.size > maxSizes[type]) {
    return {
      valid: false,
      error: `File too large. Max size: ${maxSizes[type] / 1024 / 1024}MB`,
    };
  }

  if (!allowedTypes[type].includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedTypes[type].join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Fetch public post metadata from on-chain URI.
 * For gated posts this returns only the teaser — use fetchGatedContent after access check.
 */
export const fetchMetadata = async (uri: string): Promise<ResolvedPostMetadata> => {
  try {
    const cached = await CacheManager.getCachedMetadata(uri);
    if (cached) {
      return cached as ResolvedPostMetadata;
    }

    let metadata: ResolvedPostMetadata;

    if (uri.startsWith('text:')) {
      metadata = { content: uri.slice(5), images: [], videos: [], accessLevel: 'public' };
    } else if (uri.startsWith('mock:') || uri.startsWith('ipfs://post/')) {
      const data = localStorage.getItem(`post_metadata_${uri}`);
      if (data) {
        metadata = parsePublicMetadata(JSON.parse(data) as Record<string, unknown>);
      } else {
        metadata = { content: `[Post] ${uri}`, images: [], videos: [], accessLevel: 'public' };
      }
    } else if (uri.startsWith('ipfs://') || uri.startsWith('http')) {
      const json = await fetchJsonFromUri(uri);
      if (json) {
        metadata = parsePublicMetadata(json);
      } else {
        metadata = { content: `[Error] Failed to fetch: ${uri}`, images: [], videos: [], accessLevel: 'public' };
      }
    } else {
      metadata = { content: uri, images: [], videos: [], accessLevel: 'public' };
    }

    await CacheManager.setCachedMetadata(uri, metadata);
    return metadata;
  } catch (e) {
    console.error('Failed to fetch metadata:', uri, e);
    const cached = await CacheManager.getCachedMetadata(uri);
    if (cached) return cached as ResolvedPostMetadata;
    return { content: `[Post] ${uri}`, images: [], videos: [], accessLevel: 'public' };
  }
};
