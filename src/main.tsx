import { Buffer } from 'buffer';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Solana/web3.js (and some wallet adapters) rely on Buffer being present.
// Vite/rolldown may externalize node built-ins, so we provide a safe browser polyfill.
(globalThis as unknown as { Buffer?: typeof Buffer }).Buffer ??= Buffer;

// Suppress harmless Phantom wallet extension errors
const originalError = console.error;
console.error = (...args: any[]) => {
  const msg = args[0]?.toString() || '';
  // Filter out Phantom content script port errors (harmless)
  if (msg.includes('[PHANTOM]') || msg.includes('disconnected port')) {
    return;
  }
  originalError.apply(console, args);
};

createRoot(document.getElementById('root')!).render(<App />);
