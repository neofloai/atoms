import { colors } from './colors';

/**
 * Icon semantic tokens.
 *
 * Identical shape to `text` — designers use the same typography slots
 * (heading/body/caption/placeholder, role-specific onColorHover) for
 * icon colours so an icon next to a body string can pick up the
 * matching token automatically.
 *
 * Generated from the Figma "component" variable collection export
 * (2026-07-29) — see `./text.ts` for the naming-drift caveats this
 * sync carried over (only `caption` and `default`'s renamed slots are
 * confirmed; accent-role `heading`/`body` are unchanged). `error`'s
 * `onColorHover` was additionally confirmed (light mode only) via the
 * TextField status-icon spec (node 3179:106156): `icon/error/4` = `red/400`.
 */

import type { ModeToken } from './surface';
export type { ModeToken };

export const icon = {
  default: {
    heading: { light: colors.grey[1200], dark: colors.grey[25] },
    body: { light: colors.grey[800], dark: colors.grey[300] },
    caption: { light: colors.grey[650], dark: colors.grey[600] },
    placeholder: { light: colors.grey[625], dark: colors.grey[650] },
    subtle: { light: colors.grey[500], dark: colors.grey[700] },
    headingOnColor: { light: colors.grey[25], dark: colors.grey[1100] },
    bodyOnColor: { light: colors.grey[100], dark: colors.grey[900] },
    captionOnColor: { light: colors.grey[300], dark: colors.grey[700] },
    placeholderOnColor: { light: colors.grey[500], dark: colors.grey[600] },
  },
  primary: {
    heading: { light: colors.primary[800], dark: colors.primary[200] },
    body: { light: colors.primary[700], dark: colors.primary[300] },
    caption: { light: colors.primary[600], dark: colors.primary[300] },
    onColorHover: { light: colors.primary[500], dark: colors.primary[500] },
  },
  information: {
    heading: { light: colors.blue[800], dark: colors.blue[200] },
    body: { light: colors.blue[700], dark: colors.blue[300] },
    caption: { light: colors.blue[600], dark: colors.blue[300] },
    onColorHover: { light: colors.blue[500], dark: colors.blue[500] },
  },
  success: {
    heading: { light: colors.green[1000], dark: colors.green[50] },
    body: { light: colors.green[900], dark: colors.green[75] },
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
  disabled: {
    default: { light: colors.grey[500], dark: colors.grey[700] },
    onColor: { light: colors.grey[500], dark: colors.grey[600] },
  },
} as const;

export type IconTokens = typeof icon;
