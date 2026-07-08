export interface GuideSection {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  steps: string[];
}

export interface FaqItem {
  q: string;
  a: string;
}

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'create-profile',
    title: 'Create your profile',
    description: 'Claim your on-chain username and set up your creator identity.',
    keywords: ['profile', 'username', 'create', 'wallet', 'onboarding'],
    steps: [
      'Connect your Solana wallet',
      'Open Dashboard from the navigation',
      'Complete Step 1: Create profile and choose your username',
      'Your profile is stored on-chain and visible at /:username',
    ],
  },
  {
    id: 'supporter-shares',
    title: 'Launch Supporter Shares',
    description: 'Let fans support you and unlock exclusive content.',
    keywords: ['supporter', 'shares', 'support', 'pool', 'creator'],
    steps: [
      'From Dashboard, complete Step 2: Launch Supporter Shares',
      'Confirm the on-chain transaction to initialize your pool',
      'Fans visit your profile and click Support Creator',
      'Price grows as more supporters join — early supporters pay less',
      'Track supporters and volume on your Dashboard',
    ],
  },
  {
    id: 'exclusive-posts',
    title: 'Post exclusive content',
    description: 'Gate posts to supporters only using IPFS accessLevel.',
    keywords: ['post', 'exclusive', 'supporters', 'gating', 'feed'],
    steps: [
      'Go to Feed and click + Post in the navigation',
      'Write your content (up to 280 characters)',
      'Toggle "Supporters only" to gate the post',
      'Only wallets holding your Supporter Shares can read the full content',
      'Non-supporters see a blurred preview with a "Become a supporter" CTA',
    ],
  },
  {
    id: 'support-creator',
    title: 'Become a supporter',
    description: 'Back a creator and unlock their exclusive feed.',
    keywords: ['support', 'buy', 'fan', 'unlock', 'shares'],
    steps: [
      'Discover creators on Explore or Feed',
      'Visit their profile and click Support Creator',
      'Choose how many Supporter Shares to buy',
      'Confirm the transaction in your wallet',
      'Return to their posts — exclusive content is now unlocked',
    ],
  },
  {
    id: 'tipping',
    title: 'Send tips',
    description: 'Send SOL directly to creators — 100% goes to their wallet.',
    keywords: ['tip', 'tipping', 'support', 'creator', 'sol'],
    steps: [
      'Find a post you want to support',
      'Click the tip icon (dollar sign)',
      'Enter the amount of SOL to send',
      'Confirm the transaction',
      'The creator receives SOL instantly',
    ],
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'What are Supporter Shares?',
    a: 'Supporter Shares let fans back a creator on-chain. Holders unlock exclusive posts. Price grows as more people support.',
  },
  {
    q: 'How is exclusive content protected?',
    a: 'Supporter-only posts store a public preview on IPFS (teaser only). Full content lives in a separate gated blob fetched only after the app verifies your Supporter Shares on-chain.',
  },
  {
    q: 'What fees apply when I cash out support?',
    a: 'Tips have 0% platform fee. When you sell Supporter Shares, 10% stays in the creator\'s pool vault (not a platform cut) to keep the supporter pool healthy.',
  },
  {
    q: 'What are gas fees on Solana?',
    a: 'Transactions typically cost less than $0.01 on Solana.',
  },
  {
    q: 'Is Pinata required?',
    a: 'Yes for production. Set VITE_PINATA_JWT in your environment. Dev builds can use local mock storage.',
  },
  {
    q: 'Where did Marketplace, Groups, and Governance go?',
    a: 'These features are deferred post-MVP. Legacy URLs redirect to the guide.',
  },
];
