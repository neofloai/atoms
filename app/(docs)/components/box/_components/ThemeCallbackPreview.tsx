'use client';

import { Box } from '@/src/components/Box';

/**
 * The one demo on this page that needs a client boundary.
 *
 * Every other preview passes `sx` an object, which React can serialize
 * across the server→client boundary into Box (MUI marks Box
 * `'use client'`). An `sx` *callback* is a function, so it cannot be
 * serialized — rendering it from a Server Component fails with
 * "Functions cannot be passed directly to Client Components".
 *
 * That is a property of React Server Components, not of Box, and it
 * applies to any MUI `sx` callback. The fix is the one applied here:
 * put the callback inside a component that is itself `'use client'`.
 */
export function ThemeCallbackPreview() {
  return (
    <Box
      sx={(theme) => ({
        pb: 1,
        borderBottom: `1px solid ${theme.palette.divider}`,
        fontFamily: theme.typography.fontFamily,
      })}
    >
      Divider drawn from theme.palette.divider
    </Box>
  );
}

ThemeCallbackPreview.displayName = 'ThemeCallbackPreview';
