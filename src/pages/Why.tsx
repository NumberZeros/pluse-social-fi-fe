import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  X, 
  Check, 
  ShieldAlert, 
  Zap, 
  ArrowRight
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { App3DBackground } from '../components/layout/App3DBackground';

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
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="glass-card rounded-[2rem] p-8 border border-red-500/20 bg-red-500/5 group hover:bg-red-500/10 transition-colors"
  >
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
        <X className="w-6 h-6 text-red-500" />
      </div>
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
    initial={{ opacity: 0, x: 20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="glass-card rounded-[2rem] p-8 border border-[var(--color-solana-green)]/20 bg-[var(--color-solana-green)]/5 group hover:bg-[var(--color-solana-green)]/10 transition-colors"
  >
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-full bg-[var(--color-solana-green)]/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
         <Check className="w-6 h-6 text-[var(--color-solana-green)]" />
      </div>
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
    <div className="bg-[#000000] text-white min-h-screen font-sans overflow-x-hidden selection:bg-[var(--color-solana-green)]/30">
      <App3DBackground />
      <Navbar />

      {/* Content */}
      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-[1400px] mx-auto">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-32 relative"
          >
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-red-500/10 blur-[120px] rounded-full pointer-events-none" />
          
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 backdrop-blur-sm mb-8">
               <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-sm font-bold text-red-400 tracking-wide uppercase">
                The Problem
              </span>
            </div>
            
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-8 relative z-10">
              WEB2 IS <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                BROKEN
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed relative z-10">
              Social media platforms control your data, extract all the value, and can ban
              you anytime. <span className="text-white font-bold">It's time for a revolution.</span>
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start mb-32">
            {/* The Problems */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-black mb-8 flex items-center gap-3">
                 <ShieldAlert className="w-8 h-8 text-red-500" />
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
               <h2 className="text-3xl md:text-4xl font-black mb-8 flex items-center gap-3 justify-end text-[var(--color-solana-green)]">
                 The Pulse Way
                 <Zap className="w-8 h-8" />
              </h2>
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
                title="Open & Permissionless"
                description="Any developer can build on Pulse. No permissions needed. True innovation without platform gatekeepers."
                delay={0.5}
              />
            </div>
          </div>

          {/* Why Solana */}
          <div className="glass-card rounded-[3rem] p-12 md:p-20 border border-white/10 mb-32 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--color-solana-purple)]/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          
            <h2 className="text-4xl md:text-5xl font-black mb-16 text-center">
              Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Solana?</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-12 text-center relative z-10">
              <motion.div 
                 whileHover={{ y: -10 }}
                 className="p-8 rounded-[2rem] bg-white/5 border border-white/10 h-full"
              >
                <div className="text-6xl mb-6">⚡</div>
                <h3 className="text-2xl font-black mb-4">Blazing Fast</h3>
                <p className="text-gray-400 leading-relaxed text-lg">
                  400ms block times. Posts appear instantly. Feels just like the apps you're used to, but running on-chain.
                </p>
              </motion.div>
              <motion.div 
                 whileHover={{ y: -10 }}
                 className="p-8 rounded-[2rem] bg-white/5 border border-white/10 h-full"
              >
                <div className="text-6xl mb-6">💰</div>
                <h3 className="text-2xl font-black mb-4">Ultra Cheap</h3>
                <p className="text-gray-400 leading-relaxed text-lg">
                  ZK Compression makes on-chain actions cost fractions of a penny (~$0.0001). Finally, scalable social.
                </p>
              </motion.div>
              <motion.div 
                 whileHover={{ y: -10 }}
                 className="p-8 rounded-[2rem] bg-white/5 border border-white/10 h-full"
              >
                <div className="text-6xl mb-6">🌐</div>
                <h3 className="text-2xl font-black mb-4">Global Scale</h3>
                <p className="text-gray-400 leading-relaxed text-lg">
                  65,000+ TPS capacity. Built to handle millions of concurrent users without congestion or high fees.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Final Stats */}
          <div className="text-center mb-32">
            <h2 className="text-3xl md:text-5xl font-black mb-16 tracking-tight">
              The Numbers Don't Lie
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                  { value: "1000x", label: "Cost Reduction", color: "text-[var(--color-solana-green)]" },
                  { value: "100%", label: "Creator Revenue", color: "text-[var(--color-solana-green)]" },
                  { value: "Forever", label: "Content Storage", color: "text-[var(--color-solana-green)]" },
                  { value: "0", label: "Platform Fees", color: "text-[var(--color-solana-green)]" },
              ].map((stat, i) => (
                  <motion.div 
                     key={i}
                     initial={{ opacity: 0, scale: 0.5 }}
                     whileInView={{ opacity: 1, scale: 1 }}
                     viewport={{ once: true }}
                     className="glass-card p-8 rounded-3xl border border-white/10"
                  >
                    <div className={`text-5xl md:text-6xl font-black mb-2 ${stat.color}`}>
                        {stat.value}
                    </div>
                    <div className="text-sm md:text-base font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                  </motion.div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center pb-20">
            <h3 className="text-4xl md:text-6xl font-black mb-10 tracking-tight">Join the revolution</h3>
            <div className="flex gap-6 justify-center flex-wrap">
              <Link
                to="/feed"
                 className="px-10 py-5 bg-[var(--color-solana-green)] text-black rounded-full font-black text-xl hover:scale-105 transition-transform shadow-xl shadow-[var(--color-solana-green)]/20 flex items-center gap-2"
              >
                Start Using Pulse
                 <ArrowRight className="w-6 h-6" />
              </Link>
              <Link
                to="/what"
                className="px-10 py-5 border border-white/20 rounded-full font-bold text-xl hover:bg-white/10 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
