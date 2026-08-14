'use client';

import * as React from 'react';
import { TableBody as MuiTableBody } from '@mui/material';

import { TableContext, useTableContext } from './TableContext';

import type { TableContextValue } from './TableContext';
import type { TableBodyProps } from './Table.types';

/**
 * The `<tbody>` — the rows of data.
 *
 * Carries no styling and, unlike `TableHead`, changes nothing about its
 * children either: a row is a data row by default, so this is what the
 * rows inside a `Table` already are. It is here so that the whole family
 * can be imported from one place, and so that a body nested under a head
 * — a header row and its data in one `<table>` inside another cell —
 * puts its rows back to a data height rather than inheriting 32.
 *
 * @example
 * <TableBody>
 *   {invoices.map((invoice) => (
 *     <TableRow key={invoice.id} hover>
 *       <TableCell>{invoice.number}</TableCell>
 *     </TableRow>
 *   ))}
 * </TableBody>
 *
 * @see Related: Table, TableHead, TableRow, TableCell
 */
export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  TableBodyProps
>(function TableBody(props, ref) {
  const { size, stickyHeader } = useTableContext();

  const context = React.useMemo<TableContextValue>(
    () => ({ size, region: 'body', stickyHeader }),
    [size, stickyHeader]
  );

  return (
    <TableContext.Provider value={context}>
      <MuiTableBody ref={ref} {...props} />
    </TableContext.Provider>
  );
});

TableBody.displayName = 'TableBody';
