import { useEffect } from 'react';
import { useWallet } from '../hooks';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '../adapters';
import { WalletReadyState } from '../types';
import './WalletButton.css';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * RainbowKit-inspired Wallet Selection Modal
 */
export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { select, connect } = useWallet();

  // Available wallets
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ];
  
  // Log wallet detection status
  useEffect(() => {
    if (isOpen) {
      console.log('[WalletModal] Wallet detection status:');
      wallets.forEach(wallet => {
        console.log(`  - ${wallet.name}: ${wallet.readyState} (connected: ${wallet.connected})`);
      });
    }
  }, [isOpen]);

  const handleWalletSelect = async (walletName: string) => {
    try {
      console.log('[WalletModal] Selecting wallet:', walletName);
      select(walletName as any);
      
      // Small delay to let state update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('[WalletModal] Attempting to connect...');
      await connect();
      console.log('[WalletModal] Connection successful');
      
      onClose();
    } catch (error) {
      console.error('[WalletModal] Failed to connect wallet:', error);
      // Don't close modal on error so user can try again
    }
  };

  const getStatusBadge = (readyState: WalletReadyState) => {
    switch (readyState) {
      case WalletReadyState.Installed:
        return <span className="wallet-option__badge wallet-option__badge--installed">Ready</span>;
      case WalletReadyState.NotDetected:
        return <span className="wallet-option__badge wallet-option__badge--not-detected">Not Installed</span>;
      case WalletReadyState.Loading:
        return <span className="wallet-option__badge">Loading...</span>;
      default:
        return null;
    }
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="wallet-modal-overlay" onClick={onClose}>
      <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wallet-modal__header">
          <h2 className="wallet-modal__title">Connect Wallet</h2>
          <button 
            className="wallet-modal__close" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="wallet-modal__content">
          <div className="wallet-modal__list">
            {wallets.map((wallet) => {
              const isInstalled = wallet.readyState === WalletReadyState.Installed;
              
              return (
                <button
                  key={wallet.name}
                  className={`wallet-option ${!isInstalled ? 'wallet-option--not-installed' : ''}`}
                  onClick={() => isInstalled && handleWalletSelect(wallet.name)}
                  disabled={!isInstalled}
                >
                  <img 
                    src={wallet.metadata.icon} 
                    alt={wallet.name}
                    className="wallet-option__icon"
                  />
                  
                  <div className="wallet-option__info">
                    <h3 className="wallet-option__name">{wallet.metadata.name}</h3>
                    <p className="wallet-option__status">{wallet.metadata.description}</p>
                    
                    {!isInstalled && (
                      <a 
                        href={wallet.metadata.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="wallet-option__download"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Install Extension →
                      </a>
                    )}
                  </div>

                  {getStatusBadge(wallet.readyState)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
