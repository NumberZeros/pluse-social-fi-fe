import { motion } from 'framer-motion';
import { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { IconArt, IconBolt, IconCoin, IconGaming, IconSparkle, IconTrend } from '../components/icons/PulseIcons';

const EXPLORE_CATEGORIES = [
  { id: 'trending', label: 'Trending', icon: <IconTrend className="w-4 h-4" /> },
  { id: 'new', label: 'New', icon: <IconSparkle className="w-4 h-4" /> },
  { id: 'art', label: 'Art', icon: <IconArt className="w-4 h-4" /> },
  { id: 'gaming', label: 'Gaming', icon: <IconGaming className="w-4 h-4" /> },
  { id: 'defi', label: 'DeFi', icon: <IconCoin className="w-4 h-4" /> },
  { id: 'tech', label: 'Tech', icon: <IconBolt className="w-4 h-4" /> },
];

const TRENDING_POSTS = [
  {
    id: '1',
    title: 'The Future of ZK Compression on Solana',
    excerpt: 'Exploring how ZK Compression will enable billions of users on Solana...',
    author: 'vitalik',
    likes: 2340,
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop',
  },
  {
    id: '2',
    title: 'Building Decentralized Social Networks',
    excerpt: 'Why Web3 social is the next frontier for blockchain technology...',
    author: 'anatoly',
    likes: 1890,
    image: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&h=400&fit=crop',
  },
  {
    id: '3',
    title: 'Phantom Wallet: The Complete Guide',
    excerpt: 'Everything you need to know about the best Solana wallet...',
    author: 'phantom',
    likes: 1567,
    image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&h=400&fit=crop',
  },
];

export function Explore() {
  const [activeCategory, setActiveCategory] = useState('trending');

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      
      <div className="max-w-[1400px] mx-auto px-4 pt-24 pb-12">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">
            Explore <span className="text-[#D4AF37]">Pulse</span>
          </h1>
          <p className="text-xl text-gray-400">
            Discover the best content on the Solana social layer
          </p>
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
                  ? 'bg-[#D4AF37] text-black'
                  : 'bg-white/5 hover:bg-white/10 text-white'
              }`}
            >
              <span className={activeCategory === category.id ? 'text-black' : 'text-white/80'}>{category.icon}</span>
              <span>{category.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Trending Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TRENDING_POSTS.map((post, index) => (
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
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#D4AF37] transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-400 mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                
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
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">{post.likes}</span>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Load More */}
        <div className="flex justify-center mt-12">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-full font-bold transition-colors"
          >
            Load More
          </motion.button>
        </div>
      </div>
    </div>
  );
}
