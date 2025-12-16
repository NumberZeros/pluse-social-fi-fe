import type { WalletAdapter } from '../lib/wallet-adapter';

/**
 * Metadata Upload Service - Metaplex Standard
 * Uploads NFT metadata to Arweave via Irys for Magic Eden & OpenSea compatibility
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
   * Create and upload username NFT metadata to Arweave
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
      console.log('Uploading metadata to Arweave...', { username, category });
      
      // Upload to Irys (formerly Bundlr)
      const metadataUri = await this.uploadToIrys(JSON.stringify(metadata));
      
      console.log('✅ Metadata uploaded successfully:', metadataUri);
      return metadataUri;
    } catch (error) {
      console.error('Failed to upload metadata:', error);
      throw new Error(`Failed to upload metadata to Arweave: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload JSON to IPFS via Pinata (free tier available)
   * Pinata is reliable and has good free limits for MVP
   */
  private async uploadToIrys(data: string): Promise<string> {
    const pinataJWT = import.meta.env.VITE_PINATA_JWT;
    
    if (!pinataJWT || pinataJWT === 'YOUR_PINATA_JWT_HERE') {
      throw new Error(
        'VITE_PINATA_JWT not configured. Get free API key at https://pinata.cloud\n' +
        '1. Sign up at pinata.cloud\n' +
        '2. Go to API Keys → New Key\n' +
        '3. Copy JWT and add to .env as VITE_PINATA_JWT=your_jwt_here'
      );
    }

    try {
      console.log('Uploading metadata to IPFS via Pinata...');
      
      const metadata = JSON.parse(data);
      const blob = new Blob([data], { type: 'application/json' });
      const formData = new FormData();
      formData.append('file', blob, `${metadata.name}_metadata.json`);
      
      // Add metadata for easier management
      formData.append('pinataMetadata', JSON.stringify({
        name: `NFT Metadata: @${metadata.name}`,
      }));

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pinataJWT}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pinata upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      const ipfsHash = result.IpfsHash;
      
      if (!ipfsHash) {
        throw new Error('No IPFS hash returned from Pinata');
      }

      // Use Pinata gateway (fast and reliable)
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      
      console.log('✅ Metadata uploaded to IPFS via Pinata');
      console.log('   URL:', ipfsUrl);
      console.log('   IPFS Hash:', ipfsHash);
      
      return ipfsUrl;
      
    } catch (error) {
      console.error('❌ Pinata upload failed:', error);
      throw error;
    }
  }

  /**
   * Upload custom image file to Arweave
   */
  async uploadImage(file: File): Promise<string> {
    try {
      const buffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);

      console.log('Uploading image to Arweave...', { size: file.size, type: file.type });
      
      // Upload image data directly
      const imageUri = await this.uploadToIrys(JSON.stringify({
        data: Array.from(uint8Array),
        type: file.type,
        name: file.name,
      }));
      
      console.log('✅ Image uploaded successfully:', imageUri);
      return imageUri;
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  /**
   * Estimate upload cost in SOL
   * Irys pricing is dynamic, this is an approximation
   */
  estimateUploadCost(metadataSize: number = 2048): number {
    // Approximate: ~0.00001 SOL per KB
    const sizeInKB = metadataSize / 1024;
    const costInLamports = Math.ceil(sizeInKB * 10000);
    return costInLamports / 1e9; // Convert to SOL
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
