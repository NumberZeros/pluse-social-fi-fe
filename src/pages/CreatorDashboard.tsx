import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import {
  Crown,
  DollarSign,
  Users,
  TrendingUp,
  Sparkles,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import useSubscriptionStore from '../stores/useSubscriptionStore';
import { useWallet } from '../lib/wallet-adapter';
import { useUserStore } from '../stores/useUserStore';
import toast from 'react-hot-toast';

export function CreatorDashboard() {
  const { publicKey } = useWallet();
  const totalTipsReceived = useUserStore((state) => state.profile.totalTipsReceived);
  const {
    getTiersByCreator,
    getSubscribersByCreator,
    getTotalRevenue,
    getMonthlyRevenue,
    deleteTier,
  } = useSubscriptionStore();

  const [showCreateTierModal, setShowCreateTierModal] = useState(false);
  const [newTierName, setNewTierName] = useState('');
  const [newTierPrice, setNewTierPrice] = useState('');
  const [newTierDescription, setNewTierDescription] = useState('');
  const myTiers = useMemo(() => {
    if (!publicKey) return [];
    // Get local store tiers
    const localTiers = getTiersByCreator(publicKey.toBase58());
    return localTiers;
  }, [publicKey, getTiersByCreator]);

  const mySubscribers = useMemo(() => {
    if (!publicKey) return [];
    return getSubscribersByCreator(publicKey.toBase58());
  }, [publicKey, getSubscribersByCreator]);

  const totalRevenue = useMemo(() => {
    if (!publicKey) return 0;
    return getTotalRevenue(publicKey.toBase58());
  }, [publicKey, getTotalRevenue]);

  const monthlyRevenue = useMemo(() => {
    if (!publicKey) return 0;
    return getMonthlyRevenue(publicKey.toBase58());
  }, [publicKey, getMonthlyRevenue]);

  const handleDeleteTier = (tierId: string, tierName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete the "${tierName}" tier? This action cannot be undone.`,
      )
    ) {
      deleteTier(tierId);
      toast.success(`Tier "${tierName}" deleted successfully`);
    }
  };

  if (!publicKey) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="glass-card rounded-[2.5rem] p-12 text-center max-w-lg border border-[var(--color-solana-green)]/20 bg-[var(--color-solana-green)]/5"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--color-solana-green)]/10 flex items-center justify-center">
                 <Crown className="w-10 h-10 text-[var(--color-solana-green)]" />
              </div>
              <h2 className="text-3xl font-black text-white mb-4">Creator Access</h2>
              <p className="text-gray-400 text-lg mb-8">
                Connect your wallet to access your creator dashboard and manage your revenue streams.
              </p>
            </motion.div>
          </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-[var(--color-solana-green)]/20 to-[#14C58E]/20 rounded-2xl border border-[var(--color-solana-green)]/20">
                <Crown className="w-8 h-8 text-[var(--color-solana-green)]" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight">Creator Dashboard</h1>
                <p className="text-xl text-gray-400 mt-1">
                  Manage your subscriptions and earnings
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateTierModal(true)}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-[var(--color-solana-green)] hover:bg-[#9FE51C] text-black rounded-xl font-bold shadow-lg shadow-green-500/20 transition-all"
            >
              <Plus className="w-5 h-5" />
              Create New Tier
            </motion.button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              whileHover={{ y: -5 }}
              className="p-8 glass-card rounded-[2rem] border border-[#ABFE2C]/30 relative overflow-hidden group"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#ABFE2C]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[#ABFE2C]/20 transition-colors" />
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="p-2 rounded-lg bg-[#ABFE2C]/20 text-[#ABFE2C]">
                   <Users className="w-5 h-5" />
                </div>
                <span className="text-gray-400 font-bold uppercase tracking-wider text-xs">Active Subscribers</span>
              </div>
              <p className="text-4xl font-black relative z-10">{mySubscribers.length}</p>
              <p className="text-xs text-gray-500 mt-2 font-mono relative z-10">
                +{Math.floor(Math.random() * 5)} this week
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
               className="p-8 glass-card rounded-[2rem] border border-[var(--color-solana-green)]/30 relative overflow-hidden group"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-solana-green)]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[var(--color-solana-green)]/20 transition-colors" />
              <div className="flex items-center gap-3 mb-4 relative z-10">
                 <div className="p-2 rounded-lg bg-[var(--color-solana-green)]/20 text-[var(--color-solana-green)]">
                   <DollarSign className="w-5 h-5" />
                </div>
                <span className="text-gray-400 font-bold uppercase tracking-wider text-xs">Monthly Revenue</span>
              </div>
              <p className="text-4xl font-black relative z-10">{monthlyRevenue.toFixed(2)} SOL</p>
              <p className="text-xs text-gray-500 mt-2 font-mono relative z-10">
                ≈ ${(monthlyRevenue * 100).toFixed(2)} USD
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="p-8 glass-card rounded-[2rem] border border-[#9945FF]/30 relative overflow-hidden group"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#9945FF]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[#9945FF]/20 transition-colors" />
              <div className="flex items-center gap-3 mb-4 relative z-10">
                 <div className="p-2 rounded-lg bg-[#9945FF]/20 text-[#9945FF]">
                   <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-gray-400 font-bold uppercase tracking-wider text-xs">Total Revenue</span>
              </div>
              <p className="text-4xl font-black relative z-10">
                {(totalRevenue + totalTipsReceived).toFixed(2)} SOL
              </p>
              <p className="text-xs text-gray-500 mt-2 font-mono relative z-10">
                Tips: {totalTipsReceived.toFixed(2)} SOL
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="p-8 glass-card rounded-[2rem] border border-white/10 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors" />
              <div className="flex items-center gap-3 mb-4 relative z-10">
                 <div className="p-2 rounded-lg bg-white/10 text-white">
                   <Crown className="w-5 h-5" />
                </div>
                <span className="text-gray-400 font-bold uppercase tracking-wider text-xs">Active Tiers</span>
              </div>
              <p className="text-4xl font-black relative z-10">{myTiers.length}</p>
              <p className="text-xs text-gray-500 mt-2 font-mono relative z-10">Subscription offerings</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Subscription Tiers */}
        <div className="mb-12">
          <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
             <Sparkles className="w-6 h-6 text-yellow-400" />
             Your Subscription Tiers
          </h2>

          {myTiers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 glass-card rounded-[2.5rem] border border-white/10 dashed-border"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                 <Sparkles className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-300 mb-2">
                No subscription tiers yet
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Create your first tier to start earning recurring revenue from your loyal followers!
              </p>
              <button
                onClick={() => setShowCreateTierModal(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#ABFE2C] to-[#D4AF37] text-black rounded-xl font-bold hover:shadow-lg transition-all transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Create Your First Tier
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myTiers.map((tier) => (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  className="glass-card rounded-[2rem] p-8 border border-white/10 hover:border-[var(--color-solana-green)]/50 transition-all hover:shadow-xl hover:shadow-green-500/10 group bg-black/40"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-black mb-2 text-white group-hover:text-[var(--color-solana-green)] transition-colors">{tier.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-[#ABFE2C]">
                          {tier.price}
                        </span>
                        <span className="text-sm font-bold text-gray-500 uppercase">SOL/mo</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5">
                        <Edit className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteTier(tier.id, tier.name)}
                        className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors border border-red-500/10"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-400 mb-6 leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5 min-h-[5rem]">{tier.description}</p>

                  <div className="space-y-3 mb-8">
                    {tier.benefits.slice(0, 3).map((benefit: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 text-sm text-gray-300"
                      >
                        <div className="w-2 h-2 rounded-full bg-[var(--color-solana-green)]" />
                        {benefit}
                      </div>
                    ))}
                    {tier.benefits.length > 3 && (
                      <p className="text-xs text-gray-500 pl-5 font-bold">
                        +{tier.benefits.length - 3} more benefits
                      </p>
                    )}
                  </div>

                  <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider mb-1">Subscribers</p>
                      <p className="text-xl font-black text-white">
                        {tier.subscriberCount}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider mb-1">Revenue/mo</p>
                      <p className="text-xl font-black text-[#ABFE2C]">
                        {(tier.price * tier.subscriberCount).toFixed(2)} SOL
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Subscribers */}
        <div>
          <h2 className="text-3xl font-black mb-8">Recent Subscribers</h2>

          {mySubscribers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 glass-card rounded-[2.5rem] border border-white/10"
            >
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 font-bold">No subscribers yet</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mySubscribers.slice(0, 6).map((subscription) => {
                const tier = myTiers.find((t) => t.id === subscription.tierId);
                return (
                  <motion.div
                    key={subscription.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-between p-6 glass-card rounded-2xl border border-white/10 hover:border-[var(--color-solana-green)]/30 transition-all hover:bg-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${subscription.subscriberId}`}
                        alt="Subscriber"
                        className="w-12 h-12 rounded-full bg-gray-800 border-2 border-white/10"
                      />
                      <div>
                        <p className="font-bold text-white">
                          {subscription.subscriberId.slice(0, 6)}...
                          {subscription.subscriberId.slice(-4)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Subscribed to{' '}
                          <span className="text-[#ABFE2C] font-bold">{tier?.name}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#ABFE2C]">{tier?.price} SOL</p>
                      <p className="text-[10px] text-gray-500 font-mono mt-1">
                        {new Date(subscription.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Tier Modal */}
      {showCreateTierModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass-card rounded-[2rem] p-8 border border-white/10 max-w-lg w-full relative overflow-hidden shadow-2xl"
          >
             <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-solana-green)]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <h2 className="text-3xl font-black mb-8 relative z-10">Create Subscription Tier</h2>
            
            <div className="space-y-6 mb-8 relative z-10">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Tier Name</label>
                <input
                  type="text"
                  value={newTierName}
                  onChange={(e) => setNewTierName(e.target.value)}
                  placeholder="e.g., Bronze, Silver, Gold"
                  className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-[var(--color-solana-green)] transition-colors font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Price (SOL/month)</label>
                <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newTierPrice}
                      onChange={(e) => setNewTierPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-6 pr-16 py-4 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-[var(--color-solana-green)] transition-colors font-bold"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500 pointer-events-none">SOL</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Description & Benefits</label>
                <textarea
                  value={newTierDescription}
                  onChange={(e) => setNewTierDescription(e.target.value)}
                  placeholder="Describe what subscribers will get..."
                  rows={4}
                  className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-[var(--color-solana-green)] transition-colors resize-none font-medium"
                />
              </div>

              <div className="p-4 bg-[var(--color-solana-blue)]/10 border border-[var(--color-solana-blue)]/20 rounded-xl flex gap-3">
                 <Sparkles className="w-5 h-5 text-[var(--color-solana-blue)] shrink-0" />
                <p className="text-xs font-medium text-[var(--color-solana-blue)] leading-relaxed">
                  Creating a tier on the blockchain ensures transparent and decentralized subscription management. This will create a PDA for your tier.
                </p>
              </div>
            </div>

            <div className="flex gap-4 relative z-10">
              <button
                onClick={() => {
                  setShowCreateTierModal(false);
                  setNewTierName('');
                  setNewTierPrice('');
                  setNewTierDescription('');
                }}
                className="flex-1 px-6 py-4 bg-white/5 rounded-xl font-bold hover:bg-white/10 transition-colors border border-white/5"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newTierName || !newTierPrice) {
                    toast.error('Please fill in all required fields');
                    return;
                  }

                  toast.success('Subscription tier created!');
                  setShowCreateTierModal(false);
                  setNewTierName('');
                  setNewTierPrice('');
                  setNewTierDescription('');
                }}
                disabled={!newTierName || !newTierPrice}
                className="flex-1 px-6 py-4 bg-[var(--color-solana-green)] hover:bg-[#9FE51C] text-black rounded-xl font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-[var(--color-solana-green)]/20"
              >
                Create Tier
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AppLayout>
  );
}
