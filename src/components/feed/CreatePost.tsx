import { motion } from 'framer-motion';
import { useState } from 'react';
import { useWallet } from '../../lib/wallet-adapter';
import { useUserStore } from '../../stores/useUserStore';
import { useAirdropStore } from '../../stores/useAirdropStore';
import useSubscriptionStore from '../../stores/useSubscriptionStore';
import { usePost } from '../../hooks/usePost';
import { toast } from 'react-hot-toast';
import { Crown, Image as ImageIcon, Video, X } from 'lucide-react';
import { uploadFileToIPFS, uploadMetadataToIPFS, validateFile } from '../../services/ipfs';

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
  const [videos, setVideos] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubscriberOnly, setIsSubscriberOnly] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const { createPost } = usePost();
  const incrementPostsCount = useUserStore((state) => state.incrementPostsCount);
  const updateAirdropProgress = useAirdropStore((state) => state.updateProgress);
  const markDayActive = useUserStore((state) => state.markDayActive);
  const postsCount = useUserStore((state) => state.profile.postsCount);
  const profile = useUserStore((state) => state.profile);
  const addReferralToUser = useUserStore((state) => state.addReferral);
  const { getTiersByCreator } = useSubscriptionStore();

  const myTiers = publicKey ? getTiersByCreator(publicKey.toBase58()) : [];
  const selectedTierData = myTiers.find((t) => t.id === selectedTier);

  const handlePost = async () => {
    if (!content.trim()) {
      toast.error('Please enter some content');
      return;
    }

    setIsUploading(true);
    const uploadToast = toast.loading('Creating post...');

    try {
      // Step 1: Upload images/videos to IPFS (if any)
      let uploadedImages: string[] = [];
      let uploadedVideos: string[] = [];

      if (images.length > 0) {
        toast.loading('Uploading images...', { id: uploadToast });
        uploadedImages = images; // Already base64 or mock URLs from handleImageUpload
      }

      if (videos.length > 0) {
        toast.loading('Uploading videos...', { id: uploadToast });
        uploadedVideos = videos; // Already uploaded in handleVideoUpload
      }

      // Step 2: Create metadata object
      const metadata = {
        content: content.trim(),
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
        videos: uploadedVideos.length > 0 ? uploadedVideos : undefined,
      };

      // Step 3: Upload metadata to IPFS
      toast.loading('Uploading metadata...', { id: uploadToast });
      const metadataUri = await uploadMetadataToIPFS(metadata);

      // Step 4: Create post on-chain with metadata URI
      toast.loading('Creating post on blockchain...', { id: uploadToast });
      const postResult = await createPost(metadataUri);
      
      if (!postResult) {
        throw new Error('Failed to create post on-chain');
      }

      console.log('✅ Post created on-chain:', postResult);
      toast.success('Post created successfully! 🎉', { id: uploadToast });

      // Call the callback for UI updates
      onPost?.(content, uploadedImages, isSubscriberOnly, selectedTierData?.name, groupId);

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

      // Reset form
      setContent('');
      setImages([]);
      setVideos([]);
      setIsExpanded(false);
      setIsSubscriberOnly(false);
      setSelectedTier('');
    } catch (error) {
      console.error('❌ Error creating post:', error);
      toast.error(`Failed to create post: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
        id: uploadToast 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Limit to 4 images total
    const maxImages = 4 - images.length;
    const filesToProcess = Array.from(files).slice(0, maxImages);

    setIsUploading(true);
    const uploadToast = toast.loading(`Uploading ${filesToProcess.length} image(s)...`);

    try {
      for (const file of filesToProcess) {
        // Validate file
        const validation = validateFile(file, 'image');
        if (!validation.valid) {
          toast.error(validation.error || 'Invalid image file');
          continue;
        }

        // Upload to IPFS
        const imageUrl = await uploadFileToIPFS(file);
        setImages((prev) => [...prev, imageUrl]);
      }
      
      toast.success(`${filesToProcess.length} image(s) uploaded!`, { id: uploadToast });
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload images', { id: uploadToast });
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Limit to 1 video
    if (videos.length >= 1) {
      toast.error('Maximum 1 video per post');
      return;
    }

    const file = files[0];
    
    setIsUploading(true);
    const uploadToast = toast.loading('Uploading video...');

    try {
      // Validate file
      const validation = validateFile(file, 'video');
      if (!validation.valid) {
        toast.error(validation.error || 'Invalid video file');
        return;
      }

      // Upload to IPFS
      const videoUrl = await uploadFileToIPFS(file);
      setVideos([videoUrl]);
      
      toast.success('Video uploaded!', { id: uploadToast });
    } catch (error) {
      console.error('Video upload error:', error);
      toast.error('Failed to upload video', { id: uploadToast });
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
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

          {/* Media Preview */}
          {(images.length > 0 || videos.length > 0) && (
            <div className="space-y-2">
              {/* Images */}
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
                        src={image.startsWith('mock://') ? image : image}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Videos */}
              {videos.length > 0 && (
                <div className="space-y-2">
                  {videos.map((video, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group rounded-xl overflow-hidden"
                    >
                      <video
                        src={video.startsWith('mock://') ? video : video}
                        controls
                        className="w-full max-h-96 object-contain bg-black"
                      />
                      <button
                        onClick={() => removeVideo(index)}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        aria-label={`Remove video ${index + 1}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center justify-between pt-4 border-t border-white/10"
            >
              <div className="flex items-center gap-2 flex-wrap">
                {/* Image Upload */}
                <label
                  className={`p-2 hover:bg-white/5 rounded-full transition-colors cursor-pointer ${images.length >= 4 || isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="Add images"
                  title="Upload images (max 4)"
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    multiple
                    onChange={handleImageUpload}
                    disabled={images.length >= 4 || isUploading}
                    className="hidden"
                  />
                  <ImageIcon className="w-5 h-5 text-[#ABFE2C]" />
                </label>

                {/* Video Upload */}
                <label
                  className={`p-2 hover:bg-white/5 rounded-full transition-colors cursor-pointer ${videos.length >= 1 || isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="Add video"
                  title="Upload video (max 1)"
                >
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={handleVideoUpload}
                    disabled={videos.length >= 1 || isUploading}
                    className="hidden"
                  />
                  <Video className="w-5 h-5 text-[#ABFE2C]" />
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
