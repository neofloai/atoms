import { Box, Stack } from '@neofloai/atoms';

import { InvoicesTable, useInvoices } from '@/features/invoices';
import { PageHeader } from '@/shared/ui/PageHeader';

/**
 * A page composes features and owns the route's layout. It holds no
 * business logic: it reads the feature's state through its hook and hands
 * the data and the actions to the feature's components.
 */
export function InvoicesPage() {
  const { invoices, approve, reject } = useInvoices();

  return (
    <Stack sx={{ flex: 1, minHeight: 0 }}>
      <PageHeader
        title="Invoices"
        description="Every invoice received, newest first. Approve or reject the pending ones."
      />
      {/* A definite height for the grid to scroll inside, rather than
          pushing the page taller than the screen. */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <InvoicesTable invoices={invoices} onApprove={approve} onReject={reject} />
      </Box>
    </Stack>
  );
}
