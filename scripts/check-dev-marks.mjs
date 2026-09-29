/**
 * Proves the Atoms Inspector's development marks stay out of production.
 *
 * Bundles the built package the way a consumer's production build does —
 * `process.env.NODE_ENV` defined as "production", minified, tree-shaken —
 * and fails if any `--atoms-*` custom property or `data-atoms-*`
 * attribute survives. Bundles it again as "development" and fails if the
 * marks are missing there, so a refactor that silently drops them is
 * caught as well. Run after `tsup`.
 */
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const MARKS = /--atoms-|data-atoms-/;

async function bundle(env) {
  const result = await esbuild.build({
    stdin: {
      contents: "export * from './dist/index.mjs';",
      resolveDir: root,
    },
    bundle: true,
    write: false,
    minify: true,
    format: 'esm',
    platform: 'browser',
    // Only the library itself is under test; its dependencies are the
    // consumer's to bundle.
    packages: 'external',
    define: { 'process.env.NODE_ENV': JSON.stringify(env) },
    logLevel: 'silent',
  });
  return result.outputFiles[0].text;
}

const production = await bundle('production');
const development = await bundle('development');
const test = await bundle('test');

const failures = [];
if (MARKS.test(production)) failures.push('production bundle still contains development marks');
if (MARKS.test(test)) failures.push('test bundle contains development marks (would churn snapshots)');
if (!MARKS.test(development)) failures.push('development bundle is missing its marks');

if (failures.length) {
  for (const failure of failures) console.error(`check:dev-marks — ${failure}`);
  process.exit(1);
}
console.log(
  `check:dev-marks — ok (production ${(production.length / 1024).toFixed(1)} kB, development ${(development.length / 1024).toFixed(1)} kB)`
);
