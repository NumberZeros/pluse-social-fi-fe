export type PostAccessLevel = 'public' | 'supporters';

export interface PostMetadata {
  content: string;
  images: string[];
  videos: string[];
  accessLevel: PostAccessLevel;
}

export async function fetchPostMetadata(uri: string): Promise<PostMetadata> {
  const empty: PostMetadata = { content: '', images: [], videos: [], accessLevel: 'public' };

  try {
    if (uri.startsWith('text:')) {
      return { ...empty, content: uri.slice(5) };
    }

    if (uri.startsWith('ipfs://')) {
      const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${uri.replace('ipfs://', '')}`;
      const res = await fetch(gatewayUrl, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) return empty;
      const json = await res.json();
      return {
        content: json.content || '',
        images: json.images || [],
        videos: json.videos || [],
        accessLevel:
          json.accessLevel === 'supporters' || json.isSubscriberOnly ? 'supporters' : 'public',
      };
    }

    if (uri.startsWith('http')) {
      const res = await fetch(uri, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) return empty;
      const json = await res.json();
      return {
        content: json.content || '',
        images: json.images || [],
        videos: json.videos || [],
        accessLevel:
          json.accessLevel === 'supporters' || json.isSubscriberOnly ? 'supporters' : 'public',
      };
    }

    return { ...empty, content: `[Post] ${uri.slice(0, 80)}` };
  } catch {
    return empty;
  }
}
