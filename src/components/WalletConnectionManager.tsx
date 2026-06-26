import { useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useUserStore } from '../stores/useUserStore';
import { useQueryClient } from '@tanstack/react-query';
import { useProfile } from '../hooks/useProfile';
import { WalletOnboardingSheet } from './wallet/WalletOnboardingSheet';

const WALLET_SCOPED_QUERY_KEYS = [
  'feed_timeline',
  'profile',
  'is_following',
  'followers',
  'following',
  'supporter_access',
  'user_share_holdings',
  'shares',
  'feed_engagement',
  'has_liked',
  'creator_posts',
  'creator_post_count',
  'creator_supporters',
  'single_post',
  'resolve_username',
  'user_replies',
  'trending_topics',
  'suggested_users',
  'all_creator_pools',
  'post_comments',
] as const;

/**
 * Syncs wallet connection state with global store and invalidates wallet-scoped queries on account change.
 */
export function WalletConnectionManager() {
  const { publicKey, connected } = useWallet();
  const setWalletAddress = useUserStore((state) => state.setWalletAddress);
  const setUsername = useUserStore((state) => state.setUsername);
  const resetProfile = useUserStore((state) => state.resetProfile);
  const queryClient = useQueryClient();
  const prevPubkeyRef = useRef<string | null>(null);
  const { profile } = useProfile(publicKey ?? undefined);

  useEffect(() => {
    if (connected && profile?.username) {
      setUsername(profile.username);
    }
  }, [connected, profile?.username, setUsername]);

  useEffect(() => {
    const pubkeyStr = publicKey?.toBase58() ?? null;

    if (connected && pubkeyStr) {
      setWalletAddress(pubkeyStr);
    }

    const prev = prevPubkeyRef.current;
    if (prev !== pubkeyStr) {
      for (const key of WALLET_SCOPED_QUERY_KEYS) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      prevPubkeyRef.current = pubkeyStr;
    }

    if (!connected) {
      resetProfile();
      prevPubkeyRef.current = null;
    }
  }, [connected, publicKey, setWalletAddress, resetProfile, queryClient]);

  return <WalletOnboardingSheet />;
}
