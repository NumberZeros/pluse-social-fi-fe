import { Link, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useOpenWalletModal } from '../../hooks/useOpenWalletModal';
import { Button } from '../../design-system';

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
        <h2 className="text-h1 mb-8">
          Ready to launch your{' '}
          <span className="text-primary">supporter community?</span>
        </h2>
        <p className="text-body text-muted mb-12 max-w-2xl mx-auto">
          Set up your profile, launch Supporter Shares, and start posting exclusive content
          in minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={handleStartAsCreator} className="hover:scale-105 transition-transform">
            Start as Creator
          </Button>
          <Link to="/explore">
            <Button variant="secondary" size="lg">
              Explore creators
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
