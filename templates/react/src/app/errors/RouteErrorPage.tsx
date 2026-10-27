import { Alert, Box, Button } from '@neofloai/atoms';
import { isRouteErrorResponse, useRouteError } from 'react-router';

/**
 * What a route shows when it throws — while rendering, or while its
 * lazy module loads. Keeps one broken page from blanking the whole app.
 */
export function RouteErrorPage() {
  const error = useRouteError();
  const detail = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Unknown error';

  if (import.meta.env.DEV) console.error(error);

  return (
    <Box sx={{ p: 3 }}>
      <Alert
        severity="error"
        title="Something went wrong"
        action={
          <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
            Reload
          </Button>
        }
      >
        {detail}
      </Alert>
    </Box>
  );
}
