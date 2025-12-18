import { useEffect, useState } from 'react';
import { CacheManager, isOnline } from '../services/storage';

/**
 * Hook to manage cache operations and offline status
 */
export const useCache = () => {
  const [online, setOnline] = useState(() => isOnline());
  const [cacheStats, setCacheStats] = useState({ totalKeys: 0, cacheKeys: 0 });

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Get cache stats on mount
  useEffect(() => {
    CacheManager.getStats().then(setCacheStats);
  }, []);

  return {
    isOnline: online,
    cacheStats,
    clearCache: async () => {
      await CacheManager.clearCache();
      setCacheStats({ totalKeys: 0, cacheKeys: 0 });
    },
    refreshCacheStats: async () => {
      const stats = await CacheManager.getStats();
      setCacheStats(stats);
    },
  };
};
