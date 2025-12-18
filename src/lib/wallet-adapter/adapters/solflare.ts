import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { BaseWalletAdapter } from '../core/base-adapter';
import type {
  WalletMetadata,
  WalletName,
} from '../types';
import { WalletError, WalletReadyState } from '../types';

/**
 * Solflare wallet type definitions
 */
interface SolflareProvider {
  isSolflare?: boolean;
  publicKey?: { toBytes(): Uint8Array };
  connect(options?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: { toBytes(): Uint8Array } }>;
  disconnect(): Promise<void>;
  signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
  signMessage(message: Uint8Array, display?: 'utf8' | 'hex'): Promise<{ signature: Uint8Array }>;
  on(event: string, handler: (...args: any[]) => void): void;
  off(event: string, handler: (...args: any[]) => void): void;
}

interface SolflareWindow extends Window {
  solflare?: SolflareProvider;
  solana?: SolflareProvider & {
    isSolflare?: boolean;
  };
}

declare const window: SolflareWindow;

/**
 * Solflare Wallet Adapter
 * Direct integration with Solflare wallet extension
 */
export class SolflareWalletAdapter extends BaseWalletAdapter {
  readonly name: WalletName = 'Solflare';
  readonly metadata: WalletMetadata = {
    name: 'Solflare',
    url: 'https://solflare.com',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjggMTI4Ij48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjY0IiBjeT0iNjQiIHI9IjY0IiBmaWxsPSIjRkM2NTJEIi8+PHBhdGggZmlsbD0iI0ZGRiIgZD0iTTM1LjUgOTEuMjgzSDc4Yy0yMy41IDAtNDkuNS0yNS42NjctNDkuNS00OC41SDE5YzAgNDAuMTY3IDI3IDQ4LjUgMTYuNSA0OC41ek00OS44MzMgMzYuNUg5MmMwIDQwLjE2Ny0yNiA0OC41LTE2IDQ4LjVINTAuNWMyMy41IDAtNDkuNS0yNS4xNjctNDkuNS00OC41eiIvPjwvZz48L3N2Zz4=',
    description: 'Solflare is a non-custodial wallet for Solana',
    downloadUrl: 'https://solflare.com/download',
  };

  private provider: SolflareProvider | null = null;
  private listenerCleanups: (() => void)[] = [];

  constructor() {
    super();
    this.detectProvider();
  }

  /**
   * Detect if Solflare wallet is installed
   */
  private detectProvider(): void {
    if (typeof window === 'undefined') {
      this.updateReadyState(WalletReadyState.Unsupported);
      return;
    }

    let provider: SolflareProvider | null = null;

    // Check window.solflare first (preferred for newer versions)
    if (window.solflare?.isSolflare) {
      provider = window.solflare;
      console.log('[SolflareAdapter] Detected via window.solflare');
    }
    // Check window.solana.isSolflare (some versions inject here)
    else if (window.solana?.isSolflare) {
      provider = window.solana;
      console.log('[SolflareAdapter] Detected via window.solana.isSolflare');
    }
    // Check if window.solflare exists without isSolflare flag (older versions)
    else if (window.solflare && typeof window.solflare.connect === 'function') {
      provider = window.solflare;
      console.log('[SolflareAdapter] Detected via window.solflare (legacy)');
    }

    if (provider) {
      this.provider = provider;
      this.updateReadyState(WalletReadyState.Installed);
      
      // Check if already connected
      if (provider.publicKey) {
        this._publicKey = new PublicKey(provider.publicKey.toBytes());
        this._connected = true;
        console.log('[SolflareAdapter] Already connected:', this._publicKey.toBase58());
      }
      
      this.setupEventListeners();
    } else {
      console.log('[SolflareAdapter] Not detected - available window properties:', Object.keys(window).filter(k => k.includes('sol')));
      this.updateReadyState(WalletReadyState.NotDetected);
    }
  }

  /**
   * Setup wallet event listeners
   */
  private setupEventListeners(): void {
    if (!this.provider) return;

    const handleConnect = () => {
      if (this.provider?.publicKey) {
        const publicKey = new PublicKey(this.provider.publicKey.toBytes());
        this._publicKey = publicKey;
        this._connected = true;
        this.emit('connect', publicKey);
      }
    };

    const handleDisconnect = () => {
      this._publicKey = null;
      this._connected = false;
      this.emit('disconnect');
    };

    const handleAccountChanged = (publicKey: { toBytes(): Uint8Array } | null) => {
      if (publicKey) {
        const newPublicKey = new PublicKey(publicKey.toBytes());
        this._publicKey = newPublicKey;
        this.emit('accountChanged', newPublicKey);
      } else {
        this._publicKey = null;
        this.emit('accountChanged', null);
      }
    };

    this.provider.on('connect', handleConnect);
    this.provider.on('disconnect', handleDisconnect);
    this.provider.on('accountChanged', handleAccountChanged);

    // Store cleanup functions
    this.listenerCleanups.push(
      () => this.provider?.off('connect', handleConnect),
      () => this.provider?.off('disconnect', handleDisconnect),
      () => this.provider?.off('accountChanged', handleAccountChanged)
    );
  }

  /**
   * Connect to Solflare wallet
   */
  async connect(): Promise<void> {
    if (this._connected || this._connecting) return;

    if (!this.provider) {
      throw new WalletError(
        'Solflare wallet is not installed. Please install it from solflare.com',
        'NOT_INSTALLED'
      );
    }

    try {
      this._connecting = true;
      console.log('[SolflareAdapter] Connecting...');
      const response = await this.provider.connect();
      
      if (response.publicKey) {
        this._publicKey = new PublicKey(response.publicKey.toBytes());
        this._connected = true;
        console.log('[SolflareAdapter] Connected:', this._publicKey.toBase58());
        
        // Emit connect event explicitly
        this.emit('connect', this._publicKey);
      }
    } catch (error: any) {
      console.error('[SolflareAdapter] Connection failed:', error);
      this._connected = false;
      this._publicKey = null;
      
      const walletError = new WalletError(
        error.message || 'Failed to connect to Solflare',
        error.code === 4001 ? 'USER_REJECTED' : 'CONNECTION_FAILED'
      );
      
      this.emit('error', walletError);
      throw walletError;
    } finally {
      this._connecting = false;
    }
  }

  /**
   * Disconnect from Solflare wallet
   */
  async disconnect(): Promise<void> {
    if (!this._connected || !this.provider) return;

    try {
      await this.provider.disconnect();
      this._publicKey = null;
      this._connected = false;
      this.emit('disconnect');
    } catch (error: any) {
      const walletError = new WalletError(
        error.message || 'Failed to disconnect from Solflare',
        'DISCONNECTION_FAILED'
      );
      
      this.emit('error', walletError);
      throw walletError;
    }
  }

  /**
   * Sign a transaction
   */
  async signTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T
  ): Promise<T> {
    if (!this._connected || !this.provider) {
      throw new WalletError('Wallet not connected', 'CONNECTION_FAILED');
    }

    try {
      return await this.provider.signTransaction(transaction);
    } catch (error: any) {
      const walletError = new WalletError(
        error.message || 'Failed to sign transaction',
        error.code === 4001 ? 'USER_REJECTED' : 'SIGNING_FAILED'
      );
      
      this.emit('error', walletError);
      throw walletError;
    }
  }

  /**
   * Sign multiple transactions
   */
  async signAllTransactions<T extends Transaction | VersionedTransaction>(
    transactions: T[]
  ): Promise<T[]> {
    if (!this._connected || !this.provider) {
      throw new WalletError('Wallet not connected', 'CONNECTION_FAILED');
    }

    try {
      return await this.provider.signAllTransactions(transactions);
    } catch (error: any) {
      const walletError = new WalletError(
        error.message || 'Failed to sign transactions',
        error.code === 4001 ? 'USER_REJECTED' : 'SIGNING_FAILED'
      );
      
      this.emit('error', walletError);
      throw walletError;
    }
  }

  /**
   * Sign a message
   */
  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    if (!this._connected || !this.provider) {
      throw new WalletError('Wallet not connected', 'CONNECTION_FAILED');
    }

    try {
      const { signature } = await this.provider.signMessage(message, 'utf8');
      return signature;
    } catch (error: any) {
      const walletError = new WalletError(
        error.message || 'Failed to sign message',
        error.code === 4001 ? 'USER_REJECTED' : 'SIGNING_FAILED'
      );
      
      this.emit('error', walletError);
      throw walletError;
    }
  }

  /**
   * Cleanup event listeners
   */
  destroy(): void {
    this.listenerCleanups.forEach((cleanup) => cleanup());
    this.listenerCleanups = [];
  }
}
