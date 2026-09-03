/**
 * Fails the library build if the icon barrel has been re-bundled into an
 * entry as a runtime namespace object.
 *
 * This check exists because the failure it catches is invisible in every
 * place a person would look. `@phosphor-icons/react` is external, so the
 * published bundle is ~250 KB whether the leak is there or not; the
 * weight only appears once a consumer resolves the import, and then it is
 * ~6 MB of icons in an app that imported one button. Nobody reviewing a
 * diff, reading the dist output, or checking the package size would see
 * it. A CI check is the only thing that would.
 *
 * The mechanism, and why the pattern below is the right thing to grep
 * for: when esbuild bundles `export * from '<external>'`, it cannot see
 * the star's names, so it emits a namespace import and copies it onto an
 * object at runtime — `import * as react_star`, then
 * `__reExport(icons_exports, react_star)` — and rewrites every use into a
 * property lookup. The namespace import is the necessary first step, so
 * its absence is proof the leak is gone. See `src/icons/glyphs.ts` for
 * the full explanation and the fix.
 *
 * `icons.mjs` is exempt. It is the `@neofloai/atoms/icons` subpath, whose
 * entire job is to forward the whole set, and as an entry rather than a
 * bundled dependency it compiles to a real `export * from` — a static
 * re-export the consumer's bundler can still shake.
 */

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = 'dist';

/** The subpath whose whole purpose is to forward the set. */
const EXEMPT = new Set(['icons.mjs', 'icons.js']);

/** The package a leak would pull in wholesale. */
const BARREL = '@phosphor-icons/react';

/**
 * A namespace import of the barrel, in either module format.
 *
 * Matching the import rather than `__reExport` or `icons_exports`
 * because the identifiers esbuild generates are not contractual — it
 * names them after the source file, so a rename of `src/icons/index.ts`
 * would silently retire the check. The namespace import is required for
 * the leak to be possible at all.
 */
const NAMESPACE_IMPORT = new RegExp(
  [
    // ESM: import * as react_star from "@phosphor-icons/react"
    `import\\s*\\*\\s*as\\s+\\w+\\s*from\\s*["']${BARREL}["']`,
    // CJS: __toESM(require("@phosphor-icons/react")) held in a variable
    `__toESM\\(require\\(["']${BARREL}["']\\)`,
  ].join('|')
);

const files = (await readdir(DIST)).filter(
  (name) =>
    (name.endsWith('.mjs') || name.endsWith('.js')) && !EXEMPT.has(name)
);

const leaking = [];

for (const name of files) {
  const source = await readFile(join(DIST, name), 'utf8');
  if (NAMESPACE_IMPORT.test(source)) {
    leaking.push(name);
  }
}

if (leaking.length > 0) {
  console.error(
    [
      '',
      `  Icon barrel leak in dist: ${leaking.join(', ')}`,
      '',
      `  One of these entries bundles a star re-export of ${BARREL},`,
      '  so esbuild built a runtime namespace object and every icon',
      '  reference became a property lookup. A consumer\'s bundler cannot',
      '  shake that: importing one component from @neofloai/atoms would',
      '  pull in all ~9,000 icons, roughly 6 MB.',
      '',
      '  Almost certainly a component importing from `@/src/icons`.',
      '  Components import named glyphs from `@/src/icons/glyphs`; only',
      '  the `@neofloai/atoms/icons` entry may star-export the set.',
      '',
      '  Find it with:',
      "    grep -rn \"from '@/src/icons'\" src/",
      '',
    ].join('\n')
  );
  process.exit(1);
}

console.log(
  `✓ no icon barrel leak (${files.length} bundled entries checked, icons subpath exempt)`
);
