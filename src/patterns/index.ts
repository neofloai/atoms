/**
 * Page layout recipes composed from Neoflo components.
 *
 * Each pattern is a whole screen — the arrangement of components that
 * makes a dashboard, a settings page, an auth flow — so product teams can
 * drop in a branded layout without re-deriving the shell, the bands or the
 * toolbar contract every time.
 *
 * A pattern ships no runtime export. Its deliverable is code: the array
 * below is read by `scripts/generate.ts` into `data/patterns.json`, which
 * the docs site and the MCP `get_pattern` tool serve. Adding one is a
 * folder under here plus a line in this array — an explicit list rather
 * than a directory scan, so a pattern that is half written stays out of
 * the manifest until it is added on purpose.
 */

import { dashboard } from './dashboard';

import type { PatternExamplesData } from '@/src/types/docs';

export const patterns: readonly PatternExamplesData[] = [dashboard];

export { dashboard };
