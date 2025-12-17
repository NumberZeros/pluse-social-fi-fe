import { useQuery } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useSocialFi } from './useSocialFi';


export interface UsernameAccount {
  mint: string;
  username: string;
  owner: string;
  publicKey: string;
  image?: string; // Optional for compatibility
  category?: string; // Optional for compatibility
  mintedAt?: number; // Optional for compatibility
  // Add other fields if needed for UI, but these are the core ones from on-chain state
}

/**
 * Hook to fetch user's username NFTs directly from Anchor program
 * This is more robust than fetching Metaplex metadata which might be down/broken (Arweave)
 */
export function useUserNFTs(owner?: PublicKey | string) {
  const { sdk } = useSocialFi();

  return useQuery<UsernameAccount[], Error>({
    queryKey: ['userNFTs', owner?.toString()],
    queryFn: async () => {
      if (!owner || !sdk) return [];

      const ownerPubkey = typeof owner === 'string' ? new PublicKey(owner) : owner;

      try {
        // Fetch all UsernameNft accounts owned by this wallet
        // We filter by the 8-byte discriminator + owner field (32 bytes)
        // Standard Anchor account layout: [discriminator (8)] [owner (32)] ...
        const accounts = await sdk.program.account.usernameNft.all([
          {
            memcmp: {
              offset: 8, // Discriminator is 8 bytes
              bytes: ownerPubkey.toBase58(),
            },
          },
        ]);

        return accounts.map((acc) => ({
          publicKey: acc.publicKey.toBase58(),
          mint: acc.account.mint.toBase58(),
          username: acc.account.username,
          owner: acc.account.owner.toBase58(),
        }));

      } catch (error) {
        console.error('Error fetching user username NFTs:', error);
        return [];
      }
    },
    enabled: !!owner && !!sdk,
    staleTime: 30000, 
    refetchOnWindowFocus: false,
  });
}

