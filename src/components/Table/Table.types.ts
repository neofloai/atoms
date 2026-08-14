import type * as React from 'react';
import type {
  TableBodyProps as MuiTableBodyProps,
  TableCellProps as MuiTableCellProps,
  TableContainerProps as MuiTableContainerProps,
  TableHeadProps as MuiTableHeadProps,
  TableProps as MuiTableProps,
  TableRowProps as MuiTableRowProps,
  TableSortLabelProps as MuiTableSortLabelProps,
} from '@mui/material';

/**
 * Public API for the table family, from the Figma `table-rows` section
 * (node 3215:52225).
 *
 * The design's two axes land in two different places. `Size` — small,
 * medium, large — is one prop on the table, because a table is one
 * density throughout. `State` is not a prop at all: four of its six
 * values are things MUI's row already models (`hover`, `selected`,
 * `disabled`, and plain), and the two that are left are outcomes the
 * data carries rather than interactions, so they arrive as `state` on
 * the row.
 *
 * Everything else is composition. The design's twelve cell variants —
 * chip, person, amount, attachment, toggle, loader — are `Chip`,
 * `Avatar`, `Switch` and `Skeleton` inside a cell, not props on it. Two
 * of the twelve are geometry rather than content, and those two are
 * props: a leading slot 8px clear of the text (`icon`), and a muted
 * second line under it (`secondary`).
 */

/** The Figma `Size` axis — 48, 56 and 64px rows. */
export type TableSize = 'sm' | 'md' | 'lg';

/**
 * The two `State` values that describe the data rather than the pointer:
 * a row that failed validation and a row that passed it.
 *
 * `hover`, `selected` and `disabled` are separate props, because they
 * can each combine with these two — a failed row is still selectable —
 * and because MUI already owns the first two.
 */
export type TableRowState = 'default' | 'error' | 'success';

/**
 * MUI's table-level `padding`, removed.
 *
 * It is a cascade: `padding="checkbox"` on the table reaches each cell
 * through MUI's own `TableContext`, which is not exported. This wrapper
 * draws its own paddings, so it would have to read that context to
 * honour the table-level value and cannot. Rather than leave a prop that
 * type-checks and changes nothing, it comes off — set `padding` on the
 * cells that need it, which is how the design uses it anyway (one
 * checkbox column, not a whole table of them).
 *
 * `size` is replaced rather than removed: MUI's holds two values and the
 * design has three.
 */
type LockedTableProp = 'padding' | 'size';

/**
 * Props for `Table` — the `<table>` itself, and the thing that owns
 * density for everything inside it.
 *
 * @example A table of records
 * <Table size="sm">
 *   <TableHead>
 *     <TableRow>
 *       <TableCell>Invoice</TableCell>
 *       <TableCell align="right">Amount</TableCell>
 *     </TableRow>
 *   </TableHead>
 *   <TableBody>
 *     {invoices.map((invoice) => (
 *       <TableRow key={invoice.id} hover>
 *         <TableCell>{invoice.number}</TableCell>
 *         <TableCell align="right">{invoice.total}</TableCell>
 *       </TableRow>
 *     ))}
 *   </TableBody>
 * </Table>
 */
export interface TableProps extends Omit<MuiTableProps, LockedTableProp> {
  /**
   * Row height: `sm` 48, `md` 56, `lg` 64.
   *
   * The header stays 32 in all three — it is a label strip rather than a
   * row of data, and the design holds it while the data breathes.
   *
   * @default 'md'
   */
  size?: TableSize;
}

/**
 * Props for `TableContainer` — the box that scrolls when a table is
 * wider or taller than its column.
 *
 * MUI's own props, unchanged. It draws no surface, no border and no
 * radius, because the design's table has none of those either: it is a
 * stack of bands that takes the colour of whatever it is dropped onto.
 * Put it in a `Card` to give it an edge.
 */
export type TableContainerProps = MuiTableContainerProps;

/**
 * Props for `TableHead` — the `<thead>`, and the 32px label strip.
 *
 * MUI's own props, unchanged.
 */
export type TableHeadProps = MuiTableHeadProps;

/**
 * Props for `TableBody` — the `<tbody>`.
 *
 * MUI's own props, unchanged.
 */
export type TableBodyProps = MuiTableBodyProps;

/**
 * Props for `TableRow` — the band, and everything the design's `State`
 * axis puts on it.
 *
 * `hover` is MUI's and stays opt-in: a table that is only being read
 * should not light up under the pointer. `selected` is MUI's too, and
 * the design gives it more than a fill — see `TableRow.tsx` for the two
 * hairlines and which element ends up drawing them.
 */
export interface TableRowProps extends MuiTableRowProps {
  /**
   * A validation outcome carried by the row: `error` tints it
   * `surface/error/subtle`, `success` tints it `surface/success/subtle`.
   *
   * @default 'default'
   */
  state?: TableRowState;
  /**
   * Greys the row's ink and its hairline, and stops it responding to the
   * pointer.
   *
   * Visual only, as it is in Figma. Controls inside the row — a
   * checkbox, a button — keep their own `disabled`, because a row cannot
   * disable a descendant it does not own.
   *
   * @default false
   */
  disabled?: boolean;
}

/**
 * MUI's cell props that this wrapper draws itself.
 *
 * `size` because density belongs to the table here, and MUI's two rungs
 * do not cover the design's three; `variant` because a cell's ink and
 * type come from the row group it is in, which the wrapper already
 * knows, so setting `variant="head"` on a body cell would change a class
 * name and nothing a reader can see.
 */
type LockedTableCellProp = 'size' | 'variant';

/**
 * Props for `TableCell` — one field of one record.
 *
 * MUI's props minus the two the wrapper owns, plus the design's two
 * pieces of cell geometry.
 *
 * @example A two-line cell with a leading glyph
 * <TableCell icon={<UploadSimpleIcon size={16} />} secondary="14 Feb 2026 · 21:38">
 *   #1008
 * </TableCell>
 *
 * @example An amount
 * <TableCell align="right">$ 14,509.32</TableCell>
 */
export interface TableCellProps extends Omit<
  MuiTableCellProps,
  LockedTableCellProp
> {
  /**
   * A node 8px clear of the text, vertically centred against the whole
   * cell — the design's leading glyph, and the avatar in its person
   * cell.
   *
   * Under `align="right"` it moves to the other side of the text with
   * the text, so a right-aligned column reads inward from its edge.
   */
  icon?: React.ReactNode;
  /**
   * A muted second line, immediately under the first with no gap
   * between them — 12/16 in `text/default/b3` against the cell's 13/20.
   *
   * Two lines come to 36, so they fit every row height including the
   * 48px `sm`.
   */
  secondary?: React.ReactNode;
}

/**
 * MUI's sort glyph, removed.
 *
 * MUI models sorting with one arrow it rotates 180°, so the unsorted and
 * ascending states differ only by that rotation. The design's unsorted
 * glyph is a two-headed arrow, which rotation cannot distinguish from
 * itself, so the wrapper picks the glyph from `active` and `direction`
 * instead — see `TableSortLabel.tsx`. A caller's own `IconComponent`
 * would be used for all three states and lose that distinction.
 */
type LockedSortLabelProp = 'IconComponent';

/**
 * Props for `TableSortLabel` — the affordance that makes a header
 * sortable.
 *
 * MUI's props minus `IconComponent`. `active`, `direction`, `onClick`
 * and `hideSortIcon` behave as MUI documents them, so the sort state
 * itself stays the caller's to hold.
 *
 * @example
 * <TableCell sortDirection={order}>
 *   <TableSortLabel active direction={order} onClick={toggle}>
 *     Vendor
 *   </TableSortLabel>
 * </TableCell>
 */
export type TableSortLabelProps = Omit<
  MuiTableSortLabelProps,
  LockedSortLabelProp
>;
