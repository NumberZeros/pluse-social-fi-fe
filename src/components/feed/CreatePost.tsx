import { motion } from 'framer-motion';
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useOpenWalletModal } from '../../hooks/useOpenWalletModal';
import { useUserStore } from '../../stores/useUserStore';
import { usePost } from '../../hooks/usePost';
import { toast } from 'react-hot-toast';
import { Lock, Image as ImageIcon, Video, X } from 'lucide-react';
import {
  uploadFileToIPFS,
  uploadPostMetadata,
  validateFile,
  type PostAccessLevel,
} from '../../services/ipfs';
import { Button, getButtonClassName, MotionCard } from '../../design-system';
import { trackEvent } from '../../lib/analytics';

interface CreatePostProps {
  onPost?: (content: string, images: string[], accessLevel?: PostAccessLevel) => void;
  placeholder?: string;
  groupId?: string;
}

export function CreatePost({ onPost, placeholder, groupId }: CreatePostProps) {
  const { publicKey } = useWallet();
  const openWalletModal = useOpenWalletModal();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [accessLevel, setAccessLevel] = useState<PostAccessLevel>('public');
  const [isUploading, setIsUploading] = useState(false);
  const { createPost } = usePost();
  const incrementPostsCount = useUserStore((state) => state.incrementPostsCount);
  const markDayActive = useUserStore((state) => state.markDayActive);

  const isSupportersOnly = accessLevel === 'supporters';

  const handlePost = async () => {
    if (!publicKey) {
      openWalletModal({ toast: true });
      return;
    }

    if (!content.trim()) {
      toast.error('Please enter some content');
      return;
    }

    setIsUploading(true);
    const uploadToast = toast.loading('Creating post...');

    try {
      const metadata = {
        content: content.trim(),
        images: images.length > 0 ? images : undefined,
        videos: videos.length > 0 ? videos : undefined,
        ...(groupId ? { groupId } : {}),
        accessLevel,
      };

      toast.loading('Uploading metadata...', { id: uploadToast });
      const metadataUri = await uploadPostMetadata(metadata);

      toast.loading('Creating post on blockchain...', { id: uploadToast });
      const postResult = await createPost(metadataUri);

      if (!postResult) {
        throw new Error('Failed to create post on-chain');
      }

      toast.success('Post created successfully!', { id: uploadToast });
      trackEvent('post_created', { access_level: accessLevel });
      onPost?.(content, images, accessLevel);

      incrementPostsCount();
      markDayActive();

      setContent('');
      setImages([]);
      setVideos([]);
      setIsExpanded(false);
      setAccessLevel('public');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(
        `Failed to create post: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { id: uploadToast },
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const maxImages = 4 - images.length;
    const filesToProcess = Array.from(files).slice(0, maxImages);

    setIsUploading(true);
    const uploadToast = toast.loading(`Uploading ${filesToProcess.length} image(s)...`);

    try {
      for (const file of filesToProcess) {
        const validation = validateFile(file, 'image');
        if (!validation.valid) {
          toast.error(validation.error || 'Invalid image file');
          continue;
        }
        const imageUrl = await uploadFileToIPFS(file);
        setImages((prev) => [...prev, imageUrl]);
      }
      toast.success(`${filesToProcess.length} image(s) uploaded!`, { id: uploadToast });
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload images', { id: uploadToast });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (videos.length >= 1) {
      toast.error('Maximum 1 video per post');
      return;
    }

    const file = files[0];
    setIsUploading(true);
    const uploadToast = toast.loading('Uploading video...');

    try {
      const validation = validateFile(file, 'video');
      if (!validation.valid) {
        toast.error(validation.error || 'Invalid video file');
        return;
      }
      const videoUrl = await uploadFileToIPFS(file);
      setVideos([videoUrl]);
      toast.success('Video uploaded!', { id: uploadToast });
    } catch (error) {
      console.error('Video upload error:', error);
      toast.error('Failed to upload video', { id: uploadToast });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
  };

  if (!publicKey) {
    return (
      <MotionCard
        variant="glass"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 border border-border text-center"
      >
        <p className="text-muted mb-4">Connect your wallet to create a post.</p>
        <Button type="button" size="sm" onClick={() => openWalletModal({ toast: true })}>
          Connect Wallet
        </Button>
      </MotionCard>
    );
  }

  return (
    <MotionCard
      variant="glass"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6 border border-border"
    >
      <div className="flex gap-4">
        <img
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${publicKey?.toBase58() || 'user'}`}
          alt="Your avatar"
          className="w-12 h-12 rounded-full bg-surface-2"
        />

        <div className="flex-1 space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder={placeholder || "What's happening on Solana?"}
            className="w-full bg-transparent text-foreground placeholder:text-muted text-lg resize-none outline-none min-h-[60px] focus:placeholder:text-muted transition-colors"
            rows={isExpanded ? 4 : 2}
            aria-label="Post content"
            aria-describedby="char-count"
          />

          {(images.length > 0 || videos.length > 0) && (
            <div className="space-y-2">
              {images.length > 0 && (
                <div className={`grid gap-2 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {images.map((image, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group rounded-xl overflow-hidden"
                    >
                      <img src={image} alt={`Upload ${index + 1}`} className="w-full h-48 object-cover" />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-8 h-8 bg-background/80 hover:bg-danger text-foreground rounded-pill flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              {videos.length > 0 && (
                <div className="space-y-2">
                  {videos.map((video, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group rounded-xl overflow-hidden"
                    >
                      <video src={video} controls className="w-full max-h-96 object-contain bg-background" />
                      <button
                        onClick={() => removeVideo(index)}
                        className="absolute top-2 right-2 w-8 h-8 bg-background/80 hover:bg-danger text-foreground rounded-pill flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
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
              className="flex items-center justify-between pt-4 border-t border-border"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <label
                  className={`p-2 hover:bg-surface-2 rounded-full transition-colors cursor-pointer ${images.length >= 4 || isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="Add images"
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    multiple
                    onChange={handleImageUpload}
                    disabled={images.length >= 4 || isUploading}
                    className="hidden"
                  />
                  <ImageIcon className="w-5 h-5 text-primary" />
                </label>

                <label
                  className={`p-2 hover:bg-surface-2 rounded-full transition-colors cursor-pointer ${videos.length >= 1 || isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="Add video"
                >
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={handleVideoUpload}
                    disabled={videos.length >= 1 || isUploading}
                    className="hidden"
                  />
                  <Video className="w-5 h-5 text-primary" />
                </label>

                <button
                  onClick={() =>
                    setAccessLevel(isSupportersOnly ? 'public' : 'supporters')
                  }
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    isSupportersOnly
                      ? 'bg-gradient-to-r from-primary to-primary text-background'
                      : 'bg-surface-2 text-muted hover:bg-surface-2'
                  }`}
                  aria-label={`Toggle supporter-only post (currently ${isSupportersOnly ? 'ON' : 'OFF'})`}
                >
                  <Lock className="w-4 h-4" />
                  {isSupportersOnly ? 'Supporters only' : 'Public'}
                </button>

                {images.length > 0 && (
                  <span className="px-3 py-2 text-sm text-muted" aria-live="polite">
                    {images.length}/4 images
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span
                  id="char-count"
                  className={`text-sm ${content.length > 280 ? 'text-danger' : 'text-muted'}`}
                  aria-live="polite"
                >
                  {content.length}/280
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePost}
                  disabled={!content.trim() || content.length > 280 || isUploading}
                  className={getButtonClassName('primary', 'sm')}
                  aria-label="Submit post"
                >
                  {isUploading ? 'Posting...' : 'Post'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </MotionCard>
  );
}
