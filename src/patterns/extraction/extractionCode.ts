/**
 * The extraction pattern, as a page a consumer can paste.
 *
 * Kept in its own file for the same reason `matchingCode` and `erpPostingCode`
 * are: it is one long string with short metadata around it, and `get_pattern`
 * promises "the full page layout code" rather than an excerpt.
 *
 * What is left to the reader is the record — the document, the fields and the
 * lines — because those are the application. Everything that is layout, the
 * validation rules, the derivation of the issue list from them, and the link
 * between a field and the region it was read from, is here.
 *
 * The string carries no backticks and no interpolation on purpose: a bare
 * backtick in it would terminate the literal, and a `${` would be read as a
 * substitution rather than as code. The snippet concatenates with `+` for the
 * same reason.
 */
export const extractionCode = `'use client';

import * as React from 'react';
import {
  Alert,
  Box,
  Button,
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
  ArrowClockwiseIcon,
  ArrowCounterClockwiseIcon,
  ArrowRightIcon,
  BuildingsIcon,
  CalendarBlankIcon,
  CaretLeftIcon,
  CaretRightIcon,
  ListIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  StarFourIcon,
  TicketIcon,
} from '@neofloai/atoms/icons';
import { border, surface, text, typography } from '@neofloai/atoms/tokens';

// The workflow rail and the main menu behind the hamburger, from the Drawer
// docs page. The same strip the matching and ERP posting screens mount: one
// workflow, one navigation, and a second copy of it would drift.
import { AppRail, WORKFLOW_NAV, WORKFLOW_SECONDARY_NAV } from './AppRail';

/**
 * Extraction: the first stage of the invoice processing workflow.
 *
 * A document arrives, a model reads it, and this screen is where a person
 * confirms what was read before anything downstream is allowed to believe it.
 * Two panels, because there are two things to compare - the page as it was
 * received, and the fields that came off it - and the whole screen turns on
 * being able to look from one to the other.
 *
 * Nothing here is a verdict that was stored. The issue list, the count in the
 * alert, the count on the tab, which rows are tinted, whether Proceed may be
 * pressed: all of it is issuesFor(values) on every render. Type into a field
 * and every one of them moves together, which is the only way a screen like
 * this stays honest as it is corrected.
 */

/* ------------------------------------------------------------- the record */

/** The bar's own metadata. */
const HEADER_META = {
  ticket: '#345',
  vendor: 'Nike Sales',
  date: '05 Jun 2025',
};

/** The attachment under review, and how many pages it runs to. */
const DOCUMENT = { name: 'INV-1001312123.pdf', pages: 6 };

/**
 * The page, as a list of boxes.
 *
 * Replace this with your own viewer. It is drawn rather than embedded so the
 * pattern is copyable - and because drawing it buys the one thing an embedded
 * image cannot give: the document and the extraction come from one source, so
 * the region a field was read from can be pointed at, and a field that was
 * read from nothing has nothing to point at.
 *
 * Boxes are percentages of the page, so zoom and rotation carry them along for
 * free. Ids are field keys wherever a box holds exactly one field, which makes
 * the mapping below a lookup rather than a table.
 *
 * Note what is not drawn: no subtotal line between the grid and the tax. The
 * invoice prints its lines, its tax and its total and never states the net,
 * which is why extraction has nothing to put in that field.
 */
interface DocumentBlock {
  id: string;
  page: number;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: 'heading' | 'title' | 'para' | 'field' | 'grid';
  label?: string;
  value?: string;
  lines?: string[];
}

const DOCUMENT_BLOCKS: DocumentBlock[] = [
  {
    id: 'vendorName',
    page: 1,
    x: 6,
    y: 5,
    w: 50,
    h: 5,
    kind: 'heading',
    value: 'NIKE SALES (MALAYSIA) SDN BHD',
  },
  {
    id: 'vendorAddress',
    page: 1,
    x: 6,
    y: 11,
    w: 50,
    h: 10,
    kind: 'para',
    lines: [
      'Unit 5-1, Level 5, Menara Aspire',
      '8 Jalan Kerinchi, 59200 Kuala Lumpur',
      'Malaysia',
    ],
  },
  {
    id: 'vendorReg',
    page: 1,
    x: 6,
    y: 22,
    w: 50,
    h: 4,
    kind: 'para',
    lines: ['Co. Reg. 199001007138 (198708-M) - TIN C21857649050'],
  },
  {
    id: 'title',
    page: 1,
    x: 62,
    y: 5,
    w: 32,
    h: 6,
    kind: 'title',
    value: 'INVOICE',
  },
  {
    id: 'invoiceNumber',
    page: 1,
    x: 62,
    y: 13,
    w: 32,
    h: 4,
    kind: 'field',
    label: 'Invoice No.',
    value: '1001312123',
  },
  {
    id: 'invoiceDate',
    page: 1,
    x: 62,
    y: 18,
    w: 32,
    h: 4,
    kind: 'field',
    label: 'Invoice Date',
    value: '22 Jun 2025',
  },
  {
    id: 'dueDate',
    page: 1,
    x: 62,
    y: 23,
    w: 32,
    h: 4,
    kind: 'field',
    label: 'Due Date',
    value: '22 Jul 2025',
  },
  {
    id: 'paymentTerms',
    page: 1,
    x: 62,
    y: 28,
    w: 32,
    h: 4,
    kind: 'field',
    label: 'Terms',
    value: 'Net 30',
  },
  {
    id: 'billTo',
    page: 1,
    x: 6,
    y: 30,
    w: 50,
    h: 11,
    kind: 'para',
    lines: [
      'BILL TO',
      'Aspire Retail Group Sdn Bhd',
      'Level 12, Menara Q Sentral',
      'Kuala Lumpur, Malaysia',
    ],
  },
  { id: 'lines', page: 1, x: 6, y: 45, w: 88, h: 28, kind: 'grid' },
  {
    id: 'taxAmount',
    page: 1,
    x: 60,
    y: 77,
    w: 34,
    h: 4,
    kind: 'field',
    label: 'SST 6%',
    value: 'RM 327.00',
  },
  {
    id: 'totalAmount',
    page: 1,
    x: 60,
    y: 82,
    w: 34,
    h: 5,
    kind: 'field',
    label: 'Total Due',
    value: 'RM 5,777.00',
  },
  {
    id: 'footer',
    page: 1,
    x: 6,
    y: 92,
    w: 88,
    h: 5,
    kind: 'para',
    lines: [
      'This sale of the goods on this invoice is subject to the most recent',
      'Nike terms and conditions of sale acknowledged and accepted by you.',
    ],
  },
];

/**
 * How a field is checked, which is not the same as what it holds.
 *
 * money is the only kind that participates in arithmetic. reference is the only
 * kind satisfied by a sibling - a purchase order number and a goods-receipt
 * number are alternatives, so neither row can be required on its own and the
 * rule has to sit across the pair.
 */
interface ExtractedField {
  key: string;
  label: string;
  kind: 'text' | 'date' | 'money' | 'reference';
  required?: boolean;
  /** Where on the document it was read from, if it was read at all. */
  blockId?: string;
  /** Placeholder while the field is empty. Kept short enough to fit one. */
  hint?: string;
}

/**
 * The three money rows are ordered net, tax, gross. With two figures the order
 * is arbitrary; with three it is a sum, and a sum reads downwards.
 */
const EXTRACTED_FIELDS: ExtractedField[] = [
  {
    key: 'po',
    label: 'Purchase Order Number',
    kind: 'reference',
    hint: 'PO number, or the GRN below',
  },
  {
    key: 'grn',
    label: 'SES / GRN Number',
    kind: 'reference',
    hint: 'Only if there is no PO',
  },
  {
    key: 'invoiceNumber',
    label: 'Invoice Number',
    kind: 'text',
    required: true,
    blockId: 'invoiceNumber',
  },
  {
    key: 'invoiceDate',
    label: 'Invoice Date',
    kind: 'date',
    required: true,
    blockId: 'invoiceDate',
  },
  { key: 'dueDate', label: 'Due Date', kind: 'date', blockId: 'dueDate' },
  {
    key: 'vendorName',
    label: 'Vendor Name',
    kind: 'text',
    required: true,
    blockId: 'vendorName',
  },
  {
    key: 'vendorCode',
    label: 'Vendor Code',
    kind: 'text',
    required: true,
    blockId: 'vendorReg',
  },
  {
    key: 'vendorTaxId',
    label: 'Vendor Tax ID',
    kind: 'text',
    required: true,
    blockId: 'vendorReg',
  },
  {
    key: 'paymentTerms',
    label: 'Payment Terms',
    kind: 'text',
    blockId: 'paymentTerms',
  },
  { key: 'currency', label: 'Currency', kind: 'text', blockId: 'totalAmount' },
  {
    key: 'netAmount',
    label: 'Total Amount before VAT/GST',
    kind: 'money',
    required: true,
  },
  { key: 'taxAmount', label: 'Tax Amount', kind: 'money', blockId: 'taxAmount' },
  {
    key: 'totalAmount',
    label: 'Total Amount',
    kind: 'money',
    required: true,
    blockId: 'totalAmount',
  },
];

/** What extraction returned. Two fields it could not fill are empty strings. */
const EXTRACTED_VALUES: Record<string, string> = {
  po: '',
  grn: '',
  invoiceNumber: '1001312123',
  invoiceDate: '2025-06-22',
  dueDate: '2025-07-22',
  vendorName: 'NIKE SALES (MALAYSIA) SDN BHD',
  vendorCode: '199001007138 (198708-M)',
  vendorTaxId: 'C21857649050',
  paymentTerms: 'Net 30',
  currency: 'MYR',
  netAmount: '',
  taxAmount: '327.00',
  totalAmount: '5777.00',
};

interface InvoiceLine {
  id: string;
  itemNo: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

/**
 * The lines as printed, each of which multiplies out, and which together come
 * to the net the header field is missing.
 *
 * That is the point of shipping them at all: they give the missing figure a
 * second witness. Whatever a reader types into the net is checked against the
 * total less the tax and against the sum of the lines, so a plausible wrong
 * number has two independent chances to be caught rather than one.
 */
const INVOICE_LINES: InvoiceLine[] = [
  {
    id: 'L-01',
    itemNo: 'NIKE-AF1-07',
    description: "Air Force 1 '07",
    quantity: 6,
    unitPrice: 389,
  },
  {
    id: 'L-02',
    itemNo: 'NIKE-DF-TEE',
    description: 'Dri-FIT Training Tee',
    quantity: 18,
    unitPrice: 89,
  },
  {
    id: 'L-03',
    itemNo: 'NIKE-SOCK-3P',
    description: 'Everyday Cushioned Socks (3-pack)',
    quantity: 24,
    unitPrice: 45,
  },
  {
    id: 'L-04',
    itemNo: 'FREIGHT-IN',
    description: 'Inbound freight',
    quantity: 1,
    unitPrice: 434,
  },
];

/* -------------------------------------------------------- the derivations */

/** Line total. Never stored: a quantity and a price already say it. */
function lineTotal(line: InvoiceLine) {
  return line.quantity * line.unitPrice;
}

function lineSubtotal(lines: InvoiceLine[]) {
  return lines.reduce((sum, line) => sum + lineTotal(line), 0);
}

function lineQuantity(lines: InvoiceLine[]) {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

/**
 * A typed amount as a number, or null if it is not one.
 *
 * Tolerant of what a person types into a money field - separators, a currency
 * prefix, spaces - because rejecting 5,450.00 for its comma would be the screen
 * failing at the one thing it is for.
 */
function parseMoney(value: string) {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function isFilled(values: Record<string, string>, key: string) {
  return (values[key] || '').trim() !== '';
}

/**
 * Currency prefixes, so the amounts carry the symbol the Currency field says
 * rather than one hard-coded next to them. Correct the row and every total
 * follows, which is what a reader fixing a mis-read currency expects.
 */
const CURRENCY_PREFIXES: Record<string, string> = {
  MYR: 'RM',
  SGD: 'S$',
  USD: '$',
  EUR: 'EUR',
  GBP: 'GBP',
  INR: 'INR',
};

function currencyPrefix(code: string) {
  const upper = code.trim().toUpperCase();
  return CURRENCY_PREFIXES[upper] || upper;
}

function formatAmount(value: number) {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatMoney(value: number, currency: string) {
  return currencyPrefix(currency) + ' ' + formatAmount(value);
}

/**
 * Whether the lines agree with the net currently in the field.
 *
 * null while the field is empty: the lines cannot disagree with a blank, and
 * reporting them as unreconciled before there is anything to reconcile against
 * would put a second issue on the screen for one missing field.
 */
function linesReconcile(values: Record<string, string>, lines: InvoiceLine[]) {
  const net = parseMoney(values.netAmount || '');
  if (net === null) return null;
  return Math.abs(net - lineSubtotal(lines)) < 0.005;
}

/**
 * One thing wrong, the fields it is about, and the sentence the alert prints.
 *
 * fields is a list rather than a key because the reference rule is satisfied by
 * either of two rows, and both have to light up for the message to make sense.
 */
interface Issue {
  key: string;
  fields: string[];
  message: string;
}

/**
 * Everything wrong with the extraction, in the order a reader should deal with
 * it: the reference first, because a document with no purchase order and no
 * goods receipt cannot be matched at all; then anything simply missing; then
 * the sums.
 */
function issuesFor(values: Record<string, string>, lines: InvoiceLine[]) {
  const issues: Issue[] = [];

  if (!isFilled(values, 'po') && !isFilled(values, 'grn')) {
    issues.push({
      key: 'reference',
      fields: ['po', 'grn'],
      message: 'Add a PO number or a SES/GRN number',
    });
  }

  EXTRACTED_FIELDS.forEach((field) => {
    if (!field.required || isFilled(values, field.key)) return;
    issues.push({
      key: 'missing:' + field.key,
      fields: [field.key],
      message: field.label + ' is missing',
    });
  });

  const net = parseMoney(values.netAmount || '');
  const tax = parseMoney(values.taxAmount || '');
  const total = parseMoney(values.totalAmount || '');
  const currency = values.currency || '';

  if (net !== null && tax !== null && total !== null) {
    if (Math.abs(net + tax - total) >= 0.005) {
      issues.push({
        key: 'sum',
        fields: ['netAmount', 'taxAmount', 'totalAmount'],
        message:
          'Net and tax come to ' +
          formatMoney(net + tax, currency) +
          ', not the ' +
          formatMoney(total, currency) +
          ' total',
      });
    }
  }

  if (linesReconcile(values, lines) === false) {
    issues.push({
      key: 'lines',
      fields: ['netAmount'],
      message:
        'The line items come to ' +
        formatMoney(lineSubtotal(lines), currency) +
        ', which is not the net',
    });
  }

  return issues;
}

/** Which rows any open issue names, for the fill and the row state. */
function flaggedFields(issues: Issue[]) {
  const keys = new Set<string>();
  issues.forEach((issue) => issue.fields.forEach((key) => keys.add(key)));
  return keys;
}

/** Where a field was read from, if anywhere. */
function blockFor(field: ExtractedField) {
  return DOCUMENT_BLOCKS.find((block) => block.id === field.blockId);
}

/* ------------------------------------------------------ layout and the ink */

/** Tall enough for a page of document beside thirteen fields. */
const FRAME_HEIGHT_PX = 900;

/**
 * The document pane's width.
 *
 * The design gives it a little over a third of the page. Held at a number
 * rather than split by ratio because the page inside it is a fixed size: a pane
 * that grew with the viewport would leave the page in an ever-wider margin.
 */
const DOC_PANE_WIDTH_PX = 500;

/**
 * The page at 100%, in A4's ratio. An invoice is portrait, and the pane is tall
 * precisely so a portrait page fits it.
 */
const PAGE_WIDTH_PX = 396;
const PAGE_HEIGHT_PX = 560;

/** Zoom rungs, with 100% among them so the label is real. */
const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const DEFAULT_ZOOM_INDEX = 2;

/** A quarter turn, which is the only rotation a page viewer needs. */
const QUARTER_TURN_DEG = 90;

const DETAILS_COLS = { field: 250 };
const DETAILS_TABLE_MIN_PX = 560;

/**
 * Every metadata row, whether it holds text or an input.
 *
 * The design puts all of them at 48. Pinning it is what keeps the table a grid:
 * a TextField is 36 tall against a value's 20, so a row that swaps one for the
 * other would grow with it and step the whole column below it down.
 *
 * The input is then left unpadded on purpose. 36 fits inside the 47 of content
 * a 48px row leaves once its hairline is counted, and a cell centres its content
 * vertically already - so the height is the only number involved, and padding
 * arithmetic that has to agree with a border width is not.
 */
const ROW_HEIGHT_PX = 48;

/**
 * How wide a value input gets.
 *
 * Not the column. The value column takes the table's slack and runs to several
 * hundred pixels; the longest thing any of these fields holds is a vendor name
 * of about 200, so a full-width input would put a purchase order number in a box
 * five times longer than anything that will ever be typed into it.
 */
const VALUE_INPUT_WIDTH_PX = 280;

/**
 * Why no issue text sits on the row.
 *
 * An earlier draft put the message beside each input. It read badly for a reason
 * worth keeping: the reference rule names two rows, so the same sentence
 * appeared twice on adjacent lines, and the longest of them had to be truncated
 * to hold the row's height - telling a reader nothing they could not see.
 *
 * The alert above the tabs prints every issue in full and in one place. What the
 * row owes is only which rows, and it says that twice already: the fill, and an
 * input carrying the error border.
 */

const LINE_COLS = { itemNo: 132, qty: 64 };
const LINE_TABLE_MIN_PX = 620;

/** Highlight stroke on the page, and the inset that keeps it clear of the ink. */
const HIGHLIGHT_WIDTH_PX = 2;
const HIGHLIGHT_INSET_PX = 3;

/** Gap between the trailing actions, as PageHeaderBar sets it. */
const ACTION_GAP = 1.5;

/**
 * Figures line up in a column or they are not a column. Tabular numerals on
 * every digit the screen prints, so a total under a subtotal has its decimal
 * point in the same place.
 */
const DIGITS = { fontVariantNumeric: 'tabular-nums' };

/**
 * An identifier - an item code, a tax id. Quieter ink than the value beside it,
 * because a code is a label for a thing rather than a fact about it.
 */
const CODE_INK = (theme: any) => ({
  fontVariantNumeric: 'tabular-nums',
  fontSize: typography.body.b2.size,
  color: text.default.caption.light,
  ...theme.applyStyles('dark', { color: text.default.caption.dark }),
});

/**
 * The label column, and the header strip above it.
 *
 * One treatment for both, because the design gives them one: the same tinted
 * fill and the same quiet ink run across the header row and down the first
 * column, which is what makes that column read as a list of row names rather
 * than as a value. TableHead draws no fill of its own, so the fill is set here
 * - additive, not an override of anything the component decided.
 */
const labelCell = (theme: any) => ({
  backgroundColor: surface.default.default.light,
  color: text.default.caption.light,
  ...theme.applyStyles('dark', {
    backgroundColor: surface.default.default.dark,
    color: text.default.caption.dark,
  }),
});

/** The mark on a field extraction must have captured. */
const requiredMark = (theme: any) => ({
  color: text.error.caption.light,
  ...theme.applyStyles('dark', { color: text.error.caption.dark }),
});

/* --------------------------------------------------------- the document */

/**
 * One box on the page.
 *
 * Type comes from the token ramp even though this is document content rather
 * than interface: a facsimile drawn with arbitrary sizes would be the one place
 * in the pattern where a number was invented, and the ramp already has a 10px
 * rung for small print.
 */
function Block({ block }: { block: DocumentBlock }) {
  if (block.kind === 'grid') return <DocumentGrid />;

  if (block.kind === 'title') {
    return (
      <Box
        sx={(theme) => ({
          fontSize: typography.headings.h6.size,
          lineHeight: 1.2,
          letterSpacing: '0.08em',
          textAlign: 'right',
          color: text.default.heading.light,
          ...theme.applyStyles('dark', { color: text.default.heading.dark }),
        })}
      >
        {block.value}
      </Box>
    );
  }

  if (block.kind === 'heading') {
    return (
      <Box
        sx={(theme) => ({
          fontSize: typography.body.b2.size,
          lineHeight: 1.35,
          color: text.default.body.light,
          ...theme.applyStyles('dark', { color: text.default.body.dark }),
        })}
      >
        {block.value}
      </Box>
    );
  }

  if (block.kind === 'field') {
    return (
      <Stack
        direction="row"
        sx={(theme) => ({
          justifyContent: 'space-between',
          gap: 1,
          fontSize: typography.body.caption.size,
          lineHeight: 1.4,
          color: text.default.body.light,
          ...theme.applyStyles('dark', { color: text.default.body.dark }),
        })}
      >
        <Box component="span" sx={{ opacity: 0.7 }}>
          {block.label}
        </Box>
        <Box component="span">{block.value}</Box>
      </Stack>
    );
  }

  return (
    <Stack
      sx={(theme) => ({
        fontSize: typography.body.caption.size,
        lineHeight: 1.5,
        color: text.default.caption.light,
        ...theme.applyStyles('dark', { color: text.default.caption.dark }),
      })}
    >
      {(block.lines || []).map((line) => (
        <Box component="span" key={line}>
          {line}
        </Box>
      ))}
    </Stack>
  );
}

/**
 * The line grid as the invoice prints it.
 *
 * The same data the Line items tab reads, so the document and the extraction
 * cannot disagree by accident - and so the absence a reader is being asked
 * about is visible: the grid ends and the tax begins, with no subtotal between.
 */
function DocumentGrid() {
  return (
    <Stack
      sx={(theme) => ({
        fontSize: typography.body.caption.size,
        lineHeight: 1.6,
        color: text.default.body.light,
        ...theme.applyStyles('dark', { color: text.default.body.dark }),
      })}
    >
      <Stack
        direction="row"
        sx={(theme) => ({
          gap: 1,
          pb: 0.25,
          borderBottom: '1px solid',
          borderColor: border.layers.card2.light,
          color: text.default.caption.light,
          ...theme.applyStyles('dark', {
            borderColor: border.layers.card2.dark,
            color: text.default.caption.dark,
          }),
        })}
      >
        <Box sx={{ flex: 1 }}>DESCRIPTION</Box>
        <Box sx={{ width: 28, textAlign: 'right' }}>QTY</Box>
        <Box sx={{ width: 52, textAlign: 'right' }}>PRICE</Box>
        <Box sx={{ width: 60, textAlign: 'right' }}>AMOUNT</Box>
      </Stack>

      {INVOICE_LINES.map((line) => (
        <Stack direction="row" key={line.id} sx={{ gap: 1, pt: 0.25 }}>
          <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            {line.itemNo + '  ' + line.description}
          </Box>
          <Box sx={{ width: 28, textAlign: 'right' }}>{line.quantity}</Box>
          <Box sx={{ width: 52, textAlign: 'right' }}>
            {formatAmount(line.unitPrice)}
          </Box>
          <Box sx={{ width: 60, textAlign: 'right' }}>
            {formatAmount(lineTotal(line))}
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}

/**
 * The page: the blocks on it, and a stroke around the one the selected field
 * was read from.
 *
 * The highlight is positioned in the page's own percentage coordinates, which
 * is why it survives zoom and rotation without any arithmetic of its own - it
 * is inside the thing being transformed.
 */
function DocumentPage({
  page,
  highlight,
}: {
  page: number;
  highlight?: DocumentBlock;
}) {
  const blocks = DOCUMENT_BLOCKS.filter((block) => block.page === page);

  return (
    <Box
      sx={(theme) => ({
        position: 'relative',
        width: PAGE_WIDTH_PX,
        height: PAGE_HEIGHT_PX,
        flexShrink: 0,
        overflow: 'hidden',
        backgroundColor: surface.layers.page.light,
        border: '1px solid',
        borderColor: border.layers.card2.light,
        ...theme.applyStyles('dark', {
          backgroundColor: surface.layers.page.dark,
          borderColor: border.layers.card2.dark,
        }),
      })}
    >
      {blocks.length === 0 ? (
        <Stack
          sx={{
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            px: 4,
          }}
        >
          <Typography variant="caption" color="text.secondary" align="center">
            {'Page ' + page + ' - nothing was extracted from this page'}
          </Typography>
        </Stack>
      ) : (
        blocks.map((block) => (
          <Box
            key={block.id}
            sx={{
              position: 'absolute',
              left: block.x + '%',
              top: block.y + '%',
              width: block.w + '%',
            }}
          >
            <Block block={block} />
          </Box>
        ))
      )}

      {highlight && highlight.page === page && (
        <Box
          aria-hidden
          sx={(theme) => ({
            position: 'absolute',
            left: highlight.x + '%',
            top: highlight.y + '%',
            width: highlight.w + '%',
            height: highlight.h + '%',
            margin: -HIGHLIGHT_INSET_PX + 'px',
            padding: HIGHLIGHT_INSET_PX + 'px',
            borderRadius: 0.5,
            border: HIGHLIGHT_WIDTH_PX + 'px solid',
            borderColor: border.primary.focus.light,
            ...theme.applyStyles('dark', {
              borderColor: border.primary.focus.dark,
            }),
          })}
        />
      )}
    </Box>
  );
}

/**
 * The viewer: a page under a toolbar.
 *
 * Zoom and rotation are one transform on the page rather than a re-layout, so
 * the box the page occupies has to be computed - a quarter turn swaps its two
 * dimensions, and without that the scroll area would reserve the wrong space
 * and clip a rotated page.
 *
 * The design draws the three toolbar clusters as joined segmented controls with
 * a shared border. Atoms has no segmented action group - ToggleButton groups
 * are for selection, and these are actions - so they are separate IconButtons
 * with the reading between them.
 */
function DocumentPane({
  page,
  onPageChange,
  highlight,
}: {
  page: number;
  onPageChange: (page: number) => void;
  highlight?: DocumentBlock;
}) {
  const [zoomIndex, setZoomIndex] = React.useState(DEFAULT_ZOOM_INDEX);
  const [rotation, setRotation] = React.useState(0);

  const zoom = ZOOM_STEPS[zoomIndex] || 1;
  const quarter = ((rotation % 360) + 360) % 360;
  const swapped = quarter === 90 || quarter === 270;
  const boxWidth = (swapped ? PAGE_HEIGHT_PX : PAGE_WIDTH_PX) * zoom;
  const boxHeight = (swapped ? PAGE_WIDTH_PX : PAGE_HEIGHT_PX) * zoom;

  return (
    <Stack
      sx={(theme) => ({
        width: DOC_PANE_WIDTH_PX,
        flexShrink: 0,
        minHeight: 0,
        backgroundColor: surface.layers.card3.light,
        ...theme.applyStyles('dark', {
          backgroundColor: surface.layers.card3.dark,
        }),
      })}
    >
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          p: 2,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: boxWidth,
            height: boxHeight,
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform:
                'translate(-50%, -50%) rotate(' +
                quarter +
                'deg) scale(' +
                zoom +
                ')',
            }}
          >
            <DocumentPage page={page} highlight={highlight} />
          </Box>
        </Box>
      </Box>

      <Divider />

      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          px: 3,
          py: 1.5,
          flexShrink: 0,
        }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
          <IconButton
            variant="secondary"
            appearance="outline"
            size="sm"
            aria-label="Zoom out"
            disabled={zoomIndex === 0}
            onClick={() => setZoomIndex((index) => Math.max(0, index - 1))}
          >
            <MagnifyingGlassMinusIcon size={NAVBAR_META_ICON_PX} />
          </IconButton>
          <Typography
            variant="caption"
            sx={{ minWidth: 40, textAlign: 'center' }}
          >
            {Math.round(zoom * 100) + '%'}
          </Typography>
          <IconButton
            variant="secondary"
            appearance="outline"
            size="sm"
            aria-label="Zoom in"
            disabled={zoomIndex === ZOOM_STEPS.length - 1}
            onClick={() =>
              setZoomIndex((index) => Math.min(ZOOM_STEPS.length - 1, index + 1))
            }
          >
            <MagnifyingGlassPlusIcon size={NAVBAR_META_ICON_PX} />
          </IconButton>
        </Stack>

        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
          <IconButton
            variant="secondary"
            appearance="outline"
            size="sm"
            aria-label="Rotate left"
            onClick={() => setRotation((value) => value - QUARTER_TURN_DEG)}
          >
            <ArrowCounterClockwiseIcon size={NAVBAR_META_ICON_PX} />
          </IconButton>
          <IconButton
            variant="secondary"
            appearance="outline"
            size="sm"
            aria-label="Rotate right"
            onClick={() => setRotation((value) => value + QUARTER_TURN_DEG)}
          >
            <ArrowClockwiseIcon size={NAVBAR_META_ICON_PX} />
          </IconButton>
        </Stack>

        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
          <IconButton
            variant="secondary"
            appearance="outline"
            size="sm"
            aria-label="Previous page"
            disabled={page === 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
          >
            <CaretLeftIcon size={NAVBAR_META_ICON_PX} />
          </IconButton>
          <Typography
            variant="caption"
            sx={{ minWidth: 48, textAlign: 'center' }}
          >
            <Box component="span" sx={DIGITS}>
              {page}
            </Box>
            {' of '}
            <Box component="span" sx={DIGITS}>
              {DOCUMENT.pages}
            </Box>
          </Typography>
          <IconButton
            variant="secondary"
            appearance="outline"
            size="sm"
            aria-label="Next page"
            disabled={page === DOCUMENT.pages}
            onClick={() => onPageChange(Math.min(DOCUMENT.pages, page + 1))}
          >
            <CaretRightIcon size={NAVBAR_META_ICON_PX} />
          </IconButton>
        </Stack>
      </Stack>
    </Stack>
  );
}

/* ----------------------------------------------------------- the fields */

/**
 * A field's value, as read.
 *
 * Money is reprinted through the Currency field's own prefix rather than shown
 * as typed, so a corrected currency reaches every amount on the screen and the
 * three money rows cannot disagree about what they are denominated in.
 */
function ValueText({
  field,
  value,
  currency,
}: {
  field: ExtractedField;
  value: string;
  currency: string;
}) {
  if (value.trim() === '') {
    return (
      <Typography variant="body2" color="text.secondary">
        Not found
      </Typography>
    );
  }

  if (field.kind === 'money') {
    const parsed = parseMoney(value);
    return (
      <Box component="span" sx={DIGITS}>
        {parsed === null ? value : formatMoney(parsed, currency)}
      </Box>
    );
  }

  if (field.key === 'vendorCode' || field.key === 'vendorTaxId') {
    return (
      <Box component="span" sx={DIGITS}>
        {value}
      </Box>
    );
  }

  return <Box component="span">{value}</Box>;
}

/**
 * The metadata tab: two columns, Field and Value, as the design draws it.
 *
 * A flagged row holds an input rather than text. That is the same information
 * the design carries with a tint and a leading bar, spent on the control
 * instead - the row the screen is asking about is the row you can already type
 * in, so nobody has to discover that the cell is editable to fix the thing the
 * alert just named. Any other row becomes an input when it is clicked, because
 * extraction is the stage that corrects the document's fields and a screen that
 * can only edit its own complaints is not that stage.
 */
function MetadataTab({
  values,
  issues,
  selected,
  editing,
  currency,
  onSelect,
  onEdit,
  onChange,
  onCommit,
}: {
  values: Record<string, string>;
  issues: Issue[];
  selected: string | null;
  editing: string | null;
  currency: string;
  onSelect: (key: string) => void;
  onEdit: (key: string | null) => void;
  onChange: (key: string, value: string) => void;
  onCommit: () => void;
}) {
  const flagged = flaggedFields(issues);

  return (
    <TableContainer sx={{ height: '100%', overflow: 'auto' }}>
      <Table size="sm" sx={{ minWidth: DETAILS_TABLE_MIN_PX }}>
        <TableHead>
          <TableRow>
            <TableCell sx={[labelCell, { width: DETAILS_COLS.field }]}>
              Field
            </TableCell>
            <TableCell sx={labelCell}>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {EXTRACTED_FIELDS.map((field) => {
            const value = values[field.key] || '';
            const isFlagged = flagged.has(field.key);
            const isEditing = editing === field.key;
            const showInput = isFlagged || isEditing;

            return (
              <TableRow
                key={field.key}
                hover
                selected={selected === field.key}
                // The row state, not a fill mixed at the call site. The design
                // tints the value cell alone; TableRow models the state on the
                // row, and taking the component's version keeps one vocabulary
                // across this screen and the matching one.
                state={isFlagged ? 'error' : 'default'}
                onClick={() => onSelect(field.key)}
                // One height whether the row holds a value or an input, so
                // swapping one for the other cannot step the column below it.
                sx={{ height: ROW_HEIGHT_PX }}
              >
                {/* th scope="row" because that is what this column is: the name
                    of the row rather than one of its values. The design draws it
                    with the header cell's own fill, which says the same. */}
                <TableCell component="th" scope="row" sx={labelCell}>
                  {field.label}
                  {field.required && (
                    <Box component="span" sx={requiredMark}>
                      {' *'}
                    </Box>
                  )}
                </TableCell>
                <TableCell
                  sx={{ whiteSpace: 'normal' }}
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelect(field.key);
                    onEdit(field.key);
                  }}
                >
                  {showInput ? (
                    <Stack
                      direction="row"
                      sx={{ alignItems: 'center', gap: 1.5, minWidth: 0 }}
                    >
                      <TextField
                        value={value}
                        sx={{
                          width: VALUE_INPUT_WIDTH_PX,
                          flexShrink: 0,
                          maxWidth: '100%',
                        }}
                        // The hint goes in the placeholder, which is the one
                        // place it costs no row height and shows exactly when
                        // it is wanted - an empty field.
                        placeholder={
                          field.hint ||
                          (field.kind === 'money' ? '0.00' : 'Not found')
                        }
                        status={isFlagged ? 'error' : undefined}
                        autoFocus={isEditing}
                        onChange={(event) =>
                          onChange(field.key, event.target.value)
                        }
                        // A flagged row shows its input without being clicked,
                        // so it can also be reached by tabbing to it - and then
                        // the keystroke that resolves the issue would unflag the
                        // row and take the input out from under the caret. This
                        // claims the row on focus, by whatever route.
                        onFocus={() => onEdit(field.key)}
                        onBlur={onCommit}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === 'Escape') {
                            onCommit();
                          }
                        }}
                        startAdornment={
                          field.kind === 'money' ? (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              component="span"
                            >
                              {currencyPrefix(currency)}
                            </Typography>
                          ) : undefined
                        }
                      />
                    </Stack>
                  ) : (
                    <ValueText field={field} value={value} currency={currency} />
                  )}
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
 * The lines, and what they come to.
 *
 * They are here because they are the second way to reach the figure the header
 * is missing. The footer states its own subtotal and whether that agrees with
 * the net currently in the field - a verdict the tab can give on its own,
 * rather than another entry in the alert above the other tab.
 */
function LineItemsTab({
  values,
  currency,
  onSelectLines,
}: {
  values: Record<string, string>;
  currency: string;
  onSelectLines: () => void;
}) {
  const subtotal = lineSubtotal(INVOICE_LINES);
  const reconciles = linesReconcile(values, INVOICE_LINES);
  const net = parseMoney(values.netAmount || '');

  return (
    <Stack sx={{ height: '100%', minHeight: 0 }}>
      <TableContainer sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <Table size="sm" sx={{ minWidth: LINE_TABLE_MIN_PX }}>
          <TableHead>
            <TableRow>
              <TableCell sx={[labelCell, { width: LINE_COLS.itemNo }]}>
                Item No.
              </TableCell>
              <TableCell sx={labelCell}>Description</TableCell>
              <TableCell sx={[labelCell, { width: LINE_COLS.qty }]}>
                Qty
              </TableCell>
              <TableCell sx={labelCell} align="right">
                Unit Price
              </TableCell>
              <TableCell sx={labelCell} align="right">
                Line Total
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {INVOICE_LINES.map((line) => (
              <TableRow key={line.id} hover onClick={onSelectLines}>
                <TableCell>
                  <Box component="span" sx={CODE_INK}>
                    {line.itemNo}
                  </Box>
                </TableCell>
                <TableCell sx={{ whiteSpace: 'normal' }}>
                  {line.description}
                </TableCell>
                <TableCell>
                  <Box component="span" sx={DIGITS}>
                    {line.quantity}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box component="span" sx={DIGITS}>
                    {formatAmount(line.unitPrice)}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box component="span" sx={DIGITS}>
                    {formatAmount(lineTotal(line))}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider />

      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          gap: 2,
          px: 3,
          py: 2,
          flexShrink: 0,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {'Total line items: ' +
            INVOICE_LINES.length +
            ' - quantity ' +
            lineQuantity(INVOICE_LINES)}
        </Typography>

        <Box sx={{ flex: 1 }} />

        <Typography variant="body2">
          {'Line items total '}
          <Box component="span" sx={DIGITS}>
            {formatMoney(subtotal, currency)}
          </Box>
        </Typography>

        {/* Three answers, not two: before the net is captured the lines have
            nothing to agree or disagree with, and calling that a failure would
            put a second complaint on screen for one missing field. */}
        <Chip
          size="sm"
          variant={
            reconciles === null ? 'secondary' : reconciles ? 'success' : 'error'
          }
          label={
            reconciles === null
              ? 'Net not captured yet'
              : reconciles
                ? 'Matches the net'
                : 'Net says ' + formatMoney(net || 0, currency)
          }
        />
      </Stack>
    </Stack>
  );
}

/* ------------------------------------------------------------- the screen */

export default function ExtractionScreen() {
  const [values, setValues] =
    React.useState<Record<string, string>>(EXTRACTED_VALUES);
  const [tab, setTab] = React.useState('metadata');
  const [selected, setSelected] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [proceeded, setProceeded] = React.useState(false);
  const [navOpen, setNavOpen] = React.useState(false);
  const [belowBar, setBelowBar] = React.useState<HTMLElement | null>(null);

  /**
   * Which region of the page is outlined.
   *
   * Held apart from the selected row rather than derived from it, because the
   * two are not the same thing: a line item points at the grid without being a
   * field, and a field that was read from nothing selects its row while
   * outlining nothing at all.
   */
  const [highlightId, setHighlightId] = React.useState<string | null>(null);

  const issues = issuesFor(values, INVOICE_LINES);
  const currency = values.currency || '';
  const highlight = DOCUMENT_BLOCKS.find((block) => block.id === highlightId);

  /**
   * Selecting a field outlines the region it was read from and turns to that
   * page.
   *
   * The link is the point of putting the document beside the fields at all: a
   * reader checking a value against the page should not also have to find the
   * page. A field that was read from nothing clears the outline instead of
   * pointing somewhere plausible - the absence is the answer, and this is the
   * screen where two fields have it.
   */
  const selectField = (key: string) => {
    setSelected(key);
    const field = EXTRACTED_FIELDS.find((candidate) => candidate.key === key);
    const block = field ? blockFor(field) : undefined;
    setHighlightId(block ? block.id : null);
    if (block) setPage(block.page);
  };

  return (
    <Stack sx={{ height: FRAME_HEIGHT_PX, overflow: 'hidden' }}>
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
          Extraction
        </NavbarTitle>

        <Box sx={{ flex: 1 }} />

        <Stack direction="row" sx={{ gap: ACTION_GAP, flexShrink: 0 }}>
          {/* The frame paints this label with a primary-to-purple gradient.
              Atoms has no gradient type and no assistant variant, so it is a
              stock outline button. */}
          <Button
            variant="secondary"
            appearance="outline"
            size="sm"
            startIcon={<StarFourIcon />}
          >
            Ask Neo
          </Button>
          <Button variant="error" appearance="contained" size="sm">
            Reject
          </Button>
          <Tooltip
            title={
              proceeded
                ? 'Already sent on to matching'
                : issues.length > 0
                  ? issues.length === 1
                    ? 'One issue to resolve first'
                    : issues.length + ' issues to resolve first'
                  : ''
            }
          >
            <Button
              size="sm"
              endIcon={<ArrowRightIcon size={NAVBAR_META_ICON_PX} />}
              disabled={issues.length > 0 || proceeded}
              onClick={() => setProceeded(true)}
            >
              Proceed
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
        <AppRail
          collapsed
          showBrand={false}
          showUser={false}
          nav={WORKFLOW_NAV}
          secondaryNav={WORKFLOW_SECONDARY_NAV}
        />

        <DocumentPane
          page={page}
          onPageChange={setPage}
          highlight={highlight}
        />

        <Stack
          sx={(theme) => ({
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            borderLeft: '1px solid',
            borderColor: border.layers.card2.light,
            ...theme.applyStyles('dark', {
              borderColor: border.layers.card2.dark,
            }),
          })}
        >
          <Stack sx={{ px: 3, pt: 2, gap: 2, flexShrink: 0 }}>
            <Typography variant="h5">Extracted data</Typography>

            {issues.length > 0 && (
              <Alert
                severity="error"
                floating
                title={
                  issues.length === 1
                    ? '1 issue found'
                    : issues.length + ' issues found'
                }
              >
                {/* A count, then the issues under it as a list. Set as the
                    alert's message so the component owns the colour and the
                    glyph; the list markup is content. */}
                <Box
                  component="ul"
                  sx={{ m: 0, pl: 2.25, display: 'grid', gap: 0.25 }}
                >
                  {issues.map((issue) => (
                    <li key={issue.key}>{issue.message}</li>
                  ))}
                </Box>
              </Alert>
            )}

            {proceeded && (
              <Alert severity="success" floating>
                Extraction confirmed. This invoice is now with matching.
              </Alert>
            )}
          </Stack>

          <Tabs
            value={tab}
            onChange={(_event, value) => setTab(value)}
            sx={{ px: 3, flexShrink: 0 }}
          >
            {/* Every issue this screen can raise is about a header field, so
                only one tab ever carries a count. A count on both would imply
                the lines can be wrong on their own, and they cannot be - they
                multiply out, and the one thing they are checked against lives
                on the other tab. */}
            <Tab
              value="metadata"
              label="Metadata"
              count={issues.length > 0 ? issues.length : undefined}
            />
            <Tab value="lines" label="Line items" />
          </Tabs>

          <Box sx={{ flex: 1, minHeight: 0 }}>
            {tab === 'metadata' ? (
              <MetadataTab
                values={values}
                issues={issues}
                selected={selected}
                editing={editing}
                currency={currency}
                onSelect={selectField}
                onEdit={setEditing}
                onChange={(key, value) =>
                  setValues((previous) => ({ ...previous, [key]: value }))
                }
                onCommit={() => setEditing(null)}
              />
            ) : (
              <LineItemsTab
                values={values}
                currency={currency}
                onSelectLines={() => {
                  const block = DOCUMENT_BLOCKS.find(
                    (candidate) => candidate.id === 'lines'
                  );
                  setSelected(null);
                  setHighlightId('lines');
                  if (block) setPage(block.page);
                }}
              />
            )}
          </Box>
        </Stack>

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
