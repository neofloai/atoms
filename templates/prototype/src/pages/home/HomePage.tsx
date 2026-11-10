import { Button, Card, CardContent, Stack, Typography } from '@neofloai/atoms';
import { useNavigate } from 'react-router';

import { totalOutstanding, useInvoices } from '@/features/invoices';
import { paths } from '@/shared/config/paths';
import { formatCurrency } from '@/shared/lib/format';
import { PageHeader } from '@/shared/ui/PageHeader';

export function HomePage() {
  const navigate = useNavigate();
  const { invoices } = useInvoices();

  return (
    <Stack sx={{ flex: 1, minHeight: 0 }}>
      <PageHeader title="Home" />
      <Stack sx={{ p: 3, gap: 3, maxWidth: 480 }}>
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Outstanding
            </Typography>
            <Typography variant="h2" component="p">
              {formatCurrency(totalOutstanding(invoices))}
            </Typography>
          </CardContent>
        </Card>
        <Button
          variant="primary"
          sx={{ alignSelf: 'flex-start' }}
          onClick={() => void navigate(paths.invoices)}
        >
          View invoices
        </Button>
      </Stack>
    </Stack>
  );
}
