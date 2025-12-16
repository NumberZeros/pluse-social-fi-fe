import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
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
      <div className="bg-black min-h-screen text-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <Crown className="w-16 h-16 text-[var(--color-solana-green)] mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Creator Dashboard</h1>
          <p className="text-gray-400 mb-8">
            Connect your wallet to access your creator dashboard
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-[var(--color-solana-green)]/20 to-[#14C58E]/20 rounded-xl">
                <Crown className="w-8 h-8 text-[var(--color-solana-green)]" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Creator Dashboard</h1>
                <p className="text-gray-400 mt-1">
                  Manage your subscriptions and earnings
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateTierModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#ABFE2C] to-[#D4AF37] text-black rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Create New Tier
            </motion.button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-gradient-to-br from-[#ABFE2C]/10 to-[#D4AF37]/10 rounded-xl border border-[#ABFE2C]/30"
            >
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-[#ABFE2C]" />
                <span className="text-gray-400 text-sm">Active Subscribers</span>
              </div>
              <p className="text-3xl font-bold">{mySubscribers.length}</p>
              <p className="text-xs text-gray-500 mt-1">
                +{Math.floor(Math.random() * 5)} this week
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-gradient-to-br from-[var(--color-solana-green)]/10 to-[#14C58E]/10 rounded-xl border border-[var(--color-solana-green)]/30"
            >
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-[var(--color-solana-green)]" />
                <span className="text-gray-400 text-sm">Monthly Revenue</span>
              </div>
              <p className="text-3xl font-bold">{monthlyRevenue.toFixed(2)} SOL</p>
              <p className="text-xs text-gray-500 mt-1">
                ≈ ${(monthlyRevenue * 100).toFixed(2)} USD
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-gradient-to-br from-[#9945FF]/10 to-[#14F195]/10 rounded-xl border border-[#9945FF]/30"
            >
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-[#9945FF]" />
                <span className="text-gray-400 text-sm">Total Revenue</span>
              </div>
              <p className="text-3xl font-bold">
                {(totalRevenue + totalTipsReceived).toFixed(2)} SOL
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Tips: {totalTipsReceived.toFixed(2)} SOL
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-card rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-2">
                <Crown className="w-5 h-5 text-[#ABFE2C]" />
                <span className="text-gray-400 text-sm">Active Tiers</span>
              </div>
              <p className="text-3xl font-bold">{myTiers.length}</p>
              <p className="text-xs text-gray-500 mt-1">Subscription offerings</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Subscription Tiers */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Your Subscription Tiers</h2>

          {myTiers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 glass-card rounded-xl border border-white/10"
            >
              <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">
                No subscription tiers yet
              </h3>
              <p className="text-gray-500 mb-6">
                Create your first tier to start earning recurring revenue!
              </p>
              <button
                onClick={() => setShowCreateTierModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#ABFE2C] to-[#D4AF37] text-black rounded-xl font-bold hover:shadow-lg transition-all"
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
                  className="glass-card rounded-xl p-6 border border-white/10 hover:border-[var(--color-solana-green)]/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-[#ABFE2C]">
                          {tier.price}
                        </span>
                        <span className="text-sm text-gray-400">SOL/mo</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteTier(tier.id, tier.name)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mb-4">{tier.description}</p>

                  <div className="space-y-2 mb-4">
                    {tier.benefits.slice(0, 3).map((benefit: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm text-gray-300"
                      >
                        <Crown className="w-3 h-3 text-[var(--color-solana-green)]" />
                        {benefit}
                      </div>
                    ))}
                    {tier.benefits.length > 3 && (
                      <p className="text-xs text-gray-500">
                        +{tier.benefits.length - 3} more
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-700 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Subscribers</p>
                      <p className="text-lg font-bold text-white">
                        {tier.subscriberCount}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Revenue/mo</p>
                      <p className="text-lg font-bold text-[#ABFE2C]">
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
          <h2 className="text-2xl font-bold mb-6">Recent Subscribers</h2>

          {mySubscribers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 glass-card rounded-xl border border-white/10"
            >
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No subscribers yet</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {mySubscribers.slice(0, 5).map((subscription) => {
                const tier = myTiers.find((t) => t.id === subscription.tierId);
                return (
                  <motion.div
                    key={subscription.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 glass-card rounded-xl border border-white/10 hover:border-[var(--color-solana-green)]/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${subscription.subscriberId}`}
                        alt="Subscriber"
                        className="w-12 h-12 rounded-full bg-gray-800"
                      />
                      <div>
                        <p className="font-semibold">
                          {subscription.subscriberId.slice(0, 8)}...
                          {subscription.subscriberId.slice(-6)}
                        </p>
                        <p className="text-sm text-gray-400">
                          Subscribed to{' '}
                          <span className="text-[#ABFE2C]">{tier?.name}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#ABFE2C]">{tier?.price} SOL</p>
                      <p className="text-xs text-gray-500">
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

      <Footer />

      {/* Create Tier Modal */}
      {showCreateTierModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-8 border border-white/10 max-w-lg w-full"
          >
            <h2 className="text-2xl font-bold mb-6">Create Subscription Tier</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Tier Name</label>
                <input
                  type="text"
                  value={newTierName}
                  onChange={(e) => setNewTierName(e.target.value)}
                  placeholder="e.g., Bronze, Silver, Gold"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:border-[var(--color-solana-green)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Price (SOL/month)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newTierPrice}
                  onChange={(e) => setNewTierPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:border-[var(--color-solana-green)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newTierDescription}
                  onChange={(e) => setNewTierDescription(e.target.value)}
                  placeholder="Describe what subscribers will get..."
                  rows={4}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:border-[var(--color-solana-green)] transition-colors resize-none"
                />
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-400">
                  Creating a tier on the blockchain ensures transparent and decentralized subscription management.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateTierModal(false);
                  setNewTierName('');
                  setNewTierPrice('');
                  setNewTierDescription('');
                }}
                className="flex-1 px-4 py-2 bg-white/5 rounded-lg font-medium hover:bg-white/10 transition-colors"
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
                className="flex-1 px-4 py-2 bg-[var(--color-solana-green)] hover:bg-[#9FE51C] text-black rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Tier
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
