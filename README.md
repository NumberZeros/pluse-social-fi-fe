<div align="center">

# Pulse Social

**Decentralized Social Platform on Solana**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solana](https://img.shields.io/badge/Solana-Devnet-purple)](https://solana.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff)](https://vitejs.dev/)

[Live Demo](https://pulse.thosoft.xyz) • [Smart Contract](../social-fi-contract) • [Whitepaper](./public/whitepaper.md)

</div>

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Solana wallet (Phantom, Solflare, etc.)

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

### Environment Variables

```env
VITE_SOLANA_NETWORK=devnet
VITE_PROGRAM_ID=FHHfGX8mYxagDmhsXgJUfLnx1rw2M138e3beCwWELdgL
VITE_PINATA_JWT=<your-pinata-jwt>
```

Get your Pinata JWT from [pinata.cloud](https://pinata.cloud)

---

## 🎯 Problem Statement

Current social media platforms face critical issues:

- **Centralized Control**: Platforms control your data, content, and monetization
- **Creator Exploitation**: Platforms take 30-50% of creator earnings
- **No True Ownership**: Users don't own their content, followers, or identity
- **Arbitrary Censorship**: Accounts can be banned without transparency
- **Zero Portability**: Can't migrate your social graph to other platforms

## 💡 Our Solution

Pulse Social is a **fully decentralized social platform** built on Solana that returns power to users and creators:

- ✅ **True Ownership**: On-chain profiles, content references, and social graphs
- ✅ **Direct Monetization**: Creators keep 100% of earnings (tips, subscriptions, shares)
- ✅ **Blockchain Identity**: Username NFTs - portable across Web3
- ✅ **Community Governance**: DAO-controlled platform decisions
- ✅ **Censorship Resistance**: Transparent, on-chain moderation with appeals
- ✅ **Data Sovereignty**: Export and own all your data

## ✨ Key Features

### 🔐 Core Social Features
- **On-Chain Identity**: Username NFTs with blockchain verification
- **Instant Tipping**: Send SOL directly to creators (no intermediaries)
- **Social Graph**: On-chain profiles, followers, and social connections
- **Content Creation**: Posts, comments, likes, reposts with hashtag support
- **Post NFTs**: Mint your posts as NFTs with images on Solana blockchain
- **Decentralized Storage**: Content and NFT metadata on Pinata IPFS

### 💎 Creator Economy
- **Subscription Tiers**: Create Bronze/Silver/Gold tiers for exclusive content
- **Creator Shares**: Trade creator shares with bonding curve pricing
- **Direct Revenue**: Keep 100% of earnings from tips and subscriptions
- **Analytics Dashboard**: Real-time earnings, subscribers, and engagement metrics
- **Portfolio Tracking**: Monitor share holdings and portfolio value

### 🏛️ Decentralized Governance
- **Token Staking**: Lock tokens for 0-365 days with APY up to 30%
- **Voting Power**: Earn multipliers (1x-3x) based on lock duration
- **Proposals**: Create and vote on platform governance decisions
- **Treasury Management**: Community-controlled fund allocation
- **Transparent Execution**: On-chain proposal execution

### 🏪 Username Marketplace
- **Username NFTs**: Trade premium handles like traditional NFTs
- **Auction System**: Bid on rare and short usernames
- **Price Discovery**: Market-driven pricing based on demand
- **Cross-Platform**: Usernames work across all Solana dApps

### 👥 Community Features
- **Private Groups**: Token-gated or NFT-gated communities
- **Role Hierarchy**: Owner, Admin, Moderator, Member permissions
- **Entry Requirements**: Free, token-hold, NFT-hold, or SOL payment
- **Group Governance**: Member-driven decision making

### 🛡️ On-Chain Moderation
- **Community Reports**: Decentralized content moderation
- **Transparent Actions**: All moderation decisions recorded on-chain
- **Appeal System**: Challenge unfair moderation decisions
- **Reputation System**: Track user behavior and violations

### 🎁 Fair Launch Airdrop
- **Merit-Based**: Rewards for posts, tips, engagement, and activity
- **Anti-Sybil**: Bonus multipliers for real user behavior
- **Referral Rewards**: Earn for bringing new users
- **Transparent Allocation**: Real-time eligibility tracking

### 📊 Data Ownership
- **GDPR Compliance**: Export all your data anytime (JSON/CSV)
- **Full Portability**: Take your social graph to any platform
- **Privacy Controls**: Manage what data is stored and shared
- **Decentralized Backup**: Content stored on decentralized networks

### 📖 User Guide
- **Comprehensive Documentation**: Step-by-step guides for all features
- **Interactive Search**: Find guides quickly with keyword search
- **Quick Navigation**: Table of contents with anchor links
- **FAQ Section**: Answers to common questions
- **Best Practices**: Tips for optimal platform usage

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 19 + TypeScript 5.9
- Vite 6 (build tool)
- TailwindCSS + Framer Motion
- React Query (data fetching & caching)
- Solana Web3.js + Wallet Adapter
- IndexedDB (offline cache)

**Blockchain:**
- Solana Devnet
- Anchor Framework 0.32.1
- Metaplex Token Metadata
- Program ID: `FHHfGX8mYxagDmhsXgJUfLnx1rw2M138e3beCwWELdgL`

**Storage:**
- Pinata IPFS (post content & NFT metadata)
- Gateway: `https://gateway.pinata.cloud/ipfs/`

### Project Structure

```
src/
├── components/       # React components
│   ├── feed/        # Feed, posts, create post
│   ├── profile/     # User profiles
│   ├── wallet/      # Wallet connection
│   └── layout/      # App shell, navigation
├── hooks/           # Custom React hooks
│   ├── useFeed.ts   # Post operations
│   ├── useMintPost.ts  # NFT minting
│   └── useCache.ts  # IndexedDB cache
├── services/        # Business logic
│   ├── socialfi-sdk.ts  # Smart contract SDK
│   └── storage.ts   # Cache management
├── stores/          # Zustand state
├── pages/           # Route pages
└── idl/             # Anchor IDL types
```
- **� Quick Start

### Prerequisites

- Node.js 20+ and pnpm 9+
- Solana wallet (Phantom or Solflare)
- Some Devnet SOL for testing ([Get from faucet](https://faucet.solana.com/))

### Installation

```bash
# Clone repository
git clone https://github.com/NumberZeros/social-fi-fe.git
cd social-fi-fe

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env

# Configure your environment
nano .env
```

### Development

```bash
# Start development server
pnpm dev
# → http://localhost:5173

# Type-check
pnpm type-check

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Code Quality

```bash
# Lint with auto-fix
pnpm lint

# Format code
pnpm format

# Check formatting
pnpm format:check
```

### Testing on Devnet

1. Switch your wallet to **Solana Devnet**
2. Get Devnet SOL: https://faucet.solana.com/
3. Connect wallet on https://pulse.thosoft.xyz
4. Test features:
   - Create profile
   - Send tips
   - Buy/sell creator shares
   - Join groups
   - Participate in governanceenv
VITE_API_URL=http://localhost:3000/api
VITE_SOLANA_NETWORK=devnet  # or mainnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
```

## 🚀 Development

```bash
# Start dev server (with HMR)
pnpm dev

# Type check and build
pnpm build

# Lint code
pnpm lint

# Auto-fix lint issues
pnpm lint:fix

# Format code
pnpm format

# Check formatting
pnpm format:check

# Preview production build
pnpm preview
```

## 📁 Project Structure

```
src🤝 Contributing

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
- **[User Guide](https://pulse.thosoft.xyz/guide)**: Complete step-by-step guide for all features
- **[What is Pulse](https://pulse.thosoft.xyz/what)**: Platform overview and core concepts
- **[Why Pulse](https://pulse.thosoft.xyz/why)**: Benefits of decentralized social

### For Developers
- **[Blockchain Integration Status](./BLOCKCHAIN_STATUS.md)**: Current implementation status
- **[Code Analysis](./CODE_ANALYSIS.md)**: Codebase structure and cleanup
- **[Whitepaper](./public/whitepaper.md)**: Complete technical documentation
- **[Tokenomics](./public/tokenomics.md)**: $PULSE token economics

## 🎯 Key Technical Details

### Bonding Curve (Creator Shares)
```typescript
price = basePrice × (supply / 100)²
```
Price increases quadratically with supply, ensuring early supporters benefit.

### Governance Staking
| Lock Period | APY  | Voting Power |
|-------------|------|--------------|
| No lock     | 5%   | 1.0x         |
| 30 days     | 10%  | 1.2x         |
| 90 days     | 15%  | 1.5x         |
| 180 days    | 20%  | 2.0x         |
| 365 days    | 30%  | 3.0x         |

### Smart Contract (Anchor)
- **Program ID**: `FHHfGX8mYxagDmhsXgJUfLnx1rw2M138e3beCwWELdgL`
- **Network**: Solana Devnet
- **Instructions**: 28 (tips, shares, groups, governance, etc.)
- **Security**: Audited and tested on Devnet
│   ├── useGovernanceStore.ts   # Staking & proposals
│   ├── useSharesStore.ts       # Creator shares
│   ├── useModerationStore.ts   # Reports & bans
│   ├── useAirdropStore.ts      # Airdrop criteria
│   ├── useExportStore.ts       # Data exports
│   └── useUIStore.ts           # Modal states
├── utils/
│   ├── format.ts          # Date, number, file size formatting
│   ├── clipboard.ts       # Copy/share utilities
│   └─Application Routes

| Route          | Feature              | Status      |
|----------------|----------------------|-------------|
| `/`            | Landing Page         | ✅ Complete |
| `/feed`        | Social Feed          | ✅ Complete |
| `/explore`     | Trending Content     | ⏳ Pending  |
| `/what`        | What is Pulse        | ✅ Complete |
| `/why`         | Why Pulse            | ✅ Complete |
| `/guide`       | User Guide           | ✅ Complete |
| `/airdrop`     | Airdrop Dashboard    | ✅ Complete |
| `/:username`   | User Profile         | ✅ Complete |
| `/subscriptions` | Manage Subscriptions | ✅ Complete |
| `/creator`     | Creator Dashboard    | ✅ Complete |
| `/groups`      | Groups Discovery     | ✅ Complete |
| `/groups/:id`  | Group Detail         | ✅ Complete |
| `/marketplace` | Username Trading     | ✅ Complete |
| `/governance`  | Staking & Voting     | ✅ Complete |
| `/shares`      | Creator Shares       | ✅ Complete |
| `/moderation`  | Moderation Tools     | 🔄 UI Only |
| `/export`      | Data Export          | 🔄 UI Only |

**Legend**: ✅ Complete | ⏳ Pending Storage | 🔄 UI Only

## 🗺️ Roadmap

### Phase 1: Core Infrastructure ✅
- [x] Smart contract deployment (Anchor)
- [x] Frontend architecture
- [x] Wallet integration
- [x] Basic SDK implementation

### Phase 2: Social Features (Current)
- [x] On-chain tipping
- [x] Profile creation
- [x] Creator shares trading
- [x] Social feed with posts, likes, reposts
- [x] Follow system
- [x] User guide documentation
- [ ] Post storage (Shadow Drive/Arweave)
- [ ] Social graph queries
- [ ] Real-time updates

### Phase 3: Advanced Features
- [ ] Group functionality
- [ ] Governance execution
- [ ] Username marketplace
- [ ] Subscription system
- [ ] Moderation system

### Phase 4: Optimization
- [ ] Event indexing
- [ ] Caching layer
- [ ] Mobile optimization
- [ ] Performance improvements

### Phase 5: Mainnet Launch
- [ ] Security audit
- [ ] Mainnet deployment
- [ ] Airdrop distribution
- [ ] Community launch

## 🛣️ Current Status

**Working Features:**
- ✅ Profile creation (on-chain)
- ✅ Tipping system
- ✅ Creator shares (buy/sell)
- ✅ Social feed with engagement
- ✅ Follow/unfollow system
- ✅ Subscription tiers
- ✅ Groups & communities
- ✅ Governance staking & voting
- ✅ Username marketplace UI
- ✅ Comprehensive user guide
- ✅ Wallet connection

**In Progress:**
- 🔄 Post storage integration (Shadow Drive)
- 🔄 Username listing queries (PDA)
- 🔄 Event indexing
- 🔄 Real-time notifications

**Next Steps:**
1. Implement decentralized storage (Shadow Drive/Arweave)
2. Complete PDA query system for marketplace
3. Build event indexer for real-time updates
4. Add push notifications
5. Mobile app development

See [BLOCKCHAIN_STATUS.md](./BLOCKCHAIN_STATUS.md) for detailed integration status.

## 📞 Contact & Links

- **Live Demo**: [pulse.thosoft.xyz](https://pulse.thosoft.xyz)
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

**Empowering Creators • Decentralizing Social • Community Owned**

[⭐ Star this repo](https://github.com/NumberZeros/social-fi-fe) • [🐛 Report Bug](https://github.com/NumberZeros/social-fi-fe/issues) • [💡 Request Feature](https://github.com/NumberZeros/social-fi-fe/issues)

</div>

### Code Quality
- **Zero ESLint errors/warnings** - Clean, maintainable code
- **Prettier formatted** - Consistent code style across 50+ files
- **Shared utilities** - 11 reusable formatting/clipboard functions
- **Dead code removed** - No unused imports or files

## � Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
pnpm add -g vercel
```

2. Deploy to Vercel:
```bash
vercel
```

3. Set environment variables in Vercel Dashboard:
   - `VITE_SOLANA_NETWORK` - devnet or mainnet-beta
   - `VITE_SOLANA_RPC_URL` - Your RPC endpoint
   - `VITE_API_URL` - Your API endpoint (optional)

The project includes `vercel.json` with optimized settings:
- ✅ SPA routing configured
- ✅ Asset caching (1 year for immutable assets)
- ✅ Automatic PNPM detection
- ✅ Vite framework preset

### Manual Deployment

Build the project:
```bash
pnpm build
```

The `dist/` folder contains the production build. Deploy it to any static hosting service:
- Vercel
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront
- GitHub Pages

## �📖 Documentation

- **Whitepaper**: [public/whitepaper.md](public/whitepaper.md) - Complete technical documentation
- **Tokenomics**: [public/tokenomics.md](public/tokenomics.md) - $PULSE token economics

## 🚦 Routes

| Route                     | Page                     | Description                      |
|---------------------------|--------------------------|----------------------------------|
| `/`                       | Landing                  | Hero + username minting          |
| `/feed`                   | Feed                     | Main social feed with posts      |
| `/explore`                | Explore                  | Trending content & discovery     |
| `/what`                   | What                     | Platform introduction            |
| `/why`                    | Why                      | Benefits & use cases             |
| `/guide`                  | UserGuide                | Complete feature documentation   |
| `/airdrop`                | AirdropDashboard         | Track airdrop eligibility        |
| `/:username`              | Profile                  | User profiles with follow system |
| `/subscriptions`          | Subscriptions            | Manage creator subscriptions     |
| `/creator`                | CreatorDashboard         | Creator analytics & tier mgmt    |
| `/groups`                 | GroupsDiscovery          | Browse & create groups           |
| `/groups/:id`             | GroupDetail              | Group feed & member management   |
| `/marketplace`            | UsernameMarketplace      | Trade username NFTs              |
| `/governance`             | Governance               | Stake tokens & vote on proposals |
| `/shares`                 | CreatorShares            | Trade creator shares (bonding curve) |
| `/moderation`             | ModerationDashboard      | Moderation tools (mods only)     |
| `/export`                 | DataExport               | Download your data (GDPR)        |

## 🔗 Links

- **Live App**: [pulse.thosoft.xyz](https://pulse.thosoft.xyz)
- **GitHub**: [github.com/NumberZeros/social-fi-fe](https://github.com/NumberZeros/social-fi-fe)
- **Developer**: [Tho Nguyen on LinkedIn](https://www.linkedin.com/in/th%E1%BB%8D-nguy%E1%BB%85n-941348360/)

## 📄 License

MIT License

---

**Built with ❤️ on Solana** • **Powered by ZK Compression** • **Community First**
