<div align="center">

# Pulse Social

**Creator platform on Solana — fans buy Supporter Shares to unlock exclusive content**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solana](https://img.shields.io/badge/Solana-Devnet-purple)](https://solana.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff)](https://vitejs.dev/)

[Live Demo](https://pulsesol.xyz) • [Smart Contract](../social-fi-contract) • [Whitepaper](./public/whitepaper.md) • [llms.txt](https://pulsesol.xyz/llms.txt)

</div>

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 11.9+ (pinned via `packageManager` in `package.json`)
- Solana wallet (Phantom, Solflare, etc.)

### Package manager (`pnpm-workspace.yaml`)

This is a **single-app repo**, not a monorepo. pnpm 11 still requires `pnpm-workspace.yaml` at the project root for build-script policy (`allowBuilds`).

The file whitelists native build scripts used by the Solana stack:

| Package | Used by |
|---------|---------|
| `esbuild` | Vite, tsx |
| `bigint-buffer` | `@solana/spl-token` |
| `bufferutil`, `utf-8-validate` | optional WebSocket perf for `@solana/web3.js` |

Unused Metaplex/Irys deps were removed to avoid extra native crypto (`keccak`, `secp256k1`). Vite is standard **^6** (not the `rolldown-vite` alias).

```bash
corepack enable   # once, if pnpm is not on PATH
pnpm install
```

### Installation

```bash
# Clone repository
git clone <repo-url>
cd social-fi-fe

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start development server
pnpm dev
```

### Production requirements

- `VITE_PINATA_JWT` is **required** for production builds (post metadata and media).
- See [Mainnet Checklist](./docs/MAINNET_CHECKLIST.md) and [Launch Metrics](./docs/LAUNCH_METRICS.md) before going live.

Get your Pinata JWT from [pinata.cloud](https://pinata.cloud)

### Environment Variables

```env
VITE_SOLANA_NETWORK=devnet
VITE_PROGRAM_ID=FHHfGX8mYxagDmhsXgJUfLnx1rw2M138e3beCwWELdgL
VITE_PINATA_JWT=<your-pinata-jwt>
VITE_WALLETCONNECT_PROJECT_ID=<walletconnect-project-id>  # iOS Safari / mobile
```


## 🎯 What is Pulse Social?

Pulse Social is a **creator-first social platform on Solana** built around one core loop:

**Fans buy Supporter Shares → unlock exclusive content → creators earn directly.**

No platform cut on tips. No speculation-first trading UI. Support is the product.

## 💡 Core Value Proposition

| For fans | For creators |
|----------|--------------|
| Buy Supporter Shares to unlock supporters-only posts | Launch a Supporter Shares pool in minutes |
| On-chain proof of support | Direct SOL tips with no middleman |
| Follow creators and engage on-chain | Dashboard for supporters, earnings, and posts |
| Portable wallet identity | IPFS-hosted content with access gating |

## ✨ MVP Features

### Supporter Shares
- Launch a pool from **Dashboard** (`/dashboard`)
- Fans buy shares to become supporters
- Cash out support anytime (sell shares back to pool)
- On-chain verification gates exclusive content

### Content & Gating
- Create public or **Supporters only** posts
- Media + metadata on Pinata IPFS
- `accessLevel` in post metadata + on-chain share check before render
- Feed and profile respect gating with blur + CTA

### Social Layer (simplified)
- On-chain posts, likes, comments, tips
- Follow creators
- Explore trending and supporters-only content
- Creator profiles with support CTA

### Creator Dashboard
- 3-step onboarding wizard (profile → pool → first post)
- Stats: tips, supporters, share supply, post count
- Supporter list from on-chain holdings

## 🚫 Intentionally Out of MVP Scope

These exist in the contract/SDK but are **hidden in the UI** (redirect to `/guide#coming-soon`):

- Username NFT marketplace
- Subscription tiers
- Groups & communities
- Governance / staking
- Post NFT minting
- Reposts
- Airdrop & referrals

See the [User Guide](https://pulsesol.xyz/guide#coming-soon) for the full roadmap.

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 19 + TypeScript 5.9
- Vite 6 (build tool)
- TailwindCSS + Framer Motion
- React Query (data fetching & caching)
- Solana Web3.js + [@solana/wallet-adapter](https://github.com/anza-xyz/wallet-adapter) (Phantom, Solflare, Wallet Standard, WalletConnect, MWA)
- IndexedDB (offline cache)

**Blockchain:**
- Solana Devnet
- Anchor Framework 0.32.1
- `@solana/web3.js` + `@solana/spl-token`
- Program ID: `FHHfGX8mYxagDmhsXgJUfLnx1rw2M138e3beCwWELdgL`

**Storage:**
- Pinata IPFS (post content & NFT metadata)
- Gateway: `https://gateway.pinata.cloud/ipfs/`

### Project Structure

```
src/
├── components/       # React components
│   ├── feed/        # Feed, posts, gating, create post
│   ├── shares/      # Buy/sell Supporter Shares modals
│   ├── dashboard/   # Creator onboarding wizard
│   ├── wallet/      # WalletButton, NetworkBanner, onboarding
│   └── layout/      # App shell, navigation
├── providers/       # SolanaProvider (Connection + Wallet + Modal)
├── hooks/           # Custom React hooks
│   ├── useFeed.ts   # Post operations
│   ├── useShares.ts # Supporter Shares
│   └── useSupporterAccess.ts  # Gating checks
├── services/        # Business logic
│   ├── socialfi-sdk.ts  # Smart contract SDK
│   └── storage.ts   # Cache management
├── stores/          # Zustand state
├── pages/           # Route pages
└── idl/             # Anchor IDL types
```

## 🚀 Development

```bash
pnpm dev          # Start dev server
pnpm type-check   # TypeScript check
pnpm build        # Production build
pnpm lint         # Lint
pnpm format       # Format
pnpm preview      # Preview build
pnpm smoke:devnet # Devnet on-chain smoke test (Supporter Shares flow)
pnpm smoke:check  # Read-only devnet check (program + platform config)
```

`pnpm sync-idl` copies IDL from `../social-fi-contract` after `anchor build`.

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

- 🐛 **Report Bugs**: Open issues for bugs you find
- ✨ **Suggest Features**: Propose new features or improvements
- 📝 **Improve Docs**: Help improve documentation
- 💻 **Submit PRs**: Fix bugs or implement features
- 🎨 **Design**: Improve UI/UX
- 🔍 **Code Review**: Review pull requests

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards

- ✅ TypeScript strict mode
- ✅ ESLint + Prettier formatting
- ✅ Meaningful commit messages
- ✅ Component documentation
- ✅ Test on Devnet before submitting

### Getting Help

- 💬 **GitHub Discussions**: Ask questions and share ideas
- 🐛 **GitHub Issues**: Report bugs and track features
- 📧 **Email**: tho.nguyen.soft@gmail.com

## 📚 Documentation

### For Users
- **[User Guide](https://pulsesol.xyz/guide)**: Complete step-by-step guide for all features
- **[What is Pulse](https://pulsesol.xyz/what)**: Platform overview and core concepts
- **[Why Pulse](https://pulsesol.xyz/why)**: Benefits of decentralized social

### For Developers
- **[Whitepaper](./public/whitepaper.md)**: MVP technical overview (Supporter Shares)
- **[Tokenomics](./public/tokenomics.md)**: $PULSE token economics (post-MVP)

## 🎯 Key Technical Details

### Supporter Shares Pricing
Share price scales with pool supply on-chain. Early supporters pay less; creators benefit as their community grows.

### Content Gating
```typescript
// IPFS metadata
{ accessLevel: 'public' | 'supporters', content: '...', images: [...] }

// Unlock check
sdk.getShareHolding(fanPubkey, creatorPubkey) > 0
```

### Smart Contract (Anchor)
- **Program ID**: `FHHfGX8mYxagDmhsXgJUfLnx1rw2M138e3beCwWELdgL`
- **Network**: Solana Devnet
- **MVP instructions**: profiles, posts, tips, shares buy/sell, follows, likes, comments

### Application Routes (MVP)

| Route          | Feature              | Status      |
|----------------|----------------------|-------------|
| `/`            | Landing Page         | ✅          |
| `/feed`        | Social Feed          | ✅ On-chain |
| `/explore`     | Discover Creators    | ✅ On-chain |
| `/dashboard`   | Creator Dashboard    | ✅ On-chain |
| `/what`        | What is Pulse        | ✅ Static   |
| `/why`         | Why Pulse            | ✅ Static   |
| `/guide`       | User Guide           | ✅ Static   |
| `/:username`   | Creator Profile      | ✅ On-chain |

Legacy routes (`/creator`, `/shares`, `/marketplace`, `/governance`, etc.) redirect to MVP pages or Coming Soon.

## 🗺️ Roadmap

### Phase 1: Supporter Shares MVP ✅
- [x] Scope freeze — hide non-MVP features
- [x] Supporter-only content gating (IPFS + on-chain)
- [x] Creator dashboard + onboarding wizard
- [x] Landing & marketing aligned to USP
- [x] Production Pinata requirement + launch docs

### Phase 2: Post-MVP (contract exists, UI hidden)
- [ ] Groups & communities
- [ ] Governance staking
- [ ] Username marketplace
- [ ] Subscription tiers (replaced by shares in MVP)
- [ ] Post NFT minting

### Phase 3: Mainnet Launch
- [ ] Security audit
- [ ] Mainnet deployment
- [ ] Event indexing & notifications
- [ ] Mobile optimization

## 🛣️ Current Status

**MVP (live on devnet):**
- ✅ Supporter Shares buy/sell
- ✅ Supporters-only post gating
- ✅ Creator dashboard & onboarding
- ✅ Feed, explore, profiles, tips
- ✅ Follow system
- ✅ Wallet connection

**Next:**
1. Mainnet checklist completion
2. Event indexer for faster feeds
3. Re-enable cut features post-launch based on traction

## 📞 Contact & Links

- **Live Demo**: [pulsesol.xyz](https://pulsesol.xyz)
- **GitHub**: [@NumberZeros](https://github.com/NumberZeros)
- **Repository**: [social-fi-fe](https://github.com/NumberZeros/social-fi-fe)
- **Email**: tho.nguyen.soft@gmail.com
- **LinkedIn**: [Tho Nguyen](https://www.linkedin.com/in/th%E1%BB%8D-nguy%E1%BB%85n-941348360/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Solana Foundation** for blockchain infrastructure
- **Anchor Framework** for smart contract development
- **Web3.js** for Solana integration
- **React Team** for the amazing frontend framework
- **Open Source Community** for tools and libraries

---

<div align="center">

**Built with ❤️ on Solana**

**Support creators. Unlock exclusive content. Built on Solana.**

[⭐ Star this repo](https://github.com/NumberZeros/social-fi-fe) • [🐛 Report Bug](https://github.com/NumberZeros/social-fi-fe/issues) • [💡 Request Feature](https://github.com/NumberZeros/social-fi-fe/issues)

</div>
