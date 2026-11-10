import { useContext } from 'react';

import { InvoicesContext } from './invoicesContext';
import type { InvoicesState } from './invoicesContext';

/** The invoices, and what can be done to them. Works only inside `InvoicesProvider`. */
export function useInvoices(): InvoicesState {
  const state = useContext(InvoicesContext);
  if (!state) {
    throw new Error(
      'useInvoices must be used inside <InvoicesProvider>, which is mounted in app/providers/AppProviders.tsx.',
    );
  }
  return state;
}
