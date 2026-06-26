import { PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { PROGRAM_ID } from '../utils/constants';

/**
 * Program Derived Addresses (PDA) helper class
 * MVP PDAs for the Social-Fi contract
 */
export class PDAs {
  static getPlatformConfig(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('platform_config')],
      PROGRAM_ID
    );
  }

  static getUserProfile(owner: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('user_profile'), owner.toBuffer()],
      PROGRAM_ID
    );
  }

  static getCreatorPool(creator: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('creator_pool'), creator.toBuffer()],
      PROGRAM_ID
    );
  }

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

  static getPoolVault(creator: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('pool_vault'), creator.toBuffer()],
      PROGRAM_ID
    );
  }

  static getPost(author: PublicKey, nonce: string | number): [PublicKey, number] {
    const nonceStr = typeof nonce === 'number' ? nonce.toString() : nonce;

    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('post'),
        author.toBuffer(),
        Buffer.from(nonceStr)
      ],
      PROGRAM_ID
    );
  }

  static getFollow(follower: PublicKey, following: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('follow'),
        follower.toBuffer(),
        following.toBuffer()
      ],
      PROGRAM_ID
    );
  }

  static getLike(user: PublicKey, post: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('like'),
        user.toBuffer(),
        post.toBuffer()
      ],
      PROGRAM_ID
    );
  }

  static getRepost(user: PublicKey, originalPost: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('repost'),
        user.toBuffer(),
        originalPost.toBuffer()
      ],
      PROGRAM_ID
    );
  }

  static getComment(post: PublicKey, author: PublicKey, nonce: number): [PublicKey, number] {
    const nonceBuffer = Buffer.alloc(8);
    nonceBuffer.writeBigUInt64LE(BigInt(nonce) as any, 0);
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('comment'),
        post.toBuffer(),
        author.toBuffer(),
        nonceBuffer
      ],
      PROGRAM_ID
    );
  }
}
