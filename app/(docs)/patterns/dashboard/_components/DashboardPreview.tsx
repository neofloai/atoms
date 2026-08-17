'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Button } from '@/src/components/Button';
import { Chip } from '@/src/components/Chip';
import { DataGrid } from '@/src/components/DataGrid';
import { Divider } from '@/src/components/Divider';
import { Filter, countActiveFilters } from '@/src/components/Filter';
import { IconButton } from '@/src/components/IconButton';
import { Navbar } from '@/src/components/Navbar';
import { TextField } from '@/src/components/TextField';
import {
  FadersHorizontalIcon,
  MagnifyingGlassIcon,
  SidebarSimpleIcon,
} from '@/src/icons';

// The rail is the one the Drawer and Navbar pages already show, so the
// shell here is that arrangement rather than a third sketch of it. The
// table and its facets come from the Filter page for the same reason —
// this pattern is the two of them assembled, and a copy of either would
// eventually disagree with the page it was copied from.
import { AppRail } from '../../../components/drawer/_components/AppRail';
import {
  QUERY_COLUMNS,
  filterQueryRows,
} from '../../../components/filter/_components/queryLog';
import { groups } from '../../../components/filter/_components/sampleData';

import type { FilterValue } from '@/src/components/Filter';
import type { GridColDef } from '@mui/x-data-grid';
import type { QueryRecord } from '../../../components/filter/_components/queryLog';

/** Tall enough for every block of the rail and a page of rows. */
const FRAME_HEIGHT_PX = 720;

const EMPTY: FilterValue = {};

/**
 * Which columns this preview shows, and how they share its width.
 *
 * The same cells the Filter page's grid draws, minus `Type`. A docs
 * column is not a 1440px screen, and this one hands 220px of it to the
 * rail whenever the rail is open — but the columns that are facets have
 * to stay, because filtering by a category whose column is off screen
 * looks like nothing happened. `Type`, which is not a facet, goes.
 *
 * Every remaining column flexes rather than taking a fixed width, which
 * is what lets the table absorb the rail opening and closing. Fixed
 * widths were measurably wrong in both directions here: they left the
 * flexing `Vendor` column 336px while `Assignee` clipped a name by 19px.
 * The floors are what each cell actually needs, and they sum to less than
 * the width left when the rail is open, so the grid never scrolls
 * sideways inside the shell — it ellipsises, which is what the two-line
 * cells are built to do.
 */
const PREVIEW_COLUMN_FLEX: Record<string, { flex: number; minWidth: number }> =
  {
    reference: { flex: 1.5, minWidth: 136 },
    vendor: { flex: 2.5, minWidth: 128 },
    status: { flex: 1.4, minWidth: 136 },
    entity: { flex: 1.1, minWidth: 96 },
    assignee: { flex: 1.5, minWidth: 148 },
  };

const PREVIEW_COLUMNS: GridColDef<QueryRecord>[] = QUERY_COLUMNS.filter(
  (column) => column.field in PREVIEW_COLUMN_FLEX
).map((column) => ({
  ...column,
  ...PREVIEW_COLUMN_FLEX[column.field],
  width: undefined,
}));

/** How many rows a page holds. Twelve records, so two pages. */
const PAGE_SIZE = 10;

/**
 * The dashboard: the app shell with a filtered table inside it.
 *
 * ## The rail owns the height, the bar owns the column
 *
 * The outer box is a row — rail, then a column — not a column with a bar
 * across the top. That is what makes the brand mark the top-left corner
 * of the app, and it is why the collapse toggle sits at the leading edge
 * of the bar: it is the one control whose position does not move when the
 * rail folds.
 *
 * ## Three bands, and only one of them is elastic
 *
 * Title, toolbar, grid. The first two are as tall as their contents; the
 * grid takes everything left over, so its footer sits on the bottom edge
 * of the screen whatever the window height is. The grid draws no border or
 * radius of its own, which is what lets it be a band between two
 * hairlines rather than a card dropped on a page.
 *
 * ## One filtered table, two controls
 *
 * The search box and the panel ask different questions — "does this row
 * mention it" against "is this row one of these" — and a row has to
 * answer both, which is why `filterQueryRows` holds the rule rather than
 * either control. `Clear Filters` resets the pair, because a reader sees
 * one filtered table.
 */
export function DashboardPreview(): React.JSX.Element {
  const [collapsed, setCollapsed] = React.useState(true);

  const [selection, setSelection] = React.useState<FilterValue>(EMPTY);
  const [search, setSearch] = React.useState('');
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const activeCount = countActiveFilters(groups, selection);
  const isFiltered = activeCount > 0 || search.trim() !== '';
  const rows = filterQueryRows(search, selection);

  function handleClearFilters(): void {
    setSelection(EMPTY);
    setSearch('');
  }

  return (
    <Stack
      direction="row"
      sx={{
        height: FRAME_HEIGHT_PX,
        overflow: 'hidden',
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <AppRail collapsed={collapsed} />

      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Navbar>
          <IconButton
            variant="secondary"
            appearance="text"
            size="sm"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setCollapsed((previous) => !previous)}
          >
            <SidebarSimpleIcon />
          </IconButton>
        </Navbar>

        <Stack sx={{ flex: 1, minHeight: 0 }}>
          <Box sx={{ px: 3, py: 3 }}>
            <Typography variant="h3" component="h2">
              Query Log
            </Typography>
          </Box>
          <Divider />

          <Stack
            direction="row"
            sx={{
              px: 3,
              py: 2,
              gap: 1.5,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <TextField
              placeholder="Search..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              startAdornment={<MagnifyingGlassIcon />}
              sx={{ width: 240 }}
            />
            <Stack direction="row" sx={{ gap: 1 }}>
              <Button
                variant="secondary"
                appearance="outline"
                disabled={!isFiltered}
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
              <Button
                variant="secondary"
                appearance="outline"
                startIcon={<FadersHorizontalIcon />}
                onClick={(event) => setAnchorEl(event.currentTarget)}
              >
                Filter
                {activeCount > 0 && (
                  <Chip
                    size="sm"
                    variant="primary"
                    component="span"
                    label={activeCount}
                  />
                )}
              </Button>
            </Stack>
          </Stack>
          <Divider />

          {/* The grid is `height: 100%`, so it needs a parent with a
              definite height to be 100% of. `minHeight: 0` is what makes
              `flex: 1` mean "what is left" rather than "at least the
              rows", which would push the footer past the bottom edge. */}
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <DataGrid
              size="sm"
              rows={rows}
              columns={PREVIEW_COLUMNS}
              rowNoun="queries"
              pageSizeOptions={[PAGE_SIZE]}
              initialState={{
                pagination: { paginationModel: { pageSize: PAGE_SIZE } },
              }}
              disableColumnMenu
            />
          </Box>
        </Stack>
      </Stack>

      <Filter
        groups={groups}
        value={selection}
        onChange={setSelection}
        anchorEl={anchorEl}
        open={anchorEl !== null}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      />
    </Stack>
  );
}

DashboardPreview.displayName = 'DashboardPreview';
