import { createBrowserRouter } from 'react-router';

import { paths } from '@/shared/config/paths';

import { RouteErrorPage } from '../errors/RouteErrorPage';
import { AppLayout } from '../layout/AppLayout';

/**
 * Every route, each page loaded on demand so the first paint only pays
 * for the page it shows. Add a page: a path in shared/config/paths.ts,
 * a route here, a row in layout/navigation.ts.
 */
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: paths.home,
        lazy: async () => ({ Component: (await import('@/pages/home/HomePage')).HomePage }),
      },
      {
        path: paths.invoices,
        lazy: async () => ({
          Component: (await import('@/pages/invoices/InvoicesPage')).InvoicesPage,
        }),
      },
      {
        path: '*',
        lazy: async () => ({
          Component: (await import('@/pages/not-found/NotFoundPage')).NotFoundPage,
        }),
      },
    ],
  },
]);
