/**
 * Self-hosted brand fonts.
 *
 * Atoms renders in Plus Jakarta Sans (body/UI) and Instrument Serif
 * (accent). Importing the `@fontsource` stylesheets here as side effects
 * means any host that renders `NeofloThemeProvider` gets the correct
 * `@font-face` rules automatically -- no manual `<link>` tags or
 * `next/font` wiring required.
 *
 * Only the weights the theme actually uses are loaded:
 *   - Plus Jakarta Sans: 400 (regular), 500 (medium), 700 (bold)
 *   - Instrument Serif:  400 (regular + italic)
 *   - DM Sans:           500 (medium) — `Button`'s label only, per the
 *                        live Figma spec; not yet the system-wide sans.
 *
 * The `@fontsource` packages are externalised in `tsup.config.ts`, so the
 * consuming app's bundler resolves and emits these stylesheets.
 */

import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource/dm-sans/500.css';
