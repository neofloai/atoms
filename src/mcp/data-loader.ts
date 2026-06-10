import { promises as fs } from 'node:fs';
import path from 'node:path';

import type {
  ComponentManifest,
  PatternManifest,
  TokenManifest,
} from './types';

/**
 * Resolves paths inside the auto-generated `data/` directory.
 *
 * All MCP tool implementations should read through this module rather
 * than touching the filesystem directly. The path resolution is
 * deliberately relative to the repo root so it works in both the Next.js
 * dev server and the generator script.
 */
const DATA_DIR = path.join(process.cwd(), 'data');

export async function readJsonFile<T>(filename: string): Promise<T> {
  const filePath = path.join(DATA_DIR, filename);
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw) as T;
}

export const dataPaths = {
  components: 'components.json',
  tokens: 'tokens.json',
  patterns: 'patterns.json',
} as const;

/** Loads the generated component manifest from `data/components.json`. */
export async function loadComponents(): Promise<ComponentManifest> {
  return readJsonFile<ComponentManifest>(dataPaths.components);
}

/** Loads the generated token manifest from `data/tokens.json`. */
export async function loadTokens(): Promise<TokenManifest> {
  return readJsonFile<TokenManifest>(dataPaths.tokens);
}

/** Loads the generated pattern manifest from `data/patterns.json`. */
export async function loadPatterns(): Promise<PatternManifest> {
  return readJsonFile<PatternManifest>(dataPaths.patterns);
}
