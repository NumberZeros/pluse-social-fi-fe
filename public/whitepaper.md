# Pulse Social Whitepaper
**Version 1.1 | MVP — Supporter Shares**

> **MVP focus:** This document describes the live product loop — **fans buy Supporter Shares to unlock exclusive creator content on Solana**. Broader protocol features (governance, username NFTs, groups) are deferred post-MVP but remain in the smart contract for future releases.

## Executive Summary

Pulse Social is a **creator-first social platform on Solana**. The MVP centers on one loop:

**Fans buy Supporter Shares → unlock supporters-only posts → creators earn via shares and tips.**

Creators launch a Supporter Shares pool from their dashboard, post public or gated content (metadata on IPFS, `accessLevel: supporters`), and fans verify access on-chain before content is revealed. Tips are peer-to-peer SOL transfers with no platform fee.

## 1. Problem Statement

### Web2 Social Media Failures
- **Platform Risk**: Creators can lose audiences and income overnight
- **Value Extraction**: Platforms take large cuts of creator earnings
- **No Direct Support**: Fans cannot easily back creators they believe in
- **Gated Content Friction**: Paywalls are opaque and platform-controlled

### What Creators Need
- A simple way to monetize a loyal fan base
- Transparent, on-chain proof of support
- Content gating that fans can trust
- Low fees and fast settlement

## 2. The Pulse MVP Solution

### Core Principles
1. **Creator-First**: Supporter Shares + tips, not ads
2. **On-Chain Support**: Share holdings are verifiable on Solana
3. **Content Gating**: IPFS metadata + on-chain access checks
4. **Affordable**: Solana transaction costs are fractions of a cent
5. **Focused Scope**: MVP ships one loop well before expanding

### Product Architecture (MVP)

**Identity & Social**
- On-chain profiles with usernames
- Feed, follows, likes, comments
- Explore discovery

**Supporter Shares**
- `initializeCreatorPool` — creator launches pool
- `buyShares` / `sellShares` — fans support or cash out
- Price scales with pool supply on-chain

**Content**
- Post metadata on Pinata IPFS
- `accessLevel: "public" | "supporters"`
- Client verifies `getShareHolding(fan, creator) > 0` before render

**Monetization**
- Direct SOL tips (100% to creator wallet)
- Supporter Shares revenue via pool mechanics

## 3. Technology Stack (MVP)

- **Solana**: Profiles, posts, shares, tips, follows
- **Anchor**: Smart contract framework
- **Pinata IPFS**: Post content and media (required in production)
- **React + Vite**: Frontend on Vercel
- **Wallet Adapter**: Phantom, Solflare, etc.

**Program ID (devnet):** `FHHfGX8mYxagDmhsXgJUfLnx1rw2M138e3beCwWELdgL`

## 4. Deferred Features (Post-MVP)

The contract includes additional modules not exposed in the MVP UI:

- Username NFT marketplace
- Subscription tiers
- Groups & communities
- Governance staking & proposals
- Post NFT minting
- Reposts & airdrop mechanics

Legacy URLs redirect to `/guide#coming-soon`.

## 5. Roadmap

### Phase 1: Supporter Shares MVP ✅
- Scope freeze and USP-focused UI
- Supporter-only gating (IPFS + on-chain)
- Creator dashboard + onboarding wizard
- Production Pinata requirement

### Phase 2: Mainnet Launch
- Security audit (shares module)
- Mainnet deployment
- Event indexing for faster feeds

### Phase 3: Protocol Expansion
- Re-enable marketplace, groups, governance based on traction
- Mobile apps
- Developer API

## 6. Team

**Founder**: Tho Nguyen
- GitHub: github.com/NumberZeros
- LinkedIn: linkedin.com/in/thọ-nguyễn-941348360

## Conclusion

Pulse Social MVP proves that fans can support creators directly on-chain — with exclusive content as the reward, not speculation-first trading.

**Support creators. Unlock exclusive content. Built on Solana.**

---

**Disclaimer**: This whitepaper is for informational purposes only and does not constitute financial advice.

**Last Updated**: June 2026
