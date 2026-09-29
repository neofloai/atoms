/**
 * The import path of every mode-aware colour token, keyed by the token
 * object itself — `surface.layers.card1`, `text.primary[1]`,
 * `text.default['heading on-color']`.
 *
 * Deliberately not exported from `./index`: nothing a consumer writes
 * needs it. Two readers do, and must spell paths identically: the
 * development-only marks in `src/components/_shared/devMarks.ts`, and the
 * Atoms Inspector extension, which resolves a path back to its values.
 *
 * Keyed by identity rather than value on purpose. Several tokens share a
 * hex (`surface.purple.default` and `surface.purple.subtleHover`), so a
 * value can only ever guess; the object a component passed cannot.
 */
import { border } from './border';
import { icon } from './icon';
import { surface } from './surface';
import { text } from './text';

import type { ModeToken } from './surface';

export type ColorTokenCategory = 'surface' | 'border' | 'text' | 'icon';

export interface NamedColorToken {
  readonly path: string;
  readonly category: ColorTokenCategory;
  readonly token: ModeToken;
}

/** One path segment, written the way the property would be accessed in code. */
export function pathSegment(key: string): string {
  if (/^\d+$/.test(key)) return `[${key}]`;
  if (/^[A-Za-z_$][\w$]*$/.test(key)) return `.${key}`;
  return `['${key}']`;
}

function isModeToken(node: unknown): node is ModeToken {
  const record = node as Record<string, unknown> | null;
  return (
    !!record &&
    typeof record === 'object' &&
    typeof record.light === 'string' &&
    typeof record.dark === 'string'
  );
}

function walk(
  node: unknown,
  path: string,
  category: ColorTokenCategory,
  out: NamedColorToken[]
): void {
  if (isModeToken(node)) {
    out.push({ path, category, token: node });
    return;
  }
  if (!node || typeof node !== 'object') return;
  for (const [key, child] of Object.entries(node)) {
    walk(child, path + pathSegment(key), category, out);
  }
}

/** Every mode-aware colour token, in declaration order. */
export function namedColorTokens(): NamedColorToken[] {
  const out: NamedColorToken[] = [];
  walk(surface, 'surface', 'surface', out);
  walk(border, 'border', 'border', out);
  walk(text, 'text', 'text', out);
  walk(icon, 'icon', 'icon', out);
  return out;
}
