import { motion } from 'framer-motion';
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Navbar } from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useMarketplaceStore } from '../stores/useMarketplaceStore';
import { Search, TrendingUp, Clock, Gavel, Tag, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

const MOCK_LISTINGS = [
  { username: 'sol', price: 500, category: 'short' as const, verified: true },
  { username: 'defi', price: 250, category: 'premium' as const, verified: true },
  { username: 'web3', price: 300, category: 'premium' as const, verified: false },
  { username: 'nft', price: 400, category: 'short' as const, verified: true },
  { username: 'dao', price: 200, category: 'short' as const, verified: false },
  { username: 'crypto', price: 350, category: 'premium' as const, verified: true },
];

export function UsernameMarketplace() {
  const { publicKey, connected } = useWallet();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'auctions' | 'my-listings'>(
    'buy',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc'>('asc');

  const listings = useMarketplaceStore((state) => state.listings);
  const auctions = useMarketplaceStore((state) => state.auctions);
  const createListing = useMarketplaceStore((state) => state.createListing);
  const purchaseListing = useMarketplaceStore((state) => state.purchaseListing);
  const makeOffer = useMarketplaceStore((state) => state.makeOffer);
  const placeBid = useMarketplaceStore((state) => state.placeBid);

  const [newListingUsername, setNewListingUsername] = useState('');
  const [newListingPrice, setNewListingPrice] = useState('');
  const [newListingCategory, setNewListingCategory] = useState<
    'premium' | 'short' | 'rare' | 'custom'
  >('premium');

  // Initialize mock listings if empty
  useState(() => {
    if (listings.length === 0 && publicKey) {
      MOCK_LISTINGS.forEach((mock) => {
        createListing(mock.username, mock.price, 'marketplace', mock.category);
      });
    }
  });

  const filteredListings = listings
    .filter((l) => {
      if (searchQuery && !l.username.toLowerCase().includes(searchQuery.toLowerCase()))
        return false;
      if (selectedCategory !== 'all' && l.category !== selectedCategory) return false;
      return true;
    })
    .sort((a, b) => (priceSort === 'asc' ? a.price - b.price : b.price - a.price));

  const myListings = publicKey
    ? listings.filter((l) => l.seller === publicKey.toBase58())
    : [];
  const activeAuctions = auctions.filter((a) => a.status === 'active');

  const handleCreateListing = () => {
    if (!connected) {
      toast.error('Please connect your wallet');
      return;
    }
    if (!newListingUsername || !newListingPrice) {
      toast.error('Please fill in all fields');
      return;
    }

    createListing(
      newListingUsername,
      parseFloat(newListingPrice),
      publicKey!.toBase58(),
      newListingCategory,
    );

    // setShowListModal(false);
    setNewListingUsername('');
    setNewListingPrice('');
    toast.success('Username listed for sale!');
  };

  const handlePurchase = (listingId: string, price: number) => {
    if (!connected) {
      toast.error('Please connect your wallet');
      return;
    }

    purchaseListing(listingId, publicKey!.toBase58());
    toast.success(`Username purchased for ${price} SOL!`);
  };

  const handleMakeOffer = (listingId: string, username: string) => {
    if (!connected) {
      toast.error('Please connect your wallet');
      return;
    }

    const amount = prompt('Enter your offer amount (SOL):');
    if (!amount || isNaN(parseFloat(amount))) return;

    makeOffer(listingId, username, publicKey!.toBase58(), parseFloat(amount));
    toast.success('Offer submitted!');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'short':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'premium':
        return 'bg-purple-500/20 text-purple-400';
      case 'rare':
        return 'bg-pink-500/20 text-pink-400';
      default:
        return 'bg-blue-500/20 text-blue-400';
    }
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />

      <div className="max-w-[1200px] mx-auto px-6 pt-24 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
            Username Marketplace
          </h1>
          <p className="text-gray-400 text-lg">
            Buy, sell, and auction premium Pulse usernames
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Listings', value: listings.length, icon: Tag },
            { label: 'Active Auctions', value: activeAuctions.length, icon: Gavel },
            {
              label: 'Avg Price',
              value: `${(listings.reduce((sum, l) => sum + l.price, 0) / listings.length || 0).toFixed(1)} SOL`,
              icon: TrendingUp,
            },
            { label: 'My Listings', value: myListings.length, icon: Plus },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-2">
                <stat.icon className="w-5 h-5 text-[#D4AF37]" />
                <div className="text-2xl font-bold">{stat.value}</div>
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="border-b border-white/10 mb-6">
          <div className="flex gap-6 overflow-x-auto">
            {[
              { id: 'buy', label: 'Browse Listings', icon: Search },
              { id: 'auctions', label: 'Auctions', icon: Gavel },
              { id: 'sell', label: 'List Username', icon: Plus },
              { id: 'my-listings', label: 'My Listings', icon: Tag },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative pb-4 font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="marketplaceTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]"
                    transition={{ type: 'spring', duration: 0.5 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Buy Tab */}
        {activeTab === 'buy' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="glass-card rounded-2xl p-6 border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Search Username
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 outline-none focus:border-white/20 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:border-white/20 transition-colors"
                  >
                    <option value="all">All Categories</option>
                    <option value="short">Short (3-4 chars)</option>
                    <option value="premium">Premium</option>
                    <option value="rare">Rare</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Sort by Price</label>
                  <select
                    value={priceSort}
                    onChange={(e) => setPriceSort(e.target.value as any)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:border-white/20 transition-colors"
                  >
                    <option value="asc">Low to High</option>
                    <option value="desc">High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredListings.map((listing) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card rounded-2xl p-6 border border-white/10 hover:border-[#D4AF37]/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="text-2xl font-bold mb-2">@{listing.username}</div>
                      <span
                        className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${getCategoryColor(listing.category)}`}
                      >
                        {listing.category}
                      </span>
                    </div>
                    {listing.verified && (
                      <div className="w-6 h-6 rounded-full bg-[#D4AF37] flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-black"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="text-3xl font-bold text-[#D4AF37]">
                      {listing.price} SOL
                    </div>
                    <div className="text-sm text-gray-400">
                      ${(listing.price * 100).toFixed(2)} USD
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePurchase(listing.id, listing.price)}
                      className="flex-1 px-4 py-2 bg-[#D4AF37] text-black rounded-lg font-medium hover:bg-[#C9A62F] transition-colors"
                    >
                      Buy Now
                    </button>
                    <button
                      onClick={() => handleMakeOffer(listing.id, listing.username)}
                      className="px-4 py-2 bg-white/5 rounded-lg font-medium hover:bg-white/10 transition-colors"
                    >
                      Offer
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredListings.length === 0 && (
              <div className="glass-card rounded-2xl p-12 text-center border border-white/10">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400">No usernames found</p>
              </div>
            )}
          </div>
        )}

        {/* Auctions Tab */}
        {activeTab === 'auctions' && (
          <div className="space-y-4">
            {activeAuctions.map((auction) => {
              const timeLeft = Math.max(0, auction.endTime - Date.now());
              const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
              const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

              return (
                <motion.div
                  key={auction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl p-6 border border-white/10"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="text-3xl font-bold mb-2">@{auction.username}</div>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {hoursLeft}h {minutesLeft}m left
                        </span>
                        <span>{auction.bidCount} bids</span>
                      </div>

                      <div className="mb-4">
                        <div className="text-sm text-gray-400 mb-1">Current Bid</div>
                        <div className="text-2xl font-bold text-[#D4AF37]">
                          {auction.currentBid} SOL
                        </div>
                      </div>

                      {auction.highestBidder && (
                        <div className="text-sm text-gray-400">
                          Highest bidder: {auction.highestBidder.slice(0, 4)}...
                          {auction.highestBidder.slice(-4)}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 min-w-[200px]">
                      <input
                        type="number"
                        placeholder={`Min ${auction.currentBid + 1} SOL`}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:border-white/20 transition-colors"
                      />
                      <button
                        onClick={() => {
                          const input = document.querySelector(
                            `input[placeholder*="${auction.currentBid}"]`,
                          ) as HTMLInputElement;
                          const amount = parseFloat(input?.value || '0');
                          if (amount > auction.currentBid) {
                            placeBid(auction.id, publicKey?.toBase58() || '', amount);
                            toast.success('Bid placed!');
                            input.value = '';
                          } else {
                            toast.error('Bid must be higher than current bid');
                          }
                        }}
                        className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg font-medium hover:bg-[#C9A62F] transition-colors"
                      >
                        Place Bid
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {activeAuctions.length === 0 && (
              <div className="glass-card rounded-2xl p-12 text-center border border-white/10">
                <Gavel className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400">No active auctions</p>
              </div>
            )}
          </div>
        )}

        {/* Sell Tab */}
        {activeTab === 'sell' && (
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-8 border border-white/10"
            >
              <h2 className="text-2xl font-bold mb-6">List Username for Sale</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Username</label>
                  <input
                    type="text"
                    value={newListingUsername}
                    onChange={(e) => setNewListingUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 outline-none focus:border-white/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Price (SOL)</label>
                  <input
                    type="number"
                    value={newListingPrice}
                    onChange={(e) => setNewListingPrice(e.target.value)}
                    placeholder="Enter price"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 outline-none focus:border-white/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['short', 'premium', 'rare', 'custom'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setNewListingCategory(cat)}
                        className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                          newListingCategory === cat
                            ? 'bg-[#D4AF37] text-black'
                            : 'bg-white/5 text-white hover:bg-white/10'
                        }`}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreateListing}
                  className="w-full px-6 py-3 bg-[#D4AF37] text-black rounded-lg font-bold text-lg hover:bg-[#C9A62F] transition-colors"
                >
                  List Username
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* My Listings Tab */}
        {activeTab === 'my-listings' && (
          <div className="space-y-4">
            {myListings.map((listing) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold mb-2">@{listing.username}</div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-medium ${getCategoryColor(listing.category)}`}
                      >
                        {listing.category}
                      </span>
                      <div className="text-xl font-bold text-[#D4AF37]">
                        {listing.price} SOL
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white/5 rounded-lg font-medium hover:bg-white/10 transition-colors">
                      Edit Price
                    </button>
                    <button className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg font-medium hover:bg-red-500/20 transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {myListings.length === 0 && (
              <div className="glass-card rounded-2xl p-12 text-center border border-white/10">
                <Tag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400 mb-4">You don't have any listings yet</p>
                <button
                  onClick={() => setActiveTab('sell')}
                  className="px-6 py-2 bg-[#D4AF37] text-black rounded-lg font-medium hover:bg-[#C9A62F] transition-colors"
                >
                  Create Listing
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
