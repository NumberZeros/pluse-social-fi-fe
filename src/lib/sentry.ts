import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

export function initSentry(): void {
  if (!SENTRY_DSN || import.meta.env.DEV) return;

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
    ignoreErrors: ['User rejected', 'WalletNotConnectedError'],
  });
}

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (!SENTRY_DSN || import.meta.env.DEV) return;
  Sentry.captureException(error, context ? { extra: context } : undefined);
}

export function captureTxError(
  operation: string,
  error: unknown,
  context?: Record<string, unknown>,
): void {
  if (!SENTRY_DSN || import.meta.env.DEV) return;

  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('User rejected')) return;

  Sentry.captureException(error, {
    tags: { type: 'transaction', operation },
    extra: context,
  });
}
