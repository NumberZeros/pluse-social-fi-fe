import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import type { Idl } from '@coral-xyz/anchor';
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { Buffer } from 'buffer';
import type { AnchorWallet } from '@solana/wallet-adapter-react';
import idlJson from '../idl/social_fi_contract.json';
import type { SocialFiContract } from '../idl/social_fi_contract';
import { PDAs } from './pda';
import { RPC_ENDPOINTS, NETWORK, DEFAULT_COMMITMENT } from '../utils/constants';

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
    
    // Create Program with proper IDL casting
    this.program = new Program(
      idlJson as Idl,
      this.provider
    ) as Program<SocialFiContract>;
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
    } catch (error) {
      console.log('Profile not found for:', targetOwner.toBase58());
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
   * Buy creator shares
   */
  async buyShares(creatorPubkey: PublicKey, amount: number, maxPricePerShare: number) {
    const [creatorPool] = PDAs.getCreatorShares(creatorPubkey);
    const [shareHolding] = await PublicKey.findProgramAddress(
      [Buffer.from('share_holding'), this.wallet.publicKey.toBuffer(), creatorPubkey.toBuffer()],
      this.program.programId
    );
    const [poolVault] = PDAs.getPoolVault(creatorPubkey);
    const [platformConfig] = PDAs.getPlatformConfig();

    const tx = await this.program.methods
      .buyShares(new BN(amount), new BN(maxPricePerShare))
      .accounts({
        creatorPool: creatorPool,
        shareHolding: shareHolding,
        poolVault: poolVault,
        buyer: this.wallet.publicKey,
        creator: creatorPubkey,
        platformConfig: platformConfig,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Sell creator shares
   */
  async sellShares(creatorPubkey: PublicKey, amount: number, minPricePerShare: number) {
    const [creatorPool] = PDAs.getCreatorShares(creatorPubkey);
    const [shareHolding] = await PublicKey.findProgramAddress(
      [Buffer.from('share_holding'), this.wallet.publicKey.toBuffer(), creatorPubkey.toBuffer()],
      this.program.programId
    );
    const [poolVault] = PDAs.getPoolVault(creatorPubkey);
    const [platformConfig] = PDAs.getPlatformConfig();

    const tx = await this.program.methods
      .sellShares(new BN(amount), new BN(minPricePerShare))
      .accounts({
        creatorPool: creatorPool,
        shareHolding: shareHolding,
        poolVault: poolVault,
        seller: this.wallet.publicKey,
        creator: creatorPubkey,
        platformConfig: platformConfig,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Get creator pool data
   */
  async getCreatorShares(creatorPubkey: PublicKey) {
    const [creatorPool] = PDAs.getCreatorShares(creatorPubkey);

    try {
      const account = await this.program.account.creatorPool.fetch(creatorPool);
      return account;
    } catch (error) {
      console.log('Creator pool not found for:', creatorPubkey.toBase58());
      return null;
    }
  }

  /**
   * Calculate current price for amount of shares
   */
  async calculateSharePrice(creatorPubkey: PublicKey, amount: number): Promise<number> {
    const shares = await this.getCreatorShares(creatorPubkey);
    if (!shares) return 0;

    const supply = shares.supply.toNumber();
    const basePrice = shares.basePrice.toNumber();

    // Simplified bonding curve: price = basePrice * (supply + amount)^2
    let totalCost = 0;
    for (let i = 0; i < amount; i++) {
      const currentSupply = supply + i;
      const price = (basePrice * currentSupply * currentSupply) / 1e9; // Normalize
      totalCost += price;
    }

    return totalCost;
  }

  // ==================== ADVANCED FEATURES ====================
  // TODO: Implement subscriptions, groups, governance when needed
  // These features require more complex setup and are not part of MVP

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
    } catch (error) {
      return null;
    }
  }

  // ==================== SUBSCRIPTIONS ====================

  /**
   * Create subscription tier for creator
   */
  async createSubscriptionTier(
    name: string,
    description: string,
    priceInSol: number,
    durationDays: number
  ) {
    const priceInLamports = Math.floor(priceInSol * 1e9);
    const tierId = Date.now();
    
    const [subscriptionTier] = await PublicKey.findProgramAddress(
      [
        Buffer.from('subscription_tier'),
        this.wallet.publicKey.toBuffer(),
        Buffer.from(tierId.toString()),
      ],
      this.program.programId
    );

    const tx = await this.program.methods
      .createSubscriptionTier(name, description, new BN(priceInLamports), new BN(durationDays))
      .accountsPartial({
        subscriptionTier,
        creator: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx, subscriptionTier };
  }

  /**
   * Subscribe to creator's tier
   */
  async subscribe(creatorPubkey: PublicKey, tierId?: number) {
    const [subscription] = PDAs.getSubscription(this.wallet.publicKey, creatorPubkey);
    
    // If no tier specified, attempt to fetch creator's subscription tiers
    // For now, construct a reasonable tier ID - in production, list and select
    const tierIdToUse = tierId || 1;
    const [subscriptionTier] = await PublicKey.findProgramAddress(
      [
        Buffer.from('subscription_tier'),
        creatorPubkey.toBuffer(),
        Buffer.from(tierIdToUse.toString()),
      ],
      this.program.programId
    );

    const tx = await this.program.methods
      .subscribe()
      .accounts({
        subscriptionTier,
        subscription,
        subscriber: this.wallet.publicKey,
        creator: creatorPubkey,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(creatorPubkey: PublicKey) {
    const [subscription] = PDAs.getSubscription(this.wallet.publicKey, creatorPubkey);

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
   */
  async getSubscription(subscriberPubkey: PublicKey, creatorPubkey: PublicKey) {
    const [subscription] = PDAs.getSubscription(subscriberPubkey, creatorPubkey);

    try {
      const account = await this.program.account.subscription.fetch(subscription);
      return account;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get subscription tier info
   */
  async getSubscriptionTier(creatorPubkey: PublicKey, tierId: number) {
    const [subscriptionTier] = await PublicKey.findProgramAddress(
      [
        Buffer.from('subscription_tier'),
        creatorPubkey.toBuffer(),
        Buffer.from(tierId.toString()),
      ],
      this.program.programId
    );

    try {
      const account = await this.program.account.subscriptionTier.fetch(subscriptionTier);
      return account;
    } catch (error) {
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
   */
  async createGroup(
    name: string,
    description: string,
    isPrivate: boolean = false,
    entryFeeInSol?: number
  ) {
    const groupId = Date.now();
    const [group] = await PublicKey.findProgramAddress(
      [
        Buffer.from('group'),
        this.wallet.publicKey.toBuffer(),
        Buffer.from(groupId.toString()),
      ],
      this.program.programId
    );

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
      .accounts({
        group,
        owner: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

    return { signature: tx, group };
  }

  /**
   * Join group
   */
  async joinGroup(groupPubkey: PublicKey) {
    const [groupMember] = PDAs.getGroupMember(groupPubkey, this.wallet.publicKey);

    const tx = await this.program.methods
      .joinGroup()
      .accounts({
        group: groupPubkey,
        groupMember,
        member: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
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
    } catch (error) {
      console.log('Group not found:', groupPubkey.toBase58());
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
    } catch (error) {
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

    const tx = await this.program.methods
      .unstakeTokens()
      .accountsPartial({
        stakePosition,
        staker: this.wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  /**
   * Create governance proposal
   */
  async createProposal(
    title: string,
    description: string,
    category: number = 0,
    executionDelay: number = 0
  ) {
    const timestamp = Date.now();
    const [proposal] = await PublicKey.findProgramAddress(
      [
        Buffer.from('proposal'),
        this.wallet.publicKey.toBuffer(),
        Buffer.from(timestamp.toString()),
      ],
      this.program.programId
    );

    const [stakePosition] = PDAs.getStakePosition(this.wallet.publicKey);

    const tx = await this.program.methods
      .createProposal(title, description, category, new BN(executionDelay))
      .accounts({
        proposal,
        proposer: this.wallet.publicKey,
        stakePosition,
        systemProgram: SystemProgram.programId,
      } as any)
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
      .accounts({
        proposal: proposalPubkey,
        vote,
        voter: this.wallet.publicKey,
        stakePosition,
        systemProgram: SystemProgram.programId,
      } as any)
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
    } catch (error) {
      console.log('Proposal not found:', proposalPubkey.toBase58());
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
    } catch (error) {
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
    } catch (error) {
      return null;
    }
  }

  /**
   * Execute proposal (admin only)
   */
  async executeProposal(proposalPubkey: PublicKey) {
    const tx = await this.program.methods
      .executeProposal()
      .accounts({
        proposal: proposalPubkey,
        executor: this.wallet.publicKey,
      } as any)
      .rpc();

    return tx;
  }

  // ==================== MARKETPLACE (Usernames) ====================

  /**
   * Mint a username as NFT
   */
  async mintUsername(username: string) {
    const usernameHash = Buffer.from(username).toString('hex');
    const [nft] = await PublicKey.findProgramAddress(
      [
        Buffer.from('username_nft'),
        this.wallet.publicKey.toBuffer(),
        Buffer.from(usernameHash),
      ],
      this.program.programId
    );

    const tx = await this.program.methods
      .mintUsername(username)
      .accounts({
        nft,
        owner: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

    return { signature: tx, nft };
  }

  /**
   * List username for sale
   */
  async listUsername(nftPubkey: PublicKey, priceInSol: number) {
    const [listing] = await PublicKey.findProgramAddress(
      [
        Buffer.from('marketplace_listing'),
        nftPubkey.toBuffer(),
      ],
      this.program.programId
    );

    const priceInLamports = new BN(Math.floor(priceInSol * 1e9));

    const tx = await this.program.methods
      .listUsername(priceInLamports)
      .accounts({
        listing,
        nft: nftPubkey,
        seller: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

    return { signature: tx, listing };
  }

  /**
   * Buy username from marketplace (buyListing instruction)
   */
  async buyUsername(listingPubkey: PublicKey, nftPubkey: PublicKey, sellerPubkey: PublicKey) {
    const [platformConfig] = PDAs.getPlatformConfig();
    const [feeCollector] = await PublicKey.findProgramAddress(
      [Buffer.from('fee_collector')],
      this.program.programId
    );

    const tx = await this.program.methods
      .buyListing()
      .accounts({
        listing: listingPubkey,
        usernameNft: nftPubkey,
        buyer: this.wallet.publicKey,
        seller: sellerPubkey,
        platformConfig,
        feeCollector,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Delist username from marketplace
   */
  async delistUsername(_listingPubkey: PublicKey) {
    // Note: delistUsername instruction may not be available in current contract
    // Use accept_offer rejection or similar instead
    throw new Error('Delist username not yet implemented in contract');
  }

  /**
   * Make offer on username (for marketplace negotiations)
   */
  async makeOffer(_listingPubkey: PublicKey, _offerAmountInSol: number) {
    // Note: This may not exist, add if contract supports it
    throw new Error('Make offer not yet implemented in contract');
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
