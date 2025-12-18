import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Buffer } from 'buffer';

/**
 * NFT Metadata (Metaplex standard)
 */
export interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties?: {
    category?: string;
    creators?: Array<{
      address: string;
      share: number;
    }>;
  };
  external_url?: string;
}

/**
 * Username NFT (from our contract)
 */
export interface UsernameNFT {
  mint: string; // NFT mint address
  username: string; // Username from metadata
  metadataUri: string; // IPFS URI
  metadata?: NFTMetadata; // Fetched metadata
  image?: string; // Image URL from metadata
  category?: string; // premium, short, rare, custom
  mintedAt?: number; // Unix timestamp
  owner: string; // Owner wallet address
  tokenAccount: string; // Token account address
}

/**
 * NFT Service - Fetch and manage user NFTs
 */
export class NFTService {
  private connection: Connection;
  
  constructor(connection: Connection) {
    this.connection = connection;
  }

  /**
   * Get all token accounts owned by wallet
   */
  async getTokenAccounts(owner: PublicKey) {
    const accounts = await this.connection.getParsedTokenAccountsByOwner(owner, {
      programId: TOKEN_PROGRAM_ID,
    });

    return accounts.value.filter((account) => {
      const amount = account.account.data.parsed.info.tokenAmount;
      // Filter NFTs (amount = 1, decimals = 0)
      return amount.decimals === 0 && amount.uiAmount === 1;
    });
  }

  /**
   * Get metadata URI from Metaplex metadata account
   */
  async getMetadataUri(mint: PublicKey): Promise<string | null> {
    try {
      const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
        'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
      );

      const [metadataPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        TOKEN_METADATA_PROGRAM_ID
      );

      const accountInfo = await this.connection.getAccountInfo(metadataPDA);
      if (!accountInfo) return null;

      // Parse Metaplex metadata account
      // Format: https://docs.metaplex.com/programs/token-metadata/accounts#metadata
      const data = accountInfo.data;

      // Skip first 1 byte (key) + 32 bytes (update authority) + 32 bytes (mint)
      let offset = 1 + 32 + 32;

      // Read name length (4 bytes u32)
      const nameLength = data.readUInt32LE(offset);
      offset += 4 + nameLength;

      // Read symbol length
      const symbolLength = data.readUInt32LE(offset);
      offset += 4 + symbolLength;

      // Read URI length
      const uriLength = data.readUInt32LE(offset);
      offset += 4;

      // Read URI string
      const uri = data.toString('utf8', offset, offset + uriLength).replace(/\0/g, '');

      return uri || null;
    } catch (error) {
      console.error('Error fetching metadata URI:', error);
      return null;
    }
  }

  /**
   * Fetch metadata JSON from URI (supports IPFS via Pinata gateway)
   */
  async fetchMetadata(uri: string): Promise<NFTMetadata | null> {
    try {
      // Handle IPFS URIs - convert to Pinata gateway
      let url = uri;
      if (uri.startsWith('ipfs://')) {
        url = uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
        console.log('📍 Resolved IPFS URI via Pinata:', url);
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const metadata = await response.json();
      return metadata;
    } catch (error) {
      console.error('Error fetching metadata from URI:', error);
      return null;
    }
  }

  /**
   * Get all username NFTs owned by wallet
   */
  async getUsernameNFTs(owner: PublicKey): Promise<UsernameNFT[]> {
    try {
      const tokenAccounts = await this.getTokenAccounts(owner);

      const nfts: UsernameNFT[] = [];

      for (const account of tokenAccounts) {
        const mint = new PublicKey(account.account.data.parsed.info.mint);
        const tokenAccount = account.pubkey.toString();

        // Get metadata URI
        const metadataUri = await this.getMetadataUri(mint);
        if (!metadataUri) continue;

        // Fetch metadata
        const metadata = await this.fetchMetadata(metadataUri);
        if (!metadata) continue;

        // Parse username from metadata name
        // Format: "@username" or "username"
        const username = metadata.name.replace('@', '').trim();

        // Get category from attributes
        const categoryAttr = metadata.attributes?.find(
          (attr) => attr.trait_type === 'Category'
        );
        const category = categoryAttr?.value as string | undefined;

        // Get minted timestamp
        const mintedAtAttr = metadata.attributes?.find(
          (attr) => attr.trait_type === 'Minted At'
        );
        const mintedAt = mintedAtAttr?.value as number | undefined;

        nfts.push({
          mint: mint.toString(),
          username,
          metadataUri,
          metadata,
          image: metadata.image,
          category,
          mintedAt,
          owner: owner.toString(),
          tokenAccount,
        });
      }

      return nfts;
    } catch (error) {
      console.error('Error fetching username NFTs:', error);
      return [];
    }
  }

  /**
   * Get Solana Explorer URL for NFT
   */
  getExplorerUrl(mint: string, cluster: 'mainnet-beta' | 'devnet' | 'testnet' = 'devnet'): string {
    return `https://explorer.solana.com/address/${mint}${cluster !== 'mainnet-beta' ? `?cluster=${cluster}` : ''}`;
  }

  /**
   * Get Solscan URL for NFT
   */
  getSolscanUrl(mint: string, cluster: 'mainnet-beta' | 'devnet' | 'testnet' = 'devnet'): string {
    return `https://solscan.io/token/${mint}${cluster !== 'mainnet-beta' ? `?cluster=${cluster}` : ''}`;
  }

  /**
   * Get Magic Eden URL for NFT
   */
  getMagicEdenUrl(mint: string): string {
    return `https://magiceden.io/item-details/${mint}`;
  }
}

// Singleton instance
let nftService: NFTService | null = null;

export const getNFTService = (connection: Connection): NFTService => {
  if (!nftService) {
    nftService = new NFTService(connection);
  }
  return nftService;
};

export const resetNFTService = () => {
  nftService = null;
};
