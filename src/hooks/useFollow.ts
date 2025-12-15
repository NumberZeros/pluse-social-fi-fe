import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface FollowData {
  followerAddress: string;
  followingAddress: string;
  followedAt: number;
}

// In-memory follow relationships (TODO: move to blockchain/indexing)
const followGraph = new Map<string, Set<string>>();

class FollowService {
  follow(followerAddress: string, followingAddress: string): void {
    if (!followGraph.has(followerAddress)) {
      followGraph.set(followerAddress, new Set());
    }
    followGraph.get(followerAddress)!.add(followingAddress);
  }

  unfollow(followerAddress: string, followingAddress: string): void {
    if (followGraph.has(followerAddress)) {
      followGraph.get(followerAddress)!.delete(followingAddress);
    }
  }

  isFollowing(followerAddress: string, followingAddress: string): boolean {
    return followGraph.get(followerAddress)?.has(followingAddress) ?? false;
  }

  getFollowers(userAddress: string): string[] {
    const followers: string[] = [];
    followGraph.forEach((following, follower) => {
      if (following.has(userAddress)) {
        followers.push(follower);
      }
    });
    return followers;
  }

  getFollowing(userAddress: string): string[] {
    return Array.from(followGraph.get(userAddress) ?? []);
  }

  getFollowerCount(userAddress: string): number {
    return this.getFollowers(userAddress).length;
  }

  getFollowingCount(userAddress: string): number {
    return this.getFollowing(userAddress).length;
  }
}

const followService = new FollowService();

// Get followers query
export const useFollowers = (targetAddress?: string) => {
  return useQuery({
    queryKey: ['followers', targetAddress],
    queryFn: async () => {
      if (!targetAddress) return [];
      return followService.getFollowers(targetAddress);
    },
    enabled: !!targetAddress,
  });
};

// Get following query
export const useFollowing = (targetAddress?: string) => {
  return useQuery({
    queryKey: ['following', targetAddress],
    queryFn: async () => {
      if (!targetAddress) return [];
      return followService.getFollowing(targetAddress);
    },
    enabled: !!targetAddress,
  });
};

// Check if user is following query
export const useIsFollowing = (followerAddress?: string, followingAddress?: string) => {
  return useQuery({
    queryKey: ['is_following', followerAddress, followingAddress],
    queryFn: async () => {
      if (!followerAddress || !followingAddress) return false;
      return followService.isFollowing(followerAddress, followingAddress);
    },
    enabled: !!followerAddress && !!followingAddress,
  });
};

// Follow user mutation
export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ followerId, followingId }: { followerId: string; followingId: string }) => {
      if (!followerId || !followingId) throw new Error('Invalid addresses');
      followService.follow(followerId, followingId);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['is_following'] });
    },
  });
};

// Unfollow user mutation
export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ followerId, followingId }: { followerId: string; followingId: string }) => {
      if (!followerId || !followingId) throw new Error('Invalid addresses');
      followService.unfollow(followerId, followingId);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['is_following'] });
    },
  });
};

export { followService };
