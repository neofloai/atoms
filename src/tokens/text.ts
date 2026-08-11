import { colors } from './colors';

/**
 * Text semantic tokens.
 *
 * Each role exposes typography *slots* rather than interaction states:
 *
 *   text.default.{ heading, body, caption, placeholder, subtle,
 *                  headingOnColor, bodyOnColor, captionOnColor,
 *                  placeholderOnColor }
 *   text.<role>.{ body, caption, accent, onColorHover }
 *   text.disabled.{ default, onColor }
 *
 * `<role>` is primary, information, success, error, warning, orange, or
 * purple. Every one is now a uniform four-rung ladder, darkest first: in
 * light mode `body`/`caption`/`accent`/`onColorHover` resolve to shades
 * 700/600/500/400 (800/700/600/500 for the two warm scales, which need an
 * extra rung of contrast against a light page), and dark mode walks the
 * same ladder from the other end.
 *
 * Generated from the Figma "component" collection DTCG export
 * (2026-08-11). That export numbered the slots instead of naming them
 * (`text/primary/1`); the names above are ours, mapped in
 * `scripts/sync-design-tokens.mjs`. It also dropped the accent roles'
 * darkest `heading` rung — nothing consumed it — and replaced the
 * hand-guessed `orange`/`purple` singletons, whose `dark` mirrored
 * `light`, with the full per-mode ladder.
 *
 * `default` keeps its descriptive slot names; Figma calls
 * `body`/`caption`/`placeholder` `b1`/`b2`/`b3` after the type-scale
 * rungs they pair with.
 */

import type { ModeToken } from './surface';
export type { ModeToken };

export const text = {
  default: {
    heading: { light: colors.grey[1200], dark: colors.grey[25] },
    body: { light: colors.grey[800], dark: colors.grey[300] },
    caption: { light: colors.grey[650], dark: colors.grey[600] },
    placeholder: { light: colors.grey[625], dark: colors.grey[650] },
    subtle: { light: colors.grey[600], dark: colors.grey[600] },
    headingOnColor: { light: colors.grey[25], dark: colors.grey[1100] },
    bodyOnColor: { light: colors.grey[100], dark: colors.grey[900] },
    captionOnColor: { light: colors.grey[300], dark: colors.grey[700] },
    placeholderOnColor: { light: colors.grey[500], dark: colors.grey[600] },
  },
  primary: {
    body: { light: colors.primary[700], dark: colors.primary[200] },
    caption: { light: colors.primary[600], dark: colors.primary[300] },
    accent: { light: colors.primary[500], dark: colors.primary[400] },
    onColorHover: { light: colors.primary[400], dark: colors.primary[500] },
  },
  information: {
    body: { light: colors.blue[700], dark: colors.blue[200] },
    caption: { light: colors.blue[600], dark: colors.blue[300] },
    accent: { light: colors.blue[500], dark: colors.blue[400] },
    onColorHover: { light: colors.blue[400], dark: colors.blue[500] },
  },
  success: {
    body: { light: colors.green[700], dark: colors.green[100] },
    caption: { light: colors.green[600], dark: colors.green[200] },
    accent: { light: colors.green[500], dark: colors.green[300] },
    onColorHover: { light: colors.green[400], dark: colors.green[400] },
  },
  error: {
    body: { light: colors.red[700], dark: colors.red[100] },
    caption: { light: colors.red[600], dark: colors.red[200] },
    accent: { light: colors.red[500], dark: colors.red[300] },
    onColorHover: { light: colors.red[400], dark: colors.red[400] },
  },
  warning: {
    body: { light: colors.yellow[800], dark: colors.yellow[300] },
    caption: { light: colors.yellow[700], dark: colors.yellow[400] },
    accent: { light: colors.yellow[600], dark: colors.yellow[500] },
    onColorHover: { light: colors.yellow[500], dark: colors.yellow[600] },
  },
  orange: {
    body: { light: colors.orange[800], dark: colors.orange[100] },
    caption: { light: colors.orange[700], dark: colors.orange[200] },
    accent: { light: colors.orange[600], dark: colors.orange[300] },
    onColorHover: { light: colors.orange[500], dark: colors.orange[400] },
  },
  purple: {
    body: { light: colors.purple[700], dark: colors.purple[200] },
    caption: { light: colors.purple[600], dark: colors.purple[300] },
    accent: { light: colors.purple[500], dark: colors.purple[400] },
    onColorHover: { light: colors.purple[400], dark: colors.purple[500] },
  },
  disabled: {
    default: { light: colors.grey[500], dark: colors.grey[700] },
    onColor: { light: colors.grey[500], dark: colors.grey[800] },
  },
} as const;

export type TextTokens = typeof text;
