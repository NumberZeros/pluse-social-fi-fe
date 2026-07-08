import { useQuery } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useReadOnlySdk } from '../services/read-only-sdk';
import { useWallet } from '@solana/wallet-adapter-react';
import { fetchMetadata } from './useFeed';
import { CacheManager } from '../services/storage';
import type { PostAccessLevel } from '../services/ipfs';

export interface SinglePost {
  id: string;
  author: string;
  authorUsername?: string;
  content: string;
  imageUrls: string[];
  videoUrls: string[];
  createdAt: number;
  likes: number;
  comments: number;
  tips: number;
  accessLevel: PostAccessLevel;
  gatedContentUri?: string;
  isLiked: boolean;
}

export function useSinglePost(postId?: string) {
  const readSdk = useReadOnlySdk();
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: ['single_post', postId, publicKey?.toBase58()],
    queryFn: async (): Promise<SinglePost | null> => {
      if (!readSdk || !postId) return null;

      try {
        new PublicKey(postId);
      } catch {
        return null;
      }

      const cacheKey = `single_post:${postId}`;
      try {
        const raw = await readSdk.getPost(new PublicKey(postId));
        if (!raw) return null;

        const metadata = await fetchMetadata(raw.uri);
        const profile = await readSdk.getUserProfile(new PublicKey(raw.author));

        const engagementIndex = await readSdk.buildEngagementIndex(publicKey || undefined);
        const engagement = engagementIndex.get(postId);

        const post: SinglePost = {
          id: raw.publicKey,
          author: raw.author,
          authorUsername: profile?.username,
          content: metadata.content,
          imageUrls: metadata.images || [],
          videoUrls: metadata.videos || [],
          createdAt: raw.createdAt * 1000,
          likes: engagement?.likes ?? 0,
          comments: engagement?.comments ?? 0,
          tips: 0,
          accessLevel: metadata.accessLevel,
          gatedContentUri: metadata.gatedContentUri,
          isLiked: engagement?.isLiked ?? false,
        };

        await CacheManager.setCachedMetadata(cacheKey, post);
        return post;
      } catch (error) {
        console.error('Error fetching single post:', error);
        const cached = (await CacheManager.getCachedMetadata(cacheKey)) as SinglePost | null;
        return cached ?? null;
      }
    },
    enabled: !!readSdk && !!postId,
  });
}
