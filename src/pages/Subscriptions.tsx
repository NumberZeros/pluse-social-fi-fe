import { motion } from 'framer-motion';
import { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import {
  Crown,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Sparkles,
  Clock,
  XCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

import { useWallet } from '../lib/wallet-adapter';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export function Subscriptions() {
  const { publicKey } = useWallet();
  // Subscriptions from blockchain - query subscription PDAs
  const getTierById = (_id: string): any => null; 
  const cancelSubscription = (_id: string) => {}; 
  const toggleAutoRenew = (_id: string) => {}; 

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
     <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="glass-card rounded-[2.5rem] p-12 text-center max-w-lg border border-[var(--color-solana-purple)]/20 bg-[var(--color-solana-purple)]/5"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--color-solana-purple)]/10 flex items-center justify-center">
                 <Crown className="w-10 h-10 text-[var(--color-solana-purple)]" />
              </div>
              <h2 className="text-3xl font-black text-white mb-4">Subscriber Access</h2>
              <p className="text-gray-400 text-lg mb-8">
                Connect your wallet to manage your active subscriptions and support creators.
              </p>
            </motion.div>
          </div>
      </AppLayout>
    );
  }

  // TODO: Replace with blockchain query for user's subscription PDAs
  const activeSubscriptions: any[] = [];
  const expiredSubscriptions: any[] = [];

  return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-6">
            <Crown className="w-4 h-4 text-[var(--color-solana-green)]" />
            <span className="text-sm font-medium text-gray-300">Subscriber Dashboard</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">My Subscriptions</h1>
          <p className="text-xl text-gray-400">Manage the creators you support and your recurring payments.</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            whileHover={{ y: -5 }}
            className="p-8 glass-card rounded-[2rem] border border-[#ABFE2C]/30 relative overflow-hidden group"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#ABFE2C]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[#ABFE2C]/20 transition-colors" />
            <div className="flex items-center gap-3 mb-4 relative z-10">
               <div className="p-2 rounded-lg bg-[#ABFE2C]/20 text-[#ABFE2C]">
                 <Users className="w-5 h-5" />
              </div>
              <span className="text-gray-400 font-bold uppercase tracking-wider text-xs">Active Subscriptions</span>
            </div>
            <p className="text-4xl font-black relative z-10">{activeSubscriptions.length}</p>
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
              <span className="text-gray-400 font-bold uppercase tracking-wider text-xs">Monthly Spending</span>
            </div>
            <p className="text-4xl font-black relative z-10">
              0.00 SOL
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
              <span className="text-gray-400 font-bold uppercase tracking-wider text-xs">Total Spent</span>
            </div>
            <p className="text-4xl font-black relative z-10">
              0.00 SOL
            </p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
           <div className="glass-card p-2 rounded-full border border-white/10 flex items-center gap-2">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'active' 
                    ? 'bg-white text-black shadow-lg shadow-white/10' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                 <ShieldCheck className="w-4 h-4" />
                Active ({activeSubscriptions.length})
              </button>
              <button
                onClick={() => setActiveTab('expired')}
                className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'expired' 
                    ? 'bg-white text-black shadow-lg shadow-white/10' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Clock className="w-4 h-4" />
                Expired ({expiredSubscriptions.length})
              </button>
           </div>
        </div>

        {/* Subscriptions List */}
        <div className="space-y-4">
          {activeTab === 'active' && activeSubscriptions.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 glass-card rounded-[2.5rem] border border-white/10 dashed-border"
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Sparkles className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No active subscriptions
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Support your favorite creators to unlock exclusive content and perks!
              </p>
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#ABFE2C] to-[#D4AF37] text-black rounded-xl font-bold hover:shadow-lg transition-all transform hover:scale-105"
              >
                Explore Creators
                 <ArrowRight className="w-5 h-5" />
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
                  className="glass-card rounded-[2rem] p-8 border border-white/10 hover:border-[var(--color-solana-green)]/50 transition-all hover:bg-white/5"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex gap-6">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${subscription.creatorAddress}`}
                        alt="Creator"
                        className="w-20 h-20 rounded-2xl bg-gray-800 border-2 border-white/10"
                      />
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-black">{tier.name}</h3>
                          <div className="px-3 py-1 bg-[var(--color-solana-green)]/20 text-[var(--color-solana-green)] rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1">
                             <Crown className="w-3 h-3" /> SUBSCRIBED
                          </div>
                        </div>
                        <p className="text-gray-400 mb-2 font-medium">
                          Creator: <span className="text-white font-bold">{subscription.creatorAddress.slice(0, 8)}...</span>
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-[#ABFE2C] font-black text-lg">
                            {tier.price} SOL/mo
                          </span>
                          <span className="text-gray-600">|</span>
                          <div className="flex items-center gap-2 text-gray-400 font-medium">
                            <Clock className="w-4 h-4" />
                            {daysRemaining} days remaining
                            {isExpiringSoon && (
                              <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full font-bold uppercase">
                                Expiring Soon
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          handleToggleAutoRenew(subscription.id, subscription.autoRenew)
                        }
                        className={`px-6 py-3 rounded-xl font-bold transition-colors border ${
                          subscription.autoRenew
                            ? 'bg-[var(--color-solana-green)]/10 text-[var(--color-solana-green)] border-[var(--color-solana-green)]/20 hover:bg-[var(--color-solana-green)]/20'
                            : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {subscription.autoRenew ? 'Auto-Renew: ON' : 'Auto-Renew: OFF'}
                      </button>
                      <button
                        onClick={() => handleCancelSubscription(subscription.id)}
                        className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-bold transition-colors flex items-center gap-2 border border-red-500/10"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>

                  {/* Benefits */}
                  {tier.benefits.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider mb-3">
                        Included Benefits
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {tier.benefits.map((benefit: any, idx: number) => (
                          <div
                            key={idx}
                            className="px-3 py-1.5 bg-white/5 text-gray-300 text-sm font-medium rounded-lg border border-white/5 flex items-center gap-2"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-solana-green)]" />
                            {benefit}
                          </div>
                        ))}
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
               className="text-center py-20 glass-card rounded-[2.5rem] border border-white/10 dashed-border"
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-400 mb-2">
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
                  className="p-8 bg-black/40 rounded-[2rem] border border-white/10 opacity-60 grayscale hover:grayscale-0 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${subscription.creatorAddress}`}
                        alt="Creator"
                        className="w-16 h-16 rounded-2xl bg-gray-800"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-gray-300">{tier.name}</h3>
                        <p className="text-gray-500 text-sm font-medium mt-1">
                          Ended on {new Date(subscription.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-gray-800 text-gray-400 rounded-xl text-sm font-bold border border-white/5">
                      {subscription.status === 'cancelled' ? 'CiANCELLED' : 'EXPIRED'}
                    </span>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>
    </AppLayout>
  );
}
