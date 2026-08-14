'use client';

import * as React from 'react';
import { TableContainer as MuiTableContainer } from '@mui/material';

import type { TableContainerProps } from './Table.types';

/**
 * The box a table scrolls inside.
 *
 * MUI's own component, unchanged, and deliberately so: it is a
 * `Paper`-less `<div>` with `width: 100%; overflow-x: auto`, which is
 * exactly what the design needs. A table here draws no surface, no
 * border and no radius of its own, so there is nothing for this element
 * to correct — the edge around a table is a `Card`'s to draw.
 *
 * It is wrapped rather than re-exported so that the whole family arrives
 * from one import and no call site has to reach into `@mui/material` for
 * one of five pieces.
 *
 * Two reasons to use it. Horizontally, it keeps a table with more columns
 * than room from widening the page — without it the layout around the
 * table stretches instead. Vertically, `maxHeight` plus
 * `<Table stickyHeader>` is what pins the header, because sticky
 * positions against the nearest scrolling ancestor and this is it.
 *
 * @example A wide table
 * <TableContainer>
 *   <Table>...</Table>
 * </TableContainer>
 *
 * @example A tall table with a pinned header
 * <TableContainer sx={{ maxHeight: 320 }}>
 *   <Table stickyHeader>...</Table>
 * </TableContainer>
 *
 * @see Related: Table, Card
 */
export const TableContainer = React.forwardRef<
  HTMLDivElement,
  TableContainerProps
>(function TableContainer(props, ref) {
  return <MuiTableContainer ref={ref} {...props} />;
});

TableContainer.displayName = 'TableContainer';
