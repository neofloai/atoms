import { Button, Stack, Typography } from '@neofloai/atoms';
import { useNavigate } from 'react-router';

import { paths } from '@/shared/config/paths';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Stack sx={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, p: 3 }}>
      <Typography variant="h3" component="h1">
        Page not found
      </Typography>
      <Typography variant="body2" color="text.secondary">
        The address may be mistyped, or the page has moved.
      </Typography>
      <Button variant="secondary" onClick={() => void navigate(paths.home)}>
        Go home
      </Button>
    </Stack>
  );
}
