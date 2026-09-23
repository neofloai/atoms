'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { UploadSimpleIcon } from '@phosphor-icons/react';

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
 * the variant x appearance matrix, `prominent` in the context it is
 * drawn for, the three sizes, and the disabled / loading states.
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

      <PreviewCard title="Prominent — the page's one call to action">
        <Stack spacing={2.5}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Invoice Dashboard
            </Typography>
            <Button
              appearance="prominent"
              startIcon={<UploadSimpleIcon />}
            >
              Add Invoice
            </Button>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            A gradient fill running from the role&apos;s hover colour down
            to its resting one, at heading size and 48px tall. It sits
            beside a page title rather than in a row of controls, and{' '}
            <code>size</code> does not apply to it. One per screen — a page
            with two of these has neither.
          </Typography>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
            {variants.map((variant) => (
              <Button
                key={variant}
                variant={variant}
                appearance="prominent"
              >
                {variant}
              </Button>
            ))}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Every role has both rungs the ramp is built from, so the
            treatment carries across all five rather than being pinned to
            primary.
          </Typography>
        </Stack>
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
          <Button appearance="prominent" disabled>
            Disabled
          </Button>
          <Button loading>Processing</Button>
        </Stack>
      </PreviewCard>
    </Stack>
  );
}

ButtonShowcase.displayName = 'ButtonShowcase';
