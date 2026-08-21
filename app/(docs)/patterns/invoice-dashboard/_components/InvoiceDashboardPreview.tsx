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
import { CircularProgress } from '@/src/components/Progress';
import { Tab, Tabs } from '@/src/components/Tabs';
import { TextField } from '@/src/components/TextField';
import { Tooltip } from '@/src/components/Tooltip';
import {
  ArrowSquareOutIcon,
  FadersHorizontalIcon,
  MagnifyingGlassIcon,
  SidebarSimpleIcon,
  UploadSimpleIcon,
} from '@/src/icons';

// The rail is the one the Drawer and Navbar pages already show, and the one
// every other screen in the invoice processing workflow mounts. Imported
// rather than redrawn: a second copy would drift from the screens `Review`
// opens.
import { AppRail } from '../../../components/drawer/_components/AppRail';
import {
  INVOICE_COLUMNS,
  INVOICE_FILTER_GROUPS,
  filterInvoices,
} from './invoiceQueue';

import type { FilterValue } from '@/src/components/Filter';
import type { GridColDef } from '@mui/x-data-grid';
import type { Invoice } from './invoiceQueue';

/** Tall enough for every block of the rail and a page of rows. */
const FRAME_HEIGHT_PX = 760;

const EMPTY: FilterValue = {};

/** Rows a page holds. Thirteen open invoices, so two pages. */
const PAGE_SIZE = 10;

type Queue = 'open' | 'closed';

const TABS: readonly { value: Queue; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
];

/**
 * The one control on the row, plus the way out of the page.
 *
 * Three states, and they are not three styles of one button. `Review` is the
 * route into the workflow and takes the primary role in outline, so it reads
 * as the thing to do without competing with the filled `Upload Invoice` in
 * the title band. `View` is the same shape, neutral, for an invoice there is
 * nothing left to decide about. `Processing` is the same shape again,
 * disabled — the row will become one of the other two on its own, and
 * removing the control in the meantime would make the table jump under the
 * cursor.
 */
function ActionCell({ invoice }: { invoice: Invoice }) {
  const busy = invoice.action === 'processing';
  const label = busy
    ? 'Processing'
    : invoice.action === 'review'
      ? 'Review'
      : 'View';

  return (
    <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
      <Button
        size="sm"
        appearance="outline"
        variant={invoice.action === 'review' ? 'primary' : 'secondary'}
        disabled={busy}
        startIcon={
          busy ? <CircularProgress size={14} color="inherit" /> : undefined
        }
        // A width rather than a floor. `Processing` is the longest of the
        // three labels and carries a spinner as well, so a floor would let it
        // grow past the other two and push the icon button out of the cell —
        // the exact jump this cell exists to avoid.
        sx={{ width: 104, minWidth: 104, flexShrink: 0 }}
      >
        {label}
      </Button>
      <Tooltip title="Open in new tab">
        <IconButton
          size="sm"
          variant="secondary"
          appearance="text"
          disabled={busy}
          aria-label={`Open invoice ${invoice.reference} in a new tab`}
        >
          <ArrowSquareOutIcon size={16} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

ActionCell.displayName = 'ActionCell';

/**
 * Which columns this preview shows, and how they share its width.
 *
 * The screen's six, minus `Invoice attachment`. A docs column is not a
 * 1440px page, and this one hands 220px of its width to the rail whenever the
 * rail is open. Something had to go, and the attachment is the only cell here
 * that is neither a facet nor a decision: it is provenance, read to confirm
 * the row is about the document you meant. `Status` and `Vendor` are what the
 * panel filters on, so a table without them would make filtering look like it
 * had done nothing, and `Action` is the entire way in.
 *
 * The floors below sum to less than the width left when the rail is open, so
 * the grid never scrolls sideways inside the shell — it ellipsises, which is
 * what the two-line cells are built to do. `Action` is the one column with no
 * flex at all: Review, View and the disabled Processing have to stay the same
 * size as each other, and a column that gave up width would clip the icon
 * button beside them.
 */
const PREVIEW_COLUMN_SIZING: Record<
  string,
  { flex?: number; width?: number; minWidth?: number }
> = {
  reference: { flex: 1.4, minWidth: 140 },
  vendor: { flex: 1.6, minWidth: 100 },
  stage: { width: 124 },
  amount: { width: 110 },
};

const PREVIEW_COLUMNS: GridColDef<Invoice>[] = [
  ...INVOICE_COLUMNS.filter(
    (column) => column.field in PREVIEW_COLUMN_SIZING
  ).map((column) => ({
    ...column,
    flex: undefined,
    width: undefined,
    ...PREVIEW_COLUMN_SIZING[column.field],
  })),
  {
    // Defined here rather than beside the others because it is the only
    // column that belongs to the screen rather than to the data.
    field: 'action',
    headerName: 'Action',
    width: 168,
    sortable: false,
    filterable: false,
    renderCell: ({ row }) => <ActionCell invoice={row} />,
  },
];

/**
 * The invoice dashboard: the app shell with the invoice processing queue
 * inside it.
 *
 * ## The queue is invoices, and only invoices
 *
 * One row is one invoice, and the `Status` column says which stage of the
 * workflow it is parked at. That is what makes a single flat list enough for
 * the whole workflow: `Review` does not need a destination of its own,
 * because the row already carries the stage that decides where it goes.
 *
 * ## Four bands, and only one of them is elastic
 *
 * Title, tabs, toolbar, grid. The first three are as tall as their contents;
 * the grid takes what is left, so its footer sits on the bottom edge of the
 * screen whatever the window height is.
 *
 * ## Three questions, three controls, one filtered table
 *
 * The tabs ask which queue, the search box asks whether a row mentions
 * something, the panel asks whether a row is one of a set. A row has to
 * answer all three, which is why `filterInvoices` holds the rule rather than
 * any one of them.
 */
export function InvoiceDashboardPreview(): React.JSX.Element {
  const [collapsed, setCollapsed] = React.useState(true);
  const [queue, setQueue] = React.useState<Queue>('open');

  const [search, setSearch] = React.useState('');
  const [selection, setSelection] = React.useState<FilterValue>(EMPTY);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const activeCount = countActiveFilters(INVOICE_FILTER_GROUPS, selection);
  const rows = filterInvoices(queue, search, selection);

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
      <AppRail collapsed={collapsed} active="dashboard" />

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
          <Stack
            direction="row"
            sx={{
              px: 3,
              py: 2.5,
              gap: 2,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h4" component="h2">
              Invoice Dashboard
            </Typography>
            {/* The one control on the screen that adds work to the queue,
                so the one filled button on it. */}
            <Button variant="primary" startIcon={<UploadSimpleIcon />}>
              Upload Invoice
            </Button>
          </Stack>

          {/* Tabs split the queue; they do not narrow it. Open against
              Closed is a different question from the facets', which is why
              it sits above the toolbar rather than inside the panel. */}
          <Tabs
            value={queue}
            onChange={(_, next: Queue) => setQueue(next)}
            aria-label="Invoice queue"
            sx={{ px: 2 }}
          >
            {TABS.map((item) => (
              <Tab key={item.value} label={item.label} value={item.value} />
            ))}
          </Tabs>
          <Divider />

          <Stack
            direction="row"
            sx={{
              px: 3,
              py: 1.75,
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
            <Button
              variant="secondary"
              appearance="outline"
              size="sm"
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
              rowNoun="invoices"
              pageSizeOptions={[PAGE_SIZE]}
              initialState={{
                pagination: { paginationModel: { pageSize: PAGE_SIZE } },
              }}
              disableColumnMenu
              disableRowSelectionOnClick
            />
          </Box>
        </Stack>
      </Stack>

      <Filter
        groups={INVOICE_FILTER_GROUPS}
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

InvoiceDashboardPreview.displayName = 'InvoiceDashboardPreview';
