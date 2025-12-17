import { useState, useMemo } from 'react';
import { useWallet } from '../lib/wallet-adapter';
import { PublicKey } from '@solana/web3.js';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '../components/layout/AppLayout';
import { BuySharesModal } from '../components/shares/BuySharesModal';
import { SellSharesModal } from '../components/shares/SellSharesModal';
import { TrendingUp, Wallet, Users, Activity, Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const CreatorShares = () => {
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState<'market' | 'portfolio' | 'activity'>('market');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'volume' | 'holders'>('volume');
  const [selectedCreator, setSelectedCreator] = useState<{pubkey: PublicKey, username: string} | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedSellCreator, setSelectedSellCreator] = useState<{pubkey: PublicKey, username: string} | null>(null);
  const [showSellModal, setShowSellModal] = useState(false);

  // Holdings and portfolio from blockchain
  const myHoldings: any[] = []; // TODO: Query all share_holding PDAs for user
  const portfolioValue = 0; // TODO: Calculate from holdings
  const creators: any[] = []; // TODO: Query all creator_pool PDAs
  const transactions: any[] = []; // TODO: Query transaction history from blockchain events

  const filteredCreators = useMemo(() => {
    return creators; // Empty array for now
  }, [creators, searchQuery, sortBy]);

  const recentTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
  }, [transactions]);

  const handleBuy = (creatorAddress: string, creatorUsername: string) => {
    if (!publicKey) return;
    try {
      const creatorPubkey = new PublicKey(creatorAddress);
      setSelectedCreator({ pubkey: creatorPubkey, username: creatorUsername });
      setShowBuyModal(true);
    } catch (error) {
      console.error('Invalid creator address:', error);
    }
  };

  const handleSell = (creatorAddress: string, creatorUsername: string) => {
    if (!publicKey) return;
    try {
      const creatorPubkey = new PublicKey(creatorAddress);
      setSelectedSellCreator({ pubkey: creatorPubkey, username: creatorUsername });
      setShowSellModal(true);
    } catch (error) {
      console.error('Invalid creator address:', error);
    }
  };

  const formatSOL = (amount: number) => {
    return amount.toFixed(3);
  };

  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto pb-12">
        {/* Header */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-12 text-center"
        >
          <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
            Creator <span className="text-gradient-lens">Shares</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Invest in the reputation of your favorite creators. Buy early, earn as they grow.
          </p>
        </motion.div>

        {/* Stats */}
        {publicKey && (
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          >
            <div className="glass-card rounded-2xl p-6 border border-white/10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Wallet className="w-16 h-16 text-[var(--color-solana-green)]" />
               </div>
              <div className="text-gray-400 text-sm mb-2 font-medium uppercase tracking-wider">Portfolio Value</div>
              <div className="text-3xl font-bold text-white flex items-end gap-2">
                {formatSOL(portfolioValue)} <span className="text-lg text-[var(--color-solana-green)] mb-1">SOL</span>
              </div>
            </div>
            
            <div className="glass-card rounded-2xl p-6 border border-white/10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Activity className="w-16 h-16 text-blue-400" />
               </div>
              <div className="text-gray-400 text-sm mb-2 font-medium uppercase tracking-wider">Holdings</div>
              <div className="text-3xl font-bold text-white">{myHoldings.length}</div>
            </div>
            
            <div className="glass-card rounded-2xl p-6 border border-white/10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Users className="w-16 h-16 text-purple-400" />
               </div>
              <div className="text-gray-400 text-sm mb-2 font-medium uppercase tracking-wider">Total Creators</div>
              <div className="text-3xl font-bold text-white">{creators.length}</div>
            </div>
            
            <div className="glass-card rounded-2xl p-6 border border-white/10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TrendingUp className="w-16 h-16 text-orange-400" />
               </div>
              <div className="text-gray-400 text-sm mb-2 font-medium uppercase tracking-wider">24h Volume</div>
              <div className="text-3xl font-bold text-white flex items-end gap-2">
                {formatSOL(creators.reduce((sum, c) => sum + c.volume24h, 0))} <span className="text-lg text-orange-400 mb-1">SOL</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex justify-center mb-8">
           <div className="flex gap-2 p-1 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
            {[
              { id: 'market', label: 'Market', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'portfolio', label: 'Portfolio', icon: <Wallet className="w-4 h-4" /> },
              { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-[var(--color-solana-green)] text-black shadow-lg shadow-[var(--color-solana-green)]/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
           </div>
        </div>

        {/* Market Tab */}
        <AnimatePresence mode="wait">
        {activeTab === 'market' && (
          <motion.div
             key="market"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
          >
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
               <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search creators..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-[var(--color-solana-green)] transition-all"
                  />
               </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-[var(--color-solana-green)] transition-all cursor-pointer font-medium"
              >
                <option value="volume">Sort by Volume</option>
                <option value="price">Sort by Price</option>
                <option value="holders">Sort by Holders</option>
              </select>
            </div>

            {/* Creator Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCreators.length === 0 ? (
                <div className="col-span-full glass-card rounded-2xl p-20 text-center border border-white/10 border-dashed">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6">
                     <Users className="w-10 h-10 text-gray-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-300 mb-2">No creators found</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Buy shares in your favorite creators to build your portfolio. New creators are joining every day!
                  </p>
                </div>
              ) : (
                filteredCreators.map((creator) => (
                  <motion.div
                    layout
                    key={creator.creatorAddress}
                    className="glass-card rounded-2xl p-6 border border-white/10 hover:border-[var(--color-solana-green)]/30 hover:bg-white/5 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-solana-green)] to-[#14C58E] flex items-center justify-center text-xl font-bold text-black shadow-lg shadow-[var(--color-solana-green)]/20">
                          {creator.creatorUsername.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            @{creator.creatorUsername}
                          </h3>
                          <div className="text-sm text-gray-400 font-mono">
                            {creator.creatorAddress.slice(0, 4)}...{creator.creatorAddress.slice(-4)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white mb-1">
                          {formatSOL(creator.price)} SOL
                        </div>
                        <div
                          className={`text-sm font-bold flex items-center justify-end gap-1 ${
                            creator.priceChange24h >= 0
                              ? 'text-[var(--color-solana-green)]'
                              : 'text-red-400'
                          }`}
                        >
                          {creator.priceChange24h >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          {formatPercent(creator.priceChange24h)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-white/5 rounded-xl border border-white/5">
                      <div>
                        <div className="text-gray-500 text-xs mb-1 uppercase tracking-wider font-semibold">Supply</div>
                        <div className="text-white font-bold">{creator.supply}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1 uppercase tracking-wider font-semibold">Holders</div>
                        <div className="text-white font-bold">{creator.holders}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1 uppercase tracking-wider font-semibold">Volume</div>
                        <div className="text-white font-bold">
                          {formatSOL(creator.volume24h)}
                        </div>
                      </div>
                    </div>

                    {publicKey && (
                      <button
                        onClick={() =>
                          handleBuy(creator.creatorAddress, creator.creatorUsername)
                        }
                        className="w-full bg-[var(--color-solana-green)] hover:bg-[#9FE51C] text-black font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-[var(--color-solana-green)]/10 hover:shadow-[var(--color-solana-green)]/20"
                      >
                        Buy Shares
                      </button>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Portfolio Tab */}
        <AnimatePresence mode="wait">
        {activeTab === 'portfolio' && (
          <motion.div
             key="portfolio"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             className="space-y-4"
          >
            {!publicKey ? (
              <div className="glass-card rounded-2xl p-20 text-center border border-white/10 border-dashed">
                <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-300 mb-2">Connect your wallet</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  Connect your Solana wallet to view your portfolio and start trading creator shares.
                </p>
              </div>
            ) : myHoldings.length === 0 ? (
              <div className="glass-card rounded-2xl p-20 text-center border border-white/10 border-dashed">
                <Activity className="w-16 h-16 text-gray-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-300 mb-2">No holdings yet</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  You haven't purchased any creator shares yet. Head to the Market tab to find creators to invest in!
                </p>
              </div>
            ) : (
              // TODO: Implement cleaner grid layout for holdings similar to Market tab
              myHoldings.map((holding: any) => {
                // Query creator data from blockchain
                const creator = null; // TODO: Fetch creator_pool PDA
                if (!creator) return null;

                // Temporary: Use placeholder values until PDA query is implemented
                const currentValue = 0;
                const profit = currentValue - holding.amount * holding.purchasePrice;
                const profitPercent =
                  (profit / (holding.amount * holding.purchasePrice)) * 100;

                return (
                  <motion.div
                    layout
                    key={holding.id}
                    className="glass-card rounded-2xl p-6 border border-white/10 hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          @{holding.creatorUsername}
                        </h3>
                        <div className="text-sm text-gray-400 font-mono">
                          {holding.amount} shares
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white mb-1">
                          {formatSOL(currentValue)} SOL
                        </div>
                        <div
                          className={`text-sm font-bold ${
                            profit >= 0 ? 'text-[var(--color-solana-green)]' : 'text-red-400'
                          }`}
                        >
                          {profit >= 0 ? '+' : ''}
                          {formatSOL(profit)} SOL ({formatPercent(profitPercent)})
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-white/5 rounded-xl border border-white/5">
                      <div>
                        <div className="text-gray-500 text-xs mb-1 uppercase tracking-wider font-semibold">Avg Price</div>
                        <div className="text-white font-bold font-mono">
                          {formatSOL(holding.purchasePrice)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1 uppercase tracking-wider font-semibold">Cur Price</div>
                        <div className="text-white font-bold font-mono">
                          N/A
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1 uppercase tracking-wider font-semibold">Value</div>
                        <div className="text-white font-bold font-mono">
                          {formatSOL(currentValue)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSell(holding.creatorAddress, holding.creatorAddress)}
                      className="w-full bg-white/5 hover:bg-red-500/20 text-white hover:text-red-400 border border-white/10 hover:border-red-500/50 font-bold py-3 px-4 rounded-xl transition-all"
                    >
                      Sell Shares
                    </button>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}
        </AnimatePresence>

        {/* Activity Tab */}
        <AnimatePresence mode="wait">
        {activeTab === 'activity' && (
          <motion.div
             key="activity"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             className="glass-card rounded-3xl overflow-hidden border border-white/10"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="text-left px-8 py-6 text-gray-400 font-bold uppercase text-xs tracking-wider">
                      Type
                    </th>
                    <th className="text-left px-8 py-6 text-gray-400 font-bold uppercase text-xs tracking-wider">
                      Creator
                    </th>
                    <th className="text-left px-8 py-6 text-gray-400 font-bold uppercase text-xs tracking-wider">
                      Amount
                    </th>
                    <th className="text-left px-8 py-6 text-gray-400 font-bold uppercase text-xs tracking-wider">
                      Price
                    </th>
                    <th className="text-left px-8 py-6 text-gray-400 font-bold uppercase text-xs tracking-wider">
                      Total
                    </th>
                    <th className="text-left px-8 py-6 text-gray-400 font-bold uppercase text-xs tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-4">
                           <Activity className="w-12 h-12 opacity-20" />
                           <p>No transactions yet</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    recentTransactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-8 py-6">
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${
                              tx.type === 'buy'
                                ? 'bg-[var(--color-solana-green)]/10 text-[var(--color-solana-green)] border border-[var(--color-solana-green)]/20'
                                : 'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-white font-medium">
                          {(tx.creatorAddress || '').slice(0, 8)}...
                        </td>
                        <td className="px-8 py-6 text-white font-mono">{tx.amount}</td>
                        <td className="px-8 py-6 text-white font-mono">
                          {formatSOL(tx.price)} SOL
                        </td>
                        <td className="px-8 py-6 text-white font-mono">
                          {formatSOL(tx.total)} SOL
                        </td>
                        <td className="px-8 py-6 text-gray-400 text-sm">
                          {new Date(tx.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {showBuyModal && selectedCreator && (
        <BuySharesModal
          isOpen={true}
          creatorPubkey={selectedCreator.pubkey}
          creatorUsername={selectedCreator.username}
          onClose={() => setShowBuyModal(false)}
        />
      )}

      {showSellModal && selectedSellCreator && (
        <SellSharesModal
          creatorPubkey={selectedSellCreator.pubkey}
          creatorUsername={selectedSellCreator.username}
          onClose={() => setShowSellModal(false)}
        />
      )}
    </AppLayout>
  );
};
