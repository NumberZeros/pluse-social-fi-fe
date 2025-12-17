import { motion } from 'framer-motion';
import { useState } from 'react';
import { useWallet } from '../lib/wallet-adapter';
import { AppLayout } from '../components/layout/AppLayout';
import useGroupStore, { type Group } from '../stores/useGroupStore';
import { useUserStore } from '../stores/useUserStore';
import { useGroup } from '../hooks/useGroup';
import CreateGroupModal from '../components/groups/CreateGroupModal';
import { Plus, Search, Lock, Globe, Users as UsersIcon, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { PublicKey } from '@solana/web3.js';

// Inline GroupCard component
const GroupCard = ({ group, isJoined, onJoin }: { group: Group; isJoined?: boolean; onJoin?: (id: string) => void }) => (
  <Link
    to={`/groups/${group.id}`}
    className="glass-card rounded-2xl p-6 border border-white/10 hover:border-[var(--color-solana-green)]/50 transition-all cursor-pointer group relative overflow-hidden flex flex-col h-full hover:bg-white/5"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-solana-green)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[var(--color-solana-green)]/10 transition-colors duration-500" />
    
    <div className="relative z-10 flex flex-col h-full">
       <div className="flex items-start justify-between mb-4">
         <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-solana-green)] to-[#14C58E] flex items-center justify-center text-xl font-bold text-black shadow-lg shadow-[var(--color-solana-green)]/20 group-hover:scale-110 transition-transform duration-300">
           {group.name.charAt(0).toUpperCase()}
         </div>
         <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-xs font-medium text-gray-400 group-hover:border-white/20 transition-colors">
            {group.category}
         </span>
       </div>

       <h3 className="text-xl font-bold mb-2 flex items-center gap-2 group-hover:text-[var(--color-solana-green)] transition-colors">
         {group.name}
         {group.privacy === 'public' ? (
           <Globe className="w-4 h-4 text-gray-500" />
         ) : (
           <Lock className="w-4 h-4 text-yellow-500" />
         )}
       </h3>

       <p className="text-gray-400 text-sm mb-6 line-clamp-2 flex-grow">{group.description}</p>

       <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
         <div className="flex items-center gap-4 text-sm text-gray-500">
           <span className="flex items-center gap-1.5">
             <UsersIcon className="w-4 h-4" />
             {group.memberCount}
           </span>
           <span>·</span>
           <span>{group.postCount} posts</span>
         </div>
         
         {!isJoined && onJoin ? (
           <button
             onClick={(e) => {
               e.preventDefault();
               onJoin(group.id);
             }}
             className="px-4 py-1.5 bg-white/10 hover:bg-[var(--color-solana-green)] hover:text-black rounded-lg transition-all text-sm font-bold text-white"
           >
             Join
           </button>
         ) : (
            <span className="text-[var(--color-solana-green)] text-sm font-bold flex items-center gap-1">
               Joined <ArrowRight className="w-4 h-4" />
            </span>
         )}
       </div>
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

  // Use blockchain hook for group operations
  const { joinGroup: joinGroupBlockchain } = useGroup();

  // Groups from blockchain - query all group PDAs
  const groups: any[] = []; // TODO: Fetch all group accounts from blockchain
  const myGroups = new Set<string>(); // TODO: Query user's group_member PDAs
  const joinGroup = useGroupStore((state) => state.joinGroup); // Fallback for UI
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

  const handleJoinGroup = async (groupId: string) => {
    if (!publicKey) {
      toast.error('Please connect your wallet to join groups');
      return;
    }

    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    try {
      // Convert group ID to PublicKey (in real app, this would be the actual group PDA)
      const groupPubkey = new PublicKey(groupId);
      await joinGroupBlockchain(groupPubkey);
      
      // Update local store for UI consistency
      joinGroup(groupId, publicKey.toBase58(), profile.username);
    } catch (error: any) {
      console.error('Join group failed:', error);
      // Fall back to local store if blockchain fails
      if (error.message?.includes('Invalid public key')) {
        // Handle different entry requirements
        if (group.entryRequirement === 'pay_sol') {
          // TODO: Implement Solana payment for entry
          toast.error('Payment-based entry not implemented yet');
          return;
        } else if (group.entryRequirement === 'hold_token') {
          // TODO: Implement on-chain token verification
          toast.error('Token verification not implemented yet');
          return;
        } else if (group.entryRequirement === 'hold_nft') {
          // TODO: Implement on-chain NFT verification
          toast.error('NFT verification not implemented yet');
          return;
        } else {
          // Free to join
          joinGroup(groupId, publicKey.toBase58(), profile.username);
          toast.success(`Joined ${group.name}!`);
        }
      }
    }
  };

  return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center relative z-10"
        >
          <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
             Discover <span className="text-gradient-lens">Communties</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
             Find your tribe, join exclusive groups, and connect with like-minded builders on Solana.
          </p>
          
          <motion.div 
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className="inline-block"
          >
             <button
               onClick={() => setShowCreateModal(true)}
               className="flex items-center gap-2 px-8 py-3 bg-[var(--color-solana-green)] hover:bg-[#9FE51C] rounded-full font-bold text-black transition-all shadow-[0_0_20px_rgba(20,241,149,0.3)] hover:shadow-[0_0_30px_rgba(20,241,149,0.5)]"
             >
               <Plus className="w-5 h-5" />
               Create Community
             </button>
          </motion.div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 border border-white/10 mb-10 max-w-4xl mx-auto"
        >
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search groups, topics, or keywords..."
                className="w-full bg-black/40 border border-white/5 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-[var(--color-solana-green)] transition-all text-white placeholder-gray-600"
              />
            </div>

            <div className="flex items-center gap-2 bg-black/40 rounded-xl p-1 border border-white/5">
              {(['all', 'public', 'private'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterPrivacy(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                    filterPrivacy === type
                      ? 'bg-[var(--color-solana-green)] text-black shadow-lg'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  selectedCategory === category
                    ? 'bg-white/10 text-white border-[var(--color-solana-green)]/50 shadow-[0_0_10px_rgba(20,241,149,0.2)]'
                    : 'bg-transparent text-gray-500 border-transparent hover:bg-white/5 hover:text-gray-300'
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
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-6 px-4">
               <div className="w-1 h-8 bg-[var(--color-solana-green)] rounded-full"></div>
               <h2 className="text-2xl font-bold">Your Communities</h2>
               <span className="text-gray-500 text-sm font-mono">({myGroups.size})</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
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
          className="px-4"
        >
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-purple-500 rounded-full"></div>
                <h2 className="text-2xl font-bold">
                  {searchQuery || selectedCategory !== 'All' || filterPrivacy !== 'all'
                    ? 'Search Results'
                    : 'Explore All'}
                </h2>
             </div>
             <span className="text-gray-500 text-sm font-mono flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {filteredGroups.length} Communities
             </span>
          </div>

          {filteredGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            <div className="glass-card rounded-3xl p-20 text-center border border-white/10 border-dashed">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6">
                 <Search className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-300 mb-2">No communities found</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                 We couldn't find any groups matching your filters. Try adjusting your search or be the first to start a new community!
              </p>
              <button 
                 onClick={() => setShowCreateModal(true)}
                 className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-full font-bold transition-all border border-white/10"
              >
                 Create New Group
              </button>
            </div>
          )}
        </motion.div>
      </div>

      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </AppLayout>
  );
}

