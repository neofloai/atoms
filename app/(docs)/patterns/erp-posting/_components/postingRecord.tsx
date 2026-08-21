'use client';

import { styled } from '@mui/material/styles';

import { fontFamilies, text, typography } from '@/src/tokens';

/**
 * The record the ERP posting screen posts: an invoice that has already been
 * extracted, matched and validated, plus the extra fields the posting itself
 * needs.
 *
 * This is the last stage of the invoice processing workflow, and the only one
 * where the user is writing rather than checking. Extraction asks "did we read
 * it right", matching asks "does it agree with the PO" — both are reviews of
 * something the machine produced. Posting asks for values that exist nowhere
 * upstream, because they belong to the accounting system rather than to the
 * document.
 *
 * That is why the fields split two ways below, and the split is the screen.
 */

/* ------------------------------------------------------------ the header */

/**
 * Where a header field's value came from, which decides whether this screen
 * can change it.
 *
 * `carried` is what extraction and matching established. It is read-only here
 * not because it is unimportant — three of the four are required — but
 * because changing an amount at the point of posting would mean changing the
 * invoice, and the two screens before this one exist to do that.
 *
 * `posting` is what the ERP needs and no upstream stage supplies. These are
 * the fields the user is here to fill.
 *
 * The frame does not draw this distinction: every field in it takes
 * placeholder ink, and the two fills that do vary (`card 1` against `card 3`)
 * land on `Ref Key (Head) 2` and `Assignment` — two fields that hold the same
 * `Label Text` stub — so the variation is instance state left behind rather
 * than a state model. The split here comes from what the screen is for.
 */
export type FieldOrigin = 'carried' | 'posting';

export interface HeaderField {
  readonly key: string;
  readonly label: string;
  readonly origin: FieldOrigin;
  /**
   * Whether the posting fails without it. Independent of `origin`: a carried
   * field can be required and still not be editable here, which is not a
   * contradiction — it is a precondition. A missing PO number blocks the post
   * and sends you back a stage rather than giving you a box to type in.
   */
  readonly required?: boolean;
  /** What the field holds now. Empty for a posting field nobody has filled. */
  readonly value: string;
  /** Shown when `value` is empty. */
  readonly placeholder?: string;
}

/**
 * The invoice's own totals, as extracted. Both are read off the document, so
 * neither is this screen's to compute — which is the whole reason the variance
 * below means anything.
 */
export const STATED_NET = 1583.74;
export const STATED_GROSS = 1862.09;

export const HEADER_META = {
  ticket: '#345',
  vendor: 'Nike Sales',
  date: '05 Jun 2025',
} as const;

/* --------------------------------------------------------- the line items */

/** A tax code, as the ERP names it. */
export interface TaxCode {
  readonly value: string;
  readonly label: string;
}

export const VAT_CODES: readonly TaxCode[] = [
  { value: 'IGST 5', label: 'IGST 5' },
  { value: 'IGST 12', label: 'IGST 12' },
  { value: 'IGST 18', label: 'IGST 18' },
  { value: 'IGST 28', label: 'IGST 28' },
];

export const WHT_CODES: readonly TaxCode[] = [
  { value: 'TDS 1%', label: 'TDS 1%' },
  { value: 'TDS 2%', label: 'TDS 2%' },
  { value: 'TDS 3%', label: 'TDS 3%' },
  { value: 'TDS 5%', label: 'TDS 5%' },
];

export interface LineItem {
  readonly id: number;
  readonly description: string;
  /**
   * Quantity and unit price are on the row even though neither has a column,
   * because the accounting check multiplies them. A screen that shows only the
   * total cannot tell you *why* a total is wrong, and "should be $100.00, not
   * $120.00" is the only form of that message a person can act on.
   */
  readonly quantity: number;
  readonly unitPrice: number;
  /** What the invoice claims for the line — not necessarily qty × unit. */
  readonly lineTotal: number;
  readonly vatCode: string;
  readonly whtCode: string;
}

/**
 * Ten lines, and line 3 does not add up: 5 × $20.00 billed as $120.00.
 *
 * Planted on purpose, and arithmetically real rather than a flag on the row —
 * the simulate pass below finds it by multiplying, the same way the accounting
 * check does. Every other line multiplies out exactly, so the variance the
 * header shows is caused by this one row and clears when it is fixed.
 */
export const LINE_ITEMS: readonly LineItem[] = [
  {
    id: 1,
    description: 'Steel Toe Boots',
    quantity: 1,
    unitPrice: 125,
    lineTotal: 125,
    vatCode: 'IGST 12',
    whtCode: 'TDS 2%',
  },
  {
    id: 2,
    description: 'Reflective Safety Vest',
    quantity: 7,
    unitPrice: 6.5,
    lineTotal: 45.5,
    vatCode: 'IGST 18',
    whtCode: 'TDS 1%',
  },
  {
    id: 3,
    description: 'Cut Resistant Gloves',
    quantity: 5,
    unitPrice: 20,
    lineTotal: 120,
    vatCode: 'IGST 12',
    whtCode: 'TDS 2%',
  },
  {
    id: 4,
    description: 'Industrial Ear Muffs',
    quantity: 4,
    unitPrice: 16.75,
    lineTotal: 67,
    vatCode: 'IGST 5',
    whtCode: 'TDS 3%',
  },
  {
    id: 5,
    description: 'Welding Face Shield',
    quantity: 3,
    unitPrice: 70.25,
    lineTotal: 210.75,
    vatCode: 'IGST 18',
    whtCode: 'TDS 2%',
  },
  {
    id: 6,
    description: 'Nitrile Gloves (Box)',
    quantity: 2,
    unitPrice: 16,
    lineTotal: 32,
    vatCode: 'IGST 12',
    whtCode: 'TDS 1%',
  },
  {
    id: 7,
    description: 'Fall Harness Kit',
    quantity: 1,
    unitPrice: 389.99,
    lineTotal: 389.99,
    vatCode: 'IGST 28',
    whtCode: 'TDS 5%',
  },
  {
    id: 8,
    description: 'Dust Respirator N95',
    quantity: 5,
    unitPrice: 3.7,
    lineTotal: 18.5,
    vatCode: 'IGST 5',
    whtCode: 'TDS 1%',
  },
  {
    id: 9,
    description: 'Fire Retardant Coverall',
    quantity: 4,
    unitPrice: 68.75,
    lineTotal: 275,
    vatCode: 'IGST 18',
    whtCode: 'TDS 3%',
  },
  {
    id: 10,
    description: 'Safety Helmet Class E',
    quantity: 10,
    unitPrice: 32,
    lineTotal: 320,
    vatCode: 'IGST 12',
    whtCode: 'TDS 2%',
  },
];

export const HEADER_FIELDS: readonly HeaderField[] = [
  {
    key: 'poNumber',
    label: 'PO Number',
    origin: 'carried',
    required: true,
    value: 'PO-0004',
  },
  {
    key: 'amountBeforeVat',
    label: 'Amount before VAT',
    origin: 'carried',
    required: true,
    value: '$ 1,583.74',
  },
  {
    key: 'amountAfterVat',
    label: 'Total amount after VAT',
    origin: 'carried',
    required: true,
    value: '$ 1,862.09',
  },
  {
    key: 'referenceNumber',
    label: 'Reference Number',
    origin: 'posting',
    required: true,
    value: 'NL202603018039',
  },
  {
    key: 'text',
    label: 'Text',
    origin: 'posting',
    required: true,
    value: 'NL202603018039',
  },
  {
    key: 'refKeyHead1',
    label: 'Ref Key (Head) 1',
    origin: 'posting',
    value: '',
    placeholder: 'Enter Ref Key (head) 1',
  },
  {
    key: 'refKeyHead2',
    label: 'Ref Key (Head) 2',
    origin: 'posting',
    value: '',
    placeholder: 'Enter Ref Key (head) 2',
  },
  {
    key: 'assignment',
    label: 'Assignment',
    origin: 'posting',
    value: '',
    placeholder: 'Enter assignment',
  },
  {
    key: 'docHeader',
    label: 'Doc Header',
    origin: 'posting',
    value: 'Adyen Processing fee',
  },
  {
    key: 'refKey2',
    label: 'Ref Key 2',
    origin: 'posting',
    value: '',
    placeholder: 'Enter Ref Key 2',
  },
];

/* ------------------------------------------------------------- the checks */

/**
 * What a simulate pass turns up.
 *
 * `error` is the ERP refusing: the post will not go until it is dealt with.
 * `advisory` is the ERP telling you something about how it will post — worth
 * reading, not worth blocking on. One list rather than two, because the user
 * asked one question and the answer is "here is everything I found"; the
 * severity is a property of each finding, not of a separate panel.
 */
export type FindingSeverity = 'error' | 'advisory';

export interface Finding {
  readonly id: string;
  readonly severity: FindingSeverity;
  readonly message: string;
  /** The line it belongs to, when it belongs to one. */
  readonly lineId?: number;
  /** What the value becomes if the user takes the fix. */
  readonly fix?: number;
}

/** Two decimals, and no floating-point residue in the comparison. */
export function money(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * `$1,583.74` — an amount inside a sentence.
 *
 * No space after the mark, unlike the form fields, which write `$ 1,583.74`
 * as the frame does. A field has a whole box to itself and the gap reads as
 * alignment; the same gap mid-sentence reads as a typo.
 */
export function formatMoney(value: number): string {
  return (
    '$' +
    value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/** `1,583.74`, signed — the variance field, which has no currency mark. */
export function formatVariance(value: number): string {
  const rounded = money(value);
  const sign = rounded < 0 ? '-' : '';
  return (
    sign +
    Math.abs(rounded).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/** Sum of what the lines claim. */
export function lineSum(lines: readonly LineItem[]): number {
  return money(lines.reduce((total, line) => total + line.lineTotal, 0));
}

/**
 * The one number this screen computes: what the invoice says it is worth,
 * less what its lines add up to.
 *
 * Zero is the only acceptable answer, which is what makes it a check rather
 * than a field. It is also why the variance box is read-only — a variance you
 * could type into would be a number you had agreed with rather than one the
 * accounting agreed with.
 */
export function variance(lines: readonly LineItem[]): number {
  return money(STATED_NET - lineSum(lines));
}

/**
 * The accounting check, then the ERP's own rules.
 *
 * The order is the order the user asked for them in: simulate checks the
 * arithmetic first, because a line that does not multiply out makes every
 * downstream answer meaningless, and only then reports what the ERP would
 * say about a post it agrees with numerically.
 */
export function simulate(lines: readonly LineItem[]): readonly Finding[] {
  const findings: Finding[] = [];

  for (const line of lines) {
    const expected = money(line.quantity * line.unitPrice);
    if (expected !== money(line.lineTotal)) {
      findings.push({
        id: 'line-' + line.id,
        severity: 'error',
        message:
          'Line ' +
          line.id +
          ': ' +
          line.quantity +
          ' × ' +
          formatMoney(line.unitPrice) +
          ' should be ' +
          formatMoney(expected) +
          ', not ' +
          formatMoney(line.lineTotal),
        lineId: line.id,
        fix: expected,
      });
    }
  }

  // The variance is only worth its own finding when the lines above do not
  // already account for it. A line that bills 5 × $20.00 as $120.00 *is* the
  // $20.00 gap, so reporting both would say one thing twice — and the second
  // saying would be the one with no row to act on.
  const gap = variance(lines);
  if (gap !== 0 && findings.length === 0) {
    findings.push({
      id: 'variance',
      severity: 'error',
      message:
        'Amount before VAT is ' +
        formatMoney(STATED_NET) +
        ' but the lines add up to ' +
        formatMoney(lineSum(lines)) +
        ' — a variance of ' +
        formatVariance(gap),
    });
  }

  // The ERP's rule, not ours: it applies whatever the numbers do, so it is
  // reported every time rather than only on a clean pass. An advisory that
  // appeared only once the errors were gone would read as a consequence of
  // fixing them.
  findings.push({
    id: 'wht',
    severity: 'advisory',
    message: 'Vendor is subject to WHT deduction',
  });

  return findings;
}

/** Whether anything found would stop the post. */
export function isBlocked(findings: readonly Finding[]): boolean {
  return findings.some((finding) => finding.severity === 'error');
}

/* --------------------------------------------------------------- ink bits */

/**
 * The line number, and the totals. Both are read down a column rather than
 * across a row, so both are set in mono: an index you scan for "line 3" and
 * a figure you compare against its neighbours are the same kind of reading,
 * and proportional digits defeat both.
 */
export const Digits = styled('span')({
  fontFamily: fontFamilies.product.mono,
});

/** The index cell — present, and quieter than the description beside it. */
export const Index = styled('span')(({ theme }) => ({
  fontFamily: fontFamilies.product.mono,
  fontSize: typography.body.b2.size,
  color: text.default.placeholder.light,
  ...theme.applyStyles('dark', { color: text.default.placeholder.dark }),
}));

/**
 * A money cell: the currency mark in caption ink, the digits in mono, both
 * pushed right so the decimal points line up down the column.
 */
export const Money = styled('span')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 2,
  width: '100%',
  lineHeight: 'normal',
});

/** Identical on every row, so it stays out of the way of what is not. */
export const Currency = styled('span')(({ theme }) => ({
  color: text.default.placeholder.light,
  ...theme.applyStyles('dark', { color: text.default.placeholder.dark }),
}));
