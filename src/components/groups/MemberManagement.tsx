import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import useGroupStore, {
  type GroupMember,
  type MemberRole,
} from '../../stores/useGroupStore';
import { Crown, Shield, User, UserMinus, Ban, Copy, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface MemberManagementProps {
  groupId: string;
  currentUserRole: 'owner' | 'admin' | 'moderator' | 'member';
}

export function MemberManagement({ groupId, currentUserRole }: MemberManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedInvite, setCopiedInvite] = useState(false);

  const members = useGroupStore((state) => state.members);
  const kickMember = useGroupStore((state) => state.kickMember);
  const banMember = useGroupStore((state) => state.banMember);
  const promoteToAdmin = useGroupStore((state) => state.promoteToAdmin);
  const promoteToModerator = useGroupStore((state) => state.promoteToModerator);
  const demoteToMember = useGroupStore((state) => state.demoteToMember);

  const groupMembers = members.get(groupId) || [];
  const isOwner = currentUserRole === 'owner';
  const isAdmin = currentUserRole === 'admin' || isOwner;

  const filteredMembers = groupMembers.filter(
    (member: GroupMember) =>
      (member.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.walletAddress.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    const roleOrder: Record<MemberRole, number> = {
      owner: 0,
      admin: 1,
      moderator: 2,
      member: 3,
    };
    return roleOrder[a.role] - roleOrder[b.role];
  });

  const handleKick = (member: GroupMember) => {
    if (confirm(`Remove @${member.username} from the group?`)) {
      kickMember(groupId, member.walletAddress);
      toast.success(`@${member.username} has been removed`);
    }
  };

  const handleBan = (member: GroupMember) => {
    if (
      confirm(`Ban @${member.username} from the group? They won't be able to rejoin.`)
    ) {
      banMember(groupId, member.walletAddress);
      toast.success(`@${member.username} has been banned`);
    }
  };

  const handlePromote = (member: GroupMember, newRole: 'admin' | 'moderator') => {
    const roleNames = { admin: 'Admin', moderator: 'Moderator' };
    if (confirm(`Promote @${member.username || 'Anonymous'} to ${roleNames[newRole]}?`)) {
      if (newRole === 'admin') {
        promoteToAdmin(groupId, member.walletAddress);
      } else {
        promoteToModerator(groupId, member.walletAddress);
      }
      toast.success(`@${member.username || 'Anonymous'} is now a ${roleNames[newRole]}`);
    }
  };

  const handleDemote = (member: GroupMember) => {
    if (confirm(`Demote @${member.username} to regular member?`)) {
      demoteToMember(groupId, member.walletAddress);
      toast.success(`@${member.username} has been demoted`);
    }
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/groups/${groupId}/invite`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedInvite(true);
    toast.success('Invite link copied!');
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-solana-green)]/20 text-[var(--color-solana-green)] text-xs font-medium">
            <Crown className="w-3 h-3" />
            Owner
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-solana-green)]/20 text-[var(--color-solana-green)] text-xs font-medium">
            <Shield className="w-3 h-3" />
            Admin
          </span>
        );
      case 'moderator':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-solana-green)]/20 text-[var(--color-solana-green)] text-xs font-medium">
            <Shield className="w-3 h-3" />
            Mod
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 text-xs font-medium">
            <User className="w-3 h-3" />
            Member
          </span>
        );
    }
  };

  const canManageMember = (memberRole: string) => {
    if (memberRole === 'owner') return false;
    if (currentUserRole === 'owner') return true;
    if (currentUserRole === 'admin' && memberRole !== 'admin') return true;
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Invite Link */}
      {(isAdmin || currentUserRole === 'moderator') && (
        <div className="glass-card rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-bold mb-3">Invite Members</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={`${window.location.origin}/groups/${groupId}/invite`}
              readOnly
              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-400"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyInviteLink}
              className="px-4 py-2 bg-[var(--color-solana-green)] text-black rounded-lg font-medium flex items-center gap-2"
            >
              {copiedInvite ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </motion.button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <input
          type="text"
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 outline-none focus:border-white/20 transition-colors"
        />
      </div>

      {/* Member List */}
      <div className="space-y-3">
        {sortedMembers.map((member) => (
          <motion.div
            key={member.walletAddress}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username}`}
                  alt={member.username || 'Anonymous'}
                  className="w-12 h-12 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      to={`/${member.username}`}
                      className="font-bold hover:text-[var(--color-solana-green)] transition-colors truncate"
                    >
                      @{member.username}
                    </Link>
                    {getRoleBadge(member.role)}
                  </div>
                  <div className="text-sm text-gray-400 truncate">
                    {member.walletAddress.slice(0, 4)}...{member.walletAddress.slice(-4)}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {canManageMember(member.role) && (
                <div className="flex gap-2 flex-shrink-0">
                  {/* Promote/Demote */}
                  {isOwner && (
                    <>
                      {member.role === 'member' && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePromote(member, 'moderator')}
                            className="px-3 py-1.5 text-sm rounded-lg bg-[var(--color-solana-green)]/10 text-[var(--color-solana-green)] hover:bg-[var(--color-solana-green)]/20 transition-colors"
                            title="Promote to Moderator"
                          >
                            Make Mod
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePromote(member, 'admin')}
                            className="px-3 py-1.5 text-sm rounded-lg bg-gray-500/10 text-gray-400 hover:bg-gray-500/20 transition-colors"
                            title="Promote to Admin"
                          >
                            Make Admin
                          </motion.button>
                        </>
                      )}
                      {(member.role === 'moderator' || member.role === 'admin') && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDemote(member)}
                          className="px-3 py-1.5 text-sm rounded-lg bg-gray-500/10 text-gray-400 hover:bg-gray-500/20 transition-colors"
                          title="Demote to Member"
                        >
                          Demote
                        </motion.button>
                      )}
                    </>
                  )}

                  {/* Kick */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleKick(member)}
                    className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-colors"
                    title="Remove from group"
                  >
                    <UserMinus className="w-4 h-4" />
                  </motion.button>

                  {/* Ban */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBan(member)}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    title="Ban from group"
                  >
                    <Ban className="w-4 h-4" />
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {sortedMembers.length === 0 && (
          <div className="glass-card rounded-xl p-8 text-center border border-white/10">
            <p className="text-gray-400">No members found</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-bold mb-4">Member Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold text-[var(--color-solana-green)]">
              {groupMembers.filter((m: GroupMember) => m.role === 'owner').length}
            </div>
            <div className="text-sm text-gray-400">Owners</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--color-solana-green)]">
              {groupMembers.filter((m: GroupMember) => m.role === 'admin').length}
            </div>
            <div className="text-sm text-gray-400">Admins</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">
              {groupMembers.filter((m: GroupMember) => m.role === 'moderator').length}
            </div>
            <div className="text-sm text-gray-400">Moderators</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {groupMembers.filter((m: GroupMember) => m.role === 'member').length}
            </div>
            <div className="text-sm text-gray-400">Members</div>
          </div>
        </div>
      </div>
    </div>
  );
}
