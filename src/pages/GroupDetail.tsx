import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PostCard from '../components/feed/PostCard';
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

  // Mock posts for the group
  const mockPosts = [
    {
      id: '1',
      author: {
        username: 'vitalik',
        address: '5eykt...j7Pn',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vitalik',
        verified: true,
      },
      content: "Welcome to the group! Let's build together 🚀",
      timestamp: new Date(),
      likes: 12,
      reposts: 3,
      tips: 5.5,
      comments: 8,
      images: [] as string[],
      isLiked: false,
      isReposted: false,
    },
  ];

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
        return <Globe className="w-4 h-4" />;
      case 'private':
        return <Lock className="w-4 h-4" />;
      case 'secret':
        return <Shield className="w-4 h-4" />;
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

  // Future feature: Display role badges
  // Keeping this commented out for when we add role badge UI
  /*
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] text-xs font-medium">
            <Crown className="w-3 h-3" />
            Owner
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium">
            <Shield className="w-3 h-3" />
            Admin
          </span>
        );
      case 'moderator':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
            <Shield className="w-3 h-3" />
            Mod
          </span>
        );
      default:
        return null;
    }
  };
  */

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />

      <div className="max-w-[1000px] mx-auto pt-16">
        {/* Group Banner */}
        <div className="relative h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 overflow-hidden">
          {group.banner && (
            <img
              src={group.banner}
              alt="Group Banner"
              className="w-full h-full object-cover opacity-60"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        {/* Group Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 -mt-8 mb-6">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative flex-shrink-0"
                >
                  <div className="w-24 h-24 rounded-2xl border-4 border-black bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl font-bold">
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                </motion.div>

                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold">{group.name}</h1>
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 text-gray-400 text-xs">
                      {getPrivacyIcon()}
                      {group.privacy}
                    </span>
                  </div>

                  <p className="text-gray-400 mb-3">{group.description}</p>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-gray-400">
                      <Users className="w-4 h-4" />
                      <span className="font-semibold text-white">
                        {group.memberCount}
                      </span>{' '}
                      members
                    </span>
                    <span className="flex items-center gap-1 text-gray-400">
                      <MessageSquare className="w-4 h-4" />
                      <span className="font-semibold text-white">
                        {group.postCount}
                      </span>{' '}
                      posts
                    </span>
                  </div>

                  <div className="mt-2 text-sm text-gray-400">
                    {getEntryRequirementText()}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {isAdmin && (
                <Link
                  to={`/groups/${groupId}/settings`}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </Link>
              )}

              {isMember && !isOwner && (
                <button
                  onClick={handleLeaveGroup}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Leave Group</span>
                </button>
              )}

              {isModerator && (
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37] text-black hover:bg-[#C9A62F] transition-colors">
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Invite</span>
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-white/10 mb-6">
            <div className="flex gap-8">
              {(
                ['posts', 'members', isAdmin && 'settings'].filter(Boolean) as string[]
              ).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`relative pb-4 font-medium transition-colors ${
                      isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {isActive && (
                      <motion.div
                        layoutId="groupTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]"
                        transition={{ type: 'spring', duration: 0.5 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'posts' && (
            <div className="space-y-6">
              {isMember && (
                <div className="mb-6">
                  <CreatePost
                    placeholder={`Share something with ${group.name}...`}
                    groupId={groupId}
                  />
                </div>
              )}

              {!isMember && (
                <div className="glass-card rounded-2xl p-8 text-center border border-white/10">
                  <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-bold mb-2">Members Only</h3>
                  <p className="text-gray-400 mb-4">
                    Join this group to view and create posts
                  </p>
                  <button className="px-6 py-2 bg-[#D4AF37] text-black rounded-full font-bold hover:bg-[#C9A62F] transition-colors">
                    Join Group
                  </button>
                </div>
              )}

              {isMember &&
                mockPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={() => {}}
                    onRepost={() => {}}
                    onTip={() => {}}
                  />
                ))}
            </div>
          )}

          {activeTab === 'members' && (
            <MemberManagement
              groupId={groupId}
              currentUserRole={currentMember?.role || 'member'}
            />
          )}

          {activeTab === 'settings' && isAdmin && (
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-4">Group Settings</h3>
                <p className="text-gray-400">Settings management coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
