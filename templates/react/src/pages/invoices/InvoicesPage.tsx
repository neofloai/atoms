import { Alert, Box, Button, Stack } from '@neofloai/atoms';

import { InvoicesTable, useInvoices } from '@/features/invoices';
import { PageHeader } from '@/shared/ui/PageHeader';

/**
 * A page composes features and owns the route's layout. It holds no
 * business logic and fetches nothing itself — it calls the features'
 * hooks and hands their data to their components.
 */
export function InvoicesPage() {
  const { data = [], isPending, isError, refetch } = useInvoices();

  return (
    <Stack sx={{ flex: 1, minHeight: 0 }}>
      <PageHeader title="Invoices" description="Every invoice received, newest first." />
      {isError ? (
        <Box sx={{ p: 3 }}>
          <Alert
            severity="error"
            title="Invoices did not load"
            action={
              <Button variant="secondary" size="sm" onClick={() => void refetch()}>
                Retry
              </Button>
            }
          >
            Check your connection and try again.
          </Alert>
        </Box>
      ) : (
        // A definite height for the grid to scroll inside, rather than
        // pushing the page taller than the screen.
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <InvoicesTable invoices={data} loading={isPending} />
        </Box>
      )}
    </Stack>
  );
}
