/**
 * Border-radius tokens.
 *
 * Per the design team, Figma does not define a *semantic* radius
 * layer (no `radius.sm / radius.md / radius.lg`). Designers apply
 * corner radius directly using values from the shared `Scale/*`
 * primitive collection (same one that backs spacing/gap).
 *
 * To give engineers a memorable named scale on top of those raw
 * primitives, this file exposes the same numeric ladder as `spacing`
 * (so both keep parity with Figma's `Scale/*`) plus a `full` token
 * for pill-shaped controls.
 *
 * Confirmed from Figma (node 953:3035):
 *   - card corner radius = 24px (Scale/400)  ->  `radius.xl`
 *
 * Values are pixels.
 */

export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export type RadiusTokens = typeof radius;
export type RadiusKey = keyof typeof radius;
