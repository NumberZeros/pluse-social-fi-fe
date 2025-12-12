import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

interface SolanaProviderProps {
  children: React.ReactNode;
}

export function SolanaProvider({ children }: SolanaProviderProps) {
  const network = useMemo(() => {
    const raw = (import.meta.env.VITE_SOLANA_NETWORK as string | undefined)?.toLowerCase();

    if (raw === 'devnet') return WalletAdapterNetwork.Devnet;
    if (raw === 'testnet') return WalletAdapterNetwork.Testnet;
    if (raw === 'mainnet' || raw === 'mainnet-beta' || raw === 'mainnetbeta') {
      return WalletAdapterNetwork.Mainnet;
    }

    return WalletAdapterNetwork.Devnet;
  }, []);

  const endpoint = useMemo(() => {
    const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL as string | undefined;
    return rpcUrl?.length ? rpcUrl : clusterApiUrl(network);
  }, [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
