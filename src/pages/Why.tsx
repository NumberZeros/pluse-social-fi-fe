import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  X, 
  Check, 
  ShieldAlert, 
  Zap, 
  ArrowRight
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { SiteLayout } from '../components/layout/AppLayout';
import { PAGE_SEO_CONFIG } from '../lib/seo/page-config';
import { buildStaticPageSchema } from '../lib/seo/schema';
import { getButtonClassName, Card, MotionCard } from '../design-system';

const ProblemCard = ({
  title,
  description,
  delay,
}: {
  title: string;
  description: string;
  delay: number;
}) => (
  <MotionCard
    variant="glass"
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="rounded-[2rem] p-8 border border-danger/20 bg-danger/5 group hover:bg-danger/10 transition-colors"
  >
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-pill bg-danger/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
        <X className="w-6 h-6 text-danger" />
      </div>
      <div>
        <h3 className="text-h3 mb-2 text-danger">{title}</h3>
        <p className="text-small text-muted">{description}</p>
      </div>
    </div>
  </MotionCard>
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
  <MotionCard
    variant="glass"
    initial={{ opacity: 0, x: 20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="rounded-[2rem] p-8 border border-primary/20 bg-primary/5 group hover:bg-primary/10 transition-colors"
  >
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-pill bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
         <Check className="w-6 h-6 text-primary" />
      </div>
      <div>
        <h3 className="text-h3 mb-2 text-primary">
          {title}
        </h3>
        <p className="text-small text-muted">{description}</p>
      </div>
    </div>
  </MotionCard>
);

export default function Why() {
  const whyConfig = PAGE_SEO_CONFIG['/why'];
  const schema = buildStaticPageSchema(
    '/why',
    whyConfig.title,
    whyConfig.description,
    whyConfig.breadcrumbs ?? [],
  );

  return (
    <SiteLayout>
      <SEO
        title={whyConfig.title}
        description={whyConfig.description}
        keywords={whyConfig.keywords}
        image={whyConfig.ogImage}
        url="/why"
        schema={schema}
      />

      <div className="pb-20">
        <div className="max-w-[1400px] mx-auto">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-32 relative"
          >
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-danger/10 blur-[120px] rounded-full pointer-events-none" />
          
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-pill border border-danger/30 bg-danger/10 backdrop-blur-sm mb-8">
               <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-danger"></span>
              </span>
              <span className="text-sm font-bold text-danger tracking-wide uppercase">
                The Problem
              </span>
            </div>
            
            <h1 className="text-display mb-8 relative z-10">
              WEB2 IS <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-danger to-warning">
                BROKEN
              </span>
            </h1>
            <p className="text-body text-muted max-w-3xl mx-auto relative z-10">
              Web2 platforms take 30%+, own your audience, and control the algorithm.{' '}
              <span className="text-foreground font-bold">Creators deserve better.</span>
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start mb-32">
            {/* The Problems */}
            <div className="space-y-6">
              <h2 className="text-h2 mb-8 flex items-center gap-3">
                 <ShieldAlert className="w-8 h-8 text-danger" />
                 The Old Way
              </h2>
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

            {/* The Solutions */}
            <div className="space-y-6 md:mt-24">
               <h2 className="text-h2 mb-8 flex items-center gap-3 justify-end text-primary">
                 The Pulse Way
                 <Zap className="w-8 h-8" />
              </h2>
              <SolutionCard
                title="Supporter Shares"
                description="Fans buy shares to support you and unlock exclusive content — real utility, not speculation."
                delay={0.1}
              />
              <SolutionCard
                title="Direct earnings"
                description="Tips land in your wallet. Share support flows to your on-chain pool — no platform taking 30%."
                delay={0.2}
              />
              <SolutionCard
                title="Own your audience"
                description="On-chain profile and followers you control. Your community travels with you."
                delay={0.3}
              />
              <SolutionCard
                title="Exclusive content gating"
                description="Post supporter-only updates. Access verified on-chain before content renders."
                delay={0.4}
              />
              <SolutionCard
                title="Built on Solana"
                description="Fast, cheap transactions. The creator coin ecosystem is growing on Solana."
                delay={0.5}
              />
            </div>
          </div>

          {/* Why Solana */}
          <Card variant="glass" className="rounded-[3rem] p-12 md:p-20 border border-border mb-32 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          
            <h2 className="text-h2 mb-16 text-center">
              Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-info">Solana?</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-12 text-center relative z-10">
              <motion.div 
                 whileHover={{ y: -10 }}
                 className="p-8 rounded-[2rem] bg-surface-2 border border-border h-full"
              >
                <div className="text-6xl mb-6">⚡</div>
                <h3 className="text-2xl font-black mb-4">Blazing Fast</h3>
                <p className="text-muted leading-relaxed text-lg">
                  400ms block times. Posts appear instantly. Feels just like the apps you're used to, but running on-chain.
                </p>
              </motion.div>
              <motion.div 
                 whileHover={{ y: -10 }}
                 className="p-8 rounded-[2rem] bg-surface-2 border border-border h-full"
              >
                <div className="text-6xl mb-6">💰</div>
                <h3 className="text-2xl font-black mb-4">Ultra Cheap</h3>
                <p className="text-muted leading-relaxed text-lg">
                  Low transaction fees on Solana make posting, tipping, and supporting creators affordable.
                </p>
              </motion.div>
              <motion.div 
                 whileHover={{ y: -10 }}
                 className="p-8 rounded-[2rem] bg-surface-2 border border-border h-full"
              >
                <div className="text-6xl mb-6">🌐</div>
                <h3 className="text-2xl font-black mb-4">Global Scale</h3>
                <p className="text-muted leading-relaxed text-lg">
                  65,000+ TPS capacity. Built to handle millions of concurrent users without congestion or high fees.
                </p>
              </motion.div>
            </div>
          </Card>

          {/* Final Stats */}
          <div className="text-center mb-32">
            <h2 className="text-h2 mb-16 tracking-tight">
              Built for creators
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                  { value: "100%", label: "Tips to wallet", color: "text-primary" },
                  { value: "0%", label: "Platform cut on tips", color: "text-primary" },
                  { value: "1", label: "Supporter loop", color: "text-primary" },
                  { value: "∞", label: "Exclusive posts", color: "text-primary" },
              ].map((stat, i) => (
                  <MotionCard
                     key={i}
                     variant="glass"
                     initial={{ opacity: 0, scale: 0.5 }}
                     whileInView={{ opacity: 1, scale: 1 }}
                     viewport={{ once: true }}
                     className="p-8 rounded-3xl border border-border"
                  >
                    <div className={`text-5xl md:text-6xl font-black mb-2 ${stat.color}`}>
                        {stat.value}
                    </div>
                    <div className="text-sm md:text-base font-bold text-muted uppercase tracking-widest">{stat.label}</div>
                  </MotionCard>
              ))}
            </div>
            <p className="text-sm text-muted mt-8 max-w-2xl mx-auto">
              Tips: 0% platform fee. Cash out support: 10% stays in the creator&apos;s pool (not a platform cut).
            </p>
          </div>

          {/* CTA */}
          <div className="text-center pb-20">
            <h3 className="text-h2 mb-10 tracking-tight">Start building your supporter community</h3>
            <div className="flex gap-6 justify-center flex-wrap">
              <Link
                to="/dashboard"
                className={getButtonClassName('primary', 'lg', 'shadow-glow')}
              >
                Start as Creator
                 <ArrowRight className="w-6 h-6" />
              </Link>
              <Link to="/what" className={getButtonClassName('outline', 'lg')}>
                How it works
              </Link>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
