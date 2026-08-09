'use client';

import { createTheme } from '@mui/material/styles';
import { radius } from '@/src/tokens';
import { darkPalette, lightPalette } from './palette';
import { shadows } from './shadows';
import { neofloTypography } from './typography';

/**
 * Neoflo MUI theme.
 *
 * Built from raw values in `src/tokens/`. Lives in a `'use client'`
 * module so `createTheme` is evaluated in a client context, preventing
 * RSC serialisation errors when imported from the root layout.
 *
 * Composition:
 *   - colour schemes: light + dark (palette derived from semantic tokens)
 *   - typography:     DM Sans + the H1-H6 / B1-B2 / caption scale
 *   - shadows:        small / medium / large mapped across MUI's 25 slots
 *   - shape:          `theme.shape.borderRadius` set to `radius.sm` (8px),
 *                     matching the design system's default control radius.
 *                     Components needing other radii should import the
 *                     `radius` token directly.
 *   - motion:         `reducedMotion: 'system'`, so every transition in
 *                     the library honours the OS preference (see below).
 *
 * ## Motion
 *
 * `theme.transitions` is left at MUI's Material durations and easings.
 * That is deliberate rather than an oversight: the Product Design
 * System specifies no motion at all — no durations, no curves, no
 * transition variants on any component sheet — so there is nothing to
 * map these to, and inventing values would put a brand decision in
 * code with no designer behind it. See `DESIGNER_QUESTIONS.md` #25.
 *
 * `motion.reducedMotion` is the one motion value this theme does set.
 * MUI 9 defaults it to `'never'`, which means every transition it
 * ships ignores `prefers-reduced-motion` unless the theme opts in.
 * `'system'` follows the OS setting, so `Fade`, `Grow`, `Slide`,
 * `Zoom`, and `Collapse` — plus the transitions inside `Menu` and
 * anything else built on MUI internals — complete instantly for a user
 * who has asked for less motion. The state change still happens; only
 * the tween is dropped. Individual transitions can opt out with
 * `disablePrefersReducedMotion`.
 *
 * This resolves the open item raised in `DESIGNER_QUESTIONS.md` #24.
 * `Skeleton` keeps its own hand-written reduced-motion rules on top of
 * this, so it stays correct for consumers who bring their own theme.
 */
export const neofloTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data',
  },
  defaultColorScheme: 'light',
  motion: {
    reducedMotion: 'system',
  },
  colorSchemes: {
    light: {
      palette: lightPalette,
    },
    dark: {
      palette: darkPalette,
    },
  },
  typography: neofloTypography,
  shadows,
  shape: {
    borderRadius: radius.sm,
  },
});

export default neofloTheme;
