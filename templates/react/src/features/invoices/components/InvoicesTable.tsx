import { DataGrid, Tag } from '@neofloai/atoms';
import type { GridColDef, TagVariant } from '@neofloai/atoms';

import { formatCurrency, formatDate } from '@/shared/lib/format';

import { INVOICE_STATUS_LABEL } from '../model/invoice';
import type { Invoice, InvoiceStatus } from '../model/invoice';

const STATUS_VARIANT: Record<InvoiceStatus, TagVariant> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

const COLUMNS: GridColDef<Invoice>[] = [
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
  loading?: boolean;
}

/** Presentational: rows in, grid out. Fetching belongs to the page or a hook. */
export function InvoicesTable({ invoices, loading = false }: InvoicesTableProps) {
  return (
    <DataGrid
      size="sm"
      rows={invoices}
      columns={COLUMNS}
      loading={loading}
      rowNoun="invoices"
      pageSizeOptions={[10, 25, 50]}
      initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
    />
  );
}
