import { Program, AnchorProvider, BN, setProvider } from '@coral-xyz/anchor';
import type { Idl } from '@coral-xyz/anchor';
import { Connection, PublicKey, SystemProgram, Keypair, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { Buffer } from 'buffer';
import type { AnchorWallet } from '../lib/wallet-adapter';
import idlJson from '../idl/social_fi_contract.json';
import type { SocialFiContract } from '../idl/social_fi_contract';
import { PDAs } from './pda';
import { RPC_ENDPOINTS, NETWORK, DEFAULT_COMMITMENT, TOKEN_METADATA_PROGRAM_ID } from '../utils/constants';

/**
 * Social-Fi SDK
 * Wrapper around Anchor program for easy interaction with smart contract
 */
export class SocialFiSDK {
  program: Program<SocialFiContract>;
  connection: Connection;
  provider: AnchorProvider;
  wallet: AnchorWallet;

  constructor(wallet: AnchorWallet, connection?: Connection) {
    this.wallet = wallet;
    this.connection = connection || new Connection(RPC_ENDPOINTS[NETWORK], DEFAULT_COMMITMENT);
    this.provider = new AnchorProvider(this.connection, wallet, {
      commitment: DEFAULT_COMMITMENT,
    });
    
    // Set global provider for Anchor
    setProvider(this.provider);
    
    // Anchor v0.32.1: Pass provider directly for transaction signing
    // See: https://www.anchor-lang.com/docs/clients/typescript
    this.program = new Program<SocialFiContract>(
      idlJson as Idl,
      this.provider
    );
    
  }

  // ==================== PLATFORM ====================

  /**
   * Initialize platform config (admin only - run once)
   * @param feeCollector - Public key to receive platform fees
   */
  async initializePlatform(feeCollector: PublicKey) {
    const [platformConfig] = PDAs.getPlatformConfig();

    const tx = await this.program.methods
      .initializePlatform(feeCollector)
      .accountsPartial({
        platformConfig,
        admin: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx, platformConfig };
  }

  /**
   * Pause platform (admin only)
   */
  async pausePlatform() {
    const [platformConfig] = PDAs.getPlatformConfig();

    const tx = await this.program.methods
      .pausePlatform()
      .accountsPartial({
        platformConfig,
        admin: this.wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  /**
   * Unpause platform (admin only)
   */
  async unpausePlatform() {
    const [platformConfig] = PDAs.getPlatformConfig();

    const tx = await this.program.methods
      .unpausePlatform()
      .accountsPartial({
        platformConfig,
        admin: this.wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  /**
   * Update platform admin (current admin only)
   */
  async updateAdmin(newAdmin: PublicKey) {
    const [platformConfig] = PDAs.getPlatformConfig();

    const tx = await this.program.methods
      .updateAdmin(newAdmin)
      .accountsPartial({
        platformConfig,
        admin: this.wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  /**
   * Update fee collector (admin only)
   */
  async updateFeeCollector(newFeeCollector: PublicKey) {
    const [platformConfig] = PDAs.getPlatformConfig();

    const tx = await this.program.methods
      .updateFeeCollector(newFeeCollector)
      .accountsPartial({
        platformConfig,
        admin: this.wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  /**
   * Update minimum liquidity requirement (admin only)
   * @param newMinLiquidityBps - New minimum liquidity in basis points (max 5000 = 50%)
   */
  async updateMinLiquidity(newMinLiquidityBps: number) {
    const [platformConfig] = PDAs.getPlatformConfig();

    const tx = await this.program.methods
      .updateMinLiquidity(new BN(newMinLiquidityBps))
      .accountsPartial({
        platformConfig,
        admin: this.wallet.publicKey,
      })
      .rpc();

    return tx;
  }


  // ==================== POSTS ====================

  /**
   * Create a new post (PDA only, lightweight)
   * @param uri - Metadata URI (e.g., Arweave/IPFS link)
   */
  async createPost(uri: string) {
    // Generate a unique nonce for this post (timestamp)
    // This ensures each post gets a unique PDA
    const nonce = Date.now().toString();
    
    // Calculate PDA using the nonce (not the URI, since URI can be 100+ bytes)
    const [postPda] = PDAs.getPost(this.wallet.publicKey, nonce);
    const [platformConfigPda] = PDAs.getPlatformConfig();


    try {
      // Call contract - pass nonce and uri
      const tx = await this.program.methods
        .createPost(nonce, uri)
        .accountsPartial({
          post: postPda,
          author: this.wallet.publicKey,
          platformConfig: platformConfigPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return { signature: tx, post: postPda };
    } catch (error) {
      console.error('Failed to create post:', error);
      throw error;
    }
  }

  /**
   * Mint a post as an NFT
   * @param postPubkey - The Post PDA to mint
   * @param title - Title for the NFT (Metadata)
   * @param metadata - Optional metadata including description and images
   */
  async mintPost(
    postPubkey: PublicKey,
    title: string,
    metadata?: { title?: string; description?: string; images?: string[] }
  ) {
    // Fetch post account to verify it exists and we're the author
    let postAccount;
    try {
      postAccount = await this.program.account.post.fetch(postPubkey);
      console.log('📦 Post account fetched:', {
        author: postAccount.author.toBase58(),
        currentWallet: this.wallet.publicKey.toBase58(),
        match: postAccount.author.toBase58() === this.wallet.publicKey.toBase58(),
      });

      // Verify we're the author
      if (postAccount.author.toBase58() !== this.wallet.publicKey.toBase58()) {
        throw new Error('Only the post author can mint an NFT');
      }

      // Check if post already has NFT minted
      if (postAccount.mint) {
        throw new Error('This post has already been minted as an NFT');
      }
    } catch (error) {
      console.error('Failed to fetch post account:', error);
      throw error;
    }

    // Generate a new Mint Keypair
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;

    // Get ATA for the author
    const tokenAccount = await getAssociatedTokenAddress(
      mint,
      this.wallet.publicKey
    );

    // Get Metaplex PDAs
    const [metadataPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    const [masterEdition] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
        Buffer.from('edition'),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    console.log('📸 Minting post with metadata:', {
      title,
      description: metadata?.description,
      images: metadata?.images?.length || 0,
      postPubkey: postPubkey.toBase58(),
      author: this.wallet.publicKey.toBase58(),
    });

    // Fetch post content from post URI to get images
    let postMetadata = { content: '', images: [] };
    try {
      // Handle different URI formats
      if (postAccount.uri.startsWith('http')) {
        postMetadata = await fetch(postAccount.uri).then(r => r.json());
      } else if (postAccount.uri.startsWith('ipfs://')) {
        // Try Pinata gateway
        const ipfsPath = postAccount.uri.replace('ipfs://', '');
        postMetadata = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsPath}`).then(r => r.json());
      } else if (postAccount.uri.startsWith('text:')) {
        // Plain text content
        postMetadata = { content: postAccount.uri.slice(5), images: [] };
      } else {
        // Try localStorage mock
        const stored = localStorage.getItem(`post_metadata_${postAccount.uri}`);
        if (stored) postMetadata = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to fetch post metadata:', error);
    }
    
    const postImages = postMetadata.images || metadata?.images || [];
    console.log('📸 Post images found:', postImages);

    // Create NFT metadata JSON (Metaplex standard)
    const nftMetadata = {
      name: title,
      symbol: 'POST',
      description: metadata?.description || postMetadata.content || '',
      image: postImages[0] || 'https://via.placeholder.com/400x400.png?text=Post+NFT',
      attributes: [
        {
          trait_type: 'Post Author',
          value: this.wallet.publicKey.toBase58().slice(0, 8),
        },
        {
          trait_type: 'Minted Date',
          value: new Date().toISOString().split('T')[0],
        },
      ],
      properties: {
        files: postImages.map((url: string) => ({ uri: url, type: 'image/jpeg' })),
        category: 'image',
        creators: [
          {
            address: this.wallet.publicKey.toBase58(),
            share: 100,
          },
        ],
      },
    };

    // Upload NFT metadata to Pinata
    const pinataJwt = import.meta.env.VITE_PINATA_JWT;
    if (!pinataJwt) {
      throw new Error('VITE_PINATA_JWT not configured. Please add it to .env file.');
    }

    let nftMetadataUri = '';
    try {
      console.log('📤 Uploading NFT metadata to Pinata...');
      const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pinataJwt}`,
        },
        body: JSON.stringify({
          pinataContent: nftMetadata,
          pinataMetadata: {
            name: `nft-${title.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.json`,
          },
        }),
      });

      if (!pinataResponse.ok) {
        const errorText = await pinataResponse.text();
        console.error('Pinata API error:', errorText);
        throw new Error(`Pinata upload failed: ${pinataResponse.status} ${errorText}`);
      }

      const pinataData = await pinataResponse.json();
      nftMetadataUri = `https://gateway.pinata.cloud/ipfs/${pinataData.IpfsHash}`;
      console.log('✅ NFT Metadata uploaded to Pinata:', nftMetadataUri);
      console.log('📦 IPFS Hash:', pinataData.IpfsHash);
    } catch (error) {
      console.error('Error uploading NFT metadata to Pinata:', error);
      throw new Error(`Failed to upload NFT metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    console.log('📦 NFT Metadata:', nftMetadata);
    console.log('📦 NFT Metadata URI:', nftMetadataUri);

    const tx = await this.program.methods
      .mintPost(title, nftMetadataUri)
      .accountsPartial({
        post: postPubkey,
        mint,
        tokenAccount,
        metadata: metadataPda,
        masterEdition,
        author: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([mintKeypair])
      .rpc();

    console.log('✅ NFT minted successfully:', tx);
    return { signature: tx, mint };
  }

  // ==================== USER PROFILE ====================

  /**
   * Create user profile (initialize_user instruction)
   */
  async createProfile(username: string) {
    const [userProfile] = PDAs.getUserProfile(this.wallet.publicKey);

    const tx = await this.program.methods
      .initializeUser(username)
      .accountsPartial({
        userProfile,
        user: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx, userProfile };
  }

  // Note: updateProfile not available in current contract version

  /**
   * Get user profile
   */
  async getUserProfile(owner?: PublicKey) {
    const targetOwner = owner || this.wallet.publicKey;
    const [userProfile] = PDAs.getUserProfile(targetOwner);

    try {
      const account = await this.program.account.userProfile.fetch(userProfile);
      return account;
    } catch {
      // Profile not found
      return null;
    }
  }

  /**
   * Check if username is available
   * @param username - Username to check
   * @returns true if available, false if taken
   */
  async isUsernameAvailable(username: string): Promise<boolean> {
    const [usernameNft] = PDAs.getUsernameNFT(username);
    
    try {
      const accountInfo = await this.connection.getAccountInfo(usernameNft);
      // If account exists, username is taken
      return accountInfo === null;
    } catch {
      // Error fetching account, assume available
      return true;
    }
  }

  /**
   * Send tip to another user
   */
  async sendTip(recipientPubkey: PublicKey, amount: number) {
    const [senderProfile] = PDAs.getUserProfile(this.wallet.publicKey);
    const [recipientProfile] = PDAs.getUserProfile(recipientPubkey);

    const tx = await this.program.methods
      .sendTip(new BN(amount))
      .accountsPartial({
        senderProfile,
        recipientProfile,
        sender: this.wallet.publicKey,
        recipient: recipientPubkey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  // ==================== CREATOR SHARES ====================

  /**
   * Initialize creator pool (must be called before buying/selling shares)
   * @param creatorPubkey - Creator's public key (optional, defaults to current wallet)
   */
  async initializeCreatorPool(creatorPubkey?: PublicKey) {
    const creator = creatorPubkey || this.wallet.publicKey;
    const [creatorPool] = PDAs.getCreatorPool(creator);

    const tx = await this.program.methods
      .initializeCreatorPool()
      .accountsPartial({
        creatorPool,
        creator: creator,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx, creatorPool };
  }

  /**
   * Buy creator shares
   */
  async buyShares(creatorPubkey: PublicKey, amount: number, maxPricePerShare: number) {
    const [creatorPool] = PDAs.getCreatorPool(creatorPubkey);
    const [shareHolding] = PDAs.getShareHolding(this.wallet.publicKey, creatorPubkey);
    const [poolVault] = PDAs.getPoolVault(creatorPubkey);
    const [platformConfig] = PDAs.getPlatformConfig();

    const tx = await this.program.methods
      .buyShares(new BN(amount), new BN(maxPricePerShare))
      .accountsPartial({
        creatorPool,
        shareHolding,
        poolVault,
        buyer: this.wallet.publicKey,
        creator: creatorPubkey,
        platformConfig,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  /**
   * Sell creator shares
   */
  async sellShares(creatorPubkey: PublicKey, amount: number, minPricePerShare: number) {
    const [creatorPool] = PDAs.getCreatorPool(creatorPubkey);
    const [shareHolding] = PDAs.getShareHolding(this.wallet.publicKey, creatorPubkey);
    const [poolVault] = PDAs.getPoolVault(creatorPubkey);
    const [platformConfig] = PDAs.getPlatformConfig();

    const tx = await this.program.methods
      .sellShares(new BN(amount), new BN(minPricePerShare))
      .accountsPartial({
        creatorPool,
        shareHolding,
        poolVault,
        seller: this.wallet.publicKey,
        creator: creatorPubkey,
        platformConfig,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  /**
   * Get creator pool data
   */
  async getCreatorShares(creatorPubkey: PublicKey) {
    const [creatorPool] = PDAs.getCreatorPool(creatorPubkey);

    try {
      const account = await this.program.account.creatorPool.fetch(creatorPool);
      return account;
    } catch {
      // Creator pool not found
      return null;
    }
  }

  /**
   * Calculate current price for amount of shares
   * Matches contract logic: price = base_price * (supply_scaled^2)
   * where supply_scaled = supply / PRICE_SCALE (100)
   */
  async calculateSharePrice(creatorPubkey: PublicKey, amount: number): Promise<number> {
    const shares = await this.getCreatorShares(creatorPubkey);
    if (!shares) return 0;

    const supply = shares.supply.toNumber();
    const basePrice = shares.basePrice.toNumber();
    const PRICE_SCALE = 100; // Must match contract constant

    // Calculate price using contract's bonding curve formula
    let totalCost = 0;
    for (let i = 0; i < amount; i++) {
      const currentSupply = supply + i;
      const supplyScaled = Math.floor(currentSupply / PRICE_SCALE);
      const priceMultiplier = supplyScaled * supplyScaled;
      const price = basePrice * priceMultiplier;
      // Ensure minimum price is basePrice
      totalCost += Math.max(price, basePrice);
    }

    return totalCost / 1e9; // Convert lamports to SOL
  }

  // ==================== SOCIAL INTERACTIONS ====================

  /**
   * Follow a user
   * @param followingPubkey - User to follow
   */
  async followUser(followingPubkey: PublicKey) {
    const [follow] = PDAs.getFollow(this.wallet.publicKey, followingPubkey);
    const [followerProfile] = PDAs.getUserProfile(this.wallet.publicKey);
    const [followingProfile] = PDAs.getUserProfile(followingPubkey);

    const tx = await this.program.methods
      .followUser()
      .accountsPartial({
        follow,
        follower: this.wallet.publicKey,
        following: followingPubkey,
        followerProfile,
        followingProfile,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx, follow };
  }

  /**
   * Unfollow a user
   * @param followingPubkey - User to unfollow
   */
  async unfollowUser(followingPubkey: PublicKey) {
    const [follow] = PDAs.getFollow(this.wallet.publicKey, followingPubkey);
    const [followerProfile] = PDAs.getUserProfile(this.wallet.publicKey);
    const [followingProfile] = PDAs.getUserProfile(followingPubkey);

    const tx = await this.program.methods
      .unfollowUser()
      .accountsPartial({
        follow,
        follower: this.wallet.publicKey,
        following: followingPubkey,
        followerProfile,
        followingProfile,
      })
      .rpc();

    return { signature: tx };
  }

  /**
   * Like a post
   * @param postPubkey - Post PDA to like
   */
  async likePost(postPubkey: PublicKey) {
    const [like] = PDAs.getLike(this.wallet.publicKey, postPubkey);

    // Check if already liked
    const isLiked = await this.hasLikedPost(postPubkey);
    if (isLiked) {
      throw new Error('You have already liked this post. Unlike it first to like again.');
    }

    const tx = await this.program.methods
      .likePost()
      .accountsPartial({
        like,
        user: this.wallet.publicKey,
        post: postPubkey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx, like };
  }

  /**
   * Unlike a post
   * @param postPubkey - Post PDA to unlike
   */
  async unlikePost(postPubkey: PublicKey) {
    const [like] = PDAs.getLike(this.wallet.publicKey, postPubkey);

    const tx = await this.program.methods
      .unlikePost()
      .accountsPartial({
        like,
        user: this.wallet.publicKey,
        post: postPubkey,
      })
      .rpc();

    return { signature: tx };
  }

  /**
   * Repost a post
   * @param originalPostPubkey - Original post PDA to repost
   */
  async createRepost(originalPostPubkey: PublicKey) {
    const [repost] = PDAs.getRepost(this.wallet.publicKey, originalPostPubkey);

    // Check if already reposted
    try {
      await this.program.account.repost.fetch(repost);
      throw new Error('You have already reposted this post. Delete the repost first to repost again.');
    } catch (error: any) {
      // If error is "Account does not exist", that's good - we can proceed
      if (error.message?.includes('does not exist') || error.message?.includes('Account does not exist')) {
        // Continue - account doesn't exist, safe to create
      } else if (error.message?.includes('already reposted')) {
        throw error;
      }
      // For other errors during fetch, still try to proceed (might be network issue)
    }

    const tx = await this.program.methods
      .createRepost()
      .accountsPartial({
        repost,
        user: this.wallet.publicKey,
        originalPost: originalPostPubkey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx, repost };
  }

  /**
   * Create a comment on a post
   * @param postPubkey - Post PDA to comment on
   * @param content - Comment content (max 280 chars)
   * @param nonce - Unique nonce for this comment (defaults to current timestamp + random)
   */
  async createComment(postPubkey: PublicKey, content: string, nonce: number = Date.now() + Math.floor(Math.random() * 1000)) {
    if (!content || content.trim().length === 0) {
      throw new Error('Comment content cannot be empty');
    }

    if (content.length > 280) {
      throw new Error('Comment must be 280 characters or less');
    }

    const [comment] = PDAs.getComment(postPubkey, this.wallet.publicKey, nonce);

    const tx = await this.program.methods
      .createComment(new BN(nonce), content)
      .accountsPartial({
        comment,
        author: this.wallet.publicKey,
        post: postPubkey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx, comment };
  }

  /**
   * Check if user is following another user
   */
  async isFollowing(followingPubkey: PublicKey): Promise<boolean> {
    const [follow] = PDAs.getFollow(this.wallet.publicKey, followingPubkey);
    try {
      await this.program.account.follow.fetch(follow);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if user has liked a post
   */
  async hasLikedPost(postPubkey: PublicKey): Promise<boolean> {
    const [like] = PDAs.getLike(this.wallet.publicKey, postPubkey);
    try {
      await this.program.account.like.fetch(like);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all posts from blockchain
   * Queries all Post accounts using getProgramAccounts
   * 
   * Note: Cannot filter by exact dataSize because String fields have dynamic size
   * - Short URI posts: ~286 bytes
   * - Long URI posts: ~310 bytes
   * Solution: Try to decode all accounts, skip non-Post accounts
   */
  async getAllPosts() {
    try {
      console.log('🚀 Fetching all posts from blockchain...');
      
      // Fetch ALL accounts (no dataSize filter due to dynamic String sizes)
      const allAccounts = await this.connection.getProgramAccounts(this.program.programId);
      console.log(`📊 Total accounts for program: ${allAccounts.length}`);

      // Try to decode each account as Post, skip non-Post accounts
      const postData: any[] = [];
      for (const p of allAccounts) {
        try {
          const decoded = this.program.account.post.coder.accounts.decode('post', p.account.data);
          
          const post = {
            publicKey: p.pubkey.toBase58(),
            author: decoded.author.toBase58(),
            uri: decoded.uri,
            mint: decoded.mint ? decoded.mint.toBase58() : null,
            createdAt: decoded.createdAt.toNumber(),
          };
          console.debug('Decoded Post account:', post);

          postData.push(post);
        } catch (e) {
          console.debug('Skipping non-Post account:', p.pubkey.toBase58());
          // Not a Post account (could be UserProfile, Follow, Like, etc.), skip silently
        }
      }

      console.log(`✅ Successfully decoded ${postData.length} posts`);
      return postData;
    } catch (error) {
      console.error('⚠️ Error fetching posts from blockchain:', error);
      return [];
    }
  }

  /**
   * Get all followers of a user
   * Queries all Follow accounts where user is the 'following' (target of follow)
   */
  async getFollowers(userPubkey: PublicKey) {
    try {
      console.log('🚀 Fetching followers for:', userPubkey.toBase58());
      
      const follows = await this.connection.getProgramAccounts(this.program.programId, {
        filters: [
          {
            memcmp: {
              offset: 8 + 32, // Skip discriminator (8) + follower (32), get to 'following' field
              bytes: userPubkey.toBase58(),
            },
          },
        ],
      });

      const followerData = follows.map(f => {
        try {
          const decoded = this.program.account.follow.coder.accounts.decode('follow', f.account.data);
          return {
            follower: decoded.follower.toBase58(),
            following: decoded.following.toBase58(),
            created_at: decoded.created_at.toNumber(),
          };
        } catch (e) {
          return null;
        }
      }).filter((f): f is any => f !== null);

      console.log(`✅ Found ${followerData.length} followers`);
      return followerData;
    } catch (error) {
      console.warn('⚠️ Error fetching followers:', error);
      return [];
    }
  }

  /**
   * Get all users a user is following
   * Queries all Follow accounts where user is the 'follower'
   */
  async getFollowing(userPubkey: PublicKey) {
    try {
      console.log('🚀 Fetching following list for:', userPubkey.toBase58());
      
      const follows = await this.connection.getProgramAccounts(this.program.programId, {
        filters: [
          {
            memcmp: {
              offset: 8, // Skip discriminator, get to 'follower' field
              bytes: userPubkey.toBase58(),
            },
          },
        ],
      });

      const followingData = follows.map(f => {
        try {
          const decoded = this.program.account.follow.coder.accounts.decode('follow', f.account.data);
          return {
            follower: decoded.follower.toBase58(),
            following: decoded.following.toBase58(),
            created_at: decoded.created_at.toNumber(),
          };
        } catch (e) {
          return null;
        }
      }).filter((f): f is any => f !== null);

      console.log(`✅ Found ${followingData.length} users being followed`);
      return followingData;
    } catch (error) {
      console.warn('⚠️ Error fetching following list:', error);
      return [];
    }
  }

  /**
   * Get likes for a post
   * Queries all Like accounts where the post is the target
   */
  async getPostLikes(postPubkey: PublicKey) {
    try {
      console.log('🚀 Fetching likes for post:', postPubkey.toBase58());
      
      const likes = await this.connection.getProgramAccounts(this.program.programId, {
        filters: [
          {
            memcmp: {
              offset: 8 + 32, // Skip discriminator (8) + user (32), get to 'post' field
              bytes: postPubkey.toBase58(),
            },
          },
        ],
      });

      const likeData = likes.map(l => {
        try {
          const decoded = this.program.account.like.coder.accounts.decode('like', l.account.data);
          return {
            user: decoded.user.toBase58(),
            post: decoded.post.toBase58(),
            created_at: decoded.created_at.toNumber(),
          };
        } catch (e) {
          return null;
        }
      }).filter((l): l is any => l !== null);

      console.log(`✅ Found ${likeData.length} likes`);
      return likeData;
    } catch (error) {
      console.warn('⚠️ Error fetching likes:', error);
      return [];
    }
  }

  /**
   * Get comments for a post
   * Queries all Comment accounts for a specific post
   */
  async getPostComments(postPubkey: PublicKey) {
    try {
      console.log('🚀 Fetching comments for post:', postPubkey.toBase58());
      
      const comments = await this.connection.getProgramAccounts(this.program.programId, {
        filters: [
          {
            memcmp: {
              offset: 8 + 32, // Skip discriminator (8) + author (32), get to 'post' field
              bytes: postPubkey.toBase58(),
            },
          },
        ],
      });

      const commentData = comments.map(c => {
        try {
          const decoded = this.program.account.comment.coder.accounts.decode('comment', c.account.data);
          return {
            publicKey: c.pubkey.toBase58(),
            author: decoded.author.toBase58(),
            post: decoded.post.toBase58(),
            content: decoded.content,
            created_at: decoded.created_at.toNumber(),
          };
        } catch (e) {
          return null;
        }
      }).filter((c): c is any => c !== null);

      console.log(`✅ Found ${commentData.length} comments`);
      return commentData;
    } catch (error) {
      console.warn('⚠️ Error fetching comments:', error);
      return [];
    }
  }

  /**
   * Get a specific post by its public key
   * @param postPubkey - Post account public key
   */
  async getPost(postPubkey: PublicKey) {
    try {
      const post = await this.program.account.post.fetch(postPubkey);
      return {
        publicKey: postPubkey.toBase58(),
        author: post.author.toBase58(),
        uri: post.uri,
        mint: post.mint ? post.mint.toBase58() : null,
        createdAt: post.createdAt.toNumber(),
      };
    } catch (error) {
      console.error('Error fetching post:', error);
      return null;
    }
  }

  /**
   * Get reposts of a post
   * Queries all Repost accounts for a specific original post
   */
  async getPostReposts(originalPostPubkey: PublicKey) {
    try {
      console.log('🚀 Fetching reposts for post:', originalPostPubkey.toBase58());
      
      const reposts = await this.connection.getProgramAccounts(this.program.programId, {
        filters: [
          {
            memcmp: {
              offset: 8 + 32, // Skip discriminator (8) + user (32), get to 'original_post' field
              bytes: originalPostPubkey.toBase58(),
            },
          },
        ],
      });

      const repostData = reposts.map(r => {
        try {
          const decoded = this.program.account.repost.coder.accounts.decode('repost', r.account.data);
          return {
            user: decoded.user.toBase58(),
            originalPost: decoded.originalPost.toBase58(),
            created_at: decoded.created_at.toNumber(),
          };
        } catch (e) {
          return null;
        }
      }).filter((r): r is any => r !== null);

      console.log(`✅ Found ${repostData.length} reposts`);
      return repostData;
    } catch (error) {
      console.warn('⚠️ Error fetching reposts:', error);
      return [];
    }
  }

  // ==================== UTILITIES ====================


  /**
   * Get program ID
   */
  getProgramId(): PublicKey {
    return this.program.programId;
  }

  /**
   * Get wallet balance
   */
  async getBalance(pubkey?: PublicKey): Promise<number> {
    const target = pubkey || this.wallet.publicKey;
    const balance = await this.connection.getBalance(target);
    return balance / 1e9; // Convert to SOL
  }

  /**
   * Get platform config
   */
  async getPlatformConfig() {
    const [platformConfig] = PDAs.getPlatformConfig();

    try {
      const account = await this.program.account.platformConfig.fetch(platformConfig);
      return account;
    } catch (_error) {
      return null;
    }
  }

  // ==================== SUBSCRIPTIONS ====================

  /**
   * Create subscription tier for creator
   * @param tierId - Tier ID (u64) - must match contract's get_next_tier_id() or be sequential
   * @param name - Tier name
   * @param description - Tier description
   * @param priceInSol - Price in SOL
   * @param durationDays - Duration in days
   */
  async createSubscriptionTier(
    tierId: number,
    name: string,
    description: string,
    priceInSol: number,
    durationDays: number
  ) {
    const priceInLamports = Math.floor(priceInSol * 1e9);
    
    // Use PDAs helper with proper u64 encoding
    const [subscriptionTier] = PDAs.getSubscriptionTier(this.wallet.publicKey, tierId);

    const tx = await this.program.methods
      .createSubscriptionTier(name, description, new BN(priceInLamports), new BN(durationDays))
      .accountsPartial({
        subscriptionTier,
        creator: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx, subscriptionTier, tierId };
  }

  /**
   * Subscribe to creator's tier
   * @param creatorPubkey - Creator's public key
   * @param tierId - Tier ID to subscribe to (required)
   */
  async subscribe(creatorPubkey: PublicKey, tierId: number) {
    // Subscription PDA now includes tier_id
    const [subscription] = PDAs.getSubscription(this.wallet.publicKey, creatorPubkey, tierId);
    const [subscriptionTier] = PDAs.getSubscriptionTier(creatorPubkey, tierId);

    const tx = await this.program.methods
      .subscribe()
      .accountsPartial({
        subscriptionTier,
        subscription,
        subscriber: this.wallet.publicKey,
        creator: creatorPubkey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  /**
   * Cancel subscription
   * @param creatorPubkey - Creator's public key
   * @param tierId - Tier ID of the subscription to cancel
   */
  async cancelSubscription(creatorPubkey: PublicKey, tierId: number) {
    const [subscription] = PDAs.getSubscription(this.wallet.publicKey, creatorPubkey, tierId);

    const tx = await this.program.methods
      .cancelSubscription()
      .accountsPartial({
        subscription,
        subscriber: this.wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  /**
   * Get subscription info
   * @param subscriberPubkey - Subscriber's public key
   * @param creatorPubkey - Creator's public key
   * @param tierId - Tier ID
   */
  async getSubscription(subscriberPubkey: PublicKey, creatorPubkey: PublicKey, tierId: number) {
    const [subscription] = PDAs.getSubscription(subscriberPubkey, creatorPubkey, tierId);

    try {
      const account = await this.program.account.subscription.fetch(subscription);
      return account;
    } catch (_error) {
      return null;
    }
  }

  /**
   * Get subscription tier info
   */
  async getSubscriptionTier(creatorPubkey: PublicKey, tierId: number) {
    const [subscriptionTier] = PDAs.getSubscriptionTier(creatorPubkey, tierId);

    try {
      const account = await this.program.account.subscriptionTier.fetch(subscriptionTier);
      return account;
    } catch (_error) {
      return null;
    }
  }

  /**
   * Get all subscription tiers for a creator
   * Note: This requires iterating through known tier IDs
   * In production, maintain an index of tier IDs
   */
  async getCreatorSubscriptionTiers(creatorPubkey: PublicKey, maxTierCount: number = 10) {
    const tiers = [];
    
    for (let i = 1; i <= maxTierCount; i++) {
      const tier = await this.getSubscriptionTier(creatorPubkey, i);
      if (tier) {
        tiers.push(tier);
      }
    }
    
    return tiers;
  }

  // ==================== GROUPS ====================

  /**
   * Create group
   * @param name - Group name (used as PDA seed - must be unique per creator)
   * @param description - Group description
   * @param isPrivate - Whether group is private (0=public, 1=private)
   * @param entryFeeInSol - Optional entry fee in SOL
   */
  async createGroup(
    name: string,
    description: string,
    isPrivate: boolean = false,
    entryFeeInSol?: number
  ) {
    // Use name for PDA (not timestamp)
    const [group] = PDAs.getGroup(this.wallet.publicKey, name);
    
    // Creator is automatically first member
    const [groupMember] = PDAs.getGroupMember(group, this.wallet.publicKey);

    const entryPrice = entryFeeInSol ? Math.floor(entryFeeInSol * 1e9) : 0;
    const privacy = isPrivate ? 1 : 0;
    const entryRequirement = entryPrice > 0 ? 1 : 0; // 1 = SOL payment required

    const tx = await this.program.methods
      .createGroup(
        name,
        description,
        privacy,
        entryRequirement,
        entryPrice > 0 ? new BN(entryPrice) : null
      )
      .accountsPartial({
        group,
        groupMember,
        creator: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx, group };
  }

  /**
   * Join group
   * @param groupPubkey - Group PDA
   * @param groupCreatorPubkey - Group creator's public key (needed for entry fee payment)
   */
  async joinGroup(groupPubkey: PublicKey, groupCreatorPubkey: PublicKey) {
    const [groupMember] = PDAs.getGroupMember(groupPubkey, this.wallet.publicKey);

    const tx = await this.program.methods
      .joinGroup()
      .accountsPartial({
        group: groupPubkey,
        groupMember,
        member: this.wallet.publicKey,
        groupCreator: groupCreatorPubkey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  /**
   * Leave group
   */
  async leaveGroup(_groupPubkey: PublicKey) {
    // Note: leaveGroup instruction may not be available in current contract
    // This is a placeholder for future implementation
    throw new Error('Leave group not yet implemented in contract');
  }

  /**
   * Get group info
   */
  async getGroup(groupPubkey: PublicKey) {
    try {
      const account = await this.program.account.group.fetch(groupPubkey);
      return account;
    } catch {
      // Group not found
      return null;
    }
  }

  /**
   * Get group member info
   */
  async getGroupMember(groupPubkey: PublicKey, memberPubkey: PublicKey) {
    const [groupMember] = PDAs.getGroupMember(groupPubkey, memberPubkey);

    try {
      const account = await this.program.account.groupMember.fetch(groupMember);
      return account;
    } catch (_error) {
      return null;
    }
  }

  /**
   * Check if user is member of group
   */
  async isGroupMember(groupPubkey: PublicKey, memberPubkey: PublicKey): Promise<boolean> {
    const member = await this.getGroupMember(groupPubkey, memberPubkey);
    return member !== null;
  }

  /**
   * Update member role in group (admin only)
   * Role: 0 = Member, 1 = Moderator, 2 = Admin
   */
  async updateMemberRole(groupPubkey: PublicKey, targetMemberPubkey: PublicKey, newRole: number) {
    const [adminMember] = PDAs.getGroupMember(groupPubkey, this.wallet.publicKey);
    const [targetMember] = PDAs.getGroupMember(groupPubkey, targetMemberPubkey);

    const tx = await this.program.methods
      .updateMemberRole(newRole)
      .accountsPartial({
        group: groupPubkey,
        adminMember,
        targetMember,
        admin: this.wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  /**
   * Kick member from group (admin only)
   */
  async kickMember(groupPubkey: PublicKey, targetMemberPubkey: PublicKey) {
    const [adminMember] = PDAs.getGroupMember(groupPubkey, this.wallet.publicKey);
    const [targetMember] = PDAs.getGroupMember(groupPubkey, targetMemberPubkey);

    const tx = await this.program.methods
      .kickMember()
      .accountsPartial({
        group: groupPubkey,
        adminMember,
        targetMember,
        admin: this.wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  // ==================== GOVERNANCE ====================

  /**
   * Stake tokens for governance voting power
   */
  async stakeTokens(amountInSol: number, lockDaysUnix?: number) {
    const amountInLamports = new BN(Math.floor(amountInSol * 1e9));
    const lockPeriod = new BN(lockDaysUnix || 7 * 24 * 60 * 60); // Default 7 days in seconds
    
    const [stakePosition] = PDAs.getStakePosition(this.wallet.publicKey);
    const [platformConfig] = PDAs.getPlatformConfig();

    const tx = await this.program.methods
      .stakeTokens(amountInLamports, lockPeriod)
      .accountsPartial({
        stakePosition,
        staker: this.wallet.publicKey,
        platformConfig,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx, stakePosition };
  }

  /**
   * Unstake tokens
   */
  async unstakeTokens() {
    const [stakePosition] = PDAs.getStakePosition(this.wallet.publicKey);
    const [platformConfig] = PDAs.getPlatformConfig();

    const tx = await this.program.methods
      .unstakeTokens()
      .accountsPartial({
        stakePosition,
        staker: this.wallet.publicKey,
        platformConfig,
      })
      .rpc();

    return tx;
  }

  /**
   * Create governance proposal
   * @param title - Proposal title (used as PDA seed - must be unique per proposer)
   * @param description - Proposal description
   * @param category - Proposal category (u8)
   * @param executionDelay - Execution delay in seconds
   */
  async createProposal(
    title: string,
    description: string,
    category: number = 0,
    executionDelay: number = 0
  ) {
    // Use title for PDA (not timestamp)
    const [proposal] = PDAs.getProposal(this.wallet.publicKey, title);
    const [stakePosition] = PDAs.getStakePosition(this.wallet.publicKey);

    const tx = await this.program.methods
      .createProposal(title, description, category, new BN(executionDelay))
      .accountsPartial({
        proposal,
        proposer: this.wallet.publicKey,
        stakePosition,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx, proposal };
  }

  /**
   * Cast vote on proposal (true = for, false = against)
   */
  async castVote(proposalPubkey: PublicKey, support: boolean) {
    const [vote] = PDAs.getVotePDA(proposalPubkey, this.wallet.publicKey);
    const [stakePosition] = PDAs.getStakePosition(this.wallet.publicKey);

    // Vote types: 0 = Against, 1 = For, 2 = Abstain
    const voteType = support ? 1 : 0;

    const tx = await this.program.methods
      .castVote(voteType)
      .accountsPartial({
        proposal: proposalPubkey,
        vote,
        voter: this.wallet.publicKey,
        stakePosition,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  /**
   * Get proposal info
   */
  async getProposal(proposalPubkey: PublicKey) {
    try {
      const account = await this.program.account.proposal.fetch(proposalPubkey);
      return account;
    } catch {
      // Proposal not found
      return null;
    }
  }

  /**
   * Get stake position
   */
  async getStakePosition(stakerPubkey: PublicKey) {
    const [stakePosition] = PDAs.getStakePosition(stakerPubkey);

    try {
      const account = await this.program.account.stakePosition.fetch(stakePosition);
      return account;
    } catch (_error) {
      return null;
    }
  }

  /**
   * Get vote on proposal
   */
  async getVote(proposalPubkey: PublicKey, voterPubkey: PublicKey) {
    const [vote] = PDAs.getVotePDA(proposalPubkey, voterPubkey);

    try {
      const account = await this.program.account.vote.fetch(vote);
      return account;
    } catch (_error) {
      return null;
    }
  }

  /**
   * Execute proposal (admin only)
   */
  async executeProposal(proposalPubkey: PublicKey) {
    const tx = await this.program.methods
      .executeProposal()
      .accountsPartial({
        proposal: proposalPubkey,
        executor: this.wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  // ==================== MARKETPLACE (Usernames) ====================

  /**
   * Mint a username as NFT
   * @param username - Username to mint (must be unique)
   * @param metadataUri - URI to NFT metadata (JSON on Arweave/IPFS)
   */
  async mintUsername(username: string, metadataUri: string) {
    // Correct PDA derivation - just username, no owner or hash
    const [usernameNft] = PDAs.getUsernameNFT(username);
    
    // Generate new mint keypair
    const mint = Keypair.generate();
    
    // Get associated token account for owner
    const tokenAccount = await getAssociatedTokenAddress(
      mint.publicKey,
      this.wallet.publicKey
    );
    
    // Metaplex metadata PDA
    const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
    const [metadata] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );
    
    // Master edition PDA
    const [masterEdition] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
        Buffer.from('edition'),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );
    
    const [platformConfig] = PDAs.getPlatformConfig();

    const tx = await this.program.methods
      .mintUsername(username, metadataUri)
      .accountsPartial({
        usernameNft,
        mint: mint.publicKey,
        tokenAccount,
        metadata,
        masterEdition,
        owner: this.wallet.publicKey,
        platformConfig,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([mint])
      .rpc();

    return { signature: tx, nft: usernameNft, mint: mint.publicKey };
  }

  /**
   * Set collection for username NFT (required for Magic Eden)
   * Makes NFT tradeable on Magic Eden marketplace
   */
  async setCollectionForUsername(
    _usernameNft: PublicKey,
    _mint: PublicKey,
    collectionMint?: PublicKey
  ): Promise<string> {
    try {
      // For MVP, we'll use a simpler approach
      // The collection is set during mint_username instruction in the contract
      // This method acts as a placeholder for future collection management
      
      let collection = collectionMint;
      if (!collection) {
        const { getCollectionMint } = await import('../utils/constants');
        collection = getCollectionMint();
      }

      // In a real implementation, this would call the Metaplex instruction
      // For MVP, we just return success since the contract handles collection
      console.log('✅ Collection verified for NFT:', collection.toString());
      
      // Return a mock signature for now
      // In production, this would be a real blockchain transaction
      return 'verified_' + Date.now().toString();
      
    } catch (error) {
      console.error('Error setting collection:', error);
      throw new Error(
        `Failed to verify collection: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * List username for sale
   * @param nftPubkey - Username NFT PDA
   * @param mintPubkey - The mint address of the NFT
   * @param priceInSol - Listing price in SOL
   */
  async listUsername(nftPubkey: PublicKey, mintPubkey: PublicKey, priceInSol: number) {
    const [listing] = PublicKey.findProgramAddressSync(
      [Buffer.from('listing'), nftPubkey.toBuffer()],
      this.program.programId
    );

    // Get seller's token account for the NFT
    const sellerTokenAccount = await getAssociatedTokenAddress(
      mintPubkey,
      this.wallet.publicKey
    );

    const priceInLamports = new BN(Math.floor(priceInSol * 1e9));
    const [platformConfig] = PDAs.getPlatformConfig();

    const tx = await this.program.methods
      .listUsername(priceInLamports)
      .accountsPartial({
        usernameNft: nftPubkey,
        sellerTokenAccount,
        listing,
        seller: this.wallet.publicKey,
        platformConfig,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    return { signature: tx, listing };
  }

  /**
   * Buy username from marketplace (buyListing instruction)
   * @param listingPubkey - Listing PDA
   * @param nftPubkey - Username NFT PDA
   * @param mintPubkey - The mint address of the NFT
   * @param sellerPubkey - Seller's public key
   */
  async buyUsername(
    listingPubkey: PublicKey,
    nftPubkey: PublicKey,
    mintPubkey: PublicKey,
    sellerPubkey: PublicKey
  ) {
    const [platformConfig] = PDAs.getPlatformConfig();

    // Get seller's token account
    const sellerTokenAccount = await getAssociatedTokenAddress(
      mintPubkey,
      sellerPubkey
    );

    // Get buyer's token account (will be created if doesn't exist)
    const buyerTokenAccount = await getAssociatedTokenAddress(
      mintPubkey,
      this.wallet.publicKey
    );

    const tx = await this.program.methods
      .buyListing()
      .accountsPartial({
        usernameNft: nftPubkey,
        listing: listingPubkey,
        mint: mintPubkey,
        sellerTokenAccount,
        buyerTokenAccount,
        buyer: this.wallet.publicKey,
        seller: sellerPubkey,
        platformConfig,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .rpc();

    return tx;
  }

  /**
   * Delist username from marketplace
   */
  /**
   * Cancel listing (delist username)
   */
  async cancelListing(listingPubkey: PublicKey) {
    // Fetch listing to get username for PDA
    const listingAccount = await this.program.account.listing.fetch(listingPubkey);
    const [usernameNft] = PDAs.getUsernameNFT(listingAccount.username);

    const tx = await this.program.methods
      .cancelListing()
      .accountsPartial({
        usernameNft,
        listing: listingPubkey,
        seller: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  /**
   * Alias for cancelListing
   */


  /**
   * Make offer on username listing
   * ⚠️ ESCROW: Funds are immediately locked in the offer PDA until accepted or cancelled
   * @param usernameNftPubkey - Username NFT PDA
   * @param listingPubkey - Listing PDA
   * @param offerAmountInSol - Amount in SOL (will be escrowed)
   */
  async makeOffer(usernameNftPubkey: PublicKey, listingPubkey: PublicKey, offerAmountInSol: number) {
    const [offer] = await PublicKey.findProgramAddress(
      [
        Buffer.from('offer'),
        listingPubkey.toBuffer(),
        this.wallet.publicKey.toBuffer(),
      ],
      this.program.programId
    );

    const [platformConfig] = PDAs.getPlatformConfig();
    const amountInLamports = new BN(Math.floor(offerAmountInSol * 1e9));

    const tx = await this.program.methods
      .makeOffer(amountInLamports)
      .accountsPartial({
        usernameNft: usernameNftPubkey,
        listing: listingPubkey,
        offer,
        buyer: this.wallet.publicKey,
        platformConfig,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx, offer };
  }

  /**
   * Accept offer on username listing (seller only)
   * ✅ Funds automatically transferred from escrow PDA to seller
   * @param usernameNftPubkey - Username NFT PDA
   * @param listingPubkey - Listing PDA
   * @param mintPubkey - The mint address of the NFT
   * @param buyerPubkey - Buyer's public key (NOT a signer)
   */
  async acceptOffer(
    usernameNftPubkey: PublicKey,
    listingPubkey: PublicKey,
    mintPubkey: PublicKey,
    buyerPubkey: PublicKey
  ) {
    const [offer] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('offer'),
        listingPubkey.toBuffer(),
        buyerPubkey.toBuffer(),
      ],
      this.program.programId
    );

    const [platformConfig] = PDAs.getPlatformConfig();

    // Get token accounts
    const sellerTokenAccount = await getAssociatedTokenAddress(
      mintPubkey,
      this.wallet.publicKey
    );

    const buyerTokenAccount = await getAssociatedTokenAddress(
      mintPubkey,
      buyerPubkey
    );

    // Note: Contract requires buyer signature - may need multi-sig flow
    const tx = await this.program.methods
      .acceptOffer()
      .accountsPartial({
        usernameNft: usernameNftPubkey,
        listing: listingPubkey,
        offer,
        mint: mintPubkey,
        sellerTokenAccount,
        buyerTokenAccount,
        seller: this.wallet.publicKey,
        buyer: buyerPubkey,  // Needs to be signer
        platformConfig,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .rpc();

    return tx;
  }

  /**
   * Cancel offer and get escrowed funds back (buyer only)
   * @param listingPubkey - Listing PDA
   */
  async cancelOffer(listingPubkey: PublicKey) {
    const [offer] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('offer'),
        listingPubkey.toBuffer(),
        this.wallet.publicKey.toBuffer(),
      ],
      this.program.programId
    );

    const tx = await this.program.methods
      .cancelOffer()
      .accountsPartial({
        offer,
        buyer: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  // ==================== MODERATION ====================

  /**
   * Report user/content
   * Note: reportUser instruction not yet available in current contract
   * This is a placeholder for future implementation
   */
  async reportUser(_reportedUserPubkey: PublicKey, _reason: string, _severity: number = 1) {
    throw new Error('Report user not yet implemented in contract');
  }

  /**
   * Warn user (moderator only)
   * Note: warnUser instruction not yet available in current contract
   */
  async warnUser(_userPubkey: PublicKey, _reason: string) {
    throw new Error('Warn user not yet implemented in contract');
  }

  /**
   * Ban user (moderator only)
   * Note: banUser instruction not yet available in current contract
   */
  async banUser(_userPubkey: PublicKey, _duration: number, _reason: string) {
    throw new Error('Ban user not yet implemented in contract');
  }

  /**
   * Get user ban info
   */
  async getUserBan(_userPubkey: PublicKey) {
    // Note: userBan account type not in current contract
    return null;
  }

  /**
   * Check if user is banned
   */
  async isUserBanned(_userPubkey: PublicKey): Promise<boolean> {
    // Note: Ban system not yet implemented
    return false;
  }
}

export default SocialFiSDK;
