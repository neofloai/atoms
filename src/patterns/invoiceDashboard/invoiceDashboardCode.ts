/**
 * The invoice dashboard pattern, as a page a consumer can paste.
 *
 * Kept in its own file for the same reason `dashboardCode` is: it is one
 * long string with short metadata around it, and `get_pattern` promises
 * "the full page layout code" rather than an excerpt.
 *
 * What is left to the reader is the data — the rows, the facet options and
 * the rail's items — because those are the application. Everything that is
 * layout, and every decision about which token a stage is drawn in, is
 * here.
 */
export const invoiceDashboardCode = `'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  DataGrid,
  Divider,
  Filter,
  IconButton,
  Link,
  Navbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  countActiveFilters,
} from '@neofloai/atoms';
import {
  ArrowSquareOutIcon,
  FadersHorizontalIcon,
  HeadsetIcon,
  MagnifyingGlassIcon,
  PaperclipIcon,
  SidebarSimpleIcon,
  UploadSimpleIcon,
  WarningCircleIcon,
} from '@neofloai/atoms/icons';
import { fontFamilies, text, typography } from '@neofloai/atoms/tokens';

import type { FilterValue, GridColDef } from '@neofloai/atoms';

// The rail, the invoices and the facets are the application's. The rail is
// the same one every other screen in the workflow mounts, so it is imported
// rather than redrawn — a second copy would drift from the screens the
// Review button opens.
import { AppRail } from './AppRail';
import { INVOICE_FILTER_GROUPS, filterInvoices } from './invoices';

import type { Invoice, InvoiceStage } from './invoices';

/**
 * The stage an invoice is parked at, and the chip that says so.
 *
 * This map is the screen. Every other column tells you *which* invoice; the
 * stage tells you what the invoice is waiting for, and it is the only thing
 * on the row that decides where Review takes you — extraction review,
 * match review, or the posting screen.
 *
 * The four roles are the semantic ones every other status pill in the library
 * uses — \`information\`, \`warning\`, \`success\`, \`error\` — rather than the
 * hues in the frame. Read down the column it is a progression: the machine is
 * working, a human is needed, everything is validated, a stage has failed. A
 * decorative role like \`purple\` or \`orange\` carries no state, so a reader
 * could not tell from it which of two stages was the bad one.
 */
const STAGE_META: Record<
  InvoiceStage,
  {
    label: string;
    variant: 'information' | 'warning' | 'success' | 'error';
    Icon?: typeof WarningCircleIcon;
  }
> = {
  extraction: { label: 'Extraction', variant: 'information' },
  matching: { label: 'Matching', variant: 'warning' },
  posting: { label: 'ERP Posting', variant: 'success' },
  error: { label: 'Error', variant: 'error', Icon: WarningCircleIcon },
};

/**
 * Which invoices a tab is asking for. \`open\` is everything still moving
 * through the workflow, including the ones that have failed — an errored
 * invoice is the most open thing on the screen, not a closed one.
 */
const TABS = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
] as const;

/** Rows a page holds, and the choices the footer offers. */
const PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 25, 50];

/* ---------------------------------------------------------------- cells */

/**
 * Two lines in one cell: the identifier over the thing that dates it.
 *
 * A grid cell centres a single line with \`line-height\`, so a stack of two
 * has to centre itself. Both lines ellipsise rather than wrap — a row is 56px
 * and a wrapped vendor name would push its neighbours out of alignment.
 */
function TwoLine({
  primary,
  secondary,
}: {
  primary: React.ReactNode;
  secondary: string;
}) {
  return (
    <Box
      component="span"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minWidth: 0,
        lineHeight: typography.body.b1.leading + 'px',
      }}
    >
      <Box
        component="span"
        sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        {primary}
      </Box>
      <Box
        component="span"
        sx={(theme) => ({
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: typography.body.b2.size,
          lineHeight: typography.body.b2.leading + 'px',
          color: text.default.caption.light,
          ...theme.applyStyles('dark', { color: text.default.caption.dark }),
        })}
      >
        {secondary}
      </Box>
    </Box>
  );
}

/**
 * The attachment, as the file it is. Placeholder ink rather than body,
 * because the filename is provenance — you read it to confirm the row is
 * about the document you meant, not to find out anything new.
 */
function AttachmentCell({ file }: { file: string }) {
  return (
    <Box
      component="span"
      sx={(theme) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        minWidth: 0,
        lineHeight: 'normal',
        color: text.default.placeholder.light,
        ...theme.applyStyles('dark', { color: text.default.placeholder.dark }),
      })}
    >
      <PaperclipIcon size={14} style={{ flexShrink: 0 }} />
      <Box
        component="span"
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {file}
      </Box>
    </Box>
  );
}

/**
 * Money, right-aligned, in the mono face.
 *
 * The digits are mono so the decimal points line up down the column — that
 * alignment is the only reason a reader can compare two amounts without
 * reading either of them. The currency mark stays in the sans caption
 * colour: it is the same on every row, so giving it the same weight as the
 * figure would make every row shout the same word.
 */
function AmountCell({ amount }: { amount: number }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 0.25,
        width: '100%',
        lineHeight: 'normal',
      }}
    >
      <Box
        component="span"
        sx={(theme) => ({
          color: text.default.placeholder.light,
          ...theme.applyStyles('dark', {
            color: text.default.placeholder.dark,
          }),
        })}
      >
        $
      </Box>
      <Box
        component="span"
        sx={{ fontFamily: fontFamilies.product.mono }}
      >
        {amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </Box>
    </Box>
  );
}

/**
 * The one control on the row, plus the way out of the page.
 *
 * Three states, and they are not three styles of the same button. Review is
 * the primary route into the workflow and is drawn as an outline so it does
 * not compete with Upload Invoice up in the title band; View is the same
 * shape in the neutral role, for an invoice there is nothing to decide
 * about; Processing is the same shape again, disabled, because the row will
 * become one of the other two on its own and moving the control would make
 * the table jump under a reader's cursor.
 *
 * \`Review\` opens the invoice at whatever stage it is stuck at — the stage
 * is on the row, so the button does not need its own label per stage.
 */
function ActionCell({
  invoice,
  onOpen,
}: {
  invoice: Invoice;
  onOpen: (id: string, target: 'panel' | 'tab') => void;
}) {
  const busy = invoice.action === 'processing';

  return (
    <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
      <Button
        size="sm"
        appearance="outline"
        variant={invoice.action === 'review' ? 'primary' : 'secondary'}
        disabled={busy}
        startIcon={busy ? <CircularProgress size={14} color="inherit" /> : undefined}
        onClick={() => onOpen(invoice.id, 'panel')}
        sx={{ minWidth: 88 }}
      >
        {busy ? 'Processing' : invoice.action === 'review' ? 'Review' : 'View'}
      </Button>
      <Tooltip title="Open in new tab">
        <IconButton
          size="sm"
          variant="secondary"
          appearance="text"
          disabled={busy}
          aria-label={'Open invoice ' + invoice.reference + ' in a new tab'}
          onClick={() => onOpen(invoice.id, 'tab')}
        >
          <ArrowSquareOutIcon size={16} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

/* -------------------------------------------------------------- columns */

/**
 * Six columns: who it came from, who it is from, where it is, what it is,
 * what it is worth, and the way in.
 *
 * The identity columns flex and the three on the right are fixed, so the
 * table absorbs the rail opening and closing by giving and taking from the
 * names — never from the amount or the button, whose widths are the two
 * things a reader scans down.
 */
function invoiceColumns(
  onOpen: (id: string, target: 'panel' | 'tab') => void
): GridColDef<Invoice>[] {
  return [
    {
      field: 'reference',
      headerName: 'Source ID/ Time',
      flex: 1.4,
      minWidth: 168,
      renderCell: ({ row }) => (
        <Box
          component="span"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            minWidth: 0,
            lineHeight: 'normal',
          }}
        >
          {/* The channel the invoice arrived on. A glyph rather than a
              column, because it is the same answer for most rows. */}
          <Tooltip title={row.channel}>
            <HeadsetIcon size={14} style={{ flexShrink: 0 }} />
          </Tooltip>
          <TwoLine
            primary={
              <Link
                href={'/invoices/' + row.id}
                color="primary"
                underline="hover"
              >
                {row.reference}
              </Link>
            }
            secondary={row.received}
          />
        </Box>
      ),
    },
    {
      field: 'vendor',
      headerName: 'Vendor / Invoice#',
      flex: 1.6,
      minWidth: 168,
      renderCell: ({ row }) => (
        <TwoLine primary={row.vendor} secondary={row.invoiceNumber} />
      ),
    },
    {
      field: 'stage',
      headerName: 'Status',
      width: 148,
      sortable: false,
      renderCell: ({ row }) => {
        const meta = STAGE_META[row.stage];
        return (
          <Chip
            size="sm"
            variant={meta.variant}
            label={meta.label}
            icon={meta.Icon ? <meta.Icon /> : undefined}
          />
        );
      },
    },
    {
      field: 'attachment',
      headerName: 'Invoice attachment',
      flex: 1.6,
      minWidth: 176,
      sortable: false,
      renderCell: ({ row }) => <AttachmentCell file={row.attachment} />,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 148,
      align: 'right',
      headerAlign: 'right',
      renderCell: ({ row }) => <AmountCell amount={row.amount} />,
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 172,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => <ActionCell invoice={row} onOpen={onOpen} />,
    },
  ];
}

/* ----------------------------------------------------------------- page */

export default function InvoiceDashboardPage() {
  const [collapsed, setCollapsed] = React.useState(true);
  const [tab, setTab] = React.useState<'open' | 'closed'>('open');

  const [search, setSearch] = React.useState('');
  const [selection, setSelection] = React.useState<FilterValue>({});
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const activeCount = countActiveFilters(INVOICE_FILTER_GROUPS, selection);
  const rows = filterInvoices(tab, search, selection);

  function handleOpen(id: string, target: 'panel' | 'tab') {
    const href = '/invoices/' + id;
    if (target === 'tab') {
      window.open(href, '_blank', 'noopener');
      return;
    }
    // Your router. The invoice opens at whatever stage it is parked at —
    // the screen decides that from the record, not from this call.
    window.location.assign(href);
  }

  const columns = React.useMemo(() => invoiceColumns(handleOpen), []);

  /* The rail runs the full height and the bar starts where it ends, so the
     outer box is a row: rail, then a column. */
  return (
    <Stack direction="row" sx={{ height: '100vh' }}>
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

        {/* Four bands: title, tabs, toolbar, grid. Only the grid is
            elastic, so the footer lands on the bottom edge at any height. */}
        <Stack sx={{ flex: 1, minHeight: 0 }}>
          <Stack
            direction="row"
            sx={{
              px: 3,
              py: 3,
              gap: 2,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h3" component="h1">
              Invoice Dashboard
            </Typography>
            {/* The one thing on this screen that adds work to the queue,
                so it is the one filled button on it. */}
            <Button
              variant="primary"
              startIcon={<UploadSimpleIcon />}
              onClick={() => {
                /* your upload dialog */
              }}
            >
              Upload Invoice
            </Button>
          </Stack>

          {/* Tabs split the queue; they do not filter it. Open and Closed
              are different questions from the toolbar's, which is why they
              sit above the search box rather than inside the panel. */}
          <Tabs
            value={tab}
            onChange={(_, next) => setTab(next)}
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

          {/* A definite height for the grid to be 100% of. Without the
              minHeight the rows would push the column past the bottom of
              the screen instead of scrolling inside it. */}
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <DataGrid
              size="sm"
              rows={rows}
              columns={columns}
              rowNoun="invoices"
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              initialState={{
                pagination: { paginationModel: { pageSize: PAGE_SIZE } },
              }}
              disableRowSelectionOnClick
            />
          </Box>
        </Stack>
      </Stack>

      {/* The trigger sits at the right end of the toolbar, so the panel
          hangs off its right edge. */}
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
`;
