'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

import { Alert } from '@/src/components/Alert';
import { Button } from '@/src/components/Button';
import { Card, CardContent } from '@/src/components/Card';
import { Checkbox } from '@/src/components/Checkbox';
import { Chip } from '@/src/components/Chip';
import { Divider } from '@/src/components/Divider';
import { IconButton } from '@/src/components/IconButton';
import {
  NAVBAR_META_ICON_PX,
  Navbar,
  NavbarTitle,
} from '@/src/components/Navbar';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@/src/components/Table';
import { Tab, Tabs } from '@/src/components/Tabs';
import { TextField } from '@/src/components/TextField';
import { Tooltip } from '@/src/components/Tooltip';
import { Typography } from '@/src/components/Typography';
import { icon, surface, text } from '@/src/tokens';
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
} from '@/src/icons';

// The workflow rail and the main menu behind the hamburger, the same strip the
// ERP posting screen mounts. Imported rather than redrawn: two copies of one
// navigation drift apart, and this is one workflow.
import {
  AppRail,
  WORKFLOW_NAV,
  WORKFLOW_SECONDARY_NAV,
} from '../../../components/drawer/_components/AppRail';
import {
  ACKNOWLEDGEMENTS_TO_REMEMBER,
  Digits,
  GRN_RECEIPTS,
  HEADER_META,
  INVOICE_LINES,
  Index,
  META_FIELDS,
  Money,
  TOLERANCE,
  acknowledgementsFor,
  allocatedFor,
  candidatesFor,
  documentVariance,
  fieldsDiffer,
  formatAmount,
  formatAmountGap,
  formatMoney,
  formatQuantityGap,
  invoiceQuantity,
  invoiceTotal,
  isRemembered,
  lineResolved,
  metaFieldResolved,
  statusFor,
  sumLines,
  sumQuantity,
  sumTotal,
  varianceFor,
  withinTolerance,
} from './matchingRecord';

import type { Theme } from '@mui/material/styles';
import type { TableRowState } from '@/src/components/Table';
import type { ModeToken } from '@/src/tokens';
import type {
  GrnReceipt,
  InvoiceLine,
  MatchStatus,
  MetaField,
} from './matchingRecord';

/** Tall enough for both panels, a page of receipts and the summary bar. */
const FRAME_HEIGHT_PX = 900;

/**
 * How wide each panel's table insists on being before its container scrolls.
 *
 * A docs column is not a 1440px page, and squeezing seven columns into half of
 * one turns every description into a five-line paragraph. The table keeps the
 * width it needs and the container scrolls, which is what the real screen does
 * at a narrow viewport too.
 */
const INVOICE_TABLE_MIN_PX = 520;
const GRN_TABLE_MIN_PX = 520;

/**
 * Fixed column widths, and why the tables are laid out fixed at all.
 *
 * `TableCell` is `white-space: nowrap` on purpose — a wrapping cell pushes its
 * row taller than its neighbours and the table stops reading as a grid — so
 * under automatic layout the description column claims its full text width and
 * pushes the money columns off the panel. Fixed layout gives every column the
 * width named here and hands the remainder to the description, which then
 * clips. `TableCell`'s own note names truncation as the long-text variant.
 *
 * Widths go on the header cells because fixed layout reads the first row only.
 */
const TABLE_LAYOUT = { tableLayout: 'fixed' } as const;

/**
 * The two column sets, at the widths the design sets them.
 *
 * The invoice panel's checkbox cell is 64 and holds two 16px glyphs — the match
 * status and the row's own checkbox — which is why it is wider than a checkbox
 * column normally is.
 *
 * The last two money columns are flex in both panels rather than the 156 the
 * GRN header fixes them at: 776px of fixed columns will not fit a panel that is
 * half of a docs page, and the design's own subtotal row leaves those same two
 * columns flexible, so it is not consistent about it either.
 */
const INVOICE_COLS = {
  check: 64,
  itemNo: 80,
  description: 150,
  qty: 70,
} as const;

const GRN_COLS = {
  check: 64,
  poNo: 100,
  grnNo: 80,
  description: 150,
  qty: 70,
} as const;

/** Clip rather than wrap, per `TableCell`'s own note on long text. */
const truncate = { overflow: 'hidden', textOverflow: 'ellipsis' } as const;

/**
 * The description column, which is the one column here that is prose.
 *
 * `TableCell` is `white-space: nowrap` by default and its own JSDoc names the
 * two ways out: truncate, or say so — `sx={{ whiteSpace: 'normal' }}` paired
 * with a width. The design wraps these to two and three lines inside 150px, so
 * this takes the second way out. Rows then vary in height, which is what the
 * design draws and what the row height being a floor rather than a ceiling
 * allows.
 */
const wrap = { whiteSpace: 'normal' } as const;

const DETAILS_TABLE_MIN_PX = 720;

/**
 * The field column's width, and the invoice column's.
 *
 * 250 for the field names, as the design sets it. The invoice column is held
 * at a readable width rather than splitting the remainder evenly with the PO
 * column, because the PO column also carries the row's decision — see the
 * header cells.
 */
const DETAILS_COLS = { field: 250, invoice: 320 } as const;

/**
 * The label column, and the header strip above it.
 *
 * One treatment for both, because the design gives them one: the same tinted
 * fill and the same quiet ink run across the header row and down the first
 * column, which is what makes that column read as a list of row names rather
 * than as a third value. `TableHead` draws no fill of its own — it is a bare
 * 32px label strip — so the fill is set here, on the cells, which is additive
 * rather than an override of anything the component decided.
 */
const labelCell = (theme: Theme) => ({
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
 * Drawn in `text/error/2` because that is what the design draws, and this is
 * markup the pattern owns rather than a component's. Note the inconsistency it
 * leaves with the ERP posting screen, where the same mark on a `TextField`
 * takes the label's own ink: `TextField` draws that asterisk itself and
 * recolouring it would have meant reaching inside. Two frames now ask for
 * required marks in error ink, which makes it the component's to change rather
 * than a thing to keep settling per screen.
 */
const Required = styled('span')(({ theme }) => ({
  color: text.error.caption.light,
  ...theme.applyStyles('dark', { color: text.error.caption.dark }),
}));

/** Gap between the trailing actions, as `PageHeaderBar` sets it. */
const ACTION_GAP = 1.5;

/** Glyph size, as the design draws these three. */
const STATUS_ICON_PX = 16;

/**
 * The status glyph, and the ink it takes.
 *
 * The ink comes from `icon`, not `text`. The two groups hold the same values on
 * every accent role today, so nothing about the pixels turns on the choice —
 * but they already differ on `default.subtle` and `disabled.onColor`, and a
 * glyph that follows the text ramp would silently move the day design splits
 * another rung. Every component that colours a glyph reads `icon` (`Progress`,
 * `ToggleButton`, `Stepper`, `Accordion`), and this is a glyph.
 *
 * The rung is the design's own, per role rather than one rule for all three:
 * `icon/success/4` and `icon/error/4` are the `onColorHover` rung, and
 * `icon/warning/3` is `accent`. That is not an inconsistency — the yellow ramp
 * runs light-to-dark where green and red run dark-to-light, so its fourth rung
 * (`#fedb5c`) would be invisible against a white row. The rule is the rung that
 * reads on the surface, which is a different rung per ramp.
 *
 * Three of the four are circles because they are outcomes of the same test.
 * `accepted` is deliberately not: it is a person's decision rather than a match,
 * so it takes a different shape as well as a different colour.
 */
const STATUS_MARKS: Record<
  MatchStatus,
  {
    icon: React.ReactNode;
    tone: ModeToken;
    label: string;
    help: string;
    row: TableRowState;
  }
> = {
  matched: {
    icon: <CheckCircleIcon weight="fill" size={STATUS_ICON_PX} />,
    tone: icon.success.onColorHover,
    label: 'Matched',
    help: 'Quantity and amount both agree with the receipts allocated to this line',
    row: 'success',
  },
  probable: {
    icon: <QuestionIcon weight="fill" size={STATUS_ICON_PX} />,
    tone: icon.warning.accent,
    label: 'Probable',
    help: 'Receipts found for this item, but they do not add up to the line',
    // No fill. The design's own State axis on `table-rows` has six values and
    // none of them is a warning, so a tint here would be a rung invented at a
    // call site — the glyph and the group's own subtotal carry it instead.
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
    // check passing, and `success` would say the second thing.
    row: 'default',
  },
};

/**
 * The design's own placeholder for an item number a line does not have — the
 * freight line, which is a service and has no catalogue code.
 */
const EMPTY_ITEM_NO = '—';

/**
 * The status glyph on a row.
 *
 * A glyph rather than a fill, because three of the four statuses would want
 * one and `TableRowState` has two. Colouring an icon is not restyling a
 * component — the icon takes `currentColor` and this sets the colour from the
 * token — where a warning fill on a row would mean inventing a third row
 * state at the call site.
 */
function StatusMark({ status }: { status: MatchStatus }) {
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

/**
 * A panel's title strip: what the panel holds, and the two ways to narrow it.
 *
 * The search field replaces the icon that opened it rather than appearing
 * beside it, so the strip does not grow a row when you start typing.
 */
function PanelHeader({
  title,
  query,
  onQueryChange,
  searchLabel,
  children,
}: {
  title: string;
  query: string;
  onQueryChange: (value: string) => void;
  searchLabel: string;
  children?: React.ReactNode;
}) {
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
          {/* The design sets this at 14px in the body ink — full strength,
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

/** Whether a row survives the panel's search box. */
function matchesQuery(haystack: readonly string[], query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (needle === '') return true;
  return haystack.some((value) => value.toLowerCase().includes(needle));
}

/* --------------------------------------------------------- invoice details */

/**
 * One field's status cell: what has been decided about a difference, and the
 * one action that can decide it.
 *
 * The counter is the point. A difference acknowledged twice before is one the
 * vendor makes every month, and the third acknowledgement is what stops the
 * question being asked again — so the count is shown before the click, not
 * after, or the user cannot tell that this click is the one that matters.
 */
function FieldDecision({
  field,
  acknowledged,
  onAcknowledge,
}: {
  field: MetaField;
  acknowledged: ReadonlySet<string>;
  onAcknowledge: (key: string) => void;
}) {
  if (!fieldsDiffer(field)) return null;

  if (!field.acknowledgeable) {
    return (
      <Tooltip title="An amount or an identifier that disagrees with the purchase order means one of the two documents was read wrong. That is fixed in extraction, not waved through here.">
        <Chip size="sm" variant="error" label="Fix in extraction" />
      </Tooltip>
    );
  }

  if (isRemembered(field, acknowledged)) {
    return (
      <Tooltip title="Acknowledged three times, so it is saved. The next invoice from this vendor will match this field automatically.">
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
        label={
          'Acknowledged · ' + count + ' of ' + ACKNOWLEDGEMENTS_TO_REMEMBER
        }
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
 * The metadata comparison: the invoice's own header fields against the
 * purchase order's, one row each.
 *
 * Two value columns rather than one column and a diff, because the reader is
 * deciding which of two documents to believe and both have to be legible to do
 * that. Three columns in total, as the design draws it — the decision goes
 * inside the PO cell rather than into a fourth column of its own, which puts
 * the action beside the value it is about instead of at the far edge of a
 * 1400px row.
 */
function InvoiceDetailsTab({
  acknowledged,
  onAcknowledge,
}: {
  acknowledged: ReadonlySet<string>;
  onAcknowledge: (key: string) => void;
}) {
  return (
    <TableContainer sx={{ height: '100%', overflow: 'auto' }}>
      <Table size="sm" sx={{ minWidth: DETAILS_TABLE_MIN_PX }}>
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
                // settled — eleven green rows would make the three red ones
                // harder to find, not easier.
                state={differs && !resolved ? 'error' : 'default'}
              >
                {/* `th scope="row"` because the design draws this column with
                    its header cell, and that is what the column is: the name
                    of the row rather than one of its two values. */}
                <TableCell component="th" scope="row" sx={labelCell}>
                  {field.label}
                  {field.required && <Required> *</Required>}
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

/* -------------------------------------------------------------- line items */

/**
 * One invoice line.
 *
 * The leading cell holds two 16px glyphs, as the design draws it: the match
 * status, then the row's own checkbox. The checkbox is the decision — it opens
 * ticked on a line that matched and clear on one that did not, so ticking an
 * unmatched line is a person saying it is payable anyway. That is why there is
 * no separate Accept button: the design's own control already asks the
 * question.
 */
function InvoiceRow({
  line,
  status,
  selected,
  onSelect,
  onToggleAccept,
}: {
  line: InvoiceLine;
  status: MatchStatus;
  selected: boolean;
  onSelect: () => void;
  onToggleAccept: () => void;
}) {
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
        <Index>{line.id}</Index>
      </TableCell>
      {/* The item code and the description in one string, separated by a
          middot, as the design writes it. */}
      <TableCell sx={{ width: INVOICE_COLS.description, ...wrap }}>
        {line.itemNo === EMPTY_ITEM_NO
          ? line.description
          : line.itemNo + ' · ' + line.description}
      </TableCell>
      <TableCell sx={{ width: INVOICE_COLS.qty }}>
        <Digits>{line.quantity}</Digits>
      </TableCell>
      <TableCell align="right">
        <Money>{formatAmount(line.unitPrice)}</Money>
      </TableCell>
      <TableCell align="right">
        <Money>{formatAmount(line.lineTotal)}</Money>
      </TableCell>
    </TableRow>
  );
}

/** One goods receipt, and the checkbox that allocates it. */
function ReceiptRow({
  receipt,
  allocated,
  selected,
  onToggle,
}: {
  receipt: GrnReceipt;
  allocated: boolean;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <TableRow selected={selected}>
      <TableCell sx={{ width: GRN_COLS.check }} align="right">
        <Checkbox
          checked={allocated}
          onChange={onToggle}
          aria-label={'Allocate ' + receipt.grnNo + ' to ' + receipt.lineId}
        />
      </TableCell>
      {/* A tag, as the design draws the purchase order reference — it is the
          one value on the row that names a document rather than describing
          this one. */}
      <TableCell sx={{ width: GRN_COLS.poNo }}>
        <Chip size="sm" variant="secondary" label={receipt.poNo} />
      </TableCell>
      <TableCell sx={{ width: GRN_COLS.grnNo }}>
        <Index>{receipt.grnNo}</Index>
      </TableCell>
      <TableCell sx={{ width: GRN_COLS.description, ...wrap }}>
        {receipt.description}
      </TableCell>
      <TableCell sx={{ width: GRN_COLS.qty }}>
        <Digits>{receipt.quantity}</Digits>
      </TableCell>
      <TableCell align="right">
        <Money>{formatAmount(receipt.unitPrice)}</Money>
      </TableCell>
      <TableCell align="right">
        <Money>{formatAmount(receipt.lineTotal)}</Money>
      </TableCell>
    </TableRow>
  );
}

/**
 * The row that closes a group: what the allocation adds up to, and how far
 * that is from the invoice line it is allocated to.
 *
 * The two gaps are named separately because they are different problems. The
 * right quantity at the wrong money is a pricing dispute; the right money at
 * the wrong quantity is a short delivery.
 */
function GroupTotalRow({
  line,
  allocatedRows,
}: {
  line: InvoiceLine;
  allocatedRows: readonly GrnReceipt[];
}) {
  const gap = varianceFor(line, allocatedRows);
  const balanced = gap.quantity === 0 && Math.abs(gap.amount) <= TOLERANCE;

  return (
    <TableRow state={balanced ? 'success' : 'error'}>
      <TableCell />
      <TableCell />
      <TableCell />
      {/* "Total" in the description column, where the design puts it, with the
          invoice line it totals against beside it — the design leaves that
          implicit and relies on the row's position in the group. */}
      <TableCell sx={wrap} secondary={'against ' + line.id}>
        <Typography variant="body2" weight="semibold">
          Total
        </Typography>
      </TableCell>
      {/* The two gaps stack under the figures they are about, as the design
          places them: the quantity delta under the quantity, the money delta
          under the money. `secondary` is `TableCell`'s own second line. */}
      <TableCell secondary={formatQuantityGap(gap.quantity) || undefined}>
        <Typography variant="body2" weight="semibold">
          <Digits>{sumQuantity(allocatedRows)}</Digits>
        </Typography>
      </TableCell>
      <TableCell />
      <TableCell
        align="right"
        secondary={formatAmountGap(gap.amount) || undefined}
      >
        <Typography variant="body2" weight="semibold">
          <Money>{formatMoney(sumTotal(allocatedRows))}</Money>
        </Typography>
      </TableCell>
    </TableRow>
  );
}

/* ------------------------------------------------------------ the summary */

/** One side of the comparison: a label, a figure, and what it is made of. */
function SummaryStat({
  label,
  amount,
  detail,
}: {
  label: string;
  amount: number;
  detail: string;
}) {
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

/**
 * The matching screen: the invoice on the left, the goods receipts on the
 * right, and one question at the bottom.
 *
 * Everything the screen says is derived from two sets held in state — which
 * receipts are allocated, and which lines have been accepted. No status, count
 * or variance is stored, because a checkbox has to change all three in the
 * paint it was clicked in.
 */
export function MatchingPreview() {
  const [tab, setTab] = React.useState<'details' | 'lines'>('lines');
  const [navOpen, setNavOpen] = React.useState(false);
  const [belowBar, setBelowBar] = React.useState<HTMLElement | null>(null);

  const [allocated, setAllocated] = React.useState<ReadonlySet<string>>(
    () =>
      new Set(
        GRN_RECEIPTS.filter((receipt) => receipt.allocated).map(
          (receipt) => receipt.id
        )
      )
  );
  const [accepted, setAccepted] = React.useState<ReadonlySet<string>>(
    () => new Set<string>()
  );
  const [acknowledged, setAcknowledged] = React.useState<ReadonlySet<string>>(
    () => new Set<string>()
  );

  const [selectedLineId, setSelectedLineId] = React.useState(
    INVOICE_LINES[0].id
  );
  const [invoiceQuery, setInvoiceQuery] = React.useState('');
  const [grnQuery, setGrnQuery] = React.useState('');
  const [allocatedOnly, setAllocatedOnly] = React.useState(false);
  const [validated, setValidated] = React.useState(false);

  function toggleReceipt(id: string) {
    setAllocated((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addTo(
    set: ReadonlySet<string>,
    key: string
  ): ReadonlySet<string> {
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
  function toggleAccepted(id: string) {
    setAccepted((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Every status, recomputed from the allocation. The panels, the tab counts
  // and the gate below all read this one list.
  const statuses = INVOICE_LINES.map((line) => ({
    line,
    status: statusFor(
      line,
      allocatedFor(GRN_RECEIPTS, line.id, allocated),
      accepted
    ),
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
    receipts: candidatesFor(GRN_RECEIPTS, line.id).filter(
      (receipt) =>
        (!allocatedOnly || allocated.has(receipt.id)) &&
        matchesQuery(
          [receipt.lineId, receipt.poNo, receipt.grnNo, receipt.description],
          grnQuery
        )
    ),
    allocatedRows: allocatedFor(GRN_RECEIPTS, line.id, allocated),
  })).filter((group) => group.receipts.length > 0);

  const billed = invoiceTotal(INVOICE_LINES);
  const allocatedReceipts = GRN_RECEIPTS.filter((receipt) =>
    allocated.has(receipt.id)
  );
  const received = sumTotal(allocatedReceipts);
  const gap = documentVariance(
    INVOICE_LINES,
    GRN_RECEIPTS,
    allocated,
    accepted
  );
  const balanced = withinTolerance(gap);
  const waived = INVOICE_LINES.filter((line) => accepted.has(line.id));
  const blocked = openLines.length > 0 || openFields.length > 0;

  return (
    <Stack
      sx={{
        height: FRAME_HEIGHT_PX,
        overflow: 'hidden',
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
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

        <Stack direction="row" sx={{ gap: ACTION_GAP, flexShrink: 0 }}>
          {/* The frame paints this label with a primary-to-purple gradient.
              Atoms has no gradient type and no assistant variant, so it is a
              stock outline button — see the gaps section on the docs page. */}
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
        <AppRail
          collapsed
          showBrand={false}
          showUser={false}
          nav={WORKFLOW_NAV}
          secondaryNav={WORKFLOW_SECONDARY_NAV}
        />

        <Stack sx={{ flex: 1, minWidth: 0, minHeight: 0 }}>
          {/* The counts are the reason there are two tabs rather than one long
              page: each says how much of its own half is still open, so the
              user can see the work behind the tab they are not looking at. */}
          <Tabs
            value={tab}
            onChange={(_event, value: 'details' | 'lines') => setTab(value)}
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
              {/* The invoice: one row per line, and the question each row
                  asks. Clicking a line is what points the panel beside it. */}
              <Stack sx={{ flex: 1, minWidth: 0, minHeight: 0 }}>
                <PanelHeader
                  title="INVOICE"
                  query={invoiceQuery}
                  onQueryChange={setInvoiceQuery}
                  searchLabel="Search invoice lines"
                />

                <TableContainer sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                  <Table
                    size="sm"
                    sx={{ minWidth: INVOICE_TABLE_MIN_PX, ...TABLE_LAYOUT }}
                  >
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
                        <TableCell
                          sx={[labelCell, { width: INVOICE_COLS.qty }]}
                        >
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
                            <Digits>{invoiceQuantity(INVOICE_LINES)}</Digits>
                          </Typography>
                        </TableCell>
                        <TableCell sx={labelCell} />
                        <TableCell align="right" sx={labelCell}>
                          <Typography variant="body2" weight="semibold">
                            <Money>{formatMoney(billed)}</Money>
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
                  candidate for. The checkbox is the allocation, and the row
                  that closes each group is what it adds up to. */}
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
                      <FunnelIcon
                        weight={allocatedOnly ? 'fill' : 'regular'}
                      />
                    </IconButton>
                  </Tooltip>
                </PanelHeader>

                <TableContainer sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                  <Table
                    size="sm"
                    sx={{ minWidth: GRN_TABLE_MIN_PX, ...TABLE_LAYOUT }}
                  >
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
                            <Digits>{sumQuantity(allocatedReceipts)}</Digits>
                          </Typography>
                        </TableCell>
                        <TableCell sx={labelCell} />
                        <TableCell align="right" sx={labelCell}>
                          <Typography variant="body2" weight="semibold">
                            <Money>{formatMoney(received)}</Money>
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider />
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {'Total receipts: ' +
                      GRN_RECEIPTS.length +
                      ' · ' +
                      allocatedReceipts.length +
                      ' allocated'}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          )}

          <Divider />

          {/* The one question, under both panels rather than inside either:
              it is about the document, and neither half of the comparison
              owns the answer. */}
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
                ' lines · ' +
                invoiceQuantity(INVOICE_LINES) +
                ' qty'
              }
            />

            <Stack sx={{ alignItems: 'center', gap: 0.5 }}>
              <ArrowsLeftRightIcon size={20} />
              <Chip
                size="sm"
                variant="secondary"
                label={'Tolerance: ± ' + formatMoney(TOLERANCE)}
              />
            </Stack>

            <SummaryStat
              label="GRN"
              amount={received}
              detail={
                allocatedReceipts.length +
                ' receipts · ' +
                sumQuantity(allocatedReceipts) +
                ' qty'
              }
            />

            <Divider orientation="vertical" flexItem />

            {/* The frame draws this as a green-bordered status card. Atoms has
                no tinted card, so the surface is a stock `Card` and the
                verdict is the `Chip` inside it. */}
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
                          ? 'GRN + ' + formatMoney(sumLines(waived)) + ' accepted'
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
