import { useCallback, useMemo } from 'react';
import { useWallet, useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { toast } from 'react-hot-toast';
import { SocialFiSDK } from '../services/socialfi-sdk';
import { assertPlatformNotPaused } from '../utils/platformPauseGuard';
import { useRequireWallet } from './useRequireWallet';
import { captureTxError } from '../lib/sentry';
import { trackEvent } from '../lib/analytics';

/**
 * Main hook for interacting with Social-Fi smart contract
 * Provides all contract methods with error handling and notifications
 * Updated to use custom wallet adapter
 */
export function useSocialFi() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const requireWallet = useRequireWallet();

  // Create SDK instance
  const sdk = useMemo(() => {
    if (!anchorWallet || !publicKey) return null;
    try {
      return new SocialFiSDK(anchorWallet, connection);
    } catch (error) {
      console.error('Failed to create SDK:', error);
      return null;
    }
  }, [anchorWallet, publicKey, connection]);

  // ==================== PROFILE OPERATIONS ====================

  const createProfile = useCallback(
    async (username: string) => {
      if (!requireWallet()) return null;
      if (!sdk) return null;

      try {
        await assertPlatformNotPaused(sdk);
        toast.loading('Creating profile...', { id: 'create-profile' });
        const result = await sdk.createProfile(username);
        toast.success('Profile created successfully!', { id: 'create-profile' });
        return result;
      } catch (error: unknown) {
        console.error('Create profile error:', error);
        captureTxError('createProfile', error);
        const message = parseAnchorError(error);
        toast.error(message, { id: 'create-profile' });
        throw error;
      }
    },
    [sdk, requireWallet]
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
      if (!requireWallet()) return null;
      if (!sdk) return null;

      try {
        await assertPlatformNotPaused(sdk);
        toast.loading(`Sending ${amount} SOL tip...`, { id: 'send-tip' });
        const signature = await sdk.sendTip(recipientPubkey, amount * 1e9);
        toast.success('Tip sent successfully!', { id: 'send-tip' });
        return signature;
      } catch (error: unknown) {
        console.error('Send tip error:', error);
        captureTxError('sendTip', error);
        const message = parseAnchorError(error);
        toast.error(message, { id: 'send-tip' });
        throw error;
      }
    },
    [sdk, requireWallet]
  );

  // ==================== SHARES OPERATIONS ====================

  const buyShares = useCallback(
    async (creatorPubkey: PublicKey, amount: number, maxPricePerShare: number) => {
      if (!requireWallet()) return null;
      if (!sdk) return null;

      try {
        await assertPlatformNotPaused(sdk);
        toast.loading(`Supporting with ${amount} Supporter Share${amount > 1 ? 's' : ''}...`, { id: 'buy-shares' });
        const signature = await sdk.buyShares(creatorPubkey, amount, maxPricePerShare * 1e9);
        toast.success(`You're now a supporter!`, { id: 'buy-shares' });
        return signature;
      } catch (error: unknown) {
        console.error('Buy shares error:', error);
        captureTxError('buyShares', error, { creator: creatorPubkey.toBase58(), amount });
        const message = parseAnchorError(error);
        toast.error(message, { id: 'buy-shares' });
        throw error;
      }
    },
    [sdk, requireWallet]
  );

  const sellShares = useCallback(
    async (creatorPubkey: PublicKey, amount: number, minPricePerShare: number) => {
      if (!requireWallet()) return null;
      if (!sdk) return null;

      try {
        await assertPlatformNotPaused(sdk);
        toast.loading(`Cashing out ${amount} Supporter Share${amount > 1 ? 's' : ''}...`, { id: 'sell-shares' });
        const signature = await sdk.sellShares(creatorPubkey, amount, minPricePerShare * 1e9);
        toast.success(`Cashed out support`, { id: 'sell-shares' });
        return signature;
      } catch (error: any) {
        console.error('Sell shares error:', error);
        const message = parseAnchorError(error);
        toast.error(message, { id: 'sell-shares' });
        throw error;
      }
    },
    [sdk, requireWallet]
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

  const initializeCreatorPool = useCallback(async () => {
    if (!requireWallet()) return null;
    if (!sdk) return null;

    try {
      await assertPlatformNotPaused(sdk);
      toast.loading('Launching Supporter Shares...', { id: 'init-pool' });
      const result = await sdk.initializeCreatorPool();
      toast.success('Supporter Shares pool launched!', { id: 'init-pool' });
      trackEvent('pool_launched');
      return result;
    } catch (error: unknown) {
      console.error('Initialize pool error:', error);
      captureTxError('initializeCreatorPool', error);
      const message = parseAnchorError(error);
      toast.error(message, { id: 'init-pool' });
      throw error;
    }
  }, [sdk, requireWallet]);

  const getShareHolding = useCallback(
    async (holderPubkey: PublicKey, creatorPubkey: PublicKey) => {
      if (!sdk) return { amount: 0 };
      try {
        return await sdk.getShareHolding(holderPubkey, creatorPubkey);
      } catch (error: any) {
        console.error('Get share holding error:', error);
        return { amount: 0 };
      }
    },
    [sdk]
  );

  // ==================== ADVANCED FEATURES ====================
  // Post-MVP: subscriptions, groups, governance hooks live in SDK only

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
    isConnected: !!anchorWallet && !!publicKey,
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
    initializeCreatorPool,
    getShareHolding,

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
