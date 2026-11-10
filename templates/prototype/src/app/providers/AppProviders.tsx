import { NeofloThemeProvider, SnackbarProvider } from '@neofloai/atoms';
import type { ReactNode } from 'react';

import { InvoicesProvider } from '@/features/invoices';

/**
 * Every app-wide provider, in one place and in this order: the theme
 * outermost so everything inside it is styled, then toasts, then each
 * feature's state.
 *
 * Feature providers sit here, above the router, so what one screen
 * changes is still changed on the next. Add a feature's provider here
 * when you add the feature. A reload starts every one of them again from
 * its mocks.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <NeofloThemeProvider defaultMode="light">
      <SnackbarProvider>
        <InvoicesProvider>{children}</InvoicesProvider>
      </SnackbarProvider>
    </NeofloThemeProvider>
  );
}
