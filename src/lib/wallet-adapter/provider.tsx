import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Connection, Transaction, VersionedTransaction } from '@solana/web3.js';
import type { SendOptions } from '@solana/web3.js';
import type {
  WalletAdapter,
  WalletName,
  WalletState,
  WalletConfig,
} from './types';
import { WalletError } from './types';
import { PhantomWalletAdapter, SolflareWalletAdapter } from './adapters';
import { WalletStorage } from './core/storage';
import { WalletContext, ConnectionContext } from './contexts';

interface WalletProviderProps {
  children: React.ReactNode;
  endpoint: string;
  config?: WalletConfig;
}

/**
 * Main Wallet Provider - combines wallet management and connection
 */
export function WalletProvider({ children, endpoint, config = {} }: WalletProviderProps) {
  const {
    autoConnect = true,
    onError,
    localStorageKey = 'solana-wallet-adapter',
  } = config;

  // Memoize connection to avoid recreating on every render
  const connection = useMemo(() => new Connection(endpoint, 'confirmed'), [endpoint]);

  // Memoize storage
  const storage = useMemo(() => new WalletStorage(localStorageKey), [localStorageKey]);

  // Available wallet adapters
  const adapters = useMemo(() => {
    return [new PhantomWalletAdapter(), new SolflareWalletAdapter()];
  }, []);

  // State
  const [wallet, setWallet] = useState<WalletAdapter | null>(null);
  const [publicKey, setPublicKey] = useState<WalletAdapter['publicKey']>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // Track if we've tried auto-connect
  const autoConnectAttempted = useRef(false);

  /**
   * Select a wallet by name
   */
  const select = useCallback((walletName: WalletName) => {
    const adapter = adapters.find((a) => a.name === walletName);
    if (adapter) {
      // Clear previous state
      setPublicKey(null);
      setConnected(false);
      // Set new wallet
      setWallet(adapter);
      storage.setSelectedWallet(walletName);
    }
  }, [adapters, storage]);

  /**
   * Connect to the selected wallet
   */
  const connect = useCallback(async () => {
    if (!wallet) return;
    if (connecting) return;
    if (connected) {
      console.log('[WalletProvider] Already connected');
      return;
    }

    try {
      setConnecting(true);
      console.log('[WalletProvider] Connecting to:', wallet.name);
      
      // Connect
      await wallet.connect();
      
      console.log('[WalletProvider] Connect call completed');
      
      // Wait a tick for adapter state to sync
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Ensure state is updated even if events don't fire
      if (wallet.publicKey) {
        console.log('[WalletProvider] Setting public key:', wallet.publicKey.toBase58());
        setPublicKey(wallet.publicKey);
        setConnected(true);
      } else {
        console.warn('[WalletProvider] No publicKey after connect');
      }
    } catch (error: any) {
      console.error('[WalletProvider] Failed to connect wallet:', error);
      setPublicKey(null);
      setConnected(false);
      
      if (onError && error instanceof WalletError) {
        onError(error);
      }
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [wallet, connecting, connected, onError]);

  /**
   * Disconnect from the current wallet
   */
  const disconnect = useCallback(async () => {
    if (!wallet || !connected) return;

    try {
      setDisconnecting(true);
      await wallet.disconnect();
      setPublicKey(null);
      setConnected(false);
      storage.clearSelectedWallet();
    } catch (error: any) {
      console.error('Failed to disconnect wallet:', error);
      if (onError && error instanceof WalletError) {
        onError(error);
      }
      throw error;
    } finally {
      setDisconnecting(false);
    }
  }, [wallet, connected, storage, onError]);

  /**
   * Sign a transaction
   */
  const signTransaction = useCallback(
    async <T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> => {
      if (!wallet || !connected) {
        throw new WalletError('Wallet not connected', 'CONNECTION_FAILED');
      }
      return wallet.signTransaction(transaction);
    },
    [wallet, connected]
  );

  /**
   * Sign multiple transactions
   */
  const signAllTransactions = useCallback(
    async <T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> => {
      if (!wallet || !connected) {
        throw new WalletError('Wallet not connected', 'CONNECTION_FAILED');
      }
      return wallet.signAllTransactions(transactions);
    },
    [wallet, connected]
  );

  /**
   * Sign a message
   */
  const signMessage = useCallback(
    async (message: Uint8Array): Promise<Uint8Array> => {
      if (!wallet || !connected) {
        throw new WalletError('Wallet not connected', 'CONNECTION_FAILED');
      }
      return wallet.signMessage(message);
    },
    [wallet, connected]
  );

  /**
   * Send a transaction (sign + send + confirm)
   */
  const sendTransaction = useCallback(
    async (
      transaction: Transaction | VersionedTransaction,
      options?: SendOptions
    ): Promise<string> => {
      if (!wallet || !connected || !publicKey) {
        throw new WalletError('Wallet not connected', 'CONNECTION_FAILED');
      }

      try {
        // Sign the transaction
        const signed = await wallet.signTransaction(transaction);

        // Send the transaction
        const signature = await connection.sendRawTransaction(
          signed.serialize(),
          options
        );

        // Confirm the transaction
        await connection.confirmTransaction(signature, 'confirmed');

        return signature;
      } catch (error: any) {
        console.error('Transaction failed:', error);
        throw new WalletError(
          error.message || 'Transaction failed',
          'TRANSACTION_FAILED'
        );
      }
    },
    [wallet, connected, publicKey, connection]
  );

  // Setup wallet event listeners
  useEffect(() => {
    if (!wallet) return;

    const cleanups: (() => void)[] = [];

    // Listen to connect events
    cleanups.push(
      wallet.on('connect', (pk) => {
        console.log('[WalletProvider] Connect event:', pk.toBase58());
        setPublicKey(pk);
        setConnected(true);
        setConnecting(false);
      })
    );

    // Listen to disconnect events
    cleanups.push(
      wallet.on('disconnect', () => {
        console.log('[WalletProvider] Disconnect event');
        setPublicKey(null);
        setConnected(false);
        setDisconnecting(false);
      })
    );

    // Listen to account change events
    cleanups.push(
      wallet.on('accountChanged', (pk) => {
        console.log('[WalletProvider] Account changed:', pk?.toBase58());
        setPublicKey(pk);
        if (!pk) {
          setConnected(false);
        }
      })
    );

    // Listen to error events
    cleanups.push(
      wallet.on('error', (error) => {
        console.error('[WalletProvider] Wallet error:', error);
        if (onError) {
          onError(error);
        }
      })
    );

    // Initial state sync when wallet changes
    if (wallet.connected && wallet.publicKey) {
      console.log('[WalletProvider] Syncing initial wallet state');
      setPublicKey(wallet.publicKey);
      setConnected(true);
    }

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [wallet, onError]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && !autoConnectAttempted.current) {
      autoConnectAttempted.current = true;
      
      const savedWallet = storage.getSelectedWallet();
      if (savedWallet) {
        console.log('[WalletProvider] Auto-connect: found saved wallet:', savedWallet);
        const adapter = adapters.find((a) => a.name === savedWallet);
        if (adapter) {
          // Properly select the wallet
          setWallet(adapter);
          
          // Wait a tick then attempt connection
          setTimeout(async () => {
            try {
              setConnecting(true);
              console.log('[WalletProvider] Auto-connect: attempting to connect to', adapter.name);
              
              // Call connect on the adapter
              await adapter.connect();
              
              // Check state after connection
              if (adapter.publicKey && adapter.connected) {
                console.log('[WalletProvider] Auto-connect: success');
                setPublicKey(adapter.publicKey);
                setConnected(true);
              } else {
                console.warn('[WalletProvider] Auto-connect: adapter connected but state not updated');
              }
            } catch (error: any) {
              console.warn('[WalletProvider] Auto-connect failed:', error?.message || error);
              storage.clearSelectedWallet();
              setPublicKey(null);
              setConnected(false);
            } finally {
              setConnecting(false);
            }
          }, 0);
        }
      }
    }
  }, [autoConnect, adapters, storage]);

  // Context value
  const contextValue = useMemo<WalletState>(
    () => ({
      wallet,
      publicKey,
      connected,
      connecting,
      disconnecting,
      select,
      connect,
      disconnect,
      signTransaction,
      signAllTransactions,
      signMessage,
      sendTransaction,
    }),
    [
      wallet,
      publicKey,
      connected,
      connecting,
      disconnecting,
      select,
      connect,
      disconnect,
      signTransaction,
      signAllTransactions,
      signMessage,
      sendTransaction,
    ]
  );

  return (
    <ConnectionContext.Provider value={connection}>
      <WalletContext.Provider value={contextValue}>
        {children}
      </WalletContext.Provider>
    </ConnectionContext.Provider>
  );
}
