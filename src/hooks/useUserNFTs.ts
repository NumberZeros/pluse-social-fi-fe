import { useQuery } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useConnection } from '../lib/wallet-adapter';
import { getNFTService } from '../services/nft-service';
import type { UsernameNFT } from '../services/nft-service';

/**
 * Hook to fetch user's username NFTs
 */
export function useUserNFTs(owner?: PublicKey | string) {
  const { connection } = useConnection();

  return useQuery<UsernameNFT[], Error>({
    queryKey: ['userNFTs', owner?.toString()],
    queryFn: async () => {
      if (!owner) return [];

      const ownerPubkey = typeof owner === 'string' ? new PublicKey(owner) : owner;
      const nftService = getNFTService(connection);

      return await nftService.getUsernameNFTs(ownerPubkey);
    },
    enabled: !!owner,
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false,
  });
}
