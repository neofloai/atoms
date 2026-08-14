'use client';

import * as React from 'react';
import {
  TableRow as MuiTableRow,
  tableCellClasses,
  tableRowClasses,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import { border, surface, text } from '@/src/tokens';

import { paired } from '../_shared/actionStyles';
import { TABLE_HEADER_ROW_HEIGHT_PX, TABLE_ROW_HEIGHT_PX } from './tableTokens';
import { useTableContext } from './TableContext';

import type { CSSObject, Theme } from '@mui/material/styles';
import type { ModeToken } from '@/src/tokens';
import type { TableRowProps, TableRowState } from './Table.types';

/** The fill a row carries because of its data, per `state`. */
const STATE_FILL: Record<TableRowState, ModeToken | undefined> = {
  default: undefined,
  error: surface.error.subtle,
  success: surface.success.subtle,
};

/**
 * The fill a `state` row takes under the pointer.
 *
 * Inferred rather than transcribed: Figma draws `hover` and it draws
 * `error`, and never the two together. Left at the resting fill an
 * interactive error row would answer the pointer with nothing, and moved
 * to the neutral hover tint it would stop looking like an error, so it
 * takes the next rung of its own ladder — the one the token set already
 * calls `subtleHover`. Logged as DESIGNER_QUESTIONS.md #48.
 */
const STATE_HOVER_FILL: Record<TableRowState, ModeToken> = {
  default: surface.layers.card1,
  error: surface.error.subtleHover,
  success: surface.success.subtleHover,
};

interface RowStyleProps {
  neofloHeight: number;
  neofloState: TableRowState;
  neofloDisabled: boolean;
}

function rowStateStyles(theme: Theme, state: TableRowState): CSSObject {
  const fill = STATE_FILL[state];

  return {
    ...(fill && paired(theme, { backgroundColor: fill })),
    // MUI's hover rule is two classes and a pseudo-class deep, so it
    // outranks the plain fill above no matter which is written first.
    // Both have to be answered, and `state` has to answer both.
    [`&.${tableRowClasses.hover}:hover`]: paired(theme, {
      backgroundColor: STATE_HOVER_FILL[state],
    }),
  };
}

/** The band itself. Documented on the component below. */
const RowRoot = styled(MuiTableRow, {
  shouldForwardProp: (prop) =>
    prop !== 'neofloHeight' &&
    prop !== 'neofloState' &&
    prop !== 'neofloDisabled',
})<RowStyleProps>(
  ({ theme, neofloHeight, neofloState, neofloDisabled }): CSSObject => ({
    height: neofloHeight,

    ...rowStateStyles(theme, neofloState),

    [`&.${tableRowClasses.selected}`]: {
      ...paired(theme, { backgroundColor: surface.layers.card1 }),
      '&:hover': paired(theme, { backgroundColor: surface.layers.card1 }),
      // The lower half of the bracket. It reaches into the cells because
      // that is where the hairline is drawn; the row's own `border-bottom`
      // would lose the collapse to it.
      [`& .${tableCellClasses.root}`]: paired(theme, {
        borderBottomColor: border.primary.defaultHover,
      }),
    },

    // Last, so it holds against `selected` and `hover` alike: a disabled
    // row is disabled whatever else is true of it.
    ...(neofloDisabled && {
      pointerEvents: 'none',
      [`&, &.${tableRowClasses.hover}:hover, &.${tableRowClasses.selected}`]: {
        backgroundColor: 'transparent',
      },
      [`& .${tableCellClasses.root}`]: paired(theme, {
        color: text.disabled.default,
        borderBottomColor: border.disabled.default,
      }),
      // A cell's second line paints its own muted ink, so it does not
      // inherit this one — and that ink is *darker* than the disabled
      // grey, which would leave a greyed row with its quietest line the
      // loudest thing in it.
      '& [data-neoflo-table-secondary]': paired(theme, {
        color: text.disabled.default,
      }),
    }),
  })
);

/**
 * One band of the table. Wraps MUI `TableRow` with the design's row
 * heights and the four fills its `State` axis draws.
 *
 * ## What the wrapper corrects in MUI
 *
 * Every colour, and the height. MUI tints `hover` with
 * `palette.action.hover` and `selected` with the primary colour at 8%
 * alpha — both translucent blacks and blues mixed against whatever is
 * behind them, where the design names two opaque surfaces
 * (`surface/layers/card 1` for both, as it happens) and distinguishes
 * selection some other way. See below.
 *
 * ## Height lives here, and vertical padding does not
 *
 * The row is what the design fixes — 48, 56 or 64, from the table's
 * `size`, and a flat 32 in the header regardless of it. So the height is
 * set on the `<tr>` and the cells inside it carry no vertical padding at
 * all: they inherit `vertical-align: middle` from this element, which
 * centres one line or two without either being told which it is. A cell
 * with a 20px line and a 16px one under it comes to 36 and centres in
 * all three heights, which is how the design's two-line variants fit a
 * 48px row.
 *
 * ## Selection is a bracket, not a fill
 *
 * `selected` paints the same `card 1` as `hover` — on its own it would
 * be indistinguishable from the pointer passing over. What tells them
 * apart is a `border/primary/2` line above and below the row. The lower
 * one is this row's own hairline, recoloured here. The upper one belongs
 * to the row above and is recoloured by `Table`, because under collapsed
 * borders the two rows share that edge and the upper cell wins it —
 * `Table.tsx` has the details.
 *
 * A selected row keeps its fill under the pointer rather than deepening,
 * because the design gives selection and hover the same surface and only
 * one of them can be an answer to the pointer.
 *
 * @example A selectable row
 * <TableRow hover selected={isSelected} onClick={toggle}>
 *   <TableCell padding="checkbox">
 *     <Checkbox checked={isSelected} />
 *   </TableCell>
 *   <TableCell>inv-mds1203</TableCell>
 * </TableRow>
 *
 * @example A row that failed validation
 * <TableRow state="error">
 *   <TableCell>inv-mds1204</TableCell>
 *   <TableCell>Vendor not on file</TableCell>
 * </TableRow>
 *
 * @see Related: Table, TableCell, TableHead, TableBody, Checkbox
 */
export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  function TableRow({ state = 'default', disabled = false, ...rest }, ref) {
    const { size, region } = useTableContext();

    return (
      <RowRoot
        ref={ref}
        neofloHeight={
          region === 'head'
            ? TABLE_HEADER_ROW_HEIGHT_PX
            : TABLE_ROW_HEIGHT_PX[size]
        }
        neofloState={state}
        neofloDisabled={disabled}
        // Visual only in Figma, and visual only here — the controls in a
        // disabled row keep their own `disabled`. This says so to anything
        // reading the row rather than looking at it.
        aria-disabled={disabled || undefined}
        {...rest}
      />
    );
  }
);

TableRow.displayName = 'TableRow';
