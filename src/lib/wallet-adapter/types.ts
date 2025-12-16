import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import type { SendOptions } from '@solana/web3.js';

/**
 * Wallet adapter inspired by RainbowKit architecture
 * Core types and interfaces for Solana wallet integration
 */

export type WalletName = 'Phantom' | 'Solflare';

export interface WalletMetadata {
  name: WalletName;
  url: string;
  icon: string;
  description: string;
  downloadUrl: string;
}

export interface WalletAccount {
  publicKey: PublicKey;
  address: string;
}

export interface WalletAdapterEvents {
  connect: (publicKey: PublicKey) => void;
  disconnect: () => void;
  accountChanged: (publicKey: PublicKey | null) => void;
  error: (error: WalletError) => void;
}

export type WalletErrorCode =
  | 'USER_REJECTED'
  | 'NOT_INSTALLED'
  | 'CONNECTION_FAILED'
  | 'DISCONNECTION_FAILED'
  | 'TRANSACTION_FAILED'
  | 'SIGNING_FAILED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export class WalletError extends Error {
  code: WalletErrorCode;
  
  constructor(message: string, code: WalletErrorCode) {
    super(message);
    this.name = 'WalletError';
    this.code = code;
  }
}

/**
 * Base wallet adapter interface - all wallet implementations must conform to this
 */
export interface WalletAdapter {
  readonly name: WalletName;
  readonly metadata: WalletMetadata;
  readonly publicKey: PublicKey | null;
  readonly connected: boolean;
  readonly connecting: boolean;
  readonly readyState: WalletReadyState;

  connect(): Promise<void>;
  disconnect(): Promise<void>;
  signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
  signMessage(message: Uint8Array): Promise<Uint8Array>;
  
  // Event listeners
  on<E extends keyof WalletAdapterEvents>(
    event: E,
    handler: WalletAdapterEvents[E]
  ): () => void;
}

/**
 * Wallet ready state - similar to RainbowKit's wallet status
 */
export const WalletReadyState = {
  /**
   * Wallet is installed and ready to use
   */
  Installed: 'Installed',
  
  /**
   * Wallet is not installed
   */
  NotDetected: 'NotDetected',
  
  /**
   * Wallet detection is still loading
   */
  Loading: 'Loading',
  
  /**
   * Wallet is not supported on this browser
   */
  Unsupported: 'Unsupported',
} as const;

export type WalletReadyState = typeof WalletReadyState[keyof typeof WalletReadyState];

/**
 * Anchor-compatible wallet interface
 * This ensures compatibility with Coral's Anchor framework
 */
export interface AnchorWallet {
  publicKey: PublicKey;
  signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]>;
}

/**
 * Wallet connection state
 */
export interface WalletState {
  wallet: WalletAdapter | null;
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  select: (walletName: WalletName) => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: <T extends Transaction | VersionedTransaction>(transaction: T) => Promise<T>;
  signAllTransactions: <T extends Transaction | VersionedTransaction>(transactions: T[]) => Promise<T[]>;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  sendTransaction: (
    transaction: Transaction | VersionedTransaction,
    options?: SendOptions
  ) => Promise<string>;
}

/**
 * Wallet config for provider
 */
export interface WalletConfig {
  autoConnect?: boolean;
  onError?: (error: WalletError) => void;
  localStorageKey?: string;
}
