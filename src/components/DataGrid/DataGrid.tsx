'use client';

import * as React from 'react';
import { styled } from '@mui/material/styles';
import { DataGrid as MuiDataGrid } from '@mui/x-data-grid';

import { DataGridContext } from './DataGridContext';
import { DATA_GRID_COLUMN_MENU_SLOTS, DATA_GRID_SLOTS } from './dataGridSlots';
import {
  DATA_GRID_ROW_STATE_CLASS,
  dataGridMenuPanelStyles,
  dataGridStyles,
} from './dataGridStyles';
import {
  DATA_GRID_HEADER_HEIGHT_PX,
  DATA_GRID_ROW_HEIGHT_PX,
} from './dataGridTokens';

import type {
  GridColDef,
  GridLocaleText,
  GridRowClassNameParams,
  GridValidRowModel,
} from '@mui/x-data-grid';
import type { DataGridContextValue } from './DataGridContext';
import type { DataGridProps } from './DataGrid.types';

const GridRoot = styled(MuiDataGrid)(({ theme }) => dataGridStyles(theme));

/**
 * How the sort menu words itself, per column type.
 *
 * Figma draws three menus rather than one — `table-sort/num`,
 * `table-sort/name` and `table-sort/date` — and their rows say "Low to
 * high", "A to Z" and "Old to new". So the wording is a property of what
 * is in the column, not of the direction, and MUI X's `columnMenuSortAsc`
 * takes a function of the column definition for exactly this.
 *
 * `singleSelect` reads alphabetically because its values are labels.
 * Everything with no drawn wording — `boolean`, `actions`, a custom
 * comparator — falls back to naming the direction, which is at least
 * true.
 */
const SORT_ASCENDING_LABEL: Record<string, string> = {
  number: 'Low to high',
  string: 'A to Z',
  singleSelect: 'A to Z',
  date: 'Old to new',
  dateTime: 'Old to new',
};

const SORT_DESCENDING_LABEL: Record<string, string> = {
  number: 'High to low',
  string: 'Z to A',
  singleSelect: 'Z to A',
  date: 'New to old',
  dateTime: 'New to old',
};

const DEFAULT_LOCALE_TEXT: Partial<GridLocaleText> = {
  columnMenuSortAsc: (colDef: GridColDef) =>
    SORT_ASCENDING_LABEL[colDef.type ?? 'string'] ?? 'Ascending',
  columnMenuSortDesc: (colDef: GridColDef) =>
    SORT_DESCENDING_LABEL[colDef.type ?? 'string'] ?? 'Descending',
  columnMenuUnsort: 'Clear sort',
};

const DataGridRoot = React.forwardRef<HTMLDivElement, DataGridProps>(
  function DataGrid(
    {
      size = 'md',
      rowNoun = 'rows',
      rowState,
      getRowClassName,
      localeText,
      slots,
      slotProps,
      columns,
      ...rest
    },
    ref
  ) {
    const context = React.useMemo<DataGridContextValue>(
      () => ({ rowNoun }),
      [rowNoun]
    );

    // A column that renders its own cell gets a flex cell, so what it
    // renders is centred in the row.
    //
    // MUI centres a cell's content by setting `line-height` to the row's
    // height, which only reaches *inline* content — a block or a flex
    // child lands at the top of the row instead, a pixel under the
    // hairline. Two of the design's own cells are exactly that: the
    // two-line record and the action pair. `display: 'flex'` is MUI's
    // switch for it, and this turns it on for the columns that need it
    // rather than leaving every call site to remember.
    //
    // Only `renderCell` columns, and only when the column has not said
    // otherwise. A plain text column keeps the line-height trick, which
    // is what makes its ellipsis work; a `renderCell` column that returns
    // long text and wants that back says `display: 'text'`.
    const flexColumns = React.useMemo(
      () =>
        columns.map((column) =>
          column.renderCell && column.display === undefined
            ? { ...column, display: 'flex' as const }
            : column
        ),
      [columns]
    );

    // One `getRowClassName` reaching the grid, whichever of the two the
    // caller used. `rowState`'s class comes first so a caller's own class
    // is the one later in the attribute, which is where a reader looks
    // for it.
    const rowClassName = React.useMemo(() => {
      if (!rowState) {
        return getRowClassName;
      }

      return (params: GridRowClassNameParams): string => {
        const state = rowState(params);

        return [
          state && state !== 'default'
            ? DATA_GRID_ROW_STATE_CLASS[state]
            : undefined,
          getRowClassName?.(params),
        ]
          .filter(Boolean)
          .join(' ');
      };
    }, [rowState, getRowClassName]);

    return (
      <DataGridContext.Provider value={context}>
        <GridRoot
          ref={ref}
          columns={flexColumns}
          rowHeight={DATA_GRID_ROW_HEIGHT_PX[size]}
          columnHeaderHeight={DATA_GRID_HEADER_HEIGHT_PX}
          getRowClassName={rowClassName}
          localeText={{ ...DEFAULT_LOCALE_TEXT, ...localeText }}
          slots={{ ...DATA_GRID_SLOTS, ...slots }}
          slotProps={{
            basePopper: { sx: dataGridMenuPanelStyles },
            columnMenu: { slots: DATA_GRID_COLUMN_MENU_SLOTS },
            // The design's loading state is rows of bars, in both of the
            // cases MUI distinguishes: loading over existing rows, and
            // loading with none yet.
            loadingOverlay: { variant: 'skeleton', noRowsVariant: 'skeleton' },
            ...slotProps,
          }}
          {...rest}
        />
      </DataGridContext.Provider>
    );
  }
);

DataGridRoot.displayName = 'DataGrid';

/**
 * The generic that `forwardRef` drops.
 *
 * `React.forwardRef` cannot carry a type parameter through, so the row
 * type would collapse to the default and `valueGetter` callbacks would
 * stop knowing what a row is. Restating the call signature keeps
 * `<DataGrid<Invoice> rows={invoices} />` inferring properly — the same
 * shape MUI X declares for its own grid, and the same move `Skeleton`
 * makes to keep `component` alive through `styled()`.
 */
interface DataGridComponent {
  <R extends GridValidRowModel = GridValidRowModel>(
    props: DataGridProps<R> & React.RefAttributes<HTMLDivElement>
  ): React.JSX.Element;
}

/**
 * A grid of records: the table's design, with MUI X's machinery behind
 * it. Wraps the community `DataGrid` in the geometry and ink of the Figma
 * `table-rows` section (node 3215:52225), so a screen can move from
 * `Table` to this one without the rows changing height or the header
 * changing colour.
 *
 * ## This one, or the table
 *
 * Reach for this when the table is the screen's work rather than one of
 * its panels: thousands of rows that need virtualising, sorting and
 * filtering and pagination you would otherwise write by hand, inline
 * editing, column resizing, CSV export, server-side data. All of that is
 * MUI X's and passes through untouched — it is the reason to be here.
 *
 * Reach for `Table` when the data is short and fixed and the cells are
 * whatever you want to put in them. It ships nothing you are not using;
 * this ships a grid engine.
 *
 * ## What the wrapper changes
 *
 * Four things, and the first is the one that makes a MUI grid look like a
 * MUI grid:
 *
 *   - **the frame.** MUI draws a 1px border with a radius around the
 *     whole grid and fills it with `background.paper`. The design draws a
 *     stack of bands: no border, no radius, no fill, a hairline under
 *     every row including the last, and a 32px label strip on top. An
 *     edge around it is a `Card`'s to draw.
 *   - **the density.** `size` sets the row height and the header height
 *     together — 48 / 56 / 64 over a flat 32 — where MUI has a 52px row
 *     under a 56px header and a separate `density` multiplier on top.
 *   - **the footer.** MUI's is `TablePagination`: a rows-per-page
 *     `Select`, a count, two bare arrows. The design's is a count and
 *     three filled 32px buttons, with the jump-to-start appearing only
 *     once you have left the first page.
 *   - **the parts.** The selection checkbox, the menu rows, the sort
 *     glyphs and the loading bars are all the house components, so a grid
 *     is built out of the same pieces as the page around it.
 *
 * ## Two things worth knowing
 *
 * A grid needs a height. MUI's root is `height: 100%`, which resolves to
 * nothing in a parent that has no height of its own, and a grid that
 * renders as a 1px line is almost always this. There is a 320px floor
 * here so that never happens silently, but say what you mean: put it in a
 * sized box, or pass `autoHeight` to let it grow with its rows.
 *
 * Sorting is on by default and paginating is not, which is MUI's split
 * and worth keeping — `pagination` is what brings up the designed footer.
 *
 * @example A grid of records
 * <Box sx={{ height: 420 }}>
 *   <DataGrid rows={invoices} columns={columns} size="sm" rowNoun="invoices" />
 * </Box>
 *
 * @example Paginated, selectable, sorted on arrival
 * <DataGrid
 *   rows={invoices}
 *   columns={columns}
 *   pagination
 *   checkboxSelection
 *   initialState={{
 *     pagination: { paginationModel: { pageSize: 10 } },
 *     sorting: { sortModel: [{ field: 'amount', sort: 'desc' }] },
 *   }}
 * />
 *
 * @example Tinting rows from their own data
 * <DataGrid
 *   rows={invoices}
 *   columns={columns}
 *   rowState={({ row }) => (row.failed ? 'error' : undefined)}
 * />
 *
 * @see Related: Table, Card, Checkbox, MenuItem, IconButton, Chip
 */
export const DataGrid = DataGridRoot as unknown as DataGridComponent;
