import type { Adapter } from '@solana/wallet-adapter-base';

function isWalletStandardAdapter(adapter: Adapter): boolean {
  return 'standard' in adapter && adapter.standard != null;
}

/**
 * Deduplicate wallet adapters by name, preferring Wallet Standard entries over legacy adapters.
 */
export function dedupeWalletAdapters(adapters: Adapter[]): Adapter[] {
  const byName = new Map<string, Adapter>();

  for (const adapter of adapters) {
    const existing = byName.get(adapter.name);
    if (!existing) {
      byName.set(adapter.name, adapter);
      continue;
    }
    if (isWalletStandardAdapter(adapter) && !isWalletStandardAdapter(existing)) {
      byName.set(adapter.name, adapter);
    }
  }

  return Array.from(byName.values());
}

/**
 * Legacy deep-link adapters for environments without Wallet Standard (e.g. mobile Safari).
 */
export function getLegacyMobileAdapters(
  createAdapters: () => Adapter[],
): Adapter[] {
  if (typeof window === 'undefined') {
    return createAdapters();
  }

  const nav = navigator as Navigator & { wallets?: unknown[] };
  if (Array.isArray(nav.wallets) && nav.wallets.length > 0) {
    return [];
  }

  return createAdapters();
}
