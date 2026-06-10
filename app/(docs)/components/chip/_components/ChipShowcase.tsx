'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Chip } from '@/src/components/Chip';

import type { ChipAppearance, ChipVariant } from '@/src/components/Chip';

const variants: readonly ChipVariant[] = [
  'primary',
  'secondary',
  'success',
  'error',
  'warning',
];

const appearances: readonly ChipAppearance[] = ['contained', 'outline'];

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

function handleNoop(): void {
  // Demo-only handler so clickable / deletable affordances render.
}

/**
 * Live rendering of every Chip variant from the Figma component set:
 * the variant x appearance matrix, the two sizes, slot usage (avatar,
 * delete), and the disabled state.
 */
export function ChipShowcase() {
  return (
    <Stack spacing={4}>
      <PreviewCard title="Variants and emphasis">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, max-content)',
            gap: 2,
            alignItems: 'center',
          }}
        >
          {variants.map((variant) =>
            appearances.map((appearance) => (
              <Chip
                key={`${variant}-${appearance}`}
                size="sm"
                variant={variant}
                appearance={appearance}
                label={`${variant} ${appearance}`}
              />
            ))
          )}
        </Box>
      </PreviewCard>

      <PreviewCard title="Sizes">
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Chip size="sm" label="Small" />
          <Chip size="md" label="Medium" />
        </Stack>
      </PreviewCard>

      <PreviewCard title="Slots">
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Chip
            variant="secondary"
            avatar={<Avatar>OP</Avatar>}
            label="Olivia Park"
          />
          <Chip
            appearance="outline"
            label="Removable"
            onDelete={handleNoop}
          />
          <Chip label="Clickable" onClick={handleNoop} />
        </Stack>
      </PreviewCard>

      <PreviewCard title="States">
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Chip disabled label="Disabled" />
          <Chip appearance="outline" disabled label="Disabled outline" />
        </Stack>
      </PreviewCard>
    </Stack>
  );
}

ChipShowcase.displayName = 'ChipShowcase';
