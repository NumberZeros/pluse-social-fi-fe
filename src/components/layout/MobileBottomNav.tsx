import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../../lib/wallet-adapter';
import { useProfile } from '../../hooks/useProfile';
import { useFocusCreatePost } from '../../hooks/useFocusCreatePost';
import { WalletModal } from '../../lib/wallet-adapter/components/WalletModal';
import { IconExplore, IconFeed, IconIdentity } from '../icons/PulseIcons';
import { isNavItemActive } from './nav-items';

const dashboardIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
    />
  </svg>
);

interface TabItem {
  path: string;
  label: string;
  icon: ReactNode;
  isActive: boolean;
  locked?: boolean;
}

export function MobileBottomNav() {
  const location = useLocation();
  const { connected, publicKey } = useWallet();
  const { profile } = useProfile(publicKey || undefined);
  const focusCreatePost = useFocusCreatePost();
  const [showWalletModal, setShowWalletModal] = useState(false);

  if (location.pathname === '/') return null;

  const profilePath = profile?.username
    ? `/${profile.username}`
    : publicKey
      ? `/${publicKey.toBase58()}`
      : null;

  const isProfileActive =
    profilePath !== null &&
    (location.pathname === profilePath || location.pathname.startsWith(`${profilePath}/`));

  const tabs: TabItem[] = [
    {
      path: '/feed',
      label: 'Feed',
      icon: <IconFeed className="w-5 h-5" />,
      isActive: isNavItemActive(location.pathname, '/feed'),
    },
    {
      path: '/explore',
      label: 'Explore',
      icon: <IconExplore className="w-5 h-5" />,
      isActive: isNavItemActive(location.pathname, '/explore'),
    },
  ];

  if (connected) {
    tabs.push({
      path: '/dashboard',
      label: 'Dashboard',
      icon: dashboardIcon,
      isActive: isNavItemActive(location.pathname, '/dashboard'),
    });

    tabs.push({
      path: profilePath ?? '/feed',
      label: 'Profile',
      icon: <IconIdentity className="w-5 h-5" />,
      isActive: isProfileActive,
      locked: !profilePath,
    });
  } else {
    tabs.push(
      {
        path: '/dashboard',
        label: 'Dashboard',
        icon: dashboardIcon,
        isActive: false,
        locked: true,
      },
      {
        path: '/profile',
        label: 'Profile',
        icon: <IconIdentity className="w-5 h-5" />,
        isActive: false,
        locked: true,
      },
    );
  }

  const tabClassName = (tab: TabItem) =>
    `flex flex-col items-center justify-center gap-0.5 py-2 min-w-0 ${
      tab.locked
        ? 'text-gray-600'
        : tab.isActive
          ? 'text-[var(--color-solana-green)]'
          : 'text-gray-500'
    }`;

  const renderTabContent = (tab: TabItem) => (
    <>
      {tab.icon}
      <span className="text-[10px] font-medium truncate max-w-full px-1">{tab.label}</span>
    </>
  );

  const renderTab = (tab: TabItem) => {
    if (tab.locked) {
      return (
        <button
          key={tab.label}
          type="button"
          onClick={() => setShowWalletModal(true)}
          className={tabClassName(tab)}
          aria-label={`${tab.label} — connect wallet`}
        >
          {renderTabContent(tab)}
        </button>
      );
    }

    return (
      <Link key={tab.path} to={tab.path} className={tabClassName(tab)}>
        {renderTabContent(tab)}
      </Link>
    );
  };

  return (
    <>
      <nav
        className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-black/90 backdrop-blur-xl border-t border-white/10 pb-[env(safe-area-inset-bottom)]"
        aria-label="Mobile navigation"
      >
        {connected ? (
          <div className="relative grid grid-cols-5 h-16">
            {renderTab(tabs[0])}
            {renderTab(tabs[1])}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={focusCreatePost}
                className="absolute -top-5 w-12 h-12 rounded-full bg-[var(--color-solana-green)] text-black font-bold text-xl shadow-lg shadow-[var(--color-solana-green)]/20 flex items-center justify-center hover:bg-[#9FE51C] transition-colors active:scale-95"
                aria-label="Create post"
              >
                +
              </button>
            </div>
            {renderTab(tabs[2])}
            {renderTab(tabs[3])}
          </div>
        ) : (
          <div className="grid grid-cols-4 h-16">{tabs.map(renderTab)}</div>
        )}
      </nav>

      <WalletModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} />
    </>
  );
}
