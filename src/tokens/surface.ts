import { colors } from './colors';

/**
 * Surface semantic tokens.
 *
 * Generated from Figma DTCG export (`light.tokens.json` +
 * `dark.tokens.json`). Every leaf is a `{ light, dark }` pair so
 * components automatically pick up the right value when the MUI
 * colour scheme flips.
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
 * sourced from the `purple` raw scale.
 */

export interface ModeToken {
  readonly light: string;
  readonly dark: string;
}

export const surface = {
  layers: {
    page: { light: colors.grey[100], dark: colors.grey[1200] },
    card1: { light: colors.grey[25], dark: colors.grey[1050] },
    card2: { light: colors.grey[75], dark: colors.grey[1000] },
    card3: { light: colors.grey[100], dark: colors.grey[900] },
    card4OnColor: { light: colors.grey[1000], dark: colors.grey[200] },
    card5OnColor: { light: colors.grey[900], dark: colors.grey[300] },
    card6OnColor: { light: colors.grey[800], dark: colors.grey[400] },
  },
  default: {
    default: { light: colors.grey[100], dark: colors.grey[1050] },
    defaultHover: { light: colors.grey[200], dark: colors.grey[1000] },
    defaultPressed: { light: colors.grey[300], dark: colors.grey[900] },
  },
  primary: {
    default: { light: colors.primary[600], dark: colors.primary[400] },
    defaultHover: { light: colors.primary[700], dark: colors.primary[500] },
    defaultPressed: { light: colors.primary[800], dark: colors.primary[600] },
    subtle: { light: colors.primary[75], dark: colors.primary[1000] },
    subtleHover: { light: colors.primary[100], dark: colors.primary[900] },
    subtlePressed: { light: colors.primary[200], dark: colors.primary[800] },
  },
  information: {
    default: { light: colors.purple[500], dark: colors.purple[600] },
    defaultHover: { light: colors.purple[600], dark: colors.purple[700] },
    defaultPressed: { light: colors.purple[700], dark: colors.purple[800] },
    subtle: { light: colors.purple[75], dark: colors.purple[1000] },
    subtleHover: { light: colors.purple[100], dark: colors.purple[900] },
    subtlePressed: { light: colors.purple[200], dark: colors.purple[800] },
  },
  success: {
    default: { light: colors.green[600], dark: colors.green[600] },
    defaultHover: { light: colors.green[700], dark: colors.green[700] },
    defaultPressed: { light: colors.green[800], dark: colors.green[800] },
    subtle: { light: colors.green[75], dark: colors.green[1100] },
    subtleHover: { light: colors.green[100], dark: colors.green[1000] },
    subtlePressed: { light: colors.green[200], dark: colors.green[900] },
  },
  error: {
    default: { light: colors.red[600], dark: colors.red[300] },
    defaultHover: { light: colors.red[700], dark: colors.red[400] },
    defaultPressed: { light: colors.red[800], dark: colors.red[500] },
    subtle: { light: colors.red[50], dark: colors.red[1000] },
    subtleHover: { light: colors.red[100], dark: colors.red[900] },
    subtlePressed: { light: colors.red[200], dark: colors.red[800] },
  },
  warning: {
    default: { light: colors.yellow[600], dark: colors.yellow[600] },
    defaultHover: { light: colors.yellow[700], dark: colors.yellow[700] },
    defaultPressed: { light: colors.yellow[800], dark: colors.yellow[800] },
    subtle: { light: colors.yellow[50], dark: colors.yellow[1000] },
    subtleHover: { light: colors.yellow[100], dark: colors.yellow[900] },
    subtlePressed: { light: colors.yellow[200], dark: colors.yellow[800] },
  },
  disabled: {
    default: { light: colors.grey[200], dark: colors.grey[1000] },
  },
} as const;

export type SurfaceTokens = typeof surface;
