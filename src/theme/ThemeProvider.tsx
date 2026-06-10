'use client';

import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { IconContext } from '@phosphor-icons/react';
import { neofloTheme } from '@/src/theme';

interface NeofloThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Defaults applied to every Phosphor icon rendered inside Neoflo apps.
 *
 *   - `size: 24`     matches `radius.xl` and the design system's default
 *                    control glyph size.
 *   - `weight: regular`  is Phosphor's default and matches the design.
 *   - `color: currentColor`  lets icons inherit the parent text colour,
 *                    which is already driven by MUI palette/text tokens.
 *
 * Consumers can override per-instance (`<ShieldCheck size={16} />`) or
 * scope a different default by nesting another `IconContext.Provider`.
 */
const NEOFLO_ICON_DEFAULTS = {
  size: 24,
  weight: 'regular',
  color: 'currentColor',
  mirrored: false,
} as const;

/**
 * Root client provider for Atoms.
 *
 * `AppRouterCacheProvider` collects Emotion CSS during SSR/streaming so
 * styles land in `<head>` rather than `<body>`. `enableCssLayer` wraps
 * MUI output in `@layer mui` so any future global CSS can override it
 * without specificity battles.
 *
 * Wraps `IconContext.Provider` so every Phosphor icon imported from
 * `@neoflo/atoms/icons` inherits Neoflo defaults without per-call props.
 *
 * Re-exported from the package root so consumers can wrap their own apps.
 */
export function NeofloThemeProvider({ children }: NeofloThemeProviderProps) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <MuiThemeProvider theme={neofloTheme} defaultMode="system" disableTransitionOnChange>
        <CssBaseline />
        <IconContext.Provider value={NEOFLO_ICON_DEFAULTS}>
          {children}
        </IconContext.Provider>
      </MuiThemeProvider>
    </AppRouterCacheProvider>
  );
}

NeofloThemeProvider.displayName = 'NeofloThemeProvider';
