import { queryOptions, useQuery } from '@tanstack/react-query';

import { listInvoices } from './invoicesApi';

/**
 * Query keys for the feature, built in one place.
 *
 * Every key starts with the feature name, so invalidating
 * `invoiceKeys.all` refreshes everything the feature has cached and
 * nothing it does not.
 */
export const invoiceKeys = {
  all: ['invoices'] as const,
  list: () => [...invoiceKeys.all, 'list'] as const,
};

export const invoicesListQuery = () =>
  queryOptions({
    queryKey: invoiceKeys.list(),
    queryFn: ({ signal }) => listInvoices(signal),
  });

export function useInvoices() {
  return useQuery(invoicesListQuery());
}
