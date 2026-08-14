'use client';

import * as React from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Avatar } from '@/src/components/Avatar';
import { Card } from '@/src/components/Card';
import { Checkbox } from '@/src/components/Checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@/src/components/Table';

import { RecordsTable } from './RecordsTable';
import { INVOICES, initials, money } from './records';

import type { TableRowState, TableSize } from '@/src/components/Table';

/** The three densities, smallest first. */
const SIZES: readonly { size: TableSize; height: number }[] = [
  { size: 'sm', height: 48 },
  { size: 'md', height: 56 },
  { size: 'lg', height: 64 },
];

/** How tall the pinned-header preview's scroll box is. */
const STICKY_PREVIEW_HEIGHT_PX = 260;

function PreviewCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        {children}
      </Paper>
    </Stack>
  );
}

PreviewCard.displayName = 'PreviewCard';

/** The row the preview greys out, and the two it tints. */
const DISABLED_ROW = 'inv-1003';
const ROW_STATES: Record<string, TableRowState> = {
  'inv-1005': 'error',
  'inv-1004': 'success',
};

/** Rows carrying every state the design draws, in one table. */
function StatesTable() {
  const [picked, setPicked] = React.useState<readonly string[]>(['inv-1007']);

  // The disabled row is not selectable, so it is not part of "all" either.
  const selectable = INVOICES.filter((invoice) => invoice.id !== DISABLED_ROW);

  const toggle = (id: string) =>
    setPicked((current) =>
      current.includes(id)
        ? current.filter((each) => each !== id)
        : [...current, id]
    );

  const toggleAll = () =>
    setPicked((current) =>
      current.length === selectable.length
        ? []
        : selectable.map((invoice) => invoice.id)
    );

  return (
    <Table size="sm">
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              checked={picked.length === selectable.length}
              indeterminate={
                picked.length > 0 && picked.length < selectable.length
              }
              onChange={toggleAll}
              slotProps={{ input: { 'aria-label': 'Select every invoice' } }}
            />
          </TableCell>
          <TableCell>Invoice</TableCell>
          {/* Absorbs the spare width, so the selection column stays as
              narrow as its checkbox instead of taking a share of it. A
              cell's `width` is a preference; slack is otherwise spread
              across every column. */}
          <TableCell sx={{ width: '100%' }}>Owner</TableCell>
          <TableCell align="right">Amount</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {INVOICES.map((invoice) => (
          <TableRow
            key={invoice.id}
            hover
            selected={picked.includes(invoice.id)}
            state={ROW_STATES[invoice.id] ?? 'default'}
            disabled={invoice.id === DISABLED_ROW}
          >
            <TableCell padding="checkbox">
              <Checkbox
                checked={picked.includes(invoice.id)}
                onChange={() => toggle(invoice.id)}
                slotProps={{
                  input: { 'aria-label': `Select ${invoice.reference}` },
                }}
              />
            </TableCell>
            <TableCell secondary={invoice.vendorRef}>
              {invoice.reference}
            </TableCell>
            <TableCell
              icon={<Avatar size="sm">{initials(invoice.owner)}</Avatar>}
              secondary={invoice.ownerRole}
            >
              {invoice.owner}
            </TableCell>
            <TableCell align="right">{money(invoice.amount)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

StatesTable.displayName = 'StatesTable';

/** Three columns that sort, with the comparator where it belongs. */
function SortableTable() {
  const [orderBy, setOrderBy] = React.useState<
    'reference' | 'vendor' | 'amount'
  >('amount');
  const [order, setOrder] = React.useState<'asc' | 'desc'>('desc');

  const sortBy = (column: typeof orderBy) => {
    if (column === orderBy) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
      return;
    }
    setOrderBy(column);
    setOrder('asc');
  };

  const sorted = [...INVOICES].sort((left, right) => {
    const direction = order === 'asc' ? 1 : -1;

    if (orderBy === 'amount') {
      return (left.amount - right.amount) * direction;
    }

    return left[orderBy].localeCompare(right[orderBy]) * direction;
  });

  const columns = [
    { id: 'reference', label: 'Invoice', align: 'left' },
    { id: 'vendor', label: 'Vendor', align: 'left' },
    { id: 'amount', label: 'Amount', align: 'right' },
  ] as const;

  return (
    <Table size="sm">
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <TableCell
              key={column.id}
              align={column.align}
              sortDirection={orderBy === column.id ? order : false}
            >
              <TableSortLabel
                active={orderBy === column.id}
                direction={orderBy === column.id ? order : 'asc'}
                onClick={() => sortBy(column.id)}
              >
                {column.label}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {sorted.map((invoice) => (
          <TableRow key={invoice.id} hover>
            <TableCell>{invoice.reference}</TableCell>
            <TableCell>{invoice.vendor}</TableCell>
            <TableCell align="right">{money(invoice.amount)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

SortableTable.displayName = 'SortableTable';

/**
 * Five previews: the assembled design, the three densities, the row
 * states, a sortable header, and a pinned one.
 *
 * The first is the assembled table, rebuilt from Atoms parts, column for
 * column.
 */
export function TableShowcase() {
  return (
    <Stack spacing={4}>
      <PreviewCard
        title="A table of records"
        description="A table of records, rebuilt from Atoms parts: a reference with its timestamp under it, a vendor, a status Chip, an attachment, a right-aligned amount, and the row's actions. None of those columns is a prop on the table — a cell holds whatever you put in it, which is the whole reason to reach for this rather than a grid."
      >
        <RecordsTable size="sm" />
      </PreviewCard>

      <PreviewCard
        title="Three densities, one header"
        description="sm is 48, md is 56, lg is 64 — and the header strip stays 32 in all three, because it labels the columns rather than carrying data. Density is one prop on the table, so a row never disagrees with its neighbour."
      >
        <Stack spacing={4}>
          {SIZES.map(({ size, height }) => (
            <Stack key={size} spacing={1}>
              <Typography variant="caption" color="text.secondary">
                <code>size=&quot;{size}&quot;</code> — {height}px rows, 32px
                header
              </Typography>
              <RecordsTable size={size} rows={2} />
            </Stack>
          ))}
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Every state a row can be in"
        description="Tick a row and it is bracketed between two primary hairlines rather than filled more heavily — selection and hover share a surface, so the lines are what tell them apart. The two tinted rows carry state from their data: one failed validation, one passed. The last is disabled, which greys its ink and its hairline and stops it answering the pointer."
      >
        <StatesTable />
      </PreviewCard>

      <PreviewCard
        title="Columns that sort"
        description="Hover a header and the tint appears with a two-headed arrow: sortable, not sorted. The column the table is actually sorted by keeps a single arrow, visible at rest, pointing the way it went, in darker ink. The sort state and the comparator stay with the caller — this is the affordance, not the mechanism."
      >
        <SortableTable />
      </PreviewCard>

      <PreviewCard
        title="A pinned header, inside a card"
        description="stickyHeader pins against the nearest scrolling ancestor, so it needs a TableContainer with a maxHeight — on the table itself it would do nothing. The pinned row is filled to match the card it sits on; a table on some other surface should say so with sx."
      >
        <Card>
          <TableContainer sx={{ maxHeight: STICKY_PREVIEW_HEIGHT_PX }}>
            <Table size="sm" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...INVOICES, ...INVOICES].map((invoice, index) => (
                  <TableRow key={`${invoice.id}-${index}`} hover>
                    <TableCell>{invoice.reference}</TableCell>
                    <TableCell>{invoice.vendor}</TableCell>
                    <TableCell align="right">{money(invoice.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </PreviewCard>
    </Stack>
  );
}

TableShowcase.displayName = 'TableShowcase';
