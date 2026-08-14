'use client';

import * as React from 'react';

import { Button } from '@/src/components/Button';
import { Chip } from '@/src/components/Chip';
import { IconButton } from '@/src/components/IconButton';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@/src/components/Table';
import {
  ArrowSquareOutIcon,
  PaperclipIcon,
  UploadSimpleIcon,
} from '@/src/icons';

import { INVOICES, money } from './records';

import type { TableSize } from '@/src/components/Table';

/** The glyph size the design's cells use. */
const CELL_ICON_PX = 16;

/**
 * The assembled table from the Figma set (node 3223:61897), rebuilt from
 * Atoms parts.
 *
 * Every column in it is a different answer to the same question — what
 * goes in a cell? — and the answer is never a prop on the table:
 *
 *   - the reference is `icon` plus `secondary`, the two pieces of cell
 *     geometry the component does own;
 *   - the status is a `Chip` at `size="sm"`, the 20px flat tag;
 *   - the attachment is a glyph and a filename;
 *   - the amount is `align="right"`, so digits line up on their units;
 *   - the actions are a `Button` and an `IconButton`, and the row is as
 *     tall as the table's `size` says rather than as tall as they are.
 *
 * Wrapped in a `TableContainer` because six columns of records outgrow a
 * docs column before they outgrow a screen, and the container is what
 * keeps the overflow inside the table rather than in the page.
 */
export function RecordsTable({
  size = 'sm',
  rows = INVOICES.length,
}: {
  size?: TableSize;
  rows?: number;
}) {
  return (
    <TableContainer>
      <Table size={size}>
        <TableHead>
          <TableRow>
            <TableCell>Invoice</TableCell>
            <TableCell>Vendor</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Attachment</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {INVOICES.slice(0, rows).map((invoice) => (
            <TableRow key={invoice.id} hover>
              <TableCell
                icon={<UploadSimpleIcon size={CELL_ICON_PX} />}
                secondary={invoice.receivedAt}
              >
                {invoice.reference}
              </TableCell>
              <TableCell secondary={invoice.vendorRef}>
                {invoice.vendor}
              </TableCell>
              <TableCell>
                <Chip
                  size="sm"
                  variant={invoice.statusVariant}
                  label={invoice.status}
                />
              </TableCell>
              <TableCell icon={<PaperclipIcon size={CELL_ICON_PX} />}>
                {invoice.attachment}
              </TableCell>
              <TableCell align="right">{money(invoice.amount)}</TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                <Button appearance="outline" variant="secondary" size="sm">
                  Review
                </Button>
                <IconButton
                  variant="secondary"
                  appearance="text"
                  size="sm"
                  aria-label={`Open ${invoice.reference} in a new tab`}
                  sx={{ ml: 1 }}
                >
                  <ArrowSquareOutIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

RecordsTable.displayName = 'RecordsTable';
