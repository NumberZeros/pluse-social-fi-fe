import { useQuery } from '@tanstack/react-query';
import { useReadOnlySdk } from '../services/read-only-sdk';

export function usePlatformPaused() {
  const readSdk = useReadOnlySdk();

  const { data: config, isLoading } = useQuery({
    queryKey: ['platform_config'],
    queryFn: async () => {
      if (!readSdk) return null;
      return readSdk.getPlatformConfig();
    },
    enabled: !!readSdk,
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60 * 2,
  });

  return {
    isPaused: config?.paused ?? false,
    isLoading,
  };
}
