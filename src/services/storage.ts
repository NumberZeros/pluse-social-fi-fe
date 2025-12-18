import { createStorage } from 'unstorage';
import indexedDBDriver from 'unstorage/drivers/indexedb';
import memoryDriver from 'unstorage/drivers/memory';

/**
 * Multi-layer Storage Service
 * Uses IndexedDB for persistent offline storage
 * Falls back to memory for SSR environments
 */

// Initialize unstorage with IndexedDB driver
const isIndexedDBAvailable = typeof indexedDB !== 'undefined';

export const storage = createStorage({
  driver: isIndexedDBAvailable
    ? indexedDBDriver({ dbName: 'social-fi-cache' })
    : memoryDriver(),
});

/**
 * Cache manager for feed posts
 */
export class CacheManager {
  private static readonly FEED_KEY = 'feed:posts';
  private static readonly FEED_TIMESTAMP_KEY = 'feed:timestamp';
  private static readonly METADATA_PREFIX = 'metadata:';
  private static readonly CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

  /**
   * Get cached posts
   */
  static async getCachedPosts() {
    try {
      const data = await storage.getItem(this.FEED_KEY);
      const timestamp = await storage.getItem(this.FEED_TIMESTAMP_KEY);

      if (!data || !timestamp) return null;

      // Parse if string, otherwise use as-is (unstorage may auto-parse)
      const posts = typeof data === 'string' ? JSON.parse(data) : data;
      const timestampNum = typeof timestamp === 'number' ? timestamp : parseInt(timestamp as string, 10);
      
      if (Date.now() - timestampNum > this.CACHE_DURATION) {
        return null; // Cache expired
      }

      return posts;
    } catch (error) {
      console.error('Error reading cached posts:', error);
      return null;
    }
  }

  /**
   * Set cached posts
   */
  static async setCachedPosts(posts: any) {
    try {
      // Store as plain object (unstorage will serialize)
      await Promise.all([
        storage.setItem(this.FEED_KEY, posts),
        storage.setItem(this.FEED_TIMESTAMP_KEY, Date.now()),
      ]);
    } catch (error) {
      console.error('Error caching posts:', error);
    }
  }

  /**
   * Get cached metadata for a specific URI
   */
  static async getCachedMetadata(uri: string) {
    try {
      const key = `${this.METADATA_PREFIX}${uri}`;
      const data = await storage.getItem(key);
      
      // Return as-is if it's already an object (unstorage auto-parses)
      // Otherwise parse it if it's a string
      if (!data) return null;
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch (error) {
      console.error('Error reading cached metadata:', error);
      return null;
    }
  }

  /**
   * Set cached metadata
   */
  static async setCachedMetadata(uri: string, metadata: any) {
    try {
      const key = `${this.METADATA_PREFIX}${uri}`;
      // Store as plain object (unstorage will serialize)
      await storage.setItem(key, metadata);
    } catch (error) {
      console.error('Error caching metadata:', error);
    }
  }

  /**
   * Clear all cache
   */
  static async clearCache() {
    try {
      const keys = await storage.getKeys();
      await Promise.all(
        keys.map((key) => {
          if (key.startsWith('feed:') || key.startsWith('metadata:')) {
            return storage.removeItem(key);
          }
          return Promise.resolve();
        })
      );
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Get storage stats
   */
  static async getStats() {
    try {
      const keys = await storage.getKeys();
      const feedKeys = keys.filter((k) => k.startsWith('feed:') || k.startsWith('metadata:'));
      return {
        totalKeys: keys.length,
        cacheKeys: feedKeys.length,
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return { totalKeys: 0, cacheKeys: 0 };
    }
  }
}

/**
 * Check if app is online
 */
export const isOnline = (): boolean => {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
};

// Listen for online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('✓ App is online');
  });

  window.addEventListener('offline', () => {
    console.log('⚠️ App is offline - using cached data');
  });
}
