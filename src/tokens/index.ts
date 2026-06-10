/**
 * Neoflo design tokens — single source of truth for all visual values.
 *
 * Two layers:
 *   1. Raw colour scales (`colors`) — flat hex per shade, no context.
 *   2. Semantic tokens (`surface`, `border`, `text`, `icon`) — role-based,
 *      mode-aware `{ light, dark }` pairs that reference raw scales.
 *   Plus `spacing` — pixel values keyed by t-shirt size.
 *
 * The semantic + spacing tokens are generated from the designer's Figma
 * DTCG export (`light.tokens.json` + `dark.tokens.json`) via the
 * `scripts/sync-design-tokens.ts` workflow. Edit those JSON files in
 * Figma, re-export, re-run the sync — never hand-edit the generated TS.
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

export { fontFamilies, fontWeights, typography } from './typography';
export type { FontFamilies, FontWeights, TypographyTokens } from './typography';

export { elevation } from './elevation';
export type { ElevationTokens } from './elevation';

export { radius } from './radius';
export type { RadiusKey, RadiusTokens } from './radius';
