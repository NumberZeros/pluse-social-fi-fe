import { PublicKey } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

const DEFAULT_PROGRAM_ID = 'FHHfGX8mYxagDmhsXgJUfLnx1rw2M138e3beCwWELdgL';

export const PROGRAM_ID = new PublicKey(
  (import.meta.env.VITE_PROGRAM_ID as string) || DEFAULT_PROGRAM_ID
);

export const NETWORK = (import.meta.env.VITE_SOLANA_NETWORK as string) || 'devnet';

export const IS_DEVNET =
  NETWORK === 'devnet' || NETWORK === 'localnet' || NETWORK === 'testnet';

export const MIN_SOL_BALANCE = IS_DEVNET ? 0.05 : 0.01;

export const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ||
  'https://pulse.social';

/** Known genesis hashes for network mismatch detection */
export const EXPECTED_GENESIS_HASH: Record<string, string> = {
  devnet: 'EtWTRABZaYq6iMfeYKouRu1GW1SNx7w4CGTPHwnot95',
  'mainnet-beta': '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  mainnet: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  testnet: '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
};

export function getWalletAdapterNetwork(): WalletAdapterNetwork {
  const n = NETWORK;
  if (n === 'mainnet' || n === 'mainnet-beta') {
    return WalletAdapterNetwork.Mainnet;
  }
  if (n === 'testnet') {
    return WalletAdapterNetwork.Testnet;
  }
  return WalletAdapterNetwork.Devnet;
}

export function getNetworkLabel(): string {
  if (NETWORK === 'mainnet' || NETWORK === 'mainnet-beta') return 'Mainnet';
  if (NETWORK === 'testnet') return 'Testnet';
  if (NETWORK === 'localnet') return 'Localnet';
  return 'Devnet';
}

export function getExpectedGenesisHash(): string | undefined {
  if (NETWORK === 'localnet') return undefined;
  return EXPECTED_GENESIS_HASH[NETWORK] ?? EXPECTED_GENESIS_HASH.devnet;
}

export const RPC_ENDPOINTS: Record<string, string> = {
  localnet: 'http://localhost:8899',
  devnet: 'https://api.devnet.solana.com',
  mainnet: 'https://api.mainnet-beta.solana.com',
};

export function normalizeNetworkKey(n: string): keyof typeof RPC_ENDPOINTS {
  if (n === 'mainnet' || n === 'mainnet-beta') return 'mainnet';
  if (n in RPC_ENDPOINTS) return n as keyof typeof RPC_ENDPOINTS;
  return 'devnet';
}

/** Resolve RPC URL: custom env override, then network default */
export const getRpcEndpoint = (): string => {
  const custom = import.meta.env.VITE_SOLANA_RPC_URL as string | undefined;
  if (custom && custom.trim().length > 0) {
    return custom.trim();
  }
  return RPC_ENDPOINTS[normalizeNetworkKey(NETWORK)];
};

export const EXPLORER_URL: Record<string, string> = {
  localnet: 'https://explorer.solana.com/?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899',
  devnet: 'https://explorer.solana.com/?cluster=devnet',
  mainnet: 'https://explorer.solana.com',
};

export const LAMPORTS_PER_SOL = 1_000_000_000;

export const DEFAULT_COMMITMENT = 'confirmed';
