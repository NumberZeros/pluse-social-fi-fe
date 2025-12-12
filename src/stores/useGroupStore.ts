import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type GroupPrivacy = 'public' | 'private' | 'secret';
export type EntryRequirement = 'free' | 'pay_sol' | 'hold_token' | 'hold_nft';
export type MemberRole = 'owner' | 'admin' | 'moderator' | 'member';

export interface Group {
  id: string;
  name: string;
  description: string;
  banner: string | null;
  creator: string; // wallet address
  privacy: GroupPrivacy;
  entryRequirement: EntryRequirement;
  entryPrice?: number; // SOL amount if pay_sol
  tokenMint?: string; // Token mint address if hold_token
  nftCollection?: string; // NFT collection address if hold_nft
  memberCount: number;
  postCount: number;
  createdAt: string;
  category?: string;
}

export interface GroupMember {
  groupId: string;
  walletAddress: string;
  username: string | null;
  role: MemberRole;
  joinedAt: string;
  banned: boolean;
}

interface GroupStore {
  groups: Group[];
  members: Map<string, GroupMember[]>; // groupId -> members[]
  myGroups: Set<string>; // groupIds I'm a member of

  // Group CRUD
  createGroup: (
    group: Omit<Group, 'id' | 'memberCount' | 'postCount' | 'createdAt'>,
  ) => string;
  updateGroup: (groupId: string, updates: Partial<Group>) => void;
  deleteGroup: (groupId: string) => void;
  getGroupById: (groupId: string) => Group | undefined;
  getGroupsByCreator: (walletAddress: string) => Group[];
  getPublicGroups: () => Group[];
  getMyGroups: () => Group[];

  // Member management
  joinGroup: (groupId: string, walletAddress: string, username: string | null) => void;
  leaveGroup: (groupId: string, walletAddress: string) => void;
  getMembersByGroup: (groupId: string) => GroupMember[];
  getMemberRole: (groupId: string, walletAddress: string) => MemberRole | null;
  isMember: (groupId: string, walletAddress: string) => boolean;
  isAdmin: (groupId: string, walletAddress: string) => boolean;

  // Admin actions
  kickMember: (groupId: string, walletAddress: string) => void;
  banMember: (groupId: string, walletAddress: string) => void;
  unbanMember: (groupId: string, walletAddress: string) => void;
  promoteToAdmin: (groupId: string, walletAddress: string) => void;
  promoteToModerator: (groupId: string, walletAddress: string) => void;
  demoteToMember: (groupId: string, walletAddress: string) => void;

  // Stats
  incrementPostCount: (groupId: string) => void;
}

const useGroupStore = create<GroupStore>()(
  persist(
    (set, get) => ({
      groups: [],
      members: new Map(),
      myGroups: new Set(),

      createGroup: (groupData) => {
        const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newGroup: Group = {
          ...groupData,
          id: groupId,
          memberCount: 1, // Creator is first member
          postCount: 0,
          createdAt: new Date().toISOString(),
        };

        // Add creator as owner
        const creatorMember: GroupMember = {
          groupId,
          walletAddress: groupData.creator,
          username: null,
          role: 'owner',
          joinedAt: new Date().toISOString(),
          banned: false,
        };

        set((state) => {
          const newMembers = new Map(state.members);
          newMembers.set(groupId, [creatorMember]);
          const newMyGroups = new Set(state.myGroups);
          newMyGroups.add(groupId);

          return {
            groups: [...state.groups, newGroup],
            members: newMembers,
            myGroups: newMyGroups,
          };
        });

        return groupId;
      },

      updateGroup: (groupId, updates) =>
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === groupId ? { ...group, ...updates } : group,
          ),
        })),

      deleteGroup: (groupId) =>
        set((state) => {
          const newMembers = new Map(state.members);
          newMembers.delete(groupId);
          const newMyGroups = new Set(state.myGroups);
          newMyGroups.delete(groupId);

          return {
            groups: state.groups.filter((group) => group.id !== groupId),
            members: newMembers,
            myGroups: newMyGroups,
          };
        }),

      getGroupById: (groupId) => get().groups.find((group) => group.id === groupId),

      getGroupsByCreator: (walletAddress) =>
        get().groups.filter((group) => group.creator === walletAddress),

      getPublicGroups: () => get().groups.filter((group) => group.privacy === 'public'),

      getMyGroups: () => {
        const { groups, myGroups } = get();
        return groups.filter((group) => myGroups.has(group.id));
      },

      joinGroup: (groupId, walletAddress, username) => {
        const group = get().getGroupById(groupId);
        if (!group) return;

        const newMember: GroupMember = {
          groupId,
          walletAddress,
          username,
          role: 'member',
          joinedAt: new Date().toISOString(),
          banned: false,
        };

        set((state) => {
          const newMembers = new Map(state.members);
          const groupMembers = newMembers.get(groupId) || [];

          // Check if already member
          if (groupMembers.some((m) => m.walletAddress === walletAddress)) {
            return state;
          }

          newMembers.set(groupId, [...groupMembers, newMember]);
          const newMyGroups = new Set(state.myGroups);
          newMyGroups.add(groupId);

          return {
            members: newMembers,
            myGroups: newMyGroups,
            groups: state.groups.map((g) =>
              g.id === groupId ? { ...g, memberCount: g.memberCount + 1 } : g,
            ),
          };
        });
      },

      leaveGroup: (groupId, walletAddress) =>
        set((state) => {
          const newMembers = new Map(state.members);
          const groupMembers = newMembers.get(groupId) || [];
          const filteredMembers = groupMembers.filter(
            (m) => m.walletAddress !== walletAddress,
          );
          newMembers.set(groupId, filteredMembers);

          const newMyGroups = new Set(state.myGroups);
          newMyGroups.delete(groupId);

          return {
            members: newMembers,
            myGroups: newMyGroups,
            groups: state.groups.map((g) =>
              g.id === groupId
                ? { ...g, memberCount: Math.max(0, g.memberCount - 1) }
                : g,
            ),
          };
        }),

      getMembersByGroup: (groupId) => get().members.get(groupId) || [],

      getMemberRole: (groupId, walletAddress) => {
        const members = get().members.get(groupId) || [];
        const member = members.find((m) => m.walletAddress === walletAddress);
        return member?.role || null;
      },

      isMember: (groupId, walletAddress) => {
        const members = get().members.get(groupId) || [];
        return members.some((m) => m.walletAddress === walletAddress && !m.banned);
      },

      isAdmin: (groupId, walletAddress) => {
        const role = get().getMemberRole(groupId, walletAddress);
        return role === 'owner' || role === 'admin';
      },

      kickMember: (groupId, walletAddress) => {
        get().leaveGroup(groupId, walletAddress);
      },

      banMember: (groupId, walletAddress) =>
        set((state) => {
          const newMembers = new Map(state.members);
          const groupMembers = newMembers.get(groupId) || [];
          const updatedMembers = groupMembers.map((m) =>
            m.walletAddress === walletAddress ? { ...m, banned: true } : m,
          );
          newMembers.set(groupId, updatedMembers);

          return { members: newMembers };
        }),

      unbanMember: (groupId, walletAddress) =>
        set((state) => {
          const newMembers = new Map(state.members);
          const groupMembers = newMembers.get(groupId) || [];
          const updatedMembers = groupMembers.map((m) =>
            m.walletAddress === walletAddress ? { ...m, banned: false } : m,
          );
          newMembers.set(groupId, updatedMembers);

          return { members: newMembers };
        }),

      promoteToAdmin: (groupId, walletAddress) =>
        set((state) => {
          const newMembers = new Map(state.members);
          const groupMembers = newMembers.get(groupId) || [];
          const updatedMembers = groupMembers.map((m) =>
            m.walletAddress === walletAddress ? { ...m, role: 'admin' as MemberRole } : m,
          );
          newMembers.set(groupId, updatedMembers);

          return { members: newMembers };
        }),

      promoteToModerator: (groupId, walletAddress) =>
        set((state) => {
          const newMembers = new Map(state.members);
          const groupMembers = newMembers.get(groupId) || [];
          const updatedMembers = groupMembers.map((m) =>
            m.walletAddress === walletAddress
              ? { ...m, role: 'moderator' as MemberRole }
              : m,
          );
          newMembers.set(groupId, updatedMembers);

          return { members: newMembers };
        }),

      demoteToMember: (groupId, walletAddress) =>
        set((state) => {
          const newMembers = new Map(state.members);
          const groupMembers = newMembers.get(groupId) || [];
          const updatedMembers = groupMembers.map((m) =>
            m.walletAddress === walletAddress
              ? { ...m, role: 'member' as MemberRole }
              : m,
          );
          newMembers.set(groupId, updatedMembers);

          return { members: newMembers };
        }),

      incrementPostCount: (groupId) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId ? { ...g, postCount: g.postCount + 1 } : g,
          ),
        })),
    }),
    {
      name: 'pulse-groups-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        groups: state.groups,
        members: Array.from(state.members.entries()),
        myGroups: Array.from(state.myGroups),
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        groups: persistedState?.groups || [],
        members: new Map(persistedState?.members || []),
        myGroups: new Set(persistedState?.myGroups || []),
      }),
    },
  ),
);

export default useGroupStore;
