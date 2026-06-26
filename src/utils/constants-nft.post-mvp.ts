import { PublicKey } from '@solana/web3.js';

/**
 * Post-MVP: Username NFT marketplace & Metaplex collection config.
 * Not required for the Supporter Shares MVP.
 */

export const COLLECTION_CONFIG = {
  name: 'Social-Fi Usernames',
  symbol: 'SOCIALFI',
  description:
    'Official Social-Fi platform username NFT collection. Trade on Magic Eden, OpenSea, and more.',
  externalUrl: 'https://pulse.thosoft.xyz',
  sellerFeeBasisPoints: 500,
};

export const SOCIALFI_COLLECTION = {
  MINT:
    (import.meta.env.VITE_COLLECTION_MINT as string) ||
    '11111111111111111111111111111111',
  AUTHORITY: (import.meta.env.VITE_COLLECTION_AUTHORITY as string) || null,
} as {
  MINT: string;
  AUTHORITY: string | null;
};

export const getCollectionMint = (): PublicKey => {
  try {
    return new PublicKey(SOCIALFI_COLLECTION.MINT);
  } catch {
    throw new Error(
      'Collection mint not configured. Set VITE_COLLECTION_MINT for username NFT features.',
    );
  }
};

export const MARKETPLACE_URLS = {
  magiceden: (mint: string, network: 'devnet' | 'mainnet' = 'devnet') => {
    const subdomain = network === 'devnet' ? 'devnet.' : '';
    return `https://${subdomain}magiceden.io/item-details/${mint}`;
  },
  opensea: (mint: string) => `https://opensea.io/assets/solana/${mint}`,
  tensor: (mint: string) => `https://www.tensor.trade/item/${mint}`,
  solscan: (mint: string, network: 'devnet' | 'mainnet' = 'devnet') => {
    const cluster = network === 'devnet' ? '?cluster=devnet' : '';
    return `https://solscan.io/token/${mint}${cluster}`;
  },
};

export const CATEGORY_COLORS = {
  premium: '#6366f1',
  short: '#f59e0b',
  rare: '#ec4899',
  custom: '#8b5cf6',
};

export const RARITY_TIERS = {
  legendary: { maxLength: 1, color: '#fbbf24', label: 'Legendary' },
  epic: { maxLength: 3, color: '#a855f7', label: 'Epic' },
  rare: { maxLength: 5, color: '#3b82f6', label: 'Rare' },
  uncommon: { maxLength: 8, color: '#10b981', label: 'Uncommon' },
  common: { maxLength: Infinity, color: '#6b7280', label: 'Common' },
};
