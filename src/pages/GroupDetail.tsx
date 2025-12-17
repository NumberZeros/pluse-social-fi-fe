import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { CreatePost } from '../components/feed/CreatePost';
import { MemberManagement } from '../components/groups/MemberManagement';
import useGroupStore from '../stores/useGroupStore';
import { useUserStore } from '../stores/useUserStore';
import {
  Lock,
  Globe,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  UserPlus,
  Shield,
  Info
} from 'lucide-react';

export function GroupDetail() {
  const { groupId } = useParams();
  const [activeTab, setActiveTab] = useState<'posts' | 'members' | 'settings'>('posts');

  const groups = useGroupStore((state) => state.groups);
  const members = useGroupStore((state) => state.members);
  const leaveGroup = useGroupStore((state) => state.leaveGroup);
  const currentUserWallet = useUserStore((state) => state.profile?.walletAddress);

  const group = useMemo(() => {
    return groups.find((g) => g.id === groupId);
  }, [groups, groupId]);

  const groupMembers = useMemo(() => {
    if (!groupId) return [];
    const memberList = members.get(groupId) || [];
    return memberList;
  }, [members, groupId]);

  const currentMember = useMemo(() => {
    return groupMembers.find((m) => m.walletAddress === currentUserWallet);
  }, [groupMembers, currentUserWallet]);

  const isOwner = currentMember?.role === 'owner';
  const isAdmin = currentMember?.role === 'admin' || isOwner;
  const isModerator = currentMember?.role === 'moderator' || isAdmin;
  const isMember = !!currentMember;

  // Posts will come from blockchain storage (Shadow Drive/Arweave/IPFS)
  const posts: any[] = [];

  if (!groupId || !group) {
    return <Navigate to="/groups" replace />;
  }

  const handleLeaveGroup = () => {
    if (!currentUserWallet) return;
    if (confirm('Are you sure you want to leave this group?')) {
      leaveGroup(groupId, currentUserWallet);
      window.location.href = '/groups';
    }
  };

  const getPrivacyIcon = () => {
    switch (group.privacy) {
      case 'public':
        return <Globe className="w-4 h-4 text-green-400" />;
      case 'private':
        return <Lock className="w-4 h-4 text-yellow-400" />;
      case 'secret':
        return <Shield className="w-4 h-4 text-red-400" />;
    }
  };

  const getEntryRequirementText = () => {
    switch (group.entryRequirement) {
      case 'free':
        return 'Free to join';
      case 'pay_sol':
        return `${group.entryPrice || 0} SOL to join`;
      case 'hold_token':
        return `Hold tokens required`;
      case 'hold_nft':
        return `Hold NFT required`;
      default:
        return 'Free to join';
    }
  };

  return (
    <AppLayout>
      <div className="max-w-[1000px] mx-auto pb-12">
        {/* Group Banner */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-72 rounded-b-3xl overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
          {group.banner ? (
            <img
              src={group.banner}
              alt="Group Banner"
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[var(--color-solana-green)]/20 to-[var(--color-solana-purple)]/20" />
          )}
        </motion.div>

        {/* Group Info */}
        <div className="px-6 pb-6 relative z-20">
          <div className="flex flex-col md:flex-row justify-between items-end md:items-start -mt-20 mb-8 gap-6">
            <div className="flex items-end gap-6 w-full md:w-auto">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative group flex-shrink-0"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-solana-green)] to-blue-500 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-black bg-gradient-to-br from-[var(--color-solana-green)] to-[#14C58E] flex items-center justify-center text-5xl font-bold text-black relative z-10 shadow-lg">
                  {group.name.charAt(0).toUpperCase()}
                </div>
              </motion.div>

              <div className="mb-2 md:hidden">
                 <h1 className="text-3xl font-bold text-white">{group.name}</h1>
              </div>
            </div>

            <div className="flex-1 w-full md:w-auto md:mt-24 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <div className="hidden md:block">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold text-white">{group.name}</h1>
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-bold uppercase tracking-wider">
                      {getPrivacyIcon()}
                      {group.privacy}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                     <span className="flex items-center gap-1.5">
                       <Users className="w-4 h-4" />
                       <span className="text-white font-bold">{group.memberCount}</span> members
                     </span>
                     <span>·</span>
                     <span className="flex items-center gap-1.5">
                       <MessageSquare className="w-4 h-4" />
                       <span className="text-white font-bold">{group.postCount}</span> posts
                     </span>
                  </div>
               </div>

               {/* Action Buttons */}
               <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {isAdmin && (
                  <Link
                    to={`/groups/${groupId}/settings`}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors font-medium"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                )}

                {isMember && !isOwner && (
                  <button
                    onClick={handleLeaveGroup}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Leave</span>
                  </button>
                )}

                {isModerator && (
                  <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[var(--color-premium-purple)] to-[var(--color-premium-pink)] hover:opacity-90 text-white font-bold transition-all shadow-lg shadow-[var(--color-premium-purple)]/30">
                    <UserPlus className="w-4 h-4" />
                    <span>Invite</span>
                  </button>
                )}
               </div>
            </div>
          </div>
          
          <div className="md:hidden mb-6 space-y-4">
             <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-bold uppercase tracking-wider">
                  {getPrivacyIcon()}
                  {group.privacy}
                </span>
                <span className="text-xs text-gray-400 px-2 py-1 bg-white/5 rounded-full">{getEntryRequirementText()}</span>
             </div>
             <p className="text-gray-300 leading-relaxed">{group.description}</p>
             <div className="flex items-center gap-4 text-sm text-gray-400 border-t border-white/5 pt-4">
               <span className="flex items-center gap-1.5">
                 <Users className="w-4 h-4" />
                 <span className="text-white font-bold">{group.memberCount}</span> members
               </span>
               <span className="flex items-center gap-1.5">
                 <MessageSquare className="w-4 h-4" />
                 <span className="text-white font-bold">{group.postCount}</span> posts
               </span>
            </div>
          </div>

          <div className="hidden md:block glass-card p-6 rounded-2xl border border-white/10 mb-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-solana-green)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
             <div className="relative z-10 flex gap-4">
                <Info className="w-5 h-5 text-[var(--color-solana-green)] flex-shrink-0 mt-1" />
                <div>
                   <h3 className="text-lg font-bold text-white mb-2">About this group</h3>
                   <p className="text-gray-300 leading-relaxed">{group.description}</p>
                   <div className="mt-4 flex gap-4">
                      <span className="text-sm text-gray-400 bg-white/5 px-3 py-1 rounded-lg">
                         Entry: <span className="text-white font-medium">{getEntryRequirementText()}</span>
                      </span>
                   </div>
                </div>
             </div>
          </div>

          {/* Tabs */}
          <div className="sticky top-20 z-30 bg-[#000000]/80 backdrop-blur-xl border-b border-white/10 mb-6">
            <div className="flex gap-8 px-2 max-w-[1000px] mx-auto">
              {(
                ['posts', 'members', isAdmin && 'settings'].filter(Boolean) as string[]
              ).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`relative py-4 px-2 font-bold transition-colors flex items-center gap-2 ${
                      isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {tab === 'posts' && <MessageSquare className="w-4 h-4" />}
                    {tab === 'members' && <Users className="w-4 h-4" />}
                    {tab === 'settings' && <Settings className="w-4 h-4" />}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {isActive && (
                      <motion.div
                        layoutId="groupTab"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--color-solana-green)] rounded-t-full"
                        transition={{ type: 'spring', duration: 0.5 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'posts' && (
              <motion.div
                key="posts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {isMember && (
                  <div className="mb-6">
                    <CreatePost
                      placeholder={`Share something with ${group.name}...`}
                      groupId={groupId}
                    />
                  </div>
                )}

                {!isMember && (
                  <div className="glass-card rounded-2xl p-12 text-center border border-white/10 bg-gradient-to-b from-white/5 to-transparent">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                       <Lock className="w-10 h-10 text-gray-500" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Members Only Content</h3>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto">
                      Join this group to participate in discussions, view exclusive content, and connect with other members.
                    </p>
                    <button className="px-8 py-3 bg-gradient-to-r from-[var(--color-solana-green)] to-[#14C58E] hover:opacity-90 text-black rounded-full font-bold transition-all shadow-[0_0_20px_rgba(20,241,149,0.3)] hover:shadow-[0_0_30px_rgba(20,241,149,0.5)] transform hover:scale-105">
                      Join Group
                    </button>
                  </div>
                )}

                {isMember && posts.length > 0 &&
                  posts.map((post: any) => (
                    <div
                      key={post.id}
                      className="glass-card rounded-2xl p-6 border border-white/10"
                    >
                      <div className="text-white">{post.content}</div>
                    </div>
                  ))}
                  
                {isMember && posts.length === 0 && (
                   <div className="text-center py-20 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>No posts yet. Be the first to share something!</p>
                   </div>
                )}
              </motion.div>
            )}

            {activeTab === 'members' && (
              <motion.div
                key="members"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <MemberManagement
                  groupId={groupId}
                  currentUserRole={currentMember?.role || 'member'}
                />
              </motion.div>
            )}

            {activeTab === 'settings' && isAdmin && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="glass-card rounded-2xl p-8 border border-white/10">
                  <div className="flex items-center gap-4 mb-6">
                     <div className="p-3 rounded-xl bg-white/5">
                        <Settings className="w-6 h-6 text-[var(--color-solana-green)]" />
                     </div>
                     <div>
                        <h3 className="text-xl font-bold">Group Settings</h3>
                        <p className="text-gray-400 text-sm">Manage your community preferences</p>
                     </div>
                  </div>
                  <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-sm">
                     Settings management features are currently under development.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  );
}
