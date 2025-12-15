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
   * Get Creator Shares PDA
   */
  static getCreatorShares(creator: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('creator_pool'), creator.toBuffer()],
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
   */
  static getSubscription(
    subscriber: PublicKey,
    creator: PublicKey
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('subscription'),
        subscriber.toBuffer(),
        creator.toBuffer(),
      ],
      PROGRAM_ID
    );
  }

  /**
   * Get Group PDA
   */
  static getGroup(creator: PublicKey, groupId: number): [PublicKey, number] {
    const buffer = Buffer.alloc(8);
    buffer.writeUIntLE(groupId, 0, 8);
    const seeds = [
      Buffer.from('group'),
      creator.toBuffer(),
      buffer
    ];
    return PublicKey.findProgramAddressSync(seeds, PROGRAM_ID);
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
      [Buffer.from('username-listing'), usernameNft.toBuffer()],
      PROGRAM_ID
    );
  }

  /**
   * Get Username Offer PDA
   */
  static getUsernameOffer(
    usernameNft: PublicKey,
    buyer: PublicKey
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('username-offer'), usernameNft.toBuffer(), buyer.toBuffer()],
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
   */
  static getProposal(proposalId: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('proposal'), proposalId.toBuffer()],
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
}
