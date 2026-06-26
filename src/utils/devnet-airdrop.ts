import type { Connection, PublicKey } from '@solana/web3.js';
import { LAMPORTS_PER_SOL, IS_DEVNET } from './constants';

const AIRDROP_AMOUNT = 1 * LAMPORTS_PER_SOL;

/**
 * Request a devnet airdrop. No-op on mainnet.
 */
export async function requestDevnetAirdrop(
  connection: Connection,
  publicKey: PublicKey,
): Promise<string> {
  if (!IS_DEVNET) {
    throw new Error('Airdrops are only available on devnet');
  }

  const signature = await connection.requestAirdrop(publicKey, AIRDROP_AMOUNT);
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight });
  return signature;
}
