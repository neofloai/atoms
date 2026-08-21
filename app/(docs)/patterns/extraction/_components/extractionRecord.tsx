import { styled } from '@mui/material/styles';

import { text, typography } from '@/src/tokens';

/**
 * The record behind the Extraction screen: one invoice as a document, the
 * header fields a reader is being asked to confirm, and the lines under them.
 *
 * Everything the screen states is derived from this file on every render —
 * which issues are open, how many there are, whether `Proceed` may be pressed,
 * what the line items come to. Nothing is stored twice. A screen whose whole
 * job is catching what extraction got wrong cannot hold a second copy of its
 * own verdict, because the copy is what goes stale.
 *
 * The numbers are not the frame's, and this is the reason. Its metadata panel
 * states a Total Amount of RM 5,450.00 beside a Tax Amount of RM 327.00 —
 * which is exactly 6% of 5,450.00, the Malaysian service tax rate — so its
 * "Total" is a net and its own error state then asks for a missing "Total
 * Amount before VAT/GST" that is already on the screen. Both of its figures
 * are kept here and the third is added: 5,450.00 net, 327.00 tax, 5,777.00
 * gross. The frame's numbers survive, the arithmetic closes, and the field it
 * says is missing genuinely is.
 *
 * Its stub values are corrected the same way. The frame prints the vendor's
 * name in the Payment Terms row and repeats the vendor code as the tax id;
 * both are placeholders, and a screen built to compare a document against what
 * was read off it cannot ship with two fields holding the wrong kind of value.
 */

/* ------------------------------------------------------------------ record */

/** The bar's own metadata, as the frame labels it. */
export const HEADER_META = {
  ticket: '#345',
  vendor: 'Nike Sales',
  date: '05 Jun 2025',
} as const;

/** The attachment under review, and how many pages it runs to. */
export const DOCUMENT = {
  name: 'INV-1001312123.pdf',
  pages: 6,
} as const;

/* ---------------------------------------------------------------- document */

/**
 * The page, as a list of boxes.
 *
 * The frame drops a screenshot in here. A screenshot cannot be a pattern —
 * it carries no tokens, it expires with the asset URL, and nobody can copy it
 * into their own app — so the page is drawn instead, out of the same data the
 * fields are checked against. One consequence is worth the whole exercise:
 * because the document and the extraction come from one source, the region a
 * field was read from can be pointed at, and a field that was read from
 * nothing has nothing to point at.
 *
 * Boxes are percentages of the page so zoom and rotation carry them along for
 * free — a highlight is positioned in the page's own coordinates, not the
 * viewport's.
 *
 * Ids are field keys wherever a box holds exactly one field, which is what
 * makes the mapping below a lookup rather than a table.
 */
export type BlockKind = 'heading' | 'title' | 'para' | 'field' | 'grid';

export interface DocumentBlock {
  id: string;
  page: number;
  /** Percentage box on the page: left, top, width, height. */
  x: number;
  y: number;
  w: number;
  h: number;
  kind: BlockKind;
  label?: string;
  value?: string;
  lines?: readonly string[];
}

/**
 * Page one, which is where every field this screen asks about was read from —
 * except the two it could not read at all.
 *
 * Note what is not drawn: there is no subtotal line between the grid and the
 * tax. The invoice prints its lines, its tax and its total and never states
 * the net, which is why extraction has nothing to put in that field and why
 * the two figures either side of the gap are the only way to recover it.
 */
export const DOCUMENT_BLOCKS: readonly DocumentBlock[] = [
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
    lines: ['Co. Reg. 199001007138 (198708-M) · TIN C21857649050'],
  },
  { id: 'title', page: 1, x: 62, y: 5, w: 32, h: 6, kind: 'title', value: 'INVOICE' },
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

/* ------------------------------------------------------------------ fields */

/**
 * How a field is checked, which is not the same as what it holds.
 *
 * `money` is the only kind that participates in arithmetic. `reference` is the
 * only kind that is satisfied by a *sibling* — a purchase order number and a
 * goods-receipt number are alternatives, so neither row can be required on its
 * own and the rule has to sit across the pair.
 */
export type FieldKind = 'text' | 'date' | 'money' | 'reference';

export interface ExtractedField {
  key: string;
  label: string;
  kind: FieldKind;
  /** Whether the field must hold a value. Drawn as the mark after the label. */
  required?: boolean;
  /** Where on the document it was read from, if it was read at all. */
  blockId?: string;
  /** Placeholder while the field is empty. Kept short enough to fit one. */
  hint?: string;
}

/**
 * The eleven fields the frame draws, plus two.
 *
 * `grn` is added because the frame's own error copy asks for "a PO number or a
 * SES/GRN number" and draws nowhere to put the second one. An either/or rule
 * needs both of its sides on the screen, or the message names a field the
 * reader cannot reach.
 *
 * `netAmount` is added for the same reason: it is the field the frame says is
 * missing, and it was missing from the table as well as from the document.
 *
 * The three money rows are ordered net, tax, gross rather than the frame's
 * total-then-tax. With two figures the order is arbitrary; with three it is a
 * sum, and a sum reads downwards.
 */
export const EXTRACTED_FIELDS: readonly ExtractedField[] = [
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
  { key: 'invoiceNumber', label: 'Invoice Number', kind: 'text', required: true, blockId: 'invoiceNumber' },
  { key: 'invoiceDate', label: 'Invoice Date', kind: 'date', required: true, blockId: 'invoiceDate' },
  { key: 'dueDate', label: 'Due Date', kind: 'date', blockId: 'dueDate' },
  { key: 'vendorName', label: 'Vendor Name', kind: 'text', required: true, blockId: 'vendorName' },
  { key: 'vendorCode', label: 'Vendor Code', kind: 'text', required: true, blockId: 'vendorReg' },
  { key: 'vendorTaxId', label: 'Vendor Tax ID', kind: 'text', required: true, blockId: 'vendorReg' },
  { key: 'paymentTerms', label: 'Payment Terms', kind: 'text', blockId: 'paymentTerms' },
  { key: 'currency', label: 'Currency', kind: 'text', blockId: 'totalAmount' },
  {
    key: 'netAmount',
    label: 'Total Amount before VAT/GST',
    kind: 'money',
    required: true,
  },
  { key: 'taxAmount', label: 'Tax Amount', kind: 'money', blockId: 'taxAmount' },
  { key: 'totalAmount', label: 'Total Amount', kind: 'money', required: true, blockId: 'totalAmount' },
];

/** What extraction returned. Two fields it could not fill are empty strings. */
export const EXTRACTED_VALUES: Readonly<Record<string, string>> = {
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

/* --------------------------------------------------------------- line items */

export interface InvoiceLine {
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
export const INVOICE_LINES: readonly InvoiceLine[] = [
  { id: 'L-01', itemNo: 'NIKE-AF1-07', description: "Air Force 1 '07", quantity: 6, unitPrice: 389 },
  { id: 'L-02', itemNo: 'NIKE-DF-TEE', description: 'Dri-FIT Training Tee', quantity: 18, unitPrice: 89 },
  {
    id: 'L-03',
    itemNo: 'NIKE-SOCK-3P',
    description: 'Everyday Cushioned Socks (3-pack)',
    quantity: 24,
    unitPrice: 45,
  },
  { id: 'L-04', itemNo: 'FREIGHT-IN', description: 'Inbound freight', quantity: 1, unitPrice: 434 },
];

/* ------------------------------------------------------------- derivations */

/** Line total. Never stored: a quantity and a price already say it. */
export function lineTotal(line: InvoiceLine): number {
  return line.quantity * line.unitPrice;
}

/** What the lines come to. */
export function lineSubtotal(lines: readonly InvoiceLine[]): number {
  return lines.reduce((sum, line) => sum + lineTotal(line), 0);
}

/** How many units the lines cover. */
export function lineQuantity(lines: readonly InvoiceLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

/**
 * A typed amount as a number, or `null` if it is not one.
 *
 * Tolerant of what a person types into a money field — thousands separators,
 * a currency prefix, spaces — because rejecting `5,450.00` for its comma
 * would be the screen failing at the one thing it is for.
 */
export function parseMoney(value: string): number | null {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Whether a field holds anything at all. */
export function isFilled(values: Readonly<Record<string, string>>, key: string): boolean {
  return (values[key] ?? '').trim() !== '';
}

/**
 * Currency prefixes, so the amounts carry the symbol the Currency field says
 * rather than one hard-coded next to them. Change the row and the totals
 * follow, which is the behaviour a reader correcting a mis-read currency
 * expects.
 */
const CURRENCY_PREFIXES: Readonly<Record<string, string>> = {
  MYR: 'RM',
  SGD: 'S$',
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
};

export function currencyPrefix(code: string): string {
  const upper = code.trim().toUpperCase();
  return CURRENCY_PREFIXES[upper] ?? upper;
}

/** `1234.5` as `1,234.50`. */
export function formatAmount(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** The same, prefixed with whatever the Currency field currently says. */
export function formatMoney(value: number, currency: string): string {
  return currencyPrefix(currency) + ' ' + formatAmount(value);
}

/**
 * Whether the lines agree with the net that is currently in the field.
 *
 * `null` while the field is empty: the lines cannot disagree with a blank, and
 * reporting them as unreconciled before there is anything to reconcile against
 * would put a second issue on the screen for the same missing field.
 */
export function linesReconcile(
  values: Readonly<Record<string, string>>,
  lines: readonly InvoiceLine[]
): boolean | null {
  const net = parseMoney(values.netAmount ?? '');
  if (net === null) return null;
  return Math.abs(net - lineSubtotal(lines)) < 0.005;
}

/**
 * One thing wrong, the fields it is about, and the sentence the alert prints.
 *
 * `fields` is a list rather than a key because the reference rule is satisfied
 * by either of two rows, and both of them have to light up for the message to
 * make sense.
 */
export interface Issue {
  key: string;
  fields: readonly string[];
  message: string;
}

/**
 * Everything wrong with the extraction, in the order a reader should deal with
 * it: the reference first, because a document with no purchase order and no
 * goods receipt cannot be matched at all; then anything simply missing; then
 * the sums.
 *
 * The two the screen opens with are the frame's own, word for word.
 */
export function issuesFor(
  values: Readonly<Record<string, string>>,
  lines: readonly InvoiceLine[]
): readonly Issue[] {
  const issues: Issue[] = [];

  if (!isFilled(values, 'po') && !isFilled(values, 'grn')) {
    issues.push({
      key: 'reference',
      fields: ['po', 'grn'],
      message: 'Add a PO number or a SES/GRN number',
    });
  }

  for (const field of EXTRACTED_FIELDS) {
    if (!field.required || isFilled(values, field.key)) continue;
    issues.push({
      key: 'missing:' + field.key,
      fields: [field.key],
      message: field.label + ' is missing',
    });
  }

  const net = parseMoney(values.netAmount ?? '');
  const tax = parseMoney(values.taxAmount ?? '');
  const total = parseMoney(values.totalAmount ?? '');
  const currency = values.currency ?? '';

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
export function flaggedFields(issues: readonly Issue[]): ReadonlySet<string> {
  return new Set(issues.flatMap((issue) => issue.fields));
}

/** Where a field was read from, if anywhere. */
export function blockFor(field: ExtractedField): DocumentBlock | undefined {
  return DOCUMENT_BLOCKS.find((block) => block.id === field.blockId);
}

/* --------------------------------------------------------------- rendering */

/**
 * Figures line up in a column or they are not a column.
 *
 * `tabular-nums` on every digit the screen prints, so a total under a subtotal
 * has its decimal point in the same place. The tokens carry no numeric-variant
 * value — it is a property of the typeface rather than of the scale — so it is
 * set here, once, and every amount goes through one of these.
 */
const tabular = { fontVariantNumeric: 'tabular-nums' } as const;

/** A quantity or a reference number. */
export const Digits = styled('span')(tabular);

/** An amount. Right-aligned by its column, so this only fixes the digits. */
export const Money = styled('span')(tabular);

/**
 * An identifier — an item code, an invoice number, a tax id.
 *
 * Quieter ink than the value beside it, because a code is a label for a thing
 * rather than a fact about it, and at `caption` weight it stops competing with
 * the description it sits next to.
 */
export const Code = styled('span')(({ theme }) => ({
  ...tabular,
  fontSize: typography.body.b2.size,
  color: text.default.caption.light,
  ...theme.applyStyles('dark', { color: text.default.caption.dark }),
}));
