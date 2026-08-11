import { colors } from './colors';

/**
 * Icon semantic tokens.
 *
 * Identical shape to `text`, and as of the 2026-08-11 export identical
 * *values* too on every accent role — designers use the same typography
 * slots for icon colours so an icon next to a body string picks up the
 * matching token automatically. Only `default`'s `subtle` rung and
 * `disabled.onColor` still differ between the two.
 *
 * Generated from the Figma "component" collection DTCG export; see
 * `./text.ts` for how the numbered Figma slots map to these names.
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
    onColorHover: { light: colors.yellow[500], dark: colors.yellow[500] },
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
    onColor: { light: colors.grey[500], dark: colors.grey[600] },
  },
} as const;

export type IconTokens = typeof icon;
