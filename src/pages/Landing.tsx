import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useWallet } from '../lib/wallet-adapter';
import { WalletButton } from '../lib/wallet-adapter/components';
import { toast } from 'react-hot-toast';
import { useUIStore } from '../stores/useUIStore';
import { useUserStore } from '../stores/useUserStore';
import { PulseMark } from '../components/icons/PulseIcons';
import Footer from '../components/layout/Footer';

// New Landing Components
import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';
import { Community } from '../components/landing/Community';
import { CTA } from '../components/landing/CTA';
import { App3DBackground } from '../components/layout/App3DBackground';

export function Landing() {
  const { connected, publicKey } = useWallet();
  const { openMintUsernameModal } = useUIStore();
  const setReferredBy = useUserStore((state) => state.setReferredBy);
  const [searchParams] = useSearchParams();

  // Handle referral code from URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode && connected && publicKey) {
      setReferredBy(refCode);
      toast.success('Welcome! You were referred by a friend 🎉');
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('ref');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams, connected, publicKey, setReferredBy]);

  return (
    <div className="bg-[#000000] text-white min-h-screen font-sans selection:bg-[var(--color-solana-green)] selection:text-black overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 mesh-gradient-lens opacity-40 pointer-events-none" />
      <App3DBackground />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex justify-between items-center max-w-[1400px] mx-auto w-full bg-black/50 backdrop-blur-lg border-b border-white/5 transition-all duration-300">
        <Link
          to="/"
          className="text-2xl font-display font-bold tracking-tighter flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <PulseMark className="w-8 h-8" />
          Pulse
        </Link>
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
          <Link
            to="/"
            className="text-[var(--color-solana-green)]"
          >
            Home
          </Link>
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

      {/* Hero Section */}
      <Hero onMintClick={openMintUsernameModal} />

      {/* Features Overview */}
      <Features />

      {/* Community / Join Us */}
      <Community />

      {/* Call to Action */}
      <CTA />

      <Footer />

      {/* Modals */}

    </div>
  );
}
