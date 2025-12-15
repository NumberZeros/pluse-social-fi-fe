import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      buffer: 'buffer/',
    },
  },
  optimizeDeps: {
    include: ['buffer'],
  },
  build: {
    // We intentionally keep the WebGL stack (three/R3F/Drei) in its own chunk.
    // Raise the warning threshold so builds stay signal-heavy.
    chunkSizeWarningLimit: 1100,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // Keep WebGL stack isolated so the app shell stays light.
          if (
            id.includes('/three/') ||
            id.includes('/@react-three/fiber/') ||
            id.includes('/@react-three/drei/')
          ) {
            return 'three';
          }

          // Wallet + chain deps can be heavy and change less often.
          if (id.includes('/@solana/')) return 'solana';

          // Animation libs
          if (id.includes('/framer-motion/')) return 'motion';
          if (id.includes('/gsap/')) return 'gsap';

          // Query + state
          if (id.includes('/@tanstack/')) return 'tanstack';
          if (id.includes('/zustand/')) return 'zustand';

          // Router
          if (id.includes('/react-router-dom/')) return 'router';

          return 'vendor';
        },
      },
    },
  },
})
