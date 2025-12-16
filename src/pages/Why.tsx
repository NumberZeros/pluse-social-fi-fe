import { Link } from 'react-router-dom';
import { WalletButton } from '../lib/wallet-adapter/components';
import { motion } from 'framer-motion';
import { PulseMark } from '../components/icons/PulseIcons';
import Footer from '../components/layout/Footer';

const ProblemCard = ({
  title,
  description,
  delay,
}: {
  title: string;
  description: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="glass-card rounded-2xl p-6 border border-red-500/20 bg-red-500/5"
  >
    <div className="flex items-start gap-3">
      <div className="text-2xl">❌</div>
      <div>
        <h3 className="text-xl font-bold mb-2 text-red-400">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  </motion.div>
);

const SolutionCard = ({
  title,
  description,
  delay,
}: {
  title: string;
  description: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="glass-card rounded-2xl p-6 border border-[var(--color-solana-green)]/20 bg-[var(--color-solana-green)]/5"
  >
    <div className="flex items-start gap-3">
      <div className="text-2xl">✅</div>
      <div>
        <h3 className="text-xl font-bold mb-2 text-[var(--color-solana-green)]">
          {title}
        </h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  </motion.div>
);

export default function Why() {
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
          <Link to="/why" className="text-[var(--color-solana-green)]">
            Why
          </Link>
          <Link
            to="/guide"
            className="hover:text-[var(--color-solana-green)] transition-colors"
          >
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
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8">
            <span className="text-sm font-medium text-[var(--color-solana-green)]">
              Why Pulse?
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-8">
            Web2 is Broken. <br />
            <span className="text-gradient-lens">Web3 Fixes This.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Social media platforms control your data, extract all the value, and can ban
            you anytime. It's time for a better way.
          </p>
        </motion.div>

        {/* The Problems */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-center">
            The Problems with Web2 Social
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Traditional platforms have fundamental issues that hurt both creators and
            users
          </p>
          <div className="space-y-4">
            <ProblemCard
              title="Platform Risk"
              description="Your account can be banned or suspended without warning. Years of content and followers gone in an instant."
              delay={0.1}
            />
            <ProblemCard
              title="Zero Ownership"
              description="You don't own your username, content, or followers. The platform owns everything and can change rules anytime."
              delay={0.2}
            />
            <ProblemCard
              title="Value Extraction"
              description="Platforms make billions from your content and data. You get nothing. Creators earn pennies while platforms take 30-50% cuts."
              delay={0.3}
            />
            <ProblemCard
              title="Data Silos"
              description="Your social graph is locked in. Can't take followers to other platforms. Start from zero every time."
              delay={0.4}
            />
            <ProblemCard
              title="Censorship"
              description="Arbitrary content moderation. No appeals. No transparency. What you can say is controlled by corporations."
              delay={0.5}
            />
          </div>
        </div>

        {/* The Solutions */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-center">
            How Pulse Solves This
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Blockchain technology enables true ownership and freedom
          </p>
          <div className="space-y-4">
            <SolutionCard
              title="You Own Your Identity"
              description="Your @username is an NFT you control. Nobody can take it away. Use it across any app built on Pulse."
              delay={0.1}
            />
            <SolutionCard
              title="You Own Your Content"
              description="Posts stored on permanent storage (Arweave). Cannot be deleted or censored. Your content lives forever."
              delay={0.2}
            />
            <SolutionCard
              title="You Keep the Value"
              description="Receive tips directly to your wallet. 100% goes to you. Build token-gated communities and monetize your way."
              delay={0.3}
            />
            <SolutionCard
              title="Portable Social Graph"
              description="Your followers are on-chain. Take them to any app in the ecosystem. Your audience is truly yours."
              delay={0.4}
            />
            <SolutionCard
              title="Open & Composable"
              description="Any developer can build on Pulse. No permissions needed. True innovation without platform gatekeepers."
              delay={0.5}
            />
          </div>
        </div>

        {/* Why Solana */}
        <div className="glass-card rounded-3xl p-8 md:p-12 border border-white/10 mb-20">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-8 text-center">
            Why Solana?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Fast</h3>
              <p className="text-gray-400">
                400ms block times. Posts appear instantly. Feels like Web2.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-2">Cheap</h3>
              <p className="text-gray-400">
                ZK Compression makes posts cost ~$0.0001. Actually sustainable.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🌐</div>
              <h3 className="text-xl font-bold mb-2">Scalable</h3>
              <p className="text-gray-400">
                65,000 TPS. Can handle millions of users without congestion.
              </p>
            </div>
          </div>
        </div>

        {/* Final Stats */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-12">
            The Numbers Don't Lie
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold text-[var(--color-solana-green)] mb-2">
                1000x
              </div>
              <div className="text-sm text-gray-400">Cost Reduction</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[var(--color-solana-green)] mb-2">
                100%
              </div>
              <div className="text-sm text-gray-400">Creator Revenue</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[var(--color-solana-green)] mb-2">
                Forever
              </div>
              <div className="text-sm text-gray-400">Content Storage</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[var(--color-solana-green)] mb-2">
                0
              </div>
              <div className="text-sm text-gray-400">Platform Fees</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h3 className="text-3xl font-display font-bold mb-6">Join the revolution</h3>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/feed"
              className="px-8 py-4 bg-[var(--color-solana-green)] text-black rounded-full font-bold hover:scale-105 transition-transform"
            >
              Start Using Pulse
            </Link>
            <Link
              to="/what"
              className="px-8 py-4 border border-white/20 rounded-full font-bold hover:bg-white/10 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
