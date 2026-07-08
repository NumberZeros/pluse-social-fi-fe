import bs58 from 'bs58';
import { createHash } from 'node:crypto';

const RPC_URL =
  process.env.SOLANA_RPC_URL ||
  process.env.VITE_SOLANA_RPC_URL ||
  'https://api.devnet.solana.com';

const PROGRAM_ID =
  process.env.PROGRAM_ID ||
  process.env.VITE_PROGRAM_ID ||
  'FHHfGX8mYxagDmhsXgJUfLnx1rw2M138e3beCwWELdgL';

const POST_DISCRIMINATOR = Uint8Array.from([8, 147, 90, 186, 185, 56, 192, 150]);
const USER_PROFILE_DISCRIMINATOR = Uint8Array.from([32, 37, 119, 205, 179, 180, 13, 194]);

export interface RpcPost {
  publicKey: string;
  author: string;
  uri: string;
  createdAt: number;
}

export interface RpcProfile {
  username: string;
}

function decodePubkey(bytes: Uint8Array, offset: number): string {
  return bs58.encode(bytes.slice(offset, offset + 32));
}

function decodeString(bytes: Uint8Array, offset: number): { value: string; next: number } {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const len = view.getUint32(offset, true);
  const start = offset + 4;
  const value = new TextDecoder().decode(bytes.slice(start, start + len));
  return { value, next: start + len };
}

function decodeI64(bytes: Uint8Array, offset: number): number {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return Number(view.getBigInt64(offset, true));
}

function hasDiscriminator(bytes: Uint8Array, discriminator: Uint8Array): boolean {
  if (bytes.length < discriminator.length) return false;
  return discriminator.every((byte, index) => bytes[index] === byte);
}

function isOffCurve(pubkey: Uint8Array): boolean {
  // PDAs must be off the ed25519 curve; high bit of last byte is set for valid off-curve points.
  return (pubkey[31] & 0x80) !== 0;
}

function findPda(seeds: Uint8Array[]): string {
  const programId = bs58.decode(PROGRAM_ID);
  for (let bump = 255; bump >= 0; bump--) {
    const hash = createHash('sha256');
    for (const seed of seeds) hash.update(seed);
    hash.update(Uint8Array.of(bump));
    hash.update(programId);
    hash.update(Buffer.from('ProgramDerivedAddress'));
    const candidate = new Uint8Array(hash.digest());
    if (isOffCurve(candidate)) {
      return bs58.encode(candidate);
    }
  }
  throw new Error('Unable to find PDA');
}

async function getAccountData(pubkey: string): Promise<Uint8Array | null> {
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getAccountInfo',
      params: [pubkey, { encoding: 'base64' }],
    }),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) return null;
  const json = (await res.json()) as {
    result?: { value?: { data?: [string, string] } | null };
  };
  const b64 = json.result?.value?.data?.[0];
  if (!b64) return null;
  return new Uint8Array(Buffer.from(b64, 'base64'));
}

export function isValidPubkey(value: string): boolean {
  try {
    const decoded = bs58.decode(value);
    return decoded.length === 32;
  } catch {
    return false;
  }
}

export async function fetchPost(postId: string): Promise<RpcPost | null> {
  if (!isValidPubkey(postId)) return null;

  const data = await getAccountData(postId);
  if (!data || !hasDiscriminator(data, POST_DISCRIMINATOR)) return null;

  let offset = 8;
  const author = decodePubkey(data, offset);
  offset += 32;
  const uri = decodeString(data, offset);
  offset = uri.next;
  const nonce = decodeString(data, offset);
  offset = nonce.next;
  const hasMint = data[offset] === 1;
  offset += 1;
  if (hasMint) offset += 32;
  const createdAt = decodeI64(data, offset);

  return {
    publicKey: postId,
    author,
    uri: uri.value,
    createdAt,
  };
}

export async function fetchProfile(owner: string): Promise<RpcProfile | null> {
  try {
    if (!isValidPubkey(owner)) return null;

    const ownerBytes = bs58.decode(owner);
    const profilePda = findPda([Buffer.from('user_profile'), ownerBytes]);
    const data = await getAccountData(profilePda);
    if (!data || !hasDiscriminator(data, USER_PROFILE_DISCRIMINATOR)) return null;

    let offset = 8 + 32; // discriminator + owner pubkey
    const username = decodeString(data, offset);
    return { username: username.value };
  } catch {
    return null;
  }
}
