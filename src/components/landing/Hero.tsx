import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useOpenWalletModal } from '../../hooks/useOpenWalletModal';
import { getNetworkLabel } from '../../utils/constants';
import { Button, MotionCard } from '../../design-system';
import { Pulse3D } from './Pulse3D';
import { Lock, Users, Sparkles } from 'lucide-react';

export function Hero() {
  const navigate = useNavigate();
  const { connected } = useWallet();
  const openWalletModal = useOpenWalletModal();
  const networkLabel = getNetworkLabel();

  const handleStartEarning = () => {
    if (connected) {
      navigate('/dashboard');
    } else {
      openWalletModal();
    }
  };

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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-pill border border-primary/30 bg-primary/10 backdrop-blur-sm mb-8"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
            </span>
            <span className="text-sm font-semibold text-primary tracking-wide uppercase">
              Live on {networkLabel}
            </span>
          </motion.div>

          <h1 className="text-display mb-8">
            Turn your fans into{' '}
            <span className="text-primary">supporters</span>
          </h1>

          <p className="text-body text-muted mb-10 max-w-xl">
            Fans buy Supporter Shares to unlock your exclusive content. You earn directly on
            Solana — no platform taking 30%.
          </p>

          <div className="flex flex-wrap gap-4 items-center mb-16">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" onClick={handleStartEarning} className="shadow-glow">
                Start earning
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </motion.div>

            <Link to="/what">
              <Button variant="secondary" size="lg">
                See how it works
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-8 text-caption font-medium text-muted">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-muted/50" />
              Direct to wallet
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-muted/50" />
              Exclusive content gating
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative hidden lg:flex items-center justify-center h-[600px]"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full" />
            <Pulse3D />

            <MotionCard
              variant="glass"
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-16 right-4 p-4 rounded-ds-lg border-l-4 border-l-primary max-w-[200px]"
            >
              <div className="flex items-center gap-2 text-caption text-muted mb-1">
                <Lock className="w-3 h-3" />
                Supporter-only post
              </div>
              <div className="text-small font-bold">Exclusive update 🔒</div>
            </MotionCard>

            <MotionCard
              variant="glass"
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute bottom-32 left-0 p-4 rounded-ds-lg border-l-4 border-l-secondary"
            >
              <div className="flex items-center gap-2 text-caption text-muted mb-1">
                <Users className="w-3 h-3" />
                New supporter
              </div>
              <div className="text-small font-bold">Content unlocked ✨</div>
            </MotionCard>

            <MotionCard
              variant="glass"
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute top-1/2 right-8 p-3 rounded-ds-lg border border-border"
            >
              <Sparkles className="w-5 h-5 text-primary" />
            </MotionCard>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
