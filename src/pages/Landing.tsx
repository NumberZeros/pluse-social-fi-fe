import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const BentoItem = ({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay }}
    className={`glass-card rounded-[2rem] p-8 hover:border-[#ABFE2C]/30 transition-all duration-500 overflow-hidden relative group ${className}`}
  >
    {children}
  </motion.div>
);

const Marquee = ({ items, reverse = false }: { items: string[], reverse?: boolean }) => (
  <div className="flex overflow-hidden py-4 group select-none">
    <div className={`flex gap-12 animate-marquee ${reverse ? 'direction-reverse' : ''} whitespace-nowrap`}>
      {[...items, ...items, ...items].map((item, i) => (
        <span key={i} className="text-4xl md:text-6xl font-display font-bold text-white/10 group-hover:text-[#ABFE2C]/20 transition-colors uppercase tracking-tighter">
          {item}
        </span>
      ))}
    </div>
  </div>
);

const TechCard = ({ tech }: { tech: any }) => (
  <div className="w-[280px] h-[200px] bg-[#111] rounded-2xl border border-white/5 flex flex-col items-center justify-center hover:border-white/20 transition-all cursor-pointer group relative overflow-hidden flex-shrink-0 mx-4">
    <div 
      className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
      style={{ background: `radial-gradient(circle at center, ${tech.color}, transparent 70%)` }}
    />
    <div className="relative z-10 text-center p-4 flex flex-col items-center">
      <div className="mb-4 text-white/80 group-hover:text-white group-hover:scale-110 transition-transform duration-300">
        {tech.icon}
      </div>
      <div className="text-xl font-bold text-white mb-1">{tech.name}</div>
      <div className="text-xs text-gray-500 font-mono group-hover:text-gray-300 transition-colors">{tech.desc}</div>
    </div>
  </div>
);

const TechMarquee = ({ items, reverse = false }: { items: any[], reverse?: boolean }) => (
  <div className="flex overflow-hidden py-4 group select-none mask-linear-gradient">
    <div className={`flex animate-marquee ${reverse ? 'direction-reverse' : ''} whitespace-nowrap`}>
      {[...items, ...items, ...items].map((item, i) => (
        <TechCard key={i} tech={item} />
      ))}
    </div>
  </div>
);

const TECH_STACK = [
  { 
    name: 'Solana', 
    desc: 'The Global State Machine', 
    color: '#9945FF',
    icon: (
      <svg viewBox="0 0 397 311" className="w-12 h-12" fill="currentColor">
        <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.8c-5.8 0-8.7-7-4.6-11.1l62.4-62.7zM64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.8c-5.8 0-8.7-7-4.6-11.1L64.6 3.8zm0 117.1c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.8c-5.8 0-8.7-7-4.6-11.1l62.4-62.7z" />
      </svg>
    )
  },
  { 
    name: 'ZK Compression', 
    desc: 'Scale to Billions', 
    color: '#ABFE2C',
    icon: (
      <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    )
  },
  { 
    name: 'Helius', 
    desc: 'Enterprise RPC & DAS', 
    color: '#F97316',
    icon: (
      <svg viewBox="0 0 24 24" className="w-12 h-12" fill="currentColor">
        <path d="M14.6 2L2 15.4h8.8L9.4 22l12.6-13.4h-8.8L14.6 2z" />
      </svg>
    )
  },
  { 
    name: 'Metaplex', 
    desc: 'Compressed NFTs', 
    color: '#FFFFFF',
    icon: (
      <svg viewBox="0 0 24 24" className="w-12 h-12" fill="currentColor">
        <path d="M2 2h20v20H2V2zm16 4h-4v12h4V6zm-6 0H8v12h4V6z" />
      </svg>
    )
  },
  { 
    name: 'Arweave', 
    desc: 'The Permaweb', 
    color: '#FFFFFF',
    icon: (
      <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 7v10M7 12h10" />
      </svg>
    )
  },
  { 
    name: 'Shadow Drive', 
    desc: 'DePIN Storage', 
    color: '#FFFFFF',
    icon: (
      <svg viewBox="0 0 24 24" className="w-12 h-12" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2-1-2-1-2 1 2 1zm0 2l-10 5 10 5 10-5-10-5z" />
      </svg>
    )
  },
  { 
    name: 'Phantom', 
    desc: 'Wallet Standard', 
    color: '#AB9FF2',
    icon: (
      <svg viewBox="0 0 24 24" className="w-12 h-12" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12v6c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-6c0-5.52-4.48-10-10-10zm0 18H4v-6c0-4.42 3.58-8 8-8s8 3.58 8 8v6h-8z" />
      </svg>
    )
  },
  { 
    name: 'Dialect', 
    desc: 'Smart Messaging', 
    color: '#4ADE80',
    icon: (
      <svg viewBox="0 0 24 24" className="w-12 h-12" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
      </svg>
    )
  }
];

export function Landing() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div ref={containerRef} className="bg-[#000000] text-white min-h-screen font-sans selection:bg-[#ABFE2C] selection:text-black">
      {/* Background Mesh */}
      <div className="fixed inset-0 z-0 mesh-gradient-lens opacity-60 pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex justify-between items-center max-w-[1400px] mx-auto w-full mix-blend-difference">
        <div className="text-2xl font-display font-bold tracking-tighter flex items-center gap-2">
          <div className="w-3 h-3 bg-[#ABFE2C] rounded-full animate-pulse" />
          Pulse
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
          <a href="#" className="hover:text-[#ABFE2C] transition-colors">Whitepaper</a>
          <a href="#" className="hover:text-[#ABFE2C] transition-colors">Ecosystem</a>
          <a href="#" className="hover:text-[#ABFE2C] transition-colors">Community</a>
        </div>
        <button className="px-6 py-3 bg-white text-black rounded-full font-bold text-sm hover:bg-[#ABFE2C] transition-colors">
          Connect Phantom
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center px-6 max-w-[1400px] mx-auto pt-20">
        <motion.div 
          style={{ opacity }}
          className="max-w-5xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8"
          >
            <span className="w-2 h-2 bg-[#ABFE2C] rounded-full" />
            <span className="text-sm font-medium text-[#ABFE2C]">MVP Live on Solana Mainnet</span>
          </motion.div>

          <h1 className="text-7xl sm:text-8xl md:text-9xl font-display font-bold tracking-tighter leading-[0.9] mb-12">
            The Social <br />
            <span className="text-white/40">Layer for</span> <br />
            <span className="text-gradient-lens">Solana</span>
          </h1>
          
          <div className="flex flex-wrap gap-6 items-center">
            <button className="px-10 py-5 bg-[#ABFE2C] text-black rounded-full font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2">
              Mint @username <span>→</span>
            </button>
            <button className="px-10 py-5 border border-white/20 rounded-full font-bold text-lg hover:bg-white/10 transition-colors">
              Explore Feed
            </button>
          </div>
        </motion.div>

        {/* Abstract 3D-like Visual */}
        <motion.div 
          style={{ y }}
          className="absolute right-0 top-1/2 -translate-y-1/2 -z-10 opacity-60 pointer-events-none hidden lg:block"
        >
          <div className="relative w-[800px] h-[800px]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#ABFE2C]/20 to-[#14F195]/20 rounded-full blur-[100px] animate-pulse-slow" />
            <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border border-white/10 rounded-full animate-[spin_20s_linear_infinite]" />
            <div className="absolute top-1/3 left-1/3 w-1/3 h-1/3 border border-[#ABFE2C]/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
          </div>
        </motion.div>
      </section>

      {/* Marquee Section */}
      <div className="border-y border-white/10 bg-black/50 backdrop-blur-sm py-12 relative z-10 overflow-hidden">
        <Marquee items={['ZK Compression', '1-Click Tipping', 'Arweave Storage', 'Solana Speed', 'Token-2022']} />
      </div>

      {/* Bento Grid Features */}
      <section className="relative z-10 py-40 px-6 max-w-[1400px] mx-auto">
        <div className="mb-32">
          <h2 className="text-5xl md:text-7xl font-display font-bold mb-8 tracking-tight">
            Social primitives <br />
            <span className="text-gray-500">reimagined on Solana.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[400px]">
          {/* Feature 1: Identity */}
          <BentoItem className="md:col-span-2 bg-gradient-to-br from-[#111] to-[#000]">
            <div className="h-full flex flex-col justify-between relative z-10">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-[#ABFE2C]/10 flex items-center justify-center text-3xl mb-8 text-[#ABFE2C]">
                  🆔
                </div>
                <h3 className="text-4xl font-display font-bold mb-4">ZK Compressed Identity</h3>
                <p className="text-gray-400 text-xl max-w-lg">
                  Mint your unique @username.pulse on-chain. Powered by ZK Compression for ultra-low costs (~/bin/zsh.001).
                </p>
              </div>
              {/* Visual representation of ID card */}
              <div className="absolute right-8 bottom-8 w-64 h-40 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md rotate-[-5deg] group-hover:rotate-0 transition-transform duration-500 p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ABFE2C] to-[#14F195]" />
                  <div className="h-3 w-24 bg-white/20 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-white/10 rounded-full" />
                  <div className="h-2 w-2/3 bg-white/10 rounded-full" />
                </div>
                <div className="mt-4 text-right text-[#ABFE2C] font-mono text-xs">@pulse.sol</div>
              </div>
            </div>
          </BentoItem>

          {/* Feature 2: Tipping */}
          <BentoItem className="bg-[#050505]">
            <div className="h-full flex flex-col">
              <h3 className="text-3xl font-display font-bold mb-4">1-Click Tipping</h3>
              <p className="text-gray-400 mb-8">
                Tip creators instantly with USDC or SOL. No signing delays.
              </p>
              <div className="flex-grow relative flex items-center justify-center">
                 <div className="relative w-32 h-32 bg-[#ABFE2C]/10 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-4xl">💸</span>
                 </div>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-[#ABFE2C]/20 rounded-full animate-[spin_4s_linear_infinite]" />
              </div>
            </div>
          </BentoItem>

          {/* Feature 3: Content */}
          <BentoItem className="md:row-span-2 bg-[#080808]">
            <div className="h-full flex flex-col">
              <div className="w-16 h-16 rounded-2xl bg-[#9945FF]/10 flex items-center justify-center text-3xl mb-8 text-[#9945FF]">
                📦
              </div>
              <h3 className="text-3xl font-display font-bold mb-4">Permanent Storage</h3>
              <p className="text-gray-400 mb-8">
                Posts, images, and videos stored on Arweave & ShdwDrive. Uncensored and permanent.
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
          <BentoItem className="md:col-span-2 bg-[#111]">
            <div className="flex flex-col md:flex-row items-center gap-12 h-full">
              <div className="flex-1">
                <h3 className="text-3xl font-display font-bold mb-4">On-Chain Graph</h3>
                <p className="text-gray-400 text-lg mb-8">
                  Follows, likes, and reposts are real on-chain events. Verified via Merkle roots for speed and security.
                </p>
                <div className="flex gap-4">
                  <span className="px-3 py-1 rounded border border-white/10 text-xs font-mono text-gray-400">Redis</span>
                  <span className="px-3 py-1 rounded border border-white/10 text-xs font-mono text-gray-400">Merkle Trees</span>
                  <span className="px-3 py-1 rounded border border-white/10 text-xs font-mono text-gray-400">Compression</span>
                </div>
              </div>
              <div className="flex-1 w-full h-full bg-[#000] rounded-xl border border-white/10 p-6 font-mono text-sm text-gray-400 overflow-hidden flex items-center justify-center">
                 <div className="text-center">
                    <div className="text-[#ABFE2C] text-4xl font-bold mb-2">100K+</div>
                    <div className="text-gray-500">Compressed Accounts</div>
                 </div>
              </div>
            </div>
          </BentoItem>
        </div>
      </section>

      {/* Tech Stack / Ecosystem Section */}
      <section className="py-32 border-t border-white/10 bg-[#050505] overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 mb-20">
          <div className="flex flex-col md:flex-row justify-between items-end">
            <h2 className="text-4xl md:text-6xl font-display font-bold">
              Powered by <br /> Giants
            </h2>
            <button className="mt-8 md:mt-0 px-8 py-4 border border-white/20 rounded-full hover:bg-white hover:text-black transition-colors font-bold">
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
            Join the <span className="text-[#ABFE2C]">Pulse.</span>
          </h2>
          <button className="px-16 py-8 bg-white text-black rounded-full font-bold text-2xl hover:scale-105 transition-transform hover:bg-[#ABFE2C]">
            Launch App
          </button>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-white/10 text-center text-gray-500 text-sm bg-black">
        <div className="flex justify-center gap-8 mb-8">
          <a href="#" className="hover:text-[#ABFE2C] transition-colors">@pulse</a>
          <a href="#" className="hover:text-[#ABFE2C] transition-colors">pulse.sol</a>
          <a href="#" className="hover:text-[#ABFE2C] transition-colors">GitHub</a>
        </div>
        <p>&copy; 2025 Pulse Protocol. All rights reserved.</p>
      </footer>
    </div>
  );
}
