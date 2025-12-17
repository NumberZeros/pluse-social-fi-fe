import { PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { PROGRAM_ID } from '../utils/constants';

/**
 * Program Derived Addresses (PDA) helper class
 * All PDAs for the Social-Fi contract
 */
export class PDAs {
  /**
   * Get Platform Config PDA (singleton)
   */
  static getPlatformConfig(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('platform_config')],
      PROGRAM_ID
    );
  }

  /**
   * Get User Profile PDA
   */
  static getUserProfile(owner: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('user_profile'), owner.toBuffer()],
      PROGRAM_ID
    );
  }

  /**
   * Get Creator Pool PDA (formerly getCreatorShares)
   */
  static getCreatorPool(creator: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('creator_pool'), creator.toBuffer()],
      PROGRAM_ID
    );
  }

  /**
   * Get Share Holding PDA
   * @param holder - Share holder's public key
   * @param creator - Creator's public key
   */
  static getShareHolding(holder: PublicKey, creator: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('share_holding'),
        holder.toBuffer(),
        creator.toBuffer()
      ],
      PROGRAM_ID
    );
  }

  /**
   * Get Subscription Tier PDA
   * @param creator - Creator's public key
   * @param tierId - Tier ID (u64)
   */
  static getSubscriptionTier(creator: PublicKey, tierId: number): [PublicKey, number] {
    const tierIdBuffer = Buffer.alloc(8);
    // @ts-ignore
    tierIdBuffer.writeBigUInt64LE(BigInt(tierId), 0);
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('subscription_tier'),
        creator.toBuffer(),
        tierIdBuffer
      ],
      PROGRAM_ID
    );
  }

  /**
   * Get Pool Vault PDA (holds liquidity for shares)
   */
  static getPoolVault(creator: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('pool_vault'), creator.toBuffer()],
      PROGRAM_ID
    );
  }

  /**
   * Get Subscription PDA
   * @param subscriber - Subscriber's public key
   * @param creator - Creator's public key
   * @param tierId - Subscription tier ID (u64)
   */
  static getSubscription(
    subscriber: PublicKey,
    creator: PublicKey,
    tierId: number
  ): [PublicKey, number] {
    const tierIdBuffer = Buffer.alloc(8);
    // @ts-ignore
    tierIdBuffer.writeBigUInt64LE(BigInt(tierId), 0);
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('subscription'),
        subscriber.toBuffer(),
        creator.toBuffer(),
        tierIdBuffer
      ],
      PROGRAM_ID
    );
  }

  /**
   * Get Group PDA
   * @param creator - Group creator's public key
   * @param groupName - Group name (string used as seed)
   */
  static getGroup(creator: PublicKey, groupName: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('group'),
        creator.toBuffer(),
        Buffer.from(groupName)
      ],
      PROGRAM_ID
    );
  }

  /**
   * Get Group Member PDA
   */
  static getGroupMember(
    group: PublicKey,
    member: PublicKey
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('group_member'), group.toBuffer(), member.toBuffer()],
      PROGRAM_ID
    );
  }

  /**
   * Get Governance Stake PDA
   */
  static getGovernanceStake(staker: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('stake_position'), staker.toBuffer()],
      PROGRAM_ID
    );
  }

  /**
   * Get Proposal PDA (using proposer + timestamp seed)
   */
  static getProposalByNumber(proposalId: number): [PublicKey, number] {
    const buffer = Buffer.alloc(8);
    buffer.writeUIntLE(proposalId, 0, 8);
    const seeds = [Buffer.from('proposal'), buffer];
    return PublicKey.findProgramAddressSync(seeds, PROGRAM_ID);
  }

  /**
   * Get Vote PDA
   */
  static getVote(proposal: PublicKey, voter: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('vote'), proposal.toBuffer(), voter.toBuffer()],
      PROGRAM_ID
    );
  }

  /**
   * Get Username NFT PDA
   */
  static getUsernameNFT(username: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('username_nft'), Buffer.from(username)],
      PROGRAM_ID
    );
  }

  /**
   * Get Username Listing PDA
   */
  static getUsernameListing(usernameNft: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('listing'), usernameNft.toBuffer()],
      PROGRAM_ID
    );
  }

  /**
   * Get Username Offer PDA
   * @param listing - The listing PDA (not the NFT)
   * @param buyer - The buyer's public key
   */
  static getUsernameOffer(
    listing: PublicKey,
    buyer: PublicKey
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('offer'), listing.toBuffer(), buyer.toBuffer()],
      PROGRAM_ID
    );
  }

  /**
   * Get Stake Position PDA
   */
  static getStakePosition(staker: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('stake_position'), staker.toBuffer()],
      PROGRAM_ID
    );
  }

  /**
   * Get Proposal PDA
   * @param proposer - Proposer's public key
   * @param title - Proposal title (used as seed)
   */
  static getProposal(proposer: PublicKey, title: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('proposal'),
        proposer.toBuffer(),
        Buffer.from(title)
      ],
      PROGRAM_ID
    );
  }

  /**
   * Get Vote PDA
   */
  static getVotePDA(proposal: PublicKey, voter: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('vote'), proposal.toBuffer(), voter.toBuffer()],
      PROGRAM_ID
    );
  }

  /**
   * Get Post PDA
   */
  static getPost(author: PublicKey, uri: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('post'),
        author.toBuffer(),
        Buffer.from(uri)
      ],
      PROGRAM_ID
    );
  }
}
