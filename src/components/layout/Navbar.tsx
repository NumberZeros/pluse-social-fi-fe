import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useWallet } from '../../lib/wallet-adapter';
import { SafeWalletButton } from '../wallet/SafeWalletButton';
import { useProfile } from '../../hooks/useProfile';
import { useState } from 'react';
import { PulseMark } from '../icons/PulseIcons';
import { NAV_ITEMS, isNavItemActive } from './nav-items';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { connected, publicKey } = useWallet();
  const { profile } = useProfile(publicKey || undefined);
  const profilePath = profile?.username ? `/${profile.username}` : publicKey ? `/${publicKey.toBase58()}` : '/feed';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const visibleNavItems = NAV_ITEMS.filter((item) => !item.requiresWallet || connected);
  const productItems = visibleNavItems.filter((item) => item.group === 'product');
  const learnItems = visibleNavItems.filter((item) => item.group === 'learn');

  const focusCreatePost = () => {
    navigate('/feed');
    setTimeout(() => {
      const textarea = document.querySelector(
        'textarea[placeholder*="happening"]',
      ) as HTMLTextAreaElement | null;
      textarea?.focus();
      textarea?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const renderNavLink = (item: (typeof NAV_ITEMS)[number], onNavigate?: () => void) => {
    const isActive = isNavItemActive(location.pathname, item.path);
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={onNavigate}
        className="relative px-4 py-2 rounded-full transition-colors group"
      >
        <span
          className={`flex items-center gap-2 ${
            isActive ? 'text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <span>{item.icon}</span>
          <span className="font-medium">{item.label}</span>
        </span>
        {isActive && (
          <motion.div
            layoutId="activeNav"
            className="absolute inset-0 bg-white/5 rounded-full -z-10"
            transition={{ type: 'spring', duration: 0.5 }}
          />
        )}
      </Link>
    );
  };

  const renderMobileLink = (item: (typeof NAV_ITEMS)[number]) => {
    const isActive = isNavItemActive(location.pathname, item.path);
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => setMobileMenuOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
          isActive ? 'bg-white/5 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
      >
        <span className="text-white/80">{item.icon}</span>
        <span className="font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.06 }}
              transition={{ duration: 0.25 }}
              className="w-8 h-8"
            >
              <PulseMark className="w-8 h-8" />
            </motion.div>
            <span className="text-xl font-display font-bold tracking-tighter hidden sm:block">
              Pulse
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {productItems.map((item) => renderNavLink(item))}
            <div className="w-px h-6 bg-white/10 mx-2" aria-hidden="true" />
            {learnItems.map((item) => renderNavLink(item))}
          </div>

          <div className="flex items-center gap-3">
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
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[var(--color-solana-green)] text-black rounded-full font-bold hover:bg-[#9FE51C] transition-colors"
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
                        <Link
                          to="/guide"
                          className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <span>Guide</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </AnimatePresence>

            <SafeWalletButton className="!bg-white !text-black !rounded-full !font-bold !text-sm hover:!bg-[var(--color-solana-green)] !transition-colors" />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-white/10 py-4"
          >
            <p className="px-4 pb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Product</p>
            {productItems.map(renderMobileLink)}

            <p className="px-4 pt-4 pb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Learn</p>
            {learnItems.map(renderMobileLink)}

            {connected && publicKey && (
              <>
                <div className="border-t border-white/10 mt-2 pt-4" />
                <Link
                  to={profilePath}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                >
                  <span className="font-medium">My Profile</span>
                </Link>
              </>
            )}
          </motion.div>
        )}
      </div>
    </nav>
  );
}
