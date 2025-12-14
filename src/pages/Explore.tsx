import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import {
  IconArt,
  IconBolt,
  IconCoin,
  IconGaming,
  IconSparkle,
  IconTrend,
} from '../components/icons/PulseIcons';
import { SEO } from '../components/SEO';

const EXPLORE_CATEGORIES = [
  { id: 'trending', label: 'Trending', icon: <IconTrend className="w-4 h-4" /> },
  { id: 'new', label: 'New', icon: <IconSparkle className="w-4 h-4" /> },
  { id: 'art', label: 'Art', icon: <IconArt className="w-4 h-4" /> },
  { id: 'gaming', label: 'Gaming', icon: <IconGaming className="w-4 h-4" /> },
  { id: 'defi', label: 'DeFi', icon: <IconCoin className="w-4 h-4" /> },
  { id: 'tech', label: 'Tech', icon: <IconBolt className="w-4 h-4" /> },
];

// Trending content requires on-chain indexing or off-chain aggregator
const TRENDING_POSTS: any[] = [];

export function Explore() {
  const [activeCategory, setActiveCategory] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search query
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredPosts = TRENDING_POSTS.filter((post) => {
    if (!debouncedQuery) return true;
    const query = debouncedQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query) ||
      post.author.toLowerCase().includes(query)
    );
  });

  return (
    <div className="bg-black min-h-screen text-white">
      <SEO
        title="Explore"
        description="Discover trending topics, new content, and popular creators on Pulse Social. Find art, gaming, DeFi, and tech content on Solana."
        url="/explore"
      />
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-4 pt-24 pb-12">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">
            Explore <span className="text-[var(--color-solana-green)]">Pulse</span>
          </h1>
          <p className="text-xl text-gray-400">
            Discover the best content on the Solana social layer
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts, topics, or users..."
              className="w-full px-6 py-4 pl-14 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 outline-none focus:border-[var(--color-solana-green)] transition-colors"
            />
            {isSearching ? (
              <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-[#ABFE2C] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg
                className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-3 mb-12 overflow-x-auto pb-4 scrollbar-hide">
          {EXPLORE_CATEGORIES.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold whitespace-nowrap transition-colors ${
                activeCategory === category.id
                  ? 'bg-[var(--color-solana-green)] text-black'
                  : 'bg-white/5 hover:bg-white/10 text-white'
              }`}
            >
              <span
                className={
                  activeCategory === category.id ? 'text-black' : 'text-white/80'
                }
              >
                {category.icon}
              </span>
              <span>{category.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Search Results Info */}
        {debouncedQuery && (
          <div className="mb-6 text-gray-400">
            Found <span className="text-white font-bold">{filteredPosts.length}</span>{' '}
            result{filteredPosts.length !== 1 ? 's' : ''} for "{debouncedQuery}"
          </div>
        )}

        {/* Trending Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--color-solana-green)] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-400 mb-4 line-clamp-2">{post.excerpt}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}`}
                        alt={post.author}
                        className="w-8 h-8 rounded-full bg-gray-800"
                      />
                      <span className="text-sm font-medium">@{post.author}</span>
                    </div>

                    <div className="flex items-center gap-1 text-gray-400">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm">{post.likes}</span>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/5 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">No results found</h3>
              <p className="text-gray-400">Try searching for something else</p>
            </div>
          )}
        </div>

        {/* Load More */}
        {!debouncedQuery && filteredPosts.length > 0 && (
          <div className="flex justify-center mt-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-full font-bold transition-colors"
            >
              Load More
            </motion.button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
