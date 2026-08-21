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
  if (value === 0) return '';
  const count = Math.abs(value);
  return count + (value > 0 ? ' more received' : ' fewer received');
}

function formatAmountGap(value) {
  if (value === 0) return '';
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
 * TableCell is white-space: nowrap by default, so under automatic layout the
 * description column claims its full text width and pushes the money columns
 * off the panel. Fixed layout gives every column the width named here.
 *
 * Widths go on the header cells, because fixed layout reads the first row only.
 *
 * The invoice panel's leading cell is 64 and holds two 16px glyphs - the match
 * status and the row's own checkbox - which is why it is wider than a checkbox
 * column normally is. The last two money columns are flex in both panels rather
 * than the 156 the GRN header fixes them at: 776px of fixed columns will not fit
 * a panel that is half a page, and the design's own subtotal row leaves those
 * two flexible too.
 */
const TABLE_LAYOUT = { tableLayout: 'fixed' };

const INVOICE_COLS = { check: 64, itemNo: 80, description: 150, qty: 70 };

const GRN_COLS = { check: 64, poNo: 100, grnNo: 80, description: 150, qty: 70 };

/**
 * The design's own placeholder for an item number a line does not have - the
 * freight line, which is a service and has no catalogue code.
 */
const EMPTY_ITEM_NO = '-';

/**
 * The description column, which is the one column here that is prose.
 *
 * TableCell is nowrap by default and its own JSDoc names the two ways out:
 * truncate, or say so with whiteSpace: 'normal' paired with a width. The design
 * wraps these to two and three lines inside 150px, so this takes the second.
 * Rows then vary in height, which is what the design draws and what a row
 * height being a floor rather than a ceiling allows.
 */
const wrap = { whiteSpace: 'normal' };

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
    row: 'success',
  },
  probable: {
    icon: <QuestionIcon weight="fill" size={STATUS_ICON_PX} />,
    tone: icon.warning.accent,
    label: 'Probable',
    help: 'Receipts found for this item, but they do not add up to the line',
    // No fill. The design's own State axis on table-rows has six values and
    // none of them is a warning, so a tint here would be a rung invented at a
    // call site - the glyph and the group's own subtotal carry it instead.
    row: 'default',
  },
  'no-match': {
    icon: <XCircleIcon weight="fill" size={STATUS_ICON_PX} />,
    tone: icon.error.onColorHover,
    label: 'No match',
    help: 'No goods receipt exists for this line',
    row: 'error',
  },
  accepted: {
    icon: <SealCheckIcon weight="fill" size={STATUS_ICON_PX} />,
    tone: icon.information.onColorHover,
    label: 'Accepted',
    help: 'Someone decided this line is payable without a receipt',
    // Resolved, but not matched: a person overrode the check rather than the
    // check passing, and success would say the second thing.
    row: 'default',
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
          {/* The design sets this at 14px in the body ink - full strength,
              because it names which document the panel is. 14 is not a rung in
              this scale, so it takes the 13px one above it in its Medium cut. */}
          <Typography variant="body1" weight="medium">
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

/**
 * One invoice line.
 *
 * The leading cell holds two 16px glyphs, as the design draws it: the match
 * status, then the row's own checkbox. The checkbox is the decision - it opens
 * ticked on a line that matched and clear on one that did not, so ticking an
 * unmatched line is a person saying it is payable anyway. That is why there is
 * no separate Accept button: the design's own control already asks the question.
 */
function InvoiceRow({ line, status, selected, onSelect, onToggleAccept }) {
  const matched = status === 'matched';
  const accepted = status === 'accepted';

  return (
    <TableRow
      hover
      selected={selected}
      state={STATUS_MARKS[status].row}
      onClick={onSelect}
    >
      <TableCell sx={{ width: INVOICE_COLS.check }} align="right">
        <Stack
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}
        >
          <StatusMark status={status} />
          <Tooltip
            title={
              matched
                ? 'Matched, and included'
                : accepted
                  ? 'Included without a matching receipt'
                  : 'Include this line without a matching receipt'
            }
          >
            {/* A matched line is ticked and stays ticked: unticking it would
                mean excluding a line that agrees, which is not a decision this
                screen is for. */}
            <Checkbox
              checked={matched || accepted}
              disabled={matched}
              onChange={onToggleAccept}
              onClick={(event) => event.stopPropagation()}
              aria-label={'Include line ' + line.id}
            />
          </Tooltip>
        </Stack>
      </TableCell>
      <TableCell sx={{ width: INVOICE_COLS.itemNo }}>
        <LineId>{line.id}</LineId>
      </TableCell>
      {/* The item code and the description in one string, separated by a
          middot, as the design writes it. */}
      <TableCell sx={{ width: INVOICE_COLS.description, ...wrap }}>
        {line.itemNo === EMPTY_ITEM_NO
          ? line.description
          : line.itemNo + ' - ' + line.description}
      </TableCell>
      <TableCell sx={{ width: INVOICE_COLS.qty }}>
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
    </TableRow>
  );
}

/** One goods receipt, and the checkbox that allocates it. */
function ReceiptRow({ receipt, allocated, selected, onToggle }) {
  return (
    <TableRow selected={selected}>
      <TableCell sx={{ width: GRN_COLS.check }} align="right">
        <Checkbox
          checked={allocated}
          onChange={onToggle}
          aria-label={'Allocate ' + receipt.grnNo + ' to ' + receipt.lineId}
        />
      </TableCell>
      {/* A tag, as the design draws the purchase order reference - it is the
          one value on the row that names a document rather than describing
          this one. */}
      <TableCell sx={{ width: GRN_COLS.poNo }}>
        <Chip size="sm" variant="secondary" label={receipt.poNo} />
      </TableCell>
      <TableCell sx={{ width: GRN_COLS.grnNo }}>
        <LineId>{receipt.grnNo}</LineId>
      </TableCell>
      <TableCell sx={{ width: GRN_COLS.description, ...wrap }}>
        {receipt.description}
      </TableCell>
      <TableCell sx={{ width: GRN_COLS.qty }}>
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
      <TableCell />
      <TableCell />
      <TableCell />
      {/* "Total" in the description column, where the design puts it, with the
          invoice line it totals against beside it - the design leaves that
          implicit and relies on the row's position in the group. */}
      <TableCell sx={wrap} secondary={'against ' + line.id}>
        <Typography variant="body2" weight="semibold">
          Total
        </Typography>
      </TableCell>
      {/* The two gaps stack under the figures they are about, as the design
          places them: the quantity delta under the quantity, the money delta
          under the money. secondary is TableCell's own second line. */}
      <TableCell secondary={formatQuantityGap(gap.quantity) || undefined}>
        <Typography variant="body2" weight="semibold">
          <Box component="span" sx={MONO}>
            {sumQuantity(allocatedRows)}
          </Box>
        </Typography>
      </TableCell>
      <TableCell />
      <TableCell
        align="right"
        secondary={formatAmountGap(gap.amount) || undefined}
      >
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

  /**
   * Include a line that did not match, or take it back out.
   *
   * The row checkbox and this are the same thing: the design's leading cell
   * opens ticked where the line matched, so ticking one that did not is the
   * person saying it is payable anyway.
   */
  function toggleAccepted(id) {
    setAccepted((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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

  const visibleLines = statuses.filter((entry) =>
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

                <TableContainer sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                  <Table size="sm" sx={{ minWidth: 520, ...TABLE_LAYOUT }}>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={[labelCell, { width: INVOICE_COLS.check }]}
                        />
                        <TableCell
                          sx={[labelCell, { width: INVOICE_COLS.itemNo }]}
                        >
                          Item No.
                        </TableCell>
                        <TableCell
                          sx={[labelCell, { width: INVOICE_COLS.description }]}
                        >
                          Description
                        </TableCell>
                        <TableCell sx={[labelCell, { width: INVOICE_COLS.qty }]}>
                          Qty
                        </TableCell>
                        <TableCell align="right" sx={labelCell}>
                          Unit Price ($)
                        </TableCell>
                        <TableCell align="right" sx={labelCell}>
                          Line Total ($)
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
                          onToggleAccept={() => toggleAccepted(entry.line.id)}
                        />
                      ))}
                      <TableRow>
                        <TableCell sx={labelCell} />
                        <TableCell sx={labelCell} />
                        <TableCell sx={labelCell}>
                          <Typography variant="body2" weight="semibold">
                            Invoice Total
                          </Typography>
                        </TableCell>
                        <TableCell sx={labelCell}>
                          <Typography variant="body2" weight="semibold">
                            <Box component="span" sx={MONO}>
                              {invoiceQuantity(INVOICE_LINES)}
                            </Box>
                          </Typography>
                        </TableCell>
                        <TableCell sx={labelCell} />
                        <TableCell align="right" sx={labelCell}>
                          <Typography variant="body2" weight="semibold">
                            <Amount>{formatMoney(billed)}</Amount>
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider />
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {'Total Line items: ' + INVOICE_LINES.length}
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
                        <TableCell sx={[labelCell, { width: GRN_COLS.check }]} />
                        <TableCell sx={[labelCell, { width: GRN_COLS.poNo }]}>
                          PO No.
                        </TableCell>
                        <TableCell sx={[labelCell, { width: GRN_COLS.grnNo }]}>
                          GRN No.
                        </TableCell>
                        <TableCell
                          sx={[labelCell, { width: GRN_COLS.description }]}
                        >
                          Description
                        </TableCell>
                        <TableCell sx={[labelCell, { width: GRN_COLS.qty }]}>
                          Qty
                        </TableCell>
                        <TableCell align="right" sx={labelCell}>
                          Unit Price ($)
                        </TableCell>
                        <TableCell align="right" sx={labelCell}>
                          Line Total ($)
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
                        <TableCell sx={labelCell} />
                        <TableCell sx={labelCell} />
                        <TableCell sx={labelCell} />
                        <TableCell sx={labelCell}>
                          <Typography variant="body2" weight="semibold">
                            GRN Total
                          </Typography>
                        </TableCell>
                        <TableCell sx={labelCell}>
                          <Typography variant="body2" weight="semibold">
                            <Box component="span" sx={MONO}>
                              {sumQuantity(allocatedReceipts)}
                            </Box>
                          </Typography>
                        </TableCell>
                        <TableCell sx={labelCell} />
                        <TableCell align="right" sx={labelCell}>
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
