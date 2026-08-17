'use client';

import { useColorScheme as useMuiColorScheme } from '@mui/material/styles';

/**
 * Read and change the colour scheme the app is running in.
 *
 * `NeofloThemeProvider` sets the starting scheme through `defaultMode`,
 * which is a build-time decision. This is the runtime one: the hook an
 * in-app switch needs, so a consumer can offer light/dark without
 * importing from `@mui/material` and stepping outside the design system.
 *
 * Re-exported under MUI's own name rather than renamed. The rule about
 * showing a Neoflo API instead of a Material one exists to hide Material
 * vocabulary — `variant="contained"` — and there is none here: the
 * concept is the colour scheme, the name says so, and keeping it means
 * every answer written about `useColorScheme` still applies.
 *
 * Two things to know before using it:
 *
 *   - **`mode` is `undefined` on the first render**, before the stored
 *     preference has been read. Render the space rather than a guess, or
 *     the control visibly flips after hydration.
 *   - **The choice is persisted** to `localStorage` by the provider, so
 *     it survives a reload. That is a preference about the app rather
 *     than data inside it, which is why it is the one piece of stored
 *     state a prototype should keep.
 *
 * @example
 * const { mode, setMode } = useColorScheme();
 *
 * if (!mode) {
 *   return <IconButton aria-label="Colour scheme" sx={{ visibility: 'hidden' }} />;
 * }
 *
 * return (
 *   <IconButton
 *     variant="secondary"
 *     appearance="text"
 *     aria-label={mode === 'dark' ? 'Switch to light' : 'Switch to dark'}
 *     onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
 *   >
 *     {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
 *   </IconButton>
 * );
 */
export function useColorScheme(): ReturnType<typeof useMuiColorScheme> {
  return useMuiColorScheme();
}
