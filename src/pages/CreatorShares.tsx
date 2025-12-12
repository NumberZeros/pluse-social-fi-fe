import { useState, useMemo } from 'react';
import { useSharesStore } from '../stores/useSharesStore';
import { useSocialStore } from '../stores/useSocialStore';

export const CreatorShares = () => {
  const [activeTab, setActiveTab] = useState<'market' | 'portfolio' | 'activity'>(
    'market',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'volume' | 'holders'>('volume');
  const [buyAmount, setBuyAmount] = useState<Record<string, number>>({});
  const [sellAmount, setSellAmount] = useState<Record<string, number>>({});

  const user = useSocialStore((state) => state.currentUser);
  const creatorShares = useSharesStore((state) => state.creatorShares);
  const buyShares = useSharesStore((state) => state.buyShares);
  const sellShares = useSharesStore((state) => state.sellShares);
  const getBuyPrice = useSharesStore((state) => state.getBuyPrice);
  const getSellPrice = useSharesStore((state) => state.getSellPrice);
  const getMyHoldings = useSharesStore((state) => state.getMyHoldings);
  const getPortfolioValue = useSharesStore((state) => state.getPortfolioValue);
  const transactions = useSharesStore((state) => state.transactions);

  const myHoldings = user ? getMyHoldings(user.address) : [];
  const portfolioValue = user ? getPortfolioValue(user.address) : 0;

  const creators = Array.from(creatorShares.values());

  const filteredCreators = useMemo(() => {
    const filtered = creators.filter((creator) =>
      creator.creatorUsername.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return filtered.sort((a, b) => {
      if (sortBy === 'price') return b.price - a.price;
      if (sortBy === 'volume') return b.volume24h - a.volume24h;
      if (sortBy === 'holders') return b.holders - a.holders;
      return 0;
    });
  }, [creators, searchQuery, sortBy]);

  const recentTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
  }, [transactions]);

  const handleBuy = (creatorAddress: string, creatorUsername: string) => {
    if (!user) return;
    const amount = buyAmount[creatorAddress] || 1;
    buyShares(user.address, creatorAddress, creatorUsername, amount);
    setBuyAmount({ ...buyAmount, [creatorAddress]: 1 });
  };

  const handleSell = (creatorAddress: string) => {
    if (!user) return;
    const amount = sellAmount[creatorAddress] || 1;
    sellShares(user.address, creatorAddress, amount);
    setSellAmount({ ...sellAmount, [creatorAddress]: 1 });
  };

  const formatSOL = (amount: number) => {
    return amount.toFixed(3);
  };

  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Creator Shares</h1>
          <p className="text-gray-400">Trade shares of your favorite creators</p>
        </div>

        {/* Stats */}
        {user && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
              <div className="text-gray-400 text-sm mb-1">Portfolio Value</div>
              <div className="text-3xl font-bold text-white">
                {formatSOL(portfolioValue)} SOL
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
              <div className="text-gray-400 text-sm mb-1">Holdings</div>
              <div className="text-3xl font-bold text-white">{myHoldings.length}</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
              <div className="text-gray-400 text-sm mb-1">Total Creators</div>
              <div className="text-3xl font-bold text-white">{creators.length}</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
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
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Market
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'portfolio'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            My Portfolio
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'activity'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
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
                className="flex-1 bg-white/5 border border-purple-500/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white/5 border border-purple-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="volume">Sort by Volume</option>
                <option value="price">Sort by Price</option>
                <option value="holders">Sort by Holders</option>
              </select>
            </div>

            {/* Creator Cards */}
            <div className="space-y-4">
              {filteredCreators.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-12 text-center">
                  <div className="text-gray-400 mb-2">No creators found</div>
                  <p className="text-gray-500 text-sm">
                    Buy shares in your favorite creators to get started
                  </p>
                </div>
              ) : (
                filteredCreators.map((creator) => (
                  <div
                    key={creator.creatorAddress}
                    className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-all"
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

                    {user && (
                      <div className="flex gap-4">
                        <div className="flex-1 flex gap-2">
                          <input
                            type="number"
                            min="1"
                            value={buyAmount[creator.creatorAddress] || 1}
                            onChange={(e) =>
                              setBuyAmount({
                                ...buyAmount,
                                [creator.creatorAddress]: parseInt(e.target.value) || 1,
                              })
                            }
                            className="w-24 bg-white/5 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:border-purple-500"
                          />
                          <button
                            onClick={() =>
                              handleBuy(creator.creatorAddress, creator.creatorUsername)
                            }
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                          >
                            Buy for{' '}
                            {formatSOL(
                              getBuyPrice(
                                creator.creatorAddress,
                                buyAmount[creator.creatorAddress] || 1,
                              ),
                            )}{' '}
                            SOL
                          </button>
                        </div>
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
            {!user ? (
              <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-12 text-center">
                <div className="text-gray-400 mb-2">Connect your wallet</div>
                <p className="text-gray-500 text-sm">
                  Connect your wallet to view your portfolio
                </p>
              </div>
            ) : myHoldings.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-12 text-center">
                <div className="text-gray-400 mb-2">No holdings yet</div>
                <p className="text-gray-500 text-sm">
                  Buy shares in creators to build your portfolio
                </p>
              </div>
            ) : (
              myHoldings.map((holding) => {
                const creator = creatorShares.get(holding.creatorAddress);
                if (!creator) return null;

                const currentValue = holding.amount * creator.price;
                const profit = currentValue - holding.amount * holding.purchasePrice;
                const profitPercent =
                  (profit / (holding.amount * holding.purchasePrice)) * 100;

                return (
                  <div
                    key={holding.id}
                    className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6"
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
                          {formatSOL(creator.price)} SOL
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
                      <input
                        type="number"
                        min="1"
                        max={holding.amount}
                        value={sellAmount[holding.creatorAddress] || 1}
                        onChange={(e) =>
                          setSellAmount({
                            ...sellAmount,
                            [holding.creatorAddress]: Math.min(
                              parseInt(e.target.value) || 1,
                              holding.amount,
                            ),
                          })
                        }
                        className="w-24 bg-white/5 border border-purple-500/20 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:border-purple-500"
                      />
                      <button
                        onClick={() => handleSell(holding.creatorAddress)}
                        className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                      >
                        Sell for{' '}
                        {formatSOL(
                          getSellPrice(
                            holding.creatorAddress,
                            sellAmount[holding.creatorAddress] || 1,
                          ),
                        )}{' '}
                        SOL
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
          <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl overflow-hidden">
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
                          {creatorShares.get(tx.creatorAddress)?.creatorUsername ||
                            'Unknown'}
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
    </div>
  );
};
