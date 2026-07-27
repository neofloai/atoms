import { colors } from './colors';

/**
 * Border semantic tokens.
 *
 * Mirrors the shape of `surface` — same groups (`layers`, `default`,
 * per-role, `disabled`) but interaction states are `default` /
 * `defaultHover` / `focus` (no `pressed`).
 *
 * Generated from the Figma DTCG export.
 */

import type { ModeToken } from './surface';
export type { ModeToken };

export const border = {
  layers: {
    page: { light: colors.grey[75], dark: colors.grey[1100] },
    card1: { light: colors.grey[150], dark: colors.grey[950] },
    card2: { light: colors.grey[200], dark: colors.grey[900] },
    card3: { light: colors.grey[200], dark: colors.grey[800] },
    card4OnColor: { light: colors.grey[800], dark: colors.grey[300] },
    card5OnColor: { light: colors.grey[700], dark: colors.grey[400] },
    card6OnColor: { light: colors.grey[600], dark: colors.grey[500] },
  },
  default: {
    default: { light: colors.grey[300], dark: colors.grey[700] },
    defaultHover: { light: colors.grey[400], dark: colors.grey[600] },
    defaultPressed: { light: colors.grey[500], dark: colors.grey[500] },
  },
  primary: {
    default: { light: colors.primary[100], dark: colors.primary[700] },
    defaultHover: { light: colors.primary[200], dark: colors.primary[600] },
    focus: { light: colors.primary[300], dark: colors.primary[700] },
  },
  information: {
    default: { light: colors.blue[600], dark: colors.blue[700] },
    defaultHover: { light: colors.blue[700], dark: colors.blue[600] },
    focus: { light: colors.blue[800], dark: colors.blue[700] },
  },
  success: {
    default: { light: colors.green[100], dark: colors.green[700] },
    defaultHover: { light: colors.green[200], dark: colors.green[600] },
    focus: { light: colors.green[300], dark: colors.green[700] },
  },
  error: {
    default: { light: colors.red[100], dark: colors.red[800] },
    defaultHover: { light: colors.red[200], dark: colors.red[700] },
    focus: { light: colors.red[300], dark: colors.red[800] },
  },
  warning: {
    default: { light: colors.yellow[400], dark: colors.yellow[900] },
    defaultHover: { light: colors.yellow[500], dark: colors.yellow[800] },
    focus: { light: colors.yellow[600], dark: colors.yellow[800] },
  },
  disabled: {
    default: { light: colors.grey[300], dark: colors.grey[900] },
  },
} as const;

export type BorderTokens = typeof border;
