import { Program, AnchorProvider } from '@coral-xyz/anchor';
import type { Idl } from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import idlJson from '../../src/idl/social_fi_contract.json' with { type: 'json' };
import { getUserProfilePda } from './pda.js';

const RPC_URL =
  process.env.SOLANA_RPC_URL ||
  process.env.VITE_SOLANA_RPC_URL ||
  'https://api.devnet.solana.com';

const PROGRAM_ID =
  process.env.PROGRAM_ID ||
  process.env.VITE_PROGRAM_ID ||
  'FHHfGX8mYxagDmhsXgJUfLnx1rw2M138e3beCwWELdgL';

let connection: Connection | null = null;
let program: Program | null = null;

function getConnection(): Connection {
  if (!connection) {
    connection = new Connection(RPC_URL, 'confirmed');
  }
  return connection;
}

function getProgram(): Program {
  if (!program) {
    const conn = getConnection();
    const dummyKeypair = Keypair.generate();
    const wallet = {
      publicKey: dummyKeypair.publicKey,
      signTransaction: async <T>(tx: T): Promise<T> => tx,
      signAllTransactions: async <T>(txs: T[]): Promise<T[]> => txs,
    };
    const provider = new AnchorProvider(conn, wallet, { commitment: 'confirmed' });
    program = new Program(idlJson as Idl, provider);
  }
  return program;
}

export interface OnChainPost {
  publicKey: string;
  author: string;
  uri: string;
  createdAt: number;
}

export interface OnChainProfile {
  username: string;
  postsCount: number;
  createdAt: number;
}

export async function fetchPost(postId: string): Promise<OnChainPost | null> {
  try {
    const prog = getProgram();
    const pubkey = new PublicKey(postId);
    const post = await prog.account.post.fetch(pubkey);
    return {
      publicKey: postId,
      author: post.author.toBase58(),
      uri: post.uri,
      createdAt: post.createdAt.toNumber(),
    };
  } catch {
    return null;
  }
}

export async function fetchProfile(owner: PublicKey): Promise<OnChainProfile | null> {
  try {
    const prog = getProgram();
    const [userProfile] = getUserProfilePda(owner);
    const account = await prog.account.userProfile.fetch(userProfile);
    return {
      username: account.username,
      postsCount: account.postsCount.toNumber(),
      createdAt: account.createdAt.toNumber(),
    };
  } catch {
    return null;
  }
}

export async function resolveUsername(username: string): Promise<PublicKey | null> {
  const normalized = username.replace(/^@/, '').toLowerCase();
  try {
    new PublicKey(username);
    return new PublicKey(username);
  } catch {
    // not a pubkey
  }

  try {
    const prog = getProgram();
    const accounts = await prog.account.usernameNft.all();
    const match = accounts.find((a) => a.account.username.toLowerCase() === normalized);
    return match ? match.account.owner : null;
  } catch {
    return null;
  }
}

export async function fetchAllPostIds(limit = 5000): Promise<string[]> {
  try {
    const prog = getProgram();
    const conn = getConnection();
    const allAccounts = await conn.getProgramAccounts(new PublicKey(PROGRAM_ID));
    const ids: string[] = [];

    for (const p of allAccounts) {
      if (ids.length >= limit) break;
      try {
        prog.account.post.coder.accounts.decode('post', p.account.data);
        ids.push(p.pubkey.toBase58());
      } catch {
        // not a post account
      }
    }
    return ids;
  } catch {
    return [];
  }
}

export async function fetchAllProfileUsernames(limit = 5000): Promise<string[]> {
  try {
    const prog = getProgram();
    const accounts = await prog.account.userProfile.all();
    return accounts.slice(0, limit).map((a) => a.account.username);
  } catch {
    return [];
  }
}
