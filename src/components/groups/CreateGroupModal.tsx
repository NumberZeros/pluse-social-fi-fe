import { motion } from 'framer-motion';
import { useState } from 'react';
import { X, Lock, Users, Globe, Coins, Image as ImageIcon } from 'lucide-react';
import useGroupStore, {
  type GroupPrivacy,
  type EntryRequirement,
} from '../../stores/useGroupStore';
import { useWallet } from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  'DeFi',
  'NFTs',
  'Gaming',
  'Art',
  'Music',
  'Sports',
  'Technology',
  'Education',
  'Trading',
  'Community',
  'Memes',
  'Other',
];

export default function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  const { publicKey } = useWallet();
  const createGroup = useGroupStore((state) => state.createGroup);

  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [banner, setBanner] = useState<string | null>(null);
  const [category, setCategory] = useState('Community');
  const [privacy, setPrivacy] = useState<GroupPrivacy>('public');
  const [entryRequirement, setEntryRequirement] = useState<EntryRequirement>('free');
  const [entryPrice, setEntryPrice] = useState('');
  const [tokenMint, setTokenMint] = useState('');
  const [nftCollection, setNftCollection] = useState('');

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setBanner(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = () => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!groupName.trim() || groupName.length < 3) {
      toast.error('Group name must be at least 3 characters');
      return;
    }

    if (!description.trim() || description.length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }

    // Validate entry requirements
    if (entryRequirement === 'pay_sol' && (!entryPrice || parseFloat(entryPrice) <= 0)) {
      toast.error('Please enter a valid entry price');
      return;
    }

    if (entryRequirement === 'hold_token' && !tokenMint.trim()) {
      toast.error('Please enter a token mint address');
      return;
    }

    if (entryRequirement === 'hold_nft' && !nftCollection.trim()) {
      toast.error('Please enter an NFT collection address');
      return;
    }

    createGroup({
      name: groupName,
      description,
      banner,
      creator: publicKey.toBase58(),
      privacy,
      entryRequirement,
      entryPrice: entryRequirement === 'pay_sol' ? parseFloat(entryPrice) : undefined,
      tokenMint: entryRequirement === 'hold_token' ? tokenMint : undefined,
      nftCollection: entryRequirement === 'hold_nft' ? nftCollection : undefined,
      category,
    });

    toast.success('Group created successfully! 🎉');

    // Reset form
    setGroupName('');
    setDescription('');
    setBanner(null);
    setCategory('Community');
    setPrivacy('public');
    setEntryRequirement('free');
    setEntryPrice('');
    setTokenMint('');
    setNftCollection('');

    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-[#50C878]" />
            Create New Group
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Banner Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Group Banner</label>
            {banner ? (
              <div className="relative aspect-[3/1] rounded-lg overflow-hidden">
                <img src={banner} alt="Banner" className="w-full h-full object-cover" />
                <button
                  onClick={() => setBanner(null)}
                  className="absolute top-2 right-2 p-2 bg-black/60 rounded-lg hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-[3/1] border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-[#50C878] transition-colors">
                <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-400">Click to upload banner</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Group Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value.slice(0, 50))}
              placeholder="e.g., Solana DeFi Builders"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#50C878] transition-colors"
              maxLength={50}
            />
            <div className="text-xs text-gray-500 mt-1">{groupName.length}/50</div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 300))}
              placeholder="Describe your group's purpose and what members can expect..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#50C878] transition-colors resize-none"
              rows={4}
              maxLength={300}
            />
            <div className="text-xs text-gray-500 mt-1">{description.length}/300</div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#50C878] transition-colors"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Privacy Setting */}
          <div>
            <label className="block text-sm font-medium mb-2">Privacy</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setPrivacy('public')}
                className={`p-3 rounded-lg border transition-all ${
                  privacy === 'public'
                    ? 'border-[#50C878] bg-[#50C878]/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <Globe className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm font-medium">Public</div>
                <div className="text-xs text-gray-400">Anyone can find</div>
              </button>
              <button
                onClick={() => setPrivacy('private')}
                className={`p-3 rounded-lg border transition-all ${
                  privacy === 'private'
                    ? 'border-[#50C878] bg-[#50C878]/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <Users className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm font-medium">Private</div>
                <div className="text-xs text-gray-400">Invite only</div>
              </button>
              <button
                onClick={() => setPrivacy('secret')}
                className={`p-3 rounded-lg border transition-all ${
                  privacy === 'secret'
                    ? 'border-[#50C878] bg-[#50C878]/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <Lock className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm font-medium">Secret</div>
                <div className="text-xs text-gray-400">Hidden group</div>
              </button>
            </div>
          </div>

          {/* Entry Requirement */}
          <div>
            <label className="block text-sm font-medium mb-2">Entry Requirement</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-white/10 cursor-pointer hover:bg-white/5 transition-colors">
                <input
                  type="radio"
                  name="entry"
                  checked={entryRequirement === 'free'}
                  onChange={() => setEntryRequirement('free')}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <div className="font-medium">Free to Join</div>
                  <div className="text-xs text-gray-400">
                    Anyone can join without payment
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-white/10 cursor-pointer hover:bg-white/5 transition-colors">
                <input
                  type="radio"
                  name="entry"
                  checked={entryRequirement === 'pay_sol'}
                  onChange={() => setEntryRequirement('pay_sol')}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    Pay SOL
                  </div>
                  <div className="text-xs text-gray-400">Require payment to join</div>
                  {entryRequirement === 'pay_sol' && (
                    <input
                      type="number"
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(e.target.value)}
                      placeholder="0.1"
                      step="0.01"
                      min="0"
                      className="w-full mt-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-[#50C878]"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-white/10 cursor-pointer hover:bg-white/5 transition-colors">
                <input
                  type="radio"
                  name="entry"
                  checked={entryRequirement === 'hold_token'}
                  onChange={() => setEntryRequirement('hold_token')}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <div className="font-medium">Hold Token</div>
                  <div className="text-xs text-gray-400">
                    Require specific token ownership
                  </div>
                  {entryRequirement === 'hold_token' && (
                    <input
                      type="text"
                      value={tokenMint}
                      onChange={(e) => setTokenMint(e.target.value)}
                      placeholder="Token mint address"
                      className="w-full mt-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm font-mono focus:outline-none focus:border-[#50C878]"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-white/10 cursor-pointer hover:bg-white/5 transition-colors">
                <input
                  type="radio"
                  name="entry"
                  checked={entryRequirement === 'hold_nft'}
                  onChange={() => setEntryRequirement('hold_nft')}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <div className="font-medium">Hold NFT</div>
                  <div className="text-xs text-gray-400">Require NFT from collection</div>
                  {entryRequirement === 'hold_nft' && (
                    <input
                      type="text"
                      value={nftCollection}
                      onChange={(e) => setNftCollection(e.target.value)}
                      placeholder="NFT collection address"
                      className="w-full mt-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm font-mono focus:outline-none focus:border-[#50C878]"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 bg-[var(--color-solana-green)] hover:bg-[#9FE51C] text-black rounded-lg transition-all font-bold"
          >
            Create Group
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
