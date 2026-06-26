/**
 * Devnet smoke test: Supporter Shares MVP flow
 *
 * profile → pool → post (supporters metadata) → fan buys shares → verify holding
 *
 * Run: pnpm smoke:devnet
 * Check only (no txs): pnpm smoke:check
 */
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  type Transaction,
  type VersionedTransaction,
} from '@solana/web3.js';
import bs58 from 'bs58';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type { SocialFiContract } from '../src/idl/social_fi_contract';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PROGRAM_ID = new PublicKey(
  process.env.VITE_PROGRAM_ID ?? 'FHHfGX8mYxagDmhsXgJUfLnx1rw2M138e3beCwWELdgL',
);
const RPC_URL =
  process.env.VITE_SOLANA_RPC_URL ?? 'https://api.devnet.solana.com';

function pda(seeds: (Buffer | Uint8Array)[], programId = PROGRAM_ID): PublicKey {
  return PublicKey.findProgramAddressSync(seeds, programId)[0];
}

function makeWallet(keypair: Keypair): anchor.Wallet {
  return {
    publicKey: keypair.publicKey,
    signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T) => {
      if ('partialSign' in tx) {
        tx.partialSign(keypair);
      }
      return tx;
    },
    signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]) => {
      txs.forEach((tx) => {
        if ('partialSign' in tx) {
          tx.partialSign(keypair);
        }
      });
      return txs;
    },
  };
}

async function loadOrGenerateKeypair(envKey: string): Promise<Keypair> {
  const secret = process.env[envKey];
  if (secret) {
    const decoded = bs58.decode(secret);
    return Keypair.fromSecretKey(decoded);
  }
  return Keypair.generate();
}

async function ensureFunded(connection: Connection, pubkey: PublicKey, label: string) {
  const balance = await connection.getBalance(pubkey);
  const minLamports = 0.5 * LAMPORTS_PER_SOL;
  if (balance >= minLamports) {
    console.log(`  ${label}: ${(balance / LAMPORTS_PER_SOL).toFixed(3)} SOL (existing)`);
    return;
  }
  if (process.env.SMOKE_SKIP_AIRDROP === '1') {
    fail(
      `${label} needs ≥0.5 SOL. Fund the wallet or unset SMOKE_SKIP_AIRDROP and retry when the faucet is available.`,
    );
  }
  console.log(`  ${label}: funding via devnet airdrop...`);
  await airdrop(connection, pubkey);
}

async function airdrop(connection: Connection, pubkey: PublicKey, sol = 1) {
  const lamports = sol * LAMPORTS_PER_SOL;
  let lastError: unknown;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const sig = await connection.requestAirdrop(pubkey, lamports);
      const latest = await connection.getLatestBlockhash();
      await connection.confirmTransaction({ signature: sig, ...latest }, 'confirmed');
      return;
    } catch (error) {
      lastError = error;
      console.warn(`  airdrop attempt ${attempt}/5 failed, retrying...`);
      await new Promise((r) => setTimeout(r, attempt * 2000));
    }
  }
  throw lastError;
}

function logStep(step: string, detail?: string) {
  console.log(`\n✓ ${step}${detail ? ` — ${detail}` : ''}`);
}

function fail(message: string): never {
  console.error(`\n✗ SMOKE TEST FAILED: ${message}`);
  process.exit(1);
}

async function main() {
  const checkOnly = process.argv.includes('--check-only');

  console.log('Pulse Social — Supporter Shares devnet smoke test');
  console.log(`RPC: ${RPC_URL}`);
  console.log(`Program: ${PROGRAM_ID.toBase58()}`);

  const connection = new Connection(RPC_URL, 'confirmed');
  const idlPath = join(__dirname, '../src/idl/social_fi_contract.json');
  const idl = JSON.parse(readFileSync(idlPath, 'utf8'));
  idl.address = PROGRAM_ID.toBase58();

  const creatorProvider = new anchor.AnchorProvider(
    connection,
    makeWallet(Keypair.generate()),
    { commitment: 'confirmed' },
  );
  const readProgram = new Program(idl, creatorProvider) as Program<SocialFiContract>;

  const platformConfig = pda([Buffer.from('platform_config')]);
  try {
    const cfg = await readProgram.account.platformConfig.fetch(platformConfig);
    if (cfg.paused) {
      fail('Platform is paused on devnet — unpause before smoke test');
    }
    logStep('Platform config found', `paused=${cfg.paused}`);
  } catch {
    fail('Platform config not initialized on devnet');
  }

  if (checkOnly) {
    console.log('\n════════════════════════════════════════');
    console.log('CHECK PASSED — program reachable on devnet');
    console.log('════════════════════════════════════════');
    console.log('Run full flow: pnpm smoke:devnet');
    return;
  }

  const creator = await loadOrGenerateKeypair('SMOKE_CREATOR_SECRET');
  const fan = await loadOrGenerateKeypair('SMOKE_FAN_SECRET');

  logStep('Fund creator & fan wallets');
  await ensureFunded(connection, creator.publicKey, 'Creator');
  await ensureFunded(connection, fan.publicKey, 'Fan');

  const creatorProgram = new Program(
    idl,
    new anchor.AnchorProvider(connection, makeWallet(creator), { commitment: 'confirmed' }),
  ) as Program<SocialFiContract>;
  const fanProgram = new Program(
    idl,
    new anchor.AnchorProvider(connection, makeWallet(fan), { commitment: 'confirmed' }),
  ) as Program<SocialFiContract>;

  const username = `smoke_${Date.now().toString(36)}`;
  const creatorProfile = pda([Buffer.from('user_profile'), creator.publicKey.toBuffer()]);

  logStep('Creator: initialize profile', `@${username}`);
  await creatorProgram.methods
    .initializeUser(username)
    .accounts({
      user: creator.publicKey,
      userProfile: creatorProfile,
      systemProgram: SystemProgram.programId,
    })
    .signers([creator])
    .rpc();

  const creatorPool = pda([Buffer.from('creator_pool'), creator.publicKey.toBuffer()]);

  logStep('Creator: launch Supporter Shares pool');
  await creatorProgram.methods
    .initializeCreatorPool()
    .accounts({
      creatorPool,
      creator: creator.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([creator])
    .rpc();

  const nonce = Date.now().toString();
  const postPda = pda([
    Buffer.from('post'),
    creator.publicKey.toBuffer(),
    Buffer.from(nonce),
  ]);
  const supportersUri =
    'ipfs://smoke-test-supporters-only-' +
    JSON.stringify({
      content: 'Supporters-only smoke test post',
      accessLevel: 'supporters',
    });

  logStep('Creator: post with supporters-only metadata URI');
  await creatorProgram.methods
    .createPost(nonce, supportersUri)
    .accounts({
      post: postPda,
      author: creator.publicKey,
      platformConfig,
      systemProgram: SystemProgram.programId,
    })
    .signers([creator])
    .rpc();

  const shareHolding = pda([
    Buffer.from('share_holding'),
    fan.publicKey.toBuffer(),
    creator.publicKey.toBuffer(),
  ]);
  const poolVault = pda([Buffer.from('pool_vault'), creator.publicKey.toBuffer()]);

  logStep('Fan: buy 1 Supporter Share');
  await fanProgram.methods
    .buyShares(new anchor.BN(1), new anchor.BN(1_000_000_000))
    .accounts({
      creatorPool,
      shareHolding,
      poolVault,
      buyer: fan.publicKey,
      creator: creator.publicKey,
      platformConfig,
      systemProgram: SystemProgram.programId,
    })
    .signers([fan])
    .rpc();

  const holding = await fanProgram.account.shareHolding.fetch(shareHolding);
  if (holding.amount.toNumber() < 1) {
    fail(`Expected share holding >= 1, got ${holding.amount.toString()}`);
  }

  const metadata = JSON.parse(
    supportersUri.replace('ipfs://smoke-test-supporters-only-', ''),
  );
  const hasGatedAccess =
    metadata.accessLevel === 'supporters' && holding.amount.toNumber() > 0;

  if (!hasGatedAccess) {
    fail('Gating simulation failed: fan should unlock supporters-only content');
  }

  logStep('Verify share holding', `${holding.amount.toString()} share(s)`);
  logStep('Simulate content gating', 'accessLevel=supporters + holding>0 → UNLOCKED');

  console.log('\n════════════════════════════════════════');
  console.log('SMOKE TEST PASSED — Supporter Shares MVP flow OK');
  console.log('════════════════════════════════════════');
  console.log(`Creator: ${creator.publicKey.toBase58()}`);
  console.log(`Fan:     ${fan.publicKey.toBase58()}`);
  console.log(`Post:    ${postPda.toBase58()}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
