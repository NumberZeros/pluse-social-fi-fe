import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useWallet } from '../lib/wallet-adapter';
import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '../components/layout/AppLayout';
import { useMintUsername, useListUsername, useBuyUsername } from '../hooks/useMarketplace';
import { useSocialFi } from '../hooks/useSocialFi';
import { Search, TrendingUp, Tag, Plus, CheckCircle2, AlertCircle, X, Sparkles, ShoppingBag } from 'lucide-react';
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
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'premium':
        return 'bg-[var(--color-solana-green)]/20 text-[var(--color-solana-green)] border-[var(--color-solana-green)]/30';
      case 'rare':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      default:
        return 'bg-white/10 text-gray-400 border-white/10';
    }
  };

  return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 relative overflow-hidden glass-card rounded-[2.5rem] p-10 md:p-14 border border-white/10"
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-solana-green)]/10 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
                IDENTITY <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-solana-green)] to-[#14C58E]">
                   MARKETPLACE
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                Secure your unique decentralized identity. Buy, sell, and trade premium usernames on the Solana blockchain.
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMintModal(true)}
              className="px-8 py-4 bg-[var(--color-solana-green)] hover:bg-[#9FE51C] text-black rounded-2xl font-bold transition-all shadow-xl shadow-[var(--color-solana-green)]/10 flex items-center gap-3 text-lg"
            >
              <Sparkles className="w-5 h-5" />
              Mint Username
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Listings', value: blockchainListings.length, icon: Tag },
            {
              label: 'Avg Price',
              value: `${(blockchainListings.reduce((sum: number, l: any) => sum + l.price, 0) / blockchainListings.length || 0).toFixed(1)} SOL`,
              icon: TrendingUp,
            },
            { label: 'Volume (24h)', value: '1,240 SOL', icon: Sparkles },
            { label: 'My Listings', value: myListings.length, icon: ShoppingBag },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="glass-card rounded-[2rem] p-6 border border-white/10 bg-white/5"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-white/5 rounded-xl text-[var(--color-solana-green)]">
                   <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </div>
              <div className="text-sm text-gray-400 font-medium pl-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="glass-card p-2 rounded-full border border-white/10 flex items-center gap-2">
            {[
              { id: 'buy', label: 'Browse Listings', icon: Search },
              { id: 'sell', label: 'List Username', icon: Plus },
              { id: 'my-listings', label: 'My Listings', icon: Tag },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${
                  activeTab === tab.id 
                    ? 'bg-white text-black shadow-lg shadow-white/10' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Buy Tab */}
        <AnimatePresence mode="wait">
        {activeTab === 'buy' && (
          <motion.div 
             key="buy"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             className="space-y-8"
          >
            {/* Filters */}
            <div className="glass-card rounded-2xl p-6 border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-gray-400 text-sm font-bold mb-3 ml-1">
                    Search Username
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-full pl-12 pr-4 py-4 bg-[#0A0A0A] border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-[var(--color-solana-green)] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-bold mb-3 ml-1">Category</label>
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-5 py-4 bg-[#0A0A0A] border border-white/10 rounded-xl text-white outline-none focus:border-[var(--color-solana-green)] transition-all appearance-none cursor-pointer"
                    >
                      <option value="all">All Categories</option>
                      <option value="short">Short (3-4 chars)</option>
                      <option value="premium">Premium</option>
                      <option value="rare">Rare</option>
                      <option value="custom">Custom</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                           <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-bold mb-3 ml-1">Sort by Price</label>
                  <div className="relative">
                    <select
                      value={priceSort}
                      onChange={(e) => setPriceSort(e.target.value as any)}
                      className="w-full px-5 py-4 bg-[#0A0A0A] border border-white/10 rounded-xl text-white outline-none focus:border-[var(--color-solana-green)] transition-all appearance-none cursor-pointer"
                    >
                      <option value="asc">Low to High</option>
                      <option value="desc">High to Low</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                           <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(filteredListings as any[]).map((listing: any) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5 }}
                  className="glass-card rounded-[2rem] p-8 border border-white/10 hover:border-[var(--color-solana-green)]/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="text-3xl font-black mb-2 group-hover:text-[var(--color-solana-green)] transition-colors tracking-tight">@{listing.username}</div>
                      <span
                        className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold border ${getCategoryColor(listing.category)}`}
                      >
                        {listing.category.toUpperCase()}
                      </span>
                    </div>
                    {listing.verified && (
                      <div className="w-8 h-8 rounded-full bg-[var(--color-solana-green)] flex items-center justify-center shadow-lg shadow-green-500/20">
                         <CheckCircle2 className="w-5 h-5 text-black" />
                      </div>
                    )}
                  </div>

                  <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="text-sm text-gray-400 mb-1">Current Price</div>
                    <div className="text-3xl font-mono font-bold text-white">
                      {listing.price} <span className="text-lg text-gray-500">SOL</span>
                    </div>
                    <div className="text-sm font-bold text-[var(--color-solana-green)] mt-1">
                      ≈ ${(listing.price * 145).toFixed(2)} USD
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handlePurchase(listing)}
                      className="px-4 py-3 bg-[var(--color-solana-green)] hover:bg-[#9FE51C] text-black rounded-xl font-bold transition-all shadow-lg shadow-green-500/10 hover:shadow-green-500/20"
                    >
                      Buy Now
                    </button>
                    <button
                      onClick={() => handleMakeOffer(listing.id, listing.username)}
                      className="px-4 py-3 bg-white/5 text-white rounded-xl font-bold hover:bg-white/10 transition-colors"
                    >
                      Make Offer
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredListings.length === 0 && (
              <div className="glass-card rounded-[3rem] p-20 text-center border border-white/10 dashed-border bg-gradient-to-br from-white/5 to-transparent">
                <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                   <Search className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-3xl font-bold mb-4">No usernames found</h3>
                <p className="text-gray-400 text-lg">Try adjusting your search criteria</p>
              </div>
            )}
          </motion.div>
        )}
        </AnimatePresence>

        {/* Sell Tab */}
        <AnimatePresence mode="wait">
        {activeTab === 'sell' && (
          <motion.div
              key="sell"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="glass-card rounded-[2.5rem] p-10 border border-white/10 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden">
                <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-8">List Username for Sale</h2>

                <div className="space-y-8">
                  <div>
                    <label className="block text-gray-400 font-bold mb-3 ml-1">Username</label>
                    <input
                      type="text"
                      value={newListingUsername}
                      onChange={(e) => setNewListingUsername(e.target.value)}
                      placeholder="Enter username"
                      className="w-full px-6 py-4 bg-[#0A0A0A] border border-white/10 rounded-2xl text-white placeholder-gray-600 outline-none focus:border-[var(--color-solana-green)] transition-all text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 font-bold mb-3 ml-1">Price (SOL)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={newListingPrice}
                        onChange={(e) => setNewListingPrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-6 py-4 pl-6 bg-[#0A0A0A] border border-white/10 rounded-2xl text-white placeholder-gray-600 outline-none focus:border-[var(--color-solana-green)] transition-all text-lg font-mono"
                      />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500 bg-white/5 px-2 py-1 rounded">SOL</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 font-bold mb-3 ml-1">Category</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['short', 'premium', 'rare', 'custom'] as const).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setNewListingCategory(cat)}
                          className={`px-4 py-3 rounded-xl font-bold transition-all border ${
                            newListingCategory === cat
                              ? 'bg-[var(--color-solana-green)] text-black border-[var(--color-solana-green)] shadow-[0_0_20px_rgba(20,241,149,0.3)]'
                              : 'bg-[#0A0A0A] border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                          }`}
                        >
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleCreateListing}
                    className="w-full py-5 bg-[var(--color-solana-green)] hover:bg-[#9FE51C] text-black rounded-2xl font-black text-xl transition-all shadow-xl shadow-[var(--color-solana-green)]/10 hover:shadow-[var(--color-solana-green)]/20 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    List Username
                  </button>
                </div>
                </div>
              </div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* My Listings Tab */}
        <AnimatePresence mode="wait">
        {activeTab === 'my-listings' && (
          <motion.div 
             key="my-listings"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             className="space-y-4"
          >
            {(myListings as any[]).map((listing: any) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-[2rem] p-8 border border-white/10"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="text-3xl font-black mb-3">@{listing.username}</div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getCategoryColor(listing.category)}`}
                      >
                        {listing.category.toUpperCase()}
                      </span>
                      <div className="text-xl font-mono font-bold text-white">
                        {listing.price} <span className="text-gray-500 text-base">SOL</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="px-6 py-3 bg-white/5 rounded-xl font-bold hover:bg-white/10 transition-colors border border-white/5">
                      Edit Price
                    </button>
                    <button className="px-6 py-3 bg-red-500/10 text-red-500 rounded-xl font-bold hover:bg-red-500/20 transition-colors border border-red-500/20">
                      Remove Listing
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {myListings.length === 0 && (
              <div className="glass-card rounded-[3rem] p-20 text-center border border-white/10 dashed-border">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                   <Tag className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold mb-4">You don't have any listings yet</h3>
                <button
                  onClick={() => setActiveTab('sell')}
                  className="px-8 py-4 bg-[var(--color-solana-green)] hover:bg-[#9FE51C] text-black rounded-xl font-bold transition-all shadow-lg"
                >
                  Create Listing
                </button>
              </div>
            )}
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* Mint Username Modal */}
      <AnimatePresence>
      {showMintModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-card rounded-[2.5rem] p-10 border border-white/10 max-w-lg w-full shadow-2xl shadow-black/50"
          >
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-3xl font-bold">Mint Username NFT</h2>
               <button
                  onClick={() => setShowMintModal(false)}
                  className="p-3 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
            </div>
            
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-gray-400 font-bold mb-3 ml-1">Desired Username</label>
                <input
                  type="text"
                  value={newListingUsername}
                  onChange={(e) => setNewListingUsername(e.target.value)}
                  placeholder="e.g. satoshi"
                  className="w-full px-6 py-4 bg-[#0A0A0A] border border-white/10 rounded-2xl text-white placeholder-gray-600 outline-none focus:border-[var(--color-solana-green)] transition-all text-lg font-bold"
                />
              </div>

              <div className="p-6 bg-[var(--color-value-amber)]/10 border border-[var(--color-value-amber)]/20 rounded-2xl flex gap-4">
                <AlertCircle className="w-6 h-6 text-[var(--color-value-amber)] shrink-0" />
                <p className="text-sm font-medium text-[var(--color-value-amber)]/90 leading-relaxed">
                  Minting a username NFT will create a unique on-chain asset that represents ownership of this identity. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowMintModal(false)}
                className="flex-1 px-6 py-4 bg-white/5 rounded-xl font-bold hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMintUsername}
                disabled={!newListingUsername || mintUsernameMutation.isPending}
                className="flex-[2] px-6 py-4 bg-[var(--color-solana-green)] hover:bg-[#9FE51C] text-black rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--color-solana-green)]/20"
              >
                {mintUsernameMutation.isPending ? 'Minting...' : 'Mint Identity'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </AppLayout>
  );
}
