import type { ReactNode } from 'react';
import { IconExplore, IconFeed } from '../icons/PulseIcons';

export interface NavItem {
  path: string;
  label: string;
  icon: ReactNode;
  requiresWallet?: boolean;
  group: 'product' | 'learn';
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

const bookIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
);

export const NAV_ITEMS: NavItem[] = [
  { path: '/feed', label: 'Feed', icon: <IconFeed className="w-4 h-4" />, group: 'product' },
  { path: '/explore', label: 'Explore', icon: <IconExplore className="w-4 h-4" />, group: 'product' },
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: dashboardIcon,
    requiresWallet: true,
    group: 'product',
  },
  { path: '/what', label: 'What', icon: bookIcon, group: 'learn' },
  { path: '/why', label: 'Why', icon: bookIcon, group: 'learn' },
  { path: '/guide', label: 'Guide', icon: bookIcon, group: 'learn' },
];

const STATIC_APP_PATHS = new Set([
  '/',
  '/feed',
  '/explore',
  '/dashboard',
  '/what',
  '/why',
  '/guide',
  '/post',
]);

/** Match nav active state including /post/:id under Feed. */
export function isNavItemActive(pathname: string, itemPath: string): boolean {
  if (pathname === itemPath) return true;
  if (itemPath === '/feed' && pathname.startsWith('/post/')) return true;
  if (pathname.startsWith(`${itemPath}/`)) return true;
  return false;
}

export function isProfileRoute(pathname: string): boolean {
  if (STATIC_APP_PATHS.has(pathname)) return false;
  if (pathname.startsWith('/post/')) return false;
  return /^\/[^/]+$/.test(pathname);
}
