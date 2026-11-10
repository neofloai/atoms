/**
 * The invoice record, typed the way the real API will return it.
 *
 * `model/` holds a feature's types and the pure functions over them,
 * including every change to the data. No React: this is the part a real
 * project keeps when the prototype becomes one.
 */
export type InvoiceStatus = 'pending' | 'approved' | 'rejected';

export interface Invoice {
  id: string;
  number: string;
  vendor: string;
  /** ISO date, `YYYY-MM-DD`. */
  issuedOn: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
}

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

/**
 * The same invoices with one moved to a new status.
 *
 * Every change to the data is a function like this: invoices in, new
 * invoices out. The feature's provider only calls it.
 */
export function withStatus(
  invoices: readonly Invoice[],
  id: string,
  status: InvoiceStatus,
): Invoice[] {
  return invoices.map((invoice) => (invoice.id === id ? { ...invoice, status } : invoice));
}

export function totalOutstanding(invoices: readonly Invoice[]): number {
  return invoices
    .filter((invoice) => invoice.status === 'pending')
    .reduce((sum, invoice) => sum + invoice.amount, 0);
}
