'use client';

import * as React from 'react';
import { styled } from '@mui/material/styles';

import { Avatar } from '@/src/components/Avatar';
import { Button } from '@/src/components/Button';
import { Chip } from '@/src/components/Chip';
import { IconButton } from '@/src/components/IconButton';
import {
  ArrowSquareOutIcon,
  PaperclipIcon,
  UploadSimpleIcon,
} from '@/src/icons';
import { text, typography } from '@/src/tokens';

import { INVOICES, initials, money } from '../../table/_components/records';

import type { GridColDef } from '@mui/x-data-grid';
import type { InvoiceRecord } from '../../table/_components/records';

/** The glyph size the design's cells use. */
const CELL_ICON_PX = 16;

/** A row, with the real `Date` a sortable, filterable column needs. */
export interface GridInvoice extends InvoiceRecord {
  readonly received: Date;
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/**
 * A fixed day format, rather than `toLocaleDateString`.
 *
 * The page renders on the server first, and Node's locale data is not
 * necessarily the browser's — a date formatted twice by two different ICU
 * builds is a hydration mismatch. Spelling the format out removes the
 * question.
 */
function formatDay(value: Date): string {
  return `${value.getDate()} ${MONTHS[value.getMonth()]} ${value.getFullYear()}`;
}

/**
 * Enough rows to page through, grown from the six the table's previews
 * use so the two pages show the same records.
 *
 * Deterministic on purpose: the amounts and dates are functions of the
 * index rather than random, so the server and the browser render the same
 * grid and a screenshot of it is worth comparing.
 */
export const GRID_ROWS: readonly GridInvoice[] = Array.from(
  { length: 42 },
  (_unused, index) => {
    const base = INVOICES[index % INVOICES.length];
    const number = 1008 - index;

    return {
      ...base,
      id: `inv-${number}`,
      reference: `#${number}`,
      vendorRef: `inv-mds${1203 - index * 3}`,
      amount: Math.round(base.amount * (1 + (index % 7) / 11) * 100) / 100,
      received: new Date(2026, 1, 14, 21, 38 - index * 7),
    };
  }
);

/** Vertically centred, because a grid cell centres one line with `line-height`. */
const Stack = styled('span')({
  display: 'flex',
  alignItems: 'center',
  gap: CELL_ICON_PX / 2,
  minWidth: 0,
  lineHeight: 'normal',
});

const Lines = styled('span')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  minWidth: 0,
  lineHeight: `${typography.body.b1.leading}px`,
});

const Secondary = styled('span')(({ theme }) => ({
  fontSize: typography.body.b2.size,
  lineHeight: `${typography.body.b2.leading}px`,
  color: text.default.placeholder.light,
  ...theme.applyStyles('dark', { color: text.default.placeholder.dark }),
}));

/**
 * The table's two-line cell, rebuilt in a `renderCell`.
 *
 * `TableCell` has `icon` and `secondary` as props; a grid has one seam for
 * cell content instead, so the geometry is written here. Two things it has
 * to undo, both consequences of how a grid centres a row: the cell's
 * `line-height` is the row's full height, which a nested block inherits,
 * and its content is a single line by default.
 */
function RecordCell({
  icon,
  primary,
  secondary,
}: {
  icon?: React.ReactNode;
  primary: React.ReactNode;
  secondary?: React.ReactNode;
}) {
  return (
    <Stack>
      {icon}
      <Lines>
        {primary}
        {secondary != null && <Secondary>{secondary}</Secondary>}
      </Lines>
    </Stack>
  );
}

RecordCell.displayName = 'RecordCell';

/**
 * The six columns of the assembled Figma table (node 3223:61897), as
 * column definitions.
 *
 * Every one is an answer to the same question the table page asks — what
 * goes in a cell? — and the answer is the same: whatever you render. What
 * changes is that a grid wants to know what the value *is* as well as how
 * it looks, which is what `type` is for: it picks the comparator, the
 * filter operators and the wording of the sort menu, so `amount` sorts
 * numerically and `received` chronologically rather than as text.
 */
export const RECORD_COLUMNS: GridColDef<GridInvoice>[] = [
  {
    field: 'reference',
    headerName: 'Invoice',
    width: 148,
    renderCell: ({ row }) => (
      <RecordCell
        icon={<UploadSimpleIcon size={CELL_ICON_PX} />}
        primary={row.reference}
        secondary={formatDay(row.received)}
      />
    ),
  },
  {
    field: 'vendor',
    headerName: 'Vendor',
    flex: 1,
    minWidth: 120,
    renderCell: ({ row }) => (
      <RecordCell primary={row.vendor} secondary={row.vendorRef} />
    ),
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 116,
    sortable: false,
    renderCell: ({ row }) => (
      <Chip size="sm" variant={row.statusVariant} label={row.status} />
    ),
  },
  {
    field: 'attachment',
    headerName: 'Attachment',
    width: 152,
    renderCell: ({ row }) => (
      <RecordCell
        icon={<PaperclipIcon size={CELL_ICON_PX} />}
        primary={row.attachment}
      />
    ),
  },
  {
    field: 'amount',
    headerName: 'Amount',
    type: 'number',
    width: 112,
    valueFormatter: (value: number) => money(value),
  },
  {
    field: 'actions',
    headerName: 'Action',
    width: 172,
    align: 'right',
    headerAlign: 'right',
    sortable: false,
    filterable: false,
    renderCell: ({ row }) => (
      <Stack sx={{ justifyContent: 'flex-end', gap: '4px' }}>
        <Button appearance="outline" variant="secondary" size="sm">
          Review
        </Button>
        <IconButton
          variant="secondary"
          appearance="text"
          size="sm"
          aria-label={`Open ${row.reference} in a new tab`}
        >
          <ArrowSquareOutIcon />
        </IconButton>
      </Stack>
    ),
  },
];

/** The three column types whose sort menus Figma words differently. */
export const TYPED_COLUMNS: GridColDef<GridInvoice>[] = [
  { field: 'vendor', headerName: 'Vendor', flex: 1, minWidth: 180 },
  {
    field: 'received',
    headerName: 'Received',
    type: 'date',
    width: 160,
    valueFormatter: (value: Date) => formatDay(value),
  },
  {
    field: 'amount',
    headerName: 'Amount',
    type: 'number',
    width: 150,
    valueFormatter: (value: number) => money(value),
  },
];

/** A person column, for the row-state preview. */
export const OWNER_COLUMNS: GridColDef<GridInvoice>[] = [
  { field: 'reference', headerName: 'Invoice', width: 120 },
  {
    field: 'owner',
    headerName: 'Owner',
    flex: 1,
    minWidth: 200,
    renderCell: ({ row }) => (
      <RecordCell
        icon={<Avatar size="sm">{initials(row.owner)}</Avatar>}
        primary={row.owner}
        secondary={row.ownerRole}
      />
    ),
  },
  {
    field: 'amount',
    headerName: 'Amount',
    type: 'number',
    width: 150,
    valueFormatter: (value: number) => money(value),
  },
];
