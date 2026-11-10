import { createContext } from 'react';

import type { Invoice } from '../model/invoice';

/** What the invoices provider hands to everything below it. */
export interface InvoicesState {
  invoices: readonly Invoice[];
  approve: (id: string) => void;
  reject: (id: string) => void;
}

/**
 * Null outside the provider, so a component rendered without it fails
 * loudly in `useInvoices` instead of quietly showing nothing.
 */
export const InvoicesContext = createContext<InvoicesState | null>(null);
