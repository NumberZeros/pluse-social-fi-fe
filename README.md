<div align="center">

# Pulse Social

**Decentralized Social Platform on Solana**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solana](https://img.shields.io/badge/Solana-Devnet-purple)](https://solana.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb)](https://reactjs.org/)

[Live Demo](https://pulse-social.vercel.app) • [Documentation](./BLOCKCHAIN_STATUS.md) • [Whitepaper](./public/whitepaper.md)

</div>

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
- **Decentralized Storage**: Content references stored on-chain (Shadow Drive/Arweave)

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

## 🏗️ Architecture

### Frontend Stack
- **Framework**: React 19.2 + TypeScript 5.9 (strict mode)
- **Build**: Vite 7.2.5 with Rolldown (sub-200ms cold starts)
- **Styling**: Tailwind CSS 4.1 + Framer Motion animations
- **State**: Zustand 5.0 with localStorage persistence
- **Routing**: React Router DOM 7.10 with code splitting

### Blockchain Integration
- **Network**: Solana (Devnet/Mainnet)
- **Smart Contract**: Anchor Framework (Program deployed)
- **� Quick Start

### Prerequisites

- Node.js 20+ and pnpm 9+
- Solana wallet (Phantom or Solflare)
- Some Devnet SOL for testing ([Get from faucet](https://faucet.solana.com/))

### Installation

```bash
# Clone repository
git clone https://github.com/NumberZeros/pulse-social-fi-fe.git
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
3. Connect wallet on http://localhost:5173
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
- **Program ID**: `8dU8UsnavCaqmm4JTgMHCtjzcfcu4D4iKYW71MXE1mDP`
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
| `/feed`        | Social Feed          | ⏳ Pending  |
| `/explore`     | Trending Content     | ⏳ Pending  |
| `/airdrop`     | Airdrop Dashboard    | ✅ Complete |
| `/:username`   | User Profile         | ✅ Complete |
| `/subscriptions` | Manage Subscriptions | 🔄 UI Only |
| `/creator`     | Creator Dashboard    | 🔄 UI Only |
| `/groups`      | Groups Discovery     | 🔄 UI Only |
| `/groups/:id`  | Group Detail         | 🔄 UI Only |
| `/marketplace` | Username Trading     | 🔄 UI Only |
| `/governance`  | Staking & Voting     | 🔄 UI Only |
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
- [ ] Post storage (Shadow Drive/Arweave)
- [ ] Social graph queries
- [ ] Real-time feed

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
- ✅ Wallet connection
- ✅ UI for all features

**In Progress:**
- 🔄 Post storage integration
- 🔄 PDA queries for market data
- 🔄 Event indexing

**Next Steps:**
1. Implement decentralized storage (Shadow Drive)
2. Add PDA query system
3. Build event indexer
4. Enable real-time features

See [BLOCKCHAIN_STATUS.md](./BLOCKCHAIN_STATUS.md) for detailed integration status.

## 📞 Contact & Links

- **GitHub**: [@NumberZeros](https://github.com/NumberZeros)
- **Repository**: [pulse-social-fi-fe](https://github.com/NumberZeros/pulse-social-fi-fe)
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

[⭐ Star this repo](https://github.com/NumberZeros/pulse-social-fi-fe) • [🐛 Report Bug](https://github.com/NumberZeros/pulse-social-fi-fe/issues) • [💡 Request Feature](https://github.com/NumberZeros/pulse-social-fi-fe/issues)

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
| `/feed`                   | Feed                     | Main social feed                 |
| `/explore`                | Explore                  | Trending content                 |
| `/airdrop`                | AirdropDashboard         | Track eligibility                |
| `/:username`              | Profile                  | User profiles                    |
| `/subscriptions`          | Subscriptions            | Manage subscriptions             |
| `/creator`                | CreatorDashboard         | Creator analytics                |
| `/groups`                 | GroupsDiscovery          | Browse groups                    |
| `/groups/:id`             | GroupDetail              | Group page                       |
| `/marketplace`            | UsernameMarketplace      | Trade usernames                  |
| `/governance`             | Governance               | Stake & vote                     |
| `/shares`                 | CreatorShares            | Trade creator shares             |
| `/moderation`             | ModerationDashboard      | Moderation tools (mods only)     |
| `/export`                 | DataExport               | Download your data               |

## 🔗 Links

- **GitHub**: [github.com/NumberZeros/pluse-social-fi-fe](https://github.com/NumberZeros/pluse-social-fi-fe)
- **Developer**: [Tho Nguyen on LinkedIn](https://www.linkedin.com/in/th%E1%BB%8D-nguy%E1%BB%85n-941348360/)

## 📄 License

MIT License

---

**Built with ❤️ on Solana** • **Powered by ZK Compression** • **Community First**
