import { useQuery } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useSocialFi } from './useSocialFi';
import { useConnection } from '../lib/wallet-adapter';
import { NFTService } from '../services/nft-service';
import { CacheManager } from '../services/storage';

export interface UsernameAccount {
  mint: string;
  username: string;
  owner: string;
  publicKey: string;
  image?: string;
  category?: string;
  mintedAt?: number;
}

/**
 * Hook to fetch user's username NFTs with full metadata
 * Fetches from Anchor program + Metaplex metadata for images
 */
export function useUserNFTs(owner?: PublicKey | string) {
  const { sdk } = useSocialFi();
  const { connection } = useConnection();

  return useQuery<UsernameAccount[], Error>({
    queryKey: ['userNFTs', owner?.toString()],
    queryFn: async () => {
      if (!owner || !sdk) return [];

      const ownerPubkey = typeof owner === 'string' ? new PublicKey(owner) : owner;
      const cacheKey = `userNFTs:${ownerPubkey.toBase58()}`;

      try {
        // Fetch all UsernameNft accounts owned by this wallet
        const accounts = await sdk.program.account.usernameNft.all([
          {
            memcmp: {
              offset: 8,
              bytes: ownerPubkey.toBase58(),
            },
          },
        ]);

        // Create NFT service to fetch metadata
        const nftService = new NFTService(connection);

        // Fetch metadata for each NFT
        const nftsWithMetadata = await Promise.all(
          accounts.map(async (acc) => {
            const mint = new PublicKey(acc.account.mint);
            const baseData: UsernameAccount = {
              publicKey: acc.publicKey.toBase58(),
              mint: acc.account.mint.toBase58(),
              username: acc.account.username,
              owner: acc.account.owner.toBase58(),
            };

            try {
              // Try to fetch Metaplex metadata
              const metadataUri = await nftService.getMetadataUri(mint);
              if (metadataUri) {
                const metadata = await nftService.fetchMetadata(metadataUri);
                if (metadata) {
                  // Get category from attributes
                  const categoryAttr = metadata.attributes?.find(
                    (attr) => attr.trait_type === 'Category'
                  );
                  // Get minted timestamp
                  const mintedAtAttr = metadata.attributes?.find(
                    (attr) => attr.trait_type === 'Minted At'
                  );

                  return {
                    ...baseData,
                    image: metadata.image,
                    category: categoryAttr?.value as string | undefined,
                    mintedAt: mintedAtAttr?.value as number | undefined,
                  };
                }
              }
            } catch (error) {
              console.warn(`Failed to fetch metadata for ${mint.toBase58()}:`, error);
            }

            return baseData;
          })
        );

        // Cache NFTs if we got results
        if (nftsWithMetadata && nftsWithMetadata.length > 0) {
          await CacheManager.setCachedMetadata(cacheKey, nftsWithMetadata);
        }

        return nftsWithMetadata;
      } catch (error) {
        console.error('Error fetching user username NFTs:', error);
        // Try to return cached NFTs on error
        const cached = await CacheManager.getCachedMetadata(cacheKey);
        if (cached) {
          console.log('📱 Using cached NFTs (error fallback)');
          return cached as UsernameAccount[];
        }
        return [];
      }
    },
    enabled: !!owner && !!sdk,
    staleTime: 60000, // Cache for 1 minute
    refetchOnWindowFocus: false,
  });
}
