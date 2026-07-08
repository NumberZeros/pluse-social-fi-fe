import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicKey } from '@solana/web3.js';
import { useUserShareHoldings } from '../../hooks/useShares';
import { useReadOnlySdk } from '../../services/read-only-sdk';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../design-system';
import { SellSharesModal } from '../shares/SellSharesModal';

interface MySupportPanelProps {
  walletAddress: string;
}

export function MySupportPanel({ walletAddress }: MySupportPanelProps) {
  const readSdk = useReadOnlySdk();
  const holdingsQuery = useUserShareHoldings(new PublicKey(walletAddress));
  const holdings = holdingsQuery.data ?? [];
  const [sellCreator, setSellCreator] = useState<{
    pubkey: PublicKey;
    username: string;
  } | null>(null);

  const creatorAddresses = holdings.map((h) => h.creator);

  const { data: usernames = {} } = useQuery({
    queryKey: ['support_usernames', creatorAddresses.join(',')],
    queryFn: async () => {
      if (!readSdk) return {};
      const map: Record<string, string> = {};
      await Promise.all(
        creatorAddresses.map(async (creator) => {
          try {
            const profile = await readSdk.getUserProfile(new PublicKey(creator));
            if (profile?.username) map[creator] = profile.username;
          } catch {
            map[creator] = `${creator.slice(0, 4)}…${creator.slice(-4)}`;
          }
        }),
      );
      return map;
    },
    enabled: !!readSdk && creatorAddresses.length > 0,
  });

  if (holdingsQuery.isPending) {
    return (
      <Card variant="glass" className="rounded-2xl p-6 border border-border animate-pulse h-32" />
    );
  }

  if (holdings.length === 0) {
    return null;
  }

  return (
    <>
      <Card variant="glass" className="rounded-2xl p-6 border border-border">
        <h2 className="text-lg font-bold mb-4">My support</h2>
        <div className="space-y-3">
          {holdings.map((holding) => {
            const username = usernames[holding.creator] ?? holding.creator.slice(0, 8);
            return (
              <div
                key={holding.publicKey}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <Link
                  to={`/${username}`}
                  className="font-medium text-foreground hover:text-primary truncate"
                >
                  @{username}
                </Link>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-muted">{holding.amount} shares</span>
                  <button
                    onClick={() =>
                      setSellCreator({
                        pubkey: new PublicKey(holding.creator),
                        username,
                      })
                    }
                    className="px-3 py-1 text-xs font-bold bg-surface-2 hover:bg-surface-2 rounded-pill"
                  >
                    Cash out
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted mt-4">
          Cash out: 10% stays in the creator&apos;s pool (not a platform fee).
        </p>
      </Card>

      {sellCreator && (
        <SellSharesModal
          creatorPubkey={sellCreator.pubkey}
          creatorUsername={sellCreator.username}
          onClose={() => setSellCreator(null)}
        />
      )}
    </>
  );
}
