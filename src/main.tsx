import './polyfills';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { initSentry } from './lib/sentry';
import { initAnalytics } from './lib/analytics';

initSentry();
initAnalytics();

// Suppress harmless Phantom wallet extension errors
const originalError = console.error;
console.error = (...args: unknown[]) => {
  const msg = args[0]?.toString() || '';
  // Filter out Phantom content script port errors (harmless)
  if (msg.includes('[PHANTOM]') || msg.includes('disconnected port')) {
    return;
  }
  originalError.apply(console, args);
};

createRoot(document.getElementById('root')!).render(<App />);
