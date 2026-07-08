import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from './WalletButton';

/**
 * Wallet button wrapper — connection errors are handled by SolanaProvider onError.
 */
export function SafeWalletButton({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { connecting, connected } = useWallet();

  return (
    <div className={compact ? 'inline-flex items-center' : 'flex flex-col items-center gap-2'}>
      <WalletButton className={className} />
      {connecting && !connected && !compact && (
        <div className="text-xs text-info">
          Connecting to wallet...
        </div>
      )}
    </div>
  );
}
