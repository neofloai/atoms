import { colors } from './colors';

/**
 * Text semantic tokens.
 *
 * Per the Figma export, each role exposes typography *slots* rather
 * than interaction states:
 *
 *   text.default.{ heading, body, caption, placeholder,
 *                  headingOnColor, bodyOnColor, captionOnColor,
 *                  placeholderOnColor }
 *   text.primary.{ heading, body, caption, onColorHover }
 *   text.information.{ ... } (mirrors primary; sourced from `blue`)
 *   text.success.{ ... }     (mirrors primary)
 *   text.error.{ ... }       (mirrors primary)
 *   text.warning.{ ... }     (mirrors primary)
 *   text.disabled.{ default, onColor }
 *
 * Generated from the Figma DTCG export.
 */

import type { ModeToken } from './surface';
export type { ModeToken };

export const text = {
  default: {
    heading: { light: colors.grey[1200], dark: colors.grey[25] },
    body: { light: colors.grey[900], dark: colors.grey[300] },
    caption: { light: colors.grey[650], dark: colors.grey[600] },
    placeholder: { light: colors.grey[600], dark: colors.grey[650] },
    headingOnColor: { light: colors.grey[25], dark: colors.grey[1100] },
    bodyOnColor: { light: colors.grey[100], dark: colors.grey[900] },
    captionOnColor: { light: colors.grey[300], dark: colors.grey[700] },
    placeholderOnColor: { light: colors.grey[500], dark: colors.grey[600] },
  },
  primary: {
    heading: { light: colors.primary[800], dark: colors.primary[200] },
    body: { light: colors.primary[700], dark: colors.primary[300] },
    caption: { light: colors.primary[600], dark: colors.primary[400] },
    onColorHover: { light: colors.primary[500], dark: colors.primary[500] },
  },
  information: {
    heading: { light: colors.blue[800], dark: colors.blue[200] },
    body: { light: colors.blue[700], dark: colors.blue[300] },
    caption: { light: colors.blue[600], dark: colors.blue[400] },
    onColorHover: { light: colors.blue[500], dark: colors.blue[500] },
  },
  success: {
    heading: { light: colors.green[800], dark: colors.green[50] },
    body: { light: colors.green[600], dark: colors.green[75] },
    caption: { light: colors.green[500], dark: colors.green[200] },
    onColorHover: { light: colors.green[400], dark: colors.green[300] },
  },
  error: {
    heading: { light: colors.red[1000], dark: colors.red[50] },
    body: { light: colors.red[900], dark: colors.red[75] },
    caption: { light: colors.red[800], dark: colors.red[200] },
    onColorHover: { light: colors.red[700], dark: colors.red[300] },
  },
  warning: {
    heading: { light: colors.yellow[900], dark: colors.yellow[50] },
    body: { light: colors.yellow[800], dark: colors.yellow[75] },
    caption: { light: colors.yellow[700], dark: colors.yellow[200] },
    onColorHover: { light: colors.yellow[600], dark: colors.yellow[300] },
  },
  disabled: {
    default: { light: colors.grey[500], dark: colors.grey[700] },
    onColor: { light: colors.grey[500], dark: colors.grey[800] },
  },
} as const;

export type TextTokens = typeof text;
