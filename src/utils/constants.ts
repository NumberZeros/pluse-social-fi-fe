import { PublicKey } from '@solana/web3.js';

export const PROGRAM_ID = new PublicKey(
  '8dU8UsnavCaqmm4JTgMHCtjzcfcu4D4iKYW71MXE1mDP'
);

export const NETWORK = (import.meta.env.VITE_SOLANA_NETWORK as string) || 'devnet';

export const RPC_ENDPOINTS: Record<string, string> = {
  localnet: 'http://localhost:8899',
  devnet: 'https://api.devnet.solana.com',
  mainnet: 'https://api.mainnet-beta.solana.com',
};

export const EXPLORER_URL: Record<string, string> = {
  localnet: 'https://explorer.solana.com/?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899',
  devnet: 'https://explorer.solana.com/?cluster=devnet',
  mainnet: 'https://explorer.solana.com',
};

export const LAMPORTS_PER_SOL = 1_000_000_000;

export const DEFAULT_COMMITMENT = 'confirmed';
