'use client';

import * as React from 'react';
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
 * Framework-agnostic: applies the Neoflo MUI theme, `CssBaseline`, and the
 * Phosphor `IconContext` defaults so every icon imported from
 * `@neoflo/atoms/icons` inherits Neoflo defaults without per-call props.
 * Works in any React host (Vite, CRA, Next, etc.).
 *
 * SSR Emotion cache wiring is intentionally NOT included here so the library
 * stays decoupled from any framework. Host apps that need it add their own
 * cache provider around this one -- the Next.js docs site wraps it with
 * `AppRouterCacheProvider` in `app/layout.tsx`.
 *
 * Re-exported from the package root so consumers can wrap their own apps.
 */
export function NeofloThemeProvider({ children }: NeofloThemeProviderProps) {
  return (
    <MuiThemeProvider theme={neofloTheme} defaultMode="system" disableTransitionOnChange>
      <CssBaseline />
      <IconContext.Provider value={NEOFLO_ICON_DEFAULTS}>
        {children}
      </IconContext.Provider>
    </MuiThemeProvider>
  );
}

NeofloThemeProvider.displayName = 'NeofloThemeProvider';
