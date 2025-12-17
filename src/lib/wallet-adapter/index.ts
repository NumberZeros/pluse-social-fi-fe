/**
 * Custom Solana Wallet Adapter
 * Inspired by RainbowKit's architecture for Ethereum
 * 
 * This is a clean, lightweight wallet adapter that replaces @solana/wallet-adapter
 * with better UI/UX and simpler architecture.
 */

// Core types and interfaces
export * from './types';

// Wallet adapters
export * from './adapters';

// React provider
export { WalletProvider } from './provider';

// Hooks
export { useWallet, useConnection, useAnchorWallet } from './hooks';

// UI components
export * from './components';

// Storage utilities
export { WalletStorage } from './core/storage';
