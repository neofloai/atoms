'use client';

import * as React from 'react';
import { TableCell as MuiTableCell } from '@mui/material';
import { styled } from '@mui/material/styles';

import { border, surface, text } from '@/src/tokens';

import { paired } from '../_shared/actionStyles';
import {
  TABLE_BORDER_WIDTH_PX,
  TABLE_CELL_GAP_PX,
  TABLE_CELL_PADDING_INLINE_PX,
  TABLE_CHECKBOX_CELL_WIDTH_PX,
  TABLE_EDGE_INSET_PX,
  tableCaptionType,
  tableCellType,
} from './tableTokens';
import { useTableContext } from './TableContext';

import type { CSSObject } from '@mui/material/styles';
import type { TableCellProps } from './Table.types';

interface CellStyleProps {
  neofloRegion: 'head' | 'body';
  neofloSticky: boolean;
}

/**
 * The row's 16px inset, spent on the two cells that touch the edge.
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
  shouldForwardProp: (prop) =>
    prop !== 'neofloRegion' && prop !== 'neofloSticky',
})<CellStyleProps>(({ theme, neofloRegion, neofloSticky, padding, align }) => {
  const head = neofloRegion === 'head';
  const bare = padding === 'none';

  return {
    ...(head ? tableCaptionType : tableCellType),
    ...paired(theme, {
      color: head ? text.default.placeholder : text.default.body,
      borderBottomColor: border.layers.card1,
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
    // 8 either side and nothing else. The control's padding goes, which is
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

    ...(head &&
      neofloSticky &&
      paired(theme, { backgroundColor: surface.layers.card1 })),
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
const CellLayout = styled('span')({
  display: 'flex',
  flexDirection: 'inherit',
  justifyContent: 'inherit',
  alignItems: 'center',
  gap: TABLE_CELL_GAP_PX,
  minWidth: 0,
});

/** Holds its size against a long label in the next column. */
const LeadingSlot = styled('span')({
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0,
});

const TextColumn = styled('span')({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
});

/**
 * The muted second line — 12/16 in `text/default/b3`, hard against the
 * line above it.
 *
 * No gap between the two: Figma's group is 36 tall for a 20px line and a
 * 16px one (`1 line=false` cells, 3206:122293 and 3206:122290), and the
 * two leadings already hold them apart.
 *
 * It carries `data-neoflo-table-secondary` so a disabled row can grey it
 * with the rest of its ink. Without that the line keeps its own colour —
 * which is darker than the disabled ink — and a greyed row would come out
 * with its quieter line louder than its title.
 */
const SecondaryLine = styled('span')(({ theme }) => ({
  ...tableCaptionType,
  ...paired(theme, { color: text.default.placeholder }),
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
 *     `size="small"`). The design pads 8 either side and nothing top or
 *     bottom, and leaves the height to the row.
 *   - **the hairline.** MUI derives it by lightening `palette.divider`
 *     88% — a computed grey. The design names one:
 *     `border/layers/card 1`.
 *   - **the type.** `theme.typography.body2` for a data cell, and for a
 *     header cell a 24px leading at medium weight. The design uses
 *     `Sans/B1/Regular` and `Sans/B2/Regular`, and tells a header from
 *     its data by colour rather than weight.
 *   - **the pinned fill.** A sticky header cell needs to be opaque or
 *     the rows scroll through it, and MUI reaches for
 *     `background.default` — the page. A table normally sits on a card,
 *     so this uses `surface/layers/card 1`; a table on some other
 *     surface should say so with `sx`.
 *
 * ## The two props
 *
 * The design draws twelve cell variants, and ten of them are content —
 * a `Chip`, an `Avatar`, a `Switch`, a `Skeleton`, a `Button`, an
 * amount. Those compose, and no prop should stand between a caller and
 * putting a component in a cell.
 *
 * The other two are geometry, and geometry is what drifts when every
 * call site rebuilds it: a leading node 8px clear of the text, centred
 * against the row rather than the first line (`icon`), and a muted 12/16
 * second line hard under the first (`secondary`). `NavbarTitle` exists
 * for the same reason.
 *
 * @example An attachment
 * <TableCell icon={<PaperclipIcon size={16} />}>invoice-attachment</TableCell>
 *
 * @example A record with its timestamp under it
 * <TableCell secondary="14 Feb 2026 · 21:38">#1008</TableCell>
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
    const { region, stickyHeader } = useTableContext();

    const textBlock =
      secondary != null ? (
        <TextColumn>
          {children}
          <SecondaryLine data-neoflo-table-secondary>{secondary}</SecondaryLine>
        </TextColumn>
      ) : (
        children
      );

    return (
      <CellRoot
        ref={ref}
        neofloRegion={region}
        neofloSticky={stickyHeader}
        {...rest}
      >
        {icon != null ? (
          <CellLayout>
            <LeadingSlot>{icon}</LeadingSlot>
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
