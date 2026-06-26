import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { MobileBottomNav } from './MobileBottomNav';
import Footer from './Footer';
import { App3DBackground } from './App3DBackground';
import { PlatformPauseBanner } from './PlatformPauseBanner';

export interface SiteLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
  /** Skip max-width padding on main — used for landing hero sections. */
  fullBleed?: boolean;
  mainClassName?: string;
}

export function SiteLayout({
  children,
  showFooter = true,
  fullBleed = false,
  mainClassName = '',
}: SiteLayoutProps) {
  const mainClasses = fullBleed
    ? `flex-grow pt-20 pb-24 lg:pb-0 w-full ${mainClassName}`
    : `flex-grow pt-20 pb-24 lg:pb-0 px-4 max-w-[1400px] mx-auto w-full ${mainClassName}`;

  return (
    <div className="bg-[#000000] min-h-screen text-white relative overflow-x-hidden selection:bg-[var(--color-solana-green)] selection:text-black">
      <App3DBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <PlatformPauseBanner />

        <main className={mainClasses}>{children}</main>

        <MobileBottomNav />

        {showFooter && <Footer />}
      </div>
    </div>
  );
}

/** @deprecated Use SiteLayout — kept for existing imports. */
export const AppLayout = SiteLayout;
