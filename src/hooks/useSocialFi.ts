import { useCallback, useMemo } from 'react';
import { useWallet, useConnection, useAnchorWallet } from '../lib/wallet-adapter';
import { PublicKey } from '@solana/web3.js';
import { toast } from 'react-hot-toast';
import { SocialFiSDK } from '../services/socialfi-sdk';

/**
 * Main hook for interacting with Social-Fi smart contract
 * Provides all contract methods with error handling and notifications
 * Updated to use custom wallet adapter
 */
export function useSocialFi() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

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

  // ==================== MARKETPLACE (Username NFT) ====================

  const mintUsername = useCallback(
    async (username: string, metadataUri: string) => {
      if (!sdk) {
        toast.error('Please connect your wallet');
        return null;
      }

      try {
        toast.loading('⚙️ Minting username NFT...', { id: 'mint-username' });
        const result = await sdk.mintUsername(username, metadataUri);
        
        toast.loading('🏛️ Setting collection...', { id: 'mint-username' });
        const collectionSig = await sdk.setCollectionForUsername(
          result.nft,
          result.mint
        );

        toast.success('🎉 Username NFT minted! Check Magic Eden in 5-10 min', {
          id: 'mint-username',
          duration: 5000,
        });

        return {
          nft: result.nft,
          mint: result.mint,
          signature: result.signature,
          collectionSignature: collectionSig,
        };
      } catch (error: any) {
        console.error('Mint username error:', error);
        const message = parseAnchorError(error);
        toast.error(message, { id: 'mint-username' });
        throw error;
      }
    },
    [sdk]
  );

  const setCollectionForUsername = useCallback(
    async (usernameNft: PublicKey, mint: PublicKey) => {
      if (!sdk) {
        toast.error('Please connect your wallet');
        return null;
      }

      try {
        return await sdk.setCollectionForUsername(usernameNft, mint);
      } catch (error: any) {
        console.error('Set collection error:', error);
        const message = parseAnchorError(error);
        toast.error(message, { id: 'set-collection' });
        throw error;
      }
    },
    [sdk]
  );

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

    // Marketplace operations (NEW)
    mintUsername,
    setCollectionForUsername,

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
