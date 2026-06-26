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
        className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-center text-sm text-amber-200"
        role="alert"
      >
        <AlertTriangle className="inline w-4 h-4 mr-1.5 -mt-0.5" aria-hidden />
        RPC endpoint mismatch — this app expects <strong>{networkLabel}</strong>. Check{' '}
        <code className="text-amber-100">VITE_SOLANA_NETWORK</code> or{' '}
        <code className="text-amber-100">VITE_SOLANA_RPC_URL</code>.
      </div>
    );
  }

  if (!IS_DEVNET) {
    return (
      <div className="bg-[var(--color-solana-green)]/10 border-b border-[var(--color-solana-green)]/20 px-4 py-1.5 text-center text-xs text-[var(--color-solana-green)]">
        Live on {networkLabel}
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-solana-green)]/5 border-b border-[var(--color-solana-green)]/20 px-4 py-2 text-center text-sm text-gray-300">
      <span className="text-[var(--color-solana-green)] font-semibold">Beta — {networkLabel}</span>
      <span className="mx-2 text-gray-600">·</span>
      Need SOL?{' '}
      <a
        href={FAUCET_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--color-solana-green)] hover:underline inline-flex items-center gap-1"
      >
        faucet.solana.com
        <ExternalLink className="w-3 h-3" aria-hidden />
      </a>
      <span className="mx-2 text-gray-600 hidden sm:inline">·</span>
      <span className="hidden sm:inline text-gray-500">
        In Phantom: Settings → Developer Settings → Testnet Mode
      </span>
    </div>
  );
}
