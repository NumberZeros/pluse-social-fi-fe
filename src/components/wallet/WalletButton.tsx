import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useWalletHealth } from '../../hooks/useWalletHealth';
import { markUserInitiatedConnect } from '../../utils/wallet-errors';
import { getNetworkLabel } from '../../utils/constants';
import './WalletButton.css';

interface WalletButtonProps {
  className?: string;
}

function formatAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

/**
 * Pulse-branded wallet button with account dropdown.
 * Uses the official wallet modal via useWalletModal().
 */
export function WalletButton({ className = '' }: WalletButtonProps) {
  const { wallet, publicKey, connected, connecting, disconnect } = useWallet();
  const anchorWallet = useAnchorWallet();
  const { setVisible } = useWalletModal();
  const { balanceSol, hasProfile } = useWalletHealth();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const walletIcon = wallet?.adapter.icon;
  const walletName = wallet?.adapter.name;
  const walletReady = connected && !!publicKey && !!anchorWallet;

  const handleButtonClick = () => {
    if (connected) {
      setShowAccountMenu(!showAccountMenu);
    } else {
      markUserInitiatedConnect();
      setVisible(true);
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

  const handleChangeWallet = async () => {
    setShowAccountMenu(false);
    markUserInitiatedConnect();
    await disconnect();
    setVisible(true);
  };

  const getButtonText = () => {
    if (connecting) return 'Connecting...';
    if (connected && !anchorWallet) return 'Initializing...';
    if (connected && publicKey) return formatAddress(publicKey.toBase58());
    return 'Connect Wallet';
  };

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

  const networkLabel = getNetworkLabel();
  const displayBalance = balanceSol.toFixed(balanceSol < 0.01 ? 4 : 2);

  return (
    <div className="wallet-button-container" ref={menuRef}>
      <button
        type="button"
        data-wallet-button
        className={`wallet-button ${connected ? 'wallet-button--connected' : ''} ${className}`}
        onClick={handleButtonClick}
        disabled={connecting || (connected && !anchorWallet)}
      >
        {connected && walletIcon && (
          <img src={walletIcon} alt={walletName ?? 'Wallet'} className="wallet-button__icon" />
        )}
        <span className="wallet-button__text">{getButtonText()}</span>
        {connected && (
          <svg
            className="wallet-button__chevron"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {walletReady && showAccountMenu && (
        <div className="wallet-account-menu">
          {wallet && (
            <div className="wallet-account-menu__header">
              {walletIcon && (
                <img src={walletIcon} alt={walletName ?? 'Wallet'} className="wallet-account-menu__icon" />
              )}
              <div className="wallet-account-menu__info">
                <div className="wallet-account-menu__name">{walletName}</div>
                {publicKey && (
                  <div className="wallet-account-menu__address">
                    {formatAddress(publicKey.toBase58())}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="wallet-account-menu__balance">
            <span className="wallet-account-menu__balance-label">Balance</span>
            <span className="wallet-account-menu__balance-value">{displayBalance} SOL</span>
            <span className="wallet-account-menu__network-badge">{networkLabel}</span>
          </div>

          <div className="wallet-account-menu__divider" />

          <Link
            to="/dashboard"
            className="wallet-account-menu__item"
            onClick={() => setShowAccountMenu(false)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 1a6 6 0 110 12A6 6 0 018 2z" />
              <path d="M7 5h2v6H7V5zm0-2h2v1H7V3z" />
            </svg>
            <span>{hasProfile ? 'Dashboard' : 'Create profile'}</span>
          </Link>

          <button type="button" className="wallet-account-menu__item" onClick={handleCopyAddress}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M5 2h6a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1zm0 1v8h6V3H5z" />
              <path d="M3 5v8a1 1 0 001 1h6v1H4a2 2 0 01-2-2V5h1z" />
            </svg>
            <span>{copied ? 'Copied!' : 'Copy Address'}</span>
          </button>

          <button type="button" className="wallet-account-menu__item" onClick={handleChangeWallet}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M8 3a5 5 0 100 10A5 5 0 008 3zM4 8a4 4 0 118 0 4 4 0 01-8 0z" />
              <path d="M7.5 5.5a.5.5 0 011 0v2h2a.5.5 0 010 1h-2v2a.5.5 0 01-1 0v-2h-2a.5.5 0 010-1h2v-2z" />
            </svg>
            <span>Change Wallet</span>
          </button>

          <div className="wallet-account-menu__divider" />

          <button
            type="button"
            className="wallet-account-menu__item wallet-account-menu__item--danger"
            onClick={handleDisconnect}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M10 3.5a.5.5 0 00-.5-.5h-8a.5.5 0 00-.5.5v9a.5.5 0 00.5.5h8a.5.5 0 00.5-.5v-2a.5.5 0 011 0v2A1.5 1.5 0 019.5 14h-8A1.5 1.5 0 010 12.5v-9A1.5 1.5 0 011.5 2h8A1.5 1.5 0 0111 3.5v2a.5.5 0 01-1 0v-2z" />
              <path d="M15.854 8.354a.5.5 0 000-.708l-3-3a.5.5 0 00-.708.708L14.293 7.5H5.5a.5.5 0 000 1h8.793l-2.147 2.146a.5.5 0 00.708.708l3-3z" />
            </svg>
            <span>Disconnect</span>
          </button>
        </div>
      )}
    </div>
  );
}
