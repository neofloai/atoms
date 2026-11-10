import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { INVOICES_MOCK } from '../mocks/invoices.mock';
import { withStatus } from '../model/invoice';
import type { Invoice } from '../model/invoice';
import { InvoicesContext } from './invoicesContext';
import type { InvoicesState } from './invoicesContext';

/**
 * Holds the feature's data for the whole prototype.
 *
 * Seeded from the mocks and mounted in `app/providers/AppProviders.tsx`,
 * above the router, so a change made on one screen is still there on the
 * next. Nothing is stored: a reload starts again from the mocks, which is
 * how a demo is reset.
 *
 * Each action only calls a pure function from `model/`; the rule for what
 * a change does lives there, not here.
 */
export function InvoicesProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<readonly Invoice[]>(INVOICES_MOCK);

  const approve = useCallback((id: string) => {
    setInvoices((current) => withStatus(current, id, 'approved'));
  }, []);

  const reject = useCallback((id: string) => {
    setInvoices((current) => withStatus(current, id, 'rejected'));
  }, []);

  const value = useMemo<InvoicesState>(
    () => ({ invoices, approve, reject }),
    [invoices, approve, reject],
  );

  return <InvoicesContext value={value}>{children}</InvoicesContext>;
}
