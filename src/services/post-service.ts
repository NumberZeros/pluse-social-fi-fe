/**
 * Post Service
 * Handles creation, retrieval, and management of social posts
 * Can be backed by Shadow Drive, Arweave, IPFS, or traditional DB
 */

export interface PostMetadata {
  id: string;
  authorAddress: string;
  authorUsername: string;
  content: string;
  imageUrls: string[];
  createdAt: number;
  updatedAt: number;
  likes: number;
  reposts: number;
  tips: number;
  comments: number;
}

export interface Post extends PostMetadata {
  isLiked?: boolean;
  isReposted?: boolean;
}

export interface CreatePostInput {
  content: string;
  imageUrls?: string[];
}

/**
 * Post Service - handles all post operations
 * Currently uses in-memory storage
 * TODO: Integrate with Shadow Drive, Arweave, or IPFS for persistence
 */
class PostService {
  // In-memory post storage (replace with blockchain/IPFS storage)
  private posts: Map<string, PostMetadata> = new Map();
  private postIdCounter = 0;

  /**
   * Create a new post
   */
  async createPost(
    authorAddress: string,
    authorUsername: string,
    input: CreatePostInput
  ): Promise<Post> {
    if (!input.content.trim()) {
      throw new Error('Post content cannot be empty');
    }

    if (input.content.length > 280) {
      throw new Error('Post content exceeds maximum length of 280 characters');
    }

    const postId = `post_${this.postIdCounter++}_${Date.now()}`;
    const now = Date.now();

    const post: PostMetadata = {
      id: postId,
      authorAddress,
      authorUsername,
      content: input.content,
      imageUrls: input.imageUrls || [],
      createdAt: now,
      updatedAt: now,
      likes: 0,
      reposts: 0,
      tips: 0,
      comments: 0,
    };

    this.posts.set(postId, post);

    // TODO: Persist to blockchain/IPFS

    return post;
  }

  /**
   * Get a single post by ID
   */
  async getPost(postId: string): Promise<Post | null> {
    return this.posts.get(postId) || null;
  }

  /**
   * Get timeline posts (latest first)
   */
  async getTimeline(limit: number = 20, offset: number = 0): Promise<Post[]> {
    const posts = Array.from(this.posts.values()).sort(
      (a, b) => b.createdAt - a.createdAt
    );

    return posts.slice(offset, offset + limit);
  }

  /**
   * Get posts from a specific user
   */
  async getUserPosts(
    authorAddress: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Post[]> {
    const posts = Array.from(this.posts.values())
      .filter((p) => p.authorAddress === authorAddress)
      .sort((a, b) => b.createdAt - a.createdAt);

    return posts.slice(offset, offset + limit);
  }

  /**
   * Like a post
   */
  async likePost(postId: string): Promise<void> {
    const post = this.posts.get(postId);
    if (!post) throw new Error('Post not found');

    post.likes += 1;
    post.updatedAt = Date.now();

    // TODO: Record like on-chain
  }

  /**
   * Unlike a post
   */
  async unlikePost(postId: string): Promise<void> {
    const post = this.posts.get(postId);
    if (!post) throw new Error('Post not found');

    if (post.likes > 0) {
      post.likes -= 1;
      post.updatedAt = Date.now();
    }

    // TODO: Record unlike on-chain
  }

  /**
   * Repost a post
   */
  async repostPost(postId: string, reposterAddress: string): Promise<Post> {
    const originalPost = this.posts.get(postId);
    if (!originalPost) throw new Error('Original post not found');

    originalPost.reposts += 1;
    originalPost.updatedAt = Date.now();

    // Create a repost entry
    const repostId = `repost_${this.postIdCounter++}_${Date.now()}`;
    const repost: PostMetadata = {
      id: repostId,
      authorAddress: reposterAddress,
      authorUsername: 'reposter', // TODO: Get actual username
      content: `RT @${originalPost.authorUsername}: ${originalPost.content}`,
      imageUrls: originalPost.imageUrls,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      likes: 0,
      reposts: 0,
      tips: 0,
      comments: 0,
    };

    this.posts.set(repostId, repost);

    // TODO: Record repost on-chain

    return repost;
  }

  /**
   * Tip a post
   */
  async tipPost(postId: string, _amountInSol: number): Promise<void> {
    const post = this.posts.get(postId);
    if (!post) throw new Error('Post not found');

    post.tips += 1;
    post.updatedAt = Date.now();

    // TODO: Execute SOL transfer and record on-chain
  }

  /**
   * Delete a post (author only)
   */
  async deletePost(
    postId: string,
    requesterAddress: string
  ): Promise<void> {
    const post = this.posts.get(postId);
    if (!post) throw new Error('Post not found');
    if (post.authorAddress !== requesterAddress) {
      throw new Error('Only post author can delete');
    }

    this.posts.delete(postId);

    // TODO: Mark as deleted on-chain
  }

  /**
   * Search posts by content
   */
  async searchPosts(query: string, limit: number = 20): Promise<Post[]> {
    const lowerQuery = query.toLowerCase();
    const results = Array.from(this.posts.values())
      .filter(
        (p) =>
          p.content.toLowerCase().includes(lowerQuery) ||
          p.authorUsername.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);

    return results;
  }

  /**
   * Get trending hashtags and topics
   * TODO: Implement proper trending algorithm
   */
  async getTrendingTopics(): Promise<
    Array<{ tag: string; count: number; trend: 'up' | 'down' | 'stable' }>
  > {
    // Placeholder for trending calculation
    return [
      { tag: '#SocialFi', count: 234, trend: 'up' },
      { tag: '#Solana', count: 189, trend: 'stable' },
      { tag: '#Governance', count: 156, trend: 'up' },
    ];
  }

  /**
   * Get suggested users to follow
   * TODO: Implement proper recommendation algorithm
   */
  async getSuggestedUsers(): Promise<
    Array<{ address: string; username: string; followerCount: number }>
  > {
    // Placeholder for suggestions
    return [
      { address: 'user1.sol', username: 'creator1', followerCount: 1234 },
      { address: 'user2.sol', username: 'creator2', followerCount: 567 },
      { address: 'user3.sol', username: 'creator3', followerCount: 890 },
    ];
  }
}

export const postService = new PostService();
export default PostService;
