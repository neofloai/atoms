'use client';

import * as React from 'react';
import { TableCell as MuiTableCell } from '@mui/material';
import { styled } from '@mui/material/styles';

import { text } from '@/src/tokens';

import { paired } from '../_shared/actionStyles';
import {
  TABLE_BORDER_WIDTH_PX,
  TABLE_CELL_GAP_PX,
  TABLE_CELL_PADDING_INLINE_PX,
  TABLE_CELL_SECONDARY_GAP_PX,
  TABLE_CHECKBOX_CELL_WIDTH_PX,
  TABLE_EDGE_INSET_PX,
  TABLE_CELL_GAP_TWO_LINE_PX,
  TABLE_CELL_ICON_OFFSET_PX,
  tableCellType,
  tableHeaderFill,
  tableHeaderType,
  tableRule,
  tableSecondaryType,
} from './tableTokens';
import { useTableContext } from './TableContext';

import type { CSSObject } from '@mui/material/styles';
import type { TableCellProps } from './Table.types';

interface CellStyleProps {
  neofloRegion: 'head' | 'body';
}

/**
 * The row's 8px inset, spent on the two cells that touch the edge, on
 * top of the 16 every cell already carries.
 *
 * `:first-child` rather than `:first-of-type`, so that a row-header
 * `<th>` followed by `<td>`s insets once rather than twice.
 */
function edgeInsetStyles(inset: boolean): CSSObject {
  const edge = inset ? TABLE_CELL_PADDING_INLINE_PX + TABLE_EDGE_INSET_PX : 0;

  return {
    '&:first-child': { paddingInlineStart: edge },
    '&:last-child': { paddingInlineEnd: edge },
  };
}

const CellRoot = styled(MuiTableCell, {
  shouldForwardProp: (prop) => prop !== 'neofloRegion',
})<CellStyleProps>(({ theme, neofloRegion, padding, align }) => {
  const head = neofloRegion === 'head';
  const bare = padding === 'none';

  return {
    ...(head ? tableHeaderType : tableCellType),
    ...paired(theme, {
      color: head ? text.default.b3 : text.default.b1,
      borderBottomColor: tableRule,
    }),
    borderBottomStyle: 'solid',
    borderBottomWidth: TABLE_BORDER_WIDTH_PX,

    // No vertical padding at all: the row fixes the height and
    // `vertical-align: middle` centres whatever is in here, which is what
    // lets one line and two lines share a row without either knowing.
    paddingBlock: 0,

    // One line, because the row is one height. A wrapping cell is the one
    // thing that can break the design: `height` on a `<tr>` is a floor
    // rather than a ceiling, so a second line pushes that row taller than
    // its neighbours and the table stops reading as a grid. The design has
    // no wrapping cell anywhere — its long-text variant truncates, and the
    // only two-line cell is a deliberate `secondary`.
    //
    // A column that genuinely needs prose says so:
    // `sx={{ whiteSpace: 'normal' }}`, and pairs it with a `maxWidth` or an
    // ellipsis.
    whiteSpace: 'nowrap',
    paddingInline: bare ? 0 : TABLE_CELL_PADDING_INLINE_PX,
    ...edgeInsetStyles(!bare),

    // A selection column is as narrow as its control, with the cell's own
    // padding either side and nothing else. The control's padding goes, which is
    // the same move MUI makes for its dense tables: it is a touch target
    // on a form, and here it is 9px of dead space in a 32px column.
    //
    // `&&` rather than `&`, to raise the rule to two classes. At one class
    // it ties with the control's own, and a tie is settled by which
    // emotion class was inserted first — which depends on render order, so
    // the header's checkbox kept its padding and the body's lost it.
    ...(padding === 'checkbox' && {
      width: TABLE_CHECKBOX_CELL_WIDTH_PX,
      '&& > *': { padding: 0 },
    }),

    // Inherited by the layout row below, the way MUI has
    // `align="right"` reach `TableSortLabel` through `flex-direction`.
    ...(align === 'center' && { justifyContent: 'center' }),

    // The header strip's fill, whether or not it is pinned. It has to be
    // opaque while it is — rows would otherwise scroll through it — and
    // the design now gives it a fill regardless, so `stickyHeader` no
    // longer changes how the strip looks, only where it sits.
    ...(head && paired(theme, { backgroundColor: tableHeaderFill })),
  };
});

/**
 * The row that holds a leading slot beside the text.
 *
 * `flex-direction: inherit` is how `align="right"` reaches it: MUI puts
 * `row-reverse` on the cell for that alignment — inert on a table cell,
 * and picked up here — so a right-aligned column reads inward from its
 * own edge with the glyph on the outside.
 */
const CellLayout = styled('span', {
  shouldForwardProp: (prop) => prop !== 'neofloTwoLine',
})<{ neofloTwoLine: boolean }>(({ neofloTwoLine }) => ({
  display: 'flex',
  flexDirection: 'inherit',
  justifyContent: 'inherit',
  // A glyph beside one line centres against it, because there the line
  // box and the text are the same thing. Beside two lines it aligns to
  // the top and is nudged down onto the first line's cap height —
  // centred against a 35px block it floats between the two and reads as
  // belonging to neither.
  alignItems: neofloTwoLine ? 'flex-start' : 'center',
  gap: neofloTwoLine ? TABLE_CELL_GAP_TWO_LINE_PX : TABLE_CELL_GAP_PX,
  minWidth: 0,
}));

/** Holds its size against a long label in the next column. */
const LeadingSlot = styled('span', {
  shouldForwardProp: (prop) => prop !== 'neofloTwoLine',
})<{ neofloTwoLine: boolean }>(({ neofloTwoLine }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0,
  // The 2 that lands a top-aligned glyph on the first line's cap
  // height rather than on its line box.
  marginBlockStart: neofloTwoLine ? TABLE_CELL_ICON_OFFSET_PX : 0,
}));

const TextColumn = styled('span')({
  display: 'flex',
  flexDirection: 'column',
  gap: TABLE_CELL_SECONDARY_GAP_PX,
  minWidth: 0,
});

/**
 * The muted second line — 12/16 in `text/default/b3`, `Scale/100` under
 * the line above it.
 *
 * The gap is `TextColumn`'s and is new; the two lines used to sit on
 * their leadings alone, from a 36px group holding a 20px line and a
 * 16px one (`1 line=false` cells, 3206:122293 and 3206:122290). The
 * Revamp UI row draws the 4 explicitly and the pair comes to 40, which
 * still centres in a 48px row.
 *
 * The size does not follow it. That sheet sets the second line at 11/14
 * on a `text/default/caption` the library has no rung for, so the line
 * stays at `Sans/B2` — see DESIGNER_QUESTIONS.md #62.
 *
 * It carries `data-neoflo-table-secondary` so a disabled row can grey it
 * with the rest of its ink. Without that the line keeps its own colour —
 * which is darker than the disabled ink — and a greyed row would come out
 * with its quieter line louder than its title.
 */
const SecondaryLine = styled('span')(({ theme }) => ({
  ...tableSecondaryType,
  ...paired(theme, { color: text.default.b3 }),
}));

/**
 * One field of one record. Wraps MUI `TableCell` with the design's
 * paddings, type and ink, and adds the two pieces of cell geometry that
 * are worth not rebuilding per call site.
 *
 * ## What the wrapper corrects in MUI
 *
 * Four things, and the first two are the ones that make a MUI table look
 * like a MUI table:
 *
 *   - **the padding.** MUI pads a cell 16 on all four sides (6 and 16 at
 *     `size="small"`). The design pads 16 either side and nothing top
 *     or bottom, and leaves the height to the row — the two agree on
 *     the inline number and on nothing else.
 *   - **the hairline.** MUI derives it by lightening `palette.divider`
 *     88% — a computed grey. The design names one:
 *     `border.layers.card3`, under the header and between the rows
 *     alike, and none under the last row.
 *   - **the type.** `theme.typography.body2` for a data cell, and for a
 *     header cell a 24px leading at medium weight. The design uses
 *     `Sans/B1` at Medium for data and DM Mono Medium 12/16 for a
 *     header, so a header is told from its data by face and colour
 *     rather than by weight — both are Medium.
 *   - **the header's fill.** MUI gives the strip none, and reaches for
 *     `background.default` — the page — only once it is pinned. The
 *     design fills it either way, with `surface.layers.card2`, so a
 *     pinned header is opaque because every header is. Body rows carry
 *     `surface.layers.page` for the same reason: the table paints its
 *     own bands rather than showing what is behind them.
 *
 * ## The two props
 *
 * The design draws twelve cell variants, and ten of them are content —
 * a `Chip`, an `Avatar`, a `Switch`, a `Skeleton`, a `Button`, an
 * amount. Those compose, and no prop should stand between a caller and
 * putting a component in a cell.
 *
 * The other two are geometry, and geometry is what drifts when every
 * call site rebuilds it: a leading node 6px clear of the text and
 * centred against the row (`icon`), and a muted 11/13 second line 2px
 * under the first (`secondary`). `NavbarTitle` exists for the same
 * reason.
 *
 * The two interact. Given both, the glyph stops centring and aligns to
 * the top instead — nudged 2px down onto the first line's cap height,
 * with 8px of gap rather than 6 — because a glyph centred against a
 * two-line block floats between the lines and reads as belonging to
 * neither.
 *
 * `tableAmountType` is the third piece of geometry and is not a prop,
 * because a money column is content: put it on the cell's contents with
 * `sx` and pair it with `align="right"`.
 *
 * @example An attachment
 * <TableCell icon={<PaperclipIcon size={TABLE_CELL_ICON_PX} />}>
 *   invoice-attachment
 * </TableCell>
 *
 * @example A record with its timestamp under it
 * <TableCell secondary="14 Feb 2026 · 21:38">#1008</TableCell>
 *
 * @example An amount
 * <TableCell align="right" sx={tableAmountType}>12,780.50</TableCell>
 *
 * @example A person
 * <TableCell icon={<Avatar size="sm">OP</Avatar>} secondary="administrator">
 *   Kaustav
 * </TableCell>
 *
 * @example A checkbox column
 * <TableCell padding="checkbox">
 *   <Checkbox checked={selected} />
 * </TableCell>
 *
 * @see Related: Table, TableRow, TableSortLabel, Chip, Avatar, Checkbox
 */
export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  function TableCell({ icon, secondary, children, ...rest }, ref) {
    const { region } = useTableContext();

    const twoLine = secondary != null;

    const textBlock =
      twoLine ? (
        <TextColumn>
          {children}
          <SecondaryLine data-neoflo-table-secondary>{secondary}</SecondaryLine>
        </TextColumn>
      ) : (
        children
      );

    return (
      <CellRoot ref={ref} neofloRegion={region} {...rest}>
        {icon != null ? (
          <CellLayout neofloTwoLine={twoLine}>
            <LeadingSlot neofloTwoLine={twoLine}>{icon}</LeadingSlot>
            {textBlock}
          </CellLayout>
        ) : (
          textBlock
        )}
      </CellRoot>
    );
  }
);

TableCell.displayName = 'TableCell';
