import { colors } from './colors';

/**
 * Icon semantic tokens.
 *
 * Identical shape to `text` — designers use the same typography slots
 * (heading/body/caption/placeholder, role-specific on-color-hover) for
 * icon colours so an icon next to a body string can pick up the
 * matching token automatically.
 *
 * Generated from the Figma DTCG export.
 */

import type { ModeToken } from './surface';
export type { ModeToken };

export const icon = {
  default: {
    heading: { light: colors.grey[1200], dark: colors.grey[25] },
    body: { light: colors.grey[900], dark: colors.grey[300] },
    caption: { light: colors.grey[500], dark: colors.grey[600] },
    placeholder: { light: colors.grey[400], dark: colors.grey[700] },
    headingOnColor: { light: colors.grey[25], dark: colors.grey[1100] },
    bodyOnColor: { light: colors.grey[100], dark: colors.grey[900] },
    captionOnColor: { light: colors.grey[300], dark: colors.grey[700] },
    placeholderOnColor: { light: colors.grey[500], dark: colors.grey[600] },
  },
  primary: {
    heading: { light: colors.primary[500], dark: colors.primary[400] },
    body: { light: colors.primary[600], dark: colors.primary[500] },
    caption: { light: colors.primary[600], dark: colors.primary[600] },
    onColorHover: { light: colors.primary[700], dark: colors.primary[700] },
  },
  information: {
    heading: { light: colors.purple[500], dark: colors.purple[600] },
    body: { light: colors.purple[600], dark: colors.purple[700] },
    caption: { light: colors.purple[600], dark: colors.purple[500] },
    onColorHover: { light: colors.purple[700], dark: colors.purple[600] },
  },
  success: {
    heading: { light: colors.green[700], dark: colors.green[600] },
    body: { light: colors.green[800], dark: colors.green[700] },
    caption: { light: colors.green[900], dark: colors.green[500] },
    onColorHover: { light: colors.green[400], dark: colors.green[600] },
  },
  error: {
    heading: { light: colors.red[500], dark: colors.red[600] },
    body: { light: colors.red[600], dark: colors.red[700] },
    caption: { light: colors.red[600], dark: colors.red[500] },
    onColorHover: { light: colors.red[700], dark: colors.red[600] },
  },
  warning: {
    heading: { light: colors.yellow[500], dark: colors.yellow[600] },
    body: { light: colors.yellow[600], dark: colors.yellow[700] },
    caption: { light: colors.yellow[600], dark: colors.yellow[500] },
    onColorHover: { light: colors.yellow[700], dark: colors.yellow[600] },
  },
  disabled: {
    default: { light: colors.grey[400], dark: colors.grey[900] },
    onColor: { light: colors.grey[500], dark: colors.grey[600] },
  },
} as const;

export type IconTokens = typeof icon;
