/**
 * The invoices feature's public API.
 *
 * Everything outside this folder imports from `@/features/invoices` and
 * nothing deeper; oxlint enforces it. Export only what a page needs, so
 * the inside can be reorganised without breaking anyone.
 */
export { InvoicesTable } from './components/InvoicesTable';
export { invoiceKeys, invoicesListQuery, useInvoices } from './api/invoiceQueries';
export { INVOICE_STATUS_LABEL, totalOutstanding } from './model/invoice';
export type { Invoice, InvoiceStatus } from './model/invoice';
