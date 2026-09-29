/**
 * Builds the Atoms Inspector Chrome extension into `extension/dist`.
 *
 *   node extension/build.mjs          one build
 *   node extension/build.mjs --watch  rebuild on save (reload the extension after)
 *   node extension/build.mjs --pack   build, then zip to extension/release/
 *
 * Two bundles. The inspector, bridge and background worker are small
 * IIFE scripts. Atoms Studio is an ES-module page that renders designs
 * with the real library, so it bundles `src/index.ts` with React and MUI;
 * the full Phosphor set is split into a chunk it loads on demand.
 *
 * The extension reads `src/tokens` and the component names straight from
 * this repo at build time, so a token sync only needs a rebuild. None of
 * this is reachable from the library's `tsup` entries or its `files`
 * list, so the npm package never carries it.
 */
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const dist = join(here, 'dist');
const args = new Set(process.argv.slice(2));

/**
 * The names the inspector may call an Atoms component: every string
 * literal assigned to a `displayName` under `src/components`, kept only
 * when `src/index.ts` exports it by that name. MUI sets no `displayName`,
 * so an explicit one matching a public export is an Atoms component and
 * never the MUI one it wraps.
 */
function publicComponentNames() {
  const displayNames = new Set();
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.tsx?$/.test(entry)) {
        const source = readFileSync(path, 'utf8');
        for (const match of source.matchAll(/\.displayName\s*=\s*['"]([A-Za-z]+)['"]/g)) {
          displayNames.add(match[1]);
        }
      }
    }
  };
  walk(join(root, 'src/components'));

  const exported = new Set();
  const barrel = readFileSync(join(root, 'src/index.ts'), 'utf8');
  for (const match of barrel.matchAll(/export\s*\{([^}]*)\}\s*from/g)) {
    for (const part of match[1].split(',')) {
      const name = part.trim().split(/\s+as\s+/).pop()?.trim();
      if (name && !name.startsWith('type ')) exported.add(name);
    }
  }
  return [...displayNames].filter((name) => exported.has(name)).sort();
}

/**
 * Phosphor for Studio, in two modules so the full set stays out of the
 * first load:
 *
 *   - `virtual:atoms-icons` re-exports every icon, for the icon renderer
 *     and picker, which import it on demand.
 *   - the library's own `@phosphor-icons/react` imports are pointed at a
 *     module holding just the icons `src/icons/glyphs.ts` names, plus
 *     `IconContext`. Phosphor's real entry references every icon, and
 *     esbuild's code splitting counts a reference as a use, which would
 *     put the whole set in the page's first chunk.
 */
const phosphor = join(root, 'node_modules/@phosphor-icons/react/dist');
const iconNames = () => readdirSync(join(phosphor, 'csr')).filter((f) => f.endsWith('.es.js')).map((f) => f.slice(0, -'.es.js'.length));
const iconsPlugin = {
  name: 'atoms-icons',
  setup(build) {
    build.onResolve({ filter: /^virtual:atoms-icons$/ }, () => ({ path: 'all', namespace: 'atoms-icons' }));
    build.onResolve({ filter: /^@phosphor-icons\/react$/ }, () => ({ path: 'named', namespace: 'atoms-icons' }));
    build.onLoad({ filter: /.*/, namespace: 'atoms-icons' }, ({ path }) => {
      // The library names its icons in `src/icons/glyphs.ts`; only those go in the twin.
      const used = new Set(readFileSync(join(root, 'src/icons/glyphs.ts'), 'utf8').match(/\b[A-Z]\w*Icon\b/g) ?? []);
      const names = path === 'named' ? iconNames().filter((n) => used.has(`${n}Icon`)) : iconNames();
      const lines = names.map((n) => `export { ${n}Icon } from '${join(phosphor, 'csr', `${n}.es.js`)}';`);
      if (path === 'named') {
        lines.push(`export { IconContext } from '${join(phosphor, 'lib/context.es.js')}';`);
        lines.push(`export { default as IconBase } from '${join(phosphor, 'lib/IconBase.es.js')}';`);
      }
      return { contents: lines.join('\n'), resolveDir: root, loader: 'js' };
    });
  },
};

const studioOptions = {
  entryPoints: { studio: join(here, 'src/studio/main.tsx') },
  outdir: dist,
  bundle: true,
  format: 'esm',
  splitting: true,
  target: 'chrome120',
  minify: !args.has('--watch'),
  logLevel: 'warning',
  jsx: 'automatic',
  chunkNames: 'chunks/[name]-[hash]',
  assetNames: 'assets/[name]-[hash]',
  loader: { '.woff': 'file', '.woff2': 'file' },
  define: {
    'process.env.NODE_ENV': '"production"',
    __ATOMS_COMPONENTS__: JSON.stringify(publicComponentNames()),
  },
  plugins: [
    iconsPlugin,
    {
      name: 'copy-studio-html',
      setup(build) {
        build.onEnd(() => cpSync(join(here, 'src/studio/studio.html'), join(dist, 'studio.html')));
      },
    },
  ],
};

const buildOptions = {
  entryPoints: {
    background: join(here, 'src/background.ts'),
    inspector: join(here, 'src/inspector/index.ts'),
    bridge: join(here, 'src/bridge.ts'),
  },
  outdir: dist,
  bundle: true,
  format: 'iife',
  target: 'chrome120',
  minify: !args.has('--watch'),
  logLevel: 'info',
  define: {
    __ATOMS_COMPONENTS__: JSON.stringify(publicComponentNames()),
  },
  plugins: [
    {
      name: 'copy-manifest',
      setup(build) {
        build.onEnd(() => {
          cpSync(join(here, 'manifest.json'), join(dist, 'manifest.json'));
        });
      },
    },
  ],
};

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

if (args.has('--watch')) {
  const context = await esbuild.context(buildOptions);
  await context.watch();
  const studio = await esbuild.context(studioOptions);
  await studio.watch();
  console.log('Watching extension/src — reload the extension in chrome://extensions after a change.');
} else {
  await esbuild.build(buildOptions);
  await esbuild.build(studioOptions);

  if (args.has('--pack')) {
    const { version } = JSON.parse(readFileSync(join(here, 'manifest.json'), 'utf8'));
    const release = join(here, 'release');
    const zip = join(release, `atoms-inspector-${version}.zip`);
    mkdirSync(release, { recursive: true });
    rmSync(zip, { force: true });
    execFileSync('zip', ['-rq', zip, '.'], { cwd: dist });
    console.log(`Packed ${zip}`);
  }
}
