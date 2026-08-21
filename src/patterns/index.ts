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
import { erpPosting } from './erpPosting';
import { extraction } from './extraction';
import { invoiceDashboard } from './invoiceDashboard';
import { matching } from './matching';
import { reporting } from './reporting';

import type { PatternExamplesData } from '@/src/types/docs';

/**
 * Ordered as the invoice processing workflow runs, not alphabetically: the
 * queue, then the stages a record moves through. `get_pattern` serves them
 * in this order too, so an agent reading the list sees the sequence.
 *
 * `reporting` sits at the end and outside that sequence. It is not a stage —
 * nothing moves through it — it is the screen that looks back at every stage
 * once they have run.
 */
export const patterns: readonly PatternExamplesData[] = [
  dashboard,
  invoiceDashboard,
  extraction,
  matching,
  erpPosting,
  reporting,
];

export {
  dashboard,
  erpPosting,
  extraction,
  invoiceDashboard,
  matching,
  reporting,
};
