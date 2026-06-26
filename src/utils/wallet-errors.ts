import {
  WalletError,
  WalletNotReadyError,
  WalletConnectionError,
  WalletDisconnectedError,
} from '@solana/wallet-adapter-base';

/** Tracks whether the current connection attempt was user-initiated (modal / CTA). */
export const userInitiatedConnectRef = { current: false };

/** True while autoConnect is still in its initial attempt window. */
export const isAutoConnectingRef = { current: true };

export function markUserInitiatedConnect(): void {
  userInitiatedConnectRef.current = true;
}

export function markAutoConnectComplete(): void {
  isAutoConnectingRef.current = false;
}

export function walletErrorMessage(error: WalletError): string {
  if (error instanceof WalletNotReadyError) {
    return 'Wallet not ready. Install the extension or try another wallet.';
  }
  if (error instanceof WalletConnectionError) {
    return 'Connection failed. Check your wallet and try again.';
  }
  if (error instanceof WalletDisconnectedError) {
    return 'Wallet disconnected.';
  }
  return error.message || 'Wallet error';
}

export function shouldShowWalletError(error: WalletError): boolean {
  if (error instanceof WalletNotReadyError) {
    return false;
  }
  if (error instanceof WalletDisconnectedError) {
    return false;
  }
  if (error instanceof WalletConnectionError) {
    if (isAutoConnectingRef.current && !userInitiatedConnectRef.current) {
      return false;
    }
  }
  return true;
}

export function handleWalletError(error: WalletError): void {
  console.error('Wallet connection error:', error);
  if (!shouldShowWalletError(error)) {
    return;
  }
  userInitiatedConnectRef.current = false;
}
