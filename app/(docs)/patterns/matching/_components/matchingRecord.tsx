'use client';

import { styled } from '@mui/material/styles';

import { fontFamilies, text, typography } from '@/src/tokens';

/**
 * The record the matching screen checks: an invoice that has been read, set
 * against the goods receipts booked against its purchase orders.
 *
 * This is the third stage of the invoice processing workflow. Extraction asked
 * whether the document was read correctly; this asks whether what was read
 * agrees with what was ordered and what arrived. Nothing here edits the
 * invoice — the two answers this screen produces are an *allocation* (which
 * receipts satisfy which line) and a *decision* (a difference someone has
 * agreed to live with).
 *
 * The numbers below are internally consistent, which the frame's placeholder
 * copy is not: it heads a set of lines summing to ~$29k with a $5,500 total
 * and calls the result Balanced. On a screen whose entire job is catching that
 * exact class of error, stub totals would be the bug shown as the feature. So
 * every line multiplies out, every receipt group sums, and the variance is
 * derived. Two of the frame's own line totals settled a disagreement in its
 * own data — see `GRN_RECEIPTS`.
 */

/* ------------------------------------------------------- the two documents */

/** One line of the invoice: what the vendor says it is billing for. */
export interface InvoiceLine {
  readonly id: string;
  readonly itemNo: string;
  readonly description: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly lineTotal: number;
}

/**
 * One goods receipt line: a quantity of one item, booked against one purchase
 * order on the day it arrived.
 *
 * `lineId` is the invoice line this receipt is a candidate for, not a
 * confirmed link — the link is the reader's allocation, held in component
 * state. A receipt is a candidate because it is the same item under the same
 * vendor; whether it is *this* invoice's receipt is the question the screen
 * exists to answer.
 */
export interface GrnReceipt {
  readonly id: string;
  readonly lineId: string;
  readonly poNo: string;
  readonly grnNo: string;
  readonly description: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly lineTotal: number;
  /** Allocated to `lineId` when the screen opens. */
  readonly allocated: boolean;
}

/**
 * Four lines: three for goods, one for freight. The freight line is the one
 * that can never match, because a service does not arrive on a goods receipt —
 * it is here to show what the screen does with a line that has no counterpart
 * rather than as an edge case.
 */
export const INVOICE_LINES: readonly InvoiceLine[] = [
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
  {
    id: 'ILI-0005',
    itemNo: '—',
    description: 'Freight & Handling Charges',
    quantity: 1,
    unitPrice: 850.0,
    lineTotal: 850.0,
  },
];

/**
 * The receipts, and the three shapes of disagreement they set up.
 *
 * - **ILI-0001** arrives in three receipts against three different purchase
 *   orders and adds up exactly. The many-to-one is the ordinary case, not the
 *   exception: one invoice line is rarely one delivery.
 * - **ILI-0002** has three candidate receipts for a 60-unit line, and two
 *   different unit prices among them. The pair allocated on open comes to the
 *   right quantity and the wrong money, which is why quantity alone is not a
 *   match.
 * - **ILI-0003** is short until the fourth receipt is allocated.
 * - **ILI-0005** has no receipts at all.
 *
 * Where the frame's own arithmetic disagreed with its own labels, the totals
 * won. Its second ILI-0001 receipt is labelled 20 units and totalled 4,134.00,
 * which at 103.35 is 40 units — and only at 40 does the group reach the
 * 12,402.00 its subtotal row states. Likewise its 11,635 unit price on
 * ILI-0003 is 116.35 with a lost decimal point, which its own 10,471.50 line
 * total confirms.
 */
export const GRN_RECEIPTS: readonly GrnReceipt[] = [
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
    // Same item, same quantity as the receipt above, five hundredths dearer.
    // Allocated on open, which is what makes ILI-0002 read as probable.
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
    // The remainder, booked against a later PO — which is why it was not
    // allocated automatically and why the line opens short.
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

/** Ticket, vendor and date, as the header bar shows them. */
export const HEADER_META = {
  ticket: '#345',
  vendor: 'Nike Sales',
  date: '05 Jun 2025',
} as const;

/**
 * How far apart the two documents may end up and still count as agreeing.
 *
 * A rounding difference is not a dispute, and blocking on one would train the
 * user to accept everything. Five dollars against a twenty-nine thousand
 * dollar invoice, per the frame's chip.
 */
export const TOLERANCE = 5.0;

/* ---------------------------------------------------------- the metadata */

/**
 * One field compared across the invoice and the purchase order.
 *
 * `acknowledgeable` is the whole model. A difference in *how something is
 * written* — a vendor's registered name against its trading name, an address
 * with the postcode dropped — is a difference someone can accept. A difference
 * in *what is owed* is not: an amount that disagrees with the purchase order
 * means one of the two documents was read wrong, and the answer is to go back
 * and read it again, not to wave it through. So amounts and identifiers carry
 * no Acknowledge action even when they differ.
 */
export interface MetaField {
  readonly key: string;
  readonly label: string;
  readonly invoice: string;
  readonly purchaseOrder: string;
  /**
   * Whether extraction must have captured this field for the invoice to be
   * matchable at all — the mark beside the label.
   *
   * Not the same axis as `acknowledgeable`, and the two do not line up: an
   * amount is not required here (nothing downstream breaks if it is missing,
   * it just fails the comparison) while a vendor code is, and the vendor code
   * is also the more forgiving of the two about *how* it is written.
   */
  readonly required?: boolean;
  readonly acknowledgeable: boolean;
  /**
   * How many times this same difference has already been acknowledged on
   * earlier invoices from this vendor.
   *
   * Carried on the record rather than counted here, because it spans invoices:
   * the third acknowledgement is the one that stops the question being asked
   * again, and no single invoice can know it is the third.
   */
  readonly priorAcknowledgements: number;
}

/** How many acknowledgements of one field it takes to stop asking. */
export const ACKNOWLEDGEMENTS_TO_REMEMBER = 3;

/**
 * Eleven fields, in the order and under the names the design lists them, three
 * of which disagree.
 *
 * All three differences are about *how a value is written* rather than what it
 * says — a trading name against a registered one, a vendor code with and
 * without its site suffix, and terms that shift when payment is due without
 * changing what is due. That is why all three can be acknowledged. The two
 * amounts agree here, and the model says what would happen if they did not.
 *
 * The values are not the design's. Its own copy has a vendor name sitting in
 * the Payment Terms field and a tax id identical to the vendor code — stubs,
 * like the totals on the other tab — and its RM 5,450.00 agrees with neither
 * its own line items nor the ones this pattern ships. So the field *set* is the
 * design's and the values are this record's, which keeps the two tabs
 * describing one invoice: the amounts below are the line items plus tax.
 */
export const META_FIELDS: readonly MetaField[] = [
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
    // Terms change when the money moves, not how much of it does — which is
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

/** Whether the two documents say the same thing about a field. */
export function fieldsDiffer(field: MetaField): boolean {
  return field.invoice !== field.purchaseOrder;
}

/**
 * Whether a differing field still needs the reader.
 *
 * A field acknowledged on this invoice is settled. A field whose difference
 * was already remembered — three acknowledgements before this invoice ever
 * arrived — is settled too, and is the reason the memory exists.
 */
export function metaFieldResolved(
  field: MetaField,
  acknowledged: ReadonlySet<string>
): boolean {
  if (!fieldsDiffer(field)) return true;
  if (acknowledged.has(field.key)) return true;
  return field.priorAcknowledgements >= ACKNOWLEDGEMENTS_TO_REMEMBER;
}

/** Fields still waiting on the reader — the count the tab carries. */
export function unresolvedMetaFields(
  acknowledged: ReadonlySet<string>
): readonly MetaField[] {
  return META_FIELDS.filter((field) => !metaFieldResolved(field, acknowledged));
}

/**
 * Whether acknowledging this field now would be the third time, and so the
 * time it is written to memory rather than just to this invoice.
 */
export function acknowledgementsFor(
  field: MetaField,
  acknowledged: ReadonlySet<string>
): number {
  return field.priorAcknowledgements + (acknowledged.has(field.key) ? 1 : 0);
}

export function isRemembered(
  field: MetaField,
  acknowledged: ReadonlySet<string>
): boolean {
  return (
    acknowledgementsFor(field, acknowledged) >= ACKNOWLEDGEMENTS_TO_REMEMBER
  );
}

/* ------------------------------------------------------------- the match */

/**
 * What the allocation says about one invoice line.
 *
 * `probable` is the value that earns the screen: the receipts found are
 * plausibly the right ones — same item, same vendor, quantity or money close —
 * but they do not agree. A binary matched/unmatched would put it in one bucket
 * or the other and lose the only thing worth showing.
 *
 * `accepted` is not a match. It is a person deciding the difference is
 * allowed, which is a different kind of fact and is why it reads differently
 * on the row.
 */
export type MatchStatus = 'matched' | 'probable' | 'no-match' | 'accepted';

/** Two decimal places, so comparisons are of money and not of floats. */
export function money(value: number): number {
  return Math.round(value * 100) / 100;
}

/** The receipts currently allocated to one invoice line. */
export function allocatedFor(
  receipts: readonly GrnReceipt[],
  lineId: string,
  allocated: ReadonlySet<string>
): readonly GrnReceipt[] {
  return receipts.filter(
    (receipt) => receipt.lineId === lineId && allocated.has(receipt.id)
  );
}

/** Every candidate receipt for one invoice line, allocated or not. */
export function candidatesFor(
  receipts: readonly GrnReceipt[],
  lineId: string
): readonly GrnReceipt[] {
  return receipts.filter((receipt) => receipt.lineId === lineId);
}

export function sumQuantity(receipts: readonly GrnReceipt[]): number {
  return receipts.reduce((total, receipt) => total + receipt.quantity, 0);
}

export function sumTotal(receipts: readonly GrnReceipt[]): number {
  return money(
    receipts.reduce((total, receipt) => total + receipt.lineTotal, 0)
  );
}

/**
 * How the allocation for one line differs from the line itself, in both
 * dimensions the brief names.
 *
 * Quantity and money are reported separately rather than rolled into one
 * number because they fail independently and mean different things: the right
 * quantity at the wrong price is a pricing dispute, and the right price at the
 * wrong quantity is a short delivery.
 */
export interface LineVariance {
  readonly quantity: number;
  readonly amount: number;
}

export function varianceFor(
  line: InvoiceLine,
  allocated: readonly GrnReceipt[]
): LineVariance {
  return {
    quantity: sumQuantity(allocated) - line.quantity,
    amount: money(sumTotal(allocated) - line.lineTotal),
  };
}

/**
 * The status of one line, derived from its allocation every render.
 *
 * Never stored. Allocating a receipt has to change the line's status in the
 * same paint as the checkbox it was clicked in, and a status held in state is
 * one that can disagree with the numbers under it.
 */
export function statusFor(
  line: InvoiceLine,
  allocated: readonly GrnReceipt[],
  accepted: ReadonlySet<string>
): MatchStatus {
  if (accepted.has(line.id)) return 'accepted';
  if (allocated.length === 0) return 'no-match';

  const gap = varianceFor(line, allocated);
  const balanced = gap.quantity === 0 && Math.abs(gap.amount) <= TOLERANCE;

  return balanced ? 'matched' : 'probable';
}

/** Whether a line still needs the reader — the count the tab carries. */
export function lineResolved(status: MatchStatus): boolean {
  return status === 'matched' || status === 'accepted';
}

/* ------------------------------------------------------ the whole document */

export function invoiceTotal(lines: readonly InvoiceLine[]): number {
  return money(lines.reduce((total, line) => total + line.lineTotal, 0));
}

export function invoiceQuantity(lines: readonly InvoiceLine[]): number {
  return lines.reduce((total, line) => total + line.quantity, 0);
}

/** What a subset of lines comes to — the accepted ones, in practice. */
export function sumLines(lines: readonly InvoiceLine[]): number {
  return money(lines.reduce((total, line) => total + line.lineTotal, 0));
}

/**
 * What the invoice and the receipts disagree by, once the reader's decisions
 * are taken into account.
 *
 * Three terms, and the third is the interesting one. An accepted line is
 * subtracted because the reader has said it needs no receipt — freight is
 * still owed, it just never arrived on a lorry. Leaving it in would report a
 * gap the reader has already answered, which is the same mistake as reporting
 * a rounding difference: a number that can never reach zero stops being read.
 */
export function documentVariance(
  lines: readonly InvoiceLine[],
  receipts: readonly GrnReceipt[],
  allocated: ReadonlySet<string>,
  accepted: ReadonlySet<string>
): number {
  const billed = invoiceTotal(lines);
  const received = sumTotal(
    receipts.filter((receipt) => allocated.has(receipt.id))
  );
  const waived = money(
    lines
      .filter((line) => accepted.has(line.id))
      .reduce((total, line) => total + line.lineTotal, 0)
  );

  return money(billed - received - waived);
}

export function withinTolerance(variance: number): boolean {
  return Math.abs(variance) <= TOLERANCE;
}

/* ----------------------------------------------------------- how it reads */

/**
 * `12,402.00` — an amount in a column whose header already says `($)`.
 *
 * The mark is left off because the column carries it once, at the top, rather
 * than four hundred times down the page. Totals and prose use `formatMoney`.
 */
export function formatAmount(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * `$28,988.50` — an amount in a sentence, or on a total row where there is no
 * column header above it to carry the mark.
 *
 * No space after the mark, as the ERP posting pattern settled it: a field has
 * a whole box to itself and the gap reads as alignment, but the same gap
 * mid-sentence reads as a typo.
 */
export function formatMoney(value: number): string {
  return '$' + formatAmount(value);
}

/** `+$12.00` / `-$1,396.20` — a difference, with its direction. */
export function formatSignedMoney(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return sign + '$' + formatAmount(Math.abs(value));
}

/** `12 fewer received` / `2 more received` — a quantity difference. */
export function formatQuantityGap(value: number): string {
  if (value === 0) return '';
  const count = Math.abs(value);
  return count + (value > 0 ? ' more received' : ' fewer received');
}

/** `$1,396.20 below the line` / `$12.00 above the line`. */
export function formatAmountGap(value: number): string {
  if (value === 0) return '';
  const amount = formatMoney(Math.abs(value));
  return amount + (value > 0 ? ' above the line' : ' below the line');
}

/* --------------------------------------------------------------- the ink */

/** Digits that line up down a column. */
export const Digits = styled('span')({
  fontFamily: fontFamilies.product.mono,
});

/** The line-id cell — present, and quieter than the description beside it. */
export const Index = styled('span')(({ theme }) => ({
  fontFamily: fontFamilies.product.mono,
  fontSize: typography.body.b2.size,
  color: text.default.placeholder.light,
  ...theme.applyStyles('dark', { color: text.default.placeholder.dark }),
}));

/** An amount, pushed right so the decimal points line up down the column. */
export const Money = styled('span')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 2,
  width: '100%',
  fontFamily: fontFamilies.product.mono,
  lineHeight: 'normal',
});
