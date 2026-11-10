import type { Invoice } from '../model/invoice';

/**
 * Sample rows, in the exact shape the API returns.
 *
 * Mocks live with the feature that owns them and are only ever read by
 * that feature's `api/` folder, so swapping to the real endpoint never
 * touches a component.
 */
export const INVOICES_MOCK: readonly Invoice[] = [
  {
    id: 'inv_001',
    number: 'INV-2026-0142',
    vendor: 'Northwind Traders',
    issuedOn: '2026-10-02',
    amount: 12480.5,
    currency: 'USD',
    status: 'pending',
  },
  {
    id: 'inv_002',
    number: 'INV-2026-0139',
    vendor: 'Contoso Supplies',
    issuedOn: '2026-09-28',
    amount: 3200,
    currency: 'USD',
    status: 'approved',
  },
  {
    id: 'inv_003',
    number: 'INV-2026-0137',
    vendor: 'Fabrikam Logistics',
    issuedOn: '2026-09-21',
    amount: 879.99,
    currency: 'USD',
    status: 'rejected',
  },
  {
    id: 'inv_004',
    number: 'INV-2026-0131',
    vendor: 'Adventure Works',
    issuedOn: '2026-09-15',
    amount: 45210,
    currency: 'USD',
    status: 'pending',
  },
];
