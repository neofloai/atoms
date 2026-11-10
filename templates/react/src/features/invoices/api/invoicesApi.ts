import { http } from '@/shared/api/httpClient';
import { mockResponse } from '@/shared/api/mockResponse';
import { env } from '@/shared/config/env';

import { INVOICES_MOCK } from '../mocks/invoices.mock';
import type { Invoice } from '../model/invoice';

/**
 * The feature's transport: plain async functions, one per endpoint.
 *
 * The mock branch lives here and nowhere else. When the real API lands,
 * this file changes and nothing that calls it does.
 */
export function listInvoices(signal?: AbortSignal): Promise<Invoice[]> {
  if (env.useMocks) return mockResponse([...INVOICES_MOCK], signal);
  return http.get<Invoice[]>('/invoices', { signal });
}
