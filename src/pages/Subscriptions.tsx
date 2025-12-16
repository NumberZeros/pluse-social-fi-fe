import { motion } from 'framer-motion';
import { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import {
  Crown,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Sparkles,
  Clock,
  XCircle,
} from 'lucide-react';

import { useWallet } from '../lib/wallet-adapter';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export function Subscriptions() {
  const { publicKey } = useWallet();
  // Subscriptions from blockchain - query subscription PDAs
  // TODO: Implement getMyActiveSubscriptions to query user's subscription PDAs
  const getTierById = (_id: string): any => null; // TODO: Fetch subscription_tier PDA
  const cancelSubscription = (_id: string) => {}; // Use blockchain hook instead
  const toggleAutoRenew = (_id: string) => {}; // Not supported yet

  const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active');

  const handleCancelSubscription = (subscriptionId: string) => {
    if (window.confirm('Are you sure you want to cancel this subscription?')) {
      cancelSubscription(subscriptionId);
      toast.success(
        'Subscription cancelled. You can still access until the end of the billing period.',
      );
    }
  };

  const handleToggleAutoRenew = (subscriptionId: string, currentStatus: boolean) => {
    toggleAutoRenew(subscriptionId);
    toast.success(currentStatus ? 'Auto-renewal disabled' : 'Auto-renewal enabled');
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (!publicKey) {
    return (
      <div className="bg-black min-h-screen text-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <Crown className="w-16 h-16 text-[var(--color-solana-green)] mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">My Subscriptions</h1>
          <p className="text-gray-400 mb-8">
            Connect your wallet to view your subscriptions
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  // TODO: Replace with blockchain query for user's subscription PDAs
  const activeSubscriptions: any[] = [];
  const expiredSubscriptions: any[] = [];

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-[var(--color-solana-green)]/20 to-[#ABFE2C]/20 rounded-xl">
              <Crown className="w-8 h-8 text-[var(--color-solana-green)]" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">My Subscriptions</h1>
              <p className="text-gray-400 mt-1">Manage your creator subscriptions</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-card rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-[#ABFE2C]" />
                <span className="text-gray-400 text-sm">Active Subscriptions</span>
              </div>
              <p className="text-3xl font-bold">{activeSubscriptions.length}</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-card rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-[var(--color-solana-green)]" />
                <span className="text-gray-400 text-sm">Monthly Spending</span>
              </div>
              <p className="text-3xl font-bold">
                0.00 SOL
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-card rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-[#9945FF]" />
                <span className="text-gray-400 text-sm">Total Spent</span>
              </div>
              <p className="text-3xl font-bold">
                0.00 SOL
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-3 font-bold transition-colors relative ${
              activeTab === 'active' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Active ({activeSubscriptions.length})
            {activeTab === 'active' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ABFE2C]"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('expired')}
            className={`px-6 py-3 font-bold transition-colors relative ${
              activeTab === 'expired' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Expired ({expiredSubscriptions.length})
            {activeTab === 'expired' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ABFE2C]"
              />
            )}
          </button>
        </div>

        {/* Subscriptions List */}
        <div className="space-y-4">
          {activeTab === 'active' && activeSubscriptions.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">
                No active subscriptions
              </h3>
              <p className="text-gray-500 mb-6">
                Start supporting your favorite creators!
              </p>
              <Link
                to="/explore"
                className="inline-block px-6 py-3 bg-gradient-to-r from-[#ABFE2C] to-[#D4AF37] text-black rounded-xl font-bold hover:shadow-lg transition-all"
              >
                Explore Creators
              </Link>
            </motion.div>
          )}

          {activeTab === 'active' &&
            activeSubscriptions.length > 0 &&
            activeSubscriptions.map((subscription: any) => {
              const tier: any = getTierById(subscription.tierId);
              if (!tier) return null;

              const daysRemaining = getDaysRemaining(subscription.endDate);
              const isExpiringSoon = daysRemaining <= 7;

              return (
                <motion.div
                  key={subscription.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-xl p-6 border border-white/10 hover:border-[var(--color-solana-green)]/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${subscription.creatorAddress}`}
                        alt="Creator"
                        className="w-16 h-16 rounded-full bg-gray-800"
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold">{tier.name}</h3>
                          <Crown className="w-5 h-5 text-[var(--color-solana-green)]" />
                        </div>
                        <p className="text-gray-400 text-sm mb-2">
                          Creator: {subscription.creatorAddress.slice(0, 8)}...
                          {subscription.creatorAddress.slice(-6)}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-[#ABFE2C] font-bold">
                            {tier.price} SOL/month
                          </span>
                          <span className="text-gray-500">•</span>
                          <div className="flex items-center gap-1 text-gray-400">
                            <Clock className="w-4 h-4" />
                            {daysRemaining} days left
                            {isExpiringSoon && (
                              <span className="ml-2 px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                                Expiring Soon
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() =>
                          handleToggleAutoRenew(subscription.id, subscription.autoRenew)
                        }
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          subscription.autoRenew
                            ? 'bg-[#ABFE2C]/20 text-[#ABFE2C] hover:bg-[#ABFE2C]/30'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {subscription.autoRenew ? 'Auto-Renew: ON' : 'Auto-Renew: OFF'}
                      </button>
                      <button
                        onClick={() => handleCancelSubscription(subscription.id)}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>

                  {/* Benefits */}
                  {tier.benefits.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                        Benefits
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {tier.benefits.slice(0, 4).map((benefit: any, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-full"
                          >
                            {benefit}
                          </span>
                        ))}
                        {tier.benefits.length > 4 && (
                          <span className="px-3 py-1 bg-gray-800 text-gray-500 text-xs rounded-full">
                            +{tier.benefits.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}

          {activeTab === 'expired' && expiredSubscriptions.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">
                No expired subscriptions
              </h3>
              <p className="text-gray-500">Your subscription history will appear here</p>
            </motion.div>
          )}

          {activeTab === 'expired' &&
            expiredSubscriptions.length > 0 &&
            expiredSubscriptions.map((subscription: any) => {
              const tier: any = getTierById(subscription.tierId);
              if (!tier) return null;

              return (
                <motion.div
                  key={subscription.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-gray-900/50 rounded-xl border border-gray-800 opacity-60"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${subscription.creatorAddress}`}
                        alt="Creator"
                        className="w-16 h-16 rounded-full bg-gray-800 grayscale"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-gray-400">{tier.name}</h3>
                        <p className="text-gray-500 text-sm">
                          Expired on {new Date(subscription.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-gray-800 text-gray-500 rounded-lg text-sm font-semibold">
                      {subscription.status === 'cancelled' ? 'Cancelled' : 'Expired'}
                    </span>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>

      <Footer />
    </div>
  );
}
