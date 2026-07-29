/**
 * Self-hosted brand fonts.
 *
 * Atoms renders in DM Sans (body/UI) and Instrument Serif (accent).
 * Importing the `@fontsource` stylesheets here as side effects means
 * any host that renders `NeofloThemeProvider` gets the correct
 * `@font-face` rules automatically -- no manual `<link>` tags or
 * `next/font` wiring required.
 *
 * Only the weights the theme actually uses are loaded:
 *   - DM Sans:           400 (regular), 500 (medium), 600 (semibold)
 *   - Instrument Serif:  400 (regular + italic)
 *
 * DM Sans replaced Plus Jakarta Sans as the product sans in the
 * 2026-07-29 token sync (see DESIGNER_QUESTIONS.md #7).
 *
 * The `@fontsource` packages are externalised in `tsup.config.ts`, so the
 * consuming app's bundler resolves and emits these stylesheets.
 */

import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
