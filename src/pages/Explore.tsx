import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { SEO } from '../components/SEO';
import {
  Sparkles,
  TrendingUp,
  Gamepad2,
  Palette,
  Coins,
  Cpu,
  Search,
  ArrowRight,
  Flame,
  Globe,
  MessageCircle,
  Heart,
  Share2,
} from 'lucide-react';

const EXPLORE_CATEGORIES = [
  { id: 'trending', label: 'Trending', icon: <TrendingUp className="w-4 h-4" />, color: 'from-orange-500 to-red-500' },
  { id: 'new', label: 'New', icon: <Sparkles className="w-4 h-4" />, color: 'from-blue-400 to-purple-500' },
  { id: 'art', label: 'Art', icon: <Palette className="w-4 h-4" />, color: 'from-pink-500 to-rose-500' },
  { id: 'gaming', label: 'Gaming', icon: <Gamepad2 className="w-4 h-4" />, color: 'from-green-400 to-emerald-500' },
  { id: 'defi', label: 'DeFi', icon: <Coins className="w-4 h-4" />, color: 'from-yellow-400 to-orange-500' },
  { id: 'tech', label: 'Tech', icon: <Cpu className="w-4 h-4" />, color: 'from-cyan-400 to-blue-500' },
];

// Mock data for display purposes
const TRENDING_POSTS = [
  {
    id: 1,
    title: "The Future of SocialFi on Solana",
    excerpt: "Why decentralized social media is the next big wave in crypto. We're seeing massive adoption...",
    author: "solana_legend",
    likes: 1240,
    comments: 85,
    shares: 430,
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800",
    category: "tech",
    time: "2h ago"
  },
  {
    id: 2,
    title: "Concept Art: Cyberpunk City 3049",
    excerpt: "Just finished this piece for the upcoming NFT collection. What do you think about the lighting?",
    author: "digital_dreamer",
    likes: 3500,
    comments: 210,
    shares: 890,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
    category: "art",
    time: "4h ago"
  },
  {
    id: 3,
    title: "Top 5 Play-to-Earn Games This Month",
    excerpt: "Ranking the best blockchain games by yield and gameplay. You won't believe number 1!",
    author: "game_master",
    likes: 890,
    comments: 156,
    shares: 120,
    image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=800",
    category: "gaming",
    time: "6h ago"
  },
  {
    id: 4,
    title: "Liquidity Mining Strategies 101",
    excerpt: "How to maximize your APY while minimizing impermanent loss. A complete guide.",
    author: "defi_wizard",
    likes: 2100,
    comments: 340,
    shares: 670,
    image: "https://images.unsplash.com/photo-1620321023374-d1a68fdd720e?auto=format&fit=crop&q=80&w=800",
    category: "defi",
    time: "12h ago"
  },
  {
    id: 5,
    title: "Generative Art: The Code Behind the canvas",
    excerpt: "Explaining the algorithms used to generate unique art pieces on chain.",
    author: "creative_coder",
    likes: 1500,
    comments: 95,
    shares: 200,
    image: "https://images.unsplash.com/photo-1614728853913-1e32005e309a?auto=format&fit=crop&q=80&w=800",
    category: "art",
    time: "1d ago"
  },
  {
    id: 6,
    title: "New Solana Mobile Specs Leaked?",
    excerpt: "Rumors are circulating about the new Saga phone specs. Here is everything we know.",
    author: "tech_insider",
    likes: 3100,
    comments: 500,
    shares: 1200,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800",
    category: "tech",
    time: "1d ago"
  }
];

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
    const matchesCategory = activeCategory === 'trending' || activeCategory === 'new' || post.category === activeCategory;
    
    if (!debouncedQuery) return matchesCategory;
    
    const query = debouncedQuery.toLowerCase();
    const matchesSearch = (
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query) ||
      post.author.toLowerCase().includes(query)
    );

    return matchesCategory && matchesSearch;
  });

  return (
    <AppLayout>
      <SEO
        title="Explore"
        description="Discover trending topics, new content, and popular creators on Pulse Social. Find art, gaming, DeFi, and tech content on Solana."
        url="/explore"
      />

      <div className="max-w-[1400px] mx-auto pb-12">
        {/* Header Section */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="relative mb-12 text-center"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[var(--color-solana-green)]/10 blur-[100px] rounded-full pointer-events-none" />
          
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight relative z-10">
            EXPLORE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-solana-green)] to-[#14C58E] drop-shadow-[0_0_30px_rgba(20,241,149,0.3)]">
              THE PULSE
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto relative z-10">
            Discover the hottest content, creators, and communities on the Solana social layer.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 max-w-3xl mx-auto relative z-20"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-solana-green)] to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-hover:text-[var(--color-solana-green)] transition-colors" />
               <input
                 type="text"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Search posts, topics, or creators..."
                 className="w-full pl-16 pr-12 py-5 bg-[#0A0A0A] border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-solana-green)] transition-all text-lg shadow-xl"
               />
               {isSearching && (
                 <div className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-[var(--color-solana-green)] border-t-transparent rounded-full animate-spin"></div>
               )}
            </div>
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {EXPLORE_CATEGORIES.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all relative overflow-hidden group ${
                activeCategory === category.id
                  ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30'
              }`}
            >
              <span
                className={`transition-colors ${
                  activeCategory === category.id ? 'text-black' : `text-transparent bg-clip-text bg-gradient-to-r ${category.color} group-hover:text-white`
                }`}
              >
                {category.icon}
              </span>
              <span>{category.label}</span>
              {activeCategory === category.id && (
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] animate-[shimmer_1.5s_infinite]" />
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Trending Section */}
        <div className="mb-8">
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                 {activeCategory === 'trending' ? <Flame className="w-8 h-8 text-orange-500" /> : <Globe className="w-8 h-8 text-blue-500" />}
                 {EXPLORE_CATEGORIES.find(c => c.id === activeCategory)?.label || 'Trending'} Content
              </h2>
              {debouncedQuery && (
                <div className="text-gray-400 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                  Found <span className="text-white font-bold">{filteredPosts.length}</span> results
                </div>
              )}
           </div>

           <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             <AnimatePresence mode="popLayout">
               {filteredPosts.length > 0 ? (
                 filteredPosts.map((post, index) => (
                   <motion.article
                     layout
                     key={post.id}
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     transition={{ duration: 0.3, delay: index * 0.05 }}
                     className="glass-card rounded-[2rem] overflow-hidden border border-white/10 hover:border-[var(--color-solana-green)]/30 transition-all cursor-pointer group flex flex-col h-full hover:-translate-y-2 hover:shadow-2xl hover:shadow-[var(--color-solana-green)]/10"
                   >
                     <div className="relative h-56 overflow-hidden">
                       <img
                         src={post.image}
                         alt={post.title}
                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-transparent opacity-80" />
                       <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                          {post.category.toUpperCase()}
                       </div>
                     </div>
     
                     <div className="p-6 flex flex-col flex-1 relative">
                       <div className="flex items-center gap-3 mb-4">
                         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-solana-green)] to-emerald-600 p-[2px]">
                            <img
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}`}
                              alt={post.author}
                              className="w-full h-full rounded-full bg-black"
                            />
                         </div>
                         <div>
                            <div className="text-sm font-bold text-white hover:text-[var(--color-solana-green)] transition-colors">@{post.author}</div>
                            <div className="text-xs text-gray-500">{post.time}</div>
                         </div>
                       </div>
     
                       <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[var(--color-solana-green)] transition-colors line-clamp-2">
                         {post.title}
                       </h3>
                       <p className="text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed flex-1">{post.excerpt}</p>
     
                       <div className="flex items-center justify-between pt-4 border-t border-white/5">
                         <div className="flex items-center gap-4 text-gray-500">
                           <div className="flex items-center gap-1.5 hover:text-red-400 transition-colors">
                             <Heart className="w-4 h-4" />
                             <span className="text-xs font-bold">{post.likes}</span>
                           </div>
                           <div className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                             <MessageCircle className="w-4 h-4" />
                             <span className="text-xs font-bold">{post.comments}</span>
                           </div>
                           <div className="flex items-center gap-1.5 hover:text-green-400 transition-colors">
                             <Share2 className="w-4 h-4" />
                             <span className="text-xs font-bold">{post.shares}</span>
                           </div>
                         </div>
                         
                         <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-[var(--color-solana-green)] hover:text-black flex items-center justify-center transition-all">
                            <ArrowRight className="w-5 h-5" />
                         </button>
                       </div>
                     </div>
                   </motion.article>
                 ))
               ) : (
                 <div className="col-span-full py-20 text-center glass-card rounded-[3rem] border border-white/10 border-dashed">
                   <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 rounded-full mb-6 relative">
                     <Search className="w-10 h-10 text-gray-600" />
                     <div className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full animate-ping opacity-75"></div>
                   </div>
                   <h3 className="text-2xl font-bold mb-2">No results found</h3>
                   <p className="text-gray-400 max-w-md mx-auto">
                     We couldn't find anything matching "<span className="text-white">{debouncedQuery}</span>". Try searching for different keywords or categories.
                   </p>
                   <button 
                     onClick={() => setSearchQuery('')}
                     className="mt-6 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-white transition-colors"
                   >
                     Clear Search
                   </button>
                 </div>
               )}
             </AnimatePresence>
           </motion.div>
        </div>

        {/* Load More */}
        {!debouncedQuery && filteredPosts.length > 0 && (
          <div className="flex justify-center mt-16">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 hover:text-[var(--color-solana-green)] hover:border-[var(--color-solana-green)]/30 border border-white/10 rounded-full font-bold transition-all flex items-center gap-2 group"
            >
              Load More Content
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

