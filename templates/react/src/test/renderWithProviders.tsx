import { NeofloThemeProvider } from '@neofloai/atoms';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router';

interface Options extends Omit<RenderOptions, 'wrapper'> {
  /** Where the router starts. */
  route?: string;
}

/**
 * Render inside the providers the app has, minus the real router: a
 * memory router at `route`, and a fresh query client per test so cached
 * data never leaks between tests.
 */
export function renderWithProviders(ui: ReactElement, { route = '/', ...options }: Options = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });

  return render(ui, {
    wrapper: ({ children }) => (
      <NeofloThemeProvider defaultMode="light">
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </QueryClientProvider>
      </NeofloThemeProvider>
    ),
    ...options,
  });
}
