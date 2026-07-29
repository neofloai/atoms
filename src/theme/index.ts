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
 */
export const neofloTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data',
  },
  defaultColorScheme: 'light',
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
