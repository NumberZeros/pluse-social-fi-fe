import { Program, AnchorProvider, BN, setProvider } from '@coral-xyz/anchor';
import type { Idl } from '@coral-xyz/anchor';
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { Buffer } from 'buffer';
import bs58 from 'bs58';
import type { AnchorWallet } from '@solana/wallet-adapter-react';
import idlJson from '../idl/social_fi_contract.json';
import type { SocialFiContract } from '../idl/social_fi_contract';
import { PDAs } from './pda';
import { getRpcEndpoint, DEFAULT_COMMITMENT } from '../utils/constants';

/**
 * Social-Fi SDK
 * Wrapper around Anchor program for easy interaction with smart contract
 */
export class SocialFiSDK {
  program: Program<SocialFiContract>;
  connection: Connection;
  provider: AnchorProvider;
  wallet: AnchorWallet;

  private memcmpDiscriminator(
    accountName: 'follow' | 'like' | 'comment' | 'repost',
  ): { memcmp: { offset: number; bytes: string } } {
    const idlName = accountName.charAt(0).toUpperCase() + accountName.slice(1);
    const account = (
      idlJson as { accounts: { name: string; discriminator: number[] }[] }
    ).accounts.find((a) => a.name === idlName);
    if (!account) {
      throw new Error(`Unknown account discriminator: ${accountName}`);
    }
    return {
      memcmp: {
        offset: 0,
        bytes: bs58.encode(Buffer.from(account.discriminator)),
      },
    };
  }

  constructor(
    wallet: AnchorWallet,
    connection?: Connection,
    options?: { registerGlobalProvider?: boolean },
  ) {
    this.wallet = wallet;
    this.connection = connection || new Connection(getRpcEndpoint(), DEFAULT_COMMITMENT);
    this.provider = new AnchorProvider(this.connection, wallet, {
      commitment: DEFAULT_COMMITMENT,
    });

    if (options?.registerGlobalProvider !== false) {
      setProvider(this.provider);
    }
    
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
   * Get a holder's Supporter Share balance for a specific creator.
   */
  async getShareHolding(holderPubkey: PublicKey, creatorPubkey: PublicKey) {
    const [shareHolding] = PDAs.getShareHolding(holderPubkey, creatorPubkey);

    try {
      const account = await this.program.account.shareHolding.fetch(shareHolding);
      return {
        publicKey: shareHolding.toBase58(),
        holder: account.holder.toBase58(),
        creator: account.creator.toBase58(),
        amount: account.amount.toNumber(),
        averagePrice: account.averagePrice.toNumber(),
        createdAt: account.createdAt.toNumber(),
      };
    } catch (error) {
      if (isAccountNotFoundError(error)) {
        return {
          publicKey: shareHolding.toBase58(),
          holder: holderPubkey.toBase58(),
          creator: creatorPubkey.toBase58(),
          amount: 0,
          averagePrice: 0,
          createdAt: 0,
        };
      }
      throw error;
    }
  }

  /**
   * List all supporters (share holders) for a creator.
   */
  async getCreatorShareHolders(creatorPubkey: PublicKey) {
    try {
      const holdings = await this.program.account.shareHolding.all();
      return holdings
        .filter(
          (h) =>
            h.account.creator.equals(creatorPubkey) && h.account.amount.toNumber() > 0,
        )
        .map((h) => ({
          publicKey: h.publicKey.toBase58(),
          holder: h.account.holder.toBase58(),
          creator: h.account.creator.toBase58(),
          amount: h.account.amount.toNumber(),
          averagePrice: h.account.averagePrice.toNumber(),
          createdAt: h.account.createdAt.toNumber(),
        }));
    } catch (error) {
      console.error('Error fetching creator share holders:', error);
      return [];
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
  async isFollowing(followingPubkey: PublicKey, followerPubkey?: PublicKey): Promise<boolean> {
    const follower = followerPubkey ?? this.wallet.publicKey;
    const [follow] = PDAs.getFollow(follower, followingPubkey);
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
  async hasLikedPost(postPubkey: PublicKey, userPubkey?: PublicKey): Promise<boolean> {
    const user = userPubkey ?? this.wallet.publicKey;
    const [like] = PDAs.getLike(user, postPubkey);
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
        } catch (_e) {
          console.debug('Skipping non-Post account:', p.pubkey.toBase58());
          // Not a Post account (could be UserProfile, Follow, Like, etc.), skip silently
        }
      }

      console.log(`✅ Successfully decoded ${postData.length} posts`);
      return postData;
    } catch (error) {
      console.error('⚠️ Error fetching posts from blockchain:', error);
      throw error;
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
          this.memcmpDiscriminator('follow'),
          {
            memcmp: {
              offset: 8 + 32,
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
        } catch (_e) {
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
          this.memcmpDiscriminator('follow'),
          {
            memcmp: {
              offset: 8,
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
        } catch (_e) {
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
          this.memcmpDiscriminator('like'),
          {
            memcmp: {
              offset: 8 + 32,
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
        } catch (_e) {
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
          this.memcmpDiscriminator('comment'),
          {
            memcmp: {
              offset: 8 + 32,
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
        } catch (_e) {
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

  async getCommentsByAuthor(authorPubkey: PublicKey) {
    try {
      const comments = await this.program.account.comment.all();
      return comments
        .filter((c) => c.account.author.equals(authorPubkey))
        .map((c) => ({
          publicKey: c.publicKey.toBase58(),
          author: c.account.author.toBase58(),
          post: c.account.post.toBase58(),
          content: c.account.content,
          createdAt: c.account.createdAt.toNumber(),
        }));
    } catch (error) {
      console.error('Error fetching author comments:', error);
      return [];
    }
  }

  /**
   * Build engagement counts for all posts in a single batch (3 RPC calls).
   */
  async buildEngagementIndex(userPubkey?: PublicKey) {
    const [likes, comments, reposts] = await Promise.all([
      this.program.account.like.all(),
      this.program.account.comment.all(),
      this.program.account.repost.all(),
    ]);

    const index = new Map<
      string,
      { likes: number; comments: number; reposts: number; isLiked: boolean }
    >();

    const ensure = (postId: string) => {
      const existing = index.get(postId);
      if (existing) return existing;
      const entry = { likes: 0, comments: 0, reposts: 0, isLiked: false };
      index.set(postId, entry);
      return entry;
    };

    for (const like of likes) {
      const postId = like.account.post.toBase58();
      const entry = ensure(postId);
      entry.likes += 1;
      if (userPubkey && like.account.user.equals(userPubkey)) {
        entry.isLiked = true;
      }
    }

    for (const comment of comments) {
      const postId = comment.account.post.toBase58();
      ensure(postId).comments += 1;
    }

    for (const repost of reposts) {
      const postId = repost.account.originalPost.toBase58();
      ensure(postId).reposts += 1;
    }

    return index;
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
          this.memcmpDiscriminator('repost'),
          {
            memcmp: {
              offset: 8 + 32,
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
        } catch (_e) {
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

  // ==================== INDEXERS ====================

  async resolveUsernameToPubkey(username: string): Promise<PublicKey | null> {
    const normalized = username.replace(/^@/, '').toLowerCase();
    try {
      const accounts = await this.program.account.userProfile.all();
      const match = accounts.find(
        (a) => a.account.username.toLowerCase() === normalized,
      );
      return match ? match.account.owner : null;
    } catch (error) {
      console.error('Error resolving username:', error);
      throw error;
    }
  }

  async getAllCreatorPools() {
    try {
      const pools = await this.program.account.creatorPool.all();
      return pools.map((p) => ({
        publicKey: p.publicKey.toBase58(),
        creator: p.account.creator.toBase58(),
        supply: p.account.supply.toNumber(),
        holdersCount: p.account.holdersCount.toNumber(),
        basePrice: p.account.basePrice.toNumber(),
        totalVolume: p.account.totalVolume.toNumber(),
        createdAt: p.account.createdAt.toNumber(),
      }));
    } catch (error) {
      console.error('Error fetching creator pools:', error);
      return [];
    }
  }

  async getUserShareHoldings(holderPubkey: PublicKey) {
    try {
      const holdings = await this.program.account.shareHolding.all();
      return holdings
        .filter((h) => h.account.holder.equals(holderPubkey))
        .map((h) => ({
          publicKey: h.publicKey.toBase58(),
          holder: h.account.holder.toBase58(),
          creator: h.account.creator.toBase58(),
          amount: h.account.amount.toNumber(),
          averagePrice: h.account.averagePrice.toNumber(),
          createdAt: h.account.createdAt.toNumber(),
        }));
    } catch (error) {
      console.error('Error fetching share holdings:', error);
      return [];
    }
  }
}

function isAccountNotFoundError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('Account does not exist') ||
    message.includes('could not find account') ||
    message.includes('AccountNotFound')
  );
}

export default SocialFiSDK;
