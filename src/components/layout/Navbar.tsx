import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../../lib/wallet-adapter';
import { WalletModal } from '../../lib/wallet-adapter/components/WalletModal';
import { SafeWalletButton } from '../wallet/SafeWalletButton';
import { useProfile } from '../../hooks/useProfile';
import { useFocusCreatePost } from '../../hooks/useFocusCreatePost';
import { PulseMark } from '../icons/PulseIcons';
import { NAV_ITEMS, isNavItemActive } from './nav-items';

const walletButtonClassName =
  '!bg-white !text-black !rounded-full !font-bold hover:!bg-[var(--color-solana-green)] !transition-colors';

export function Navbar() {
  const location = useLocation();
  const { connected, publicKey } = useWallet();
  const { profile } = useProfile(publicKey || undefined);
  const profilePath = profile?.username ? `/${profile.username}` : publicKey ? `/${publicKey.toBase58()}` : '/feed';
  const focusCreatePost = useFocusCreatePost();
  const [showWalletModal, setShowWalletModal] = useState(false);

  const renderNavLink = (item: (typeof NAV_ITEMS)[number]) => {
    const isActive = isNavItemActive(location.pathname, item.path);
    const isLocked = item.requiresWallet && !connected;

    if (isLocked) {
      return (
        <button
          key={item.path}
          type="button"
          onClick={() => setShowWalletModal(true)}
          title="Connect wallet"
          className="relative isolate px-3 py-1.5 rounded-full transition-colors opacity-50 hover:opacity-70"
        >
          <span className="flex items-center gap-1 text-gray-400">
            <span>{item.icon}</span>
            <span className="font-medium text-sm">{item.label}</span>
          </span>
        </button>
      );
    }

    return (
      <Link
        key={item.path}
        to={item.path}
        className="relative isolate px-3 py-1.5 rounded-full transition-colors group"
      >
        <span
          className={`relative z-10 flex items-center gap-1 ${
            isActive ? 'text-[var(--color-solana-green)]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <span>{item.icon}</span>
          <span className="font-medium text-sm">{item.label}</span>
        </span>
        {isActive && (
          <motion.div
            layoutId="activeNav"
            className="absolute inset-0 z-0 bg-white/10 rounded-full"
            transition={{ type: 'spring', duration: 0.5 }}
          />
        )}
      </Link>
    );
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-xl border-b border-white/10 shadow-[0_1px_0_0_rgba(20,241,149,0.08)]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-center h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ scale: 1.06 }}
                transition={{ duration: 0.25 }}
                className="w-8 h-8"
              >
                <PulseMark className="w-8 h-8" />
              </motion.div>
              <span className="text-xl font-display font-bold tracking-tighter">
                Pulse
              </span>
            </Link>

            <div className="glass-card rounded-full px-2 py-1 border border-white/10 flex items-center gap-0.5 isolate">
              {NAV_ITEMS.map((item) => renderNavLink(item))}
            </div>

            <div className="flex items-center justify-end gap-3">
              <AnimatePresence mode="wait">
                {connected && publicKey ? (
                  <>
                    <motion.button
                      key="create-button"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={focusCreatePost}
                      className="flex items-center gap-2 px-4 py-2 bg-[var(--color-solana-green)] text-black rounded-full font-bold hover:bg-[#9FE51C] transition-colors"
                    >
                      <span>+</span>
                      <span>Post</span>
                    </motion.button>

                    <div className="relative group">
                      <Link to={profilePath}>
                        <motion.div
                          key="profile-avatar"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-solana-green)] to-[var(--color-social-cyan)] p-0.5 cursor-pointer shadow-lg"
                        >
                          <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                              {publicKey.toBase58().slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        </motion.div>
                      </Link>

                      <div className="absolute right-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="bg-gray-900 border border-white/10 rounded-xl shadow-2xl py-2">
                          <Link
                            to={profilePath}
                            className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>My Profile</span>
                          </Link>
                          <Link
                            to="/dashboard"
                            className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                            </svg>
                            <span>Dashboard</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
              </AnimatePresence>

              <SafeWalletButton
                className={`${walletButtonClassName} !text-sm`}
              />
            </div>
          </div>

          <div className="flex lg:hidden justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ scale: 1.06 }}
                transition={{ duration: 0.25 }}
                className="w-8 h-8"
              >
                <PulseMark className="w-8 h-8" />
              </motion.div>
              <span className="text-xl font-display font-bold tracking-tighter">
                Pulse
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <AnimatePresence mode="wait">
                {connected && publicKey ? (
                  <Link to={profilePath} key="mobile-profile-avatar">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-solana-green)] to-[var(--color-social-cyan)] p-0.5 shadow-lg"
                    >
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {publicKey.toBase58().slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                ) : null}
              </AnimatePresence>

              <SafeWalletButton
                compact
                className={`${walletButtonClassName} !text-xs !px-3 !py-1.5`}
              />
            </div>
          </div>
        </div>
      </nav>

      <WalletModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} />
    </>
  );
}
