# Mainnet Launch Checklist — Supporter Shares Module

Use this checklist before promoting Pulse Social beyond devnet.

## Environment

- [ ] `VITE_SOLANA_NETWORK=mainnet-beta`
- [ ] `VITE_SOLANA_RPC_URL` set to a reliable mainnet RPC (Helius, Triton, etc.)
- [ ] `VITE_PROGRAM_ID` points to the audited shares-enabled program deployment
- [ ] `VITE_PINATA_JWT` configured — **required**; production builds throw without it

## On-chain (shares module)

- [ ] `initializeCreatorPool` tested on mainnet-fork or audited devnet deployment
- [ ] `buyShares` / `sellShares` slippage defaults reviewed (FE default 5% buy / 1% sell)
- [ ] Rent costs documented for: profile, creator pool, share holding, post PDA
- [ ] Platform pause tested (`pause_platform`) for emergency stop
- [ ] Program upgrade authority secured (multisig recommended)

## IPFS / content

- [ ] Pinata JWT scoped with minimal permissions (pinFileToIPFS, pinJSONToIPFS)
- [ ] Post metadata schema includes `accessLevel: "public" | "supporters"`
- [ ] Gateway URL (`gateway.pinata.cloud`) reachable from target regions
- [ ] No `mock://` or localStorage fallbacks in production bundle

## Frontend

- [ ] `/dashboard` onboarding wizard: profile → pool → first post
- [ ] Supporter gating verified: non-holders see blur + CTA on `accessLevel: supporters` posts
- [ ] Legacy routes redirect (`/creator`, `/shares`, `/marketplace`, etc.)
- [ ] Copy uses “Supporter Shares” terminology (not “bonding curve”, “mint @handle”)

## Security review

- [ ] Shares module instruction set reviewed (no marketplace/governance stubs in active path)
- [ ] Wallet adapter domain verified for production URL
- [ ] No secrets in client bundle beyond public env vars

## Smoke test (mainnet)

1. Create profile
2. Initialize Supporter Shares pool
3. Post public + supporters-only content
4. Second wallet buys shares → exclusive post unlocks
5. Send tip to creator
6. Cash out support (sell shares)

### Automated devnet script

```bash
# Default: auto-airdrop on devnet (requires faucet availability)
pnpm smoke:devnet

# Pre-funded wallets (when faucet is dry)
SMOKE_CREATOR_SECRET=<base58> SMOKE_FAN_SECRET=<base58> pnpm smoke:devnet

# Require funded wallets only (no airdrop)
SMOKE_SKIP_AIRDROP=1 SMOKE_CREATOR_SECRET=... SMOKE_FAN_SECRET=... pnpm smoke:devnet
```

## Rollback

- [ ] Platform pause instruction ready
- [ ] Vercel instant rollback to last known-good deployment documented
