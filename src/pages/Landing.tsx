import { motion, useScroll, useTransform } from 'framer-motion';
import { lazy, Suspense, useRef, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSolanaIdentity } from '../hooks/useSolana';
import { toast } from 'react-hot-toast';
import { useUIStore } from '../stores/useUIStore';
import { useUserStore } from '../stores/useUserStore';
import { useAirdropStore } from '../stores/useAirdropStore';
import {
  IconGraph,
  IconIdentity,
  IconStorage,
  IconTip,
  PulseMark,
} from '../components/icons/PulseIcons';
import Footer from '../components/layout/Footer';

const HeroSceneCanvas = lazy(() =>
  import('../components/hero/HeroSceneCanvas').then((m) => ({
    default: m.HeroSceneCanvas,
  })),
);

type TechStackItem = {
  name: string;
  desc: string;
  color: string;
  icon: React.ReactNode;
};

const BentoItem = ({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration: 0.5, delay }}
    className={`glass-card rounded-[2rem] p-8 border border-white/5 hover:border-white/15 transition-all duration-500 overflow-hidden relative group ${className}`}
  >
    {children}
  </motion.div>
);

const Marquee = ({ items, reverse = false }: { items: string[]; reverse?: boolean }) => (
  <div className="flex overflow-hidden py-4 group select-none">
    <div
      className={`flex gap-12 animate-marquee ${reverse ? 'direction-reverse' : ''} whitespace-nowrap`}
    >
      {[...items, ...items, ...items].map((item, i) => (
        <span
          key={i}
          className="text-3xl md:text-5xl font-display font-bold text-white/10 group-hover:text-white/20 transition-colors tracking-tighter"
        >
          {item}
        </span>
      ))}
    </div>
  </div>
);

const TechCard = ({ tech }: { tech: TechStackItem }) => (
  <div className="w-[280px] h-[200px] bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col items-center justify-center hover:border-white/20 transition-all cursor-pointer group relative overflow-hidden flex-shrink-0 mx-4">
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
      style={{
        background: `radial-gradient(circle at center, ${tech.color}, transparent 70%)`,
      }}
    />
    <div className="relative z-10 text-center p-4 flex flex-col items-center">
      <div className="mb-4 text-white/70 group-hover:text-white group-hover:scale-110 transition-transform duration-300">
        {tech.icon}
      </div>
      <div className="text-xl font-bold text-white mb-1">{tech.name}</div>
      <div className="text-xs text-gray-500 font-mono group-hover:text-gray-300 transition-colors">
        {tech.desc}
      </div>
    </div>
  </div>
);

const TechMarquee = ({
  items,
  reverse = false,
}: {
  items: TechStackItem[];
  reverse?: boolean;
}) => (
  <div className="flex overflow-hidden py-4 group select-none mask-linear-gradient">
    <div
      className={`flex animate-marquee ${reverse ? 'direction-reverse' : ''} whitespace-nowrap`}
    >
      {[...items, ...items, ...items].map((item, i) => (
        <TechCard key={i} tech={item} />
      ))}
    </div>
  </div>
);

const TECH_STACK: TechStackItem[] = [
  {
    name: 'Solana',
    desc: 'The Global State Machine',
    color: '#9945FF',
    icon: (
      <svg viewBox="0 0 397 311" className="w-12 h-12" fill="currentColor">
        <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.8c-5.8 0-8.7-7-4.6-11.1l62.4-62.7zM64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.8c-5.8 0-8.7-7-4.6-11.1L64.6 3.8zm0 117.1c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.8c-5.8 0-8.7-7-4.6-11.1l62.4-62.7z" />
      </svg>
    ),
  },
  {
    name: 'ZK Compression',
    desc: 'Scale to Billions',
    color: '#ABFE2C',
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="w-12 h-12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
      </svg>
    ),
  },
  {
    name: 'Helius',
    desc: 'Enterprise RPC & DAS',
    color: '#F97316',
    icon: (
      <svg viewBox="0 0 24 24" className="w-12 h-12" fill="currentColor">
        <path d="M14.6 2L2 15.4h8.8L9.4 22l12.6-13.4h-8.8L14.6 2z" />
      </svg>
    ),
  },
  {
    name: 'Metaplex',
    desc: 'Compressed NFTs',
    color: '#FFFFFF',
    icon: (
      <svg viewBox="0 0 24 24" className="w-12 h-12" fill="currentColor">
        <path d="M2 2h20v20H2V2zm16 4h-4v12h4V6zm-6 0H8v12h4V6z" />
      </svg>
    ),
  },
  {
    name: 'Arweave',
    desc: 'The Permaweb',
    color: '#FFFFFF',
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="w-12 h-12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 7v10M7 12h10" />
      </svg>
    ),
  },
  {
    name: 'Shadow Drive',
    desc: 'DePIN Storage',
    color: '#FFFFFF',
    icon: (
      <svg viewBox="0 0 24 24" className="w-12 h-12" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2-1-2-1-2 1 2 1zm0 2l-10 5 10 5 10-5-10-5z" />
      </svg>
    ),
  },
  {
    name: 'Phantom',
    desc: 'Wallet Standard',
    color: '#AB9FF2',
    icon: (
      <svg viewBox="0 0 24 24" className="w-12 h-12" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12v6c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-6c0-5.52-4.48-10-10-10zm0 18H4v-6c0-4.42 3.58-8 8-8s8 3.58 8 8v6h-8z" />
      </svg>
    ),
  },
  {
    name: 'Dialect',
    desc: 'Smart Messaging',
    color: '#4ADE80',
    icon: (
      <svg viewBox="0 0 24 24" className="w-12 h-12" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
      </svg>
    ),
  },
];

export function Landing() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });
  const { connected, publicKey } = useWallet();
  const { mintUsername } = useSolanaIdentity();
  const {
    mintUsernameModal,
    openMintUsernameModal,
    closeMintUsernameModal,
    isProcessing,
    setProcessing,
  } = useUIStore();
  const setUserUsername = useUserStore((state) => state.setUsername);
  const setReferredBy = useUserStore((state) => state.setReferredBy);
  const updateAirdropProgress = useAirdropStore((state) => state.updateProgress);
  const markDayActive = useUserStore((state) => state.markDayActive);
  const [username, setUsername] = useState('');
  const [searchParams] = useSearchParams();

  // Handle referral code from URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode && connected && publicKey) {
      setReferredBy(refCode);
      toast.success('Welcome! You were referred by a friend 🎉');
      // Remove ref param from URL after processing
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('ref');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams, connected, publicKey, setReferredBy]);

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const handleMintUsername = async () => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!username || username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error('Username can only contain letters, numbers and underscore');
      return;
    }

    setProcessing(true);
    try {
      const success = await mintUsername(username);
      if (success) {
        // Update stores
        setUserUsername(username);
        updateAirdropProgress('username', 1);
        markDayActive();

        closeMintUsernameModal();
        setUsername('');
      }
    } catch (error) {
      console.error('Mint failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="bg-[#000000] text-white min-h-screen font-sans selection:bg-[#ABFE2C] selection:text-black"
    >
      {/* Background Mesh */}
      <div className="fixed inset-0 z-0 mesh-gradient-lens opacity-60 pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex justify-between items-center max-w-[1400px] mx-auto w-full mix-blend-difference">
        <div className="text-2xl font-display font-bold tracking-tighter flex items-center gap-2">
          <PulseMark className="w-7 h-7" />
          Pulse
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
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
          <Link
            to="/airdrop"
            className="hover:text-[var(--color-solana-green)] transition-colors"
          >
            Airdrop
          </Link>
        </div>
        <WalletMultiButton className="!px-6 !py-3 !bg-white !text-black !rounded-full !font-bold !text-sm hover:!bg-[var(--color-solana-green)] !transition-colors" />
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center px-6 max-w-[1400px] mx-auto pt-20">
        <Suspense fallback={null}>
          <HeroSceneCanvas scrollYProgress={scrollYProgress} />
        </Suspense>
        <motion.div style={{ opacity }} className="relative z-10 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8"
          >
            <span className="w-2 h-2 bg-[var(--color-solana-green)] rounded-full shadow-[0_0_10px_var(--color-solana-green)]" />
            <span className="text-sm font-medium text-[var(--color-solana-green)]">
              MVP Live on Solana Mainnet
            </span>
          </motion.div>

          <h1 className="text-6xl sm:text-7xl md:text-8xl font-display font-bold tracking-tighter leading-[0.95] mb-10">
            The Social <br />
            <span className="text-white/40">Layer for</span> <br />
            <span className="text-gradient-lens">Solana</span>
          </h1>

          <div className="flex flex-wrap gap-6 items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openMintUsernameModal}
              className="px-10 py-5 bg-[var(--color-solana-green)] text-black rounded-full font-bold text-lg transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(20,241,149,0.3)] hover:shadow-[0_0_30px_rgba(20,241,149,0.5)]"
            >
              Mint @handle <span>→</span>
            </motion.button>
            <Link
              to="/feed"
              className="px-10 py-5 border border-white/20 rounded-full font-bold text-lg hover:bg-white/10 transition-colors"
            >
              Explore Feed
            </Link>
          </div>

          {/* Below-CTA value props */}
          <div className="mt-12 max-w-4xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card rounded-2xl p-5 border border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                  <IconIdentity className="w-4 h-4 text-[var(--color-solana-green)]" />
                  <div className="text-sm font-bold tracking-tight">Handles</div>
                </div>
                <div className="mt-1 text-sm text-white/70 leading-snug">
                  Mint an identity and show it everywhere.
                </div>
              </div>
              <div className="glass-card rounded-2xl p-5 border border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                  <IconTip className="w-4 h-4 text-[var(--color-solana-green)]" />
                  <div className="text-sm font-bold tracking-tight">1-Click Tips</div>
                </div>
                <div className="mt-1 text-sm text-white/70 leading-snug">
                  Send SOL fast — no copy/paste addresses.
                </div>
              </div>
              <div className="glass-card rounded-2xl p-5 border border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                  <IconGraph className="w-4 h-4 text-[var(--color-solana-purple)]" />
                  <div className="text-sm font-bold tracking-tight">Verifiable Graph</div>
                </div>
                <div className="mt-1 text-sm text-white/70 leading-snug">
                  Proof of interactions, portable across apps.
                </div>
              </div>
              <div className="glass-card rounded-2xl p-5 border border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                  <IconStorage className="w-4 h-4 text-[var(--color-lens-lime)]" />
                  <div className="text-sm font-bold tracking-tight">
                    Permanent Storage
                  </div>
                </div>
                <div className="mt-1 text-sm text-white/70 leading-snug">
                  Content pinned to permanent storage.
                </div>
              </div>
            </div>

            <div className="mt-5 text-sm text-white/60">
              Built for Solana speed. Designed for SocialFi.
            </div>
          </div>
        </motion.div>

        {/* Depth is handled by the WebGL hero scene */}
      </section>

      {/* Marquee Section */}
      <div className="border-y border-white/5 bg-black/30 backdrop-blur-sm py-10 relative z-10 overflow-hidden">
        <Marquee
          items={['Mint Handles', 'Tip in 1 Click', 'Store Forever', 'Solana Speed']}
        />
      </div>

      {/* Bento Grid Features */}
      <section className="relative z-10 py-28 px-6 max-w-[1400px] mx-auto">
        <div className="mb-16">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 tracking-tight">
            Social primitives <br />
            <span className="text-gray-500">reimagined on Solana.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[360px]">
          {/* Feature 1: Identity */}
          <BentoItem className="md:col-span-2 bg-black/30">
            <div className="h-full flex flex-col justify-between relative z-10">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-solana-green)]/10 flex items-center justify-center text-3xl mb-8 text-[var(--color-solana-green)]">
                  <IconIdentity className="w-8 h-8" />
                </div>
                <h3 className="text-4xl font-display font-bold mb-4">ZK Identity</h3>
                <p className="text-gray-400 text-lg max-w-lg">
                  Mint @username.pulse on-chain. Zero cost. ZK Private.
                </p>
              </div>
              {/* Visual representation of ID card */}
              <div className="absolute right-8 bottom-8 w-64 h-40 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md rotate-[-5deg] group-hover:rotate-0 transition-transform duration-500 p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--color-solana-green)] to-[var(--color-solana-purple)]" />
                  <div className="h-3 w-24 bg-white/20 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-white/10 rounded-full" />
                  <div className="h-2 w-2/3 bg-white/10 rounded-full" />
                </div>
                <div className="mt-4 text-right text-[var(--color-solana-green)] font-mono text-xs">
                  @pulse.sol
                </div>
              </div>
            </div>
          </BentoItem>

          {/* Feature 2: Tipping */}
          <BentoItem className="bg-black/20">
            <div className="h-full flex flex-col">
              <h3 className="text-3xl font-display font-bold mb-4">Real Money Tipping</h3>
              <p className="text-gray-400 mb-8">
                Tip creators instantly. No wallet signing.
              </p>
              <div className="flex-grow relative flex items-center justify-center">
                <div className="relative w-32 h-32 bg-[var(--color-solana-green)]/10 rounded-full flex items-center justify-center animate-pulse">
                  <IconTip className="w-9 h-9 text-[var(--color-solana-green)]" />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/10 rounded-full animate-[spin_4s_linear_infinite]" />
              </div>
            </div>
          </BentoItem>

          {/* Feature 3: Content */}
          <BentoItem className="md:row-span-2 bg-black/25">
            <div className="h-full flex flex-col">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-solana-purple)]/10 flex items-center justify-center text-3xl mb-8 text-[var(--color-solana-purple)]">
                <IconStorage className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-display font-bold mb-4">Uncensored Storage</h3>
              <p className="text-gray-400 mb-8">
                Your data. Your rules. Cannot be deplatformed.
              </p>
              <div className="flex-grow relative overflow-hidden rounded-xl bg-white/5 border border-white/5 p-6">
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                    <div className="h-2 w-1/3 bg-gray-700 rounded-full mb-2" />
                    <div className="h-20 w-full bg-gray-800 rounded-lg" />
                  </div>
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5 opacity-50">
                    <div className="h-2 w-1/2 bg-gray-700 rounded-full mb-2" />
                    <div className="h-10 w-full bg-gray-800 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </BentoItem>

          {/* Feature 4: Social Graph */}
          <BentoItem className="md:col-span-2 bg-black/30">
            <div className="flex flex-col md:flex-row items-center gap-12 h-full">
              <div className="flex-1">
                <h3 className="text-3xl font-display font-bold mb-4">Social Capital</h3>
                <p className="text-gray-400 text-lg mb-8">
                  Your reputation travels with you. Portable across apps.
                </p>
                <div className="flex gap-4">
                  <span className="px-3 py-1 rounded border border-white/10 text-xs font-mono text-gray-400">
                    Redis
                  </span>
                  <span className="px-3 py-1 rounded border border-white/10 text-xs font-mono text-gray-400">
                    Merkle Trees
                  </span>
                  <span className="px-3 py-1 rounded border border-white/10 text-xs font-mono text-gray-400">
                    Compression
                  </span>
                </div>
              </div>
              <div className="flex-1 w-full h-full bg-[#000] rounded-xl border border-white/10 p-6 font-mono text-sm text-gray-400 overflow-hidden flex items-center justify-center">
                <div className="text-center">
                  <div className="text-[var(--color-solana-green)] text-4xl font-bold mb-2">
                    100K+
                  </div>
                  <div className="text-gray-500">Compressed Accounts</div>
                </div>
              </div>
            </div>
          </BentoItem>
        </div>
      </section>

      {/* Tech Stack / Ecosystem Section */}
      <section className="py-32 border-t border-white/5 bg-black/20 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 mb-20">
          <div className="flex flex-col md:flex-row justify-between items-end">
            <h2 className="text-4xl md:text-6xl font-display font-bold">
              Powered by <br /> Giants
            </h2>
            <button className="mt-8 md:mt-0 px-8 py-4 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 transition-colors font-bold">
              View Architecture
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <TechMarquee items={TECH_STACK.slice(0, 4)} />
          <TechMarquee items={TECH_STACK.slice(4)} reverse />
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#000] to-[#050505]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-6xl md:text-8xl font-display font-bold mb-12 tracking-tighter">
            Join the <span className="text-gradient-lens">Pulse.</span>
          </h2>
          <Link
            to="/feed"
            className="inline-block px-16 py-8 bg-white text-black rounded-full font-bold text-2xl hover:scale-105 transition-transform hover:bg-[var(--color-solana-green)]"
          >
            Launch App
          </Link>
        </div>
      </section>

      <Footer />

      {/* Mint Username Modal */}
      {mintUsernameModal.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !isProcessing && closeMintUsernameModal()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-2xl p-8 max-w-lg w-full border border-[var(--color-solana-green)]/30 shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[var(--color-solana-green)] to-[#14C58E] rounded-full flex items-center justify-center">
                <IconIdentity className="w-10 h-10 text-black" />
              </div>
              <h3 className="text-3xl font-bold mb-2">Mint Your @Handle</h3>
              <p className="text-gray-400">Claim your unique identity on Solana</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-medium">
                  Choose Your Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">
                    @
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                    }
                    disabled={isProcessing}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-4 text-white text-lg outline-none focus:border-[var(--color-solana-green)] focus:bg-white/10 transition-all disabled:opacity-50"
                    placeholder="yourname"
                    maxLength={20}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-gray-500">{username.length}/20 characters</span>
                  {username.length >= 3 && (
                    <span className="text-[var(--color-solana-green)]">✓ Available</span>
                  )}
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <svg
                    className="w-4 h-4 text-[var(--color-solana-green)]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-300">Portable across all apps</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <svg
                    className="w-4 h-4 text-[var(--color-solana-green)]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-300">ZK Compressed NFT</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <svg
                    className="w-4 h-4 text-[var(--color-solana-green)]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-300">Receive tips directly</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeMintUsernameModal}
                  disabled={isProcessing}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleMintUsername}
                  disabled={isProcessing || !username || username.length < 3}
                  className="flex-1 py-4 bg-gradient-to-r from-[var(--color-solana-green)] to-[#14C58E] text-black rounded-xl font-bold hover:shadow-lg hover:shadow-[var(--color-solana-green)]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Minting...
                    </span>
                  ) : (
                    `Mint @${username || 'handle'}`
                  )}
                </motion.button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-2">
                🔒 Stored permanently on Solana • ~0.01 SOL
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
