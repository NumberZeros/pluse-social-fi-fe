# Pulse Social - The Social Layer for Solana

A comprehensive decentralized social platform built on Solana with ZK Compression, featuring real-time tipping, username marketplace, DAO governance, and creator monetization.

## ✨ Core Features

### 🔐 Social Foundation
- **Wallet Integration** - Connect with Phantom, Solflare, and other Solana wallets
- **Real Solana Tipping** - Send SOL instantly to support creators (1-click tipping)
- **Username Minting** - Claim your @handle identity on-chain with ZK Compression
- **Social Feed** - Create posts, comment, like, repost with hashtag support
- **User Profiles** - Customizable profiles with followers/following
- **Bookmarks** - Save your favorite posts

### 💎 Creator Monetization
- **Subscription Tiers** - Create Bronze/Silver/Gold tiers for exclusive content
- **Subscriber-Only Posts** - Gate premium content behind subscriptions
- **Revenue Dashboard** - Track earnings, subscribers, and tier performance
- **Creator Shares** - Trade creator shares with bonding curve pricing
- **Share Trading** - Buy/sell creator shares, track portfolio value

### 🏛️ DAO Governance
- **Token Staking** - Stake tokens with 5 lock periods (0-365 days)
- **Voting Power** - Earn multipliers up to 3x with longer locks
- **Proposals** - Create and vote on governance proposals
- **APY Rewards** - Earn 5-30% APY based on lock duration
- **Quorum System** - Democratic decision-making with 10% quorum

### 🏪 Marketplace
- **Username Trading** - Buy/sell premium usernames like NFTs
- **Auction System** - Bid on rare/short usernames
- **Categories** - Premium, Short, Rare, Custom username types
- **Price Discovery** - Market-driven pricing

### 👥 Private Groups
- **Group Creation** - Create public or private communities
- **Member Roles** - Owner, Admin, Moderator, Member hierarchy
- **Entry Requirements** - Free, token-hold, NFT-hold, or SOL payment
- **Member Management** - Promote, demote, kick, ban members
- **Group Posts** - Dedicated feeds for each group

### 🛡️ Moderation System
- **Report Queue** - Community-driven content moderation
- **Mod Actions** - Warn, hide, remove content, ban users
- **Warning System** - Track user violations
- **Content Actions** - Audit trail of all moderation decisions
- **Statistics** - Real-time moderation metrics

### 🎁 Airdrop Program
- **5 Main Criteria** - Posts, tips, username, active days, engagement
- **Bonus Multipliers** - Daily active, referrals, community, early adopter
- **Points System** - Earn up to 800 base points + bonuses
- **Referral Program** - Invite friends and earn rewards
- **Eligibility Tracker** - Real-time allocation estimates

### 📊 Data & Privacy
- **GDPR Export** - Download all your data (JSON/CSV)
- **Data Categories** - Profile, posts, comments, followers, subscriptions, etc.
- **7-Day Expiry** - Secure download links
- **Privacy First** - Full control over your data

## 🛠 Tech Stack

- **Frontend**: React 19.2 + TypeScript 5.9 (strict mode)
- **Build Tool**: Vite 7.2.5 (Rolldown) - Sub-200ms cold starts
- **Styling**: Tailwind CSS 4.1 + Framer Motion 12.23
- **Blockchain**: Solana Web3.js 1.98 + Wallet Adapter 0.15
- **State Management**: Zustand 5.0 with persist middleware
- **Routing**: React Router DOM 7.10 with lazy loading
- **3D Graphics**: Three.js 0.182 + React Three Fiber
- **Code Quality**: ESLint 9.39 + Prettier 3.7 (flat config)
- **Forms**: React Hook Form 7.68 + Zod 4.1 validation

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/NumberZeros/pluse-social-fi-fe.git
cd social-fi-fe
```

2. Install dependencies:
```bash
pnpm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
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
src/
├── components/
│   ├── feed/              # PostCard, CreatePost, TrendingSidebar
│   ├── groups/            # CreateGroupModal, MemberManagement
│   ├── subscription/      # SubscriptionBadge
│   ├── layout/            # Navbar, Footer
│   ├── hero/              # HeroSceneCanvas (Three.js)
│   └── icons/             # PulseIcons (custom SVG)
├── pages/
│   ├── Landing.tsx             # Hero + username minting
│   ├── Feed.tsx                # Main social feed
│   ├── Profile.tsx             # User profiles
│   ├── AirdropDashboard.tsx    # Airdrop tracker
│   ├── Subscriptions.tsx       # Manage subscriptions
│   ├── CreatorDashboard.tsx    # Creator analytics
│   ├── GroupsDiscovery.tsx     # Browse groups
│   ├── GroupDetail.tsx         # Group pages
│   ├── UsernameMarketplace.tsx # Trade usernames
│   ├── Governance.tsx          # Staking + voting
│   ├── CreatorShares.tsx       # Trade creator shares
│   ├── ModerationDashboard.tsx # Moderation tools
│   └── DataExport.tsx          # GDPR export
├── stores/                # Zustand state (11 stores)
│   ├── useUserStore.ts         # User profile & activity
│   ├── useSocialStore.ts       # Posts, comments, likes
│   ├── useSubscriptionStore.ts # Tiers & subscriptions
│   ├── useGroupStore.ts        # Groups & members
│   ├── useMarketplaceStore.ts  # Username trading
│   ├── useGovernanceStore.ts   # Staking & proposals
│   ├── useSharesStore.ts       # Creator shares
│   ├── useModerationStore.ts   # Reports & bans
│   ├── useAirdropStore.ts      # Airdrop criteria
│   ├── useExportStore.ts       # Data exports
│   └── useUIStore.ts           # Modal states
├── utils/
│   ├── format.ts          # Date, number, file size formatting
│   ├── clipboard.ts       # Copy/share utilities
│   └── hashtag.tsx        # Hashtag highlighting
├── hooks/
│   ├── useSolana.ts       # Solana tipping & identity
│   └── useKeyboardShortcuts.ts
└── providers/
    ├── SolanaProvider.tsx # Wallet adapter config
    └── QueryProvider.tsx  # React Query config
```

## 🎯 Key Implementation Highlights

### State Management (11 Zustand Stores)
- **Persist Middleware** - All stores sync to localStorage
- **Map/Set Serialization** - Custom serializers for complex data structures
- **Computed Values** - Real-time calculations (points, eligibility, portfolio value)
- **Type Safety** - Full TypeScript support with strict mode

### Bonding Curve Pricing
```typescript
price = basePrice × (supply / 100)²
```
Used for creator shares trading - price increases quadratically with supply

### Staking Multipliers
| Lock Period | APY  | Voting Power |
|-------------|------|--------------|
| No lock     | 5%   | 1.0x         |
| 30 days     | 10%  | 1.2x         |
| 90 days     | 15%  | 1.5x         |
| 180 days    | 20%  | 2.0x         |
| 365 days    | 30%  | 3.0x         |

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
