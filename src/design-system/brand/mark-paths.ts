/** Shared SVG geometry for Pulse Social brand mark (viewBox 0 0 64 64). */

export const MARK_VIEWBOX = '0 0 64 64';

/** Squircle tile — corner radius ~18/64 */
export const SQUIRCLE_PATH =
  'M18 0 H46 C55.941 0 64 8.059 64 18 V46 C64 55.941 55.941 64 46 64 H18 C8.059 64 0 55.941 0 46 V18 C0 8.059 8.059 0 18 0 Z';

/**
 * Stencil P — top piece: bowl + upper stem, ending in a diagonal cut.
 * Render with fillRule="evenodd" (contains the bowl counter/hole).
 */
export const P_TOP_PATH =
  'M22 11 H35 C43.837 11 51 17.716 51 26 C51 34.284 43.837 41 35 41 H31 L22 45 Z ' +
  'M31 20 H35 C38.866 20 42 22.686 42 26 C42 29.314 38.866 32 35 32 H31 Z';

/** Stencil P — bottom leg: slanted parallelogram, separated by the diagonal gap. */
export const P_LEG_PATH = 'M22 49.5 L31 45.5 L31 52.5 L22 56.5 Z';

/** Gradient on the P: light mint (top-left) → green (bottom-right) */
export const P_GRADIENT_STOPS = [
  { offset: '0%', color: 'var(--gradient-green-end)' },
  { offset: '100%', color: 'var(--color-primary)' },
] as const;
