import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { BaseWalletAdapter } from '../core/base-adapter';
import type {
  WalletMetadata,
  WalletName,
} from '../types';
import { WalletError, WalletReadyState } from '../types';

/**
 * Phantom wallet type definitions
 */
interface PhantomProvider {
  isPhantom?: boolean;
  publicKey?: { toBytes(): Uint8Array };
  connect(options?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: { toBytes(): Uint8Array } }>;
  disconnect(): Promise<void>;
  signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
  signMessage(message: Uint8Array, display?: 'utf8' | 'hex'): Promise<{ signature: Uint8Array }>;
  on(event: string, handler: (...args: any[]) => void): void;
  off(event: string, handler: (...args: any[]) => void): void;
}

interface PhantomWindow extends Window {
  phantom?: {
    solana?: PhantomProvider;
  };
  solana?: PhantomProvider & {
    isPhantom?: boolean;
  };
}

declare const window: PhantomWindow;

/**
 * Phantom Wallet Adapter
 * Direct integration with Phantom wallet extension
 */
export class PhantomWalletAdapter extends BaseWalletAdapter {
  readonly name: WalletName = 'Phantom';
  readonly metadata: WalletMetadata = {
    name: 'Phantom',
    url: 'https://phantom.app',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjggMTI4Ij48cGF0aCBmaWxsPSIjNTM0YmIxIiBkPSJNMCAwaDEyOHYxMjhIMHoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMzcuNDYzIDQ1LjAzNmM1Ljg1My4wNjUgMTEuNzU1IDMuNTM4IDE0Ljk4MyA4Ljk2OGMuODk0IDEuNSAxLjg1MyAzLjIzMyAyLjg5MyA1LjA1NSAzLjIzIDUuNjAyIDYuNjEgMTEuNDYzIDEwLjMyMyAxNS4yNzggMS42NjcgMS43MTggMy44OTQgMy40OTEgNy43MjQgMy4xNDIgMy42MzMtLjMzIDYuMjc1LTMuMjM1IDcuNTk0LTYuMzU3IDEuNTg3LTMuNzU0IDEuNjQzLTcuNjkuMTMtMTEuMDQ0LTIuMDYyLTQuNTY2LTUuOTU1LTcuNTAyLTEwLjc2OC04LjIyOC01LjIzLS43OTItMTAuNzQ2LjY1NS0xNS42MjMgMy4xMTgtNi40ODIgMy4yNzUtMTIuNzcyIDMuNTUtMTguODk3IDMuNTE4LTEyLjgzNS0uMDY1LTI1LjgxLTUuMjktMzUuMTE2LTE0LjI0QzE0LjQ5IDI4LjUwNiAxMi43MiAxMS4yNS41NzcgMjguNTA2aC4wMDFIMzcuNDYzeiIvPjwvc3ZnPg==',
    description: 'A friendly crypto wallet for DeFi & NFTs',
    downloadUrl: 'https://phantom.app/download',
  };

  private provider: PhantomProvider | null = null;
  private listenerCleanups: (() => void)[] = [];

  constructor() {
    super();
    this.detectProvider();
  }

  /**
   * Detect if Phantom wallet is installed
   */
  private detectProvider(): void {
    if (typeof window === 'undefined') {
      this.updateReadyState(WalletReadyState.Unsupported);
      return;
    }

    let provider: PhantomProvider | null = null;

    // Check window.phantom.solana first (preferred)
    if (window.phantom?.solana?.isPhantom) {
      provider = window.phantom.solana;
    }
    // Fallback to window.solana if it's Phantom
    else if (window.solana?.isPhantom) {
      provider = window.solana;
    }

    if (provider) {
      this.provider = provider;
      this.updateReadyState(WalletReadyState.Installed);
      this.setupEventListeners();
    } else {
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
   * Connect to Phantom wallet
   */
  async connect(): Promise<void> {
    if (this._connected || this._connecting) return;

    if (!this.provider) {
      throw new WalletError(
        'Phantom wallet is not installed. Please install it from phantom.app',
        'NOT_INSTALLED'
      );
    }

    try {
      this._connecting = true;
      console.log('[PhantomAdapter] Connecting...');
      const response = await this.provider.connect();
      
      if (response.publicKey) {
        this._publicKey = new PublicKey(response.publicKey.toBytes());
        this._connected = true;
        console.log('[PhantomAdapter] Connected:', this._publicKey.toBase58());
        
        // Emit connect event explicitly
        this.emit('connect', this._publicKey);
      }
    } catch (error: any) {
      console.error('[PhantomAdapter] Connection failed:', error);
      this._connected = false;
      this._publicKey = null;
      
      const walletError = new WalletError(
        error.message || 'Failed to connect to Phantom',
        error.code === 4001 ? 'USER_REJECTED' : 'CONNECTION_FAILED'
      );
      
      this.emit('error', walletError);
      throw walletError;
    } finally {
      this._connecting = false;
    }
  }

  /**
   * Disconnect from Phantom wallet
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
        error.message || 'Failed to disconnect from Phantom',
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
