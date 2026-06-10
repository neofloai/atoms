/**
 * Spacing tokens — aliased to the primitive "Scale" set in Figma.
 *
 * Numeric values are pixels and map directly to MUI's spacing helper
 * via the theme. Use these tokens in components/sx rather than raw
 * pixel numbers so future changes propagate cleanly.
 *
 * Generated from `light.tokens.json` (Figma DTCG export); kept in
 * sync via the design hand-off process.
 */

export const spacing = {
  component: {
    none: 0,
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 24,
    lg: 48,
    xl: 64,
    xxl: 96,
  },
} as const;

export type SpacingTokens = typeof spacing;
