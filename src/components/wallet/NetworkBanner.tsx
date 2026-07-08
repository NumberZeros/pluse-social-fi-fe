import { AlertTriangle, ExternalLink } from 'lucide-react';
import { useWalletHealth } from '../../hooks/useWalletHealth';
import { IS_DEVNET } from '../../utils/constants';

const FAUCET_URL = 'https://faucet.solana.com';

export function NetworkBanner() {
  const { rpcNetworkOk, networkLabel, isLoading } = useWalletHealth();

  if (isLoading && !IS_DEVNET) return null;

  if (!rpcNetworkOk) {
    return (
      <div
        className="bg-warning/10 border-b border-warning/30 px-4 py-2 text-center text-sm text-warning"
        role="alert"
      >
        <AlertTriangle className="inline w-4 h-4 mr-1.5 -mt-0.5" aria-hidden />
        RPC endpoint mismatch — this app expects <strong>{networkLabel}</strong>. Check{' '}
        <code className="text-foreground">VITE_SOLANA_NETWORK</code> or{' '}
        <code className="text-foreground">VITE_SOLANA_RPC_URL</code>.
      </div>
    );
  }

  if (!IS_DEVNET) {
    return (
      <div className="bg-primary/10 border-b border-primary/20 px-4 py-1.5 text-center text-xs text-primary">
        Live on {networkLabel}
      </div>
    );
  }

  return (
    <div className="bg-primary/5 border-b border-primary/20 px-4 py-2 text-center text-sm text-muted">
      <span className="text-primary font-semibold">Beta — {networkLabel}</span>
      <span className="mx-2 text-muted">·</span>
      Need SOL?{' '}
      <a
        href={FAUCET_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline inline-flex items-center gap-1"
      >
        faucet.solana.com
        <ExternalLink className="w-3 h-3" aria-hidden />
      </a>
      <span className="mx-2 text-muted hidden sm:inline">·</span>
      <span className="hidden sm:inline text-muted">
        In Phantom: Settings → Developer Settings → Testnet Mode
      </span>
    </div>
  );
}
