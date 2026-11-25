import { readdirSync } from 'node:fs';

import { defineConfig } from 'tsup';

import type { Options } from 'tsup';

/** The four core entry points. */
const CORE_ENTRIES = {
  index: 'src/index.ts',
  icons: 'src/icons/index.ts',
  tokens: 'src/tokens/index.ts',
  theme: 'src/theme/index.ts',
};

/**
 * The chat's entry points, each its own subpath so an app pays only for
 * the layer it imports: `chat` (the UI and the headless engine under it),
 * `chat/core` and `chat/mock` (no React, so server code can import them),
 * and `chat/charts` (the only one that reaches Recharts). The root barrel
 * never imports any of them — `check:treeshake` proves it.
 */
const CHAT_ENTRIES = {
  chat: 'src/chat/index.ts',
  'chat/core': 'src/chat/core.ts',
  'chat/charts': 'src/chat/charts.ts',
  'chat/mock': 'src/chat/mock.ts',
};

/** Every public entry point — the only paths `exports` lets a consumer import. */
const PUBLIC_ENTRIES = { ...CORE_ENTRIES, ...CHAT_ENTRIES };

/**
 * One extra ESM entry per component, so esbuild splits each into its own
 * chunk and `index.mjs` becomes a list of re-exports.
 *
 * Without them the whole library is one module, and a consumer's bundler
 * can only shake it statement by statement — which it cannot do past a
 * top-level `styled()` call, so every component and its dependencies
 * (DataGrid, the date pickers, dayjs) ship in every app. As separate
 * chunks under the package's `sideEffects` list, an unused component is
 * an unused file and is dropped whole. `check:treeshake` proves it.
 *
 * These files are not public: `exports` only maps the four entries
 * above, so nothing outside the package can import them.
 */
const COMPONENT_ENTRIES = Object.fromEntries(
  readdirSync('src/components', { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
    .map((entry) => [`components/${entry.name}/index`, `src/components/${entry.name}/index.ts`])
);

const shared: Options = {
  tsconfig: 'tsconfig.lib.json',
  sourcemap: true,
  // The builds write to dist at once; build:lib empties it first instead.
  clean: false,
  external: [
    'react',
    'react-dom',
    '@mui/material',
    '@mui/icons-material',
    '@emotion/react',
    '@emotion/styled',
    '@emotion/cache',
    '@mui/material-nextjs',
    '@phosphor-icons/react',
    // Self-hosted brand fonts. Kept external so their `.css` side-effect
    // imports pass through to the consumer's bundler (Vite, Next, CRA all
    // resolve `@fontsource/*` CSS), instead of esbuild trying to inline them.
    '@fontsource/dm-sans',
    '@fontsource/dm-mono',
    '@fontsource/instrument-serif',
    // The chat's optional peers. An app installs them only when it imports
    // `@neofloai/atoms/chat` (or `/chat/charts` for Recharts), so they are
    // never bundled and never reached from the root entry.
    'react-markdown',
    'remark-gfm',
    '@radix-ui/react-slot',
    'recharts',
  ],
  outDir: 'dist',
};

export default defineConfig([
  {
    ...shared,
    entry: { ...PUBLIC_ENTRIES, ...COMPONENT_ENTRIES },
    format: ['esm'],
    splitting: true,
    treeshake: true,
    // Types for the public entries only; the component entries are an
    // implementation detail of the split.
    dts: { entry: PUBLIC_ENTRIES },
  },
  {
    // CommonJS stays one file per entry. esbuild only splits ESM, and
    // every bundler that shakes resolves the `import` condition anyway.
    ...shared,
    entry: CORE_ENTRIES,
    format: ['cjs'],
    splitting: false,
    treeshake: true,
    dts: { entry: CORE_ENTRIES },
  },
  {
    // The chat's CommonJS build is split, unlike the core one: its four
    // entries share live state — React contexts, the error classes the
    // runtime checks with `instanceof`, the block registry — and one copy
    // per file would give `/chat/charts` a context `/chat` never provides
    // and `/chat/mock` errors the runtime does not recognise. tsup's CJS
    // splitting keeps one module instance across them.
    ...shared,
    entry: CHAT_ENTRIES,
    format: ['cjs'],
    splitting: true,
    treeshake: true,
    dts: { entry: CHAT_ENTRIES },
  },
]);
