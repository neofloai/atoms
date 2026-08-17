/**
 * The dashboard pattern, as a page a consumer can paste.
 *
 * Kept in its own file because it is one long string and the metadata
 * around it is short — and because `get_pattern` promises "the full page
 * layout code", so this is the deliverable rather than an excerpt of one.
 * The rail's contents are written out for the same reason: a snippet that
 * referenced an `<AppSidebar />` the reader does not have would hand back
 * half a screen.
 *
 * What is left to the reader is the data — the rows, the columns and the
 * facet options — because those are the application. Everything that is
 * layout is here.
 */
export const dashboardCode = `'use client';

import * as React from 'react';
import Typography from '@mui/material/Typography';
import {
  Box,
  Button,
  Chip,
  DataGrid,
  Divider,
  Drawer,
  Filter,
  IconButton,
  Navbar,
  NeofloLogo,
  Stack,
  TextField,
  ToggleButton,
  Tooltip,
  countActiveFilters,
} from '@neofloai/atoms';
import {
  ChartLineIcon,
  FadersHorizontalIcon,
  MagnifyingGlassIcon,
  QuestionIcon,
  SidebarSimpleIcon,
  SquaresFourIcon,
} from '@neofloai/atoms/icons';

import type { FilterValue } from '@neofloai/atoms';
import { QUERY_COLUMNS, QUERY_ROWS, filterQueries } from './queries';
import { FILTER_GROUPS } from './facets';

/**
 * The folded rail. A width the rail is in, not a rung on the scale —
 * which is why it goes to size as a number and animates on its own.
 */
const RAIL_COLLAPSED_PX = 64;

/** Gutter the rail's blocks stretch between. Expanded only. */
const RAIL_GUTTER_PX = 16;

const NAV = [
  { key: 'queries', label: 'Query log', Icon: SquaresFourIcon },
  { key: 'analytics', label: 'Analytics', Icon: ChartLineIcon },
];

const FOOTER_NAV = [{ key: 'help', label: 'Help', Icon: QuestionIcon }];

/**
 * One nav row. A pill the width of the block expanded, a square the
 * height of the row collapsed: the fill is the part of a row the eye
 * reads, and a wide one beside a column of icons reads as a rectangle.
 */
function NavRow({ item, collapsed, selected, onSelect }) {
  const { label, Icon } = item;
  return (
    <Tooltip title={collapsed ? label : ''} placement="right">
      <ToggleButton
        value={label}
        selected={selected}
        onChange={onSelect}
        appearance="text"
        size="md"
        sx={{
          height: 28,
          minHeight: 28,
          gap: 1,
          width: collapsed ? 28 : '100%',
          alignSelf: collapsed ? 'center' : 'stretch',
          justifyContent: collapsed ? 'center' : 'flex-start',
          px: collapsed ? 0 : 1,
          textTransform: 'none',
          // The panel is mid-animation while this row is still laid out at
          // its old width. Pinning the glyph and refusing the wrap leaves
          // the label to be clipped by the panel, which is what should
          // absorb it.
          whiteSpace: 'nowrap',
          '& svg': { flexShrink: 0 },
        }}
      >
        <Icon size={20} />
        {!collapsed && label}
      </ToggleButton>
    </Tooltip>
  );
}

/**
 * The rail: brand, the nav it takes you around by, and a footer group
 * pinned to the bottom. Four blocks separated by space rather than rules.
 */
function NavRail({ collapsed, active, onNavigate }) {
  const block = {
    px: collapsed ? 0 : RAIL_GUTTER_PX + 'px',
    alignItems: collapsed ? 'center' : 'stretch',
  };

  return (
    <Drawer
      variant="permanent"
      size={collapsed ? RAIL_COLLAPSED_PX : 'sm'}
      slotProps={{ paper: { sx: { position: 'relative', py: 2.5 } } }}
    >
      <Stack sx={{ ...block, pb: 2, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', color: 'text.primary' }}>
          <NeofloLogo variant={collapsed ? 'mark' : 'full'} size={16} />
        </Box>
      </Stack>

      {/* Takes the slack, which is what pins the footer group down. */}
      <Stack sx={{ ...block, flex: 1, minHeight: 0, gap: 1 }}>
        {NAV.map((item) => (
          <NavRow
            key={item.key}
            item={item}
            collapsed={collapsed}
            selected={active === item.key}
            onSelect={() => onNavigate(item.key)}
          />
        ))}
      </Stack>

      <Stack sx={{ ...block, gap: 1, flexShrink: 0 }}>
        {FOOTER_NAV.map((item) => (
          <NavRow
            key={item.key}
            item={item}
            collapsed={collapsed}
            selected={active === item.key}
            onSelect={() => onNavigate(item.key)}
          />
        ))}
      </Stack>
    </Drawer>
  );
}

export default function QueryLogPage() {
  const [collapsed, setCollapsed] = React.useState(true);
  const [active, setActive] = React.useState('queries');

  const [selection, setSelection] = React.useState<FilterValue>({});
  const [search, setSearch] = React.useState('');
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const activeCount = countActiveFilters(FILTER_GROUPS, selection);
  const isFiltered = activeCount > 0 || search.trim() !== '';
  const rows = filterQueries(QUERY_ROWS, search, selection);

  function clearFilters() {
    setSelection({});
    setSearch('');
  }

  /* The rail runs the full height and the bar starts where it ends, so
     the outer box is a row: rail, then a column. */
  return (
    <Stack direction="row" sx={{ height: '100vh' }}>
      <NavRail collapsed={collapsed} active={active} onNavigate={setActive} />

      <Stack sx={{ flex: 1, minWidth: 0 }}>
        {/* The bar holds the one control whose position does not move when
            the rail folds. Per-page actions go in the space after it. */}
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

        {/* Bands: title, toolbar, grid. The first two are as tall as what
            is in them and the grid takes everything left, so the footer
            lands on the bottom edge of the screen at any height. */}
        <Stack sx={{ flex: 1, minHeight: 0 }}>
          <Box sx={{ px: 3, py: 3 }}>
            <Typography variant="h3" component="h1">
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
              sx={{ width: 280 }}
            />
            <Stack direction="row" sx={{ gap: 1 }}>
              <Button
                variant="secondary"
                appearance="outline"
                disabled={!isFiltered}
                onClick={clearFilters}
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

          {/* A definite height for the grid to be 100% of. Without the
              minHeight the rows would push the column taller than the
              screen instead of scrolling inside it. */}
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <DataGrid
              size="sm"
              rows={rows}
              columns={QUERY_COLUMNS}
              rowNoun="queries"
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
            />
          </Box>
        </Stack>
      </Stack>

      {/* The trigger sits at the right end of the toolbar, so the panel
          hangs off its right edge — left-aligned it would run off the
          page and be pushed back in, lining up with nothing. */}
      <Filter
        groups={FILTER_GROUPS}
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
`;
