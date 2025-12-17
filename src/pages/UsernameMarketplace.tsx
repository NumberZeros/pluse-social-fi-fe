import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useWallet } from '../lib/wallet-adapter';
import { PublicKey } from '@solana/web3.js';

import { AppLayout } from '../components/layout/AppLayout';
import { useUIStore } from '../stores/useUIStore';
import { useListUsername, useBuyUsername, useListings, useCancelListing } from '../hooks/useMarketplace';
import { useUserNFTs } from '../hooks/useUserNFTs';
import { PDAs } from '../services/pda';
import { useSocialFi } from '../hooks/useSocialFi';
import { Search, TrendingUp, Tag, Plus, CheckCircle2, Sparkles, ShoppingBag } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function UsernameMarketplace() {
  const { publicKey, connected } = useWallet();
  const { sdk } = useSocialFi();
  
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'my-listings'>(
    'buy',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc'>('asc');

  // Blockchain hooks
  const { openMintUsernameModal } = useUIStore();
  
  // Blockchain hooks
  // Blockchain hooks
  const listUsernameMutation = useListUsername();
  const buyUsernameMutation = useBuyUsername();
  const cancelListingMutation = useCancelListing();

  // Fetch my wallet NFTs
  const { data: userNFTs = [], isLoading: isLoadingNFTs } = useUserNFTs(publicKey || undefined);

  // Fetch listings from blockchain
  const { data: blockchainListings = [] } = useListings();

  const [listingUsernameInput, setListingUsernameInput] = useState('');
  const [newListingPrice, setNewListingPrice] = useState('');
  const [newListingCategory, setNewListingCategory] = useState<
    'premium' | 'short' | 'rare' | 'custom'
  >('premium');

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

  const handleCreateListing = async () => {
    if (!connected || !sdk) {
      toast.error('Please connect your wallet');
      return;
    }
    if (!listingUsernameInput) {
      toast.error('Please enter a username');
      return;
    }

    if (!newListingPrice || isNaN(parseFloat(newListingPrice))) {
      toast.error('Please enter a valid price');
      return;
    }
     
     // Derive PDA to get the NFT address
    const [usernameNft] = PDAs.getUsernameNFT(listingUsernameInput);
    
    // We need the mint address. The NFT account stores it.
    // Fetch the NFT account to get the mint
    let mintPubkey: PublicKey;
    try {
        console.log('Fetching NFT account for:', listingUsernameInput);
        console.log('PDA:', usernameNft.toBase58());
        const nftAccount = await sdk.program.account.usernameNft.fetch(usernameNft);
        console.log('Token Mint:', nftAccount.mint.toBase58());
        mintPubkey = nftAccount.mint;
    } catch (e: any) {
        console.error('Failed to fetch UsernameNFT account:', e);
        if (e.message?.includes('Account does not exist')) {
             toast.error(`You don't own the username "@${listingUsernameInput}" or it hasn't been minted properly.`);
        } else {
             toast.error(`Error fetching NFT: ${e.message}`);
        }
        return;
    }

    listUsernameMutation.mutate(
      { 
        nftPubkey: usernameNft, 
        mintPubkey: mintPubkey,
        priceInSol: parseFloat(newListingPrice) 
      },
      {
        onSuccess: () => {
          setListingUsernameInput('');
          setNewListingPrice('');
          setActiveTab('buy');
        },
        onError: (error: any) => {
          toast.error(error.message || 'Failed to list username');
        },
      }
    );
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 relative overflow-hidden glass-card rounded-3xl p-8 md:p-10 border border-white/10"
        >
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--color-solana-green)]/10 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
                IDENTITY <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-solana-green)] to-[#14C58E]">MARKET</span>
              </h1>
              <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
                Secure your decentralized identity. Trade premium usernames on Solana.
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openMintUsernameModal}
              className="px-6 py-3 bg-[var(--color-solana-green)] hover:bg-[#9FE51C] text-black rounded-xl font-bold transition-all shadow-lg shadow-[var(--color-solana-green)]/10 flex items-center gap-2 text-base"
            >
              <Sparkles className="w-5 h-5" />
              Mint Username
            </motion.button>
          </div>
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
            { label: 'Volume (24h)', value: '1,240 SOL', icon: Sparkles },
            { label: 'My Listings', value: myListings.length, icon: ShoppingBag },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl p-4 border border-white/10 bg-white/5 flex flex-col justify-between h-full"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/5 rounded-lg text-[var(--color-solana-green)]">
                   <stat.icon className="w-5 h-5" />
                </div>
                <div className="text-xl font-bold font-mono">{stat.value}</div>
              </div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider pl-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="glass-card p-1.5 rounded-full border border-white/10 flex items-center gap-1 bg-black/40">
            {[
              { id: 'buy', label: 'Browse', icon: Search },
              { id: 'sell', label: 'List', icon: Plus },
              { id: 'my-listings', label: 'Portfolio', icon: Tag },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === tab.id 
                    ? 'bg-white text-black shadow-lg shadow-white/5' 
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
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
             className="space-y-6"
          >
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[var(--color-solana-green)] transition-colors" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search usernames..."
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 outline-none focus:border-[var(--color-solana-green)] focus:bg-white/10 transition-all font-mono"
                    />
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  <div className="relative w-1/2 md:w-40">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-[var(--color-solana-green)] focus:bg-white/10 transition-all appearance-none cursor-pointer font-medium"
                    >
                      <option value="all">All Types</option>
                      <option value="short">Short</option>
                      <option value="premium">Premium</option>
                      <option value="rare">Rare</option>
                      <option value="custom">Custom</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                    </div>
                  </div>

                  <div className="relative w-1/2 md:w-40">
                    <select
                      value={priceSort}
                      onChange={(e) => setPriceSort(e.target.value as any)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-[var(--color-solana-green)] focus:bg-white/10 transition-all appearance-none cursor-pointer font-medium"
                    >
                      <option value="asc">Lowest Price</option>
                      <option value="desc">Highest Price</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                           <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                    </div>
                  </div>
                </div>
            </div>

            {/* Listings Grid - More Compact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(filteredListings as any[]).map((listing: any) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -4, backgroundColor: 'rgba(255,255,255,0.08)' }}
                  className="glass-card rounded-2xl p-5 border border-white/5 bg-white/5 hover:border-[var(--color-solana-green)]/30 transition-all group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4">
                     <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border ${getCategoryColor(listing.category || 'custom')}`}
                      >
                        {listing.category || 'custom'}
                      </span>
                      {listing.verified && (
                          <div className="text-[var(--color-solana-green)]" title="Verified">
                             <CheckCircle2 className="w-4 h-4" />
                          </div>
                      )}
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-xl font-bold text-white group-hover:text-[var(--color-solana-green)] transition-colors truncate">
                      @{listing.username}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 truncate">
                       Mint: {listing.nftPubkey?.toBase58().slice(0, 4)}...{listing.nftPubkey?.toBase58().slice(-4)}
                    </div>
                  </div>

                  <div className="flex items-end justify-between mt-auto pt-4 border-t border-white/5">
                    <div>
                      <div className="text-xs text-gray-400 mb-0.5">Price</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-white font-mono">{listing.price}</span>
                        <span className="text-xs text-gray-500 font-bold">SOL</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                          onClick={() => handlePurchase(listing)}
                          className="px-4 py-2 bg-[var(--color-solana-green)] hover:bg-[#9FE51C] text-black text-xs font-bold rounded-lg transition-all shadow-lg shadow-green-500/10 hover:shadow-green-500/20"
                        >
                          Buy
                        </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredListings.length === 0 && (
              <div className="glass-card rounded-2xl p-16 text-center border border-white/5 dashed-border bg-gradient-to-br from-white/5 to-transparent">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                   <Search className="w-6 h-6 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">No listings found</h3>
                <p className="text-gray-400 text-sm">Target username not listed? Unlisted usernames cannot be bought.</p>
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left Column: Inventory Selection */}
                <div className="w-full md:w-1/2">
                   <div className="glass-card rounded-2xl p-6 border border-white/10 h-full flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-bold text-lg">Your Wallet</h3>
                         {isLoadingNFTs && <div className="text-xs text-[var(--color-solana-green)] animate-pulse">Syncing...</div>}
                      </div>

                      {userNFTs.length === 0 ? (
                         <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-white/5 rounded-xl">
                            <ShoppingBag className="w-10 h-10 text-gray-600 mb-3" />
                            <p className="text-gray-400 text-sm mb-4">No usernames found.</p>
                            <button onClick={openMintUsernameModal} className="text-black bg-white/10 hover:bg-[var(--color-solana-green)] hover:text-black px-4 py-2 rounded-lg text-sm font-bold transition-all">
                              Mint Username
                            </button>
                         </div>
                      ) : (
                        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2 max-h-[400px]">
                          {userNFTs.map((nft) => (
                            <button
                              key={nft.mint}
                              onClick={() => setListingUsernameInput(nft.username)}
                              className={`w-full p-4 rounded-xl text-left transition-all border group relative overflow-hidden ${
                                listingUsernameInput === nft.username
                                  ? 'bg-[var(--color-solana-green)] border-[var(--color-solana-green)] shadow-[0_0_15px_rgba(20,241,149,0.2)]'
                                  : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                              }`}
                            >
                              <div className="relative z-10 flex justify-between items-center">
                                <div>
                                   <div className={`font-bold text-lg ${listingUsernameInput === nft.username ? 'text-black' : 'text-white'}`}>@{nft.username}</div>
                                   <div className={`text-xs font-mono mt-0.5 ${listingUsernameInput === nft.username ? 'text-black/60' : 'text-gray-500'}`}>{nft.mint.slice(0, 4)}...{nft.mint.slice(-4)}</div>
                                </div>
                                {listingUsernameInput === nft.username && (
                                   <div className="bg-black/10 p-1 rounded-full">
                                     <CheckCircle2 className="w-5 h-5 text-black" />
                                   </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                   </div>
                </div>

                {/* Right Column: Listing Form */}
                <div className="w-full md:w-1/2">
                  <div className="glass-card rounded-2xl p-8 border border-white/10 relative overflow-hidden h-full">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-solana-green)]/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                     
                     <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                        List for Sale
                     </h2>

                     <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-gray-400 text-xs font-bold uppercase tracking-wider ml-1">Selected Username</label>
                          <div className={`w-full px-4 py-4 rounded-xl text-lg font-bold border transition-all ${
                             listingUsernameInput 
                               ? 'bg-black/40 border-[var(--color-solana-green)]/50 text-white' 
                               : 'bg-black/20 border-white/5 text-gray-600'
                          }`}>
                             {listingUsernameInput ? `@${listingUsernameInput}` : 'Select a username ->'}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-gray-400 text-xs font-bold uppercase tracking-wider ml-1">Set Price (SOL)</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={newListingPrice}
                              onChange={(e) => setNewListingPrice(e.target.value)}
                              placeholder="0.00"
                              disabled={!listingUsernameInput}
                              className="w-full px-4 py-4 pl-4 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-[var(--color-solana-green)] focus:bg-black/60 transition-all font-mono text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">SOL</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-gray-400 text-xs font-bold uppercase tracking-wider ml-1">Category</label>
                          <div className="grid grid-cols-2 gap-2">
                            {(['short', 'premium', 'rare', 'custom'] as const).map((cat) => (
                              <button
                                key={cat}
                                onClick={() => setNewListingCategory(cat)}
                                disabled={!listingUsernameInput}
                                className={`py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                                  newListingCategory === cat
                                    ? 'bg-[var(--color-solana-green)] text-black border-[var(--color-solana-green)]'
                                    : 'bg-black/20 border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={handleCreateListing}
                          disabled={!listingUsernameInput || !newListingPrice}
                          className="w-full py-4 bg-[var(--color-solana-green)] hover:bg-[#9FE51C] text-black rounded-xl font-bold text-lg transition-all shadow-lg shadow-green-500/10 hover:shadow-green-500/20 active:scale-[0.99] mt-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none bg-gradient-to-r from-[var(--color-solana-green)] to-[#14C58E]"
                        >
                          Confirm Listing
                        </button>
                     </div>
                  </div>
                </div>
              </div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Portfolio Tab */}
        <AnimatePresence mode="wait">
        {activeTab === 'my-listings' && (
          <motion.div 
             key="my-listings"
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
             className="space-y-8"
          >
            {/* Section 1: In Wallet */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[var(--color-solana-green)]" />
                In Your Wallet
                <span className="text-xs bg-white/10 text-gray-400 px-2 py-1 rounded-full ml-2">{userNFTs.length}</span>
              </h3>
              
              {userNFTs.length === 0 ? (
                <div className="glass-card rounded-2xl p-8 text-center border border-white/5 bg-white/5">
                  <p className="text-gray-400 text-sm">You don't have any usernames in your wallet.</p>
                  <button onClick={openMintUsernameModal} className="mt-4 text-[var(--color-solana-green)] hover:text-white text-sm font-bold transition-colors">
                    Mint a Username &rarr;
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {userNFTs.map((nft) => (
                    <div key={nft.mint} className="glass-card rounded-2xl p-5 border border-white/10 bg-white/5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--color-solana-green)]/10 text-[var(--color-solana-green)] border border-[var(--color-solana-green)]/20">
                           Held
                        </div>
                      </div>
                      <div className="text-xl font-bold text-white truncate mb-1">@{nft.username}</div>
                      <div className="text-xs text-gray-500 font-mono mb-4">{nft.mint.slice(0, 4)}...{nft.mint.slice(-4)}</div>
                      
                      <button 
                        onClick={() => {
                          setListingUsernameInput(nft.username);
                          setActiveTab('sell');
                        }}
                        className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-bold transition-all"
                      >
                        List for Sale
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: On Market */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-400" />
                Listed for Sale
                <span className="text-xs bg-white/10 text-gray-400 px-2 py-1 rounded-full ml-2">{myListings.length}</span>
              </h3>

              {myListings.length === 0 ? (
                <div className="glass-card rounded-2xl p-8 text-center border border-white/5 border-dashed">
                  <p className="text-gray-400 text-sm">You haven't listed any items specifically.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(myListings as any[]).map((listing: any) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="glass-card rounded-2xl p-5 border border-white/10 bg-white/5"
                    >
                      <div className="flex justify-between items-start mb-4">
                         <div className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            On Sale
                         </div>
                         <div className="p-1.5 rounded-full bg-red-500/10 text-red-500 cursor-pointer hover:bg-red-500/20 transition-colors" title="Cancel Listing" onClick={() => cancelListingMutation.mutate(new PublicKey(listing.listingAddress || listing.id))}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                         </div>
                      </div>

                      <div className="mb-4">
                        <div className="text-xl font-bold text-white mb-1 truncate">@{listing.username}</div>
                        <div className="text-lg font-bold text-[var(--color-solana-green)] font-mono">{listing.price} SOL</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {/* Modal removed/globalized */}
      </AnimatePresence>

    </AppLayout>
  );
}
