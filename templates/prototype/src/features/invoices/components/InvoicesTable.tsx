import { Button, DataGrid, Stack, Tag } from '@neofloai/atoms';
import type { GridColDef, TagVariant } from '@neofloai/atoms';
import { useMemo } from 'react';

import { formatCurrency, formatDate } from '@/shared/lib/format';

import { INVOICE_STATUS_LABEL } from '../model/invoice';
import type { Invoice, InvoiceStatus } from '../model/invoice';

const STATUS_VARIANT: Record<InvoiceStatus, TagVariant> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

const DATA_COLUMNS: GridColDef<Invoice>[] = [
  { field: 'number', headerName: 'Invoice', flex: 1, minWidth: 140 },
  { field: 'vendor', headerName: 'Vendor', flex: 1.5, minWidth: 180 },
  {
    field: 'issuedOn',
    headerName: 'Issued',
    width: 140,
    valueFormatter: (value: string) => formatDate(value),
  },
  {
    field: 'amount',
    headerName: 'Amount',
    type: 'number',
    width: 160,
    valueFormatter: (value: number, row) => formatCurrency(value, row.currency),
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 140,
    renderCell: ({ row }) => (
      <Tag variant={STATUS_VARIANT[row.status]} label={INVOICE_STATUS_LABEL[row.status]} />
    ),
  },
];

interface InvoicesTableProps {
  invoices: readonly Invoice[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

/**
 * Presentational: rows and actions in, grid out. The table does not know
 * where the data lives; the page hands it the feature's state and actions.
 * Only a pending invoice can be decided, so only its row has buttons.
 */
export function InvoicesTable({ invoices, onApprove, onReject }: InvoicesTableProps) {
  const columns = useMemo<GridColDef<Invoice>[]>(
    () => [
      ...DATA_COLUMNS,
      {
        field: 'actions',
        headerName: 'Action',
        width: 200,
        align: 'right',
        headerAlign: 'right',
        sortable: false,
        renderCell: ({ row }) =>
          row.status === 'pending' ? (
            <Stack
              direction="row"
              sx={{ height: '100%', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}
            >
              <Button variant="error" appearance="text" size="sm" onClick={() => onReject(row.id)}>
                Reject
              </Button>
              <Button
                variant="secondary"
                appearance="outline"
                size="sm"
                onClick={() => onApprove(row.id)}
              >
                Approve
              </Button>
            </Stack>
          ) : null,
      },
    ],
    [onApprove, onReject],
  );

  return (
    <DataGrid
      size="sm"
      rows={invoices}
      columns={columns}
      rowNoun="invoices"
      pageSizeOptions={[10, 25, 50]}
      initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
    />
  );
}
