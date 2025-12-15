import { Link } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion } from 'framer-motion';
import {
  IconGraph,
  IconIdentity,
  IconStorage,
  IconTip,
  PulseMark,
} from '../components/icons/PulseIcons';
import Footer from '../components/layout/Footer';

const FeatureCard = ({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="glass-card rounded-2xl p-8 border border-white/10 hover:border-[var(--color-solana-green)]/30 transition-all"
  >
    <div className="w-16 h-16 rounded-2xl bg-[var(--color-solana-green)]/10 flex items-center justify-center mb-6 text-[var(--color-solana-green)]">
      {icon}
    </div>
    <h3 className="text-2xl font-display font-bold mb-3">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </motion.div>
);

export default function What() {
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
          <Link to="/what" className="text-[var(--color-solana-green)]">
            What
          </Link>
          <Link
            to="/why"
            className="hover:text-[var(--color-solana-green)] transition-colors"
          >
            Why
          </Link>
          <Link
            to="/airdrop"
            className="hover:text-[var(--color-solana-green)] transition-colors"
          >
            Airdrop
          </Link>
        </div>
        <WalletMultiButton className="!px-6 !py-3 !bg-white !text-black !rounded-full !font-bold !text-sm hover:!bg-[var(--color-solana-green)] !transition-colors" />
      </nav>

      {/* Content */}
      <main className="relative z-10 pt-32 pb-20 px-6 max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8">
            <span className="text-sm font-medium text-[var(--color-solana-green)]">
              What is Pulse?
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-8">
            The Social Layer <br />
            <span className="text-gradient-lens">for Solana</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Pulse is a decentralized social platform where you truly own your identity,
            content, and connections. Built on Solana for speed, powered by ZK Compression
            for affordability.
          </p>
        </motion.div>

        {/* Core Features */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-12 text-center">
            Core Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard
              icon={<IconIdentity className="w-8 h-8" />}
              title="Own Your Identity"
              description="Mint your @username as an on-chain identity. Portable across all apps. Never lose access to your handle."
              delay={0.1}
            />
            <FeatureCard
              icon={<IconTip className="w-8 h-8" />}
              title="Instant Tipping"
              description="Send SOL to creators in one click. No copying wallet addresses. Direct support for content you love."
              delay={0.2}
            />
            <FeatureCard
              icon={<IconGraph className="w-8 h-8" />}
              title="Portable Social Graph"
              description="Your followers, posts, and reputation are stored on-chain. Take your audience anywhere."
              delay={0.3}
            />
            <FeatureCard
              icon={<IconStorage className="w-8 h-8" />}
              title="Permanent Storage"
              description="Content stored on Arweave/Shadow Drive. Cannot be censored or deleted by any platform."
              delay={0.4}
            />
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-12 text-center">
            How It Works
          </h2>
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex gap-6 items-start"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--color-solana-green)]/10 flex items-center justify-center text-[var(--color-solana-green)] font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
                <p className="text-gray-400">
                  Use Phantom, Solflare, or any Solana wallet. One click to sign in.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-6 items-start"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--color-solana-green)]/10 flex items-center justify-center text-[var(--color-solana-green)] font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Mint Your Username</h3>
                <p className="text-gray-400">
                  Claim @yourname using ZK Compression. Costs ~0.01 SOL, stored forever.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex gap-6 items-start"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--color-solana-green)]/10 flex items-center justify-center text-[var(--color-solana-green)] font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Post, Tip, Build Reputation</h3>
                <p className="text-gray-400">
                  Share content, support creators, earn airdrop points. Your activity is
                  on-chain proof.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="glass-card rounded-3xl p-8 md:p-12 border border-white/10">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-8 text-center">
            Built With
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl mb-2">⚡</div>
              <div className="font-bold mb-1">Solana</div>
              <div className="text-sm text-gray-500">65K TPS</div>
            </div>
            <div>
              <div className="text-4xl mb-2">🔒</div>
              <div className="font-bold mb-1">ZK Compression</div>
              <div className="text-sm text-gray-500">1000x cheaper</div>
            </div>
            <div>
              <div className="text-4xl mb-2">💾</div>
              <div className="font-bold mb-1">Arweave</div>
              <div className="text-sm text-gray-500">Permanent storage</div>
            </div>
            <div>
              <div className="text-4xl mb-2">🎨</div>
              <div className="font-bold mb-1">Metaplex</div>
              <div className="text-sm text-gray-500">NFT Protocol</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <h3 className="text-3xl font-display font-bold mb-6">Ready to get started?</h3>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/feed"
              className="px-8 py-4 bg-[var(--color-solana-green)] text-black rounded-full font-bold hover:scale-105 transition-transform"
            >
              Launch App
            </Link>
            <Link
              to="/why"
              className="px-8 py-4 border border-white/20 rounded-full font-bold hover:bg-white/10 transition-colors"
            >
              Why Pulse?
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
