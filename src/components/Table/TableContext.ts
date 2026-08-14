'use client';

import * as React from 'react';

import type { TableSize } from './Table.types';

/**
 * Two facts a row and a cell need about the table they are in, and
 * cannot read off their own props.
 *
 * MUI carries both of these itself and keeps neither reachable. `size`
 * lives in `TableContext` and only ever holds `small` or `medium`, which
 * is one rung short of the design's three; `variant` lives in
 * `Tablelvl2Context`, which is how a cell knows to render `<th>` instead
 * of `<td>`, and neither context is exported from the package. So this
 * one repeats the pair in the design's own terms.
 *
 * ## Why context rather than a descendant selector
 *
 * A header row is 32 tall and a data row is 48, 56 or 64. Both facts
 * belong to the row, but only the table and the head know them, so the
 * obvious implementation is a rule on the parent —
 * `& .MuiTableRow-root { height: 32 }` from the head. That rule is two
 * classes deep, which outranks a consumer's `sx` on the row itself, and
 * they would find their own `sx={{ height: 40 }}` silently losing. The
 * same trap cost this repo a documented escape hatch on `Drawer`.
 *
 * Passing the two facts down as context and spending them on each
 * element's own styled class keeps every rule a single class, so `sx`
 * wins on order the way a caller expects.
 *
 * Internal — not exported from the package. Consumers set `size` on
 * `Table` and never see this.
 */
export interface TableContextValue {
  /** The `Size` axis of the Figma row set, provided by `Table`. */
  size: TableSize;
  /**
   * Which row group the element is in, provided by `TableHead` and
   * `TableBody`. Drives the header's flat 32px height and its muted
   * caption ink.
   */
  region: 'head' | 'body';
  /**
   * Whether the table pins its header, provided by `Table`.
   *
   * A pinned header needs an opaque fill or the rows scroll through it,
   * and MUI reaches for `background.default` — the page, which is the
   * wrong surface for a table sitting on a card. Correcting that needs
   * the flag on the *cell*, and MUI keeps it in the same unexported
   * context as `size`.
   */
  stickyHeader: boolean;
}

export const TableContext = React.createContext<TableContextValue>({
  size: 'md',
  region: 'body',
  stickyHeader: false,
});

/**
 * Reads the table's size and region.
 *
 * The default is a real fallback rather than a guard: a `TableRow` used
 * outside a `Table` — inside a MUI `TableHead`, or on its own in a test
 * — still renders as a `md` body row rather than collapsing.
 */
export function useTableContext(): TableContextValue {
  return React.useContext(TableContext);
}
