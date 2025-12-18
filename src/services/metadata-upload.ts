import type { WalletAdapter } from '../lib/wallet-adapter';
import { uploadFileToPinata, uploadJSONToPinata } from './pinata';

/**
 * Metadata Upload Service - Metaplex Standard
 * Uploads NFT metadata to IPFS via Pinata for Magic Eden & OpenSea compatibility
 */

export interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties?: {
    files?: Array<{
      uri: string;
      type: string;
    }>;
    category?: string;
    creators?: Array<{
      address: string;
      share: number;
    }>;
  };
  collection?: {
    name: string;
    family: string;
  };
}

export interface UsernameMetadataInput {
  username: string;
  category: 'premium' | 'short' | 'rare' | 'custom';
  mintedAt: number;
  owner: string;
}

export class MetadataUploadService {
  constructor(_wallet: WalletAdapter, _rpcUrl?: string) {
    // Service is stateless, parameters kept for API compatibility
    // Actual implementation uses Pinata API directly
  }

  /**
   * Generate username NFT image using UI Avatars placeholder
   * Free service, no upload needed
   */
  generateUsernameImage(username: string, category: string): string {
    const colors = {
      premium: '6366f1', // indigo
      short: 'f59e0b',   // amber
      rare: 'ec4899',    // pink
      custom: '8b5cf6'   // purple
    };

    const bgColor = colors[category as keyof typeof colors] || colors.custom;
    
    // UI Avatars API - generates avatar images
    const imageUrl = `https://ui-avatars.com/api/?` +
      `name=${encodeURIComponent(username)}` +
      `&size=512` +
      `&background=${bgColor}` +
      `&color=ffffff` +
      `&bold=true` +
      `&format=png` +
      `&rounded=true`;

    return imageUrl;
  }



  /**
   * Determine rarity based on username
   */
  private determineRarity(username: string): string {
    const len = username.length;
    if (len === 1) return 'Legendary';
    if (len <= 3) return 'Epic';
    if (len <= 5) return 'Rare';
    if (len <= 8) return 'Uncommon';
    return 'Common';
  }

  /**
   * Create and upload username NFT metadata to Pinata IPFS
   */
  async uploadUsernameMetadata(data: UsernameMetadataInput): Promise<string> {
    const { username, category, mintedAt, owner } = data;

    // Generate placeholder image
    const image = this.generateUsernameImage(username, category);

    // Create attributes
    const attributes = [
      { trait_type: 'Username', value: username },
      { trait_type: 'Category', value: category.charAt(0).toUpperCase() + category.slice(1) },
      { trait_type: 'Length', value: username.length },
      { trait_type: 'Rarity', value: this.determineRarity(username) },
      { trait_type: 'Minted', value: new Date(mintedAt * 1000).toISOString().split('T')[0] },
    ];

    // Check for special characters
    if (/[0-9]/.test(username)) {
      attributes.push({ trait_type: 'Has Numbers', value: 'Yes' });
    }
    if (/[_-]/.test(username)) {
      attributes.push({ trait_type: 'Has Special Chars', value: 'Yes' });
    }

    const metadata: NFTMetadata = {
      name: `@${username}`,
      symbol: 'SOCIALFI',
      description: `Social-Fi Username NFT\n\nUsername: @${username}\nCategory: ${category}\nRarity: ${this.determineRarity(username)}\n\nTradeable on Magic Eden, OpenSea, and other Solana NFT marketplaces.`,
      image,
      external_url: `https://yourplatform.com/u/${username}`,
      attributes,
      properties: {
        files: [
          {
            uri: image,
            type: 'image/png',
          },
        ],
        category: 'image',
        creators: [
          {
            address: owner,
            share: 100,
          },
        ],
      },
      collection: {
        name: 'Social-Fi Usernames',
        family: 'Social-Fi',
      },
    };

    try {
      console.log('📤 Uploading username metadata to Pinata IPFS...', { username, category });
      
      // Upload to Pinata IPFS using shared service
      const metadataUri = await uploadJSONToPinata(metadata, {
        name: `NFT Metadata: ${metadata.name}`,
        keyvalues: {
          type: 'nft-metadata',
          platform: 'social-fi',
        },
      });
      
      console.log('✅ Metadata uploaded to Pinata:', metadataUri);
      return metadataUri;
    } catch (error) {
      console.error('Failed to upload metadata:', error);
      throw new Error(`Failed to upload metadata to Pinata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload custom image file to Pinata IPFS
   */
  async uploadImage(file: File): Promise<string> {
    try {
      console.log('📤 Uploading image to Pinata...', { size: file.size, type: file.type });
      
      return await uploadFileToPinata(file, {
        name: `NFT Image: ${file.name}`,
        keyvalues: {
          type: 'nft-image',
          platform: 'social-fi',
        },
      });
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw new Error(`Failed to upload image to Pinata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch metadata from URI
   */
  async fetchMetadata(uri: string): Promise<NFTMetadata> {
    try {
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
      throw new Error(`Failed to fetch metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Service singleton management
let metadataService: MetadataUploadService | null = null;

export const getMetadataService = (
  wallet: WalletAdapter,
  rpcUrl?: string
): MetadataUploadService => {
  if (!metadataService) {
    metadataService = new MetadataUploadService(wallet, rpcUrl);
  }
  return metadataService;
};

export const resetMetadataService = () => {
  metadataService = null;
};
