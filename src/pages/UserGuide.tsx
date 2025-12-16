import { Link } from 'react-router-dom';
import { WalletButton } from '../lib/wallet-adapter/components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import {
  User,
  TrendingUp,
  MessageSquare,
  Crown,
  Users,
  Vote,
  DollarSign,
  Gift,
  Tag,
  BookOpen,
  ArrowRight,
  Search,
  ArrowUp,
  HelpCircle,
  Hash,
} from 'lucide-react';
import { PulseMark } from '../components/icons/PulseIcons';
import Footer from '../components/layout/Footer';

const GuideSection = ({
  id,
  icon,
  title,
  description,
  steps,
  delay,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  steps: string[];
  delay: number;
}) => (
  <motion.div
    id={id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="glass-card rounded-2xl p-8 border border-white/10 hover:border-[var(--color-solana-green)]/30 transition-all scroll-mt-24"
  >
    <div className="flex items-start gap-4 mb-6">
      <div className="w-14 h-14 rounded-xl bg-[var(--color-solana-green)]/10 flex items-center justify-center flex-shrink-0 text-[var(--color-solana-green)]">
        {icon}
      </div>
      <div>
        <h3 className="text-2xl font-display font-bold mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-[var(--color-solana-green)]/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-[var(--color-solana-green)]">
            {index + 1}
          </div>
          <p className="text-gray-300 leading-relaxed pt-0.5">{step}</p>
        </div>
      ))}
    </div>
  </motion.div>
);

const QuickTip = ({ text, delay }: { text: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay }}
    className="flex items-start gap-3 p-4 rounded-xl bg-[var(--color-solana-green)]/5 border border-[var(--color-solana-green)]/20"
  >
    <div className="w-5 h-5 rounded-full bg-[var(--color-solana-green)] flex items-center justify-center flex-shrink-0">
      <ArrowRight className="w-3 h-3 text-black" />
    </div>
    <p className="text-sm text-gray-300 leading-relaxed">{text}</p>
  </motion.div>
);

// Guide data defined outside component to prevent recreation on every render
const guides = [
  {
    id: 'username-nft',
    icon: <User className="w-7 h-7" />,
    title: 'Username NFT - Own Your Identity',
    description: 'Mint your unique @username as an on-chain NFT. Portable across all Solana apps.',
    keywords: ['username', 'nft', 'identity', 'mint', 'handle', 'marketplace'],
    steps: [
        'Connect your Solana wallet using the button in the top right corner',
        'Navigate to Marketplace page from the main navigation',
        'Click "Mint Username" and enter your desired @handle',
        'Confirm the transaction - your username is now an NFT in your wallet',
        'Your username appears in your profile and can be traded on the marketplace',
      ],
    },
    {
      id: 'creator-shares',
      icon: <TrendingUp className="w-7 h-7" />,
      title: 'Creator Shares - Invest in Creators',
      description: 'Buy and sell creator shares with algorithmic pricing. Early supporters get the best deals.',
      keywords: ['shares', 'creator', 'invest', 'buy', 'sell', 'bonding curve', 'trading'],
      steps: [
        'Go to the Shares page to browse all creators',
        'Search for a creator or browse the market tab',
        'Click "Buy" on any creator card to open the purchase modal',
        'Enter the amount of shares you want to buy (price increases with each share)',
        'Confirm transaction - you now own creator shares that can be sold anytime',
        'View your portfolio in the "Portfolio" tab to track your investments',
      ],
    },
    {
      id: 'social-feed',
      icon: <MessageSquare className="w-7 h-7" />,
      title: 'Social Feed - Post & Engage',
      description: 'Create posts, like, repost, and tip other users. Build your on-chain social presence.',
      keywords: ['feed', 'post', 'like', 'repost', 'engage', 'social', 'create'],
      steps: [
        'Click the green "Create" button in the header or navigate to Feed page',
        'Write your post content in the text area (supports up to 280 characters)',
        'Optionally add images by clicking the image icon',
        'Toggle "Subscriber Only" if you want to gate content to paying subscribers',
        'Click "Post" to publish on-chain',
        'Engage with others by liking (heart icon), reposting, or sending tips',
      ],
    },
    {
      id: 'subscriptions',
      icon: <Crown className="w-7 h-7" />,
      title: 'Subscriptions - Monetize Your Content',
      description: 'Create subscription tiers for exclusive content. Fans pay monthly for special access.',
      keywords: ['subscription', 'tier', 'monetize', 'exclusive', 'subscriber', 'creator dashboard'],
      steps: [
        'Navigate to Creator Dashboard from your profile dropdown',
        'Click "Create New Tier" button',
        'Set tier name (e.g., "Silver", "Gold", "Platinum")',
        'Set monthly price in SOL',
        'Add description of benefits subscribers receive',
        'Confirm transaction to create the tier',
        'When posting, toggle "Subscriber Only" and select which tier can access',
      ],
    },
    {
      id: 'groups',
      icon: <Users className="w-7 h-7" />,
      title: 'Groups - Build Communities',
      description: 'Create or join groups. Share posts within communities. Moderate your own space.',
      keywords: ['groups', 'community', 'create', 'join', 'moderate', 'members'],
      steps: [
        'Go to Groups page from the main navigation',
        'Click "Create Group" button (green plus icon)',
        'Fill in group name, description, and upload banner image',
        'Choose privacy: Public (anyone can join) or Private (requires approval)',
        'Set entry requirements: Free, SOL payment, or NFT ownership',
        'Click "Create" to publish your group on-chain',
        'Manage members, post in the group, and assign moderator roles',
      ],
    },
    {
      id: 'governance',
      icon: <Vote className="w-7 h-7" />,
      title: 'Governance - Vote on Decisions',
      description: 'Stake $PULSE tokens to gain voting power. Create proposals and shape the platform.',
      keywords: ['governance', 'vote', 'stake', 'proposal', 'voting power', 'pulse token'],
      steps: [
        'Navigate to Governance page',
        'In the "Stake" tab, enter amount of $PULSE you want to stake',
        'Select lock period (longer lock = more voting power multiplier)',
        'Confirm staking transaction',
        'Switch to "Proposals" tab to view active proposals',
        'Click on any proposal to read details and cast your vote (Yes/No)',
        'To create a proposal: Click "Create Proposal", fill in title, description, and category',
      ],
    },
    {
      id: 'tipping',
      icon: <DollarSign className="w-7 h-7" />,
      title: 'Tipping - Support Creators',
      description: 'Send SOL directly to creators you love. Instant, on-chain, no middleman.',
      keywords: ['tip', 'tipping', 'support', 'creator', 'sol', 'send'],
      steps: [
        'Find a post or profile you want to tip',
        'Click the tip icon (dollar sign) on any post or profile',
        'Enter the amount of SOL you want to send',
        'Optionally add a message with your tip',
        'Confirm the transaction',
        'The creator receives SOL instantly in their wallet',
      ],
    },
    {
      id: 'airdrop',
      icon: <Gift className="w-7 h-7" />,
      title: 'Airdrop - Earn $PULSE Tokens',
      description: 'Complete daily tasks to earn airdrop points. Refer friends for bonus rewards.',
      keywords: ['airdrop', 'earn', 'rewards', 'tasks', 'referral', 'points'],
      steps: [
        'Navigate to Airdrop Dashboard',
        'View your current points and progress towards milestones',
        'Complete tasks: Create posts, follow users, subscribe to creators',
        'Copy your referral link from the dashboard',
        'Share your referral link - you earn bonus points for each friend who signs up',
        'Check back daily to mark your daily active streak',
        'Track your rank on the leaderboard',
      ],
    },
    {
      id: 'marketplace',
      icon: <Tag className="w-7 h-7" />,
      title: 'Marketplace - Trade Usernames',
      description: 'List your username NFTs for sale or buy premium handles from others.',
      keywords: ['marketplace', 'trade', 'buy', 'sell', 'list', 'username', 'nft'],
      steps: [
        'Go to Marketplace page',
        'Browse available usernames in the "Buy" tab',
        'Use search and filters to find premium handles',
        'Click "Buy Now" on any listing to purchase',
        'To sell: Switch to "Sell" tab and click "List Username"',
        'Select which username NFT to list and set your price',
        'Confirm transaction - your username is now listed for sale',
      ],
    },
];

const quickTips = [
  'Always check transaction details before confirming in your wallet',
  'Your username NFT can be used across any Solana app that integrates with Pulse',
  'Early creator share buyers get the best prices due to the bonding curve',
  'Subscriber-only posts are gated on-chain - only verified subscribers can access',
  'Group entry fees go directly to the group creator',
  'Longer governance token lock periods give you higher voting power multipliers',
  'Tips are sent peer-to-peer with no platform fees',
  'Airdrop points are snapshotted periodically for token distribution',
];

const faqs = [
    {
      q: 'Is my wallet safe when connecting to Pulse?',
      a: 'Yes! Pulse uses standard Solana wallet adapters. We never ask for your private keys or seed phrase. Always verify you are on the official Pulse domain before connecting.',
    },
    {
      q: 'What are gas fees on Solana?',
      a: 'Solana transactions typically cost less than $0.01. This makes it affordable to post, tip, and trade without worrying about high fees.',
    },
    {
      q: 'Can I get my username back if I sell it?',
      a: 'Once sold, the username NFT transfers to the buyer. You would need to buy it back from them if they list it for sale again.',
    },
    {
      q: 'How does the bonding curve work for creator shares?',
      a: 'Price increases quadratically with each share: price = supply². The 1st share might cost $0.01, but the 100th costs $1.00. This rewards early believers.',
    },
    {
      q: 'Are my posts stored on-chain?',
      a: 'Post metadata and references are on-chain. Larger content like images may be stored on Arweave or Shadow Drive for permanence.',
    },
    {
      q: 'What happens if I lose access to my wallet?',
      a: 'Your wallet controls all your assets. Keep your seed phrase safe and backed up. If lost, there is no recovery - this is the nature of decentralized ownership.',
    },
];

export default function UserGuide() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Handle scroll for back to top button
  useState(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter guides based on search
  const filteredGuides = useMemo(() => {
    if (!searchQuery.trim()) return guides;
    
    const query = searchQuery.toLowerCase();
    return guides.filter(
      (guide) =>
        guide.title.toLowerCase().includes(query) ||
        guide.description.toLowerCase().includes(query) ||
        guide.keywords.some((kw) => kw.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  return (
    <div className="bg-[#000000] text-white min-h-screen font-sans">
      {/* Background */}
      <div className="fixed inset-0 z-0 mesh-gradient-lens opacity-60 pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex justify-between items-center max-w-[1400px] mx-auto w-full bg-black/50 backdrop-blur-lg border-b border-white/5">
        <Link
          to="/"
          className="text-2xl font-display font-bold tracking-tighter flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <PulseMark className="w-7 h-7" />
          Pulse
        </Link>
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
          <Link
            to="/"
            className="hover:text-[var(--color-solana-green)] transition-colors"
          >
            Home
          </Link>
          <Link
            to="/what"
            className="hover:text-[var(--color-solana-green)] transition-colors"
          >
            What
          </Link>
          <Link
            to="/why"
            className="hover:text-[var(--color-solana-green)] transition-colors"
          >
            Why
          </Link>
          <Link to="/guide" className="text-[var(--color-solana-green)]">
            Guide
          </Link>
          <Link
            to="/airdrop"
            className="hover:text-[var(--color-solana-green)] transition-colors"
          >
            Airdrop
          </Link>
        </div>
        <WalletButton className="!px-6 !py-3 !bg-white !text-black !rounded-full !font-bold !text-sm hover:!bg-[var(--color-solana-green)] !transition-colors" />
      </nav>

      {/* Content */}
      <main className="relative z-10 pt-32 pb-20 px-6 max-w-6xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8">
            <BookOpen className="w-4 h-4 text-[var(--color-solana-green)]" />
            <span className="text-sm font-medium text-[var(--color-solana-green)]">
              User Guide
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-8">
            Welcome to <br />
            <span className="text-gradient-lens">Pulse Social</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-8">
            Learn how to mint usernames, trade creator shares, govern the platform, and build your community.
          </p>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search guides... (e.g., 'username', 'tip', 'vote')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-solana-green)]/50 transition-colors"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Table of Contents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <div className="glass-card rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Hash className="w-5 h-5 text-[var(--color-solana-green)]" />
              <h2 className="text-xl font-display font-bold">Quick Navigation</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {guides.map((guide) => (
                <a
                  key={guide.id}
                  href={`#${guide.id}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-[var(--color-solana-green)]/10 hover:border-[var(--color-solana-green)]/30 border border-transparent transition-all text-sm text-gray-300 hover:text-white"
                >
                  {guide.icon}
                  <span>{guide.title.split(' - ')[0]}</span>
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Getting Started */}
        <div className="mb-16">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-display font-bold mb-8"
          >
            Getting Started
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-8 border border-[var(--color-solana-green)]/20 bg-[var(--color-solana-green)]/5"
          >
            <h3 className="text-2xl font-display font-bold mb-4 text-[var(--color-solana-green)]">
              First Time Setup
            </h3>
            <ol className="space-y-3 text-gray-300">
              <li className="flex gap-3">
                <span className="font-bold text-[var(--color-solana-green)]">1.</span>
                <span>
                  Install a Solana wallet like Phantom, Solflare, or Backpack from their
                  official websites
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[var(--color-solana-green)]">2.</span>
                <span>Fund your wallet with SOL (you can buy on exchanges or use a faucet for devnet)</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[var(--color-solana-green)]">3.</span>
                <span>
                  Click "Select Wallet" in the top right corner of Pulse and connect your
                  wallet
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[var(--color-solana-green)]">4.</span>
                <span>Approve the connection in your wallet popup</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[var(--color-solana-green)]">5.</span>
                <span>
                  You're ready to go! Your wallet address is now your Pulse identity
                </span>
              </li>
            </ol>
          </motion.div>
        </div>

        {/* Feature Guides */}
        <div className="mb-16">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-4xl font-display font-bold mb-8"
          >
            Feature Guides
            {searchQuery && (
              <span className="text-lg text-gray-400 font-normal ml-3">
                ({filteredGuides.length} result{filteredGuides.length !== 1 ? 's' : ''})
              </span>
            )}
          </motion.h2>
          
          {filteredGuides.length > 0 ? (
            <div className="space-y-6">
              {filteredGuides.map((guide, index) => (
                <GuideSection
                  key={guide.id}
                  id={guide.id}
                  icon={guide.icon}
                  title={guide.title}
                  description={guide.description}
                  steps={guide.steps}
                  delay={0.1 * index + 0.5}
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card rounded-2xl p-12 border border-white/10 text-center"
            >
              <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                No guides found for "{searchQuery}"
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Try different keywords like "username", "tip", "vote", or "share"
              </p>
            </motion.div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="mb-16">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-3xl md:text-4xl font-display font-bold mb-8"
          >
            Quick Tips & Best Practices
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-4">
            {quickTips.map((tip, index) => (
              <QuickTip key={index} text={tip} delay={0.1 * index + 0.7} />
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-3xl md:text-4xl font-display font-bold mb-8"
          >
            Frequently Asked Questions
          </motion.h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index + 0.8 }}
                className="glass-card rounded-xl p-6 border border-white/10"
              >
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-[var(--color-solana-green)] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-bold mb-2">{faq.q}</h3>
                    <p className="text-gray-400 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Need Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="glass-card rounded-2xl p-8 border border-white/10 text-center"
        >
          <h2 className="text-3xl font-display font-bold mb-4">Need More Help?</h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Join our community channels for support, feature requests, and discussions with
            other Pulse users.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://discord.gg/pulse"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-full font-bold transition-colors"
            >
              Join Discord
            </a>
            <a
              href="https://twitter.com/pulsesocial"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-colors border border-white/10"
            >
              Follow on Twitter
            </a>
            <a
              href="https://t.me/pulsesocial"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-colors border border-white/10"
            >
              Join Telegram
            </a>
          </div>
        </motion.div>
      </main>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full bg-[var(--color-solana-green)] text-black flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
