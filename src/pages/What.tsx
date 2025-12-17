import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Zap,
  Globe,
  Database,
  ArrowRight,
  Cpu
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar'; // Using the main Navbar now for consistency
import Footer from '../components/layout/Footer';
import { App3DBackground } from '../components/layout/App3DBackground';

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
  return (
    <div className="bg-[#000000] text-white min-h-screen font-sans overflow-x-hidden selection:bg-[var(--color-solana-green)]/30">
      <App3DBackground />
      <Navbar />

      {/* Content */}
      <main className="relative z-10 pt-32 pb-20 px-6">
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
            
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-8 relative z-10">
              THE SOCIAL <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-solana-green)] to-[#14C58E]">
                LAYER
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed relative z-10">
              Pulse is a decentralized social platform where you truly own your identity,
              content, and connections. Built on <span className="text-white font-bold">Solana</span> for speed, powered by <span className="text-white font-bold">ZK Compression</span> for affordability.
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
                title="Own Your Identity"
                description="Mint your @username as an on-chain identity. Portable across all apps. Never lose access to your handle."
                delay={0.1}
              />
              <FeatureCard
                icon={<Zap className="w-8 h-8" />}
                title="Instant Tipping"
                description="Send SOL to creators in one click. No copying wallet addresses. Direct support for content you love."
                delay={0.2}
              />
              <FeatureCard
                icon={<Globe className="w-8 h-8" />}
                title="Portable Social Graph"
                description="Your followers, posts, and reputation are stored on-chain. Take your audience anywhere."
                delay={0.3}
              />
              <FeatureCard
                icon={<Database className="w-8 h-8" />}
                title="Permanent Storage"
                description="Content stored on Arweave/Shadow Drive. Cannot be censored or deleted by any central authority."
                delay={0.4}
              />
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-32 max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black mb-16 text-center">
              How It Works
            </h2>
            <div className="space-y-8">
              {[
                {
                  title: "Connect Your Wallet",
                  description: "Use Phantom, Solflare, or any Solana wallet. One click to sign in, no passwords required.",
                  step: "01"
                },
                {
                  title: "Mint Your Identity",
                  description: "Claim @yourname using ZK Compression. Costs ~0.001 SOL, yours forever.",
                  step: "02"
                },
                {
                  title: "Post & Build Reputation",
                  description: "Share content, tips, and earn airdrop points. Your activity creates your on-chain resume.",
                  step: "03"
                }
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

          {/* Tech Stack */}
          <div className="glass-card rounded-[3rem] p-12 md:p-20 border border-white/10 bg-gradient-to-b from-white/5 to-transparent text-center relative overflow-hidden">
             <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--color-solana-green)] to-transparent opacity-50" />
            
            <h2 className="text-4xl md:text-5xl font-black mb-16">
              Built on Giants
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              {[
                { icon: <Zap className="w-8 h-8 mb-4 mx-auto text-[var(--color-solana-green)]" />, title: "Solana", subtitle: "65K TPS" },
                { icon: <Cpu className="w-8 h-8 mb-4 mx-auto text-blue-400" />, title: "ZK Compression", subtitle: "1000x Scale" },
                { icon: <Database className="w-8 h-8 mb-4 mx-auto text-purple-400" />, title: "Arweave", subtitle: "Permanent Data" },
                { icon: <Globe className="w-8 h-8 mb-4 mx-auto text-orange-400" />, title: "Metaplex", subtitle: "NFT Standards" },
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
            <h3 className="text-4xl md:text-6xl font-black mb-10 tracking-tight">Ready to dive in?</h3>
            <div className="flex gap-6 justify-center flex-wrap">
              <Link
                to="/feed"
                className="px-10 py-5 bg-[var(--color-solana-green)] text-black rounded-full font-black text-xl hover:scale-105 transition-transform shadow-xl shadow-[var(--color-solana-green)]/20 flex items-center gap-2"
              >
                Launch App
                <ArrowRight className="w-6 h-6" />
              </Link>
              <Link
                to="/why"
                className="px-10 py-5 border border-white/20 rounded-full font-bold text-xl hover:bg-white/10 transition-colors"
              >
                Why Pulse?
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

