import { promises as fs } from 'node:fs';
import path from 'node:path';

import { branding } from '../src/brand/branding';
import { installation } from '../src/install';
import {
  border,
  colors,
  elevation,
  fontFamilies,
  fontWeights,
  icon,
  radius,
  responsive,
  spacing,
  surface,
  text,
  typography,
} from '../src/tokens';

import type { ComponentExamplesData } from '../src/types/docs';

/**
 * Generates the JSON payloads consumed by the MCP server and docs site.
 *
 * Reads from `src/components/`, `src/tokens/`, and `src/patterns/`, then
 * writes the canonical shape to `data/*.json`. Never edit those files
 * by hand — re-run `npm run generate` instead.
 *
 * Components are collected from `src/components/<Name>/<Name>.examples.tsx`
 * (each must export `data: ComponentExamplesData`). Tokens are emitted
 * from `src/tokens/`. Pattern extraction lands when patterns are added.
 */

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const COMPONENTS_DIR = path.join(ROOT, 'src', 'components');

interface ComponentManifest {
  generatedAt: string;
  components: ComponentExamplesData[];
}

interface TokenManifest {
  generatedAt: string;
  tokens: Record<string, unknown>;
}

interface PatternManifest {
  generatedAt: string;
  patterns: unknown[];
}

async function collectComponents(): Promise<ComponentExamplesData[]> {
  const entries = await fs.readdir(COMPONENTS_DIR, { withFileTypes: true });
  const components: ComponentExamplesData[] = [];

  for (const entry of entries) {
    // Underscore-prefixed folders hold shared internals, not components.
    if (!entry.isDirectory() || entry.name.startsWith('_')) continue;
    const examplesPath = path.join(
      COMPONENTS_DIR,
      entry.name,
      `${entry.name}.examples.tsx`
    );
    try {
      await fs.access(examplesPath);
    } catch {
      console.warn(`skipped ${entry.name}: no ${entry.name}.examples.tsx`);
      continue;
    }
    const mod = (await import(examplesPath)) as {
      data?: ComponentExamplesData;
    };
    if (!mod.data) {
      throw new Error(
        `${examplesPath} must export "data: ComponentExamplesData"`
      );
    }
    components.push(mod.data);
  }

  return components.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Writes a manifest, prepending a `generatedAt` timestamp.
 *
 * The write is idempotent: if the existing file's body (everything
 * except `generatedAt`) is unchanged, the previous timestamp is
 * preserved so re-running the generator produces no diff. The
 * timestamp only advances when the generated content actually changes.
 * This keeps `data/*.json` stable across runs (no timestamp-only diffs,
 * reproducible builds, and a meaningful CI freshness check).
 */
async function writeManifest(
  filename: string,
  body: Record<string, unknown>
): Promise<void> {
  const target = path.join(DATA_DIR, filename);
  await fs.mkdir(DATA_DIR, { recursive: true });

  let generatedAt = new Date().toISOString();
  try {
    const existingRaw = await fs.readFile(target, 'utf8');
    const { generatedAt: previous, ...existingBody } = JSON.parse(
      existingRaw
    ) as Record<string, unknown>;
    if (
      typeof previous === 'string' &&
      JSON.stringify(existingBody) === JSON.stringify(body)
    ) {
      generatedAt = previous;
    }
  } catch {
    // No existing file (or it is unreadable) — use a fresh timestamp.
  }

  const payload = { generatedAt, ...body };
  await fs.writeFile(target, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`wrote ${path.relative(ROOT, target)}`);
}

async function main(): Promise<void> {
  const components: Omit<ComponentManifest, 'generatedAt'> = {
    components: await collectComponents(),
  };
  const tokens: Omit<TokenManifest, 'generatedAt'> = {
    tokens: {
      colors,
      surface,
      border,
      text,
      icon,
      spacing,
      typography: { fontFamilies, fontWeights, scale: typography },
      responsive,
      elevation,
      radius,
    },
  };
  const patterns: Omit<PatternManifest, 'generatedAt'> = { patterns: [] };

  await Promise.all([
    writeManifest('components.json', components),
    writeManifest('tokens.json', tokens),
    writeManifest('patterns.json', patterns),
    writeManifest('installation.json', { ...installation }),
    writeManifest('brand.json', { brand: branding }),
  ]);
}

main().catch((error: unknown) => {
  console.error('generate failed:', error);
  process.exit(1);
});
