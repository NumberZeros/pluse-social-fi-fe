import { useQuery } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useReadOnlySdk } from '../services/read-only-sdk';

/**
 * Check whether a viewer holds Supporter Shares for a creator (amount > 0).
 */
export function useSupporterAccess(
  creatorAddress?: string,
  viewerAddress?: string,
) {
  const readSdk = useReadOnlySdk();

  return useQuery({
    queryKey: ['supporter_access', creatorAddress, viewerAddress],
    queryFn: async () => {
      if (!readSdk || !creatorAddress || !viewerAddress) {
        return { hasAccess: false, amount: 0 };
      }

      if (creatorAddress === viewerAddress) {
        return { hasAccess: true, amount: Infinity };
      }

      const holding = await readSdk.getShareHolding(
        new PublicKey(viewerAddress),
        new PublicKey(creatorAddress),
      );

      return {
        hasAccess: holding.amount > 0,
        amount: holding.amount,
      };
    },
    enabled: !!readSdk && !!creatorAddress && !!viewerAddress,
    staleTime: 30_000,
  });
}
