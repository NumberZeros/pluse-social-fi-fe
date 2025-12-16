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
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiByeD0iNTEyIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMTRfNSkiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik00MjAuNzU2IDcwMS43NzVDNDUyLjM1NCA3MzMuMzczIDQ4NS41OTQgNzYwLjc3NSA1MTguNTE4IDc3Ni44NTlDNTczLjg3OCA4MDQuNTcxIDYzNC43MjYgNzkzLjMzMiA2NzQuNDU5IDc1My42QzcxNC4xOTEgNzEzLjg2NyA3MjUuNDMxIDY1My4wMTkgNjk3LjcxOSA1OTcuNjU5QzY4MS42MzUgNTY0LjczNSA2NTQuMjMzIDUzMS40OTUgNjIyLjYzNSA0OTkuODk3QzU5MS4wMzcgNDY4LjI5OSA1NTcuNzk3IDQ0MC44OTcgNTI0Ljg3MyA0MjQuODEzQzQ2OS41MTMgMzk3LjEwMSA0MDguNjY1IDQwOC4zNCA0MDguNjY1IDQwOC4zNEMzNjguOTMyIDQwOC4zNCAzNTcuNjkzIDQ2OS4xODggMzg1LjQwNSA1MjQuNTQ4QzQwMS40ODkgNTU3LjQ3MiA0MjguODkxIDU5MC43MTIgNDYwLjQ4OSA2MjIuMzFDNDA0LjE4MSA2MjIuMzEgMzQ3Ljg3NCA2MjIuMzEgMjkxLjU2NiA2MjIuMzFDMjM1LjI1OSA2MjIuMzEgMTc4Ljk1MSA2MjIuMzEgMTIyLjY0NCA2MjIuMzFDMTYwLjM2NyA2NTkuNzQxIDIxMC40MTYgNjkxLjI5OCAyNjYuNzI0IDcwNC4zNzRDMzE1LjIxMiA3MTYuMTM1IDM2Ni40OTUgNzEyLjc1MiA0MTUuMDgxIDcwMS43NzVIMjkxLjU2NkgyOTEuMjczTDI5MS41NjYgNzAxLjc3NUM0MjAuNzU2IDcwMS43NzUgNDIwLjc1NiA3MDEuNzc1IDQyMC43NTYgNzAxLjc3NVoiIGZpbGw9InVybCgjcGFpbnQxX2xpbmVhcl8xNF81KSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyXzE0XzUiIHgxPSI1MTIiIHkxPSIwIiB4Mj0iNTEyIiB5Mj0iMTAyNCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjRkM2NTJEIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0ZFREUzRiIvPgo8L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MV9saW5lYXJfMTRfNSIgeDE9IjQwOC42NjUiIHkxPSI0MDguMzQiIHgyPSI2OTcuNzE5IiB5Mj0iNzc2Ljg1OSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSJ3aGl0ZSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IndoaXRlIiBzdG9wLW9wYWNpdHk9IjAuNiIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPgo=',
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

    if (window.solflare?.isSolflare) {
      this.provider = window.solflare;
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
      const response = await this.provider.connect();
      
      if (response.publicKey) {
        this._publicKey = new PublicKey(response.publicKey.toBytes());
        this._connected = true;
        this.emit('connect', this._publicKey);
      }
    } catch (error: any) {
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
