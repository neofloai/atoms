import { colors } from './colors';

/**
 * Surface semantic tokens.
 *
 * Generated from the Figma "component" variable collection export
 * (2026-07-29). Every leaf is a `{ light, dark }` pair so components
 * automatically pick up the right value when the MUI colour scheme
 * flips.
 *
 * Groups:
 *   - `layers`        -> page background + four nested card surfaces
 *                       (cards 4–6 are "on-color" inverse variants)
 *   - `default`       -> neutral default surface + hover/pressed states
 *   - `<role>`        -> primary, information, success, error, warning
 *                       each with default/default-hover/default-pressed
 *                       plus subtle/subtle-hover/subtle-pressed
 *   - `disabled`      -> single disabled surface
 *
 * `information` corresponds to MUI's `info` palette role; values are
 * sourced from the `blue` raw scale.
 */

export interface ModeToken {
  readonly light: string;
  readonly dark: string;
}

export const surface = {
  layers: {
    page: { light: colors.grey[50], dark: colors.grey[1075] },
    card1: { light: colors.grey[75], dark: colors.grey[1000] },
    card2: { light: colors.grey[100], dark: colors.grey[950] },
    card3: { light: colors.grey[150], dark: colors.grey[900] },
    card4OnColor: { light: colors.grey[1000], dark: colors.grey[200] },
    card5OnColor: { light: colors.grey[900], dark: colors.grey[300] },
    card6OnColor: { light: colors.grey[800], dark: colors.grey[400] },
  },
  default: {
    default: { light: colors.grey[100], dark: colors.grey[1000] },
    defaultHover: { light: colors.grey[200], dark: colors.grey[950] },
    defaultPressed: { light: colors.grey[300], dark: colors.grey[900] },
  },
  primary: {
    default: { light: colors.primary[500], dark: colors.primary[600] },
    defaultHover: { light: colors.primary[400], dark: colors.primary[700] },
    defaultPressed: { light: colors.primary[200], dark: colors.primary[800] },
    subtle: { light: colors.primary[50], dark: colors.primary[1000] },
    subtleHover: { light: colors.primary[75], dark: colors.primary[900] },
    subtlePressed: { light: colors.primary[100], dark: colors.primary[800] },
  },
  information: {
    default: { light: colors.blue[75], dark: colors.blue[900] },
    defaultHover: { light: colors.blue[100], dark: colors.blue[800] },
    defaultPressed: { light: colors.blue[200], dark: colors.blue[700] },
    subtle: { light: colors.blue[100], dark: colors.blue[1100] },
    subtleHover: { light: colors.blue[200], dark: colors.blue[1000] },
    subtlePressed: { light: colors.blue[300], dark: colors.blue[900] },
  },
  success: {
    default: { light: colors.green[75], dark: colors.green[900] },
    defaultHover: { light: colors.green[100], dark: colors.green[800] },
    defaultPressed: { light: colors.green[200], dark: colors.green[700] },
    subtle: { light: colors.green[25], dark: colors.green[1000] },
    subtleHover: { light: colors.green[50], dark: colors.green[900] },
    subtlePressed: { light: colors.green[75], dark: colors.green[800] },
  },
  error: {
    default: { light: colors.red[75], dark: colors.red[900] },
    defaultHover: { light: colors.red[100], dark: colors.red[800] },
    defaultPressed: { light: colors.red[200], dark: colors.red[700] },
    subtle: { light: colors.red[25], dark: colors.red[1100] },
    subtleHover: { light: colors.red[50], dark: colors.red[1000] },
    subtlePressed: { light: colors.red[75], dark: colors.red[900] },
  },
  warning: {
    default: { light: colors.yellow[100], dark: colors.yellow[900] },
    defaultHover: { light: colors.yellow[200], dark: colors.yellow[800] },
    defaultPressed: { light: colors.yellow[300], dark: colors.yellow[700] },
    subtle: { light: colors.yellow[50], dark: colors.yellow[1100] },
    subtleHover: { light: colors.yellow[75], dark: colors.yellow[1000] },
    subtlePressed: { light: colors.yellow[100], dark: colors.yellow[900] },
  },
  disabled: {
    default: { light: colors.grey[200], dark: colors.grey[900] },
  },
} as const;

export type SurfaceTokens = typeof surface;
