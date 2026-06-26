import { Buffer } from 'buffer';

/**
 * Must run before any Solana / Anchor dependency graph loads.
 * Several @solana/* packages reference the global `Buffer` at module scope.
 */
const globalScope = globalThis as typeof globalThis & {
  Buffer?: typeof Buffer;
};

if (!globalScope.Buffer) {
  globalScope.Buffer = Buffer;
}
