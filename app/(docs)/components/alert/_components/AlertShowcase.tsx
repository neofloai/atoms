'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Alert } from '@/src/components/Alert';
import { Button } from '@/src/components/Button';

import type {
  AlertSeverity,
  AlertVariant,
} from '@/src/components/Alert';

const severities: readonly AlertSeverity[] = [
  'error',
  'warning',
  'success',
  'info',
];

const variants: readonly AlertVariant[] = ['filled', 'subtle', 'outline'];

const messageFor: Record<AlertSeverity, string> = {
  error: 'Something went wrong while saving.',
  warning: 'Your trial ends in 3 days.',
  success: 'Your changes are now live.',
  info: 'A new version is available.',
};

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
  // Demo-only handler so the close affordance renders.
}

/**
 * Live rendering of the Alert from the Figma component set: the
 * severity x variant matrix, the title and dismissible patterns, and a
 * trailing action.
 */
export function AlertShowcase() {
  return (
    <Stack spacing={4}>
      <PreviewCard title="Severity and emphasis">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {severities.map((severity) =>
            variants.map((variant) => (
              <Alert
                key={`${severity}-${variant}`}
                severity={severity}
                variant={variant}
              >
                {messageFor[severity]}
              </Alert>
            ))
          )}
        </Box>
      </PreviewCard>

      <PreviewCard title="With a title">
        <Stack spacing={2}>
          <Alert severity="error" title="Payment failed">
            We could not charge your card. Update your billing details to keep
            your subscription active.
          </Alert>
          <Alert severity="success" variant="filled" title="Deployed">
            Your project is live at the production URL.
          </Alert>
        </Stack>
      </PreviewCard>

      <PreviewCard title="Dismissible and actions">
        <Stack spacing={2}>
          <Alert severity="info" onClose={handleNoop}>
            Heads up — maintenance is scheduled for tonight.
          </Alert>
          <Alert
            severity="warning"
            action={
              <Button variant="secondary" size="sm">
                Undo
              </Button>
            }
          >
            Item moved to trash.
          </Alert>
        </Stack>
      </PreviewCard>
    </Stack>
  );
}

AlertShowcase.displayName = 'AlertShowcase';
