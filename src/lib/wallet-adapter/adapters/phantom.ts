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
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA4IiBoZWlnaHQ9IjEwOCIgdmlld0JveD0iMCAwIDEwOCAxMDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF8xNjJfMTY4OSkiPgo8cmVjdCB3aWR0aD0iMTA4IiBoZWlnaHQ9IjEwOCIgcng9IjI2IiBmaWxsPSIjQUI5RkY2Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjYgMTA4QzI2LjgzMzQgMTA4IDI3LjY2MzQgMTA3Ljk3NyAyOC40ODg2IDEwNy45M0MyOS4xMDMgMTA3Ljg5NCAyOS43MTI4IDEwNy44MzcgMzAuMzE3MSAxMDcuNzU5QzMxLjk4MTkgMTA3LjU5IDMzLjYyMDUgMTA3LjI5MSAzNS4yMjI2IDEwNi44NjhDMzUuODc4MyAxMDYuNjk4IDM2LjUyNzggMTA2LjUwOSAzNy4xNzA3IDEwNi4zMDFDMzcuODI0NSAxMDYuMDkgMzguNDcxOSAxMDUuODU4IDM5LjExMjYgMTA1LjYwNkMzOS43NDgyIDEwNS4zNTYgNDAuMzc3MSAxMDUuMDg2IDQwLjk5ODcgMTA0Ljc5OEM0MS4zMTQzIDEwNC42NTMgNDEuNjI2OCAxMDQuNTAyIDQxLjkzNiAxMDQuMzQ2QzQyLjI0OTggMTA0LjE4OCA0Mi41NjAzIDEwNC4wMjQgNDIuODY3NCAxMDMuODU0QzQ0LjY1NDEgMTAyLjg2MSA0Ni4zMzA5IDEwMS43MTkgNDcuODg2NSAxMDAuNDRDNDkuNDIzNyA5OS4xNzg2IDUwLjgzNTggOTcuNzgyIDUyLjEwNjQgOTYuMjY3N0M1Mi4xODY4IDk2LjE2OCA1Mi4yNjY2IDk2LjA2OCA1Mi4zNDU5IDk1Ljk2NzVDNTIuNzA0MyA5NS41MTQ4IDUzLjA1MjIgOTUuMDUyNyA1My4zODk4IDk0LjU4MTdDNTQuMDQwNCA5My42NzY1IDU0LjY0MjEgOTIuNzM4NSA1NS4xOTM4IDkxLjc2OThDNTUuNDM1MyA5MS4zMzcyIDU1LjY2NTcgOTAuODk4NyA1NS44ODQ4IDkwLjQ1NDRDNTYuMzE3IDg5LjU1NzcgNTYuNjk0MSA4OC42NDA0IDU3LjAxNDUgODcuNzA1QzU3LjE3IDg3LjI0ODQgNTcuMzEyMyA4Ni43ODc4IDU3LjQ0MTEgODYuMzIzNEM1Ny43MTM5IDg1LjMzODYgNTcuOTE4IDg0LjMzNzcgNTguMDUxNCA4My4zMjMxQzU4LjEzMzcgODIuNzQzNyA1OC4xOTE4IDgyLjE2MjQgNTguMjI1OCA4MS41Nzg1QzU4LjI1NjggODEuMDg2OSA1OC4yNzI1IDgwLjU5MzkgNTguMjcyNSA4MC4xQzU4LjI3MjUgNzkuNzQzOCA1OC4yNjQ2IDc5LjM4ODEgNTguMjQ4OSA3OS4wMzI5QzU4LjI0MzkgNzguODY3MiA1OC4yMzU1IDc4LjcwMTYgNTguMjI0MSA3OC41MzYxQzU4LjE0ODEgNzcuMjQ1IDU3Ljk3MzMgNzUuOTY5IDU3LjcwMjYgNzQuNzE2MkM1Ny41NjMzIDc0LjA1OTIgNTcuNDAzNCA3My40MDc3IDU3LjIyMyA3Mi43NjIzQzU3LjA0MjcgNzIuMTE2OSA1Ni44NDI0IDcxLjQ3ODEgNTYuNjIyNyA3MC44NDY3QzU2LjA1NTMgNjkuMjM3IDU1LjM2MDIgNjcuNjc4IDU0LjU0NzIgNjYuMTgxMkM1My43MjYzIDY0LjY3MSA1Mi43ODM2IDYzLjIyOTEgNTEuNzI1MyA2MS44NzFDNTAuNjQxMSA2MC40ODA1IDQ5LjQyMDcgNTkuMTg5NCA0OC4wNzg0IDU4LjAxMTZDNDcuNzU3NCA1Ny43MzUyIDQ3LjQzMDcgNTcuNDY1NCA0Ny4wOTg0IDU3LjIwMjJDNDYuNzY2MiA1Ni45MzY4IDQ2LjQyODUgNTYuNjc3OSA0Ni4wODU0IDU2LjQyNTZDNDUuMzk1OCA1NS45MTkyIDQ0LjY4MTcgNTUuNDQ3NCA0My45NDYzIDU1LjAxMjlDNDMuNjY3NiA1NC44NTk3IDQzLjM4NDkgNTQuNzEwOSA0My4wOTgyIDU0LjU2NjNDNDIuODExNiA1NC40MjE1IDQyLjUyMTEgNTQuMjgwNyA0Mi4yMjY4IDU0LjE0NDdDNDEuNjM1IDUzLjg3MTUgNDEuMDI4NyA1My42MjI3IDQwLjQwOTcgNTMuMzk5NEMzOS43OTQzIDUzLjE3NyAzOS4xNjg2IDUyLjk3OTcgMzguNTM0MyA1Mi44MDgxQzM3Ljg5NTEgNTIuNjM0NiAzNy4yNDc0IDUyLjQ4NTIgMzYuNTkyOSA1Mi4zNjEzQzM1LjkzNTMgNTIuMjM2NSAzNS4yNzIxIDUyLjEzNTkgMzQuNjA0NCA1Mi4wNTkxQzMzLjI4MDQgNTEuOTA4NSAzMS45MzM1IDUxLjg1NzYgMzAuNTgyNSA1MS45MDdDMjguNDkyNCA1MS45ODc4IDI2LjQyNTQgNTIuMjkyOCAyNC40MjI0IDUyLjgxNDRDMjMuNDM1MyA1My4wNzIyIDIyLjQ2MzEgNTMuMzg3OCAyMS41MTA0IDUzLjc2MDRDMjAuODUzNiA1NC4wMDMxIDIwLjIwNzMgNTQuMjYxMiAxOS41NzI3IDU0LjU0MzhDMTkuMjY2IDU0LjY4MTkgMTguOTYyNiA1NC44MjQ5IDE4LjY2MjYgNTQuOTcyMkMxOC41MTQ0IDU1LjA0NTIgMTguMzY2OSA1NS4xMTk0IDE4LjIyMDEgNTUuMTk0OEwxNy42NzQ3IDU1LjQ5NjdDMTcuMzg2MyA1NS42NTQ4IDE3LjEwMTEgNTUuODE3NiAxNi44MTkxIDU1Ljk4NUMxNS45MTgyIDU2LjUzMSAxNS4wNDkzIDU3LjEyMDMgMTQuMjE2MyA1Ny43NTE4QzEzLjM4MTQgNTguMzg0NyAxMi41ODQ3IDU5LjA2MSAxMS44MzAzIDU5Ljc3OEMxMS4wNzMgNjAuNDk3NyAxMC4zNTg3IDYxLjI2MDEgOS42OTI5MSA2Mi4wNjI3QzkuMzc0OTYgNjIuNDQwMiA5LjA2NzI3IDYyLjgyNTkgOC43NzAxIDYzLjIxOTZDNy44MTI4MyA2NC40NTE4IDYuOTY2MzQgNjUuNzY4NSA2LjI0MDU4IDY3LjE1NjFDNS41MTU5NCA2OC41NDIxIDQuOTE0MTUgNzAuMDAwNCA0LjQ0ODczIDcxLjUxMzRDNC4wMTU5OSA3Mi45MjgyIDMuNzI1MTEgNzQuMzg0MiAzLjU4MDk4IDc1Ljg2MjZDMy40NDY1OCA3Ny4yNDMgMy40NjQ3MyA3OC42MzcxIDMuNjM1MzIgODAuMDEzMkMzLjc5NDY1IDgxLjMyNDEgNC4wOTcyOSA4Mi42MTQ2IDQuNTM4MTIgODMuODY2OUM0Ljk0NDExIDg1LjAzODQgNS40NzQ5NSA4Ni4xNjE2IDYuMTIyMzEgODcuMjIyOEM2LjQzNzAxIDg3Ljc0MjQgNi43NzM2MSA4OC4yNDk2IDcuMTMxMTUgODguNzQyNkM3LjMxNDY1IDg4Ljk5NTggNy41MDMxNyA4OS4yNDUyIDcuNjk2NjQgODkuNDkwOEw4LjgwMDA5IDkwLjgyNTZDOS40MzExNyA5MS41OTQyIDEwLjA5NjEgOTIuMzI3OCAxMC43OTIzIDkzLjAyMzhDMTEuNDgzNCA5My43MTU5IDEyLjIwNDIgOTQuMzcyIDEyLjk1MzQgOTQuOTkyMkMxMy43MDA0IDk1LjYxMDYgMTQuNDc1IDk2LjE5MTQgMTUuMjc1IDk2LjczMjdDMTUuNjY2MyA5Ni45OTQ5IDE2LjA2MzYgOTcuMjQ4NSAxNi40NjYzIDk3LjQ5MzRDMTYuNjQ3NiA5Ny42MDY2IDE2LjgzMDYgOTcuNzE3NiAxNy4wMTUyIDk3LjgyNjJDMTcuMTkzMSA5Ny45MzE5IDE3LjM3MjYgOTguMDM1NiAxNy41NTM2IDk4LjEzNzNDMjAuODk1OSA5OS45OTExIDI0LjczOSAxMDEuMTA4IDI4LjcwOTcgMTAxLjM5NUMyOS4xMDIyIDEwMS40MTQgMjkuNDk1NyAxMDEuNDI2IDI5Ljg4OTkgMTAxLjQzMkMzMS43MzU4IDEwMS40NTggMzMuNTc5IDEwMS4yNDggMzUuMzY2NSAxMDAuODA1QzM1LjUyNDkgMTAwLjc2NiAzNS42ODI2IDEwMC43MjUgMzUuODM5NyAxMDAuNjg0QzM2LjY1NDggMTAwLjQ1NiAzNy40NjEgMTAwLjE5NCAzOC4yNTUxIDk5Ljg5NzlDMzguNzM0IDk5LjcwOTEgMzkuMjA2NSA5OS41MDk2IDM5LjY3MjQgOTkuMjk5OUM0MC4xMzUzIDk5LjA5MTkgNDAuNTkyMyA5OC44NzI2IDQxLjA0MzMgOTguNjQyNEM0MS45NDkxIDk4LjE3ODEgNDIuODMwOCA5Ny42NzIzIDQzLjY4NjIgOTcuMTI2OEM0NC4xMDUgOTYuODU4OCA0NC41MTc5IDk2LjU4MTggNDQuOTI0OCA5Ni4yOTYxQzQ1LjMzMTcgOTYuMDEwNCA0NS43MzI3IDk1LjcxNTUgNDYuMTI4IDk1LjQxMTdDNDcuMzE0NyA5NC41MzY4IDQ4LjQzNjQgOTMuNTkwOCA0OS40ODY3IDkyLjU3ODdDNTAuMDk4MyA5MS45OTk1IDUwLjY4NDggOTEuMzk4MyA1MS4yNDU1IDkwLjc3NjZDNTIuMzI3NSA4OS41Njk4IDUzLjMzNTggODguMjk1NiA1NC4yNjQ5IDg2Ljk2MDdDNTQuNzMwMSA4Ni4yOTI2IDU1LjE3NSA4NS42MTA0IDU1LjU5ODggODQuOTE1MUM1Ni4wMjI5IDg0LjIyMDMgNTYuNDI1NyA4My41MTI5IDU2LjgwNzEgODIuNzk0Qzk3Ljg3NCAxMDQuMTQ1IDEyNC45NjIgOTQuNzk5MyAxMDcuNTU5IDUzLjVWNjBDMTA3LjU1OSA4NS4xMjkyIDg3LjQzNzcgMTA1LjI1MSA2Mi4zMDg1IDEwNS4yNTFDNDcuNTg4OSAxMDUuMjUxIDMzLjc5MjYgMTEwLjQ4OCAyNiAxMDhWMTA4WiIgZmlsbD0idXJsKCNwYWludDBfcmFkaWFsXzE2Ml8xNjg5KSIvPgo8cGF0aCBkPSJNNDMuNzY1NCA1NS4xNjE4QzQzLjc2NTQgNTcuMzY0NCA0Mi4wMTQyIDU5LjE0MTQgNDAuODEyMyA1OS4xNDE0QzM5LjU4NTYgNTkuMTQxNCAzOC44OTA4IDU3LjM2NDQgMzguODkwOCA1NS4xNjE4QzM4Ljg5MDggNTIuOTU5MiA0MC4wMTUyIDUxLjE4MjIgNDEuMjQxOSA1MS4xODIyQzQyLjQ0MzggNTEuMTgyMiA0My43NjU0IDUyLjk1OTIgNDMuNzY1NCA1NS4xNjE4WiIgZmlsbD0iIzJBMUIyRCIvPgo8cGF0aCBkPSJNNTguODA5MyA1NS4xNjE4QzU4LjgwOTMgNTcuMzY0NCA1Ny4wNTgxIDU5LjE0MTQgNTUuODU2MiA1OS4xNDE0QzU0LjYyOTUgNTkuMTQxNCA1My45MzQ3IDU3LjM2NDQgNTMuOTM0NyA1NS4xNjE4QzUzLjkzNDcgNTIuOTU5MiA1NS4wNTkxIDUxLjE4MjIgNTYuMjg1OCA1MS4xODIyQzU3LjQ4NzcgNTEuMTgyMiA1OC44MDkzIDUyLjk1OTIgNTguODA5MyA1NS4xNjE4WiIgZmlsbD0iIzJBMUIyRCIvPgo8L2c+CjxkZWZzPgo8cmFkaWFsR3JhZGllbnQgaWQ9InBhaW50MF9yYWRpYWxfMTYyXzE2ODkiIGN4PSIwIiBjeT0iMCIgcj0iMSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJ0cmFuc2xhdGUoNjEuMTA0IDI4LjQ4MDMpIHJvdGF0ZSgxMjguNTc0KSBzY2FsZSgxMDEuNzQxIDEwNi4zOTYpIj4KPHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjNTM0QkIxIi8+CjxzdG9wIG9mZnNldD0iMC42MDcxNTkiIHN0b3AtY29sb3I9IiM1NTFCRjkiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRDcwMEZGIi8+CjwvcmFkaWFsR3JhZGllbnQ+CjxjbGlwUGF0aCBpZD0iY2xpcDBfMTYyXzE2ODkiPgo8cmVjdCB3aWR0aD0iMTA4IiBoZWlnaHQ9IjEwOCIgZmlsbD0id2hpdGUiLz4KPC9jbGlwUGF0aD4KPC9kZWZzPgo8L3N2Zz4K',
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
