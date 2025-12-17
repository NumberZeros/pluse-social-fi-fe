import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Pulse3D } from './Pulse3D';

interface HeroProps {
  onMintClick: () => void;
}

export function Hero({ onMintClick }: HeroProps) {
  return (
    <section className="relative z-10 min-h-screen flex flex-col justify-center px-6 max-w-[1400px] mx-auto pt-20">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-solana-green)]/30 bg-[var(--color-solana-green)]/10 backdrop-blur-sm mb-8"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-solana-green)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--color-solana-green)]"></span>
            </span>
            <span className="text-sm font-semibold text-[var(--color-solana-green)] tracking-wide uppercase">
              Live on Devnet
            </span>
          </motion.div>

          <h1 className="text-6xl sm:text-7xl md:text-8xl font-display font-bold tracking-tighter leading-[1] mb-8">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              Unleash Your
            </span>
            <br />
            Social<span className="text-[var(--color-solana-green)]">Capital</span>
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-xl leading-relaxed">
            Stop renting your audience. <span className="text-white font-bold">Own your graph.</span> Tokenize your influence. 
            The first protocol that turns social interaction into liquid assets on Solana.
          </p>

          <div className="flex flex-wrap gap-4 items-center mb-16">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMintClick}
              className="group relative px-8 py-4 bg-[var(--color-solana-green)] text-black rounded-full font-bold text-lg transition-all hover:shadow-[0_0_40px_rgba(20,241,149,0.4)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center gap-2">
                Mint @handle 
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </motion.button>
            
            <Link
              to="/what"
              className="px-8 py-4 border border-white/10 bg-white/5 backdrop-blur-sm rounded-full font-bold text-lg hover:bg-white/10 hover:border-white/30 transition-all text-white"
            >
              How it works
            </Link>
          </div>

          <div className="flex items-center gap-8 text-sm font-medium text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
              Zero Platform Fees
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
              100% On-Chain
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative hidden lg:flex items-center justify-center h-[600px]"
        >
          {/* 3D Pulse Representation */}
          <div className="relative w-full h-full flex items-center justify-center">
             <div className="absolute inset-0 bg-[var(--color-solana-green)]/10 blur-[100px] rounded-full" />
             <Pulse3D />
             
             {/* Floating holographic cards */}
             <motion.div 
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 right-10 glass-card p-4 rounded-xl border-l-4 border-l-[var(--color-solana-green)]"
             >
                <div className="text-xs text-gray-400">Total Value Locked</div>
                <div className="text-xl font-bold font-mono">$4.2M</div>
             </motion.div>
             
             <motion.div 
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-40 left-0 glass-card p-4 rounded-xl border-l-4 border-l-[var(--color-solana-purple)]"
             >
                <div className="text-xs text-gray-400">Active Creators</div>
                <div className="text-xl font-bold font-mono">12.5k</div>
             </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
