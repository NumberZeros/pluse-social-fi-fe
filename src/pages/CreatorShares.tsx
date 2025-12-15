import { useState, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

import { Navbar } from '../components/layout/Navbar';
import { BuySharesModal } from '../components/shares/BuySharesModal';
import { SellSharesModal } from '../components/shares/SellSharesModal';

export const CreatorShares = () => {
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState<'market' | 'portfolio' | 'activity'>(
    'market',
  );
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
    <div className="min-h-screen bg-[#000000] text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Creator Shares</h1>
          <p className="text-gray-400">Trade shares of your favorite creators</p>
        </div>

        {/* Stats */}
        {publicKey && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card rounded-xl p-6 border border-white/10">
              <div className="text-gray-400 text-sm mb-1">Portfolio Value</div>
              <div className="text-3xl font-bold text-white">
                {formatSOL(portfolioValue)} SOL
              </div>
            </div>
            <div className="glass-card rounded-xl p-6 border border-white/10">
              <div className="text-gray-400 text-sm mb-1">Holdings</div>
              <div className="text-3xl font-bold text-white">{myHoldings.length}</div>
            </div>
            <div className="glass-card rounded-xl p-6 border border-white/10">
              <div className="text-gray-400 text-sm mb-1">Total Creators</div>
              <div className="text-3xl font-bold text-white">{creators.length}</div>
            </div>
            <div className="glass-card rounded-xl p-6 border border-white/10">
              <div className="text-gray-400 text-sm mb-1">24h Volume</div>
              <div className="text-3xl font-bold text-white">
                {formatSOL(creators.reduce((sum, c) => sum + c.volume24h, 0))} SOL
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('market')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'market'
                ? 'bg-[var(--color-solana-green)] text-black'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Market
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'portfolio'
                ? 'bg-[var(--color-solana-green)] text-black'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            My Portfolio
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'activity'
                ? 'bg-[var(--color-solana-green)] text-black'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Activity
          </button>
        </div>

        {/* Market Tab */}
        {activeTab === 'market' && (
          <div>
            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <input
                type="text"
                placeholder="Search creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-solana-green)]"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-solana-green)]"
              >
                <option value="volume">Sort by Volume</option>
                <option value="price">Sort by Price</option>
                <option value="holders">Sort by Holders</option>
              </select>
            </div>

            {/* Creator Cards */}
            <div className="space-y-4">
              {filteredCreators.length === 0 ? (
                <div className="glass-card rounded-xl p-12 text-center border border-white/10">
                  <div className="text-gray-400 mb-2">No creators found</div>
                  <p className="text-gray-500 text-sm">
                    Buy shares in your favorite creators to get started
                  </p>
                </div>
              ) : (
                filteredCreators.map((creator) => (
                  <div
                    key={creator.creatorAddress}
                    className="glass-card rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          @{creator.creatorUsername}
                        </h3>
                        <div className="text-sm text-gray-400">
                          {creator.creatorAddress.slice(0, 8)}...
                          {creator.creatorAddress.slice(-6)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white mb-1">
                          {formatSOL(creator.price)} SOL
                        </div>
                        <div
                          className={`text-sm font-semibold ${
                            creator.priceChange24h >= 0
                              ? 'text-green-400'
                              : 'text-red-400'
                          }`}
                        >
                          {formatPercent(creator.priceChange24h)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-gray-400 text-xs mb-1">Supply</div>
                        <div className="text-white font-semibold">{creator.supply}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs mb-1">Holders</div>
                        <div className="text-white font-semibold">{creator.holders}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs mb-1">24h Volume</div>
                        <div className="text-white font-semibold">
                          {formatSOL(creator.volume24h)} SOL
                        </div>
                      </div>
                    </div>

                    {publicKey && (
                      <div className="flex gap-4">
                        <button
                          onClick={() =>
                            handleBuy(creator.creatorAddress, creator.creatorUsername)
                          }
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                        >
                          Buy Shares
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className="space-y-4">
            {!publicKey ? (
              <div className="glass-card rounded-xl p-12 text-center border border-white/10">
                <div className="text-gray-400 mb-2">Connect your wallet</div>
                <p className="text-gray-500 text-sm">
                  Connect your wallet to view your portfolio
                </p>
              </div>
            ) : myHoldings.length === 0 ? (
              <div className="glass-card rounded-xl p-12 text-center border border-white/10">
                <div className="text-gray-400 mb-2">No holdings yet</div>
                <p className="text-gray-500 text-sm">
                  Buy shares in creators to build your portfolio
                </p>
              </div>
            ) : (
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
                  <div
                    key={holding.id}
                    className="glass-card rounded-xl p-6 border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          @{holding.creatorUsername}
                        </h3>
                        <div className="text-sm text-gray-400">
                          {holding.amount} shares
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white mb-1">
                          {formatSOL(currentValue)} SOL
                        </div>
                        <div
                          className={`text-sm font-semibold ${
                            profit >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {profit >= 0 ? '+' : ''}
                          {formatSOL(profit)} SOL ({formatPercent(profitPercent)})
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-gray-400 text-xs mb-1">Purchase Price</div>
                        <div className="text-white font-semibold">
                          {formatSOL(holding.purchasePrice)} SOL
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs mb-1">Current Price</div>
                        <div className="text-white font-semibold">
                          N/A
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs mb-1">Total Value</div>
                        <div className="text-white font-semibold">
                          {formatSOL(currentValue)} SOL
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSell(holding.creatorAddress, holding.creatorAddress)}
                        className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                      >
                        Sell Shares
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="glass-card rounded-xl overflow-hidden border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left px-6 py-4 text-gray-400 font-semibold">
                      Type
                    </th>
                    <th className="text-left px-6 py-4 text-gray-400 font-semibold">
                      Creator
                    </th>
                    <th className="text-left px-6 py-4 text-gray-400 font-semibold">
                      Amount
                    </th>
                    <th className="text-left px-6 py-4 text-gray-400 font-semibold">
                      Price
                    </th>
                    <th className="text-left px-6 py-4 text-gray-400 font-semibold">
                      Total
                    </th>
                    <th className="text-left px-6 py-4 text-gray-400 font-semibold">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                        No transactions yet
                      </td>
                    </tr>
                  ) : (
                    recentTransactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="border-t border-white/5 hover:bg-white/5"
                      >
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              tx.type === 'buy'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {tx.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white">
                          {(tx.creatorAddress || '').slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4 text-white">{tx.amount}</td>
                        <td className="px-6 py-4 text-white">
                          {formatSOL(tx.price)} SOL
                        </td>
                        <td className="px-6 py-4 text-white">
                          {formatSOL(tx.total)} SOL
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {new Date(tx.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
    </div>
  );
};
