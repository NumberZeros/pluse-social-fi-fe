import { motion } from 'framer-motion';
import { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { CreatePost } from '../components/feed/CreatePost';
import { PostCard } from '../components/feed/PostCard';
import { TrendingSidebar } from '../components/feed/TrendingSidebar';

// Mock data for now - timestamps created outside component
const timestamp1 = new Date();
timestamp1.setHours(timestamp1.getHours() - 1);

const timestamp2 = new Date();
timestamp2.setHours(timestamp2.getHours() - 2);

const MOCK_POSTS = [
  {
    id: '1',
    author: {
      username: 'vitalik',
      address: '5eykt...j7Pn',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vitalik',
      verified: true,
    },
    content: 'Building the future of social media on Solana. ZK Compression is a game changer! 🚀',
    timestamp: timestamp1,
    likes: 234,
    reposts: 45,
    tips: 12.5,
    images: [],
    isLiked: false,
    isReposted: false,
  },
  {
    id: '2',
    author: {
      username: 'anatoly',
      address: '8eykt...k9Qm',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anatoly',
      verified: true,
    },
    content: 'Just minted my @username.pulse handle. The future is on-chain and compressed! 💜',
    timestamp: timestamp2,
    likes: 567,
    reposts: 123,
    tips: 45.2,
    images: [],
    isLiked: true,
    isReposted: false,
  },
];

export function Feed() {
  const [posts, setPosts] = useState(MOCK_POSTS);

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleRepost = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isReposted: !post.isReposted, reposts: post.isReposted ? post.reposts - 1 : post.reposts + 1 }
        : post
    ));
  };

  const handleTip = (postId: string, amount: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, tips: post.tips + amount }
        : post
    ));
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      
      <div className="max-w-[1400px] mx-auto px-4 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-7 xl:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <CreatePost />
              
              <div className="space-y-4">
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <PostCard 
                      post={post}
                      onLike={handleLike}
                      onRepost={handleRepost}
                      onTip={handleTip}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4">
            <TrendingSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
