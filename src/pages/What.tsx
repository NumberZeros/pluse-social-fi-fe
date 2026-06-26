import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Zap,
  Globe,
  Database,
  ArrowRight,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { PAGE_SEO_CONFIG } from '../lib/seo/page-config';
import { buildAboutPageGraph } from '../lib/seo/schema';
import { SiteLayout } from '../components/layout/AppLayout';

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
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -5 }}
    className="glass-card rounded-[2rem] p-8 border border-white/10 hover:border-[var(--color-solana-green)]/30 transition-all group"
  >
    <div className="w-16 h-16 rounded-2xl bg-[var(--color-solana-green)]/10 flex items-center justify-center mb-6 text-[var(--color-solana-green)] group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-[var(--color-solana-green)] transition-colors">{title}</h3>
    <p className="text-gray-400 leading-relaxed text-lg">{description}</p>
  </motion.div>
);

export default function What() {
  const whatConfig = PAGE_SEO_CONFIG['/what'];
  const schema = buildAboutPageGraph(
    whatConfig.title,
    whatConfig.description,
    whatConfig.breadcrumbs ?? [],
  );

  return (
    <SiteLayout>
      <SEO
        title={whatConfig.title}
        description={whatConfig.description}
        keywords={whatConfig.keywords}
        image={whatConfig.ogImage}
        url="/what"
        schema={schema}
      />

      <div className="pb-20">
        <div className="max-w-[1400px] mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-32 relative"
          >
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[var(--color-solana-green)]/10 blur-[120px] rounded-full pointer-events-none" />
           
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-solana-green)]/30 bg-[var(--color-solana-green)]/10 backdrop-blur-sm mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-solana-green)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-solana-green)]"></span>
              </span>
              <span className="text-sm font-bold text-[var(--color-solana-green)] tracking-wide uppercase">
                What is Pulse?
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 relative z-10">
              SUPPORTER <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-solana-green)] to-[#14C58E]">
                SHARES
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed relative z-10">
              Pulse helps creators earn on Solana. Fans buy{' '}
              <span className="text-white font-bold">Supporter Shares</span> to unlock
              exclusive content. Tips go to your wallet; share support flows to your on-chain pool.
            </p>
          </motion.div>

          {/* Core Features */}
          <div className="mb-32">
            <h2 className="text-4xl md:text-5xl font-black mb-16 text-center">
              Core Features
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <FeatureCard
                icon={<ShieldCheck className="w-8 h-8" />}
                title="Supporter Shares"
                description="Fans back you on-chain. Early supporters pay less as your community grows. Supporters unlock your exclusive posts."
                delay={0.1}
              />
              <FeatureCard
                icon={<Zap className="w-8 h-8" />}
                title="Direct Tips"
                description="Send SOL to creators in one click. 100% goes to their wallet — no platform cut."
                delay={0.2}
              />
              <FeatureCard
                icon={<Globe className="w-8 h-8" />}
                title="On-chain Profile & Feed"
                description="Your profile, followers, and posts live on Solana. Build an audience you own."
                delay={0.3}
              />
              <FeatureCard
                icon={<Database className="w-8 h-8" />}
                title="IPFS Content"
                description="Public preview on IPFS; full exclusive content is stored separately and fetched only after on-chain access is verified."
                delay={0.4}
              />
            </div>
          </div>

          {/* How It Works */}
          <div id="how-it-works" className="mb-32 max-w-5xl mx-auto scroll-mt-24">
            <h2 className="text-4xl md:text-5xl font-black mb-16 text-center">
              How It Works
            </h2>
            <div className="space-y-8">
              {[
                {
                  title: 'Create profile',
                  description: 'Connect your wallet and claim your on-chain username.',
                  step: '01',
                },
                {
                  title: 'Launch Supporter Shares',
                  description: 'Initialize your supporter pool from the Dashboard.',
                  step: '02',
                },
                {
                  title: 'Post exclusive content',
                  description: 'Share public updates or gate posts to supporters only.',
                  step: '03',
                },
                {
                  title: 'Fans support & unlock',
                  description: 'Supporters buy shares, unlock your feed, and can tip you.',
                  step: '04',
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col md:flex-row gap-8 items-start glass-card p-10 rounded-[2.5rem] border border-white/10"
                >
                  <div className="flex-shrink-0 w-20 h-20 rounded-[2rem] bg-[#0A0A0A] border border-[var(--color-solana-green)]/30 flex items-center justify-center text-[var(--color-solana-green)] font-black text-3xl shadow-[0_0_20px_rgba(20,241,149,0.1)]">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-4">{item.title}</h3>
                    <p className="text-gray-400 text-lg leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Built on */}
          <div className="glass-card rounded-[3rem] p-12 md:p-20 border border-white/10 bg-gradient-to-b from-white/5 to-transparent text-center relative overflow-hidden">
             <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--color-solana-green)] to-transparent opacity-50" />
            
            <h2 className="text-4xl md:text-5xl font-black mb-16">
              How it&apos;s built
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { icon: <Zap className="w-8 h-8 mb-4 mx-auto text-[var(--color-solana-green)]" />, title: "Solana", subtitle: "Fast, low-cost txs" },
                { icon: <Database className="w-8 h-8 mb-4 mx-auto text-purple-400" />, title: "IPFS via Pinata", subtitle: "Decentralized post storage" },
                { icon: <Globe className="w-8 h-8 mb-4 mx-auto text-orange-400" />, title: "On-chain shares", subtitle: "Verified supporter access" },
              ].map((tech, i) => (
                <motion.div 
                   key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                   className="flex flex-col items-center"
                >
                  {tech.icon}
                  <div className="text-2xl font-black mb-2">{tech.title}</div>
                  <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">{tech.subtitle}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-32 text-center pb-20">
            <h3 className="text-4xl md:text-5xl font-black mb-10 tracking-tight">Ready to launch your supporter community?</h3>
            <div className="flex gap-6 justify-center flex-wrap">
              <Link
                to="/dashboard"
                className="px-10 py-5 bg-[var(--color-solana-green)] text-black rounded-full font-black text-xl hover:scale-105 transition-transform shadow-xl shadow-[var(--color-solana-green)]/20 flex items-center gap-2"
              >
                Start as Creator
                <ArrowRight className="w-6 h-6" />
              </Link>
              <Link
                to="/explore"
                className="px-10 py-5 border border-white/20 rounded-full font-bold text-xl hover:bg-white/10 transition-colors"
              >
                Explore creators
              </Link>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

