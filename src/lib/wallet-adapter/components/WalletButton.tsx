import { useState, useRef, useEffect } from 'react';
import { useWallet } from '../hooks';
import { WalletModal } from './WalletModal';
import './WalletButton.css';

interface WalletButtonProps {
  className?: string;
}

/**
 * RainbowKit-inspired Wallet Button Component with Account Dropdown
 */
export function WalletButton({ className = '' }: WalletButtonProps) {
  const { wallet, publicKey, connected, connecting, disconnect } = useWallet();
  const [showModal, setShowModal] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [, forceUpdate] = useState({});
  const menuRef = useRef<HTMLDivElement>(null);

  // Force re-render when connection state might have changed
  useEffect(() => {
    if (wallet && !connecting) {
      // Poll for state updates after connection
      const checkConnection = () => {
        if (wallet.connected && wallet.publicKey) {
          forceUpdate({});
        }
      };
      
      const timer = setTimeout(checkConnection, 100);
      return () => clearTimeout(timer);
    }
  }, [wallet, connecting]);

  const handleButtonClick = () => {
    if (connected) {
      setShowAccountMenu(!showAccountMenu);
    } else {
      setShowModal(true);
    }
  };

  const handleDisconnect = async () => {
    setShowAccountMenu(false);
    await disconnect();
  };

  const handleCopyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleChangeWallet = () => {
    setShowAccountMenu(false);
    setShowModal(true);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const getButtonText = () => {
    if (connecting) return 'Connecting...';
    if (connected && publicKey) return formatAddress(publicKey.toBase58());
    return 'Connect Wallet';
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false);
      }
    };

    if (showAccountMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAccountMenu]);

  return (
    <>
      <div className="wallet-button-container" ref={menuRef}>
        <button
          className={`wallet-button ${connected ? 'wallet-button--connected' : ''} ${className}`}
          onClick={handleButtonClick}
          disabled={connecting}
        >
          {connected && wallet && (
            <img 
              src={wallet.metadata.icon} 
              alt={wallet.name} 
              className="wallet-button__icon"
            />
          )}
          <span className="wallet-button__text">{getButtonText()}</span>
          {connected && (
            <svg 
              className="wallet-button__chevron"
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="currentColor"
            >
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Account Dropdown Menu */}
        {connected && showAccountMenu && (
          <div className="wallet-account-menu">
            {wallet && (
              <div className="wallet-account-menu__header">
                <img 
                  src={wallet.metadata.icon} 
                  alt={wallet.name}
                  className="wallet-account-menu__icon"
                />
                <div className="wallet-account-menu__info">
                  <div className="wallet-account-menu__name">{wallet.name}</div>
                  {publicKey && (
                    <div className="wallet-account-menu__address">
                      {formatAddress(publicKey.toBase58())}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="wallet-account-menu__divider" />

            <button 
              className="wallet-account-menu__item"
              onClick={handleCopyAddress}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5 2h6a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm0 1v8h6V3H5z"/>
                <path d="M3 5v8a1 1 0 0 0 1 1h6v1H4a2 2 0 0 1-2-2V5h1z"/>
              </svg>
              <span>{copied ? 'Copied!' : 'Copy Address'}</span>
            </button>

            <button 
              className="wallet-account-menu__item"
              onClick={handleChangeWallet}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 3a5 5 0 1 0 0 10A5 5 0 0 0 8 3zM4 8a4 4 0 1 1 8 0 4 4 0 0 1-8 0z"/>
                <path d="M7.5 5.5a.5.5 0 0 1 1 0v2h2a.5.5 0 0 1 0 1h-2v2a.5.5 0 0 1-1 0v-2h-2a.5.5 0 0 1 0-1h2v-2z"/>
              </svg>
              <span>Change Wallet</span>
            </button>

            <div className="wallet-account-menu__divider" />

            <button 
              className="wallet-account-menu__item wallet-account-menu__item--danger"
              onClick={handleDisconnect}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M10 3.5a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 1 1 0v2A1.5 1.5 0 0 1 9.5 14h-8A1.5 1.5 0 0 1 0 12.5v-9A1.5 1.5 0 0 1 1.5 2h8A1.5 1.5 0 0 1 11 3.5v2a.5.5 0 0 1-1 0v-2z"/>
                <path d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
              </svg>
              <span>Disconnect</span>
            </button>
          </div>
        )}
      </div>

      <WalletModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
}
