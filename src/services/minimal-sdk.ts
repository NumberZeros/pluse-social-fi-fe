import { Connection, PublicKey } from '@solana/web3.js';
import type { AnchorWallet } from '../lib/wallet-adapter';
import { RPC_ENDPOINTS, NETWORK, PROGRAM_ID } from '../utils/constants';

/**
 * Minimal SDK for testing connection
 * No Anchor Program dependency - just basic Solana calls
 */
export class MinimalSDK {
  connection: Connection;
  wallet: AnchorWallet;
  programId: PublicKey;

  constructor(wallet: AnchorWallet, connection?: Connection) {
    this.wallet = wallet;
    this.connection = connection || new Connection(RPC_ENDPOINTS[NETWORK], 'confirmed');
    this.programId = new PublicKey(PROGRAM_ID);
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
   * Get program ID
   */
  getProgramId(): PublicKey {
    return this.programId;
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.connection.getSlot();
      return true;
    } catch (error) {
      console.error('❌ Connection failed:', error);
      return false;
    }
  }

  /**
   * Check if program exists
   */
  async checkProgram(): Promise<boolean> {
    try {
      const accountInfo = await this.connection.getAccountInfo(this.programId);
      if (accountInfo) {
        console.log('✅ Program found:', this.programId.toBase58());
        console.log('   Owner:', accountInfo.owner.toBase58());
        console.log('   Executable:', accountInfo.executable);
        return true;
      } else {
        console.error('❌ Program not found at:', this.programId.toBase58());
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to check program:', error);
      return false;
    }
  }

  /**
   * Placeholder methods - not implemented yet
   */
  /* Unused - for reference only
  async createProfile(_username: string, _bio: string) {
    throw new Error('Use full SDK after connection is verified');
  }

  async getUserProfile(_owner?: PublicKey) {
    throw new Error('Use full SDK after connection is verified');
  }

  async sendTip(_recipientPubkey: PublicKey, _amount: number, _message: string) {
    throw new Error('Use full SDK after connection is verified');
  }
  */
}

export default MinimalSDK;
