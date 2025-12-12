import { motion } from 'framer-motion';
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Navbar } from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import useGroupStore, { type Group } from '../stores/useGroupStore';
import { useUserStore } from '../stores/useUserStore';
import CreateGroupModal from '../components/groups/CreateGroupModal';
import { Plus, Search, Filter, Lock, Globe, Users as UsersIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

// Inline GroupCard component
const GroupCard = ({ group, isJoined, onJoin }: { group: Group; isJoined?: boolean; onJoin?: (id: string) => void }) => (
  <Link
    to={`/groups/${group.id}`}
    className="glass-card rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
  >
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-lg font-bold flex items-center gap-2">
        {group.privacy === 'public' ? (
          <Globe className="w-4 h-4 text-green-500" />
        ) : (
          <Lock className="w-4 h-4 text-yellow-500" />
        )}
        {group.name}
      </h3>
      <span className="px-2 py-1 bg-white/10 rounded-full text-xs">{group.category}</span>
    </div>
    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{group.description}</p>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 text-sm text-gray-400">
        <span className="flex items-center gap-1">
          <UsersIcon className="w-4 h-4" />
          {group.memberCount}
        </span>
        <span>{group.postCount} posts</span>
      </div>
      {!isJoined && onJoin && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onJoin(group.id);
          }}
          className="px-3 py-1 bg-gradient-to-r from-[#50C878] to-[#3BA565] rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
        >
          Join
        </button>
      )}
    </div>
  </Link>
);

const CATEGORIES = [
  'All',
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

export default function GroupsDiscovery() {
  const { publicKey } = useWallet();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterPrivacy, setFilterPrivacy] = useState<'all' | 'public' | 'private'>('all');

  const groups = useGroupStore((state) => state.groups);
  const myGroups = useGroupStore((state) => state.myGroups);
  const joinGroup = useGroupStore((state) => state.joinGroup);
  const profile = useUserStore((state) => state.profile);

  // Filter groups
  const filteredGroups = groups.filter((group) => {
    // Search filter
    if (
      searchQuery &&
      !group.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !group.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Category filter
    if (selectedCategory !== 'All' && group.category !== selectedCategory) {
      return false;
    }

    // Privacy filter
    if (filterPrivacy !== 'all') {
      if (filterPrivacy === 'public' && group.privacy !== 'public') {
        return false;
      }
      if (filterPrivacy === 'private' && group.privacy === 'public') {
        return false;
      }
    }

    // Hide secret groups unless already a member
    if (group.privacy === 'secret' && !myGroups.has(group.id)) {
      return false;
    }

    return true;
  });

  const handleJoinGroup = (groupId: string) => {
    if (!publicKey) {
      toast.error('Please connect your wallet to join groups');
      return;
    }

    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    // Handle different entry requirements
    if (group.entryRequirement === 'pay_sol') {
      // In a real app, this would trigger a Solana payment
      toast.loading('Processing payment...', { duration: 1500 });
      setTimeout(() => {
        joinGroup(groupId, publicKey.toBase58(), profile.username);
        toast.success(`Joined ${group.name}! Paid ${group.entryPrice} SOL`);
      }, 1500);
    } else if (group.entryRequirement === 'hold_token') {
      // In a real app, verify token ownership on-chain
      toast.loading('Verifying token ownership...', { duration: 1000 });
      setTimeout(() => {
        // Mock verification - assume user has token
        joinGroup(groupId, publicKey.toBase58(), profile.username);
        toast.success(`Joined ${group.name}!`);
      }, 1000);
    } else if (group.entryRequirement === 'hold_nft') {
      // In a real app, verify NFT ownership on-chain
      toast.loading('Verifying NFT ownership...', { duration: 1000 });
      setTimeout(() => {
        // Mock verification - assume user has NFT
        joinGroup(groupId, publicKey.toBase58(), profile.username);
        toast.success(`Joined ${group.name}!`);
      }, 1000);
    } else {
      // Free to join
      joinGroup(groupId, publicKey.toBase58(), profile.username);
      toast.success(`Joined ${group.name}!`);
    }
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Discover Groups</h1>
              <p className="text-gray-400">Join communities that match your interests</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#50C878] to-[#3BA565] rounded-xl font-bold"
            >
              <Plus className="w-5 h-5" />
              Create Group
            </motion.button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search groups..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-[#50C878] transition-colors"
              />
            </div>

            {/* Privacy Filter */}
            <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1 border border-white/10">
              <button
                onClick={() => setFilterPrivacy('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterPrivacy === 'all'
                    ? 'bg-[#50C878] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterPrivacy('public')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterPrivacy === 'public'
                    ? 'bg-[#50C878] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Public
              </button>
              <button
                onClick={() => setFilterPrivacy('private')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterPrivacy === 'private'
                    ? 'bg-[#50C878] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Private
              </button>
            </div>
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-400">Categories</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-[#50C878] to-[#3BA565] text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* My Groups */}
        {myGroups.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-4">My Groups ({myGroups.size})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {groups
                .filter((group) => myGroups.has(group.id))
                .map((group) => (
                  <GroupCard key={group.id} group={group} isJoined={true} />
                ))}
            </div>
          </motion.div>
        )}

        {/* All Groups */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-4">
            {searchQuery || selectedCategory !== 'All' || filterPrivacy !== 'all'
              ? `Results (${filteredGroups.length})`
              : 'All Groups'}
          </h2>

          {filteredGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onJoin={handleJoinGroup}
                  isJoined={myGroups.has(group.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-gray-500 mb-4">
                {groups.length === 0 ? (
                  <>
                    <h3 className="text-2xl font-bold mb-2">No groups yet</h3>
                    <p>Be the first to create a community!</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold mb-2">No groups found</h3>
                    <p>Try adjusting your search or filters</p>
                  </>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <Footer />

      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
