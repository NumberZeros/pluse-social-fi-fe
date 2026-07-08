import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { SEO } from '../components/SEO';
import { PAGE_SEO_CONFIG } from '../lib/seo/page-config';
import { buildGuidePageSchema } from '../lib/seo/schema';
import { FAQ_ITEMS, GUIDE_SECTIONS } from '../lib/seo/guide-data';
import { Input, Card, MotionCard, getButtonClassName } from '../design-system';
import {
  User,
  TrendingUp,
  MessageSquare,
  Crown,
  DollarSign,
  BookOpen,
  ArrowRight,
  Search,
  ArrowUp,
  HelpCircle,
  Hash,
} from 'lucide-react';

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
  <MotionCard
    variant="glass"
    id={id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="rounded-2xl p-8 border border-border hover:border-primary/30 transition-all scroll-mt-24 group"
  >
    <div className="flex items-start gap-5 mb-8">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div>
        <h3 className="text-h3 mb-2 text-foreground group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-body text-muted">{description}</p>
      </div>
    </div>
    <div className="space-y-4 pl-4 border-l-2 border-border">
      {steps.map((step, index) => (
        <div key={index} className="flex items-start gap-4">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary mt-0.5">
            {index + 1}
          </div>
          <p className="text-muted leading-relaxed">{step}</p>
        </div>
      ))}
    </div>
  </MotionCard>
);

const QuickTip = ({ text, delay }: { text: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay }}
    className="flex items-start gap-4 p-5 rounded-2xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors"
  >
    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-primary/20">
      <ArrowRight className="w-3 h-3 text-background" />
    </div>
    <p className="text-muted leading-relaxed font-medium">{text}</p>
  </motion.div>
);

const iconMap: Record<string, React.ReactNode> = {
  'create-profile': <User className="w-8 h-8" />,
  'supporter-shares': <TrendingUp className="w-8 h-8" />,
  'exclusive-posts': <MessageSquare className="w-8 h-8" />,
  'support-creator': <Crown className="w-8 h-8" />,
  tipping: <DollarSign className="w-8 h-8" />,
};

const guides = GUIDE_SECTIONS.map((section) => ({
  ...section,
  icon: iconMap[section.id] ?? <BookOpen className="w-8 h-8" />,
}));

const faqs = FAQ_ITEMS;

const quickTips = [
  'Use Dashboard onboarding to go from zero to first post in minutes',
  'Supporter-only posts are enforced client-side with on-chain share verification',
  'Pinata (VITE_PINATA_JWT) is required for production post storage',
  'Tips are peer-to-peer with no platform fee',
  'Press D to jump to Dashboard, F for Feed, E for Explore',
];

export default function UserGuide() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Handle scroll for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // Added dependency array for safety

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

  const guideConfig = PAGE_SEO_CONFIG['/guide'];
  const schema = buildGuidePageSchema(guideConfig.breadcrumbs ?? []);

  return (
    <AppLayout>
      <SEO
        title={guideConfig.title}
        description={guideConfig.description}
        keywords={guideConfig.keywords}
        image={guideConfig.ogImage}
        url="/guide"
        schema={schema}
      />
      {/* Content */}
      <div className="max-w-6xl mx-auto pb-20">
        {/* Hero */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
           className="text-center mb-20 relative"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-surface-2 backdrop-blur-sm mb-8">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary uppercase tracking-wider">
              Knowledge Base
            </span>
          </div>
          <h1 className="text-display mb-8">
            Welcome to <br />
            <span className="text-gradient-brand">Pulse Social</span>
          </h1>
          <p className="text-body text-muted max-w-2xl mx-auto mb-12">
            Learn how Supporter Shares work — from launching your pool to gating exclusive posts for fans on Solana.
          </p>

          {/* Search Box */}
          <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="max-w-xl mx-auto"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-[var(--gradient-green-end)] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted group-hover:text-primary transition-colors z-10" />
                 <Input
                   type="text"
                   placeholder="How do I..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="h-auto pl-16 pr-6 py-5 rounded-ds-xl text-lg shadow-xl"
                 />
              </div>
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
          <Card variant="glass" className="rounded-3xl p-8 border border-border">
            <div className="flex items-center gap-3 mb-6">
              <Hash className="w-6 h-6 text-primary" />
              <h2 className="text-h3">Quick Navigation</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {guides.map((guide) => (
                <a
                  key={guide.id}
                  href={`#${guide.id}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-2 hover:bg-primary/10 hover:border-primary/30 border border-border transition-all text-sm font-medium text-muted hover:text-foreground group"
                >
                  <span className="text-muted group-hover:text-primary transition-colors">{guide.icon}</span>
                  <span>{guide.title.split(' - ')[0]}</span>
                </a>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Getting Started */}
        <div className="mb-20">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-h2 mb-8 flex items-center gap-4"
          >
             Getting Started
             <div className="h-px flex-1 bg-surface-2"></div>
          </motion.h2>
          <MotionCard
            variant="glass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-3xl p-8 border border-primary/20 bg-primary/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <h3 className="text-h3 mb-6 text-foreground relative z-10">
              First Time Setup
            </h3>
            <div className="grid gap-6 relative z-10">
              {[
                  'Install a Solana wallet like Phantom, Solflare, or Backpack from their official websites',
                  'Fund your wallet with SOL (you can buy on exchanges or use a faucet for devnet)',
                  'Click "Select Wallet" in the top right corner of Pulse and connect your wallet',
                  'Approve the connection in your wallet popup',
                  'You\'re ready to go! Your wallet address is now your Pulse identity'
              ].map((text, i) => (
                 <div key={i} className="flex gap-4 items-center bg-background/20 p-4 rounded-xl border border-border">
                    <div className="w-8 h-8 rounded-full bg-primary text-background font-bold flex items-center justify-center flex-shrink-0">
                       {i + 1}
                    </div>
                    <p className="text-foreground font-medium">{text}</p>
                 </div>
              ))}
            </div>
          </MotionCard>
        </div>

        {/* Feature Guides */}
        <div className="mb-20">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-h2 mb-8 flex items-center gap-4"
          >
            Feature Guides
            {searchQuery && (
              <span className="text-lg text-muted font-normal">
                ({filteredGuides.length} result{filteredGuides.length !== 1 ? 's' : ''})
              </span>
            )}
            <div className="h-px flex-1 bg-surface-2"></div>
          </motion.h2>
          
          {filteredGuides.length > 0 ? (
            <div className="space-y-8">
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
            <MotionCard
              variant="glass"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl p-16 border border-border text-center border-dashed"
            >
              <Search className="w-16 h-16 text-muted mx-auto mb-6" />
              <p className="text-muted text-xl font-bold">
                No guides found for "{searchQuery}"
              </p>
              <p className="text-muted mt-2">
                Try different keywords like "supporter", "tip", "exclusive", or "dashboard"
              </p>
            </MotionCard>
          )}
        </div>

        {/* Quick Tips */}
        <div className="mb-20">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-h2 mb-8 flex items-center gap-4"
          >
            Quick Tips & Best Practices
            <div className="h-px flex-1 bg-surface-2"></div>
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-6">
            {quickTips.map((tip, index) => (
              <QuickTip key={index} text={tip} delay={0.1 * index + 0.7} />
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-10">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-h2 mb-8 flex items-center gap-4"
          >
            Frequently Asked Questions
            <div className="h-px flex-1 bg-surface-2"></div>
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <MotionCard
                key={index}
                variant="glass"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index + 0.8 }}
                className="rounded-2xl p-8 border border-border hover:bg-surface-2 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-surface-2 flex-shrink-0">
                     <HelpCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-3 text-foreground">{faq.q}</h3>
                    <p className="text-muted leading-relaxed text-sm">{faq.a}</p>
                  </div>
                </div>
              </MotionCard>
            ))}
          </div>
        </div>

        {/* Coming soon (deferred MVP features) */}
        <div id="coming-soon" className="mb-20 scroll-mt-24">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-h2 mb-8 flex items-center gap-4"
          >
            Coming later
            <div className="h-px flex-1 bg-surface-2" />
          </motion.h2>
          <p className="text-muted mb-6 max-w-2xl">
            These features exist in the smart contract but are intentionally deferred from the MVP
            so we can focus on the supporter loop: buy shares → unlock content → creators earn.
          </p>
          <ul className="grid sm:grid-cols-2 gap-3 text-sm text-muted">
            {[
              'Username marketplace',
              'Groups & communities',
              'Governance & staking',
              'Subscription tiers',
              'Post NFT minting',
              'Reposts & airdrop',
            ].map((item) => (
              <li
                key={item}
                className="px-4 py-3 rounded-xl bg-surface-2 border border-border text-muted"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Need Help */}
        <MotionCard
          variant="glass"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="rounded-3xl p-12 border border-border text-center bg-gradient-to-b from-foreground/5 to-transparent"
        >
          <h2 className="text-h2 mb-4">Need More Help?</h2>
          <p className="text-muted mb-8 max-w-2xl mx-auto text-lg">
            Join our community channels for support, feature requests, and discussions with
            other Pulse users. We are here to help!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://discord.gg/pulse"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-[var(--color-discord)] hover:bg-[var(--color-discord-hover)] text-foreground rounded-pill font-bold transition-all shadow-lg hover:shadow-[var(--color-discord)]/50 hover:-translate-y-1"
            >
              Join Discord
            </a>
            <a
              href="https://twitter.com/pulsesocial"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-background hover:bg-surface-2 text-foreground rounded-pill font-bold transition-all border border-border hover:border-border hover:-translate-y-1 flex items-center gap-2"
            >
              Follow on X
            </a>
            <a
              href="https://t.me/pulsesocial"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-[var(--color-telegram)] hover:bg-[var(--color-telegram-hover)] text-foreground rounded-pill font-bold transition-all shadow-lg hover:shadow-[var(--color-telegram)]/50 hover:-translate-y-1"
            >
              Join Telegram
            </a>
          </div>
        </MotionCard>
      </div>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className={`fixed bottom-8 right-8 z-40 w-14 h-14 !p-0 ${getButtonClassName('primary', 'sm', 'shadow-glow')}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUp className="w-8 h-8" />
          </motion.button>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
