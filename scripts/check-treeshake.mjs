/**
 * Proves a consumer only ships the components it imports.
 *
 * Bundles the built package the way an app's production build does —
 * minified, tree-shaken, under the package's own `sideEffects` list — once
 * importing a single `Button`, and fails if anything from DataGrid, the
 * date pickers or dayjs survives: those are the heaviest dependencies and
 * the ones an app that never draws a grid or a calendar should never pay
 * for. Then checks the brand fonts are still imported, because the fonts
 * are the one side effect the package must keep, and a split that dropped
 * them would ship every app in a fallback typeface. Run after `tsup`.
 *
 * It fails the day the library goes back to one module, or a component
 * gains a top-level import of something heavy it does not need.
 */
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const HEAVY = ['@mui/x-data-grid', '@mui/x-date-pickers'];
const FONTS = '@fontsource/';

/**
 * What the theme provider is allowed to take from the pickers package.
 *
 * `NeofloThemeProvider` mounts MUI X's `LocalizationProvider` on the
 * Day.js adapter so a `DatePicker` works anywhere with nothing to
 * configure — a deliberate ~7.5 KB, documented in `ThemeProvider.tsx`.
 * Those two are the whole allowance: any other name from the package
 * means picker code is shipping in an app that has no picker.
 */
const ALLOWED = {
  '@mui/x-date-pickers': new Set(['LocalizationProvider']),
  '@mui/x-date-pickers/AdapterDayjs': new Set(['AdapterDayjs']),
};

/** Every `name` imported from a package that starts with one of HEAVY. */
function heavyImports(code) {
  const found = [];
  const pattern = /import\s*\{([^}]*)\}\s*from\s*"([^"]+)"/g;
  for (const [, names, source] of code.matchAll(pattern)) {
    if (!HEAVY.some((pkg) => source === pkg || source.startsWith(`${pkg}/`))) continue;
    for (const spec of names.split(',')) {
      const name = spec.trim().split(/\s+as\s+/)[0];
      if (name && !ALLOWED[source]?.has(name)) found.push(`${name} from ${source}`);
    }
  }
  return found;
}

async function bundle(contents) {
  const result = await esbuild.build({
    stdin: { contents, resolveDir: root },
    bundle: true,
    write: false,
    minify: true,
    format: 'esm',
    platform: 'browser',
    // Dependencies stay as import statements, so what survives is the
    // list of packages the consumer's bundler would go on to pull in.
    packages: 'external',
    define: { 'process.env.NODE_ENV': '"production"' },
    logLevel: 'silent',
  });
  return result.outputFiles[0].text;
}

const one = await bundle(
  "import { Button } from './dist/index.mjs'; console.log(Button);"
);
const all = await bundle("export * from './dist/index.mjs';");

const failures = [];
const leaked = heavyImports(one);
if (leaked.length > 0) {
  failures.push(`importing Button alone still pulls in ${leaked.join(', ')}`);
}
if (!one.includes(FONTS)) {
  failures.push('importing Button no longer imports the brand fonts');
}
// The control: the full surface must reach both packages beyond the
// allowance, or the check above proves nothing.
const reached = heavyImports(all);
for (const pkg of HEAVY) {
  if (!reached.some((entry) => entry.endsWith(`from ${pkg}`))) {
    failures.push(`the full bundle imports nothing from ${pkg} — the check has lost its control`);
  }
}

if (failures.length) {
  for (const failure of failures) console.error(`check:treeshake — ${failure}`);
  process.exit(1);
}
console.log(
  `check:treeshake — ok (Button alone ${(one.length / 1024).toFixed(1)} kB, everything ${(all.length / 1024).toFixed(1)} kB)`
);
