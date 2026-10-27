import { Box, Divider, Stack, Typography } from '@neofloai/atoms';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Page-level actions, right-aligned. */
  actions?: ReactNode;
}

/**
 * The title band every page starts with.
 *
 * shared/ui holds compositions of Atoms components that more than one
 * page uses. It never restyles a component; if one needs a variant Atoms
 * does not have, that is an issue on the Atoms repo.
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <>
      <Stack direction="row" sx={{ px: 3, py: 3, alignItems: 'center', gap: 2 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h3" component="h1">
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {description}
            </Typography>
          )}
        </Box>
        {actions}
      </Stack>
      <Divider />
    </>
  );
}
