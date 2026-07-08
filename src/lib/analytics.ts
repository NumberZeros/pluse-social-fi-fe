import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST ?? 'https://us.i.posthog.com';

let initialized = false;

export function initAnalytics(): void {
  if (initialized || !POSTHOG_KEY || import.meta.env.DEV) return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    defaults: '2026-05-30',
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
    persistence: 'localStorage',
  });
  initialized = true;
}

export type AnalyticsEvent =
  | 'wallet_connected'
  | 'profile_created'
  | 'pool_launched'
  | 'post_created'
  | 'buy_shares'
  | 'tip_sent'
  | 'gating_cta_click'
  | 'wizard_step_completed';

export function trackEvent(
  event: AnalyticsEvent,
  properties?: Record<string, string | number | boolean | undefined>,
): void {
  if (!initialized) return;
  posthog.capture(event, properties);
}

export function identifyWallet(walletAddress: string): void {
  if (!initialized) return;
  posthog.identify(walletAddress, { wallet_address: walletAddress });
}
