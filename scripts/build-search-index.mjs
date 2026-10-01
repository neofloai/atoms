/**
 * Builds the docs-site search index from the pages `next build` just
 * prerendered. Runs as `postbuild`, so every deploy indexes exactly the
 * pages it ships: a new page is searchable the moment it exists, with
 * nothing to register.
 *
 * Reads `.next/server/app/**\/*.html` rather than crawling a running
 * server, and hands each page to Pagefind with its route as the URL.
 * Only the element marked `data-pagefind-body` (the docs shell's main
 * slot) is indexed, so the sidebar and top bar never match. Writes the
 * index to `public/pagefind`, which the Docker runner already copies.
 *
 * Result titles come from each page's `metadata.title`, not Pagefind's
 * default of the first `<h1>`: page headings here are styled `h3`s, and
 * the only `<h1>`s on the site belong to live demos (the Navbar page
 * would otherwise be titled after the app its preview renders).
 *
 * Docs-site only: Pagefind is a dev dependency and nothing here is
 * reachable from the library entries tsup bundles.
 */
import { promises as fs } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as pagefind from 'pagefind';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PAGES_DIR = join(root, '.next', 'server', 'app');
const OUTPUT_DIR = join(root, 'public', 'pagefind');

async function collectHtml(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    // `_not-found`, `_global-error` and friends are Next internals, not pages.
    if (entry.name.startsWith('_')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await collectHtml(full)));
    else if (entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

/** `components/divider.html` -> `/components/divider`, `index.html` -> `/`. */
function routeFor(file) {
  const route = relative(PAGES_DIR, file).split(sep).join('/').replace(/\.html$/, '');
  return route === 'index' ? '/' : `/${route}`;
}

const BODY_MARK = 'data-pagefind-body="true"';

/**
 * Pins the result title to the page's `<title>`, minus the site suffix,
 * by adding it as Pagefind metadata on the indexed element.
 */
function withTitle(html, url) {
  // Without the mark Pagefind would skip the page silently, because once
  // any page carries it, pages that do not are left out of the index.
  if (!html.includes(BODY_MARK)) fail(`${url}: no ${BODY_MARK} element to index`);
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1]?.replace(/ — Atoms$/, '');
  if (!title) return html;
  return html.replace(BODY_MARK, `${BODY_MARK} data-pagefind-meta="title:${title.replace(/"/g, '&quot;')}"`);
}

function fail(message) {
  console.error(`build:search — ${message}`);
  process.exit(1);
}

const files = await collectHtml(PAGES_DIR).catch(() => []);
// An empty list means Next moved its prerender output, not that the site
// has no pages. Failing here keeps a silently empty index from shipping.
if (files.length === 0) fail(`no prerendered pages found in ${relative(root, PAGES_DIR)}`);

const { index, errors: createErrors } = await pagefind.createIndex();
if (!index) fail(createErrors.join('\n'));

let indexed = 0;
for (const file of files) {
  const url = routeFor(file);
  const content = withTitle(await fs.readFile(file, 'utf8'), url);
  const { errors } = await index.addHTMLFile({ url, content });
  if (errors.length) fail(`${url}: ${errors.join('; ')}`);
  indexed += 1;
}

await fs.rm(OUTPUT_DIR, { recursive: true, force: true });
const { errors: writeErrors } = await index.writeFiles({ outputPath: OUTPUT_DIR });
if (writeErrors.length) fail(writeErrors.join('\n'));
await pagefind.close();

console.log(`build:search — indexed ${indexed} pages into ${relative(root, OUTPUT_DIR)}`);
