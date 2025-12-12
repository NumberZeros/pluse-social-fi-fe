import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState } from 'react';
import { IconBell, IconExplore, IconFeed, IconHome, PulseMark } from '../icons/PulseIcons';

export function Navbar() {
  const location = useLocation();
  const { connected } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: <IconHome className="w-4 h-4" /> },
    { path: '/feed', label: 'Feed', icon: <IconFeed className="w-4 h-4" /> },
    { path: '/explore', label: 'Explore', icon: <IconExplore className="w-4 h-4" /> },
    { path: '/notifications', label: 'Notifications', icon: <IconBell className="w-4 h-4" /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative px-4 py-2 rounded-full transition-colors group"
                >
                  <span className={`flex items-center gap-2 ${
                    isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}>
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
            })}
          </div>

          {/* Wallet & Actions */}
          <div className="flex items-center gap-3">
            {connected && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black rounded-full font-bold hover:bg-[#C9A62F] transition-colors"
              >
                <span>+</span>
                <span>Create</span>
              </motion.button>
            )}
            
            <WalletMultiButton className="!bg-white !text-black !rounded-full !font-bold !text-sm hover:!bg-[#D4AF37] !transition-colors" />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 py-4"
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                  location.pathname === item.path
                    ? 'bg-white/5 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-white/80">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </nav>
  );
}
