import { motion } from 'framer-motion';
import { useState } from 'react';
import { useWallet } from '../../lib/wallet-adapter';
import { useUserStore } from '../../stores/useUserStore';
import { useAirdropStore } from '../../stores/useAirdropStore';
import useSubscriptionStore from '../../stores/useSubscriptionStore';
import { toast } from 'react-hot-toast';
import { Crown } from 'lucide-react';

interface CreatePostProps {
  onPost?: (
    content: string,
    images: string[],
    isSubscriberOnly?: boolean,
    tierName?: string,
    groupId?: string,
  ) => void;
  placeholder?: string;
  groupId?: string;
}

export function CreatePost({ onPost, placeholder, groupId }: CreatePostProps) {
  const { publicKey } = useWallet();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubscriberOnly, setIsSubscriberOnly] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('');
  const incrementPostsCount = useUserStore((state) => state.incrementPostsCount);
  const updateAirdropProgress = useAirdropStore((state) => state.updateProgress);
  const markDayActive = useUserStore((state) => state.markDayActive);
  const postsCount = useUserStore((state) => state.profile.postsCount);
  const profile = useUserStore((state) => state.profile);
  const addReferralToUser = useUserStore((state) => state.addReferral);
  const { getTiersByCreator } = useSubscriptionStore();

  const myTiers = publicKey ? getTiersByCreator(publicKey.toBase58()) : [];
  const selectedTierData = myTiers.find((t) => t.id === selectedTier);

  const handlePost = () => {
    if (content.trim()) {
      onPost?.(content, images, isSubscriberOnly, selectedTierData?.name, groupId);

      // Update stores
      incrementPostsCount();
      updateAirdropProgress('posts', postsCount + 1);
      markDayActive();

      // If this is user's first post and they were referred, credit the referrer
      if (postsCount === 0 && profile.referredBy && publicKey) {
        // Find the referrer by their referral code and credit them
        // In a real app, we'd query the backend for the referrer's wallet address
        // For now, we'll store it in localStorage with the referral code as key
        const referrerData = localStorage.getItem(`referrer_${profile.referredBy}`);
        if (referrerData) {
          try {
            const { walletAddress } = JSON.parse(referrerData);
            // Credit the referrer if it's not the same user
            if (walletAddress !== publicKey.toBase58()) {
              addReferralToUser(publicKey.toBase58());
              toast.success('Your referrer has been credited! 🎉');
            }
          } catch (e) {
            console.error('Error processing referral:', e);
          }
        }
      }

      setContent('');
      setImages([]);
      setIsExpanded(false);
      setIsSubscriberOnly(false);
      setSelectedTier('');
      toast.success(
        isSubscriberOnly ? 'Subscriber-only post created! 👑' : 'Post created!',
      );
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Limit to 4 images
    const maxImages = 4 - images.length;
    const filesToProcess = Array.from(files).slice(0, maxImages);

    filesToProcess.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset input
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
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
            placeholder={placeholder || "What's happening on Solana?"}
            className="w-full bg-transparent text-white placeholder-gray-500 text-lg resize-none outline-none min-h-[60px] focus:placeholder-gray-400 transition-colors"
            rows={isExpanded ? 4 : 2}
            aria-label="Post content"
            aria-describedby="char-count"
          />

          {/* Image Preview */}
          {images.length > 0 && (
            <div
              className={`grid gap-2 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}
            >
              {images.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group rounded-xl overflow-hidden"
                >
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <svg
                      className="w-5 h-5"
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
                </motion.div>
              ))}
            </div>
          )}

          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center justify-between pt-4 border-t border-white/10"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <label
                  className={`p-2 hover:bg-white/5 rounded-full transition-colors cursor-pointer ${images.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="Add images"
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={images.length >= 4}
                    className="hidden"
                  />
                  <svg
                    className="w-5 h-5 text-[#ABFE2C]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </label>
                <button
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                  aria-label="Add emoji (coming soon)"
                  disabled
                >
                  <svg
                    className="w-5 h-5 text-[#ABFE2C]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>

                {/* Subscriber Only Toggle */}
                {myTiers.length > 0 && (
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={() => setIsSubscriberOnly(!isSubscriberOnly)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                        isSubscriberOnly
                          ? 'bg-gradient-to-r from-[var(--color-solana-green)] to-[#ABFE2C] text-black'
                          : 'bg-white/10 text-gray-400 hover:bg-white/20'
                      }`}
                      aria-label={`Toggle subscriber-only post (currently ${isSubscriberOnly ? 'ON' : 'OFF'})`}
                    >
                      <Crown className="w-4 h-4" />
                      {isSubscriberOnly ? 'Subscribers Only' : 'Public'}
                    </button>

                    {isSubscriberOnly && myTiers.length > 1 && (
                      <select
                        value={selectedTier}
                        onChange={(e) => setSelectedTier(e.target.value)}
                        className="px-3 py-1.5 bg-gray-800 text-white text-sm rounded-full border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ABFE2C]"
                        aria-label="Select subscription tier"
                      >
                        <option value="">All subscribers</option>
                        {myTiers.map((tier) => (
                          <option key={tier.id} value={tier.id}>
                            {tier.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {images.length > 0 && (
                  <span className="px-3 py-2 text-sm text-gray-400" aria-live="polite">
                    {images.length}/4 images
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span
                  id="char-count"
                  className={`text-sm ${content.length > 280 ? 'text-red-400' : 'text-gray-500'}`}
                  aria-live="polite"
                >
                  {content.length}/280
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePost}
                  disabled={!content.trim() || content.length > 280}
                  className="px-6 py-2 bg-[#ABFE2C] text-black rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#9FE51C] transition-colors"
                  aria-label="Submit post"
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
