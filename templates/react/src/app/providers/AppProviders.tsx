import { NeofloThemeProvider, SnackbarProvider } from '@neofloai/atoms';
import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import type { ReactNode } from 'react';

import { createQueryClient } from './queryClient';

/**
 * Every app-wide provider, in one place and in this order: the theme
 * outermost so everything inside it is styled, then server state, then
 * toasts. Tests mount the same stack in src/test/renderWithProviders.tsx,
 * with a memory router and a fresh query client; keep the two in step.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <NeofloThemeProvider defaultMode="light">
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider>{children}</SnackbarProvider>
      </QueryClientProvider>
    </NeofloThemeProvider>
  );
}
