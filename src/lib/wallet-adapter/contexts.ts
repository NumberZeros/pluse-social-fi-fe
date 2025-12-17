import { createContext } from 'react';
import { Connection } from '@solana/web3.js';
import type { WalletState } from './types';

/**
 * Wallet Context - inspired by RainbowKit architecture
 * Separated from provider for Fast Refresh compatibility
 */
export const WalletContext = createContext<WalletState | null>(null);

/**
 * Connection Context - provides Solana RPC connection
 */
export const ConnectionContext = createContext<Connection | null>(null);
