/**
 * The invoice record, typed the way the API returns it.
 *
 * `model/` holds a feature's types and the pure functions over them. No
 * React, no fetching: this is the part that unit-tests without a DOM.
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

export function totalOutstanding(invoices: readonly Invoice[]): number {
  return invoices
    .filter((invoice) => invoice.status === 'pending')
    .reduce((sum, invoice) => sum + invoice.amount, 0);
}
