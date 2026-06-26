import { Link, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useOpenWalletModal } from '../../hooks/useOpenWalletModal';

export function CTA() {
  const navigate = useNavigate();
  const { connected } = useWallet();
  const openWalletModal = useOpenWalletModal();

  const handleStartAsCreator = () => {
    if (connected) {
      navigate('/dashboard');
    } else {
      openWalletModal();
    }
  };

  return (
    <section className="relative z-10 py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-5xl md:text-6xl font-display font-bold mb-8 tracking-tight">
          Ready to launch your{' '}
          <span className="text-[var(--color-solana-green)]">supporter community?</span>
        </h2>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          Set up your profile, launch Supporter Shares, and start posting exclusive content
          in minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="button"
            onClick={handleStartAsCreator}
            className="px-10 py-4 bg-[var(--color-solana-green)] text-black rounded-full font-bold text-lg hover:scale-105 transition-transform hover:bg-[#9FE51C]"
          >
            Start as Creator
          </button>
          <Link
            to="/explore"
            className="px-10 py-4 border border-white/20 rounded-full font-bold text-lg hover:bg-white/10 transition-colors"
          >
            Explore creators
          </Link>
        </div>
      </div>
    </section>
  );
}
