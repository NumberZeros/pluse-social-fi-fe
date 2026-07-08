import { useMemo, useCallback, useEffect } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  WalletError,
  WalletAdapterNetwork,
  type Adapter,
} from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { WalletConnectWalletAdapter } from '@solana/wallet-adapter-walletconnect';
import toast from 'react-hot-toast';
import {
  getRpcEndpoint,
  getWalletAdapterNetwork,
  SITE_URL,
} from '../utils/constants';
import {
  dedupeWalletAdapters,
  getLegacyMobileAdapters,
} from '../utils/dedupe-wallet-adapters';
import {
  handleWalletError,
  markAutoConnectComplete,
  shouldShowWalletError,
  walletErrorMessage,
} from '../utils/wallet-errors';
import '@solana/wallet-adapter-react-ui/styles.css';
import '../styles/wallet-adapter-overrides.css';

interface SolanaProviderProps {
  children: React.ReactNode;
}

export function SolanaProvider({ children }: SolanaProviderProps) {
  const endpoint = useMemo(() => getRpcEndpoint(), []);
  const network = useMemo(() => getWalletAdapterNetwork(), []);

  const wallets = useMemo(() => {
    const adapters: Adapter[] = getLegacyMobileAdapters(() => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ]);

    const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined;
    if (projectId?.trim()) {
      const wcNetwork =
        network === WalletAdapterNetwork.Mainnet
          ? WalletAdapterNetwork.Mainnet
          : WalletAdapterNetwork.Devnet;

      adapters.push(
        new WalletConnectWalletAdapter({
          network: wcNetwork,
          options: {
            projectId: projectId.trim(),
            metadata: {
              name: 'Pulse Social',
              description: 'Creator platform on Solana — Supporter Shares',
              url: SITE_URL,
              icons: [`${SITE_URL}/favicon.ico`],
            },
          },
        }),
      );
    }

    return dedupeWalletAdapters(adapters);
  }, [network]);

  useEffect(() => {
    const timer = window.setTimeout(markAutoConnectComplete, 4_000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && !projectId?.trim()) {
      console.warn(
        '[Pulse] VITE_WALLETCONNECT_PROJECT_ID is missing — WalletConnect is required for mobile browsers.',
      );
    }
  }, []);

  const onError = useCallback((error: WalletError) => {
    handleWalletError(error);
    if (shouldShowWalletError(error)) {
      toast.error(walletErrorMessage(error));
    }
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect onError={onError}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
