import { AlertTriangle } from 'lucide-react';
import { usePlatformPaused } from '../../hooks/usePlatformPaused';

export function PlatformPauseBanner() {
  const { isPaused } = usePlatformPaused();

  if (!isPaused) {
    return null;
  }

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-3">
      <div className="max-w-[1400px] mx-auto flex items-center gap-3 text-amber-300 text-sm">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <span>
          Platform is temporarily paused. On-chain actions are disabled until the admin
          unpauses.
        </span>
      </div>
    </div>
  );
}
