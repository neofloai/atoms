import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/renderWithProviders';

import { InvoicesPage } from './InvoicesPage';

describe('InvoicesPage', () => {
  it('lists the invoices once they load', async () => {
    renderWithProviders(<InvoicesPage />, { route: '/invoices' });

    expect(screen.getByRole('heading', { name: 'Invoices' })).toBeInTheDocument();
    expect(await screen.findByText('Northwind Traders')).toBeInTheDocument();
  });
});
