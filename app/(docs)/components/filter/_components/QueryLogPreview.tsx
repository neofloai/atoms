'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { Button } from '@/src/components/Button';
import { Chip } from '@/src/components/Chip';
import { DataGrid } from '@/src/components/DataGrid';
import { Filter, countActiveFilters } from '@/src/components/Filter';
import { TextField } from '@/src/components/TextField';
import { FadersHorizontalIcon, MagnifyingGlassIcon } from '@/src/icons';

import {
  QUERY_COLUMNS,
  QUERY_ROWS,
  rowFacetValue,
  rowSearchText,
} from './queryLog';
import { groups } from './sampleData';

import type { FilterValue } from '@/src/components/Filter';
import type { QueryRecord } from './queryLog';

const EMPTY: FilterValue = {};

/** Grid box geometry, so the preview does not resize as rows drop out. */
const HEADER_PX = 32;
const ROW_PX = 48;
const FOOTER_PX = 48;
const VISIBLE_ROWS = 6;

/**
 * A group with nothing selected constrains nothing. A row that has no
 * value for the facet at all — an unassigned query against an
 * `Assignee` selection — is excluded rather than kept, which is what a
 * reader picking two names expects to see.
 */
function matchesFacet(
  row: QueryRecord,
  groupId: string,
  selected: readonly string[]
): boolean {
  if (selected.length === 0) {
    return true;
  }
  const value = rowFacetValue(row, groupId);
  return value !== null && selected.includes(value);
}

/**
 * The whole pattern: a search box and a filter trigger over a
 * `DataGrid`, with the panel hanging off the trigger.
 *
 * Search and the panel are two different questions and are kept as two
 * pieces of state — the box asks "does this row mention it", the panel
 * asks "is this row one of these". `Clear Filters` resets both, because
 * from the reader's side there is one filtered table, not two.
 *
 * Filtering happens here rather than in the grid's own filter model:
 * the panel already produces the selection, and running it through MUI
 * X's filter API would mean translating a map the caller understands
 * into one it does not.
 */
export function QueryLogPreview(): React.JSX.Element {
  const [selection, setSelection] = React.useState<FilterValue>({});
  const [search, setSearch] = React.useState('');
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const activeCount = countActiveFilters(groups, selection);
  const isFiltered = activeCount > 0 || search.trim() !== '';

  const query = search.trim().toLowerCase();
  const rows = QUERY_ROWS.filter(
    (row) =>
      (query === '' || rowSearchText(row).includes(query)) &&
      groups.every((group) =>
        matchesFacet(row, group.id, selection[group.id] ?? [])
      )
  );

  function handleClearFilters(): void {
    setSelection(EMPTY);
    setSearch('');
  }

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <TextField
          placeholder="Search..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          startAdornment={<MagnifyingGlassIcon />}
          sx={{ width: { xs: '100%', sm: 280 } }}
        />
        <Stack direction="row" spacing={1}>
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

      <Box sx={{ height: HEADER_PX + VISIBLE_ROWS * ROW_PX + FOOTER_PX }}>
        <DataGrid
          size="sm"
          rows={rows}
          columns={QUERY_COLUMNS}
          pageSizeOptions={[VISIBLE_ROWS]}
          initialState={{
            pagination: { paginationModel: { pageSize: VISIBLE_ROWS } },
          }}
          disableColumnMenu
        />
      </Box>

      <Filter
        groups={groups}
        value={selection}
        onChange={setSelection}
        anchorEl={anchorEl}
        open={anchorEl !== null}
        onClose={() => setAnchorEl(null)}
        // The trigger is at the right end of the toolbar, so the panel
        // hangs from its right edge and grows out of its top-right
        // corner. Left-aligned it would run off the page and be shoved
        // back in, ending up lined up with nothing.
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      />
    </Stack>
  );
}

QueryLogPreview.displayName = 'QueryLogPreview';
