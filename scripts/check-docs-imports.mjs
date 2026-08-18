/**
 * Fails if any consumer-facing code snippet tells the reader to import
 * from `@mui/material`.
 *
 * These two trees are the ones whose contents get copied verbatim into
 * real screens: `*.examples.tsx` is served to agents through the MCP
 * `get_component` tool and rendered on the docs site, and `src/patterns/`
 * holds whole reference pages that a project is started from. A snippet
 * in either one is an instruction, not a description.
 *
 * This check exists because that guidance drifted once and nobody
 * noticed: the TextField examples said to import `InputAdornment` from
 * `@mui/material`, the Select examples said the same for `MenuItem` and
 * the DataGrid examples for `Box` — both of which Atoms already exported
 * — and the dashboard pattern opened with an `@mui/material/Typography`
 * import, all while `installation.json` told the reader "Do not import
 * from @mui/material directly." A prototype built off that data imported
 * MUI on line 2, exactly as instructed.
 *
 * Prose is unaffected: "inherited from MUI" is a description of where a
 * prop comes from and is fine. Only an import statement is matched.
 *
 * Run with `npm run check:imports`.
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

/** Trees whose snippets a consumer copies. */
const ROOTS = ['src/components', 'src/patterns'];

/**
 * `src/components` holds real component source that imports MUI
 * legitimately, so only the examples data is read there. Everything
 * under `src/patterns` is snippet text.
 */
function isScanned(filePath) {
  if (filePath.startsWith('src/patterns')) return /\.(ts|tsx)$/.test(filePath);
  return filePath.endsWith('.examples.tsx');
}

/** An import or require of any `@mui/*` package. */
const IMPORT_PATTERN = /(?:from\s+|require\()\\?['"]@mui\//;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const offences = [];

for (const root of ROOTS) {
  for await (const file of walk(root)) {
    if (!isScanned(file)) continue;
    const lines = (await readFile(file, 'utf8')).split('\n');
    lines.forEach((line, index) => {
      if (IMPORT_PATTERN.test(line)) {
        offences.push({ file, line: index + 1, text: line.trim() });
      }
    });
  }
}

if (offences.length > 0) {
  console.error(
    `\nFound ${offences.length} snippet(s) importing from @mui/material.\n` +
      `These are copied into real screens, so they have to import from\n` +
      `'@neofloai/atoms'. If the component genuinely does not exist yet,\n` +
      `add it (wrap it, or re-export it under the carve-out in src/index.ts)\n` +
      `rather than pointing the reader at MUI.\n`
  );
  for (const offence of offences) {
    console.error(`  ${offence.file}:${offence.line}  ${offence.text}`);
  }
  console.error('');
  process.exit(1);
}

console.log(
  'check:imports — no @mui imports in examples data or pattern snippets'
);
