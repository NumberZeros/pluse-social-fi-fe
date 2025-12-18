import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import Footer from './Footer';
import { App3DBackground } from './App3DBackground';
import { MintUsernameModal } from '../landing/MintUsernameModal';

interface AppLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export function AppLayout({ children, showFooter = true }: AppLayoutProps) {
  return (
    <div className="bg-[#000000] min-h-screen text-white relative overflow-x-hidden selection:bg-[var(--color-solana-green)] selection:text-black">
      {/* Global 3D Background */}
      <App3DBackground />

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-grow pt-24 px-4 max-w-[1400px] mx-auto w-full">
          {children}
        </main>

        {showFooter && <Footer />}
      </div>
      
      {/* Global Modals */}
      <MintUsernameModal />
    </div>
  );
}
