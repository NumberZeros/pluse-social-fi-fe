import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useWallet } from '../lib/wallet-adapter';
import { WalletButton } from '../lib/wallet-adapter/components';
import { useSocialFi } from '../hooks/useSocialFi';
import { toast } from 'react-hot-toast';
import { useUIStore } from '../stores/useUIStore';
import { useUserStore } from '../stores/useUserStore';
import { useAirdropStore } from '../stores/useAirdropStore';
import { IconIdentity, PulseMark } from '../components/icons/PulseIcons';
import Footer from '../components/layout/Footer';

export function Landing() {
  const { connected, publicKey, wallet } = useWallet();
  const { mintUsername, sdk } = useSocialFi();
  const {
    mintUsernameModal,
    openMintUsernameModal,
    closeMintUsernameModal,
    isProcessing,
    setProcessing,
  } = useUIStore();
  const setUserUsername = useUserStore((state) => state.setUsername);
  const setReferredBy = useUserStore((state) => state.setReferredBy);
  const updateAirdropProgress = useAirdropStore((state) => state.updateProgress);
  const markDayActive = useUserStore((state) => state.markDayActive);
  const [username, setUsername] = useState('');
  const [searchParams] = useSearchParams();

  // Handle referral code from URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode && connected && publicKey) {
      setReferredBy(refCode);
      toast.success('Welcome! You were referred by a friend 🎉');
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('ref');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams, connected, publicKey, setReferredBy]);

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
        '../services/metadata-upload'
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

  return (
    <div className="bg-[#000000] text-white min-h-screen font-sans selection:bg-[#ABFE2C] selection:text-black">
      {/* Background */}
      <div className="fixed inset-0 z-0 mesh-gradient-lens opacity-60 pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex justify-between items-center max-w-[1400px] mx-auto w-full bg-black/50 backdrop-blur-lg border-b border-white/5">
        <Link
          to="/"
          className="text-2xl font-display font-bold tracking-tighter flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <PulseMark className="w-7 h-7" />
          Pulse
        </Link>
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
          <Link
            to="/"
            className="text-[var(--color-solana-green)]"
          >
            Home
          </Link>
          <Link
            to="/what"
            className="hover:text-[var(--color-solana-green)] transition-colors"
          >
            What
          </Link>
          <Link
            to="/why"
            className="hover:text-[var(--color-solana-green)] transition-colors"
          >
            Why
          </Link>
          <Link
            to="/guide"
            className="hover:text-[var(--color-solana-green)] transition-colors"
          >
            Guide
          </Link>
          <Link
            to="/airdrop"
            className="hover:text-[var(--color-solana-green)] transition-colors"
          >
            Airdrop
          </Link>
        </div>
        <WalletButton className="!px-6 !py-3 !bg-white !text-black !rounded-full !font-bold !text-sm hover:!bg-[var(--color-solana-green)] !transition-colors" />
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center px-6 max-w-[1200px] mx-auto pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-6"
          >
            <span className="w-2 h-2 bg-[var(--color-solana-green)] rounded-full shadow-[0_0_10px_var(--color-solana-green)]" />
            <span className="text-sm font-medium text-[var(--color-solana-green)]">
              🚀 Live on Devnet • Creator Economy 2.0
            </span>
          </motion.div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-bold tracking-tighter leading-[1.1] mb-6">
            The Social Network<br />
            <span className="text-white/50">Built for</span>{' '}
            <span className="text-gradient-lens">Creators</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/70 mb-10 max-w-2xl">
            Own your identity. Trade creator shares. Stake & vote on content. Powered by Solana.
          </p>

          <div className="flex flex-wrap gap-4 items-center mb-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openMintUsernameModal}
              className="px-8 py-4 bg-[var(--color-solana-green)] text-black rounded-full font-bold text-base transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(20,241,149,0.3)] hover:shadow-[0_0_30px_rgba(20,241,149,0.5)]"
            >
              Mint @handle <span>→</span>
            </motion.button>
            <Link
              to="/what"
              className="px-8 py-4 border border-white/20 rounded-full font-bold text-base hover:bg-white/10 transition-colors"
            >
              Learn More
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mb-10">
            <div>
              <div className="text-3xl font-bold text-[var(--color-solana-green)] mb-1">0%</div>
              <div className="text-sm text-white/60">Platform Fees</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--color-solana-green)] mb-1">100%</div>
              <div className="text-sm text-white/60">To Creators</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">On-Chain</div>
              <div className="text-sm text-white/60">Ownership</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">Open</div>
              <div className="text-sm text-white/60">Source</div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              to="/why"
              className="px-5 py-2 border border-white/20 rounded-full hover:bg-white/5 transition-colors text-white/80 hover:text-white"
            >
              Why decentralize? →
            </Link>
            <Link
              to="/what"
              className="px-5 py-2 border border-white/20 rounded-full hover:bg-white/5 transition-colors text-white/80 hover:text-white"
            >
              How it works →
            </Link>
            <Link
              to="/airdrop"
              className="px-5 py-2 border border-white/20 rounded-full hover:bg-white/5 transition-colors text-white/80 hover:text-white"
            >
              Earn rewards →
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Overview */}
      <section className="relative z-10 py-20 px-6 max-w-[1200px] mx-auto border-t border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">
            Built Different
          </h2>
          <p className="text-base text-white/60 max-w-xl mx-auto">
            Core features that give power back to users
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--color-solana-green)]/10 flex items-center justify-center mb-4 text-[var(--color-solana-green)]">
              <IconIdentity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Own Your Identity</h3>
            <p className="text-sm text-gray-400">
              On-chain profiles. Portable across all dApps. No platform can take it away.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--color-solana-green)]/10 flex items-center justify-center mb-4 text-[var(--color-solana-green)]">
              💰
            </div>
            <h3 className="text-xl font-bold mb-2">100% to Creators</h3>
            <p className="text-sm text-gray-400">
              Direct SOL transfers. No platform fees. No middlemen taking cuts.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--color-solana-green)]/10 flex items-center justify-center mb-4 text-[var(--color-solana-green)]">
              🔒
            </div>
            <h3 className="text-xl font-bold mb-2">Censorship Resistant</h3>
            <p className="text-sm text-gray-400">
              Decentralized storage. No single point of control or failure.
            </p>
          </motion.div>
        </div>

        <div className="text-center mt-10">
          <Link
            to="/what"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-solana-green)] hover:underline"
          >
            See all features <span>→</span>
          </Link>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="relative z-10 py-20 px-6 max-w-[1200px] mx-auto border-t border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">
            Help Build the Future
          </h2>
          <p className="text-base text-white/60 max-w-2xl mx-auto">
            We're building in public. Looking for developers, investors, and early adopters.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Developers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-6 border border-white/10 hover:border-[var(--color-solana-green)]/30 transition-all"
          >
            <div className="text-3xl mb-4">👨‍💻</div>
            <h3 className="text-xl font-bold mb-2">Developers</h3>
            <p className="text-sm text-gray-400 mb-6">
              Contribute to core protocol, build integrations, or create tools. Open source and welcoming.
            </p>
            <a
              href="https://github.com/NumberZeros/pluse-social-fi-fe"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--color-solana-green)] hover:underline inline-flex items-center gap-1"
            >
              View GitHub <span>→</span>
            </a>
          </motion.div>

          {/* Investors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6 border border-white/10 hover:border-[var(--color-solana-green)]/30 transition-all"
          >
            <div className="text-3xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">Investors & VCs</h3>
            <p className="text-sm text-gray-400 mb-6">
              Early stage. Building sustainable Web3 social infrastructure. Looking for strategic partners.
            </p>
            <a
              href="mailto:tho.nguyen.soft@gmail.com?subject=Investment Inquiry - Pulse Social"
              className="text-sm text-[var(--color-solana-green)] hover:underline inline-flex items-center gap-1"
            >
              Get in touch <span>→</span>
            </a>
          </motion.div>

          {/* Early Adopters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6 border border-white/10 hover:border-[var(--color-solana-green)]/30 transition-all"
          >
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2">Early Adopters</h3>
            <p className="text-sm text-gray-400 mb-6">
              Test on Devnet, provide feedback, earn airdrop rewards. Shape the product with us.
            </p>
            <Link
              to="/airdrop"
              className="text-sm text-[var(--color-solana-green)] hover:underline inline-flex items-center gap-1"
            >
              Join airdrop <span>→</span>
            </Link>
          </motion.div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-wrap gap-4 text-sm text-white/60 justify-center">
            <span>📧 tho.nguyen.soft@gmail.com</span>
            <span className="hidden md:inline">|</span>
            <a
              href="https://github.com/NumberZeros"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub: @NumberZeros
            </a>
            <span className="hidden md:inline">|</span>
            <a
              href="https://www.linkedin.com/in/thọ-nguyễn-941348360/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6 max-w-[1200px] mx-auto border-t border-white/5">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Ready to Try?
          </h2>
          <p className="text-base text-white/60 mb-10 max-w-2xl mx-auto">
            Test on Devnet. No real money needed. Help shape the future of social media.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/feed"
              className="inline-block px-10 py-4 bg-white text-black rounded-full font-bold text-base hover:scale-105 transition-transform hover:bg-[var(--color-solana-green)]"
            >
              Launch App
            </Link>
            <a
              href="https://github.com/NumberZeros/pluse-social-fi-fe"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-10 py-4 border border-white/20 rounded-full font-bold text-base hover:bg-white/10 transition-colors"
            >
              View Source
            </a>
          </div>
        </div>
      </section>

      <Footer />

      {/* Mint Username Modal */}
      {mintUsernameModal.isOpen && (
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
      )}
    </div>
  );
}
