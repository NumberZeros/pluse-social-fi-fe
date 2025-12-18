import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useMintPost } from '../../hooks/useMintPost';
import { toast } from 'react-hot-toast';

interface MintPostModalProps {
  isOpen: boolean;
  post?: { id: string; content: string; images?: string[] } | null;
  onClose: () => void;
  onSuccess?: (mintAddress: string) => void;
}

export function MintPostModal({
  isOpen,
  post,
  onClose,
  onSuccess,
}: MintPostModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(post?.content || '');
  const { mintPost, loading } = useMintPost();

  const handleMint = async () => {
    if (!title.trim()) {
      toast.error('Please enter an NFT title');
      return;
    }

    if (!post?.id) {
      toast.error('Post data missing');
      return;
    }

    // Pass full post data including images
    const result = await mintPost(post.id, title, {
      description,
      images: post.images || [],
    });
    if (result?.mint) {
      setTitle('');
      setDescription(post?.content || '');
      onClose();
      onSuccess?.(result.mint.toBase58());
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-w-md w-full mx-4"
          >
            <div className="glass-card rounded-2xl p-6 border border-white/10">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Mint as NFT</h2>
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Preview */}
              <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-sm text-gray-400 mb-2">Post Content</p>
                <p className="text-white line-clamp-3 text-sm">{post?.content}</p>
                
                {/* Preview Images */}
                {post?.images && post.images.length > 0 && (
                  <div className="mt-3 grid gap-2 grid-cols-2">
                    {post.images.slice(0, 2).map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="Post preview"
                        className="w-full h-24 object-cover rounded-lg border border-white/10"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* NFT Title Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  NFT Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., My First Web3 Post"
                  maxLength={32}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ABFE2C] disabled:opacity-50"
                />
                <p className={`text-xs mt-1 ${title.length > 32 ? 'text-red-400' : 'text-gray-500'}`}>
                  {title.length}/32 characters (Metaplex limit)
                </p>
              </div>

              {/* Description (optional) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add additional details for your NFT..."
                  maxLength={500}
                  disabled={loading}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ABFE2C] disabled:opacity-50 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {description.length}/500
                </p>
              </div>

              {/* Info Box */}
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-300">
                  ℹ️ Your post will be minted as an NFT on Solana and can be traded on Magic Eden and OpenSea.
                </p>
              </div>

              {/* Gas Fee Info */}
              <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-300">
                  ⚠️ This will cost transaction fees (SOL). Make sure your wallet has sufficient balance.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMint}
                  disabled={loading || !title.trim()}
                  className="flex-1 px-4 py-2 bg-[#ABFE2C] hover:bg-[#9FE51C] text-black rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Minting...' : 'Mint NFT'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
