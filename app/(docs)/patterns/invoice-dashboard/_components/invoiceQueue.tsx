'use client';

import { styled } from '@mui/material/styles';

import { Chip } from '@/src/components/Chip';
import { Link } from '@/src/components/Link';
import { Tooltip } from '@/src/components/Tooltip';
import { border, fontFamilies, icon, surface, text, typography } from '@/src/tokens';
import {
  TABLE_CELL_GAP_PX,
  TABLE_CELL_GAP_TWO_LINE_PX,
  TABLE_CELL_ICON_OFFSET_PX,
  TABLE_SECONDARY_LEADING_PX,
  TABLE_SECONDARY_SIZE_PX,
  tableIconInk,
} from '@/src/components/Table/tableTokens';
import {
  CheckCircleIcon,
  HeadsetIcon,
  PaperclipIcon,
  WarningIcon,
  XCircleIcon,
} from '@/src/icons';

import type * as React from 'react';
import type { ChipColors, ChipVariant } from '@/src/components/Chip';
import type { ModeToken } from '@/src/tokens';
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
export type InvoiceStage =
  | 'extraction'
  | 'faktur'
  | 'matching'
  | 'posting'
  | 'error'
  | 'posted'
  | 'rejected';

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
 * The colour and the glyph each stage is drawn in.
 *
 * Seven statuses, and the colour of each is given directly rather than
 * picked from the semantic chip roles. That is a change of approach: this
 * map used to carry a `ChipVariant` per stage, on the argument that one
 * vocabulary across the library beats per-screen fidelity. The workflow has
 * since outgrown the four roles — it needs seven colours that are tellable
 * apart down a column, and `information` / `warning` / `success` / `error`
 * cannot supply seven.
 *
 * ## Every colour is a mode-aware token, and that took a substitution
 *
 * The specification named several of these as raw ramp steps —
 * `colors.purple[75]`, `colors.orange[600]`, `colors.yellow[400]` and so on.
 * A ramp step is a plain string, not a `{ light, dark }` pair, so a chip
 * built from one paints the same colour on a near-black page. Each was
 * swapped for the semantic token carrying the *identical* light value, so
 * light mode is pixel-for-pixel what was asked for and dark mode works:
 *
 *   yellow/75  -> surface.warning.subtle      yellow/400 -> border.warning.default
 *   yellow/700 -> text.warning[2]             purple/75  -> surface.purple.default
 *   purple/400 -> icon.purple[4]              purple/600 -> text.purple[2]
 *   blue/400   -> icon.information[4]         orange/100 -> surface.orange.default
 *   orange/600 -> icon.orange[3]              orange/800 -> text.orange[0]
 *   green/500  -> icon.success[3]
 *
 * Two of those substitutions are an `icon.*` token used as a hairline, which
 * is the wrong shelf for it. `orange` and `purple` have no `border` ramp in
 * the collection at all, so there is no right shelf — the same gap
 * DESIGNER_QUESTIONS.md #61 already asks to close.
 *
 * ## Extraction is the one stage left on a role
 *
 * Its specification is three literal hexes — `#e7f4fa`, `#78cdf2`, `#128dc2`
 * — a cyan the collection has no scale for, and which is unbound in Figma
 * too (every other status in that frame binds a variable). It keeps
 * `information` rather than hardcoding a colour that would not survive dark
 * mode. See DESIGNER_QUESTIONS.md #61.
 *
 * ## Two glyphs do not take the label's ink
 *
 * `posted` and `rejected` carry a glyph in a colour of its own rather than
 * `currentColor`, so the tick and the cross read at their own strength
 * against a quieter label. `error` does inherit. Drawn that way, shipped
 * that way, and flagged in #65 — three glyphs with two different rules
 * between them is the kind of thing that is a decision once and an
 * inconsistency forever after.
 */
/** The glyph in a status chip. */
const STATUS_ICON_PX = 14;

/**
 * Paints a status glyph in a colour of its own rather than the label's.
 *
 * `Chip` sets `color: inherit` on its icon slot, two classes deep from the
 * chip root, so a colour set on the slot element itself loses to it. `&&&`
 * lifts this to three and settles it without an `!important`.
 *
 * It exists at all because two of the three glyphs are specified in their
 * own ink. A `color` prop on the Phosphor icon would have been shorter and
 * light-mode only; this resolves per scheme.
 */
const GlyphInk = styled('span', {
  shouldForwardProp: (prop) => prop !== 'neofloInk',
})<{ neofloInk: ModeToken }>(({ theme, neofloInk }) => ({
  display: 'inline-flex',
  '&&&': {
    color: neofloInk.light,
    ...theme.applyStyles('dark', { color: neofloInk.dark }),
  },
}));

/**
 * One status: its label, and either a role or an explicit set of colours.
 *
 * `variant` and `colors` are alternatives — `colors` overrides per key, so a
 * stage that gives all three never reads its role. Only `extraction` still
 * uses a role.
 */
interface StageMeta {
  label: string;
  variant?: ChipVariant;
  colors?: ChipColors;
  /** `ReactElement` rather than `ReactNode`: MUI clones it to add its slot class. */
  icon?: React.ReactElement;
}

const STAGE_META: Record<InvoiceStage, StageMeta> = {
  // The gap. `information` until a cyan exists.
  extraction: { label: 'Extraction', variant: 'information' },
  faktur: {
    label: 'Faktur Pajak',
    colors: {
      bg: surface.warning.subtle,
      border: border.warning.default,
      text: text.warning[2],
    },
  },
  matching: {
    label: 'Matching',
    colors: {
      bg: surface.purple.default,
      border: icon.purple[4],
      text: text.purple[2],
    },
  },
  posting: {
    label: 'ERP Posting',
    colors: {
      bg: surface.information.default,
      border: icon.information[4],
      text: text.information[3],
    },
  },
  error: {
    label: 'Error',
    colors: {
      bg: surface.orange.default,
      border: icon.orange[3],
      text: text.orange[0],
    },
    // The only glyph that inherits the label's ink.
    icon: <WarningIcon size={STATUS_ICON_PX} />,
  },
  posted: {
    label: 'Posted',
    colors: {
      bg: surface.success.subtleHover,
      border: border.success.focus,
      text: text.success[3],
    },
    icon: (
      <GlyphInk neofloInk={icon.success[3]}>
        <CheckCircleIcon size={STATUS_ICON_PX} />
      </GlyphInk>
    ),
  },
  rejected: {
    label: 'Rejected',
    colors: {
      bg: surface.error.default,
      border: border.error.defaultHover,
      text: text.error[2],
    },
    icon: (
      <GlyphInk neofloInk={icon.error[2]}>
        <XCircleIcon size={STATUS_ICON_PX} />
      </GlyphInk>
    ),
  },
};

/**
 * The chip for one status, so the grid column and the pattern page cannot
 * draw it two different ways.
 */
export function StageChip({ stage }: { stage: InvoiceStage }) {
  const meta = STAGE_META[stage];
  return (
    <Chip
      size="sm"
      bordered
      variant={meta.variant}
      colors={meta.colors}
      label={meta.label}
      icon={meta.icon}
    />
  );
}

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
  ['#1155', '22/07/2026 | 08:05', 'Cloud Field Supplies', 'INV-0158', 'faktur', 1180.4, 'review', 'open'],
  ['#1163', '23/07/2026 | 12:44', 'Summit Partners', 'INV-0163', 'error', 22400, 'review', 'open'],
  ['#1171', '24/07/2026 | 16:58', 'Cascade Networks', 'INV-0171', 'posting', 5090.9, 'processing', 'open'],
  ['#0987', '18/06/2026 | 11:02', 'Meridian Corp.', 'INV-0098', 'posted', 4410.15, 'view', 'closed'],
  ['#0994', '21/06/2026 | 09:47', 'Vertex Technologies', 'INV-0104', 'posted', 13260.75, 'view', 'closed'],
  ['#1002', '25/06/2026 | 14:31', 'Prism Analytics', 'INV-0112', 'rejected', 980.2, 'view', 'closed'],
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
  fontSize: TABLE_SECONDARY_SIZE_PX,
  lineHeight: `${TABLE_SECONDARY_LEADING_PX}px`,
  color: text.default.b3.light,
  ...theme.applyStyles('dark', { color: text.default.b3.dark }),
}));

/**
 * A glyph beside a two-line block: top-aligned rather than centred,
 * nudged onto the first line's cap height, 8 of gap, and the quieter of
 * the two icon rungs. The same four decisions `TableCell` makes for its
 * own `icon` slot — a grid cell has to make them itself.
 */
const Row = styled('span')(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: TABLE_CELL_GAP_TWO_LINE_PX,
  minWidth: 0,
  lineHeight: 'normal',
  '& > svg': {
    marginBlockStart: TABLE_CELL_ICON_OFFSET_PX,
    color: tableIconInk.twoLine.light,
    ...theme.applyStyles('dark', { color: tableIconInk.twoLine.dark }),
  },
}));

/**
 * The filename, in placeholder ink — it is provenance, not news. Its
 * glyph sits beside one line, so it centres, takes 6 of gap, and is one
 * rung stronger than the glyph beside a two-line cell.
 */
const Attachment = styled('span')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: TABLE_CELL_GAP_PX,
  minWidth: 0,
  lineHeight: 'normal',
  color: text.default.b3.light,
  ...theme.applyStyles('dark', { color: text.default.b3.dark }),
  '& > svg': {
    color: tableIconInk.oneLine.light,
    ...theme.applyStyles('dark', { color: tableIconInk.oneLine.dark }),
  },
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
  color: text.default.b3.light,
  ...theme.applyStyles('dark', { color: text.default.b3.dark }),
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
    minWidth: 168,
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
    minWidth: 166,
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
      return <StageChip stage={row.stage} />;
    },
  },
  {
    field: 'attachment',
    headerName: 'Invoice attachment',
    flex: 1.5,
    minWidth: 168,
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
    width: 140,
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
