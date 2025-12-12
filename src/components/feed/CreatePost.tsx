import { motion } from 'framer-motion';
import { useState } from 'react';

interface CreatePostProps {
  onPost?: (content: string, images: string[]) => void;
}

export function CreatePost({ onPost }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePost = () => {
    if (content.trim()) {
      onPost?.(content, images);
      setContent('');
      setImages([]);
      setIsExpanded(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 border border-white/10"
    >
      <div className="flex gap-4">
        <img 
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=user"
          alt="Your avatar"
          className="w-12 h-12 rounded-full bg-gray-800"
        />
        
        <div className="flex-1 space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="What's happening on Solana?"
            className="w-full bg-transparent text-white placeholder-gray-500 text-lg resize-none outline-none min-h-[60px]"
            rows={isExpanded ? 4 : 2}
          />

          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center justify-between pt-4 border-t border-white/10"
            >
              <div className="flex gap-2">
                <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <svg className="w-5 h-5 text-[#ABFE2C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <svg className="w-5 h-5 text-[#ABFE2C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-sm ${content.length > 280 ? 'text-red-400' : 'text-gray-500'}`}>
                  {content.length}/280
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePost}
                  disabled={!content.trim() || content.length > 280}
                  className="px-6 py-2 bg-[#ABFE2C] text-black rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#9FE51C] transition-colors"
                >
                  Post
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
