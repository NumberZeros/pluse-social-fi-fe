import { useState } from 'react';
import { useWallet } from '../hooks';
import { WalletModal } from './WalletModal';
import './WalletButton.css';

interface WalletButtonProps {
  className?: string;
}

/**
 * RainbowKit-inspired Wallet Button Component
 */
export function WalletButton({ className = '' }: WalletButtonProps) {
  const { wallet, publicKey, connected, connecting, connect, disconnect } = useWallet();
  const [showModal, setShowModal] = useState(false);

  const handleClick = async () => {
    if (connected) {
      // Show disconnect modal or disconnect directly
      await disconnect();
    } else if (wallet) {
      // If wallet is selected, connect
      await connect();
    } else {
      // Show wallet selection modal
      setShowModal(true);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const getButtonText = () => {
    if (connecting) return 'Connecting...';
    if (connected && publicKey) return formatAddress(publicKey.toBase58());
    if (wallet) return `Connect ${wallet.name}`;
    return 'Connect Wallet';
  };

  return (
    <>
      <button
        className={`wallet-button ${connected ? 'wallet-button--connected' : ''} ${className}`}
        onClick={handleClick}
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
      </button>

      <WalletModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
}
