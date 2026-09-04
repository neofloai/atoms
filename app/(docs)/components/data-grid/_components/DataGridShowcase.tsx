'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { DataGrid } from '@/src/components/DataGrid';

import {
  GRID_ROWS,
  OWNER_COLUMNS,
  RECORD_COLUMNS,
  TYPED_COLUMNS,
} from './gridColumns';

import type { DataGridRowState, DataGridSize } from '@/src/components/DataGrid';

/** The three densities, smallest first. */
const SIZES: readonly { size: DataGridSize; height: number }[] = [
  { size: 'sm', height: 48 },
  { size: 'md', height: 56 },
  { size: 'lg', height: 64 },
];

const HEADER_PX = 32;
const FOOTER_PX = 48;

/** A grid's box, sized from the rows it is meant to show. */
function GridBox({
  rows,
  size = 'sm',
  footer = false,
  children,
}: {
  rows: number;
  size?: DataGridSize;
  footer?: boolean;
  children: React.ReactNode;
}) {
  const rowHeight = SIZES.find((each) => each.size === size)?.height ?? 56;

  return (
    <Box
      sx={{ height: HEADER_PX + rows * rowHeight + (footer ? FOOTER_PX : 0) }}
    >
      {children}
    </Box>
  );
}

GridBox.displayName = 'GridBox';

function PreviewCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        {children}
      </Paper>
    </Stack>
  );
}

PreviewCard.displayName = 'PreviewCard';

/** The row whose data failed, and the one that cleared. */
const ROW_STATES: Record<string, DataGridRowState> = {
  'inv-1005': 'error',
  'inv-1004': 'success',
  'inv-1003': 'disabled',
};

function StatesGrid() {
  return (
    <GridBox rows={6}>
      <DataGrid
        size="sm"
        rows={GRID_ROWS.slice(0, 6)}
        columns={OWNER_COLUMNS}
        checkboxSelection
        isRowSelectable={({ id }) => ROW_STATES[String(id)] !== 'disabled'}
        rowState={({ id }) => ROW_STATES[String(id)]}
        hideFooter
        disableColumnMenu
      />
    </GridBox>
  );
}

StatesGrid.displayName = 'StatesGrid';

function LoadingGrid() {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setLoading((current) => !current);
    }, 2600);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <GridBox rows={5}>
      <DataGrid
        size="sm"
        rows={GRID_ROWS.slice(0, 5)}
        columns={TYPED_COLUMNS}
        loading={loading}
        hideFooter
      />
    </GridBox>
  );
}

LoadingGrid.displayName = 'LoadingGrid';

/**
 * Six previews: a table of records as a grid, the three densities, every
 * row state, sorting and its menu, pagination, and loading.
 *
 * The first is the same six columns as the table page's first preview,
 * built from the same records, so the two can be held side by side.
 */
export function DataGridShowcase() {
  return (
    <Stack spacing={4}>
      <PreviewCard
        title="A grid of records"
        description="The same six columns as the table page's first preview, with a grid behind them: click a header to sort, drag a separator to resize, hover one for the tint and the two-headed arrow. Nothing about the rows changed — 48 tall, 24 from the edge, a hairline under each including the last."
      >
        <GridBox rows={6}>
          <DataGrid
            size="sm"
            rows={GRID_ROWS.slice(0, 6)}
            columns={RECORD_COLUMNS}
            hideFooter
          />
        </GridBox>
      </PreviewCard>

      <PreviewCard
        title="Three densities, one header"
        description="sm is 48, md is 56, lg is 64, and the header strip stays 32 in all three. One prop sets both heights, which is what keeps a 48px row from ending up under a 56px header."
      >
        <Stack spacing={4}>
          {SIZES.map(({ size, height }) => (
            <Stack key={size} spacing={1}>
              <Typography variant="caption" color="text.secondary">
                <code>size=&quot;{size}&quot;</code> — {height}px rows, 32px
                header
              </Typography>
              <GridBox rows={2} size={size}>
                <DataGrid
                  size={size}
                  rows={GRID_ROWS.slice(0, 2)}
                  columns={TYPED_COLUMNS}
                  hideFooter
                  disableColumnMenu
                />
              </GridBox>
            </Stack>
          ))}
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Every state a row can be in"
        description="Tick a row and it is bracketed between two primary hairlines rather than filled more heavily — including the first row, which the table cannot do. Two rows carry state from their data: one failed validation, one cleared it. The last is greyed, and paired with isRowSelectable so it cannot be picked either."
      >
        <StatesGrid />
      </PreviewCard>

      <PreviewCard
        title="Sorting, and the menu behind it"
        description="Hover a header for the tint and the two-headed arrow; the column the grid is sorted by keeps a single arrow at rest. The menu button opens the column's own menu, which words its rows from the column's type — a vendor sorts A to Z, a date old to new, an amount low to high — and keeps all three rows in every state, with Clear sort greyed when there is nothing to clear."
      >
        <GridBox rows={5}>
          <DataGrid
            size="sm"
            rows={GRID_ROWS.slice(0, 5)}
            columns={TYPED_COLUMNS}
            initialState={{
              sorting: { sortModel: [{ field: 'amount', sort: 'desc' }] },
            }}
            hideFooter
          />
        </GridBox>
      </PreviewCard>

      <PreviewCard
        title="Paged, and counted in its own noun"
        description="42 records, ten to a page: a count, a previous and a next, and a jump-to-start that appears only once you have left the first page — so page one shows two buttons and page two shows three. There is no rows-per-page control."
      >
        <GridBox rows={10} footer>
          <DataGrid
            size="sm"
            rows={GRID_ROWS}
            columns={TYPED_COLUMNS}
            rowNoun="invoices"
            pagination
            pageSizeOptions={[10]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          />
        </GridBox>
      </PreviewCard>

      <PreviewCard
        title="Loading"
        description="A 20px bar in surface.primary.subtle filling every cell, at the row height already set. This preview toggles every few seconds; a real one would follow a fetch."
      >
        <LoadingGrid />
      </PreviewCard>
    </Stack>
  );
}

DataGridShowcase.displayName = 'DataGridShowcase';
