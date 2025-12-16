import type { WalletName } from '../types';

/**
 * Local storage utilities for persisting wallet selection
 * Similar to RainbowKit's wallet persistence
 */

const DEFAULT_STORAGE_KEY = 'solana-wallet-adapter';

export class WalletStorage {
  private key: string;

  constructor(key: string = DEFAULT_STORAGE_KEY) {
    this.key = key;
  }

  /**
   * Get the last selected wallet from localStorage
   */
  getSelectedWallet(): WalletName | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const stored = localStorage.getItem(this.key);
      if (stored) {
        const data = JSON.parse(stored);
        return data.walletName as WalletName;
      }
    } catch (error) {
      console.warn('Failed to read wallet from localStorage:', error);
    }

    return null;
  }

  /**
   * Save the selected wallet to localStorage
   */
  setSelectedWallet(walletName: WalletName): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(
        this.key,
        JSON.stringify({
          walletName,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.warn('Failed to save wallet to localStorage:', error);
    }
  }

  /**
   * Clear the selected wallet from localStorage
   */
  clearSelectedWallet(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(this.key);
    } catch (error) {
      console.warn('Failed to clear wallet from localStorage:', error);
    }
  }

  /**
   * Check if auto-connect should be attempted
   */
  shouldAutoConnect(): boolean {
    return this.getSelectedWallet() !== null;
  }
}
