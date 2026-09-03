'use client';

import * as React from 'react';
import {
  TableSortLabel as MuiTableSortLabel,
  tableSortLabelClasses,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import { ArrowDownIcon, ArrowUpIcon, ArrowsDownUpIcon } from '@/src/icons/glyphs';
import { surface, text } from '@/src/tokens';

import { paired } from '../_shared/actionStyles';
import {
  TABLE_SORT_ICON_PX,
  TABLE_SORT_TINT_HEIGHT_PX,
  TABLE_SORT_TINT_PADDING_PX,
  TABLE_SORT_TINT_RADIUS_PX,
  tableCaptionType,
} from './tableTokens';

import type { TableSortLabelProps } from './Table.types';

/** The affordance itself. Documented on the component below. */
const SortLabelRoot = styled(MuiTableSortLabel)(({ theme }) => ({
  ...tableCaptionType,
  minHeight: TABLE_SORT_TINT_HEIGHT_PX,
  paddingInline: TABLE_SORT_TINT_PADDING_PX,
  gap: TABLE_SORT_TINT_PADDING_PX,
  borderRadius: TABLE_SORT_TINT_RADIUS_PX,

  // The cell's ink, held through every state. MUI moves the label to
  // `text.secondary` on hover and focus and `text.primary` when active;
  // the design keeps one colour and changes the background instead.
  color: 'inherit',

  '&:hover': {
    color: 'inherit',
    ...paired(theme, { backgroundColor: surface.default.default }),
    // Restated under `:hover` because MUI fades the glyph to 50% there,
    // and that rule is a class more specific than the one below — left
    // alone, the glyph would be full strength at rest and washed out in
    // the one state the design draws it in.
    [`& .${tableSortLabelClasses.icon}`]: { opacity: 1 },
  },
  '&:focus-visible': {
    color: 'inherit',
    ...paired(theme, { backgroundColor: surface.default.default }),
  },

  [`&.${tableSortLabelClasses.active}`]: {
    // A sorted column earns the darker ink. The design does not draw a
    // sorted header — see DESIGNER_QUESTIONS.md #48.
    ...paired(theme, { color: text.default.body }),
    [`& .${tableSortLabelClasses.icon}`]: { color: 'inherit' },
  },

  [`& .${tableSortLabelClasses.icon}`]: {
    // MUI's `opacity: 0` at rest is left standing: the design draws a sort
    // glyph in its two hover variants and in neither resting one, so a
    // sortable column looks like any other until the pointer reaches it.
    // The glyph still occupies its space, so nothing moves when it
    // appears. What is corrected is the strength — MUI fades it to 50% on
    // hover, and the design draws it in the label's own ink.
    //
    // MUI's 18px glyph and its 4px margins go with it: the gap above puts
    // the same 4 between label and glyph in either order.
    //
    // Sized with `width`/`height` rather than MUI's `font-size`, because
    // the glyph is a Phosphor SVG carrying its own 24px width and height
    // attributes from `IconContext` — a font size would not reach it.
    width: TABLE_SORT_ICON_PX,
    height: TABLE_SORT_ICON_PX,
    flexShrink: 0,
    color: 'inherit',
    marginInline: 0,
    // MUI rotates one arrow to mean two directions. Two glyphs are used
    // instead, so the rotation would undo them.
    transform: 'none',
  },
}));

/** The glyph a sorted column shows, per direction. */
const SORTED_GLYPH = { asc: ArrowUpIcon, desc: ArrowDownIcon } as const;

/**
 * Makes a header label sortable: the label, a glyph that appears beside
 * it, and a tint under both while the pointer is on it.
 *
 * ## What the wrapper corrects in MUI
 *
 * The glyph, and everything about how the affordance is drawn.
 *
 * MUI shows one arrow at `opacity: 0`, brings it to `0.5` on hover and
 * `1` when the column is sorted, and rotates it 180° for the other
 * direction. So its resting and ascending states are the same glyph, and
 * a half-transparent arrow is doing the work of saying "you could sort
 * this".
 *
 * The design says it with a tint instead — `surface/default/1` behind the
 * label, 20 tall, 4px radius — and uses a two-headed `ArrowsDownUp` for
 * "sortable, not sorted". Rotating that glyph produces itself, which is
 * why `IconComponent` is off the props: the glyph is picked from `active`
 * and `direction` here, and MUI's rotation is switched off so a single
 * arrow points the way it is drawn.
 *
 * The glyph appears with the tint rather than fading in ahead of it: the
 * design draws it in both hover variants and in neither resting one, so a
 * sortable column is told apart by reaching it. It holds its space
 * throughout, so nothing moves when it arrives, and it arrives at the
 * label's own `text/default/b3` rather than MUI's 50%.
 *
 * The one thing that follows from that and is worth knowing: on a touch
 * screen there is no hover, so nothing marks a column as sortable. Pass
 * `active` on the column you sort by default and its arrow is visible from
 * the first paint, which is the only resting glyph the design gives.
 *
 * ## Why the type is set here
 *
 * The root is a `ButtonBase`, which renders a native `<button>`, and a
 * native button inherits neither `font-family` nor `font-size` from the
 * cell around it. Left alone the label would come out in the UA's
 * 13.333px system font next to its 12px neighbours. `AccordionSummary`
 * sets its own type for the same reason.
 *
 * ## The one thing it does not own
 *
 * The sort state. `active`, `direction` and `onClick` are the caller's,
 * because sorting is the caller's data — this component is the
 * affordance, not the mechanism. Put `sortDirection` on the cell around
 * it so the column announces its own order.
 *
 * @example A sortable column
 * const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
 *
 * <TableCell sortDirection={order}>
 *   <TableSortLabel
 *     active
 *     direction={order}
 *     onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
 *   >
 *     Vendor
 *   </TableSortLabel>
 * </TableCell>
 *
 * @example An unsorted column, showing the two-headed glyph
 * <TableCell>
 *   <TableSortLabel onClick={sortByAmount}>Amount</TableSortLabel>
 * </TableCell>
 *
 * @see Related: Table, TableCell, TableHead
 */
export const TableSortLabel = React.forwardRef<
  HTMLSpanElement,
  TableSortLabelProps
>(function TableSortLabel({ active = false, direction = 'asc', ...rest }, ref) {
  const Glyph = active ? SORTED_GLYPH[direction] : ArrowsDownUpIcon;

  return (
    <SortLabelRoot
      ref={ref}
      active={active}
      direction={direction}
      IconComponent={Glyph}
      {...rest}
    />
  );
});

TableSortLabel.displayName = 'TableSortLabel';
