import { useCallback, useMemo } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import type { AnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { toast } from 'react-hot-toast';
import { SocialFiSDK } from '../services/socialfi-sdk';

/**
 * Main hook for interacting with Social-Fi smart contract
 * Provides all contract methods with error handling and notifications
 */
export function useSocialFi() {
  const { publicKey, wallet } = useWallet();
  const { connection } = useConnection();

  // Create SDK instance
  const sdk = useMemo(() => {
    if (!wallet || !publicKey) return null;
    try {
      return new SocialFiSDK(wallet.adapter as unknown as AnchorWallet, connection);
    } catch (error) {
      console.error('Failed to create SDK:', error);
      return null;
    }
  }, [wallet, publicKey, connection]);

  // ==================== PROFILE OPERATIONS ====================

  const createProfile = useCallback(
    async (username: string) => {
      if (!sdk) {
        toast.error('Please connect your wallet');
        return null;
      }

      try {
        toast.loading('Creating profile...', { id: 'create-profile' });
        const result = await sdk.createProfile(username);
        toast.success('Profile created successfully!', { id: 'create-profile' });
        return result;
      } catch (error: any) {
        console.error('Create profile error:', error);
        const message = parseAnchorError(error);
        toast.error(message, { id: 'create-profile' });
        throw error;
      }
    },
    [sdk]
  );

  const getUserProfile = useCallback(
    async (owner?: PublicKey) => {
      if (!sdk) return null;

      try {
        return await sdk.getUserProfile(owner);
      } catch (error: any) {
        console.error('Get profile error:', error);
        return null;
      }
    },
    [sdk]
  );

  const sendTip = useCallback(
    async (recipientPubkey: PublicKey, amount: number) => {
      if (!sdk) {
        toast.error('Please connect your wallet');
        return null;
      }

      try {
        toast.loading(`Sending ${amount} SOL tip...`, { id: 'send-tip' });
        const signature = await sdk.sendTip(recipientPubkey, amount * 1e9);
        toast.success('Tip sent successfully!', { id: 'send-tip' });
        return signature;
      } catch (error: any) {
        console.error('Send tip error:', error);
        const message = parseAnchorError(error);
        toast.error(message, { id: 'send-tip' });
        throw error;
      }
    },
    [sdk]
  );

  // ==================== SHARES OPERATIONS ====================

  const buyShares = useCallback(
    async (creatorPubkey: PublicKey, amount: number, maxPricePerShare: number) => {
      if (!sdk) {
        toast.error('Please connect your wallet');
        return null;
      }

      try {
        toast.loading(`Buying ${amount} shares...`, { id: 'buy-shares' });
        const signature = await sdk.buyShares(creatorPubkey, amount, maxPricePerShare * 1e9);
        toast.success(`Bought ${amount} shares!`, { id: 'buy-shares' });
        return signature;
      } catch (error: any) {
        console.error('Buy shares error:', error);
        const message = parseAnchorError(error);
        toast.error(message, { id: 'buy-shares' });
        throw error;
      }
    },
    [sdk]
  );

  const sellShares = useCallback(
    async (creatorPubkey: PublicKey, amount: number, minPricePerShare: number) => {
      if (!sdk) {
        toast.error('Please connect your wallet');
        return null;
      }

      try {
        toast.loading(`Selling ${amount} shares...`, { id: 'sell-shares' });
        const signature = await sdk.sellShares(creatorPubkey, amount, minPricePerShare * 1e9);
        toast.success(`Sold ${amount} shares!`, { id: 'sell-shares' });
        return signature;
      } catch (error: any) {
        console.error('Sell shares error:', error);
        const message = parseAnchorError(error);
        toast.error(message, { id: 'sell-shares' });
        throw error;
      }
    },
    [sdk]
  );

  const getCreatorShares = useCallback(
    async (creatorPubkey: PublicKey) => {
      if (!sdk) return null;

      try {
        return await sdk.getCreatorShares(creatorPubkey);
      } catch (error: any) {
        console.error('Get shares error:', error);
        return null;
      }
    },
    [sdk]
  );

  const calculateSharePrice = useCallback(
    async (creatorPubkey: PublicKey, amount: number) => {
      if (!sdk) return 0;

      try {
        return await sdk.calculateSharePrice(creatorPubkey, amount);
      } catch (error: any) {
        console.error('Calculate price error:', error);
        return 0;
      }
    },
    [sdk]
  );

  // ==================== ADVANCED FEATURES ====================
  // TODO: Add subscriptions, groups, governance hooks when implementing those features

  // ==================== UTILITIES ====================

  const getBalance = useCallback(
    async (pubkey?: PublicKey) => {
      if (!sdk) return 0;

      try {
        return await sdk.getBalance(pubkey);
      } catch (error: any) {
        console.error('Get balance error:', error);
        return 0;
      }
    },
    [sdk]
  );

  const getPlatformConfig = useCallback(async () => {
    if (!sdk) return null;

    try {
      return await sdk.getPlatformConfig();
    } catch (error: any) {
      console.error('Get platform config error:', error);
      return null;
    }
  }, [sdk]);

  return {
    // SDK instance
    sdk,
    isConnected: !!publicKey,
    publicKey,

    // Profile operations
    createProfile,
    getUserProfile,
    sendTip,

    // Shares operations
    buyShares,
    sellShares,
    getCreatorShares,
    calculateSharePrice,

    // Utilities
    getBalance,
    getPlatformConfig,
  };
}

/**
 * Parse Anchor error messages to user-friendly text
 */
function parseAnchorError(error: any): string {
  if (!error) return 'Unknown error occurred';

  // Anchor error codes
  if (error.error && error.error.errorMessage) {
    return error.error.errorMessage;
  }

  // Transaction errors
  if (error.message) {
    // Insufficient funds
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient SOL balance';
    }

    // User rejected
    if (error.message.includes('User rejected')) {
      return 'Transaction rejected';
    }

    // Slippage exceeded
    if (error.message.includes('SlippageExceeded')) {
      return 'Price changed too much. Try again.';
    }

    // Already exists
    if (error.message.includes('already in use')) {
      return 'Account already exists';
    }

    return error.message;
  }

  return 'Transaction failed. Please try again.';
}

export default useSocialFi;
