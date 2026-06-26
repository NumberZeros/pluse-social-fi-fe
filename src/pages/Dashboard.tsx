import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { SEO } from '../components/SEO';
import { useWallet } from '@solana/wallet-adapter-react';
import { useOpenWalletModal } from '../hooks/useOpenWalletModal';
import { useProfile } from '../hooks/useProfile';
import { useShares } from '../hooks/useShares';
import { useReadOnlySdk } from '../services/read-only-sdk';
import { useTimeline } from '../hooks/useFeed';
import { useQuery } from '@tanstack/react-query';
import { CreatorOnboardingWizard } from '../components/dashboard/CreatorOnboardingWizard';
import { PAGE_SEO_CONFIG } from '../lib/seo/page-config';
import {
  DollarSign,
  Users,
  TrendingUp,
  BarChart3,
  ExternalLink,
} from 'lucide-react';

export function Dashboard() {
  const { publicKey } = useWallet();
  const openWalletModal = useOpenWalletModal();
  const { profile, hasProfile } = useProfile(publicKey || undefined);
  const { shares } = useShares(publicKey || undefined);
  const readSdk = useReadOnlySdk();
  const { data: timeline = [], isPending: timelinePending } = useTimeline();
  const [wizardDismissed, setWizardDismissed] = useState(false);

  const tipsReceivedSol = profile
    ? (profile.totalTipsReceived.toNumber() / 1e9).toFixed(2)
    : '0.00';

  const myPosts = publicKey
    ? timeline.filter((p) => p.author === publicKey.toBase58())
    : [];

  const { data: supporters = [] } = useQuery({
    queryKey: ['creator_supporters', publicKey?.toBase58()],
    queryFn: async () => {
      if (!readSdk || !publicKey) return [];
      return readSdk.getCreatorShareHolders(publicKey);
    },
    enabled: !!readSdk && !!publicKey && !!shares,
    staleTime: 60_000,
  });

  const totalVolume = shares?.totalVolume
    ? Number(shares.totalVolume) / 1e9
    : 0;
  const supply = shares?.supply != null ? Number(shares.supply) : 0;

  if (!publicKey) {
    return (
      <AppLayout>
        <SEO
          title={PAGE_SEO_CONFIG['/dashboard'].title}
          description={PAGE_SEO_CONFIG['/dashboard'].description}
          url="/dashboard"
          noindex
        />
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-[2.5rem] p-12 text-center max-w-lg border border-[var(--color-solana-green)]/20"
          >
            <h2 className="text-3xl font-black text-white mb-4">Dashboard</h2>
            <p className="text-gray-400 text-lg mb-8">
              Connect your wallet to launch Supporter Shares and track your community.
            </p>
            <button
              type="button"
              onClick={() => openWalletModal({ toast: true })}
              className="px-8 py-4 bg-[var(--color-solana-green)] hover:bg-[#9FE51C] text-black rounded-xl font-bold transition-all"
            >
              Connect Wallet
            </button>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  const profilePath = profile?.username ? `/${profile.username}` : `/${publicKey.toBase58()}`;

  const showWizard =
    !wizardDismissed &&
    !timelinePending &&
    (!hasProfile || !shares || myPosts.length === 0);

  return (
    <AppLayout>
      <SEO
        title={PAGE_SEO_CONFIG['/dashboard'].title}
        description={PAGE_SEO_CONFIG['/dashboard'].description}
        url="/dashboard"
        noindex
      />

      <div className="max-w-[1400px] mx-auto pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-black tracking-tight">Dashboard</h1>
              <p className="text-xl text-gray-400 mt-1">
                {profile?.username ? `@${profile.username}` : 'Your creator hub'}
              </p>
            </div>
            <Link
              to="/feed"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--color-solana-green)] hover:bg-[#9FE51C] text-black rounded-xl font-bold transition-all"
            >
              + New Post
            </Link>
          </div>

          {showWizard && (
            <CreatorOnboardingWizard onComplete={() => setWizardDismissed(true)} />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={<Users className="w-5 h-5" />}
              label="Supporters"
              value={String(supporters.length)}
              sub="Wallets holding your shares"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Supporter Shares"
              value={String(supply)}
              sub={shares ? 'Pool active' : 'Pool not launched'}
            />
            <StatCard
              icon={<DollarSign className="w-5 h-5" />}
              label="Tips received"
              value={`${tipsReceivedSol} SOL`}
              sub="On-chain total"
            />
            <StatCard
              icon={<BarChart3 className="w-5 h-5" />}
              label="Support volume"
              value={`${totalVolume.toFixed(2)} SOL`}
              sub="Total pool activity"
            />
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <section>
            <h2 className="text-2xl font-black mb-6">Your Supporters</h2>
            {!shares ? (
              <div className="glass-card rounded-2xl p-8 border border-white/10 text-center text-gray-400">
                Launch Supporter Shares to start building your community.
              </div>
            ) : supporters.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 border border-white/10 text-center text-gray-400">
                No supporters yet. Share your profile and post exclusive content!
              </div>
            ) : (
              <div className="space-y-3">
                {supporters.map((s) => (
                  <div
                    key={s.publicKey}
                    className="glass-card rounded-xl p-4 border border-white/10 flex justify-between items-center"
                  >
                    <Link
                      to={`/${s.holder}`}
                      className="font-mono text-sm text-white hover:text-[var(--color-solana-green)]"
                    >
                      {s.holder.slice(0, 4)}...{s.holder.slice(-4)}
                    </Link>
                    <span className="text-[var(--color-solana-green)] font-bold">
                      {s.amount} Supporter Shares
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-black mb-6">Post performance</h2>
            <div className="glass-card rounded-2xl p-6 border border-white/10">
              {timelinePending ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-10 w-16 bg-white/10 rounded" />
                  <div className="h-4 w-32 bg-white/10 rounded" />
                </div>
              ) : (
                <>
                  <p className="text-4xl font-black mb-2">{myPosts.length}</p>
                  <p className="text-gray-400 text-sm mb-6">Total on-chain posts</p>
                  <Link
                    to={profilePath}
                    className="inline-flex items-center gap-2 text-[var(--color-solana-green)] text-sm font-medium hover:underline"
                  >
                    View public profile
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="p-6 glass-card rounded-2xl border border-white/10"
    >
      <div className="flex items-center gap-2 text-gray-400 mb-3">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-3xl font-black">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </motion.div>
  );
}
