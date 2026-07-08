import { PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';

const PROGRAM_ID = new PublicKey(
  process.env.PROGRAM_ID ||
    process.env.VITE_PROGRAM_ID ||
    'FHHfGX8mYxagDmhsXgJUfLnx1rw2M138e3beCwWELdgL',
);

export function getUserProfilePda(owner: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('user_profile'), owner.toBuffer()],
    PROGRAM_ID,
  );
}
