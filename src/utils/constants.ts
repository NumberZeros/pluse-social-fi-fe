import { PublicKey } from '@solana/web3.js';

const DEFAULT_PROGRAM_ID = 'FHHfGX8mYxagDmhsXgJUfLnx1rw2M138e3beCwWELdgL';

export const PROGRAM_ID = new PublicKey(
  (import.meta.env.VITE_PROGRAM_ID as string) || DEFAULT_PROGRAM_ID
);

export const NETWORK = (import.meta.env.VITE_SOLANA_NETWORK as string) || 'devnet';

export const RPC_ENDPOINTS: Record<string, string> = {
  localnet: 'http://localhost:8899',
  devnet: 'https://api.devnet.solana.com',
  mainnet: 'https://api.mainnet-beta.solana.com',
};

/** Resolve RPC URL: custom env override, then network default */
export const getRpcEndpoint = (): string => {
  const custom = import.meta.env.VITE_SOLANA_RPC_URL as string | undefined;
  if (custom && custom.trim().length > 0) {
    return custom.trim();
  }
  return RPC_ENDPOINTS[NETWORK] ?? RPC_ENDPOINTS.devnet;
};

export const EXPLORER_URL: Record<string, string> = {
  localnet: 'https://explorer.solana.com/?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899',
  devnet: 'https://explorer.solana.com/?cluster=devnet',
  mainnet: 'https://explorer.solana.com',
};

export const LAMPORTS_PER_SOL = 1_000_000_000;

export const DEFAULT_COMMITMENT = 'confirmed';
