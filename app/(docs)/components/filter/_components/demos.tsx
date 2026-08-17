import { data } from '@/src/components/Filter/Filter.examples';

import { QueryLogPreview } from './QueryLogPreview';
import {
  AnchoredPreview,
  CompactPreview,
  DateRangePreview,
  FacetedPreview,
  LabelsPreview,
  StatusPreview,
} from './previews';

import type { ComponentDemo } from '../../../_components/Demo';
import { demoFactory } from '../../../_components/demoPairing';

/**
 * Live previews for the Filter page, each paired with the exact snippet
 * that produces it.
 *
 * The snippets are not written here — `demoFactory` looks them up from
 * `Filter.examples.tsx` by title and throws on a miss, so a renamed
 * example fails the build rather than shipping a demo whose caption has
 * drifted from its code.
 */
const demo = demoFactory(data);

export const demos: readonly ComponentDemo[] = [
  demo('Faceted filter', <FacetedPreview />),
  demo('Anchored to a button', <AnchoredPreview />),
  demo('Filtering a data grid', <QueryLogPreview />),
  demo('Chips as option labels', <StatusPreview />),
  demo('A category with its own pane', <DateRangePreview />),
  demo('A short, fixed list', <CompactPreview />),
  demo('House wording', <LabelsPreview />),
];
