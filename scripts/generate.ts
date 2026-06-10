import { promises as fs } from 'node:fs';
import path from 'node:path';

/**
 * Generates the JSON payloads consumed by the MCP server and docs site.
 *
 * Reads from `src/components/`, `src/tokens/`, and `src/patterns/`, then
 * writes the canonical shape to `data/*.json`. Never edit those files
 * by hand — re-run `npm run generate` instead.
 *
 * This is a minimal scaffold: it writes empty manifests so the rest of
 * the toolchain (loader, route, docs pages) can be wired up against a
 * real on-disk contract before any components exist.
 */

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');

interface ComponentManifest {
  generatedAt: string;
  components: unknown[];
}

interface TokenManifest {
  generatedAt: string;
  tokens: Record<string, unknown>;
}

interface PatternManifest {
  generatedAt: string;
  patterns: unknown[];
}

async function writeJson(filename: string, payload: unknown): Promise<void> {
  const target = path.join(DATA_DIR, filename);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(target, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`wrote ${path.relative(ROOT, target)}`);
}

async function main(): Promise<void> {
  const generatedAt = new Date().toISOString();

  const components: ComponentManifest = { generatedAt, components: [] };
  const tokens: TokenManifest = { generatedAt, tokens: {} };
  const patterns: PatternManifest = { generatedAt, patterns: [] };

  await Promise.all([
    writeJson('components.json', components),
    writeJson('tokens.json', tokens),
    writeJson('patterns.json', patterns),
  ]);
}

main().catch((error: unknown) => {
  console.error('generate failed:', error);
  process.exit(1);
});
