import { useWallet } from '../../lib/wallet-adapter';
import { WalletButton } from '../../lib/wallet-adapter/components';
import { useEffect, useState } from 'react';

/**
 * Safe wallet button that handles connection errors gracefully
 * Updated to use our custom RainbowKit-inspired wallet adapter
 */
export function SafeWalletButton({ className }: { className?: string }) {
  const { connecting, connected } = useWallet();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear error when wallet changes or connects
    if (connected || connecting) {
      setError(null);
    }
  }, [connected, connecting]);

  useEffect(() => {
    // Listen for wallet errors
    const handleError = (e: ErrorEvent) => {
      if (e.error?.message?.includes('Unexpected error') || 
          e.error?.message?.includes('signIn')) {
        setError('Wallet connection failed. Please try again or use a different wallet.');
        console.log('Tip: Make sure your wallet is unlocked and try refreshing the page.');
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
      <WalletButton className={className} />
      {error && !connected && (
        <div className="text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-md max-w-xs text-center">
          {error}
        </div>
      )}
      {connecting && (
        <div className="text-xs text-blue-400">
          Connecting to wallet...
        </div>
      )}
    </div>
  );
}
