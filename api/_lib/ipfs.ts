export type PostAccessLevel = 'public' | 'supporters';

export interface PostMetadata {
  content: string;
  images: string[];
  videos: string[];
  accessLevel: PostAccessLevel;
}

function parseMetadataJson(json: Record<string, unknown>): PostMetadata {
  return {
    content: typeof json.content === 'string' ? json.content : '',
    images: Array.isArray(json.images)
      ? json.images.filter((img): img is string => typeof img === 'string')
      : [],
    videos: Array.isArray(json.videos)
      ? json.videos.filter((vid): vid is string => typeof vid === 'string')
      : [],
    accessLevel:
      json.accessLevel === 'supporters' || json.isSubscriberOnly === true
        ? 'supporters'
        : 'public',
  };
}

function isEmptyMetadata(metadata: PostMetadata): boolean {
  return !metadata.content && metadata.images.length === 0 && metadata.videos.length === 0;
}

async function fetchJsonWithRetry(url: string, attempts = 2): Promise<PostMetadata | null> {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const json = (await res.json()) as Record<string, unknown>;
      const metadata = parseMetadataJson(json);
      if (!isEmptyMetadata(metadata) || attempt === attempts - 1) {
        return metadata;
      }
    } catch {
      // retry
    }
  }
  return null;
}

export async function fetchPostMetadata(uri: string): Promise<PostMetadata> {
  const empty: PostMetadata = { content: '', images: [], videos: [], accessLevel: 'public' };

  try {
    if (uri.startsWith('text:')) {
      return { ...empty, content: uri.slice(5) };
    }

    if (uri.startsWith('ipfs://')) {
      const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${uri.replace('ipfs://', '')}`;
      return (await fetchJsonWithRetry(gatewayUrl)) ?? empty;
    }

    if (uri.startsWith('http')) {
      return (await fetchJsonWithRetry(uri)) ?? empty;
    }

    return { ...empty, content: `[Post] ${uri.slice(0, 80)}` };
  } catch {
    return empty;
  }
}
