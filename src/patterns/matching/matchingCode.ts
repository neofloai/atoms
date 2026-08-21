/**
 * The matching pattern, as a page a consumer can paste.
 *
 * Kept in its own file for the same reason `erpPostingCode` and
 * `invoiceDashboardCode` are: it is one long string with short metadata
 * around it, and `get_pattern` promises "the full page layout code" rather
 * than an excerpt.
 *
 * What is left to the reader is the record — the invoice lines, the receipts
 * and the header fields — because those are the application. Everything that
 * is layout, the allocation model, the four statuses derived from it, and the
 * rule that decides whether `Validate` answers, is here.
 *
 * The string carries no backticks and no interpolation on purpose: a bare
 * backtick in it would terminate the literal, and a `${` would be read as a
 * substitution rather than as code. The snippet concatenates with `+` for
 * the same reason.
 */
export const matchingCode = `'use client';

import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  NAVBAR_META_ICON_PX,
  Navbar,
  NavbarTitle,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@neofloai/atoms';
import {
  ArrowRightIcon,
  ArrowsLeftRightIcon,
  BuildingsIcon,
  CalendarBlankIcon,
  CheckCircleIcon,
  FunnelIcon,
  ListIcon,
  MagnifyingGlassIcon,
  QuestionIcon,
  SealCheckIcon,
  StarFourIcon,
  TicketIcon,
  XCircleIcon,
} from '@neofloai/atoms/icons';
import { fontFamilies, icon, surface, text } from '@neofloai/atoms/tokens';

// The workflow rail and the main menu behind the hamburger, from the Drawer
// docs page. The same strip the ERP posting screen mounts: one workflow, one
// navigation, and a second copy of it would drift.
import { AppRail, WORKFLOW_NAV, WORKFLOW_SECONDARY_NAV } from './AppRail';

/**
 * The third stage of the invoice processing workflow: an invoice that has been
 * read, set against the goods receipts booked under its purchase orders.
 *
 * Nothing here edits the invoice. The two answers this screen produces are an
 * allocation — which receipts satisfy which line — and a decision, which is a
 * difference someone has agreed to live with. Both are held as sets of ids, and
 * every status, count and variance on the page is derived from them on render.
 */

/* ------------------------------------------------------------- the record */

const HEADER_META = {
  ticket: '#345',
  vendor: 'Nike Sales',
  date: '05 Jun 2025',
};

/**
 * How far apart the two documents may end up and still count as agreeing. A
 * rounding difference is not a dispute, and blocking on one teaches the user
 * to accept everything.
 */
const TOLERANCE = 5.0;

/** How many acknowledgements of one field it takes to stop asking. */
const ACKNOWLEDGEMENTS_TO_REMEMBER = 3;

const INVOICE_LINES = [
  {
    id: 'ILI-0001',
    itemNo: 'DX6013-006',
    description: 'AS W NK Dri-FIT One MR 3IN Short',
    quantity: 120,
    unitPrice: 103.35,
    lineTotal: 12402.0,
  },
  {
    id: 'ILI-0002',
    itemNo: 'FN2799-233',
    description: 'AS W NK One Classic DF SS Top',
    quantity: 60,
    unitPrice: 87.75,
    lineTotal: 5265.0,
  },
  {
    id: 'ILI-0003',
    itemNo: 'FV6623-233',
    description: 'AS W NSW Essential MR Woven Short',
    quantity: 90,
    unitPrice: 116.35,
    lineTotal: 10471.5,
  },
  // A service line. It can never match, because freight does not arrive on a
  // goods receipt — it is here to show what the screen does with a line that
  // has no counterpart rather than as an edge case.
  {
    id: 'ILI-0005',
    itemNo: '-',
    description: 'Freight & Handling Charges',
    quantity: 1,
    unitPrice: 850.0,
    lineTotal: 850.0,
  },
];

/**
 * The receipts. A receipt's lineId marks it as a *candidate* for an invoice
 * line — same item, same vendor — not as a confirmed link. The link is the
 * reader's allocation, and the allocated flag is only where it starts.
 *
 * Three shapes of disagreement: ILI-0001 adds up across three purchase orders,
 * ILI-0002 has two unit prices among its candidates and opens with the dearer
 * one allocated, and ILI-0003 opens short until its fourth receipt is
 * allocated.
 */
const GRN_RECEIPTS = [
  {
    id: 'GRN-1042',
    lineId: 'ILI-0001',
    poNo: 'PO-00058',
    grnNo: 'GRN-1042',
    description: 'AS W NK Dri-FIT One MR 3IN Short',
    quantity: 50,
    unitPrice: 103.35,
    lineTotal: 5167.5,
    allocated: true,
  },
  {
    id: 'GRN-1043',
    lineId: 'ILI-0001',
    poNo: 'PO-00056',
    grnNo: 'GRN-1043',
    description: 'AS W NK Dri-FIT One MR 3IN Short',
    quantity: 40,
    unitPrice: 103.35,
    lineTotal: 4134.0,
    allocated: true,
  },
  {
    id: 'GRN-1051',
    lineId: 'ILI-0001',
    poNo: 'PO-00051',
    grnNo: 'GRN-1051',
    description: 'AS W NK Dri-FIT One MR 3IN Short',
    quantity: 30,
    unitPrice: 103.35,
    lineTotal: 3100.5,
    allocated: true,
  },
  {
    id: 'GRN-1067',
    lineId: 'ILI-0002',
    poNo: 'PO-00052',
    grnNo: 'GRN-1067',
    description: 'AS W NK One Classic DF SS Top',
    quantity: 36,
    unitPrice: 87.75,
    lineTotal: 3159.0,
    allocated: true,
  },
  {
    id: 'GRN-1068',
    lineId: 'ILI-0002',
    poNo: 'PO-00052',
    grnNo: 'GRN-1068',
    description: 'AS W NK One Classic DF SS Top',
    quantity: 24,
    unitPrice: 87.75,
    lineTotal: 2106.0,
    allocated: false,
  },
  {
    id: 'GRN-1071',
    lineId: 'ILI-0002',
    poNo: 'PO-00057',
    grnNo: 'GRN-1071',
    description: 'AS W NK One Classic DF SS Top',
    quantity: 24,
    unitPrice: 88.25,
    lineTotal: 2118.0,
    allocated: true,
  },
  {
    id: 'GRN-1080',
    lineId: 'ILI-0003',
    poNo: 'PO-00052',
    grnNo: 'GRN-1080',
    description: 'AS W NSW Essential MR Woven Short',
    quantity: 40,
    unitPrice: 116.35,
    lineTotal: 4654.0,
    allocated: true,
  },
  {
    id: 'GRN-1081',
    lineId: 'ILI-0003',
    poNo: 'PO-00052',
    grnNo: 'GRN-1081',
    description: 'AS W NSW Essential MR Woven Short',
    quantity: 30,
    unitPrice: 116.35,
    lineTotal: 3490.5,
    allocated: true,
  },
  {
    id: 'GRN-1082',
    lineId: 'ILI-0003',
    poNo: 'PO-00052',
    grnNo: 'GRN-1082',
    description: 'AS W NSW Essential MR Woven Short',
    quantity: 8,
    unitPrice: 116.35,
    lineTotal: 930.8,
    allocated: true,
  },
  {
    id: 'GRN-1090',
    lineId: 'ILI-0003',
    poNo: 'PO-00060',
    grnNo: 'GRN-1090',
    description: 'AS W NSW Essential MR Woven Short',
    quantity: 12,
    unitPrice: 116.35,
    lineTotal: 1396.2,
    allocated: false,
  },
];

/**
 * One header field compared across the two documents.
 *
 * The acknowledgeable flag is the whole model. A difference in how something is
 * written — a registered name against a trading name, an address with the
 * postcode dropped — is one a person can accept. A difference in what is owed
 * is not: an amount that disagrees with the purchase order means one of the two
 * documents was read wrong, and the answer is to read it again upstream. So
 * amounts and identifiers carry no Acknowledge action even when they differ.
 *
 * The prior count is carried on the record rather than counted here,
 * because it spans invoices: the third acknowledgement is the one that stops
 * the question being asked again, and no single invoice can know it is third.
 */
const META_FIELDS = [
  {
    key: 'po',
    label: 'Purchase Order Number',
    invoice: 'PO-00058',
    purchaseOrder: 'PO-00058',
    acknowledgeable: false,
    priorAcknowledgements: 0,
  },
  {
    key: 'invoiceNumber',
    label: 'Invoice Number',
    invoice: '1001312123',
    purchaseOrder: '1001312123',
    required: true,
    acknowledgeable: false,
    priorAcknowledgements: 0,
  },
  {
    key: 'invoiceDate',
    label: 'Invoice Date',
    invoice: '05 Jun 2025',
    purchaseOrder: '05 Jun 2025',
    required: true,
    acknowledgeable: false,
    priorAcknowledgements: 0,
  },
  {
    key: 'dueDate',
    label: 'Due Date',
    invoice: '05 Jul 2025',
    purchaseOrder: '05 Jul 2025',
    acknowledgeable: false,
    priorAcknowledgements: 0,
  },
  {
    // The trading name against the registered one. Twice acknowledged before,
    // so the next one is the one that sticks.
    key: 'vendorName',
    label: 'Vendor Name',
    invoice: 'Nike Sales',
    purchaseOrder: 'Nike Sales India Pvt Ltd',
    required: true,
    acknowledgeable: true,
    priorAcknowledgements: 2,
  },
  {
    // The same code, once with the site suffix and once without.
    key: 'vendorCode',
    label: 'Vendor Code',
    invoice: 'NIKE-IN-0042',
    purchaseOrder: 'NIKE-IN-0042 (Unit 2)',
    required: true,
    acknowledgeable: true,
    priorAcknowledgements: 1,
  },
  {
    key: 'vendorTaxId',
    label: 'Vendor Tax ID',
    invoice: '27AABCN1234M1Z5',
    purchaseOrder: '27AABCN1234M1Z5',
    required: true,
    acknowledgeable: false,
    priorAcknowledgements: 0,
  },
  {
    // Terms change when the money moves, not how much of it does - which is
    // why this one is acknowledgeable and the two amounts below are not.
    key: 'paymentTerms',
    label: 'Payment Terms',
    invoice: 'Net 30',
    purchaseOrder: 'Net 45',
    acknowledgeable: true,
    priorAcknowledgements: 0,
  },
  {
    key: 'currency',
    label: 'Currency',
    invoice: 'USD',
    purchaseOrder: 'USD',
    acknowledgeable: false,
    priorAcknowledgements: 0,
  },
  {
    // The line items plus tax: 28,988.50 + 5,217.93.
    key: 'totalAmount',
    label: 'Total Amount',
    invoice: '$34,206.43',
    purchaseOrder: '$34,206.43',
    acknowledgeable: false,
    priorAcknowledgements: 0,
  },
  {
    key: 'taxAmount',
    label: 'Tax Amount',
    invoice: '$5,217.93',
    purchaseOrder: '$5,217.93',
    acknowledgeable: false,
    priorAcknowledgements: 0,
  },
];

/* --------------------------------------------------------- what it computes */

/** Two decimal places, so comparisons are of money and not of floats. */
function money(value) {
  return Math.round(value * 100) / 100;
}

function candidatesFor(lineId) {
  return GRN_RECEIPTS.filter((receipt) => receipt.lineId === lineId);
}

function allocatedFor(lineId, allocated) {
  return GRN_RECEIPTS.filter(
    (receipt) => receipt.lineId === lineId && allocated.has(receipt.id)
  );
}

function sumQuantity(receipts) {
  return receipts.reduce((total, receipt) => total + receipt.quantity, 0);
}

function sumTotal(receipts) {
  return money(
    receipts.reduce((total, receipt) => total + receipt.lineTotal, 0)
  );
}

/**
 * How an allocation differs from the line it is allocated to, in both
 * dimensions.
 *
 * Reported separately rather than rolled into one number because they fail
 * independently and mean different things: the right quantity at the wrong
 * price is a pricing dispute, the right price at the wrong quantity is a short
 * delivery.
 */
function varianceFor(line, allocatedRows) {
  return {
    quantity: sumQuantity(allocatedRows) - line.quantity,
    amount: money(sumTotal(allocatedRows) - line.lineTotal),
  };
}

/**
 * The status of one line, derived every render.
 *
 * Never stored. Allocating a receipt has to change the line's status in the
 * same paint as the checkbox it was clicked in, and a status held in state is
 * one that can disagree with the numbers under it.
 *
 * 'probable' is the value that earns the screen: the receipts found are
 * plausibly right — same item, same vendor, one dimension agreeing — but they
 * do not add up. A binary matched/unmatched loses the only thing worth showing.
 */
function statusFor(line, allocatedRows, accepted) {
  if (accepted.has(line.id)) return 'accepted';
  if (allocatedRows.length === 0) return 'no-match';

  const gap = varianceFor(line, allocatedRows);
  const balanced = gap.quantity === 0 && Math.abs(gap.amount) <= TOLERANCE;

  return balanced ? 'matched' : 'probable';
}

function lineResolved(status) {
  return status === 'matched' || status === 'accepted';
}

function fieldsDiffer(field) {
  return field.invoice !== field.purchaseOrder;
}

function acknowledgementsFor(field, acknowledged) {
  return field.priorAcknowledgements + (acknowledged.has(field.key) ? 1 : 0);
}

function isRemembered(field, acknowledged) {
  return acknowledgementsFor(field, acknowledged) >= ACKNOWLEDGEMENTS_TO_REMEMBER;
}

/**
 * Whether a differing field still needs the reader. A field acknowledged on
 * this invoice is settled; so is one whose difference was already remembered
 * before this invoice arrived, which is the point of remembering it.
 */
function metaFieldResolved(field, acknowledged) {
  if (!fieldsDiffer(field)) return true;
  if (acknowledged.has(field.key)) return true;
  return field.priorAcknowledgements >= ACKNOWLEDGEMENTS_TO_REMEMBER;
}

function invoiceTotal(lines) {
  return money(lines.reduce((total, line) => total + line.lineTotal, 0));
}

function invoiceQuantity(lines) {
  return lines.reduce((total, line) => total + line.quantity, 0);
}

/**
 * What the two documents disagree by, once the reader's decisions are taken
 * into account.
 *
 * Three terms, and the third is the interesting one. An accepted line is
 * subtracted because the reader has said it needs no receipt — freight is still
 * owed, it just never arrived on a lorry. Leaving it in would report a gap the
 * reader has already answered, and a number that can never reach zero stops
 * being read.
 */
function documentVariance(allocated, accepted) {
  const billed = invoiceTotal(INVOICE_LINES);
  const received = sumTotal(
    GRN_RECEIPTS.filter((receipt) => allocated.has(receipt.id))
  );
  const waived = invoiceTotal(
    INVOICE_LINES.filter((line) => accepted.has(line.id))
  );

  return money(billed - received - waived);
}

/* ---------------------------------------------------------- how it reads */

/** An amount in a column whose header already says ($). */
function formatAmount(value) {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * An amount in a sentence, or on a total row with no column header above it to
 * carry the mark. No space after the mark: a field has a whole box to itself
 * and the gap reads as alignment, but mid-sentence it reads as a typo.
 */
function formatMoney(value) {
  return '$' + formatAmount(value);
}

function formatQuantityGap(value) {
  const count = Math.abs(value);
  return count + (value > 0 ? ' more received' : ' fewer received');
}

function formatAmountGap(value) {
  return (
    formatMoney(Math.abs(value)) +
    (value > 0 ? ' above the line' : ' below the line')
  );
}

/* ---------------------------------------------------------------- the ink */

/** Digits that line up down a column. */
const MONO = { fontFamily: fontFamilies.product.mono };

/**
 * Fixed column widths, and why the tables are laid out fixed at all.
 *
 * TableCell is white-space: nowrap on purpose - a wrapping cell pushes its row
 * taller than its neighbours and the table stops reading as a grid - so under
 * automatic layout the description column claims its full text width and pushes
 * the money columns off the panel. Fixed layout gives every column the width
 * named here and hands the remainder to the description, which then clips.
 * TableCell's own note names truncation as the long-text variant.
 *
 * Widths go on the header cells, because fixed layout reads the first row only.
 */
const TABLE_LAYOUT = { tableLayout: 'fixed' };

const INVOICE_COLS = {
  status: 44,
  line: 104,
  qty: 52,
  unit: 80,
  total: 92,
  // Wide enough for the one control it ever holds. A narrower column clips a
  // Button rather than shrinking it.
  action: 104,
};

const GRN_COLS = {
  check: 44,
  line: 92,
  po: 108,
  qty: 52,
  unit: 80,
  total: 92,
};

/** Clip rather than wrap, per TableCell's own note on long text. */
const truncate = { overflow: 'hidden', textOverflow: 'ellipsis' };

/**
 * The field column's width, and the invoice column's.
 *
 * 250 for the field names, as the design sets it. The invoice column is held at
 * a readable width rather than splitting the remainder evenly with the PO
 * column, because the PO column also carries the row's decision.
 */
const DETAILS_COLS = { field: 250, invoice: 320 };

/**
 * The label column, and the header strip above it.
 *
 * One treatment for both, because the design gives them one: the same tinted
 * fill and the same quiet ink run across the header row and down the first
 * column, which is what makes that column read as a list of row names rather
 * than as a third value. TableHead draws no fill of its own - it is a bare 32px
 * label strip - so the fill is set here, on the cells, which is additive rather
 * than an override of anything the component decided.
 */
const labelCell = (theme) => ({
  backgroundColor: surface.default.default.light,
  color: text.default.caption.light,
  ...theme.applyStyles('dark', {
    backgroundColor: surface.default.default.dark,
    color: text.default.caption.dark,
  }),
});

/**
 * The mark on a field extraction must have captured.
 *
 * Drawn in the error caption ink because that is what the design draws, and
 * this is markup the pattern owns rather than a component's. Note the
 * inconsistency it leaves with a required TextField, which draws its own
 * asterisk in the label's ink: recolouring that one would mean reaching inside
 * the component.
 */
function Required() {
  return (
    <Box
      component="span"
      sx={(theme) => ({
        color: text.error.caption.light,
        ...theme.applyStyles('dark', { color: text.error.caption.dark }),
      })}
    >
      {' *'}
    </Box>
  );
}

/** The line-id cell: present, and quieter than the description beside it. */
function LineId({ children }) {
  return (
    <Box
      component="span"
      sx={(theme) => ({
        fontFamily: fontFamilies.product.mono,
        color: text.default.placeholder.light,
        ...theme.applyStyles('dark', {
          color: text.default.placeholder.dark,
        }),
      })}
    >
      {children}
    </Box>
  );
}

/** An amount, pushed right so the decimal points line up. */
function Amount({ children }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        width: '100%',
        ...MONO,
      }}
    >
      {children}
    </Box>
  );
}

/** Glyph size, as the design draws these three. */
const STATUS_ICON_PX = 16;

/**
 * The status glyph, and the ink it takes.
 *
 * The ink comes from icon, not text. The two groups hold the same values on
 * every accent role today, so nothing about the pixels turns on the choice -
 * but they already differ on default.subtle and disabled.onColor, and a glyph
 * that follows the text ramp would silently move the day design splits another
 * rung. Every Atoms component that colours a glyph reads icon, and this is a
 * glyph.
 *
 * The rung is per role rather than one rule for all three: success and error
 * take onColorHover, warning takes accent. That is not an inconsistency - the
 * yellow ramp runs light-to-dark where green and red run dark-to-light, so its
 * onColorHover rung would be invisible against a white row. The rule is the
 * rung that reads on the surface, which is a different rung per ramp.
 *
 * Three of the four are circles because they are outcomes of the same test.
 * 'accepted' is deliberately not: it is a person's decision rather than a
 * match, so it takes a different shape as well as a different colour.
 */
const STATUS_MARKS = {
  matched: {
    icon: <CheckCircleIcon weight="fill" size={STATUS_ICON_PX} />,
    tone: icon.success.onColorHover,
    label: 'Matched',
    help: 'Quantity and amount both agree with the receipts allocated here',
  },
  probable: {
    icon: <QuestionIcon weight="fill" size={STATUS_ICON_PX} />,
    tone: icon.warning.accent,
    label: 'Probable',
    help: 'Receipts found for this item, but they do not add up to the line',
  },
  'no-match': {
    icon: <XCircleIcon weight="fill" size={STATUS_ICON_PX} />,
    tone: icon.error.onColorHover,
    label: 'No match',
    help: 'No goods receipt exists for this line',
  },
  accepted: {
    icon: <SealCheckIcon weight="fill" size={STATUS_ICON_PX} />,
    tone: icon.information.onColorHover,
    label: 'Accepted',
    help: 'Someone decided this line is payable without a receipt',
  },
};

/**
 * A glyph rather than a fill, because three of the four statuses would want one
 * and a row has two. Colouring an icon is not restyling a component — the icon
 * takes currentColor and this sets the colour from the token — where a warning
 * fill on a row would mean inventing a third row state at the call site.
 */
function StatusMark({ status }) {
  const mark = STATUS_MARKS[status];

  return (
    <Tooltip title={mark.help}>
      <Box
        component="span"
        aria-label={mark.label}
        sx={(theme) => ({
          display: 'inline-flex',
          color: mark.tone.light,
          ...theme.applyStyles('dark', { color: mark.tone.dark }),
        })}
      >
        {mark.icon}
      </Box>
    </Tooltip>
  );
}

/* -------------------------------------------------------------- the panels */

const STATUS_FILTERS = [
  { key: 'all', label: 'All', variant: 'secondary' },
  { key: 'matched', label: 'Matched', variant: 'success' },
  { key: 'probable', label: 'Probable', variant: 'warning' },
  { key: 'no-match', label: 'No match', variant: 'error' },
];

function matchesQuery(haystack, query) {
  const needle = query.trim().toLowerCase();
  if (needle === '') return true;
  return haystack.some((value) => value.toLowerCase().includes(needle));
}

/**
 * A panel's title strip. The search field replaces the icon that opened it
 * rather than appearing beside it, so the strip does not grow a row when you
 * start typing.
 */
function PanelHeader({ title, query, onQueryChange, searchLabel, children }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Stack
      direction="row"
      sx={{ alignItems: 'center', gap: 1, px: 2, py: 1.5, minHeight: 56 }}
    >
      {open ? (
        <TextField
          autoFocus
          value={query}
          placeholder={searchLabel}
          aria-label={searchLabel}
          onChange={(event) => onQueryChange(event.target.value)}
          onBlur={() => {
            if (query === '') setOpen(false);
          }}
          fullWidth
        />
      ) : (
        <>
          <Typography variant="caption" color="text.secondary">
            {title}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <IconButton
            variant="secondary"
            appearance="text"
            size="sm"
            aria-label={searchLabel}
            onClick={() => setOpen(true)}
          >
            <MagnifyingGlassIcon />
          </IconButton>
          {children}
        </>
      )}
    </Stack>
  );
}

/** One field's status cell, and the one action that can settle a difference. */
function FieldDecision({ field, acknowledged, onAcknowledge }) {
  if (!fieldsDiffer(field)) return null;

  if (!field.acknowledgeable) {
    return (
      <Tooltip title="An amount that disagrees with the purchase order means one of the two documents was read wrong. That is fixed in extraction, not waved through here.">
        <Chip size="sm" variant="error" label="Fix in extraction" />
      </Tooltip>
    );
  }

  if (isRemembered(field, acknowledged)) {
    return (
      <Tooltip title="Acknowledged three times, so it is saved. The next invoice from this vendor matches this field automatically.">
        <Chip size="sm" variant="success" label="Saved to memory" />
      </Tooltip>
    );
  }

  const count = acknowledgementsFor(field, acknowledged);

  if (acknowledged.has(field.key)) {
    return (
      <Chip
        size="sm"
        variant="information"
        label={'Acknowledged - ' + count + ' of ' + ACKNOWLEDGEMENTS_TO_REMEMBER}
      />
    );
  }

  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
      <Button
        variant="secondary"
        appearance="outline"
        size="sm"
        onClick={() => onAcknowledge(field.key)}
      >
        Acknowledge
      </Button>
      {count > 0 && (
        <Typography variant="caption" color="text.secondary">
          {count + ' of ' + ACKNOWLEDGEMENTS_TO_REMEMBER + ' before'}
        </Typography>
      )}
    </Stack>
  );
}

/**
 * The metadata comparison. Two value columns rather than one column and a
 * diff, because the reader is deciding which of two documents to believe and
 * both have to be legible to do that.
 */
function InvoiceDetailsTab({ acknowledged, onAcknowledge }) {
  return (
    <TableContainer sx={{ height: '100%', overflow: 'auto' }}>
      <Table size="sm" sx={{ minWidth: 720 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={[labelCell, { width: DETAILS_COLS.field }]}>
              Field
            </TableCell>
            <TableCell sx={[labelCell, { width: DETAILS_COLS.invoice }]}>
              Invoice
            </TableCell>
            {/* No width: it takes the rest, so the decision inside it lands
                near the value rather than out at the table's edge. The design
                splits the two value columns evenly; this one carries an action
                the other does not. */}
            <TableCell sx={labelCell}>PO</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {META_FIELDS.map((field) => {
            const differs = fieldsDiffer(field);
            const resolved = metaFieldResolved(field, acknowledged);

            return (
              <TableRow
                key={field.key}
                // A fill means the row wants something. A field that agrees
                // gets none, and neither does one whose difference has been
                // settled: eleven green rows would make the three red ones
                // harder to find, not easier.
                state={differs && !resolved ? 'error' : 'default'}
              >
                {/* th scope="row" because the design draws this column with its
                    header cell, and that is what the column is: the name of the
                    row rather than one of its two values. */}
                <TableCell component="th" scope="row" sx={labelCell}>
                  {field.label}
                  {field.required && <Required />}
                </TableCell>
                <TableCell>{field.invoice}</TableCell>
                <TableCell>
                  <Stack
                    direction="row"
                    sx={{ alignItems: 'center', gap: 1.5, minWidth: 0 }}
                  >
                    <Box component="span" sx={truncate}>
                      {field.purchaseOrder}
                    </Box>
                    <FieldDecision
                      field={field}
                      acknowledged={acknowledged}
                      onAcknowledge={onAcknowledge}
                    />
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/** One invoice line, and the one action a line can carry. */
function InvoiceRow({ line, status, selected, onSelect, onAccept }) {
  // Accept is offered only where there is nothing left to allocate. A line
  // with candidate receipts can still be matched, and accepting it would file
  // the difference away rather than resolve it.
  const canAccept = status === 'no-match' && candidatesFor(line.id).length === 0;

  return (
    <TableRow hover selected={selected} onClick={onSelect}>
      <TableCell padding="checkbox">
        <StatusMark status={status} />
      </TableCell>
      {/* Both identifiers in one cell: the line id is the join with the panel
          beside this one, and the item number is what the vendor calls it. */}
      <TableCell secondary={line.itemNo}>
        <LineId>{line.id}</LineId>
      </TableCell>
      <TableCell title={line.description} sx={truncate}>
        {line.description}
      </TableCell>
      <TableCell align="right">
        <Box component="span" sx={MONO}>
          {line.quantity}
        </Box>
      </TableCell>
      <TableCell align="right">
        <Amount>{formatAmount(line.unitPrice)}</Amount>
      </TableCell>
      <TableCell align="right">
        <Amount>{formatAmount(line.lineTotal)}</Amount>
      </TableCell>
      {/* Nothing here once the line is accepted: the status glyph already
          carries that, and a chip repeating it would be the same fact twice in
          one row. */}
      <TableCell align="right">
        {canAccept ? (
          <Tooltip title="No goods receipt can exist for a service line. Accepting it records that decision against your name and lets the invoice move on.">
            <Button
              variant="secondary"
              appearance="outline"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                onAccept();
              }}
            >
              Accept
            </Button>
          </Tooltip>
        ) : null}
      </TableCell>
    </TableRow>
  );
}

/** One goods receipt, and the checkbox that allocates it. */
function ReceiptRow({ receipt, allocated, selected, onToggle }) {
  return (
    <TableRow selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox
          checked={allocated}
          onChange={onToggle}
          aria-label={'Allocate ' + receipt.grnNo + ' to ' + receipt.lineId}
        />
      </TableCell>
      <TableCell>
        <LineId>{receipt.lineId}</LineId>
      </TableCell>
      <TableCell secondary={receipt.grnNo}>{receipt.poNo}</TableCell>
      <TableCell title={receipt.description} sx={truncate}>
        {receipt.description}
      </TableCell>
      <TableCell align="right">
        <Box component="span" sx={MONO}>
          {receipt.quantity}
        </Box>
      </TableCell>
      <TableCell align="right">
        <Amount>{formatAmount(receipt.unitPrice)}</Amount>
      </TableCell>
      <TableCell align="right">
        <Amount>{formatAmount(receipt.lineTotal)}</Amount>
      </TableCell>
    </TableRow>
  );
}

/**
 * The row that closes a group: what the allocation adds up to, and how far that
 * is from the line it is allocated to.
 */
function GroupTotalRow({ line, allocatedRows }) {
  const gap = varianceFor(line, allocatedRows);
  const balanced = gap.quantity === 0 && Math.abs(gap.amount) <= TOLERANCE;

  return (
    <TableRow state={balanced ? 'success' : 'error'}>
      <TableCell padding="checkbox" />
      <TableCell>
        <LineId>{line.id}</LineId>
      </TableCell>
      <TableCell />
      <TableCell>
        <Stack
          direction="row"
          sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
        >
          <Typography variant="body2" weight="semibold">
            Allocated
          </Typography>
          {gap.quantity !== 0 && (
            <Chip
              size="sm"
              variant="warning"
              label={formatQuantityGap(gap.quantity)}
            />
          )}
          {gap.amount !== 0 && (
            <Chip
              size="sm"
              variant={gap.amount > 0 ? 'error' : 'orange'}
              label={formatAmountGap(gap.amount)}
            />
          )}
        </Stack>
      </TableCell>
      <TableCell align="right">
        <Typography variant="body2" weight="semibold">
          <Box component="span" sx={MONO}>
            {sumQuantity(allocatedRows)}
          </Box>
        </Typography>
      </TableCell>
      <TableCell />
      <TableCell align="right">
        <Typography variant="body2" weight="semibold">
          <Amount>{formatMoney(sumTotal(allocatedRows))}</Amount>
        </Typography>
      </TableCell>
    </TableRow>
  );
}

/** One side of the comparison: a label, a figure, and what it is made of. */
function SummaryStat({ label, amount, detail }) {
  return (
    <Stack sx={{ gap: 0.5 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5">{formatMoney(amount)}</Typography>
      <Typography variant="caption" color="text.secondary">
        {detail}
      </Typography>
    </Stack>
  );
}

/* ---------------------------------------------------------------- the page */

export default function MatchingPage() {
  const [tab, setTab] = React.useState('lines');
  const [navOpen, setNavOpen] = React.useState(false);
  const [belowBar, setBelowBar] = React.useState(null);

  const [allocated, setAllocated] = React.useState(
    () =>
      new Set(
        GRN_RECEIPTS.filter((receipt) => receipt.allocated).map(
          (receipt) => receipt.id
        )
      )
  );
  const [accepted, setAccepted] = React.useState(() => new Set());
  const [acknowledged, setAcknowledged] = React.useState(() => new Set());

  const [selectedLineId, setSelectedLineId] = React.useState(
    INVOICE_LINES[0].id
  );
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [invoiceQuery, setInvoiceQuery] = React.useState('');
  const [grnQuery, setGrnQuery] = React.useState('');
  const [allocatedOnly, setAllocatedOnly] = React.useState(false);
  const [validated, setValidated] = React.useState(false);

  function toggleReceipt(id) {
    setAllocated((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addTo(set, key) {
    const next = new Set(set);
    next.add(key);
    return next;
  }

  // Every status, recomputed from the allocation. The panels, the filter
  // counts, the tab counts and the gate below all read this one list.
  const statuses = INVOICE_LINES.map((line) => ({
    line,
    status: statusFor(line, allocatedFor(line.id, allocated), accepted),
  }));

  const openLines = statuses.filter((entry) => !lineResolved(entry.status));
  const openFields = META_FIELDS.filter(
    (field) => !metaFieldResolved(field, acknowledged)
  );

  const countFor = (key) =>
    key === 'all'
      ? statuses.length
      : statuses.filter((entry) => entry.status === key).length;

  const visibleLines = statuses.filter(
    (entry) =>
      (statusFilter === 'all' || entry.status === statusFilter) &&
      matchesQuery(
        [entry.line.id, entry.line.itemNo, entry.line.description],
        invoiceQuery
      )
  );

  const groups = INVOICE_LINES.map((line) => ({
    line,
    receipts: candidatesFor(line.id).filter(
      (receipt) =>
        (!allocatedOnly || allocated.has(receipt.id)) &&
        matchesQuery(
          [receipt.lineId, receipt.poNo, receipt.grnNo, receipt.description],
          grnQuery
        )
    ),
    allocatedRows: allocatedFor(line.id, allocated),
  })).filter((group) => group.receipts.length > 0);

  const billed = invoiceTotal(INVOICE_LINES);
  const allocatedReceipts = GRN_RECEIPTS.filter((receipt) =>
    allocated.has(receipt.id)
  );
  const received = sumTotal(allocatedReceipts);
  const gap = documentVariance(allocated, accepted);
  const balanced = Math.abs(gap) <= TOLERANCE;
  const waived = INVOICE_LINES.filter((line) => accepted.has(line.id));
  const blocked = openLines.length > 0 || openFields.length > 0;

  return (
    <Stack sx={{ height: '100vh', overflow: 'hidden' }}>
      {/* A page header, not an app bar: it spans the whole width and names the
          record, so the hamburger at its leading edge reads as "the
          navigation" rather than as the strip below it. */}
      <Navbar size="md">
        <IconButton
          variant="secondary"
          appearance="text"
          size="sm"
          aria-label="Open navigation"
          onClick={() => setNavOpen((previous) => !previous)}
        >
          <ListIcon />
        </IconButton>

        <NavbarTitle
          meta={[
            {
              icon: <TicketIcon size={NAVBAR_META_ICON_PX} />,
              label: HEADER_META.ticket,
            },
            {
              icon: <BuildingsIcon size={NAVBAR_META_ICON_PX} />,
              label: HEADER_META.vendor,
            },
            {
              icon: <CalendarBlankIcon size={NAVBAR_META_ICON_PX} />,
              label: HEADER_META.date,
            },
          ]}
          sx={{ ml: 3 }}
        >
          Matching
        </NavbarTitle>

        <Box sx={{ flex: 1 }} />

        <Stack direction="row" sx={{ gap: 1.5, flexShrink: 0 }}>
          <Button
            variant="secondary"
            appearance="outline"
            size="sm"
            startIcon={<StarFourIcon />}
          >
            Ask Neo
          </Button>
          <Button variant="error" appearance="outline" size="sm">
            Reject
          </Button>
          {/* Disabled until both halves agree. The label never changes and the
              button never moves - the only thing the work alters is whether it
              answers. */}
          <Tooltip
            title={
              validated
                ? 'Already validated'
                : openFields.length > 0 && openLines.length > 0
                  ? 'Resolve the fields and lines still open on both tabs'
                  : openFields.length > 0
                    ? 'Acknowledge the fields still open on Invoice details'
                    : openLines.length > 0
                      ? 'Match or accept the lines still open on Line items'
                      : ''
            }
          >
            <Button
              size="sm"
              endIcon={<ArrowRightIcon size={NAVBAR_META_ICON_PX} />}
              disabled={blocked || validated}
              onClick={() => setValidated(true)}
            >
              Validate
            </Button>
          </Tooltip>
        </Stack>
      </Navbar>

      <Box
        ref={setBelowBar}
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* The workflow strip: stages of this record, not destinations in the
            app. No brand block and no user footer - the header above owns the
            top of the screen, and the account menu belongs to the main menu
            the hamburger brings back. */}
        <AppRail
          collapsed
          showBrand={false}
          showUser={false}
          nav={WORKFLOW_NAV}
          secondaryNav={WORKFLOW_SECONDARY_NAV}
        />

        <Stack sx={{ flex: 1, minWidth: 0, minHeight: 0 }}>
          {/* The counts are the reason there are two tabs rather than one long
              page: each says how much of its own half is still open, so the user
              can see the work behind the tab they are not looking at. */}
          <Tabs
            value={tab}
            onChange={(event, value) => setTab(value)}
            sx={{ px: 3, flexShrink: 0 }}
          >
            <Tab
              value="details"
              label="Invoice details"
              count={openFields.length > 0 ? openFields.length : undefined}
            />
            <Tab
              value="lines"
              label="Line items"
              count={openLines.length > 0 ? openLines.length : undefined}
            />
          </Tabs>

          {validated && (
            <Box sx={{ px: 3, pt: 2, flexShrink: 0 }}>
              <Alert severity="success" floating>
                Matched and validated. This invoice is now ready to post to the
                ERP.
              </Alert>
            </Box>
          )}

          {tab === 'details' ? (
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <InvoiceDetailsTab
                acknowledged={acknowledged}
                onAcknowledge={(key) =>
                  setAcknowledged((previous) => addTo(previous, key))
                }
              />
            </Box>
          ) : (
            <Stack direction="row" sx={{ flex: 1, minHeight: 0 }}>
              {/* The invoice: one row per line, and the question each row asks.
                  Clicking a line is what points the panel beside it. */}
              <Stack sx={{ flex: 1, minWidth: 0, minHeight: 0 }}>
                <PanelHeader
                  title="INVOICE"
                  query={invoiceQuery}
                  onQueryChange={setInvoiceQuery}
                  searchLabel="Search invoice lines"
                />

                <Stack
                  direction="row"
                  sx={{ gap: 1, px: 2, pb: 1.5, flexWrap: 'wrap' }}
                >
                  {STATUS_FILTERS.map((filter) => (
                    <Chip
                      key={filter.key}
                      dense
                      variant={filter.variant}
                      appearance="outline"
                      selected={statusFilter === filter.key}
                      onClick={() => setStatusFilter(filter.key)}
                      label={filter.label + ' ' + countFor(filter.key)}
                    />
                  ))}
                </Stack>

                <TableContainer sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                  <Table size="sm" sx={{ minWidth: 520, ...TABLE_LAYOUT }}>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          padding="checkbox"
                          sx={{ width: INVOICE_COLS.status }}
                        />
                        <TableCell sx={{ width: INVOICE_COLS.line }}>
                          Line
                        </TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell
                          align="right"
                          sx={{ width: INVOICE_COLS.qty }}
                        >
                          Qty
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ width: INVOICE_COLS.unit }}
                        >
                          Price ($)
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ width: INVOICE_COLS.total }}
                        >
                          Total ($)
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ width: INVOICE_COLS.action }}
                        >
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {visibleLines.map((entry) => (
                        <InvoiceRow
                          key={entry.line.id}
                          line={entry.line}
                          status={entry.status}
                          selected={entry.line.id === selectedLineId}
                          onSelect={() => setSelectedLineId(entry.line.id)}
                          onAccept={() =>
                            setAccepted((previous) =>
                              addTo(previous, entry.line.id)
                            )
                          }
                        />
                      ))}
                      <TableRow>
                        <TableCell padding="checkbox" />
                        <TableCell />
                        <TableCell>
                          <Typography variant="body2" weight="semibold">
                            Invoice total
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" weight="semibold">
                            <Box component="span" sx={MONO}>
                              {invoiceQuantity(INVOICE_LINES)}
                            </Box>
                          </Typography>
                        </TableCell>
                        <TableCell />
                        <TableCell align="right">
                          <Typography variant="body2" weight="semibold">
                            <Amount>{formatMoney(billed)}</Amount>
                          </Typography>
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider />
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {visibleLines.length + ' of ' + INVOICE_LINES.length + ' lines'}
                  </Typography>
                </Box>
              </Stack>

              <Divider orientation="vertical" flexItem />

              {/* The receipts, grouped by the invoice line each one is a
                  candidate for. The checkbox is the allocation, and the row that
                  closes each group is what it adds up to. */}
              <Stack sx={{ flex: 1.1, minWidth: 0, minHeight: 0 }}>
                <PanelHeader
                  title="GRN"
                  query={grnQuery}
                  onQueryChange={setGrnQuery}
                  searchLabel="Search goods receipts"
                >
                  <Tooltip
                    title={
                      allocatedOnly
                        ? 'Showing allocated receipts only'
                        : 'Show allocated receipts only'
                    }
                  >
                    <IconButton
                      variant="secondary"
                      appearance="text"
                      size="sm"
                      aria-label="Show allocated receipts only"
                      aria-pressed={allocatedOnly}
                      onClick={() => setAllocatedOnly((previous) => !previous)}
                    >
                      <FunnelIcon weight={allocatedOnly ? 'fill' : 'regular'} />
                    </IconButton>
                  </Tooltip>
                </PanelHeader>

                <TableContainer sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                  <Table size="sm" sx={{ minWidth: 520, ...TABLE_LAYOUT }}>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          padding="checkbox"
                          sx={{ width: GRN_COLS.check }}
                        />
                        <TableCell sx={{ width: GRN_COLS.line }}>
                          Line
                        </TableCell>
                        <TableCell sx={{ width: GRN_COLS.po }}>
                          PO / GRN
                        </TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right" sx={{ width: GRN_COLS.qty }}>
                          Qty
                        </TableCell>
                        <TableCell align="right" sx={{ width: GRN_COLS.unit }}>
                          Price ($)
                        </TableCell>
                        <TableCell align="right" sx={{ width: GRN_COLS.total }}>
                          Total ($)
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {groups.map((group) => (
                        <React.Fragment key={group.line.id}>
                          {group.receipts.map((receipt) => (
                            <ReceiptRow
                              key={receipt.id}
                              receipt={receipt}
                              allocated={allocated.has(receipt.id)}
                              selected={receipt.lineId === selectedLineId}
                              onToggle={() => toggleReceipt(receipt.id)}
                            />
                          ))}
                          <GroupTotalRow
                            line={group.line}
                            allocatedRows={group.allocatedRows}
                          />
                        </React.Fragment>
                      ))}
                      <TableRow>
                        <TableCell padding="checkbox" />
                        <TableCell />
                        <TableCell />
                        <TableCell>
                          <Typography variant="body2" weight="semibold">
                            GRN total
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" weight="semibold">
                            <Box component="span" sx={MONO}>
                              {sumQuantity(allocatedReceipts)}
                            </Box>
                          </Typography>
                        </TableCell>
                        <TableCell />
                        <TableCell align="right">
                          <Typography variant="body2" weight="semibold">
                            <Amount>{formatMoney(received)}</Amount>
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider />
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {allocatedReceipts.length +
                      ' of ' +
                      GRN_RECEIPTS.length +
                      ' receipts allocated'}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          )}

          <Divider />

          {/* The one question, under both panels rather than inside either: it is
              about the document, and neither half of the comparison owns the
              answer. */}
          <Stack
            direction="row"
            sx={{
              gap: 5,
              px: 3,
              py: 2,
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              flexWrap: 'wrap',
            }}
          >
            <SummaryStat
              label="INVOICE"
              amount={billed}
              detail={
                INVOICE_LINES.length +
                ' lines - ' +
                invoiceQuantity(INVOICE_LINES) +
                ' qty'
              }
            />

            <Stack sx={{ alignItems: 'center', gap: 0.5 }}>
              <ArrowsLeftRightIcon size={20} />
              <Chip
                size="sm"
                variant="secondary"
                label={'Tolerance: +/- ' + formatMoney(TOLERANCE)}
              />
            </Stack>

            <SummaryStat
              label="GRN"
              amount={received}
              detail={
                allocatedReceipts.length +
                ' receipts - ' +
                sumQuantity(allocatedReceipts) +
                ' qty'
              }
            />

            <Divider orientation="vertical" flexItem />

            <Card>
              <CardContent>
                <Stack sx={{ gap: 0.5, minWidth: 180 }}>
                  <Typography variant="caption" color="text.secondary">
                    VARIANCE
                  </Typography>
                  <Typography variant="h5">
                    {balanced ? 'Balanced' : formatMoney(Math.abs(gap))}
                  </Typography>
                  <Chip
                    size="sm"
                    variant={balanced ? 'success' : 'error'}
                    label={
                      balanced
                        ? waived.length > 0
                          ? 'GRN + ' + formatMoney(invoiceTotal(waived)) + ' accepted'
                          : 'Invoice = GRN'
                        : gap > 0
                          ? 'Invoice > GRN'
                          : 'GRN > Invoice'
                    }
                  />
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Stack>

        {/* The main menu, floated back in over a record that stays put. The
            way out of the workflow to everything else. */}
        <AppRail
          overlay
          open={navOpen}
          onClose={() => setNavOpen(false)}
          onNavigate={() => setNavOpen(false)}
          defaultActive="dashboard"
          container={belowBar}
        />
      </Box>
    </Stack>
  );
}
`;
