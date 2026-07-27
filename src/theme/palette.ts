import type { PaletteOptions } from '@mui/material/styles';
import { colors } from '@/src/tokens/colors';

/**
 * Neoflo MUI palette mappings — one per colour scheme.
 *
 * ## Light palette
 *
 * Per the designer's "UI to MUI Mapping" spec:
 *
 *   MUI .light  -> scale/400
 *   MUI .main   -> scale/600
 *   MUI .dark   -> scale/800
 *
 * Role assignments (Figma scale -> MUI palette role):
 *   primary scale -> primary
 *   grey scale    -> secondary (uses 25 / 100 / 300 — designer's choice)
 *   red scale     -> error
 *   yellow scale  -> warning
 *   blue scale    -> info
 *   green scale   -> success
 *
 * ## Dark palette
 *
 * Derived from the Figma DTCG export's semantic tokens
 * (`surface.<role>.default.dark`, `text.default.*.dark`, etc.).
 * The designer's chosen pattern is:
 *
 *   - `primary` and `error` shift *lighter* in dark mode (better
 *     contrast against a near-black page), so their .main lands on a
 *     low-numbered shade.
 *   - `warning`, `info`, and `success` keep the same shade family as
 *     light mode (those mid-tones already read well in both schemes).
 *   - `secondary` mirrors the light-mode "neutral surface" pattern but
 *     uses the dark end of the grey scale.
 *
 * Background, text, and divider values are pulled directly from the
 * surface/text/border semantic tokens so this palette stays consistent
 * with the rest of the system.
 *
 * `contrastText` is omitted on every role so MUI auto-computes it from
 * `main` using the WCAG luminance heuristic.
 */
export const lightPalette: PaletteOptions = {
  mode: 'light',
  primary: {
    light: colors.primary[400],
    main: colors.primary[600],
    dark: colors.primary[800],
  },
  secondary: {
    light: colors.grey[25],
    main: colors.grey[100],
    dark: colors.grey[300],
  },
  error: {
    light: colors.red[400],
    main: colors.red[600],
    dark: colors.red[800],
  },
  warning: {
    light: colors.yellow[400],
    main: colors.yellow[600],
    dark: colors.yellow[800],
  },
  info: {
    light: colors.blue[400],
    main: colors.blue[600],
    dark: colors.blue[800],
  },
  success: {
    light: colors.green[400],
    main: colors.green[600],
    dark: colors.green[800],
  },
  background: {
    default: colors.grey[100],
    paper: colors.grey[25],
  },
  text: {
    primary: colors.grey[1100],
    secondary: colors.grey[700],
    disabled: colors.grey[500],
  },
  divider: colors.grey[200],
};

export const darkPalette: PaletteOptions = {
  mode: 'dark',
  primary: {
    light: colors.primary[200],
    main: colors.primary[400],
    dark: colors.primary[600],
  },
  secondary: {
    light: colors.grey[900],
    main: colors.grey[1000],
    dark: colors.grey[1100],
  },
  error: {
    light: colors.red[200],
    main: colors.red[300],
    dark: colors.red[500],
  },
  warning: {
    light: colors.yellow[400],
    main: colors.yellow[600],
    dark: colors.yellow[800],
  },
  info: {
    light: colors.blue[400],
    main: colors.blue[600],
    dark: colors.blue[800],
  },
  success: {
    light: colors.green[400],
    main: colors.green[600],
    dark: colors.green[800],
  },
  background: {
    default: colors.grey[1200],
    paper: colors.grey[1050],
  },
  text: {
    primary: colors.grey[25],
    secondary: colors.grey[200],
    disabled: colors.grey[500],
  },
  divider: colors.grey[1000],
};
