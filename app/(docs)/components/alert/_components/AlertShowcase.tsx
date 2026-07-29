'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Alert } from '@/src/components/Alert';
import { Button } from '@/src/components/Button';

import type { AlertSeverity } from '@/src/components/Alert';

const severities: readonly AlertSeverity[] = [
  'error',
  'warning',
  'success',
  'info',
];

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

/**
 * Two-per-row layout for preview alerts. `alignItems: 'start'` is the
 * important part: CSS Grid otherwise stretches every item in a row to
 * match its tallest sibling, and MUI Alert doesn't re-centre its icon
 * or message within extra height it didn't ask for — the content then
 * sits high, with dead space below it, inside the taller cells.
 * `start` keeps every cell at its own natural content height instead.
 */
function PreviewGrid({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gap: 2,
        alignItems: 'start',
      }}
    >
      {children}
    </Box>
  );
}

PreviewGrid.displayName = 'PreviewGrid';

function handleNoop(): void {
  // Demo-only handler so the close affordance renders.
}

/**
 * Live rendering of the Alert from the Figma component set: the four
 * severities, the title and dismissible patterns, a trailing action,
 * and the `floating` (toast) treatment.
 */
export function AlertShowcase() {
  return (
    <Stack spacing={4}>
      <PreviewCard title="Severities">
        <PreviewGrid>
          {severities.map((severity) => (
            <Alert key={severity} severity={severity}>
              {messageFor[severity]}
            </Alert>
          ))}
        </PreviewGrid>
      </PreviewCard>

      <PreviewCard title="With a title">
        <PreviewGrid>
          <Alert severity="error" title="Payment failed">
            We could not charge your card. Update your billing details to keep
            your subscription active.
          </Alert>
          <Alert severity="success" title="Deployed">
            Your project is live at the production URL.
          </Alert>
        </PreviewGrid>
      </PreviewCard>

      <PreviewCard title="Dismissible and actions">
        <PreviewGrid>
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
        </PreviewGrid>
      </PreviewCard>

      <PreviewCard title="Floating (toast)">
        <PreviewGrid>
          {severities.map((severity) => (
            <Alert key={severity} severity={severity} floating onClose={handleNoop}>
              {messageFor[severity]}
            </Alert>
          ))}
        </PreviewGrid>
      </PreviewCard>
    </Stack>
  );
}

AlertShowcase.displayName = 'AlertShowcase';
