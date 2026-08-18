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

interface Copy {
  title: string;
  message: string;
}

const copyFor: Record<AlertSeverity, Copy> = {
  error: {
    title: 'Payment failed',
    message: 'We could not charge the card on file.',
  },
  warning: {
    title: 'Trial ending',
    message: 'Three days left, then the workspace goes read-only.',
  },
  success: {
    title: 'Changes saved',
    message: 'Your edits are live for everyone on the team.',
  },
  info: {
    title: 'New version available',
    message: 'Reload to pick up the latest release.',
  },
};

function PreviewCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
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

/**
 * The flat style has to be previewed against an edge, not inside padding
 * — square corners and a full-bleed fill say nothing in the middle of a
 * padded box. So this draws the container the alert belongs to instead:
 * the alert flush at the top, the region under it.
 *
 * The unpadded Paper is the point. Cancelling a padded one with negative
 * margins instead leaves the alert's square corners hanging outside the
 * card's rounded, unclipped ones, and strands the bottom inset below it as
 * an empty strip. `overflow: hidden` is what clips the corners, and it is
 * also what a real panel does to an alert sitting at the top of it.
 */
function RegionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {children}
        <Box sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary">
            The region the alert is reporting on.
          </Typography>
        </Box>
      </Paper>
    </Stack>
  );
}

RegionCard.displayName = 'RegionCard';

function handleNoop(): void {
  // Demo-only handler so the close affordance renders.
}

/**
 * Live rendering of the Alert from the resynced Figma component set: the
 * four severities in both styles, the flat one full-bleed as it is drawn,
 * plus the action, dismissible and message-only compositions.
 */
export function AlertShowcase() {
  return (
    <Stack spacing={4}>
      <PreviewCard
        title="Severities"
        description="Icon, title, message. The two lines differ by size and colour, not weight."
      >
        <PreviewGrid>
          {severities.map((severity) => (
            <Alert
              key={severity}
              severity={severity}
              title={copyFor[severity].title}
            >
              {copyFor[severity].message}
            </Alert>
          ))}
        </PreviewGrid>
      </PreviewCard>

      <RegionCard
        title="Flat, full-bleed"
        description="The default style is square and borderless, drawn edge to edge so it belongs to the region below it rather than to itself."
      >
        <Alert severity="warning" title="Import finished with skips">
          Two rows were skipped because their dates would not parse.
        </Alert>
      </RegionCard>

      <PreviewCard
        title="Floating"
        description="A card instead: tinted surface, a border in the severity colour, and a corner. For anything sitting on top of the page."
      >
        <PreviewGrid>
          {severities.map((severity) => (
            <Alert
              key={severity}
              severity={severity}
              floating
              title={copyFor[severity].title}
            >
              {copyFor[severity].message}
            </Alert>
          ))}
        </PreviewGrid>
      </PreviewCard>

      <PreviewCard
        title="Actions, dismissal, and message only"
        description="An action is justified to the end of the row and takes the close button's place. Without a title, the message moves up into the title's type slot."
      >
        <PreviewGrid>
          <Alert
            severity="error"
            floating
            title="Payment failed"
            action={
              <Button variant="secondary" size="sm">
                Update card
              </Button>
            }
          >
            We could not charge the card on file.
          </Alert>
          <Alert
            severity="info"
            floating
            title="Maintenance tonight"
            onClose={handleNoop}
          >
            Expect a short interruption around 02:00 UTC.
          </Alert>
          <Alert severity="success" floating>
            Copied to your clipboard.
          </Alert>
          <Alert severity="warning" floating onClose={handleNoop}>
            Two rows were skipped during the import.
          </Alert>
        </PreviewGrid>
      </PreviewCard>
    </Stack>
  );
}

AlertShowcase.displayName = 'AlertShowcase';
