import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { usePlatformPaused } from './usePlatformPaused';

export function usePlatformAction() {
  const { isPaused, isLoading } = usePlatformPaused();

  const guardAction = useCallback(
    (action: () => void) => {
      if (isPaused) {
        toast.error('Platform is paused. On-chain actions are disabled.');
        return false;
      }
      action();
      return true;
    },
    [isPaused],
  );

  return { isPaused, isLoading, guardAction };
}
