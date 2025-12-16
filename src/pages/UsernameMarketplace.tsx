import { motion } from 'framer-motion';
import { useState } from 'react';
import { useWallet } from '../lib/wallet-adapter';
import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useMintUsername, useListUsername, useBuyUsername } from '../hooks/useMarketplace';
import { useSocialFi } from '../hooks/useSocialFi';
import { Search, TrendingUp, Tag, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function UsernameMarketplace() {
  const { publicKey, connected } = useWallet();
  useSocialFi();
  
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'my-listings'>(
    'buy',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc'>('asc');

  // Blockchain hooks
  const mintUsernameMutation = useMintUsername();
  const listUsernameMutation = useListUsername();
  const buyUsernameMutation = useBuyUsername();

  // Fetch listings from blockchain (placeholder - would query contract accounts)
  const { data: blockchainListings = [] } = useQuery({
    queryKey: ['marketplace_listings'],
    queryFn: async () => {
      // TODO: Query all username_listing PDAs from blockchain
      // For now, return empty array
      return [];
    },
  });

  const [newListingUsername, setNewListingUsername] = useState('');
  const [newListingPrice, setNewListingPrice] = useState('');
  const [newListingCategory, setNewListingCategory] = useState<
    'premium' | 'short' | 'rare' | 'custom'
  >('premium');
  const [showMintModal, setShowMintModal] = useState(false);

  const filteredListings = blockchainListings
    .filter((l: any) => {
      if (searchQuery && !l.username.toLowerCase().includes(searchQuery.toLowerCase()))
        return false;
      if (selectedCategory !== 'all' && l.category !== selectedCategory) return false;
      return true;
    })
    .sort((a: any, b: any) => (priceSort === 'asc' ? a.price - b.price : b.price - a.price));

  const myListings = publicKey
    ? blockchainListings.filter((l: any) => l.seller === publicKey.toBase58())
    : [];

  const handleMintUsername = () => {
    if (!connected) {
      toast.error('Please connect your wallet');
      return;
    }
    if (!newListingUsername) {
      toast.error('Please enter a username');
      return;
    }

    mintUsernameMutation.mutate(
      { username: newListingUsername, metadataUri: '' },
      {
        onSuccess: () => {
          toast.success('Username minted successfully!');
          setNewListingUsername('');
          setShowMintModal(false);
        },
        onError: (error: any) => {
        toast.error(error.message || 'Failed to mint username');
      },
    });
  };

  const handleCreateListing = () => {
    if (!connected) {
      toast.error('Please connect your wallet');
      return;
    }
    if (!newListingUsername || !newListingPrice) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!newListingUsername || !newListingPrice) {
      toast.error('Please fill in all fields');
      return;
    }

    // TODO: In reality, resolve username to NFT mint address
    // For now, just update blockchain
    try {
      const usernameNft = new PublicKey(newListingUsername); // Placeholder
      listUsernameMutation.mutate(
        { nftPubkey: usernameNft, mintPubkey: usernameNft, priceInSol: parseFloat(newListingPrice) },
        {
          onSuccess: () => {
            toast.success('Username listed for sale!');
            setNewListingUsername('');
            setNewListingPrice('');
          },
          onError: (error: any) => {
            toast.error(error.message || 'Failed to list username');
          },
        },
      );
    } catch {
      toast.error('Invalid username NFT');
    }
  };

  const handlePurchase = (listing: any) => {
    if (!connected) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!listing) {
      toast.error('Listing not found');
      return;
    }

    try {
      // Get listing details from blockchain
      const listingPubkey = new PublicKey(listing.listingAddress || listing.id);
      const nftPubkey = new PublicKey(listing.nftMint || listing.id);
      const mintPubkey = nftPubkey; // Same for now
      const sellerPubkey = new PublicKey(listing.seller);

      buyUsernameMutation.mutate(
        { listingPubkey, nftPubkey, mintPubkey, sellerPubkey },
        {
          onSuccess: () => {
            toast.success(`Username purchased for ${listing.price} SOL!`);
          },
          onError: (error: any) => {
            toast.error(error.message || 'Failed to purchase username');
          },
        },
      );
    } catch {
      toast.error('Invalid listing data');
    }
  };

  const handleMakeOffer = (_listingId: string, _username: string) => {
    toast.error('Offers are not yet implemented in the contract');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'short':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'premium':
        return 'bg-[var(--color-solana-green)]/20 text-[var(--color-solana-green)]';
      case 'rare':
        return 'bg-pink-500/20 text-pink-400';
      default:
        return 'bg-white/10 text-gray-400';
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
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[var(--color-value-amber)] to-[var(--color-primary-green)] bg-clip-text text-transparent">
              Username Marketplace
            </h1>
            <button
              onClick={() => setShowMintModal(true)}
              className="px-6 py-3 bg-[var(--color-solana-green)] hover:bg-[#9FE51C] text-black rounded-lg font-bold transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Mint Username
            </button>
          </div>
          <p className="text-gray-400 text-lg">
            Buy, sell, and auction premium Pulse usernames
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Listings', value: blockchainListings.length, icon: Tag },
            {
              label: 'Avg Price',
              value: `${(blockchainListings.reduce((sum: number, l: any) => sum + l.price, 0) / blockchainListings.length || 0).toFixed(1)} SOL`,
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
                <stat.icon className="w-5 h-5 text-[var(--color-value-amber)]" />
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
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-solana-green)]"
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
              {(filteredListings as any[]).map((listing: any) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card rounded-2xl p-6 border border-white/10 hover:border-[var(--color-solana-green)]/50 transition-all"
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
                      <div className="w-6 h-6 rounded-full bg-[var(--color-solana-green)] flex items-center justify-center">
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
                    <div className="text-3xl font-bold text-[var(--color-value-amber)]">
                      {listing.price} SOL
                    </div>
                    <div className="text-sm text-gray-400">
                      ${(listing.price * 100).toFixed(2)} USD
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePurchase(listing)}
                      className="flex-1 px-4 py-2 bg-[var(--color-solana-green)] hover:bg-[#9FE51C] text-black rounded-lg font-bold transition-all"
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
        {false && (
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-12 text-center border border-white/10">
              <p className="text-gray-400">Auctions feature coming soon</p>
            </div>
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
                            ? 'bg-[var(--color-solana-green)] text-black'
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
                  className="w-full px-6 py-3 bg-[var(--color-solana-green)] hover:bg-[#9FE51C] text-black rounded-lg font-bold text-lg transition-all"
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
            {(myListings as any[]).map((listing: any) => (
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
                      <div className="text-xl font-bold text-[var(--color-value-amber)]">
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
                  className="px-6 py-2 bg-[var(--color-solana-green)] hover:bg-[#9FE51C] text-black rounded-lg font-bold transition-all"
                >
                  Create Listing
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />

      {/* Mint Username Modal */}
      {showMintModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-8 border border-white/10 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold mb-6">Mint Username NFT</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={newListingUsername}
                  onChange={(e) => setNewListingUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:border-[var(--color-solana-green)] transition-colors"
                />
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-400">
                  Minting a username NFT will create a unique on-chain asset that represents ownership of this username.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowMintModal(false)}
                className="flex-1 px-4 py-2 bg-white/5 rounded-lg font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMintUsername}
                disabled={!newListingUsername || mintUsernameMutation.isPending}
                className="flex-1 px-4 py-2 bg-[var(--color-solana-green)] hover:bg-[#9FE51C] text-black rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mintUsernameMutation.isPending ? 'Minting...' : 'Mint'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
