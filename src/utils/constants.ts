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

// ==================== METAPLEX CONSTANTS ====================

/**
 * Metaplex Token Metadata Program ID
 * Standard across all Solana networks
 */
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
);

/**
 * SPL Token Program ID
 */
export const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
);

/**
 * Associated Token Program ID
 */
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
);

/**
 * NFT Collection Configuration
 * Collection will be created once and reused for all username NFTs
 */
export const COLLECTION_CONFIG = {
  name: 'Social-Fi Usernames',
  symbol: 'SOCIALFI',
  description: 'Official Social-Fi platform username NFT collection. Trade on Magic Eden, OpenSea, and more.',
  externalUrl: 'https://yourplatform.com',
  sellerFeeBasisPoints: 500, // 5% royalty
};

/**
 * Collection Mint Address
 * TODO: Update after creating collection on devnet/mainnet
 * Set to null initially, will be set after collection creation
 */
export const COLLECTION_MINT: PublicKey | null = null;

/**
 * Collection Authority
 * Should be the program's authority or a dedicated collection manager
 */
export const COLLECTION_AUTHORITY: PublicKey | null = null;

// ==================== MARKETPLACE URLS ====================

/**
 * External marketplace URLs for NFT viewing/trading
 */
export const MARKETPLACE_URLS = {
  magiceden: (mint: string, network: 'devnet' | 'mainnet' = 'devnet') => {
    const subdomain = network === 'devnet' ? 'devnet.' : '';
    return `https://${subdomain}magiceden.io/item-details/${mint}`;
  },
  opensea: (mint: string) => 
    `https://opensea.io/assets/solana/${mint}`,
  tensor: (mint: string) =>
    `https://www.tensor.trade/item/${mint}`,
  solscan: (mint: string, network: 'devnet' | 'mainnet' = 'devnet') => {
    const cluster = network === 'devnet' ? '?cluster=devnet' : '';
    return `https://solscan.io/token/${mint}${cluster}`;
  },
};

/**
 * NFT Category Colors (for UI)
 */
export const CATEGORY_COLORS = {
  premium: '#6366f1', // indigo
  short: '#f59e0b',   // amber
  rare: '#ec4899',    // pink
  custom: '#8b5cf6',  // purple
};

/**
 * Rarity tiers based on username length
 */
export const RARITY_TIERS = {
  legendary: { maxLength: 1, color: '#fbbf24', label: 'Legendary' },
  epic: { maxLength: 3, color: '#a855f7', label: 'Epic' },
  rare: { maxLength: 5, color: '#3b82f6', label: 'Rare' },
  uncommon: { maxLength: 8, color: '#10b981', label: 'Uncommon' },
  common: { maxLength: Infinity, color: '#6b7280', label: 'Common' },
};
