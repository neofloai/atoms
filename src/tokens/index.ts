/**
 * Neoflo design tokens — single source of truth for all visual values.
 *
 * Two layers:
 *   1. Raw colour scales (`colors`) — flat hex per shade, no context.
 *   2. Semantic tokens (`surface`, `border`, `text`, `icon`) — role-based,
 *      mode-aware `{ light, dark }` pairs that reference raw scales.
 *   Plus `spacing` — pixel values keyed by t-shirt size — and
 *   `responsive`, the same idea keyed by breakpoint instead of by mode.
 *
 * The colour, semantic, spacing, and responsive tokens are generated from
 * the designer's Figma DTCG exports via the
 * `scripts/sync-design-tokens.mjs` workflow. Edit the variables in Figma,
 * re-export, re-run the sync — never hand-edit the generated TS.
 * `typography.ts`, `radius.ts`, and `elevation.ts` are hand-maintained;
 * the Figma variable collections do not cover them.
 *
 * Token files are intentionally pure data: no `'use client'`, no React,
 * no MUI imports.
 */

export { colors } from './colors';
export type { ColorScale, ColorShade, ColorToken } from './colors';

export { surface } from './surface';
export type { SurfaceTokens, ModeToken } from './surface';

export { border } from './border';
export type { BorderTokens } from './border';

export { text } from './text';
export type { TextTokens } from './text';

export { icon } from './icon';
export type { IconTokens } from './icon';

export { spacing } from './spacing';
export type { SpacingTokens } from './spacing';

export { responsive } from './responsive';
export type { Breakpoint, ResponsiveTokens } from './responsive';

export { fontFamilies, fontWeights, typography } from './typography';
export type { FontFamilies, FontWeights, TypographyTokens } from './typography';

export { elevation } from './elevation';
export type { ElevationTokens } from './elevation';

export { radius } from './radius';
export type { RadiusKey, RadiusTokens } from './radius';
