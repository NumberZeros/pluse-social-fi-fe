import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useQueryClient } from '@tanstack/react-query';
import { X, Droplets, UserPlus, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWalletHealth } from '../../hooks/useWalletHealth';
import { requestDevnetAirdrop } from '../../utils/devnet-airdrop';
import { Button, getButtonClassName } from '../../design-system';

const STORAGE_KEY = 'pulse-wallet-onboarding-dismissed';

export function WalletOnboardingSheet() {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();
  const { balanceSol, needsProfile, needsDevnetSol, networkLabel, minSolBalance, isLoading } =
    useWalletHealth();
  const [visible, setVisible] = useState(false);
  const [airdropping, setAirdropping] = useState(false);

  useEffect(() => {
    if (!connected || !publicKey || isLoading) {
      setVisible(false);
      return;
    }

    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed === publicKey.toBase58()) return;

    const timer = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(timer);
  }, [connected, publicKey, isLoading]);

  const dismiss = () => {
    if (publicKey) {
      localStorage.setItem(STORAGE_KEY, publicKey.toBase58());
    }
    setVisible(false);
  };

  const handleAirdrop = async () => {
    if (!publicKey) return;
    setAirdropping(true);
    const toastId = toast.loading('Requesting devnet SOL...');
    try {
      await requestDevnetAirdrop(connection, publicKey);
      await queryClient.invalidateQueries({ queryKey: ['wallet_balance'] });
      toast.success('Airdrop received!', { id: toastId });
    } catch (err) {
      console.error('Airdrop failed:', err);
      toast.error(
        'Airdrop failed — try the faucet at faucet.solana.com',
        { id: toastId },
      );
    } finally {
      setAirdropping(false);
    }
  };

  if (!connected) return null;

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/60 backdrop-blur-sm"
            onClick={dismiss}
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-0 inset-x-0 z-[61] lg:bottom-auto lg:top-24 lg:right-6 lg:left-auto lg:w-96"
            role="dialog"
            aria-labelledby="wallet-onboarding-title"
          >
            <div className="bg-surface border border-border rounded-t-2xl lg:rounded-2xl shadow-2xl p-6 m-0 lg:m-0">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 id="wallet-onboarding-title" className="font-bold text-foreground">
                      Wallet connected
                    </h2>
                    <p className="text-xs text-muted">{networkLabel}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={dismiss}
                  className="p-1.5 rounded-full hover:bg-surface-2 text-muted"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-muted mb-4">
                Balance: <strong className="text-foreground">{balanceSol.toFixed(4)} SOL</strong>
              </p>

              <ol className="space-y-3 mb-6">
                {needsDevnetSol && (
                  <li className="flex gap-3 items-start text-sm">
                    <Droplets className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-muted">
                        Get at least {minSolBalance} SOL for transactions on devnet.
                      </p>
                      <button
                        type="button"
                        onClick={handleAirdrop}
                        disabled={airdropping}
                        className="mt-2 text-primary text-xs font-semibold hover:underline disabled:opacity-50"
                      >
                        {airdropping ? 'Requesting...' : 'Request devnet airdrop'}
                      </button>
                    </div>
                  </li>
                )}
                {needsProfile && (
                  <li className="flex gap-3 items-start text-sm">
                    <UserPlus className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-muted">
                      Create your on-chain profile to post and launch Supporter Shares.
                    </p>
                  </li>
                )}
                {!needsDevnetSol && !needsProfile && (
                  <li className="text-sm text-muted">You&apos;re all set — start posting!</li>
                )}
              </ol>

              <div className="flex gap-2">
                {needsProfile && (
                  <Link
                    to="/dashboard"
                    onClick={dismiss}
                    className={getButtonClassName('primary', 'sm', 'flex-1 text-center')}
                  >
                    Go to Dashboard
                  </Link>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={dismiss}
                  className={needsProfile ? '' : 'flex-1'}
                >
                  Got it
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
