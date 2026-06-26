import { useQuery } from '@tanstack/react-query';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useProfile } from './useProfile';
import {
  getExpectedGenesisHash,
  getNetworkLabel,
  IS_DEVNET,
  LAMPORTS_PER_SOL,
  MIN_SOL_BALANCE,
} from '../utils/constants';

export function useWalletHealth() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const { hasProfile } = useProfile(publicKey ?? undefined);

  const { data: rpcNetworkOk = true, isPending: rpcNetworkPending } = useQuery({
    queryKey: ['wallet_rpc_network', connected],
    queryFn: async () => {
      const expected = getExpectedGenesisHash();
      if (!expected) return true;
      const hash = await connection.getGenesisHash();
      return hash === expected;
    },
    staleTime: 60_000,
    enabled: connected,
  });

  const { data: balanceSol = 0, isPending: balancePending } = useQuery({
    queryKey: ['wallet_balance', publicKey?.toBase58()],
    queryFn: async () => {
      if (!publicKey) return 0;
      const lamports = await connection.getBalance(publicKey);
      return lamports / LAMPORTS_PER_SOL;
    },
    enabled: connected && !!publicKey,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const networkLabel = getNetworkLabel();
  const needsProfile = connected && !hasProfile;
  const needsDevnetSol = IS_DEVNET && connected && balanceSol < MIN_SOL_BALANCE;

  return {
    rpcNetworkOk,
    /** @deprecated Use rpcNetworkOk — verifies RPC endpoint, not wallet network */
    networkOk: rpcNetworkOk,
    hasProfile,
    balanceSol,
    needsProfile,
    needsDevnetSol,
    networkLabel,
    isLoading: rpcNetworkPending || balancePending,
    isDevnet: IS_DEVNET,
    minSolBalance: MIN_SOL_BALANCE,
  };
}
