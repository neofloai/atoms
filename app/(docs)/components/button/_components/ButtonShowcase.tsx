'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Button } from '@/src/components/Button';

import type {
  ButtonAppearance,
  ButtonVariant,
} from '@/src/components/Button';

const variants: readonly ButtonVariant[] = [
  'primary',
  'secondary',
  'success',
  'error',
  'warning',
];

const appearances: readonly ButtonAppearance[] = [
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
 * Live rendering of every Button variant from the Figma component set:
 * the variant x appearance matrix, the three sizes, and the disabled /
 * loading states.
 */
export function ButtonShowcase() {
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
              <Button
                key={`${variant}-${appearance}`}
                variant={variant}
                appearance={appearance}
              >
                Button
              </Button>
            ))
          )}
        </Box>
      </PreviewCard>

      <PreviewCard title="Sizes">
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </Stack>
      </PreviewCard>

      <PreviewCard title="States">
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Button disabled>Disabled</Button>
          <Button appearance="outline" disabled>
            Disabled
          </Button>
          <Button loading>Processing</Button>
        </Stack>
      </PreviewCard>
    </Stack>
  );
}

ButtonShowcase.displayName = 'ButtonShowcase';
