'use client';

import * as React from 'react';
import { TableHead as MuiTableHead } from '@mui/material';

import { TableContext, useTableContext } from './TableContext';

import type { TableContextValue } from './TableContext';
import type { TableHeadProps } from './Table.types';

/**
 * The `<thead>` — the design's 32px strip of column labels.
 *
 * Carries no styling of its own. It exists because the two things that
 * make a header row look like one belong to the row and the cell, and
 * neither can tell which group it is in: the flat 32px height regardless
 * of the table's size, and the muted 12/16 `text/default/b3` label. This
 * component is what tells them.
 *
 * MUI's `TableHead` is left to do its own job underneath, which is real:
 * it is what makes each cell render `<th scope="col">` instead of
 * `<td>`.
 *
 * @example
 * <TableHead>
 *   <TableRow>
 *     <TableCell>Invoice</TableCell>
 *     <TableCell>Vendor</TableCell>
 *     <TableCell align="right">Amount</TableCell>
 *   </TableRow>
 * </TableHead>
 *
 * @see Related: Table, TableBody, TableRow, TableCell, TableSortLabel
 */
export const TableHead = React.forwardRef<
  HTMLTableSectionElement,
  TableHeadProps
>(function TableHead(props, ref) {
  const { size, stickyHeader } = useTableContext();

  const context = React.useMemo<TableContextValue>(
    () => ({ size, region: 'head', stickyHeader }),
    [size, stickyHeader]
  );

  return (
    <TableContext.Provider value={context}>
      <MuiTableHead ref={ref} {...props} />
    </TableContext.Provider>
  );
});

TableHead.displayName = 'TableHead';
