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
   * Subscribe to creator (using subscribe instruction from contract)
   * Note: Contract subscribe() takes no parameters, expects SubscriptionTier account
   */
  async subscribe(creatorPubkey: PublicKey) {
    const [subscription] = PDAs.getSubscription(this.wallet.publicKey, creatorPubkey);
    const [creatorProfile] = PDAs.getUserProfile(creatorPubkey);
    const [platformConfig] = PDAs.getPlatformConfig();

    // If no tier specified, need to find the default tier PDA
    // For now, we'll use the subscription instruction which expects tier to be included
    const tx = await this.program.methods
      .subscribe()
      .accounts({
        subscription: subscription,
        subscriber: this.wallet.publicKey,
        creator: creatorPubkey,
        creatorProfile: creatorProfile,
        platformConfig: platformConfig,
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
      .accounts({
        subscription: subscription,
        subscriber: this.wallet.publicKey,
      } as any)
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

  // ==================== GROUPS ====================

  /**
   * Create group
   * Contract signature: create_group(name, description, privacy, entry_requirement, entry_price)
   */
  async createGroup(name: string, description: string, entryFee: number) {
    // Derive group PDA - needs proper seed structure
    const [group] = await PublicKey.findProgramAddress(
      [Buffer.from('group'), this.wallet.publicKey.toBuffer(), Buffer.from(name)],
      this.program.programId
    );

    const tx = await this.program.methods
      .createGroup(
        name, 
        description, 
        0, // privacy: 0 = public
        0, // entry_requirement: 0 = none
        entryFee > 0 ? new BN(entryFee * 1e9) : null
      )
      .accounts({
        group: group,
        owner: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

    return tx;
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
        groupMember: groupMember,
        member: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Get group info
   */
  async getGroup(groupPubkey: PublicKey) {
    try {
      const account = await this.program.account.group.fetch(groupPubkey);
      return account;
    } catch (error) {
      return null;
    }
  }

  // ==================== GOVERNANCE ====================

  /**
   * Stake tokens for governance
   * Contract signature: stake_tokens(amount, lock_period)
   */
  async stakeTokens(amount: number, lockPeriod: number) {
    const [stakePosition] = PDAs.getStakePosition(this.wallet.publicKey);
    const [platformConfig] = PDAs.getPlatformConfig();

    const tx = await this.program.methods
      .stakeTokens(new BN(amount * 1e9), new BN(lockPeriod))
      .accounts({
        stakePosition: stakePosition,
        staker: this.wallet.publicKey,
        platformConfig: platformConfig,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Create governance proposal
   * Contract signature: create_proposal(title, description, category, execution_delay)
   */
  async createProposal(title: string, description: string, category: number, executionDelay: number = 0) {
    // Generate unique proposal PDA using proposer + timestamp
    const timestamp = Date.now();
    const [proposal] = await PublicKey.findProgramAddress(
      [Buffer.from('proposal'), this.wallet.publicKey.toBuffer(), Buffer.from(timestamp.toString())],
      this.program.programId
    );
    const [stakePosition] = PDAs.getStakePosition(this.wallet.publicKey);

    const tx = await this.program.methods
      .createProposal(title, description, category, new BN(executionDelay))
      .accounts({
        proposal: proposal,
        proposer: this.wallet.publicKey,
        stakePosition: stakePosition,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Cast vote on proposal
   * Contract signature: cast_vote(vote_type: u8) where 0=Against, 1=For, 2=Abstain
   */
  async castVote(proposalPubkey: PublicKey, support: boolean) {
    const [vote] = PDAs.getVotePDA(proposalPubkey, this.wallet.publicKey);
    const [stakePosition] = PDAs.getStakePosition(this.wallet.publicKey);

    // Convert boolean to vote_type: true=1 (For), false=0 (Against)
    const voteType = support ? 1 : 0;

    const tx = await this.program.methods
      .castVote(voteType)
      .accounts({
        proposal: proposalPubkey,
        vote: vote,
        voter: this.wallet.publicKey,
        stakePosition: stakePosition,
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
      console.error('Failed to fetch stake position:', error);
      return null;
    }
  }

  /**
   * Get vote info
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
}

export default SocialFiSDK;
