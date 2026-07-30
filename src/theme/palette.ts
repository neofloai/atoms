import type { PaletteOptions } from '@mui/material/styles';
import { colors } from '@/src/tokens/colors';

/**
 * Neoflo MUI palette mappings — one per colour scheme.
 *
 * ## Light palette
 *
 * Resynced against the Figma "UI to MUI Mapping" swatch board (node
 * 3342:3325, 2026-07-30), which spells out each role's three shades
 * literally (`palette.<role>.light/main/dark` + hex):
 *
 *   MUI .light  -> scale/400
 *   MUI .main   -> scale/500
 *   MUI .dark   -> scale/600
 *
 * This corrects a prior version of this file, which used `.main` ->
 * scale/600 and `.dark` -> scale/800 — every role's `.light` already
 * matched scale/400, so only `.main`/`.dark` were off by two rungs.
 * `secondary`'s three swatches point at the `surface.layers.*` group
 * rather than a plain grey ladder (`page` / `card-1` / `card-2` =
 * grey/50 / grey/75 / grey/100), replacing the previous grey/25 /
 * grey/100 / grey/300 guess.
 *
 * Role assignments (Figma scale -> MUI palette role):
 *   primary scale -> primary
 *   grey scale    -> secondary (`surface.layers.page/card1/card2`)
 *   red scale     -> error
 *   yellow scale  -> warning
 *   blue scale    -> info
 *   green scale   -> success
 *
 * The board's "Info" row is the one exception: its three swatches are
 * raw hardcoded hex (`#03a9f4` / `#0288d1` / `#01579b`, MUI's own stock
 * info-blue) with no variable reference, unlike every other row which
 * points at a named scale variable — read as a leftover default in the
 * Figma file rather than an intentional colour, since it would
 * otherwise put `theme.palette.info` on a different blue than
 * `surface.information` / `text.information` / Alert / Chip everywhere
 * else in the system. Kept on our own `blue` scale, continuing the
 * same corrected light/main/dark formula, per explicit confirmation.
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
 *     light mode (those mid-tones already read well in both schemes)
 *     — updated alongside the light-palette fix above so that stated
 *     invariant still holds (previously 400/600/800, now 400/500/600).
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
    main: colors.primary[500],
    dark: colors.primary[600],
  },
  secondary: {
    light: colors.grey[50],
    main: colors.grey[75],
    dark: colors.grey[100],
  },
  error: {
    light: colors.red[400],
    main: colors.red[500],
    dark: colors.red[600],
  },
  warning: {
    light: colors.yellow[400],
    main: colors.yellow[500],
    dark: colors.yellow[600],
  },
  info: {
    light: colors.blue[400],
    main: colors.blue[500],
    dark: colors.blue[600],
  },
  success: {
    light: colors.green[400],
    main: colors.green[500],
    dark: colors.green[600],
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
    main: colors.yellow[500],
    dark: colors.yellow[600],
  },
  info: {
    light: colors.blue[400],
    main: colors.blue[500],
    dark: colors.blue[600],
  },
  success: {
    light: colors.green[400],
    main: colors.green[500],
    dark: colors.green[600],
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
