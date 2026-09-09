import { colors } from './colors';

/**
 * Text semantic tokens — font colours.
 *
 * **Every key is the Figma variable name, verbatim.** A designer saying
 * "make this text/default/b2" is naming `text.default.b2`. Drop the
 * category prefix, turn the slashes into property access, and that is
 * the token — nothing is translated on the way in, so nothing can be
 * translated wrongly:
 *
 *   text/default/b2              ->  text.default.b2
 *   text/primary/3               ->  text.primary[3]
 *   text/default/body on-color   ->  text.default['body on-color']
 *   text/disabled/on-color       ->  text.disabled['on-color']
 *
 * The shape, as Figma draws it:
 *
 *   text.default.{ heading, b1, b2, b3, subtle,
 *                  'heading on-color', 'body on-color',
 *                  'caption on-color', 'placeholder on-color' }
 *   text.<role>[1..4]     (`0` in place of `1` on warning and orange)
 *   text.disabled.{ default, 'on-color' }
 *
 * `<role>` is primary, information, success, error, warning, orange, or
 * purple — each a four-rung ladder, darkest first. In light mode rungs
 * 1-4 resolve to shades 700/600/500/400 (800/700/600/500 for the two
 * warm scales, which need an extra rung of contrast against a light
 * page); dark mode walks the same ladder from the other end.
 *
 * The numbers are Figma's, so they carry Figma's quirks: `warning` and
 * `orange` start at `0` and skip `1` entirely, running `0, 2, 3, 4`.
 * It is the same darkest rung either way. `icon` starts `warning` at
 * `1`, so the two categories genuinely disagree there — see
 * DESIGNER_QUESTIONS.md #56.
 *
 * Generated from the Figma "component" collection DTCG export
 * (2026-09-09) — never hand-edit.
 *
 * Releases up to 1.0.1 renamed these slots on the way in, to
 * `body`/`caption`/`accent`/`onColorHover`. That mapping is gone. It
 * was a translation layer nobody asked for: it meant the name a designer
 * handed over did not exist in the code they got back, and twice running
 * that produced the wrong colour in a review. The rename is a breaking
 * change to `@neofloai/atoms/tokens` and needs a major version before it
 * ships; `.cursor/rules/20-tokens.mdc` carries the before/after table.
 */

import type { ModeToken } from './surface';
export type { ModeToken };

export const text = {
  default: {
    heading: { light: colors.grey[1200], dark: colors.grey[25] },
    b1: { light: colors.grey[800], dark: colors.grey[300] },
    b2: { light: colors.grey[650], dark: colors.grey[600] },
    b3: { light: colors.grey[625], dark: colors.grey[650] },
    subtle: { light: colors.grey[600], dark: colors.grey[600] },
    "heading on-color": { light: colors.grey[25], dark: colors.grey[1100] },
    "body on-color": { light: colors.grey[100], dark: colors.grey[900] },
    "caption on-color": { light: colors.grey[300], dark: colors.grey[700] },
    "placeholder on-color": { light: colors.grey[500], dark: colors.grey[600] },
  },
  primary: {
    1: { light: colors.primary[700], dark: colors.primary[200] },
    2: { light: colors.primary[600], dark: colors.primary[300] },
    3: { light: colors.primary[500], dark: colors.primary[400] },
    4: { light: colors.primary[400], dark: colors.primary[500] },
  },
  information: {
    1: { light: colors.blue[700], dark: colors.blue[200] },
    2: { light: colors.blue[600], dark: colors.blue[300] },
    3: { light: colors.blue[500], dark: colors.blue[400] },
    4: { light: colors.blue[400], dark: colors.blue[500] },
  },
  success: {
    1: { light: colors.green[700], dark: colors.green[100] },
    2: { light: colors.green[600], dark: colors.green[200] },
    3: { light: colors.green[500], dark: colors.green[300] },
    4: { light: colors.green[400], dark: colors.green[400] },
  },
  error: {
    1: { light: colors.red[700], dark: colors.red[100] },
    2: { light: colors.red[600], dark: colors.red[200] },
    3: { light: colors.red[500], dark: colors.red[300] },
    4: { light: colors.red[400], dark: colors.red[400] },
  },
  warning: {
    0: { light: colors.yellow[800], dark: colors.yellow[300] },
    2: { light: colors.yellow[700], dark: colors.yellow[400] },
    3: { light: colors.yellow[600], dark: colors.yellow[500] },
    4: { light: colors.yellow[500], dark: colors.yellow[600] },
  },
  orange: {
    0: { light: colors.orange[800], dark: colors.orange[100] },
    2: { light: colors.orange[700], dark: colors.orange[200] },
    3: { light: colors.orange[600], dark: colors.orange[300] },
    4: { light: colors.orange[500], dark: colors.orange[400] },
  },
  purple: {
    1: { light: colors.purple[700], dark: colors.purple[200] },
    2: { light: colors.purple[600], dark: colors.purple[300] },
    3: { light: colors.purple[500], dark: colors.purple[400] },
    4: { light: colors.purple[400], dark: colors.purple[500] },
  },
  disabled: {
    default: { light: colors.grey[500], dark: colors.grey[700] },
    "on-color": { light: colors.grey[500], dark: colors.grey[800] },
  },
} as const;

export type TextTokens = typeof text;
