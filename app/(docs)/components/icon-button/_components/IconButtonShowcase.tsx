'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { IconButton } from '@/src/components/IconButton';
import { HeartIcon } from '@/src/icons';

import type {
  IconButtonAppearance,
  IconButtonVariant,
} from '@/src/components/IconButton';

const variants: readonly IconButtonVariant[] = [
  'primary',
  'secondary',
  'success',
  'error',
  'warning',
];

const appearances: readonly IconButtonAppearance[] = [
  'contained',
  'outline',
  'text',
];

function PreviewCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        {children}
      </Paper>
    </Stack>
  );
}

PreviewCard.displayName = 'PreviewCard';

/**
 * Live rendering of every IconButton variant from the Figma component
 * set: the variant x appearance matrix, the three sizes, and the
 * disabled state.
 */
export function IconButtonShowcase() {
  return (
    <Stack spacing={4}>
      <PreviewCard title="Variants and emphasis">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, max-content)',
            gap: 2,
            alignItems: 'center',
          }}
        >
          {variants.map((variant) =>
            appearances.map((appearance) => (
              <IconButton
                key={`${variant}-${appearance}`}
                variant={variant}
                appearance={appearance}
                aria-label={`${variant} ${appearance} example`}
              >
                <HeartIcon />
              </IconButton>
            ))
          )}
        </Box>
      </PreviewCard>

      <PreviewCard title="Sizes">
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <IconButton size="sm" aria-label="Small example">
            <HeartIcon />
          </IconButton>
          <IconButton size="md" aria-label="Medium example">
            <HeartIcon />
          </IconButton>
          <IconButton size="lg" aria-label="Large example">
            <HeartIcon />
          </IconButton>
        </Stack>
      </PreviewCard>

      <PreviewCard title="States">
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <IconButton disabled aria-label="Disabled example">
            <HeartIcon />
          </IconButton>
          <IconButton
            appearance="outline"
            disabled
            aria-label="Disabled outline example"
          >
            <HeartIcon />
          </IconButton>
          <IconButton loading aria-label="Loading example">
            <HeartIcon />
          </IconButton>
        </Stack>
      </PreviewCard>
    </Stack>
  );
}

IconButtonShowcase.displayName = 'IconButtonShowcase';
