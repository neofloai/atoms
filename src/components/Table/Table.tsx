'use client';

import * as React from 'react';
import {
  Table as MuiTable,
  tableCellClasses,
  tableRowClasses,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import { border } from '@/src/tokens';

import { paired } from '../_shared/actionStyles';
import { TableContext } from './TableContext';

import type { TableContextValue } from './TableContext';
import type { TableProps } from './Table.types';

/**
 * The neighbour rule for a selected row's upper hairline. See the
 * component's own JSDoc below for why it cannot live on the row.
 */
const TableRoot = styled(MuiTable)(({ theme }) => ({
  [`& .${tableRowClasses.root}:has(+ .${tableRowClasses.selected}) .${tableCellClasses.root}`]:
    paired(theme, { borderBottomColor: border.primary.defaultHover }),
}));

/**
 * A table of records: a 32px strip of column labels over rows of one
 * height, separated by hairlines. Wraps MUI `Table` with the geometry
 * the Figma `table-rows` section draws (node 3215:52225) and leaves the
 * groups, rows and cells inside it to `TableHead`, `TableBody`,
 * `TableRow` and `TableCell`.
 *
 * ## When this and when the grid
 *
 * This is the simple one, and it is the right default. It renders the
 * markup you write, so a cell can hold anything — a `Chip`, an `Avatar`,
 * a `Switch`, two lines of text — and it ships nothing you are not
 * using. Reach for it for a fixed or short list of records: a summary on
 * a dashboard, the lines of one invoice, a settings matrix.
 *
 * The data grid, which lands after this, is the one to reach for when
 * the table is the screen's work rather than one of its panels:
 * thousands of rows that need virtualising, sorting and filtering and
 * pagination that you would otherwise write by hand, inline editing,
 * column resizing, CSV export, server-side data. Every one of those is
 * a reason to switch; none of them is a reason to grow this component.
 *
 * ## The design is a stack of bands, not a card
 *
 * There is no outer border, no radius, no shadow, and no fill of its
 * own. `3223:61897` is 320 tall for a header and six `sm` rows, which is
 * `32 + 6 × 48` exactly — no padding around the set and no gap between
 * rows. So a table takes the colour of whatever it is dropped onto, and
 * an edge around it is the `Card`'s job rather than this component's.
 *
 * The one line it does draw is the hairline under each row, including
 * the last, so a table ends on a rule rather than on nothing. That is
 * how Figma stacks them, and `Accordion` ends its lists the same way.
 *
 * ## What the wrapper corrects in MUI
 *
 * Almost nothing on this element, and a great deal on the four below it.
 * MUI's `<table>` is already `width: 100%` with collapsed borders and no
 * fill, which is what the design wants. What it gets here is the two
 * things its own children cannot work out for themselves:
 *
 *   - **the density**, passed down as context rather than through MUI's
 *     `size`, which holds two values where the design has three.
 *   - **the top edge of a selected row**, which no row can draw for
 *     itself. See below.
 *
 * ## Why the selected row's own cells cannot draw its top hairline
 *
 * The design brackets a selected row between two `border/primary/2`
 * lines. The lower one is easy — it is the row's own hairline in a
 * different colour. The upper one is the *previous* row's hairline, and
 * under `border-collapse: collapse` the two rows share that edge:
 * exactly one border is painted there, and when a top and a bottom
 * border compete at the same width and style, CSS gives it to the cell
 * further up the table. A `border-top` on the selected row would lose
 * that tie every time and never appear.
 *
 * So the rule below reaches the row *above* a selected one and recolours
 * the hairline it already owns. Two consequences worth knowing:
 *
 *   - A selected first row keeps a grey line above it, because `<thead>`
 *     and `<tbody>` are separate groups and `+` does not cross between
 *     them. The header's own underline turning primary would read as the
 *     whole table being selected, so this is left alone.
 *   - The rule is `:has()`, so it costs one selector rather than a
 *     `useState` and a second render, and a browser without `:has()`
 *     simply keeps the grey line.
 *
 * @example Inside a card, with a scroll box
 * <Card>
 *   <TableContainer sx={{ maxHeight: 320 }}>
 *     <Table size="sm" stickyHeader>
 *       ...
 *     </Table>
 *   </TableContainer>
 * </Card>
 *
 * @see Related: TableContainer, TableHead, TableBody, TableRow, TableCell, TableSortLabel, Card, Chip
 */
export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  function Table({ size = 'md', stickyHeader = false, ...rest }, ref) {
    // `region` is set here rather than defaulted in the context, so a
    // `TableRow` dropped straight into a `Table` — no `TableBody` — is
    // still a data row. `TableHead` overrides it for its own subtree.
    const context = React.useMemo<TableContextValue>(
      () => ({ size, region: 'body', stickyHeader }),
      [size, stickyHeader]
    );

    return (
      <TableContext.Provider value={context}>
        <TableRoot ref={ref} stickyHeader={stickyHeader} {...rest} />
      </TableContext.Provider>
    );
  }
);

Table.displayName = 'Table';
