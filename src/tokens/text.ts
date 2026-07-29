import { colors } from './colors';

/**
 * Text semantic tokens.
 *
 * Per the Figma export, each role exposes typography *slots* rather
 * than interaction states:
 *
 *   text.default.{ heading, body, caption, placeholder, subtle,
 *                  headingOnColor, bodyOnColor, captionOnColor,
 *                  placeholderOnColor }
 *   text.primary.{ heading, body, caption, onColorHover }
 *   text.information.{ ... } (mirrors primary; sourced from `blue`)
 *   text.success.{ ... }     (mirrors primary)
 *   text.error.{ ... }       (mirrors primary)
 *   text.warning.{ ... }     (mirrors primary)
 *   text.orange.{ caption }  (new — see below)
 *   text.purple.{ caption }  (new — see below)
 *   text.disabled.{ default, onColor }
 *
 * Generated from the Figma "component" variable collection export
 * (2026-07-29). That export renamed `default`'s `body`/`caption`/
 * `placeholder` slots to `b1`/`b2`/`b3` (matching the `Sans/B1-B3`
 * type-scale rungs) and added a `subtle` slot; the accent roles
 * (primary/information/success/error/warning) kept a plain numbered
 * `1-4` ladder with no named `body`/`onColorHover` equivalent. Slot
 * *names* below are kept as-is for API stability — only `caption`
 * (verified against the live Button component in a prior sync) and
 * `default`'s renamed slots have a confirmed mapping; `heading` and
 * `body` on the accent roles are unchanged from before this sync
 * pending an explicit design confirmation, since nothing in the
 * codebase currently consumes them.
 *
 * `onColorHover` for `error` was confirmed (light mode only) against
 * the TextField status-text spec (node 3179:106156): `text/error/4`
 * resolves to `red/400`, not the prior `red/700` placeholder. `success`
 * needed no change — its `onColorHover` already resolved to `green/400`,
 * matching that same sync. `warning`'s status colour landed on the
 * already-confirmed `caption` slot (`yellow/700`) instead. `primary`'s
 * `onColorHover` was confirmed the same way (light mode only) against
 * the Avatar spec (node 981:16471, 2026-07-29): `text/primary/4`
 * resolves to `primary/400`, not the prior `primary/500` placeholder.
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
    heading: { light: colors.primary[800], dark: colors.primary[200] },
    body: { light: colors.primary[700], dark: colors.primary[300] },
    caption: { light: colors.primary[600], dark: colors.primary[300] },
    /**
     * Confirmed (light mode only) against the Chip small-tag sheet
     * (node 3156:83830, 2026-07-29): `text/primary/3` resolves to
     * `primary/500`, distinct from both `caption` (600) and
     * `onColorHover` (400). `dark` mirrors `light` as a placeholder
     * pending confirmation.
     */
    accent: { light: colors.primary[500], dark: colors.primary[500] },
    onColorHover: { light: colors.primary[400], dark: colors.primary[500] },
  },
  information: {
    heading: { light: colors.blue[800], dark: colors.blue[200] },
    body: { light: colors.blue[700], dark: colors.blue[300] },
    caption: { light: colors.blue[600], dark: colors.blue[300] },
    onColorHover: { light: colors.blue[500], dark: colors.blue[500] },
  },
  success: {
    heading: { light: colors.green[800], dark: colors.green[50] },
    body: { light: colors.green[600], dark: colors.green[75] },
    caption: { light: colors.green[600], dark: colors.green[200] },
    onColorHover: { light: colors.green[400], dark: colors.green[300] },
  },
  error: {
    heading: { light: colors.red[1000], dark: colors.red[50] },
    body: { light: colors.red[900], dark: colors.red[75] },
    caption: { light: colors.red[600], dark: colors.red[200] },
    onColorHover: { light: colors.red[400], dark: colors.red[300] },
  },
  warning: {
    heading: { light: colors.yellow[900], dark: colors.yellow[50] },
    body: { light: colors.yellow[800], dark: colors.yellow[75] },
    caption: { light: colors.yellow[700], dark: colors.yellow[200] },
    onColorHover: { light: colors.yellow[600], dark: colors.yellow[300] },
  },
  orange: {
    /**
     * New role — the Chip small-tag sheet (node 3156:83830,
     * 2026-07-29) is the first consumer and only ever references this
     * one slot. `dark` mirrors `light` as a placeholder pending
     * confirmation — see DESIGNER_QUESTIONS.md #4.
     */
    caption: { light: colors.orange[600], dark: colors.orange[600] },
  },
  purple: {
    /** Same caveat as `orange` above — only this slot is confirmed. */
    caption: { light: colors.purple[400], dark: colors.purple[400] },
  },
  disabled: {
    default: { light: colors.grey[500], dark: colors.grey[700] },
    onColor: { light: colors.grey[500], dark: colors.grey[600] },
  },
} as const;

export type TextTokens = typeof text;
