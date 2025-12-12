import { motion } from 'framer-motion';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { PostCard } from '../components/feed/PostCard.tsx';
import { IconVerified } from '../components/icons/PulseIcons';

export function Profile() {
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'media'>('posts');

  // Mock user data
  const user = {
    username: username || 'vitalik',
    address: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    banner: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&h=400&fit=crop',
    bio: 'Building the future of decentralized social media. Ethereum & Solana enthusiast.',
    verified: true,
    followers: 1234,
    following: 567,
    posts: 89,
    joined: 'December 2024',
  };

  const timestamp = new Date();
  timestamp.setHours(timestamp.getHours() - 1);

  const mockPosts = [
    {
      id: '1',
      author: user,
      content: 'GM to all builders on Solana! Today we ship 🚀',
      timestamp: timestamp,
      likes: 234,
      reposts: 45,
      tips: 12.5,
      images: [],
      isLiked: false,
      isReposted: false,
    },
  ];

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      
      <div className="max-w-[1000px] mx-auto pt-16">
        {/* Banner */}
        <div className="relative h-64 bg-gradient-to-br from-[#D4AF37]/18 to-[#8B5CF6]/14 overflow-hidden">
          {user.banner && (
            <img 
              src={user.banner} 
              alt="Banner" 
              className="w-full h-full object-cover opacity-40"
            />
          )}
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex justify-between items-start -mt-20 mb-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <img 
                src={user.avatar} 
                alt={user.username}
                className="w-32 h-32 rounded-full border-4 border-black bg-gray-900"
              />
              {user.verified && (
                <div className="absolute bottom-2 right-2 w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center border-2 border-black">
                  <IconVerified className="w-5 h-5 text-black" />
                </div>
              )}
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 px-6 py-2 bg-white text-black rounded-full font-bold hover:bg-[#D4AF37] transition-colors"
            >
              Follow
            </motion.button>
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">@{user.username}</h1>
              <p className="text-gray-400 font-mono text-sm">
                {user.address.slice(0, 4)}...{user.address.slice(-4)}
              </p>
            </div>

            <p className="text-lg text-gray-300">{user.bio}</p>

            <div className="flex gap-6 text-sm">
              <div>
                <span className="font-bold text-white">{user.following}</span>
                <span className="text-gray-400 ml-1">Following</span>
              </div>
              <div>
                <span className="font-bold text-white">{user.followers}</span>
                <span className="text-gray-400 ml-1">Followers</span>
              </div>
              <div className="text-gray-400">
                Joined {user.joined}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/10">
          <div className="flex px-6">
            {(['posts', 'replies', 'media'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-bold capitalize transition-colors relative ${
                  activeTab === tab 
                    ? 'text-white' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-[#D4AF37]"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Posts */}
        <div className="divide-y divide-white/10">
          {mockPosts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post}
              onLike={() => {}}
              onRepost={() => {}}
              onTip={() => {}}
            />
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
