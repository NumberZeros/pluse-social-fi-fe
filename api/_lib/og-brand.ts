/**
 * Canonical brand constants for OG image handlers.
 *
 * OG handlers run in @vercel/og (Satori) which does not resolve CSS custom
 * properties, so literal hex values live here instead of importing tokens.css.
 * This file is the only api/ file allowed to contain raw hex (see
 * scripts/validate-design-tokens.ts). Keep values in sync with tokens.css.
 */

export const OG_COLORS = {
  background: '#06080A',
  surface: '#0B1015',
  border: '#1B2632',
  primary: '#14F195',
  primaryEnd: '#37FFC0',
  secondary: '#9945FF',
  muted: '#B8C0CC',
  foreground: '#FFFFFF',
} as const;

/** Background gradient shared across OG cards. */
export const OG_BACKGROUND =
  `linear-gradient(135deg, ${OG_COLORS.background} 0%, ${OG_COLORS.surface} 100%)`;

/** Brand mark geometry (viewBox 0 0 64 64) — mirrors src/design-system/brand/mark-paths.ts. */
export const OG_MARK = {
  viewBox: '0 0 64 64',
  squircle:
    'M18 0 H46 C55.941 0 64 8.059 64 18 V46 C64 55.941 55.941 64 46 64 H18 C8.059 64 0 55.941 0 46 V18 C0 8.059 8.059 0 18 0 Z',
  pTop:
    'M22 11 H35 C43.837 11 51 17.716 51 26 C51 34.284 43.837 41 35 41 H31 L22 45 Z ' +
    'M31 20 H35 C38.866 20 42 22.686 42 26 C42 29.314 38.866 32 35 32 H31 Z',
  pLeg: 'M22 49.5 L31 45.5 L31 52.5 L22 56.5 Z',
} as const;
