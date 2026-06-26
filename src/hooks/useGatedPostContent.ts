import { useQuery } from '@tanstack/react-query';
import { fetchGatedContent } from '../services/ipfs';

/**
 * Fetch gated post body after on-chain supporter access is verified.
 */
export function useGatedPostContent(gatedContentUri?: string, enabled = false) {
  return useQuery({
    queryKey: ['gated_post_content', gatedContentUri],
    queryFn: async () => {
      if (!gatedContentUri) {
        throw new Error('Missing gated content URI');
      }
      return fetchGatedContent(gatedContentUri);
    },
    enabled: enabled && !!gatedContentUri,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
