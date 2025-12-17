import { motion } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useWallet } from '../../lib/wallet-adapter';
import { useSocialFi } from '../../hooks/useSocialFi';
import { useUIStore } from '../../stores/useUIStore';
import { useUserStore } from '../../stores/useUserStore';
import { useAirdropStore } from '../../stores/useAirdropStore';
import { IconIdentity } from '../../components/icons/PulseIcons';

export function MintUsernameModal() {
  const { connected, publicKey, wallet } = useWallet();
  const { mintUsername, sdk } = useSocialFi();
  const {
    mintUsernameModal,
    closeMintUsernameModal,
    isProcessing,
    setProcessing,
  } = useUIStore();
  const setUserUsername = useUserStore((state) => state.setUsername);
  const updateAirdropProgress = useAirdropStore((state) => state.updateProgress);
  const markDayActive = useUserStore((state) => state.markDayActive);
  const [username, setUsername] = useState('');

  const handleMintUsername = async () => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!username || username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }
    if (username.length > 20) {
      toast.error('Username must be 20 characters or less');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error('Username can only contain letters, numbers and underscore');
      return;
    }

    setProcessing(true);
    try {
      // ========== STEP 0: Check username availability ==========
      if (!sdk) {
        toast.error('Wallet not ready. Please reconnect.', { id: 'mint-process' });
        setProcessing(false);
        return;
      }
      
      toast.loading('🔍 Checking username availability...', { id: 'mint-process' });
      
      const isAvailable = await sdk.isUsernameAvailable(username);
      
      if (!isAvailable) {
        toast.error(`❌ Username "@${username}" is already taken. Try another one!`, { 
          id: 'mint-process',
          duration: 4000 
        });
        setProcessing(false);
        return;
      }

      toast.success('✅ Username available!', { id: 'mint-process', duration: 1000 });
      await new Promise(resolve => setTimeout(resolve, 500));

      // ========== STEP 1: Upload metadata to IPFS ==========
      if (!wallet) {
        toast.error('Wallet not ready. Please reconnect.', { id: 'mint-process' });
        setProcessing(false);
        return;
      }
      
      toast.loading('📤 Uploading metadata to IPFS...', { id: 'mint-process' });
      
      const { getMetadataService } = await import(
        '../../services/metadata-upload'
      );
      const uploadService = getMetadataService(wallet);

      const metadataUri = await uploadService.uploadUsernameMetadata({
        username,
        category: 'custom',
        mintedAt: Math.floor(Date.now() / 1000),
        owner: publicKey!.toString(),
      });

      console.log('✅ Metadata uploaded:', metadataUri);
      console.log('🔍 Username to mint:', username, '(length:', username.length, ')');
      console.log('🔍 Metadata URI length:', metadataUri.length, 'chars');

      // ========== STEP 2: Mint NFT on-chain ==========
      const result = await mintUsername(username, metadataUri);

      if (!result) {
        toast.error('Failed to mint NFT', { id: 'mint-process' });
        setProcessing(false);
        return;
      }

      console.log('✅ NFT minted:', result.signature);
      console.log('✅ NFT address:', result.mint.toString());
      console.log('✅ Collection set:', result.collectionSignature);

      // ========== STEP 3: Update UI & stores ==========
      setUserUsername(username);
      updateAirdropProgress('username', 1);
      markDayActive();
      closeMintUsernameModal();
      setUsername('');

      toast.success(
        '🎉 Username minted! It will appear on Magic Eden in 5-10 minutes.',
        {
          id: 'mint-process',
          duration: 5000,
        }
      );
    } catch (error: any) {
      console.error('Mint failed:', error);
      
      // Log transaction logs if available
      if (error?.transactionLogs) {
        console.group('📋 Transaction Logs:');
        error.transactionLogs.forEach((log: string, index: number) => {
          console.log(`${index}: ${log}`);
        });
        console.groupEnd();
      }
      
      // Parse program error if available
      if (error?.programErrorStack) {
        console.error('🔴 Program Error Stack:', error.programErrorStack);
      }
      
      // Parse error message
      let errorMessage = 'Failed to mint username';
      
      if (error?.transactionLogs) {
        const logs = error.transactionLogs.join(' ');
        
        if (logs.includes('already in use')) {
          errorMessage = `Username "@${username}" is already taken! Please choose another one.`;
        } else if (logs.includes('custom program error: 0x0')) {
          errorMessage = 'Username is too long (max 20 characters)';
        } else if (logs.includes('custom program error: 0x1')) {
          errorMessage = 'Username is already taken';
        } else if (logs.includes('custom program error: 0x2')) {
          errorMessage = 'Invalid username format. Use only letters, numbers, and underscore';
        } else if (logs.includes('Metadata URI too long')) {
          errorMessage = 'Metadata URL is too long';
        } else if (logs.includes('insufficient funds')) {
          errorMessage = 'Insufficient SOL balance. Need ~0.02 SOL for minting.';
        }
      }
      
      if (error?.message && !errorMessage.includes('taken')) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, { id: 'mint-process', duration: 5000 });
    } finally {
      setProcessing(false);
    }
  };

  if (!mintUsernameModal.isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => !isProcessing && closeMintUsernameModal()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-2xl p-8 max-w-lg w-full border border-[var(--color-solana-green)]/30 shadow-2xl"
      >
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[var(--color-solana-green)] to-[#14C58E] rounded-full flex items-center justify-center">
            <IconIdentity className="w-10 h-10 text-black" />
          </div>
          <h3 className="text-3xl font-bold mb-2">Mint Your @Handle</h3>
          <p className="text-gray-400">Claim your unique identity on Solana</p>
        </div>

        <div className="space-y-4">
          {isProcessing && (
            <div className="bg-white/5 rounded-xl p-4 space-y-2 mb-4 border border-[var(--color-solana-green)]/20">
              <div className="text-sm font-medium text-[var(--color-solana-green)] mb-3">Processing...</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <svg className="animate-spin h-4 w-4 text-[var(--color-solana-green)]" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>📤 Uploading metadata to Arweave...</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>⚙️ Minting NFT on-chain...</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>🏛️ Setting collection...</span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">
              Choose Your Username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                }
                disabled={isProcessing}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-4 text-white text-lg outline-none focus:border-[var(--color-solana-green)] focus:bg-white/10 transition-all disabled:opacity-50"
                placeholder="yourname"
                maxLength={20}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-gray-500">{username.length}/20 characters</span>
              {username.length >= 3 && (
                <span className="text-[var(--color-solana-green)]">✓ Available</span>
              )}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <svg
                className="w-4 h-4 text-[var(--color-solana-green)]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-300">Portable across all apps</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <svg
                className="w-4 h-4 text-[var(--color-solana-green)]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-300">ZK Compressed NFT</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <svg
                className="w-4 h-4 text-[var(--color-solana-green)]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-300">Receive tips directly</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={closeMintUsernameModal}
              disabled={isProcessing}
              className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMintUsername}
              disabled={isProcessing || !username || username.length < 3}
              className="flex-1 py-4 bg-gradient-to-r from-[var(--color-solana-green)] to-[#14C58E] text-black rounded-xl font-bold hover:shadow-lg hover:shadow-[var(--color-solana-green)]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Minting...
                </span>
              ) : (
                `Mint @${username || 'handle'}`
              )}
            </motion.button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-2">
            🔒 Stored permanently on Solana • ~0.01 SOL
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
