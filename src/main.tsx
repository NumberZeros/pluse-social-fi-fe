import { Buffer } from 'buffer';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Solana/web3.js (and some wallet adapters) rely on Buffer being present.
// Vite/rolldown may externalize node built-ins, so we provide a safe browser polyfill.
(globalThis as unknown as { Buffer?: typeof Buffer }).Buffer ??= Buffer;

createRoot(document.getElementById('root')!).render(
  // Temporarily disable StrictMode to prevent wallet adapter double-mounting issues
  // StrictMode causes wallet to disconnect/reconnect in development
  <App />,
);
