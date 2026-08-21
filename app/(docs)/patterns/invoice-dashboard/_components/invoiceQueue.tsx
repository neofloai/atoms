'use client';

import { styled } from '@mui/material/styles';

import { Chip } from '@/src/components/Chip';
import { Link } from '@/src/components/Link';
import { Tooltip } from '@/src/components/Tooltip';
import { fontFamilies, text, typography } from '@/src/tokens';
import { HeadsetIcon, PaperclipIcon, WarningCircleIcon } from '@/src/icons';

import type { ChipVariant } from '@/src/components/Chip';
import type { FilterGroup, FilterValue } from '@/src/components/Filter';
import type { GridColDef } from '@mui/x-data-grid';

/**
 * The invoice processing queue: one row per invoice, and the stage it is
 * parked at.
 *
 * The stage is the load-bearing field. Every other column says *which*
 * invoice this is; the stage says what it is waiting for, and it is the only
 * thing on the row that decides where `Review` goes — extraction review,
 * match review, or the ERP posting screen. A queue that listed anything but
 * invoices would have no single answer to that.
 */

/**
 * Where an invoice has stopped.
 *
 * `error` is a stage rather than a flag on one, because a failed invoice is
 * not sitting in extraction *and* failing — the failure is the thing you act
 * on, and it is what the row is waiting for you to do.
 */
export type InvoiceStage = 'extraction' | 'matching' | 'posting' | 'error';

/**
 * What the row offers.
 *
 * `processing` is the machine holding the row: nothing to decide yet, so the
 * control is present and disabled rather than absent. `view` is an invoice
 * that has moved on — readable, not actionable.
 */
export type InvoiceAction = 'review' | 'view' | 'processing';

export interface Invoice {
  readonly id: string;
  /** The support thread the document arrived on. */
  readonly reference: string;
  readonly received: string;
  /** How it reached us. One glyph in the cell, spelled out on hover. */
  readonly channel: string;
  readonly vendor: string;
  readonly invoiceNumber: string;
  readonly stage: InvoiceStage;
  readonly attachment: string;
  readonly amount: number;
  readonly action: InvoiceAction;
  /** Which tab the row belongs to. */
  readonly queue: 'open' | 'closed';
}

/**
 * The stage a chip is drawn in.
 *
 * The four roles are the semantic ones the dashboard pattern's status pills
 * already use — `information`, `warning`, `success`, `error` — rather than
 * the hues in the frame. One vocabulary across the library is worth more than
 * per-screen fidelity: a reader who has learned that amber means a row is
 * waiting on them should not have to relearn it per table.
 *
 * Read down the column it is a progression. `information` while the machine
 * is working and you are checking after it, `warning` where matching needs a
 * human to accept or reject a mismatch, `success` once everything is
 * validated and only the post is left, `error` when a stage has failed.
 *
 * The cost is two visible departures from the frame — matching is amber
 * rather than purple, posting green rather than blue — and one thing gained:
 * `orange` and `purple` are decorative roles carrying no state, so a reader
 * could not have told which of the two was the bad one.
 */
const STAGE_META: Record<
  InvoiceStage,
  { label: string; variant: ChipVariant; error?: boolean }
> = {
  extraction: { label: 'Extraction', variant: 'information' },
  matching: { label: 'Matching', variant: 'warning' },
  posting: { label: 'ERP Posting', variant: 'success' },
  error: { label: 'Error', variant: 'error', error: true },
};

export function stageMeta(stage: InvoiceStage) {
  return STAGE_META[stage];
}

/**
 * A row before it is expanded, so the columns cannot drift out of step with
 * each other: the attachment is derived from the vendor and the invoice
 * number rather than typed a third time.
 */
type Seed = readonly [
  reference: string,
  received: string,
  vendor: string,
  invoiceNumber: string,
  stage: InvoiceStage,
  amount: number,
  action: InvoiceAction,
  queue: 'open' | 'closed',
];

/**
 * The last word of a vendor name, when that word says what kind of company
 * it is rather than which one. Dropped from a filename, kept in the cell.
 */
const COMPANY_SUFFIXES = new Set([
  'inc',
  'ltd',
  'corp',
  'llc',
  'gmbh',
  'partners',
  'supplies',
  'networks',
  'analytics',
  'technologies',
  'studio',
  'group',
]);

/**
 * `Cloud Field Supplies` + `INV-0123` → `CloudField_INV0123.pdf`, which is
 * how the frame names every attachment: the trailing word that says what kind
 * of company it is goes, and whatever identifies *which* company stays.
 */
function attachmentName(vendor: string, invoiceNumber: string): string {
  const words = vendor.replace(/\./g, '').split(/\s+/);
  const last = words[words.length - 1]?.toLowerCase() ?? '';
  const kept = COMPANY_SUFFIXES.has(last) ? words.slice(0, -1) : words;
  const stem = (kept.length > 0 ? kept : words).join('');
  return stem + '_' + invoiceNumber.replace('-', '') + '.pdf';
}

/**
 * Thirteen invoices, spread across the four stages so no single facet
 * empties the grid, and three more in `Closed` so the tabs have something to
 * switch between.
 *
 * Written out rather than generated: the point of a live preview is that a
 * reader can pick `Error` and see exactly the two rows it leaves.
 */
const SEEDS: readonly Seed[] = [
  ['#1024', '02/07/2026 | 09:30', 'Cloud Field Supplies', 'INV-0123', 'extraction', 4250, 'review', 'open'],
  ['#1037', '05/07/2026 | 14:12', 'Global Logistics Inc.', 'INV-0456', 'matching', 12780.5, 'processing', 'open'],
  ['#1052', '08/07/2026 | 10:45', 'Summit Partners', 'INV-0789', 'posting', 8915.75, 'review', 'open'],
  ['#1068', '10/07/2026 | 16:20', 'Ruby Partners', 'INV-0234', 'extraction', 3420, 'view', 'open'],
  ['#1075', '12/07/2026 | 08:55', 'Apex Solutions Ltd.', 'INV-0567', 'error', 15600.3, 'review', 'open'],
  ['#1091', '13/07/2026 | 11:38', 'Meridian Corp.', 'INV-0891', 'error', 6340.25, 'review', 'open'],
  ['#1103', '15/07/2026 | 13:07', 'Cascade Networks', 'INV-0345', 'matching', 9875, 'review', 'open'],
  ['#1118', '17/07/2026 | 09:22', 'Prism Analytics', 'INV-0678', 'extraction', 2150.8, 'review', 'open'],
  ['#1126', '19/07/2026 | 15:40', 'Vertex Technologies', 'INV-0912', 'matching', 18490.6, 'view', 'open'],
  ['#1142', '21/07/2026 | 10:15', 'Nova Creative Studio', 'INV-0147', 'posting', 7325.45, 'review', 'open'],
  ['#1155', '22/07/2026 | 08:05', 'Cloud Field Supplies', 'INV-0158', 'extraction', 1180.4, 'review', 'open'],
  ['#1163', '23/07/2026 | 12:44', 'Summit Partners', 'INV-0163', 'error', 22400, 'review', 'open'],
  ['#1171', '24/07/2026 | 16:58', 'Cascade Networks', 'INV-0171', 'posting', 5090.9, 'processing', 'open'],
  ['#0987', '18/06/2026 | 11:02', 'Meridian Corp.', 'INV-0098', 'posting', 4410.15, 'view', 'closed'],
  ['#0994', '21/06/2026 | 09:47', 'Vertex Technologies', 'INV-0104', 'posting', 13260.75, 'view', 'closed'],
  ['#1002', '25/06/2026 | 14:31', 'Prism Analytics', 'INV-0112', 'posting', 980.2, 'view', 'closed'],
];

export const INVOICES: readonly Invoice[] = SEEDS.map(
  ([
    reference,
    received,
    vendor,
    invoiceNumber,
    stage,
    amount,
    action,
    queue,
  ]) => ({
    id: reference.slice(1),
    reference,
    received,
    channel: 'Received by email',
    vendor,
    invoiceNumber,
    stage,
    attachment: attachmentName(vendor, invoiceNumber),
    amount,
    action,
    queue,
  })
);

/* ---------------------------------------------------------------- facets */

/** Every vendor in the queue, once, in the order it first appears. */
const VENDORS = [...new Set(INVOICES.map((invoice) => invoice.vendor))];

/** The value a selection uses for a label. */
export function optionKey(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Two facets, and both of them are columns on screen.
 *
 * A panel that filtered on something the table does not show reads as a
 * broken control — you pick a value, rows disappear, and nothing in the grid
 * explains why.
 */
export const INVOICE_FILTER_GROUPS: readonly FilterGroup[] = [
  {
    id: 'stage',
    label: 'Status',
    options: (Object.keys(STAGE_META) as InvoiceStage[]).map((stage) => ({
      value: stage,
      label: STAGE_META[stage].label,
    })),
  },
  {
    id: 'vendor',
    label: 'Vendor Name',
    options: VENDORS.map((vendor) => ({
      value: optionKey(vendor),
      label: vendor,
    })),
  },
];

/* ----------------------------------------------------------------- cells */

/** Vertically centred, because a grid cell centres one line with `line-height`. */
const Lines = styled('span')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  minWidth: 0,
  lineHeight: `${typography.body.b1.leading}px`,
});

const Primary = styled('span')({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const Secondary = styled('span')(({ theme }) => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: typography.body.b2.size,
  lineHeight: `${typography.body.b2.leading}px`,
  color: text.default.caption.light,
  ...theme.applyStyles('dark', { color: text.default.caption.dark }),
}));

const Row = styled('span')({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  minWidth: 0,
  lineHeight: 'normal',
});

/** The filename, in placeholder ink — it is provenance, not news. */
const Attachment = styled('span')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  minWidth: 0,
  lineHeight: 'normal',
  color: text.default.placeholder.light,
  ...theme.applyStyles('dark', { color: text.default.placeholder.dark }),
}));

/**
 * Money, right-aligned, digits in the mono face.
 *
 * The alignment is the point: lined-up decimal points are what let a reader
 * compare two amounts without reading either of them. The currency mark
 * stays in the caption colour because it is identical on every row.
 */
const Money = styled('span')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 2,
  width: '100%',
  lineHeight: 'normal',
});

const Currency = styled('span')(({ theme }) => ({
  color: text.default.placeholder.light,
  ...theme.applyStyles('dark', { color: text.default.placeholder.dark }),
}));

const Digits = styled('span')({ fontFamily: fontFamilies.product.mono });

function TwoLine({
  primary,
  secondary,
}: {
  primary: React.ReactNode;
  secondary: string;
}) {
  return (
    <Lines>
      <Primary>{primary}</Primary>
      <Secondary>{secondary}</Secondary>
    </Lines>
  );
}

TwoLine.displayName = 'TwoLine';

/** The five columns before `Action`, which the preview supplies itself. */
export const INVOICE_COLUMNS: GridColDef<Invoice>[] = [
  {
    field: 'reference',
    headerName: 'Source ID/ Time',
    flex: 1.4,
    minWidth: 152,
    renderCell: ({ row }) => (
      <Row>
        {/* The channel it arrived on: the same answer for most rows, so a
            glyph rather than a column of its own. */}
        <Tooltip title={row.channel}>
          <HeadsetIcon size={14} style={{ flexShrink: 0 }} />
        </Tooltip>
        <TwoLine
          primary={
            <Link href={`/invoices/${row.id}`} color="primary" underline="hover">
              {row.reference}
            </Link>
          }
          secondary={row.received}
        />
      </Row>
    ),
  },
  {
    field: 'vendor',
    headerName: 'Vendor / Invoice#',
    flex: 1.6,
    minWidth: 150,
    renderCell: ({ row }) => (
      <TwoLine primary={row.vendor} secondary={row.invoiceNumber} />
    ),
  },
  {
    field: 'stage',
    headerName: 'Status',
    width: 132,
    sortable: false,
    renderCell: ({ row }) => {
      const meta = stageMeta(row.stage);
      return (
        <Chip
          size="sm"
          variant={meta.variant}
          label={meta.label}
          icon={meta.error ? <WarningCircleIcon /> : undefined}
        />
      );
    },
  },
  {
    field: 'attachment',
    headerName: 'Invoice attachment',
    flex: 1.5,
    minWidth: 152,
    sortable: false,
    renderCell: ({ row }) => (
      <Attachment>
        <PaperclipIcon size={14} style={{ flexShrink: 0 }} />
        <Primary>{row.attachment}</Primary>
      </Attachment>
    ),
  },
  {
    field: 'amount',
    headerName: 'Amount',
    width: 124,
    align: 'right',
    headerAlign: 'right',
    renderCell: ({ row }) => (
      <Money>
        <Currency>$</Currency>
        <Digits>
          {row.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Digits>
      </Money>
    ),
  },
];

/* --------------------------------------------------------------- filtering */

/** Everything the toolbar's search box reads on a row. */
function rowSearchText(invoice: Invoice): string {
  return [
    invoice.reference,
    invoice.vendor,
    invoice.invoiceNumber,
    invoice.attachment,
    stageMeta(invoice.stage).label,
  ]
    .join(' ')
    .toLowerCase();
}

/** The facet a group reads off a row, as the selection spells it. */
function rowFacetValue(invoice: Invoice, groupId: string): string | null {
  switch (groupId) {
    case 'stage':
      return invoice.stage;
    case 'vendor':
      return optionKey(invoice.vendor);
    default:
      return null;
  }
}

function matchesFacet(
  invoice: Invoice,
  groupId: string,
  selected: readonly string[]
): boolean {
  if (selected.length === 0) {
    return true;
  }
  const value = rowFacetValue(invoice, groupId);
  return value !== null && selected.includes(value);
}

/**
 * The rows a tab, a search box and a filter panel leave between them.
 *
 * One function rather than three, because that is the whole claim: the tab
 * asks which queue, the box asks whether the row mentions something, the
 * panel asks whether the row is one of a set — and a row has to answer all
 * three. Split across the controls, "filtered" would eventually mean
 * something different in each.
 */
export function filterInvoices(
  queue: 'open' | 'closed',
  search: string,
  selection: FilterValue
): Invoice[] {
  const query = search.trim().toLowerCase();
  return INVOICES.filter(
    (invoice) =>
      invoice.queue === queue &&
      (query === '' || rowSearchText(invoice).includes(query)) &&
      INVOICE_FILTER_GROUPS.every((group) =>
        matchesFacet(invoice, group.id, selection[group.id] ?? [])
      )
  );
}
