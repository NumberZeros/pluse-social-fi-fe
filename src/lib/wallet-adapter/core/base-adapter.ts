import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import type {
  WalletAdapter,
  WalletAdapterEvents,
  WalletMetadata,
  WalletName,
} from '../types';
import { WalletReadyState } from '../types';

type EventHandler<E extends keyof WalletAdapterEvents> = WalletAdapterEvents[E];

/**
 * Base wallet adapter class that provides common functionality
 * Inspired by RainbowKit's wallet architecture
 */
export abstract class BaseWalletAdapter implements WalletAdapter {
  abstract readonly name: WalletName;
  abstract readonly metadata: WalletMetadata;
  
  protected _publicKey: PublicKey | null = null;
  protected _connected = false;
  protected _connecting = false;
  protected _readyState: WalletReadyState = WalletReadyState.Loading;
  
  private _eventHandlers: Partial<{
    [E in keyof WalletAdapterEvents]: Set<WalletAdapterEvents[E]>;
  }> = {};

  get publicKey(): PublicKey | null {
    return this._publicKey;
  }

  get connected(): boolean {
    return this._connected;
  }

  get connecting(): boolean {
    return this._connecting;
  }

  get readyState(): WalletReadyState {
    return this._readyState;
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
  abstract signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
  abstract signMessage(message: Uint8Array): Promise<Uint8Array>;

  /**
   * Register event listener
   */
  on<E extends keyof WalletAdapterEvents>(
    event: E,
    handler: EventHandler<E>
  ): () => void {
    if (!this._eventHandlers[event]) {
      this._eventHandlers[event] = new Set() as any;
    }
    (this._eventHandlers[event] as Set<EventHandler<E>>).add(handler);

    // Return cleanup function
    return () => {
      (this._eventHandlers[event] as Set<EventHandler<E>>)?.delete(handler);
    };
  }

  /**
   * Emit event to all registered listeners
   */
  protected emit<E extends keyof WalletAdapterEvents>(
    event: E,
    ...args: Parameters<EventHandler<E>>
  ): void {
    const handlers = this._eventHandlers[event];
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          (handler as any)(...args);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      });
    }
  }

  /**
   * Helper to detect if wallet extension is installed
   */
  protected isWalletInstalled(windowProperty: string): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    return windowProperty in window && (window as any)[windowProperty]?.isPhantom !== undefined;
  }

  /**
   * Update ready state and emit change if needed
   */
  protected updateReadyState(state: WalletReadyState): void {
    if (this._readyState !== state) {
      this._readyState = state;
    }
  }
}
