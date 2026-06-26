import type { ReactNode } from 'react';
import { IconExplore, IconFeed } from '../icons/PulseIcons';

export interface NavItem {
  path: string;
  label: string;
  icon: ReactNode;
  requiresWallet?: boolean;
}

const dashboardIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
    />
  </svg>
);

export const NAV_ITEMS: NavItem[] = [
  { path: '/feed', label: 'Feed', icon: <IconFeed className="w-4 h-4" /> },
  { path: '/explore', label: 'Explore', icon: <IconExplore className="w-4 h-4" /> },
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: dashboardIcon,
    requiresWallet: true,
  },
];

/** Match nav active state including /post/:id under Feed. */
export function isNavItemActive(pathname: string, itemPath: string): boolean {
  if (pathname === itemPath) return true;
  if (itemPath === '/feed' && pathname.startsWith('/post/')) return true;
  if (pathname.startsWith(`${itemPath}/`)) return true;
  return false;
}
