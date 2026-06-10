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
    page: { light: colors.grey[200], dark: colors.grey[1000] },
    card1: { light: colors.grey[200], dark: colors.grey[900] },
    card2: { light: colors.grey[300], dark: colors.grey[800] },
    card3: { light: colors.grey[400], dark: colors.grey[700] },
    card4OnColor: { light: colors.grey[800], dark: colors.grey[300] },
    card5OnColor: { light: colors.grey[700], dark: colors.grey[400] },
    card6OnColor: { light: colors.grey[600], dark: colors.grey[500] },
  },
  default: {
    default: { light: colors.grey[200], dark: colors.grey[900] },
    defaultHover: { light: colors.grey[300], dark: colors.grey[800] },
    defaultPressed: { light: colors.grey[400], dark: colors.grey[700] },
  },
  primary: {
    default: { light: colors.primary[700], dark: colors.primary[600] },
    defaultHover: { light: colors.primary[800], dark: colors.primary[700] },
    focus: { light: colors.primary[900], dark: colors.primary[800] },
  },
  information: {
    default: { light: colors.purple[600], dark: colors.purple[500] },
    defaultHover: { light: colors.purple[700], dark: colors.purple[600] },
    focus: { light: colors.purple[800], dark: colors.purple[700] },
  },
  success: {
    default: { light: colors.green[700], dark: colors.green[800] },
    defaultHover: { light: colors.green[800], dark: colors.green[900] },
    focus: { light: colors.green[900], dark: colors.green[1000] },
  },
  error: {
    default: { light: colors.red[700], dark: colors.red[800] },
    defaultHover: { light: colors.red[800], dark: colors.red[900] },
    focus: { light: colors.red[900], dark: colors.red[1000] },
  },
  warning: {
    default: { light: colors.yellow[600], dark: colors.yellow[700] },
    defaultHover: { light: colors.yellow[700], dark: colors.yellow[800] },
    focus: { light: colors.yellow[800], dark: colors.yellow[900] },
  },
  disabled: {
    default: { light: colors.grey[300], dark: colors.grey[900] },
  },
} as const;

export type BorderTokens = typeof border;
